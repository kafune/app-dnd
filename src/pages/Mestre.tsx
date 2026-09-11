import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Crown, LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MasterKeyForm } from "@/components/MasterKeyForm";
import { Field, selectCls, textareaCls } from "@/components/create/common";
import { OFFICIAL_RACE_TRAITS, RACES_CATALOG } from "@/data/racesCatalog";
import { FEATS_CATALOG } from "@/data/featsCatalog";
import { ALL_SKILL_NAMES } from "@/lib/skillChoice";
import { cn } from "@/lib/cn";
import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  type AbilityKey,
  type AbilityScoreIncrease,
  type CreatureSize,
  type FeatureResource,
  type HomebrewFeatData,
  type HomebrewItem,
  type HomebrewRaceData,
  type HomebrewSubraceData,
  type HomebrewTraitData,
  type SkillName,
} from "@/lib/types";

type Tab = HomebrewItem["kind"];

const TABS: { kind: Tab; label: string; singular: string }[] = [
  { kind: "race", label: "Raças", singular: "raça" },
  { kind: "feat", label: "Talentos", singular: "talento" },
  { kind: "trait", label: "Traços raciais", singular: "traço racial" },
];

function norm(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

const splitLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const splitCommas = (value: string) =>
  value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

function asiText(asi: AbilityScoreIncrease): string {
  const parts = ABILITY_ORDER.filter((key) => asi[key]).map(
    (key) => `${ABILITY_LABELS[key].slice(0, 3)} ${asi[key]! > 0 ? "+" : ""}${asi[key]}`,
  );
  if (asi.choose?.count) parts.push(`${asi.choose.count} ponto(s) à escolha`);
  return parts.join(", ") || "sem bônus de atributo";
}

export default function Mestre() {
  const masterPin = useStore((s) => s.masterPin);
  return masterPin ? <HomebrewManager /> : <MasterLogin />;
}

function MasterLogin() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
        <ArrowLeft className="h-3 w-3" /> Fichas DnD
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>
            <Crown className="mr-1 inline h-3.5 w-3.5" /> Área do Mestre
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Crie raças, talentos e traços raciais homebrew. Eles aparecem para todos os jogadores na criação de ficha, marcados
            como homebrew. A mesma chave cria e edita as pastas na página inicial.
          </p>
          <MasterKeyForm autoFocus />
        </CardBody>
      </Card>
    </main>
  );
}

