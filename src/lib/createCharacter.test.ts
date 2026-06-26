import { describe, expect, test } from "bun:test";
import {
  averageHp,
  buildCharacter,
  emptyDraft,
  finalScores,
  isValidPointBuy,
  pointsRemaining,
  pointsSpent,
  proficiencyBonusForLevel,
  slugifyName,
  spellCapacity,
  spellSlotsForClasses,
  type CharacterDraft,
} from "./createCharacter";

const cls = (name: string, level: number) => ({
  name,
  level,
  hitDie: "d8",
  saves: [],
  proficiencies: [],
  spellcastingAbility: null,
});
const scores = (p: Partial<Record<"str" | "dex" | "con" | "int" | "wis" | "cha", number>>) => ({
  str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, ...p,
});

describe("compra de pontos", () => {
  test("custo do array padrão 15,14,13,12,10,8 = 27", () => {
    const scores = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };
    expect(pointsSpent(scores)).toBe(27);
    expect(pointsRemaining(scores)).toBe(0);
    expect(isValidPointBuy(scores)).toBe(true);
  });

  test("todos 8 custam 0", () => {
    expect(pointsSpent({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 })).toBe(0);
  });

  test("estoura orçamento ou sai do intervalo => inválido", () => {
    expect(isValidPointBuy({ str: 15, dex: 15, con: 15, int: 15, wis: 15, cha: 15 })).toBe(false);
    expect(isValidPointBuy({ str: 16, dex: 8, con: 8, int: 8, wis: 8, cha: 8 })).toBe(false);
  });
});

describe("derivados", () => {
  test("bônus de proficiência por nível", () => {
    expect(proficiencyBonusForLevel(1)).toBe(2);
    expect(proficiencyBonusForLevel(4)).toBe(2);
    expect(proficiencyBonusForLevel(5)).toBe(3);
    expect(proficiencyBonusForLevel(17)).toBe(6);
  });

  test("bônus racial somado aos atributos base", () => {
    const base = { str: 13, dex: 14, con: 12, int: 10, wis: 10, cha: 8 };
    expect(finalScores(base, { str: 2, con: 1 })).toEqual({
      str: 15,
      dex: 14,
      con: 13,
      int: 10,
      wis: 10,
      cha: 8,
    });
  });

  test("PV médio: guerreiro d10 nível 3 com CON +2", () => {
    // 10 + 2  (nível 1) + 2*(6+2) = 28
    expect(averageHp("d10", 3, 2)).toBe(28);
  });
});

