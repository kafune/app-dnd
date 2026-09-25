import { describe, expect, test } from "bun:test";
import { allRaces } from "@/data/racesCatalog";
import { resolveRace } from "@/data/racesCatalog";
import { allFeats } from "@/data/featsCatalog";
import { CLASS_DEFS } from "@/data/classesCatalog";
import { buildCharacter, emptyDraft, type CharacterDraft } from "./createCharacter";
import {
  applyAsiDecision,
  applyClassChange,
  classResourcesFor,
  featFeature,
  featResourcesFor,
  missingResources,
  raceResourcesFor,
  sameResourceName,
} from "./progression";
import type { Character, ClassEntry } from "./types";

const scores = { str: 10, dex: 14, con: 14, int: 10, wis: 12, cha: 10 };

function draft(over: Partial<CharacterDraft> & { race: string; subrace?: string; level?: number }): CharacterDraft {
  const race = resolveRace(over.race, over.subrace)!;
  return {
    ...emptyDraft(),
    playerName: "Jogador",
    characterName: "Teste",
    pin: "1234",
    raceName: race.race.name,
    ...(over.subrace ? { subraceName: over.subrace } : {}),
    raceBonuses: race.fixedBonuses,
    raceTraits: race.traits,
    classes: [
      {
        name: "Guerreiro",
        level: over.level ?? 1,
        hitDie: "d10",
        saves: ["str", "con"],
        proficiencies: [],
      },
    ],
    ...over,
  };
}

const names = (c: Pick<Character, "resources">) => c.resources.map((r) => r.name);

