"use client";

import { Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore, useUnlocked } from "@/lib/store";
import { EditableText, EditableNumber } from "@/components/sheet/edit/EditControls";
import type { Resource } from "@/lib/types";

const rechargeLabel: Record<string, string> = {
  short: "descanso curto",
  long: "descanso longo",
  dawn: "amanhecer",
  none: "—",
};
const selectCls =
  "h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function Resources({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const patch = useStore((s) => s.patchCharacter);
  const editMode = useStore((s) => s.editMode);
  const unlocked = useUnlocked(id);

  if (!c) return null;
  if (c.resources.length === 0 && !editMode) return null;

  const update = (idx: number, current: number) => {
    if (!unlocked) return;
    const next = [...c.resources];
    next[idx] = { ...next[idx], current: Math.max(0, Math.min(next[idx].max, current)) };
    void patch(id, { resources: next });
  };
  const updateRes = (idx: number, p: Partial<Resource>) =>
    void patch(id, { resources: c.resources.map((r, i) => (i === idx ? { ...r, ...p } : r)) });
  const addRes = () =>
    void patch(id, {
      resources: [...c.resources, { name: "Recurso", current: 1, max: 1, recharge: "long" }],
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recursos</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        {editMode &&
          c.resources.map((r, i) => (
            <div
              key={i}
              className="space-y-1 rounded border border-zinc-200 p-2 dark:border-zinc-800"
            >
              <div className="flex items-center gap-1">
                <EditableText
                  value={r.name}
                  onSave={(v) => updateRes(i, { name: v })}
                  placeholder="nome"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remover recurso"
                  onClick={() => void patch(id, { resources: c.resources.filter((_, idx) => idx !== i) })}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-1 text-xs">
                <span>atual</span>
                <EditableNumber value={r.current} min={0} onSave={(v) => updateRes(i, { current: v })} className="h-7 w-14" />
                <span>máx</span>
                <EditableNumber value={r.max} min={0} onSave={(v) => updateRes(i, { max: v })} className="h-7 w-14" />
                <select
                  className={selectCls}
                  value={r.recharge}
                  onChange={(e) => updateRes(i, { recharge: e.target.value as Resource["recharge"] })}
                >
                  <option value="short">descanso curto</option>
                  <option value="long">descanso longo</option>
                  <option value="dawn">amanhecer</option>
                  <option value="none">—</option>
                </select>
              </div>
              <EditableText
                value={r.description ?? ""}
                onSave={(v) => updateRes(i, { description: v || undefined })}
                placeholder="descrição"
              />
            </div>
          ))}
        {editMode && (
          <Button variant="outline" size="sm" onClick={addRes}>
            + Recurso
          </Button>
        )}
        {!editMode &&
          c.resources.map((r, i) => (
          <div key={r.name} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium">{r.name}</span>
              <span className="font-mono text-xs text-zinc-500">
                {r.current}/{r.max}
                <span className="ml-2 text-zinc-400">({rechargeLabel[r.recharge]})</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={!unlocked || r.current <= 0}
                onClick={() => update(i, r.current - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <div className="flex flex-1 items-center gap-1">
                {r.max <= 10 ? (
                  Array.from({ length: r.max }).map((_, j) => {
                    const filled = j < r.current;
                    return (
                      <button
                        key={j}
                        type="button"
                        disabled={!unlocked}
                        onClick={() => update(i, filled ? j : j + 1)}
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
                disabled={!unlocked || r.current >= r.max}
                onClick={() => update(i, r.current + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {r.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{r.description}</p>
            )}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
