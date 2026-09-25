import { ESCOLHAS_HABILIDADES, type RegraEscolhaHabilidade, type OpcaoHabilidade } from "@/data/featureChoicesCatalog";
/**
 * Motor de progressão de nível (D&D 5e).
 *
 * Tudo que depende de classe + nível mora aqui: nível máximo, conjuração
 * (capacidade de truques/magias, círculo máximo, espaços), características
 * automáticas com origem, recursos rastreáveis, ASI/talento e o diff aplicado
 * à ficha quando as classes mudam (criação e edição usam o mesmo caminho).
 */
import {
  abilityMod,
  ABILITY_LABELS,
  ABILITY_ORDER,
  type AbilityKey,
  type AbilityScores,
  type AsiDecision,
  type Character,
  type ClassEntry,
  type ExpertiseGrant,
  type Feature,
  type FeatSpellChoice,
  type FeatureResource,
  type RaceInfo,
  type RaceTraitDef,
  type Resource,
  type SkillName,
  type GrantedCasting,
  type Sheet,
  type Spell,
  type SpellCasting,
  type SpellClass,
  type SpellSlot,
  type SubclassChoiceDef,
  type SubclassChoiceOption,
} from "./types";
import {
  asiLevels,
  classFeaturesUpTo,
  findClass,
  findClassDef,
  findSubclassDef,
  type ClassFeatureWithOrigin,
} from "@/data/classesCatalog";
import { findSpell, SPELLS_CATALOG } from "@/data/spellsCatalog";
import { findFeat } from "@/data/featsCatalog";
import { resolveRace } from "@/data/racesCatalog";

export const MAX_LEVEL = 20;

export function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

// ============================================================================
// Nível
// ============================================================================

export function totalLevelOf(classes: { level: number }[]): number {
  return classes.reduce((n, c) => n + Math.max(0, c.level || 0), 0);
}

export function proficiencyBonusForLevel(level: number): number {
  return 2 + Math.floor((Math.max(1, level) - 1) / 4);
}

/**
 * Garante que a soma dos níveis não passa de 20: a classe alterada (`changed`)
 * é limitada ao que sobra das outras. Cada classe fica entre 1 e 20.
 */
export function clampClassLevels<T extends { level: number }>(classes: T[], changed: number): T[] {
  const others = classes.reduce((n, c, i) => (i === changed ? n : n + Math.max(1, c.level || 1)), 0);
  return classes.map((c, i) => {
    const lvl = Math.max(1, Math.min(MAX_LEVEL, Math.round(c.level || 1)));
    if (i !== changed) return c.level === lvl ? c : { ...c, level: lvl };
    const room = Math.max(1, MAX_LEVEL - others);
    return { ...c, level: Math.min(lvl, room) };
  });
}

/** Quantos níveis ainda cabem além das classes atuais. */
export function levelRoom(classes: { level: number }[]): number {
  return Math.max(0, MAX_LEVEL - totalLevelOf(classes));
}

// ============================================================================
// Conjuração
// ============================================================================

export type CasterKind = "full" | "half" | "third" | "pact" | "artificer";

export type CasterProfile = {
  kind: CasterKind;
  /** Lista de magias usada (ex.: Trapaceiro Arcano usa a do Mago). */
  list: SpellClass;
  ability: AbilityKey;
  /** Nível de classe em que a conjuração começa. */
  startLevel: number;
  /** "known" = lista fixa de magias conhecidas; "prepared" = prepara da lista inteira (Clérigo, Druida, Paladino, Artífice); "book" = Mago (grimório). */
  mode: "known" | "prepared" | "book";
};

const BASE_CASTERS: Record<string, CasterProfile> = {
  bardo: { kind: "full", list: "Bardo", ability: "cha", startLevel: 1, mode: "known" },
  clerigo: { kind: "full", list: "Clérigo", ability: "wis", startLevel: 1, mode: "prepared" },
  druida: { kind: "full", list: "Druida", ability: "wis", startLevel: 1, mode: "prepared" },
  feiticeiro: { kind: "full", list: "Feiticeiro", ability: "cha", startLevel: 1, mode: "known" },
  mago: { kind: "full", list: "Mago", ability: "int", startLevel: 1, mode: "book" },
  bruxo: { kind: "pact", list: "Bruxo", ability: "cha", startLevel: 1, mode: "known" },
  paladino: { kind: "half", list: "Paladino", ability: "cha", startLevel: 2, mode: "prepared" },
  patrulheiro: { kind: "half", list: "Patrulheiro", ability: "wis", startLevel: 2, mode: "known" },
  artifice: { kind: "artificer", list: "Artífice", ability: "int", startLevel: 1, mode: "prepared" },
};

/** Subclasses que dão conjuração a classes marciais (um terço de conjurador, lista do Mago). */
const THIRD_CASTER_SUBCLASSES: Record<string, CasterProfile> = {
  "cavaleiro arcano": { kind: "third", list: "Mago", ability: "int", startLevel: 3, mode: "book" },
  "trapaceiro arcano": { kind: "third", list: "Mago", ability: "int", startLevel: 3, mode: "book" },
};

/** Perfil de conjuração de uma classe (+ subclasse). null = não conjura. */
export function casterProfile(className: string, subclass?: string): CasterProfile | null {
  const base = BASE_CASTERS[norm(className)];
  if (base) return base;
  if (subclass) {
    const q = norm(subclass);
    for (const [k, v] of Object.entries(THIRD_CASTER_SUBCLASSES)) if (q.includes(k)) return v;
  }
  return null;
}

/** Nível de conjurador equivalente (para a tabela de espaços) de uma classe sozinha. */
function soloCasterLevel(p: CasterProfile, level: number): number {
  if (level < p.startLevel) return 0;
  switch (p.kind) {
    case "full":
      return level;
    case "half":
    case "artificer":
      return Math.ceil(level / 2);
    case "third":
      return Math.ceil(level / 3);
    default:
      return 0;
  }
}

/** Contribuição para o nível de conjurador multiclasse (PHB cap. 6). */
function multiCasterLevel(p: CasterProfile, level: number): number {
  if (level < p.startLevel) return 0;
  switch (p.kind) {
    case "full":
      return level;
    case "half":
      return Math.floor(level / 2);
    case "artificer":
      return Math.ceil(level / 2);
    case "third":
      return Math.floor(level / 3);
    default:
      return 0;
  }
}

/** Maior círculo de magia que a classe consegue conjurar no nível dado (0 = nenhum). */
export function maxSpellLevelFor(p: CasterProfile, level: number): number {
  if (level < p.startLevel) return 0;
  switch (p.kind) {
    case "full":
      return Math.min(9, Math.ceil(level / 2));
    case "half":
    case "artificer":
      return Math.min(5, Math.ceil(level / 4));
    case "third":
      return Math.min(4, Math.ceil(level / 6));
    case "pact":
      return Math.min(5, Math.ceil(level / 2));
  }
}

