"use client";

import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore, useUnlocked } from "@/lib/store";

const rechargeLabel: Record<string, string> = {
  short: "descanso curto",
  long: "descanso longo",
  dawn: "amanhecer",
  none: "—",
};

export function Resources({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const patch = useStore((s) => s.patchCharacter);
  const unlocked = useUnlocked(id);

  if (!c || c.resources.length === 0) return null;

  const update = (idx: number, current: number) => {
    if (!unlocked) return;
    const next = [...c.resources];
    next[idx] = { ...next[idx], current: Math.max(0, Math.min(next[idx].max, current)) };
    void patch(id, { resources: next });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recursos</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        {c.resources.map((r, i) => (
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