function HomebrewManager() {
  const homebrew = useStore((s) => s.homebrew);
  const lockMaster = useStore((s) => s.lockMaster);
  const deleteHomebrew = useStore((s) => s.deleteHomebrew);
  const pushToast = useStore((s) => s.pushToast);
  const [tab, setTab] = useState<Tab>("race");
  const [editing, setEditing] = useState<{ kind: Tab; item?: HomebrewItem } | null>(null);
  const [toDelete, setToDelete] = useState<HomebrewItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const items = homebrew.filter((item) => item.kind === tab);
  const current = TABS.find((entry) => entry.kind === tab)!;

  const racesUsingTrait = (name: string) =>
    homebrew
      .filter(
        (item): item is Extract<HomebrewItem, { kind: "race" }> =>
          item.kind === "race" &&
          (item.data.traitNames.some((trait) => norm(trait) === norm(name)) ||
            item.data.subraces.some((subrace) => subrace.traitNames.some((trait) => norm(trait) === norm(name)))),
      )
      .map((item) => item.data.name);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const ok = await deleteHomebrew(toDelete.id);
    setDeleting(false);
    if (ok) pushToast({ title: `${toDelete.data.name} apagado`, tone: "success" });
    setToDelete(null);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-3 w-3" /> Fichas DnD
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={lockMaster}>
          <LogOut className="h-3 w-3" /> sair da área do Mestre
        </Button>
      </div>
      <h1 className="font-mono text-2xl font-bold tracking-tight">
        <Crown className="mr-1 inline h-5 w-5" /> Homebrew do Mestre
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        O que você criar aqui aparece para os jogadores na criação de ficha. Fichas já criadas guardam uma cópia dos traços e
        não mudam quando você edita.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((entry) => (
          <button
            key={entry.kind}
            type="button"
            onClick={() => {
              setTab(entry.kind);
              setEditing(null);
            }}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm",
              tab === entry.kind
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
            )}
          >
            {entry.label} <span className="opacity-70">({homebrew.filter((item) => item.kind === entry.kind).length})</span>
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {editing ? (
          <>
            {editing.kind === "race" && (
              <RaceForm initial={editing.item?.kind === "race" ? editing.item : undefined} onDone={() => setEditing(null)} />
            )}
            {editing.kind === "feat" && (
              <FeatForm initial={editing.item?.kind === "feat" ? editing.item : undefined} onDone={() => setEditing(null)} />
            )}
            {editing.kind === "trait" && (
              <Card>
                <CardHeader>
                  <CardTitle>{editing.item ? `Editar ${editing.item.data.name}` : "Novo traço racial"}</CardTitle>
                </CardHeader>
                <CardBody>
                  <TraitForm initial={editing.item?.kind === "trait" ? editing.item : undefined} onDone={() => setEditing(null)} />
                </CardBody>
              </Card>
            )}
          </>
        ) : (
          <Button variant="success" onClick={() => setEditing({ kind: tab })}>
            <Plus className="h-4 w-4" /> Nov{tab === "feat" ? "o" : tab === "trait" ? "o" : "a"} {current.singular}
          </Button>
        )}

        {items.length === 0 && !editing && (
          <p className="text-sm text-zinc-500">Nenhum{tab === "race" ? "a" : ""} {current.singular} homebrew ainda.</p>
        )}

        {items.map((item) => (
          <Card key={item.id}>
            <CardBody className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium">{item.data.name}</div>
                <p className="mt-0.5 text-xs text-zinc-500">{itemSummary(item, racesUsingTrait)}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setEditing({ kind: item.kind, item })}>
                  <Pencil className="h-3 w-3" /> editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setToDelete(item)} aria-label={`Apagar ${item.data.name}`}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title={`Apagar ${toDelete?.data.name ?? ""}?`}
        description={
          toDelete?.kind === "trait" && racesUsingTrait(toDelete.data.name).length > 0
            ? `Este traço é usado por: ${racesUsingTrait(toDelete.data.name).join(", ")}. Essas raças vão mostrar o traço como não encontrado. Fichas já criadas não mudam.`
            : "Some da criação de ficha para todos. Fichas já criadas não mudam."
        }
        confirmLabel="Apagar"
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </main>
  );
}

function itemSummary(item: HomebrewItem, racesUsingTrait: (name: string) => string[]): string {
  if (item.kind === "race") {
    const data = item.data;
    return [
      data.sizeOptions?.length === 2 ? "Pequeno ou Médio" : data.size,
      `${data.speed} m`,
      asiText(data.abilityScoreIncrease),
      `${data.traitNames.length} traço(s)`,
      data.subraces.length ? `${data.subraces.length} sub-raça(s)` : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }
  if (item.kind === "feat") {
    const data = item.data;
    return [
      data.prerequisite ? `pré-requisito: ${data.prerequisite}` : "",
      data.abilityIncrease
        ? `+${data.abilityIncrease.amount} em ${data.abilityIncrease.choose.map((key) => ABILITY_LABELS[key].slice(0, 3)).join("/")}`
        : "",
      data.description.slice(0, 120) + (data.description.length > 120 ? "…" : ""),
    ]
      .filter(Boolean)
      .join(" · ");
  }
  const used = racesUsingTrait(item.data.name);
  return [
    item.data.description.slice(0, 140) + (item.data.description.length > 140 ? "…" : ""),
    used.length ? `usado em: ${used.join(", ")}` : "não usado por nenhuma raça",
  ].join(" · ");
}

// ---------------------------------------------------------------------------
// Formulários
// ---------------------------------------------------------------------------

function SkillCheckboxes({ value, onChange }: { value: SkillName[]; onChange: (next: SkillName[]) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
      {ALL_SKILL_NAMES.map((skill) => (
        <label key={skill} className="flex items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={value.includes(skill)}
            onChange={() => onChange(value.includes(skill) ? value.filter((entry) => entry !== skill) : [...value, skill])}
          />
          {skill}
        </label>
      ))}
    </div>
  );
}

function FormActions({ busy, error, onCancel, onSave, label = "Salvar" }: { busy: boolean; error: string | null; onCancel: () => void; onSave: () => void; label?: string }) {
  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          Cancelar
        </Button>
        <Button type="button" variant="success" onClick={onSave} disabled={busy}>
          {busy ? "Salvando…" : label}
        </Button>
      </div>
    </div>
  );
}

type UsesMode = "none" | "fixed" | "prof" | "level";

