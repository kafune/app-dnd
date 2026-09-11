import { SKILL_TO_ABILITY, type SkillName } from "./types";
import type { SkillBudgetPart } from "./progression";

export const ALL_SKILL_NAMES: SkillName[] = (Object.keys(SKILL_TO_ABILITY) as SkillName[]).sort((a, b) =>
  a.localeCompare(b, "pt-BR"),
);

/**
 * As perícias escolhidas cabem nas "vagas" de cada parte do orçamento? Cada parte
 * (classe, multiclasse, antecedente, talento) tem N vagas restritas à sua lista; é um
 * emparelhamento bipartido pequeno (no máximo ~10 vagas), resolvido por backtracking.
 */
export function skillSelectionFits(selected: readonly SkillName[], parts: readonly SkillBudgetPart[]): boolean {
  if (selected.length > parts.reduce((total, part) => total + part.count, 0)) return false;
  const slots = parts.flatMap((part) =>
    Array.from({ length: part.count }, () => new Set<SkillName>(part.from ?? ALL_SKILL_NAMES)),
  );
  const ordered = [...selected].sort(
    (a, b) => slots.filter((slot) => slot.has(a)).length - slots.filter((slot) => slot.has(b)).length,
  );
  const used = new Set<number>();
  const place = (index: number): boolean => {
    if (index >= ordered.length) return true;
    for (let slot = 0; slot < slots.length; slot += 1) {
      if (used.has(slot) || !slots[slot].has(ordered[index])) continue;
      used.add(slot);
      if (place(index + 1)) return true;
      used.delete(slot);
    }
    return false;
  };
  return place(0);
}

function shortLabel(part: SkillBudgetPart): string {
  if (part.rule === "background") return "Antecedente";
  if (part.rule === "feat") return part.label.replace(/^Talento:\s*/, "");
  return part.label.replace(/\s*\(multiclasse.*\)$/, "");
}

/** Para cada perícia, as fontes que permitem escolhê-la ("Monge", "Druida", "Antecedente"…). */
export function skillAllowedBy(parts: readonly SkillBudgetPart[]): Map<SkillName, string[]> {
  const out = new Map<SkillName, string[]>();
  for (const part of parts) {
    const label = shortLabel(part);
    for (const skill of part.from ?? ALL_SKILL_NAMES) {
      const list = out.get(skill) ?? [];
      if (!list.includes(label)) list.push(label);
      out.set(skill, list);
    }
  }
  return out;
}
