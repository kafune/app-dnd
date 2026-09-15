/**
 * Mapa tático da mesa: tipos, geometria e conversões de escala.
 *
 * Tudo aqui é medido em pixels da imagem de fundo (coordenadas "do mapa"). A
 * grade converte metros em pixels: um quadrado da grade é 1,5 m, como no Livro
 * do Jogador. Os componentes em `src/components/map/` cuidam de tela, zoom e
 * arraste; aqui fica o que dá para testar sem navegador.
 */
import type { Creature } from "./types";

/** Um quadrado da grade = 1,5 m (5 pés). */
export const METERS_PER_CELL = 1.5;

export type Elevation = "acima" | "abaixo";

export type MapGrid = {
  /** false = o Mestre usa a grade já desenhada na imagem: só mover criaturas funciona. */
  enabled: boolean;
  /** Lado de um quadrado, em pixels da imagem. */
  size: number;
  offsetX: number;
  offsetY: number;
  color: string;
  opacity: number;
};

export type MapToken = {
  /** Centro do token, em pixels da imagem. */
  x: number;
  y: number;
  /** Para onde a criatura olha: graus no sentido horário, 0 = para cima. */
  rotation: number;
  elevation?: Elevation | null;
  /** Só para monstros: o Mestre "libera a visão" e o token aparece para os jogadores. */
  visible?: boolean;
};

export type TileMark = {
  elevation?: Elevation | null;
  difficult?: boolean;
};

export type ShapeKind = "esfera" | "cilindro" | "cubo" | "quadrado" | "cone" | "linha";

export const SHAPE_LABELS: Record<ShapeKind, string> = {
  esfera: "Esfera / círculo",
  cilindro: "Cilindro",
  cubo: "Cubo",
  quadrado: "Quadrado",
  cone: "Cone",
  linha: "Linha",
};

/** Forma geométrica no mapa (dimensões em metros, posição em pixels da imagem). */
export type MapShape = {
  id: string;
  kind: ShapeKind;
  x: number;
  y: number;
  /** Direção (graus, horário, 0 = para cima) — vale para cone, linha e cubo. */
  rotation: number;
  /** Esfera e cilindro. */
  radius?: number;
  /** Linha: comprimento e largura. */
  length?: number;
  width?: number;
  /** Cubo e quadrado: lado. */
  side?: number;
  /** Cubo/quadrado centrado no ponto (true) ou com a face apoiada nele (false). */
  centered?: boolean;
  color?: string;
  label?: string;
};

export type MapBackground = { version: string; width?: number; height?: number };

export type MapState = {
  grid: MapGrid;
  /** Chave = id do token: `c:<ficha>` ou `m:<criatura>`. */
  tokens: Record<string, MapToken>;
  /** Chave = "coluna,linha" da grade. */
  tiles: Record<string, TileMark>;
  shapes: MapShape[];
  background: MapBackground | null;
  updatedAt?: string;
};

/** Quem tem token no mapa: uma ficha ou uma criatura da cena. */
export type MapFigure = {
  /** Id do token (`c:<ficha>` ou `m:<criatura>`). */
  id: string;
  kind: "character" | "creature";
  refId: string;
  name: string;
  color?: string | null;
  avatarVersion?: string | null;
  /** Tamanho de criatura (Miúdo … Imenso). */
  size: string;
};

export const DEFAULT_GRID: MapGrid = {
  enabled: true,
  size: 64,
  offsetX: 0,
  offsetY: 0,
  color: "#111827",
  opacity: 0.35,
};

/** Tamanho do mapa quando ainda não há imagem de fundo (30 × 20 quadrados). */
export const EMPTY_CANVAS = { width: 1920, height: 1280 };

export function emptyMapState(): MapState {
  return { grid: { ...DEFAULT_GRID }, tokens: {}, tiles: {}, shapes: [], background: null };
}

const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);

