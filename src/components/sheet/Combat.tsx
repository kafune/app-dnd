"use client";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { roll } from "@/lib/dice";
import { abilityMod, formatMod, type Weapon } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { EditableText, EditableNumber } from "@/components/sheet/edit/EditControls";

export function Combat({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const addRoll = useStore((s) => s.addRoll);
  const editMode = useStore((s) => s.editMode);
  const patchSheet = useStore((s) => s.patchSheet);
  if (!c) return null;

  const initBonus = c.sheet.initiativeBonus || abilityMod(c.sheet.abilityScores.dex);
  const weapons = c.sheet.weapons;
  const setWeapons = (w: Weapon[]) => void patchSheet(id, { weapons: w });
  const updateWeapon = (i: number, patch: Partial<Weapon>) =>
    setWeapons(weapons.map((w, idx) => (idx === i ? { ...w, ...patch } : w)));

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
        {editMode ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <EditStat label="CA">
              <EditableNumber value={c.sheet.ac} onSave={(v) => patchSheet(id, { ac: v })} />
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
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="CA" value={c.sheet.ac} />
            <Stat label="Iniciativa" value={formatMod(initBonus)} onClick={rollInit} />
            <Stat label="Deslocamento" value={`${c.sheet.speed}m`} />
          </div>
        )}

        {editMode ? (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Armas</div>
            {weapons.map((w, i) => (
              <div
                key={i}
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
}: {
  label: string;
  value: string | number;
  onClick?: () => void;
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
      <div className="font-mono text-xl font-bold">{value}</div>
    </Comp>
  );
}
