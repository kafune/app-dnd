"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, CardBody } from "@/components/ui/Card";
import { abilityMod, formatMod } from "@/lib/types";

export default function Home() {
  const characters = useStore((s) => Object.values(s.characters));
  const realtimeReady = useStore((s) => s.realtimeReady);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-mono text-3xl font-bold tracking-tight">Mesa do Pierre</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          D&D 5e · Reino de Solus · 4 desocupados nível 3
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-xs">
          <span
            className={
              realtimeReady
                ? "rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
            }
          >
            {realtimeReady ? "🟢 Sincronizado em tempo real" : "🟡 Conectando…"}
          </span>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {characters.map((c) => {
          const cls = c.sheet.classes
            .map((k) => `${k.name}${k.subclass ? ` (${k.subclass})` : ""} ${k.level}`)
            .join(" / ");
          return (
            <Link key={c.id} href={`/personagem/${c.id}`} className="block">
              <Card
                className="transition hover:scale-[1.01] hover:shadow-md"
                style={{ borderTopColor: c.color, borderTopWidth: 4 }}
              >
                <CardBody>
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        {c.playerName}
                      </div>
                      <div className="font-mono text-xl font-semibold">
                        {c.characterName}
                      </div>
                    </div>
                    <div className="text-right text-xs text-zinc-500">
                      {c.sheet.species}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{cls}</div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                    <span>
                      <strong className="text-zinc-900 dark:text-zinc-200">
                        PV {c.hpCurrent}/{c.hpMax}
                      </strong>
                    </span>
                    <span>CA {c.sheet.ac}</span>
                    <span>
                      Iniciativa{" "}
                      {formatMod(
                        c.sheet.initiativeBonus || abilityMod(c.sheet.abilityScores.dex),
                      )}
                    </span>
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </section>

      <footer className="mt-10 text-center text-xs text-zinc-400">
        Feito pra mesa. Suas ações persistem localmente; com Supabase configurado, em tempo real entre celulares.
      </footer>
    </main>
  );
}
