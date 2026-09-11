//! Camada de persistência: SQLite (arquivo único, WAL) com o MESMO esquema do
//! servidor Node anterior, então o `data/app-dnd.sqlite` existente continua valendo.
//!
//! A ficha inteira é guardada como JSON em `characters.data`; aqui ela é tratada
//! como `serde_json::Map` opaco — o formato é definido pelos tipos TypeScript do
//! frontend e o servidor só toca nos campos que precisa (id, pin, nomes, sheet).

use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_json::{json, Map, Value};

use crate::util::{normalize_name, now_iso, parse_image_data_url, short};

pub type CharMap = Map<String, Value>;

pub struct Db {
    conn: Connection,
}

/// Foto de perfil: bytes crus (não base64) fora do JSON da ficha, para que PATCH
/// de PV/ficha não carregue a imagem junto. `version` vai na URL como cache-buster.
pub struct Avatar {
    pub mime: String,
    pub data: Vec<u8>,
    pub version: String,
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

CREATE TABLE IF NOT EXISTS avatars (
  character_id TEXT PRIMARY KEY,
  mime TEXT NOT NULL,
  data BLOB NOT NULL,
  version TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS homebrew (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS homebrew_kind_idx ON homebrew (kind, created_at);
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
        migrate_appearance_images(&conn)?;
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

    /// Existe alguma ficha cujo PIN seja exatamente este? Autoriza as ações que
    /// afetam a mesa inteira (limpar todo o histórico) sem exigir a chave mestra.
    /// A mesa tem meia dúzia de linhas: varrer e comparar em Rust sai mais barato
    /// que depender do JSON1 do SQLite.
    pub fn pin_matches_any(&self, pin: &str) -> rusqlite::Result<bool> {
        let mut st = self.conn.prepare_cached("SELECT data FROM characters")?;
        let rows = st.query_map([], |r| r.get::<_, String>(0))?;
        for data in rows {
            let Ok(stored) = serde_json::from_str::<CharMap>(&data?) else { continue };
            if stored.get("pin").and_then(Value::as_str) == Some(pin) {
                return Ok(true);
            }
        }
        Ok(false)
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
        tx.execute("DELETE FROM avatars WHERE character_id = ?", [id])?;
        tx.commit()
    }

    // === Fotos de perfil ===

    pub fn get_avatar(&self, id: &str) -> rusqlite::Result<Option<Avatar>> {
        let mut st = self
            .conn
            .prepare_cached("SELECT mime, data, version FROM avatars WHERE character_id = ?")?;
        st.query_row([id], |r| {
            Ok(Avatar { mime: r.get(0)?, data: r.get(1)?, version: r.get(2)? })
        })
        .optional()
    }

    /// Grava (ou troca) a foto e marca a ficha com a versão nova. Devolve a ficha
    /// atualizada (ainda com `pin`), ou `None` se a ficha não existe.
    pub fn set_avatar(
        &mut self,
        id: &str,
        mime: &str,
        data: &[u8],
        by: &str,
    ) -> rusqlite::Result<Option<CharMap>> {
        let tx = self.conn.transaction()?;
        let Some(mut next) = read_character(&tx, id)? else { return Ok(None) };
        let version = new_version();
        let now = now_iso();
        tx.prepare_cached(
            "INSERT INTO avatars (character_id, mime, data, version, updated_at) VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(character_id) DO UPDATE SET mime = excluded.mime, data = excluded.data,
               version = excluded.version, updated_at = excluded.updated_at",
        )?
        .execute(params![id, mime, data, version, now])?;
        next.insert("avatarVersion".into(), Value::String(version));
        next.insert("updatedAt".into(), Value::String(now.clone()));
        write_character(&tx, id, &next, &now)?;
        record_log(&tx, id, by, &[note_change("Foto de perfil", "atualizada")])?;
        tx.commit()?;
        Ok(Some(next))
    }

    /// Remove a foto (idempotente). Devolve a ficha e se algo mudou de fato.
    pub fn remove_avatar(&mut self, id: &str, by: &str) -> rusqlite::Result<Option<(CharMap, bool)>> {
        let tx = self.conn.transaction()?;
        let Some(mut next) = read_character(&tx, id)? else { return Ok(None) };
        let removed_row = tx.execute("DELETE FROM avatars WHERE character_id = ?", [id])? > 0;
        let had_field = next.remove("avatarVersion").is_some();
        let changed = removed_row || had_field;
        if changed {
            let now = now_iso();
            next.insert("updatedAt".into(), Value::String(now.clone()));
            write_character(&tx, id, &next, &now)?;
            record_log(&tx, id, by, &[note_change("Foto de perfil", "removida")])?;
        }
        tx.commit()?;
        Ok(Some((next, changed)))
    }

    // === Homebrew do Mestre (raças, talentos, traços) ===

    pub fn list_homebrew(&self) -> rusqlite::Result<Vec<Value>> {
        let mut st = self.conn.prepare_cached(
            "SELECT id, kind, data, updated_at FROM homebrew ORDER BY kind, created_at, id",
        )?;
        let rows = st.query_map([], |r| {
            let data: String = r.get(2)?;
            Ok(homebrew_item(r.get(0)?, r.get(1)?, &data, r.get(3)?))
        })?;
        rows.collect()
    }

    /// Já existe um item deste tipo com o mesmo nome (sem acento/caixa/espaços extras)?
    pub fn homebrew_name_taken(
        &self,
        kind: &str,
        name: &str,
        exclude_id: Option<&str>,
    ) -> rusqlite::Result<bool> {
        let wanted = normalize_name(name);
        let mut st = self.conn.prepare_cached("SELECT id, data FROM homebrew WHERE kind = ?")?;
        let rows = st.query_map([kind], |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)))?;
        for row in rows {
            let (id, data) = row?;
            if exclude_id == Some(id.as_str()) {
                continue;
            }
            let Ok(v) = serde_json::from_str::<Value>(&data) else { continue };
            if v.get("name").and_then(Value::as_str).map(normalize_name).as_deref() == Some(wanted.as_str()) {
                return Ok(true);
            }
        }
        Ok(false)
    }

