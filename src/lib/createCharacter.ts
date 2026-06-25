import {
  abilityMod,
  ABILITY_ORDER,
  type AbilityKey,
  type AbilityScores,
  type Character,
  type Feature,
  type Item,
  type Sheet,
  type SkillName,
  type Spell,
} from "./types";

/**
 * Rascunho de criação de ficha. Carrega os campos que o usuário escolhe
 * (com autopreenchimento do catálogo, mas tudo editável). `buildCharacter`
 * monta um `Character` completo e bem-formado a partir daqui.
 */
/** Uma classe dentro do rascunho (multiclasse = várias). */
export type DraftClass = {
  name: string;
  subclass?: string;
  level: number;
  hitDie: string; // ex: "d10"
  saves: AbilityKey[];
  proficiencies: string[];
  spellcastingAbility: AbilityKey | null;
};

export type CharacterDraft = {
  playerName: string;
  characterName: string;
  pin: string;
  color?: string;
  background: string;
  alignment?: string;
  // Raça (catálogo ou custom)
  raceName: string;
  raceBonuses: Partial<Record<AbilityKey, number>>;
  size: string;
  speed: number;
  languages: string[];
  raceTraits: string[];
  // Classes (uma ou mais — multiclasse)
  classes: DraftClass[];
  // Atributos base (antes do bônus racial)
  baseScores: AbilityScores;
  // Perícias proficientes
  skills: SkillName[];
  // Magias escolhidas (do catálogo)
  cantrips: Spell[];
  knownSpells: Spell[];
  // Inventário inicial (equipamento)
  inventoryItems: Item[];
  // Características de classe (ganhas por nível) a incluir na ficha
  extraFeatures: Feature[];
  // Overrides opcionais de derivados
  acOverride?: number;
  hpOverride?: number;
};

// === Compra de pontos (D&D 5e) ===
export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;
const POINT_BUY_COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

/** Custo de um valor na compra de pontos (Infinity se fora de 8–15). */
export function pointBuyCost(score: number): number {
  return POINT_BUY_COST[score] ?? Infinity;
}

export function pointsSpent(scores: AbilityScores): number {
  return ABILITY_ORDER.reduce((sum, k) => {
    const c = pointBuyCost(scores[k]);
    return sum + (Number.isFinite(c) ? c : 0);
  }, 0);
}

export function pointsRemaining(scores: AbilityScores): number {
  return POINT_BUY_BUDGET - pointsSpent(scores);
}

/** Todos os valores estão no intervalo válido da compra de pontos? */
export function isValidPointBuy(scores: AbilityScores): boolean {
  const inRange = ABILITY_ORDER.every(
    (k) => scores[k] >= POINT_BUY_MIN && scores[k] <= POINT_BUY_MAX,
  );
  return inRange && pointsSpent(scores) <= POINT_BUY_BUDGET;
}

// === Derivados ===
export function proficiencyBonusForLevel(level: number): number {
  return 2 + Math.floor((Math.max(1, level) - 1) / 4);
}

/** Soma os bônus raciais aos atributos base. */
export function finalScores(
  base: AbilityScores,
  bonuses: Partial<Record<AbilityKey, number>>,
): AbilityScores {
  const out = { ...base };
  for (const k of ABILITY_ORDER) out[k] = base[k] + (bonuses[k] ?? 0);
  return out;
}

/** Valor numérico do dado de vida ("d10" -> 10). Default d8. */
export function hitDieValue(hitDie: string): number {
  const m = /d(\d+)/i.exec(hitDie ?? "");
  return m ? Number(m[1]) : 8;
}

/** PV médio: máximo no 1º nível + média por nível seguinte, somando mod. CON. */
export function averageHp(hitDie: string, level: number, conMod: number): number {
  const die = hitDieValue(hitDie);
  const perLevel = Math.floor(die / 2) + 1;
  const lvl = Math.max(1, level);
  return die + conMod + (lvl - 1) * (perLevel + conMod);
}

