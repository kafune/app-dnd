import {
  abilityMod,
  ABILITY_ORDER,
  type AbilityKey,
  type AbilityScores,
  type AsiDecision,
  type Character,
  type Coins,
  type Feature,
  type Item,
  type RaceTraitDef,
  type Sheet,
  type Skill,
  type SkillName,
  type Spell,
} from "./types";
import {
  allSpellCaps,
  applyAbilityIncrease,
  classFeaturesFor,
  classResourcesFor,
  classSkillBudget,
  featFeature,
  grantedSpellsFor,
  hitDieValue,
  proficiencyBonusForLevel,
  raceResourcesFor,
  spellSlotsFor,
  totalLevelOf,
  norm,
} from "./progression";
import { findBackground, backgroundSkills } from "@/data/backgroundsCatalog";
import { findFeat } from "@/data/featsCatalog";
import { findTrait } from "@/data/traitsCatalog";
import { resolveRace } from "@/data/racesCatalog";
import { backgroundGrants } from "@/data/backgroundEquipment";
import { mergeItems } from "./items";

export { proficiencyBonusForLevel, hitDieValue, spellSlotsFor as spellSlotsForClasses };

/** Uma classe dentro do rascunho (multiclasse = várias). */
export type DraftClass = {
  name: string;
  subclass?: string;
  level: number;
  hitDie: string; // ex: "d10"
  saves: AbilityKey[];
  proficiencies: string[];
  /** Mantido para compatibilidade com rascunhos antigos; o catálogo é a fonte atual. */
  spellcastingAbility?: AbilityKey | null;
};

/**
 * Rascunho de criação de ficha. Carrega as escolhas do jogador; tudo que é
 * derivado (características, recursos, espaços, perícias fixas) é calculado em
 * `buildCharacter` a partir dos catálogos.
 */
export type CharacterDraft = {
  playerName: string;
  characterName: string;
  pin: string;
  color?: string;
  background: string;
  alignment?: string;
  // Raça (catálogo ou custom)
  raceName: string;
  subraceName?: string;
  /** Bônus fixos da raça/sub-raça (ou digitados, na raça custom). */
  raceBonuses: Partial<Record<AbilityKey, number>>;
  /** Atributos escolhidos para incrementos "à escolha" (ex.: Meio-elfo +1 em dois). */
  raceChoiceBonuses: AbilityKey[];
  size: string;
  speed: number;
  /** Idiomas fixos da raça (ou digitados). */
  languages: string[];
  /** Idiomas adicionais escolhidos (raça + antecedente). */
  extraLanguages: string[];
  /** Traços raciais resolvidos (automáticos). */
  raceTraits: Array<RaceTraitDef | string>;
  /** Escolhas embutidas em traços (nome do traço -> opção). */
  traitChoices: Record<string, string>;
  /** Talento concedido pela raça (Humano variante). */
  raceFeat?: string;
  /** Perícias escolhidas por traços raciais (ex.: Versatilidade em Perícia). */
  raceSkillChoices: SkillName[];
  /** Anotação livre pedida pela raça (ex.: Shade: raça de origem cuja aparência assume). */
  raceNote?: string;
  /** Regra da casa: na multiclasse, cada classe dá a escolha completa de perícias dela. */
  multiclassFullSkills?: boolean;
  // Classes (uma ou mais — multiclasse)
  classes: DraftClass[];
  /** Decisões de ASI/talento nos níveis já alcançados. */
  advancement: AsiDecision[];
  // Atributos base (antes do bônus racial)
  baseScores: AbilityScores;
  // Perícias escolhidas (classe + escolha do antecedente)
  skills: SkillName[];
  // Magias escolhidas (do catálogo), com a classe de origem
  cantrips: Spell[];
  knownSpells: Spell[];
  // Inventário inicial
  inventoryItems: Item[];
  coins: Coins;
  /** Opção escolhida em cada grupo "um ou outro" do equipamento do antecedente (padrão: a primeira). */
  backgroundEquipmentChoices?: number[];
  /** Ferramentas escolhidas em cada escolha de ferramenta do antecedente. */
  backgroundToolPicks?: string[][];
  /** Características homebrew de rascunhos antigos. Na criação normal fica vazio. */
  extraFeatures?: Feature[];
  // Overrides opcionais de derivados
  acOverride?: number;
  hpOverride?: number;
};

