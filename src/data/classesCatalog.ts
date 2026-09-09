import type { CatalogClass, ClassDef, ClassFeatureDef, FeatureOrigin, SubclassDef } from "@/lib/types";
import raw from "./classesCatalog.json";
import { BARBARO } from "./classes/barbaro";
import { BARDO } from "./classes/bardo";
import { BRUXO } from "./classes/bruxo";
import { CLERIGO } from "./classes/clerigo";
import { DRUIDA } from "./classes/druida";
import { FEITICEIRO } from "./classes/feiticeiro";
import { GUERREIRO } from "./classes/guerreiro";
import { LADINO } from "./classes/ladino";
import { MAGO } from "./classes/mago";
import { MONGE } from "./classes/monge";
import { PALADINO } from "./classes/paladino";
import { PATRULHEIRO } from "./classes/patrulheiro";

/**
 * Catálogo das 12 classes do Livro do Jogador (PT-BR).
 *
 * - `CLASSES_CATALOG` (do JSON extraído do PDF, scripts/parse_classes.py): dado de vida,
 *   habilidade primária, salvaguardas, proficiências e escolha de perícias.
 * - `CLASS_DEFS` (src/data/classes/*.ts, autorado a partir dos livros): progressão completa
 *   de características com descrição (níveis 1–20), subclasses do PHB/Xanathar/Tasha e
 *   regras de multiclasse.
 */
export const CLASSES_CATALOG = raw as CatalogClass[];

export const CLASS_DEFS: ClassDef[] = [
  BARBARO,
  BARDO,
  BRUXO,
  CLERIGO,
  DRUIDA,
  FEITICEIRO,
  GUERREIRO,
  LADINO,
  MAGO,
  MONGE,
  PALADINO,
  PATRULHEIRO,
];

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

const BY_NAME = new Map<string, CatalogClass>(CLASSES_CATALOG.map((c) => [norm(c.name), c]));
const DEF_BY_NAME = new Map<string, ClassDef>(CLASS_DEFS.map((c) => [norm(c.name), c]));

export function findClass(name: string): CatalogClass | undefined {
  return BY_NAME.get(norm(name));
}

export function findClassDef(name: string): ClassDef | undefined {
  return DEF_BY_NAME.get(norm(name));
}

/** Subclasse pelo nome (tolera prefixos como "Círculo da Terra (Ártico)" → "Círculo da Terra"). */
export function findSubclassDef(className: string, subclass: string | undefined): SubclassDef | undefined {
  if (!subclass) return undefined;
  const def = findClassDef(className);
  if (!def) return undefined;
  const q = norm(subclass);
  return (
    def.subclasses.find((s) => norm(s.name) === q) ??
    def.subclasses.find((s) => q.startsWith(norm(s.name)) || norm(s.name).startsWith(q)) ??
    def.subclasses.find((s) => q.includes(norm(s.name)))
  );
}

/** Nomes das subclasses de uma classe (todas as fontes). */
export function subclassNames(className: string): string[] {
  return findClassDef(className)?.subclasses.map((s) => s.name) ?? [];
}

export type ClassFeatureWithOrigin = ClassFeatureDef & { origin: FeatureOrigin };

/**
 * Características ganhas por uma classe (base + subclasse) até um dado nível,
 * ordenadas por nível. A subclasse só contribui a partir do nível em que é escolhida.
 */
export function classFeaturesUpTo(
  className: string,
  level: number,
  subclass?: string,
): ClassFeatureWithOrigin[] {
  const def = findClassDef(className);
  if (!def) return [];
  const out: ClassFeatureWithOrigin[] = [];
  for (const f of def.features) {
    if (f.level <= level) out.push({ ...f, origin: { kind: "class", name: def.name, level: f.level } });
  }
  const sub = findSubclassDef(className, subclass);
  if (sub && level >= def.subclassLevel) {
    for (const f of sub.features) {
      if (f.level <= level) out.push({ ...f, origin: { kind: "subclass", name: sub.name, level: f.level } });
    }
  }
  return out.sort((a, b) => a.level - b.level);
}

/** Níveis em que a classe concede "Incremento no Valor de Habilidade". */
export function asiLevels(className: string): number[] {
  const def = findClassDef(className);
  if (!def) return [4, 8, 12, 16, 19];
  return def.features.filter((f) => f.asi).map((f) => f.level);
}
