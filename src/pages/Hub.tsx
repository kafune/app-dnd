import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Bed, Coffee, KeyRound, Plus, RefreshCw, Skull, Sparkles, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MasterKeyForm } from "@/components/MasterKeyForm";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { RealtimeBadge } from "@/components/RealtimeBadge";
import { computeAc } from "@/lib/armor";
import { applyLongRest, applyShortRest } from "@/lib/rest";
import { orderedResources } from "@/components/sheet/Resources";
import {
  abilityMod,
  formatMod,
  inspirationResource,
  isInspiration,
  type Character,
  type Creature,
  type Resource,
} from "@/lib/types";

type Status = "loading" | "ready" | "locked" | "missing" | "error";

/** Foto do estado de uma ficha: é a comparação entre duas que vira aviso para o Mestre. */
type Vitals = {
  hp: number;
  temp: number;
  slots: Record<string, number>;
  resources: Record<string, number>;
};

type Alert = { id: string; at: number; who: string; text: string; tone: "up" | "down" };

function vitalsOf(c: Character): Vitals {
  return {
    hp: c.hpCurrent,
    temp: c.hpTemp,
    slots: Object.fromEntries(Object.entries(c.spellSlots).map(([lv, slot]) => [lv, slot.current])),
    resources: Object.fromEntries(c.resources.map((r) => [r.name, r.current])),
  };
}

/** Diferenças entre duas fotos, em frases curtas ("perdeu 7 PV", "gastou 1 espaço de 2º"). */
function diffVitals(before: Vitals, after: Vitals): { text: string; tone: "up" | "down" }[] {
  const out: { text: string; tone: "up" | "down" }[] = [];
  if (after.hp !== before.hp) {
    const delta = after.hp - before.hp;
    out.push({ text: delta < 0 ? `perdeu ${-delta} PV (${after.hp})` : `recuperou ${delta} PV (${after.hp})`, tone: delta < 0 ? "down" : "up" });
  }
  if (after.temp !== before.temp) {
    out.push({ text: `PV temporário: ${before.temp} → ${after.temp}`, tone: after.temp >= before.temp ? "up" : "down" });
  }
  for (const [level, value] of Object.entries(after.slots)) {
    const previous = before.slots[level];
    if (previous === undefined || previous === value) continue;
    const delta = value - previous;
    out.push({
      text: delta < 0 ? `gastou ${-delta} espaço(s) de ${level}º (restam ${value})` : `recuperou ${delta} espaço(s) de ${level}º`,
      tone: delta < 0 ? "down" : "up",
    });
  }
  for (const [name, value] of Object.entries(after.resources)) {
    const previous = before.resources[name];
    if (previous === undefined || previous === value) continue;
    const delta = value - previous;
    out.push({
      text: delta < 0 ? `usou ${-delta} de ${name} (restam ${value})` : `ganhou ${delta} de ${name} (${value})`,
      tone: delta < 0 ? "down" : "up",
    });
  }
  return out;
}

export default function Hub() {
  const { folderId = "" } = useParams<{ folderId: string }>();
  const masterPin = useStore((s) => s.masterPin);
  const loadHub = useStore((s) => s.loadHub);
  const closeHub = useStore((s) => s.closeHub);
  const hub = useStore((s) => s.hub);
  const folder = useStore((s) => s.folders[folderId]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!masterPin) {
      setStatus("locked");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    void loadHub(folderId).then((result) => {
      if (cancelled) return;
      setStatus(result === "ok" ? "ready" : result === "bad_pin" ? "locked" : result === "not_found" ? "missing" : "error");
    });
    return () => {
      cancelled = true;
    };
  }, [folderId, masterPin, loadHub]);

  useEffect(() => () => closeHub(), [closeHub]);

  const back = (
    <Link
      to={`/pasta/${folderId}`}
      className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
    >
      <ArrowLeft className="h-3 w-3" /> {folder?.name ?? "Pasta"}
    </Link>
  );

  if (status === "locked") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        {back}
        <Card>
          <CardHeader>
            <CardTitle>
              <KeyRound className="mr-1 inline h-3.5 w-3.5" /> Hub do Mestre
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-zinc-500">
              Digite a chave mestra para ver a vida, a CA, os espaços de magia e os recursos de toda a mesa.
            </p>
            <MasterKeyForm autoFocus />
          </CardBody>
        </Card>
      </main>
    );
  }

  if (status !== "ready" || !hub || hub.folderId !== folderId) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        {back}
        <p className="text-zinc-500">
          {status === "loading"
            ? "Carregando…"
            : status === "missing"
              ? "Pasta não encontrada (talvez tenha sido apagada)."
              : "Sem conexão com o servidor. Tente de novo em instantes."}
        </p>
      </main>
    );
  }

  return <HubView folderId={folderId} folderName={folder?.name ?? folderId} />;
}

