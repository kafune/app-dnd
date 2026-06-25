import type { CatalogRace } from "@/lib/types";
import raw from "./racesCatalog.json";

/**
 * Catálogo das 9 raças do Livro do Jogador (PT-BR), extraído do Capítulo 2.
 * Cada entrada traz incremento de atributos, tamanho, deslocamento, idiomas,
 * nomes de traços raciais e sub-raças (com seus próprios incrementos).
 *
 * Gerado a partir do PDF; veja scripts/parse_races.py.
 */
export const RACES_CATALOG = raw as CatalogRace[];

const BY_NAME = new Map<string, CatalogRace>(
  RACES_CATALOG.map((r) => [r.name.toLowerCase(), r]),
);

export function findRace(name: string): CatalogRace | undefined {
  return BY_NAME.get(name.trim().toLowerCase());
}
