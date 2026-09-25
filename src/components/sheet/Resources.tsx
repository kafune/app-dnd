import { memo, useCallback, useMemo } from "react";
import { Plus, Minus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useIsMaster, useStore, useUnlocked } from "@/lib/store";
import { EditableText, EditableNumber } from "@/components/sheet/edit/EditControls";
import { inspirationResource, isInspiration, type Resource } from "@/lib/types";
import { sheetPermissions } from "@/lib/permissions";
import { missingResources } from "@/lib/progression";

const rechargeLabel: Record<string, string> = {
  short: "descanso curto",
  long: "descanso longo",
  dawn: "amanhecer",
  none: "—",
};
/** Dica para o jogador, que só gasta: quando o recurso volta. */
const rechargeHint: Record<string, string> = {
  short: "Recupera no descanso curto ou longo.",
  long: "Recupera no descanso longo.",
  dawn: "Recupera ao amanhecer.",
  none: "Não recupera sozinho — fale com o Mestre.",
};
const selectCls =
  "h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

/** Inspiração sempre em primeiro; o resto na ordem em que foi criado. */
export function orderedResources(resources: Resource[]): Resource[] {
  const inspiration = resources.find(isInspiration) ?? inspirationResource();
  return [inspiration, ...resources.filter((r) => !isInspiration(r))];
}

/** Novo `current` já limitado ao que o recurso aceita. */
function clampCurrent(resource: Resource, value: number): number {
  return resource.kind === "moeda" && resource.max <= 0
    ? Math.max(0, value)
    : Math.max(0, Math.min(resource.max, value));
}

/**
 * Quem pode aumentar o `current`? O Mestre sempre. O jogador só recebe moedas
 * que não são do Mestre; recarregáveis ele só gasta — voltam no descanso (o
 * servidor recusa o resto).
 */
function canRaise(resource: Resource, isMaster: boolean): boolean {
  if (isMaster) return true;
  return resource.kind === "moeda" && !resource.masterOnly;
}