    pub fn insert_homebrew(&self, kind: &str, data: &Value) -> rusqlite::Result<Value> {
        let id = format!("hb-{}", &uuid::Uuid::new_v4().simple().to_string()[..10]);
        let now = now_iso();
        let text = serde_json::to_string(data).unwrap();
        self.conn
            .prepare_cached(
                "INSERT INTO homebrew (id, kind, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            )?
            .execute(params![id, kind, text, now, now])?;
        Ok(homebrew_item(id, kind.to_string(), &text, now))
    }

    pub fn homebrew_kind(&self, id: &str) -> rusqlite::Result<Option<String>> {
        self.conn
            .prepare_cached("SELECT kind FROM homebrew WHERE id = ?")?
            .query_row([id], |r| r.get(0))
            .optional()
    }

    /// Troca o `data` de um item (o tipo é imutável). `None` se não existe.
    pub fn update_homebrew(&self, id: &str, data: &Value) -> rusqlite::Result<Option<Value>> {
        let Some(kind) = self.homebrew_kind(id)? else { return Ok(None) };
        let now = now_iso();
        let text = serde_json::to_string(data).unwrap();
        self.conn
            .prepare_cached("UPDATE homebrew SET data = ?, updated_at = ? WHERE id = ?")?
            .execute(params![text, now, id])?;
        Ok(Some(homebrew_item(id.to_string(), kind, &text, now)))
    }

    pub fn delete_homebrew(&self, id: &str) -> rusqlite::Result<bool> {
        Ok(self.conn.execute("DELETE FROM homebrew WHERE id = ?", [id])? > 0)
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

/// Versão curta e aleatória de uma foto (vai na URL e no ETag).
fn new_version() -> String {
    uuid::Uuid::new_v4().simple().to_string()[..12].to_string()
}

fn note_change(field: &str, note: &str) -> Change {
    Change { field: field.into(), from: None, to: None, note: Some(note.into()) }
}

fn read_character(conn: &Connection, id: &str) -> rusqlite::Result<Option<CharMap>> {
    let mut st = conn.prepare_cached("SELECT data FROM characters WHERE id = ?")?;
    let data: Option<String> = st.query_row([id], |r| r.get(0)).optional()?;
    Ok(data.and_then(|d| serde_json::from_str(&d).ok()))
}

fn write_character(conn: &Connection, id: &str, c: &CharMap, now: &str) -> rusqlite::Result<()> {
    conn.prepare_cached("UPDATE characters SET data = ?, updated_at = ? WHERE id = ?")?
        .execute(params![serde_json::to_string(c).unwrap(), now, id])?;
    Ok(())
}

fn homebrew_item(id: String, kind: String, data: &str, updated_at: String) -> Value {
    json!({
        "id": id,
        "kind": kind,
        "data": serde_json::from_str::<Value>(data).unwrap_or_else(|_| json!({})),
        "updatedAt": updated_at,
    })
}

/// Migração única: fichas antigas guardavam a imagem de aparência como data URL
/// dentro do JSON (`sheet.appearance.imageUrl`), reenviada inteira a cada PATCH da
/// ficha. Ela vira foto de perfil na tabela `avatars` e sai do JSON. Data URL
/// ilegível fica como está (a ficha não é tocada). Não mexe em `updatedAt`.
fn migrate_appearance_images(conn: &Connection) -> rusqlite::Result<()> {
    let candidates: Vec<(String, String)> = {
        let mut st = conn.prepare("SELECT id, data FROM characters WHERE data LIKE '%data:image/%'")?;
        let rows = st.query_map([], |r| Ok((r.get(0)?, r.get(1)?)))?;
        rows.collect::<rusqlite::Result<_>>()?
    };
    if candidates.is_empty() {
        return Ok(());
    }
    let tx = conn.unchecked_transaction()?;
    for (id, data) in candidates {
        let Ok(mut c) = serde_json::from_str::<CharMap>(&data) else { continue };
        let parsed = c
            .get("sheet")
            .and_then(|s| s.get("appearance"))
            .and_then(|a| a.get("imageUrl"))
            .and_then(Value::as_str)
            .and_then(parse_image_data_url);
        let Some((mime, bytes)) = parsed else { continue };
        let exists = tx
            .prepare_cached("SELECT 1 FROM avatars WHERE character_id = ?")?
            .exists([&id])?;
        if exists {
            continue;
        }
        let version = new_version();
        tx.prepare_cached(
            "INSERT INTO avatars (character_id, mime, data, version, updated_at) VALUES (?, ?, ?, ?, ?)",
        )?
        .execute(params![id, mime, bytes, version, now_iso()])?;
        if let Some(appearance) = c
            .get_mut("sheet")
            .and_then(|s| s.get_mut("appearance"))
            .and_then(Value::as_object_mut)
        {
            appearance.remove("imageUrl");
        }
        c.insert("avatarVersion".into(), Value::String(version));
        tx.prepare_cached("UPDATE characters SET data = ? WHERE id = ?")?
            .execute(params![serde_json::to_string(&c).unwrap(), id])?;
    }
    tx.commit()
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
        "avatarVersion" => "Foto de perfil",
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
        "avatarVersion": pick("avatarVersion"),
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
        assert!(db.pin_matches_any("1").unwrap());
        assert!(!db.pin_matches_any("nope").unwrap());
        assert!(!db.pin_matches_any("").unwrap());

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

    const PNG_1X1_B64: &str =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

    fn png_1x1() -> Vec<u8> {
        crate::util::base64_decode(PNG_1X1_B64).unwrap()
    }

    #[test]
    fn avatar_roundtrip_and_cascade() {
        let mut db = Db::open(
            ":memory:",
            r#"[{"id":"a","playerName":"P","characterName":"C","pin":"1","sheet":{"species":"Elfo","classes":[]}}]"#,
        )
        .unwrap();
        let png = png_1x1();
        assert!(db.get_avatar("a").unwrap().is_none());
        assert!(db.set_avatar("nao-existe", "image/png", &png, "jogador").unwrap().is_none());

        let next = db.set_avatar("a", "image/png", &png, "jogador").unwrap().unwrap();
        let v1 = next["avatarVersion"].as_str().unwrap().to_string();
        assert_eq!(v1.len(), 12);
        assert_eq!(next["pin"], "1", "a ficha guardada continua com o PIN");
        let got = db.get_avatar("a").unwrap().unwrap();
        assert_eq!(got.mime, "image/png");
        assert_eq!(got.data, png);
        assert_eq!(got.version, v1);
        assert_eq!(to_public(&next)["avatarVersion"], v1.as_str());
        assert_eq!(db.get_stored("a").unwrap().unwrap()["avatarVersion"], v1.as_str());
        let log = db.list_log("a", 10).unwrap();
        assert_eq!(log[0]["changes"][0]["field"], "Foto de perfil");
        assert_eq!(log[0]["changes"][0]["note"], "atualizada");

        let again = db.set_avatar("a", "image/png", &png, "mestre").unwrap().unwrap();
        assert_ne!(again["avatarVersion"].as_str().unwrap(), v1, "cada upload gera versão nova");

        let (removed, changed) = db.remove_avatar("a", "jogador").unwrap().unwrap();
        assert!(changed);
        assert!(removed.get("avatarVersion").is_none());
        assert!(db.get_avatar("a").unwrap().is_none());
        assert_eq!(to_public(&removed)["avatarVersion"], Value::Null);
        let (_, changed) = db.remove_avatar("a", "jogador").unwrap().unwrap();
        assert!(!changed, "remover de novo não muda nada");
        assert!(db.remove_avatar("nao-existe", "jogador").unwrap().is_none());

        db.set_avatar("a", "image/png", &png, "jogador").unwrap().unwrap();
        db.delete("a").unwrap();
        assert!(db.get_avatar("a").unwrap().is_none(), "deletar a ficha apaga a foto");
    }

    #[test]
    fn migrates_appearance_data_url_into_avatars() {
        let seed = json!([
            {
                "id": "a", "playerName": "P", "characterName": "C", "updatedAt": "2020-01-01T00:00:00.000Z",
                "sheet": { "species": "Elfo", "classes": [],
                  "appearance": { "size": "Médio", "height": "1,70m", "imageUrl": format!("data:image/png;base64,{PNG_1X1_B64}") } }
            },
            {
                "id": "b", "playerName": "P", "characterName": "D",
                "sheet": { "species": "Anão", "classes": [],
                  "appearance": { "size": "Médio", "height": "", "imageUrl": "data:image/png;base64,@@@nao-e-base64" } }
            }
        ]);
        let db = Db::open(":memory:", &seed.to_string()).unwrap();

        let a = db.get_stored("a").unwrap().unwrap();
        let avatar = db.get_avatar("a").unwrap().expect("imagem antiga vira foto de perfil");
        assert_eq!(avatar.mime, "image/png");
        assert_eq!(avatar.data, png_1x1());
        assert_eq!(a["avatarVersion"], avatar.version.as_str());
        assert!(a["sheet"]["appearance"].get("imageUrl").is_none(), "data URL sai do JSON");
        assert_eq!(a["sheet"]["appearance"]["height"], "1,70m", "resto da aparência fica");
        assert_eq!(a["updatedAt"], "2020-01-01T00:00:00.000Z", "migração não mexe em updatedAt");

        let b = db.get_stored("b").unwrap().unwrap();
        assert!(db.get_avatar("b").unwrap().is_none());
        assert!(b.get("avatarVersion").is_none());
        assert!(b["sheet"]["appearance"]["imageUrl"].as_str().unwrap().starts_with("data:"), "ilegível fica intacta");
    }

    #[test]
    fn homebrew_crud_and_unique_names() {
        let db = Db::open(":memory:", "[]").unwrap();
        let item = db.insert_homebrew("race", &json!({ "name": "Shade", "traits": [] })).unwrap();
        let id = item["id"].as_str().unwrap().to_string();
        assert!(id.starts_with("hb-") && id.len() == 13, "id: {id}");
        assert_eq!(item["kind"], "race");
        assert_eq!(item["data"]["name"], "Shade");

        assert!(db.homebrew_name_taken("race", "  SHÁDE ", None).unwrap(), "compara sem acento/caixa/espaços");
        assert!(!db.homebrew_name_taken("feat", "Shade", None).unwrap(), "unicidade é por tipo");
        assert!(!db.homebrew_name_taken("race", "Shade", Some(&id)).unwrap(), "o próprio item não conta");

        let updated = db.update_homebrew(&id, &json!({ "name": "Shade Revisada" })).unwrap().unwrap();
        assert_eq!(updated["kind"], "race", "tipo é imutável");
        assert_eq!(updated["data"]["name"], "Shade Revisada");
        assert!(db.update_homebrew("hb-nao-existe", &json!({ "name": "x" })).unwrap().is_none());

        db.insert_homebrew("feat", &json!({ "name": "Talento Caseiro" })).unwrap();
        let list = db.list_homebrew().unwrap();
        assert_eq!(list.len(), 2);
        assert_eq!(list[0]["kind"], "feat", "ordenado por tipo");
        assert_eq!(list[1]["data"]["name"], "Shade Revisada");
        assert_eq!(db.homebrew_kind(&id).unwrap().as_deref(), Some("race"));

        assert!(db.delete_homebrew(&id).unwrap());
        assert!(!db.delete_homebrew(&id).unwrap());
        assert_eq!(db.list_homebrew().unwrap().len(), 1);
    }
}