/** Aceita o JSON do servidor (ou um vazio) e devolve um estado completo. */
export function normalizeMapState(raw: unknown): MapState {
  const r = (raw ?? {}) as Partial<MapState> & Record<string, unknown>;
  const g = (r.grid ?? {}) as Partial<MapGrid>;
  const grid: MapGrid = {
    enabled: g.enabled !== false,
    size: Math.max(8, num(g.size, DEFAULT_GRID.size)),
    offsetX: num(g.offsetX, 0),
    offsetY: num(g.offsetY, 0),
    color: typeof g.color === "string" ? g.color : DEFAULT_GRID.color,
    opacity: Math.min(1, Math.max(0, num(g.opacity, DEFAULT_GRID.opacity))),
  };
  const tokens: Record<string, MapToken> = {};
  for (const [id, t] of Object.entries((r.tokens ?? {}) as Record<string, Partial<MapToken>>)) {
    if (!t || typeof t !== "object") continue;
    tokens[id] = {
      x: num(t.x, 0),
      y: num(t.y, 0),
      rotation: num(t.rotation, 0),
      ...(t.elevation === "acima" || t.elevation === "abaixo" ? { elevation: t.elevation } : {}),
      ...(typeof t.visible === "boolean" ? { visible: t.visible } : {}),
    };
  }
  const tiles: Record<string, TileMark> = {};
  for (const [key, mark] of Object.entries((r.tiles ?? {}) as Record<string, Partial<TileMark>>)) {
    if (!mark || typeof mark !== "object" || !parseCellKey(key)) continue;
    const clean: TileMark = {};
    if (mark.elevation === "acima" || mark.elevation === "abaixo") clean.elevation = mark.elevation;
    if (mark.difficult) clean.difficult = true;
    if (clean.elevation || clean.difficult) tiles[key] = clean;
  }
  const shapes = Array.isArray(r.shapes)
    ? (r.shapes as Partial<MapShape>[])
        .filter((s) => s && typeof s.id === "string" && s.kind && s.kind in SHAPE_LABELS)
        .map((s) => ({
          id: s.id!,
          kind: s.kind as ShapeKind,
          x: num(s.x, 0),
          y: num(s.y, 0),
          rotation: num(s.rotation, 0),
          ...(s.radius !== undefined ? { radius: num(s.radius, 1.5) } : {}),
          ...(s.length !== undefined ? { length: num(s.length, 1.5) } : {}),
          ...(s.width !== undefined ? { width: num(s.width, 1.5) } : {}),
          ...(s.side !== undefined ? { side: num(s.side, 1.5) } : {}),
          ...(s.centered !== undefined ? { centered: !!s.centered } : {}),
          ...(typeof s.color === "string" ? { color: s.color } : {}),
          ...(typeof s.label === "string" ? { label: s.label } : {}),
        }))
    : [];
  const bg = r.background as Partial<MapBackground> | null | undefined;
  const background: MapBackground | null =
    bg && typeof bg.version === "string"
      ? {
          version: bg.version,
          ...(typeof bg.width === "number" ? { width: bg.width } : {}),
          ...(typeof bg.height === "number" ? { height: bg.height } : {}),
        }
      : null;
  return { grid, tokens, tiles, shapes, background, ...(typeof r.updatedAt === "string" ? { updatedAt: r.updatedAt } : {}) };
}

// === Escala e tamanhos ===

/** Quantos quadrados de lado uma criatura ocupa (PHB cap. 9: Médio = 1 quadrado). */
export function sizeInCells(size: string | undefined | null): number {
  switch ((size ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()) {
    case "miudo":
      return 0.5;
    case "grande":
      return 2;
    case "enorme":
      return 3;
    case "imenso":
      return 4;
    default:
      // Pequeno e Médio ocupam um quadrado inteiro.
      return 1;
  }
}

export const metersToPx = (meters: number, grid: Pick<MapGrid, "size">) => (meters / METERS_PER_CELL) * grid.size;
export const pxToMeters = (px: number, grid: Pick<MapGrid, "size">) => (px / grid.size) * METERS_PER_CELL;

/** Diâmetro do token em pixels da imagem. */
export const tokenDiameter = (size: string | undefined | null, grid: Pick<MapGrid, "size">) =>
  sizeInCells(size) * grid.size;

export const cellKey = (col: number, row: number) => `${col},${row}`;

export function parseCellKey(key: string): { col: number; row: number } | null {
  const m = /^(-?\d+),(-?\d+)$/.exec(key);
  if (!m) return null;
  return { col: Number(m[1]), row: Number(m[2]) };
}

/** Quadrado da grade que contém o ponto. */
export function cellAt(x: number, y: number, grid: MapGrid): { col: number; row: number } {
  return {
    col: Math.floor((x - grid.offsetX) / grid.size),
    row: Math.floor((y - grid.offsetY) / grid.size),
  };
}

export function cellRect(col: number, row: number, grid: MapGrid) {
  return { x: grid.offsetX + col * grid.size, y: grid.offsetY + row * grid.size, size: grid.size };
}

/**
 * Encaixa o centro de um token na grade. Um token de N quadrados ocupa um bloco
 * N×N alinhado à grade (Miúdo ocupa um quadrado inteiro, desenhado menor).
 */
export function snapCenter(x: number, y: number, cells: number, grid: MapGrid): { x: number; y: number } {
  const n = Math.max(1, Math.round(cells));
  const col = Math.round((x - grid.offsetX) / grid.size - n / 2);
  const row = Math.round((y - grid.offsetY) / grid.size - n / 2);
  return { x: grid.offsetX + (col + n / 2) * grid.size, y: grid.offsetY + (row + n / 2) * grid.size };
}

/** Quadrados ocupados por um token (para marcar terreno e níveis por baixo dele). */
export function tokenCells(token: Pick<MapToken, "x" | "y">, cells: number, grid: MapGrid): string[] {
  const n = Math.max(1, Math.round(cells));
  const col0 = Math.round((token.x - grid.offsetX) / grid.size - n / 2);
  const row0 = Math.round((token.y - grid.offsetY) / grid.size - n / 2);
  const out: string[] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) out.push(cellKey(col0 + c, row0 + r));
  return out;
}

