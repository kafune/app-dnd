//! Fichas DnD — servidor único (API JSON + Server-Sent Events + frontend embutido).
//!
//! Um binário, um arquivo SQLite, ~10 MB de RAM. Substitui o `next start` anterior
//! mantendo a MESMA API HTTP e o MESMO esquema de banco (mais as pastas).
//!
//! Variáveis de ambiente:
//!   APP_DND_DB              caminho do SQLite (default ./data/app-dnd.sqlite)
//!   PORT / HOST             porta e interface (default 8080 / 0.0.0.0)
//!   APP_DND_BIND            "host:porta" completo (sobrescreve os dois acima)
//!   APP_DND_MASTER_PIN      chave mestra do Mestre
//!   APP_DND_CHARACTER_PINS  "id:pin,id:pin" para as fichas fixas do seed

mod db;
mod util;
mod web;

use std::{
    collections::HashMap,
    convert::Infallible,
    sync::{Arc, Mutex, MutexGuard},
    time::Duration,
};

use axum::{
    body::Body,
    extract::{
        rejection::{BytesRejection, JsonRejection},
        DefaultBodyLimit, Path, Query, State,
    },
    http::{header, HeaderMap, StatusCode},
    response::{
        sse::{Event, KeepAlive, Sse},
        IntoResponse, Response,
    },
    routing::{get, patch, post, put},
    Json, Router,
};
use bytes::Bytes;
use serde_json::{json, Map, Value};
use tokio::sync::broadcast;
use tokio_stream::{wrappers::BroadcastStream, StreamExt};
use tower_http::compression::{CompressionLayer, CompressionLevel};

use db::{to_authorized, to_public, Avatar, CharMap, Change, Db, DiceRoll, Folder, FolderDelete};

const SEED_JSON: &str = include_str!("../seed.json");

/// Foto de perfil: o frontend manda ~40 KB (JPEG 384 px); 1 MB é folga de sobra.
const AVATAR_LIMIT: usize = 1024 * 1024;
/// Um item homebrew é um JSON pequeno (raça com traços, talento, traço).
const HOMEBREW_LIMIT: usize = 256 * 1024;
const HOMEBREW_KINDS: [&str; 3] = ["race", "feat", "trait"];
const FOLDER_NAME_MAX: usize = 60;
const FOLDER_PIN_MAX: usize = 64;
/// Criatura do Hub do Mestre: só nome, PV e CA — é um lembrete de cena, não uma ficha.
const CREATURE_NAME_MAX: usize = 60;

/// Evento já serializado, compartilhado entre todos os clientes SSE (serializa 1x).
/// Com `folder`, só chega a quem está inscrito naquela pasta.
pub struct Msg {
    event: &'static str,
    data: String,
    folder: Option<String>,
}

struct Pins {
    master: String,
    fixed: HashMap<String, String>,
}

impl Pins {
    fn from_env() -> Pins {
        let master = std::env::var("APP_DND_MASTER_PIN").unwrap_or_else(|_| "670067".into());
        let fixed_raw = std::env::var("APP_DND_CHARACTER_PINS").unwrap_or_else(|_| {
            "joao-lindao:7429,camargo-fofo:3816,vinicius-fofo:9052,ruda-felpudo:6148".into()
        });
        let fixed = fixed_raw
            .split(',')
            .filter_map(|pair| {
                let (id, pin) = pair.trim().split_once(':')?;
                Some((id.trim().to_string(), pin.trim().to_string()))
            })
            .collect();
        Pins { master, fixed }
    }

    fn is_master(&self, pin: Option<&str>) -> bool {
        pin.map(str::trim) == Some(self.master.as_str())
    }

    /// Chave da pasta: chave mestra, pasta sem senha ou a senha dela. Libera criar
    /// fichas na pasta.
    fn folder_key(&self, folder: &Folder, pin: Option<&str>) -> bool {
        self.is_master(pin) || folder.pin.is_empty() || pin.map(str::trim) == Some(folder.pin.as_str())
    }

    /// Membro da pasta: a chave dela ou o PIN de uma ficha que está nela. Libera ver
    /// as fichas e a mesa (rolagens) da pasta — quem abriu a própria ficha por link
    /// direto também acompanha a mesa sem digitar a senha da pasta.
    fn folder_member(&self, db: &Db, folder: &Folder, pin: Option<&str>) -> rusqlite::Result<bool> {
        if self.folder_key(folder, pin) {
            return Ok(true);
        }
        let Some(pin) = pin.map(str::trim).filter(|p| !p.is_empty()) else {
            return Ok(false);
        };
        db.folder_character_pin(&folder.id, pin, &self.fixed)
    }

    /// Fichas do seed usam o PIN fixo; fichas criadas guardam o PIN no registro.
    /// Sem PIN nenhum => ficha aberta.
    fn ok(&self, stored: &CharMap, pin: Option<&str>) -> bool {
        if self.is_master(pin) {
            return true;
        }
        let id = stored.get("id").and_then(Value::as_str).unwrap_or("");
        let expected = self
            .fixed
            .get(id)
            .map(String::as_str)
            .or_else(|| stored.get("pin").and_then(Value::as_str));
        match expected {
            None | Some("") => true,
            Some(exp) => pin.map(str::trim) == Some(exp),
        }
    }
}

struct AppState {
    db: Mutex<Db>,
    tx: broadcast::Sender<Arc<Msg>>,
    pins: Pins,
    /// `GET /api/folders` já serializado; invalidado ao mexer em pasta ou criar/apagar ficha.
    folders_cache: Mutex<Option<Bytes>>,
    /// `GET /api/homebrew` já serializado; invalidado em qualquer escrita de homebrew.
    homebrew_cache: Mutex<Option<Bytes>>,
}

impl AppState {
    fn db(&self) -> MutexGuard<'_, Db> {
        self.db.lock().unwrap_or_else(|e| e.into_inner())
    }

    /// Evento para todo mundo (pastas, homebrew).
    fn publish(&self, event: &'static str, data: Value) {
        self.publish_in(None, event, data);
    }

    /// Evento só para quem está na pasta (fichas, rolagens). `None` = todo mundo.
    fn publish_in(&self, folder: Option<String>, event: &'static str, data: Value) {
        let _ = self.tx.send(Arc::new(Msg { event, data: data.to_string(), folder }));
    }

    fn invalidate_folders(&self) {
        *self.folders_cache.lock().unwrap_or_else(|e| e.into_inner()) = None;
    }

    fn invalidate_homebrew(&self) {
        *self.homebrew_cache.lock().unwrap_or_else(|e| e.into_inner()) = None;
    }
}

type Shared = Arc<AppState>;

// === Respostas ===

fn error(status: StatusCode, code: &str) -> Response {
    (status, Json(json!({ "error": code }))).into_response()
}

fn db_error(e: rusqlite::Error) -> Response {
    eprintln!("[db] erro: {e}");
    error(StatusCode::INTERNAL_SERVER_ERROR, "db_error")
}

/// Resposta autorizada: a ficha completa + o papel de quem a abriu ("mestre" com a
/// chave mestra, "jogador" com o PIN da ficha). O cliente usa o papel para liberar
/// as opções homebrew e ignorar os limites de regra.
fn authorized(st: &AppState, c: CharMap, pin: Option<&str>) -> Value {
    let role = if st.pins.is_master(pin) { "mestre" } else { "jogador" };
    json!({ "character": to_authorized(c), "role": role })
}

/// PIN/senha enviados no header. Serve para ficha, pasta e chave mestra: cada rota
/// confere contra o que protege.
fn header_pin(headers: &HeaderMap) -> Option<String> {
    headers
        .get("x-character-pin")
        .and_then(|v| v.to_str().ok())
        .map(str::to_string)
}

fn folder_of(c: &CharMap) -> Option<String> {
    c.get("folderId").and_then(Value::as_str).map(str::to_string)
}

fn json_bytes(b: Bytes) -> Response {
    ([(header::CONTENT_TYPE, "application/json")], b).into_response()
}

fn json_body_error(rej: JsonRejection) -> Response {
    if rej.status() == StatusCode::PAYLOAD_TOO_LARGE {
        error(StatusCode::PAYLOAD_TOO_LARGE, "too_large")
    } else {
        error(StatusCode::BAD_REQUEST, "bad_json")
    }
}