describe("buildCharacter", () => {
  const draft: CharacterDraft = {
    ...emptyDraft(),
    playerName: "Paiva",
    characterName: "Thorin Pedra-Forte",
    pin: "1234",
    background: "Forasteiro",
    raceName: "Anão",
    raceBonuses: { con: 2 },
    size: "Médio",
    speed: 7.5,
    languages: ["Comum", "Anão"],
    raceTraits: ["Visão no Escuro", "Resiliência Anã"],
    extraFeatures: [
      { name: "Visão no Escuro", source: "Anão", description: "..." },
      { name: "Resiliência Anã", source: "Anão", description: "..." },
    ],
    classes: [
      {
        name: "Guerreiro",
        level: 3,
        hitDie: "d10",
        saves: ["str", "con"],
        proficiencies: ["Armas marciais"],
        spellcastingAbility: null,
      },
    ],
    baseScores: { str: 15, dex: 13, con: 13, int: 10, wis: 12, cha: 8 },
    skills: ["Atletismo", "Intimidação"],
  };

  test("monta ficha completa e bem-formada", () => {
    const c = buildCharacter(draft, "thorin-pedra-forte");
    expect(c.id).toBe("thorin-pedra-forte");
    expect(c.pin).toBe("1234");
    expect(c.sheet.abilityScores.con).toBe(15); // 13 base + 2 racial
    expect(c.sheet.proficiencyBonus).toBe(2);
    expect(c.sheet.initiativeBonus).toBe(1); // mod(dex 13)
    expect(c.sheet.ac).toBe(11); // 10 + mod(dex)
    expect(c.hpMax).toBe(28); // d10 nível 3, CON +2
    expect(c.hpCurrent).toBe(c.hpMax);
    expect(c.sheet.classes[0]).toMatchObject({ name: "Guerreiro", level: 3 });
    expect(c.sheet.skills).toContainEqual({ name: "Atletismo", proficient: true });
    expect(c.sheet.features.map((f) => f.name)).toContain("Visão no Escuro");
  });

  test("multiclasse: nível total, bônus de proficiência e PV somados", () => {
    const mc = buildCharacter(
      {
        ...draft,
        baseScores: { str: 15, dex: 13, con: 13, int: 10, wis: 12, cha: 8 },
        raceBonuses: { con: 2 }, // CON 15 -> mod +2
        classes: [
          { name: "Guerreiro", level: 3, hitDie: "d10", saves: ["str", "con"], proficiencies: ["A"], spellcastingAbility: null },
          { name: "Mago", level: 2, hitDie: "d6", saves: ["int", "wis"], proficiencies: ["B"], spellcastingAbility: "int" },
        ],
      },
      "mc-teste",
    );
    expect(mc.sheet.classes).toHaveLength(2);
    expect(mc.sheet.proficiencyBonus).toBe(3); // nível total 5
    // PV: 10+2 (1º nível) + 2*(6+2) [guerreiro 2-3] + 2*(4+2) [mago] = 12 + 16 + 12 = 40
    expect(mc.hpMax).toBe(40);
    expect(mc.sheet.saves).toEqual(["str", "con"]); // salvaguardas da 1ª classe
    expect(mc.sheet.proficiencies).toEqual(["A", "B"]); // união
    expect(mc.sheet.spells.castingAbility).toBe("int"); // 1ª classe conjuradora
  });

  test("classe conjuradora calcula CD/ataque de magia", () => {
    const mage = buildCharacter(
      {
        ...draft,
        classes: [
          {
            name: "Mago",
            level: 3,
            hitDie: "d6",
            saves: ["int", "wis"],
            proficiencies: [],
            spellcastingAbility: "int",
          },
        ],
        baseScores: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
        raceBonuses: { int: 1 },
      },
      "mago-teste",
    );
    // INT final 16 -> mod +3, prof +2 (nível 3): CD 8+2+3 = 13
    expect(mage.sheet.spells.saveDC).toBe(13);
    expect(mage.sheet.spells.attackMod).toBe(5);
    expect(mage.sheet.spells.castingAbility).toBe("int");
  });
});

describe("slugifyName", () => {
  test("remove acentos e normaliza", () => {
    expect(slugifyName("Thorin Pedra-Forte")).toBe("thorin-pedra-forte");
    expect(slugifyName("Anão Núñez")).toBe("anao-nunez");
  });
});

describe("espaços de magia", () => {
  test("conjurador pleno (Mago 3) usa a tabela padrão", () => {
    expect(spellSlotsForClasses([cls("Mago", 3)])).toEqual({
      "1": { current: 4, max: 4 },
      "2": { current: 2, max: 2 },
    });
  });

  test("meio-conjurador: Paladino 1 não tem espaços; nível 2 ganha", () => {
    expect(spellSlotsForClasses([cls("Paladino", 1)])).toEqual({});
    expect(spellSlotsForClasses([cls("Paladino", 2)])).toEqual({ "1": { current: 2, max: 2 } });
  });

  test("Bruxo usa Pacto Mágico (nível 3 = 2 espaços de 2º nível)", () => {
    expect(spellSlotsForClasses([cls("Bruxo", 3)])).toEqual({ "2": { current: 2, max: 2 } });
  });

  test("classe não conjuradora não tem espaços", () => {
    expect(spellSlotsForClasses([cls("Guerreiro", 5)])).toEqual({});
  });
});

describe("capacidade de magias", () => {
  test("Mago 1 com INT 16: 3 truques e 4 magias (mod 3 + nível 1)", () => {
    expect(spellCapacity([{ name: "Mago", level: 1 }], scores({ int: 16 }))).toEqual({
      cantrips: 3,
      spells: 4,
    });
  });

  test("Bardo 1 (lista fixa): 2 truques, 4 magias", () => {
    expect(spellCapacity([{ name: "Bardo", level: 1 }], scores({}))).toEqual({
      cantrips: 2,
      spells: 4,
    });
  });

  test("classe homebrew não impõe limite (null)", () => {
    expect(spellCapacity([{ name: "Necromante do Caos", level: 5 }], scores({}))).toEqual({
      cantrips: null,
      spells: null,
    });
  });
});
