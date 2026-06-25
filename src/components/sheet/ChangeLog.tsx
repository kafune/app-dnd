"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import type { CharacterLogEntry } from "@/lib/types";

export function ChangeLog({ id }: { id: string }) {
  const pin = useStore((s) => s.pins[id]);
  const updatedAt = useStore((s) => s.characters[id]?.updatedAt);
  const [log, setLog] = useState<CharacterLogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .getCharacterLog(id, pin)
      .then(({ log }) => {
        if (active) setLog(log);
      })
      .catch(() => {
        if (active) setLog([]);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [id, pin, updatedAt]); // recarrega quando a ficha muda

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {/* o ícone é a função log() 😎 */}
            <span className="mr-1.5 rounded bg-zinc-200 px-1 font-mono text-[10px] text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
              log()
            </span>
            Modificações
          </CardTitle>
          <span className="text-[10px] text-zinc-500">{log.length}</span>
        </div>
      </CardHeader>
      <CardBody>
        {!loaded ? (
          <p className="text-xs text-zinc-500">Carregando…</p>
        ) : log.length === 0 ? (
          <p className="text-xs text-zinc-500">Nenhuma modificação registrada ainda.</p>
        ) : (
          <ul className="space-y-2">
            {log.map((e) => (
              <LogEntryRow key={e.id} entry={e} />
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

function LogEntryRow({ entry }: { entry: CharacterLogEntry }) {
  const when = new Date(entry.createdAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <li className="border-l-2 border-zinc-200 pl-2 text-xs dark:border-zinc-700">
      <div className="flex items-center gap-1.5 text-zinc-500">
        <span>{when}</span>
        {entry.by === "mestre" ? (
          <span className="rounded bg-amber-100 px-1 text-[10px] text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            Mestre
          </span>
        ) : (
          <span className="rounded bg-zinc-100 px-1 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            jogador
          </span>
        )}
      </div>
      <ul className="mt-0.5 text-zinc-700 dark:text-zinc-300">
        {entry.changes.map((c, i) => (
          <li key={i}>
            <span className="font-medium">{c.field}</span>
            {c.note ? (
              ` ${c.note}`
            ) : (
              <>
                : <span className="text-zinc-500">{c.from || "∅"}</span> →{" "}
                <span>{c.to || "∅"}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </li>
  );
}