export function emptyScores(): AbilityScores {
  return { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
}

export function emptyClass(): DraftClass {
  return {
    name: "",
    level: 1,
    hitDie: "d8",
    saves: [],
    proficiencies: [],
    spellcastingAbility: null,
  };
}

/** Nível total do personagem (soma das classes), mínimo 1. */
export function totalLevel(classes: DraftClass[]): number {
  return Math.max(
    1,
    classes.reduce((n, c) => n + (c.level || 0), 0),
  );
}

/** PV total: 1º nível do personagem usa o dado cheio; demais níveis usam a média
 *  do dado da classe correspondente. Tudo somando o modificador de Constituição. */
export function totalHp(classes: DraftClass[], conMod: number): number {
  let hp = 0;
  let first = true;
  for (const c of classes) {
    const die = hitDieValue(c.hitDie);
    for (let i = 0; i < Math.max(0, c.level); i++) {
      hp += (first ? die : Math.floor(die / 2) + 1) + conMod;
      first = false;
    }
  }
  return hp || die1(classes) + conMod;
}
function die1(classes: DraftClass[]): number {
  return hitDieValue(classes[0]?.hitDie ?? "d8");
}

export function emptyDraft(): CharacterDraft {
  return {
    playerName: "",
    characterName: "",
    pin: "",
    background: "",
    raceName: "",
    raceBonuses: {},
    size: "Médio",
    speed: 9,
    languages: ["Comum"],
    raceTraits: [],
    classes: [emptyClass()],
    baseScores: emptyScores(),
    skills: [],
    cantrips: [],
    knownSpells: [],
    inventoryItems: [],
    extraFeatures: [],
  };
}

/** Monta um `Character` completo e bem-formado a partir do rascunho. */
export function buildCharacter(draft: CharacterDraft, id: string): Character {
  const scores = finalScores(draft.baseScores, draft.raceBonuses);
  const classes = draft.classes.length ? draft.classes : [emptyClass()];
  const level = totalLevel(classes);
  const profBonus = proficiencyBonusForLevel(level);
  const dexMod = abilityMod(scores.dex);
  const conMod = abilityMod(scores.con);
  const ac = draft.acOverride ?? 10 + dexMod;
  const hpMax = draft.hpOverride ?? totalHp(classes, conMod);

  // Salvaguardas vêm da 1ª classe (regra 5e); proficiências são a união das classes.
  const saves = classes[0]?.saves ?? [];
  const proficiencies = [...new Set(classes.flatMap((c) => c.proficiencies))];
  const castAbility = classes.find((c) => c.spellcastingAbility)?.spellcastingAbility ?? null;
  const spells: Sheet["spells"] = castAbility
    ? {
        saveDC: 8 + profBonus + abilityMod(scores[castAbility]),
        attackMod: profBonus + abilityMod(scores[castAbility]),
        castingAbility: castAbility,
        cantrips: draft.cantrips,
        known: draft.knownSpells,
      }
    : {
        saveDC: 8,
        attackMod: 0,
        castingAbility: "int",
        cantrips: draft.cantrips,
        known: draft.knownSpells,
      };

  const features: Feature[] = [
    ...draft.raceTraits
      .filter((t) => t.trim())
      .map((name) => ({ name, source: draft.raceName || "Raça", description: "" })),
    ...draft.extraFeatures,
  ];

  const sheet: Sheet = {
    species: draft.raceName,
    classes: classes
      .filter((c) => c.name.trim())
      .map((c) => ({
        name: c.name,
        ...(c.subclass ? { subclass: c.subclass } : {}),
        level: c.level,
      })),
    background: draft.background,
    ...(draft.alignment ? { alignment: draft.alignment } : {}),
    abilityScores: scores,
    saves,
    skills: draft.skills.map((name) => ({ name, proficient: true })),
    proficiencies,
    languages: draft.languages,
    ac,
    speed: draft.speed,
    initiativeBonus: dexMod,
    proficiencyBonus: profBonus,
    weapons: [],
    features,
    spells,
    inventory: { coins: { gp: 0, sp: 0, cp: 0 }, items: draft.inventoryItems },
    appearance: { size: draft.size, height: "" },
    personality: { trait: "", ideal: "", flaw: "", why: "", backstory: "" },
  };

  return {
    id,
    playerName: draft.playerName,
    characterName: draft.characterName,
    ...(draft.pin ? { pin: draft.pin } : {}),
    ...(draft.color ? { color: draft.color } : {}),
    sheet,
    hpCurrent: hpMax,
    hpMax,
    hpTemp: 0,
    spellSlots: {},
    resources: [],
  };
}

/** Slug de URL a partir do nome (o servidor garante unicidade). */
export function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
