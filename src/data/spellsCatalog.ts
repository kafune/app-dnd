import type { CatalogSpell, Spell, SpellClass, SpellSource } from "@/lib/types";
import raw from "./spellsCatalog.json";

/**
 * Catálogo de magias extraído dos livros de regras (PT-BR):
 *  - PHB  → Livro do Jogador (2014)
 *  - XGtE → Guia de Xanathar para Todas as Coisas
 *  - TCoE → Caldeirão de Tasha para Tudo
 *
 * Gerado a partir dos PDFs; ordenado por nível e depois por nome.
 * Para regenerar, veja scripts/parse_spells.py e depois scripts/fix_spells.py
 * (que separa as magias que o OCR do Xanathar grudou umas nas outras).
 */
export const SPELLS_CATALOG = raw as CatalogSpell[];

/** Índice por nome normalizado (minúsculas) para busca rápida. */
const BY_NAME = new Map<string, CatalogSpell>(
  SPELLS_CATALOG.map((s) => [s.name.toLowerCase(), s]),
);

export function findSpell(name: string): CatalogSpell | undefined {
  return BY_NAME.get(name.trim().toLowerCase());
}

export function spellsByLevel(level: number): CatalogSpell[] {
  return SPELLS_CATALOG.filter((s) => s.level === level);
}

export function spellsBySource(source: SpellSource): CatalogSpell[] {
  return SPELLS_CATALOG.filter((s) => s.source === source);
}

export function spellsByClass(cls: SpellClass): CatalogSpell[] {
  return SPELLS_CATALOG.filter((s) => s.classes.includes(cls));
}

/**
 * A ficha guarda uma cópia da magia de quando foi escolhida. Se o catálogo foi
 * corrigido depois (texto de outra magia grudado, círculo errado), a cópia antiga
 * continuaria errada na ficha: para magias do catálogo, vale o que está nele.
 * Magias homebrew (fora do catálogo) e os campos da ficha (preparada, origem,
 * conjuração de talento) ficam como estão.
 */
export function withCatalogData<T extends Spell>(spell: T): T {
  const book = findSpell(spell.name);
  if (!book) return spell;
  return {
    ...spell,
    level: book.level,
    school: book.school,
    castingTime: book.castingTime,
    range: book.range,
    components: book.components,
    duration: book.duration,
    description: book.description,
    ritual: book.ritual,
    concentration: book.concentration,
  };
}
