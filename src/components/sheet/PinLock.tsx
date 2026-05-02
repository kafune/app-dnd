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
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!character) return null;

  if (unlocked) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-emerald-600 dark:text-emerald-400">
          <LockOpen className="inline h-3 w-3" /> acesso liberado
        </span>
        <Button size="sm" variant="ghost" onClick={() => lock(id)}>
          travar
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex items-center gap-1"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const ok = await unlock(id, pinInput);
        setBusy(false);
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
      <Button size="sm" type="submit" variant="outline" disabled={busy}>
        {busy ? "…" : "destravar"}
      </Button>
    </form>
  );
}
