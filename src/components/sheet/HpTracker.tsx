"use client";

import { useState } from "react";
import { Heart, Plus, Minus, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { useStore, useUnlocked } from "@/lib/store";

export function HpTracker({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const patch = useStore((s) => s.patchCharacter);
  const unlocked = useUnlocked(id);
  const [delta, setDelta] = useState("");

  if (!c) return null;
  const pct = Math.max(0, Math.min(100, (c.hpCurrent / c.hpMax) * 100));
  const color = pct > 60 ? "bg-emerald-500" : pct > 30 ? "bg-amber-500" : "bg-red-500";

  const apply = (sign: 1 | -1) => {
    const n = Number(delta);
    if (!Number.isFinite(n) || n <= 0) return;
    const next = sign === -1 ? Math.max(0, c.hpCurrent - n) : Math.min(c.hpMax, c.hpCurrent + n);
    void patch(id, { hpCurrent: next });
    setDelta("");
  };

  const setTemp = (n: number) => {
    void patch(id, { hpTemp: Math.max(0, n) });
  };

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm font-semibold">Pontos de Vida</span>
          </div>
          <div className="font-mono text-2xl">
            <span className="font-bold">{c.hpCurrent}</span>
            <span className="text-zinc-400"> / {c.hpMax}</span>
            {c.hpTemp > 0 && <span className="ml-2 text-blue-500">+{c.hpTemp}</span>}
          </div>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className={`h-full transition-all ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <fieldset disabled={!unlocked} className="space-y-2 disabled:opacity-50">
          <div className="flex gap-1">
            <Input
              inputMode="numeric"
              placeholder="qtd"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              className="h-8 flex-1"
            />
            <Button
              size="sm"
              variant="danger"
              onClick={() => apply(-1)}
              title="Sofrer dano"
            >
              <Minus className="h-3 w-3" /> dano
            </Button>
            <Button
              size="sm"
              variant="success"
              onClick={() => apply(1)}
              title="Curar"
            >
              <Plus className="h-3 w-3" /> cura
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Shield className="h-3 w-3 text-blue-500" />
            <span>PV temporário:</span>
            <Input
              type="number"
              min={0}
              value={c.hpTemp}
              onChange={(e) => setTemp(Number(e.target.value) || 0)}
              className="h-7 w-16"
            />
          </div>
        </fieldset>
      </CardBody>
    </Card>
  );
}
