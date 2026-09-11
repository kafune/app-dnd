//! Mesa Pankleos — servidor único (API JSON + Server-Sent Events + frontend embutido).
//!
//! Um binário, um arquivo SQLite, ~10 MB de RAM. Substitui o `next start` anterior
//! mantendo a MESMA API HTTP e o MESMO esquema de banco.
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
    routing::{get, post, put},
    Json, Router,
};
use bytes::Bytes;
use serde_json::{json, Value};
use tokio::sync::broadcast;
use tokio_stream::{wrappers::BroadcastStream, StreamExt};
use tower_http::compression::{CompressionLayer, CompressionLevel};

use db::{to_authorized, to_public, CharMap, Change, Db, DiceRoll};

const SEED_JSON: &str = include_str!("../seed.json");

/// Foto de perfil: o frontend manda ~40 KB (JPEG 384 px); 1 MB é folga de sobra.
const AVATAR_LIMIT: usize = 1024 * 1024;
/// Um item homebrew é um JSON pequeno (raça com traços, talento, traço).
const HOMEBREW_LIMIT: usize = 256 * 1024;
const HOMEBREW_KINDS: [&str; 3] = ["race", "feat", "trait"];

/// Evento já serializado, compartilhado entre todos os clientes SSE (serializa 1x).
pub struct Msg {
    event: &'static str,
    data: String,
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

    /// O PIN pertence a alguém da mesa (chave mestra, PIN fixo do seed ou PIN de
    /// uma ficha criada)? Usado nas ações que afetam a mesa inteira, onde não há
    /// uma ficha específica para conferir.
    fn any_member(&self, db: &Db, pin: Option<&str>) -> rusqlite::Result<bool> {
        if self.is_master(pin) {
            return Ok(true);
        }
        let Some(pin) = pin.map(str::trim).filter(|p| !p.is_empty()) else {
            return Ok(false);
        };
        if self.fixed.values().any(|p| p == pin) {
            return Ok(true);
        }
        db.pin_matches_any(pin)
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
    /// `GET /api/characters` já serializado; invalidado em qualquer escrita de ficha.
    public_cache: Mutex<Option<Bytes>>,
    /// `GET /api/homebrew` já serializado; invalidado em qualquer escrita de homebrew.
    homebrew_cache: Mutex<Option<Bytes>>,
}

impl AppState {
    fn db(&self) -> MutexGuard<'_, Db> {
        self.db.lock().unwrap_or_else(|e| e.into_inner())
    }

    fn publish(&self, event: &'static str, data: Value) {
        let _ = self.tx.send(Arc::new(Msg { event, data: data.to_string() }));
    }

