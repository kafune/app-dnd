import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Crosshair, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/avatar";
import {
  LAYERS,
  canvasSize,
  cellAt,
  cellKey,
  cellRect,
  directionOf,
  encaixarRotacao,
  figureAvatarUrl,
  isDirectional,
  layerOf,
  mapBackgroundUrl,
  parseCellKey,
  rotationTowards,
  shapeLabelPoint,
  shapePath,
  shapeReach,
  sizeInCells,
  snapCenter,
  tokenDiameter,
  type Layer,
  type MapFigure,
  type MapShape,
  type MapState,
  type MapToken,
  type TileMark,
} from "@/lib/map";

/** Como a tela reage ao toque. */
export type CanvasMode =
  | { kind: "normal" }
  | {
      /** Marcar acima/abaixo/terreno difícil: clique seleciona tokens e quadrados. */
      kind: "select";
      tokens: Set<string>;
      tiles: Set<string>;
      /** Quadrados podem ser selecionados? (não faz sentido para "marcar acima" só de tokens, mas vale para todos os modos) */
      onToggleToken: (id: string) => void;
      onPaintTiles: (keys: string[], selected: boolean) => void;
    }
  | {
      /** Posicionar um token que está fora do mapa: o próximo clique diz onde. */
      kind: "place";
      label: string;
      onPlace: (x: number, y: number) => void;
      onCancel: () => void;
    };

/** Uma forma local (prévia de magia) desenhada por cima do mapa. */
export type PreviewShape = {
  shape: MapShape;
  movable?: boolean;
  rotatable?: boolean;
  /** Só contorno tracejado (alcance da magia). */
  dashed?: boolean;
};

type Props = {
  folderId: string;
  state: MapState;
  figures: MapFigure[];
  role: "mestre" | "jogador";
  /** Token que o jogador controla. */
  myTokenId?: string | null;
  layers: Record<Layer, boolean>;
  onLayersChange: (layers: Record<Layer, boolean>) => void;
  mode: CanvasMode;
  previews?: PreviewShape[];
  onPreviewChange?: (shape: MapShape) => void;
  /** Depois de arrastar ou girar um token (já encaixado na grade). */
  onTokenChange: (id: string, patch: Partial<MapToken>) => void;
  /** Depois de arrastar ou girar uma forma do Mestre. */
  onShapeChange?: (shape: MapShape) => void;
  className?: string;
};

type View = { scale: number; tx: number; ty: number };

type Drag =
  | { type: "pan"; pointerId: number; startX: number; startY: number; view: View; moved: boolean }
  | { type: "token"; pointerId: number; id: string; offsetX: number; offsetY: number; startX: number; startY: number; moved: boolean }
  | { type: "shape"; pointerId: number; id: string; local: boolean; offsetX: number; offsetY: number; startX: number; startY: number; moved: boolean }
  | { type: "rotate-token"; pointerId: number; id: string; center: { x: number; y: number }; moved: boolean }
  | { type: "rotate-shape"; pointerId: number; id: string; local: boolean; center: { x: number; y: number }; moved: boolean }
  | { type: "paint"; pointerId: number; selected: boolean; painted: Set<string> }
  | { type: "pinch"; pointerId: number; other: number; distance: number; mid: { x: number; y: number }; view: View };

const CLICK_SLOP = 5;
const MIN_SCALE = 0.05;
const MAX_SCALE = 8;

const ELEVATION_COLOR = { acima: "#f97316", abaixo: "#3b82f6" } as const;
const DIFFICULT_COLOR = "#ef4444";
const CREATURE_COLOR = "#7f1d1d";
const SELECT_COLOR = "#facc15";

const safeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "_");

/**
 * O tabuleiro: imagem de fundo, grade, marcações, formas e tokens num único SVG.
 *
 * Tudo dentro do `<g>` principal fica em pixels da imagem; a transformação
 * (zoom + arraste) mora só nele. Assim a conversão de toque para mapa é uma
 * conta, e o encaixe na grade acontece em coordenadas da imagem.
 */
