import { describe, expect, test } from "bun:test";
import { CLASS_DEFS, CLASSES_CATALOG } from "@/data/classesCatalog";
import { FEATS_CATALOG } from "@/data/featsCatalog";
import { ITEMS_CATALOG } from "@/data/itemsCatalog";
import { RACES_CATALOG } from "@/data/racesCatalog";
import { SPELLS_CATALOG } from "@/data/spellsCatalog";
import { STARTING_EQUIPMENT } from "@/data/startingEquipment";
import { classSpellCaps, clampClassLevels, spellSlotsFor, totalLevelOf } from "./progression";

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