    fn invalidate(&self) {
        *self.public_cache.lock().unwrap_or_else(|e| e.into_inner()) = None;
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

fn header_pin(headers: &HeaderMap) -> Option<String> {
    headers
        .get("x-character-pin")
        .and_then(|v| v.to_str().ok())
        .map(str::to_string)
}

// === Fichas ===

async fn list_characters(State(st): State<Shared>) -> Response {
    if let Some(cached) = st.public_cache.lock().unwrap_or_else(|e| e.into_inner()).clone() {
        return json_bytes(cached);
    }
    let list = match st.db().list_public() {
        Ok(l) => l,
        Err(e) => return db_error(e),
    };
    let bytes = Bytes::from(serde_json::to_vec(&json!({ "characters": list })).unwrap());
    *st.public_cache.lock().unwrap_or_else(|e| e.into_inner()) = Some(bytes.clone());
    json_bytes(bytes)
}

fn json_bytes(b: Bytes) -> Response {
    ([(header::CONTENT_TYPE, "application/json")], b).into_response()
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

async fn create_character(
    State(st): State<Shared>,
    body: Result<Json<Value>, JsonRejection>,
) -> Response {
    let Ok(Json(body)) = body else { return error(StatusCode::BAD_REQUEST, "bad_json") };
    let Some(payload) = body.get("character").and_then(Value::as_object) else {
        return error(StatusCode::BAD_REQUEST, "bad_request");
    };
    if !valid_payload(payload) {
        return error(StatusCode::BAD_REQUEST, "bad_request");
    }
    let mut c = payload.clone();
    c.remove("avatarVersion"); // gerenciado pelo servidor (rotas de foto)
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

    let saved = {
        let db = st.db();
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
        saved
    };

    st.invalidate();
    st.publish("character", json!({ "character": to_public(&saved) }));
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
        let by = if st.pins.is_master(pin.as_deref()) { "mestre" } else { "jogador" };
        match db.patch(&id, &safe, by) {
            Ok(Some(n)) => n,
            Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
            Err(e) => return db_error(e),
        }
    };

    st.invalidate();
    st.publish("character", json!({ "character": to_public(&next) }));
    Json(authorized(&st, next, pin.as_deref())).into_response()
}

async fn delete_character(
    State(st): State<Shared>,
    Path(id): Path<String>,
    headers: HeaderMap,
) -> Response {
    let pin = header_pin(&headers);
    {
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
    }
    st.invalidate();
    st.publish("character-deleted", json!({ "id": id }));
    Json(json!({ "ok": true })).into_response()
}

// === Fotos de perfil ===

/// Pública (o card da mesa mostra a foto). Com `?v=<versão>` a URL muda a cada
/// troca, então dá para cachear para sempre; sem `v`, revalida pelo ETag.
async fn get_avatar(
    State(st): State<Shared>,
    Path(id): Path<String>,
    Query(q): Query<HashMap<String, String>>,
    headers: HeaderMap,
) -> Response {
    let avatar = match st.db().get_avatar(&id) {
        Ok(Some(a)) => a,
        Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
        Err(e) => return db_error(e),
    };
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

fn body_error(status: StatusCode) -> Response {
    if status == StatusCode::PAYLOAD_TOO_LARGE {
        error(StatusCode::PAYLOAD_TOO_LARGE, "too_large")
    } else {
        error(StatusCode::BAD_REQUEST, "bad_request")
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
        let mime = headers
            .get(header::CONTENT_TYPE)
            .and_then(|v| v.to_str().ok())
            .and_then(|v| util::image_mime(v.split(';').next().unwrap_or("")));
        let Some(mime) = mime else {
            return error(StatusCode::UNSUPPORTED_MEDIA_TYPE, "bad_type");
        };
        if !util::sniff_image(mime, &body) {
            return error(StatusCode::BAD_REQUEST, "bad_image");
        }
        let by = if st.pins.is_master(pin.as_deref()) { "mestre" } else { "jogador" };
        match db.set_avatar(&id, mime, &body, by) {
            Ok(Some(n)) => n,
            Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
            Err(e) => return db_error(e),
        }
    };
    st.invalidate();
    st.publish("character", json!({ "character": to_public(&next) }));
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
        st.invalidate();
        st.publish("character", json!({ "character": to_public(&next) }));
    }
    Json(authorized(&st, next, pin.as_deref())).into_response()
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

fn json_body_error(rej: JsonRejection) -> Response {
    if rej.status() == StatusCode::PAYLOAD_TOO_LARGE {
        error(StatusCode::PAYLOAD_TOO_LARGE, "too_large")
    } else {
        error(StatusCode::BAD_REQUEST, "bad_json")
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

async fn list_rolls(
    State(st): State<Shared>,
    Query(q): Query<HashMap<String, String>>,
) -> Response {
    let limit = q
        .get("limit")
        .and_then(|s| s.parse::<i64>().ok())
        .unwrap_or(50)
        .clamp(1, 200);
    match st.db().list_rolls(limit) {
        Ok(rolls) => Json(json!({ "rolls": rolls })).into_response(),
        Err(e) => db_error(e),
    }
}

/// Rolar em nome de uma ficha exige o PIN dela (ou a chave mestra); rolagem
/// avulsa, sem ficha, é coisa de Mestre. O histórico guarda só as 200 mais
/// recentes, então POST aberto também era um jeito de apagar a mesa dos outros.
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

    {
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
                }
                Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
                Err(e) => return db_error(e),
            },
            None => {
                if !st.pins.is_master(pin.as_deref()) {
                    return error(StatusCode::FORBIDDEN, "bad_pin");
                }
            }
        }
    }

    if let Err(e) = st.db().insert_roll(&roll) {
        return db_error(e);
    }
    st.publish("roll", json!({ "roll": roll }));
    Json(json!({ "roll": roll })).into_response()
}

/// Limpar o histórico de uma ficha exige o PIN dela; limpar o da mesa inteira
/// exige um PIN válido de qualquer ficha da mesa (é destrutivo para todos, mas
/// sempre foi uma ação de jogador — não vamos trancar no Mestre).
async fn delete_rolls(
    State(st): State<Shared>,
    Query(q): Query<HashMap<String, String>>,
    headers: HeaderMap,
) -> Response {
    let pin = header_pin(&headers);
    let character_id = q.get("characterId").filter(|s| !s.is_empty()).cloned();

    {
        let db = st.db();
        let allowed = match character_id.as_deref() {
            Some(id) => match db.get_stored(id) {
                Ok(Some(stored)) => st.pins.ok(&stored, pin.as_deref()),
                Ok(None) => return error(StatusCode::NOT_FOUND, "not_found"),
                Err(e) => return db_error(e),
            },
            None => match st.pins.any_member(&db, pin.as_deref()) {
                Ok(v) => v,
                Err(e) => return db_error(e),
            },
        };
        if !allowed {
            return error(StatusCode::FORBIDDEN, "bad_pin");
        }
    }

    let removed = match st.db().clear_rolls(character_id.as_deref()) {
        Ok(n) => n,
        Err(e) => return db_error(e),
    };
    st.publish("rolls-cleared", json!({ "characterId": character_id }));
    Json(json!({ "ok": true, "removed": removed })).into_response()
}

// === Server-Sent Events ===

async fn events(State(st): State<Shared>) -> Response {
    let rx = st.tx.subscribe();
    let hello = tokio_stream::once(Ok::<Event, Infallible>(
        Event::default().event("hello").data("{\"ok\":true}"),
    ));
    let updates = BroadcastStream::new(rx)
        .filter_map(|r| r.ok()) // cliente lento perdeu eventos: segue a vida
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
        public_cache: Mutex::new(None),
        homebrew_cache: Mutex::new(None),
    });

    // Rotas JSON (com compressão); SSE fica fora da camada de compressão.
    let api = Router::new()
        .route("/api/characters", get(list_characters).post(create_character))
        .route(
            "/api/characters/{id}",
            get(get_character).patch(patch_character).delete(delete_character),
        )
        // Limites por rota: a camada interna vence o limite geral de 8 MB lá de baixo.
        .route(
            "/api/characters/{id}/avatar",
            get(get_avatar)
                .put(put_avatar)
                .delete(delete_avatar)
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
