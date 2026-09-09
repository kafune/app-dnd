//! Camada de persistência: SQLite (arquivo único, WAL) com o MESMO esquema do
//! servidor Node anterior, então o `data/app-dnd.sqlite` existente continua valendo.
//!
//! A ficha inteira é guardada como JSON em `characters.data`; aqui ela é tratada
//! como `serde_json::Map` opaco — o formato é definido pelos tipos TypeScript do
//! frontend e o servidor só toca nos campos que precisa (id, pin, nomes, sheet).

use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_json::{json, Map, Value};

use crate::util::{now_iso, short};

pub type CharMap = Map<String, Value>;

pub struct Db {
    conn: Connection,
}

/// Uma alteração registrada no log de modificações (controle de versão leve).
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Change {
    pub field: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub from: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub to: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub note: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct DiceRoll {
    pub id: String,
    #[serde(default)]
    pub character_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub character_name: Option<String>,
    #[serde(default)]
    pub label: String,
    #[serde(default)]
    pub expression: String,
    #[serde(default)]
    pub result: i64,
    #[serde(default = "empty_detail")]
    pub detail: Value,
    #[serde(default = "now_iso")]
    pub created_at: String,
}

fn empty_detail() -> Value {
    json!({ "rolls": [], "modifier": 0 })
}

const SCHEMA: &str = r#"
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rolls (
  id TEXT PRIMARY KEY,
  character_id TEXT,
  character_name TEXT,
  label TEXT,
  expression TEXT,
  result INTEGER,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS rolls_created_idx ON rolls (created_at DESC);
CREATE INDEX IF NOT EXISTS rolls_character_idx ON rolls (character_id);

CREATE TABLE IF NOT EXISTS character_log (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  by TEXT NOT NULL,
  changes TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS character_log_idx ON character_log (character_id, created_at DESC);
"#;

impl Db {
    /// Abre (ou cria) o banco, aplica pragmas de performance e o esquema, e popula
    /// com as fichas do seed se estiver vazio.
    pub fn open(path: &str, seed_json: &str) -> rusqlite::Result<Db> {
        if path != ":memory:" {
            if let Some(dir) = std::path::Path::new(path).parent() {
                if !dir.as_os_str().is_empty() {
                    let _ = std::fs::create_dir_all(dir);
                }
            }
        }
        let conn = Connection::open(path)?;
        conn.pragma_update(None, "journal_mode", "WAL")?;
        conn.pragma_update(None, "synchronous", "NORMAL")?;
        conn.pragma_update(None, "foreign_keys", "ON")?;
        conn.pragma_update(None, "temp_store", "MEMORY")?;
        conn.pragma_update(None, "cache_size", -8000)?; // 8 MB
        conn.pragma_update(None, "mmap_size", 64 * 1024 * 1024)?;
        conn.busy_timeout(std::time::Duration::from_secs(5))?;
        conn.execute_batch(SCHEMA)?;

        let n: i64 = conn.query_row("SELECT COUNT(*) FROM characters", [], |r| r.get(0))?;
        if n == 0 {
            let seed: Vec<CharMap> = serde_json::from_str(seed_json)
                .expect("seed.json inválido (regenere com `bun run seed:export`)");
            let tx = conn.unchecked_transaction()?;
            {
                let mut ins = tx.prepare(
                    "INSERT INTO characters (id, data, updated_at) VALUES (?, ?, datetime('now'))",
                )?;
                for c in &seed {
                    let id = c.get("id").and_then(Value::as_str).unwrap_or_default();
                    ins.execute(params![id, serde_json::to_string(c).unwrap()])?;
                }
            }
            tx.commit()?;
        }
        Ok(Db { conn })
    }

    // === Fichas ===

    pub fn list_public(&self) -> rusqlite::Result<Vec<Value>> {
        let mut st = self.conn.prepare_cached("SELECT data FROM characters ORDER BY id")?;
        let rows = st.query_map([], |r| r.get::<_, String>(0))?;
        let mut out = Vec::new();
        for data in rows {
            if let Ok(c) = serde_json::from_str::<CharMap>(&data?) {
                out.push(to_public(&c));
            }
        }
        Ok(out)
    }

    pub fn get_stored(&self, id: &str) -> rusqlite::Result<Option<CharMap>> {
        let mut st = self.conn.prepare_cached("SELECT data FROM characters WHERE id = ?")?;
        let data: Option<String> = st.query_row([id], |r| r.get(0)).optional()?;
        Ok(data.and_then(|d| serde_json::from_str(&d).ok()))
    }

    pub fn exists(&self, id: &str) -> rusqlite::Result<bool> {
        let mut st = self.conn.prepare_cached("SELECT 1 FROM characters WHERE id = ?")?;
        st.exists([id])
    }

    /// Insere ou substitui a ficha inteira; devolve a ficha com `updatedAt` novo.
    pub fn upsert(&self, mut c: CharMap) -> rusqlite::Result<CharMap> {
        let now = now_iso();
        c.insert("updatedAt".into(), Value::String(now.clone()));
        let id = c.get("id").and_then(Value::as_str).unwrap_or_default().to_string();
        let mut st = self.conn.prepare_cached(
            "INSERT INTO characters (id, data, updated_at) VALUES (?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at",
        )?;
        st.execute(params![id, serde_json::to_string(&c).unwrap(), now])?;
        Ok(c)
    }

    /// Aplica um patch raso (chaves de topo) na ficha, dentro de uma transação, e
    /// registra o diff no log. Retorna a ficha resultante (ainda com `pin`).
    pub fn patch(
        &mut self,
        id: &str,
        patch: &CharMap,
        by: &str,
    ) -> rusqlite::Result<Option<CharMap>> {
        let tx = self.conn.transaction()?;
        let current: Option<CharMap> = {
            let mut st = tx.prepare_cached("SELECT data FROM characters WHERE id = ?")?;
            let data: Option<String> = st.query_row([id], |r| r.get(0)).optional()?;
            data.and_then(|d| serde_json::from_str(&d).ok())
        };
        let Some(current) = current else { return Ok(None) };

        let mut next = current.clone();
        for (k, v) in patch {
            next.insert(k.clone(), v.clone());
        }
        next.insert("id".into(), Value::String(id.to_string()));
        match current.get("pin") {
            Some(p) => {
                next.insert("pin".into(), p.clone());
            }
            None => {
                next.remove("pin");
            }
        }
        next.insert("protected".into(), Value::Bool(true));
        let now = now_iso();
        next.insert("updatedAt".into(), Value::String(now.clone()));

        tx.prepare_cached("UPDATE characters SET data = ?, updated_at = ? WHERE id = ?")?
            .execute(params![serde_json::to_string(&next).unwrap(), now, id])?;

        let changes = diff_changes(&current, patch);
        if !changes.is_empty() {
            record_log(&tx, id, by, &changes)?;
        }
        tx.commit()?;
        Ok(Some(next))
    }

    pub fn delete(&mut self, id: &str) -> rusqlite::Result<()> {
        let tx = self.conn.transaction()?;
        tx.execute("DELETE FROM characters WHERE id = ?", [id])?;
        tx.execute("DELETE FROM character_log WHERE character_id = ?", [id])?;
        tx.execute("DELETE FROM rolls WHERE character_id = ?", [id])?;
        tx.commit()
    }

    // === Log de modificações ===

    pub fn record_log(&self, id: &str, by: &str, changes: &[Change]) -> rusqlite::Result<()> {
        record_log(&self.conn, id, by, changes)
    }

    pub fn list_log(&self, id: &str, limit: i64) -> rusqlite::Result<Vec<Value>> {
        let mut st = self.conn.prepare_cached(
            "SELECT id, character_id, by, changes, created_at FROM character_log
             WHERE character_id = ? ORDER BY created_at DESC LIMIT ?",
        )?;
        let rows = st.query_map(params![id, limit], |r| {
            let by: String = r.get(2)?;
            let changes: String = r.get(3)?;
            Ok(json!({
                "id": r.get::<_, String>(0)?,
                "characterId": r.get::<_, String>(1)?,
                "by": if by == "mestre" { "mestre" } else { "jogador" },
                "changes": serde_json::from_str::<Value>(&changes).unwrap_or(Value::Array(vec![])),
                "createdAt": r.get::<_, String>(4)?,
            }))
        })?;
        rows.collect()
    }

    // === Rolagens ===

    pub fn list_rolls(&self, limit: i64) -> rusqlite::Result<Vec<DiceRoll>> {
        let mut st = self.conn.prepare_cached(
            "SELECT id, character_id, character_name, label, expression, result, detail, created_at
             FROM rolls ORDER BY created_at DESC LIMIT ?",
        )?;
        let rows = st.query_map([limit], |r| {
            let detail: String = r.get::<_, Option<String>>(6)?.unwrap_or_default();
            Ok(DiceRoll {
                id: r.get(0)?,
                character_id: r.get(1)?,
                character_name: r.get(2)?,
                label: r.get::<_, Option<String>>(3)?.unwrap_or_default(),
                expression: r.get::<_, Option<String>>(4)?.unwrap_or_default(),
                result: r.get::<_, Option<i64>>(5)?.unwrap_or(0),
                detail: serde_json::from_str(&detail).unwrap_or_else(|_| empty_detail()),
                created_at: r.get(7)?,
            })
        })?;
        rows.collect()
    }

    /// Insere a rolagem e mantém só as 200 mais recentes.
    pub fn insert_roll(&mut self, r: &DiceRoll) -> rusqlite::Result<()> {
        let tx = self.conn.transaction()?;
        tx.prepare_cached(
            "INSERT INTO rolls (id, character_id, character_name, label, expression, result, detail, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )?
        .execute(params![
            r.id,
            r.character_id,
            r.character_name,
            r.label,
            r.expression,
            r.result,
            serde_json::to_string(&r.detail).unwrap(),
            r.created_at
        ])?;
        tx.prepare_cached(
            "DELETE FROM rolls WHERE rowid IN (SELECT rowid FROM rolls ORDER BY created_at DESC LIMIT -1 OFFSET 200)",
        )?
        .execute([])?;
        tx.commit()
    }

    /// Limpa o histórico: só de um personagem, ou de toda a mesa. Devolve quantas apagou.
    pub fn clear_rolls(&self, character_id: Option<&str>) -> rusqlite::Result<usize> {
        match character_id {
            Some(id) => self.conn.execute("DELETE FROM rolls WHERE character_id = ?", [id]),
            None => self.conn.execute("DELETE FROM rolls", []),
        }
    }
}

fn record_log(conn: &Connection, id: &str, by: &str, changes: &[Change]) -> rusqlite::Result<()> {
    conn.prepare_cached(
        "INSERT INTO character_log (id, character_id, by, changes, created_at) VALUES (?, ?, ?, ?, ?)",
    )?
    .execute(params![
        uuid::Uuid::new_v4().to_string(),
        id,
        by,
        serde_json::to_string(changes).unwrap(),
        now_iso()
    ])?;
    // mantém só as 100 entradas mais recentes por ficha
    conn.prepare_cached(
        "DELETE FROM character_log WHERE character_id = ?1 AND rowid IN (
           SELECT rowid FROM character_log WHERE character_id = ?1 ORDER BY created_at DESC LIMIT -1 OFFSET 100
         )",
    )?
    .execute([id])?;
    Ok(())
}

fn field_label(key: &str) -> &str {
    match key {
        "hpCurrent" => "PV atual",
        "hpMax" => "PV máximo",
        "hpTemp" => "PV temporário",
        "notes" => "Anotações",
        "spellSlots" => "Espaços de magia",
        "resources" => "Recursos",
        "sheet" => "Ficha",
        "characterName" => "Nome",
        "playerName" => "Jogador",
        "color" => "Cor",
        other => other,
    }
}

/// Em JS, `typeof` de objeto, array e `null` é "object".
fn is_object_like(v: Option<&Value>) -> bool {
    matches!(v, Some(Value::Object(_)) | Some(Value::Array(_)) | Some(Value::Null))
}

/// `String(v ?? "")` do JS, para valores escalares.
fn scalar_text(v: Option<&Value>) -> String {
    match v {
        None | Some(Value::Null) => String::new(),
        Some(Value::String(s)) => s.clone(),
        Some(Value::Bool(b)) => b.to_string(),
        Some(Value::Number(n)) => n.to_string(),
        Some(other) => other.to_string(),
    }
}

/// Compara o estado atual com o patch e descreve o que mudou (mesma regra do Node).
pub fn diff_changes(current: &CharMap, patch: &CharMap) -> Vec<Change> {
    let mut out = Vec::new();
    for (key, after) in patch {
        if matches!(key.as_str(), "id" | "pin" | "protected" | "updatedAt") {
            continue;
        }
        let before = current.get(key);
        if before == Some(after) {
            continue;
        }
        let field = field_label(key).to_string();
        if !is_object_like(Some(after)) && !is_object_like(before) {
            out.push(Change {
                field,
                from: Some(short(&scalar_text(before))),
                to: Some(short(&scalar_text(Some(after)))),
                note: None,
            });
        } else {
            out.push(Change { field, from: None, to: None, note: Some("atualizado".into()) });
        }
    }
    out
}

/// Ficha completa para quem tem o PIN: tudo, menos o próprio `pin`.
pub fn to_authorized(mut c: CharMap) -> Value {
    c.remove("pin");
    c.insert("protected".into(), Value::Bool(true));
    Value::Object(c)
}

/// Resumo público (card da mesa): identidade + espécie/classes. Nunca vaza PIN,
/// PV, notas ou o resto da ficha.
pub fn to_public(c: &CharMap) -> Value {
    let sheet = c.get("sheet").and_then(Value::as_object);
    let pick = |k: &str| c.get(k).cloned().unwrap_or(Value::Null);
    json!({
        "id": pick("id"),
        "playerName": pick("playerName"),
        "characterName": pick("characterName"),
        "color": pick("color"),
        "protected": true,
        "updatedAt": pick("updatedAt"),
        "hpCurrent": 0,
        "hpMax": 0,
        "hpTemp": 0,
        "spellSlots": {},
        "resources": [],
        "sheet": {
            "species": sheet.and_then(|s| s.get("species")).cloned().unwrap_or(json!("")),
            "classes": sheet.and_then(|s| s.get("classes")).cloned().unwrap_or(json!([])),
            "background": "",
            "abilityScores": { "str": 10, "dex": 10, "con": 10, "int": 10, "wis": 10, "cha": 10 },
            "saves": [],
            "skills": [],
            "proficiencies": [],
            "languages": [],
            "ac": 0,
            "speed": 0,
            "initiativeBonus": 0,
            "proficiencyBonus": 0,
            "weapons": [],
            "features": [],
            "spells": { "saveDC": 0, "attackMod": 0, "castingAbility": "int", "cantrips": [], "known": [] },
            "inventory": { "coins": { "gp": 0, "sp": 0, "cp": 0 }, "items": [] },
            "appearance": { "size": "", "height": "" },
            "personality": { "trait": "", "ideal": "", "flaw": "", "why": "", "backstory": "" }
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn map(v: Value) -> CharMap {
        v.as_object().unwrap().clone()
    }

    #[test]
    fn diff_scalars_and_objects() {
        let cur = map(json!({ "hpCurrent": 18, "notes": "a", "sheet": { "ac": 1 }, "id": "x" }));
        let patch = map(json!({ "hpCurrent": 13, "notes": "a", "sheet": { "ac": 2 }, "id": "y", "color": "#fff" }));
        let ch = diff_changes(&cur, &patch);
        assert_eq!(ch.len(), 3);
        assert_eq!(ch[0].field, "PV atual");
        assert_eq!(ch[0].from.as_deref(), Some("18"));
        assert_eq!(ch[0].to.as_deref(), Some("13"));
        assert_eq!(ch[1].field, "Ficha");
        assert_eq!(ch[1].note.as_deref(), Some("atualizado"));
        assert_eq!(ch[2].field, "Cor");
        assert_eq!(ch[2].from.as_deref(), Some(""));
    }

    #[test]
    fn roundtrip_in_memory() {
        let mut db = Db::open(
            ":memory:",
            r#"[{"id":"a","playerName":"P","characterName":"C","pin":"1","sheet":{"species":"Elfo","classes":[]}}]"#,
        )
        .unwrap();
        let pub_list = db.list_public().unwrap();
        assert_eq!(pub_list.len(), 1);
        assert!(pub_list[0].get("pin").is_none());
        assert_eq!(pub_list[0]["sheet"]["species"], "Elfo");

        let next = db
            .patch("a", &map(json!({ "hpCurrent": 5, "pin": "hack" })), "jogador")
            .unwrap()
            .unwrap();
        assert_eq!(next["pin"], "1");
        assert_eq!(next["hpCurrent"], 5);
        assert_eq!(db.list_log("a", 50).unwrap().len(), 1);

        let roll = DiceRoll {
            id: "r1".into(),
            character_id: Some("a".into()),
            character_name: None,
            label: "x".into(),
            expression: "1d20".into(),
            result: 7,
            detail: json!({"rolls":[7],"modifier":0}),
            created_at: now_iso(),
        };
        db.insert_roll(&roll).unwrap();
        assert_eq!(db.list_rolls(10).unwrap().len(), 1);
        assert_eq!(db.clear_rolls(Some("a")).unwrap(), 1);

        db.delete("a").unwrap();
        assert!(!db.exists("a").unwrap());
    }
}
