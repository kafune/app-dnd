import type { CatalogClass } from "@/lib/types";
import raw from "./classesCatalog.json";

/**
 * Catálogo das 12 classes do Livro do Jogador (PT-BR), extraído do Capítulo 3.
 * Cada entrada traz dado de vida, habilidade primária, salvaguardas, proficiências,
 * escolha de perícias, habilidade de conjuração (se houver) e subclasses.
 *
 * Gerado a partir do PDF; veja scripts/parse_classes.py.
 */
export const CLASSES_CATALOG = raw as CatalogClass[];

const BY_NAME = new Map<string, CatalogClass>(
  CLASSES_CATALOG.map((c) => [c.name.toLowerCase(), c]),
);

export function findClass(name: string): CatalogClass | undefined {
  return BY_NAME.get(name.trim().toLowerCase());
}

/** Características ganhas por uma classe até um dado nível (ordenadas por nível). */
export function classFeaturesUpTo(
  name: string,
  level: number,
): { name: string; level: number }[] {
  const cls = findClass(name);
  if (!cls) return [];
  const out: { name: string; level: number }[] = [];
  for (let lvl = 1; lvl <= level; lvl++) {
    for (const feat of cls.progression[String(lvl)] ?? []) {
      out.push({ name: feat, level: lvl });
    }
  }
  return out;
}