/** Tabela do conjurador multiclasse (PHB): nível de conjurador -> espaços por círculo 1..9. */
const SLOT_TABLE: Record<number, number[]> = {
  1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

/** Pacto Mágico do Bruxo: nível -> [quantidade, círculo]. */
const WARLOCK_PACT: Record<number, [number, number]> = {
  1: [1, 1], 2: [2, 1], 3: [2, 2], 4: [2, 2], 5: [2, 3], 6: [2, 3], 7: [2, 4],
  8: [2, 4], 9: [2, 5], 10: [2, 5], 11: [3, 5], 12: [3, 5], 13: [3, 5], 14: [3, 5],
  15: [3, 5], 16: [3, 5], 17: [4, 5], 18: [4, 5], 19: [4, 5], 20: [4, 5],
};

/**
 * Espaços de magia pelas classes (regra 5e). Uma única classe conjuradora usa a
 * tabela dela (meio-conjurador arredonda p/ cima); com mais de uma, vale a regra
 * de multiclasse (arredonda p/ baixo, Artífice p/ cima). O Pacto Mágico do Bruxo
 * é separado e é somado quando não há outro conjurador; havendo, os espaços de
 * pacto são adicionados no círculo correspondente (rastreados juntos, por simplicidade).
 */
export function spellSlotsFor(
  classes: { name: string; level: number; subclass?: string }[],
): Record<string, SpellSlot> {
  const casters = classes
    .map((c) => ({ c, p: casterProfile(c.name, c.subclass) }))
    .filter((x): x is { c: (typeof classes)[number]; p: CasterProfile } => !!x.p && x.c.level >= x.p.startLevel);
  const nonPact = casters.filter((x) => x.p.kind !== "pact");
  const pact = casters.filter((x) => x.p.kind === "pact");

  let casterLevel = 0;
  if (nonPact.length === 1) casterLevel = soloCasterLevel(nonPact[0].p, nonPact[0].c.level);
  else for (const x of nonPact) casterLevel += multiCasterLevel(x.p, x.c.level);

  const slots: Record<string, SpellSlot> = {};
  if (casterLevel > 0) {
    const row = SLOT_TABLE[Math.min(MAX_LEVEL, casterLevel)] ?? [];
    row.forEach((max, i) => {
      if (max > 0) slots[String(i + 1)] = { current: max, max };
    });
  }
  const warlockLevel = pact.reduce((n, x) => n + x.c.level, 0);
  if (warlockLevel > 0) {
    const [count, level] = WARLOCK_PACT[Math.min(MAX_LEVEL, warlockLevel)] ?? [0, 0];
    if (count > 0) {
      const cur = slots[String(level)];
      slots[String(level)] = cur
        ? { current: cur.current + count, max: cur.max + count }
        : { current: count, max: count };
    }
  }
  return slots;
}

/** Truques conhecidos por classe/nível (tabelas do PHB/TCoE). */
function cantripsKnown(p: CasterProfile, list: SpellClass, level: number): number {
  if (level < p.startLevel) return 0;
  const t = (a: number, b: number, c: number) => (level >= 10 ? c : level >= 4 ? b : a);
  if (p.kind === "third") return level >= 10 ? 3 : 2;
  switch (list) {
    case "Bardo":
    case "Bruxo":
    case "Druida":
      return t(2, 3, 4);
    case "Clérigo":
    case "Mago":
      return t(3, 4, 5);
    case "Feiticeiro":
      return t(4, 5, 6);
    case "Artífice":
      return t(2, 2, 3);
    default:
      return 0; // Paladino e Patrulheiro não têm truques
  }
}

/** Magias conhecidas (lista fixa) por nível-1. */
const KNOWN_TABLE: Record<string, number[]> = {
  Bardo: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
  Feiticeiro: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
  Bruxo: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  Patrulheiro: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
  // Um terço de conjurador (Cavaleiro Arcano / Trapaceiro Arcano)
  third: [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13],
};

export type ClassSpellCaps = {
  className: string;
  profile: CasterProfile;
  level: number;
  cantrips: number;
  /** Magias conhecidas ou preparadas (conforme `profile.mode`). */
  spells: number;
  /** Maior círculo conjurável. */
  maxLevel: number;
};

/** Capacidade de magias de uma classe no nível dado. null = não conjura (ainda). */
export function classSpellCaps(
  cls: { name: string; level: number; subclass?: string },
  scores: AbilityScores,
): ClassSpellCaps | null {
  const p = casterProfile(cls.name, cls.subclass);
  if (!p) return null;
  const lv = Math.max(1, Math.min(MAX_LEVEL, cls.level));
  if (lv < p.startLevel) return null;
  const mod = abilityMod(scores[p.ability]);
  let spells: number;
  if (p.kind === "third") spells = KNOWN_TABLE.third[lv - 1];
  else if (KNOWN_TABLE[p.list]) spells = KNOWN_TABLE[p.list][lv - 1];
  else if (p.kind === "half" || p.kind === "artificer") spells = Math.max(1, mod + Math.floor(lv / 2));
  else spells = Math.max(1, mod + lv);
  return {
    className: cls.name,
    profile: p,
    level: lv,
    cantrips: cantripsKnown(p, p.list, lv),
    spells,
    maxLevel: maxSpellLevelFor(p, lv),
  };
}

/** Capacidades de todas as classes conjuradoras da ficha. */
export function allSpellCaps(
  classes: { name: string; level: number; subclass?: string }[],
  scores: AbilityScores,
): ClassSpellCaps[] {
  return classes.map((c) => classSpellCaps(c, scores)).filter((c): c is ClassSpellCaps => !!c);
}

/** Uma classe da ficha como as funções de subclasse a enxergam. */
type ClassRef = { name: string; level: number; subclass?: string; subclassChoice?: string };

/**
 * A escolha que a subclasse pede ao jogador (Círculo da Terra: o terreno), quando
 * o nível de classe já a alcançou. `null` quando não há escolha ou ainda é cedo.
 */
export function subclassChoiceFor(cls: ClassRef): SubclassChoiceDef | null {
  const choice = findSubclassDef(cls.name, cls.subclass)?.choice;
  if (!choice || cls.level < choice.level) return null;
  return choice;
}

/** A opção escolhida dentro da subclasse (o terreno do Círculo da Terra). */
export function subclassChoiceOption(cls: ClassRef): SubclassChoiceOption | null {
  const choice = subclassChoiceFor(cls);
  if (!choice) return null;
  return choice.options.find((option) => norm(option.name) === norm(cls.subclassChoice ?? "")) ?? null;
}

/** A subclasse pede uma escolha que ainda não foi feita? */
export function pendingSubclassChoice(cls: ClassRef): boolean {
  return !!subclassChoiceFor(cls) && !subclassChoiceOption(cls);
}

/** Magias concedidas por subclasse (domínio/juramento/círculo/patrono) até o nível — sempre preparadas. */
export function grantedSpellsFor(cls: ClassRef): Spell[] {
  const sub = findSubclassDef(cls.name, cls.subclass);
  const def = findClassDef(cls.name);
  if (!sub || !def || cls.level < def.subclassLevel) return [];
  // A lista fixa da subclasse + a da opção escolhida (ex.: o terreno do Círculo da Terra).
  const option = subclassChoiceOption(cls);
  const tables: { label: string; spells: Record<string, string[]> }[] = [
    ...(sub.spells ? [{ label: sub.name, spells: sub.spells }] : []),
    ...(option?.spells ? [{ label: `${sub.name}: ${option.name}`, spells: option.spells }] : []),
  ];
  const out: Spell[] = [];
  const seen = new Set<string>();
  for (const table of tables) {
    for (const [lvl, names] of Object.entries(table.spells)) {
      if (Number(lvl) > cls.level) continue;
      for (const name of names) {
        const s = findSpell(name);
        const key = norm(name);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(
          s
            ? { ...toSheetSpell(s), classSource: cls.name, granted: table.label }
            : {
                name,
                level: 1,
                school: "",
                castingTime: "",
                range: "",
                components: "",
                duration: "",
                description: "",
                classSource: cls.name,
                granted: table.label,
              },
        );
      }
    }
  }
  return out;
}

/** Converte uma magia do catálogo para o formato guardado na ficha. */
export function toSheetSpell(c: ReturnType<typeof findSpell> & object): Spell {
  return {
    name: c.name,
    level: c.level,
    school: c.school,
    castingTime: c.castingTime,
    range: c.range,
    components: c.components,
    duration: c.duration,
    description: c.description,
    ...(c.ritual ? { ritual: true } : {}),
    ...(c.concentration ? { concentration: true } : {}),
  };
}

/** Rótulo de "concedida por" de uma magia vinda de talento. */
export function featSpellLabel(featName: string): string {
  return `Talento: ${featName}`;
}

/** Nome do talento quando o rótulo veio de `featSpellLabel`. */
function featOfLabel(granted: string | undefined): string | null {
  const m = /^Talento:\s*(.+)$/.exec(granted ?? "");
  return m ? m[1] : null;
}

/** Atributo de conjuração de cada lista de classe (PHB: Iniciado em Magia e afins). */
const LIST_ABILITY: Record<string, AbilityKey> = {
  artifice: "int",
  bardo: "cha",
  bruxo: "cha",
  clerigo: "wis",
  druida: "wis",
  feiticeiro: "cha",
  mago: "int",
  paladino: "cha",
  patrulheiro: "wis",
};

/** Opções que o talento precisa para resolver a conjuração das magias dele. */
export type GrantOptions = {
  /** Atributo que o talento aumentou (para `ability: "asi"`). */
  increased?: AbilityKey;
  /** Lista de classe escolhida no talento (para `ability: "list"`). */
  list?: string;
};

/** O atributo de conjuração das magias concedidas, resolvendo "asi" e "list". */
function grantedAbility(grant: GrantedCasting, options: GrantOptions): AbilityKey | undefined {
  if (grant.ability === "asi") return options.increased;
  if (grant.ability === "list") return options.list ? LIST_ABILITY[norm(options.list)] : undefined;
  return grant.ability;
}

/** As regras de conjuração de um talento/traço em frases curtas, para a tela. */
export function grantedCastingLabel(grant: GrantedCasting, options: GrantOptions = {}): string[] {
  const lines: string[] = [];
  const ability = grantedAbility(grant, options);
  if (ability) lines.push(`Atributo de conjuração destas magias: ${ABILITY_LABELS[ability]}`);
  else if (grant.ability === "asi") lines.push("Atributo de conjuração destas magias: o que este talento aumentar");
  else lines.push("Atributo de conjuração destas magias: o da lista de classe escolhida");
  if (grant.free) lines.push(`Sem gastar espaço de magia: ${grant.free}`);
  for (const [name, text] of Object.entries(grant.freeBySpell ?? {})) lines.push(`${name}: ${text}`);
  if (grant.slots) lines.push("Também podem ser conjuradas gastando um espaço de magia");
  return lines;
}

/** O atributo que uma decisão de talento aumentou (Tocado pelas Sombras: Int, Sab ou Car). */
export function increasedAbilityOf(decision: Pick<AsiDecision, "abilities"> | undefined): AbilityKey | undefined {
  return ABILITY_ORDER.find((key) => (decision?.abilities?.[key] ?? 0) > 0);
}

/** As regras próprias de uma magia concedida: atributo, uso sem espaço e espaços. */
function spellCastingFor(
  grant: GrantedCasting | undefined,
  spellName: string,
  level: number,
  options: GrantOptions,
): SpellCasting | undefined {
  if (!grant) return undefined;
  const override = Object.entries(grant.freeBySpell ?? {}).find(([name]) => norm(name) === norm(spellName))?.[1];
  // Truque é sempre à vontade: o uso grátis só faz sentido em magia de 1º círculo ou mais.
  const free = override ?? (level > 0 ? grant.free : undefined);
  const ability = grantedAbility(grant, options);
  const casting: SpellCasting = {
    ...(ability ? { ability } : {}),
    ...(free ? { free } : {}),
    ...(grant.slots && level > 0 ? { slots: true } : {}),
  };
  return Object.keys(casting).length > 0 ? casting : undefined;
}

/** Uma magia do catálogo no formato da ficha, marcada como concedida. */
function toGrantedSpell(
  name: string,
  granted: string,
  classSource?: string,
  grant?: GrantedCasting,
  options: GrantOptions = {},
): Spell {
  const catalog = findSpell(name);
  const base: Spell = catalog
    ? toSheetSpell(catalog)
    : { name, level: 1, school: "", castingTime: "", range: "", components: "", duration: "", description: "" };
  const casting = spellCastingFor(grant, base.name, base.level, options);
  return { ...base, granted, ...(classSource ? { classSource } : {}), ...(casting ? { casting } : {}) };
}

/** Magias concedidas pelos traços raciais (Alto Elfo, Tiefling, Draconato das Profundezas…). */
export function raceGrantedSpells(traits: RaceTraitDef[], raceName: string): Spell[] {
  const out: Spell[] = [];
  const seen = new Set<string>();
  for (const trait of traits) {
    for (const name of trait.spells ?? []) {
      const key = norm(name);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(toGrantedSpell(name, `${raceName || "Raça"}: ${trait.name}`, undefined, trait.casting));
    }
  }
  return out;
}

/** As magias que um talento concede: as fixas + as que o jogador escolheu. */
export function featGrantedSpells(featName: string, chosen: string[] = [], options: GrantOptions = {}): Spell[] {
  const feat = findFeat(featName);
  const label = featSpellLabel(feat?.name ?? featName);
  const out: Spell[] = [];
  const seen = new Set<string>();
  for (const name of [...(feat?.spells?.fixed ?? []), ...chosen]) {
    const key = norm(name);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(toGrantedSpell(name, label, undefined, feat?.spells?.casting, options));
  }
  return out;
}

/** Todas as magias concedidas pelos talentos que a ficha tem (fixas + escolhidas nas decisões). */
export function allFeatGrantedSpells(features: Feature[], advancement: AsiDecision[] = []): Spell[] {
  const out: Spell[] = [];
  const seen = new Set<string>();
  for (const feature of features) {
    if (feature.origin?.kind !== "feat") continue;
    const decision = advancement.find(
      (d) => d.kind === "feat" && d.feat && norm(d.feat) === norm(feature.name),
    );
    // O atributo de conjuração de Tocado pelas Sombras e afins é o que o talento
    // aumentou; o de Iniciado em Magia vem da lista de classe escolhida.
    const options: GrantOptions = { increased: increasedAbilityOf(decision), list: decision?.spellList };
    for (const spell of featGrantedSpells(feature.name, decision?.spells ?? [], options)) {
      const key = norm(spell.name);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(spell);
    }
  }
  return out;
}

/**
 * Todas as magias que a ficha ganha de graça: subclasse, raça e talentos. É a lista
 * que decide quais "concedidas" continuam valendo num recálculo.
 */
export function grantedSpellsForSheet(
  classes: ClassEntry[],
  raceInfo: RaceInfo | undefined,
  features: Feature[],
  advancement: AsiDecision[] = [],
): Spell[] {
  const race = raceInfo ? resolveRace(raceInfo.race, raceInfo.subrace) : undefined;
  return [
    ...classes.flatMap(grantedSpellsFor),
    ...(race ? raceGrantedSpells(race.traits, race.race.name) : []),
    ...allFeatGrantedSpells(features, advancement),
  ];
}

/** Magias do catálogo que atendem a uma escolha aberta por um talento. */
export function featSpellOptions(choice: FeatSpellChoice, list?: string): Spell[] {
  return SPELLS_CATALOG.filter((spell) => {
    if (spell.level !== choice.level) return false;
    if (choice.ritual && !spell.ritual) return false;
    if (choice.schools && !choice.schools.some((school) => norm(school) === norm(spell.school))) return false;
    const lists = list ? [list] : choice.lists;
    if (lists && !lists.some((entry) => spell.classes.some((c) => norm(c) === norm(entry)))) return false;
    return true;
  }).map((spell) => toSheetSpell(spell));
}

/**
 * Junta as magias escolhidas com as concedidas e separa truques de magias, sem
 * repetir nomes. As concedidas que não valem mais (subclasse/raça/talento que saiu
 * da ficha) ficam de fora.
 */
export function mergeSpellLists(
  current: Spell[],
  granted: Spell[],
  featNames: string[],
): { cantrips: Spell[]; known: Spell[] } {
  const grantedNames = new Set(granted.map((s) => norm(s.name)));
  const feats = new Set(featNames.map(norm));
  const kept = current.filter((spell) => {
    if (!spell.granted) return true;
    const feat = featOfLabel(spell.granted);
    if (feat) return feats.has(norm(feat));
    return grantedNames.has(norm(spell.name));
  });
  for (const spell of granted) {
    const index = kept.findIndex((entry) => norm(entry.name) === norm(spell.name));
    if (index === -1) {
      kept.push(spell);
      continue;
    }
    // Ficha antiga (ou talento reescolhido): reatualiza a origem e as regras de
    // conjuração da magia concedida, sem mexer nas que vieram da classe.
    if (kept[index].granted) {
      const { casting, ...rest } = kept[index];
      void casting;
      kept[index] = { ...rest, granted: spell.granted, ...(spell.casting ? { casting: spell.casting } : {}) };
    }
  }
  return {
    cantrips: kept.filter((spell) => spell.level === 0),
    known: kept.filter((spell) => spell.level !== 0),
  };
}

/** A qual classe conjuradora da ficha uma magia é contada. */
function capOwnerOf(spell: Spell, caps: ClassSpellCaps[]): ClassSpellCaps | undefined {
  if (spell.classSource) {
    const match = caps.find((cap) => norm(cap.className) === norm(spell.classSource!));
    if (match) return match;
  }
  const catalog = findSpell(spell.name);
  if (catalog) {
    const match = caps.find((cap) => catalog.classes.includes(cap.profile.list));
    if (match) return match;
  }
  return caps[0];
}

/**
 * Quantos truques e magias ainda cabem nos limites das classes conjuradoras.
 * É o que sobra quando o Mestre sobe o nível: o jogador preenche as vagas novas
 * mesmo quando a classe dele não troca magias livremente (Trapaceiro Arcano).
 */
export function spellRoom(
  classes: ClassEntry[],
  scores: AbilityScores,
  cantrips: Spell[],
  known: Spell[],
): { cantrips: number; spells: number } {
  const caps = allSpellCaps(classes, scores);
  if (caps.length === 0) return { cantrips: 0, spells: 0 };
  const count = (list: Spell[]) => {
    const used = new Map<string, number>();
    for (const spell of list) {
      if (spell.granted) continue; // concedidas não ocupam vaga
      const cap = capOwnerOf(spell, caps);
      if (!cap) continue;
      used.set(cap.className, (used.get(cap.className) ?? 0) + 1);
    }
    return used;
  };
  const usedCantrips = count(cantrips);
  const usedKnown = count(known);
  let roomCantrips = 0;
  let roomSpells = 0;
  for (const cap of caps) {
    roomCantrips += Math.max(0, cap.cantrips - (usedCantrips.get(cap.className) ?? 0));
    roomSpells += Math.max(0, cap.spells - (usedKnown.get(cap.className) ?? 0));
  }
  return { cantrips: roomCantrips, spells: roomSpells };
}

/**
 * Magias da ficha que estouram a regra: sem classe que as conjure, círculo acima do
 * permitido ou acima da quantidade. Usado para avisar (não remove nada sozinho).
 */
export function spellViolations(
  classes: { name: string; level: number; subclass?: string }[],
  scores: AbilityScores,
  cantrips: Spell[],
  known: Spell[],
): string[] {
  const caps = allSpellCaps(classes, scores);
  const issues: string[] = [];
  if (caps.length === 0) {
    if (cantrips.length + known.filter((s) => !s.granted).length > 0) issues.push("A ficha tem magias, mas nenhuma classe conjuradora.");
    return issues;
  }
  const byClass = (list: Spell[]) => {
    const m = new Map<string, Spell[]>();
    for (const s of list) {
      if (s.granted) continue;
      const catalog = findSpell(s.name);
      const key = s.classSource ?? caps.find((c) => (catalog?.classes ?? []).includes(c.profile.list))?.className ?? caps[0].className;
      const cap = caps.find((entry) => norm(entry.className) === norm(key));
      if (!cap) {
        issues.push(`${s.name}: a classe de origem ${key} não está na ficha.`);
        continue;
      }
      if (catalog && !catalog.classes.includes(cap.profile.list)) {
        issues.push(`${cap.className}: ${s.name} não está disponível para esta classe.`);
        continue;
      }
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(s);
    }
    return m;
  };
  const c0 = byClass(cantrips);
  const k0 = byClass(known);
  for (const cap of caps) {
    const cs = c0.get(cap.className) ?? [];
    const ks = k0.get(cap.className) ?? [];
    if (cs.length > cap.cantrips) issues.push(`${cap.className}: ${cs.length} truques (máximo ${cap.cantrips}).`);
    if (ks.length > cap.spells) issues.push(`${cap.className}: ${ks.length} magias (máximo ${cap.spells}).`);
    for (const s of ks) if (s.level > cap.maxLevel) issues.push(`${cap.className}: ${s.name} é de ${s.level}º círculo (máximo ${cap.maxLevel}º).`);
  }
  return issues;
}

// ============================================================================
// Características, recursos e ASI
// ============================================================================

/** Descrição padrão do ASI (mostrada na ficha até o jogador decidir). */
export const ASI_DESCRIPTION =
  "Você pode aumentar um valor de habilidade à sua escolha em 2, ou dois valores de habilidade à sua escolha em 1. Nenhum valor pode passar de 20 com este recurso. Alternativamente, com a permissão do Mestre, você pode escolher um talento no lugar do incremento.";

export function toFeature(f: ClassFeatureWithOrigin): Feature {
  return {
    name: f.name,
    source: `${f.origin.name} ${f.level}`,
    description: f.description,
    origin: f.origin,
  };
}

/**
 * Todas as características de classe/subclasse da lista de classes (com origem).
 * As opcionais (Caldeirão de Tasha) só entram se estiverem em `adopted`.
 */
/**
 * Escreve na característica da subclasse a opção que o jogador escolheu:
 * "Magias de Círculo (Floresta)" + a lista das magias que o terreno já concede.
 */
function withSubclassChoice(feature: Feature, cls: ClassEntry): Feature {
  const choice = subclassChoiceFor(cls);
  const option = subclassChoiceOption(cls);
  if (!choice || !option || norm(choice.feature) !== norm(feature.name)) return feature;
  const spells = Object.entries(option.spells ?? {})
    .filter(([level]) => Number(level) <= cls.level)
    .flatMap(([, names]) => names);
  const lines = [
    `${choice.label} escolhido: ${option.name}.`,
    ...(option.note ? [option.note] : []),
    ...(spells.length ? [`Sempre preparadas neste nível: ${spells.join(", ")}.`] : []),
  ];
  return {
    ...feature,
    name: `${feature.name} (${option.name})`,
    description: `${feature.description}\n\n${lines.join(" ")}`,
  };
}

export function classFeaturesFor(classes: ClassEntry[], adopted: string[] = []): Feature[] {
  const chosen = new Set(adopted.map(norm));
  const out: Feature[] = [];
  for (const c of classes) {
    if (!c.name.trim()) continue;
    for (const f of classFeaturesUpTo(c.name, c.level, c.subclass)) {
      if (f.asi) continue; // o ASI vira decisão (atributos × talento), não característica
      if (f.optional && !chosen.has(norm(f.name))) continue;
      out.push(withSubclassChoice(toFeature(f), c));
    }
  }
  return out;
}

/** Características opcionais (Tasha) disponíveis para as classes/níveis atuais. */
export function optionalFeaturesFor(classes: ClassEntry[]): ClassFeatureWithOrigin[] {
  const out: ClassFeatureWithOrigin[] = [];
  for (const c of classes) {
    if (!c.name.trim()) continue;
    for (const f of classFeaturesUpTo(c.name, c.level, c.subclass)) {
      if (f.optional) out.push(f);
    }
  }
  return out;
}

// ============================================================================
// Especialização (bônus de proficiência dobrado em perícias)
// ============================================================================

/** Uma concessão de especialização já alcançada, com de onde veio. */
export type ExpertiseSource = {
  label: string;
  grant: ExpertiseGrant;
};

/**
 * Especializações que a ficha já conquistou: características de classe/subclasse
 * alcançadas (respeitando as opcionais adotadas) e talentos escolhidos.
 */
export function expertiseSources(
  classes: ClassEntry[],
  options: { adopted?: string[]; feats?: string[] } = {},
): ExpertiseSource[] {
  const chosen = new Set((options.adopted ?? []).map(norm));
  const out: ExpertiseSource[] = [];
  for (const c of classes) {
    if (!c.name.trim()) continue;
    for (const f of classFeaturesUpTo(c.name, c.level, c.subclass)) {
      if (!f.expertise) continue;
      if (f.optional && !chosen.has(norm(f.name))) continue;
      out.push({ label: `${f.name} (${f.origin.name} ${f.level})`, grant: f.expertise });
    }
  }
  for (const name of options.feats ?? []) {
    const feat = findFeat(name);
    if (feat?.expertise) out.push({ label: `Talento: ${feat.name}`, grant: feat.expertise });
  }
  return out;
}

/** Quantas perícias a ficha pode especializar, quais são automáticas e quais são permitidas. */
export function expertiseBudget(
  classes: ClassEntry[],
  options: { adopted?: string[]; feats?: string[] } = {},
): {
  total: number;
  fixed: SkillName[];
  allowed: SkillName[] | null;
  /** Ferramentas que podem ocupar uma das vagas (Ladino: ferramentas de ladrão). */
  tools: string[];
  sources: ExpertiseSource[];
} {
  const sources = expertiseSources(classes, options);
  const fixed = new Set<SkillName>();
  const allowed = new Set<SkillName>();
  const tools = new Set<string>();
  let restricted = false;
  let total = 0;
  for (const { grant } of sources) {
    total += grant.count;
    for (const skill of grant.fixed ?? []) fixed.add(skill);
    if (grant.count > 0) {
      for (const tool of grant.tools ?? []) tools.add(tool);
      if (grant.from) {
        restricted = true;
        for (const skill of grant.from) allowed.add(skill);
      } else {
        restricted = false;
        allowed.clear();
      }
    }
  }
  return {
    total,
    fixed: [...fixed],
    allowed: restricted && allowed.size > 0 ? [...allowed] : null,
    tools: [...tools],
    sources,
  };
}

/** Nomes dos talentos escolhidos na ficha (ASIs + talento racial guardado nas características). */
export function featNamesOf(features: Feature[]): string[] {
  return features.filter((f) => f.origin?.kind === "feat").map((f) => f.name);
}

/** Máximo de um recurso no nível/atributos dados. */
export function resourceMax(
  res: FeatureResource,
  classLevel: number,
  scores: AbilityScores,
  profBonus: number,
): number {
  if (res.byLevel) {
    let bestLevel = -1;
    let best: number | null = null;
    for (const [lvl, max] of Object.entries(res.byLevel)) {
      const l = Number(lvl);
      if (l <= classLevel && l > bestLevel) {
        bestLevel = l;
        best = max;
      }
    }
    if (best !== null) return best;
  }
  if (typeof res.max === "number") return res.max;
  if (res.max === "prof") return profBonus;
  if (res.max === "level") return classLevel;
  return Math.max(1, abilityMod(scores[res.max]));
}

/** Recursos rastreáveis derivados das características de classe (com máximo no nível atual). */
export function classResourcesFor(classes: ClassEntry[], scores: AbilityScores): Resource[] {
  const prof = proficiencyBonusForLevel(totalLevelOf(classes));
  const byName = new Map<string, Resource>();
  for (const c of classes) {
    if (!c.name.trim()) continue;
    for (const f of classFeaturesUpTo(c.name, c.level, c.subclass)) {
      if (!f.resource) continue;
      const name = f.resource.name ?? f.name;
      const max = resourceMax(f.resource, c.level, scores, prof);
      // a última definição (nível mais alto) vence
      byName.set(norm(name), {
        name,
        current: max,
        max,
        recharge: f.resource.recharge,
        description: `${c.name}: ${f.name}`,
      });
    }
  }
  return [...byName.values()];
}

/** Algo que concede recursos: traço racial ou talento. */
type ResourceGranter = { name: string; resource?: FeatureResource; extraResources?: FeatureResource[] };

/** Recursos de um traço/talento no nível total dado (respeita `minLevel`). */
function granterResources(
  granter: ResourceGranter,
  totalLevel: number,
  scores: AbilityScores,
  description: string,
): Resource[] {
  const level = Math.max(1, totalLevel);
  const prof = proficiencyBonusForLevel(level);
  const list = [...(granter.resource ? [granter.resource] : []), ...(granter.extraResources ?? [])];
  return list.flatMap((res) => {
    if (res.minLevel && level < res.minLevel) return [];
    const max = resourceMax(res, level, scores, prof);
    return [{ name: res.name ?? granter.name, current: max, max, recharge: res.recharge, description }];
  });
}

/** Recursos rastreáveis dos traços raciais (ex.: Bênção da Rainha Corvo = 1 uso por descanso longo). */
export function raceResourcesFor(
  traits: RaceTraitDef[],
  totalLevel: number,
  scores: AbilityScores,
  raceName: string,
): Resource[] {
  return traits.flatMap((trait) => granterResources(trait, totalLevel, scores, `${raceName || "Raça"}: ${trait.name}`));
}

/** Recursos rastreáveis dos talentos da ficha (ex.: Sortudo = 3 pontos de sorte por descanso longo). */
export function featResourcesFor(features: Feature[], totalLevel: number, scores: AbilityScores): Resource[] {
  const byName = new Map<string, Resource>();
  for (const featName of featNamesOf(features)) {
    const feat = findFeat(featName);
    if (!feat) continue;
    for (const r of granterResources(feat, totalLevel, scores, `Talento: ${feat.name}`)) {
      if (!byName.has(norm(r.name))) byName.set(norm(r.name), r);
    }
  }
  return [...byName.values()];
}

/** Nomes antigos (fichas semeadas / versões anteriores) -> nome atual do catálogo. */
const RESOURCE_ALIASES: Record<string, string> = {
  "graca da rainha corvo": "bencao da rainha corvo",
  "canalizacao divina": "canalizar divindade",
  "cura pelas maos (pool)": "cura pelas maos (pv)",
};

const resourceKey = (name: string) => {
  const n = norm(name).replace(/\s+/g, " ");
  return RESOURCE_ALIASES[n] ?? n;
};
const withoutDetail = (key: string) => key.replace(/\s*\([^)]*\)\s*$/, "");