function TraitForm({
  initial,
  onDone,
}: {
  initial?: { id: string; data: HomebrewTraitData };
  onDone: (saved?: HomebrewTraitData) => void;
}) {
  const saveHomebrew = useStore((s) => s.saveHomebrew);
  const homebrew = useStore((s) => s.homebrew);
  const pushToast = useStore((s) => s.pushToast);
  const start = initial?.data;
  const [name, setName] = useState(start?.name ?? "");
  const [description, setDescription] = useState(start?.description ?? "");
  const [skills, setSkills] = useState<SkillName[]>(start?.skills ?? []);
  const [skillChoices, setSkillChoices] = useState(start?.skillChoices ?? 0);
  const [skillChoiceFrom, setSkillChoiceFrom] = useState<SkillName[]>(start?.skillChoiceFrom ?? []);
  const [extraLanguages, setExtraLanguages] = useState(start?.extraLanguages ?? 0);
  const [proficiencies, setProficiencies] = useState((start?.proficiencies ?? []).join("\n"));
  const [spells, setSpells] = useState((start?.spells ?? []).join("\n"));
  const [usesMode, setUsesMode] = useState<UsesMode>(
    !start?.resource ? "none" : start.resource.max === "prof" ? "prof" : start.resource.max === "level" ? "level" : "fixed",
  );
  const [usesMax, setUsesMax] = useState(typeof start?.resource?.max === "number" ? start.resource.max : 1);
  const [recharge, setRecharge] = useState<FeatureResource["recharge"]>(start?.resource?.recharge ?? "long");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) return setError("Dê um nome ao traço.");
    if (!description.trim()) return setError("Descreva o que o traço faz.");
    const data: HomebrewTraitData = {
      name: trimmed,
      description: description.trim(),
      ...(skills.length ? { skills } : {}),
      ...(skillChoices > 0 ? { skillChoices, ...(skillChoiceFrom.length ? { skillChoiceFrom } : {}) } : {}),
      ...(extraLanguages > 0 ? { extraLanguages } : {}),
      ...(splitLines(proficiencies).length ? { proficiencies: splitLines(proficiencies) } : {}),
      ...(splitLines(spells).length ? { spells: splitLines(spells) } : {}),
      ...(usesMode !== "none"
        ? { resource: { max: usesMode === "fixed" ? Math.max(1, usesMax) : usesMode, recharge } }
        : {}),
    };
    setBusy(true);
    const result = await saveHomebrew("trait", data, initial?.id);
    if (!result.ok) {
      setBusy(false);
      return setError(result.error);
    }
    // Renomeou: atualiza as raças homebrew que referenciam o nome antigo.
    if (initial && norm(initial.data.name) !== norm(trimmed)) {
      const rename = (names: string[]) => names.map((entry) => (norm(entry) === norm(initial.data.name) ? trimmed : entry));
      for (const item of homebrew) {
        if (item.kind !== "race") continue;
        const uses =
          item.data.traitNames.some((entry) => norm(entry) === norm(initial.data.name)) ||
          item.data.subraces.some((subrace) => subrace.traitNames.some((entry) => norm(entry) === norm(initial.data.name)));
        if (!uses) continue;
        await saveHomebrew(
          "race",
          {
            ...item.data,
            traitNames: rename(item.data.traitNames),
            subraces: item.data.subraces.map((subrace) => ({ ...subrace, traitNames: rename(subrace.traitNames) })),
          },
          item.id,
        );
      }
    }
    setBusy(false);
    pushToast({ title: `Traço ${trimmed} salvo`, tone: "success" });
    onDone(data);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nome do traço">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Pele de Obsidiana" />
        </Field>
        <Field label="Idiomas adicionais à escolha">
          <Input type="number" min={0} max={5} value={extraLanguages} onChange={(event) => setExtraLanguages(Math.max(0, Number(event.target.value) || 0))} />
        </Field>
      </div>
      <Field label="O que o traço faz">
        <textarea className={textareaCls} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
      </Field>
      <details className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
        <summary className="cursor-pointer text-xs font-medium text-zinc-600 dark:text-zinc-300">
          Efeitos automáticos na ficha (opcional)
        </summary>
        <div className="mt-3 space-y-3">
          <div>
            <div className="mb-1 text-xs font-medium text-zinc-500">Perícias em que dá proficiência</div>
            <SkillCheckboxes value={skills} onChange={setSkills} />
          </div>
          <Field label="Perícias à escolha do jogador">
            <Input type="number" min={0} max={5} value={skillChoices} onChange={(event) => setSkillChoices(Math.max(0, Number(event.target.value) || 0))} />
          </Field>
          {skillChoices > 0 && (
            <div>
              <div className="mb-1 text-xs font-medium text-zinc-500">Restringir a escolha a (vazio = qualquer perícia)</div>
              <SkillCheckboxes value={skillChoiceFrom} onChange={setSkillChoiceFrom} />
            </div>
          )}
          <Field label="Proficiências com armas, armaduras ou ferramentas (uma por linha)">
            <textarea className={textareaCls} rows={2} value={proficiencies} onChange={(event) => setProficiencies(event.target.value)} />
          </Field>
          <Field label="Magias que o traço dá (uma por linha, nome como no catálogo)">
            <textarea className={textareaCls} rows={2} value={spells} onChange={(event) => setSpells(event.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Usos rastreáveis">
              <select className={selectCls} value={usesMode} onChange={(event) => setUsesMode(event.target.value as UsesMode)}>
                <option value="none">sem usos</option>
                <option value="fixed">número fixo</option>
                <option value="prof">bônus de proficiência</option>
                <option value="level">nível do personagem</option>
              </select>
            </Field>
            {usesMode === "fixed" && (
              <Field label="Quantos usos">
                <Input type="number" min={1} max={20} value={usesMax} onChange={(event) => setUsesMax(Math.max(1, Number(event.target.value) || 1))} />
              </Field>
            )}
            {usesMode !== "none" && (
              <Field label="Recupera no">
                <select className={selectCls} value={recharge} onChange={(event) => setRecharge(event.target.value as FeatureResource["recharge"])}>
                  <option value="short">descanso curto</option>
                  <option value="long">descanso longo</option>
                  <option value="dawn">amanhecer</option>
                </select>
              </Field>
            )}
          </div>
        </div>
      </details>
      <FormActions busy={busy} error={error} onCancel={() => onDone()} onSave={() => void save()} />
    </div>
  );
}

