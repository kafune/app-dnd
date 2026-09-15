/**
 * Prévia de uma área de magia/habilidade sobre o mapa.
 *
 * Uma área "de si" (cone, aura, linha que sai do conjurador) fica presa ao token:
 * anda e gira com ele. Uma área "de ponto" nasce alguns quadrados à frente do
 * token e o jogador arrasta/gira à vontade; um anel tracejado mostra o alcance.
 */
import type { SpellArea } from "@/data/spellAreas";
import { METERS_PER_CELL, directionOf, isDirectional, metersToPx, type MapGrid, type MapShape, type MapToken } from "@/lib/map";
import type { PreviewShape } from "./MapCanvas";

/** Dimensões que o jogador pode ter regulado (em metros). */
export type AreaDims = Pick<MapShape, "radius" | "length" | "width" | "side">;

export type AreaPick = {
  key: string;
  label: string;
  area: SpellArea;
  /** Alcance da magia em metros (só as de ponto). */
  range: number | null;
  dims: AreaDims;
};

/** Dimensões iniciais de uma área (as do livro). */
export function baseDims(area: SpellArea): AreaDims {
  return {
    ...(area.radius !== undefined ? { radius: area.radius } : {}),
    ...(area.length !== undefined ? { length: area.length } : {}),
    ...(area.width !== undefined ? { width: area.width } : {}),
    ...(area.side !== undefined ? { side: area.side } : {}),
  };
}

/** Onde a área "de si" começa: no centro do token (esferas) ou na borda dele (cone, linha, cubo). */
export function selfOrigin(area: SpellArea, token: MapToken, tokenRadiusPx: number): { x: number; y: number } {
  const directional = isDirectional(area.kind) && !area.centered;
  if (!directional) return { x: token.x, y: token.y };
  const dir = directionOf(token.rotation);
  return { x: token.x + dir.dx * tokenRadiusPx, y: token.y + dir.dy * tokenRadiusPx };
}

/** Ponto inicial de uma área "de ponto": três quadrados à frente do token. */
export function defaultPoint(token: MapToken, tokenRadiusPx: number, grid: MapGrid): { x: number; y: number; rotation: number } {
  const dir = directionOf(token.rotation);
  const distance = tokenRadiusPx + metersToPx(METERS_PER_CELL * 3, grid);
  return { x: token.x + dir.dx * distance, y: token.y + dir.dy * distance, rotation: token.rotation };
}

export function buildPreview(
  pick: AreaPick,
  token: MapToken,
  tokenRadiusPx: number,
  grid: MapGrid,
  color: string,
  point: { x: number; y: number; rotation: number } | null,
): PreviewShape[] {
  const { area } = pick;
  const base: Omit<MapShape, "id" | "x" | "y" | "rotation"> = {
    kind: area.kind,
    ...pick.dims,
    ...(area.centered !== undefined ? { centered: area.centered } : {}),
    color,
    label: pick.label,
  };
  if (area.origin === "self") {
    const origin = selfOrigin(area, token, tokenRadiusPx);
    return [{ shape: { id: "preview:area", ...base, x: origin.x, y: origin.y, rotation: token.rotation }, movable: false, rotatable: false }];
  }
  const at = point ?? defaultPoint(token, tokenRadiusPx, grid);
  const out: PreviewShape[] = [];
  if (pick.range) {
    out.push({
      shape: { id: "preview:range", kind: "esfera", radius: pick.range, x: token.x, y: token.y, rotation: 0, color },
      dashed: true,
    });
  }
  out.push({ shape: { id: "preview:area", ...base, x: at.x, y: at.y, rotation: at.rotation }, movable: true, rotatable: true });
  return out;
}
