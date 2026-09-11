import { Minus, Plus } from "lucide-react";
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
  /** Aumentos de atributo e talentos já distribuídos (entram no valor final). */
  increases?: Partial<Record<AbilityKey, number>>;
  /** Pontos de aumento de atributo colocados em cada atributo (podem ser retirados aqui). */
  asiPoints?: Partial<Record<AbilityKey, number>>;
  /** Pontos livres de aumento ainda não colocados (valem em compra de pontos e em valores rolados). */
  freePoints?: number;
  /** Coloca (+1) ou retira (−1) um ponto livre no atributo. */
  onFreePoint?: (key: AbilityKey, delta: 1 | -1) => void;
};

export function AbilityScoresEditor({
  scores,
  bonuses,
  mode,
  onMode,
  onChange,
  increases = {},
  asiPoints = {},
  freePoints = 0,
  onFreePoint,
}: Props) {
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
      <div className="flex flex-wrap items-center justify-between gap-2">
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
            Valores rolados
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

      {freePoints > 0 && onFreePoint && (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Você tem <strong>{freePoints}</strong> ponto{freePoints > 1 ? "s" : ""} livre{freePoints > 1 ? "s" : ""} de aumento de
          atributo. Clique em <strong>+1</strong> no atributo onde quer colocar. Eles não gastam a compra de pontos.
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ABILITY_ORDER.map((k) => {
          const bonus = bonuses[k] ?? 0;
          const increase = increases[k] ?? 0;
          const final = Math.min(20, scores[k] + bonus + increase);
          const placed = asiPoints[k] ?? 0;
          return (
            <div
              key={k}
              className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-200 px-2 py-1.5 dark:border-zinc-800"
            >
              <span className="w-24 text-sm font-medium">{ABILITY_LABELS[k]}</span>

              {mode === "pointbuy" ? (
                <div className="flex items-center gap-1">
                  <Button type="button" size="icon" variant="outline" onClick={() => step(k, -1)} aria-label={`Diminuir ${ABILITY_LABELS[k]}`}>
                    −
                  </Button>
                  <span className="w-7 text-center text-sm tabular-nums">{scores[k]}</span>
                  <Button type="button" size="icon" variant="outline" onClick={() => step(k, 1)} aria-label={`Aumentar ${ABILITY_LABELS[k]}`}>
                    +
                  </Button>
                </div>
              ) : (
                <Input
                  type="number"
                  inputMode="numeric"
                  className="h-8 w-16"
                  min={3}
                  max={18}
                  value={scores[k]}
                  onChange={(e) => set(k, Math.max(3, Math.min(18, Number(e.target.value) || 3)))}
                />
              )}

              {onFreePoint && (freePoints > 0 || placed > 0) && (
                <span className="inline-flex items-center overflow-hidden rounded-md border border-amber-400 dark:border-amber-700">
                  {placed > 0 && (
                    <button
                      type="button"
                      onClick={() => onFreePoint(k, -1)}
                      className="px-1.5 py-1 text-amber-800 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-950/60"
                      aria-label={`Tirar ponto livre de ${ABILITY_LABELS[k]}`}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                  )}
                  {placed > 0 && (
                    <span className="bg-amber-50 px-1.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                      +{placed}
                    </span>
                  )}
                  {freePoints > 0 && final < 20 && placed < 2 && (
                    <button
                      type="button"
                      onClick={() => onFreePoint(k, 1)}
                      className="inline-flex items-center gap-0.5 px-1.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-950/60"
                      aria-label={`Colocar ponto livre em ${ABILITY_LABELS[k]}`}
                    >
                      <Plus className="h-3 w-3" />1
                    </button>
                  )}
                </span>
              )}

              <span className="ml-auto text-xs text-zinc-500">
                {bonus || increase ? `${scores[k]}${bonus ? ` ${formatMod(bonus)}` : ""}${increase ? ` ${formatMod(increase)}` : ""} = ` : ""}
                <strong className="text-zinc-800 dark:text-zinc-200">{final}</strong> ({formatMod(abilityMod(final))})
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-zinc-500">
        O valor final soma raça e aumentos automaticamente. Para atributos rolados, informe valores entre 3 e 18.
      </p>
    </div>
  );
}
