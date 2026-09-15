import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowDownCircle, ArrowUpCircle, Eraser, Eye, EyeOff, ImagePlus, Map as MapIcon, Shapes, Trash2, TriangleAlert, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { prepareMapBackground } from "@/lib/avatar";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import {
  SHAPE_LABELS,
  canvasSize,
  describeShape,
  figureAvatarUrl,
  sizeInCells,
  snapCenter,
  tokenCells,
  type Layer,
  type MapFigure,
  type MapGrid,
  type MapShape,
  type ShapeKind,
} from "@/lib/map";
import { MapCanvas, type CanvasMode } from "./MapCanvas";
import { initials } from "@/lib/avatar";

type Tool = "acima" | "abaixo" | "dificil" | "limpar";

const TOOLS: { key: Tool; label: string; icon: typeof ArrowUpCircle; hint: string }[] = [
  { key: "acima", label: "Marcar acima", icon: ArrowUpCircle, hint: "Seta laranja: acima do nível da arena." },
  { key: "abaixo", label: "Marcar abaixo", icon: ArrowDownCircle, hint: "Seta azul: abaixo do nível da arena." },
  { key: "dificil", label: "Terreno difícil", icon: TriangleAlert, hint: "Ponto de exclamação vermelho no quadrado." },
  { key: "limpar", label: "Limpar marcas", icon: Eraser, hint: "Tira as marcas do que for selecionado." },
];

const MIN_W = 320;
const MIN_H = 240;
const MAX_H = 1600;

const selectCls =
  "h-8 rounded-md border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

function loadSize(folderId: string): { w: number; h: number } {
  try {
    const raw = localStorage.getItem(`map-size:${folderId}`);
    if (raw) {
      const parsed = JSON.parse(raw) as { w?: number; h?: number };
      if (parsed.w && parsed.h) return { w: parsed.w, h: parsed.h };
    }
  } catch {
    // sem localStorage: tamanho padrão
  }
  return { w: 10_000, h: 520 };
}

/**
 * O mapa no Hub do Mestre: fundo, grade, marcações, formas, tokens e quem vê o quê.
 * O canto inferior direito se puxa para o mapa ocupar mais (ou menos) da tela.
 */
