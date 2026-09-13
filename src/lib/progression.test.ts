import { describe, expect, test } from "bun:test";
import { CLASS_DEFS, CLASSES_CATALOG } from "@/data/classesCatalog";
import { FEATS_CATALOG } from "@/data/featsCatalog";
import { ITEMS_CATALOG } from "@/data/itemsCatalog";
import { RACES_CATALOG } from "@/data/racesCatalog";
import { findSpell, SPELLS_CATALOG } from "@/data/spellsCatalog";
import { STARTING_EQUIPMENT } from "@/data/startingEquipment";
import {
  applyAsiDecision,
  applyClassChange,
  classFeaturesFor,
  classSpellCaps,
  clampClassLevels,
  expertiseBudget,
  featGrantedSpells,
  grantedSpellNumbers,
  grantedSpellsFor,
  hitDiceLabel,
  hitDiceOf,
  pendingSubclassChoice,
  raceGrantedSpells,
  spellCastingOf,
  spellcastingStats,
  spellRoom,
  spellSlotsFor,
  subclassChoiceFor,
  totalLevelOf,
} from "./progression";
import { buildCharacter, emptyDraft, type CharacterDraft } from "./createCharacter";
import type { Spell } from "./types";

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

describe("escolha dentro da subclasse (terreno do Círculo da Terra)", () => {
  const land = (level: number, terrain?: string) => ({
    name: "Druida",
    level,
    subclass: "Círculo da Terra",
    ...(terrain ? { subclassChoice: terrain } : {}),
  });

  test("a escolha aparece a partir do nível dela e fica pendente sem terreno", () => {
    expect(subclassChoiceFor(land(2))).toBeNull();
    expect(subclassChoiceFor(land(3))?.label).toBe("Terreno");
    expect(pendingSubclassChoice(land(3))).toBe(true);
    expect(pendingSubclassChoice(land(3, "Floresta"))).toBe(false);
  });

  test("sem terreno não vem magia de círculo; com terreno vêm as do livro", () => {
    expect(grantedSpellsFor(land(5)).map((s) => s.name)).toEqual([]);
    const forest = grantedSpellsFor(land(5, "Floresta")).map((s) => s.name);
    expect(forest).toEqual(["Patas de Aranha", "Pele de Árvore", "Convocar Relâmpagos", "Ampliar Plantas"]);
    const swamp = grantedSpellsFor(land(3, "Pântano")).map((s) => s.name);
    expect(swamp).toEqual(["Escuridão", "Flecha Ácida de Melf"]);
  });

  test("todas as magias de todos os terrenos existem no catálogo", () => {
    const choice = subclassChoiceFor(land(20))!;
    for (const option of choice.options) {
      for (const names of Object.values(option.spells ?? {})) {
        for (const name of names) expect(findSpell(name), `${option.name}: ${name}`).toBeTruthy();
      }
    }
  });

  test("a característica da ficha registra o terreno escolhido", () => {
    const features = classFeaturesFor([land(5, "Montanha")]);
    const circle = features.find((f) => f.name.startsWith("Magias de Círculo"))!;
    expect(circle.name).toBe("Magias de Círculo (Montanha)");
    expect(circle.description).toContain("Mesclar-se Às Rochas");
  });
});

describe("conjuração e dados de vida na ficha", () => {
  const sheetWith = (classes: { name: string; level: number }[], scores: Partial<Record<string, number>> = {}) => ({
    classes,
    abilityScores: { str: 10, dex: 10, con: 14, int: 18, wis: 16, cha: 8, ...scores } as never,
    proficiencyBonus: 3,
    spells: { saveDC: 8, attackMod: 0, castingAbility: "int" as const, cantrips: [], known: [] },
  });

  test("cada classe conjura com o próprio atributo", () => {
    const stats = spellcastingStats(sheetWith([{ name: "Mago", level: 5 }, { name: "Clérigo", level: 3 }]));
    expect(stats.map((s) => [s.className, s.ability, s.saveDC, s.attackMod])).toEqual([
      ["Mago", "int", 15, 7],
      ["Clérigo", "wis", 14, 6],
    ]);
  });

  test("classe que ainda não conjura fica de fora", () => {
    expect(spellcastingStats(sheetWith([{ name: "Paladino", level: 1 }]))).toEqual([]);
    expect(spellcastingStats(sheetWith([{ name: "Paladino", level: 2 }])).map((s) => s.saveDC)).toEqual([10]);
  });

  test("dados de vida saem do catálogo da classe", () => {
    const dice = hitDiceOf([{ name: "Guerreiro", level: 5 }, { name: "Mago", level: 2 }]);
    expect(dice).toEqual([
      { className: "Guerreiro", hitDie: "d10", count: 5 },
      { className: "Mago", hitDie: "d6", count: 2 },
    ]);
    expect(hitDiceLabel(dice)).toBe("5d10 + 2d6");
  });
});

