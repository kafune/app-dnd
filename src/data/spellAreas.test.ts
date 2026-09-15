import { describe, expect, test } from "bun:test";
import { SPELLS_CATALOG, findSpell } from "./spellsCatalog";
import { FEATURE_AREAS, SPELL_AREAS, areaCategory, featureAreasOf, parseRangeMeters, spellAreaOf } from "./spellAreas";
import { CLASS_DEFS } from "./classesCatalog";
import { RACES_CATALOG } from "./racesCatalog";

describe("áreas das magias", () => {
  test("toda magia anotada existe no catálogo, com o nome exato", () => {
    const missing = Object.keys(SPELL_AREAS).filter((name) => !findSpell(name));
    expect(missing).toEqual([]);
  });

  test("toda área tem as dimensões da própria forma", () => {
    for (const [name, area] of Object.entries(SPELL_AREAS)) {
      const has = (k: "radius" | "length" | "width" | "side") => typeof area[k] === "number" && area[k]! > 0;
      switch (area.kind) {
        case "esfera":
        case "cilindro":
          expect(has("radius"), name).toBe(true);
          break;
        case "cubo":
        case "quadrado":
          expect(has("side"), name).toBe(true);
          break;
        case "cone":
          expect(has("length"), name).toBe(true);
          break;
        case "linha":
          expect(has("length") && has("width"), name).toBe(true);
          break;
      }
      if (area.adjustable) {
        expect(area.adjustable.max, name).toBeGreaterThanOrEqual(area.adjustable.min);
        expect(area[area.adjustable.dimension], name).toBeLessThanOrEqual(area.adjustable.max);
      }
    }
  });

  test("as áreas 'até X metros' ficam na categoria regulável", () => {
    expect(areaCategory(SPELL_AREAS["Muralha de Fogo"])).toBe("regulavel");
    expect(areaCategory(SPELL_AREAS["Consagrar"])).toBe("regulavel");
    expect(areaCategory(SPELL_AREAS["Bola de Fogo"])).toBe("fixa");
    expect(areaCategory(SPELL_AREAS["Cone de Frio"])).toBe("fixa");
  });

  test("magias 'Pessoal (cone …)' saem do conjurador; as de ponto têm alcance", () => {
    expect(SPELL_AREAS["Mãos Flamejantes"].origin).toBe("self");
    expect(SPELL_AREAS["Bola de Fogo"].origin).toBe("point");
    expect(parseRangeMeters(findSpell("Bola de Fogo")!.range)).toBe(45);
    expect(parseRangeMeters(findSpell("Mãos Flamejantes")!.range)).toBeNull();
    expect(parseRangeMeters("Toque")).toBeNull();
    expect(parseRangeMeters("Pessoal (raio de 4,5m)")).toBeNull();
  });

  test("todas as magias com cone/linha no alcance do catálogo estão anotadas", () => {
    const spells = SPELLS_CATALOG.filter((s) => /\b(cone|linha) de \d/i.test(s.range));
    const missing = spells.map((s) => s.name).filter((name) => !spellAreaOf(name));
    expect(missing).toEqual([]);
  });

  test("busca tolera caixa diferente", () => {
    expect(spellAreaOf("bola de fogo")).toBeDefined();
  });
});

describe("áreas das habilidades", () => {
  const featureNames = new Set<string>();
  for (const cls of CLASS_DEFS) {
    for (const f of cls.features) featureNames.add(f.name);
    for (const sub of cls.subclasses) for (const f of sub.features) featureNames.add(f.name);
  }
  for (const race of RACES_CATALOG) {
    for (const t of race.traits) featureNames.add(t.name);
    for (const sub of race.subraces) for (const t of sub.traits) featureNames.add(t.name);
  }

  test("toda habilidade anotada existe nos catálogos (exato ou como prefixo)", () => {
    const names = [...featureNames];
    const missing = FEATURE_AREAS.filter(
      (def) => !names.some((n) => n === def.match || n.startsWith(`${def.match} (`) || n.startsWith(`${def.match}:`)),
    ).map((def) => def.match);
    expect(missing).toEqual([]);
  });

  test("Sopro Dracônico vira cone ou linha conforme a cor do dragão", () => {
    const features = [{ name: "Arma de Sopro", origin: { name: "Draconato" } }];
    const red = featureAreasOf(features, ["Guerreiro"], { "Ancestral Dracônico": "Vermelho" });
    expect(red[0].area.kind).toBe("cone");
    const blue = featureAreasOf(features, ["Guerreiro"], { "Ancestral Dracônico": "Azul" });
    expect(blue[0].area.kind).toBe("linha");
  });

  test("Canalizar Divindade do Clérigo é Expulsar Mortos-Vivos; a opção nomeada não duplica", () => {
    const list = featureAreasOf(
      [
        { name: "Canalizar Divindade (1/descanso)", origin: { name: "Clérigo" } },
        { name: "Canalizar Divindade: Radiação do Amanhecer", origin: { name: "Domínio da Luz" } },
      ],
      ["Clérigo"],
    );
    expect(list.map((x) => x.label)).toEqual(["Expulsar Mortos-Vivos", "Radiação do Amanhecer"]);
  });
});
