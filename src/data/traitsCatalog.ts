import type { CatalogTrait } from "@/lib/types";
import raw from "./traitsCatalog.json";

/**
 * Catálogo de traços raciais (de todas as raças) e talentos (feats), com descrição.
 * Conteúdo autorado (D&D 5e oficial / SRD, PT-BR) — veja scripts/build_extra_data.py.
 */
export const TRAITS_CATALOG = raw as CatalogTrait[];

const BY_NAME = new Map<string, CatalogTrait>(
  TRAITS_CATALOG.map((t) => [t.name.toLowerCase(), t]),
);

export function findTrait(name: string): CatalogTrait | undefined {
  return BY_NAME.get(name.trim().toLowerCase());
}

export const RACIAL_TRAITS = TRAITS_CATALOG.filter((t) => t.kind === "trait");
export const FEATS = TRAITS_CATALOG.filter((t) => t.kind === "talento");