/**
 * Dois nomes de recurso são o mesmo recurso? Ignora acento/caixa, aceita apelidos
 * antigos e um detalhe entre parênteses de um lado só ("Cura pelas Mãos" = "Cura pelas Mãos (PV)").
 */
export function sameResourceName(a: string, b: string): boolean {
  const ka = resourceKey(a);
  const kb = resourceKey(b);
  if (ka === kb) return true;
  const ba = withoutDetail(ka);
  const bb = withoutDetail(kb);
  return (ba === ka || bb === kb) && ba === bb;
}

/** Recursos que a ficha deveria ter pelas regras: classe, raça e talentos (sem repetir nome). */
export function expectedResources(character: Pick<Character, "sheet">): Resource[] {
  const sheet = character.sheet;
  const level = totalLevelOf(sheet.classes);
  const scores = sheet.abilityScores;
  const race = sheet.raceInfo ? resolveRace(sheet.raceInfo.race, sheet.raceInfo.subrace) : undefined;
  const all = [
    ...classResourcesFor(sheet.classes, scores),
    ...(race ? raceResourcesFor(race.traits, level, scores, race.race.name) : []),
    ...featResourcesFor(sheet.features, level, scores),
  ];
  const out: Resource[] = [];
  for (const r of all) if (!out.some((o) => sameResourceName(o.name, r.name))) out.push(r);
  return out;
}

