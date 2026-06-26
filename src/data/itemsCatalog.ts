/**
 * Catálogo de presets de equipamento (D&D 5e, PT-BR / SRD): armas, armaduras e
 * escudos com preço, dano/CA e propriedades. Usado para adicionar itens prontos
 * ao inventário na criação e edição da ficha.
 *
 * Os valores de armadura/escudo vêm das tabelas do Livro do Jogador; as armas
 * usam as estatísticas oficiais (dano e propriedades).
 */

export type ItemCategory =
  | "Arma simples"
  | "Arma marcial"
  | "Armadura leve"
  | "Armadura média"
  | "Armadura pesada"
  | "Escudo";

export type CatalogItem = {
  name: string;
  category: ItemCategory;
  /** Preço em moedas (texto, ex.: "10 po"). */
  price: string;
  /** Resumo: dano + propriedades (armas) ou CA + requisitos (armaduras). */
  detail: string;
};

export const ITEMS_CATALOG: CatalogItem[] = [
  // === Armas simples (corpo a corpo) ===
  { name: "Clava", category: "Arma simples", price: "1 pp", detail: "1d4 concussão · Leve" },
  { name: "Adaga", category: "Arma simples", price: "2 po", detail: "1d4 perfurante · Acuidade, leve, arremesso (6/18 m)" },
  { name: "Tacape", category: "Arma simples", price: "2 pp", detail: "1d8 concussão · Duas mãos" },
  { name: "Machadinha", category: "Arma simples", price: "5 po", detail: "1d6 cortante · Leve, arremesso (6/18 m)" },
  { name: "Azagaia", category: "Arma simples", price: "5 pp", detail: "1d6 perfurante · Arremesso (9/36 m)" },
  { name: "Martelo Leve", category: "Arma simples", price: "2 po", detail: "1d4 concussão · Leve, arremesso (6/18 m)" },
  { name: "Maça", category: "Arma simples", price: "5 po", detail: "1d6 concussão" },
  { name: "Bordão", category: "Arma simples", price: "2 pp", detail: "1d6 concussão · Versátil (1d8)" },
  { name: "Foice Curta", category: "Arma simples", price: "1 po", detail: "1d4 cortante · Leve" },
  { name: "Lança", category: "Arma simples", price: "1 po", detail: "1d6 perfurante · Arremesso (6/18 m), versátil (1d8)" },
  // === Armas simples (à distância) ===
  { name: "Besta Leve", category: "Arma simples", price: "25 po", detail: "1d8 perfurante · Munição (24/96 m), recarga, duas mãos" },
  { name: "Dardo", category: "Arma simples", price: "5 pc", detail: "1d4 perfurante · Acuidade, arremesso (6/18 m)" },
  { name: "Arco Curto", category: "Arma simples", price: "25 po", detail: "1d6 perfurante · Munição (24/96 m), duas mãos" },
  { name: "Funda", category: "Arma simples", price: "1 pp", detail: "1d4 concussão · Munição (9/36 m)" },

  // === Armas marciais (corpo a corpo) ===
  { name: "Machado de Batalha", category: "Arma marcial", price: "10 po", detail: "1d8 cortante · Versátil (1d10)" },
  { name: "Mangual", category: "Arma marcial", price: "10 po", detail: "1d8 concussão" },
  { name: "Glaive", category: "Arma marcial", price: "20 po", detail: "1d10 cortante · Pesada, alcance, duas mãos" },
  { name: "Machado Grande", category: "Arma marcial", price: "30 po", detail: "1d12 cortante · Pesada, duas mãos" },
  { name: "Espada Grande", category: "Arma marcial", price: "50 po", detail: "2d6 cortante · Pesada, duas mãos" },
  { name: "Alabarda", category: "Arma marcial", price: "20 po", detail: "1d10 cortante · Pesada, alcance, duas mãos" },
  { name: "Lança Montada", category: "Arma marcial", price: "10 po", detail: "1d12 perfurante · Alcance, especial" },
  { name: "Espada Longa", category: "Arma marcial", price: "15 po", detail: "1d8 cortante · Versátil (1d10)" },
  { name: "Marreta", category: "Arma marcial", price: "10 po", detail: "2d6 concussão · Pesada, duas mãos" },
  { name: "Maça Estrela", category: "Arma marcial", price: "15 po", detail: "1d8 perfurante" },
  { name: "Pique", category: "Arma marcial", price: "5 po", detail: "1d10 perfurante · Pesada, alcance, duas mãos" },
  { name: "Florete", category: "Arma marcial", price: "25 po", detail: "1d8 perfurante · Acuidade" },
  { name: "Cimitarra", category: "Arma marcial", price: "25 po", detail: "1d6 cortante · Acuidade, leve" },
  { name: "Espada Curta", category: "Arma marcial", price: "10 po", detail: "1d6 perfurante · Acuidade, leve" },
  { name: "Tridente", category: "Arma marcial", price: "5 po", detail: "1d6 perfurante · Arremesso (6/18 m), versátil (1d8)" },
  { name: "Picareta de Guerra", category: "Arma marcial", price: "5 po", detail: "1d8 perfurante" },
  { name: "Martelo de Guerra", category: "Arma marcial", price: "15 po", detail: "1d8 concussão · Versátil (1d10)" },
  { name: "Chicote", category: "Arma marcial", price: "2 po", detail: "1d4 cortante · Acuidade, alcance" },
  // === Armas marciais (à distância) ===
  { name: "Zarabatana", category: "Arma marcial", price: "10 po", detail: "1 perfurante · Munição (7,5/30 m), recarga" },
  { name: "Besta de Mão", category: "Arma marcial", price: "75 po", detail: "1d6 perfurante · Munição (9/36 m), leve, recarga" },
  { name: "Besta Pesada", category: "Arma marcial", price: "50 po", detail: "1d10 perfurante · Munição (30/120 m), pesada, recarga, duas mãos" },
  { name: "Arco Longo", category: "Arma marcial", price: "50 po", detail: "1d8 perfurante · Munição (45/180 m), pesada, duas mãos" },

  // === Armaduras leves ===
  { name: "Armadura Acolchoada", category: "Armadura leve", price: "5 po", detail: "CA 11 + Des · Furtividade em desvantagem · 4 kg" },
  { name: "Armadura de Couro", category: "Armadura leve", price: "10 po", detail: "CA 11 + Des · 5 kg" },
  { name: "Couro Batido", category: "Armadura leve", price: "45 po", detail: "CA 12 + Des · 6,5 kg" },

  // === Armaduras médias ===
  { name: "Gibão de Peles", category: "Armadura média", price: "10 po", detail: "CA 12 + Des (máx. +2) · 6 kg" },
  { name: "Camisão de Malha", category: "Armadura média", price: "50 po", detail: "CA 13 + Des (máx. +2) · 10 kg" },
  { name: "Brunea", category: "Armadura média", price: "50 po", detail: "CA 14 + Des (máx. +2) · Furtividade em desvantagem · 22,5 kg" },
  { name: "Peitoral", category: "Armadura média", price: "400 po", detail: "CA 14 + Des (máx. +2) · 10 kg" },
  { name: "Meia-Armadura", category: "Armadura média", price: "750 po", detail: "CA 15 + Des (máx. +2) · Furtividade em desvantagem · 20 kg" },

  // === Armaduras pesadas ===
  { name: "Cota de Anéis", category: "Armadura pesada", price: "30 po", detail: "CA 14 · Furtividade em desvantagem · 20 kg" },
  { name: "Cota de Malha", category: "Armadura pesada", price: "75 po", detail: "CA 16 · For 13 · Furtividade em desvantagem · 27,5 kg" },
  { name: "Cota de Talas", category: "Armadura pesada", price: "200 po", detail: "CA 17 · For 15 · Furtividade em desvantagem · 30 kg" },
  { name: "Armadura de Placas", category: "Armadura pesada", price: "1.500 po", detail: "CA 18 · For 15 · Furtividade em desvantagem · 32,5 kg" },

  // === Escudos ===
  { name: "Broquel", category: "Escudo", price: "5 po", detail: "CA +1 · Especial: ocupa uma mão; perde o bônus ao conjurar com essa mão · 0,9 kg" },
  { name: "Escudo", category: "Escudo", price: "10 po", detail: "CA +2 · 3 kg" },
  { name: "Escudo de Torre", category: "Escudo", price: "50 po", detail: "CA +3 · For 13 · Furtividade em desvantagem · 6,75 kg" },
];

export const ITEM_CATEGORY_ORDER: ItemCategory[] = [
  "Arma simples",
  "Arma marcial",
  "Armadura leve",
  "Armadura média",
  "Armadura pesada",
  "Escudo",
];

/** Nomes das armas simples (para a escolha de "qualquer arma simples"). */
export const SIMPLE_WEAPONS: string[] = ITEMS_CATALOG.filter(
  (i) => i.category === "Arma simples",
).map((i) => i.name);

/** Nomes das armas marciais. */
export const MARTIAL_WEAPONS: string[] = ITEMS_CATALOG.filter(
  (i) => i.category === "Arma marcial",
).map((i) => i.name);
