import { describe, expect, test } from "bun:test";
import { camargo } from "@/data/seed/camargo";
import { joao } from "@/data/seed/joao";
import { applyLongRest, applyShortRest } from "./rest";
import type { Character } from "./types";

describe("rest rules", () => {
  test("descanso curto restaura apenas recursos de recarga curta", () => {
    const character: Character = {
      ...camargo,
      resources: [
        { name: "Curto", current: 0, max: 2, recharge: "short" },
        { name: "Longo", current: 0, max: 3, recharge: "long" },
        { name: "Sem recarga", current: 0, max: 1, recharge: "none" },
      ],
    };

    expect(applyShortRest(character).resources).toEqual([
      { name: "Curto", current: 2, max: 2, recharge: "short" },
      { name: "Longo", current: 0, max: 3, recharge: "long" },
      { name: "Sem recarga", current: 0, max: 1, recharge: "none" },
    ]);
  });

  test("descanso longo restaura PV, limpa PV temporário, slots e recursos recarregáveis", () => {
    const character: Character = {
      ...joao,
      hpCurrent: 4,
      hpTemp: 7,
      spellSlots: {
        "1": { current: 0, max: 2 },
        "2": { current: 1, max: 2 },
      },
      resources: [
        { name: "Longo", current: 0, max: 3, recharge: "long" },
        { name: "Curto", current: 0, max: 2, recharge: "short" },
        { name: "Amanhecer", current: 0, max: 1, recharge: "dawn" },
        { name: "Sem recarga", current: 0, max: 1, recharge: "none" },
      ],
    };

    expect(applyLongRest(character)).toEqual({
      hpCurrent: joao.hpMax,
      hpTemp: 0,
      spellSlots: {
        "1": { current: 2, max: 2 },
        "2": { current: 2, max: 2 },
      },
      resources: [
        { name: "Longo", current: 3, max: 3, recharge: "long" },
        { name: "Curto", current: 2, max: 2, recharge: "short" },
        { name: "Amanhecer", current: 1, max: 1, recharge: "dawn" },
        { name: "Sem recarga", current: 0, max: 1, recharge: "none" },
      ],
    });
  });

  test("moedas (Inspiração) não voltam com descanso nenhum", () => {
    const character: Character = {
      ...camargo,
      resources: [
        { name: "Inspiração", current: 0, max: 0, recharge: "none", kind: "moeda", masterOnly: true },
        { name: "Fichas de sorte", current: 1, max: 5, recharge: "long", kind: "moeda" },
        { name: "Fúria", current: 0, max: 3, recharge: "long" },
      ],
    };

    expect(applyShortRest(character).resources[0].current).toBe(0);
    const longRest = applyLongRest(character).resources;
    expect(longRest[0].current).toBe(0);
    expect(longRest[1].current).toBe(1); // moeda com recarga longa também fica parada
    expect(longRest[2].current).toBe(3); // recurso recarregável volta cheio
  });
});