describe("recursos raciais de usos limitados", () => {
  test("Shadar-Kai ganha a Bênção da Rainha Corvo (1 uso por descanso longo)", () => {
    const c = buildCharacter(draft({ race: "Elfo", subrace: "Shadar-Kai" }), "sk");
    const blessing = c.resources.find((r) => r.name === "Bênção da Rainha Corvo");
    expect(blessing).toMatchObject({ current: 1, max: 1, recharge: "long", description: "Elfo: Bênção da Rainha Corvo" });
  });

  test("traços com recarga no descanso curto viram recurso", () => {
    expect(names(buildCharacter(draft({ race: "Draconato" }), "d"))).toContain("Arma de Sopro");
    expect(names(buildCharacter(draft({ race: "Goblin" }), "g"))).toContain("Fúria dos Pequenos");
    const firbolg = buildCharacter(draft({ race: "Firbolg" }), "f");
    expect(names(firbolg)).toEqual(
      expect.arrayContaining(["Passo Oculto", "Detectar Magia (Magia Firbolg)", "Disfarçar-se (Magia Firbolg)"]),
    );
    expect(firbolg.resources.find((r) => r.name === "Passo Oculto")?.recharge).toBe("short");
  });

  test("recurso 'a partir do 3º nível' só aparece no nível certo e entra ao subir", () => {
    const traits = resolveRace("Tiefling")!.traits;
    const at = (level: number) => raceResourcesFor(traits, level, scores, "Tiefling").map((r) => r.name);
    expect(at(1)).toEqual([]);
    expect(at(3)).toEqual(["Repreensão Infernal (Legado Infernal)"]);
    expect(at(5)).toEqual(["Repreensão Infernal (Legado Infernal)", "Escuridão (Legado Infernal)"]);

    const aasimar = buildCharacter(draft({ race: "Aasimar", subrace: "Aasimar Protetor", level: 2 }), "a");
    expect(names(aasimar)).toContain("Mãos Curandeiras");
    expect(names(aasimar)).not.toContain("Alma Radiante");
    const up: ClassEntry[] = [{ ...aasimar.sheet.classes[0], level: 3 }];
    const leveled = applyClassChange(aasimar, up).character;
    expect(leveled.resources.find((r) => r.name === "Alma Radiante")).toMatchObject({ current: 1, max: 1 });
    // e sai de novo se o nível cair
    const down = applyClassChange(leveled, [{ ...up[0], level: 2 }]).character;
    expect(names(down)).not.toContain("Alma Radiante");
  });

  test("recurso racial removido à mão pelo Mestre não volta num recálculo de nível", () => {
    const c = buildCharacter(draft({ race: "Elfo", subrace: "Shadar-Kai", level: 2 }), "sk");
    const removed = { ...c, resources: c.resources.filter((r) => r.name !== "Bênção da Rainha Corvo") };
    const next = applyClassChange(removed, [{ ...c.sheet.classes[0], level: 3 }]).character;
    expect(names(next)).not.toContain("Bênção da Rainha Corvo");
  });

  test("todo traço com recurso gera um recurso com nome e máximo ≥ 1 no nível 20", () => {
    for (const race of allRaces()) {
      for (const sub of [undefined, ...(race.subraces ?? []).map((s) => s.name)]) {
        const resolved = resolveRace(race.name, sub)!;
        for (const r of raceResourcesFor(resolved.traits, 20, scores, race.name)) {
          expect(r.name.trim()).not.toBe("");
          expect(r.max).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });
});

describe("recursos de talentos", () => {
  test("Sortudo dá 3 pontos de sorte por descanso longo", () => {
    const res = featResourcesFor([featFeature("Sortudo", "Guerreiro", 4)], 4, scores);
    expect(res).toEqual([
      { name: "Pontos de Sorte", current: 3, max: 3, recharge: "long", description: "Talento: Sortudo" },
    ]);
  });

  test("talento com duas magias grátis vira dois recursos; Chef escala com proficiência", () => {
    expect(featResourcesFor([featFeature("Tocado pelas Fadas", "Mago", 4)], 4, scores).map((r) => r.name)).toEqual([
      "Passo Nebuloso (Tocado pelas Fadas)",
      "Magia de 1º círculo (Tocado pelas Fadas)",
    ]);
    expect(featResourcesFor([featFeature("Chef", "Guerreiro", 4)], 9, scores)[0].max).toBe(4);
  });

  test("talento da criação (Humano variante) entra nos recursos da ficha", () => {
    const c = buildCharacter(draft({ race: "Humano", subrace: "Humano Variante", raceFeat: "Sortudo" }), "h");
    expect(c.resources.find((r) => r.name === "Pontos de Sorte")).toMatchObject({ current: 3, max: 3 });
  });

  test("todo talento com recurso gera recurso válido", () => {
    for (const feat of allFeats()) {
      for (const r of featResourcesFor([featFeature(feat.name, "Guerreiro", 4)], 20, scores)) {
        expect(r.max).toBeGreaterThanOrEqual(1);
        expect(r.description).toBe(`Talento: ${feat.name}`);
      }
    }
  });
});

describe("recursos de classe que faltavam", () => {
  test("Iluminação Curativa = 1 + nível de bruxo em d6", () => {
    const res = classResourcesFor([{ name: "Bruxo", subclass: "O Celestial", level: 5 }], scores);
    expect(res.find((r) => r.name === "Iluminação Curativa (d6)")?.max).toBe(6);
  });

  test("nenhuma classe gera dois recursos que são o mesmo (ex.: Inspiração de Bardo)", () => {
    for (const cls of CLASS_DEFS) {
      for (const sub of [undefined, ...cls.subclasses.map((s) => s.name)]) {
        for (const level of [1, 5, 10, 20]) {
          const res = classResourcesFor([{ name: cls.name, subclass: sub, level }], scores);
          const dupes = res.filter((r, i) => res.some((o, j) => j < i && sameResourceName(o.name, r.name)));
          expect(dupes).toEqual([]);
        }
      }
    }
    const bard = classResourcesFor([{ name: "Bardo", level: 5 }], scores);
    expect(bard.filter((r) => r.name.startsWith("Inspiração de Bardo"))).toEqual([
      { name: "Inspiração de Bardo", current: 1, max: 1, recharge: "short", description: "Bardo: Fonte de Inspiração" },
    ]);
  });
});

describe("missingResources", () => {
  test("ficha completa não tem nada faltando", () => {
    const c = buildCharacter(draft({ race: "Elfo", subrace: "Shadar-Kai" }), "sk");
    expect(missingResources(c)).toEqual([]);
  });

  test("ficha antiga sem o recurso da raça: aponta o que falta, cheio", () => {
    const c = buildCharacter(draft({ race: "Elfo", subrace: "Shadar-Kai" }), "sk");
    const old = { ...c, resources: c.resources.filter((r) => r.name !== "Bênção da Rainha Corvo") };
    expect(missingResources(old)).toEqual([
      { name: "Bênção da Rainha Corvo", current: 1, max: 1, recharge: "long", description: "Elfo: Bênção da Rainha Corvo" },
    ]);
  });

  test("talento escolhido depois pelo jogador aparece como faltando", () => {
    const c = buildCharacter(draft({ race: "Humano", level: 4 }), "h");
    const withFeat = applyAsiDecision(c, { className: "Guerreiro", level: 4, kind: "feat", feat: "Sortudo" });
    // o caminho do jogador não mexe na lista de recursos (o servidor recusaria)
    expect(withFeat.resources).toEqual(c.resources);
    expect(missingResources(withFeat).map((r) => r.name)).toEqual(["Pontos de Sorte"]);
  });

  test("apelidos antigos contam como o mesmo recurso", () => {
    expect(sameResourceName("Graça da Rainha Corvo", "Bênção da Rainha Corvo")).toBe(true);
    expect(sameResourceName("Canalização Divina", "Canalizar Divindade")).toBe(true);
    expect(sameResourceName("Cura pelas Mãos (pool)", "Cura pelas Mãos (PV)")).toBe(true);
    expect(sameResourceName("Cura pelas Mãos", "Cura pelas Mãos (PV)")).toBe(true);
    expect(sameResourceName("Magia de 1º círculo (Iniciado em Magia)", "Magia de 1º círculo (Tocado pelas Fadas)")).toBe(false);

    const c = buildCharacter(draft({ race: "Elfo", subrace: "Shadar-Kai" }), "sk");
    const legacy = {
      ...c,
      resources: c.resources.map((r) => (r.name === "Bênção da Rainha Corvo" ? { ...r, name: "Graça da Rainha Corvo" } : r)),
    };
    expect(missingResources(legacy)).toEqual([]);
  });
});
