import { Minus } from "lucide-react";
import { ABILITY_LABELS, ABILITY_ORDER, type AbilityKey, type AbilityScores } from "@/lib/types";
import { cn } from "@/lib/cn";

type Allocation = Partial<Record<AbilityKey, number>>;

type Props = {
  /** Total de pontos a distribuir. */
  points: number;
  /** Quanto cada ponto soma no atributo (padrão +1). */
  amount?: number;
  /** Pontos já colocados em cada atributo. */
  allocation: Allocation;
  onChange: (next: Allocation) => void;
  /** Valores finais atuais (já contando esta distribuição), para mostrar e checar o teto. */
  scores?: AbilityScores;
  /** Teto do atributo (padrão 20). */
  maxScore?: number;
  /** Quantos pontos cabem no mesmo atributo (padrão: todos). */
  maxPerAbility?: number;
  /** Atributos que podem receber pontos (padrão: todos). */
  allowed?: readonly AbilityKey[];
  hint?: string;
  className?: string;
};

export function allocatedPoints(allocation: Allocation): number {
  return ABILITY_ORDER.reduce((sum, key) => sum + (allocation[key] ?? 0), 0);
}

/**
 * Pontos livres: o jogador clica no atributo para colocar um ponto e no "−" para tirar.
 * Usado no aumento de atributo (2 pontos), nos bônus raciais à escolha e nos talentos
 * que dão +1 em um atributo.
 */
export function PointAllocator({
  points,
  amount = 1,
  allocation,
  onChange,
  scores,
  maxScore = 20,
  maxPerAbility,
  allowed,
  hint,
  className,
}: Props) {
  const used = allocatedPoints(allocation);
  const remaining = Math.max(0, points - used);
  const perAbility = maxPerAbility ?? points;

  const canAdd = (key: AbilityKey) =>
    remaining > 0 &&
    (!allowed || allowed.includes(key)) &&
    (allocation[key] ?? 0) < perAbility &&
    (!scores || scores[key] + amount <= maxScore);

  const add = (key: AbilityKey) => {
    if (!canAdd(key)) return;
    onChange({ ...allocation, [key]: (allocation[key] ?? 0) + 1 });
  };

  const remove = (key: AbilityKey) => {
    const current = allocation[key] ?? 0;
    if (current <= 0) return;
    const next = { ...allocation };
    if (current === 1) delete next[key];
    else next[key] = current - 1;
    onChange(next);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
        <span className={remaining > 0 ? "font-medium text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}>
          {remaining > 0
            ? `${remaining} ponto${remaining > 1 ? "s" : ""} livre${remaining > 1 ? "s" : ""} (+${amount} cada)`
            : "Pontos distribuídos"}
        </span>
        <span className="text-zinc-500">{hint ?? "Clique no atributo para colocar um ponto."}</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {ABILITY_ORDER.map((key) => {
          const placed = allocation[key] ?? 0;
          const enabled = canAdd(key);
          const blocked = allowed && !allowed.includes(key);
          return (
            <div key={key} className="relative">
              <button
                type="button"
                onClick={() => add(key)}
                disabled={!enabled}
                aria-label={`Colocar ponto em ${ABILITY_LABELS[key]}`}
                className={cn(
                  "flex w-full flex-col items-center rounded-md border px-1 py-1.5 text-center transition",
                  placed > 0
                    ? "border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/30"
                    : "border-zinc-200 dark:border-zinc-700",
                  enabled ? "hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40" : "",
                  !enabled && placed === 0 ? "opacity-40" : "",
                  blocked ? "cursor-not-allowed" : "",
                )}
              >
                <span className="text-[10px] uppercase tracking-wide text-zinc-500">{ABILITY_LABELS[key].slice(0, 3)}</span>
                {scores && <span className="font-mono text-base font-semibold leading-tight">{scores[key]}</span>}
                <span className={cn("text-[11px] leading-tight", placed > 0 ? "font-semibold text-amber-700 dark:text-amber-400" : "text-zinc-400")}>
                  {placed > 0 ? `+${placed * amount}` : "+"}
                </span>
              </button>
              {placed > 0 && (
                <button
                  type="button"
                  onClick={() => remove(key)}
                  aria-label={`Tirar ponto de ${ABILITY_LABELS[key]}`}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-600 shadow-sm hover:text-red-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <Minus className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
