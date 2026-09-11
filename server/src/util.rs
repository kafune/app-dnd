//! Utilitários pequenos e sem dependências pesadas: timestamps ISO no formato do
//! JavaScript (`new Date().toISOString()`), slug de nomes e truncamento de texto.

use std::time::{SystemTime, UNIX_EPOCH};
use unicode_normalization::UnicodeNormalization;

/// Data/hora atual em UTC como `2026-09-09T18:42:11.123Z` (idêntico ao `toISOString()` do JS).
pub fn now_iso() -> String {
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default();
    let secs = now.as_secs() as i64;
    let millis = now.subsec_millis();
    let days = secs.div_euclid(86_400);
    let sod = secs.rem_euclid(86_400);
    let (y, m, d) = civil_from_days(days);
    format!(
        "{y:04}-{m:02}-{d:02}T{:02}:{:02}:{:02}.{millis:03}Z",
        sod / 3600,
        (sod % 3600) / 60,
        sod % 60
    )
}

/// Algoritmo de Howard Hinnant: dias desde 1970-01-01 -> (ano, mês, dia).
fn civil_from_days(z: i64) -> (i64, u32, u32) {
    let z = z + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z.rem_euclid(146_097);
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = (doy - (153 * mp + 2) / 5 + 1) as u32;
    let m = if mp < 10 { mp + 3 } else { mp - 9 } as u32;
    (if m <= 2 { y + 1 } else { y }, m, d)
}

/// Mesmo comportamento de `slugifyName` do frontend: remove acentos, minúsculas,
/// troca tudo que não é `[a-z0-9]` por `-`, apara as pontas e corta em 40 chars.
pub fn slugify(name: &str) -> String {
    let mut out = String::with_capacity(name.len());
    let mut last_dash = true; // evita '-' inicial
    for ch in name.nfd() {
        if ('\u{0300}'..='\u{036F}').contains(&ch) {
            continue; // marca combinante (acento)
        }
        let lower = ch.to_lowercase().next().unwrap_or(ch);
        if lower.is_ascii_alphanumeric() {
            out.push(lower);
            last_dash = false;
        } else if !last_dash {
            out.push('-');
            last_dash = true;
        }
    }
    while out.ends_with('-') {
        out.pop();
    }
    out.chars().take(40).collect::<String>().trim_end_matches('-').to_string()
}

/// Trunca texto para o log de modificações (40 chars, com reticências).
pub fn short(s: &str) -> String {
    if s.chars().count() > 40 {
        let mut t: String = s.chars().take(39).collect();
        t.push('…');
        t
    } else {
        s.to_string()
    }
}

/// Chave de comparação de nomes (homebrew): sem acentos, minúsculas e com os
/// espaços aparados/colapsados. "  Sháde  Revisada" == "shade revisada".
pub fn normalize_name(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for ch in s.nfd() {
        if ('\u{0300}'..='\u{036F}').contains(&ch) {
            continue;
        }
        out.extend(ch.to_lowercase());
    }
    out.split_whitespace().collect::<Vec<_>>().join(" ")
}

/// Tipo de imagem aceito para foto de perfil (forma canônica), ou `None`.
pub fn image_mime(raw: &str) -> Option<&'static str> {
    match raw.trim().to_ascii_lowercase().as_str() {
        "image/jpeg" => Some("image/jpeg"),
        "image/png" => Some("image/png"),
        "image/webp" => Some("image/webp"),
        _ => None,
    }
}

/// Os bytes batem com o tipo declarado? (assinatura mágica de JPEG/PNG/WEBP)
pub fn sniff_image(mime: &str, data: &[u8]) -> bool {
    match mime {
        "image/jpeg" => data.starts_with(&[0xFF, 0xD8, 0xFF]),
        "image/png" => data.starts_with(&[0x89, b'P', b'N', b'G', 0x0D, 0x0A, 0x1A, 0x0A]),
        "image/webp" => data.len() >= 12 && &data[..4] == b"RIFF" && &data[8..12] == b"WEBP",
        _ => false,
    }
}