export function MasterMap({ folderId }: { folderId: string }) {
  const map = useStore((s) => s.map);
  const loadMap = useStore((s) => s.loadMap);
  const closeMap = useStore((s) => s.closeMap);
  const patchMap = useStore((s) => s.patchMap);
  const uploadMapBackground = useStore((s) => s.uploadMapBackground);
  const removeMapBackground = useStore((s) => s.removeMapBackground);
  const pushToast = useStore((s) => s.pushToast);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(() => loadSize(folderId));
  const [layers, setLayers] = useState<Record<Layer, boolean>>({ acima: true, normal: true, abaixo: true });
  const [tool, setTool] = useState<{ kind: Tool; tokens: Set<string>; tiles: Set<string> } | null>(null);
  const [placing, setPlacing] = useState<MapFigure | null>(null);
  const [shapeForm, setShapeForm] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [busyBackground, setBusyBackground] = useState(false);

  useEffect(() => {
    void loadMap(folderId);
    return () => closeMap();
  }, [folderId, loadMap, closeMap]);

  useEffect(() => {
    try {
      localStorage.setItem(`map-size:${folderId}`, JSON.stringify(size));
    } catch {
      // sem localStorage
    }
  }, [size, folderId]);

  const state = map?.folderId === folderId ? map.state : null;
  const figures = useMemo(() => (map?.folderId === folderId ? map.figures : []), [map, folderId]);
  const gridOn = state?.grid.enabled ?? true;

  // === Redimensionar puxando o canto ===
  const resize = useRef<{ pointerId: number; startX: number; startY: number; w: number; h: number } | null>(null);
  const onResizeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    resize.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, w: wrap.clientWidth, h: size.h };
  };
  const onResizeMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const r = resize.current;
    if (!r || r.pointerId !== event.pointerId) return;
    const limit = wrapRef.current?.parentElement?.clientWidth ?? window.innerWidth;
    const w = Math.max(MIN_W, Math.min(limit, r.w + (event.clientX - r.startX)));
    const h = Math.max(MIN_H, Math.min(MAX_H, r.h + (event.clientY - r.startY)));
    setSize({ w, h });
  };
  const onResizeEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (resize.current?.pointerId === event.pointerId) resize.current = null;
  };

  // === Ações ===
  const onBackground = async (file: File | undefined) => {
    if (!file) return;
    setBusyBackground(true);
    try {
      const { blob, width, height } = await prepareMapBackground(file);
      await uploadMapBackground(folderId, blob, { width, height });
    } catch (e) {
      pushToast({ title: "Não foi possível usar essa imagem", description: errorMessage(e), tone: "danger" });
    } finally {
      setBusyBackground(false);
    }
  };

  const concludeTool = () => {
    if (!tool || !state) return;
    const tokens = [...tool.tokens];
    const tiles = new Set(tool.tiles);
    // Terreno difícil é do chão: um token selecionado marca os quadrados debaixo dele.
    if (tool.kind === "dificil") {
      for (const id of tokens) {
        const token = state.tokens[id];
        const figure = figures.find((f) => f.id === id);
        if (token) for (const key of tokenCells(token, sizeInCells(figure?.size), state.grid)) tiles.add(key);
      }
    }
    const op =
      tool.kind === "acima" || tool.kind === "abaixo"
        ? { op: "mark" as const, tokens, tiles: [...tiles], elevation: tool.kind }
        : tool.kind === "dificil"
          ? { op: "mark" as const, tiles: [...tiles], difficult: true }
          : { op: "mark" as const, tokens, tiles: [...tiles], elevation: null, difficult: false };
    void patchMap(op);
    setTool(null);
  };

  const place = (x: number, y: number) => {
    if (!placing || !state) return;
    const at = gridOn ? snapCenter(x, y, sizeInCells(placing.size), state.grid) : { x, y };
    void patchMap({
      op: "token",
      id: placing.id,
      token: { x: at.x, y: at.y, rotation: 0, ...(placing.kind === "creature" ? { visible: false } : {}) },
    });
    setPlacing(null);
  };

  const mode: CanvasMode = placing
    ? { kind: "place", label: placing.name, onPlace: place, onCancel: () => setPlacing(null) }
    : tool
      ? {
          kind: "select",
          tokens: tool.tokens,
          tiles: tool.tiles,
          onToggleToken: (id) =>
            setTool((t) => {
              if (!t) return t;
              const tokens = new Set(t.tokens);
              if (tokens.has(id)) tokens.delete(id);
              else tokens.add(id);
              return { ...t, tokens };
            }),
          onPaintTiles: (keys, selected) =>
            setTool((t) => {
              if (!t) return t;
              const tiles = new Set(t.tiles);
              for (const key of keys) {
                if (selected) tiles.add(key);
                else tiles.delete(key);
              }
              return { ...t, tiles };
            }),
        }
      : { kind: "normal" };

  const unplaced = figures.filter((f) => !state?.tokens[f.id]);
  const creatures = figures.filter((f) => f.kind === "creature");

  return (
    <section className="w-full px-4">
      <div ref={wrapRef} className="mx-auto" style={{ width: "100%", maxWidth: size.w }}>
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-wrap items-center gap-2">
          <CardTitle className="mr-auto">
            <MapIcon className="mr-1 inline h-3.5 w-3.5" /> Mapa da mesa
          </CardTitle>
          <label className={cn("inline-flex cursor-pointer items-center gap-1 rounded-md border border-zinc-300 px-2 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800", "h-7", busyBackground && "opacity-50")}>
            <ImagePlus className="h-3 w-3" /> {state?.background ? "Trocar plano de fundo" : "Enviar plano de fundo"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={busyBackground}
              onChange={(event) => {
                void onBackground(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          {state?.background && (
            <Button variant="ghost" size="sm" onClick={() => void removeMapBackground(folderId)}>
              <Trash2 className="h-3 w-3" /> Remover fundo
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)} title="Tira todos os tokens, marcas e formas do mapa">
            <Eraser className="h-3 w-3" /> Limpar mapa
          </Button>
        </CardHeader>

        {state && <GridSettings grid={state.grid} onChange={(grid) => void patchMap({ op: "grid", grid })} />}

        {/* Ferramentas de marcação e formas: só com a grade do site. */}
        {state && gridOn && (
          <div className="flex flex-wrap items-center gap-1 border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
            {tool ? (
              <>
                <span className="text-xs text-zinc-600 dark:text-zinc-300">
                  <strong>{TOOLS.find((t) => t.key === tool.kind)?.label}</strong>: toque nos tokens e quadrados (ou arraste pelos quadrados).{" "}
                  {tool.tokens.size + tool.tiles.size} selecionado(s).
                </span>
                <Button variant="success" size="sm" className="ml-auto" onClick={concludeTool} disabled={tool.tokens.size + tool.tiles.size === 0}>
                  Concluir
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setTool(null)}>
                  <X className="h-3 w-3" /> Cancelar
                </Button>
              </>
            ) : (
              <>
                {TOOLS.map((t) => (
                  <Button
                    key={t.key}
                    variant="outline"
                    size="sm"
                    title={t.hint}
                    onClick={() => setTool({ kind: t.key, tokens: new Set(), tiles: new Set() })}
                  >
                    <t.icon className="h-3 w-3" /> {t.label}
                  </Button>
                ))}
                <Button variant={shapeForm ? "success" : "outline"} size="sm" className="ml-auto" onClick={() => setShapeForm((v) => !v)}>
                  <Shapes className="h-3 w-3" /> Inserir elementos
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={state.shapes.length === 0}
                  onClick={() => void patchMap({ op: "shapes", shapes: [] })}
                  title="Remove só as formas geométricas"
                >
                  <Eraser className="h-3 w-3" /> Limpar elementos
                </Button>
              </>
            )}
          </div>
        )}
        {state && gridOn && shapeForm && !tool && (
          <ShapeForm
            onInsert={(shape) => {
              const center = canvasSize(state);
              void patchMap({ op: "shapes", shapes: [...state.shapes, { ...shape, x: center.width / 2, y: center.height / 2 }] });
            }}
            onClose={() => setShapeForm(false)}
          />
        )}

        <div style={{ height: size.h }} className="relative">
          {state ? (
            <MapCanvas
              folderId={folderId}
              state={state}
              figures={figures}
              role="mestre"
              layers={layers}
              onLayersChange={setLayers}
              mode={mode}
              onTokenChange={(id, patch) => void patchMap({ op: "token", id, token: patch })}
              onShapeChange={(shape) => void patchMap({ op: "shapes", shapes: state.shapes.map((s) => (s.id === shape.id ? shape : s)) })}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">Carregando o mapa…</div>
          )}
          {/* Puxador do canto */}
          <div
            role="separator"
            aria-label="Redimensionar o mapa"
            title="Puxe para mudar o tamanho do mapa"
            className="absolute bottom-0 right-0 z-10 h-6 w-6 cursor-nwse-resize touch-none"
            onPointerDown={onResizeStart}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeEnd}
            onPointerCancel={onResizeEnd}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-zinc-500">
              <path d="M22 22 L22 12 M22 22 L12 22 M22 16 L16 22 M22 10 L10 22" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>

        {state && (
          <CardBody className="grid gap-4 border-t border-zinc-100 text-xs dark:border-zinc-800 sm:grid-cols-2">
            <div>
              <div className="mb-1 font-semibold uppercase tracking-wide text-zinc-500">Fora do mapa</div>
              {unplaced.length === 0 ? (
                <p className="text-zinc-500">Todo mundo está no mapa. Fichas novas e criaturas novas aparecem aqui.</p>
              ) : (
                <ul className="flex flex-wrap gap-1.5">
                  {unplaced.map((figure) => (
                    <li key={figure.id}>
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                          placing?.id === figure.id ? "border-amber-400 bg-amber-50 dark:bg-amber-950/40" : "border-zinc-300 dark:border-zinc-700",
                        )}
                        onClick={() => setPlacing(figure)}
                        title="Clique e depois toque no mapa para posicionar"
                      >
                        <FigureFace figure={figure} folderId={folderId} />
                        {figure.name}
                        <span className="text-[10px] text-zinc-500">{figure.size}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <div className="mb-1 font-semibold uppercase tracking-wide text-zinc-500">Monstros e visão dos jogadores</div>
              {creatures.length === 0 ? (
                <p className="text-zinc-500">Crie criaturas na cena para elas virarem tokens (escondidos até você liberar a visão).</p>
              ) : (
                <ul className="space-y-1">
                  {creatures.map((figure) => {
                    const token = state.tokens[figure.id];
                    return (
                      <li key={figure.id} className="flex flex-wrap items-center gap-1.5">
                        <FigureFace figure={figure} folderId={folderId} />
                        <span className="min-w-0 flex-1 truncate">{figure.name}</span>
                        {!token ? (
                          <span className="text-zinc-500">fora do mapa</span>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant={token.visible ? "success" : "outline"}
                              onClick={() => void patchMap({ op: "token", id: figure.id, token: { visible: !token.visible } })}
                              title={token.visible ? "Os jogadores estão vendo este monstro" : "Os jogadores ainda não veem este monstro"}
                            >
                              {token.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                              {token.visible ? "Visível" : "Liberar visão"}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              aria-label={`Tirar ${figure.name} do mapa`}
                              title="Tirar do mapa"
                              onClick={() => void patchMap({ op: "token", id: figure.id, remove: true })}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </CardBody>
        )}
      </Card>
      </div>
      <ConfirmDialog
        open={confirmReset}
        title="Limpar o mapa?"
        description="Tira todos os tokens, marcas de nível, terrenos difíceis e formas do mapa. A imagem de fundo e a grade ficam."
        confirmLabel="Limpar"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          void patchMap({ op: "reset" });
        }}
      />
    </section>
  );
}

function FigureFace({ figure, folderId }: { figure: MapFigure; folderId: string }) {
  const url = figureAvatarUrl(figure, folderId);
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full text-[9px] font-semibold text-white"
      style={{ backgroundColor: figure.kind === "creature" ? "#7f1d1d" : (figure.color ?? "#71717a") }}
    >
      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : initials(figure.name)}
    </span>
  );
}

/**
 * Grade: do site (com tamanho e deslocamento reguláveis) ou a que já vem na imagem.
 * As mudanças esperam meio segundo antes de ir ao servidor, para o arrastar do
 * controle não virar uma rajada de PATCHes.
 */
function GridSettings({ grid, onChange }: { grid: MapGrid; onChange: (patch: Partial<MapGrid>) => void }) {
  const [draft, setDraft] = useState(grid);
  const pending = useRef<Partial<MapGrid>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // O servidor confirmou (ou outra aba mudou): alinha o rascunho quando não há nada pendente.
  useEffect(() => {
    if (!timer.current) setDraft(grid);
  }, [grid]);

  const update = (patch: Partial<MapGrid>) => {
    setDraft((d) => ({ ...d, ...patch }));
    pending.current = { ...pending.current, ...patch };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      const out = pending.current;
      pending.current = {};
      onChange(out);
    }, 400);
  };

  const number = (key: "size" | "offsetX" | "offsetY", value: string) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    update({ [key]: key === "size" ? Math.max(8, n) : n });
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-zinc-100 px-3 py-2 text-xs dark:border-zinc-800">
      <label className="flex items-center gap-1.5">
        <input type="checkbox" checked={draft.enabled} onChange={(e) => update({ enabled: e.target.checked })} />
        Grade do site
      </label>
      {!draft.enabled && <span className="text-zinc-500">Usando a grade embutida na imagem.</span>}
      <label className="flex items-center gap-1">
        {draft.enabled ? "Quadrado (px)" : "Tamanho do token (px)"}
        <input
          type="range"
          min={8}
          max={400}
          value={Math.min(400, draft.size)}
          onChange={(e) => number("size", e.target.value)}
          className="w-24"
        />
        <Input inputMode="numeric" value={String(Math.round(draft.size * 100) / 100)} onChange={(e) => number("size", e.target.value)} className="h-7 w-16 px-1 text-xs" />
      </label>
      {draft.enabled && (
        <>
          <label className="flex items-center gap-1">
            Desloc. X
            <Input inputMode="numeric" value={String(draft.offsetX)} onChange={(e) => number("offsetX", e.target.value)} className="h-7 w-16 px-1 text-xs" />
          </label>
          <label className="flex items-center gap-1">
            Y
            <Input inputMode="numeric" value={String(draft.offsetY)} onChange={(e) => number("offsetY", e.target.value)} className="h-7 w-16 px-1 text-xs" />
          </label>
          <label className="flex items-center gap-1">
            Cor
            <input type="color" value={draft.color} onChange={(e) => update({ color: e.target.value })} className="h-7 w-8 rounded border border-zinc-300 bg-white dark:border-zinc-700" />
          </label>
          <label className="flex items-center gap-1">
            Opacidade
            <input type="range" min={0} max={1} step={0.05} value={draft.opacity} onChange={(e) => update({ opacity: Number(e.target.value) })} className="w-20" />
          </label>
        </>
      )}
      <span className="text-zinc-500">1 quadrado = 1,5 m</span>
    </div>
  );
}

/** Formulário de "Inserir elementos": uma forma do PHB com as medidas em metros. */
function ShapeForm({ onInsert, onClose }: { onInsert: (shape: Omit<MapShape, "x" | "y">) => void; onClose: () => void }) {
  const [kind, setKind] = useState<ShapeKind>("esfera");
  const [radius, setRadius] = useState("6");
  const [length, setLength] = useState("9");
  const [width, setWidth] = useState("1.5");
  const [side, setSide] = useState("4.5");
  const [color, setColor] = useState("#a855f7");
  const [label, setLabel] = useState("");

  const n = (v: string) => Math.max(0.5, Number(v.replace(",", ".")) || 0.5);
  const dims =
    kind === "esfera" || kind === "cilindro"
      ? { radius: n(radius) }
      : kind === "cone"
        ? { length: n(length) }
        : kind === "linha"
          ? { length: n(length), width: n(width) }
          : { side: n(side), centered: true };

  return (
    <form
      className="flex flex-wrap items-end gap-2 border-b border-zinc-100 bg-zinc-50 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900/60"
      onSubmit={(event) => {
        event.preventDefault();
        onInsert({
          id: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          kind,
          rotation: 0,
          color,
          ...(label.trim() ? { label: label.trim() } : {}),
          ...dims,
        });
      }}
    >
      <label className="flex flex-col gap-0.5">
        Forma
        <select className={selectCls} value={kind} onChange={(e) => setKind(e.target.value as ShapeKind)}>
          {(Object.keys(SHAPE_LABELS) as ShapeKind[]).map((k) => (
            <option key={k} value={k}>
              {SHAPE_LABELS[k]}
            </option>
          ))}
        </select>
      </label>
      {(kind === "esfera" || kind === "cilindro") && (
        <label className="flex flex-col gap-0.5">
          Raio (m)
          <Input inputMode="decimal" value={radius} onChange={(e) => setRadius(e.target.value)} className="h-8 w-20 text-xs" />
        </label>
      )}
      {(kind === "cone" || kind === "linha") && (
        <label className="flex flex-col gap-0.5">
          Comprimento (m)
          <Input inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} className="h-8 w-20 text-xs" />
        </label>
      )}
      {kind === "linha" && (
        <label className="flex flex-col gap-0.5">
          Largura (m)
          <Input inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} className="h-8 w-20 text-xs" />
        </label>
      )}
      {(kind === "cubo" || kind === "quadrado") && (
        <label className="flex flex-col gap-0.5">
          Lado (m)
          <Input inputMode="decimal" value={side} onChange={(e) => setSide(e.target.value)} className="h-8 w-20 text-xs" />
        </label>
      )}
      <label className="flex flex-col gap-0.5">
        Rótulo
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="ex.: Bola de Fogo" className="h-8 w-36 text-xs" />
      </label>
      <label className="flex flex-col gap-0.5">
        Cor
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-10 rounded border border-zinc-300 bg-white dark:border-zinc-700" />
      </label>
      <Button type="submit" size="sm">
        Inserir {describeShape({ kind, ...dims })}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onClose}>
        Fechar
      </Button>
      <span className="basis-full text-[11px] text-zinc-500">
        A forma aparece no centro do mapa: arraste para posicionar e, com ela selecionada, puxe o círculo branco para girar.
      </span>
    </form>
  );
}
