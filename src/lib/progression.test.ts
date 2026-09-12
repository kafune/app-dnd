import { describe, expect, test } from "bun:test";
import { CLASS_DEFS, CLASSES_CATALOG } from "@/data/classesCatalog";
import { FEATS_CATALOG } from "@/data/featsCatalog";
import { ITEMS_CATALOG } from "@/data/itemsCatalog";
import { RACES_CATALOG } from "@/data/racesCatalog";
import { SPELLS_CATALOG } from "@/data/spellsCatalog";
import { STARTING_EQUIPMENT } from "@/data/startingEquipment";
import {
  applyAsiDecision,
  applyClassChange,
  classSpellCaps,
  clampClassLevels,
  expertiseBudget,
  featGrantedSpells,
  grantedSpellsFor,
  spellRoom,
  spellSlotsFor,
  totalLevelOf,
} from "./progression";
import { buildCharacter, emptyDraft, type CharacterDraft } from "./createCharacter";

const scores = { str: 10, dex: 14, con: 14, int: 16, wis: 16, cha: 16 } as const;

describe("catálogos de regras", () => {
  test("todas as classes têm progressão, subclasses e equipamento inicial", () => {
    expect(CLASS_DEFS).toHaveLength(12);
    for (const catalog of CLASSES_CATALOG) {
      const definition = CLASS_DEFS.find((entry) => entry.name === catalog.name);
      expect(definition, catalog.name).toBeDefined();
      expect(definition!.features.length, catalog.name).toBeGreaterThan(0);
      expect(definition!.subclasses.length, catalog.name).toBeGreaterThan(0);
      expect(STARTING_EQUIPMENT[catalog.name], catalog.name).toBeDefined();
      for (const feature of definition!.features) {
        expect(feature.description.trim().length, `${catalog.name}: ${feature.name}`).toBeGreaterThan(0);
        expect(feature.level).toBeGreaterThanOrEqual(1);
        expect(feature.level).toBeLessThanOrEqual(20);
      }
      for (const subclass of definition!.subclasses) {
        expect(subclass.description.trim().length, `${catalog.name}: ${subclass.name}`).toBeGreaterThan(0);
        expect(subclass.features.length, `${catalog.name}: ${subclass.name}`).toBeGreaterThan(0);
        for (const feature of subclass.features) {
          expect(feature.description.trim().length, `${subclass.name}: ${feature.name}`).toBeGreaterThan(0);
        }
      }
    }
  });

  test("talentos, raças, magias e itens não têm descrições vazias", () => {
    for (const feat of FEATS_CATALOG) expect(feat.description.trim().length, feat.name).toBeGreaterThan(0);
    for (const race of RACES_CATALOG) {
      expect(race.description.trim().length, race.name).toBeGreaterThan(0);
      for (const trait of [...race.traits, ...race.subraces.flatMap((subrace) => subrace.traits)]) {
        expect(trait.description.trim().length, `${race.name}: ${trait.name}`).toBeGreaterThan(0);
      }
    }
    for (const spell of SPELLS_CATALOG) {
      expect(spell.description.trim().length, spell.name).toBeGreaterThan(0);
      expect(spell.classes.length, spell.name).toBeGreaterThan(0);
      expect(spell.level).toBeGreaterThanOrEqual(0);
      expect(spell.level).toBeLessThanOrEqual(9);
    }
    for (const item of ITEMS_CATALOG) expect(item.detail.trim().length, item.name).toBeGreaterThan(0);
  });
});

describe("limites de progressão", () => {
  test("multiclasse nunca passa do nível total 20 para jogador", () => {
    const classes = clampClassLevels(
      [{ name: "Guerreiro", level: 15 }, { name: "Mago", level: 12 }],
      1,
    );
    expect(totalLevelOf(classes)).toBe(20);
    expect(classes[1].level).toBe(5);
  });

  test("limita magias pelo nível de cada classe", () => {
    expect(classSpellCaps({ name: "Mago", level: 3 }, scores)?.maxLevel).toBe(2);
    expect(classSpellCaps({ name: "Paladino", level: 3 }, scores)?.maxLevel).toBe(1);
    expect(classSpellCaps({ name: "Guerreiro", level: 3 }, scores)).toBeNull();
  });

  test("combina espaços de multiclasse e mantém pacto do Bruxo", () => {
    expect(spellSlotsFor([{ name: "Mago", level: 3 }, { name: "Clérigo", level: 2 }])["3"].max).toBe(2);
    expect(spellSlotsFor([{ name: "Bruxo", level: 3 }])).toEqual({ "2": { current: 2, max: 2 } });
  });
});