fn body_error(status: StatusCode) -> Response {
    if status == StatusCode::PAYLOAD_TOO_LARGE {
        error(StatusCode::PAYLOAD_TOO_LARGE, "too_large")
    } else {
        error(StatusCode::BAD_REQUEST, "bad_request")
    }
}

/// Imagem com `?v=<versão>`: a URL muda a cada troca, então dá para cachear para
/// sempre; sem `v`, revalida pelo ETag.
fn image_response(avatar: Avatar, q: &HashMap<String, String>, headers: &HeaderMap) -> Response {
    let etag = format!("\"{}\"", avatar.version);
    let cache = if q.get("v").map(String::as_str) == Some(avatar.version.as_str()) {
        "public, max-age=31536000, immutable"
    } else {
        "no-cache"
    };
    let not_modified = headers
        .get(header::IF_NONE_MATCH)
        .and_then(|v| v.to_str().ok())
        .map(|v| v.split(',').any(|t| t.trim() == etag))
        .unwrap_or(false);
    let builder = Response::builder()
        .header(header::ETAG, &etag)
        .header(header::CACHE_CONTROL, cache)
        .header("x-content-type-options", "nosniff");
    let res = if not_modified {
        builder.status(StatusCode::NOT_MODIFIED).body(Body::empty())
    } else {
        builder
            .status(StatusCode::OK)
            .header(header::CONTENT_TYPE, avatar.mime)
            .body(Body::from(avatar.data))
    };
    res.unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response())
}

/// Tipo canônico da imagem enviada (JPEG/PNG/WEBP, conferido pela assinatura), ou a
/// resposta de erro.
fn checked_image(headers: &HeaderMap, body: &[u8]) -> Result<&'static str, Response> {
    let mime = headers
        .get(header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| util::image_mime(v.split(';').next().unwrap_or("")))
        .ok_or_else(|| error(StatusCode::UNSUPPORTED_MEDIA_TYPE, "bad_type"))?;
    if !util::sniff_image(mime, body) {
        return Err(error(StatusCode::BAD_REQUEST, "bad_image"));
    }
    Ok(mime)
}

// === Fichas ===

/// Todas as fichas de todas as pastas (resumo). Só o Mestre: jogador enxerga as
/// fichas pela pasta, com a senha dela.
async fn list_characters(State(st): State<Shared>, headers: HeaderMap) -> Response {
    if !st.pins.is_master(header_pin(&headers).as_deref()) {
        return error(StatusCode::FORBIDDEN, "bad_pin");
    }
    match st.db().list_public() {
        Ok(list) => Json(json!({ "characters": list })).into_response(),
        Err(e) => db_error(e),
    }
}

fn valid_payload(c: &CharMap) -> bool {
    let non_empty = |k: &str| {
        c.get(k)
            .and_then(Value::as_str)
            .map(|s| !s.trim().is_empty())
            .unwrap_or(false)
    };
    non_empty("playerName")
        && non_empty("characterName")
        && c
            .get("sheet")
            .and_then(Value::as_object)
            .map(|s| s.get("abilityScores").map(Value::is_object).unwrap_or(false))
            .unwrap_or(false)
}

/// Gera um id único: slug do nome (+ sufixo curto se colidir ou vazio).
fn unique_id(db: &Db, name: &str) -> rusqlite::Result<String> {
    let mut base = util::slugify(name);
    if base.is_empty() {
        base = "ficha".into();
    }
    if !db.exists(&base)? {
        return Ok(base);
    }
    loop {
        let id = format!("{base}-{}", &uuid::Uuid::new_v4().simple().to_string()[..4]);
        if !db.exists(&id)? {
            return Ok(id);
        }
    }
}

/// Toda ficha nasce dentro de uma pasta (`character.folderId`); o header leva a senha
/// da pasta (ou a chave mestra).
async fn create_character(
    State(st): State<Shared>,
    headers: HeaderMap,
    body: Result<Json<Value>, JsonRejection>,
) -> Response {
    let Ok(Json(body)) = body else { return error(StatusCode::BAD_REQUEST, "bad_json") };
    let Some(payload) = body.get("character").and_then(Value::as_object) else {
        return error(StatusCode::BAD_REQUEST, "bad_request");
    };
    if !valid_payload(payload) {
        return error(StatusCode::BAD_REQUEST, "bad_request");
    }
    let Some(folder_id) = payload
        .get("folderId")
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|f| !f.is_empty())
        .map(str::to_string)
    else {
        return error(StatusCode::BAD_REQUEST, "folder_required");
    };
    let folder_pin = header_pin(&headers);

    let mut c = payload.clone();
    c.remove("avatarVersion"); // gerenciado pelo servidor (rotas de foto)
    c.insert("folderId".into(), Value::String(folder_id.clone()));
    // PIN com espaço nas pontas trancava o próprio criador: o navegador guardava o PIN
    // cru e o `Pins::ok` só apara o PIN recebido. Guarda já aparado.
    match c.get("pin").and_then(Value::as_str).map(str::trim).filter(|p| !p.is_empty()) {
        Some(p) => {
            let p = p.to_string();
            c.insert("pin".into(), Value::String(p));
        }
        None => {
            c.remove("pin");
        }
    }
    let has_pin = c.contains_key("pin");

    let (saved, folder_summary) = {
        let db = st.db();
        let folder = match db.get_folder(&folder_id) {
            Ok(Some(f)) => f,
            Ok(None) => return error(StatusCode::NOT_FOUND, "folder_not_found"),
            Err(e) => return db_error(e),
        };
        if !st.pins.folder_key(&folder, folder_pin.as_deref()) {
            return error(StatusCode::FORBIDDEN, "bad_folder_pin");
        }
        let name = c.get("characterName").and_then(Value::as_str).unwrap_or("");
        let id = match unique_id(&db, name) {
            Ok(id) => id,
            Err(e) => return db_error(e),
        };
        c.insert("id".into(), Value::String(id.clone()));
        c.insert("protected".into(), Value::Bool(has_pin));
        let saved = match db.upsert(c) {
            Ok(s) => s,
            Err(e) => return db_error(e),
        };
        let created = [Change {
            field: "Ficha".into(),
            from: None,
            to: None,
            note: Some("criada".into()),
        }];
        if let Err(e) = db.record_log(&id, "jogador", &created) {
            return db_error(e);
        }
        match db.folder_public(&folder_id) {
            Ok(summary) => (saved, summary),
            Err(e) => return db_error(e),
        }
    };

    st.invalidate_folders();
    st.publish_in(Some(folder_id), "character", json!({ "character": to_public(&saved) }));
    if let Some(folder) = folder_summary {
        st.publish("folder", json!({ "folder": folder }));
    }
    let pin = payload.get("pin").and_then(Value::as_str);
    (StatusCode::CREATED, Json(authorized(&st, saved, pin))).into_response()
}

async fn get_character(
    State(st): State<Shared>,
    Path(id): Path<String>,
    Query(q): Query<HashMap<String, String>>,
    headers: HeaderMap,
) -> Response {
    let pin = header_pin(&headers);
    let db = st.db();
    let stored = match db.get_stored(&id) {
        Ok(Some(c)) => c,
        Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
        Err(e) => return db_error(e),
    };
    if !st.pins.ok(&stored, pin.as_deref()) {
        return error(StatusCode::FORBIDDEN, "bad_pin");
    }
    // ?log=1 -> log de modificações (mesma autorização da ficha)
    if q.get("log").map(|v| !v.is_empty()).unwrap_or(false) {
        return match db.list_log(&id, 50) {
            Ok(log) => Json(json!({ "log": log })).into_response(),
            Err(e) => db_error(e),
        };
    }
    Json(authorized(&st, stored, pin.as_deref())).into_response()
}

/// Resumo público de uma ficha (nome, jogador, espécie, classes, pasta): a tela de
/// PIN de quem chega por link direto, sem ter passado pela pasta.
async fn character_summary(State(st): State<Shared>, Path(id): Path<String>) -> Response {
    match st.db().get_stored(&id) {
        Ok(Some(c)) => Json(json!({ "character": to_public(&c) })).into_response(),
        Ok(None) => error(StatusCode::NOT_FOUND, "not_found"),
        Err(e) => db_error(e),
    }
}