// === Direção ===

/** Vetor unitário da direção: 0° = para cima (norte), horário. */
export function directionOf(rotation: number): { dx: number; dy: number } {
  const rad = (rotation * Math.PI) / 180;
  return { dx: Math.sin(rad), dy: -Math.cos(rad) };
}

/** Rotação (0 = para cima, horário) que aponta do centro para o ponto. */
export function rotationTowards(center: { x: number; y: number }, point: { x: number; y: number }): number {
  const deg = (Math.atan2(point.x - center.x, -(point.y - center.y)) * 180) / Math.PI;
  return ((Math.round(deg) % 360) + 360) % 360;
}

/** Encaixe leve em múltiplos de 45°: libera a rotação ao sair da margem de 4°. */
export function encaixarRotacao(rotacao: number): number {
  const normalizada = ((rotacao % 360) + 360) % 360;
  const alvo = Math.round(normalizada / 45) * 45;
  return Math.abs(normalizada - alvo) <= 4 ? alvo % 360 : normalizada;
}

// === Formas ===

type Pt = { x: number; y: number };

const fmt = (n: number) => (Math.round(n * 100) / 100).toString();
const poly = (pts: Pt[]) => `M${pts.map((p) => `${fmt(p.x)},${fmt(p.y)}`).join("L")}Z`;

/**
 * Caminho SVG (em pixels da imagem) de uma forma. Regras do PHB cap. 10:
 *  - esfera/cilindro: raio a partir do ponto de origem;
 *  - cubo/quadrado: o ponto de origem fica numa face (ou no centro, se `centered`);
 *  - cone: a largura em cada ponto é igual à distância até a origem;
 *  - linha: um retângulo de `length` × `width` a partir da origem.
 */
export function shapePath(shape: MapShape, grid: Pick<MapGrid, "size">): string {
  const px = (m: number) => metersToPx(m, grid);
  const { dx, dy } = directionOf(shape.rotation);
  const perp = { x: -dy, y: dx };
  const o = { x: shape.x, y: shape.y };
  switch (shape.kind) {
    case "esfera":
    case "cilindro": {
      const r = px(shape.radius ?? METERS_PER_CELL);
      return `M${fmt(o.x - r)},${fmt(o.y)}a${fmt(r)},${fmt(r)} 0 1,0 ${fmt(2 * r)},0a${fmt(r)},${fmt(r)} 0 1,0 ${fmt(-2 * r)},0Z`;
    }
    case "cubo":
    case "quadrado": {
      const s = px(shape.side ?? METERS_PER_CELL);
      const half = s / 2;
      // Centrado: o centro fica na origem. Apoiado: a face de trás fica na origem.
      const start = shape.centered ? { x: o.x - dx * half, y: o.y - dy * half } : o;
      const end = { x: start.x + dx * s, y: start.y + dy * s };
      return poly([
        { x: start.x + perp.x * half, y: start.y + perp.y * half },
        { x: end.x + perp.x * half, y: end.y + perp.y * half },
        { x: end.x - perp.x * half, y: end.y - perp.y * half },
        { x: start.x - perp.x * half, y: start.y - perp.y * half },
      ]);
    }
    case "cone": {
      const l = px(shape.length ?? METERS_PER_CELL);
      const end = { x: o.x + dx * l, y: o.y + dy * l };
      const half = l / 2;
      return poly([o, { x: end.x + perp.x * half, y: end.y + perp.y * half }, { x: end.x - perp.x * half, y: end.y - perp.y * half }]);
    }
    case "linha": {
      const l = px(shape.length ?? METERS_PER_CELL);
      const half = px(shape.width ?? METERS_PER_CELL) / 2;
      const end = { x: o.x + dx * l, y: o.y + dy * l };
      return poly([
        { x: o.x + perp.x * half, y: o.y + perp.y * half },
        { x: end.x + perp.x * half, y: end.y + perp.y * half },
        { x: end.x - perp.x * half, y: end.y - perp.y * half },
        { x: o.x - perp.x * half, y: o.y - perp.y * half },
      ]);
    }
  }
}

