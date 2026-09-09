import { SKILL_TO_ABILITY, type AbilityKey, type CatalogBackground, type SkillName } from "@/lib/types";
import raw from "./backgroundsCatalog.json";

/** Catálogo de antecedentes, ordenado para os seletores da criação e edição. */
export const BACKGROUNDS_CATALOG = (raw as CatalogBackground[])
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

const BY_NAME = new Map<string, CatalogBackground>(
  BACKGROUNDS_CATALOG.map((background) => [background.name.toLowerCase(), background]),
);

export function findBackground(name: string): CatalogBackground | undefined {
  return BY_NAME.get(name.trim().toLowerCase());
}

const ALL_SKILLS = Object.keys(SKILL_TO_ABILITY) as SkillName[];

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function skillsIn(text: string): SkillName[] {
  const normalized = normalize(text);
  return ALL_SKILLS.filter((skill) => normalized.includes(normalize(skill))).sort(
    (a, b) => normalized.indexOf(normalize(a)) - normalized.indexOf(normalize(b)),
  );
}

const WORD_NUM: Record<string, number> = {
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  três: 3,
};

export type BackgroundSkills = { fixed: SkillName[]; choose: number; from: SkillName[] };

/** Interpreta as perícias fixas e escolhas descritas pelo antecedente. */
export function backgroundSkills(bg: CatalogBackground | undefined): BackgroundSkills {
  if (!bg) return { fixed: [], choose: 0, from: [] };
  const text = bg.skills;
  const normalized = normalize(text);
  const allChoice = /^(um|uma|dois|duas|tres)\s+entre\s+/.exec(normalized);
  if (allChoice) {
    return { fixed: [], choose: WORD_NUM[allChoice[1]] ?? 1, from: skillsIn(text) };
  }

  const choice = /\b(uma|um|duas|dois)\s+(entre|pericia|perícia)\b/.exec(normalized);
  if (!choice) return { fixed: skillsIn(text), choose: 0, from: [] };

  const index = normalized.indexOf(choice[0]);
  const before = text.slice(0, index);
  const after = text.slice(index);
  const fixed = skillsIn(before);
  let from = skillsIn(after).filter((skill) => !fixed.includes(skill));
  if (from.length === 0) {
    const abilities: AbilityKey[] = [];
    const normalizedAfter = normalize(after);
    if (/\bint\b/.test(normalizedAfter)) abilities.push("int");
    if (/\bsab\b/.test(normalizedAfter)) abilities.push("wis");
    if (/\bcar\b/.test(normalizedAfter)) abilities.push("cha");
    if (/\bfor\b/.test(normalizedAfter)) abilities.push("str");
    if (/\bdes\b/.test(normalizedAfter)) abilities.push("dex");
    if (/\bcon\b/.test(normalizedAfter)) abilities.push("con");
    from = ALL_SKILLS.filter(
      (skill) => (abilities.length === 0 || abilities.includes(SKILL_TO_ABILITY[skill])) && !fixed.includes(skill),
    );
  }
  return { fixed, choose: WORD_NUM[choice[1]] ?? 1, from };
}

/** Quantos idiomas adicionais o antecedente concede. */
export function backgroundLanguages(bg: CatalogBackground | undefined): number {
  const normalized = normalize(bg?.languages ?? "");
  const match = /^(um|uma|dois|duas|tres)\b/.exec(normalized);
  return match ? (WORD_NUM[match[1]] ?? 0) : 0;
}
