/** Exporta escolhas dos catálogos locais para o front e o servidor: bun scripts/export-feature-choices.ts. */
import { writeFileSync } from "node:fs";
import { CLASS_DEFS } from "../src/data/classesCatalog";
import { SPELLS_CATALOG } from "../src/data/spellsCatalog";
import { findFeat } from "../src/data/featsCatalog";

import type { OpcaoHabilidade as Opcao, RegraEscolhaHabilidade as RegraEscolha } from "../src/data/featureChoicesCatalog";

function caracteristica(classe: string, nome: string, subclasse?: string) {
  const def = CLASS_DEFS.find((c) => c.name === classe)!;
  const lista = subclasse ? def.subclasses.find((s) => s.name === subclasse)!.features : def.features;
  const f = lista.find((f) => f.name === nome);
  if (!f) throw new Error(`Característica ausente: ${classe} / ${subclasse} / ${nome}`);
  return f;
}

/** A extração ocorre ao autorar o catálogo, nunca sobre textos da ficha do jogador. */
function separar(descricao: string, primeira: string): { resumo: string; opcoes: Opcao[] } {
  const inicio = descricao.indexOf(primeira);
  if (inicio < 0) throw new Error(`Opção ausente: ${primeira}`);
  const resumo = descricao.slice(0, inicio).trim().replace(/\n(?:INVOCAÇÕES|MANOBRAS|OPÇÕES|Disciplinas)[^\n]*$/u, "");
  const linhas = descricao.slice(inicio).split("\n").filter((l) => !/^(INVOCAÇÕES|MANOBRAS|OPÇÕES)\b/u.test(l));
  const opcoes: Opcao[] = [];
  for (const linha of linhas) {
    const m = /^(?:• )?([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][^.!?]{0,170}?)\. (.*)$/u.exec(linha);
    if (!m || /^(Durante|Uma vez|Se |Você |Além)/u.test(linha)) {
      if (opcoes.length) opcoes[opcoes.length - 1].descricao += `\n${linha}`;
      continue;
    }
    const titulo = m[1];
    const nome = titulo.replace(/\s*\(.*$/u, "").trim();
    // O nome da opção não é um pré-requisito (ex.: Pacto da Lâmina).
    const requisitos = titulo.slice(nome.length);
    const nivel = /(?:pré-requisito: |\()(\d+)[°º] nível/u.exec(requisitos)?.[1];
    const pacto = /Pacto (?:da|do) (?:Corrente|Lâmina|Tomo|Talismã)/u.exec(requisitos)?.[0];
    opcoes.push({ nome, descricao: `${titulo}. ${m[2]}`, ...(nivel ? { nivel: Number(nivel) } : {}), ...(pacto ? { pacto } : {}), ...(/truque rajada mística/u.test(requisitos) ? { magia: "Rajada Mística" } : {}), ...(/magia bruxaria/u.test(requisitos) ? { maldicao: true } : {}) });
  }
  return { resumo, opcoes };
}

export function gerarEscolhas(): RegraEscolha[] {
  const regras: RegraEscolha[] = [];
  function adicionar(id: string, classe: string, nome: string, grupo: string, niveis: Record<string, number>, primeira: string, subclasse?: string): RegraEscolha {
    const f = caracteristica(classe, nome, subclasse);
    const regra = { id, classe, ...(subclasse ? { subclasse } : {}), caracteristica: nome, grupo, niveis, ...separar(f.description, primeira) };
    regras.push(regra);
    return regra;
  }
  const meta = adicionar("metamagica", "Feiticeiro", "Metamágica", "metamagica", { 3: 2, 10: 3, 17: 4 }, "Magia Acelerada (");
  // Pacto antes de invocações: pré-requisitos podem ser adquiridos junto com a escolha.
  adicionar("pacto", "Bruxo", "Dádiva do Pacto", "pacto", { 3: 1 }, "Pacto da Corrente.");
  const invocacoes = adicionar("invocacoes", "Bruxo", "Invocações Místicas", "invocacoes", { 2: 2, 5: 3, 7: 4, 9: 5, 12: 6, 15: 7, 18: 8 }, "Armadura de Sombras.");
  const estilos = adicionar("estilo-guerreiro", "Guerreiro", "Estilo de Luta", "estilos", { 1: 1 }, "Arquearia.");
  adicionar("estilo-paladino", "Paladino", "Estilo de Luta", "estilos", { 2: 1 }, "Combate com Armas Grandes.");
  adicionar("estilo-patrulheiro", "Patrulheiro", "Estilo de Luta", "estilos", { 2: 1 }, "Arquearia.");
  const espadas = adicionar("estilo-espadas", "Bardo", "Estilo de Luta", "estilos", { 3: 1 }, "Duelo.", "Colégio das Espadas");
  espadas.opcoes[0].nome = "Duelismo"; // mesmo estilo, tradução diferente no catálogo
  regras.push({ ...estilos, id: "estilo-campeao", subclasse: "Campeão", caracteristica: "Estilo de Luta Adicional", niveis: { 10: 1 } });
  const manobras = adicionar("manobras", "Guerreiro", "Superioridade em Combate", "manobras", { 3: 3, 7: 5, 10: 7, 15: 9 }, "Aparar.", "Mestre de Batalha");
  adicionar("disparos", "Guerreiro", "Disparo Arcano", "disparos", { 3: 2, 7: 3, 10: 4, 15: 5, 18: 6 }, "Flecha da Explosão.", "Arqueiro Arcano");
  adicionar("runas", "Guerreiro", "Entalhador de Runas", "runas", { 3: 2, 7: 3, 10: 4, 15: 5 }, "Runa da Nuvem.", "Cavaleiro Rúnico");
  const disciplinas = adicionar("disciplinas", "Monge", "Discípulo dos Elementos", "disciplinas", { 3: 1, 6: 2, 11: 3, 17: 4 }, "• Cavalgar o Vento", "Caminho dos Quatro Elementos");
  disciplinas.fixas = ["Sintonia Elemental"];
  for (const [id, nome, nivel] of [["totem", "Totem Espiritual", 3], ["aspecto", "Aspecto da Besta", 6], ["sintonia", "Sintonia Totêmica", 14]] as const)
    adicionar(id, "Bárbaro", nome, id, { [nivel]: 1 }, "Águia.", "Caminho do Guerreiro Totêmico");
  for (const [id, nome, nivel, primeira] of [["presa", "Presa do Caçador", 3, "Assassino de Colossos."], ["taticas", "Táticas Defensivas", 7, "Escapar da Horda."], ["ataque-cacador", "Ataque Múltiplo", 11, "Saraivada."], ["defesa-cacador", "Defesa de Caçador Superior", 15, "Evasão."]] as const)
    adicionar(id, "Patrulheiro", nome, id, { [nivel]: 1 }, primeira, "Caçador");
  for (const [id, talento, origem, quantidade] of [["adepto-metamagico", "Adepto Metamágico", meta, 2], ["adepto-mistico", "Adepto Místico", invocacoes, 1], ["adepto-marcial", "Adepto Marcial", manobras, 2], ["iniciado-combate", "Iniciado em Combate", estilos, 1]] as const) {
    const feat = findFeat(talento);
    if (!feat) throw new Error(`Talento ausente: ${talento}`);
    regras.push({ id, talento, caracteristica: talento, grupo: origem.grupo, niveis: { 1: quantidade }, resumo: feat.description, opcoes: origem.opcoes });
  }
  regras.push({ id: "tecnica-superior", caracteristica: "Técnica Superior", grupo: "manobras", niveis: { 1: 1 }, resumo: estilos.opcoes.find((o) => o.nome === "Técnica Superior")!.descricao, opcoes: manobras.opcoes, exigeOpcao: { grupo: "estilos", nome: "Técnica Superior" } });
  const elemental = findFeat("Adepto Elemental")!;
  regras.push({ id: "adepto-elemental", talento: elemental.name, caracteristica: elemental.name, grupo: "elemental", niveis: { 1: 1 }, resumo: elemental.description, opcoes: ["Ácido", "Elétrico", "Fogo", "Frio", "Trovão"].map((nome) => ({ nome, descricao: `Tipo de dano escolhido: ${nome.toLowerCase()}.` })) });
  const explorador = caracteristica("Patrulheiro", "Explorador Natural");
  regras.push({ id: "terrenos", classe: "Patrulheiro", caracteristica: explorador.name, grupo: "terrenos", niveis: { 1: 1, 6: 2, 10: 3 }, resumo: explorador.description.replace(/Escolha um tipo de terreno favorito: [^.]+\./u, ""), opcoes: ["Ártico", "Costa", "Deserto", "Floresta", "Pasto", "Montanha", "Pântano", "Subterrâneo"].map((nome) => ({ nome, descricao: `Terreno favorito: ${nome}.` })) });
  const ancestral = caracteristica("Feiticeiro", "Ancestral Dracônico", "Linhagem Dracônica");
  regras.push({ id: "ancestral", classe: "Feiticeiro", subclasse: "Linhagem Dracônica", caracteristica: ancestral.name, grupo: "ancestral", niveis: { 1: 1 }, resumo: ancestral.description.replace(/\n• [^\n]+/gu, ""), opcoes: [...ancestral.description.matchAll(/• ([^:]+): ([^\n]+)/gu)].map((m) => ({ nome: m[1], descricao: `Dragão ${m[1].toLowerCase()}: dano ${m[2]}.` })) });
  const aura = adicionar("aura-tempestade", "Bárbaro", "Aura da Tempestade", "aura-tempestade", { 3: 1 }, "Deserto.", "Caminho do Arauto da Tempestade");
  aura.dependentes = ["Alma da Tempestade", "Tempestade Furiosa"].map((nome) => ({ caracteristica: nome, ...separar(caracteristica("Bárbaro", nome, aura.subclasse).description, "Deserto.") }));
  const furia = caracteristica("Bárbaro", "Fúria Divina", "Caminho do Fanático");
  regras.push({ id: "furia-divina", classe: "Bárbaro", subclasse: "Caminho do Fanático", caracteristica: furia.name, grupo: "furia-divina", niveis: { 3: 1 }, resumo: furia.description, opcoes: ["Necrótico", "Radiante"].map((nome) => ({ nome, descricao: `Dano adicional da Fúria Divina: ${nome.toLowerCase()}.` })) });
  const divina = caracteristica("Feiticeiro", "Magia Divina", "Alma Favorecida");
  regras.push({ id: "afinidade-divina", classe: "Feiticeiro", subclasse: "Alma Favorecida", caracteristica: divina.name, grupo: "afinidade-divina", niveis: { 1: 1 }, resumo: divina.description.split("Além disso,")[0].trim() + "\nEscolha a afinidade de seu poder divino. A magia concedida não conta no limite de conhecidas.", conjuracao: { classe: "Feiticeiro", atributo: "cha" }, opcoes: [["Bem", "Curar Ferimentos"], ["Mal", "Infligir Ferimentos"], ["Ordem", "Bênção"], ["Caos", "Perdição"], ["Neutralidade", "Proteção contra o Bem e Mal"]].map(([nome, concedeMagia]) => ({ nome, concedeMagia, descricao: `${nome}: aprende ${concedeMagia}.` })) });
  for (const [id, grupo, nome, quantidade, lista, classe, atributo, ritual] of [
    ["truques-tomo", "pacto", "Pacto do Tomo", 3, null, "Bruxo", "cha", false],
    ["truques-abencoado", "estilos", "Guerreiro Abençoado", 2, "Clérigo", "Paladino", "cha", false],
    ["truques-druidico", "estilos", "Guerreiro Druídico", 2, "Druida", "Patrulheiro", "wis", false],
    ["rituais-segredos", "invocacoes", "Livro de Segredos Antigos", 2, null, "Bruxo", "cha", true],
  ] as const) {
    regras.push({ id, caracteristica: `${nome}: ${ritual ? "rituais iniciais" : "truques"}`, grupo: id, niveis: { 1: quantidade }, resumo: `Escolha ${quantidade} ${ritual ? "magias de 1º círculo com o descritor ritual. Estas magias só podem ser conjuradas como rituais por esta característica" : `truques${lista ? ` de ${lista}` : " de qualquer classe"}`}. Não contam no limite de magias conhecidas da classe.`, exigeOpcao: { grupo, nome }, conjuracao: { classe, atributo, ...(ritual ? { ritual: true } : {}) }, opcoes: SPELLS_CATALOG.filter((m) => m.level === (ritual ? 1 : 0) && (!ritual || m.ritual) && (!lista || m.classes.includes(lista))).map((m) => ({ nome: m.name, descricao: m.description, concedeMagia: m.name })) });
  }
  return regras;
}

if (import.meta.main) {
  const regras = gerarEscolhas();
  writeFileSync(new URL("../src/data/featureChoicesCatalog.json", import.meta.url), JSON.stringify(regras, null, 2) + "\n");
  console.log(`${regras.length} regras de escolha exportadas.`);
}