/** Distância (em pixels da imagem) da origem até a ponta da forma, para o puxador de rotação. */
export function shapeReach(shape: MapShape, grid: Pick<MapGrid, "size">): number {
  const px = (m: number) => metersToPx(m, grid);
  switch (shape.kind) {
    case "esfera":
    case "cilindro":
      return px(shape.radius ?? METERS_PER_CELL);
    case "cubo":
    case "quadrado":
      return shape.centered ? px(shape.side ?? METERS_PER_CELL) / 2 : px(shape.side ?? METERS_PER_CELL);
    case "cone":
    case "linha":
      return px(shape.length ?? METERS_PER_CELL);
  }
}

/** Onde escrever o rótulo da forma: no meio dela, não na origem (que costuma ser o token). */
export function shapeLabelPoint(shape: MapShape, grid: Pick<MapGrid, "size">): { x: number; y: number } {
  const { dx, dy } = directionOf(shape.rotation);
  switch (shape.kind) {
    case "esfera":
    case "cilindro":
      return { x: shape.x, y: shape.y };
    case "cubo":
    case "quadrado": {
      const s = metersToPx(shape.side ?? METERS_PER_CELL, grid);
      return shape.centered ? { x: shape.x, y: shape.y } : { x: shape.x + dx * (s / 2), y: shape.y + dy * (s / 2) };
    }
    case "cone":
    case "linha": {
      const l = metersToPx(shape.length ?? METERS_PER_CELL, grid);
      return { x: shape.x + dx * (l * 0.6), y: shape.y + dy * (l * 0.6) };
    }
  }
}

/** A forma tem direção (rotacionar muda algo)? */
export const isDirectional = (kind: ShapeKind) => kind === "cone" || kind === "linha" || kind === "cubo" || kind === "quadrado";

/** Texto curto das dimensões ("cone de 4,5 m", "esfera de 6 m de raio"). */
export function describeShape(shape: Pick<MapShape, "kind" | "radius" | "length" | "width" | "side">): string {
  const m = (n: number | undefined) => `${(n ?? 0).toLocaleString("pt-BR")} m`;
  switch (shape.kind) {
    case "esfera":
      return `esfera de ${m(shape.radius)} de raio`;
    case "cilindro":
      return `cilindro de ${m(shape.radius)} de raio`;
    case "cubo":
      return `cubo de ${m(shape.side)}`;
    case "quadrado":
      return `quadrado de ${m(shape.side)}`;
    case "cone":
      return `cone de ${m(shape.length)}`;
    case "linha":
      return `linha de ${m(shape.length)} × ${m(shape.width)}`;
  }
}

// === Ids e URLs ===

export const characterTokenId = (characterId: string) => `c:${characterId}`;
export const creatureTokenId = (creatureId: string) => `m:${creatureId}`;

export function parseTokenId(id: string): { kind: "character" | "creature"; refId: string } | null {
  if (id.startsWith("c:")) return { kind: "character", refId: id.slice(2) };
  if (id.startsWith("m:")) return { kind: "creature", refId: id.slice(2) };
  return null;
}

export function creatureAvatarUrl(creature: Pick<Creature, "id" | "folderId" | "avatarVersion">): string | null {
  if (!creature.avatarVersion) return null;
  return `/api/folders/${encodeURIComponent(creature.folderId)}/creatures/${encodeURIComponent(creature.id)}/avatar?v=${encodeURIComponent(creature.avatarVersion)}`;
}

/** Foto do token (ficha ou criatura), já com a versão para cache. */
export function figureAvatarUrl(figure: MapFigure, folderId: string): string | null {
  if (!figure.avatarVersion) return null;
  if (figure.kind === "character") {
    return `/api/characters/${encodeURIComponent(figure.refId)}/avatar?v=${encodeURIComponent(figure.avatarVersion)}`;
  }
  return creatureAvatarUrl({ id: figure.refId, folderId, avatarVersion: figure.avatarVersion });
}

export function mapBackgroundUrl(folderId: string, background: MapBackground | null): string | null {
  if (!background) return null;
  return `/api/folders/${encodeURIComponent(folderId)}/map/background?v=${encodeURIComponent(background.version)}`;
}

/** Tamanho da área desenhável: a imagem de fundo ou um tabuleiro vazio. */
export function canvasSize(state: MapState): { width: number; height: number } {
  const bg = state.background;
  if (bg?.width && bg?.height) return { width: bg.width, height: bg.height };
  return { ...EMPTY_CANVAS };
}

/** Uma camada (nível da arena) que a tela pode mostrar ou esconder. */
export type Layer = "acima" | "normal" | "abaixo";

export const LAYERS: { key: Layer; label: string }[] = [
  { key: "acima", label: "Acima da arena" },
  { key: "normal", label: "Nível normal" },
  { key: "abaixo", label: "Abaixo da arena" },
];

export const layerOf = (elevation: Elevation | null | undefined): Layer => elevation ?? "normal";
