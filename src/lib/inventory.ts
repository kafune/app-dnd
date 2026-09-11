/**
 * Inventário agrupado por categoria (armas, armaduras, itens mágicos, kits…).
 *
 * Ordem da inferência: categoria escolhida à mão → sinais de item mágico no nome
 * (+1, poção, varinha…) → categoria do catálogo do Livro do Jogador → palavras-chave.
 */
import { findItem, type ItemCategory } from "@/data/itemsCatalog";
import type { InventoryCategory, Item } from "./types";

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategory, string> = {
  armas: "Armas e munição",
  armaduras: "Armaduras e escudos",
  magicos: "Itens mágicos",
  kits: "Kits e pacotes",
  ferramentas: "Ferramentas e instrumentos",
  consumiveis: "Consumíveis",
  materiais: "Materiais e equipamento",
  tesouro: "Tesouros e valores",
  outros: "Outros",
};

export const INVENTORY_CATEGORY_ORDER: InventoryCategory[] = [
  "armas",
  "armaduras",
  "magicos",
  "kits",
  "ferramentas",
  "consumiveis",
  "materiais",
  "tesouro",
  "outros",
];

const CATALOG_TO_GROUP: Record<ItemCategory, InventoryCategory> = {
  "Arma simples": "armas",
  "Arma marcial": "armas",
  "Munição": "armas",
  "Armadura leve": "armaduras",
  "Armadura média": "armaduras",
  "Armadura pesada": "armaduras",
  "Escudo": "armaduras",
  "Pacote": "kits",
  "Kit": "kits",
  "Ferramenta": "ferramentas",
  "Instrumento musical": "ferramentas",
  "Foco de conjuração": "materiais",
  "Equipamento de aventura": "materiais",
};

function norm(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

const MAGIC_NAME_RE =
  /(^|\s)\+[1-3]\b|\bmagic[oa]s?\b|encantad|\bpocao\b|\bpocoes\b|pergaminho de magia|\bvarinha|\bbastao (de|do|da)\b|\bcajado (de|do|da)\b|\bartefato|\bsintonia\b|mochila de carga|bolsa devoradora|saco de guardar|capa elfica|botas elficas|\bde protecao\b|\bda protecao\b/;
const MAGIC_DESCRIPTION_RE = /\bmagic[oa]s?\b|encantad|\bsintonia\b/;
const CONSUMABLE_RE =
  /\bracao\b|\bracoes\b|comida|\bagua\b|\bodre\b|\bvinho|cerveja|\boleo\b|\btochas?\b|\bvelas?\b|antidoto|\bacido\b|fogo alquimico|\bveneno\b|bandagem|curativo|\berva|provis|\bpao\b|\bqueijo\b|\bcarne\b/;
const ARMOR_RE = /armadura|escudo|\bcota\b|couro batido|gibao|brunea|peitoral|meia-armadura|\bplacas\b|\belmo\b/;
const WEAPON_RE =
  /espada|\barcos?\b|\bbestas?\b|machad|martelo de guerra|martelo leve|adaga|rapieira|\blancas?\b|clava|\bmacas?\b|mangual|cimitarra|tridente|chicote|azagaia|dardo|\bfundas?\b|glaive|alabarda|\bpiques?\b|picareta de guerra|porrete|bordao|foice|zarabatana|\bredes?\b|flecha|virote|agulhas? de zarabatana|balas? de funda|municao|katana|punhal|\bfaca\b/;
const TOOL_RE =
  /ferrament|instrumento|alaude|flauta|tambor|\blira\b|gaita|trompa|viola|xalmas|dulcimer|suprimentos de|utensilios de|\bjogo de\b|baralho|\bdados\b|xadrez/;
const KIT_RE = /^kit\b|\bpacote\b|\bestojo\b/;
const TREASURE_RE =
  /\bgemas?\b|\bjoias?\b|pedras? preciosas?|diamante|\brubi|safira|esmeralda|perola|lingote|\bmoedas\b|obra de arte|estatueta|\bcolar\b|brinco|pulseira|\baneis\b|\banel\b|\bcoroa\b|calice/;

/** Categoria de um item do inventário (manual ou inferida). */
export function inventoryCategory(item: Item): InventoryCategory {
  if (item.category && item.category in INVENTORY_CATEGORY_LABELS) return item.category;
  const name = norm(item.name);
  const description = norm(item.description ?? "");
  if (MAGIC_NAME_RE.test(name) || MAGIC_DESCRIPTION_RE.test(description)) return "magicos";
  const catalog = findItem(item.name);
  if (catalog) {
    const group = CATALOG_TO_GROUP[catalog.category];
    if (group === "materiais" && CONSUMABLE_RE.test(name)) return "consumiveis";
    return group;
  }
  if (ARMOR_RE.test(name)) return "armaduras";
  if (WEAPON_RE.test(name)) return "armas";
  if (TOOL_RE.test(name)) return "ferramentas";
  if (KIT_RE.test(name)) return "kits";
  if (CONSUMABLE_RE.test(name)) return "consumiveis";
  if (TREASURE_RE.test(name)) return "tesouro";
  return name ? "materiais" : "outros";
}

export type InventoryGroup = {
  category: InventoryCategory;
  label: string;
  /** Itens com o índice original em `inventory.items` (para editar/remover). */
  entries: { item: Item; index: number }[];
};

/** Itens separados por categoria, na ordem de exibição (só grupos com itens). */
export function groupInventory(items: readonly Item[]): InventoryGroup[] {
  const byCategory = new Map<InventoryCategory, { item: Item; index: number }[]>();
  items.forEach((item, index) => {
    const category = inventoryCategory(item);
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category)!.push({ item, index });
  });
  return INVENTORY_CATEGORY_ORDER.filter((category) => byCategory.has(category)).map((category) => ({
    category,
    label: INVENTORY_CATEGORY_LABELS[category],
    entries: byCategory.get(category)!,
  }));
}
