//! Validação das escolhas de habilidades. O catálogo é o mesmo usado pelo front.
use serde::Deserialize;
use serde_json::{Map, Value};
use std::collections::{HashMap, HashSet};
use std::sync::OnceLock;
use unicode_normalization::UnicodeNormalization;

#[derive(Deserialize)]
struct Opcao {
    nome: String,
    #[serde(rename = "concedeMagia")]
    concede_magia: Option<String>,
    nivel: Option<u64>,
    pacto: Option<String>,
    magia: Option<String>,
    #[serde(default)]
    maldicao: bool,
}
#[derive(Deserialize)]
struct Dependencia {
    grupo: String,
    nome: String,
}
#[derive(Deserialize)]
struct Regra {
    id: String,
    classe: Option<String>,
    subclasse: Option<String>,
    talento: Option<String>,
    grupo: String,
    niveis: HashMap<String, usize>,
    opcoes: Vec<Opcao>,
    #[serde(default)]
    fixas: Vec<String>,
    #[serde(rename = "exigeOpcao")]
    exige_opcao: Option<Dependencia>,
}
fn catalogo() -> &'static Vec<Regra> {
    static REGRAS: OnceLock<Vec<Regra>> = OnceLock::new();
    REGRAS.get_or_init(|| {
        serde_json::from_str(include_str!("../../src/data/featureChoicesCatalog.json"))
            .expect("catálogo de escolhas válido")
    })
}
fn texto<'a>(v: &'a Value, campo: &str) -> &'a str {
    v.get(campo).and_then(Value::as_str).unwrap_or("")
}
fn normalizar(s: &str) -> String {
    s.nfd()
        .filter(|c| !('\u{0300}'..='\u{036f}').contains(c))
        .collect::<String>()
        .trim()
        .to_lowercase()
}
fn lista<'a>(ficha: &'a Map<String, Value>, campo: &str) -> &'a [Value] {
    ficha
        .get(campo)
        .and_then(Value::as_array)
        .map(Vec::as_slice)
        .unwrap_or(&[])
}
fn tem_opcao(escolhas: &Map<String, Value>, grupo: &str, nome: &str) -> bool {
    catalogo().iter().filter(|r| r.grupo == grupo).any(|r| {
        escolhas.iter().any(|(chave, nomes)| {
            (chave == &r.id || chave.starts_with(&format!("{}:", r.id)))
                && nomes
                    .as_array()
                    .is_some_and(|ns| ns.iter().any(|n| n.as_str() == Some(nome)))
        })
    })
}

