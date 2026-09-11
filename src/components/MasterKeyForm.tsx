import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/** Pede a chave mestra. Validada, a store guarda o `masterPin` e quem depende dele re-renderiza. */
export function MasterKeyForm({ autoFocus = false }: { autoFocus?: boolean }) {
  const unlockMaster = useStore((s) => s.unlockMaster);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        const ok = await unlockMaster(pin);
        setBusy(false);
        if (!ok) setError(true);
      }}
    >
      <Input
        autoFocus={autoFocus}
        type="password"
        inputMode="numeric"
        value={pin}
        onChange={(event) => {
          setPin(event.target.value);
          setError(false);
        }}
        placeholder="Chave mestra"
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-xs text-red-500">Chave mestra inválida.</p>}
      <Button type="submit" className="w-full" disabled={busy || !pin.trim()}>
        {busy ? "verificando…" : "entrar"}
      </Button>
    </form>
  );
}
