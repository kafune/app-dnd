"use client";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore, useUnlocked } from "@/lib/store";

export function SpellSlots({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const patch = useStore((s) => s.patchCharacter);
  const unlocked = useUnlocked(id);

  if (!c) return null;
  const levels = Object.keys(c.spellSlots).sort();
  if (levels.length === 0) return null;

  const toggle = (level: string, idx: number) => {
    if (!unlocked) return;
    const slot = c.spellSlots[level];
    // bolinhas representam usadas a partir da direita; clicar inverte uma
    const used = slot.max - slot.current;
    const newUsed = idx < used ? used - 1 : used + 1;
    const newCurrent = Math.max(0, Math.min(slot.max, slot.max - newUsed));
    void patch(id, {
      spellSlots: { ...c.spellSlots, [level]: { ...slot, current: newCurrent } },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Espaços de Magia</CardTitle>
      </CardHeader>
      <CardBody className="space-y-2">
        {levels.map((lv) => {
          const slot = c.spellSlots[lv];
          const used = slot.max - slot.current;
          return (
            <div key={lv} className="flex items-center justify-between">
              <span className="text-sm font-medium">Nível {lv}</span>
              <div className="flex items-center gap-1.5" style={{ color: c.color ?? "#7c3aed" }}>
                {Array.from({ length: slot.max }).map((_, i) => {
                  const isUsed = i < used;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Slot ${i + 1} de nível ${lv}`}
                      disabled={!unlocked}
                      onClick={() => toggle(lv, i)}
                      className={`slot-pip ${isUsed ? "used" : "available"} ${
                        !unlocked ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    />
                  );
                })}
                <span className="ml-2 font-mono text-xs text-zinc-500">
                  {slot.current}/{slot.max}
                </span>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