// === Compra de pontos (D&D 5e) ===
export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;
const POINT_BUY_COST: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

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
  const inRange = ABILITY_ORDER.every((k) => scores[k] >= POINT_BUY_MIN && scores[k] <= POINT_BUY_MAX);
  return inRange && pointsSpent(scores) <= POINT_BUY_BUDGET;
}

// === Derivados ===

/** Bônus raciais totais: fixos + escolhidos (+1 cada). */
export function totalRaceBonuses(draft: Pick<CharacterDraft, "raceBonuses" | "raceChoiceBonuses">): Partial<Record<AbilityKey, number>> {
  const out: Partial<Record<AbilityKey, number>> = { ...draft.raceBonuses };
  for (const k of draft.raceChoiceBonuses) out[k] = (out[k] ?? 0) + 1;
  return out;
}

function resolvedRaceTraits(traits: Array<RaceTraitDef | string>): RaceTraitDef[] {
  return traits.map((trait) => {
    if (typeof trait !== "string") return trait;
    const legacy = findTrait(trait);
    return { name: trait, description: legacy?.description ?? "" };
  });
}

/** Soma os bônus raciais aos atributos base. */
export function finalScores(base: AbilityScores, bonuses: Partial<Record<AbilityKey, number>>): AbilityScores {
  const out = { ...base };
  for (const k of ABILITY_ORDER) out[k] = base[k] + (bonuses[k] ?? 0);
  return out;
}

/** Atributos finais do rascunho: base + raça + decisões de ASI/talento. */
export function draftScores(draft: CharacterDraft): AbilityScores {
  let s = finalScores(draft.baseScores, totalRaceBonuses(draft));
  for (const d of draft.advancement) s = applyAbilityIncrease(s, d.abilities);
  return s;
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
  return { name: "", level: 1, hitDie: "d8", saves: [], proficiencies: [] };
}

/** Nível total do personagem (soma das classes), mínimo 1. */
export function totalLevel(classes: { level: number }[]): number {
  return Math.max(1, totalLevelOf(classes));
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
  return hp || hitDieValue(classes[0]?.hitDie ?? "d8") + conMod;
}

export function emptyDraft(): CharacterDraft {
  return {
    playerName: "",
    characterName: "",
    pin: "",
    background: "",
    raceName: "",
    raceBonuses: {},
    raceChoiceBonuses: [],
    size: "Médio",
    speed: 9,
    languages: ["Comum"],
    extraLanguages: [],
    raceTraits: [],
    traitChoices: {},
    raceSkillChoices: [],
    classes: [emptyClass()],
    advancement: [],
    baseScores: emptyScores(),
    skills: [],
    cantrips: [],
    knownSpells: [],
    inventoryItems: [],
    coins: { gp: 0, sp: 0, cp: 0 },
    backgroundEquipmentChoices: [],
    backgroundToolPicks: [],
  };
}

/** Perícias automáticas (antecedente fixo + traços raciais) e escolhas raciais. */
export function fixedSkills(draft: Pick<CharacterDraft, "background" | "raceTraits" | "raceSkillChoices">): SkillName[] {
  const bg = backgroundSkills(findBackground(draft.background));
  const race = resolvedRaceTraits(draft.raceTraits).flatMap((t) => t.skills ?? []);
  return [...new Set([...bg.fixed, ...race, ...draft.raceSkillChoices])];
}

/**
 * Perícias "à escolha" do rascunho: por parte (classe, multiclasse, antecedente, talentos),
 * com o total. As fixas não entram.
 */
export function skillBudget(
  draft: Pick<CharacterDraft, "classes" | "background" | "advancement" | "raceFeat" | "multiclassFullSkills">,
) {
  const parts = classSkillBudget(
    draft.classes.map((c) => ({ name: c.name, level: c.level, subclass: c.subclass })),
    { fullMulticlassSkills: draft.multiclassFullSkills },
  );
  const bg = backgroundSkills(findBackground(draft.background));
  if (bg.choose > 0) parts.push({ label: `Antecedente: ${draft.background}`, count: bg.choose, from: bg.from, rule: "background" });
  const featNames = [...draft.advancement.filter((d) => d.kind === "feat" && d.feat).map((d) => d.feat!), ...(draft.raceFeat ? [draft.raceFeat] : [])];
  for (const f of featNames) {
    const n = FEAT_SKILLS[norm(findFeat(f)?.name ?? f)] ?? 0;
    if (n > 0) parts.push({ label: `Talento: ${f}`, count: n, rule: "feat" });
  }
  return { parts, total: parts.reduce((n, p) => n + p.count, 0) };
}
const FEAT_SKILLS: Record<string, number> = { talentoso: 3, "perito em aptidao": 1, "perito em pericias": 1, "perito em habilidades": 1 };