/// Campos da ficha que só o Mestre muda, sempre.
const SHEET_LOCKED: [&str; 11] = [
    "classes",
    "inventory",
    "weapons",
    "proficiencyBonus",
    "initiativeBonus",
    "speed",
    "saves",
    "proficiencies",
    "languages",
    "acBonus",
    "raceInfo",
];

/// Campos da ficha que o jogador só mexe junto com uma decisão de progressão
/// (escolher talento/atributo num nível que o Mestre abriu) ou ao adotar uma
/// característica opcional.
const SHEET_PROGRESSION: [&str; 2] = ["abilityScores", "features"];

fn field<'a>(map: &'a CharMap, key: &str) -> Option<&'a Value> {
    map.get(key)
}

fn same(a: Option<&Value>, b: Option<&Value>) -> bool {
    match (a, b) {
        (None, None) => true,
        (Some(x), Some(y)) => x == y,
        _ => false,
    }
}

/// Nomes das perícias proficientes (o jogador pode ligar/desligar só a especialização).
fn skill_names(v: Option<&Value>) -> Option<Vec<String>> {
    let mut names: Vec<String> = v
        .and_then(Value::as_array)?
        .iter()
        .filter(|s| s.get("proficient").and_then(Value::as_bool).unwrap_or(false))
        .filter_map(|s| s.get("name").and_then(Value::as_str).map(str::to_string))
        .collect();
    names.sort();
    Some(names)
}

/// Um recurso com os campos que o jogador não pode mexer (só o `current` é dele).
fn resource_shape(v: &Value) -> (String, i64, String, String, bool) {
    (
        v.get("name").and_then(Value::as_str).unwrap_or("").to_string(),
        v.get("max").and_then(Value::as_i64).unwrap_or(0),
        v.get("recharge").and_then(Value::as_str).unwrap_or("").to_string(),
        v.get("kind").and_then(Value::as_str).unwrap_or("recarregavel").to_string(),
        v.get("masterOnly").and_then(Value::as_bool).unwrap_or(false),
    )
}

/// O jogador pode aplicar este patch? Devolve o código do erro quando não.
///
/// A ideia: o jogador cuida do estado do personagem (PV, contadores gastos, notas,
/// história) e das escolhas que a progressão abriu. Tudo que define o poder da
/// ficha — níveis, atributos, perícias, itens, máximos de recurso e de espaço de
/// magia — é do Mestre. Sem isso, bastava abrir o modo de edição para trapacear.
fn player_patch_violation(current: &CharMap, patch: &CharMap) -> Option<&'static str> {
    // PV máximo e nível são do Mestre; o PV atual é livre.
    if let Some(next) = patch.get("hpMax") {
        if Some(next) != current.get("hpMax") {
            return Some("master_only_hp_max");
        }
    }

    if let Some(next) = patch.get("spellSlots").and_then(Value::as_object) {
        let now = current.get("spellSlots").and_then(Value::as_object);
        let empty = Map::new();
        let now = now.unwrap_or(&empty);
        if next.len() != now.len() {
            return Some("master_only_spell_slots");
        }
        for (level, slot) in next {
            let Some(before) = now.get(level) else { return Some("master_only_spell_slots") };
            let max = before.get("max").and_then(Value::as_i64).unwrap_or(0);
            if slot.get("max").and_then(Value::as_i64).unwrap_or(0) != max {
                return Some("master_only_spell_slots");
            }
            let value = slot.get("current").and_then(Value::as_i64).unwrap_or(0);
            if value < 0 || value > max {
                return Some("bad_request");
            }
        }
    }

    if let Some(next) = patch.get("resources").and_then(Value::as_array) {
        let now: Vec<Value> = current
            .get("resources")
            .and_then(Value::as_array)
            .cloned()
            .unwrap_or_default();
        if next.len() != now.len() {
            return Some("master_only_resources");
        }
        for (i, resource) in next.iter().enumerate() {
            let before = &now[i];
            if resource_shape(resource) != resource_shape(before) {
                return Some("master_only_resources");
            }
            let (_, max, _, kind, master_only) = resource_shape(resource);
            let value = resource.get("current").and_then(Value::as_i64).unwrap_or(0);
            let previous = before.get("current").and_then(Value::as_i64).unwrap_or(0);
            let ceiling = if kind == "moeda" && max <= 0 { i64::MAX } else { max };
            if value < 0 || value > ceiling {
                return Some("bad_request");
            }
            // Inspiração e afins: quem dá é o Mestre, o jogador só gasta.
            if master_only && value > previous {
                return Some("master_only_resources");
            }
        }
    }

    let (Some(next_sheet), Some(now_sheet)) = (
        patch.get("sheet").and_then(Value::as_object),
        current.get("sheet").and_then(Value::as_object),
    ) else {
        return None;
    };

    for key in SHEET_LOCKED {
        if !same(field(next_sheet, key), field(now_sheet, key)) {
            return Some("master_only_sheet");
        }
    }

    // CA manual: o jogador só pode APAGAR (ao equipar uma armadura a CA volta a ser
    // calculada), nunca definir um número à mão.
    if !same(field(next_sheet, "acOverride"), field(now_sheet, "acOverride"))
        && !matches!(field(next_sheet, "acOverride"), None | Some(Value::Null))
    {
        return Some("master_only_sheet");
    }

    // Progressão: só muda junto com uma nova decisão de ASI/talento ou ao adotar
    // uma característica opcional (ambas nascem de níveis que o Mestre concedeu).
    let advanced = !same(field(next_sheet, "advancement"), field(now_sheet, "advancement"));
    let adopted = !same(field(next_sheet, "optionalFeatures"), field(now_sheet, "optionalFeatures"));
    if !advanced && !adopted {
        for key in SHEET_PROGRESSION {
            if !same(field(next_sheet, key), field(now_sheet, key)) {
                return Some("master_only_sheet");
            }
        }
        // Perícias: o conjunto de proficiências fica; só a especialização pode mudar.
        if !same(field(next_sheet, "skills"), field(now_sheet, "skills"))
            && skill_names(field(next_sheet, "skills")) != skill_names(field(now_sheet, "skills"))
        {
            return Some("master_only_sheet");
        }
    }
    None
}

async fn patch_character(
    State(st): State<Shared>,
    Path(id): Path<String>,
    body: Result<Json<Value>, JsonRejection>,
) -> Response {
    let Ok(Json(body)) = body else { return error(StatusCode::BAD_REQUEST, "bad_json") };
    let Some(patch) = body.get("patch").and_then(Value::as_object) else {
        return error(StatusCode::BAD_REQUEST, "bad_request");
    };
    let pin = body.get("pin").and_then(Value::as_str).map(str::to_string);

    // Não deixa o cliente sobrescrever a identidade
    let mut safe: CharMap = patch.clone();
    safe.remove("id");
    safe.remove("pin");
    safe.remove("avatarVersion");
    safe.remove("folderId");

    let next = {
        let mut db = st.db();
        let current = match db.get_stored(&id) {
            Ok(Some(c)) => c,
            Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
            Err(e) => return db_error(e),
        };
        if !st.pins.ok(&current, pin.as_deref()) {
            return error(StatusCode::FORBIDDEN, "bad_pin");
        }
        let master = st.pins.is_master(pin.as_deref());
        if !master {
            if let Some(code) = player_patch_violation(&current, &safe) {
                return error(StatusCode::FORBIDDEN, code);
            }
        }
        let by = if master { "mestre" } else { "jogador" };
        match db.patch(&id, &safe, by) {
            Ok(Some(n)) => n,
            Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
            Err(e) => return db_error(e),
        }
    };

    st.publish_in(folder_of(&next), "character", json!({ "character": to_public(&next) }));
    Json(authorized(&st, next, pin.as_deref())).into_response()
}