/** Ladino Trapaceiro Arcano de nível 3, o caso dos relatos de bug. */
function arcaneTrickster(level = 3): CharacterDraft {
  return {
    ...emptyDraft(),
    playerName: "Jogador",
    characterName: "Trapaça",
    pin: "1234",
    raceName: "Humano",
    classes: [
      {
        name: "Ladino",
        subclass: "Trapaceiro Arcano",
        level,
        hitDie: "d8",
        saves: ["dex", "int"],
        proficiencies: ["Armaduras leves", "Ferramentas de ladrão"],
      },
    ],
  };
}

describe("magias concedidas de graça", () => {
  test("Trapaceiro Arcano nasce com mãos mágicas fora do limite de truques", () => {
    const character = buildCharacter(arcaneTrickster(), "id");
    const maos = character.sheet.spells.cantrips.find((spell) => spell.name === "Mãos Mágicas");
    expect(maos?.granted).toBe("Trapaceiro Arcano");
    // 2 truques e 3 magias ainda por escolher: a concedida não ocupa vaga.
    expect(spellRoom(character.sheet.classes, character.sheet.abilityScores, character.sheet.spells.cantrips, character.sheet.spells.known))
      .toEqual({ cantrips: 2, spells: 3 });
  });

  test("subclasses que dão magias listam a concessão", () => {
    expect(grantedSpellsFor({ name: "Ladino", subclass: "Trapaceiro Arcano", level: 3 }).map((s) => s.name)).toEqual([
      "Mãos Mágicas",
    ]);
    expect(grantedSpellsFor({ name: "Mago", subclass: "Escola de Ilusão", level: 2 }).map((s) => s.name)).toEqual([
      "Ilusão Menor",
    ]);
    // Abaixo do nível da subclasse ainda não concede nada.
    expect(grantedSpellsFor({ name: "Ladino", subclass: "Trapaceiro Arcano", level: 2 })).toEqual([]);
  });

  test("talento concede as magias fixas e as escolhidas", () => {
    const spells = featGrantedSpells("Tocado pelas Sombras", ["Enfeitiçar Pessoa"]);
    expect(spells.map((s) => s.name)).toEqual(["Invisibilidade", "Enfeitiçar Pessoa"]);
    expect(spells.every((s) => s.granted === "Talento: Tocado pelas Sombras")).toBe(true);
  });

  test("as magias do talento entram na ficha e sobrevivem ao próximo nível", () => {
    const base = buildCharacter(arcaneTrickster(4), "id");
    const withFeat = applyAsiDecision(base, {
      className: "Ladino",
      level: 4,
      kind: "feat",
      feat: "Tocado pelas Sombras",
      abilities: { int: 1 },
      spells: ["Enfeitiçar Pessoa"],
    });
    const names = () => [...withFeat.sheet.spells.cantrips, ...withFeat.sheet.spells.known].map((s) => s.name);
    expect(names()).toContain("Invisibilidade");
    expect(names()).toContain("Enfeitiçar Pessoa");
    expect(names()).toContain("Mãos Mágicas"); // a da subclasse não some ao aplicar o talento

    const next = applyClassChange(withFeat, [{ name: "Ladino", subclass: "Trapaceiro Arcano", level: 5 }]).character;
    const after = [...next.sheet.spells.cantrips, ...next.sheet.spells.known].map((s) => s.name);
    expect(after).toContain("Invisibilidade");
    expect(after).toContain("Enfeitiçar Pessoa");
    expect(after).toContain("Mãos Mágicas");
  });
});

describe("especialização", () => {
  test("Ladino pode gastar uma vaga em ferramentas de ladrão", () => {
    const budget = expertiseBudget([{ name: "Ladino", level: 1 }]);
    expect(budget.total).toBe(2);
    expect(budget.tools).toEqual(["Ferramentas de ladrão"]);
  });

  test("Bardo só especializa perícias", () => {
    expect(expertiseBudget([{ name: "Bardo", level: 3 }]).tools).toEqual([]);
  });

  test("uma perícia e as ferramentas contam juntas no orçamento", () => {
    const character = buildCharacter(
      { ...arcaneTrickster(), skills: ["Furtividade"], expertise: ["Furtividade"], expertiseTools: ["Ferramentas de ladrão"] },
      "id",
    );
    expect(character.sheet.expertTools).toEqual(["Ferramentas de ladrão"]);
    expect(character.sheet.skills.filter((skill) => skill.expert)).toHaveLength(1);
  });
});
