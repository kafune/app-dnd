import { describe, expect, test } from "bun:test";
import { canSwapSpells, sheetPermissions } from "./permissions";
import { expertiseBudget, optionalFeaturesFor } from "./progression";
import type { ClassEntry, Sheet } from "./types";

function sheet(classes: ClassEntry[]): Sheet {
  return {
    species: "Humano",
    classes,
    background: "Soldado",
    abilityScores: { str: 10, dex: 14, con: 12, int: 12, wis: 10, cha: 14 },
    saves: [],
    skills: [],
    proficiencies: [],
    languages: ["Comum"],
    ac: 12,
    speed: 9,
    initiativeBonus: 2,
    proficiencyBonus: 2,
    weapons: [],
    features: [],
    spells: { saveDC: 8, attackMod: 0, castingAbility: "int", cantrips: [], known: [] },
    inventory: { coins: { gp: 0, sp: 0, cp: 0 }, items: [] },
    appearance: { size: "Médio", height: "" },
    personality: { trait: "", ideal: "", flaw: "", why: "", backstory: "" },
  };
}

describe("sheetPermissions", () => {
  test("o Mestre mexe em tudo", () => {
    const all = sheetPermissions(true, sheet([{ name: "Bardo", level: 5 }]));
    expect(Object.values(all).every(Boolean)).toBe(true);
  });

  test("o jogador não mexe em nível, atributo, perícia, item nem recurso", () => {
    const player = sheetPermissions(false, sheet([{ name: "Bardo", level: 5 }]));
    expect(player.classes).toBe(false);
    expect(player.abilityScores).toBe(false);
    expect(player.skills).toBe(false);
    expect(player.inventory).toBe(false);
    expect(player.resources).toBe(false);
    expect(player.spellSlots).toBe(false);
    expect(player.combat).toBe(false);
    expect(player.hpMax).toBe(false);
    expect(player.identity).toBe(true);
  });
});

describe("canSwapSpells", () => {
  test("conjurador pleno troca as próprias magias", () => {
    expect(canSwapSpells(sheet([{ name: "Bardo", level: 5 }]))).toBe(true);
  });

  test("Trapaceiro Arcano tem lista fechada", () => {
    expect(canSwapSpells(sheet([{ name: "Ladino", level: 5, subclass: "Trapaceiro Arcano" }]))).toBe(false);
  });

  test("quem não conjura não tem o que trocar", () => {
    expect(canSwapSpells(sheet([{ name: "Guerreiro", level: 5 }]))).toBe(false);
  });

  test("multiclasse com um conjurador pleno libera", () => {
    const multi = sheet([
      { name: "Ladino", level: 3, subclass: "Trapaceiro Arcano" },
      { name: "Feiticeiro", level: 2 },
    ]);
    expect(canSwapSpells(multi)).toBe(true);
  });
});

describe("expertiseBudget", () => {
  test("Ladino 1 escolhe duas perícias", () => {
    const budget = expertiseBudget([{ name: "Ladino", level: 1 }]);
    expect(budget.total).toBe(2);
    expect(budget.allowed).toBeNull();
  });

  test("Ladino 6 escolhe quatro no total", () => {
    expect(expertiseBudget([{ name: "Ladino", level: 6 }]).total).toBe(4);
  });

  test("Bardo só ganha Aptidão no 3º nível", () => {
    expect(expertiseBudget([{ name: "Bardo", level: 2 }]).total).toBe(0);
    expect(expertiseBudget([{ name: "Bardo", level: 3 }]).total).toBe(2);
    expect(expertiseBudget([{ name: "Bardo", level: 10 }]).total).toBe(4);
  });

  test("Domínio do Conhecimento restringe as opções", () => {
    const budget = expertiseBudget([{ name: "Clérigo", level: 1, subclass: "Domínio do Conhecimento" }]);
    expect(budget.total).toBe(2);
    expect(budget.allowed).toEqual(["Arcanismo", "História", "Natureza", "Religião"]);
  });

  test("Batedor já vem com as perícias decididas", () => {
    const budget = expertiseBudget([{ name: "Ladino", level: 3, subclass: "Batedor" }]);
    expect(budget.fixed).toEqual(["Natureza", "Sobrevivência"]);
    // As duas escolhas do 1º nível continuam valendo por cima das fixas da subclasse.
    expect(budget.total).toBe(2);
  });

  test("talentos somam ao orçamento", () => {
    const budget = expertiseBudget([{ name: "Guerreiro", level: 4 }], { feats: ["Especializado em Perícia"] });
    expect(budget.total).toBe(1);
    expect(budget.sources[0].label).toContain("Especializado em Perícia");
  });

  test("classe sem especialização não abre escolha nenhuma", () => {
    expect(expertiseBudget([{ name: "Guerreiro", level: 20 }]).total).toBe(0);
  });
});

describe("optionalFeaturesFor", () => {
  test("Mira Firme aparece para o Ladino de nível 3", () => {
    const names = optionalFeaturesFor([{ name: "Ladino", level: 3 }]).map((f) => f.name);
    expect(names).toContain("Mira Firme (opcional, Tasha)");
  });

  test("abaixo do nível, nada", () => {
    expect(optionalFeaturesFor([{ name: "Ladino", level: 2 }])).toEqual([]);
  });

  test("as opcionais não entram na ficha sozinhas", async () => {
    const { classFeaturesFor } = await import("./progression");
    const auto = classFeaturesFor([{ name: "Ladino", level: 3 }]).map((f) => f.name);
    expect(auto).not.toContain("Mira Firme (opcional, Tasha)");
    const adopted = classFeaturesFor([{ name: "Ladino", level: 3 }], ["Mira Firme (opcional, Tasha)"]).map((f) => f.name);
    expect(adopted).toContain("Mira Firme (opcional, Tasha)");
  });
});
