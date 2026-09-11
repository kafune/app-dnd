import type { Character } from "@/lib/types";

const emptySheet: Character["sheet"] = {
  species: "",
  classes: [],
  background: "",
  abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  saves: [],
  skills: [],
  proficiencies: [],
  languages: [],
  ac: 0,
  speed: 0,
  initiativeBonus: 0,
  proficiencyBonus: 2,
  weapons: [],
  features: [],
  spells: {
    saveDC: 0,
    attackMod: 0,
    castingAbility: "int",
    cantrips: [],
    known: [],
  },
  inventory: {
    coins: { gp: 0, sp: 0, cp: 0 },
    items: [],
  },
  appearance: {
    size: "",
    height: "",
  },
  personality: {
    trait: "",
    ideal: "",
    flaw: "",
    why: "",
    backstory: "",
  },
};

function publicCharacter(
  id: string,
  playerName: string,
  characterName: string,
  color: string,
  species: string,
  classes: Character["sheet"]["classes"],
): Character {
  return {
    id,
    playerName,
    characterName,
    color,
    protected: true,
    hpCurrent: 0,
    hpMax: 0,
    hpTemp: 0,
    spellSlots: {},
    resources: [],
    sheet: {
      ...emptySheet,
      species,
      classes,
    },
  };
}

export const PUBLIC_CHARACTERS: Character[] = [
  publicCharacter("joao-lindao", "João", "Zorrilho Pabrantes", "#7c3aed", "Shadar-Kai", [
    { name: "Ladino", subclass: "Trapaceiro Arcano", level: 3 },
  ]),
  publicCharacter("camargo-fofo", "Camargo", "Xopscoch ReiVahn", "#0ea5e9", "Kenku", [
    { name: "Bardo", subclass: "Colégio da Eloquência", level: 3 },
  ]),
  publicCharacter(
    "vinicius-fofo",
    "Vinicíus",
    "Holg Smough",
    "#16a34a",
    "Meio-Orc",
    [{ name: "Druida", subclass: "Círculo da Terra (Ártico)", level: 3 }],
  ),
  publicCharacter(
    "ruda-felpudo",
    "Rudá",
    "Edson Manoel Fagundes Peixoto",
    "#dc2626",
    "Shade (Thri-kreen)",
    [{ name: "Paladino", subclass: "Juramento de Vingança", level: 3 }],
  ),
];

export const PUBLIC_CHARACTER_MAP: Record<string, Character> = Object.fromEntries(
  PUBLIC_CHARACTERS.map((character) => [character.id, character]),
);