/**
 * Recursos de usos limitados que a ficha ainda não tem (fichas criadas antes do
 * catálogo conhecer o recurso, ou talento escolhido depois pelo jogador — o
 * servidor não deixa o jogador mudar a lista de recursos). Cheios, prontos para entrar.
 */
export function missingResources(character: Pick<Character, "sheet" | "resources">): Resource[] {
  return expectedResources(character).filter(
    (e) => !character.resources.some((r) => sameResourceName(r.name, e.name)),
  );
}

/**
 * Sincroniza recursos derivados (raça e talentos) entre dois estados da ficha:
 * atualiza o máximo dos que existem (mantendo o que já foi gasto), acrescenta os
 * que passaram a valer agora (nível novo, talento novo) e tira os que deixaram de
 * valer. Um recurso que já valia antes e não está na ficha foi removido à mão: respeita.
 */
function syncDerivedResources(resources: Resource[], before: Resource[], after: Resource[]): Resource[] {
  let out = resources.filter(
    (r) =>
      r.kind === "moeda" ||
      !before.some((b) => sameResourceName(b.name, r.name)) ||
      after.some((a) => sameResourceName(a.name, r.name)),
  );
  for (const a of after) {
    const index = out.findIndex((r) => sameResourceName(r.name, a.name));
    if (index === -1) {
      if (!before.some((b) => sameResourceName(b.name, a.name))) out = [...out, a];
      continue;
    }
    const current = out[index];
    const used = Math.max(0, current.max - current.current);
    out = out.map((r, i) => (i === index ? { ...r, max: a.max, current: Math.max(0, a.max - used) } : r));
  }
  return out;
}

