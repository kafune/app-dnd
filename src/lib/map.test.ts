import { describe, expect, test } from "bun:test";
import {
  DEFAULT_GRID,
  cellAt,
  directionOf,
  encaixarRotacao,
  metersToPx,
  normalizeMapState,
  rotationTowards,
  shapePath,
  sizeInCells,
  snapCenter,
  tokenCells,
  type MapGrid,
} from "./map";

const grid: MapGrid = { ...DEFAULT_GRID, size: 50, offsetX: 10, offsetY: 20 };

describe("tamanhos de criatura", () => {
  test("Médio ocupa um quadrado inteiro; os maiores seguem o Livro do Jogador", () => {
    expect(sizeInCells("Médio")).toBe(1);
    expect(sizeInCells("Pequeno")).toBe(1);
    expect(sizeInCells("Miúdo")).toBe(0.5);
    expect(sizeInCells("Grande")).toBe(2);
    expect(sizeInCells("Enorme")).toBe(3);
    expect(sizeInCells("Imenso")).toBe(4);
    expect(sizeInCells(undefined)).toBe(1);
  });

  test("1 quadrado = 1,5 m", () => {
    expect(metersToPx(1.5, grid)).toBe(50);
    expect(metersToPx(6, grid)).toBe(200);
  });
});

describe("grade", () => {
  test("encaixa um token Médio no centro do quadrado", () => {
    // Ponto dentro do quadrado (2, 1): x de 110 a 160, y de 70 a 120.
    expect(snapCenter(133, 99, 1, grid)).toEqual({ x: 135, y: 95 });
    expect(cellAt(133, 99, grid)).toEqual({ col: 2, row: 1 });
  });

  test("um token Grande ocupa um bloco 2×2 alinhado à grade", () => {
    const center = snapCenter(160, 120, 2, grid);
    expect(center).toEqual({ x: 160, y: 120 });
    expect(tokenCells(center, 2, grid).sort()).toEqual(["2,1", "2,2", "3,1", "3,2"].sort());
  });

  test("Miúdo é tratado como um quadrado para encaixar", () => {
    expect(snapCenter(133, 99, 0.5, grid)).toEqual({ x: 135, y: 95 });
  });
});

describe("direção", () => {
  test("encaixa dos dois lados de cada múltiplo de 45°, inclusive na volta de 360°", () => {
    for (let alvo = 0; alvo <= 360; alvo += 45) {
      for (const desvio of [-4, -2, 0, 2, 4]) {
        expect(encaixarRotacao(alvo + desvio)).toBe(alvo % 360);
      }
    }
  });

  test("solta o encaixe fora da margem, preservando ângulos intermediários", () => {
    for (const rotacao of [5, 22, 40, 50, 85, 95, 175, 185, 310, 320, 355]) {
      expect(encaixarRotacao(rotacao)).toBe(rotacao);
    }
  });

  test("0° aponta para cima, 90° para a direita", () => {
    const up = directionOf(0);
    expect(up.dx).toBeCloseTo(0);
    expect(up.dy).toBeCloseTo(-1);
    const right = directionOf(90);
    expect(right.dx).toBeCloseTo(1);
    expect(right.dy).toBeCloseTo(0);
  });

  test("rotação em direção a um ponto", () => {
    expect(rotationTowards({ x: 0, y: 0 }, { x: 0, y: -10 })).toBe(0);
    expect(rotationTowards({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe(90);
    expect(rotationTowards({ x: 0, y: 0 }, { x: 0, y: 10 })).toBe(180);
    expect(rotationTowards({ x: 0, y: 0 }, { x: -10, y: 0 })).toBe(270);
  });
});

describe("formas", () => {
  test("cone: a largura na ponta é igual ao comprimento", () => {
    const d = shapePath({ id: "a", kind: "cone", x: 0, y: 0, rotation: 90, length: 4.5 }, grid);
    // 4,5 m = 3 quadrados = 150 px para a direita; ponta de -75 a +75 em y.
    expect(d).toBe("M0,0L150,75L150,-75Z");
  });

  test("linha: retângulo a partir da origem", () => {
    const d = shapePath({ id: "a", kind: "linha", x: 0, y: 0, rotation: 180, length: 3, width: 1.5 }, grid);
    expect(d).toBe("M-25,0L-25,100L25,100L25,0Z");
  });

  test("cubo apoiado na origem × centrado", () => {
    const edge = shapePath({ id: "a", kind: "cubo", x: 0, y: 0, rotation: 0, side: 3 }, grid);
    expect(edge).toBe("M50,0L50,-100L-50,-100L-50,0Z");
    const centered = shapePath({ id: "a", kind: "cubo", x: 0, y: 0, rotation: 0, side: 3, centered: true }, grid);
    expect(centered).toBe("M50,50L50,-50L-50,-50L-50,50Z");
  });

  test("esfera vira um círculo com o raio em escala", () => {
    const d = shapePath({ id: "a", kind: "esfera", x: 100, y: 100, rotation: 0, radius: 6 }, grid);
    expect(d.startsWith("M-100,100a200,200")).toBe(true);
  });
});

describe("normalizeMapState", () => {
  test("aceita JSON incompleto e descarta lixo", () => {
    const state = normalizeMapState({
      grid: { size: "x", enabled: false },
      tokens: { "c:a": { x: 1, y: 2 }, "m:b": null },
      tiles: { "1,2": { elevation: "acima" }, "lixo": { difficult: true }, "3,3": {} },
      shapes: [{ id: "s", kind: "cone", length: 9 }, { kind: "esfera" }],
      background: { version: "v1", width: 10, height: 20 },
    });
    expect(state.grid.enabled).toBe(false);
    expect(state.grid.size).toBe(DEFAULT_GRID.size);
    expect(Object.keys(state.tokens)).toEqual(["c:a"]);
    expect(state.tokens["c:a"]).toEqual({ x: 1, y: 2, rotation: 0 });
    expect(Object.keys(state.tiles)).toEqual(["1,2"]);
    expect(state.shapes).toHaveLength(1);
    expect(state.shapes[0]).toMatchObject({ id: "s", kind: "cone", length: 9, rotation: 0 });
    expect(state.background).toEqual({ version: "v1", width: 10, height: 20 });
  });
});
