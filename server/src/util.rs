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

#[cfg(test)]
mod tests {
    use super::*;

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
