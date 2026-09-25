import { describe, expect, test } from "bun:test";
import {
  AVATAR_MAX_ZOOM,
  avatarCropZoom,
  clampAvatarCrop,
  defaultAvatarCrop,
  initials,
  panAvatarCrop,
  zoomAvatarCrop,
} from "./avatar";

describe("recorte automático da foto", () => {
  test("paisagem: quadrado do lado menor, centralizado", () => {
    expect(defaultAvatarCrop(1000, 600)).toEqual({ x: 200, y: 0, side: 600 });
  });

  test("retrato: puxado para cima (20% da sobra), onde costuma estar o rosto", () => {
    expect(defaultAvatarCrop(600, 1000)).toEqual({ x: 0, y: 80, side: 600 });
  });

  test("imagem já quadrada fica inteira", () => {
    expect(defaultAvatarCrop(512, 512)).toEqual({ x: 0, y: 0, side: 512 });
  });
});

describe("limites do ajuste", () => {
  test("zoom 1 = o quadrado ocupa o lado menor inteiro", () => {
    expect(avatarCropZoom({ x: 0, y: 0, side: 600 }, 1000, 600)).toBe(1);
    expect(avatarCropZoom({ x: 0, y: 0, side: 150 }, 1000, 600)).toBe(4);
  });

  test("o quadrado nunca sai da imagem", () => {
    expect(clampAvatarCrop({ x: -50, y: -10, side: 300 }, 1000, 600)).toEqual({ x: 0, y: 0, side: 300 });
    expect(clampAvatarCrop({ x: 900, y: 500, side: 300 }, 1000, 600)).toEqual({ x: 700, y: 300, side: 300 });
  });

  test("o lado fica entre o lado menor e 1/zoom máximo dele", () => {
    expect(clampAvatarCrop({ x: 0, y: 0, side: 5000 }, 1000, 600).side).toBe(600);
    expect(clampAvatarCrop({ x: 0, y: 0, side: 1 }, 1000, 600).side).toBe(600 / AVATAR_MAX_ZOOM);
  });

  test("arrastar move a janela e para na borda", () => {
    const crop = defaultAvatarCrop(1000, 600);
    expect(panAvatarCrop(crop, 1000, 600, 50, 0)).toEqual({ x: 250, y: 0, side: 600 });
    expect(panAvatarCrop(crop, 1000, 600, 9999, 9999)).toEqual({ x: 400, y: 0, side: 600 });
    expect(panAvatarCrop(crop, 1000, 600, -9999, 0)).toEqual({ x: 0, y: 0, side: 600 });
  });
});

describe("zoom em torno de um ponto", () => {
  test("zoom no centro mantém o centro", () => {
    const crop = defaultAvatarCrop(1000, 600);
    const zoomed = zoomAvatarCrop(crop, 1000, 600, 2);
    expect(zoomed.side).toBe(300);
    expect(zoomed.x + zoomed.side / 2).toBe(500);
    expect(zoomed.y + zoomed.side / 2).toBe(300);
  });

  test("o ponto sob o dedo/cursor fica parado", () => {
    const crop = { x: 100, y: 100, side: 400 };
    const anchorX = 0.25;
    const anchorY = 0.75;
    const before = { x: crop.x + anchorX * crop.side, y: crop.y + anchorY * crop.side };
    const zoomed = zoomAvatarCrop(crop, 1000, 800, 4, anchorX, anchorY);
    expect(zoomed.side).toBe(200);
    expect(zoomed.x + anchorX * zoomed.side).toBeCloseTo(before.x);
    expect(zoomed.y + anchorY * zoomed.side).toBeCloseTo(before.y);
  });

  test("afastar além do zoom 1 volta a cobrir a imagem sem sair dela", () => {
    const zoomed = zoomAvatarCrop({ x: 700, y: 300, side: 300 }, 1000, 600, 0.2, 1, 1);
    expect(zoomed).toEqual({ x: 400, y: 0, side: 600 });
  });

  test("zoom acima do máximo é limitado", () => {
    const zoomed = zoomAvatarCrop(defaultAvatarCrop(600, 600), 600, 600, 100);
    expect(avatarCropZoom(zoomed, 600, 600)).toBeCloseTo(AVATAR_MAX_ZOOM);
  });
});

describe("iniciais", () => {
  test("primeira e última palavra; uma palavra usa as duas primeiras letras", () => {
    expect(initials("Zorrilho Pabrantes")).toBe("ZP");
    expect(initials("thorin")).toBe("TH");
    expect(initials("  ")).toBe("?");
  });
});