function FeatForm({ initial, onDone }: { initial?: { id: string; data: HomebrewFeatData }; onDone: () => void }) {
  const saveHomebrew = useStore((s) => s.saveHomebrew);
  const pushToast = useStore((s) => s.pushToast);
  const start = initial?.data;
  const [name, setName] = useState(start?.name ?? "");
  const [description, setDescription] = useState(start?.description ?? "");
  const [prerequisite, setPrerequisite] = useState(start?.prerequisite ?? "");
  const [abilities, setAbilities] = useState<AbilityKey[]>(start?.abilityIncrease?.choose ?? []);
  const [amount, setAmount] = useState(start?.abilityIncrease?.amount ?? 1);
  const [races, setRaces] = useState((start?.races ?? []).join(", "));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) return setError("Dê um nome ao talento.");
    if (!description.trim()) return setError("Descreva o que o talento faz.");
    if (FEATS_CATALOG.some((feat) => norm(feat.name) === norm(trimmed)))
      return setError("Já existe um talento oficial com esse nome.");
    const data: HomebrewFeatData = {
      name: trimmed,
      description: description.trim(),
      ...(prerequisite.trim() ? { prerequisite: prerequisite.trim() } : {}),
      ...(abilities.length ? { abilityIncrease: { choose: abilities, amount } } : {}),
      ...(splitCommas(races).length ? { races: splitCommas(races) } : {}),
    };
    setBusy(true);
    const result = await saveHomebrew("feat", data, initial?.id);
    setBusy(false);
    if (!result.ok) return setError(result.error);
    pushToast({ title: `Talento ${trimmed} salvo`, tone: "success" });
    onDone();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initial ? `Editar ${initial.data.name}` : "Novo talento"}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nome do talento">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Lâmina da Rainha Corvo" />
          </Field>
          <Field label="Pré-requisito (opcional)">
            <Input value={prerequisite} onChange={(event) => setPrerequisite(event.target.value)} placeholder="Ex.: Destreza 13" />
          </Field>
        </div>
        <Field label="O que o talento faz">
          <textarea className={textareaCls} rows={5} value={description} onChange={(event) => setDescription(event.target.value)} />
        </Field>
        <div>
          <div className="mb-1 text-xs font-medium text-zinc-500">
            Aumento de atributo embutido (opcional): o jogador escolhe um dos marcados
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {ABILITY_ORDER.map((key) => (
              <label key={key} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={abilities.includes(key)}
                  onChange={() => setAbilities(abilities.includes(key) ? abilities.filter((entry) => entry !== key) : [...abilities, key])}
                />
                {ABILITY_LABELS[key].slice(0, 3)}
              </label>
            ))}
            {abilities.length > 0 && (
              <select className={cn(selectCls, "h-8 w-24")} value={amount} onChange={(event) => setAmount(Number(event.target.value))}>
                <option value={1}>+1</option>
                <option value={2}>+2</option>
              </select>
            )}
          </div>
        </div>
        <Field label="Só para as raças (opcional, separadas por vírgula)" hint="Deixe vazio para qualquer raça poder escolher.">
          <Input value={races} onChange={(event) => setRaces(event.target.value)} placeholder="Ex.: Shade, Elfo" />
        </Field>
        <FormActions busy={busy} error={error} onCancel={onDone} onSave={() => void save()} />
      </CardBody>
    </Card>
  );
}

