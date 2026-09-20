import { describe, expect, test } from "bun:test";
import { gerarEscolhas } from "../../scripts/export-feature-choices";
import { ESCOLHAS_HABILIDADES } from "@/data/featureChoicesCatalog";
import { findSpell } from "@/data/spellsCatalog";
import { buildCharacter, emptyDraft, emptyClass } from "./createCharacter";
import {
  applyAsiDecision, applyClassChange, caracteristicasComEscolhas, classFeaturesFor,
  escolhasHabilidadesDisponiveis, escolhasHabilidadesPendentes, featFeature,
  impedimentoOpcaoHabilidade, magiasComEscolhas, normalizarEscolhasHabilidades,
  type ContextoEscolhasHabilidades,
} from "./progression";
import type { ClassEntry } from "./types";

function ficha(classes: ClassEntry[], escolhasHabilidades = {}, talentos: string[] = []): ContextoEscolhasHabilidades {
  return { classes, escolhasHabilidades, features: [...classFeaturesFor(classes), ...talentos.map((n) => featFeature(n, "Humano", 1))] };
}
const feiticeiro = (level: number, escolhas = {}, talentos: string[] = []) => ficha([{ name: "Feiticeiro", level }], escolhas, talentos);

describe("escolhas de habilidades", () => {
  test("catálogo compartilhado com Rust continua fiel aos livros locais", () => {
    expect(gerarEscolhas()).toEqual(ESCOLHAS_HABILIDADES);
    for (const r of ESCOLHAS_HABILIDADES) {
      expect(new Set(r.opcoes.map((o) => o.nome)).size).toBe(r.opcoes.length);
      expect(Math.max(...Object.values(r.niveis))).toBeLessThanOrEqual(r.opcoes.length - (r.fixas?.length ?? 0));
    }
    expect(ESCOLHAS_HABILIDADES.find((r) => r.id === "invocacoes")?.opcoes).toHaveLength(54);
  });

  test("os quatro pactos podem ser escolhidos sem exigir a si mesmos", () => {
    const bruxo = ficha([{ name: "Bruxo", level: 3 }]);
    const escolha = escolhasHabilidadesDisponiveis(bruxo).find((e) => e.id === "pacto")!;
    expect(escolha.opcoes).toHaveLength(4);
    for (const opcao of escolha.opcoes) {
      expect(opcao.pacto).toBeUndefined();
      expect(impedimentoOpcaoHabilidade(bruxo, escolha, opcao)).toBeNull();
      expect(normalizarEscolhasHabilidades({ ...bruxo, escolhasHabilidades: { pacto: [opcao.nome] } }).pacto).toEqual([opcao.nome]);
    }
    const invocacoes = escolhasHabilidadesDisponiveis(bruxo).find((e) => e.id === "invocacoes")!;
    expect(impedimentoOpcaoHabilidade(bruxo, invocacoes, invocacoes.opcoes.find((o) => o.nome === "Livro de Segredos Antigos")!)).toBe("Exige Pacto do Tomo.");
  });

  test("metamágica libera 2/3/4 opções nos níveis 3/10/17 da classe", () => {
    for (const [nivel, total] of [[1, 0], [2, 0], [3, 2], [9, 2], [10, 3], [16, 3], [17, 4], [20, 4]]) {
      expect(escolhasHabilidadesDisponiveis(feiticeiro(nivel)).find((e) => e.id === "metamagica")?.quantidade ?? 0).toBe(total);
    }
    expect(escolhasHabilidadesDisponiveis(ficha([{ name: "Feiticeiro", level: 2 }, { name: "Guerreiro", level: 10 }])).some((e) => e.id === "metamagica")).toBe(false);
  });

  test("ficha antiga pede escolhas e não apresenta todas como aprendidas", () => {
    const antiga = feiticeiro(3);
    expect(escolhasHabilidadesPendentes(antiga).map((e) => e.id)).toEqual(["metamagica"]);
    const texto = caracteristicasComEscolhas(antiga).find((f) => f.name === "Metamágica")!.description;
    expect(texto).toContain("Escolha pendente: 2");
    expect(texto).not.toContain("Magia Acelerada");
    const escolhida = feiticeiro(3, { metamagica: ["Magia Sutil", "Magia Acelerada"] });
    const selecionado = caracteristicasComEscolhas(escolhida).find((f) => f.name === "Metamágica")!.description;
    expect(selecionado).toContain("Magia Sutil (1 ponto)");
    expect(selecionado).toContain("Magia Acelerada (2 pontos)");
    expect(selecionado).not.toContain("Magia Duplicada");
    expect(escolhasHabilidadesPendentes(escolhida)).toEqual([]);
  });

  test("criação, subida, redução e remoção da classe preservam somente escolhas válidas", () => {
    const draft = { ...emptyDraft(), classes: [{ ...emptyClass(), name: "Feiticeiro", level: 3 }], escolhasHabilidades: { metamagica: ["Magia Sutil", "Magia Acelerada"] } };
    const criado = buildCharacter(draft, "teste");
    expect(criado.sheet.escolhasHabilidades).toEqual(draft.escolhasHabilidades);
    const subiu = applyClassChange(criado, [{ name: "Feiticeiro", level: 10 }]).character;
    expect(subiu.sheet.escolhasHabilidades).toEqual(draft.escolhasHabilidades);
    expect(escolhasHabilidadesPendentes(subiu.sheet)[0].quantidade).toBe(3);
    subiu.sheet.escolhasHabilidades!.metamagica.push("Magia Duplicada");
    expect(applyClassChange(subiu, [{ name: "Feiticeiro", level: 3 }]).character.sheet.escolhasHabilidades!.metamagica).toHaveLength(2);
    expect(applyClassChange(subiu, [{ name: "Feiticeiro", level: 2 }]).character.sheet.escolhasHabilidades).toEqual({});
  });

  test("talentos ganham escolhas inclusive depois de uma decisão de progressão", () => {
    const c = buildCharacter({ ...emptyDraft(), classes: [{ ...emptyClass(), name: "Feiticeiro", level: 4 }] }, "teste");
    const comTalento = applyAsiDecision(c, { className: "Feiticeiro", level: 4, kind: "feat", feat: "Adepto Metamágico" });
    expect(escolhasHabilidadesPendentes(comTalento.sheet).map((e) => [e.chave, e.quantidade])).toEqual([["metamagica", 2], ["adepto-metamagico:0", 2]]);
    for (const [talento, id, total] of [["Adepto Marcial", "adepto-marcial:0", 2], ["Adepto Místico", "adepto-mistico:0", 1], ["Iniciado em Combate", "iniciado-combate:0", 1]] as const) {
      expect(escolhasHabilidadesDisponiveis(feiticeiro(1, {}, [talento])).find((e) => e.chave === id)?.quantidade).toBe(total);
    }
  });

  test("opções não se repetem entre classe e talento nem entre estilos de multiclasse", () => {
    const contexto = feiticeiro(3, { metamagica: ["Magia Sutil"] }, ["Adepto Metamágico"]);
    const talento = escolhasHabilidadesDisponiveis(contexto).find((e) => e.talento)!;
    expect(impedimentoOpcaoHabilidade(contexto, talento, talento.opcoes.find((o) => o.nome === "Magia Sutil")!)).toContain("Já escolhida");
    expect(normalizarEscolhasHabilidades(feiticeiro(3, { metamagica: ["Magia Sutil", "Magia Sutil", "Inventada", "Magia Acelerada", "Magia Duplicada"] }))).toEqual({ metamagica: ["Magia Sutil", "Magia Acelerada"] });
    const multi = ficha([{ name: "Bardo", level: 3, subclass: "Colégio das Espadas" }, { name: "Guerreiro", level: 1 }], { "estilo-guerreiro": ["Duelismo"] });
    const espadas = escolhasHabilidadesDisponiveis(multi).find((e) => e.id === "estilo-espadas")!;
    expect(impedimentoOpcaoHabilidade(multi, espadas, espadas.opcoes[0])).toContain("Já escolhida");
  });

  test("runas e disciplinas respeitam pré-requisitos e concessão fixa", () => {
    expect(normalizarEscolhasHabilidades(ficha([{ name: "Guerreiro", level: 3, subclass: "Cavaleiro Rúnico" }], { runas: ["Runa da Colina", "Runa do Fogo"] }))).toEqual({ runas: ["Runa do Fogo"] });
    const monge = ficha([{ name: "Monge", level: 3, subclass: "Caminho dos Quatro Elementos" }], { disciplinas: ["Sintonia Elemental", "Chicote de Água"] });
    expect(normalizarEscolhasHabilidades(monge)).toEqual({ disciplinas: ["Chicote de Água"] });
    const texto = caracteristicasComEscolhas(monge).find((f) => f.name === "Discípulo dos Elementos")!.description;
    expect(texto).toContain("Sintonia Elemental.");
    expect(texto).not.toContain("Cavalgar o Vento (");
  });

  test("invocações verificam nível de Bruxo, pacto, magia e restrição do talento", () => {
    const escolhas = { pacto: ["Pacto da Lâmina"], invocacoes: ["Lâmina Sedenta", "Explosão Agonizante", "Armadura de Sombras"] };
    const bruxo = ficha([{ name: "Bruxo", level: 5 }], escolhas);
    expect(normalizarEscolhasHabilidades(bruxo).invocacoes).toEqual(["Lâmina Sedenta", "Armadura de Sombras"]);
    bruxo.spells = { cantrips: [findSpell("Rajada Mística")!], known: [], castingAbility: "cha", saveDC: 12, attackMod: 4 };
    expect(normalizarEscolhasHabilidades(bruxo).invocacoes).toHaveLength(3);
    const semBruxo = { ...feiticeiro(20, { "adepto-mistico:0": ["Explosão Agonizante"] }, ["Adepto Místico"]), spells: bruxo.spells };
    expect(normalizarEscolhasHabilidades(semBruxo)).toEqual({});
    expect(normalizarEscolhasHabilidades(ficha([{ name: "Bruxo", level: 3 }], escolhas)).invocacoes).toEqual(["Armadura de Sombras"]);
  });

  test("Caçador e totens usam escolhas independentes por marco; trocar subclasse remove escolhas", () => {
    const cacador = ficha([{ name: "Patrulheiro", level: 15, subclass: "Caçador" }]);
    expect(escolhasHabilidadesDisponiveis(cacador).filter((e) => e.subclasse === "Caçador").map((e) => e.quantidade)).toEqual([1, 1, 1, 1]);
    const totem = ficha([{ name: "Bárbaro", level: 14, subclass: "Caminho do Guerreiro Totêmico" }], { totem: ["Urso"], aspecto: ["Urso"], sintonia: ["Águia"] });
    expect(escolhasHabilidadesPendentes(totem)).toEqual([]);
    expect(normalizarEscolhasHabilidades({ ...totem, classes: [{ name: "Bárbaro", level: 14, subclass: "Caminho do Furioso" }] })).toEqual({});
  });

  test("Técnica Superior abre uma manobra e perde a escolha ao trocar o estilo", () => {
    const guerreiro = ficha([{ name: "Guerreiro", level: 1 }], { "estilo-guerreiro": ["Técnica Superior"], "tecnica-superior": ["Aparar"] });
    expect(escolhasHabilidadesPendentes(guerreiro)).toEqual([]);
    expect(normalizarEscolhasHabilidades({ ...guerreiro, escolhasHabilidades: { "estilo-guerreiro": ["Defesa"], "tecnica-superior": ["Aparar"] } })).toEqual({ "estilo-guerreiro": ["Defesa"] });
  });
  test("escolhas de truques e rituais entram na lista de magias, persistem e saem com a origem", () => {
    const criado = buildCharacter({ ...emptyDraft(), classes: [{ ...emptyClass(), name: "Paladino", level: 2 }], escolhasHabilidades: {
      "estilo-paladino": ["Guerreiro Abençoado"], "truques-abencoado": ["Orientação", "Chama Sagrada"],
    } }, "paladino");
    expect(escolhasHabilidadesPendentes(criado.sheet)).toEqual([]);
    expect(criado.sheet.spells.cantrips.map((m) => m.name)).toEqual(["Orientação", "Chama Sagrada"]);
    expect(criado.sheet.spells.cantrips.every((m) => m.casting?.ability === "cha" && m.granted?.startsWith("Escolha: "))).toBe(true);
    const subiu = applyClassChange(criado, [{ name: "Paladino", level: 4 }]).character;
    expect(subiu.sheet.spells.cantrips).toHaveLength(2);
    const decidiu = applyAsiDecision(subiu, { kind: "asi", className: "Paladino", level: 4, abilities: { str: 2 } });
    expect(decidiu.sheet.spells.cantrips).toHaveLength(2);
    expect(magiasComEscolhas({ ...criado.sheet, escolhasHabilidades: { "estilo-paladino": ["Defesa"] } }).cantrips).toEqual([]);
    const bruxo = buildCharacter({ ...emptyDraft(), classes: [{ ...emptyClass(), name: "Bruxo", level: 3 }], escolhasHabilidades: {
      pacto: ["Pacto do Tomo"], "truques-tomo": ["Rajada Mística", "Orientação", "Chama Sagrada"],
      invocacoes: ["Explosão Agonizante", "Livro de Segredos Antigos"], "rituais-segredos": ["Detectar Magia", "Compreender Idiomas"],
    } }, "bruxo");
    expect(escolhasHabilidadesPendentes(bruxo.sheet)).toEqual([]);
    expect(bruxo.sheet.spells.known).toHaveLength(2);
    expect(bruxo.sheet.spells.known.every((m) => m.casting?.free?.includes("ritual") && !m.casting.slots)).toBe(true);
  });

  test("ambiente da tempestade filtra também as características dos níveis seguintes", () => {
    const barbaro = ficha([{ name: "Bárbaro", level: 14, subclass: "Caminho do Arauto da Tempestade" }], { "aura-tempestade": ["Mar"] });
    for (const nome of ["Aura da Tempestade", "Alma da Tempestade", "Tempestade Furiosa"]) {
      const descricao = caracteristicasComEscolhas(barbaro).find((f) => f.name === nome)!.description;
      expect(descricao).toContain("Mar.");
      expect(descricao).not.toContain("Deserto.");
      expect(descricao).not.toContain("Tundra.");
    }
  });

  test("afinidade divina concede só a magia escolhida e as opções de uso não viram escolhas permanentes", () => {
    const criado = buildCharacter({ ...emptyDraft(), classes: [{ ...emptyClass(), name: "Feiticeiro", level: 1, subclass: "Alma Favorecida" }], escolhasHabilidades: { "afinidade-divina": ["Bem"] } }, "divino");
    expect(criado.sheet.spells.known.map((m) => m.name)).toEqual(["Curar Ferimentos"]);
    expect(escolhasHabilidadesDisponiveis(ficha([{ name: "Bárbaro", level: 3, subclass: "Trilha da Besta" }]))).toEqual([]);
    expect(escolhasHabilidadesDisponiveis(ficha([{ name: "Druida", level: 2, subclass: "Círculo das Estrelas" }]))).toEqual([]);
  });

});
