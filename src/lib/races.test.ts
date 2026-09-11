import { afterEach, describe, expect, test } from "bun:test";
import { allRaces, findRace, resolveRace } from "@/data/racesCatalog";
import { allFeats, findFeat } from "@/data/featsCatalog";
import { setHomebrewItems } from "@/data/homebrewRegistry";
import { buildCharacter, emptyDraft, type CharacterDraft } from "./createCharacter";
import { classSkillBudget, multiclassWithoutSkills, raceResourcesFor } from "./progression";
import { skillSelectionFits } from "./skillChoice";

const scores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

afterEach(() => setHomebrewItems([]));

describe("raças novas", () => {
  test("Shadar-Kai: versões do livro como variantes que substituem a base", () => {
    expect(findRace("shadar-kai")?.subraceRequired).toBe(true);
    const mpmm = resolveRace("Shadar-Kai", "Monstros do Multiverso")!;
    expect(mpmm.fixedBonuses).toEqual({});
    expect(mpmm.choose).toEqual({ count: 3, amount: 1, maxPerAbility: 2, exclude: [] });
    expect(mpmm.traits.find((trait) => trait.name === "Bênção da Rainha Corvo")?.resource?.max).toBe("prof");
    const mtof = resolveRace("Shadar-Kai", "Tomo dos Inimigos de Mordenkainen")!;
    expect(mtof.fixedBonuses).toEqual({ dex: 2, con: 1 });
    expect(mtof.languages).toEqual(["Comum", "Élfico"]);
    expect(mtof.traits.map((trait) => trait.name)).toContain("Transe");
  });

  test("Kenku e Meio-orc: versão do livro por padrão e variante opcional", () => {
    const volo = resolveRace("Kenku")!;
    expect(volo.fixedBonuses).toEqual({ dex: 2, wis: 1 });
    expect(volo.traits.find((trait) => trait.name === "Treinamento Kenku")?.skillChoiceFrom).toEqual([
      "Acrobacia",
      "Enganação",
      "Furtividade",
      "Prestidigitação",
    ]);
    const kenkuMpmm = resolveRace("Kenku", "Monstros do Multiverso")!;
    expect(kenkuMpmm.traits.map((trait) => trait.name)).not.toContain("Treinamento Kenku");
    expect(kenkuMpmm.sizeOptions).toEqual(["Pequeno", "Médio"]);
    expect(resolveRace("Meio-orc")!.fixedBonuses).toEqual({ str: 2, con: 1 });
    const finding = resolveRace("Meio-orc", "Marca da Descoberta")!;
    expect(finding.fixedBonuses).toEqual({ wis: 2, con: 1 });
    expect(finding.traits.map((trait) => trait.name)).not.toContain("Resistência Implacável");
  });

  test("Meio-elfo não pode pôr os +1 à escolha em Carisma", () => {
    expect(resolveRace("Meio-elfo")!.choose?.exclude).toEqual(["cha"]);
  });

  test("Shade: a anotação da Origem em Vida vai para a raça e para o traço", () => {
    const shade = resolveRace("Shade")!;
    expect(shade.noteField?.traitName).toBe("Origem em Vida");
    expect(shade.speedEditable).toBe(true);
    const draft: CharacterDraft = {
      ...emptyDraft(),
      playerName: "Rudá",
      characterName: "Edson",
      pin: " 6148 ",
      raceName: "Shade",
      raceBonuses: shade.fixedBonuses,
      raceChoiceBonuses: ["str"],
      raceTraits: shade.traits,
      raceNote: "Thri-kreen\nquatro braços, carapaça verde",
      classes: [{ name: "Paladino", level: 3, hitDie: "d10", saves: ["wis", "cha"], proficiencies: [] }],
    };
    const character = buildCharacter(draft, "edson");
    expect(character.pin).toBe("6148");
    expect(character.sheet.species).toBe("Shade (Thri-kreen)");
    expect(character.sheet.raceInfo?.note).toBe("Thri-kreen\nquatro braços, carapaça verde");
    const origin = character.sheet.features.find((feature) => feature.name.startsWith("Origem em Vida"));
    expect(origin?.name).toBe("Origem em Vida (Thri-kreen)");
    expect(origin?.description).toContain("quatro braços");
    expect(character.resources.map((resource) => resource.name)).toEqual(
      expect.arrayContaining(["Carne Fantasmagórica", "Drenagem de Vida"]),
    );
    expect(character.sheet.abilityScores.cha).toBe(11);
    expect(character.sheet.abilityScores.str).toBe(11);
  });

  test("recursos raciais que usam o bônus de proficiência", () => {
    const traits = resolveRace("Shadar-Kai", "Monstros do Multiverso")!.traits;
    expect(raceResourcesFor(traits, 3, scores, "Shadar-Kai")).toEqual([
      { name: "Bênção da Rainha Corvo", current: 2, max: 2, recharge: "long", description: "Shadar-Kai: Bênção da Rainha Corvo" },
    ]);
    expect(raceResourcesFor(traits, 5, scores, "Shadar-Kai")[0].max).toBe(3);
  });
});