async fn delete_character(
    State(st): State<Shared>,
    Path(id): Path<String>,
    headers: HeaderMap,
) -> Response {
    let pin = header_pin(&headers);
    let (folder, folder_summary) = {
        let mut db = st.db();
        let current = match db.get_stored(&id) {
            Ok(Some(c)) => c,
            Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
            Err(e) => return db_error(e),
        };
        if !st.pins.ok(&current, pin.as_deref()) {
            return error(StatusCode::FORBIDDEN, "bad_pin");
        }
        if let Err(e) = db.delete(&id) {
            return db_error(e);
        }
        let folder = folder_of(&current);
        let summary = match folder.as_deref().map(|f| db.folder_public(f)).transpose() {
            Ok(s) => s.flatten(),
            Err(e) => return db_error(e),
        };
        (folder, summary)
    };
    st.invalidate_folders();
    st.publish_in(folder, "character-deleted", json!({ "id": id }));
    if let Some(summary) = folder_summary {
        st.publish("folder", json!({ "folder": summary }));
    }
    Json(json!({ "ok": true })).into_response()
}

// === Fotos de perfil das fichas ===

/// Pública (o card da pasta mostra a foto).
async fn get_avatar(
    State(st): State<Shared>,
    Path(id): Path<String>,
    Query(q): Query<HashMap<String, String>>,
    headers: HeaderMap,
) -> Response {
    match st.db().get_avatar(&id) {
        Ok(Some(a)) => image_response(a, &q, &headers),
        Ok(None) => error(StatusCode::NOT_FOUND, "not_found"),
        Err(e) => db_error(e),
    }
}

/// Corpo = bytes da imagem (JPEG/PNG/WEBP). Mesma autorização do PATCH.
async fn put_avatar(
    State(st): State<Shared>,
    Path(id): Path<String>,
    headers: HeaderMap,
    body: Result<Bytes, BytesRejection>,
) -> Response {
    let body = match body {
        Ok(b) => b,
        Err(rej) => return body_error(rej.status()),
    };
    let pin = header_pin(&headers);
    let next = {
        let mut db = st.db();
        let current = match db.get_stored(&id) {
            Ok(Some(c)) => c,
            Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
            Err(e) => return db_error(e),
        };
        if !st.pins.ok(&current, pin.as_deref()) {
            return error(StatusCode::FORBIDDEN, "bad_pin");
        }
        let mime = match checked_image(&headers, &body) {
            Ok(m) => m,
            Err(res) => return res,
        };
        let by = if st.pins.is_master(pin.as_deref()) { "mestre" } else { "jogador" };
        match db.set_avatar(&id, mime, &body, by) {
            Ok(Some(n)) => n,
            Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
            Err(e) => return db_error(e),
        }
    };
    st.publish_in(folder_of(&next), "character", json!({ "character": to_public(&next) }));
    Json(authorized(&st, next, pin.as_deref())).into_response()
}

async fn delete_avatar(
    State(st): State<Shared>,
    Path(id): Path<String>,
    headers: HeaderMap,
) -> Response {
    let pin = header_pin(&headers);
    let (next, changed) = {
        let mut db = st.db();
        let current = match db.get_stored(&id) {
            Ok(Some(c)) => c,
            Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
            Err(e) => return db_error(e),
        };
        if !st.pins.ok(&current, pin.as_deref()) {
            return error(StatusCode::FORBIDDEN, "bad_pin");
        }
        let by = if st.pins.is_master(pin.as_deref()) { "mestre" } else { "jogador" };
        match db.remove_avatar(&id, by) {
            Ok(Some(r)) => r,
            Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
            Err(e) => return db_error(e),
        }
    };
    if changed {
        st.publish_in(folder_of(&next), "character", json!({ "character": to_public(&next) }));
    }
    Json(authorized(&st, next, pin.as_deref())).into_response()
}

// === Pastas ===

fn trimmed<'a>(body: &'a Value, key: &str) -> Option<&'a str> {
    body.get(key).and_then(Value::as_str).map(str::trim)
}

fn folder_name(body: &Value) -> Option<&str> {
    trimmed(body, "name").filter(|n| !n.is_empty() && n.chars().count() <= FOLDER_NAME_MAX)
}

fn valid_folder_pin(pin: &str) -> bool {
    !pin.is_empty() && pin.chars().count() <= FOLDER_PIN_MAX
}

/// Pública: nome, foto, se tem senha e quantas fichas. Nunca a senha.
async fn list_folders(State(st): State<Shared>) -> Response {
    if let Some(cached) = st.folders_cache.lock().unwrap_or_else(|e| e.into_inner()).clone() {
        return json_bytes(cached);
    }
    let folders = match st.db().list_folders() {
        Ok(l) => l,
        Err(e) => return db_error(e),
    };
    let bytes = Bytes::from(serde_json::to_vec(&json!({ "folders": folders })).unwrap());
    *st.folders_cache.lock().unwrap_or_else(|e| e.into_inner()) = Some(bytes.clone());
    json_bytes(bytes)
}

/// Só o Mestre cria pasta. Corpo: `{ name, pin }` (a senha é obrigatória).
async fn create_folder(
    State(st): State<Shared>,
    headers: HeaderMap,
    body: Result<Json<Value>, JsonRejection>,
) -> Response {
    if !st.pins.is_master(header_pin(&headers).as_deref()) {
        return error(StatusCode::FORBIDDEN, "bad_pin");
    }
    let body = match body {
        Ok(Json(b)) => b,
        Err(rej) => return json_body_error(rej),
    };
    let Some(name) = folder_name(&body) else { return error(StatusCode::BAD_REQUEST, "bad_request") };
    let Some(pin) = trimmed(&body, "pin").filter(|p| valid_folder_pin(p)) else {
        return error(StatusCode::BAD_REQUEST, "folder_pin_required");
    };
    let folder = {
        let db = st.db();
        match db.folder_name_taken(name, None) {
            Ok(true) => return error(StatusCode::CONFLICT, "folder_name_taken"),
            Ok(false) => {}
            Err(e) => return db_error(e),
        }
        match db.insert_folder(name, pin) {
            Ok(f) => f,
            Err(e) => return db_error(e),
        }
    };
    st.invalidate_folders();
    st.publish("folder", json!({ "folder": folder }));
    (StatusCode::CREATED, Json(json!({ "folder": folder }))).into_response()
}

/// Abre a pasta: resumo + fichas. `canCreate` diz se a credencial usada (senha da
/// pasta ou chave mestra) permite criar fichas nela; o PIN de uma ficha só deixa ver.
async fn get_folder(State(st): State<Shared>, Path(id): Path<String>, headers: HeaderMap) -> Response {
    let pin = header_pin(&headers);
    let db = st.db();
    let folder = match db.get_folder(&id) {
        Ok(Some(f)) => f,
        Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
        Err(e) => return db_error(e),
    };
    match st.pins.folder_member(&db, &folder, pin.as_deref()) {
        Ok(true) => {}
        Ok(false) => return error(StatusCode::FORBIDDEN, "bad_pin"),
        Err(e) => return db_error(e),
    }
    let summary = match db.folder_public(&id) {
        Ok(Some(s)) => s,
        Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
        Err(e) => return db_error(e),
    };
    let characters = match db.list_folder_characters(&id) {
        Ok(c) => c,
        Err(e) => return db_error(e),
    };
    Json(json!({
        "folder": summary,
        "characters": characters,
        "canCreate": st.pins.folder_key(&folder, pin.as_deref()),
    }))
    .into_response()
}

/// Mestre renomeia e/ou troca a senha. `pin` ausente ou vazio mantém a senha atual.
async fn update_folder(
    State(st): State<Shared>,
    Path(id): Path<String>,
    headers: HeaderMap,
    body: Result<Json<Value>, JsonRejection>,
) -> Response {
    if !st.pins.is_master(header_pin(&headers).as_deref()) {
        return error(StatusCode::FORBIDDEN, "bad_pin");
    }
    let body = match body {
        Ok(Json(b)) => b,
        Err(rej) => return json_body_error(rej),
    };
    let Some(name) = folder_name(&body) else { return error(StatusCode::BAD_REQUEST, "bad_request") };
    let pin = match body.get("pin") {
        None | Some(Value::Null) => None,
        Some(v) => match v.as_str().map(str::trim) {
            Some("") => None,
            Some(p) if valid_folder_pin(p) => Some(p),
            _ => return error(StatusCode::BAD_REQUEST, "bad_request"),
        },
    };
    let folder = {
        let db = st.db();
        match db.folder_name_taken(name, Some(&id)) {
            Ok(true) => return error(StatusCode::CONFLICT, "folder_name_taken"),
            Ok(false) => {}
            Err(e) => return db_error(e),
        }
        match db.update_folder(&id, name, pin) {
            Ok(Some(f)) => f,
            Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
            Err(e) => return db_error(e),
        }
    };
    st.invalidate_folders();
    st.publish("folder", json!({ "folder": folder }));
    Json(json!({ "folder": folder })).into_response()
}

