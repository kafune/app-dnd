"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import { EditableText } from "@/components/sheet/edit/EditControls";
import type { Feature } from "@/lib/types";

export function Features({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const editMode = useStore((s) => s.editMode);
  const patchSheet = useStore((s) => s.patchSheet);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  if (!c) return null;
  if (c.sheet.features.length === 0 && !editMode) return null;

  const features = c.sheet.features;
  const updateFeature = (i: number, p: Partial<Feature>) =>
    void patchSheet(id, { features: features.map((f, idx) => (idx === i ? { ...f, ...p } : f)) });

  if (editMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Habilidades, Passivas & Talentos</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2">
          {features.map((f, i) => (
            <div key={i} className="space-y-1 rounded border border-zinc-200 p-2 dark:border-zinc-800">
              <div className="flex items-center gap-1">
                <EditableText value={f.name} onSave={(v) => updateFeature(i, { name: v })} placeholder="nome" className="flex-1" />
                <EditableText value={f.source} onSave={(v) => updateFeature(i, { source: v })} placeholder="origem" className="w-28" />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remover característica"
                  onClick={() => void patchSheet(id, { features: features.filter((_, idx) => idx !== i) })}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <EditableText value={f.description} onSave={(v) => updateFeature(i, { description: v })} placeholder="descrição" multiline />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void patchSheet(id, { features: [...features, { name: "Característica", source: "", description: "" }] })}
          >
            + Característica
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habilidades & Passivas</CardTitle>
      </CardHeader>
      <CardBody className="space-y-1">
        {c.sheet.features.map((f) => {
          const isOpen = open[f.name] ?? false;
          return (
            <div key={f.name} className="rounded border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setOpen((s) => ({ ...s, [f.name]: !isOpen }))}
                className="flex w-full items-baseline justify-between gap-2 px-2 py-1.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <span className="flex items-center gap-1.5">
                  {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <span className="font-medium">{f.name}</span>
                </span>
                <span className="text-xs text-zinc-500">{f.source}</span>
              </button>
              {isOpen && (
                <p className="border-t border-zinc-100 px-3 py-2 text-xs whitespace-pre-wrap text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                  {f.description}
                </p>
              )}
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