/** ASIs alcançados pelas classes (className + level), em ordem de nível. */
export function reachedAsis(classes: ClassEntry[]): { className: string; level: number }[] {
  const out: { className: string; level: number }[] = [];
  for (const c of classes) {
    if (!c.name.trim()) continue;
    for (const lvl of asiLevels(c.name)) if (lvl <= c.level) out.push({ className: c.name, level: lvl });
  }
  return out.sort((a, b) => a.level - b.level);
}

/** ASIs alcançados ainda sem decisão registrada. */
export function pendingAsis(classes: ClassEntry[], advancement: AsiDecision[] = []): { className: string; level: number }[] {
  return reachedAsis(classes).filter(
    (a) => !advancement.some((d) => norm(d.className) === norm(a.className) && d.level === a.level),
  );
}

/** Decisões que não valem mais (classe removida ou nível abaixo do ASI). */
export function staleDecisions(classes: ClassEntry[], advancement: AsiDecision[] = []): AsiDecision[] {
  const reached = reachedAsis(classes);
  return advancement.filter(
    (d) => !reached.some((a) => norm(a.className) === norm(d.className) && a.level === d.level),
  );
}

/** Aplica os incrementos de atributo de uma decisão (limite 20). */
export function applyAbilityIncrease(
  scores: AbilityScores,
  inc: Partial<Record<AbilityKey, number>> | undefined,
  sign: 1 | -1 = 1,
): AbilityScores {
  const out = { ...scores };
  for (const k of ABILITY_ORDER) {
    const v = inc?.[k] ?? 0;
    if (!v) continue;
    out[k] = sign > 0 ? Math.min(20, out[k] + v) : out[k] - v;
  }
  return out;
}

/** Característica de talento (com descrição do catálogo). */
export function featFeature(featName: string, className: string, level: number): Feature {
  const f = findFeat(featName);
  return {
    name: f?.name ?? featName,
    source: `Talento (${className} ${level})`,
    description: f?.description ?? "",
    origin: { kind: "feat", name: f?.name ?? featName, level },
  };
}

// ============================================================================
// Perícias
// ============================================================================

/** Perícias concedidas por talentos conhecidos (nome normalizado do talento -> quantidade à escolha). */
const FEAT_SKILL_CHOICES: Record<string, number> = { talentoso: 3, "perito em aptidao": 1, "perito em pericias": 1, "perito em habilidades": 1 };

export type SkillBudgetPart = {
  label: string;
  count: number;
  from?: SkillName[];
  /** De onde vem a escolha (para explicar na tela). */
  rule?: "class" | "multiclass" | "house" | "background" | "feat";
};

export type SkillBudgetOptions = {
  /** Regra da casa: cada classe extra dá a escolha completa de perícias dela.
   *  Pelo PHB (cap. 6), só Bardo, Ladino e Patrulheiro dão perícia ao entrar por multiclasse. */
  fullMulticlassSkills?: boolean;
};

/**
 * Orçamento de perícias à escolha da ficha: 1ª classe (escolha da classe), demais
 * classes (regra de multiclasse, ou regra da casa), talentos que dão perícias. Perícias
 * fixas de antecedente/raça não entram aqui (são automáticas), então o total de
 * proficiências permitido = orçamento + fixas.
 */
export function classSkillBudget(classes: ClassEntry[], options: SkillBudgetOptions = {}): SkillBudgetPart[] {
  const parts: SkillBudgetPart[] = [];
  classes.forEach((c, i) => {
    if (!c.name.trim()) return;
    const cat = findClass(c.name);
    const from = cat?.skillProficiencies?.from as SkillName[] | undefined;
    if (i === 0) {
      if (cat?.skillProficiencies) parts.push({ label: c.name, count: cat.skillProficiencies.choose, from, rule: "class" });
      return;
    }
    if (options.fullMulticlassSkills && cat?.skillProficiencies) {
      parts.push({ label: `${c.name} (multiclasse, regra da casa)`, count: cat.skillProficiencies.choose, from, rule: "house" });
      return;
    }
    const phb = findClassDef(c.name)?.multiclass.skills ?? 0;
    if (phb > 0) parts.push({ label: `${c.name} (multiclasse)`, count: phb, from, rule: "multiclass" });
  });
  return parts;
}

/** Classes extras (2ª em diante) que, pelo PHB, não dão perícia nenhuma ao entrar por multiclasse. */
export function multiclassWithoutSkills(classes: ClassEntry[]): string[] {
  return classes
    .slice(1)
    .filter((c) => c.name.trim() && (findClassDef(c.name)?.multiclass.skills ?? 0) === 0)
    .map((c) => c.name);
}

export function featSkillChoices(features: Feature[]): number {
  let n = 0;
  for (const f of features) {
    if (f.origin?.kind !== "feat") continue;
    n += findFeat(f.name)?.skillChoices ?? FEAT_SKILL_CHOICES[norm(f.name)] ?? 0;
  }
  return n;
}

// ============================================================================
// Aplicar mudança de classes numa ficha
// ============================================================================

export type LevelChangeSummary = {
  prevLevel: number;
  nextLevel: number;
  profBonus: number;
  gained: Feature[];
  lost: Feature[];
  hpDelta: number;
  /** ASIs pendentes depois da mudança. */
  pendingAsi: { className: string; level: number }[];
  /** Capacidade de magias por classe depois da mudança (com o delta de magias/truques). */
  spells: { className: string; cantrips: number; spells: number; maxLevel: number; deltaSpells: number; deltaCantrips: number; mode: CasterProfile["mode"] }[];
  slots: Record<string, SpellSlot>;
  grantedSpells: string[];
  resources: string[];
  warnings: string[];
};

function sameFeature(a: Feature, b: Feature): boolean {
  if (a.origin && b.origin) {
    return (
      a.origin.kind === b.origin.kind &&
      norm(a.origin.name) === norm(b.origin.name) &&
      (a.origin.level ?? 0) === (b.origin.level ?? 0) &&
      norm(a.name) === norm(b.name)
    );
  }
  return norm(a.name) === norm(b.name);
}

/**
 * Recalcula a ficha para um novo conjunto de classes: características automáticas
 * (ganhas/perdidas), bônus de proficiência, PV (média do dado), espaços de magia,
 * magias concedidas por subclasse, recursos e decisões de ASI que deixaram de valer.
 * Não remove magias escolhidas nem perícias — só avisa.
 */
