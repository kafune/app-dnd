export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "Força",
  dex: "Destreza",
  con: "Constituição",
  int: "Inteligência",
  wis: "Sabedoria",
  cha: "Carisma",
};

export const ABILITY_ORDER: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

export type AbilityScores = Record<AbilityKey, number>;

export type SkillName =
  | "Acrobacia"
  | "Adestrar Animais"
  | "Arcanismo"
  | "Atletismo"
  | "Atuação"
  | "Enganação"
  | "Furtividade"
  | "História"
  | "Intimidação"
  | "Intuição"
  | "Investigação"
  | "Medicina"
  | "Natureza"
  | "Percepção"
  | "Persuasão"
  | "Prestidigitação"
  | "Religião"
  | "Sobrevivência";

export const SKILL_TO_ABILITY: Record<SkillName, AbilityKey> = {
  "Acrobacia": "dex",
  "Adestrar Animais": "wis",
  "Arcanismo": "int",
  "Atletismo": "str",
  "Atuação": "cha",
  "Enganação": "cha",
  "Furtividade": "dex",
  "História": "int",
  "Intimidação": "cha",
  "Intuição": "wis",
  "Investigação": "int",
  "Medicina": "wis",
  "Natureza": "int",
  "Percepção": "wis",
  "Persuasão": "cha",
  "Prestidigitação": "dex",
  "Religião": "int",
  "Sobrevivência": "wis",
};

export type Skill = {
  name: SkillName;
  proficient: boolean;
  expert?: boolean;
};

export type Feature = {
  name: string;
  source: string;
  description: string;
};

export type Spell = {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  ritual?: boolean;
  concentration?: boolean;
  prepared?: boolean;
};

export type Weapon = {
  name: string;
  damage: string;
  damageType: string;
  attackBonus: number;
  properties: string[];
  description?: string;
};

export type Item = {
  name: string;
  description?: string;
  quantity?: number;
  weight?: number;
};

export type Coins = {
  gp: number;
  sp: number;
  cp: number;
};

export type Personality = {
  trait: string;
  ideal: string;
  flaw: string;
  why: string;
  backstory: string;
};

export type Appearance = {
  size: string;
  height: string;
  description?: string;
  imageUrl?: string;
};

export type ClassEntry = {
  name: string;
  subclass?: string;
  level: number;
};

export type Sheet = {
  species: string;
  classes: ClassEntry[];
  background: string;
  alignment?: string;
  abilityScores: AbilityScores;
  saves: AbilityKey[];
  skills: Skill[];
  proficiencies: string[];
  languages: string[];
  ac: number;
  speed: number; // metros
  initiativeBonus: number;
  proficiencyBonus: number;
  weapons: Weapon[];
  features: Feature[];
  spells: {
    saveDC: number;
    attackMod: number;
    castingAbility: AbilityKey;
    cantrips: Spell[];
    known: Spell[];
  };
  inventory: {
    coins: Coins;
    items: Item[];
  };
  appearance: Appearance;
  personality: Personality;
};

export type SpellSlot = { current: number; max: number };

export type Resource = {
  name: string;
  current: number;
  max: number;
  recharge: "short" | "long" | "none" | "dawn";
  description?: string;
};

export type Character = {
  id: string;
  playerName: string;
  characterName: string;
  pin?: string;
  protected?: boolean;
  color?: string; // tailwind hex pra header
  sheet: Sheet;
  hpCurrent: number;
  hpMax: number;
  hpTemp: number;
  spellSlots: Record<string, SpellSlot>;
  resources: Resource[];
  notes?: string;
  updatedAt?: string;
};

export type DiceRoll = {
  id: string;
  characterId: string | null;
  characterName?: string;
  label: string;
  expression: string;
  result: number;
  detail: {
    rolls: number[];
    modifier: number;
    advantage?: boolean;
    disadvantage?: boolean;
    crit?: boolean;
    fumble?: boolean;
    discarded?: number;
  };
  createdAt: string;
};

export const abilityMod = (score: number) => Math.floor((score - 10) / 2);

export const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);
