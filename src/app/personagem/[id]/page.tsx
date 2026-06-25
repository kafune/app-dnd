"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HpTracker } from "@/components/sheet/HpTracker";
import { Abilities } from "@/components/sheet/Abilities";
import { Skills } from "@/components/sheet/Skills";
import { SpellSlots } from "@/components/sheet/SpellSlots";
import { Resources } from "@/components/sheet/Resources";
import { RestButtons } from "@/components/sheet/RestButtons";
import { Combat } from "@/components/sheet/Combat";
import { Spells } from "@/components/sheet/Spells";
import { Features } from "@/components/sheet/Features";
import { Notes } from "@/components/sheet/Notes";
import { CharacterAccessGate } from "@/components/sheet/CharacterAccessGate";
import {
  ProficienciesAndLanguages,
  Inventory,
  Personality,
} from "@/components/sheet/Misc";
import { PinLock } from "@/components/sheet/PinLock";
import { DiceRoller } from "@/components/dice/DiceRoller";
import { RollHistory } from "@/components/dice/RollHistory";
import { ChangeLog } from "@/components/sheet/ChangeLog";
import { useUnlocked } from "@/lib/store";

export default function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const character = useStore((s) => s.characters[id]);
  const unlocked = useUnlocked(id);

  if (!character) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-3 w-3" /> Voltar
        </Link>
        <p className="mt-6 text-zinc-500">Personagem não encontrado.</p>
      </main>
    );
  }

  if (!unlocked) {
    return <CharacterAccessGate id={id} />;
  }

  const cls = character.sheet.classes
    .map((k) => `${k.name}${k.subclass ? ` (${k.subclass})` : ""} ${k.level}`)
    .join(" / ");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-3 w-3" /> Mesa
          </Button>
        </Link>
        <PinLock id={id} />
      </div>

      <header
        className="mb-6 rounded-xl border-l-4 bg-white p-4 shadow-sm dark:bg-zinc-900"
        style={{ borderLeftColor: character.color }}
      >
        <div className="text-xs uppercase tracking-wider text-zinc-500">
          {character.playerName}
        </div>
        <h1 className="font-mono text-3xl font-bold">{character.characterName}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {character.sheet.species} · {cls} · {character.sheet.background}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <HpTracker id={id} />
          <Abilities id={id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SpellSlots id={id} />
            <Resources id={id} />
          </div>
          <RestButtons id={id} />
          <Combat id={id} />
          <Skills id={id} />
          <Spells id={id} />
          <Features id={id} />
          <Notes id={id} />
          <ProficienciesAndLanguages id={id} />
          <Inventory id={id} />
          <Personality id={id} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:h-fit">
          <Card>
            <CardHeader>
              <CardTitle>Rolar Dados</CardTitle>
            </CardHeader>
            <CardBody>
              <DiceRoller characterId={id} characterName={character.characterName} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Histórico</CardTitle>
                <span className="text-[10px] text-zinc-500">esta ficha</span>
              </div>
            </CardHeader>
            <CardBody>
              <RollHistory characterId={id} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mesa</CardTitle>
                <span className="text-[10px] text-zinc-500">todos</span>
              </div>
            </CardHeader>
            <CardBody>
              <RollHistory />
            </CardBody>
          </Card>

          <ChangeLog id={id} />
        </aside>
      </div>
    </main>
  );
}