export function applyClassChange(character: Character, nextClassesRaw: ClassEntry[]): { character: Character; summary: LevelChangeSummary } {
  const sheet = character.sheet;
  const prevClasses = sheet.classes;
  const nextClasses = nextClassesRaw.map((c) => ({ ...c, level: Math.max(1, Math.min(MAX_LEVEL, Math.round(c.level || 1))) }));
  const prevLevel = totalLevelOf(prevClasses);
  const nextLevel = totalLevelOf(nextClasses);
  const warnings: string[] = [];
  if (nextLevel > MAX_LEVEL) warnings.push(`Nível total ${nextLevel} passa de ${MAX_LEVEL}.`);

  // --- decisões de ASI que deixaram de valer: reverte atributos/talentos
  let scores = { ...sheet.abilityScores };
  const stale = staleDecisions(nextClasses, sheet.advancement);
  const advancement = (sheet.advancement ?? []).filter((d) => !stale.includes(d));
  for (const d of stale) {
    if (d.kind === "asi") scores = applyAbilityIncrease(scores, d.abilities, -1);
    else if (d.abilities) scores = applyAbilityIncrease(scores, d.abilities, -1);
  }

  // --- características (as opcionais de Tasha só contam se a ficha adotou)
  const adopted = sheet.optionalFeatures ?? [];
  const prevAuto = classFeaturesFor(prevClasses, adopted);
  const nextAuto = classFeaturesFor(nextClasses, adopted);
  const staleFeatNames = new Set(stale.filter((d) => d.kind === "feat" && d.feat).map((d) => norm(d.feat!)));
  const lost: Feature[] = [];
  let features = sheet.features.filter((f) => {
    // característica automática de classe que não vale mais
    if (f.origin && (f.origin.kind === "class" || f.origin.kind === "subclass")) {
      const keep = nextAuto.some((n) => sameFeature(n, f));
      if (!keep) lost.push(f);
      return keep;
    }
    if (f.origin?.kind === "feat" && staleFeatNames.has(norm(f.name))) {
      lost.push(f);
      return false;
    }
    // fichas antigas (sem origem): remove se era automática antes e não é mais
    if (!f.origin) {
      const wasAuto = prevAuto.some((p) => norm(p.name) === norm(f.name));
      const stillAuto = nextAuto.some((n) => norm(n.name) === norm(f.name));
      if (wasAuto && !stillAuto) {
        lost.push(f);
        return false;
      }
    }
    return true;
  });
  const gained: Feature[] = [];
  for (const f of nextAuto) {
    const exists = features.some((x) => sameFeature(x, f) || (!x.origin && norm(x.name) === norm(f.name)));
    if (!exists) {
      gained.push(f);
      features.push(f);
    } else if (f.origin) {
      // sincroniza descrição/origem em fichas antigas (mesmo nome, sem origem)
      features = features.map((x) => (!x.origin && norm(x.name) === norm(f.name) ? { ...x, origin: f.origin, description: x.description || f.description } : x));
    }
  }
  features.sort((a, b) => (a.origin?.level ?? 0) - (b.origin?.level ?? 0));

  // --- PV (média do dado + CON) por nível ganho/perdido
  const conMod = abilityMod(scores.con);
  let hpDelta = 0;
  const countBy = (list: ClassEntry[]) => {
    const m = new Map<string, number>();
    for (const c of list) m.set(norm(c.name), (m.get(norm(c.name)) ?? 0) + c.level);
    return m;
  };
  const before = countBy(prevClasses);
  const after = countBy(nextClasses);
  for (const [name, lvl] of after) {
    const diff = lvl - (before.get(name) ?? 0);
    if (diff === 0) continue;
    const die = hitDieValue(findClass(name)?.hitDie ?? nextClasses.find((c) => norm(c.name) === name)?.name ?? "d8");
    const perLevel = Math.floor(die / 2) + 1 + conMod;
    hpDelta += diff * perLevel;
  }
  for (const [name, lvl] of before) {
    if (!after.has(name)) {
      const die = hitDieValue(findClass(name)?.hitDie ?? "d8");
      hpDelta -= lvl * (Math.floor(die / 2) + 1 + conMod);
    }
  }
  const hpMax = Math.max(1, character.hpMax + hpDelta);
  const hpCurrent = Math.max(0, Math.min(hpMax, character.hpCurrent + Math.max(0, hpDelta)));

  // --- magias concedidas de graça: subclasse, raça e talentos (não contam no limite)
  const grantedNext = grantedSpellsForSheet(nextClasses, sheet.raceInfo, features, advancement);
  const { cantrips, known } = mergeSpellLists(
    [...sheet.spells.cantrips, ...sheet.spells.known],
    grantedNext,
    featNamesOf(features),
  );

  // --- espaços (preserva usados)
  const fresh = spellSlotsFor(nextClasses);
  const slots: Record<string, SpellSlot> = {};
  for (const [lv, slot] of Object.entries(fresh)) {
    const used = Math.max(0, (character.spellSlots[lv]?.max ?? 0) - (character.spellSlots[lv]?.current ?? 0));
    slots[lv] = { max: slot.max, current: Math.max(0, slot.max - used) };
  }

  // --- recursos automáticos (mantém o "atual" proporcional ao que já foi gasto)
  const autoRes = classResourcesFor(nextClasses, scores);
  const resources = character.resources.filter((r) => {
    // Moedas (Inspiração e afins) não vêm da classe: nunca somem num recálculo.
    if (r.kind === "moeda") return true;
    const isAuto = /^[^:]+: /.test(r.description ?? "") && classResourcesFor(prevClasses, sheet.abilityScores).some((p) => sameResourceName(p.name, r.name));
    return !isAuto || autoRes.some((a) => sameResourceName(a.name, r.name));
  });
  for (const a of autoRes) {
    const i = resources.findIndex((r) => sameResourceName(r.name, a.name));
    if (i === -1) resources.push(a);
    else {
      const used = Math.max(0, resources[i].max - resources[i].current);
      resources[i] = { ...resources[i], max: a.max, current: Math.max(0, a.max - used), recharge: a.recharge };
    }
  }

  // --- recursos de traços raciais e talentos: escalam com o nível (bônus de proficiência),
  // entram quando o nível os libera ("a partir do 3º nível") e saem com o talento revertido.
  const race = sheet.raceInfo ? resolveRace(sheet.raceInfo.race, sheet.raceInfo.subrace) : undefined;
  const derivedBefore = [
    ...(race ? raceResourcesFor(race.traits, prevLevel, sheet.abilityScores, race.race.name) : []),
    ...featResourcesFor(sheet.features, prevLevel, sheet.abilityScores),
  ];
  const derivedAfter = [
    ...(race ? raceResourcesFor(race.traits, nextLevel, scores, race.race.name) : []),
    ...featResourcesFor(features, nextLevel, scores),
  ];
  const syncedResources = syncDerivedResources(resources, derivedBefore, derivedAfter);

  // --- bônus de proficiência e CD/ataque de magia
  const profBonus = proficiencyBonusForLevel(nextLevel);
  const caps = allSpellCaps(nextClasses, scores);
  const prevCaps = allSpellCaps(prevClasses, sheet.abilityScores);
  const castAbility = caps[0]?.profile.ability ?? sheet.spells.castingAbility;
  const spellsBlock = {
    ...sheet.spells,
    cantrips,
    known,
    castingAbility: castAbility,
    saveDC: 8 + profBonus + abilityMod(scores[castAbility]),
    attackMod: profBonus + abilityMod(scores[castAbility]),
  };

  const pending = pendingAsis(nextClasses, advancement);
  const next: Character = {
    ...character,
    hpMax,
    hpCurrent,
    spellSlots: slots,
    resources: syncedResources,
    sheet: {
      ...sheet,
      classes: nextClasses,
      abilityScores: scores,
      proficiencyBonus: profBonus,
      features,
      spells: spellsBlock,
      advancement,
    },
  };
  next.sheet.escolhasHabilidades = normalizarEscolhasHabilidades(next.sheet);
  next.sheet.spells = magiasComEscolhas(next.sheet);
  warnings.push(...spellViolations(nextClasses, scores, spellsBlock.cantrips, spellsBlock.known));

  return {
    character: next,
    summary: {
      prevLevel,
      nextLevel,
      profBonus,
      gained,
      lost,
      hpDelta,
      pendingAsi: pending,
      spells: caps.map((c) => {
        const p = prevCaps.find((x) => norm(x.className) === norm(c.className));
        return {
          className: c.className,
          cantrips: c.cantrips,
          spells: c.spells,
          maxLevel: c.maxLevel,
          deltaSpells: c.spells - (p?.spells ?? 0),
          deltaCantrips: c.cantrips - (p?.cantrips ?? 0),
          mode: c.profile.mode,
        };
      }),
      slots,
      grantedSpells: grantedNext.map((g) => g.name),
      resources: autoRes.map((r) => `${r.name} (${r.max})`),
      warnings,
    },
  };
}

