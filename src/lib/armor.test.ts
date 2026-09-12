import { describe, expect, test } from "bun:test";
import { acWarnings, computeAc, equipPatch } from "./armor";
import type { Character, Feature, Sheet } from "./types";

function sheet(partial: Partial<Sheet> = {}): Sheet {
  return {
    species: "Humano",
    classes: [{ name: "Guerreiro", level: 3 }],
    background: "Soldado",
    abilityScores: { str: 16, dex: 14, con: 14, int: 10, wis: 10, cha: 10 },
    saves: ["str", "con"],
    skills: [],
    proficiencies: [],
    languages: ["Comum"],
    ac: 0,
    speed: 9,
    initiativeBonus: 2,
    proficiencyBonus: 2,
    weapons: [],
    features: [],
    spells: { saveDC: 8, attackMod: 0, castingAbility: "int", cantrips: [], known: [] },
    inventory: { coins: { gp: 0, sp: 0, cp: 0 }, items: [] },
    appearance: { size: "Médio", height: "" },
    personality: { trait: "", ideal: "", flaw: "", why: "", backstory: "" },
    ...partial,
  };
}

const feature = (name: string, origin: string): Feature => ({
  name,
  source: origin,
  description: "",
  origin: { kind: "class", name: origin, level: 1 },
});

describe("computeAc", () => {
  test("sem armadura é 10 + Destreza (nunca 10 seco)", () => {
    const ac = computeAc(sheet());
    expect(ac.total).toBe(12);
    expect(ac.source).toBe("Sem armadura");
  });

  test("armadura leve soma a Destreza inteira", () => {
    // Couro = CA 11 + Des, sem teto.
    expect(computeAc(sheet({ equippedArmor: "Couro" })).total).toBe(13);
  });

  test("armadura média limita a Destreza em +2", () => {
    const high = sheet({
      equippedArmor: "Peitoral",
      abilityScores: { str: 10, dex: 20, con: 10, int: 10, wis: 10, cha: 10 },
    });
    expect(computeAc(high).total).toBe(16); // 14 + 2, não 14 + 5
  });

  test("armadura pesada ignora a Destreza", () => {
    expect(computeAc(sheet({ equippedArmor: "Placas" })).total).toBe(18);
  });

  test("escudo soma por cima da armadura", () => {
    expect(computeAc(sheet({ equippedArmor: "Couro", equippedShield: "Escudo" })).total).toBe(15);
  });

  test("bônus avulso do Mestre entra na conta", () => {
    expect(computeAc(sheet({ equippedArmor: "Couro", acBonus: 1 })).total).toBe(14);
  });

  test("Defesa sem Armadura do Bárbaro usa Constituição", () => {
    const barbarian = sheet({ features: [feature("Defesa sem Armadura", "Bárbaro")] });
    expect(computeAc(barbarian).total).toBe(14); // 10 + 2 (Des) + 2 (Con)
    expect(computeAc(barbarian).source).toContain("Bárbaro");
  });

  test("Defesa sem Armadura do Monge usa Sabedoria", () => {
    const monk = sheet({
      features: [feature("Defesa sem Armadura", "Monge")],
      abilityScores: { str: 10, dex: 16, con: 12, int: 10, wis: 16, cha: 10 },
    });
    expect(computeAc(monk).total).toBe(16); // 10 + 3 + 3
  });

  test("CA manual do Mestre vence o cálculo", () => {
    const manual = computeAc(sheet({ equippedArmor: "Couro", acOverride: 20 }));
    expect(manual.total).toBe(20);
    expect(manual.manual).toBe(true);
  });
});

describe("acWarnings", () => {
  test("avisa desvantagem em Furtividade", () => {
    expect(acWarnings(sheet({ equippedArmor: "Placas" })).join(" ")).toContain("Furtividade");
  });

  test("avisa Força insuficiente", () => {
    const weak = sheet({
      equippedArmor: "Placas",
      abilityScores: { str: 8, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    });
    expect(acWarnings(weak).join(" ")).toContain("exige Força 15");
  });

  test("Monge com escudo perde a Defesa sem Armadura", () => {
    const monk = sheet({ features: [feature("Defesa sem Armadura", "Monge")], equippedShield: "Escudo" });
    expect(acWarnings(monk).join(" ")).toContain("não funciona com escudo");
  });

  test("armadura leve sem requisito não gera aviso", () => {
    expect(acWarnings(sheet({ equippedArmor: "Couro" }))).toEqual([]);
  });
});

describe("equipPatch", () => {
  const character = (s: Sheet): Character => ({
    id: "c",
    playerName: "P",
    characterName: "C",
    sheet: s,
    hpCurrent: 10,
    hpMax: 10,
    hpTemp: 0,
    spellSlots: {},
    resources: [],
  });

  test("equipar guarda o item, espelha a CA e desfaz a CA manual", () => {
    const patch = equipPatch(character(sheet({ acOverride: 20 })), "Couro", true);
    expect(patch.equippedArmor).toBe("Couro");
    expect(patch.acOverride).toBeNull();
    expect(patch.ac).toBe(13);
  });

  test("desequipar volta para a CA sem armadura", () => {
    const patch = equipPatch(character(sheet({ equippedArmor: "Couro" })), "Couro", false);
    expect(patch.equippedArmor).toBeNull();
    expect(patch.ac).toBe(12);
  });

  test("escudo usa o próprio slot", () => {
    const patch = equipPatch(character(sheet({ equippedArmor: "Couro" })), "Escudo", true);
    expect(patch.equippedShield).toBe("Escudo");
    expect(patch.equippedArmor).toBeUndefined();
    expect(patch.ac).toBe(15);
  });
});
