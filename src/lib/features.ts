/**
 * Características da ficha separadas por origem.
 *
 * Na mesa a pergunta é sempre "de onde vem isso?": o que a raça deu, o que cada
 * classe (e subclasse) deu, o que veio de talento, do antecedente ou da mão do
 * Mestre. A ficha guarda tudo numa lista só, então o agrupamento é feito aqui.
 */
import { norm } from "./progression";
import type { Feature, Sheet } from "./types";

/** "Bardo", "Bardo 3", "Antecedente: Pirata" — a fonte escrita bate com este nome? */
function sourceMatches(source: string, name: string | undefined): boolean {
  if (!name) return false;
  const a = norm(source);
  const b = norm(name);
  return a === b || a.startsWith(`${b} `) || a.endsWith(`: ${b}`);
}

export type FeatureGroup = {
  key: string;
  label: string;
  features: Feature[];
};

/**
 * Agrupa as características na ordem em que o jogador pensa nelas: raça, cada
 * classe (com a subclasse dela junto), talentos, antecedente e o resto.
 */
export function groupFeatures(sheet: Pick<Sheet, "features" | "classes" | "raceInfo" | "species" | "background">): FeatureGroup[] {
  const groups: FeatureGroup[] = [];
  const used = new Set<Feature>();

  const add = (key: string, label: string, pick: (feature: Feature) => boolean) => {
    const features = sheet.features.filter((feature) => !used.has(feature) && pick(feature));
    for (const feature of features) used.add(feature);
    if (features.length > 0) groups.push({ key, label, features });
  };

  // Fichas antigas não têm `origin`: aí vale o que está escrito em `source`
  // ("Bardo 3", "Kenku", "Antecedente: Pirata"), que é de onde a ficha veio.
  const raceName = sheet.raceInfo?.race ?? sheet.species;
  const subraceName = sheet.raceInfo?.subrace;
  add(
    "raca",
    raceName ? `Raça: ${raceName}` : "Raça",
    (f) =>
      f.origin?.kind === "race" ||
      (!f.origin && (sourceMatches(f.source, raceName) || sourceMatches(f.source, subraceName))),
  );

  sheet.classes.forEach((entry, index) => {
    const label = [`Classe ${index + 1}: ${entry.name} ${entry.level}`, entry.subclass].filter(Boolean).join(" · ");
    add(`classe:${index}:${entry.name}`, label, (f) => {
      if (f.origin?.kind === "class") return norm(f.origin.name) === norm(entry.name);
      if (f.origin?.kind === "subclass") return !!entry.subclass && norm(f.origin.name) === norm(entry.subclass);
      if (f.origin) return false;
      return sourceMatches(f.source, entry.name) || sourceMatches(f.source, entry.subclass);
    });
  });

  add("talentos", "Talentos", (f) => f.origin?.kind === "feat" || (!f.origin && /^talento/i.test(f.source.trim())));
  add(
    "antecedente",
    sheet.background ? `Antecedente: ${sheet.background}` : "Antecedente",
    (f) =>
      f.origin?.kind === "background" ||
      (!f.origin && (/^antecedente/i.test(f.source.trim()) || sourceMatches(f.source, sheet.background))),
  );
  // Sobrou: homebrew do Mestre, classe/subclasse que saiu do catálogo e fichas antigas sem origem.
  add("outras", "Outras (Mestre e homebrew)", () => true);

  return groups;
}
