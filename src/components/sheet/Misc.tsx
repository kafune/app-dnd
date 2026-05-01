"use client";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore } from "@/lib/store";

export function ProficienciesAndLanguages({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  if (!c) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proficiências & Idiomas</CardTitle>
      </CardHeader>
      <CardBody className="space-y-2 text-sm">
        <div>
          <div className="text-xs uppercase text-zinc-500">Idiomas</div>
          <p>{c.sheet.languages.join(", ")}</p>
        </div>
        <div>
          <div className="text-xs uppercase text-zinc-500">Proficiências</div>
          <p className="text-zinc-700 dark:text-zinc-300">
            {c.sheet.proficiencies.join(", ")}
          </p>
        </div>
        <div className="text-xs text-zinc-500">
          Bônus de proficiência: <strong>+{c.sheet.proficiencyBonus}</strong>
        </div>
      </CardBody>
    </Card>
  );
}

export function Inventory({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  if (!c) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventário</CardTitle>
      </CardHeader>
      <CardBody className="space-y-2 text-sm">
        <div className="font-mono text-xs text-zinc-500">
          {c.sheet.inventory.coins.gp} po · {c.sheet.inventory.coins.sp} pp ·{" "}
          {c.sheet.inventory.coins.cp} pc
        </div>
        <ul className="space-y-1">
          {c.sheet.inventory.items.map((it) => (
            <li key={it.name} className="text-sm">
              <strong className="text-zinc-900 dark:text-zinc-100">{it.name}</strong>
              {it.description && (
                <span className="ml-1 text-xs text-zinc-500">— {it.description}</span>
              )}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

export function Personality({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  if (!c) return null;
  const p = c.sheet.personality;
  const blocks: [string, string][] = [
    ["Personalidade", p.trait],
    ["Ideal", p.ideal],
    ["Defeito", p.flaw],
    ["Por que estou aqui", p.why],
    ["Backstory", p.backstory],
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência & História</CardTitle>
      </CardHeader>
      <CardBody className="space-y-2 text-sm">
        <div className="text-xs text-zinc-500">
          {c.sheet.appearance.size} · {c.sheet.appearance.height}
        </div>
        {c.sheet.appearance.description && (
          <p className="text-zinc-700 dark:text-zinc-300">
            {c.sheet.appearance.description}
          </p>
        )}
        {blocks.map(([k, v]) =>
          v && v !== "—" ? (
            <div key={k}>
              <div className="text-xs uppercase text-zinc-500">{k}</div>
              <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{v}</p>
            </div>
          ) : null,
        )}
      </CardBody>
    </Card>
  );
}
