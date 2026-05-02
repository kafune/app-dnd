"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useStore } from "@/lib/store";

export function CharacterAccessGate({ id }: { id: string }) {
  const character = useStore((s) => s.characters[id]);
  const unlock = useStore((s) => s.unlock);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  if (!character) return null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-3 w-3" /> Mundo Pankleos
      </Link>
      <Card style={{ borderTopColor: character.color, borderTopWidth: 4 }}>
        <CardHeader>
          <CardTitle>
            <LockKeyhole className="mr-1 inline h-3.5 w-3.5" />
            Ficha Protegida
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              {character.playerName}
            </div>
            <h1 className="font-mono text-2xl font-bold">{character.characterName}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Digite o PIN deste personagem para abrir a ficha.
            </p>
          </div>

          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              const ok = await unlock(id, pin);
              setBusy(false);
              if (!ok) {
                setError(true);
                setTimeout(() => setError(false), 1500);
              }
            }}
          >
            <Input
              autoFocus
              inputMode="numeric"
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="PIN"
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-xs text-red-500">PIN inválido.</p>}
            <Button type="submit" className="w-full" disabled={busy || pin.trim().length === 0}>
              {busy ? "verificando..." : "acessar ficha"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}