/** Primeira linha de uma anotação, se for curta o bastante para caber num nome ("Shade (Thri-kreen)"). */
export function shortNote(note: string | undefined, max = 32): string {
  const first = (note ?? "").split(/\r?\n/)[0].trim();
  return first.length > 0 && first.length <= max ? first : "";
}

/** Traços raciais viram características da ficha (com a escolha ou a anotação embutida no nome). */
export function raceFeatures(
  draft: Pick<CharacterDraft, "raceName" | "subraceName" | "raceTraits" | "traitChoices" | "raceNote">,
): Feature[] {
  const source = draft.subraceName ? `${draft.raceName} (${draft.subraceName})` : draft.raceName || "Raça";
  const note = draft.raceNote?.trim() ?? "";
  const noteField = resolveRace(draft.raceName, draft.subraceName)?.noteField;
  const traits = resolvedRaceTraits(draft.raceTraits);
  const noteTrait =
    note && noteField?.traitName ? traits.find((t) => norm(t.name) === norm(noteField.traitName!)) : undefined;
  const features: Feature[] = traits.map((t) => {
    const choice = draft.traitChoices[t.name] || (t === noteTrait ? shortNote(note) : "");
    return {
      name: choice ? `${t.name} (${choice})` : t.name,
      source,
      description: t === noteTrait ? `${t.description}\n\nAnotação do jogador: ${note}` : t.description,
      origin: { kind: "race", name: draft.raceName },
    };
  });
  if (note && !noteTrait) {
    features.push({
      name: noteField?.label ?? "Anotação da raça",
      source,
      description: note,
      origin: { kind: "race", name: draft.raceName },
    });
  }
  return features;
}

