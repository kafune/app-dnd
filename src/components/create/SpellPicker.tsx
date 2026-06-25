"use client";

import { useMemo, useState } from "react";
import { SPELLS_CATALOG } from "@/data/spellsCatalog";
import type { CatalogSpell, Spell } from "@/lib/types";
import { Input } from "@/components/ui/Input";

type Props = {
  classNames: string[];
  cantrips: Spell[];
  known: Spell[];
  onChange: (cantrips: Spell[], known: Spell[]) => void;
};

/** Converte uma magia do catálogo para o formato guardado na ficha. */
function toSheetSpell(c: CatalogSpell): Spell {
  return {
    name: c.name,
    level: c.level,
    school: c.school,
    castingTime: c.castingTime,
    range: c.range,
    components: c.components,
    duration: c.duration,
    description: c.description,
    ...(c.ritual ? { ritual: true } : {}),
    ...(c.concentration ? { concentration: true } : {}),
  };
}

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function SpellPicker({ classNames, cantrips, known, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [openLevels, setOpenLevels] = useState<Set<number>>(new Set([0, 1]));

  const available = useMemo(
    () =>
      SPELLS_CATALOG.filter((s) => s.classes.some((c) => classNames.includes(c))),
    [classNames],
  );

  const byLevel = useMemo(() => {
    const m = new Map<number, CatalogSpell[]>();
    for (const s of available) {
      if (!m.has(s.level)) m.set(s.level, []);
      m.get(s.level)!.push(s);
    }
    return m;
  }, [available]);

  const selected = useMemo(
    () => new Set([...cantrips, ...known].map((s) => s.name.toLowerCase())),
    [cantrips, known],
  );

  function toggle(spell: CatalogSpell) {
    const isSel = selected.has(spell.name.toLowerCase());
    if (spell.level === 0) {
      onChange(
        isSel
          ? cantrips.filter((s) => s.name !== spell.name)
          : [...cantrips, toSheetSpell(spell)],
        known,
      );
    } else {
      onChange(
        cantrips,
        isSel
          ? known.filter((s) => s.name !== spell.name)
          : [...known, toSheetSpell(spell)],
      );
    }
  }

  if (available.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        A(s) classe(s) selecionada(s) não têm magias no catálogo. Escolha uma classe conjuradora
        ou adicione magias depois na ficha.
      </p>
    );
  }

  const q = norm(query.trim());
  const matches = q ? available.filter((s) => norm(s.name).includes(q)) : [];
  const levels = [...byLevel.keys()].sort((a, b) => a - b);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar magia…"
          className="max-w-xs"
        />
        <span className="shrink-0 text-xs text-zinc-500">
          {cantrips.length} truques · {known.length} magias
        </span>
      </div>

      {q ? (
        <SpellList list={matches} selected={selected} onToggle={toggle} />
      ) : (
        levels.map((lvl) => {
          const list = byLevel.get(lvl)!;
          const open = openLevels.has(lvl);
          const selCount = list.filter((s) => selected.has(s.name.toLowerCase())).length;
          return (
            <div key={lvl} className="rounded-md border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() =>
                  setOpenLevels((prev) => {
                    const next = new Set(prev);
                    if (next.has(lvl)) next.delete(lvl);
                    else next.add(lvl);
                    return next;
                  })
                }
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium"
              >
                <span>
                  {lvl === 0 ? "Truques" : `Nível ${lvl}`}{" "}
                  <span className="text-xs font-normal text-zinc-500">({list.length})</span>
                </span>
                <span className="text-xs text-zinc-500">
                  {selCount > 0 && `${selCount} ✓ · `}
                  {open ? "▾" : "▸"}
                </span>
              </button>
              {open && (
                <div className="border-t border-zinc-100 px-2 py-2 dark:border-zinc-800">
                  <SpellList list={list} selected={selected} onToggle={toggle} />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function SpellList({
  list,
  selected,
  onToggle,
}: {
  list: CatalogSpell[];
  selected: Set<string>;
  onToggle: (s: CatalogSpell) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
      {list.map((s) => (
        <label key={s.name} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected.has(s.name.toLowerCase())}
            onChange={() => onToggle(s)}
          />
          <span>{s.name}</span>
          <span className="text-xs text-zinc-500">{s.school}</span>
          {s.concentration && <span className="text-[10px] text-amber-600">C</span>}
          {s.ritual && <span className="text-[10px] text-blue-600">R</span>}
        </label>
      ))}
    </div>
  );
}
