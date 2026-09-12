//! Camada de persistência: SQLite (arquivo único, WAL) com o MESMO esquema do
//! servidor Node anterior, então o `data/app-dnd.sqlite` existente continua valendo.
//!
//! A ficha inteira é guardada como JSON em `characters.data`; aqui ela é tratada
//! como `serde_json::Map` opaco — o formato é definido pelos tipos TypeScript do
//! frontend e o servidor só toca nos campos que precisa (id, pin, nomes, sheet).

use std::collections::HashMap;

use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_json::{json, Map, Value};

use crate::util::{normalize_name, now_iso, parse_image_data_url, short, slugify};

pub type CharMap = Map<String, Value>;

/// Pasta que recebe as fichas criadas antes de existirem pastas (a mesa original).
/// Nasce sem senha; o Mestre define uma na edição da pasta.
pub const LEGACY_FOLDER_ID: &str = "mundo-pankleos";
const LEGACY_FOLDER_NAME: &str = "Mundo Pankleos";

pub struct Db {
    conn: Connection,
}

/// Dados da pasta usados na autorização (o resumo público sai de `folder_public`).
pub struct Folder {
    pub id: String,
    pub pin: String,
}

#[derive(Debug, PartialEq)]
pub enum FolderDelete {
    Deleted,
    NotFound,
    NotEmpty,
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
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  folder_id TEXT
);

CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pin TEXT NOT NULL DEFAULT '',
  avatar_mime TEXT,
  avatar_data BLOB,
  avatar_version TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
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