describe("magias ganhas por talento e traço", () => {
  test("Tocado pelas Sombras conjura com o atributo que o talento aumentou", () => {
    const spells = featGrantedSpells("Tocado pelas Sombras", ["Enfeitiçar Pessoa"], { increased: "wis" });
    expect(spells.map((s) => s.name)).toEqual(["Invisibilidade", "Enfeitiçar Pessoa"]);
    for (const spell of spells) {
      expect(spell.granted).toBe("Talento: Tocado pelas Sombras");
      expect(spell.casting?.ability).toBe("wis");
      expect(spell.casting?.free).toContain("sem gastar espaço de magia");
      expect(spell.casting?.slots).toBe(true);
    }
  });

  test("Iniciado em Magia usa o atributo da lista escolhida e só a magia de círculo sai de graça", () => {
    const spells = featGrantedSpells("Iniciado em Magia", ["Luz", "Orientação", "Curar Ferimentos"], {
      list: "Clérigo",
    });
    const byName = new Map(spells.map((s) => [s.name, s]));
    expect(byName.get("Luz")?.casting?.ability).toBe("wis");
    expect(byName.get("Luz")?.casting?.free).toBeUndefined(); // truque é à vontade
    expect(byName.get("Curar Ferimentos")?.casting?.free).toContain("1×/descanso longo");
  });

  test("traço racial também marca o atributo e o uso sem espaço", () => {
    const tiefling = RACES_CATALOG.find((race) => race.name === "Tiefling")!;
    const legacy = tiefling.traits.find((trait) => trait.name === "Legado Infernal")!;
    const spells = raceGrantedSpells([legacy], "Tiefling");
    const byName = new Map(spells.map((s) => [s.name, s]));
    expect(byName.get("Taumaturgia")?.casting?.ability).toBe("cha");
    expect(byName.get("Taumaturgia")?.casting?.free).toBeUndefined();
    expect(byName.get("Repreensão Infernal")?.casting?.free).toContain("2º círculo");
    expect(byName.get("Escuridão")?.casting?.free).toContain("5º nível");
  });

  test("a ficha calcula a CD própria da magia do talento", () => {
    const draft: CharacterDraft = {
      ...emptyDraft(),
      characterName: "Teste",
      playerName: "Teste",
      pin: "1",
      raceName: "Humano",
      baseScores: { str: 10, dex: 12, con: 14, int: 10, wis: 16, cha: 8 },
      classes: [{ name: "Guerreiro", level: 4, hitDie: "d10", saves: ["str", "con"], proficiencies: [] }],
      advancement: [
        {
          className: "Guerreiro",
          level: 4,
          kind: "feat",
          feat: "Tocado pelas Sombras",
          abilities: { wis: 1 },
          spells: ["Enfeitiçar Pessoa"],
        },
      ],
    };
    const character = buildCharacter(draft, "id");
    const spell = character.sheet.spells.known.find((s) => s.name === "Enfeitiçar Pessoa")!;
    // Sabedoria 16 + 1 do talento = 17 (+3); bônus de proficiência +2 no nível 4.
    expect(grantedSpellNumbers(character.sheet, spell)).toEqual({
      ability: "wis",
      saveDC: 13,
      attackMod: 5,
      differs: true,
    });
  });

  test("magia de talento não faz do guerreiro um conjurador", () => {
    const draft: CharacterDraft = {
      ...emptyDraft(),
      characterName: "Teste",
      playerName: "Teste",
      pin: "1",
      raceName: "Humano",
      classes: [{ name: "Guerreiro", level: 4, hitDie: "d10", saves: ["str", "con"], proficiencies: [] }],
      advancement: [
        {
          className: "Guerreiro",
          level: 4,
          kind: "feat",
          feat: "Tocado pelas Fadas",
          abilities: { cha: 1 },
          spells: ["Enfeitiçar Pessoa"],
        },
      ],
    };
    expect(spellcastingStats(buildCharacter(draft, "id").sheet)).toEqual([]);
  });
});

describe("ficha antiga, sem as regras de conjuração gravadas", () => {
  const legacySheet = (spell: Spell) =>
    ({
      classes: [{ name: "Guerreiro", level: 4 }],
      abilityScores: { str: 10, dex: 12, con: 14, int: 10, wis: 17, cha: 14 },
      proficiencyBonus: 2,
      raceInfo: { race: "Tiefling" },
      advancement: [
        {
          className: "Guerreiro",
          level: 4,
          kind: "feat" as const,
          feat: "Tocado pelas Sombras",
          abilities: { wis: 1 },
          spells: ["Enfeitiçar Pessoa"],
        },
      ],
      spells: { saveDC: 8, attackMod: 0, castingAbility: "int" as const, cantrips: [], known: [spell] },
    }) as never;

  const bare = (name: string, granted: string, level = 1): Spell => ({
    name,
    level,
    school: "",
    castingTime: "",
    range: "",
    components: "",
    duration: "",
    description: "",
    granted,
  });

  test("refaz a conjuração da magia de talento pela decisão de progressão", () => {
    const spell = bare("Enfeitiçar Pessoa", "Talento: Tocado pelas Sombras");
    const casting = spellCastingOf(legacySheet(spell), spell);
    expect(casting?.ability).toBe("wis");
    expect(casting?.free).toContain("sem gastar espaço de magia");
    expect(grantedSpellNumbers(legacySheet(spell), spell)?.saveDC).toBe(13);
  });

  test("refaz a conjuração da magia de traço racial pelo rótulo da origem", () => {
    const spell = bare("Repreensão Infernal", "Tiefling: Legado Infernal");
    const casting = spellCastingOf(legacySheet(spell), spell);
    expect(casting?.ability).toBe("cha");
    expect(casting?.free).toContain("2º círculo");
  });
});