function AsiEditor({ value, onChange }: { value: AbilityScoreIncrease; onChange: (next: AbilityScoreIncrease) => void }) {
  const setFixed = (key: AbilityKey, amount: number) => {
    const next = { ...value };
    if (amount) next[key] = amount;
    else delete next[key];
    onChange(next);
  };
  const setChoose = (count: number, maxPerAbility: number) => {
    const next = { ...value };
    if (count > 0) next.choose = { count, amount: 1, ...(maxPerAbility > 1 ? { maxPerAbility } : {}) };
    else delete next.choose;
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {ABILITY_ORDER.map((key) => (
          <label key={key} className="text-center text-xs">
            <span className="block text-zinc-500">{ABILITY_LABELS[key].slice(0, 3)}</span>
            <Input
              type="number"
              min={-2}
              max={3}
              className="h-8 px-1 text-center"
              value={value[key] ?? 0}
              onChange={(event) => setFixed(key, Math.max(-2, Math.min(3, Math.round(Number(event.target.value) || 0))))}
            />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span>Pontos à escolha do jogador (+1 cada):</span>
        <select
          className={cn(selectCls, "h-8 w-20")}
          value={value.choose?.count ?? 0}
          onChange={(event) => setChoose(Number(event.target.value), value.choose?.maxPerAbility ?? 1)}
        >
          {[0, 1, 2, 3].map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
        {(value.choose?.count ?? 0) > 1 && (
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={(value.choose?.maxPerAbility ?? 1) > 1}
              onChange={(event) => setChoose(value.choose!.count, event.target.checked ? 2 : 1)}
            />
            permitir 2 pontos no mesmo atributo
          </label>
        )}
      </div>
    </div>
  );
}

/** Lista de traços (homebrew + oficiais) com busca; a raça guarda só os nomes. */
function TraitChecklist({ selected, onChange }: { selected: string[]; onChange: (names: string[]) => void }) {
  const homebrew = useStore((s) => s.homebrew);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const homebrewTraits = homebrew.flatMap((item) => (item.kind === "trait" ? [item.data] : []));
  const options = [
    ...homebrewTraits.map((trait) => ({ trait, homebrew: true })),
    ...OFFICIAL_RACE_TRAITS.filter((trait) => !homebrewTraits.some((entry) => norm(entry.name) === norm(trait.name))).map(
      (trait) => ({ trait, homebrew: false }),
    ),
  ];
  const q = norm(query);
  const filtered = q
    ? options.filter(({ trait }) => norm(trait.name).includes(q) || norm(trait.description).includes(q))
    : options;
  const toggle = (name: string) =>
    onChange(selected.some((entry) => norm(entry) === norm(name)) ? selected.filter((entry) => norm(entry) !== norm(name)) : [...selected, name]);

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((name) => (
            <span key={name} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
              {name}
              <button type="button" onClick={() => toggle(name)} aria-label={`Tirar ${name}`} className="text-zinc-500 hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar traço (homebrew ou oficial)…" />
        <Button type="button" variant="outline" size="md" onClick={() => setCreating(true)} disabled={creating}>
          <Plus className="h-3 w-3" /> novo traço
        </Button>
      </div>
      {creating && (
        <div className="rounded-md border border-fuchsia-200 bg-fuchsia-50/40 p-3 dark:border-fuchsia-900 dark:bg-fuchsia-950/10">
          <div className="mb-2 text-xs font-medium">Novo traço homebrew (vai para a biblioteca e já entra nesta raça)</div>
          <TraitForm
            onDone={(saved) => {
              setCreating(false);
              if (saved) onChange([...selected.filter((entry) => norm(entry) !== norm(saved.name)), saved.name]);
            }}
          />
        </div>
      )}
      <div className="max-h-64 overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-800">
        {filtered.map(({ trait, homebrew: isHomebrew }) => (
          <label
            key={`${isHomebrew ? "hb" : "of"}:${trait.name}`}
            className="flex items-start gap-2 border-b border-zinc-100 px-2 py-1.5 last:border-0 dark:border-zinc-800"
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={selected.some((entry) => norm(entry) === norm(trait.name))}
              onChange={() => toggle(trait.name)}
            />
            <span className="min-w-0">
              <span className="text-sm font-medium">{trait.name}</span>{" "}
              {isHomebrew && (
                <span className="rounded bg-fuchsia-100 px-1 text-[10px] uppercase text-fuchsia-800 dark:bg-fuchsia-950/50 dark:text-fuchsia-300">
                  homebrew
                </span>
              )}
              <span className="block truncate text-xs text-zinc-500" title={trait.description}>
                {trait.description}
              </span>
            </span>
          </label>
        ))}
        {filtered.length === 0 && <p className="p-2 text-xs text-zinc-500">Nenhum traço encontrado.</p>}
      </div>
    </div>
  );
}

const emptyRace = (): HomebrewRaceData => ({
  name: "",
  description: "",
  abilityScoreIncrease: {},
  size: "Médio",
  speed: 9,
  languages: ["Comum"],
  extraLanguages: 0,
  traitNames: [],
  subraces: [],
});

function RaceForm({ initial, onDone }: { initial?: { id: string; data: HomebrewRaceData }; onDone: () => void }) {
  const saveHomebrew = useStore((s) => s.saveHomebrew);
  const pushToast = useStore((s) => s.pushToast);
  const [race, setRace] = useState<HomebrewRaceData>(() => (initial ? structuredClone(initial.data) : emptyRace()));
  const [languagesText, setLanguagesText] = useState(() => (initial?.data.languages ?? ["Comum"]).join(", "));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<HomebrewRaceData>) => setRace((current) => ({ ...current, ...patch }));
  const setSubrace = (index: number, patch: Partial<HomebrewSubraceData>) =>
    set({ subraces: race.subraces.map((subrace, i) => (i === index ? { ...subrace, ...patch } : subrace)) });
  const sizeMode = race.sizeOptions?.length === 2 ? "ambos" : race.size;

  const save = async () => {
    setError(null);
    const name = race.name.trim();
    if (!name) return setError("Dê um nome à raça.");
    if (RACES_CATALOG.some((entry) => norm(entry.name) === norm(name))) return setError("Já existe uma raça oficial com esse nome.");
    if (race.subraces.some((subrace) => !subrace.name.trim())) return setError("Dê nome a todas as sub-raças.");
    if (race.noteField && !race.noteField.label.trim()) return setError("Escreva o título da anotação pedida ao jogador.");
    const data: HomebrewRaceData = {
      ...race,
      name,
      description: race.description.trim(),
      languages: splitCommas(languagesText),
      speed: Math.max(0, Number(race.speed) || 0),
      subraces: race.subraces.map((subrace) => ({
        ...subrace,
        name: subrace.name.trim(),
        description: subrace.description?.trim() || undefined,
      })),
      subraceRequired: race.subraces.length > 0 && !!race.subraceRequired,
      noteField: race.noteField ? { ...race.noteField, label: race.noteField.label.trim() } : undefined,
    };
    setBusy(true);
    const result = await saveHomebrew("race", data, initial?.id);
    setBusy(false);
    if (!result.ok) return setError(result.error);
    pushToast({ title: `Raça ${name} salva`, tone: "success" });
    onDone();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initial ? `Editar ${initial.data.name}` : "Nova raça"}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nome da raça">
            <Input value={race.name} onChange={(event) => set({ name: event.target.value })} placeholder="Ex.: Meio-Gênio" />
          </Field>
          <Field label="Tamanho">
            <select
              className={selectCls}
              value={sizeMode}
              onChange={(event) => {
                const mode = event.target.value;
                if (mode === "ambos") set({ size: "Médio", sizeOptions: ["Pequeno", "Médio"] });
                else set({ size: mode as CreatureSize, sizeOptions: undefined });
              }}
            >
              <option value="Médio">Médio</option>
              <option value="Pequeno">Pequeno</option>
              <option value="ambos">Pequeno ou Médio (o jogador escolhe)</option>
            </select>
          </Field>
        </div>
        <Field label="Descrição curta">
          <textarea className={textareaCls} rows={3} value={race.description} onChange={(event) => set({ description: event.target.value })} />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Deslocamento (m)">
            <Input type="number" min={0} step={1.5} value={race.speed} onChange={(event) => set({ speed: Number(event.target.value) || 0 })} />
          </Field>
          <Field label="Idiomas fixos (vírgula)">
            <Input value={languagesText} onChange={(event) => setLanguagesText(event.target.value)} placeholder="Comum, Élfico" />
          </Field>
          <Field label="Idiomas extras à escolha">
            <Input type="number" min={0} max={5} value={race.extraLanguages} onChange={(event) => set({ extraLanguages: Math.max(0, Number(event.target.value) || 0) })} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!race.speedEditable} onChange={(event) => set({ speedEditable: event.target.checked || undefined })} />
          O jogador informa o próprio deslocamento (ex.: vem da raça de origem)
        </label>

        <div>
          <div className="mb-1 text-xs font-medium text-zinc-500">Aumento no valor de habilidade</div>
          <AsiEditor value={race.abilityScoreIncrease} onChange={(abilityScoreIncrease) => set({ abilityScoreIncrease })} />
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-zinc-500">Traços raciais</div>
          <TraitChecklist selected={race.traitNames} onChange={(traitNames) => set({ traitNames })} />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!race.noteField}
              onChange={(event) => set({ noteField: event.target.checked ? { label: "Anotação", placeholder: "" } : undefined })}
            />
            Pedir uma anotação livre ao jogador na criação (ex.: a raça cuja aparência o Shade assume)
          </label>
          {race.noteField && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Título da anotação">
                <Input value={race.noteField.label} onChange={(event) => set({ noteField: { ...race.noteField!, label: event.target.value } })} />
              </Field>
              <Field label="Exemplo (placeholder)">
                <Input
                  value={race.noteField.placeholder ?? ""}
                  onChange={(event) => set({ noteField: { ...race.noteField!, placeholder: event.target.value } })}
                />
              </Field>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-medium text-zinc-500">Sub-raças ({race.subraces.length})</div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set({ subraces: [...race.subraces, { name: "", abilityScoreIncrease: {}, traitNames: [] }] })}
            >
              <Plus className="h-3 w-3" /> sub-raça
            </Button>
          </div>
          {race.subraces.length > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!race.subraceRequired} onChange={(event) => set({ subraceRequired: event.target.checked })} />
              Escolher uma sub-raça é obrigatório
            </label>
          )}
          {race.subraces.map((subrace, index) => (
            <div key={index} className="space-y-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Field label="Nome da sub-raça">
                    <Input value={subrace.name} onChange={(event) => setSubrace(index, { name: event.target.value })} />
                  </Field>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remover sub-raça"
                  onClick={() => set({ subraces: race.subraces.filter((_, i) => i !== index) })}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Field label="Descrição">
                <textarea className={textareaCls} rows={2} value={subrace.description ?? ""} onChange={(event) => setSubrace(index, { description: event.target.value })} />
              </Field>
              <Field label="Deslocamento próprio em metros (vazio = o da raça)">
                <Input
                  type="number"
                  min={0}
                  step={1.5}
                  value={subrace.speed ?? ""}
                  onChange={(event) => setSubrace(index, { speed: event.target.value ? Number(event.target.value) : undefined })}
                />
              </Field>
              <div>
                <div className="mb-1 text-xs font-medium text-zinc-500">Aumento de atributo da sub-raça (soma com o da raça)</div>
                <AsiEditor value={subrace.abilityScoreIncrease} onChange={(abilityScoreIncrease) => setSubrace(index, { abilityScoreIncrease })} />
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-zinc-500">Traços da sub-raça (somam com os da raça)</div>
                <TraitChecklist selected={subrace.traitNames} onChange={(traitNames) => setSubrace(index, { traitNames })} />
              </div>
            </div>
          ))}
        </div>

        <FormActions busy={busy} error={error} onCancel={onDone} onSave={() => void save()} />
      </CardBody>
    </Card>
  );
}
