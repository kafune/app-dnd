"use client";

import { useStore } from "@/lib/store";
import { formatRollDetail } from "@/lib/dice";

export function RollHistory({ characterId }: { characterId?: string }) {
  const rolls = useStore((s) =>
    characterId ? s.rolls.filter((r) => r.characterId === characterId) : s.rolls,
  );
  if (rolls.length === 0) {
    return (
      <p className="text-center text-xs italic text-zinc-500">Nenhuma rolagem ainda.</p>
    );
  }

  return (
    <ul className="max-h-72 space-y-1 overflow-y-auto pr-1 text-xs">
      {rolls.slice(0, 20).map((r) => {
        const time = new Date(r.createdAt).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <li
            key={r.id}
            className={`rounded border px-2 py-1 ${
              r.detail.crit
                ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
                : r.detail.fumble
                  ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
                  : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
            }`}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-medium">
                {r.characterName ? (
                  <span className="text-zinc-500">{r.characterName} · </span>
                ) : null}
                {r.label}
              </span>
              <span className="font-mono text-base font-bold">{r.result}</span>
            </div>
            <div className="flex items-baseline justify-between text-[10px] text-zinc-500">
              <span className="font-mono">{formatRollDetail(r)}</span>
              <span>{time}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
