import { describe, expect, test } from "bun:test";
import { groupInventory, inventoryCategory } from "./inventory";

describe("inventário por categoria", () => {
  test("usa catálogo, sinais de item mágico e palavras-chave", () => {
    expect(inventoryCategory({ name: "Armadura de Couro Batido" })).toBe("armaduras");
    expect(inventoryCategory({ name: "Escudo Buckler", description: "+1 CA. 1 kg." })).toBe("armaduras");
    expect(inventoryCategory({ name: "Rapieira" })).toBe("armas");
    expect(inventoryCategory({ name: "Espada Longa +1" })).toBe("magicos");
    expect(inventoryCategory({ name: "Poção de Cura" })).toBe("magicos");
    expect(inventoryCategory({ name: "Lança de Camélia", description: "Arma mágica de druida" })).toBe("magicos");
    expect(inventoryCategory({ name: "Kit de Ferramentas de Ladrão" })).toBe("ferramentas");
    expect(inventoryCategory({ name: "Instrumento Musical" })).toBe("ferramentas");
    expect(inventoryCategory({ name: "Pacote de Aventureiro" })).toBe("kits");
    expect(inventoryCategory({ name: "Ração para 5 dias" })).toBe("consumiveis");
    expect(inventoryCategory({ name: "Saquinho de moedas" })).toBe("tesouro");
    expect(inventoryCategory({ name: "Corda 15m" })).toBe("materiais");
  });

  test("categoria escolhida à mão vence a inferida", () => {
    expect(inventoryCategory({ name: "Ramo de Camélia", category: "magicos" })).toBe("magicos");
  });

  test("agrupa mantendo o índice original de cada item", () => {
    const groups = groupInventory([{ name: "Mochila" }, { name: "Rapieira" }, { name: "Adaga" }]);
    expect(groups.map((group) => group.category)).toEqual(["armas", "materiais"]);
    expect(groups[0].entries.map((entry) => entry.index)).toEqual([1, 2]);
    expect(groups[1].entries[0].index).toBe(0);
  });
});