/// Não altera os campos de progressão protegidos; valida somente as seleções.
/// Ausência do campo é compatível com fichas antigas. Escolhas parciais não concedem opções extras.
pub fn validas(ficha: &Map<String, Value>) -> bool {
    let Some(valor) = ficha.get("escolhasHabilidades") else {
        return true;
    };
    let Some(escolhas) = valor.as_object() else {
        return false;
    };
    let classes = lista(ficha, "classes");
    let caracteristicas = lista(ficha, "features");
    let bruxo = classes
        .iter()
        .find(|c| normalizar(texto(c, "name")) == "bruxo");
    let nivel_bruxo = bruxo
        .and_then(|c| c.get("level"))
        .and_then(Value::as_u64)
        .unwrap_or(0);
    let magias: Vec<&Value> = ["cantrips", "known"]
        .iter()
        .flat_map(|campo| {
            ficha
                .get("spells")
                .and_then(|s| s.get(campo))
                .and_then(Value::as_array)
                .into_iter()
                .flatten()
        })
        .collect();
    let conhece = |nome: &str| {
        magias.iter().any(|m| {
            !texto(m, "granted").starts_with("Escolha: ")
                && normalizar(texto(m, "name")) == normalizar(nome)
        }) || catalogo().iter().any(|r| {
            r.opcoes.iter().any(|o| {
                o.concede_magia
                    .as_ref()
                    .is_some_and(|m| normalizar(m) == normalizar(nome))
                    && tem_opcao(escolhas, &r.grupo, &o.nome)
            })
        })
    };
    let mut vistas = HashSet::new();
    for (chave, valor) in escolhas {
        let Some(nomes) = valor.as_array() else {
            return false;
        };
        let Some(regra) = catalogo().iter().find(|r| {
            chave == &r.id || (r.talento.is_some() && chave.starts_with(&format!("{}:", r.id)))
        }) else {
            return false;
        };
        let classe = classes.iter().find(|c| {
            regra
                .classe
                .as_ref()
                .is_some_and(|nome| normalizar(texto(c, "name")) == normalizar(nome))
        });
        if regra.classe.is_some() && classe.is_none() {
            return false;
        }
        if let Some(subclasse) = &regra.subclasse {
            let atual = normalizar(texto(classe.unwrap(), "subclass"));
            let esperada = normalizar(subclasse);
            if atual.is_empty()
                || !(atual == esperada
                    || atual.starts_with(&esperada)
                    || esperada.starts_with(&atual)
                    || atual.contains(&esperada))
            {
                return false;
            }
        }
        if let Some(talento) = &regra.talento {
            let alguns: Vec<_> = caracteristicas
                .iter()
                .filter(|f| {
                    (f.get("origin").is_some_and(|o| texto(o, "kind") == "feat")
                        || normalizar(texto(f, "source")).starts_with("talento"))
                        && normalizar(texto(f, "name")) == normalizar(talento)
                })
                .collect();
            let Some(indice) = chave
                .strip_prefix(&format!("{}:", regra.id))
                .and_then(|s| s.parse::<usize>().ok())
            else {
                return false;
            };
            if indice >= alguns.len() || chave != &format!("{}:{indice}", regra.id) {
                return false;
            }
        }
        if let Some(dep) = &regra.exige_opcao {
            if !tem_opcao(escolhas, &dep.grupo, &dep.nome) {
                return false;
            }
        }
        let nivel = classe
            .and_then(|c| c.get("level"))
            .and_then(Value::as_u64)
            .unwrap_or(1);
        let quantidade = regra
            .niveis
            .iter()
            .filter_map(|(n, q)| {
                n.parse::<u64>()
                    .ok()
                    .filter(|n| *n <= nivel)
                    .map(|n| (n, *q))
            })
            .max_by_key(|(n, _)| *n)
            .map(|(_, q)| q)
            .unwrap_or(0);
        if quantidade == 0 || nomes.len() > quantidade {
            return false;
        }
        for nome in nomes {
            let Some(nome) = nome.as_str() else {
                return false;
            };
            let Some(opcao) = regra.opcoes.iter().find(|o| o.nome == nome) else {
                return false;
            };
            if regra.fixas.iter().any(|n| n == nome)
                || !vistas.insert((&regra.grupo, nome.to_owned()))
            {
                return false;
            }
            let nivel_requisito = if regra.grupo == "invocacoes" {
                nivel_bruxo
            } else {
                nivel
            };
            if opcao.nivel.is_some_and(|n| nivel_requisito < n) {
                return false;
            }
            if regra.talento.is_some()
                && regra.grupo == "invocacoes"
                && bruxo.is_none()
                && (opcao.nivel.is_some()
                    || opcao.pacto.is_some()
                    || opcao.magia.is_some()
                    || opcao.maldicao)
            {
                return false;
            }
            if opcao
                .pacto
                .as_ref()
                .is_some_and(|p| !tem_opcao(escolhas, "pacto", p))
            {
                return false;
            }
            if opcao.magia.as_ref().is_some_and(|m| !conhece(m)) {
                return false;
            }
            if opcao.maldicao
                && !conhece("Bruxaria")
                && !caracteristicas
                    .iter()
                    .any(|f| normalizar(texto(f, "name")) == "maldicao da lamina maldita")
                && !tem_opcao(escolhas, "invocacoes", "Sinal de Mau Agouro")
            {
                return false;
            }
        }
    }
    true
}

#[cfg(test)]
mod testes {
    use super::*;
    use serde_json::json;

    fn aceita(classe: &str, nivel: u64, subclasse: &str, escolhas: Value) -> bool {
        validas(json!({"classes": [{"name": classe, "level": nivel, "subclass": subclasse}], "features": [], "escolhasHabilidades": escolhas}).as_object().unwrap())
    }

    #[test]
    fn limites_de_metamagica_e_opcoes_inventadas() {
        assert!(aceita(
            "Feiticeiro",
            3,
            "",
            json!({"metamagica": ["Magia Sutil", "Magia Acelerada"]})
        ));
        assert!(!aceita(
            "Feiticeiro",
            2,
            "",
            json!({"metamagica": ["Magia Sutil"]})
        ));
        assert!(!aceita(
            "Feiticeiro",
            3,
            "",
            json!({"metamagica": ["Magia Sutil", "Magia Acelerada", "Magia Duplicada"]})
        ));
        assert!(aceita(
            "Feiticeiro",
            10,
            "",
            json!({"metamagica": ["Magia Sutil", "Magia Acelerada", "Magia Duplicada"]})
        ));
        assert!(!aceita(
            "Feiticeiro",
            3,
            "",
            json!({"metamagica": ["Magia Sutil", "Magia Sutil"]})
        ));
        assert!(!aceita(
            "Feiticeiro",
            3,
            "",
            json!({"metamagica": ["Invencibilidade"]})
        ));
        assert!(!aceita("Feiticeiro", 3, "", json!({"inventado": []})));
        assert!(!aceita(
            "Feiticeiro",
            3,
            "",
            json!({"adepto-metamagico:0": ["Magia Sutil"]})
        ));
        assert!(!aceita(
            "Feiticeiro",
            3,
            "",
            json!({"metamagica": "Magia Sutil"})
        ));
    }

