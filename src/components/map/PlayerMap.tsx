import { useEffect, useMemo, useState } from "react";
import { MapPin, RotateCw, Sparkles, X } from "lucide-react";
import { useIsMaster, useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { AREA_CATEGORY_LABELS, areaCategory, featureAreasOf, parseRangeMeters, spellAreaOf, type SpellArea } from "@/data/spellAreas";
import { findSpell } from "@/data/spellsCatalog";
import {
  characterTokenId,
  describeShape,
  sizeInCells,
  snapCenter,
  tokenDiameter,
  type Layer,
  type MapShape,
} from "@/lib/map";
import { MapCanvas, type CanvasMode } from "./MapCanvas";
import { baseDims, buildPreview, defaultPoint, type AreaPick } from "./areaPreview";

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
  const [pick, setPick] = useState<AreaPick | null>(null);
  const [point, setPoint] = useState<{ x: number; y: number; rotation: number } | null>(null);
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
  const previews =
    pick && state && myToken && gridOn
      ? buildPreview(pick, myToken, tokenDiameter(myFigure?.size, state.grid) / 2, state.grid, color, point)
      : [];

  const choose = (entry: AreaPick) => {
    if (pick?.key === entry.key) {
      setPick(null);
      return;
    }
    setPick({ ...entry, dims: baseDims(entry.area) });
    if (state && myToken) setPoint(defaultPoint(myToken, tokenDiameter(myFigure?.size, state.grid) / 2, state.grid));
  };

  const onPreviewChange = (shape: MapShape) => {
    if (shape.id !== "preview:area") return;
    setPoint({ x: shape.x, y: shape.y, rotation: shape.rotation });
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
              onPreviewChange={onPreviewChange}
              onTokenChange={(id, patch) => void patchMap({ op: "token", id, token: patch })}
              onShapeChange={
                isMaster ? (shape) => void patchMap({ op: "shapes", shapes: state.shapes.map((s) => (s.id === shape.id ? shape : s)) }) : undefined
              }
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">Carregando o mapa…</div>
          )}
        </div>
        <CardBody className="flex flex-wrap items-center gap-2 border-t border-zinc-100 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
          {state && !myToken ? (
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
                          disabled={!myToken}
                          title={[describeShape({ kind: entry.area.kind, ...entry.dims }), entry.area.note].filter(Boolean).join(" · ")}
                          onClick={() => choose(entry)}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-xs transition disabled:cursor-not-allowed disabled:opacity-50",
                            pick?.key === entry.key
                              ? "border-transparent text-white"
                              : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
                          )}
                          style={pick?.key === entry.key ? { backgroundColor: color } : undefined}
                        >
                          {entry.label}
                          <span className={cn("ml-1 text-[10px]", pick?.key === entry.key ? "text-white/80" : "text-zinc-500")}>
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
                          setPick({ ...pick, dims: { ...pick.dims, [adjustable.dimension]: Math.min(adjustable.max, Math.max(0.5, n)) } });
                        }}
                        className="h-7 w-20 text-xs"
                      />
                      <span className="text-zinc-500">
                        até {adjustable.max.toLocaleString("pt-BR")} m
                      </span>
                    </label>
                  )}
                  {pick.area.note && <span className="basis-full text-zinc-500">{pick.area.note}</span>}
                  <span className="basis-full text-zinc-500">
                    {pick.area.origin === "self"
                      ? "A área sai do seu personagem: gire o token para apontá-la."
                      : `Arraste a área para onde quiser${pick.range ? ` (alcance de ${pick.range.toLocaleString("pt-BR")} m, o círculo tracejado)` : ""}; com ela selecionada, puxe o círculo branco para girar.`}
                  </span>
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setPick(null)}>
                    <X className="h-3 w-3" /> Ocultar área
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