function HubView({ folderId, folderName }: { folderId: string; folderName: string }) {
  const hub = useStore((s) => s.hub);
  const loadHub = useStore((s) => s.loadHub);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const previous = useRef<Record<string, Vitals>>({});

  const characters = useMemo(
    () => [...(hub?.characters ?? [])].sort((a, b) => a.characterName.localeCompare(b.characterName, "pt-BR")),
    [hub],
  );

  // Compara cada atualização com a foto anterior e vira o mural de avisos do Mestre.
  useEffect(() => {
    const fresh: Alert[] = [];
    for (const character of characters) {
      const now = vitalsOf(character);
      const before = previous.current[character.id];
      previous.current[character.id] = now;
      if (!before) continue;
      for (const change of diffVitals(before, now)) {
        fresh.push({
          id: `${character.id}:${Date.now()}:${change.text}`,
          at: Date.now(),
          who: character.characterName,
          text: change.text,
          tone: change.tone,
        });
      }
    }
    if (fresh.length) setAlerts((list) => [...fresh, ...list].slice(0, 40));
  }, [characters]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link to={`/pasta/${folderId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-3 w-3" /> <span className="max-w-[12rem] truncate">{folderName}</span>
          </Button>
        </Link>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => void loadHub(folderId)}>
          <RefreshCw className="h-3 w-3" /> Atualizar
        </Button>
      </div>

      <header className="mb-6">
        <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">Hub do Mestre</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {folderName} · {characters.length === 1 ? "1 ficha" : `${characters.length} fichas`}
        </p>
        <RealtimeBadge className="mt-2" />
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {characters.length === 0 && <p className="text-sm text-zinc-500">Nenhuma ficha nesta pasta ainda.</p>}
          {characters.map((character) => (
            <PartyRow key={character.id} character={character} />
          ))}
          <Creatures folderId={folderId} creatures={hub?.creatures ?? []} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:h-fit">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Avisos da mesa</CardTitle>
                {alerts.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setAlerts([])}>
                    limpar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              {alerts.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  Quando alguém perder vida, gastar um espaço de magia ou usar um recurso, aparece aqui.
                </p>
              ) : (
                <ul className="max-h-96 space-y-1 overflow-y-auto pr-1">
                  {alerts.map((alert) => (
                    <li
                      key={alert.id}
                      className={`rounded border px-2 py-1 text-xs ${
                        alert.tone === "down"
                          ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                          : "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                      }`}
                    >
                      <strong>{alert.who}</strong> {alert.text}
                      <span className="ml-1 text-[10px] text-zinc-500">
                        {new Date(alert.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>
    </main>
  );
}

/** Uma ficha no hub: descansos, vida, CA, iniciativa, espaços e recursos. */
function PartyRow({ character }: { character: Character }) {
  const masterPatch = useStore((s) => s.masterPatch);
  const pushToast = useStore((s) => s.pushToast);
  const [damage, setDamage] = useState("");

  const ac = computeAc(character.sheet);
  const initiative = character.sheet.initiativeBonus || abilityMod(character.sheet.abilityScores.dex);
  const slots = Object.keys(character.spellSlots).sort();
  const resources = orderedResources(character.resources);
  const inspiration = resources.find(isInspiration);
  const hpPct = character.hpMax > 0 ? Math.max(0, Math.min(100, (character.hpCurrent / character.hpMax) * 100)) : 0;

  const grantInspiration = () => {
    const current = character.resources.find(isInspiration);
    const next = current
      ? character.resources.map((r) => (isInspiration(r) ? { ...r, current: r.current + 1 } : r))
      : [inspirationResource(1), ...character.resources];
    void masterPatch(character.id, { resources: next }).then((ok) => {
      if (ok) pushToast({ title: `Inspiração para ${character.characterName}`, tone: "success" });
    });
  };

  const spendInspiration = () => {
    if (!inspiration || inspiration.current <= 0) return;
    void masterPatch(character.id, {
      resources: character.resources.map((r) => (isInspiration(r) ? { ...r, current: Math.max(0, r.current - 1) } : r)),
    });
  };

  const rest = (kind: "short" | "long") => {
    const patch = kind === "short" ? applyShortRest(character) : applyLongRest(character);
    void masterPatch(character.id, patch).then((ok) => {
      if (ok) {
        pushToast({
          title: `${character.characterName}: descanso ${kind === "short" ? "curto" : "longo"}`,
          tone: "success",
        });
      }
    });
  };

  const applyHp = (sign: 1 | -1) => {
    const n = Number(damage);
    if (!Number.isFinite(n) || n <= 0) return;
    const next = sign < 0 ? Math.max(0, character.hpCurrent - n) : Math.min(character.hpMax, character.hpCurrent + n);
    void masterPatch(character.id, { hpCurrent: next });
    setDamage("");
  };

  return (
    <Card style={{ borderTopColor: character.color, borderTopWidth: 3 }}>
      <CardBody className="space-y-3">
        {/* Descansos ficam em cima do nome: o Mestre descansa cada um individualmente. */}
        <div className="flex flex-wrap items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => rest("short")}>
            <Coffee className="h-3 w-3" /> Curto
          </Button>
          <Button variant="outline" size="sm" onClick={() => rest("long")}>
            <Bed className="h-3 w-3" /> Longo
          </Button>
          <Button variant="success" size="sm" className="ml-auto" onClick={grantInspiration}>
            <Sparkles className="h-3 w-3" /> Dar inspiração
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <CharacterAvatar character={character} size={48} />
          <div className="min-w-0 flex-1">
            <Link to={`/personagem/${character.id}`} className="break-words font-mono text-lg font-bold hover:underline">
              {character.characterName}
            </Link>
            <div className="text-xs text-zinc-500">
              {character.playerName} ·{" "}
              {character.sheet.classes.map((k) => `${k.name} ${k.level}`).join(" / ") || "sem classe"}
            </div>
          </div>
          <div className="grid shrink-0 grid-cols-3 gap-2 text-center">
            <Mini label="CA" value={ac.total} />
            <Mini label="Inic." value={formatMod(initiative)} />
            <Mini
              label="Insp."
              value={inspiration?.current ?? 0}
              onClick={inspiration && inspiration.current > 0 ? spendInspiration : undefined}
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-wide text-zinc-500">Pontos de vida</span>
            <span className="font-mono text-sm">
              <strong>{character.hpCurrent}</strong>
              <span className="text-zinc-400">/{character.hpMax}</span>
              {character.hpTemp > 0 && <span className="ml-1 text-blue-500">+{character.hpTemp}</span>}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className={`h-full transition-all ${hpPct > 60 ? "bg-emerald-500" : hpPct > 30 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <div className="mt-1 flex gap-1">
            <Input
              inputMode="numeric"
              placeholder="qtd"
              value={damage}
              onChange={(event) => setDamage(event.target.value)}
              className="h-7 w-20 text-xs"
            />
            <Button size="sm" variant="danger" onClick={() => applyHp(-1)}>
              dano
            </Button>
            <Button size="sm" variant="success" onClick={() => applyHp(1)}>
              cura
            </Button>
          </div>
        </div>

        {slots.length > 0 && (
          <div className="text-xs">
            <div className="mb-0.5 uppercase tracking-wide text-zinc-500">Espaços de magia</div>
            <div className="flex flex-wrap gap-1.5">
              {slots.map((level) => {
                const slot = character.spellSlots[level];
                return (
                  <span
                    key={level}
                    className={`rounded border px-1.5 py-0.5 font-mono ${
                      slot.current === 0
                        ? "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                        : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {level}º {slot.current}/{slot.max}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {resources.length > 0 && (
          <div className="text-xs">
            <div className="mb-0.5 uppercase tracking-wide text-zinc-500">Recursos</div>
            <div className="flex flex-wrap gap-1.5">
              {resources.map((resource) => (
                <ResourceChip key={resource.name} resource={resource} />
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function ResourceChip({ resource }: { resource: Resource }) {
  const empty = resource.current === 0 && (resource.kind !== "moeda" || resource.max > 0);
  return (
    <span
      className={`rounded border px-1.5 py-0.5 ${
        empty
          ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {resource.name}{" "}
      <strong className="font-mono">
        {resource.current}
        {resource.kind === "moeda" && resource.max <= 0 ? "" : `/${resource.max}`}
      </strong>
    </span>
  );
}

function Mini({ label, value, onClick }: { label: string; value: string | number; onClick?: () => void }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      title={onClick ? "Gastar uma inspiração" : undefined}
      className={`rounded-lg border border-zinc-200 px-2 py-1 dark:border-zinc-800 ${
        onClick ? "hover:bg-zinc-100 dark:hover:bg-zinc-800" : ""
      }`}
    >
      <div className="text-[9px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="font-mono text-base font-bold">{value}</div>
    </Comp>
  );
}

/** Mobs da cena: nome, PV e CA. Ao chegar a 0 PV a criatura sai da lista sozinha. */
function Creatures({ folderId, creatures }: { folderId: string; creatures: Creature[] }) {
  const addCreature = useStore((s) => s.addCreature);
  const patchCreature = useStore((s) => s.patchCreature);
  const removeCreature = useStore((s) => s.removeCreature);
  const pushToast = useStore((s) => s.pushToast);
  const [name, setName] = useState("");
  const [hp, setHp] = useState("");
  const [ac, setAc] = useState("");
  const [deltas, setDeltas] = useState<Record<string, string>>({});

  const add = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const ok = await addCreature(folderId, {
      name: trimmed,
      hpMax: Math.max(1, Number(hp) || 1),
      ac: Math.max(0, Number(ac) || 10),
    });
    if (ok) {
      setName("");
      setHp("");
      setAc("");
    }
  };

  const hit = (creature: Creature, sign: 1 | -1) => {
    const n = Number(deltas[creature.id]);
    if (!Number.isFinite(n) || n <= 0) return;
    const next = Math.max(0, Math.min(creature.hpMax, creature.hpCurrent + sign * n));
    setDeltas((state) => ({ ...state, [creature.id]: "" }));
    void patchCreature(folderId, creature.id, { hpCurrent: next }).then(() => {
      if (next === 0) pushToast({ title: `${creature.name} caiu e saiu do hub.`, tone: "success" });
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle>
            <Skull className="mr-1 inline h-3.5 w-3.5" /> Criaturas da cena
          </CardTitle>
          <span className="text-[10px] text-zinc-500">{creatures.length}</span>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {creatures.length === 0 && (
          <p className="text-xs text-zinc-500">
            Nenhuma criatura na mesa. Anote nome, PV e CA para acompanhar a vida dos seus mobs — em 0 PV a criatura some sozinha.
          </p>
        )}

        {creatures.map((creature) => {
          const pct = creature.hpMax > 0 ? Math.max(0, (creature.hpCurrent / creature.hpMax) * 100) : 0;
          return (
            <div key={creature.id} className="space-y-1 rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="min-w-0 flex-1 break-words text-sm">{creature.name}</strong>
                <span className="font-mono text-xs text-zinc-500">CA {creature.ac}</span>
                <span className="font-mono text-sm">
                  <strong>{creature.hpCurrent}</strong>
                  <span className="text-zinc-400">/{creature.hpMax}</span>
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover ${creature.name}`}
                  onClick={() => void removeCreature(folderId, creature.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className={`h-full transition-all ${pct > 60 ? "bg-emerald-500" : pct > 30 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex gap-1">
                <Input
                  inputMode="numeric"
                  placeholder="qtd"
                  value={deltas[creature.id] ?? ""}
                  onChange={(event) => setDeltas((state) => ({ ...state, [creature.id]: event.target.value }))}
                  className="h-7 w-20 text-xs"
                />
                <Button size="sm" variant="danger" onClick={() => hit(creature, -1)}>
                  dano
                </Button>
                <Button size="sm" variant="success" onClick={() => hit(creature, 1)}>
                  cura
                </Button>
              </div>
            </div>
          );
        })}

        <form
          className="flex flex-wrap gap-1 border-t border-zinc-100 pt-3 dark:border-zinc-800"
          onSubmit={(event) => {
            event.preventDefault();
            void add();
          }}
        >
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome (ex: Goblin 1)"
            className="h-8 min-w-0 flex-1 text-xs"
          />
          <Input
            inputMode="numeric"
            value={hp}
            onChange={(event) => setHp(event.target.value)}
            placeholder="PV"
            className="h-8 w-16 text-xs"
          />
          <Input
            inputMode="numeric"
            value={ac}
            onChange={(event) => setAc(event.target.value)}
            placeholder="CA"
            className="h-8 w-16 text-xs"
          />
          <Button type="submit" size="sm" disabled={!name.trim()}>
            <Plus className="h-3 w-3" /> Adicionar
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