/** Registra uma decisão de ASI (atributos ou talento) e aplica o efeito na ficha. */
export function applyAsiDecision(character: Character, decision: AsiDecision): Character {
  const sheet = character.sheet;
  const advancement = (sheet.advancement ?? []).filter(
    (d) => !(norm(d.className) === norm(decision.className) && d.level === decision.level),
  );
  let scores = sheet.abilityScores;
  let features = sheet.features;
  if (decision.kind === "asi") {
    scores = applyAbilityIncrease(scores, decision.abilities);
  } else if (decision.feat) {
    scores = applyAbilityIncrease(scores, decision.abilities);
    const feat = featFeature(decision.feat, decision.className, decision.level);
    features = [...features.filter((f) => !(f.origin?.kind === "feat" && norm(f.name) === norm(feat.name) && f.origin.level === decision.level)), feat];
  }
  advancement.push(decision);
  // O talento pode conceder magias (Tocado pelas Sombras, Iniciado em Magia…): elas
  // entram de graça na ficha, marcadas com a origem, sem contar no limite da classe.
  const granted = [...grantedSpellsForSheet(sheet.classes, sheet.raceInfo, features, advancement), ...magiasDasEscolhas({ ...sheet, features })];
  const { cantrips, known } = mergeSpellLists(
    [...sheet.spells.cantrips, ...sheet.spells.known],
    granted,
    featNamesOf(features),
  );
  const prof = proficiencyBonusForLevel(totalLevelOf(sheet.classes));
  const cast = sheet.spells.castingAbility;
  return {
    ...character,
    sheet: {
      ...sheet,
      abilityScores: scores,
      features,
      advancement,
      spells: {
        ...sheet.spells,
        cantrips,
        known,
        saveDC: 8 + prof + abilityMod(scores[cast]),
        attackMod: prof + abilityMod(scores[cast]),
      },
      initiativeBonus: abilityMod(scores.dex),
    },
  };
}

/** Valor numérico do dado de vida ("d10" -> 10). Default d8. */
export function hitDieValue(hitDie: string): number {
  const m = /d(\d+)/i.exec(hitDie ?? "");
  return m ? Number(m[1]) : 8;
}

// ============================================================================
// Conjuração e dados de vida na ficha pronta
// ============================================================================

/** Números de conjuração de UMA classe: habilidade, CD e bônus de ataque. */
export type SpellcastingStat = {
  className: string;
  subclass?: string;
  ability: AbilityKey;
  /** CD dos testes de resistência contra as magias dessa classe. */
  saveDC: number;
  /** Bônus das jogadas de ataque mágico dessa classe. */
  attackMod: number;
  /** Modificador do atributo de conjuração (entra na CD e no ataque). */
  abilityMod: number;
};

/**
 * CD, ataque mágico e atributo de conjuração de cada classe conjuradora.
 *
 * Cada classe usa o seu próprio atributo (Mago = Inteligência, Clérigo =
 * Sabedoria, Bardo = Carisma…), então na multiclasse os números são diferentes
 * por classe — o bônus de proficiência é que é comum ao personagem.
 */
export function spellcastingStats(
  sheet: Pick<Sheet, "classes" | "abilityScores" | "proficiencyBonus" | "spells">,
): SpellcastingStat[] {
  const prof = sheet.proficiencyBonus || proficiencyBonusForLevel(totalLevelOf(sheet.classes));
  const out: SpellcastingStat[] = [];
  for (const entry of sheet.classes) {
    const profile = casterProfile(entry.name, entry.subclass);
    if (!profile || entry.level < profile.startLevel) continue;
    const mod = abilityMod(sheet.abilityScores[profile.ability]);
    out.push({
      className: entry.name,
      ...(entry.subclass ? { subclass: entry.subclass } : {}),
      ability: profile.ability,
      saveDC: 8 + prof + mod,
      attackMod: prof + mod,
      abilityMod: mod,
    });
  }
  // Ficha sem classe conjuradora no catálogo (homebrew do Mestre) mas com magias
  // próprias: vale o que está gravado em `sheet.spells`. Magia só de talento ou
  // traço não conta — ela tem conjuração própria e não faz da classe conjuradora.
  const ownSpells = [...sheet.spells.cantrips, ...sheet.spells.known].some((spell) => !spell.granted);
  if (out.length === 0 && ownSpells) {
    out.push({
      className: sheet.classes[0]?.name || "Conjuração",
      ability: sheet.spells.castingAbility,
      saveDC: sheet.spells.saveDC,
      attackMod: sheet.spells.attackMod,
      abilityMod: abilityMod(sheet.abilityScores[sheet.spells.castingAbility]),
    });
  }
  return out;
}

/** Dados de vida por classe: "Guerreiro 5" -> { className, hitDie: "d10", count: 5 }. */
export type HitDiceEntry = { className: string; hitDie: string; count: number };

/** Dados de vida de cada classe da ficha (o dado vem do catálogo da classe). */
export function hitDiceOf(classes: { name: string; level: number }[], fallback = "d8"): HitDiceEntry[] {
  return classes
    .filter((entry) => entry.name.trim() && entry.level > 0)
    .map((entry) => ({
      className: entry.name,
      hitDie: findClass(entry.name)?.hitDie ?? fallback,
      count: entry.level,
    }));
}

/** "5d10" / "5d10 + 2d6" — como os dados de vida aparecem na ficha. */
export function hitDiceLabel(entries: HitDiceEntry[]): string {
  return entries.map((entry) => `${entry.count}${entry.hitDie}`).join(" + ");
}

/** CD e ataque próprios de uma magia concedida por talento/traço. */
export type GrantedSpellNumbers = {
  ability: AbilityKey;
  saveDC: number;
  attackMod: number;
  /** O atributo é diferente do que a classe usaria para essa magia. */
  differs: boolean;
};

/**
 * Os números de uma magia que veio de talento ou traço.
 *
 * Talentos como Tocado pelas Sombras conjuram com o atributo que o próprio
 * talento aumentou: a CD e o bônus de ataque dela não são os da classe, e é isso
 * que a ficha precisa mostrar ao lado do nome da magia.
 */
/** A ficha como as funções de magia concedida precisam vê-la. */
type CastingSheet = Pick<Sheet, "classes" | "abilityScores" | "proficiencyBonus" | "spells"> &
  Partial<Pick<Sheet, "advancement" | "raceInfo">>;

/**
 * As regras de conjuração de uma magia concedida.
 *
 * Fichas criadas antes deste campo existir não têm `casting` gravado: aí o dado é
 * refeito a partir do talento ou do traço que concedeu a magia, para o jogador não
 * ter de esperar o Mestre mexer na ficha.
 */
export function spellCastingOf(sheet: CastingSheet, spell: Spell): SpellCasting | undefined {
  if (spell.casting) return spell.casting;
  if (!spell.granted) return undefined;
  const sameName = (entry: Spell) => norm(entry.name) === norm(spell.name);
  const featName = featOfLabel(spell.granted);
  if (featName) {
    const decision = (sheet.advancement ?? []).find(
      (d) => d.kind === "feat" && d.feat && norm(d.feat) === norm(featName),
    );
    const options: GrantOptions = { increased: increasedAbilityOf(decision), list: decision?.spellList };
    return featGrantedSpells(featName, decision?.spells ?? [], options).find(sameName)?.casting;
  }
  // Rótulo de traço racial: "Tiefling: Legado Infernal".
  const traitName = spell.granted.split(":").slice(1).join(":").trim();
  if (!traitName || !sheet.raceInfo) return undefined;
  const race = resolveRace(sheet.raceInfo.race, sheet.raceInfo.subrace);
  const trait = race?.traits.find((entry) => norm(entry.name) === norm(traitName));
  if (!race || !trait) return undefined;
  return raceGrantedSpells([trait], race.race.name).find(sameName)?.casting;
}

export function grantedSpellNumbers(sheet: CastingSheet, spell: Spell): GrantedSpellNumbers | null {
  const ability = spellCastingOf(sheet, spell)?.ability;
  if (!ability) return null;
  const prof = sheet.proficiencyBonus || proficiencyBonusForLevel(totalLevelOf(sheet.classes));
  const mod = abilityMod(sheet.abilityScores[ability]);
  const stats = spellcastingStats(sheet);
  const owner = stats.find((stat) => norm(stat.className) === norm(spell.classSource ?? "")) ?? stats[0];
  return {
    ability,
    saveDC: 8 + prof + mod,
    attackMod: prof + mod,
    differs: !owner || owner.ability !== ability,
  };
}

// ============================================================================
// Escolhas permanentes de habilidades (metamágicas, manobras, estilos etc.)
// ============================================================================

export type ContextoEscolhasHabilidades = Pick<Sheet, "classes" | "features"> &
  Partial<Pick<Sheet, "escolhasHabilidades" | "spells">>;
export type EscolhaHabilidade = RegraEscolhaHabilidade & { chave: string; quantidade: number; origem: string; nivel: number };

/** Concessões alcançadas; fichas antigas sem escolhas ficam pendentes, nunca recebem todas as opções. */
export function escolhasHabilidadesDisponiveis(ficha: ContextoEscolhasHabilidades): EscolhaHabilidade[] {
  const resultado: EscolhaHabilidade[] = [];
  for (const regra of ESCOLHAS_HABILIDADES) {
    if (regra.exigeOpcao && !temOpcaoHabilidade(ficha, regra.exigeOpcao.grupo, regra.exigeOpcao.nome)) continue;
    if (regra.talento) {
      ficha.features.filter((f) => (f.origin?.kind === "feat" || /^talento/i.test(f.source)) && norm(f.name) === norm(regra.talento!))
        .forEach((f, indice) => resultado.push({ ...regra, chave: `${regra.id}:${indice}`, quantidade: regra.niveis["1"], origem: f.source, nivel: 1 }));
      continue;
    }
    const classe = ficha.classes.find((c) => norm(c.name) === norm(regra.classe ?? ""));
    if (regra.classe && !classe) continue;
    if (regra.subclasse && findSubclassDef(classe!.name, classe!.subclass)?.name !== regra.subclasse) continue;
    const nivel = classe?.level ?? 1;
    const quantidade = Object.entries(regra.niveis).filter(([n]) => Number(n) <= nivel).sort((a, b) => Number(b[0]) - Number(a[0]))[0]?.[1] ?? 0;
    if (quantidade) resultado.push({ ...regra, chave: regra.id, quantidade, origem: regra.subclasse ?? regra.classe ?? regra.exigeOpcao?.nome ?? "Habilidade", nivel });
  }
  return resultado;
}

