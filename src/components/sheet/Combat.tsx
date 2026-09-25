import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useIsMaster, useCharacterSheet, useStore } from "@/lib/store";
import { roll } from "@/lib/dice";
import { ABILITY_LABELS, abilityMod, formatMod, type Weapon } from "@/lib/types";
import { acWarnings, computeAc } from "@/lib/armor";
import { grantedSpellNumbers, hitDiceLabel, hitDiceOf, spellCastingOf, spellcastingStats } from "@/lib/progression";
import { sheetPermissions } from "@/lib/permissions";
import { AlertTriangle, Trash2 } from "lucide-react";
import { EditableText, EditableNumber } from "@/components/sheet/edit/EditControls";

export function Combat({ id }: { id: string }) {
  const c = useCharacterSheet(id);
  const addRoll = useStore((s) => s.addRoll);
  const editMode = useStore((s) => s.editMode);
  const isMaster = useIsMaster(id);
  const patchSheet = useStore((s) => s.patchSheet);
  if (!c) return null;

  const can = sheetPermissions(isMaster, c.sheet);
  const initBonus = c.sheet.initiativeBonus || abilityMod(c.sheet.abilityScores.dex);
  const ac = computeAc(c.sheet);
  const warnings = acWarnings(c.sheet);
  const weapons = c.sheet.weapons;
  const setWeapons = (w: Weapon[]) => void patchSheet(id, { weapons: w });
  const updateWeapon = (i: number, patch: Partial<Weapon>) =>
    setWeapons(weapons.map((w, idx) => (idx === i ? { ...w, ...patch } : w)));
  // Dado de vida e números de conjuração saem do catálogo da classe: cada classe
  // tem o seu dado e o seu atributo de conjuração (a CD e o ataque mudam junto).
  const hitDice = hitDiceOf(c.sheet.classes);
  const casting = spellcastingStats(c.sheet);
  // Magias de talento/traço conjuram com o atributo do próprio talento e muitas
  // saem sem gastar espaço: os números delas não são os da classe.
  const grantedCasts = [...c.sheet.spells.cantrips, ...c.sheet.spells.known]
    .map((spell) => ({ spell, casting: spellCastingOf(c.sheet, spell), numbers: grantedSpellNumbers(c.sheet, spell) }))
    .filter((entry) => entry.casting?.ability || entry.casting?.free);

  const rollInit = () =>
    void addRoll(
      roll(`1d20${formatMod(initBonus)}`, {
        characterId: c.id,
        characterName: c.characterName,
        label: "Iniciativa",
      }),
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Combate</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        {editMode && can.combat ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <EditStat label="CA manual (vazio = calculada)">
              <EditableNumber
                value={c.sheet.acOverride ?? 0}
                min={0}
                onSave={(v) => patchSheet(id, { acOverride: v > 0 ? v : null, ac: v > 0 ? v : ac.total })}
              />
            </EditStat>
            <EditStat label="Bônus de CA">
              <EditableNumber value={c.sheet.acBonus ?? 0} onSave={(v) => patchSheet(id, { acBonus: v })} />
            </EditStat>
            <EditStat label="Iniciativa">
              <EditableNumber
                value={c.sheet.initiativeBonus}
                onSave={(v) => patchSheet(id, { initiativeBonus: v })}
              />
            </EditStat>
            <EditStat label="Deslocamento (m)">
              <EditableNumber value={c.sheet.speed} onSave={(v) => patchSheet(id, { speed: v })} />
            </EditStat>
            <EditStat label="Bônus de Prof.">
              <EditableNumber
                value={c.sheet.proficiencyBonus}
                onSave={(v) => patchSheet(id, { proficiencyBonus: v })}
              />
            </EditStat>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            <Stat label="CA" value={ac.total} />
            <Stat label="Iniciativa" value={formatMod(initBonus)} onClick={rollInit} />
            <Stat label="Deslocamento" value={`${c.sheet.speed}m`} />
            {hitDice.length > 0 && <Stat label="Dado de vida" value={hitDiceLabel(hitDice)} compact />}
          </div>
        )}

        {/* Dado de vida por classe: o que se gasta no descanso curto. */}
        {hitDice.length > 0 && (
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300">
            Dado de vida:{" "}
            {hitDice.map((entry, i) => (
              <span key={`${entry.className}:${i}`}>
                {i > 0 && <span className="mx-1 text-zinc-400">+</span>}
                {entry.className} <strong className="font-mono">{entry.count}{entry.hitDie}</strong>
              </span>
            ))}
            <span className="ml-1 text-zinc-400">
              — no descanso curto, gaste um e some {formatMod(abilityMod(c.sheet.abilityScores.con))} de Constituição.
            </span>
          </div>
        )}

        {/* De onde vem a CA: a conta aberta, para ninguém achar que "é sempre 10". */}
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-800/40">
          {ac.manual ? (
            <span className="text-zinc-600 dark:text-zinc-300">
              CA fixada pelo Mestre em <strong>{ac.total}</strong> (a conta daria {ac.formula.split("=").pop()?.trim()}).
            </span>
          ) : (
            <span className="text-zinc-600 dark:text-zinc-300">
              {ac.parts.map((part, i) => (
                <span key={part.label}>
                  {i > 0 && <span className="mx-1 text-zinc-400">+</span>}
                  {part.label} <strong className="font-mono">{i === 0 ? part.value : formatMod(part.value)}</strong>
                </span>
              ))}
              <span className="ml-1 text-zinc-400">= {ac.total}</span>
            </span>
          )}
          {!c.sheet.equippedArmor && !ac.manual && (
            <div className="mt-0.5 text-[11px] text-zinc-500">
              Sem armadura equipada. Use “Equipar” no inventário para somar a CA da armadura.
            </div>
          )}
        </div>

        {warnings.length > 0 && (
          <ul className="space-y-1">
            {warnings.map((warning) => (
              <li
                key={warning}
                className="flex items-start gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
              >
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Conjuração: CD, ataque mágico e atributo — por classe, que é como o 5e calcula. */}
        {casting.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Conjuração</div>
            {casting.map((stat, i) => (
              <div
                key={`${stat.className}:${i}`}
                className="space-y-1.5 rounded border border-zinc-200 p-2 dark:border-zinc-800"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-1 text-sm">
                  <span className="font-medium">{stat.className}</span>
                  {stat.subclass && <span className="text-xs text-zinc-500">{stat.subclass}</span>}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <MiniStat
                    label="Habilidade"
                    value={`${ABILITY_LABELS[stat.ability]} ${formatMod(stat.abilityMod)}`}
                  />
                  <MiniStat label="CD das magias" value={stat.saveDC} />
                  <MiniStat
                    label="Ataque mágico"
                    value={formatMod(stat.attackMod)}
                    onClick={() =>
                      void addRoll(
                        roll(`1d20${formatMod(stat.attackMod)}`, {
                          characterId: c.id,
                          characterName: c.characterName,
                          label: `Ataque mágico (${stat.className})`,
                        }),
                      )
                    }
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  CD = 8 + bônus de proficiência ({formatMod(c.sheet.proficiencyBonus)}) +{" "}
                  {ABILITY_LABELS[stat.ability]} ({formatMod(stat.abilityMod)}). O ataque mágico usa a mesma conta, sem o
                  8.
                </p>
              </div>
            ))}
            {casting.length > 1 && (
              <p className="text-[11px] text-zinc-500">
                Cada classe conjura com o próprio atributo: use a CD e o ataque da classe de onde a magia veio.
              </p>
            )}
          </div>
        )}

        {/* Magias que vieram de talento ou traço: atributo próprio e uso sem espaço. */}
        {grantedCasts.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Magias de talento e traço</div>
            <ul className="space-y-1">
              {grantedCasts.map(({ spell, casting, numbers }) => (
                <li
                  key={spell.name}
                  className="rounded border border-violet-300 bg-violet-50 px-2 py-1 text-xs text-violet-900 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-100"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <strong>{spell.name}</strong>
                    <span className="opacity-70">{spell.granted}</span>
                    {numbers && (
                      <span className="rounded bg-amber-200 px-1 font-mono text-[10px] font-semibold text-amber-900 dark:bg-amber-900/60 dark:text-amber-100">
                        CD {numbers.saveDC} · atq {formatMod(numbers.attackMod)} ·{" "}
                        {ABILITY_LABELS[numbers.ability].slice(0, 3)}
                      </span>
                    )}
                  </div>
                  {casting?.free && <div className="opacity-80">Sem gastar espaço de magia: {casting.free}.</div>}
                  {casting?.slots && <div className="opacity-80">Também pode ser conjurada gastando um espaço.</div>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {editMode && can.combat ? (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Armas</div>
            {weapons.map((w, i) => (
              <div
                key={`${i}:${w.name}`}
                className="space-y-1 rounded border border-zinc-200 p-2 dark:border-zinc-800"
              >
                <div className="flex items-center gap-1">
                  <EditableText
                    value={w.name}
                    onSave={(v) => updateWeapon(i, { name: v })}
                    placeholder="nome"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover arma"
                    onClick={() => setWeapons(weapons.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  <EditableText
                    value={w.damage}
                    onSave={(v) => updateWeapon(i, { damage: v })}
                    placeholder="dano (1d8)"
                    className="w-24"
                  />
                  <EditableText
                    value={w.damageType}
                    onSave={(v) => updateWeapon(i, { damageType: v })}
                    placeholder="tipo"
                    className="w-28"
                  />
                  <EditableNumber
                    value={w.attackBonus}
                    onSave={(v) => updateWeapon(i, { attackBonus: v })}
                    className="w-16"
                  />
                  <EditableText
                    value={w.properties.join(", ")}
                    onSave={(v) =>
                      updateWeapon(i, {
                        properties: v.split(",").map((p) => p.trim()).filter(Boolean),
                      })
                    }
                    placeholder="propriedades"
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setWeapons([
                  ...weapons,
                  { name: "Arma", damage: "1d6", damageType: "cortante", attackBonus: 0, properties: [] },
                ])
              }
            >
              + Arma
            </Button>
          </div>
        ) : (
          c.sheet.weapons.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Armas</div>
            <ul className="space-y-1.5">
              {c.sheet.weapons.map((w) => (
                <li
                  key={w.name}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-200 p-2 text-sm dark:border-zinc-800"
                >
                  <div className="flex-1">
                    <div className="font-medium">{w.name}</div>
                    <div className="text-xs text-zinc-500">
                      {w.damage} {w.damageType}
                      {w.properties.length ? ` · ${w.properties.join(", ")}` : ""}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        addRoll(
                          roll(`1d20${formatMod(w.attackBonus)}`, {
                            characterId: c.id,
                            characterName: c.characterName,
                            label: `${w.name} (Acerto)`,
                          }),
                        )
                      }
                    >
                      Acerto {formatMod(w.attackBonus)}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        addRoll(
                          roll(w.damage, {
                            characterId: c.id,
                            characterName: c.characterName,
                            label: `${w.name} (Dano)`,
                          }),
                        )
                      }
                    >
                      Dano {w.damage}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          )
        )}
      </CardBody>
    </Card>
  );
}

function EditStat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-2 text-center dark:border-zinc-800">
      <div className="mb-1 text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="flex justify-center">{children}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  onClick,
  compact,
}: {
  label: string;
  value: string | number;
  onClick?: () => void;
  /** Valores longos (dados de vida da multiclasse) em corpo menor. */
  compact?: boolean;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={`rounded-lg border border-zinc-200 p-2 dark:border-zinc-800 ${
        onClick ? "hover:bg-zinc-100 dark:hover:bg-zinc-800" : ""
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`font-mono font-bold ${compact ? "text-base" : "text-xl"}`}>{value}</div>
    </Comp>
  );
}

/** Quadradinho de número dentro do bloco de conjuração. */
function MiniStat({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string | number;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={`rounded border border-zinc-200 px-1 py-1 dark:border-zinc-800 ${
        onClick ? "hover:bg-zinc-100 dark:hover:bg-zinc-800" : ""
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="font-mono text-sm font-bold">{value}</div>
    </Comp>
  );
}
