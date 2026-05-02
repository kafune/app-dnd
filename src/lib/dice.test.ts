import { describe, expect, test } from "bun:test";
import { formatRollDetail, parseExpression, roll } from "./dice";

function withMockedRandom(values: number[], run: () => void) {
  const original = Math.random;
  let index = 0;
  Math.random = () => values[index++] ?? 0;
  try {
    run();
  } finally {
    Math.random = original;
  }
}

describe("dice engine", () => {
  test("parseia expressões comuns de D&D", () => {
    expect(parseExpression("d20")).toEqual({ count: 1, sides: 20, modifier: 0 });
    expect(parseExpression("2d6+3")).toEqual({ count: 2, sides: 6, modifier: 3 });
    expect(parseExpression("1d8-1")).toEqual({ count: 1, sides: 8, modifier: -1 });
    expect(parseExpression(" 4D10 +2 ")).toEqual({ count: 4, sides: 10, modifier: 2 });
  });

  test("rejeita expressões inválidas", () => {
    expect(() => parseExpression("20")).toThrow("Expressão inválida");
    expect(() => parseExpression("0d6")).toThrow("Dados inválidos");
    expect(() => parseExpression("1d1")).toThrow("Dados inválidos");
  });

  test("rola soma com modificador e metadados", () => {
    withMockedRandom([0, 0.5], () => {
      const result = roll("2d6+3", {
        characterId: "joao-lindao",
        characterName: "Zorrilho Pabrantes",
        label: "Ataque Furtivo",
      });

      expect(result.characterId).toBe("joao-lindao");
      expect(result.characterName).toBe("Zorrilho Pabrantes");
      expect(result.label).toBe("Ataque Furtivo");
      expect(result.expression).toBe("2d6+3");
      expect(result.detail.rolls).toEqual([1, 4]);
      expect(result.detail.modifier).toBe(3);
      expect(result.result).toBe(8);
    });
  });

  test("aplica vantagem em d20 e marca crítico", () => {
    withMockedRandom([0.1, 0.999], () => {
      const result = roll("1d20+6", { advantage: true });

      expect(result.result).toBe(26);
      expect(result.detail.rolls).toEqual([20]);
      expect(result.detail.discarded).toBe(3);
      expect(result.detail.crit).toBe(true);
      expect(result.expression).toBe("1d20+6 (vantagem)");
    });
  });

  test("aplica desvantagem em d20 e marca falha crítica", () => {
    withMockedRandom([0, 0.9], () => {
      const result = roll("1d20-1", { disadvantage: true });

      expect(result.result).toBe(0);
      expect(result.detail.rolls).toEqual([1]);
      expect(result.detail.discarded).toBe(19);
      expect(result.detail.fumble).toBe(true);
      expect(formatRollDetail(result)).toContain("FUMBLE");
    });
  });
});
