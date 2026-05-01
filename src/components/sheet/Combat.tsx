"use client";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { roll } from "@/lib/dice";
import { abilityMod, formatMod } from "@/lib/types";

export function Combat({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const addRoll = useStore((s) => s.addRoll);
  if (!c) return null;

  const initBonus = c.sheet.initiativeBonus || abilityMod(c.sheet.abilityScores.dex);

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
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="CA" value={c.sheet.ac} />
          <Stat label="Iniciativa" value={formatMod(initBonus)} onClick={rollInit} />
          <Stat label="Deslocamento" value={`${c.sheet.speed}m`} />
        </div>

        {c.sheet.weapons.length > 0 && (
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
        )}
      </CardBody>
    </Card>
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
