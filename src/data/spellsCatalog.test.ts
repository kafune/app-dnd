import { describe, expect, test } from "bun:test";
import { SPELLS_CATALOG, findSpell, withCatalogData } from "./spellsCatalog";

/** Títulos em CAIXA ALTA de outras magias no meio de uma descrição = magias grudadas pelo OCR. */
const UPPER_TITLE = /\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{4,}(?: [A-ZÁÉÍÓÚÂÊÔÃÕÇ-]{2,})*\b/g;
/** Quadros com títulos legítimos em caixa alta (tabelas do próprio livro). */
const TABLE_TITLES = new Set(["ESTATÍSTICAS DE OBJETO ANIMADO", "PRECIPITAÇÃO", "TEMPERATURA", "VENTO"]);

describe("catálogo de magias", () => {
  test("nomes únicos e ordenados por círculo e nome", () => {
    const names = SPELLS_CATALOG.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
    const sorted = [...SPELLS_CATALOG].sort(
      (a, b) => a.level - b.level || (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0),
    );
    expect(sorted.map((s) => s.name)).toEqual(names);
  });

  test("nenhuma descrição carrega outra magia grudada ou lixo de página", () => {
    const upperNames = new Set(SPELLS_CATALOG.map((s) => s.name.toUpperCase()));
    const problems: string[] = [];
    for (const spell of SPELLS_CATALOG) {
      const titles = (spell.description.match(UPPER_TITLE) ?? []).filter((t) => !TABLE_TITLES.has(t));
      const glued = titles.filter((t) => upperNames.has(t) || t.split(" ").length > 1);
      if (glued.length) problems.push(`${spell.name}: ${glued.join(", ")}`);
      if (/CAPÍTULO|Miscelânea Mágica|~|\\/.test(spell.description)) problems.push(`${spell.name}: lixo do OCR`);
    }
    expect(problems).toEqual([]);
  });

  test("as magias do Xanathar que estavam grudadas em outras existem no círculo certo", () => {
    const expected: Record<string, number> = {
      "Tremor de Terra": 1,
      "Enfeitiçar Monstro": 4,
      "Esfera Tempestuosa": 4,
      "Imolação": 5,
      "Inundação de Energia Negativa": 5,
      "Ira da Natureza": 5,
      "Proteção Primordial": 6,
      "Gaiola da Alma": 6,
      "Vendaval": 7,
      "Evaporação de Abi-Dalzim": 8,
      "Invulnerabilidade": 9,
    };
    for (const [name, level] of Object.entries(expected)) {
      const spell = findSpell(name);
      expect(spell?.level, name).toBe(level);
      expect(spell?.source, name).toBe("XGtE");
      expect(spell?.classes.length, name).toBeGreaterThan(0);
    }
    expect(findSpell("Tremor de Terra")!.description).not.toContain("vendaval");
    expect(findSpell("Invulnerabilidade")!.description).toBe("Você é imune a todo tipo de dano até a magia terminar.");
  });

  test("Invocar Prole Sombria é de 3º círculo, com concentração", () => {
    const spell = findSpell("Invocar Prole Sombria")!;
    expect(spell.level).toBe(3);
    expect(spell.concentration).toBe(true);
  });

  test("o espaço de magia de 'círculos superiores' é sempre acima do círculo da magia", () => {
    const wrong: string[] = [];
    for (const spell of SPELLS_CATALOG) {
      for (const m of spell.description.matchAll(/espaço d[el]{1,2}e? magia d[eo] (\d)\s*[°ºo]?\s*(?:n[íi]vel|c[íi]rculo)/g)) {
        if (Number(m[1]) <= spell.level) wrong.push(`${spell.name}: ${m[0]}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  test("concentração no cabeçalho bate com a duração", () => {
    const wrong = SPELLS_CATALOG.filter(
      (s) => s.concentration !== /^concentra/i.test(s.duration.trim()),
    ).map((s) => s.name);
    expect(wrong).toEqual([]);
  });
});

describe("magias guardadas na ficha", () => {
  test("usam o texto e o círculo atuais do catálogo, mantendo o que é da ficha", () => {
    const stale = {
      name: "Invocar Prole Sombria",
      level: 8,
      school: "Conjuração",
      castingTime: "1 Ação",
      range: "18m",
      components: "V",
      duration: "1 hora",
      description: "texto antigo",
      prepared: true,
      classSource: "Mago",
    };
    const fresh = withCatalogData(stale);
    expect(fresh.level).toBe(3);
    expect(fresh.description).toBe(findSpell("Invocar Prole Sombria")!.description);
    expect(fresh.prepared).toBe(true);
    expect(fresh.classSource).toBe("Mago");
  });

  test("magia homebrew fica como está", () => {
    const homebrew = { name: "Raio do Mestre", level: 2, school: "Evocação", castingTime: "1 ação", range: "9 m", components: "V", duration: "Instantânea", description: "caseira" };
    expect(withCatalogData(homebrew)).toBe(homebrew);
  });
});