/// Mestre apaga pasta vazia (com fichas dentro dá 409 — nada some sem querer).
async fn delete_folder(State(st): State<Shared>, Path(id): Path<String>, headers: HeaderMap) -> Response {
    if !st.pins.is_master(header_pin(&headers).as_deref()) {
        return error(StatusCode::FORBIDDEN, "bad_pin");
    }
    let result = st.db().delete_folder(&id);
    match result {
        Ok(FolderDelete::Deleted) => {}
        Ok(FolderDelete::NotFound) => return error(StatusCode::NOT_FOUND, "not_found"),
        Ok(FolderDelete::NotEmpty) => return error(StatusCode::CONFLICT, "folder_not_empty"),
        Err(e) => return db_error(e),
    }
    st.invalidate_folders();
    st.publish("folder-deleted", json!({ "id": id }));
    Json(json!({ "ok": true })).into_response()
}

async fn get_folder_avatar(
    State(st): State<Shared>,
    Path(id): Path<String>,
    Query(q): Query<HashMap<String, String>>,
    headers: HeaderMap,
) -> Response {
    match st.db().get_folder_avatar(&id) {
        Ok(Some(a)) => image_response(a, &q, &headers),
        Ok(None) => error(StatusCode::NOT_FOUND, "not_found"),
        Err(e) => db_error(e),
    }
}

async fn put_folder_avatar(
    State(st): State<Shared>,
    Path(id): Path<String>,
    headers: HeaderMap,
    body: Result<Bytes, BytesRejection>,
) -> Response {
    let body = match body {
        Ok(b) => b,
        Err(rej) => return body_error(rej.status()),
    };
    if !st.pins.is_master(header_pin(&headers).as_deref()) {
        return error(StatusCode::FORBIDDEN, "bad_pin");
    }
    let mime = match checked_image(&headers, &body) {
        Ok(m) => m,
        Err(res) => return res,
    };
    let result = st.db().set_folder_avatar(&id, mime, &body);
    let folder = match result {
        Ok(Some(f)) => f,
        Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
        Err(e) => return db_error(e),
    };
    st.invalidate_folders();
    st.publish("folder", json!({ "folder": folder }));
    Json(json!({ "folder": folder })).into_response()
}

async fn delete_folder_avatar(State(st): State<Shared>, Path(id): Path<String>, headers: HeaderMap) -> Response {
    if !st.pins.is_master(header_pin(&headers).as_deref()) {
        return error(StatusCode::FORBIDDEN, "bad_pin");
    }
    let result = st.db().remove_folder_avatar(&id);
    let (folder, changed) = match result {
        Ok(Some(r)) => r,
        Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
        Err(e) => return db_error(e),
    };
    if changed {
        st.invalidate_folders();
        st.publish("folder", json!({ "folder": folder }));
    }
    Json(json!({ "folder": folder })).into_response()
}

// === Hub do Mestre ===

/// Nome e números de uma criatura vindos do corpo do request.
fn creature_fields(body: &Value) -> (Option<String>, Option<i64>, Option<i64>, Option<i64>, Option<String>) {
    let text = |key: &str| {
        body.get(key)
            .and_then(Value::as_str)
            .map(str::trim)
            .filter(|s| !s.is_empty())
            .map(|s| s.chars().take(CREATURE_NAME_MAX).collect::<String>())
    };
    let number = |key: &str| body.get(key).and_then(Value::as_i64);
    (text("name"), number("hpCurrent"), number("hpMax"), number("ac"), text("note"))
}

/// Fichas completas da pasta + criaturas da cena. Só com a chave mestra: é o
/// painel onde o Mestre vê PV, CA, espaços e recursos de todo mundo.
async fn folder_hub(State(st): State<Shared>, Path(id): Path<String>, headers: HeaderMap) -> Response {
    if !st.pins.is_master(header_pin(&headers).as_deref()) {
        return error(StatusCode::FORBIDDEN, "bad_pin");
    }
    let db = st.db();
    let folder = match db.folder_public(&id) {
        Ok(Some(f)) => f,
        Ok(None) => return error(StatusCode::NOT_FOUND, "folder_not_found"),
        Err(e) => return db_error(e),
    };
    let characters = match db.list_folder_characters_full(&id) {
        Ok(c) => c,
        Err(e) => return db_error(e),
    };
    let creatures = match db.list_creatures(&id) {
        Ok(c) => c,
        Err(e) => return db_error(e),
    };
    Json(json!({ "folder": folder, "characters": characters, "creatures": creatures })).into_response()
}

/// Criaturas da cena desta pasta. Só o Mestre.
async fn list_creatures(State(st): State<Shared>, Path(id): Path<String>, headers: HeaderMap) -> Response {
    if !st.pins.is_master(header_pin(&headers).as_deref()) {
        return error(StatusCode::FORBIDDEN, "bad_pin");
    }
    match st.db().list_creatures(&id) {
        Ok(creatures) => Json(json!({ "creatures": creatures })).into_response(),
        Err(e) => db_error(e),
    }
}

/// Cria uma criatura simples da cena (nome, PV e CA). Só o Mestre.
async fn create_creature(
    State(st): State<Shared>,
    Path(id): Path<String>,
    headers: HeaderMap,
    body: Result<Json<Value>, JsonRejection>,
) -> Response {
    if !st.pins.is_master(header_pin(&headers).as_deref()) {
        return error(StatusCode::FORBIDDEN, "bad_pin");
    }
    let body = match body {
        Ok(Json(b)) => b,
        Err(rej) => return json_body_error(rej),
    };
    let (name, _, hp_max, ac, note) = creature_fields(&body);
    let Some(name) = name else { return error(StatusCode::BAD_REQUEST, "bad_request") };
    let hp = hp_max.unwrap_or(1).clamp(1, 100_000);
    let ac = ac.unwrap_or(10).clamp(0, 100);

    let creature = {
        let db = st.db();
        match db.get_folder(&id) {
            Ok(Some(_)) => {}
            Ok(None) => return error(StatusCode::NOT_FOUND, "folder_not_found"),
            Err(e) => return db_error(e),
        }
        match db.insert_creature(&id, &name, hp, ac, note.as_deref()) {
            Ok(c) => c,
            Err(e) => return db_error(e),
        }
    };
    st.publish_in(Some(id), "creature", json!({ "creature": creature }));
    (StatusCode::CREATED, Json(json!({ "creature": creature }))).into_response()
}

/// Atualiza a criatura. Ao chegar a 0 PV ela sai do hub sozinha — morreu, sumiu.
async fn update_creature(
    State(st): State<Shared>,
    Path((id, creature_id)): Path<(String, String)>,
    headers: HeaderMap,
    body: Result<Json<Value>, JsonRejection>,
) -> Response {
    if !st.pins.is_master(header_pin(&headers).as_deref()) {
        return error(StatusCode::FORBIDDEN, "bad_pin");
    }
    let body = match body {
        Ok(Json(b)) => b,
        Err(rej) => return json_body_error(rej),
    };
    let (name, hp_current, hp_max, ac, note) = creature_fields(&body);
    let updated = {
        let db = st.db();
        match db.update_creature(&id, &creature_id, name.as_deref(), hp_current, hp_max, ac, note.as_deref()) {
            Ok(Some(c)) => c,
            Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
            Err(e) => return db_error(e),
        }
    };
    if updated.get("hpCurrent").and_then(Value::as_i64).unwrap_or(0) <= 0 {
        if let Err(e) = st.db().delete_creature(&id, &creature_id) {
            return db_error(e);
        }
        st.publish_in(Some(id), "creature-deleted", json!({ "id": creature_id }));
        return Json(json!({ "creature": Value::Null, "removed": true })).into_response();
    }
    st.publish_in(Some(id), "creature", json!({ "creature": updated }));
    Json(json!({ "creature": updated, "removed": false })).into_response()
}

