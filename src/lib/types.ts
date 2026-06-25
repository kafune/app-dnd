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

/** Livro de origem de uma magia do catálogo. */
export type SpellSource = "PHB" | "XGtE" | "TCoE";

export const SPELL_SOURCE_LABELS: Record<SpellSource, string> = {
  PHB: "Livro do Jogador",
  XGtE: "Guia de Xanathar",
  TCoE: "Caldeirão de Tasha",
};

/** Classes conjuradoras (inclui Artífice, do Caldeirão de Tasha). */
export type SpellClass =
  | "Artífice"
  | "Bardo"
  | "Bruxo"
  | "Clérigo"
  | "Druida"
  | "Feiticeiro"
  | "Mago"
  | "Paladino"
  | "Patrulheiro";

/** Uma magia do catálogo de referência (extraído dos livros). */
export type CatalogSpell = Spell & {
  ritual: boolean;
  concentration: boolean;
  source: SpellSource;
  /** Classes que podem conjurar esta magia (das listas de magia dos livros). */
  classes: SpellClass[];
};

/** Escolha de perícias de uma classe: quantas e dentre quais. */
export type ClassSkillChoice = { choose: number; from: string[] };

/** Equipamento inicial de uma classe: grupos de escolha "(a) ou (b)" + itens fixos. */
export type StartingEquipment = {
  choices: string[][];
  fixed: string[];
};

/** Uma classe do catálogo de referência (extraída do Livro do Jogador). */
export type CatalogClass = {
  name: string;
  hitDie: string; // ex: "d8"
  primaryAbility: AbilityKey | null;
  savingThrows: AbilityKey[];
  spellcastingAbility: AbilityKey | null; // null = não conjura na base
  armorProficiencies: string;
  weaponProficiencies: string;
  toolProficiencies: string;
  skillProficiencies: ClassSkillChoice | null;
  subclasses: string[];
  startingEquipment: StartingEquipment;
  /** Características ganhas por nível: { "1": ["Fúria", ...], "3": [...] }. */
  progression: Record<string, string[]>;
};

/** Incremento de atributos de uma raça/sub-raça (chave de atributo -> bônus).
 *  `choose` representa incrementos à escolha (ex.: meio-elfo: +1 em dois à escolha). */
export type AbilityScoreIncrease = Partial<Record<AbilityKey, number>> & {
  choose?: { count: number; amount: number };
};

/** Uma sub-raça (ex.: Anão da Colina). */
export type CatalogSubrace = {
  name: string;
  abilityScoreIncrease: AbilityScoreIncrease;
  traits: string[];
};

/** Uma raça do catálogo de referência (extraída do Livro do Jogador). */
export type CatalogRace = {
  name: string;
  abilityScoreIncrease: AbilityScoreIncrease;
  size: string; // "Médio" | "Pequeno"
  speed: number | null; // metros
  languages: string;
  traits: string[];
  subraces: CatalogSubrace[];
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
