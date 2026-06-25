"use client";

import { useMemo, useState } from "react";
import { TRAITS_CATALOG } from "@/data/traitsCatalog";
import type { CatalogTrait } from "@/lib/types";
import { Input } from "@/components/ui/Input";

type Props = {
  selected: string[];
  onChange: (names: string[]) => void;
};

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function TraitPicker({ selected, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<{ trait: boolean; talento: boolean }>({
    trait: true,
    talento: false,
  });

  const sel = useMemo(() => new Set(selected.map((s) => s.toLowerCase())), [selected]);

  function toggle(name: string) {
    onChange(
      sel.has(name.toLowerCase())
        ? selected.filter((s) => s.toLowerCase() !== name.toLowerCase())
        : [...selected, name],
    );
  }

  const q = norm(query.trim());
  const match = (t: CatalogTrait) => !q || norm(t.name).includes(q) || norm(t.description).includes(q);
  const traits = TRAITS_CATALOG.filter((t) => t.kind === "trait" && match(t));
  const feats = TRAITS_CATALOG.filter((t) => t.kind === "talento" && match(t));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar traço ou talento…"
          className="max-w-xs"
        />
        <span className="shrink-0 text-xs text-zinc-500">{selected.length} selecionado(s)</span>
      </div>

      {/* selecionados (chips removíveis) */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs hover:bg-red-100 dark:bg-zinc-700 dark:hover:bg-red-900/40"
              title="Remover"
            >
              {name} ✕
            </button>
          ))}
        </div>
      )}

      <Group
        title="Traços raciais"
        list={traits}
        sel={sel}
        onToggle={toggle}
        open={open.trait || !!q}
        onOpen={() => setOpen((o) => ({ ...o, trait: !o.trait }))}
      />
      <Group
        title="Talentos"
        list={feats}
        sel={sel}
        onToggle={toggle}
        open={open.talento || !!q}
        onOpen={() => setOpen((o) => ({ ...o, talento: !o.talento }))}
      />
    </div>
  );
}

function Group({
  title,
  list,
  sel,
  onToggle,
  open,
  onOpen,
}: {
  title: string;
  list: CatalogTrait[];
  sel: Set<string>;
  onToggle: (name: string) => void;
  open: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium"
      >
        <span>
          {title} <span className="text-xs font-normal text-zinc-500">({list.length})</span>
        </span>
        <span className="text-xs text-zinc-500">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <ul className="max-h-72 space-y-1 overflow-y-auto border-t border-zinc-100 px-2 py-2 dark:border-zinc-800">
          {list.map((t) => (
            <li key={t.name}>
              <label className="flex cursor-pointer gap-2 rounded p-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
                  checked={sel.has(t.name.toLowerCase())}
                  onChange={() => onToggle(t.name)}
                />
                <span>
                  <span className="font-medium">{t.name}</span>
                  <span className="block text-xs text-zinc-500">{t.description}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
