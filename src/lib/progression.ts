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
  ABILITY_ORDER,
  type AbilityKey,
  type AbilityScores,
  type AsiDecision,
  type Character,
  type ClassEntry,
  type Feature,
  type FeatureResource,
  type RaceTraitDef,
  type Resource,
  type SkillName,
  type Spell,
  type SpellClass,
  type SpellSlot,
} from "./types";
import {
  asiLevels,
  classFeaturesUpTo,
  findClass,
  findClassDef,
  findSubclassDef,
  type ClassFeatureWithOrigin,
} from "@/data/classesCatalog";
import { findSpell } from "@/data/spellsCatalog";
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

/** Magias concedidas por subclasse (domínio/juramento/círculo/patrono) até o nível — sempre preparadas. */
export function grantedSpellsFor(cls: { name: string; level: number; subclass?: string }): Spell[] {
  const sub = findSubclassDef(cls.name, cls.subclass);
  const def = findClassDef(cls.name);
  if (!sub?.spells || !def || cls.level < def.subclassLevel) return [];
  const out: Spell[] = [];
  const seen = new Set<string>();
  for (const [lvl, names] of Object.entries(sub.spells)) {
    if (Number(lvl) > cls.level) continue;
    for (const name of names) {
      const s = findSpell(name);
      const key = norm(name);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(
        s
          ? { ...toSheetSpell(s), classSource: cls.name, granted: sub.name }
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
              granted: sub.name,
            },
      );
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

/** Todas as características de classe/subclasse da lista de classes (com origem). */
export function classFeaturesFor(classes: ClassEntry[]): Feature[] {
  const out: Feature[] = [];
  for (const c of classes) {
    if (!c.name.trim()) continue;
    for (const f of classFeaturesUpTo(c.name, c.level, c.subclass)) {
      if (f.asi) continue; // o ASI vira decisão (atributos × talento), não característica
      out.push(toFeature(f));
    }
  }
  return out;
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

/** Recursos rastreáveis dos traços raciais (ex.: Bênção da Rainha Corvo = bônus de proficiência por descanso longo). */
export function raceResourcesFor(
  traits: RaceTraitDef[],
  totalLevel: number,
  scores: AbilityScores,
  raceName: string,
): Resource[] {
  const prof = proficiencyBonusForLevel(totalLevel);
  return traits.flatMap((trait) => {
    if (!trait.resource) return [];
    const max = resourceMax(trait.resource, Math.max(1, totalLevel), scores, prof);
    return [
      {
        name: trait.resource.name ?? trait.name,
        current: max,
        max,
        recharge: trait.resource.recharge,
        description: `${raceName || "Raça"}: ${trait.name}`,
      },
    ];
  });
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
    n += FEAT_SKILL_CHOICES[norm(f.name)] ?? 0;
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

  // --- características
  const prevAuto = classFeaturesFor(prevClasses);
  const nextAuto = classFeaturesFor(nextClasses);
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

  // --- magias concedidas por subclasse
  const grantedNext = nextClasses.flatMap(grantedSpellsFor);
  const known = sheet.spells.known.filter((s) => !s.granted || grantedNext.some((g) => norm(g.name) === norm(s.name)));
  for (const g of grantedNext) if (!known.some((s) => norm(s.name) === norm(g.name))) known.push(g);

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
    const isAuto = /^[^:]+: /.test(r.description ?? "") && classResourcesFor(prevClasses, sheet.abilityScores).some((p) => norm(p.name) === norm(r.name));
    return !isAuto || autoRes.some((a) => norm(a.name) === norm(r.name));
  });
  for (const a of autoRes) {
    const i = resources.findIndex((r) => norm(r.name) === norm(a.name));
    if (i === -1) resources.push(a);
    else {
      const used = Math.max(0, resources[i].max - resources[i].current);
      resources[i] = { ...resources[i], max: a.max, current: Math.max(0, a.max - used), recharge: a.recharge };
    }
  }

  // --- recursos de traços raciais que escalam com o nível (ex.: bônus de proficiência)
  const race = sheet.raceInfo ? resolveRace(sheet.raceInfo.race, sheet.raceInfo.subrace) : undefined;
  if (race) {
    for (const raceResource of raceResourcesFor(race.traits, nextLevel, scores, race.race.name)) {
      const index = resources.findIndex((r) => norm(r.name) === norm(raceResource.name));
      if (index === -1) continue; // removido da ficha à mão: respeita
      const used = Math.max(0, resources[index].max - resources[index].current);
      resources[index] = { ...resources[index], max: raceResource.max, current: Math.max(0, raceResource.max - used) };
    }
  }

  // --- bônus de proficiência e CD/ataque de magia
  const profBonus = proficiencyBonusForLevel(nextLevel);
  const caps = allSpellCaps(nextClasses, scores);
  const prevCaps = allSpellCaps(prevClasses, sheet.abilityScores);
  const castAbility = caps[0]?.profile.ability ?? sheet.spells.castingAbility;
  const spellsBlock = {
    ...sheet.spells,
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
    resources,
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
  const prof = proficiencyBonusForLevel(totalLevelOf(sheet.classes));
  const cast = sheet.spells.castingAbility;
  return {
    ...character,
    sheet: {
      ...sheet,
      abilityScores: scores,
      features,
      advancement,
      spells: { ...sheet.spells, saveDC: 8 + prof + abilityMod(scores[cast]), attackMod: prof + abilityMod(scores[cast]) },
      initiativeBonus: abilityMod(scores.dex),
    },
  };
}

/** Valor numérico do dado de vida ("d10" -> 10). Default d8. */
export function hitDieValue(hitDie: string): number {
  const m = /d(\d+)/i.exec(hitDie ?? "");
  return m ? Number(m[1]) : 8;
}
