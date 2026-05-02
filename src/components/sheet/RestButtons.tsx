"use client";

import { Bed, Coffee } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStore, useUnlocked } from "@/lib/store";
import { applyLongRest, applyShortRest } from "@/lib/rest";

export function RestButtons({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const patch = useStore((s) => s.patchCharacter);
  const unlocked = useUnlocked(id);

  if (!c) return null;

  const shortRest = () => {
    void patch(id, applyShortRest(c));
  };

  const longRest = () => {
    void patch(id, applyLongRest(c));
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