export function MapCanvas({
  folderId,
  state,
  figures,
  role,
  myTokenId,
  layers,
  onLayersChange,
  mode,
  previews = [],
  onPreviewChange,
  onTokenChange,
  onShapeChange,
  className,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<View>({ scale: 1, tx: 0, ty: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const drag = useRef<Drag | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  /** Posição provisória de quem está sendo arrastado (não vai para o servidor até soltar). */
  const [dragging, setDragging] = useState<{ tokens: Record<string, MapToken>; shapes: Record<string, MapShape> }>({ tokens: {}, shapes: {} });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [fitted, setFitted] = useState<string | null>(null);

  const canvas = canvasSize(state);
  const grid = state.grid;
  const master = role === "mestre";
  const gridOn = grid.enabled;
  const backgroundUrl = mapBackgroundUrl(folderId, state.background);
  const figureById = useMemo(() => new Map(figures.map((f) => [f.id, f])), [figures]);

  // Tamanho do container → tamanho do SVG.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fit = useCallback(() => {
    if (!size.w || !size.h) return;
    const scale = Math.min(size.w / canvas.width, size.h / canvas.height) * 0.97;
    setView({ scale, tx: (size.w - canvas.width * scale) / 2, ty: (size.h - canvas.height * scale) / 2 });
  }, [size.w, size.h, canvas.width, canvas.height]);

  // Primeira medida, troca de imagem ou container redimensionado (o Mestre puxou o
  // canto, o celular virou): enquadra o mapa inteiro de novo.
  const fitKey = `${canvas.width}x${canvas.height}:${size.w}x${size.h}`;
  useEffect(() => {
    if (fitted === fitKey || !size.w) return;
    setFitted(fitKey);
    fit();
  }, [fit, fitKey, fitted, size.w]);

  const toMap = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    const v = viewRef.current;
    const sx = clientX - (rect?.left ?? 0);
    const sy = clientY - (rect?.top ?? 0);
    return { x: (sx - v.tx) / v.scale, y: (sy - v.ty) / v.scale };
  }, []);

  const zoomAt = useCallback((factor: number, clientX?: number, clientY?: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    const v = viewRef.current;
    const cx = clientX !== undefined ? clientX - (rect?.left ?? 0) : size.w / 2;
    const cy = clientY !== undefined ? clientY - (rect?.top ?? 0) : size.h / 2;
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
    const k = scale / v.scale;
    setView({ scale, tx: cx - (cx - v.tx) * k, ty: cy - (cy - v.ty) * k });
  }, [size.w, size.h]);

  // Roda do mouse: zoom no cursor. Precisa de `passive: false` para segurar a rolagem da página.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomAt(event.deltaY < 0 ? 1.15 : 1 / 1.15, event.clientX, event.clientY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const canMoveToken = (id: string) => (master ? true : id === myTokenId);

  const tokenOf = (id: string): MapToken | undefined => dragging.tokens[id] ?? state.tokens[id];
  const sharedShapeOf = (id: string): MapShape | undefined =>
    dragging.shapes[id] ?? state.shapes.find((s) => s.id === id);
  const previewOf = (id: string): PreviewShape | undefined => previews.find((p) => p.shape.id === id);

  /** Onde o token fica ao soltar: encaixado na grade quando ela é do site. */
  const settle = (id: string, x: number, y: number) => {
    if (!gridOn) return { x, y };
    const figure = figureById.get(id);
    return snapCenter(x, y, sizeInCells(figure?.size), grid);
  };

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    // Segundo dedo: vira pinça (zoom), esquecendo o que o primeiro estava fazendo.
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.entries()];
      const distance = Math.hypot(a[1].x - b[1].x, a[1].y - b[1].y);
      drag.current = {
        type: "pinch",
        pointerId: a[0],
        other: b[0],
        distance,
        mid: { x: (a[1].x + b[1].x) / 2, y: (a[1].y + b[1].y) / 2 },
        view: viewRef.current,
      };
      setDragging({ tokens: {}, shapes: {} });
      svg.setPointerCapture(event.pointerId);
      return;
    }
    if (pointers.current.size > 2) return;
    svg.setPointerCapture(event.pointerId);
    const target = event.target as Element;
    const point = toMap(event.clientX, event.clientY);

    const handle = target.closest<SVGElement>("[data-handle]")?.dataset.handle;
    if (handle) {
      const [kind, ...rest] = handle.split(":");
      const id = rest.join(":");
      if (kind === "token") {
        const token = tokenOf(id);
        if (token) drag.current = { type: "rotate-token", pointerId: event.pointerId, id, center: { x: token.x, y: token.y }, moved: false };
      } else {
        const local = kind === "preview";
        const shape = local ? previewOf(id)?.shape : sharedShapeOf(id);
        if (shape) drag.current = { type: "rotate-shape", pointerId: event.pointerId, id, local, center: { x: shape.x, y: shape.y }, moved: false };
      }
      return;
    }

    if (mode.kind === "place") {
      drag.current = { type: "pan", pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, view: viewRef.current, moved: false };
      return;
    }

    const tokenId = target.closest<SVGElement>("[data-token]")?.dataset.token;
    if (tokenId) {
      if (mode.kind === "select") {
        mode.onToggleToken(tokenId);
        drag.current = null;
        return;
      }
      const token = tokenOf(tokenId);
      if (token && canMoveToken(tokenId)) {
        setActiveId(tokenId);
        drag.current = {
          type: "token",
          pointerId: event.pointerId,
          id: tokenId,
          offsetX: token.x - point.x,
          offsetY: token.y - point.y,
          startX: event.clientX,
          startY: event.clientY,
          moved: false,
        };
        return;
      }
      setActiveId(master ? tokenId : activeId);
    }

    const shapeId = target.closest<SVGElement>("[data-shape]")?.dataset.shape;
    const previewId = target.closest<SVGElement>("[data-preview]")?.dataset.preview;
    if ((shapeId && master && mode.kind === "normal") || (previewId && previewOf(previewId)?.movable)) {
      const local = !!previewId;
      const id = (previewId ?? shapeId)!;
      const shape = local ? previewOf(id)?.shape : sharedShapeOf(id);
      if (shape) {
        setActiveId(id);
        drag.current = {
          type: "shape",
          pointerId: event.pointerId,
          id,
          local,
          offsetX: shape.x - point.x,
          offsetY: shape.y - point.y,
          startX: event.clientX,
          startY: event.clientY,
          moved: false,
        };
        return;
      }
    }
    if (previewId && previewOf(previewId)?.rotatable && !previewOf(previewId)?.movable) {
      setActiveId(previewId);
    }

    if (mode.kind === "select" && gridOn && !tokenId) {
      const cell = cellAt(point.x, point.y, grid);
      const key = cellKey(cell.col, cell.row);
      const selected = !mode.tiles.has(key);
      mode.onPaintTiles([key], selected);
      drag.current = { type: "paint", pointerId: event.pointerId, selected, painted: new Set([key]) };
      return;
    }

    drag.current = { type: "pan", pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, view: viewRef.current, moved: false };
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (pointers.current.has(event.pointerId)) pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const d = drag.current;
    if (!d) return;
    if (d.type === "pinch") {
      const a = pointers.current.get(d.pointerId);
      const b = pointers.current.get(d.other);
      if (!a || !b) return;
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const rect = svgRef.current?.getBoundingClientRect();
      const left = rect?.left ?? 0;
      const top = rect?.top ?? 0;
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, d.view.scale * (distance / Math.max(1, d.distance))));
      const k = scale / d.view.scale;
      const cx = d.mid.x - left;
      const cy = d.mid.y - top;
      setView({
        scale,
        tx: cx - (cx - d.view.tx) * k + (mid.x - d.mid.x),
        ty: cy - (cy - d.view.ty) * k + (mid.y - d.mid.y),
      });
      return;
    }
    if (d.pointerId !== event.pointerId) return;
    const point = toMap(event.clientX, event.clientY);
    switch (d.type) {
      case "pan": {
        const dx = event.clientX - d.startX;
        const dy = event.clientY - d.startY;
        if (!d.moved && Math.hypot(dx, dy) < CLICK_SLOP) return;
        d.moved = true;
        setView({ scale: d.view.scale, tx: d.view.tx + dx, ty: d.view.ty + dy });
        return;
      }
      case "token": {
        if (!d.moved && Math.hypot(event.clientX - d.startX, event.clientY - d.startY) < CLICK_SLOP) return;
        d.moved = true;
        const base = state.tokens[d.id] ?? { x: 0, y: 0, rotation: 0 };
        const next = settle(d.id, point.x + d.offsetX, point.y + d.offsetY);
        setDragging((s) => ({ ...s, tokens: { ...s.tokens, [d.id]: { ...base, ...next } } }));
        return;
      }
      case "shape": {
        if (!d.moved && Math.hypot(event.clientX - d.startX, event.clientY - d.startY) < CLICK_SLOP) return;
        d.moved = true;
        const shape = d.local ? previewOf(d.id)?.shape : state.shapes.find((s) => s.id === d.id);
        if (!shape) return;
        const moved = { ...shape, x: point.x + d.offsetX, y: point.y + d.offsetY };
        if (d.local) onPreviewChange?.(moved);
        else setDragging((s) => ({ ...s, shapes: { ...s.shapes, [d.id]: moved } }));
        return;
      }
      case "rotate-token": {
        d.moved = true;
        const base = state.tokens[d.id];
        if (!base) return;
        setDragging((s) => ({ ...s, tokens: { ...s.tokens, [d.id]: { ...base, rotation: encaixarRotacao(rotationTowards(d.center, point)) } } }));
        return;
      }
      case "rotate-shape": {
        d.moved = true;
        const shape = d.local ? previewOf(d.id)?.shape : state.shapes.find((s) => s.id === d.id);
        if (!shape) return;
        const turned = { ...shape, rotation: encaixarRotacao(rotationTowards(d.center, point)) };
        if (d.local) onPreviewChange?.(turned);
        else setDragging((s) => ({ ...s, shapes: { ...s.shapes, [d.id]: turned } }));
        return;
      }
      case "paint": {
        if (mode.kind !== "select" || !gridOn) return;
        const cell = cellAt(point.x, point.y, grid);
        const key = cellKey(cell.col, cell.row);
        if (d.painted.has(key)) return;
        d.painted.add(key);
        mode.onPaintTiles([key], d.selected);
        return;
      }
    }
  };

  const endDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId);
    const d = drag.current;
    if (!d) return;
    if (d.type === "pinch") {
      if (event.pointerId === d.pointerId || event.pointerId === d.other) drag.current = null;
      return;
    }
    if (d.pointerId !== event.pointerId) return;
    drag.current = null;
    const point = toMap(event.clientX, event.clientY);
    switch (d.type) {
      case "pan":
        if (!d.moved) {
          if (mode.kind === "place") mode.onPlace(point.x, point.y);
          else setActiveId(null);
        }
        break;
      case "token": {
        const token = dragging.tokens[d.id];
        if (d.moved && token) onTokenChange(d.id, { x: token.x, y: token.y });
        break;
      }
      case "rotate-token": {
        const token = dragging.tokens[d.id];
        if (token) onTokenChange(d.id, { rotation: token.rotation });
        break;
      }
      case "shape":
      case "rotate-shape": {
        if (!d.local) {
          const shape = dragging.shapes[d.id];
          if (shape) onShapeChange?.(shape);
        }
        break;
      }
      case "paint":
        break;
    }
    setDragging({ tokens: {}, shapes: {} });
  };

  // === Desenho ===

  const ui = 1 / view.scale; // 1 px de tela, em pixels da imagem
  const visibleLayer = (elevation: MapToken["elevation"]) => layers[layerOf(elevation)];

  const tiles = useMemo(() => {
    if (!gridOn) return [];
    return Object.entries(state.tiles)
      .map(([key, mark]) => ({ key, mark, cell: parseCellKey(key) }))
      .filter((t): t is { key: string; mark: TileMark; cell: { col: number; row: number } } => !!t.cell);
  }, [state.tiles, gridOn]);

  const selectedTiles = mode.kind === "select" ? mode.tiles : null;
  const selectedTokens = mode.kind === "select" ? mode.tokens : null;

  // O token ativo (o que está sendo arrastado) vai por cima dos outros.
  const placedFigures = figures
    .filter((f) => !!tokenOf(f.id))
    .sort((a, b) => Number(a.id === activeId) - Number(b.id === activeId));

  const renderToken = (figure: MapFigure) => {
    const token = tokenOf(figure.id)!;
    if (!visibleLayer(token.elevation)) return null;
    const diameter = tokenDiameter(figure.size, grid);
    const r = diameter / 2;
    const hidden = figure.kind === "creature" && !token.visible;
    const ring = figure.kind === "creature" ? CREATURE_COLOR : (figure.color ?? "#71717a");
    const url = figureAvatarUrl(figure, folderId);
    const clip = `clip-${safeId(figure.id)}`;
    const movable = mode.kind === "normal" && canMoveToken(figure.id);
    const active = activeId === figure.id;
    const selected = selectedTokens?.has(figure.id);
    const badge = Math.max(7 * ui, r * 0.28);
    const fontSize = Math.max(10 * ui, Math.min(16 * ui, r * 0.45));
    const stroke = Math.max(2 * ui, r * 0.06);
    const dir = directionOf(token.rotation);
    const handleDistance = r + 16 * ui;
    return (
      <g key={figure.id} transform={`translate(${token.x},${token.y})`} opacity={hidden ? 0.45 : 1}>
        <g
          data-token={figure.id}
          style={{ cursor: mode.kind === "select" ? "pointer" : movable ? "grab" : "default" }}
        >
          <clipPath id={clip}>
            <circle r={Math.max(1, r - stroke)} />
          </clipPath>
          <circle r={r} fill={url ? "#e4e4e7" : ring} />
          {url ? (
            <image
              href={url}
              x={-r}
              y={-r}
              width={diameter}
              height={diameter}
              clipPath={`url(#${clip})`}
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fill="#fff"
              fontFamily="ui-monospace, monospace"
              fontWeight={600}
              fontSize={Math.max(8, r * 0.7)}
              style={{ userSelect: "none" }}
            >
              {initials(figure.name)}
            </text>
          )}
          <circle r={r} fill="none" stroke={ring} strokeWidth={stroke} />
          {(active || selected) && (
            <circle
              r={r + 3 * ui}
              fill="none"
              stroke={selected ? SELECT_COLOR : "#fff"}
              strokeWidth={2 * ui}
              strokeDasharray={selected ? undefined : `${4 * ui} ${3 * ui}`}
            />
          )}
          {/* Para onde a criatura olha */}
          <g transform={`rotate(${token.rotation})`}>
            <path d={`M0,${-r - stroke} l${-r * 0.22},${r * 0.32} h${r * 0.44} z`} fill={ring} stroke="#fff" strokeWidth={ui} />
          </g>
          {token.elevation && (
            <g transform={`translate(${r * 0.72},${-r * 0.72})`}>
              <circle r={badge} fill={ELEVATION_COLOR[token.elevation]} stroke="#fff" strokeWidth={ui} />
              <path
                d={token.elevation === "acima" ? `M0,${badge * 0.5} V${-badge * 0.5} M${-badge * 0.4},${-badge * 0.1} L0,${-badge * 0.5} L${badge * 0.4},${-badge * 0.1}` : `M0,${-badge * 0.5} V${badge * 0.5} M${-badge * 0.4},${badge * 0.1} L0,${badge * 0.5} L${badge * 0.4},${badge * 0.1}`}
                fill="none"
                stroke="#fff"
                strokeWidth={Math.max(ui, badge * 0.22)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}
          {hidden && master && (
            <text
              y={r + fontSize * 2.2}
              textAnchor="middle"
              fontSize={fontSize * 0.8}
              fill="#fca5a5"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              style={{ userSelect: "none" }}
            >
              escondido
            </text>
          )}
          <text
            y={r + fontSize * 1.1}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight={600}
            fill="#fff"
            stroke="rgba(0,0,0,.75)"
            strokeWidth={fontSize * 0.25}
            paintOrder="stroke"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            style={{ userSelect: "none" }}
          >
            {figure.name}
          </text>
        </g>
        {movable && active && (
          <g>
            <line x1={dir.dx * r} y1={dir.dy * r} x2={dir.dx * handleDistance} y2={dir.dy * handleDistance} stroke="#fff" strokeWidth={2 * ui} />
            <circle
              data-handle={`token:${figure.id}`}
              cx={dir.dx * handleDistance}
              cy={dir.dy * handleDistance}
              r={11 * ui}
              fill="#fff"
              stroke={ring}
              strokeWidth={3 * ui}
              style={{ cursor: "grab" }}
            />
          </g>
        )}
      </g>
    );
  };

  const renderShape = (shape: MapShape, opts: { local: boolean; movable: boolean; rotatable: boolean; dashed?: boolean }) => {
    const color = shape.color ?? "#a855f7";
    const active = activeId === shape.id;
    const reach = shapeReach(shape, grid);
    const dir = directionOf(shape.rotation);
    const dataAttr = opts.local ? { "data-preview": shape.id } : { "data-shape": shape.id };
    const fontSize = Math.max(11 * ui, Math.min(18 * ui, grid.size * 0.35));
    const labelAt = shapeLabelPoint(shape, grid);
    return (
      <g key={`${opts.local ? "p" : "s"}-${shape.id}`}>
        <path
          {...dataAttr}
          d={shapePath(shape, grid)}
          fill={opts.dashed ? "none" : color}
          fillOpacity={opts.dashed ? 0 : 0.28}
          stroke={color}
          strokeWidth={(active ? 3 : 2) * ui}
          strokeDasharray={opts.dashed ? `${6 * ui} ${4 * ui}` : undefined}
          style={{ cursor: opts.movable ? "grab" : "default", pointerEvents: opts.dashed ? "none" : undefined }}
        />
        {!opts.dashed && (
          <circle cx={shape.x} cy={shape.y} r={4 * ui} fill={color} stroke="#fff" strokeWidth={ui} style={{ pointerEvents: "none" }} />
        )}
        {shape.label && !opts.dashed && (
          <text
            x={labelAt.x}
            y={labelAt.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize}
            fontWeight={600}
            fill="#fff"
            stroke="rgba(0,0,0,.75)"
            strokeWidth={fontSize * 0.25}
            paintOrder="stroke"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            style={{ userSelect: "none", pointerEvents: "none" }}
          >
            {shape.label}
          </text>
        )}
        {opts.rotatable && active && isDirectional(shape.kind) && (
          <circle
            data-handle={`${opts.local ? "preview" : "shape"}:${shape.id}`}
            cx={shape.x + dir.dx * (reach + 14 * ui)}
            cy={shape.y + dir.dy * (reach + 14 * ui)}
            r={11 * ui}
            fill="#fff"
            stroke={color}
            strokeWidth={3 * ui}
            style={{ cursor: "grab" }}
          />
        )}
      </g>
    );
  };

  const cursor =
    mode.kind === "place" ? "crosshair" : mode.kind === "select" ? "cell" : drag.current?.type === "pan" ? "grabbing" : "grab";

  return (
    <div ref={wrapRef} className={cn("relative h-full w-full overflow-hidden bg-zinc-200 dark:bg-zinc-950", className)}>
      <svg
        ref={svgRef}
        width={size.w}
        height={size.h}
        className="block select-none"
        style={{ touchAction: "none", cursor }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          <pattern
            id="map-grid"
            patternUnits="userSpaceOnUse"
            width={grid.size}
            height={grid.size}
            x={grid.offsetX}
            y={grid.offsetY}
          >
            <path d={`M${grid.size},0 L0,0 L0,${grid.size}`} fill="none" stroke={grid.color} strokeOpacity={grid.opacity} strokeWidth={Math.max(1, ui)} />
          </pattern>
        </defs>
        <g transform={`translate(${view.tx},${view.ty}) scale(${view.scale})`}>
          {/* Plano de fundo */}
          {backgroundUrl ? (
            <image href={backgroundUrl} x={0} y={0} width={canvas.width} height={canvas.height} preserveAspectRatio="none" />
          ) : (
            <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="#d6d3d1" className="dark:fill-zinc-800" />
          )}
          {/* Grade do site */}
          {gridOn && <rect x={0} y={0} width={canvas.width} height={canvas.height} fill="url(#map-grid)" style={{ pointerEvents: "none" }} />}
          {/* Marcações dos quadrados: nível e terreno difícil */}
          {tiles.map(({ key, mark, cell }) => {
            if (!visibleLayer(mark.elevation)) return null;
            const rect = cellRect(cell.col, cell.row, grid);
            const badge = Math.max(6 * ui, rect.size * 0.16);
            const fill = mark.elevation ? ELEVATION_COLOR[mark.elevation] : DIFFICULT_COLOR;
            return (
              <g key={key} transform={`translate(${rect.x},${rect.y})`} style={{ pointerEvents: "none" }}>
                <rect width={rect.size} height={rect.size} fill={fill} fillOpacity={mark.elevation ? 0.28 : 0.18} />
                {mark.difficult && (
                  <g transform={`translate(${badge * 1.2},${badge * 1.2})`}>
                    <circle r={badge} fill={DIFFICULT_COLOR} stroke="#fff" strokeWidth={ui} />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={badge * 1.5}
                      fontWeight={700}
                      fill="#fff"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                    >
                      !
                    </text>
                  </g>
                )}
                {mark.elevation && (
                  <g transform={`translate(${rect.size - badge * 1.2},${badge * 1.2})`}>
                    <circle r={badge} fill={ELEVATION_COLOR[mark.elevation]} stroke="#fff" strokeWidth={ui} />
                    <path
                      d={
                        mark.elevation === "acima"
                          ? `M0,${badge * 0.5} V${-badge * 0.5} M${-badge * 0.4},${-badge * 0.1} L0,${-badge * 0.5} L${badge * 0.4},${-badge * 0.1}`
                          : `M0,${-badge * 0.5} V${badge * 0.5} M${-badge * 0.4},${badge * 0.1} L0,${badge * 0.5} L${badge * 0.4},${badge * 0.1}`
                      }
                      fill="none"
                      stroke="#fff"
                      strokeWidth={Math.max(ui, badge * 0.22)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}
              </g>
            );
          })}
          {/* Quadrados selecionados no modo de marcação */}
          {selectedTiles &&
            gridOn &&
            [...selectedTiles].map((key) => {
              const cell = parseCellKey(key);
              if (!cell) return null;
              const rect = cellRect(cell.col, cell.row, grid);
              return (
                <rect
                  key={`sel-${key}`}
                  x={rect.x}
                  y={rect.y}
                  width={rect.size}
                  height={rect.size}
                  fill={SELECT_COLOR}
                  fillOpacity={0.35}
                  stroke={SELECT_COLOR}
                  strokeWidth={2 * ui}
                  style={{ pointerEvents: "none" }}
                />
              );
            })}
          {/* Formas do Mestre (compartilhadas) */}
          {state.shapes.map((shape) =>
            renderShape(sharedShapeOf(shape.id) ?? shape, { local: false, movable: master && mode.kind === "normal", rotatable: master && mode.kind === "normal" }),
          )}
          {/* Prévias locais (magias do jogador / do Mestre) */}
          {previews.map((p) => renderShape(p.shape, { local: true, movable: !!p.movable, rotatable: !!p.rotatable, dashed: p.dashed }))}
          {/* Tokens */}
          {placedFigures.map(renderToken)}
        </g>
      </svg>

      {/* Camadas (níveis da arena): só fazem sentido com a grade do site */}
      {gridOn && (
      <div className="absolute right-2 top-2 flex flex-col gap-1 rounded-md border border-zinc-300 bg-white/90 p-1.5 text-[11px] shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/90">
        <div className="px-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Camadas</div>
        {LAYERS.map((layer) => (
          <label key={layer.key} className="flex cursor-pointer items-center gap-1.5 px-1">
            <input
              type="checkbox"
              className="h-3 w-3"
              checked={layers[layer.key]}
              onChange={(event) => onLayersChange({ ...layers, [layer.key]: event.target.checked })}
            />
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: layer.key === "acima" ? ELEVATION_COLOR.acima : layer.key === "abaixo" ? ELEVATION_COLOR.abaixo : "#a1a1aa" }}
            />
            {layer.label}
          </label>
        ))}
      </div>
      )}

      {/* Zoom */}
      <div className="absolute bottom-2 right-2 flex flex-col gap-1">
        <button
          type="button"
          aria-label="Aproximar"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-white/90 text-zinc-700 shadow-sm hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200"
          onClick={() => zoomAt(1.25)}
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Afastar"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-white/90 text-zinc-700 shadow-sm hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200"
          onClick={() => zoomAt(1 / 1.25)}
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Enquadrar o mapa"
          title="Enquadrar o mapa"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-white/90 text-zinc-700 shadow-sm hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200"
          onClick={fit}
        >
          <Crosshair className="h-4 w-4" />
        </button>
      </div>

      {mode.kind === "place" && (
        <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-amber-900 shadow dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-100">
            Toque no mapa para posicionar <strong>{mode.label}</strong>
            <button type="button" className="underline" onClick={mode.onCancel}>
              cancelar
            </button>
          </div>
        </div>
      )}
      {!gridOn && (
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[11px] text-white">
          Grade da imagem: só mover e girar criaturas.
        </div>
      )}
    </div>
  );
}
