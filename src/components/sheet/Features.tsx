import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useIsMaster, useStore } from "@/lib/store";
import { EditableText } from "@/components/sheet/edit/EditControls";
import { groupFeatures } from "@/lib/features";
import { featFeature } from "@/lib/progression";
import { allFeats } from "@/data/featsCatalog";
import { OFFICIAL_RACE_TRAITS } from "@/data/racesCatalog";
import type { Feature } from "@/lib/types";

export function Features({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const editMode = useStore((s) => s.editMode);
  const isMaster = useIsMaster(id);
  const patchSheet = useStore((s) => s.patchSheet);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  if (!c) return null;
  if (c.sheet.features.length === 0 && !editMode) return null;

  const features = c.sheet.features;
  const updateFeature = (i: number, p: Partial<Feature>) =>
    void patchSheet(id, { features: features.map((f, idx) => (idx === i ? { ...f, ...p } : f)) });

  if (editMode && isMaster) {
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
          <div className="space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            {/* O que já existe no site entra pronto — o Mestre não precisa reescrever nada. */}
            <CatalogFeatureAdd features={features} onChange={(next) => void patchSheet(id, { features: next })} />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                void patchSheet(id, {
                  features: [
                    ...features,
                    { name: "Característica homebrew", source: "Mestre", description: "", origin: { kind: "custom", name: "Mestre" } },
                  ],
                })
              }
            >
              + Característica custom/homebrew
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  const groups = groupFeatures(c.sheet);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habilidades & Passivas</CardTitle>
        {editMode && !isMaster && <span className="text-[10px] text-zinc-500">automáticas pela progressão</span>}
      </CardHeader>
      <CardBody className="space-y-3">
        {groups.map((group) => (
          <section key={group.key}>
            <h4 className="mb-1 flex items-baseline justify-between border-b border-zinc-100 pb-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
              <span>{group.label}</span>
              <span className="font-normal">{group.features.length}</span>
            </h4>
            <div className="space-y-1">
              {group.features.map((f) => {
                const key = `${group.key}:${f.name}`;
                const isOpen = open[key] ?? false;
                return (
                  <div key={key} className="rounded border border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => setOpen((s) => ({ ...s, [key]: !isOpen }))}
                      className="flex w-full items-baseline justify-between gap-2 px-2 py-1.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <span className="flex items-center gap-1.5">
                        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        <span className="font-medium">{f.name}</span>
                      </span>
                      <span className="text-xs text-zinc-500">{f.source}</span>
                    </button>
                    {isOpen && (
                      <p className="whitespace-pre-wrap border-t border-zinc-100 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                        {f.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </CardBody>
    </Card>
  );
}

/**
 * Adiciona à ficha um talento ou traço racial que já existe no site (inclusive os
 * homebrew do Mestre), com nome e descrição prontos. Talento entra com origem de
 * talento, então também conta para especialização e perícias.
 */
function CatalogFeatureAdd({ features, onChange }: { features: Feature[]; onChange: (features: Feature[]) => void }) {
  const feats = allFeats();
  const [value, setValue] = useState("");

  const add = () => {
    const [kind, name] = value.split("::");
    if (!name) return;
    if (features.some((f) => f.name === name)) return;
    if (kind === "feat") {
      onChange([...features, { ...featFeature(name, "Mestre", 1), source: "Mestre: talento" }]);
      return;
    }
    const trait = OFFICIAL_RACE_TRAITS.find((entry) => entry.name === name);
    if (!trait) return;
    onChange([
      ...features,
      { name: trait.name, source: "Mestre: traço", description: trait.description, origin: { kind: "custom", name: "Mestre" } },
    ]);
  };

  return (
    <div className="flex gap-2">
      <select
        className="h-8 min-w-0 flex-1 rounded border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      >
        <option value="">— talento ou traço do site —</option>
        <optgroup label="Talentos">
          {feats.map((feat) => (
            <option key={`feat::${feat.name}`} value={`feat::${feat.name}`}>
              {feat.name}
              {feat.source === "Homebrew" ? " (homebrew)" : ""}
            </option>
          ))}
        </optgroup>
        <optgroup label="Traços raciais">
          {OFFICIAL_RACE_TRAITS.map((trait) => (
            <option key={`trait::${trait.name}`} value={`trait::${trait.name}`}>
              {trait.name}
            </option>
          ))}
        </optgroup>
      </select>
      <Button variant="outline" size="sm" disabled={!value} onClick={add}>
        Adicionar
      </Button>
    </div>
  );
}