describe("perícias na multiclasse", () => {
  const classes = [
    { name: "Monge", level: 1 },
    { name: "Druida", level: 1 },
  ];

  test("Livro do Jogador: Druida por multiclasse não dá perícia", () => {
    expect(classSkillBudget(classes).map((part) => [part.label, part.count])).toEqual([["Monge", 2]]);
    expect(multiclassWithoutSkills(classes)).toEqual(["Druida"]);
  });

  test("regra da casa: cada classe dá a escolha completa com a própria lista", () => {
    const parts = classSkillBudget(classes, { fullMulticlassSkills: true });
    expect(parts.map((part) => part.count)).toEqual([2, 2]);
    expect(parts[1].rule).toBe("house");
    expect(parts[1].from).toContain("Natureza");
    expect(skillSelectionFits(["Acrobacia", "Atletismo", "Natureza", "Medicina"], parts)).toBe(true);
    expect(skillSelectionFits(["Acrobacia", "Atletismo", "Furtividade"], parts)).toBe(false);
    expect(skillSelectionFits(["Intuição", "Religião", "Acrobacia", "Natureza"], parts)).toBe(true);
  });

  test("a ficha guarda a regra da casa para a edição respeitar o mesmo limite", () => {
    const character = buildCharacter(
      {
        ...emptyDraft(),
        playerName: "Teste",
        characterName: "Monge Druida",
        pin: "1",
        multiclassFullSkills: true,
        classes: [
          { name: "Monge", level: 1, hitDie: "d8", saves: ["str", "dex"], proficiencies: [] },
          { name: "Druida", level: 1, hitDie: "d8", saves: ["int", "wis"], proficiencies: [] },
        ],
      },
      "monge-druida",
    );
    expect(character.sheet.houseRules).toEqual({ multiclassSkills: true });
  });
});

describe("homebrew do Mestre", () => {
  test("raças, talentos e traços homebrew entram nos catálogos sem sobrescrever os oficiais", () => {
    setHomebrewItems([
      { id: "hb-1", kind: "trait", updatedAt: "", data: { name: "Pele de Pedra", description: "CA 13 + Des.", skills: ["Atletismo"] } },
      {
        id: "hb-2",
        kind: "race",
        updatedAt: "",
        data: {
          name: "Golem Menor",
          description: "",
          abilityScoreIncrease: { con: 2 },
          size: "Médio",
          speed: 7.5,
          languages: ["Comum"],
          extraLanguages: 0,
          traitNames: ["Pele de Pedra", "Visão no Escuro", "Sumiu"],
          subraces: [],
        },
      },
      { id: "hb-3", kind: "feat", updatedAt: "", data: { name: "Punho de Ferro", description: "Soco forte." } },
      {
        id: "hb-4",
        kind: "race",
        updatedAt: "",
        data: {
          name: "Elfo",
          description: "tentativa de sobrescrever",
          abilityScoreIncrease: {},
          size: "Médio",
          speed: 9,
          languages: [],
          extraLanguages: 0,
          traitNames: [],
          subraces: [],
        },
      },
    ]);
    const golem = findRace("golem menor");
    expect(golem?.source).toBe("Homebrew");
    expect(golem?.homebrewId).toBe("hb-2");
    expect(golem?.traits.map((trait) => trait.name)).toEqual(["Pele de Pedra", "Visão no Escuro", "Sumiu"]);
    expect(golem?.traits[0].skills).toEqual(["Atletismo"]);
    expect(golem?.traits[1].description.length).toBeGreaterThan(40);
    expect(golem?.traits[2].description).toContain("não encontrado");
    expect(allRaces().filter((race) => race.name === "Elfo")).toHaveLength(1);
    expect(findRace("Elfo")?.source).toBe("PHB");
    expect(findFeat("punho de ferro")?.homebrewId).toBe("hb-3");
    expect(allFeats().some((feat) => feat.name === "Punho de Ferro")).toBe(true);
    setHomebrewItems([]);
    expect(findRace("Golem Menor")).toBeUndefined();
    expect(findFeat("Punho de Ferro")).toBeUndefined();
  });
});
