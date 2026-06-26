import type { CatalogBackground } from "@/lib/types";
import raw from "./backgroundsCatalog.json";

/**
 * Catálogo de antecedentes de D&D 5e (PT-BR): Livro do Jogador, Guia de
 * Aventureiros da Costa da Espada e alguns caseiros. Cada entrada traz as
 * perícias, ferramentas, idiomas, equipamento e o Recurso do antecedente.
 *
 * Conteúdo autorado a partir das fontes oficiais (SRD/PHB) e do blog
 * Segredos de Alancia para os antecedentes caseiros.
 */
export const BACKGROUNDS_CATALOG = (raw as CatalogBackground[])
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

const BY_NAME = new Map<string, CatalogBackground>(
  BACKGROUNDS_CATALOG.map((b) => [b.name.toLowerCase(), b]),
);

export function findBackground(name: string): CatalogBackground | undefined {
  return BY_NAME.get(name.trim().toLowerCase());
}