async fn delete_creature(
    State(st): State<Shared>,
    Path((id, creature_id)): Path<(String, String)>,
    headers: HeaderMap,
) -> Response {
    if !st.pins.is_master(header_pin(&headers).as_deref()) {
        return error(StatusCode::FORBIDDEN, "bad_pin");
    }
    match st.db().delete_creature(&id, &creature_id) {
        Ok(true) => {}
        Ok(false) => return error(StatusCode::NOT_FOUND, "not_found"),
        Err(e) => return db_error(e),
    }
    st.publish_in(Some(id), "creature-deleted", json!({ "id": creature_id }));
    Json(json!({ "ok": true })).into_response()
}

// === Chave mestra e homebrew ===

/// Confere a chave mestra (tela do Mestre). Não devolve nada além de ok.
async fn master_check(State(st): State<Shared>, headers: HeaderMap) -> Response {
    if st.pins.is_master(header_pin(&headers).as_deref()) {
        Json(json!({ "ok": true })).into_response()
    } else {
        error(StatusCode::FORBIDDEN, "bad_pin")
    }
}

/// `data` válido de um item homebrew: objeto com `name` não vazio (guardado aparado).
fn homebrew_data(body: &Value) -> Option<(Value, String)> {
    let mut data = body.get("data").filter(|d| d.is_object())?.clone();
    let name = data
        .get("name")
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|n| !n.is_empty())?
        .to_string();
    data["name"] = Value::String(name.clone());
    Some((data, name))
}

async fn list_homebrew(State(st): State<Shared>) -> Response {
    if let Some(cached) = st.homebrew_cache.lock().unwrap_or_else(|e| e.into_inner()).clone() {
        return json_bytes(cached);
    }
    let items = match st.db().list_homebrew() {
        Ok(l) => l,
        Err(e) => return db_error(e),
    };
    let bytes = Bytes::from(serde_json::to_vec(&json!({ "items": items })).unwrap());
    *st.homebrew_cache.lock().unwrap_or_else(|e| e.into_inner()) = Some(bytes.clone());
    json_bytes(bytes)
}

async fn create_homebrew(
    State(st): State<Shared>,
    headers: HeaderMap,
    body: Result<Json<Value>, JsonRejection>,
) -> Response {
    if !st.pins.is_master(header_pin(&headers).as_deref()) {
        return error(StatusCode::FORBIDDEN, "bad_pin");
    }
    let body = match body {
        Ok(Json(b)) => b,
        Err(rej) => return json_body_error(rej),
    };
    let kind = body.get("kind").and_then(Value::as_str).unwrap_or_default();
    if !HOMEBREW_KINDS.contains(&kind) {
        return error(StatusCode::BAD_REQUEST, "bad_kind");
    }
    let Some((data, name)) = homebrew_data(&body) else {
        return error(StatusCode::BAD_REQUEST, "bad_request");
    };
    let item = {
        let db = st.db();
        match db.homebrew_name_taken(kind, &name, None) {
            Ok(true) => return error(StatusCode::CONFLICT, "name_taken"),
            Ok(false) => {}
            Err(e) => return db_error(e),
        }
        match db.insert_homebrew(kind, &data) {
            Ok(item) => item,
            Err(e) => return db_error(e),
        }
    };
    st.invalidate_homebrew();
    st.publish("homebrew", json!({ "item": item }));
    (StatusCode::CREATED, Json(json!({ "item": item }))).into_response()
}

async fn update_homebrew(
    State(st): State<Shared>,
    Path(id): Path<String>,
    headers: HeaderMap,
    body: Result<Json<Value>, JsonRejection>,
) -> Response {
    if !st.pins.is_master(header_pin(&headers).as_deref()) {
        return error(StatusCode::FORBIDDEN, "bad_pin");
    }
    let body = match body {
        Ok(Json(b)) => b,
        Err(rej) => return json_body_error(rej),
    };
    let Some((data, name)) = homebrew_data(&body) else {
        return error(StatusCode::BAD_REQUEST, "bad_request");
    };
    let item = {
        let db = st.db();
        let kind = match db.homebrew_kind(&id) {
            Ok(Some(k)) => k,
            Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
            Err(e) => return db_error(e),
        };
        match db.homebrew_name_taken(&kind, &name, Some(&id)) {
            Ok(true) => return error(StatusCode::CONFLICT, "name_taken"),
            Ok(false) => {}
            Err(e) => return db_error(e),
        }
        match db.update_homebrew(&id, &data) {
            Ok(Some(item)) => item,
            Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
            Err(e) => return db_error(e),
        }
    };
    st.invalidate_homebrew();
    st.publish("homebrew", json!({ "item": item }));
    Json(json!({ "item": item })).into_response()
}

async fn delete_homebrew(
    State(st): State<Shared>,
    Path(id): Path<String>,
    headers: HeaderMap,
) -> Response {
    if !st.pins.is_master(header_pin(&headers).as_deref()) {
        return error(StatusCode::FORBIDDEN, "bad_pin");
    }
    let removed = match st.db().delete_homebrew(&id) {
        Ok(r) => r,
        Err(e) => return db_error(e),
    };
    if !removed {
        return error(StatusCode::NOT_FOUND, "not_found");
    }
    st.invalidate_homebrew();
    st.publish("homebrew-deleted", json!({ "id": id }));
    Json(json!({ "ok": true })).into_response()
}

// === Rolagens ===

/// Confere se o PIN dá acesso de membro à pasta. `Err` já é a resposta de erro.
fn require_folder_member(st: &AppState, db: &Db, folder_id: &str, pin: Option<&str>) -> Result<(), Response> {
    let folder = match db.get_folder(folder_id) {
        Ok(Some(f)) => f,
        Ok(None) => return Err(error(StatusCode::NOT_FOUND, "not_found")),
        Err(e) => return Err(db_error(e)),
    };
    match st.pins.folder_member(db, &folder, pin) {
        Ok(true) => Ok(()),
        Ok(false) => Err(error(StatusCode::FORBIDDEN, "bad_pin")),
        Err(e) => Err(db_error(e)),
    }
}

/// `?folder=<id>`: a mesa da pasta (senha dela, PIN de uma ficha dela ou chave mestra).
/// Sem pasta: tudo, só para o Mestre.
async fn list_rolls(
    State(st): State<Shared>,
    Query(q): Query<HashMap<String, String>>,
    headers: HeaderMap,
) -> Response {
    let limit = q
        .get("limit")
        .and_then(|s| s.parse::<i64>().ok())
        .unwrap_or(50)
        .clamp(1, 200);
    let pin = header_pin(&headers);
    let db = st.db();
    let rolls = match q.get("folder").filter(|f| !f.is_empty()) {
        Some(folder_id) => {
            if let Err(res) = require_folder_member(&st, &db, folder_id, pin.as_deref()) {
                return res;
            }
            db.list_folder_rolls(folder_id, limit)
        }
        None => {
            if !st.pins.is_master(pin.as_deref()) {
                return error(StatusCode::FORBIDDEN, "bad_pin");
            }
            db.list_rolls(limit)
        }
    };
    match rolls {
        Ok(rolls) => Json(json!({ "rolls": rolls })).into_response(),
        Err(e) => db_error(e),
    }
}

