"use client";

import { useState } from "react";
import { Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStore, useUnlocked } from "@/lib/store";

export function PinLock({ id }: { id: string }) {
  const character = useStore((s) => s.characters[id]);
  const unlocked = useUnlocked(id);
  const unlock = useStore((s) => s.unlock);
  const lock = useStore((s) => s.lock);
  const patch = useStore((s) => s.patchCharacter);
  const [pinInput, setPinInput] = useState("");
  const [setting, setSetting] = useState(false);
  const [error, setError] = useState(false);

  if (!character) return null;

  if (unlocked) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-emerald-600 dark:text-emerald-400">
          <LockOpen className="inline h-3 w-3" /> editando
        </span>
        {character.pin && (
          <Button size="sm" variant="ghost" onClick={() => lock(id)}>
            travar
          </Button>
        )}
        {!character.pin && !setting && (
          <Button size="sm" variant="ghost" onClick={() => setSetting(true)}>
            definir PIN
          </Button>
        )}
        {setting && (
          <form
            className="flex items-center gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              if (pinInput.trim().length < 2) return;
              void patch(id, { pin: pinInput.trim() });
              setPinInput("");
              setSetting(false);
            }}
          >
            <Input
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="novo pin"
              className="h-7 w-24 text-xs"
            />
            <Button size="sm" type="submit">
              ok
            </Button>
            <Button size="sm" variant="ghost" type="button" onClick={() => setSetting(false)}>
              x
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <form
      className="flex items-center gap-1"
      onSubmit={(e) => {
        e.preventDefault();
        const ok = unlock(id, pinInput);
        if (!ok) {
          setError(true);
          setTimeout(() => setError(false), 1500);
        } else {
          setPinInput("");
        }
      }}
    >
      <Lock className="h-3 w-3 text-zinc-500" />
      <Input
        type="password"
        value={pinInput}
        onChange={(e) => setPinInput(e.target.value)}
        placeholder="pin"
        className={`h-7 w-24 text-xs ${error ? "border-red-500" : ""}`}
      />
      <Button size="sm" type="submit" variant="outline">
        destravar
      </Button>
    </form>
  );
}