    #[test]
    fn runas_disciplinas_e_subclasses() {
        assert!(aceita(
            "Guerreiro",
            3,
            "Cavaleiro Rúnico",
            json!({"runas": ["Runa do Fogo"]})
        ));
        assert!(!aceita(
            "Guerreiro",
            3,
            "Cavaleiro Rúnico",
            json!({"runas": ["Runa da Colina"]})
        ));
        assert!(aceita(
            "Guerreiro",
            7,
            "Cavaleiro Rúnico",
            json!({"runas": ["Runa da Colina"]})
        ));
        assert!(!aceita(
            "Guerreiro",
            7,
            "Campeão",
            json!({"runas": ["Runa do Fogo"]})
        ));
        assert!(!aceita(
            "Monge",
            3,
            "Caminho dos Quatro Elementos",
            json!({"disciplinas": ["Sintonia Elemental"]})
        ));
        assert!(!aceita(
            "Monge",
            3,
            "Caminho dos Quatro Elementos",
            json!({"disciplinas": ["Cavalgar o Vento"]})
        ));
        assert!(aceita(
            "Monge",
            11,
            "Caminho dos Quatro Elementos",
            json!({"disciplinas": ["Cavalgar o Vento"]})
        ));
    }

    #[test]
    fn pactos_nao_exigem_a_si_mesmos() {
        for nome in ["Pacto da Corrente", "Pacto da Lâmina", "Pacto do Tomo", "Pacto do Talismã"] {
            assert!(aceita("Bruxo", 3, "", json!({"pacto": [nome]})));
            assert!(!aceita("Bruxo", 2, "", json!({"pacto": [nome]})));
        }
    }

    #[test]
    fn pactos_invocacoes_e_escolhas_encadeadas() {
        assert!(!aceita(
            "Bruxo",
            5,
            "",
            json!({"invocacoes": ["Lâmina Sedenta"]})
        ));
        assert!(aceita(
            "Bruxo",
            5,
            "",
            json!({"pacto": ["Pacto da Lâmina"], "invocacoes": ["Lâmina Sedenta"]})
        ));
        assert!(!aceita(
            "Bruxo",
            3,
            "",
            json!({"pacto": ["Pacto da Lâmina"], "invocacoes": ["Lâmina Sedenta"]})
        ));
        assert!(!aceita(
            "Bruxo",
            5,
            "",
            json!({"invocacoes": ["Explosão Agonizante"]})
        ));
        assert!(aceita(
            "Bruxo",
            5,
            "",
            json!({"pacto": ["Pacto do Tomo"], "truques-tomo": ["Rajada Mística"], "invocacoes": ["Explosão Agonizante"]})
        ));
        assert!(!aceita(
            "Guerreiro",
            1,
            "",
            json!({"tecnica-superior": ["Aparar"]})
        ));
        assert!(aceita(
            "Guerreiro",
            1,
            "",
            json!({"estilo-guerreiro": ["Técnica Superior"], "tecnica-superior": ["Aparar"]})
        ));
    }

    #[test]
    fn talentos_nao_repetem_opcoes_da_classe() {
        let mut ficha = json!({
            "classes": [{"name": "Feiticeiro", "level": 3}],
            "features": [{"name": "Adepto Metamágico", "origin": {"kind": "feat"}}],
            "escolhasHabilidades": {"metamagica": ["Magia Sutil"], "adepto-metamagico:0": ["Magia Acelerada"]}
        });
        assert!(validas(ficha.as_object().unwrap()));
        ficha["escolhasHabilidades"]["adepto-metamagico:0"] = json!(["Magia Sutil"]);
        assert!(!validas(ficha.as_object().unwrap()));
        ficha["features"][0]["name"] = json!("Adepto Místico");
        ficha["escolhasHabilidades"] = json!({"adepto-mistico:0": ["Explosão Agonizante"]});
        ficha["spells"] = json!({"cantrips": [{"name": "Rajada Mística"}]});
        assert!(!validas(ficha.as_object().unwrap()));
        ficha["escolhasHabilidades"] = json!({"adepto-mistico:0": ["Armadura de Sombras"]});
        assert!(validas(ficha.as_object().unwrap()));
    }
}
