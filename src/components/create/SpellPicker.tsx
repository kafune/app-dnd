import { useMemo, useState } from "react";
import { SPELLS_CATALOG } from "@/data/spellsCatalog";
import type { CatalogSpell, Spell } from "@/lib/types";
import type { ClassSpellCaps } from "@/lib/progression";
import { Input } from "@/components/ui/Input";

/** Magia concedida automaticamente (subclasse, raça), com a origem para exibir. */
export type GrantedSpell = { name: string; origin: string };

type Props = {
  classNames: string[];
  /** Limites separados por classe, incluindo o círculo máximo. */
  caps?: ClassSpellCaps[];
  cantrips: Spell[];
  known: Spell[];
  /** Magias automáticas (não contam no limite), só para mostrar de onde vêm. */
  granted?: GrantedSpell[];
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

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

export function SpellPicker({
  classNames,
  caps,
  cantrips,
  known,
  granted = [],
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

  /** Classe à qual uma magia guardada na ficha é contada. */
  const ownerOf = (spell: Spell): string | undefined => {
    if (spell.classSource) return spell.classSource;
    const catalog = SPELLS_CATALOG.find((entry) => entry.name === spell.name);
    return catalog
      ? (caps ?? []).find((candidate) => catalog.classes.includes(candidate.profile.list))?.className
      : caps?.[0]?.className;
  };

  const countFor = (cap: ClassSpellCaps, list: Spell[]) =>
    list.filter((spell) => !spell.granted && ownerOf(spell) === cap.className).length;

  const limitFor = (cap: ClassSpellCaps, level: number) => (level === 0 ? cap.cantrips : cap.spells);

  const sourceFor = (spell: CatalogSpell) => {
    const eligible = eligibleCaps(spell);
    const list = spell.level === 0 ? cantrips : known;
    return (
      eligible.find((cap) => countFor(cap, list) < limitFor(cap, spell.level))?.className ??
      eligible[0]?.className ??
      caps?.[0]?.className ??
      classNames[0]
    );
  };

  /** "lista de Druida", "lista de Clérigo e Druida", "lista de Mago (Ladino)". */
  const listText = (spell: CatalogSpell) => {
    const fromCaps = (caps ?? [])
      .filter((cap) => spell.classes.includes(cap.profile.list))
      .map((cap) => (cap.profile.list === cap.className ? cap.className : `${cap.profile.list} (via ${cap.className})`));
    if (fromCaps.length) return `lista de ${joinNames(fromCaps)}`;
    const own = spell.classes.filter((className) => classNames.includes(className));
    return `lista de ${joinNames(own.length ? own : spell.classes)}`;
  };

  function disabledFor(spell: CatalogSpell) {
    if (selected.has(spell.name.toLowerCase())) return false;
    if (unrestricted) return false;
    if (caps?.length) {
      const list = spell.level === 0 ? cantrips : known;
      return !eligibleCaps(spell).some((cap) => countFor(cap, list) < limitFor(cap, spell.level));
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
        isSel ? cantrips.filter((s) => s.name !== spell.name) : [...cantrips, toSheetSpell(spell, sourceFor(spell))],
        known,
      );
    } else {
      onChange(
        cantrips,
        isSel ? known.filter((s) => s.name !== spell.name) : [...known, toSheetSpell(spell, sourceFor(spell))],
      );
    }
  }

  /** Troca a classe à qual a magia conta (multiclasse com listas em comum). */
  function reassign(spell: CatalogSpell, className: string) {
    const update = (list: Spell[]) =>
      list.map((entry) => (entry.name.toLowerCase() === spell.name.toLowerCase() ? { ...entry, classSource: className } : entry));
    onChange(update(cantrips), update(known));
  }

  const choiceProps = (spell: CatalogSpell) => {
    const checked = selected.has(spell.name.toLowerCase());
    const stored = checked
      ? [...cantrips, ...known].find((entry) => entry.name.toLowerCase() === spell.name.toLowerCase())
      : undefined;
    const owner = stored ? ownerOf(stored) : undefined;
    const list = spell.level === 0 ? cantrips : known;
    const options =
      stored && !stored.granted
        ? eligibleCaps(spell)
            .filter((cap) => cap.className === owner || countFor(cap, list) < limitFor(cap, spell.level))
            .map((cap) => cap.className)
        : [];
    return {
      checked,
      disabled: !checked && disabledFor(spell),
      lists: listText(spell),
      countsFor: stored?.granted ? `concedida por ${stored.granted}` : owner,
      reassign:
        options.length > 1 && owner
          ? { options, value: owner, onChange: (className: string) => reassign(spell, className) }
          : undefined,
    };
  };

  const q = norm(query.trim());
  const matches = q ? available.filter((s) => norm(s.name).includes(q)) : [];
  const levels = [...byLevel.keys()].sort((a, b) => a - b);

  const grantedBox =
    granted.length > 0 ? (
      <div className="rounded-md border border-violet-200 bg-violet-50/60 p-2 text-xs dark:border-violet-900 dark:bg-violet-950/20">
        <div className="mb-1 font-medium text-violet-900 dark:text-violet-200">
          Magias automáticas (entram na ficha e não contam no limite)
        </div>
        <ul className="space-y-0.5 text-zinc-700 dark:text-zinc-300">
          {granted.map((spell) => (
            <li key={`${spell.name}:${spell.origin}`}>
              <strong>{spell.name}</strong> — {spell.origin}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  if (available.length === 0) {
    return (
      <div className="space-y-3">
        {grantedBox}
        <p className="text-sm text-zinc-500">
          A(s) classe(s) selecionada(s) não têm magias para escolher neste nível. Escolha uma classe conjuradora ou adicione
          magias depois na ficha.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {grantedBox}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar magia…" className="max-w-xs" />
        <span className="shrink-0 text-right text-xs text-zinc-500">
          {unrestricted
            ? "Modo Mestre: sem limites"
            : caps?.length
              ? caps.map((cap) => (
                  <span key={cap.className} className="block">
                    {cap.className}: {countFor(cap, cantrips)}/{cap.cantrips} truques · {countFor(cap, known)}/{cap.spells} magias
                    · até {cap.maxLevel}º
                  </span>
                ))
              : `${cantrips.length}${cantripsMax !== null ? `/${cantripsMax}` : ""} truques · ${known.length}${spellsMax !== null ? `/${spellsMax}` : ""} magias`}
        </span>
      </div>

      {q ? (
        <SpellList list={matches} choiceProps={choiceProps} onToggle={toggle} />
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
                  <SpellList list={list} choiceProps={choiceProps} onToggle={toggle} />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

type ChoiceProps = {
  checked: boolean;
  disabled: boolean;
  lists: string;
  countsFor?: string;
  reassign?: { options: string[]; value: string; onChange: (className: string) => void };
};

function SpellList({
  list,
  choiceProps,
  onToggle,
}: {
  list: CatalogSpell[];
  choiceProps: (spell: CatalogSpell) => ChoiceProps;
  onToggle: (s: CatalogSpell) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
      {list.map((s) => (
        <SpellChoice key={s.name} spell={s} {...choiceProps(s)} onToggle={() => onToggle(s)} />
      ))}
    </div>
  );
}

/**
 * Uma magia na lista: a caixa seleciona; passar o mouse (ou tocar) no nome abre um
 * popup com a descrição. Embaixo aparece de qual lista de classe a magia vem e, se
 * selecionada, para qual classe ela conta.
 */
function SpellChoice({
  spell: s,
  checked,
  disabled,
  lists,
  countsFor,
  reassign,
  onToggle,
}: ChoiceProps & { spell: CatalogSpell; onToggle: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded text-sm ${disabled ? "opacity-40" : ""} ${open ? "bg-zinc-50 dark:bg-zinc-800/50" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex items-center gap-2 px-1 pt-0.5">
        <input type="checkbox" checked={checked} disabled={disabled} onChange={onToggle} aria-label={`Selecionar ${s.name}`} />
        <button type="button" className="flex flex-1 flex-wrap items-center gap-x-2 text-left" title={s.description} onClick={() => setOpen(true)}>
          <span className="underline decoration-dotted underline-offset-2">{s.name}</span>
          <span className="text-xs text-zinc-500">{s.school}</span>
          {s.concentration && <span className="text-[10px] text-amber-600">C</span>}
          {s.ritual && <span className="text-[10px] text-blue-600">R</span>}
        </button>
      </div>
      <div className="ml-6 flex flex-wrap items-center gap-x-2 pb-0.5 text-[11px] text-zinc-500">
        <span>{lists}</span>
        {checked &&
          countsFor &&
          (reassign ? (
            <label className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              conta para
              <select
                className="h-5 rounded border border-zinc-300 bg-white px-1 text-[11px] dark:border-zinc-700 dark:bg-zinc-900"
                value={reassign.value}
                onChange={(event) => reassign.onChange(event.target.value)}
              >
                {reassign.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              {countsFor.startsWith("concedida") ? countsFor : `conta para ${countsFor}`}
            </span>
          ))}
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
            <div className="col-span-2">
              <strong>Listas de magia:</strong> {s.classes.join(", ")}
            </div>
          </div>
          <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{s.description}</p>
        </div>
      )}
    </div>
  );
}