/// Rolar em nome de uma ficha exige o PIN dela (ou a chave mestra); rolagem
/// avulsa, sem ficha, é coisa de Mestre. O histórico é podado, então POST aberto
/// também era um jeito de apagar a mesa dos outros.
async fn post_roll(
    State(st): State<Shared>,
    headers: HeaderMap,
    body: Result<Json<Value>, JsonRejection>,
) -> Response {
    let Ok(Json(body)) = body else { return error(StatusCode::BAD_REQUEST, "bad_json") };
    let roll = body.get("roll").cloned().unwrap_or(Value::Null);
    if !roll.get("id").map(Value::is_string).unwrap_or(false) {
        return error(StatusCode::BAD_REQUEST, "bad_request");
    }
    let mut roll: DiceRoll = match serde_json::from_value(roll) {
        Ok(r) => r,
        Err(_) => return error(StatusCode::BAD_REQUEST, "bad_request"),
    };
    let pin = header_pin(&headers);

    let folder = {
        let db = st.db();
        match roll.character_id.as_deref() {
            Some(id) => match db.get_stored(id) {
                Ok(Some(stored)) => {
                    if !st.pins.ok(&stored, pin.as_deref()) {
                        return error(StatusCode::FORBIDDEN, "bad_pin");
                    }
                    // O nome exibido vem do servidor: ninguém rola fingindo ser outro.
                    roll.character_name = stored
                        .get("characterName")
                        .and_then(Value::as_str)
                        .map(str::to_string);
                    folder_of(&stored)
                }
                Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
                Err(e) => return db_error(e),
            },
            None => {
                if !st.pins.is_master(pin.as_deref()) {
                    return error(StatusCode::FORBIDDEN, "bad_pin");
                }
                None
            }
        }
    };

    if let Err(e) = st.db().insert_roll(&roll) {
        return db_error(e);
    }
    st.publish_in(folder, "roll", json!({ "roll": roll }));
    Json(json!({ "roll": roll })).into_response()
}

/// Limpar o histórico de uma ficha exige o PIN dela; limpar a mesa de uma pasta
/// (`?folder=`) exige ser membro dela (o PIN de qualquer ficha da pasta serve — sempre
/// foi ação de jogador); limpar tudo, de todas as pastas, só o Mestre.
async fn delete_rolls(
    State(st): State<Shared>,
    Query(q): Query<HashMap<String, String>>,
    headers: HeaderMap,
) -> Response {
    let pin = header_pin(&headers);
    let character_id = q.get("characterId").filter(|s| !s.is_empty()).cloned();
    let folder_id = q.get("folder").filter(|s| !s.is_empty()).cloned();

    let (removed, scope) = {
        let db = st.db();
        if let Some(id) = character_id.as_deref() {
            let stored = match db.get_stored(id) {
                Ok(Some(stored)) => stored,
                Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
                Err(e) => return db_error(e),
            };
            if !st.pins.ok(&stored, pin.as_deref()) {
                return error(StatusCode::FORBIDDEN, "bad_pin");
            }
            (db.clear_rolls(Some(id)), folder_of(&stored))
        } else if let Some(folder) = folder_id.as_deref() {
            if let Err(res) = require_folder_member(&st, &db, folder, pin.as_deref()) {
                return res;
            }
            (db.clear_folder_rolls(folder), folder_id.clone())
        } else {
            if !st.pins.is_master(pin.as_deref()) {
                return error(StatusCode::FORBIDDEN, "bad_pin");
            }
            (db.clear_rolls(None), None)
        }
    };
    let removed = match removed {
        Ok(n) => n,
        Err(e) => return db_error(e),
    };
    st.publish_in(
        scope,
        "rolls-cleared",
        json!({ "characterId": character_id, "folderId": folder_id }),
    );
    Json(json!({ "ok": true, "removed": removed })).into_response()
}

// === Server-Sent Events ===

/// `?folder=<id>&pin=<credencial>` inscreve nos eventos da pasta (fichas, rolagens);
/// eventos globais (pastas, homebrew) chegam para todos. EventSource não manda
/// header, por isso a credencial vai na query. Credencial inválida = só globais.
async fn events(State(st): State<Shared>, Query(q): Query<HashMap<String, String>>) -> Response {
    let scope = q.get("folder").filter(|f| !f.is_empty()).and_then(|id| {
        let db = st.db();
        let folder = db.get_folder(id).ok().flatten()?;
        let pin = q.get("pin").map(String::as_str);
        st.pins.folder_member(&db, &folder, pin).unwrap_or(false).then_some(folder.id)
    });

    let rx = st.tx.subscribe();
    let hello = tokio_stream::once(Ok::<Event, Infallible>(
        Event::default()
            .event("hello")
            .data(json!({ "ok": true, "folder": scope }).to_string()),
    ));
    let updates = BroadcastStream::new(rx)
        .filter_map(move |r| {
            let m: Arc<Msg> = r.ok()?; // cliente lento perdeu eventos: segue a vida
            match &m.folder {
                Some(f) if scope.as_deref() != Some(f.as_str()) => None,
                _ => Some(m),
            }
        })
        .map(|m: Arc<Msg>| {
            Ok::<Event, Infallible>(Event::default().event(m.event).data(&m.data))
        });

    let mut res = Sse::new(hello.chain(updates))
        .keep_alive(KeepAlive::new().interval(Duration::from_secs(25)).text("ping"))
        .into_response();
    let h = res.headers_mut();
    h.insert(header::CACHE_CONTROL, "no-cache, no-transform".parse().unwrap());
    h.insert("x-accel-buffering", "no".parse().unwrap()); // nginx: sem buffering
    res
}

async fn health() -> Response {
    Json(json!({ "ok": true })).into_response()
}

// === Bootstrap ===

/// TcpListener que liga TCP_NODELAY em cada conexão aceita (latência mínima no SSE).
struct NoDelay(tokio::net::TcpListener);

impl axum::serve::Listener for NoDelay {
    type Io = tokio::net::TcpStream;
    type Addr = std::net::SocketAddr;

    async fn accept(&mut self) -> (Self::Io, Self::Addr) {
        loop {
            match self.0.accept().await {
                Ok((stream, addr)) => {
                    let _ = stream.set_nodelay(true);
                    return (stream, addr);
                }
                Err(_) => tokio::time::sleep(Duration::from_millis(50)).await,
            }
        }
    }

    fn local_addr(&self) -> std::io::Result<Self::Addr> {
        self.0.local_addr()
    }
}

fn bind_addr() -> String {
    if let Ok(b) = std::env::var("APP_DND_BIND") {
        return b;
    }
    let host = std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".into());
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".into());
    format!("{host}:{port}")
}

async fn shutdown_signal() {
    let ctrl_c = async {
        let _ = tokio::signal::ctrl_c().await;
    };
    #[cfg(unix)]
    let terminate = async {
        use tokio::signal::unix::{signal, SignalKind};
        if let Ok(mut s) = signal(SignalKind::terminate()) {
            s.recv().await;
        }
    };
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();
    tokio::select! { _ = ctrl_c => {}, _ = terminate => {} }
    eprintln!("[app-dnd] encerrando…");
}

