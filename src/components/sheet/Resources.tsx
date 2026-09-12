import { Plus, Minus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useIsMaster, useStore, useUnlocked } from "@/lib/store";
import { EditableText, EditableNumber } from "@/components/sheet/edit/EditControls";
import { inspirationResource, isInspiration, type Resource } from "@/lib/types";
import { sheetPermissions } from "@/lib/permissions";

const rechargeLabel: Record<string, string> = {
  short: "descanso curto",
  long: "descanso longo",
  dawn: "amanhecer",
  none: "—",
};
const selectCls =
  "h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

/** Inspiração sempre em primeiro; o resto na ordem em que foi criado. */
export function orderedResources(resources: Resource[]): Resource[] {
  const inspiration = resources.find(isInspiration) ?? inspirationResource();
  return [inspiration, ...resources.filter((r) => !isInspiration(r))];
}

export function Resources({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const patch = useStore((s) => s.patchCharacter);
  const editMode = useStore((s) => s.editMode);
  const isMaster = useIsMaster(id);
  const unlocked = useUnlocked(id);

  if (!c) return null;
  const can = sheetPermissions(isMaster, c.sheet);
  const canManage = editMode && can.resources;

  /** Grava o novo valor de um recurso, criando a Inspiração na ficha se ainda não existia. */
  const setCurrent = (resource: Resource, current: number) => {
    if (!unlocked) return;
    const capped = resource.kind === "moeda" && resource.max <= 0
      ? Math.max(0, current)
      : Math.max(0, Math.min(resource.max, current));
    const exists = c.resources.some((r) => r.name === resource.name);
    const next = exists
      ? c.resources.map((r) => (r.name === resource.name ? { ...r, current: capped } : r))
      : [...c.resources, { ...resource, current: capped }];
    void patch(id, { resources: next });
  };

  const updateRes = (name: string, p: Partial<Resource>) =>
    void patch(id, { resources: c.resources.map((r) => (r.name === name ? { ...r, ...p } : r)) });
  const addRes = () =>
    void patch(id, {
      resources: [...c.resources, { name: "Recurso", current: 1, max: 1, recharge: "long", kind: "recarregavel" }],
    });

  const visible = orderedResources(c.resources);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recursos</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        {canManage &&
          c.resources.map((r) => (
            <div key={r.name} className="space-y-1 rounded border border-zinc-200 p-2 dark:border-zinc-800">
              <div className="flex items-center gap-1">
                <EditableText
                  value={r.name}
                  onSave={(v) => updateRes(r.name, { name: v })}
                  placeholder="nome"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remover recurso"
                  onClick={() => void patch(id, { resources: c.resources.filter((x) => x.name !== r.name) })}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-1 text-xs">
                <span>atual</span>
                <EditableNumber value={r.current} min={0} onSave={(v) => updateRes(r.name, { current: v })} className="h-7 w-14" />
                <span>{r.kind === "moeda" ? "teto (0 = sem limite)" : "máx"}</span>
                <EditableNumber value={r.max} min={0} onSave={(v) => updateRes(r.name, { max: v })} className="h-7 w-14" />
                <select
                  className={selectCls}
                  aria-label={`Tipo do recurso ${r.name}`}
                  value={r.kind ?? "recarregavel"}
                  onChange={(e) => {
                    const kind = e.target.value as Resource["kind"];
                    updateRes(r.name, kind === "moeda" ? { kind, recharge: "none" } : { kind });
                  }}
                >
                  <option value="recarregavel">recarregável (descanso)</option>
                  <option value="moeda">moeda (gasta e recebe)</option>
                </select>
                {(r.kind ?? "recarregavel") === "recarregavel" && (
                  <select
                    className={selectCls}
                    aria-label={`Recarga do recurso ${r.name}`}
                    value={r.recharge}
                    onChange={(e) => updateRes(r.name, { recharge: e.target.value as Resource["recharge"] })}
                  >
                    <option value="short">descanso curto</option>
                    <option value="long">descanso longo</option>
                    <option value="dawn">amanhecer</option>
                    <option value="none">—</option>
                  </select>
                )}
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={!!r.masterOnly}
                    onChange={(e) => updateRes(r.name, { masterOnly: e.target.checked || undefined })}
                  />
                  só o Mestre adiciona
                </label>
              </div>
              <EditableText
                value={r.description ?? ""}
                onSave={(v) => updateRes(r.name, { description: v || undefined })}
                placeholder="descrição"
              />
            </div>
          ))}
        {canManage && (
          <Button variant="outline" size="sm" onClick={addRes}>
            + Recurso
          </Button>
        )}

        {!canManage &&
          visible.map((r) => {
            const coin = r.kind === "moeda";
            const canAdd = unlocked && (!r.masterOnly || isMaster) && (coin ? r.max <= 0 || r.current < r.max : r.current < r.max);
            return (
              <div
                key={r.name}
                className={
                  isInspiration(r)
                    ? "space-y-1 rounded-md border border-amber-300 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-950/20"
                    : "space-y-1"
                }
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex items-center gap-1 text-sm font-medium">
                    {isInspiration(r) && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                    {r.name}
                  </span>
                  <span className="font-mono text-xs text-zinc-500">
                    {coin ? (
                      <>
                        ×{r.current}
                        {r.max > 0 ? `/${r.max}` : ""}
                        <span className="ml-2 text-zinc-400">(moeda)</span>
                      </>
                    ) : (
                      <>
                        {r.current}/{r.max}
                        <span className="ml-2 text-zinc-400">({rechargeLabel[r.recharge]})</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!unlocked || r.current <= 0}
                    onClick={() => setCurrent(r, r.current - 1)}
                    title={coin ? "Gastar" : "Usar"}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <div className="flex flex-1 items-center gap-1">
                    {coin ? (
                      <span className="font-mono text-lg font-bold" style={{ color: c.color ?? "#7c3aed" }}>
                        {r.current}
                      </span>
                    ) : r.max <= 10 ? (
                      Array.from({ length: r.max }).map((_, j) => {
                        const filled = j < r.current;
                        return (
                          <button
                            key={j}
                            type="button"
                            disabled={!unlocked}
                            onClick={() => setCurrent(r, filled ? j : j + 1)}
                            className="slot-pip"
                            style={{
                              color: c.color ?? "#7c3aed",
                              background: filled ? "currentColor" : "transparent",
                            }}
                          />
                        );
                      })
                    ) : (
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${(r.current / r.max) * 100}%`,
                            background: c.color ?? "#7c3aed",
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canAdd}
                    onClick={() => setCurrent(r, r.current + 1)}
                    title={r.masterOnly && !isMaster ? "Só o Mestre concede" : "Adicionar"}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {r.description && <p className="text-xs text-zinc-500 dark:text-zinc-400">{r.description}</p>}
                {r.masterOnly && !isMaster && (
                  <p className="text-[10px] text-zinc-400">Só o Mestre pode conceder; você só gasta.</p>
                )}
              </div>
            );
          })}
      </CardBody>
    </Card>
  );
}
