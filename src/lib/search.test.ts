import { describe, expect, test } from "bun:test";
import { matchesSearch, searchKey } from "./search";

describe("busca de pastas e fichas", () => {
  test("ignora acento, caixa e espaços nas pontas", () => {
    expect(searchKey("  Édson Ção ")).toBe("edson cao");
    expect(matchesSearch("edson", "Edson Manoel Fagundes Peixoto")).toBe(true);
    expect(matchesSearch("PANKLÉOS", "Mundo Pankleos")).toBe(true);
  });

  test("busca vazia casa tudo; qualquer campo serve", () => {
    expect(matchesSearch("   ", "Qualquer")).toBe(true);
    expect(matchesSearch("rudá", "Edson", "Rudá")).toBe(true);
    expect(matchesSearch("zorrilho", "Holg Smough", undefined)).toBe(false);
  });
});
