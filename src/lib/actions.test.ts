import { describe, expect, test } from "bun:test";
import { actionEconomy } from "./actions";
import { remindersFor } from "./reminders";
import type { Character, Feature, Sheet } from "./types";

function sheet(features: Feature[] = [], partial: Partial<Sheet> = {}): Sheet {
  return {
    species: "Humano",
    classes: [{ name: "Ladino", level: 3 }],
    background: "Criminoso",
    abilityScores: { str: 10, dex: 16, con: 12, int: 12, wis: 12, cha: 10 },
    saves: ["dex", "int"],
    skills: [{ name: "Percepção", proficient: true }],
    proficiencies: [],
    languages: ["Comum"],
    ac: 13,
    speed: 9,
    initiativeBonus: 3,
    proficiencyBonus: 2,
    weapons: [],
    features,
    spells: { saveDC: 8, attackMod: 0, castingAbility: "int", cantrips: [], known: [] },
    inventory: { coins: { gp: 0, sp: 0, cp: 0 }, items: [] },
    appearance: { size: "Médio", height: "" },
    personality: { trait: "", ideal: "", flaw: "", why: "", backstory: "" },
    ...partial,
  };
}

const feature = (name: string, description = ""): Feature => ({ name, source: "Classe", description });

const bonusNames = (s: Sheet) =>
  actionEconomy(s)
    .groups.find((g) => g.slot === "bonus")!
    .options.map((o) => o.name);

describe("actionEconomy", () => {
  test("todo personagem tem 1 ação, 1 bônus e 1 reação", () => {
    const economy = actionEconomy(sheet());
    expect(economy.counts.map((c) => c.value)).toEqual([1, 1, 1, 1]);
    expect(economy.attacksPerAction).toBe(1);
  });

  test("as ações básicas do livro estão todas lá", () => {
    const main = actionEconomy(sheet())
      .groups.find((g) => g.slot === "acao")!
      .options.map((o) => o.name);
    for (const name of ["Atacar", "Desengajar", "Esconder-se", "Esquivar", "Ajudar", "Preparar", "Agarrar", "Empurrar"]) {
      expect(main).toContain(name);
    }
  });

  test("Ação Ardilosa move Disparada, Desengajar e Esconder-se para a ação bônus", () => {
    const names = bonusNames(sheet([feature("Ação Ardilosa")]));
    expect(names).toContain("Disparada (Ação Ardilosa)");
    expect(names).toContain("Desengajar (Ação Ardilosa)");
    expect(names).toContain("Esconder-se (Ação Ardilosa)");
  });

  test("sem a característica, nada de ação bônus extra", () => {
    expect(bonusNames(sheet())).not.toContain("Disparada (Ação Ardilosa)");
  });

  test("Mira Firme entra quando a ficha adota a opcional", () => {
    expect(bonusNames(sheet([feature("Mira Firme (opcional, Tasha)")]))).toContain("Mira Firme");
  });

  test("Surto de Ação dá uma ação a mais", () => {
    const economy = actionEconomy(sheet([feature("Surto de Ação")]));
    expect(economy.counts[0].value).toBe(2);
    expect(economy.notes.join(" ")).toContain("Surto de Ação");
  });

  test("Ataque Extra conta os ataques da ação de Atacar", () => {
    expect(actionEconomy(sheet([feature("Ataque Extra")])).attacksPerAction).toBe(2);
    expect(actionEconomy(sheet([feature("Ataque Extra (2)")])).attacksPerAction).toBe(3);
  });

  test("a origem da opção extra aponta a característica", () => {
    const option = actionEconomy(sheet([feature("Ação Ardilosa")]))
      .groups.find((g) => g.slot === "bonus")!
      .options.find((o) => o.name.startsWith("Disparada"))!;
    expect(option.source).toBe("Ação Ardilosa");
  });
});

describe("remindersFor", () => {
  const character = (s: Sheet, partial: Partial<Character> = {}): Character => ({
    id: "c",
    playerName: "P",
    characterName: "C",
    sheet: s,
    hpCurrent: 20,
    hpMax: 20,
    hpTemp: 0,
    spellSlots: {},
    resources: [],
    ...partial,
  });

  test("puxa resistências das características", () => {
    const c = character(sheet([feature("Ancestral Anão", "Você tem resistência a dano de veneno.")]));
    expect(remindersFor(c).some((r) => r.text.includes("resistência a dano de veneno"))).toBe(true);
  });

  test("marca desvantagem como aviso ruim", () => {
    const c = character(sheet([feature("Sensibilidade à Luz", "Você tem desvantagem em jogadas de ataque sob luz solar direta.")]));
    const hit = remindersFor(c).find((r) => r.text.includes("desvantagem"));
    expect(hit?.tone).toBe("bad");
  });

  test("mostra a percepção passiva", () => {
    const c = character(sheet());
    // 10 + 1 (Sab) + 2 (proficiente) = 13
    expect(remindersFor(c).some((r) => r.text === "Percepção passiva 13.")).toBe(true);
  });

  test("avisa PV baixo e Inspiração disponível", () => {
    const c = character(sheet(), {
      hpCurrent: 3,
      resources: [{ name: "Inspiração", current: 2, max: 0, recharge: "none", kind: "moeda", masterOnly: true }],
    });
    const texts = remindersFor(c).map((r) => r.text);
    expect(texts.some((t) => t.includes("PV baixo"))).toBe(true);
    expect(texts.some((t) => t.includes("2 de Inspiração"))).toBe(true);
  });

  test("armadura pesada vira lembrete de desvantagem", () => {
    const c = character(sheet([], { equippedArmor: "Placas" }));
    expect(remindersFor(c).some((r) => r.text.includes("Furtividade"))).toBe(true);
  });
});