/** Monta um `Character` completo e bem-formado a partir do rascunho. */
export function buildCharacter(draft: CharacterDraft, id: string): Character {
  const scores = draftScores(draft);
  const selectedClasses = draft.classes.filter((entry) => entry.name.trim());
  const classes = selectedClasses.length ? selectedClasses : [emptyClass()];
  const classEntries = classes
    .filter((c) => c.name.trim())
    .map((c) => ({ name: c.name, ...(c.subclass ? { subclass: c.subclass } : {}), level: c.level }));
  const level = totalLevel(classes);
  const profBonus = proficiencyBonusForLevel(level);
  const dexMod = abilityMod(scores.dex);
  const conMod = abilityMod(scores.con);
  const ac = draft.acOverride ?? 10 + dexMod;
  let hpMax = draft.hpOverride ?? totalHp(classes, conMod);
  if (draft.hpOverride == null) {
    // Tenacidade Anã / Robusto: +1 (ou +2) por nível
    if (resolvedRaceTraits(draft.raceTraits).some((t) => norm(t.name) === "tenacidade ana")) hpMax += level;
    const feats = [...draft.advancement.filter((d) => d.kind === "feat").map((d) => d.feat ?? ""), draft.raceFeat ?? ""];
    if (feats.some((f) => norm(f) === "robusto")) hpMax += 2 * level;
  }

  // Salvaguardas vêm da 1ª classe (regra 5e); proficiências são a união das classes + traços + antecedente.
  const saves = classes[0]?.saves ?? [];
  const background = backgroundGrants(draft.background, draft.backgroundEquipmentChoices, draft.backgroundToolPicks);
  const proficiencies: string[] = [];
  for (const entry of [
    ...classes.flatMap((c) => c.proficiencies),
    ...resolvedRaceTraits(draft.raceTraits).flatMap((t) => t.proficiencies ?? []),
    ...background.tools,
  ]) {
    if (!proficiencies.some((existing) => norm(existing) === norm(entry))) proficiencies.push(entry);
  }

  // Magias: classe de conjuração principal = 1ª classe conjuradora
  const caps = allSpellCaps(classEntries, scores);
  const castAbility = caps[0]?.profile.ability ?? null;
  const granted = classEntries.flatMap(grantedSpellsFor);
  const known = [...draft.knownSpells];
  for (const g of granted) if (!known.some((s) => norm(s.name) === norm(g.name))) known.push(g);
  const spells: Sheet["spells"] = castAbility
    ? {
        saveDC: 8 + profBonus + abilityMod(scores[castAbility]),
        attackMod: profBonus + abilityMod(scores[castAbility]),
        castingAbility: castAbility,
        cantrips: draft.cantrips,
        known,
      }
    : { saveDC: 8, attackMod: 0, castingAbility: "int", cantrips: draft.cantrips, known };

  // Características: raça + classe/subclasse + talentos + antecedente
  const bg = findBackground(draft.background);
  const featFeatures: Feature[] = [
    ...(draft.raceFeat ? [featFeature(draft.raceFeat, draft.raceName || "Raça", 1)] : []),
    ...draft.advancement.filter((d) => d.kind === "feat" && d.feat).map((d) => featFeature(d.feat!, d.className, d.level)),
  ];
  const features: Feature[] = [
    ...raceFeatures(draft),
    ...classFeaturesFor(classEntries),
    ...featFeatures,
    ...(draft.extraFeatures ?? []),
    ...(bg
      ? [{ name: bg.feature.name, source: `Antecedente: ${bg.name}`, description: bg.feature.description, origin: { kind: "background" as const, name: bg.name } }]
      : []),
  ];

  const skillNames = [...new Set([...fixedSkills(draft), ...draft.skills])];
  const skills: Skill[] = skillNames.map((name) => ({ name, proficient: true }));

  const raceNote = draft.raceNote?.trim() ?? "";
  const speciesDetails = [draft.subraceName, shortNote(raceNote)].filter(Boolean);
  const sheet: Sheet = {
    species: speciesDetails.length ? `${draft.raceName} (${speciesDetails.join(", ")})` : draft.raceName,
    raceInfo: {
      race: draft.raceName,
      ...(draft.subraceName ? { subrace: draft.subraceName } : {}),
      choices: draft.traitChoices,
      ...(raceNote ? { note: raceNote } : {}),
    },
    advancement: draft.advancement,
    ...(draft.multiclassFullSkills && classEntries.length > 1 ? { houseRules: { multiclassSkills: true } } : {}),
    classes: classEntries,
    background: draft.background,
    ...(draft.alignment ? { alignment: draft.alignment } : {}),
    abilityScores: scores,
    saves,
    skills,
    proficiencies,
    languages: [...new Set([...draft.languages, ...draft.extraLanguages])],
    ac,
    speed: draft.speed,
    initiativeBonus: dexMod,
    proficiencyBonus: profBonus,
    weapons: [],
    features,
    spells,
    // Equipamento e ouro do antecedente entram sozinhos (antes ficavam só no texto do catálogo).
    inventory: {
      coins: { ...draft.coins, gp: draft.coins.gp + background.gold },
      items: mergeItems(draft.inventoryItems, background.items),
    },
    appearance: { size: draft.size, height: "" },
    personality: { trait: "", ideal: "", flaw: "", why: "", backstory: "" },
  };

  // PIN com espaço sobrando travava o dono fora da própria ficha (o servidor compara aparado).
  const pin = draft.pin.trim();
  return {
    id,
    playerName: draft.playerName.trim(),
    characterName: draft.characterName.trim(),
    ...(pin ? { pin } : {}),
    ...(draft.color ? { color: draft.color } : {}),
    sheet,
    hpCurrent: hpMax,
    hpMax,
    hpTemp: 0,
    spellSlots: spellSlotsFor(classEntries),
    resources: [
      ...classResourcesFor(classEntries, scores),
      ...raceResourcesFor(resolvedRaceTraits(draft.raceTraits), level, scores, draft.raceName),
    ],
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

/** Nomes das magias raciais (para mostrar na criação). */
export function raceSpells(draft: Pick<CharacterDraft, "raceTraits">): string[] {
  return resolvedRaceTraits(draft.raceTraits).flatMap((t) => t.spells ?? []);
}

/** Compatibilidade com a API antiga: soma os limites das classes conjuradoras. */
export function spellCapacity(
  classes: { name: string; level: number; subclass?: string }[],
  scores: AbilityScores,
): { cantrips: number | null; spells: number | null } {
  const caps = allSpellCaps(classes, scores);
  if (caps.length === 0) return { cantrips: null, spells: null };
  return {
    cantrips: caps.reduce((total, cap) => total + cap.cantrips, 0),
    spells: caps.reduce((total, cap) => total + cap.spells, 0),
  };
}
