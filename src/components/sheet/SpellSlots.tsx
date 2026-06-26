"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore, useUnlocked } from "@/lib/store";
import { EditableNumber } from "@/components/sheet/edit/EditControls";
import { spellSlotsForClasses } from "@/lib/createCharacter";

export function SpellSlots({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const patch = useStore((s) => s.patchCharacter);
  const editMode = useStore((s) => s.editMode);
  const unlocked = useUnlocked(id);

  if (!c) return null;
  const levels = Object.keys(c.spellSlots).sort();
  if (levels.length === 0 && !editMode) return null;

  const setMax = (level: string, max: number) => {
    const slot = c.spellSlots[level];
    void patch(id, {
      spellSlots: {
        ...c.spellSlots,
        [level]: { max: Math.max(0, max), current: Math.min(slot?.current ?? max, Math.max(0, max)) },
      },
    });
  };
  const removeLevel = (level: string) => {
    const next = { ...c.spellSlots };
    delete next[level];
    void patch(id, { spellSlots: next });
  };
  const addLevel = () => {
    const lv = ["1", "2", "3", "4", "5", "6", "7", "8", "9"].find((l) => !(l in c.spellSlots));
    if (lv) void patch(id, { spellSlots: { ...c.spellSlots, [lv]: { current: 1, max: 1 } } });
  };
  // Recalcula os espaços pela tabela 5e a partir das classes/níveis do personagem,
  // preservando quantos espaços já foram gastos em cada nível.
  const recalc = () => {
    const fresh = spellSlotsForClasses(
      c.sheet.classes.map((k) => ({ name: k.name, level: k.level })),
    );
    const next: typeof c.spellSlots = {};
    for (const [lv, slot] of Object.entries(fresh)) {
      const used = (c.spellSlots[lv]?.max ?? 0) - (c.spellSlots[lv]?.current ?? 0);
      next[lv] = { max: slot.max, current: Math.max(0, slot.max - Math.max(0, used)) };
    }
    void patch(id, { spellSlots: next });
  };

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
                {editMode && (
                  <>
                    <span className="ml-2 text-[10px] text-zinc-500">máx</span>
                    <EditableNumber
                      value={slot.max}
                      min={0}
                      onSave={(v) => setMax(lv, v)}
                      className="h-7 w-14"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover nível ${lv}`}
                      onClick={() => removeLevel(lv)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {editMode && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={addLevel}>
              + Nível de espaço
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={recalc}
              title="Recalcular pela tabela 5e usando as classes e níveis do personagem"
            >
              Recalcular pelos níveis
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
