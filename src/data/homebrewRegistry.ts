import type { HomebrewItem } from "@/lib/types";

/**
 * Conteúdo homebrew criado pelo Mestre (raças, talentos e traços raciais), vindo de
 * `GET /api/homebrew` e do SSE. Fica num registro de módulo para que as buscas de
 * catálogo (`findRace`, `findFeat`…) enxerguem o homebrew sem depender de React.
 * A store atualiza o registro; `version` invalida os caches dos catálogos e os
 * componentes re-renderizam assinando `homebrew` na store.
 */
let items: readonly HomebrewItem[] = [];
let version = 0;

export function setHomebrewItems(next: readonly HomebrewItem[]): void {
  items = next;
  version += 1;
}

export function homebrewItems(): readonly HomebrewItem[] {
  return items;
}

export function homebrewVersion(): number {
  return version;
}
