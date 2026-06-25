import type { CatalogSpell, SpellClass, SpellSource } from "@/lib/types";
import raw from "./spellsCatalog.json";

/**
 * Catálogo de magias extraído dos livros de regras (PT-BR):
 *  - PHB  → Livro do Jogador (2014)
 *  - XGtE → Guia de Xanathar para Todas as Coisas
 *  - TCoE → Caldeirão de Tasha para Tudo
 *
 * Gerado a partir dos PDFs; ordenado por nível e depois por nome.
 * Para regenerar, veja scripts/parse_spells.py.
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