export function Resources({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const patch = useStore((s) => s.patchCharacter);
  const editMode = useStore((s) => s.editMode);
  const isMaster = useIsMaster(id);
  const unlocked = useUnlocked(id);

  const sheet = c?.sheet;
  const resources = c?.resources;
  // Só recalcula quando a ficha ou os recursos mudam (não a cada PV/toque).
  const missing = useMemo(
    () => (sheet && resources ? missingResources({ sheet, resources }) : []),
    [sheet, resources],
  );
  const visible = useMemo(() => (resources ? orderedResources(resources) : []), [resources]);

  /**
   * Muda o `current` de um recurso a partir do valor MAIS RECENTE do store (não do
   * que estava na tela quando o botão renderizou): dois toques rápidos em "−" gastam 2.
   * Cria a Inspiração na ficha se ainda não existia.
   */
  const change = useCallback(
    (resource: Resource, next: (current: number) => number) => {
      if (!unlocked) return;
      const latest = useStore.getState().characters[id];
      if (!latest) return;
      const existing = latest.resources.find((r) => r.name === resource.name);
      const base = existing ?? resource;
      const value = clampCurrent(base, next(base.current));
      if (value === base.current) return;
      if (value > base.current && !canRaise(base, isMaster)) return;
      const list = existing
        ? latest.resources.map((r) => (r.name === resource.name ? { ...r, current: value } : r))
        : [...latest.resources, { ...resource, current: value }];
      void patch(id, { resources: list });
    },
    [id, isMaster, patch, unlocked],
  );

  /** Mestre: põe na ficha os recursos que faltam, sem mexer nos que já existem. */
  const addMissing = useCallback(() => {
    const latest = useStore.getState().characters[id];
    if (!latest) return;
    const toAdd = missingResources(latest);
    if (toAdd.length === 0) return;
    void patch(id, { resources: [...latest.resources, ...toAdd] });
  }, [id, patch]);

  if (!c) return null;
  const can = sheetPermissions(isMaster, c.sheet);
  const canManage = editMode && can.resources;
  const color = c.color ?? "#7c3aed";

  const latestResources = () => useStore.getState().characters[id]?.resources ?? c.resources;
  const updateRes = (name: string, p: Partial<Resource>) =>
    void patch(id, { resources: latestResources().map((r) => (r.name === name ? { ...r, ...p } : r)) });
  const removeRes = (name: string) =>
    void patch(id, { resources: latestResources().filter((x) => x.name !== name) });
  const addRes = () =>
    void patch(id, {
      resources: [...latestResources(), { name: "Recurso", current: 1, max: 1, recharge: "long", kind: "recarregavel" }],
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recursos</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        {missing.length > 0 &&
          (isMaster ? (
            <div className="space-y-2 rounded-md border border-sky-300 bg-sky-50 p-2 text-xs dark:border-sky-800 dark:bg-sky-950/30">
              <p className="text-zinc-700 dark:text-zinc-300">
                {missing.length === 1
                  ? "Esta habilidade com usos limitados ainda não está nos recursos:"
                  : "Estas habilidades com usos limitados ainda não estão nos recursos:"}{" "}
                <span className="font-medium">{missing.map((r) => `${r.name} (${r.max})`).join(", ")}</span>.
              </p>
              <Button size="sm" variant="outline" className="h-9" onClick={addMissing}>
                <Plus className="h-3 w-3" /> Adicionar à ficha
              </Button>
            </div>
          ) : (
            <p className="text-[11px] text-zinc-400">
              {missing.length === 1
                ? "1 habilidade com usos limitados ainda não está nos recursos — peça ao Mestre para adicioná-la."
                : `${missing.length} habilidades com usos limitados ainda não estão nos recursos — peça ao Mestre para adicioná-las.`}
            </p>
          ))}

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
                <Button variant="ghost" size="icon" aria-label="Remover recurso" onClick={() => removeRes(r.name)}>
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
          visible.map((r) => (
            <ResourceRow key={r.name} resource={r} color={color} isMaster={isMaster} unlocked={unlocked} onChange={change} />
          ))}
      </CardBody>
    </Card>
  );
}

type RowProps = {
  resource: Resource;
  color: string;
  isMaster: boolean;
  unlocked: boolean;
  onChange: (resource: Resource, next: (current: number) => number) => void;
};

/** Uma linha de recurso. Memorizada: gastar um recurso não redesenha os outros. */
const ResourceRow = memo(function ResourceRow({ resource: r, color, isMaster, unlocked, onChange }: RowProps) {
  const coin = r.kind === "moeda";
  const raise = canRaise(r, isMaster);
  const canAdd = unlocked && raise && (coin ? r.max <= 0 || r.current < r.max : r.current < r.max);
  // Recarregável na mão do jogador: só gasta; volta no descanso.
  const spendOnly = !coin && !isMaster;
  return (
    <div
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
        <span className="shrink-0 font-mono text-xs text-zinc-500">
          {coin ? (
            <>
              ×{r.current}
              {r.max > 0 ? `/${r.max}` : ""}
              <span className="ml-2 text-zinc-400">(moeda)</span>
            </>
          ) : (
            <>
              {r.current}/{r.max}
              {!spendOnly && <span className="ml-2 text-zinc-400">({rechargeLabel[r.recharge]})</span>}
            </>
          )}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-9 w-9 shrink-0 p-0"
          disabled={!unlocked || r.current <= 0}
          onClick={() => onChange(r, (current) => current - 1)}
          title={coin ? "Gastar" : "Usar"}
          aria-label={`${coin ? "Gastar" : "Usar"} ${r.name}`}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {coin ? (
            <span className="font-mono text-lg font-bold" style={{ color }}>
              {r.current}
            </span>
          ) : r.max <= 10 ? (
            Array.from({ length: r.max }).map((_, j) => {
              const filled = j < r.current;
              // Jogador: tocar numa bolinha cheia gasta até ela; a vazia não faz nada.
              const inert = !unlocked || (!filled && !raise);
              return (
                <button
                  key={j}
                  type="button"
                  disabled={inert}
                  aria-label={filled ? `Gastar ${r.name} até ${j}` : `Recuperar ${r.name} até ${j + 1}`}
                  onClick={() => onChange(r, (current) => (filled ? Math.min(current, j) : j + 1))}
                  className="slot-pip disabled:cursor-default"
                  style={{ color, background: filled ? "currentColor" : "transparent" }}
                />
              );
            })
          ) : (
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div className="h-full transition-all" style={{ width: `${(r.current / r.max) * 100}%`, background: color }} />
            </div>
          )}
        </div>
        {!spendOnly && (
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 shrink-0 p-0"
            disabled={!canAdd}
            onClick={() => onChange(r, (current) => current + 1)}
            title={r.masterOnly && !isMaster ? "Só o Mestre concede" : "Adicionar"}
            aria-label={`Adicionar ${r.name}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      {r.description && <p className="text-xs text-zinc-500 dark:text-zinc-400">{r.description}</p>}
      {spendOnly && <p className="text-[10px] text-zinc-400">{rechargeHint[r.recharge]}</p>}
      {coin && r.masterOnly && !isMaster && (
        <p className="text-[10px] text-zinc-400">Só o Mestre pode conceder; você só gasta.</p>
      )}
    </div>
  );
});
