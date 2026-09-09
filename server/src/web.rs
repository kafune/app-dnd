//! Frontend embutido no binário (pasta `dist/` gerada pelo Vite). Serve direto da
//! memória, com variantes pré-comprimidas (`.br` / `.gz`), ETag e cache imutável
//! para os assets com hash no nome. Rotas desconhecidas caem no `index.html` (SPA).

use axum::{
    body::Body,
    http::{header, HeaderMap, HeaderValue, StatusCode, Uri},
    response::{IntoResponse, Response},
};
use rust_embed::{EmbeddedFile, RustEmbed};

#[derive(RustEmbed)]
#[folder = "../dist/"]
struct Assets;

pub async fn serve(uri: Uri, headers: HeaderMap) -> Response {
    let mut path = uri.path().trim_start_matches('/').to_string();
    if path.is_empty() {
        path = "index.html".into();
    }

    // Nunca sirva as variantes comprimidas "cruas" nem o index de rotas /api.
    if path.starts_with("api/") || path.ends_with(".br") || path.ends_with(".gz") {
        return StatusCode::NOT_FOUND.into_response();
    }

    let mut file = Assets::get(&path);
    if file.is_none() {
        // Rota do SPA (sem extensão): entrega o index.html e o React resolve.
        let last = path.rsplit('/').next().unwrap_or("");
        if !last.contains('.') {
            path = "index.html".into();
            file = Assets::get(&path);
        }
    }
    let Some(file) = file else {
        return (StatusCode::NOT_FOUND, "não encontrado").into_response();
    };

    let etag = etag_for(&file);
    if headers
        .get(header::IF_NONE_MATCH)
        .and_then(|v| v.to_str().ok())
        .map(|v| v.split(',').any(|t| t.trim() == etag))
        .unwrap_or(false)
    {
        return StatusCode::NOT_MODIFIED.into_response();
    }

    let mime = mime_guess::from_path(&path).first_or_octet_stream();
    let accept = headers
        .get(header::ACCEPT_ENCODING)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    let (data, encoding) = if accepts(accept, "br") && Assets::get(&format!("{path}.br")).is_some() {
        (Assets::get(&format!("{path}.br")).unwrap().data, Some("br"))
    } else if accepts(accept, "gzip") && Assets::get(&format!("{path}.gz")).is_some() {
        (Assets::get(&format!("{path}.gz")).unwrap().data, Some("gzip"))
    } else {
        (file.data, None)
    };

    let cache = if path.starts_with("assets/") {
        "public, max-age=31536000, immutable"
    } else {
        "no-cache"
    };

    let mut res = Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, mime.as_ref())
        .header(header::CACHE_CONTROL, cache)
        .header(header::ETAG, etag)
        .header(header::VARY, "Accept-Encoding")
        .header("x-content-type-options", "nosniff");
    if let Some(enc) = encoding {
        res = res.header(header::CONTENT_ENCODING, enc);
    }
    res.body(Body::from(data)).unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response())
}

fn accepts(header: &str, enc: &str) -> bool {
    header.split(',').any(|part| {
        let mut it = part.trim().splitn(2, ';');
        let name = it.next().unwrap_or("").trim();
        let q_zero = it.next().map(|q| q.trim() == "q=0").unwrap_or(false);
        name == enc && !q_zero
    })
}

fn etag_for(file: &EmbeddedFile) -> String {
    let hash = file.metadata.sha256_hash();
    let mut s = String::with_capacity(20);
    s.push('"');
    for b in &hash[..8] {
        s.push_str(&format!("{b:02x}"));
    }
    s.push('"');
    s
}

#[allow(dead_code)]
pub fn has_index() -> bool {
    Assets::get("index.html").is_some()
}

#[allow(dead_code)]
pub fn _unused(_: HeaderValue) {}
