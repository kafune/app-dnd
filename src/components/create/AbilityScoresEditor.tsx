"use client";

import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  abilityMod,
  formatMod,
  type AbilityKey,
  type AbilityScores,
} from "@/lib/types";
import {
  POINT_BUY_BUDGET,
  POINT_BUY_MAX,
  POINT_BUY_MIN,
  pointsRemaining,
} from "@/lib/createCharacter";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export type AbilityMode = "pointbuy" | "manual";

type Props = {
  scores: AbilityScores;
  bonuses: Partial<Record<AbilityKey, number>>;
  mode: AbilityMode;
  onMode: (mode: AbilityMode) => void;
  onChange: (scores: AbilityScores) => void;
};

export function AbilityScoresEditor({ scores, bonuses, mode, onMode, onChange }: Props) {
  const remaining = pointsRemaining(scores);

  const set = (k: AbilityKey, value: number) => onChange({ ...scores, [k]: value });

  const step = (k: AbilityKey, delta: number) => {
    const next = scores[k] + delta;
    if (next < POINT_BUY_MIN || next > POINT_BUY_MAX) return;
    // não deixa estourar o orçamento ao subir
    if (delta > 0 && pointsRemaining({ ...scores, [k]: next }) < 0) return;
    set(k, next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="inline-flex overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => onMode("pointbuy")}
            className={`px-3 py-1 text-xs ${mode === "pointbuy" ? "bg-zinc-200 dark:bg-zinc-700" : "bg-transparent"}`}
          >
            Compra de pontos
          </button>
          <button
            type="button"
            onClick={() => onMode("manual")}
            className={`px-3 py-1 text-xs ${mode === "manual" ? "bg-zinc-200 dark:bg-zinc-700" : "bg-transparent"}`}
          >
            Manual / livre
          </button>
        </div>
        {mode === "pointbuy" && (
          <span
            className={`text-xs ${remaining < 0 ? "text-red-600" : "text-zinc-500"}`}
            title={`Orçamento de ${POINT_BUY_BUDGET} pontos`}
          >
            Pontos restantes: <strong>{remaining}</strong> / {POINT_BUY_BUDGET}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ABILITY_ORDER.map((k) => {
          const bonus = bonuses[k] ?? 0;
          const final = scores[k] + bonus;
          return (
            <div
              key={k}
              className="flex items-center gap-2 rounded-md border border-zinc-200 px-2 py-1.5 dark:border-zinc-800"
            >
              <span className="w-24 text-sm font-medium">{ABILITY_LABELS[k]}</span>

              {mode === "pointbuy" ? (
                <div className="flex items-center gap-1">
                  <Button type="button" size="icon" variant="outline" onClick={() => step(k, -1)}>
                    −
                  </Button>
                  <span className="w-7 text-center text-sm tabular-nums">{scores[k]}</span>
                  <Button type="button" size="icon" variant="outline" onClick={() => step(k, 1)}>
                    +
                  </Button>
                </div>
              ) : (
                <Input
                  type="number"
                  inputMode="numeric"
                  className="h-8 w-16"
                  value={scores[k]}
                  onChange={(e) => set(k, Number(e.target.value) || 0)}
                />
              )}

              <span className="ml-auto text-xs text-zinc-500">
                {bonus ? `${scores[k]} ${formatMod(bonus)} = ` : ""}
                <strong className="text-zinc-800 dark:text-zinc-200">{final}</strong>{" "}
                ({formatMod(abilityMod(final))})
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-zinc-500">
        Os bônus raciais são somados automaticamente ao valor final. No modo manual você pode usar
        qualquer valor (homebrew).
      </p>
    </div>
  );
}
