"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import { ABILITY_LABELS, ABILITY_ORDER, type AbilityKey, type Spell } from "@/lib/types";
import { EditableNumber } from "@/components/sheet/edit/EditControls";
import { SpellPicker } from "@/components/create/SpellPicker";

const selectCls =
  "h-7 rounded-md border border-zinc-300 bg-white px-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function Spells({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const editMode = useStore((s) => s.editMode);
  const patchSheet = useStore((s) => s.patchSheet);
  if (!c) return null;
  const { cantrips, known, saveDC, attackMod, castingAbility } = c.sheet.spells;
  const all = [...cantrips, ...known];
  if (all.length === 0 && !editMode) return null;

  const setSpells = (partial: Partial<typeof c.sheet.spells>) =>
    void patchSheet(id, { spells: { ...c.sheet.spells, ...partial } });
  const classNames = c.sheet.classes.map((k) => k.name);

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
          {editMode ? (
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              CD
              <EditableNumber value={saveDC} onSave={(v) => setSpells({ saveDC: v })} className="h-7 w-12" />
              Atq
              <EditableNumber value={attackMod} onSave={(v) => setSpells({ attackMod: v })} className="h-7 w-12" />
              <select
                className={selectCls}
                value={castingAbility}
                onChange={(e) => setSpells({ castingAbility: e.target.value as AbilityKey })}
              >
                {ABILITY_ORDER.map((k) => (
                  <option key={k} value={k}>
                    {ABILITY_LABELS[k].slice(0, 3)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-xs text-zinc-500">
              CD {saveDC} · Ataque +{attackMod}
            </div>
          )}
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {editMode && (
          <SpellPicker
            classNames={classNames}
            cantrips={cantrips}
            known={known}
            onChange={(cantrips, known) => setSpells({ cantrips, known })}
          />
        )}
        {!editMode &&
          sortedLevels.map((lvl) => (
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
