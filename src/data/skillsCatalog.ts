import {
  ABILITY_LABELS,
  SKILL_TO_ABILITY,
  type AbilityKey,
  type SkillName,
} from "@/lib/types";

/** Uma perícia de referência: nome e atributo associado. */
export type CatalogSkill = {
  name: SkillName;
  ability: AbilityKey;
  abilityLabel: string;
};

/**
 * Catálogo das 18 perícias do Livro do Jogador, derivado de SKILL_TO_ABILITY.
 * Mantém uma única fonte de verdade (os tipos em src/lib/types.ts).
 */
export const SKILLS_CATALOG: CatalogSkill[] = (
  Object.keys(SKILL_TO_ABILITY) as SkillName[]
)
  .map((name) => ({
    name,
    ability: SKILL_TO_ABILITY[name],
    abilityLabel: ABILITY_LABELS[SKILL_TO_ABILITY[name]],
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

export function skillsByAbility(ability: AbilityKey): CatalogSkill[] {
  return SKILLS_CATALOG.filter((s) => s.ability === ability);
}
