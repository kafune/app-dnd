"use client";

import { useState } from "react";
import { Dice5 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStore } from "@/lib/store";
import { roll } from "@/lib/dice";

const QUICK = ["1d4", "1d6", "1d8", "1d10", "1d12", "1d20", "1d100"];

export function DiceRoller({
  characterId,
  characterName,
}: {
  characterId?: string;
  characterName?: string;
}) {
  const [expr, setExpr] = useState("1d20");
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const addRoll = useStore((s) => s.addRoll);

  const doRoll = (e?: string) => {
    try {
      const r = roll(e ?? expr, {
        characterId,
        characterName,
        advantage,
        disadvantage,
        label: e ?? expr,
      });
      void addRoll(r);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-2">
      <form
        className="flex items-center gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          doRoll();
        }}
      >
        <Input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder="ex: 2d6+3"
          className="h-8 flex-1 font-mono"
        />
        <Button size="sm" type="submit">
          <Dice5 className="h-3 w-3" /> rolar
        </Button>
      </form>

      <div className="flex flex-wrap gap-1">
        {QUICK.map((q) => (
          <Button key={q} size="sm" variant="outline" onClick={() => doRoll(q)}>
            {q}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={advantage}
            onChange={(e) => {
              setAdvantage(e.target.checked);
              if (e.target.checked) setDisadvantage(false);
            }}
          />
          vantagem
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={disadvantage}
            onChange={(e) => {
              setDisadvantage(e.target.checked);
              if (e.target.checked) setAdvantage(false);
            }}
          />
          desvantagem
        </label>
      </div>
    </div>
  );
}
