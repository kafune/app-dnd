import { lazy, Suspense, useState } from "react";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useIsMaster, useStore } from "@/lib/store";
import { ABILITY_LABELS, ABILITY_ORDER, formatMod, type AbilityKey, type Sheet, type Spell } from "@/lib/types";
import { EditableNumber } from "@/components/sheet/edit/EditControls";
// Catálogo de magias (600 KB) só entra na rede quando o modo de edição abre.
const SpellPicker = lazy(() =>
  import("@/components/create/SpellPicker").then((m) => ({ default: m.SpellPicker })),
);
import { allSpellCaps, grantedSpellNumbers, spellCastingOf, spellcastingStats, spellRoom } from "@/lib/progression";
import { sheetPermissions } from "@/lib/permissions";

const selectCls =
  "h-7 rounded-md border border-zinc-300 bg-white px-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function Spells({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const editMode = useStore((s) => s.editMode);
  const isMaster = useIsMaster(id);
  const patchSheet = useStore((s) => s.patchSheet);
  if (!c) return null;
  // Conjurador de um terço (Trapaceiro Arcano, Cavaleiro Arcano) tem lista fechada:
  // quem troca as magias dele é o Mestre.
  const canSwap = sheetPermissions(isMaster, c.sheet).spells;
  const { cantrips, known, saveDC, attackMod, castingAbility } = c.sheet.spells;
  const all = [...cantrips, ...known];
  if (all.length === 0 && !editMode) return null;

  const setSpells = (partial: Partial<typeof c.sheet.spells>) =>
    void patchSheet(id, { spells: { ...c.sheet.spells, ...partial } });
  const classNames = c.sheet.classes.map((k) => k.name);

  // Mesmo limite de truques/magias usado na criação — assim a edição também
  // respeita a capacidade da(s) classe(s) conjuradora(s) do personagem.
  const caps = allSpellCaps(c.sheet.classes, c.sheet.abilityScores);
  // Conjuração vinda de classe (a de talento tem números próprios, por magia).
  const classCasting = spellcastingStats(c.sheet);
  // Subiu de nível e sobrou vaga? Mesmo quem não troca magias livremente (Trapaceiro
  // Arcano, Cavaleiro Arcano) escolhe as magias novas — só não pode mexer nas antigas.
  const room = spellRoom(c.sheet.classes, c.sheet.abilityScores, cantrips, known);
  const fillOnly = !canSwap && (room.cantrips > 0 || room.spells > 0);

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
          {editMode && isMaster ? (
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
            // Quem só tem magia de talento não tem CD "da classe": a CD de cada
            // magia é a do talento e aparece ao lado do nome dela.
            classCasting.length > 0 && (
              <div className="text-xs text-zinc-500">
                CD {saveDC} · Ataque +{attackMod}
              </div>
            )
          )}
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {editMode && !canSwap && (
          <p className="rounded-md border border-zinc-200 p-2 text-xs text-zinc-500 dark:border-zinc-800">
            {fillOnly
              ? `A sua classe não troca magias livremente, mas o nível novo abriu ${room.cantrips} truque(s) e ${room.spells} magia(s): escolha abaixo. Depois de preencher, só o Mestre muda a lista.`
              : "A sua classe não escolhe magias livremente — quem muda a lista é o Mestre."}
          </p>
        )}
        {editMode && (canSwap || fillOnly) && (
          <Suspense fallback={<p className="text-xs text-zinc-500">Carregando catálogo de magias…</p>}>
            <SpellPicker
              classNames={classNames}
              caps={caps}
              cantrips={cantrips}
              known={known}
              unrestricted={isMaster}
              lockSelected={fillOnly}
              onChange={(cantrips, known) => setSpells({ cantrips, known })}
            />
          </Suspense>
        )}
        {(!editMode || (!canSwap && !fillOnly)) &&
          sortedLevels.map((lvl) => (
          <div key={lvl}>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {lvl === 0 ? "Truques" : `Nível ${lvl}`}
            </div>
            <ul className="space-y-1">
              {byLevel.get(lvl)!.map((sp) => (
                <SpellRow key={sp.name} spell={sp} sheet={c.sheet} />
              ))}
            </ul>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

/**
 * Uma magia da ficha. As que vieram de talento ou traço racial (Tocado pelas
 * Sombras e afins) conjuram com o atributo do próprio talento e podem ser
 * lançadas sem gastar espaço de magia: a CD e o ataque delas ficam ao lado do
 * nome, porque são diferentes dos da classe.
 */
function SpellRow({ spell, sheet }: { spell: Spell; sheet: Sheet }) {
  const [open, setOpen] = useState(false);
  const numbers = grantedSpellNumbers(sheet, spell);
  const casting = spellCastingOf(sheet, spell);
  const free = casting?.free;
  return (
    <li className="rounded border border-zinc-200 dark:border-zinc-800">
      <button
        className="flex w-full items-center justify-between px-2 py-1.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        onClick={() => setOpen(!open)}
      >
        <span className="flex flex-wrap items-center gap-1.5">
          {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <span className="font-medium">{spell.name}</span>
          <span className="text-xs text-zinc-500">{spell.school}</span>
          {(spell.granted || spell.classSource) && (
            <span
              className={
                spell.granted
                  ? "rounded bg-violet-100 px-1 text-[10px] font-medium text-violet-800 dark:bg-violet-900/40 dark:text-violet-200"
                  : "rounded bg-zinc-100 px-1 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              }
              title={spell.granted ? `Concedida por ${spell.granted}` : `Lista de magias de ${spell.classSource}`}
            >
              {spell.granted ?? spell.classSource}
            </span>
          )}
          {numbers && (
            <span
              className={`rounded px-1 font-mono text-[10px] font-semibold ${
                numbers.differs
                  ? "bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
              title={
                numbers.differs
                  ? `Esta magia conjura com ${ABILITY_LABELS[numbers.ability]} (do talento/traço), não com o atributo da sua classe.`
                  : `Conjurada com ${ABILITY_LABELS[numbers.ability]}.`
              }
            >
              CD {numbers.saveDC} · atq {formatMod(numbers.attackMod)} · {ABILITY_LABELS[numbers.ability].slice(0, 3)}
            </span>
          )}
          {free && (
            <span
              className="rounded bg-emerald-100 px-1 text-[10px] font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
              title={free}
            >
              sem espaço de magia
            </span>
          )}
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
          {spell.granted && (
            <div className="rounded-md border border-violet-300 bg-violet-50 px-2 py-1.5 text-violet-900 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-100">
              <div className="font-semibold">Magia concedida por {spell.granted}</div>
              <ul className="mt-0.5 space-y-0.5">
                <li>• Não conta no seu limite de magias conhecidas ou preparadas.</li>
                {numbers && (
                  <li>
                    • Atributo de conjuração: <strong>{ABILITY_LABELS[numbers.ability]}</strong> — CD{" "}
                    <strong className="font-mono">{numbers.saveDC}</strong>, ataque mágico{" "}
                    <strong className="font-mono">{formatMod(numbers.attackMod)}</strong>
                    {numbers.differs ? " (diferente do da sua classe)" : ""}.
                  </li>
                )}
                {free && <li>• Conjuração sem gastar espaço de magia: {free}.</li>}
                {casting?.slots && <li>• Também pode ser conjurada gastando um espaço de magia.</li>}
              </ul>
            </div>
          )}
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