#[tokio::main]
async fn main() {
    let db_path = std::env::var("APP_DND_DB").unwrap_or_else(|_| "./data/app-dnd.sqlite".into());
    let db = Db::open(&db_path, SEED_JSON).unwrap_or_else(|e| {
        eprintln!("[app-dnd] não consegui abrir o banco em {db_path}: {e}");
        std::process::exit(1);
    });
    let (tx, _) = broadcast::channel::<Arc<Msg>>(256);
    let state: Shared = Arc::new(AppState {
        db: Mutex::new(db),
        tx,
        pins: Pins::from_env(),
        folders_cache: Mutex::new(None),
        homebrew_cache: Mutex::new(None),
    });

    // Rotas JSON (com compressão); SSE fica fora da camada de compressão.
    let api = Router::new()
        .route("/api/characters", get(list_characters).post(create_character))
        .route(
            "/api/characters/{id}",
            get(get_character).patch(patch_character).delete(delete_character),
        )
        .route("/api/characters/{id}/summary", get(character_summary))
        // Limites por rota: a camada interna vence o limite geral de 8 MB lá de baixo.
        .route(
            "/api/characters/{id}/avatar",
            get(get_avatar)
                .put(put_avatar)
                .delete(delete_avatar)
                .layer(DefaultBodyLimit::max(AVATAR_LIMIT)),
        )
        .route("/api/folders", get(list_folders).post(create_folder))
        .route(
            "/api/folders/{id}",
            get(get_folder).put(update_folder).delete(delete_folder),
        )
        .route("/api/folders/{id}/hub", get(folder_hub))
        .route("/api/folders/{id}/creatures", get(list_creatures).post(create_creature))
        .route(
            "/api/folders/{id}/creatures/{creatureId}",
            patch(update_creature).delete(delete_creature),
        )
        .route(
            "/api/folders/{id}/avatar",
            get(get_folder_avatar)
                .put(put_folder_avatar)
                .delete(delete_folder_avatar)
                .layer(DefaultBodyLimit::max(AVATAR_LIMIT)),
        )
        .route(
            "/api/homebrew",
            get(list_homebrew)
                .post(create_homebrew)
                .layer(DefaultBodyLimit::max(HOMEBREW_LIMIT)),
        )
        .route(
            "/api/homebrew/{id}",
            put(update_homebrew)
                .delete(delete_homebrew)
                .layer(DefaultBodyLimit::max(HOMEBREW_LIMIT)),
        )
        .route("/api/master", post(master_check))
        .route("/api/rolls", get(list_rolls).post(post_roll).delete(delete_rolls))
        .route("/api/health", get(health))
        .layer(
            CompressionLayer::new()
                .br(true)
                .gzip(true)
                .quality(CompressionLevel::Precise(4)),
        )
        .layer(DefaultBodyLimit::max(8 * 1024 * 1024));

    let app = Router::new()
        .merge(api)
        .route("/api/events", get(events))
        .fallback(web::serve)
        .with_state(state);

    let addr = bind_addr();
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap_or_else(|e| {
        eprintln!("[app-dnd] não consegui escutar em {addr}: {e}");
        std::process::exit(1);
    });
    eprintln!(
        "[app-dnd] ouvindo em http://{addr}  (db: {db_path}, frontend embutido: {})",
        if web::has_index() { "sim" } else { "NÃO — rode `bun run build:web` antes do cargo build" }
    );
    axum::serve(NoDelay(listener), app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;

    fn map(v: Value) -> CharMap {
        v.as_object().unwrap().clone()
    }

    /// Ficha de jogador mínima, com o que as regras de edição olham.
    fn character() -> CharMap {
        map(json!({
            "id": "teste",
            "hpCurrent": 10,
            "hpMax": 20,
            "spellSlots": { "1": { "current": 2, "max": 3 } },
            "resources": [
                { "name": "Inspiração", "current": 1, "max": 0, "recharge": "none", "kind": "moeda", "masterOnly": true },
                { "name": "Fúria", "current": 2, "max": 3, "recharge": "long" }
            ],
            "sheet": {
                "classes": [{ "name": "Bárbaro", "level": 3 }],
                "abilityScores": { "str": 16, "dex": 14, "con": 14, "int": 8, "wis": 10, "cha": 10 },
                "skills": [{ "name": "Atletismo", "proficient": true }],
                "features": [],
                "advancement": [],
                "inventory": { "coins": { "gp": 0, "sp": 0, "cp": 0 }, "items": [] },
                "weapons": [],
                "proficiencyBonus": 2,
                "initiativeBonus": 2,
                "speed": 9,
                "saves": ["str"],
                "proficiencies": [],
                "languages": ["Comum"],
                "ac": 12,
                "acOverride": 15
            }
        }))
    }

    /// Patch que troca um campo do `sheet`, mantendo o resto igual.
    fn sheet_patch(current: &CharMap, key: &str, value: Value) -> CharMap {
        let mut sheet = current.get("sheet").unwrap().as_object().unwrap().clone();
        sheet.insert(key.into(), value);
        map(json!({ "sheet": sheet }))
    }

    #[test]
    fn player_may_change_current_state() {
        let c = character();
        assert_eq!(player_patch_violation(&c, &map(json!({ "hpCurrent": 3 }))), None);
        assert_eq!(player_patch_violation(&c, &map(json!({ "notes": "oi" }))), None);
        assert_eq!(
            player_patch_violation(&c, &map(json!({ "spellSlots": { "1": { "current": 0, "max": 3 } } }))),
            None
        );
    }

    #[test]
    fn player_may_not_cheat_the_numbers() {
        let c = character();
        assert_eq!(
            player_patch_violation(&c, &map(json!({ "hpMax": 200 }))),
            Some("master_only_hp_max")
        );
        assert_eq!(
            player_patch_violation(&c, &map(json!({ "spellSlots": { "1": { "current": 9, "max": 9 } } }))),
            Some("master_only_spell_slots")
        );
        assert_eq!(
            player_patch_violation(&c, &sheet_patch(&c, "classes", json!([{ "name": "Bárbaro", "level": 20 }]))),
            Some("master_only_sheet")
        );
        assert_eq!(
            player_patch_violation(
                &c,
                &sheet_patch(&c, "abilityScores", json!({ "str": 20, "dex": 14, "con": 14, "int": 8, "wis": 10, "cha": 10 }))
            ),
            Some("master_only_sheet")
        );
        assert_eq!(
            player_patch_violation(
                &c,
                &sheet_patch(&c, "inventory", json!({ "coins": { "gp": 9999, "sp": 0, "cp": 0 }, "items": [] }))
            ),
            Some("master_only_sheet")
        );
    }

    #[test]
    fn only_the_master_grants_inspiration() {
        let c = character();
        let spend = json!([
            { "name": "Inspiração", "current": 0, "max": 0, "recharge": "none", "kind": "moeda", "masterOnly": true },
            { "name": "Fúria", "current": 2, "max": 3, "recharge": "long" }
        ]);
        assert_eq!(player_patch_violation(&c, &map(json!({ "resources": spend }))), None);

        let grant = json!([
            { "name": "Inspiração", "current": 5, "max": 0, "recharge": "none", "kind": "moeda", "masterOnly": true },
            { "name": "Fúria", "current": 2, "max": 3, "recharge": "long" }
        ]);
        assert_eq!(
            player_patch_violation(&c, &map(json!({ "resources": grant }))),
            Some("master_only_resources")
        );

        let inflate = json!([
            { "name": "Inspiração", "current": 1, "max": 0, "recharge": "none", "kind": "moeda", "masterOnly": true },
            { "name": "Fúria", "current": 9, "max": 9, "recharge": "long" }
        ]);
        assert_eq!(
            player_patch_violation(&c, &map(json!({ "resources": inflate }))),
            Some("master_only_resources")
        );
    }

    #[test]
    fn player_equips_armor_and_picks_expertise() {
        let c = character();
        // Equipar: muda o slot, espelha a CA e desfaz a CA manual.
        let mut sheet = c.get("sheet").unwrap().as_object().unwrap().clone();
        sheet.insert("equippedArmor".into(), json!("Couro"));
        sheet.insert("acOverride".into(), Value::Null);
        sheet.insert("ac".into(), json!(13));
        assert_eq!(player_patch_violation(&c, &map(json!({ "sheet": sheet }))), None);

        // Especialização: as proficiências continuam as mesmas, só o `expert` muda.
        let expert = sheet_patch(&c, "skills", json!([{ "name": "Atletismo", "proficient": true, "expert": true }]));
        assert_eq!(player_patch_violation(&c, &expert), None);

        // Ganhar uma perícia nova sem subir de nível, não.
        let extra = sheet_patch(
            &c,
            "skills",
            json!([
                { "name": "Atletismo", "proficient": true },
                { "name": "Furtividade", "proficient": true }
            ]),
        );
        assert_eq!(player_patch_violation(&c, &extra), Some("master_only_sheet"));
    }

    #[test]
    fn player_may_not_set_manual_ac() {
        let c = character();
        assert_eq!(
            player_patch_violation(&c, &sheet_patch(&c, "acOverride", json!(30))),
            Some("master_only_sheet")
        );
    }

    #[test]
    fn advancement_unlocks_the_progression_fields() {
        let c = character();
        let mut sheet = c.get("sheet").unwrap().as_object().unwrap().clone();
        sheet.insert("advancement".into(), json!([{ "className": "Bárbaro", "level": 4, "kind": "asi", "abilities": { "str": 2 } }]));
        sheet.insert("abilityScores".into(), json!({ "str": 18, "dex": 14, "con": 14, "int": 8, "wis": 10, "cha": 10 }));
        assert_eq!(player_patch_violation(&c, &map(json!({ "sheet": sheet }))), None);
    }
}
