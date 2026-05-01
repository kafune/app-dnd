"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import type { Spell } from "@/lib/types";

export function Spells({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  if (!c) return null;
  const { cantrips, known, saveDC, attackMod } = c.sheet.spells;
  const all = [...cantrips, ...known];
  if (all.length === 0) return null;

  const byLevel = new Map<number, Spell[]>();
  for (const sp of all) {
    if (!byLevel.has(sp.level)) byLevel.set(sp.level, []);
    byLevel.get(sp.level)!.push(sp);
  }
  const sortedLevels = Array.from(byLevel.keys()).sort();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <CardTitle>
            <Sparkles className="mr-1 inline h-3.5 w-3.5" />
            Magias
          </CardTitle>
          <div className="text-xs text-zinc-500">
            CD {saveDC} · Ataque +{attackMod}
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {sortedLevels.map((lvl) => (
          <div key={lvl}>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {lvl === 0 ? "Truques" : `Nível ${lvl}`}
            </div>
            <ul className="space-y-1">
              {byLevel.get(lvl)!.map((sp) => (
                <SpellRow key={sp.name} spell={sp} />
              ))}
            </ul>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

function SpellRow({ spell }: { spell: Spell }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded border border-zinc-200 dark:border-zinc-800">
      <button
        className="flex w-full items-center justify-between px-2 py-1.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-1.5">
          {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <span className="font-medium">{spell.name}</span>
          <span className="text-xs text-zinc-500">{spell.school}</span>
          {spell.concentration && (
            <span className="rounded bg-amber-100 px-1 text-[10px] text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              C
            </span>
          )}
          {spell.ritual && (
            <span className="rounded bg-blue-100 px-1 text-[10px] text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              R
            </span>
          )}
        </span>
      </button>
      {open && (
        <div className="space-y-1 border-t border-zinc-100 px-3 py-2 text-xs dark:border-zinc-800">
          <div className="grid grid-cols-2 gap-1 text-zinc-500">
            <div>
              <strong>Conjuração:</strong> {spell.castingTime}
            </div>
            <div>
              <strong>Alcance:</strong> {spell.range}
            </div>
            <div>
              <strong>Componentes:</strong> {spell.components}
            </div>
            <div>
              <strong>Duração:</strong> {spell.duration}
            </div>
          </div>
          <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {spell.description}
          </p>
        </div>
      )}
    </li>
  );
}
