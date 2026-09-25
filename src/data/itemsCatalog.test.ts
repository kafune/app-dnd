import { describe, expect, test } from "bun:test";
import {
  ARTISAN_TOOLS,
  CATALOG_FILTERS,
  CATALOG_GROUPS,
  GAMING_SETS,
  ITEMS_CATALOG,
  MARTIAL_MELEE_WEAPONS,
  MARTIAL_WEAPONS,
  MUSICAL_INSTRUMENTS,
  SIMPLE_MELEE_WEAPONS,
  SIMPLE_WEAPONS,
  catalogGroupOf,
  compareItemNames,
  findItem,
  groupCatalogItems,
  groupCatalogNames,
} from "./itemsCatalog";

const item = (name: string) => {
  const found = findItem(name);
  if (!found) throw new Error(`item fora do catálogo: ${name}`);
  return found;
};

describe("grupos do seletor de itens", () => {
  test("todo item do catálogo cai em exatamente um grupo, sem perder nenhum", () => {
    const groups = groupCatalogItems(ITEMS_CATALOG);
    const total = groups.reduce((sum, group) => sum + group.items.length, 0);
    expect(total).toBe(ITEMS_CATALOG.length);
    expect(new Set(groups.flatMap((group) => group.items.map((entry) => entry.name))).size).toBe(ITEMS_CATALOG.length);
  });

  test("grupos seguem a ordem fixa: armas, armaduras, conjuração, ferramentas, aventura", () => {
    const ids = groupCatalogItems(ITEMS_CATALOG).map((group) => group.id);
    expect(ids).toEqual(CATALOG_GROUPS.map((group) => group.id));
    expect(ids.slice(0, 4)).toEqual([
      "arma-simples-corpo",
      "arma-simples-distancia",
      "arma-marcial-corpo",
      "arma-marcial-distancia",
    ]);
    // Os filtros aparecem na mesma ordem dos grupos.
    const filterOrder = [...new Set(CATALOG_GROUPS.map((group) => group.filter))];
    expect(filterOrder).toEqual(CATALOG_FILTERS.map((filter) => filter.id));
  });

  test("separa corpo a corpo de à distância e ferramentas por tipo", () => {
    expect(catalogGroupOf(item("Adaga"))).toBe("arma-simples-corpo");
    expect(catalogGroupOf(item("Arco Curto"))).toBe("arma-simples-distancia");
    expect(catalogGroupOf(item("Espada Longa"))).toBe("arma-marcial-corpo");
    expect(catalogGroupOf(item("Besta Pesada"))).toBe("arma-marcial-distancia");
    expect(catalogGroupOf(item("Couro Batido"))).toBe("armadura-leve");
    expect(catalogGroupOf(item("Peitoral"))).toBe("armadura-media");
    expect(catalogGroupOf(item("Placas"))).toBe("armadura-pesada");
    expect(catalogGroupOf(item("Broquel"))).toBe("escudo");
    expect(catalogGroupOf(item("Ferramentas de Ladrão"))).toBe("ferramenta-outra");
    expect(catalogGroupOf(item("Ferramentas de Ferreiro"))).toBe("ferramenta-artesao");
    expect(catalogGroupOf(item("Conjunto de Dados"))).toBe("kit-jogo");
    expect(catalogGroupOf(item("Kit de Herbalismo"))).toBe("kit");
    expect(catalogGroupOf(item("Alaúde"))).toBe("instrumento");
  });

  test("itens de cada grupo em ordem alfabética do português", () => {
    for (const group of groupCatalogItems(ITEMS_CATALOG)) {
      const names = group.items.map((entry) => entry.name);
      expect(names, group.id).toEqual([...names].sort(compareItemNames));
    }
    const martial = groupCatalogItems(ITEMS_CATALOG).find((group) => group.id === "arma-marcial-corpo");
    // Na tabela do livro "Cimitarra" vem antes de "Chicote"; aqui não.
    expect(martial?.items.slice(0, 3).map((entry) => entry.name)).toEqual(["Alabarda", "Chicote", "Cimitarra"]);
    const gear = groupCatalogItems(ITEMS_CATALOG).find((group) => group.id === "aventura");
    // Acento não empurra o item para o fim: "Ábaco" abre a lista.
    expect(gear?.items[0]?.name).toBe("Ábaco");
  });

  test("agrupa uma lista de nomes (coringa \"qualquer arma marcial\")", () => {
    const groups = groupCatalogNames([...MARTIAL_WEAPONS, "Item inventado"]);
    expect(groups.map((group) => group.label)).toEqual([
      "Armas marciais — corpo a corpo",
      "Armas marciais — à distância",
    ]);
    expect(groups.reduce((sum, group) => sum + group.items.length, 0)).toBe(MARTIAL_WEAPONS.length);
  });

  test("listas dos coringas do equipamento inicial não perdem item ao agrupar", () => {
    for (const list of [SIMPLE_WEAPONS, MARTIAL_WEAPONS, SIMPLE_MELEE_WEAPONS, MARTIAL_MELEE_WEAPONS, MUSICAL_INSTRUMENTS, ARTISAN_TOOLS, GAMING_SETS]) {
      const grouped = groupCatalogNames(list).flatMap((group) => group.items.map((entry) => entry.name));
      expect([...grouped].sort()).toEqual([...list].sort());
    }
  });

  test("todo grupo tem rótulo e dica", () => {
    for (const group of CATALOG_GROUPS) {
      expect(group.label.length, group.id).toBeGreaterThan(0);
      expect(group.hint.length, group.id).toBeGreaterThan(0);
    }
  });
});
