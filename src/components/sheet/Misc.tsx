"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import { EditableText, EditableNumber } from "@/components/sheet/edit/EditControls";
import type { Item } from "@/lib/types";

const splitList = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

export function ProficienciesAndLanguages({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const editMode = useStore((s) => s.editMode);
  const patchSheet = useStore((s) => s.patchSheet);
  if (!c) return null;
  if (editMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proficiências & Idiomas</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2 text-sm">
          <label className="block text-xs text-zinc-500">
            Idiomas (vírgula)
            <EditableText
              value={c.sheet.languages.join(", ")}
              onSave={(v) => void patchSheet(id, { languages: splitList(v) })}
            />
          </label>
          <label className="block text-xs text-zinc-500">
            Proficiências (vírgula)
            <EditableText
              value={c.sheet.proficiencies.join(", ")}
              onSave={(v) => void patchSheet(id, { proficiencies: splitList(v) })}
            />
          </label>
        </CardBody>
      </Card>
    );
  }
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
  const editMode = useStore((s) => s.editMode);
  const patchSheet = useStore((s) => s.patchSheet);
  if (!c) return null;
  const inv = c.sheet.inventory;
  const setInv = (partial: Partial<typeof inv>) =>
    void patchSheet(id, { inventory: { ...inv, ...partial } });
  const setCoin = (k: "gp" | "sp" | "cp", v: number) =>
    setInv({ coins: { ...inv.coins, [k]: v } });
  const updateItem = (i: number, p: Partial<Item>) =>
    setInv({ items: inv.items.map((it, idx) => (idx === i ? { ...it, ...p } : it)) });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventário</CardTitle>
      </CardHeader>
      <CardBody className="space-y-2 text-sm">
        {editMode ? (
          <>
            <div className="flex items-center gap-1 text-xs">
              <EditableNumber value={inv.coins.gp} min={0} onSave={(v) => setCoin("gp", v)} className="h-7 w-16" /> po
              <EditableNumber value={inv.coins.sp} min={0} onSave={(v) => setCoin("sp", v)} className="h-7 w-16" /> pp
              <EditableNumber value={inv.coins.cp} min={0} onSave={(v) => setCoin("cp", v)} className="h-7 w-16" /> pc
            </div>
            {inv.items.map((it, i) => (
              <div key={i} className="flex items-center gap-1">
                <EditableText value={it.name} onSave={(v) => updateItem(i, { name: v })} placeholder="item" className="w-40" />
                <EditableText
                  value={it.description ?? ""}
                  onSave={(v) => updateItem(i, { description: v || undefined })}
                  placeholder="descrição"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remover item"
                  onClick={() => setInv({ items: inv.items.filter((_, idx) => idx !== i) })}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInv({ items: [...inv.items, { name: "Item", quantity: 1 }] })}
            >
              + Item
            </Button>
          </>
        ) : (
          <>
            <div className="font-mono text-xs text-zinc-500">
              {inv.coins.gp} po · {inv.coins.sp} pp · {inv.coins.cp} pc
            </div>
            <ul className="space-y-1">
              {inv.items.map((it, i) => (
                <li key={i} className="text-sm">
                  <strong className="text-zinc-900 dark:text-zinc-100">{it.name}</strong>
                  {it.description && (
                    <span className="ml-1 text-xs text-zinc-500">— {it.description}</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </CardBody>
    </Card>
  );
}

export function Personality({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const editMode = useStore((s) => s.editMode);
  const patchSheet = useStore((s) => s.patchSheet);
  if (!c) return null;
  const p = c.sheet.personality;
  const ap = c.sheet.appearance;
  const blocks: [string, string][] = [
    ["Personalidade", p.trait],
    ["Ideal", p.ideal],
    ["Defeito", p.flaw],
    ["Por que estou aqui", p.why],
    ["Backstory", p.backstory],
  ];
  const persKeys: [string, keyof typeof p][] = [
    ["Personalidade", "trait"],
    ["Ideal", "ideal"],
    ["Defeito", "flaw"],
    ["Por que estou aqui", "why"],
    ["Backstory", "backstory"],
  ];

  if (editMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aparência & História</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2 text-sm">
          <div className="flex gap-1">
            <EditableText value={ap.size} onSave={(v) => void patchSheet(id, { appearance: { ...ap, size: v } })} placeholder="tamanho" className="w-28" />
            <EditableText value={ap.height} onSave={(v) => void patchSheet(id, { appearance: { ...ap, height: v } })} placeholder="altura" className="w-28" />
          </div>
          <EditableText value={ap.description ?? ""} onSave={(v) => void patchSheet(id, { appearance: { ...ap, description: v || undefined } })} placeholder="aparência" multiline />
          {persKeys.map(([label, key]) => (
            <label key={key} className="block text-xs text-zinc-500">
              {label}
              <EditableText
                value={p[key]}
                onSave={(v) => void patchSheet(id, { personality: { ...p, [key]: v } })}
                multiline={key === "backstory" || key === "why"}
              />
            </label>
          ))}
        </CardBody>
      </Card>
    );
  }
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
