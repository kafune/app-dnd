import { useEffect, useMemo, useState } from "react";
import { Eraser, MapPin, RotateCw, Shapes, Sparkles, X } from "lucide-react";
import { useIsMaster, useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { AREA_CATEGORY_LABELS, areaCategory, featureAreasOf, parseRangeMeters, spellAreaOf, type SpellArea } from "@/data/spellAreas";
import { findSpell } from "@/data/spellsCatalog";
import { ComponentesMagia } from "@/components/ComponentesMagia";
import {
  characterTokenId,
  canvasSize,
  describeShape,
  sizeInCells,
  snapCenter,
  tokenDiameter,
  type Layer,
  type MapShape,
} from "@/lib/map";
import { MapCanvas, type CanvasMode } from "./MapCanvas";
import { ShapeForm } from "./ShapeForm";
import { baseDims, buildPreview, type AreaPick } from "./areaPreview";

/** A aba "Mapa" da ficha: o tabuleiro + as magias e habilidades em área do personagem. */
export function PlayerMap({ characterId }: { characterId: string }) {
  const character = useStore((s) => s.characters[characterId]);
  const map = useStore((s) => s.map);
  const loadMap = useStore((s) => s.loadMap);
  const closeMap = useStore((s) => s.closeMap);
  const patchMap = useStore((s) => s.patchMap);
  const isMaster = useIsMaster(characterId);
  const folderId = character?.folderId;

  const [layers, setLayers] = useState<Record<Layer, boolean>>({ acima: true, normal: true, abaixo: true });
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [shapeForm, setShapeForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!folderId) return;
    void loadMap(folderId, characterId);
    return () => closeMap();
  }, [folderId, characterId, loadMap, closeMap]);

  const state = map && map.folderId === folderId ? map.state : null;
  const figures = useMemo(() => (map && map.folderId === folderId ? map.figures : []), [map, folderId]);
  const myTokenId = characterTokenId(characterId);
  const myFigure = figures.find((f) => f.id === myTokenId);
  const myToken = state?.tokens[myTokenId];
  const gridOn = state?.grid.enabled ?? true;
  // O Mestre tirou o personagem do mapa: só ele o põe de volta.
  const removedByMaster = !isMaster && !myToken && !!state?.excluded?.includes(myTokenId);

  // As magias e habilidades da ficha que têm área, separadas em fixas e reguláveis.
  const areas = useMemo(() => {
    if (!character) return { fixa: [] as AreaPick[], regulavel: [] as AreaPick[] };
    const out = { fixa: [] as AreaPick[], regulavel: [] as AreaPick[] };
    const push = (key: string, label: string, area: SpellArea, range: number | null) => {
      const entry: AreaPick = { key, label, area, range, dims: baseDims(area) };
      out[areaCategory(area)].push(entry);
    };
    const spells = [...character.sheet.spells.cantrips, ...character.sheet.spells.known];
    const seen = new Set<string>();
    for (const spell of spells) {
      const area = spellAreaOf(spell.name);
      if (!area || seen.has(spell.name)) continue;
      seen.add(spell.name);
      const range = area.origin === "point" ? parseRangeMeters(spell.range || findSpell(spell.name)?.range) : null;
      push(`spell:${spell.name}`, spell.name, area, range);
    }
    const classNames = character.sheet.classes.map((c) => c.name);
    for (const feature of featureAreasOf(character.sheet.features, classNames, character.sheet.raceInfo?.choices)) {
      const resolved = feature.variants && !feature.variants.some((v) => v.area === feature.area) ? feature.variants : null;
      if (resolved) {
        // Sem a escolha (cor do dragão) na ficha: mostra as duas formas possíveis.
        for (const variant of resolved) push(`feature:${feature.key}:${variant.label}`, `${feature.label} (${variant.label})`, variant.area, null);
      } else {
        push(`feature:${feature.key}`, feature.label, feature.area, null);
      }
    }
    return out;
  }, [character]);

  if (!character || !folderId) return null;

  const color = character.color ?? "#7c3aed";
  const ownShapes = state?.shapes.filter((shape) => shape.ownerId === characterId) ?? [];
  const activeShape = ownShapes.find((shape) => shape.sourceKey === activeKey) ?? ownShapes.find((shape) => shape.sourceKey);
  const entry = [...areas.fixa, ...areas.regulavel].find((entry) => entry.key === activeShape?.sourceKey);
  const pick = entry && activeShape ? { ...entry, dims: baseDims(activeShape) } : null;
  const previews = pick && state && myToken && gridOn
    ? buildPreview(pick, myToken, tokenDiameter(myFigure?.size, state.grid) / 2, state.grid, color, activeShape!).filter((p) => p.dashed)
    : [];

  const saveShape = (shape: MapShape) => patchMap({ op: "shape", id: shape.id, characterId, shape });
  const removeShape = (shape: MapShape) => patchMap({ op: "shape", id: shape.id, characterId, remove: true });
  const clearMine = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (await patchMap({ op: "clearShapes", characterId })) setActiveKey(null);
    } finally {
      setSaving(false);
    }
  };
  const choose = async (entry: AreaPick) => {
    if (saving || !state) return;
    setSaving(true);
    try {
      const existing = ownShapes.find((shape) => shape.sourceKey === entry.key);
      if (existing) {
        await removeShape(existing);
      } else if (myToken) {
        const preview = buildPreview(entry, myToken, tokenDiameter(myFigure?.size, state.grid) / 2, state.grid, color, null).find((p) => !p.dashed)!;
        if (await saveShape({ ...preview.shape, id: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`, ownerId: characterId, sourceKey: entry.key })) setActiveKey(entry.key);
      }
    } finally {
      setSaving(false);
    }
  };

  const placeMe = (x: number, y: number) => {
    if (!state) return;
    const at = gridOn ? snapCenter(x, y, sizeInCells(myFigure?.size), state.grid) : { x, y };
    void patchMap({ op: "token", id: myTokenId, token: { x: at.x, y: at.y, rotation: 0 } });
    setPlacing(false);
  };

  const mode: CanvasMode = placing
    ? { kind: "place", label: character.characterName, onPlace: placeMe, onCancel: () => setPlacing(false) }
    : { kind: "normal" };

  const adjustable = pick?.area.adjustable;
  const adjustValue = adjustable ? (pick!.dims[adjustable.dimension] ?? 0) : 0;
  const dimensionLabel = { radius: "Raio (m)", length: "Comprimento (m)", side: "Lado (m)" } as const;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="h-[60vh] min-h-[320px]">
          {state ? (
            <MapCanvas
              folderId={folderId}
              state={state}
              figures={figures}
              role={isMaster ? "mestre" : "jogador"}
              myTokenId={myTokenId}
              layers={layers}
              onLayersChange={setLayers}
              mode={mode}
              previews={previews}
              onTokenChange={(id, patch) => void patchMap({ op: "token", id, token: patch })}
              onShapeChange={(shape) => void saveShape(shape)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">Carregando o mapa…</div>
          )}
        </div>
        <CardBody className="flex flex-wrap items-center gap-2 border-t border-zinc-100 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
          {state && removedByMaster ? (
            <span>O Mestre tirou seu personagem do mapa. Quando for a sua vez na cena, ele coloca você de volta.</span>
          ) : state && !myToken ? (
            <>
              <span>Seu personagem ainda não está no mapa.</span>
              <Button size="sm" variant={placing ? "success" : "outline"} onClick={() => setPlacing((v) => !v)}>
                <MapPin className="h-3 w-3" /> {placing ? "Toque no mapa…" : "Posicionar meu personagem"}
              </Button>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1">
                <RotateCw className="h-3 w-3" /> Toque no seu token e puxe o círculo branco para girar o personagem.
              </span>
              <span>Arraste o token para se mover.</span>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            disabled={saving || ownShapes.length === 0}
            onClick={() => void clearMine()}
            title="Remove do mapa todas as magias e formas que você colocou (as dos outros ficam)"
          >
            <Eraser className="h-3 w-3" /> Limpar minhas áreas{ownShapes.length ? ` (${ownShapes.length})` : ""}
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-2">
          <p className="text-xs text-zinc-500">As áreas ficam visíveis para toda a mesa. Clique novamente na magia para removê-la. Você pode mover apenas suas próprias áreas.</p>
          <Button size="sm" variant="outline" disabled={!state || !gridOn || removedByMaster} onClick={() => setShapeForm((v) => !v)}><Shapes className="h-3 w-3" /> Inserir forma geométrica</Button>
          {shapeForm && state && gridOn && <ShapeForm fixedColor={color} onClose={() => setShapeForm(false)} onInsert={(shape) => {
            const center = canvasSize(state);
            void saveShape({ ...shape, ownerId: characterId, x: center.width / 2, y: center.height / 2 });
          }} />}
          {ownShapes.map((shape) => <div key={shape.id} className="flex items-center gap-2 text-xs">
            <button type="button" className="underline" onClick={() => setActiveKey(shape.sourceKey ?? null)}>{shape.label ?? describeShape(shape)}</button>
            <Button size="sm" variant="ghost" onClick={() => void removeShape(shape)}><X className="h-3 w-3" /> Remover</Button>
          </div>)}
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <CardTitle>
              <Sparkles className="mr-1 inline h-3.5 w-3.5" /> Magias e habilidades em área
            </CardTitle>
            <span className="text-[11px] text-zinc-500">1 quadrado = 1,5 m · em escala real no mapa</span>
          </div>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          {!gridOn ? (
            <p className="text-xs text-zinc-500">
              O Mestre está usando a grade embutida na imagem, então as áreas ficam desligadas: só dá para mover e girar o personagem.
            </p>
          ) : areas.fixa.length + areas.regulavel.length === 0 ? (
            <p className="text-xs text-zinc-500">Nenhuma magia ou habilidade com área nesta ficha.</p>
          ) : (
            <>
              {(["fixa", "regulavel"] as const).map((category) =>
                areas[category].length === 0 ? null : (
                  <div key={category}>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">{AREA_CATEGORY_LABELS[category]}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {areas[category].map((entry) => (
                        <button
                          key={entry.key}
                          type="button"
                          disabled={saving || (!myToken && !ownShapes.some((shape) => shape.sourceKey === entry.key))}
                          title={[describeShape({ kind: entry.area.kind, ...entry.dims }), entry.area.note].filter(Boolean).join(" · ")}
                          onClick={() => choose(entry)}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-xs transition disabled:cursor-not-allowed disabled:opacity-50",
                            ownShapes.some((shape) => shape.sourceKey === entry.key)
                              ? "border-transparent text-white"
                              : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
                          )}
                          style={ownShapes.some((shape) => shape.sourceKey === entry.key) ? { backgroundColor: color } : undefined}
                        >
                          {entry.label}
                          <span className={cn("ml-1 text-[10px]", ownShapes.some((shape) => shape.sourceKey === entry.key) ? "text-white/80" : "text-zinc-500")}>
                            {entry.area.origin === "self" ? "de você" : "num ponto"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ),
              )}
              {!myToken && <p className="text-xs text-zinc-500">Posicione o personagem no mapa para ver as áreas.</p>}
              {pick && (
                <div className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-200 p-2 text-xs dark:border-zinc-800">
                  <strong>{pick.label}</strong>
                  <span className="text-zinc-500">{describeShape({ kind: pick.area.kind, ...pick.dims })}</span>
                  {adjustable && (
                    <label className="flex items-center gap-1">
                      {dimensionLabel[adjustable.dimension]}
                      <Input
                        inputMode="decimal"
                        value={String(adjustValue)}
                        onChange={(event) => {
                          const n = Number(event.target.value.replace(",", "."));
                          if (!Number.isFinite(n)) return;
                          if (activeShape) void saveShape({ ...activeShape, [adjustable.dimension]: Math.min(adjustable.max, Math.max(0.5, n)) });
                        }}
                        className="h-7 w-20 text-xs"
                      />
                      <span className="text-zinc-500">
                        até {adjustable.max.toLocaleString("pt-BR")} m
                      </span>
                    </label>
                  )}
                  {pick.area.note && <span className="basis-full text-zinc-500">{pick.area.note}</span>}
                  {pick.key.startsWith("spell:") && (
                    <div className="basis-full">
                      <ComponentesMagia magia={
                        [...character.sheet.spells.cantrips, ...character.sheet.spells.known].find((spell) => spell.name === pick.label)
                        ?? { name: pick.label }
                      } />
                    </div>
                  )}
                  <span className="basis-full text-zinc-500">
                    Arraste a área para posicionar e puxe o círculo branco para girar. Ela permanece nesse local ao trocar de aba.
                    {pick.range ? ` Alcance: ${pick.range.toLocaleString("pt-BR")} m (círculo tracejado).` : ""}
                  </span>
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => activeShape && void removeShape(activeShape)}>
                    <X className="h-3 w-3" /> Remover área
                  </Button>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