CREATE TABLE IF NOT EXISTS creatures (
  id TEXT PRIMARY KEY,
  folder_id TEXT NOT NULL,
  name TEXT NOT NULL,
  hp_current INTEGER NOT NULL,
  hp_max INTEGER NOT NULL,
  ac INTEGER NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS creatures_folder_idx ON creatures (folder_id, created_at);
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
        ensure_folder_column(&conn)?;

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
        migrate_legacy_folder(&conn)?;
        migrate_armor_slots(&conn)?;
        Ok(Db { conn })
    }

    // === Fichas ===

    /// Resumo de todas as fichas de todas as pastas (só o Mestre usa).
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
    /// A coluna `folder_id` espelha o `folderId` do JSON (é por ela que se filtra).
    pub fn upsert(&self, mut c: CharMap) -> rusqlite::Result<CharMap> {
        let now = now_iso();
        c.insert("updatedAt".into(), Value::String(now.clone()));
        let id = c.get("id").and_then(Value::as_str).unwrap_or_default().to_string();
        let folder = c.get("folderId").and_then(Value::as_str).map(str::to_string);
        let mut st = self.conn.prepare_cached(
            "INSERT INTO characters (id, data, updated_at, folder_id) VALUES (?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at,
               folder_id = excluded.folder_id",
        )?;
        st.execute(params![id, serde_json::to_string(&c).unwrap(), now, folder])?;
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
        // PIN e pasta não mudam por PATCH (a coluna folder_id nem é tocada abaixo).
        for key in ["pin", "folderId"] {
            match current.get(key) {
                Some(v) => {
                    next.insert(key.into(), v.clone());
                }
                None => {
                    next.remove(key);
                }
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

    // === Pastas (separam as fichas de cada mesa/campanha) ===

    pub fn list_folders(&self) -> rusqlite::Result<Vec<Value>> {
        let mut st = self
            .conn
            .prepare_cached(&format!("{FOLDER_SELECT} ORDER BY f.name COLLATE NOCASE, f.id"))?;
        let rows = st.query_map([], folder_row)?;
        rows.collect()
    }

    /// Resumo público da pasta (nunca inclui a senha).
    pub fn folder_public(&self, id: &str) -> rusqlite::Result<Option<Value>> {
        self.conn
            .prepare_cached(&format!("{FOLDER_SELECT} WHERE f.id = ?"))?
            .query_row([id], folder_row)
            .optional()
    }

    pub fn get_folder(&self, id: &str) -> rusqlite::Result<Option<Folder>> {
        self.conn
            .prepare_cached("SELECT id, pin FROM folders WHERE id = ?")?
            .query_row([id], |r| Ok(Folder { id: r.get(0)?, pin: r.get(1)? }))
            .optional()
    }

    fn folder_exists(&self, id: &str) -> rusqlite::Result<bool> {
        self.conn.prepare_cached("SELECT 1 FROM folders WHERE id = ?")?.exists([id])
    }

    /// Já existe pasta com esse nome (sem acento/caixa/espaços extras)?
    pub fn folder_name_taken(&self, name: &str, exclude_id: Option<&str>) -> rusqlite::Result<bool> {
        let wanted = normalize_name(name);
        let mut st = self.conn.prepare_cached("SELECT id, name FROM folders")?;
        let rows = st.query_map([], |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)))?;
        for row in rows {
            let (id, existing) = row?;
            if exclude_id != Some(id.as_str()) && normalize_name(&existing) == wanted {
                return Ok(true);
            }
        }
        Ok(false)
    }

    /// Cria a pasta com id = slug do nome (+ sufixo curto se colidir). Devolve o resumo.
    pub fn insert_folder(&self, name: &str, pin: &str) -> rusqlite::Result<Value> {
        let mut base = slugify(name);
        if base.is_empty() {
            base = "pasta".into();
        }
        let mut id = base.clone();
        while self.folder_exists(&id)? {
            id = format!("{base}-{}", &uuid::Uuid::new_v4().simple().to_string()[..4]);
        }
        let now = now_iso();
        self.conn
            .prepare_cached("INSERT INTO folders (id, name, pin, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")?
            .execute(params![id, name, pin, now, now])?;
        self.folder_public(&id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    /// Renomeia e, se `pin` vier, troca a senha. `None` se a pasta não existe.
    pub fn update_folder(&self, id: &str, name: &str, pin: Option<&str>) -> rusqlite::Result<Option<Value>> {
        let now = now_iso();
        let changed = match pin {
            Some(pin) => self
                .conn
                .prepare_cached("UPDATE folders SET name = ?, pin = ?, updated_at = ? WHERE id = ?")?
                .execute(params![name, pin, now, id])?,
            None => self
                .conn
                .prepare_cached("UPDATE folders SET name = ?, updated_at = ? WHERE id = ?")?
                .execute(params![name, now, id])?,
        };
        if changed == 0 {
            return Ok(None);
        }
        self.folder_public(id)
    }

    /// Só apaga pasta vazia: ficha nenhuma some junto com a pasta.
    pub fn delete_folder(&self, id: &str) -> rusqlite::Result<FolderDelete> {
        if !self.folder_exists(id)? {
            return Ok(FolderDelete::NotFound);
        }
        let used: i64 = self
            .conn
            .prepare_cached("SELECT COUNT(*) FROM characters WHERE folder_id = ?")?
            .query_row([id], |r| r.get(0))?;
        if used > 0 {
            return Ok(FolderDelete::NotEmpty);
        }
        self.conn.execute("DELETE FROM creatures WHERE folder_id = ?", [id])?;
        self.conn.execute("DELETE FROM folders WHERE id = ?", [id])?;
        Ok(FolderDelete::Deleted)
    }

    pub fn get_folder_avatar(&self, id: &str) -> rusqlite::Result<Option<Avatar>> {
        self.conn
            .prepare_cached(
                "SELECT avatar_mime, avatar_data, avatar_version FROM folders WHERE id = ? AND avatar_data IS NOT NULL",
            )?
            .query_row([id], |r| Ok(Avatar { mime: r.get(0)?, data: r.get(1)?, version: r.get(2)? }))
            .optional()
    }

    /// Grava (ou troca) a foto da pasta. Devolve o resumo novo, ou `None` se não existe.
    pub fn set_folder_avatar(&self, id: &str, mime: &str, data: &[u8]) -> rusqlite::Result<Option<Value>> {
        let changed = self
            .conn
            .prepare_cached(
                "UPDATE folders SET avatar_mime = ?, avatar_data = ?, avatar_version = ?, updated_at = ? WHERE id = ?",
            )?
            .execute(params![mime, data, new_version(), now_iso(), id])?;
        if changed == 0 {
            return Ok(None);
        }
        self.folder_public(id)
    }

    /// Remove a foto da pasta (idempotente). Devolve o resumo e se algo mudou.
    pub fn remove_folder_avatar(&self, id: &str) -> rusqlite::Result<Option<(Value, bool)>> {
        if !self.folder_exists(id)? {
            return Ok(None);
        }
        let changed = self
            .conn
            .prepare_cached(
                "UPDATE folders SET avatar_mime = NULL, avatar_data = NULL, avatar_version = NULL, updated_at = ?
                 WHERE id = ? AND avatar_data IS NOT NULL",
            )?
            .execute(params![now_iso(), id])?
            > 0;
        Ok(self.folder_public(id)?.map(|folder| (folder, changed)))
    }

    /// Resumos públicos das fichas de uma pasta.
    pub fn list_folder_characters(&self, folder_id: &str) -> rusqlite::Result<Vec<Value>> {
        let mut st = self.conn.prepare_cached("SELECT data FROM characters WHERE folder_id = ? ORDER BY id")?;
        let rows = st.query_map([folder_id], |r| r.get::<_, String>(0))?;
        let mut out = Vec::new();
        for data in rows {
            if let Ok(c) = serde_json::from_str::<CharMap>(&data?) {
                out.push(to_public(&c));
            }
        }
        Ok(out)
    }

    // === Criaturas do Hub do Mestre ===

    /// Fichas completas das fichas de uma pasta (o Hub do Mestre lê PV, CA, espaços
    /// e recursos de todo mundo). Sai com o `pin` removido, como em `to_authorized`.
    pub fn list_folder_characters_full(&self, folder_id: &str) -> rusqlite::Result<Vec<Value>> {
        let mut st = self
            .conn
            .prepare_cached("SELECT data FROM characters WHERE folder_id = ? ORDER BY id")?;
        let rows = st.query_map([folder_id], |r| r.get::<_, String>(0))?;
        let mut out = Vec::new();
        for data in rows {
            if let Ok(c) = serde_json::from_str::<CharMap>(&data?) {
                out.push(to_authorized(c));
            }
        }
        Ok(out)
    }

    pub fn list_creatures(&self, folder_id: &str) -> rusqlite::Result<Vec<Value>> {
        let mut st = self.conn.prepare_cached(
            "SELECT id, folder_id, name, hp_current, hp_max, ac, note, created_at, updated_at
             FROM creatures WHERE folder_id = ? ORDER BY created_at",
        )?;
        let rows = st.query_map([folder_id], creature_row)?;
        rows.collect()
    }

    pub fn get_creature(&self, folder_id: &str, id: &str) -> rusqlite::Result<Option<Value>> {
        self.conn
            .prepare_cached(
                "SELECT id, folder_id, name, hp_current, hp_max, ac, note, created_at, updated_at
                 FROM creatures WHERE folder_id = ? AND id = ?",
            )?
            .query_row(params![folder_id, id], creature_row)
            .optional()
    }

    pub fn insert_creature(
        &self,
        folder_id: &str,
        name: &str,
        hp: i64,
        ac: i64,
        note: Option<&str>,
    ) -> rusqlite::Result<Value> {
        let id = uuid::Uuid::new_v4().simple().to_string();
        let now = now_iso();
        self.conn
            .prepare_cached(
                "INSERT INTO creatures (id, folder_id, name, hp_current, hp_max, ac, note, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            )?
            .execute(params![id, folder_id, name, hp, hp, ac, note, now, now])?;
        self.get_creature(folder_id, &id)?
            .ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    /// Aplica o patch e devolve a criatura. `None` = não existe.
    pub fn update_creature(
        &self,
        folder_id: &str,
        id: &str,
        name: Option<&str>,
        hp_current: Option<i64>,
        hp_max: Option<i64>,
        ac: Option<i64>,
        note: Option<&str>,
    ) -> rusqlite::Result<Option<Value>> {
        let Some(current) = self.get_creature(folder_id, id)? else { return Ok(None) };
        let pick = |key: &str| current.get(key).and_then(Value::as_i64).unwrap_or(0);
        let next_max = hp_max.unwrap_or_else(|| pick("hpMax")).max(1);
        let next_hp = hp_current.unwrap_or_else(|| pick("hpCurrent")).clamp(0, next_max);
        let next_name = name
            .map(str::to_string)
            .unwrap_or_else(|| current.get("name").and_then(Value::as_str).unwrap_or("").to_string());
        let next_ac = ac.unwrap_or_else(|| pick("ac")).max(0);
        let next_note = note
            .map(str::to_string)
            .or_else(|| current.get("note").and_then(Value::as_str).map(str::to_string));
        self.conn
            .prepare_cached(
                "UPDATE creatures SET name = ?, hp_current = ?, hp_max = ?, ac = ?, note = ?, updated_at = ?
                 WHERE folder_id = ? AND id = ?",
            )?
            .execute(params![next_name, next_hp, next_max, next_ac, next_note, now_iso(), folder_id, id])?;
        self.get_creature(folder_id, id)
    }

    pub fn delete_creature(&self, folder_id: &str, id: &str) -> rusqlite::Result<bool> {
        Ok(self
            .conn
            .prepare_cached("DELETE FROM creatures WHERE folder_id = ? AND id = ?")?
            .execute(params![folder_id, id])?
            > 0)
    }

    /// Alguma ficha da pasta tem exatamente este PIN? O PIN fixo do seed vale no lugar
    /// do gravado; ficha sem PIN não conta. Desserializa só o campo `pin`.
    pub fn folder_character_pin(
        &self,
        folder_id: &str,
        pin: &str,
        fixed: &HashMap<String, String>,
    ) -> rusqlite::Result<bool> {
        #[derive(Deserialize)]
        struct PinOnly {
            pin: Option<String>,
        }
        let mut st = self.conn.prepare_cached("SELECT id, data FROM characters WHERE folder_id = ?")?;
        let rows = st.query_map([folder_id], |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)))?;
        for row in rows {
            let (id, data) = row?;
            let stored = serde_json::from_str::<PinOnly>(&data).ok().and_then(|p| p.pin);
            let expected = fixed.get(&id).cloned().or(stored);
            if expected.is_some_and(|e| !e.is_empty() && e == pin) {
                return Ok(true);
            }
        }
        Ok(false)
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

    /// Rolagens de todas as pastas (só o Mestre usa).
    pub fn list_rolls(&self, limit: i64) -> rusqlite::Result<Vec<DiceRoll>> {
        let mut st = self.conn.prepare_cached(
            "SELECT id, character_id, character_name, label, expression, result, detail, created_at
             FROM rolls ORDER BY created_at DESC LIMIT ?",
        )?;
        let rows = st.query_map([limit], roll_row)?;
        rows.collect()
    }

    /// Rolagens das fichas de uma pasta: a "mesa" de quem está nela.
    pub fn list_folder_rolls(&self, folder_id: &str, limit: i64) -> rusqlite::Result<Vec<DiceRoll>> {
        let mut st = self.conn.prepare_cached(
            "SELECT id, character_id, character_name, label, expression, result, detail, created_at
             FROM rolls WHERE character_id IN (SELECT id FROM characters WHERE folder_id = ?)
             ORDER BY created_at DESC LIMIT ?",
        )?;
        let rows = st.query_map(params![folder_id, limit], roll_row)?;
        rows.collect()
    }

    pub fn clear_folder_rolls(&self, folder_id: &str) -> rusqlite::Result<usize> {
        self.conn.execute(
            "DELETE FROM rolls WHERE character_id IN (SELECT id FROM characters WHERE folder_id = ?)",
            [folder_id],
        )
    }

    /// Insere a rolagem e poda o histórico: 100 por ficha (uma pasta movimentada não
    /// empurra para fora as rolagens das outras) e 2000 no total.
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
        if let Some(character_id) = &r.character_id {
            tx.prepare_cached(
                "DELETE FROM rolls WHERE character_id = ?1 AND rowid IN (
                   SELECT rowid FROM rolls WHERE character_id = ?1 ORDER BY created_at DESC LIMIT -1 OFFSET 100
                 )",
            )?
            .execute([character_id])?;
        }
        tx.prepare_cached(
            "DELETE FROM rolls WHERE rowid IN (SELECT rowid FROM rolls ORDER BY created_at DESC LIMIT -1 OFFSET 2000)",
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

fn roll_row(r: &rusqlite::Row) -> rusqlite::Result<DiceRoll> {
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
}

/// Colunas do resumo público de pasta, na ordem que `folder_row` lê.
const FOLDER_SELECT: &str = "SELECT f.id, f.name, f.pin <> '', f.avatar_version, f.created_at, f.updated_at,
  (SELECT COUNT(*) FROM characters c WHERE c.folder_id = f.id) FROM folders f";

fn creature_row(r: &rusqlite::Row) -> rusqlite::Result<Value> {
    Ok(json!({
        "id": r.get::<_, String>(0)?,
        "folderId": r.get::<_, String>(1)?,
        "name": r.get::<_, String>(2)?,
        "hpCurrent": r.get::<_, i64>(3)?,
        "hpMax": r.get::<_, i64>(4)?,
        "ac": r.get::<_, i64>(5)?,
        "note": r.get::<_, Option<String>>(6)?,
        "createdAt": r.get::<_, String>(7)?,
        "updatedAt": r.get::<_, String>(8)?,
    }))
}

fn folder_row(r: &rusqlite::Row) -> rusqlite::Result<Value> {
    Ok(json!({
        "id": r.get::<_, String>(0)?,
        "name": r.get::<_, String>(1)?,
        "protected": r.get::<_, bool>(2)?,
        "avatarVersion": r.get::<_, Option<String>>(3)?,
        "createdAt": r.get::<_, String>(4)?,
        "updatedAt": r.get::<_, String>(5)?,
        "characterCount": r.get::<_, i64>(6)?,
    }))
}

/// Bancos anteriores às pastas não têm a coluna `folder_id`.
fn ensure_folder_column(conn: &Connection) -> rusqlite::Result<()> {
    let has = conn
        .prepare("SELECT 1 FROM pragma_table_info('characters') WHERE name = 'folder_id'")?
        .exists([])?;
    if !has {
        conn.execute_batch("ALTER TABLE characters ADD COLUMN folder_id TEXT")?;
    }
    conn.execute_batch("CREATE INDEX IF NOT EXISTS characters_folder_idx ON characters (folder_id)")
}

/// Fichas sem pasta (as de antes das pastas e as do seed) vão para a pasta padrão,
/// criada sem senha. Se o JSON já apontar para uma pasta existente, ela é respeitada.
fn migrate_legacy_folder(conn: &Connection) -> rusqlite::Result<()> {
    let orphans: Vec<(String, String)> = {
        let mut st = conn.prepare("SELECT id, data FROM characters WHERE folder_id IS NULL")?;
        let rows = st.query_map([], |r| Ok((r.get(0)?, r.get(1)?)))?;
        rows.collect::<rusqlite::Result<_>>()?
    };
    if orphans.is_empty() {
        return Ok(());
    }
    let tx = conn.unchecked_transaction()?;
    for (id, data) in orphans {
        let mut c = serde_json::from_str::<CharMap>(&data).ok();
        let claimed = c.as_ref().and_then(|c| c.get("folderId")).and_then(Value::as_str).map(str::to_string);
        let folder = match claimed {
            Some(f) if tx.prepare_cached("SELECT 1 FROM folders WHERE id = ?")?.exists([&f])? => f,
            _ => {
                let now = now_iso();
                tx.prepare_cached(
                    "INSERT OR IGNORE INTO folders (id, name, pin, created_at, updated_at) VALUES (?, ?, '', ?, ?)",
                )?
                .execute(params![LEGACY_FOLDER_ID, LEGACY_FOLDER_NAME, now, now])?;
                LEGACY_FOLDER_ID.to_string()
            }
        };
        match c.as_mut() {
            Some(c) => {
                c.insert("folderId".into(), Value::String(folder.clone()));
                tx.prepare_cached("UPDATE characters SET data = ?, folder_id = ? WHERE id = ?")?
                    .execute(params![serde_json::to_string(c).unwrap(), folder, id])?;
            }
            None => {
                tx.prepare_cached("UPDATE characters SET folder_id = ? WHERE id = ?")?
                    .execute(params![folder, id])?;
            }
        }
    }
    tx.commit()
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

/// A CA passou a ser calculada a partir da armadura equipada. Fichas antigas não
/// têm o slot de armadura: marcam-no como vazio e, quando a CA gravada não bate com
/// a fórmula automática de antes (10 + Des), ela vira `acOverride` para o número
/// autorado não mudar sozinho. Ao equipar uma armadura o jogador desfaz esse trava.
fn migrate_armor_slots(conn: &Connection) -> rusqlite::Result<()> {
    let rows: Vec<(String, String)> = {
        let mut st = conn.prepare("SELECT id, data FROM characters")?;
        let iter = st.query_map([], |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)))?;
        iter.collect::<rusqlite::Result<Vec<_>>>()?
    };
    let tx = conn.unchecked_transaction()?;
    for (id, data) in rows {
        let Ok(mut c) = serde_json::from_str::<CharMap>(&data) else { continue };
        let Some(sheet) = c.get_mut("sheet").and_then(Value::as_object_mut) else { continue };
        if sheet.contains_key("equippedArmor") {
            continue; // já migrada
        }
        let ac = sheet.get("ac").and_then(Value::as_i64).unwrap_or(0);
        let dex = sheet
            .get("abilityScores")
            .and_then(|s| s.get("dex"))
            .and_then(Value::as_i64)
            .unwrap_or(10);
        let automatic = 10 + (dex - 10).div_euclid(2);
        if ac > 0 && ac != automatic && !sheet.contains_key("acOverride") {
            sheet.insert("acOverride".into(), Value::from(ac));
        }
        sheet.insert("equippedArmor".into(), Value::Null);
        sheet.insert("equippedShield".into(), Value::Null);
        tx.execute(
            "UPDATE characters SET data = ? WHERE id = ?",
            params![serde_json::to_string(&c).unwrap(), id],
        )?;
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
        if matches!(key.as_str(), "id" | "pin" | "protected" | "updatedAt" | "folderId") {
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
        "folderId": pick("folderId"),
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
        let none = HashMap::new();
        assert!(db.folder_character_pin(LEGACY_FOLDER_ID, "1", &none).unwrap());
        assert!(!db.folder_character_pin(LEGACY_FOLDER_ID, "nope", &none).unwrap());
        assert!(!db.folder_character_pin(LEGACY_FOLDER_ID, "", &none).unwrap());

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
    fn creatures_live_inside_a_folder() {
        let db = Db::open(":memory:", "[]").unwrap();
        db.insert_folder("Mesa", "1234").unwrap();
        let folder = db.list_folders().unwrap()[0]["id"].as_str().unwrap().to_string();

        let goblin = db.insert_creature(&folder, "Goblin 1", 7, 15, None).unwrap();
        let id = goblin["id"].as_str().unwrap().to_string();
        assert_eq!(goblin["hpCurrent"], 7);
        assert_eq!(goblin["hpMax"], 7);
        assert_eq!(goblin["ac"], 15);
        assert_eq!(db.list_creatures(&folder).unwrap().len(), 1);

        let hurt = db
            .update_creature(&folder, &id, None, Some(3), None, None, None)
            .unwrap()
            .unwrap();
        assert_eq!(hurt["hpCurrent"], 3);

        // O PV nunca passa do máximo nem fica negativo.
        let healed = db
            .update_creature(&folder, &id, None, Some(99), None, None, None)
            .unwrap()
            .unwrap();
        assert_eq!(healed["hpCurrent"], 7);
        let dead = db
            .update_creature(&folder, &id, None, Some(-5), None, None, None)
            .unwrap()
            .unwrap();
        assert_eq!(dead["hpCurrent"], 0, "o servidor zera; quem remove é a rota");

        assert!(db.delete_creature(&folder, &id).unwrap());
        assert!(!db.delete_creature(&folder, &id).unwrap());
        assert!(db.list_creatures(&folder).unwrap().is_empty());
    }

    #[test]
    fn folder_removal_takes_its_creatures() {
        let db = Db::open(":memory:", "[]").unwrap();
        db.insert_folder("Mesa", "1234").unwrap();
        let folder = db.list_folders().unwrap()[0]["id"].as_str().unwrap().to_string();
        db.insert_creature(&folder, "Lobo", 11, 13, None).unwrap();
        assert_eq!(db.delete_folder(&folder).unwrap(), FolderDelete::Deleted);
        assert!(db.list_creatures(&folder).unwrap().is_empty());
    }

    #[test]
    fn armor_migration_keeps_authored_ac() {
        // "a" tem CA autorada (18); "b" está na fórmula automática de antes (10 + Des).
        let seed = json!([
            {
                "id": "a", "playerName": "P", "characterName": "Rudá",
                "sheet": { "species": "Anão", "classes": [], "ac": 18,
                  "abilityScores": { "str": 16, "dex": 10, "con": 16, "int": 8, "wis": 12, "cha": 8 } }
            },
            {
                "id": "b", "playerName": "P", "characterName": "Novato",
                "sheet": { "species": "Humano", "classes": [], "ac": 12,
                  "abilityScores": { "str": 10, "dex": 14, "con": 10, "int": 10, "wis": 10, "cha": 10 } }
            }
        ]);
        let db = Db::open(":memory:", &seed.to_string()).unwrap();

        let a = db.get_stored("a").unwrap().unwrap();
        assert_eq!(a["sheet"]["acOverride"], 18, "CA autorada vira CA manual do Mestre");
        assert!(a["sheet"]["equippedArmor"].is_null());

        let b = db.get_stored("b").unwrap().unwrap();
        assert!(b["sheet"].get("acOverride").is_none(), "CA automática deixa o cálculo assumir");
        assert!(b["sheet"]["equippedShield"].is_null());
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

    #[test]
    fn legacy_characters_move_into_default_folder() {
        let db = Db::open(
            ":memory:",
            r#"[{"id":"a","playerName":"P","characterName":"C","pin":"1","sheet":{"species":"Elfo","classes":[]}},
                {"id":"b","playerName":"Q","characterName":"D","sheet":{"species":"Anão","classes":[]}}]"#,
        )
        .unwrap();
        assert_eq!(db.get_stored("a").unwrap().unwrap()["folderId"], LEGACY_FOLDER_ID);
        let folders = db.list_folders().unwrap();
        assert_eq!(folders.len(), 1);
        assert_eq!(folders[0]["id"], LEGACY_FOLDER_ID);
        assert_eq!(folders[0]["name"], "Mundo Pankleos");
        assert_eq!(folders[0]["protected"], false, "pasta padrão nasce sem senha");
        assert_eq!(folders[0]["characterCount"], 2);
        assert!(folders[0].get("pin").is_none());
        let chars = db.list_folder_characters(LEGACY_FOLDER_ID).unwrap();
        assert_eq!(chars.len(), 2);
        assert_eq!(chars[0]["folderId"], LEGACY_FOLDER_ID);
    }

    #[test]
    fn folders_crud_access_and_scoped_rolls() {
        let mut db = Db::open(":memory:", "[]").unwrap();
        assert!(db.list_folders().unwrap().is_empty(), "sem fichas órfãs não há pasta padrão");

        let f = db.insert_folder("Mesa de Sábado", "abc").unwrap();
        assert_eq!(f["id"], "mesa-de-sabado");
        assert_eq!(f["protected"], true);
        assert_eq!(f["characterCount"], 0);
        assert_eq!(f["avatarVersion"], Value::Null);
        assert!(f.get("pin").is_none(), "resumo nunca leva a senha");
        assert!(db.folder_name_taken("  mesa de SABADO ", None).unwrap());
        assert!(!db.folder_name_taken("Mesa de Sábado", Some("mesa-de-sabado")).unwrap());
        let other = db.insert_folder("Outra Mesa", "xyz").unwrap();
        let clash = db.insert_folder("Mesa de Sabado!", "q").unwrap();
        assert!(clash["id"].as_str().unwrap().starts_with("mesa-de-sabado-"), "slug repetido ganha sufixo");
        assert_eq!(db.delete_folder(clash["id"].as_str().unwrap()).unwrap(), FolderDelete::Deleted);

        let ficha = |id: &str, folder: &str, pin: &str| {
            map(json!({ "id": id, "folderId": folder, "pin": pin, "characterName": id, "sheet": { "species": "Humano", "classes": [] } }))
        };
        db.upsert(ficha("c1", "mesa-de-sabado", "11")).unwrap();
        db.upsert(ficha("c2", "outra-mesa", "22")).unwrap();
        assert_eq!(db.folder_public("mesa-de-sabado").unwrap().unwrap()["characterCount"], 1);
        assert_eq!(db.list_folder_characters("outra-mesa").unwrap()[0]["id"], "c2");

        let moved = db.patch("c1", &map(json!({ "folderId": "outra-mesa", "hpCurrent": 3 })), "jogador").unwrap().unwrap();
        assert_eq!(moved["folderId"], "mesa-de-sabado", "PATCH não troca a pasta");
        assert_eq!(db.list_folder_characters("mesa-de-sabado").unwrap().len(), 1);

        let mut fixed = HashMap::new();
        assert!(db.folder_character_pin("mesa-de-sabado", "11", &fixed).unwrap());
        assert!(!db.folder_character_pin("mesa-de-sabado", "22", &fixed).unwrap(), "PIN de ficha de outra pasta não vale");
        fixed.insert("c1".to_string(), "77".to_string());
        assert!(db.folder_character_pin("mesa-de-sabado", "77", &fixed).unwrap(), "PIN fixo vale no lugar do gravado");
        assert!(!db.folder_character_pin("mesa-de-sabado", "11", &fixed).unwrap());

        let roll = |id: &str, character: &str| DiceRoll {
            id: id.into(),
            character_id: Some(character.into()),
            character_name: None,
            label: "x".into(),
            expression: "1d20".into(),
            result: 1,
            detail: json!({"rolls":[1],"modifier":0}),
            created_at: now_iso(),
        };
        db.insert_roll(&roll("r1", "c1")).unwrap();
        db.insert_roll(&roll("r2", "c2")).unwrap();
        let rolls = db.list_folder_rolls("mesa-de-sabado", 50).unwrap();
        assert_eq!(rolls.len(), 1);
        assert_eq!(rolls[0].id, "r1");
        assert_eq!(db.clear_folder_rolls("mesa-de-sabado").unwrap(), 1);
        assert_eq!(db.list_rolls(50).unwrap().len(), 1, "a outra pasta fica intacta");

        let png = png_1x1();
        assert!(db.get_folder_avatar("outra-mesa").unwrap().is_none());
        let with_photo = db.set_folder_avatar("outra-mesa", "image/png", &png).unwrap().unwrap();
        let version = with_photo["avatarVersion"].as_str().unwrap().to_string();
        assert_eq!(db.get_folder_avatar("outra-mesa").unwrap().unwrap().version, version);
        assert!(db.set_folder_avatar("nao-existe", "image/png", &png).unwrap().is_none());
        let (cleared, changed) = db.remove_folder_avatar("outra-mesa").unwrap().unwrap();
        assert!(changed);
        assert_eq!(cleared["avatarVersion"], Value::Null);
        assert!(!db.remove_folder_avatar("outra-mesa").unwrap().unwrap().1, "remover de novo não muda nada");

        let renamed = db.update_folder(other["id"].as_str().unwrap(), "Mesa de Domingo", None).unwrap().unwrap();
        assert_eq!(renamed["name"], "Mesa de Domingo");
        assert_eq!(db.get_folder("outra-mesa").unwrap().unwrap().pin, "xyz", "sem pin novo, a senha fica");
        db.update_folder("outra-mesa", "Mesa de Domingo", Some("nova")).unwrap().unwrap();
        assert_eq!(db.get_folder("outra-mesa").unwrap().unwrap().pin, "nova");
        assert!(db.update_folder("nao-existe", "x", None).unwrap().is_none());

        assert_eq!(db.delete_folder("mesa-de-sabado").unwrap(), FolderDelete::NotEmpty);
        db.delete("c1").unwrap();
        assert_eq!(db.delete_folder("mesa-de-sabado").unwrap(), FolderDelete::Deleted);
        assert_eq!(db.delete_folder("mesa-de-sabado").unwrap(), FolderDelete::NotFound);
        assert_eq!(db.list_folders().unwrap().len(), 1);
    }
}
