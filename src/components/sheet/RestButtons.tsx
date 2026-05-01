"use client";

import { Bed, Coffee } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStore, useUnlocked } from "@/lib/store";

export function RestButtons({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const patch = useStore((s) => s.patchCharacter);
  const unlocked = useUnlocked(id);

  if (!c) return null;

  const shortRest = () => {
    const resources = c.resources.map((r) =>
      r.recharge === "short" ? { ...r, current: r.max } : r,
    );
    void patch(id, { resources });
  };

  const longRest = () => {
    const resources = c.resources.map((r) =>
      r.recharge === "long" || r.recharge === "short" || r.recharge === "dawn"
        ? { ...r, current: r.max }
        : r,
    );
    const slots = Object.fromEntries(
      Object.entries(c.spellSlots).map(([k, v]) => [k, { ...v, current: v.max }]),
    );
    void patch(id, {
      hpCurrent: c.hpMax,
      hpTemp: 0,
      resources,
      spellSlots: slots,
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={!unlocked}
        onClick={shortRest}
        className="flex-1"
      >
        <Coffee className="h-3 w-3" /> Descanso Curto
      </Button>
      <Button
        variant="default"
        size="sm"
        disabled={!unlocked}
        onClick={longRest}
        className="flex-1"
      >
        <Bed className="h-3 w-3" /> Descanso Longo
      </Button>
    </div>
  );
}
