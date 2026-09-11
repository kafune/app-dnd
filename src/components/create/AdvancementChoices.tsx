import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { PointAllocator } from "@/components/PointAllocator";
import { allFeats, findFeat } from "@/data/featsCatalog";
import { reachedAsis } from "@/lib/progression";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { ABILITY_ORDER, type AbilityKey, type AbilityScores, type AsiDecision, type ClassEntry } from "@/lib/types";
import { selectCls, SourceBadge } from "./common";

type Allocation = Partial<Record<AbilityKey, number>>;

/** Incrementos guardados na decisão (+amount por ponto) → pontos por atributo. */
export function toAllocation(abilities: AsiDecision["abilities"], amount = 1): Allocation {
  const out: Allocation = {};
  for (const key of ABILITY_ORDER) {
    const value = abilities?.[key] ?? 0;
    if (value > 0) out[key] = Math.round(value / amount);
  }
  return out;
}

/** Pontos por atributo → incrementos guardados na decisão. */
export function fromAllocation(allocation: Allocation, amount = 1): Allocation {
  const out: Allocation = {};
  for (const key of ABILITY_ORDER) {
    const points = allocation[key] ?? 0;
    if (points > 0) out[key] = points * amount;
  }
  return out;
}

export function sumIncrease(abilities: AsiDecision["abilities"]): number {
  return ABILITY_ORDER.reduce((sum, key) => sum + (abilities?.[key] ?? 0), 0);
}

type Props = {
  classes: ClassEntry[];
  advancement: AsiDecision[];
  raceName: string;
  /** Atributos finais atuais (já com estas decisões). */
  scores: AbilityScores;
  onChange: (next: AsiDecision[]) => void;
};

/**
 * Em cada nível de "Incremento no Valor de Habilidade" o jogador escolhe entre
 * 2 pontos livres de atributo (clica no atributo para colocar) ou um talento.
 */
export function AdvancementChoices({ classes, advancement, raceName, scores, onChange }: Props) {
  useStore((s) => s.homebrew); // talentos homebrew novos aparecem sem recarregar
  const slots = reachedAsis(classes);
  const same = (decision: AsiDecision, slot: { className: string; level: number }) =>
    decision.className === slot.className && decision.level === slot.level;
  const replace = (slot: { className: string; level: number }, next: AsiDecision) =>
    onChange([...advancement.filter((decision) => !same(decision, slot)), next]);
  const feats = allFeats().filter((feat) => !feat.races || feat.races.includes(raceName));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aumentos de atributo ou talentos</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        {slots.map((slot) => {
          const decision = advancement.find((entry) => same(entry, slot));
          const feat = decision?.kind === "feat" && decision.feat ? findFeat(decision.feat) : undefined;
          const option = (kind: "asi" | "feat", label: string, detail: string) => (
            <button
              type="button"
              onClick={() => {
                if (decision?.kind === kind) return;
                replace(slot, { className: slot.className, level: slot.level, kind, ...(kind === "asi" ? { abilities: {} } : {}) });
              }}
              className={cn(
                "rounded-md border px-3 py-2 text-left transition",
                decision?.kind === kind
                  ? "border-emerald-500 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                  : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/60",
              )}
            >
              <span className="block text-sm font-medium">{label}</span>
              <span className="block text-[11px] text-zinc-500">{detail}</span>
            </button>
          );
          return (
            <div key={`${slot.className}:${slot.level}`} className="space-y-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="text-sm font-medium">
                {slot.className} · nível {slot.level}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {option("asi", "Pontos de atributo", "2 pontos livres: +2 num atributo ou +1 em dois")}
                {option("feat", "Talento", "troca os pontos por um talento")}
              </div>
              {decision?.kind === "asi" && (
                <PointAllocator
                  points={2}
                  maxPerAbility={2}
                  allocation={decision.abilities ?? {}}
                  scores={scores}
                  onChange={(abilities) => replace(slot, { ...decision, abilities })}
                  hint="Clique no atributo para colocar cada ponto. Também dá para colocar no card Atributos."
                />
              )}
              {decision?.kind === "feat" && (
                <div className="space-y-2">
                  <select
                    className={selectCls}
                    value={decision.feat ?? ""}
                    onChange={(event) => replace(slot, { ...decision, feat: event.target.value || undefined, abilities: undefined })}
                  >
                    <option value="">— talento —</option>
                    {feats.map((entry) => (
                      <option key={entry.name} value={entry.name}>
                        {entry.name}
                        {entry.source === "Homebrew" ? " (homebrew)" : ""}
                        {entry.prerequisite ? ` — pré-requisito: ${entry.prerequisite}` : ""}
                      </option>
                    ))}
                  </select>
                  {feat?.abilityIncrease && (
                    <PointAllocator
                      points={1}
                      amount={feat.abilityIncrease.amount}
                      allowed={feat.abilityIncrease.choose}
                      allocation={toAllocation(decision.abilities, feat.abilityIncrease.amount)}
                      scores={scores}
                      onChange={(allocation) =>
                        replace(slot, { ...decision, abilities: fromAllocation(allocation, feat.abilityIncrease!.amount) })
                      }
                      hint="O talento também aumenta um atributo: clique em um dos liberados."
                    />
                  )}
                  {feat && (
                    <div className="space-y-1 rounded-md bg-zinc-50 p-2 text-xs dark:bg-zinc-800/50">
                      <SourceBadge source={feat.source} />
                      <p className="whitespace-pre-line text-zinc-600 dark:text-zinc-300">{feat.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
