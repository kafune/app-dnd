import { findItem } from "@/data/itemsCatalog";
import type { Item } from "./types";

function norm(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Item do inventário a partir de um nome: usa o nome e o resumo do catálogo quando o item existe nele. */
export function itemFromName(name: string, quantity = 1): Item {
  const catalog = findItem(name);
  return catalog ? { name: catalog.name, description: catalog.detail, quantity } : { name, quantity };
}

/** Junta itens somando a quantidade dos que têm o mesmo nome (sem acento/caixa). */
export function mergeItems(existing: readonly Item[], additions: readonly Item[]): Item[] {
  const next = existing.map((item) => ({ ...item }));
  for (const addition of additions) {
    const found = next.find((item) => norm(item.name) === norm(addition.name));
    if (found) found.quantity = (found.quantity ?? 1) + (addition.quantity ?? 1);
    else next.push({ ...addition });
  }
  return next;
}
