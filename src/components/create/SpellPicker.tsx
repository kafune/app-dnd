import { useMemo, useState } from "react";
import { SPELLS_CATALOG } from "@/data/spellsCatalog";
import type { CatalogSpell, Spell } from "@/lib/types";
import type { ClassSpellCaps } from "@/lib/progression";
import { Input } from "@/components/ui/Input";

type Props = {
  classNames: string[];
  /** Limites separados por classe, incluindo o círculo máximo. */
  caps?: ClassSpellCaps[];
  cantrips: Spell[];
  known: Spell[];
  /** Limite de truques (null = sem limite, ex.: classe homebrew). */
  cantripsMax?: number | null;
  /** Limite de magias conhecidas/preparadas (null = sem limite). */
  spellsMax?: number | null;
  /** Mestre: ignora classe, círculo e quantidade. */
  unrestricted?: boolean;
  onChange: (cantrips: Spell[], known: Spell[]) => void;
};

/** Converte uma magia do catálogo para o formato guardado na ficha. */
function toSheetSpell(c: CatalogSpell, classSource?: string): Spell {
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
    ...(classSource ? { classSource } : {}),
  };
}

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function SpellPicker({
  classNames,
  caps,
  cantrips,
  known,
  cantripsMax = null,
  spellsMax = null,
  unrestricted = false,
  onChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [openLevels, setOpenLevels] = useState<Set<number>>(new Set([0, 1]));
  const selected = useMemo(
    () => new Set([...cantrips, ...known].map((spell) => spell.name.toLowerCase())),
    [cantrips, known],
  );

  const available = useMemo(
    () =>
      SPELLS_CATALOG.filter((spell) => {
        if (selected.has(spell.name.toLowerCase())) return true;
        if (unrestricted) return true;
        if (caps?.length) {
          return caps.some(
            (cap) => spell.classes.includes(cap.profile.list) && spell.level <= cap.maxLevel,
          );
        }
        return spell.classes.some((className) => classNames.includes(className));
      }),
    [caps, classNames, selected, unrestricted],
  );

  const byLevel = useMemo(() => {
    const m = new Map<number, CatalogSpell[]>();
    for (const s of available) {
      if (!m.has(s.level)) m.set(s.level, []);
      m.get(s.level)!.push(s);
    }
    return m;
  }, [available]);

  const eligibleCaps = (spell: CatalogSpell) =>
    (caps ?? []).filter(
      (cap) => spell.classes.includes(cap.profile.list) && (unrestricted || spell.level <= cap.maxLevel),
    );

  const countFor = (cap: ClassSpellCaps, list: Spell[]) =>
    list.filter((spell) => {
      if (spell.granted) return false;
      if (spell.classSource) return spell.classSource === cap.className;
      const catalog = SPELLS_CATALOG.find((entry) => entry.name === spell.name);
      const inferred = catalog
        ? (caps ?? []).find((candidate) => catalog.classes.includes(candidate.profile.list))?.className
        : caps?.[0]?.className;
      return inferred === cap.className;
    }).length;

  const sourceFor = (spell: CatalogSpell) => {
    const eligible = eligibleCaps(spell);
    const list = spell.level === 0 ? cantrips : known;
    return (
      eligible.find((cap) => countFor(cap, list) < (spell.level === 0 ? cap.cantrips : cap.spells))?.className ??
      eligible[0]?.className ??
      caps?.[0]?.className ??
      classNames[0]
    );
  };

  function disabledFor(spell: CatalogSpell) {
    if (selected.has(spell.name.toLowerCase())) return false;
    if (unrestricted) return false;
    if (caps?.length) {
      const list = spell.level === 0 ? cantrips : known;
      return !eligibleCaps(spell).some(
        (cap) => countFor(cap, list) < (spell.level === 0 ? cap.cantrips : cap.spells),
      );
    }
    return spell.level === 0
      ? cantripsMax !== null && cantrips.length >= cantripsMax
      : spellsMax !== null && known.filter((entry) => !entry.granted).length >= spellsMax;
  }

  function toggle(spell: CatalogSpell) {
    const isSel = selected.has(spell.name.toLowerCase());
    const stored = [...cantrips, ...known].find((entry) => entry.name.toLowerCase() === spell.name.toLowerCase());
    if (isSel && stored?.granted && !unrestricted) return;
    if (!isSel && disabledFor(spell)) return; // respeita o limite da classe
    if (spell.level === 0) {
      onChange(
        isSel
          ? cantrips.filter((s) => s.name !== spell.name)
          : [...cantrips, toSheetSpell(spell, sourceFor(spell))],
        known,
      );
    } else {
      onChange(
        cantrips,
        isSel
          ? known.filter((s) => s.name !== spell.name)
          : [...known, toSheetSpell(spell, sourceFor(spell))],
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
        <span className="shrink-0 text-right text-xs text-zinc-500">
          {unrestricted ? "Modo Mestre: sem limites" : caps?.length ? caps.map((cap) => (
            <span key={cap.className} className="block">
              {cap.className}: {countFor(cap, cantrips)}/{cap.cantrips} truques · {countFor(cap, known)}/{cap.spells} magias · até {cap.maxLevel}º
            </span>
          )) : `${cantrips.length}${cantripsMax !== null ? `/${cantripsMax}` : ""} truques · ${known.length}${spellsMax !== null ? `/${spellsMax}` : ""} magias`}
        </span>
      </div>

      {q ? (
        <SpellList list={matches} selected={selected} onToggle={toggle} disabledFor={disabledFor} />
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
                  <SpellList
                    list={list}
                    selected={selected}
                    onToggle={toggle}
                    disabledFor={disabledFor}
                  />
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
  disabledFor,
}: {
  list: CatalogSpell[];
  selected: Set<string>;
  onToggle: (s: CatalogSpell) => void;
  disabledFor: (s: CatalogSpell) => boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
      {list.map((s) => {
        const checked = selected.has(s.name.toLowerCase());
        const disabled = !checked && disabledFor(s);
        return (
          <SpellChoice
            key={s.name}
            spell={s}
            checked={checked}
            disabled={disabled}
            onToggle={() => onToggle(s)}
          />
        );
      })}
    </div>
  );
}

/**
 * Uma magia na lista: a caixa seleciona; clicar/passar o mouse no nome abre um
 * popup com a descrição. No desktop o `title` também mostra a descrição ao
 * passar o mouse; no mobile, tocar o nome abre/fecha o popup.
 */
function SpellChoice({
  spell: s,
  checked,
  disabled,
  onToggle,
}: {
  spell: CatalogSpell;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  // O popup abre ao passar o mouse (desktop). No mobile, tocar o nome dispara o
  // mouseenter sintetizado e abre o popup; tocar em outro lugar fecha (mouseleave).
  // A caixa de seleção é independente, então tocar nela seleciona a magia.
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded text-sm ${disabled ? "opacity-40" : ""} ${
        open ? "bg-zinc-50 dark:bg-zinc-800/50" : ""
      }`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex items-center gap-2 px-1 py-0.5">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onToggle}
          aria-label={`Selecionar ${s.name}`}
        />
        <button
          type="button"
          className="flex flex-1 items-center gap-2 text-left"
          title={s.description}
          onClick={() => setOpen(true)}
        >
          <span className="underline decoration-dotted underline-offset-2">{s.name}</span>
          <span className="text-xs text-zinc-500">{s.school}</span>
          {s.concentration && <span className="text-[10px] text-amber-600">C</span>}
          {s.ritual && <span className="text-[10px] text-blue-600">R</span>}
        </button>
      </div>
      {open && (
        <div className="mb-1 ml-6 mr-1 rounded border border-zinc-200 bg-white p-2 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mb-1 grid grid-cols-2 gap-x-2 text-zinc-500">
            <div>
              <strong>Nível:</strong> {s.level === 0 ? "Truque" : s.level}
            </div>
            <div>
              <strong>Conjuração:</strong> {s.castingTime}
            </div>
            <div>
              <strong>Alcance:</strong> {s.range}
            </div>
            <div>
              <strong>Duração:</strong> {s.duration}
            </div>
          </div>
          <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{s.description}</p>
        </div>
      )}
    </div>
  );
}
