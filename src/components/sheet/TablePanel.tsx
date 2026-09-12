import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import { actionEconomy } from "@/lib/actions";
import { formatRollDetail } from "@/lib/dice";
import type { DiceRoll } from "@/lib/types";

/** Ações: o que cabe no turno deste personagem. Fica logo acima da mesa. */
export function ActionsPanel({ id }: { id: string }) {
  return (
    <Card>
      <CardHeader className="px-3 py-2">
        <CardTitle>Ações</CardTitle>
      </CardHeader>
      <CardBody>
        <ActionsTab id={id} />
      </CardBody>
    </Card>
  );
}

/** Mesa: todas as rolagens das fichas da pasta, em tempo real. */
export function TablePanel({ onClear }: { onClear: () => void }) {
  return (
    <Card>
      <CardHeader className="px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Mesa</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            aria-label="Limpar todas as rolagens da mesa"
            title="Limpar todas as rolagens da mesa"
          >
            <Trash2 className="h-3 w-3" /> Limpar
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <TableRolls />
      </CardBody>
    </Card>
  );
}

/** "Nome — rolou um d20 — 17": as rolagens de todas as fichas da pasta. */
function TableRolls() {
  const rolls = useStore(useShallow((s) => s.rolls));
  if (rolls.length === 0) {
    return <p className="text-center text-xs italic text-zinc-500">Ninguém rolou nada ainda.</p>;
  }
  return (
    <ul className="max-h-96 space-y-1.5 overflow-y-auto pr-1">
      {rolls.slice(0, 30).map((r) => (
        <TableRollRow key={r.id} roll={r} />
      ))}
    </ul>
  );
}

/** Só o dado da rolagem ("1d20+5" -> "d20"), para a frase ficar como na mesa. */
function dieOf(expression: string): string {
  const match = /(\d*)d(\d+)/i.exec(expression);
  if (!match) return expression;
  const count = Number(match[1] || "1");
  return count > 1 ? `${count}d${match[2]}` : `d${match[2]}`;
}

function TableRollRow({ roll }: { roll: DiceRoll }) {
  const time = new Date(roll.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const advantage = roll.detail.advantage ? " com vantagem" : roll.detail.disadvantage ? " com desvantagem" : "";
  return (
    <li
      className={`rounded-md border px-2 py-1.5 ${
        roll.detail.crit
          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
          : roll.detail.fumble
            ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
            : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 text-xs">
          <strong className="text-zinc-900 dark:text-zinc-100">{roll.characterName ?? "Mestre"}</strong>
          <span className="text-zinc-500"> — rolou um {dieOf(roll.expression)}{advantage}</span>
          {roll.label && roll.label !== roll.expression && (
            <span className="text-zinc-500"> ({roll.label})</span>
          )}
        </span>
        <span
          className={`shrink-0 font-mono text-2xl font-black leading-none ${
            roll.detail.crit
              ? "text-emerald-600 dark:text-emerald-400"
              : roll.detail.fumble
                ? "text-red-600 dark:text-red-400"
                : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {roll.result}
        </span>
      </div>
      <div className="mt-0.5 flex items-baseline justify-between text-[10px] text-zinc-500">
        <span className="font-mono">{formatRollDetail(roll)}</span>
        <span>{time}</span>
      </div>
    </li>
  );
}

/** O que este personagem pode fazer num turno, com o que as características dele mudam. */
function ActionsTab({ id }: { id: string }) {
  const character = useStore((s) => s.characters[id]);
  const [open, setOpen] = useState<string | null>(null);
  if (!character) return null;
  const economy = actionEconomy(character.sheet);

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-2 text-xs dark:border-zinc-800 dark:bg-zinc-800/40">
        <div className="font-medium text-zinc-800 dark:text-zinc-100">
          Por turno você tem{" "}
          {economy.counts.map((count, i) => (
            <span key={count.label}>
              {i > 0 && (i === economy.counts.length - 1 ? " e " : ", ")}
              <strong className="font-mono">{count.value}</strong> {count.label}
            </span>
          ))}
          .
        </div>
        {economy.notes.length > 0 && (
          <ul className="mt-1.5 space-y-0.5 text-zinc-600 dark:text-zinc-300">
            {economy.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        )}
      </div>

      {economy.groups.map((group) => (
        <section key={group.slot}>
          <h4 className="mb-1 border-b border-zinc-100 pb-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            {group.label}
          </h4>
          <ul className="space-y-0.5">
            {group.options.map((option) => {
              const key = `${group.slot}:${option.name}`;
              const isOpen = open === key;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : key)}
                    className="flex w-full items-baseline justify-between gap-2 rounded px-1.5 py-1 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <span className="font-medium">{option.name}</span>
                    {option.source && <span className="shrink-0 text-[10px] text-amber-600 dark:text-amber-400">{option.source}</span>}
                  </button>
                  {isOpen && (
                    <p className="px-1.5 pb-1.5 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {option.description}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