/// Decodifica base64 (alfabeto padrão, com ou sem `=` no fim; ignora quebras de
/// linha). Qualquer caractere fora do alfabeto ou dado depois do padding => `None`.
pub fn base64_decode(input: &str) -> Option<Vec<u8>> {
    let mut out = Vec::with_capacity(input.len() / 4 * 3 + 3);
    let mut buf: u32 = 0;
    let mut bits: u32 = 0;
    let mut symbols = 0usize;
    let mut padding = 0usize;
    for &b in input.as_bytes() {
        let v = match b {
            b'A'..=b'Z' => b - b'A',
            b'a'..=b'z' => b - b'a' + 26,
            b'0'..=b'9' => b - b'0' + 52,
            b'+' => 62,
            b'/' => 63,
            b'=' => {
                padding += 1;
                continue;
            }
            b'\r' | b'\n' | b'\t' | b' ' => continue,
            _ => return None,
        };
        if padding > 0 {
            return None; // dado depois do padding
        }
        buf = (buf << 6) | u32::from(v);
        bits += 6;
        symbols += 1;
        if bits >= 8 {
            bits -= 8;
            out.push((buf >> bits) as u8);
            buf &= (1 << bits) - 1;
        }
    }
    if symbols % 4 == 1 || padding > 2 || (padding > 0 && (symbols + padding) % 4 != 0) {
        return None;
    }
    Some(out)
}

/// `data:image/png;base64,....` -> (tipo canônico, bytes), só se a assinatura bater.
pub fn parse_image_data_url(url: &str) -> Option<(&'static str, Vec<u8>)> {
    let rest = url.strip_prefix("data:")?;
    let (meta, payload) = rest.split_once(',')?;
    let mime_part = meta.to_ascii_lowercase();
    let mime = image_mime(mime_part.strip_suffix(";base64")?)?;
    let bytes = base64_decode(payload)?;
    sniff_image(mime, &bytes).then_some((mime, bytes))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn base64_standard_vectors() {
        assert_eq!(base64_decode("").unwrap(), b"");
        assert_eq!(base64_decode("Zg==").unwrap(), b"f");
        assert_eq!(base64_decode("Zm8=").unwrap(), b"fo");
        assert_eq!(base64_decode("Zm9v").unwrap(), b"foo");
        assert_eq!(base64_decode("Zm9vYmFy").unwrap(), b"foobar");
        assert_eq!(base64_decode("aGVsbG8").unwrap(), b"hello", "sem padding");
        assert_eq!(base64_decode("aGVs\nbG8=").unwrap(), b"hello", "ignora quebra de linha");
        assert_eq!(base64_decode("+/8=").unwrap(), [0xFB, 0xFF]);
    }

    #[test]
    fn base64_rejects_garbage() {
        assert!(base64_decode("aGV$bG8=").is_none(), "caractere fora do alfabeto");
        assert!(base64_decode("Zg=a").is_none(), "dado depois do padding");
        assert!(base64_decode("Z").is_none(), "tamanho impossível");
        assert!(base64_decode("Zg===").is_none(), "padding demais");
        assert!(base64_decode("Zm9vYg=").is_none(), "padding incompleto");
        assert!(base64_decode("=Zm9v").is_none(), "padding no começo");
        assert!(base64_decode("aGVsbG8-").is_none(), "alfabeto url-safe não é aceito");
    }

    #[test]
    fn image_data_urls() {
        let png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
        let (mime, bytes) = parse_image_data_url(png).unwrap();
        assert_eq!(mime, "image/png");
        assert!(sniff_image("image/png", &bytes));
        assert!(!sniff_image("image/jpeg", &bytes));
        assert!(parse_image_data_url("data:image/gif;base64,R0lGODlh").is_none(), "tipo não aceito");
        assert!(parse_image_data_url("data:image/jpeg;base64,iVBORw0KGgo=").is_none(), "assinatura errada");
        assert!(parse_image_data_url("https://exemplo.com/a.png").is_none());
        assert!(sniff_image("image/webp", b"RIFF\0\0\0\0WEBPVP8 "));
        assert_eq!(image_mime(" Image/PNG "), Some("image/png"));
        assert_eq!(image_mime("text/plain"), None);
    }

    #[test]
    fn names_compare_loosely() {
        assert_eq!(normalize_name("  Sháde   Revisada "), "shade revisada");
        assert_eq!(normalize_name("MEIO-ORC"), normalize_name("meio-orc"));
    }

    #[test]
    fn slug_matches_frontend() {
        assert_eq!(slugify("Thorin Pedra-Forte"), "thorin-pedra-forte");
        assert_eq!(slugify("  Édson Ção!! "), "edson-cao");
        assert_eq!(slugify("***"), "");
    }

    #[test]
    fn iso_format() {
        let s = now_iso();
        assert_eq!(s.len(), 24);
        assert!(s.ends_with('Z'));
    }

    #[test]
    fn civil() {
        assert_eq!(civil_from_days(0), (1970, 1, 1));
        assert_eq!(civil_from_days(19_723), (2024, 1, 1));
    }
}