function temOpcaoHabilidade(ficha: ContextoEscolhasHabilidades, grupo: string, nome: string): boolean {
  return ESCOLHAS_HABILIDADES.filter((r) => r.grupo === grupo).some((r) =>
    Object.entries(ficha.escolhasHabilidades ?? {}).some(([chave, nomes]) =>
      (chave === r.id || chave.startsWith(`${r.id}:`)) && nomes.includes(nome)));
}

/** Motivo concreto para desabilitar uma opção; nível de pré-requisito é sempre o da classe. */
export function impedimentoOpcaoHabilidade(ficha: ContextoEscolhasHabilidades, escolha: EscolhaHabilidade, opcao: OpcaoHabilidade): string | null {
  if (escolha.fixas?.includes(opcao.nome)) return "Já concedida automaticamente.";
  const bruxo = ficha.classes.find((c) => norm(c.name) === "bruxo");
  const nivel = escolha.grupo === "invocacoes" ? bruxo?.level ?? 0 : escolha.nivel;
  if (opcao.nivel && nivel < opcao.nivel) return `Exige nível ${opcao.nivel} de ${escolha.grupo === "invocacoes" ? "Bruxo" : escolha.classe}.`;
  if (escolha.talento && escolha.grupo === "invocacoes" && !bruxo && (opcao.nivel || opcao.pacto || opcao.magia || opcao.maldicao)) return "Exige ser Bruxo e cumprir o pré-requisito.";
  if (opcao.pacto && !temOpcaoHabilidade(ficha, "pacto", opcao.pacto)) return `Exige ${opcao.pacto}.`;
  const magias = [...(ficha.spells?.cantrips ?? []), ...(ficha.spells?.known ?? [])].filter((m) => !m.granted?.startsWith("Escolha: ")).concat(magiasDasEscolhas(ficha));
  if (opcao.magia && !magias.some((m) => norm(m.name) === norm(opcao.magia!))) return `Exige ${opcao.magia}.`;
  if (opcao.maldicao && !magias.some((m) => norm(m.name) === "bruxaria") && !ficha.features.some((f) => norm(f.name) === "maldicao da lamina maldita") && !temOpcaoHabilidade(ficha, "invocacoes", "Sinal de Mau Agouro")) return "Exige Bruxaria ou uma característica que amaldiçoe.";
  for (const outra of escolhasHabilidadesDisponiveis(ficha)) {
    if (outra.chave !== escolha.chave && outra.grupo === escolha.grupo && ficha.escolhasHabilidades?.[outra.chave]?.includes(opcao.nome)) return `Já escolhida em ${outra.caracteristica} (${outra.origem}).`;
  }
  return null;
}

/** Limpa escolhas que perderam a origem, o nível ou o pré-requisito, preservando a ordem de aquisição. */
export function normalizarEscolhasHabilidades(ficha: ContextoEscolhasHabilidades): NonNullable<Sheet["escolhasHabilidades"]> {
  let escolhas = ficha.escolhasHabilidades ?? {};
  // Dependências podem desaparecer em cadeia (estilo → manobra; pacto → invocação).
  for (let rodada = 0; rodada < 4; rodada++) {
    const contexto = { ...ficha, escolhasHabilidades: escolhas };
    const proximas: NonNullable<Sheet["escolhasHabilidades"]> = {};
    for (const escolha of escolhasHabilidadesDisponiveis(contexto)) {
      const nomes = [...new Set(escolhas[escolha.chave] ?? [])].filter((nome) => {
        const opcao = escolha.opcoes.find((o) => o.nome === nome);
        return opcao && !impedimentoOpcaoHabilidade(contexto, escolha, opcao);
      }).slice(0, escolha.quantidade);
      if (nomes.length) proximas[escolha.chave] = nomes;
    }
    if (JSON.stringify(proximas) === JSON.stringify(escolhas)) return proximas;
    escolhas = proximas;
  }
  return escolhas;
}

export function escolhasHabilidadesPendentes(ficha: ContextoEscolhasHabilidades): EscolhaHabilidade[] {
  const escolhas = normalizarEscolhasHabilidades(ficha);
  return escolhasHabilidadesDisponiveis({ ...ficha, escolhasHabilidades: escolhas }).filter((e) => (escolhas[e.chave]?.length ?? 0) < e.quantidade);
}

/** Projeção para consulta: regras comuns + somente as opções realmente aprendidas. */
export function caracteristicasComEscolhas(ficha: ContextoEscolhasHabilidades): Feature[] {
  const escolhas = normalizarEscolhasHabilidades(ficha);
  const disponiveis = escolhasHabilidadesDisponiveis({ ...ficha, escolhasHabilidades: escolhas });
  const vistas = new Set<string>();
  const resultado = ficha.features.map((f) => {
    const origem = (r: EscolhaHabilidade) => r.talento
      ? f.origin?.kind === "feat" || /^talento/i.test(f.source)
      : f.origin?.name === (r.subclasse ?? r.classe) || f.source.startsWith(r.subclasse ?? r.classe ?? "\0");
    const principal = disponiveis.find((r) => origem(r) && r.dependentes?.some((d) => d.caracteristica === f.name));
    if (principal) {
      const dependente = principal.dependentes!.find((d) => d.caracteristica === f.name)!;
      const nomes = escolhas[principal.chave] ?? [];
      return { ...f, description: [dependente.resumo, ...(nomes.length ? nomes.map((n) => dependente.opcoes.find((o) => o.nome === n)!.descricao) : [`Escolha pendente em ${principal.caracteristica}.`])].join("\n\n") };
    }
    const regra = disponiveis.find((r) => !vistas.has(r.chave) && norm(r.caracteristica) === norm(f.name) &&
      (r.talento ? f.origin?.kind === "feat" || /^talento/i.test(f.source) : f.origin?.name === (r.subclasse ?? r.classe) || f.source.startsWith(r.subclasse ?? r.classe ?? "\0")));
    if (!regra) return f;
    vistas.add(regra.chave);
    const nomes = [...(regra.fixas ?? []), ...(escolhas[regra.chave] ?? [])];
    const faltam = regra.quantidade - (escolhas[regra.chave]?.length ?? 0);
    return { ...f, description: [regra.resumo, nomes.length ? `Opções aprendidas: ${nomes.join(", ")}.` : "", faltam > 0 ? `Escolha pendente: ${faltam} opção(ões).` : "", ...nomes.map((nome) => regra.opcoes.find((o) => o.nome === nome)!.descricao)].filter(Boolean).join("\n\n") };
  });
  // Escolhas concedidas por outra opção (Técnica Superior) não têm uma característica própria na ficha.
  for (const regra of disponiveis.filter((r) => r.exigeOpcao)) {
    const nomes = escolhas[regra.chave] ?? [];
    const concessao = disponiveis.find((r) => r.grupo === regra.exigeOpcao!.grupo && escolhas[r.chave]?.includes(regra.exigeOpcao!.nome));
    const origin: Feature["origin"] = concessao?.talento
      ? { kind: "feat", name: concessao.talento }
      : { kind: concessao?.subclasse ? "subclass" : "class", name: concessao?.subclasse ?? concessao?.classe ?? regra.origem };
    resultado.push({ name: regra.caracteristica, source: concessao?.origem ?? regra.origem, description: nomes.length ? nomes.map((n) => regra.opcoes.find((o) => o.nome === n)!.descricao).join("\n\n") : "Escolha pendente.", origin });
  }
  return resultado;
}

/** Magias aprendidas por uma opção; a seleção é validada antes da persistência. */
function magiasDasEscolhas(ficha: ContextoEscolhasHabilidades): Spell[] {
  return escolhasHabilidadesDisponiveis(ficha).flatMap((regra) => {
    if (!regra.conjuracao) return [];
    const conjuracao = regra.conjuracao;
    return (ficha.escolhasHabilidades?.[regra.chave] ?? []).flatMap((nome) => {
      const opcao = regra.opcoes.find((o) => o.nome === nome);
      return opcao?.concedeMagia ? [toGrantedSpell(opcao.concedeMagia, `Escolha: ${regra.caracteristica}`, conjuracao.classe, {
        ability: conjuracao.atributo,
        ...(conjuracao.ritual ? { free: "Somente como ritual por esta característica" } : { slots: true }),
      })] : [];
    });
  });
}

/** Atualiza apenas magias concedidas pelas escolhas, sem apagar as aprendidas de outras fontes. */
export function magiasComEscolhas(ficha: Sheet): Sheet["spells"] {
  const escolhasHabilidades = normalizarEscolhasHabilidades(ficha);
  const atuais = [...ficha.spells.cantrips, ...ficha.spells.known].filter((m) => !m.granted?.startsWith("Escolha: ") && m.granted !== "Alma Favorecida");
  const concedidas = magiasDasEscolhas({ ...ficha, escolhasHabilidades });
  const nomes = new Set(atuais.map((m) => norm(m.name)));
  const todas = [...atuais, ...concedidas.filter((m) => { const nome = norm(m.name); if (nomes.has(nome)) return false; nomes.add(nome); return true; })];
  return { ...ficha.spells, cantrips: todas.filter((m) => m.level === 0), known: todas.filter((m) => m.level > 0) };
}
