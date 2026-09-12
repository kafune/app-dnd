import { useState } from "react";
import { Shield, ShieldOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useIsMaster, useStore } from "@/lib/store";
import { EditableText, EditableNumber } from "@/components/sheet/edit/EditControls";
import { ABILITY_LABELS, ABILITY_ORDER, type InventoryCategory, type Item } from "@/lib/types";
import { ITEMS_CATALOG, findItem, isArmorItem, isShieldItem, itemDisplayName } from "@/data/itemsCatalog";
import { equipPatch } from "@/lib/armor";
import { sheetPermissions } from "@/lib/permissions";
import { groupProficiencies, splitProficiencies } from "@/lib/proficiencies";
import {
  groupInventory,
  INVENTORY_CATEGORY_LABELS,
  INVENTORY_CATEGORY_ORDER,
  inventoryCategory,
} from "@/lib/inventory";

const splitLines = (v: string) =>
  v
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

const smallSelect =
  "h-7 rounded border border-zinc-300 bg-white px-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

function TopicList({ label, items }: { label: string; items: string[] }) {
  return (
    <section>
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</h4>
      <ul className="list-disc space-y-0.5 pl-4 text-sm text-zinc-700 marker:text-zinc-400 dark:text-zinc-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function ProficienciesAndLanguages({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const editMode = useStore((s) => s.editMode);
  const isMaster = useIsMaster(id);
  const patchSheet = useStore((s) => s.patchSheet);
  if (!c) return null;
  if (editMode && isMaster) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proficiências & Idiomas</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <label className="block text-xs text-zinc-500">
            Idiomas (um por linha)
            <EditableText
              multiline
              value={c.sheet.languages.join("\n")}
              onSave={(v) => void patchSheet(id, { languages: splitLines(v) })}
            />
          </label>
          <label className="block text-xs text-zinc-500">
            Proficiências (uma por linha; a ficha separa em armaduras, armas e ferramentas sozinha)
            <EditableText
              multiline
              className="min-h-[8rem]"
              value={splitProficiencies(c.sheet.proficiencies).join("\n")}
              onSave={(v) => void patchSheet(id, { proficiencies: splitLines(v) })}
            />
          </label>
        </CardBody>
      </Card>
    );
  }

  const saves = ABILITY_ORDER.filter((key) => c.sheet.saves.includes(key)).map((key) => ABILITY_LABELS[key]);
  const topics = [
    ...(saves.length ? [{ key: "saves", label: "Testes de resistência", items: saves }] : []),
    ...groupProficiencies(c.sheet.proficiencies).map((group) => ({ key: group.topic, label: group.label, items: group.items })),
    ...(c.sheet.languages.length ? [{ key: "idiomas", label: "Idiomas", items: c.sheet.languages }] : []),
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle>Proficiências & Idiomas</CardTitle>
          <span className="text-xs text-zinc-500">
            Bônus de proficiência <strong>+{c.sheet.proficiencyBonus}</strong>
          </span>
        </div>
      </CardHeader>
      <CardBody>
        {topics.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhuma proficiência registrada.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {topics.map((topic) => (
              <TopicList key={topic.key} label={topic.label} items={topic.items} />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function Inventory({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const editMode = useStore((s) => s.editMode);
  const isMaster = useIsMaster(id);
  const patchSheet = useStore((s) => s.patchSheet);
  if (!c) return null;
  const inv = c.sheet.inventory;
  // Itens e moedas são do Mestre; equipar armadura e escudo o jogador faz sozinho.
  const canManage = editMode && sheetPermissions(isMaster, c.sheet).inventory;
  const setInv = (partial: Partial<typeof inv>) => void patchSheet(id, { inventory: { ...inv, ...partial } });
  const setCoin = (k: "gp" | "sp" | "cp", v: number) => setInv({ coins: { ...inv.coins, [k]: v } });
  const updateItem = (i: number, p: Partial<Item>) =>
    setInv({ items: inv.items.map((it, idx) => (idx === i ? { ...it, ...p } : it)) });
  const groups = groupInventory(inv.items);

  const isEquipped = (name: string) => name === c.sheet.equippedArmor || name === c.sheet.equippedShield;
  const toggleEquip = (name: string) => void patchSheet(id, equipPatch(c, name, !isEquipped(name)));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle>Inventário</CardTitle>
          {!canManage && (
            <span className="font-mono text-xs text-zinc-500">
              {inv.coins.gp} po · {inv.coins.sp} pp · {inv.coins.cp} pc
            </span>
          )}
        </div>
      </CardHeader>
      <CardBody className="space-y-4 text-sm">
        {canManage && (
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <EditableNumber value={inv.coins.gp} min={0} onSave={(v) => setCoin("gp", v)} className="h-7 w-16" /> po
            <EditableNumber value={inv.coins.sp} min={0} onSave={(v) => setCoin("sp", v)} className="h-7 w-16" /> pp
            <EditableNumber value={inv.coins.cp} min={0} onSave={(v) => setCoin("cp", v)} className="h-7 w-16" /> pc
          </div>
        )}

        {groups.length === 0 && <p className="text-zinc-500">Inventário vazio.</p>}

        {groups.map((group) => (
          <section key={group.category}>
            <h4 className="mb-1 flex items-baseline justify-between border-b border-zinc-100 pb-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
              <span>{group.label}</span>
              <span className="font-normal">{group.entries.length}</span>
            </h4>
            <ul className="space-y-1">
              {group.entries.map(({ item, index }) =>
                canManage ? (
                  <li key={`${index}:${item.name}`} className="flex flex-wrap items-center gap-1">
                    <EditableText value={item.name} onSave={(v) => updateItem(index, { name: v })} placeholder="item" className="h-8 w-40" />
                    <EditableText
                      value={item.description ?? ""}
                      onSave={(v) => updateItem(index, { description: v || undefined })}
                      placeholder="descrição"
                      className="h-8 min-w-[8rem] flex-1"
                    />
                    <select
                      className={smallSelect}
                      aria-label={`Categoria de ${item.name}`}
                      value={item.category ?? ""}
                      onChange={(event) =>
                        updateItem(index, { category: (event.target.value || undefined) as InventoryCategory | undefined })
                      }
                    >
                      <option value="">auto: {INVENTORY_CATEGORY_LABELS[inventoryCategory({ ...item, category: undefined })]}</option>
                      {INVENTORY_CATEGORY_ORDER.map((category) => (
                        <option key={category} value={category}>
                          {INVENTORY_CATEGORY_LABELS[category]}
                        </option>
                      ))}
                    </select>
                    <EditableNumber
                      value={item.quantity ?? 1}
                      min={0}
                      onSave={(v) => updateItem(index, { quantity: v })}
                      className="h-7 w-14"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remover item"
                      onClick={() => setInv({ items: inv.items.filter((_, idx) => idx !== index) })}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </li>
                ) : (
                  <InventoryRow
                    key={`${index}:${item.name}`}
                    item={item}
                    equipped={isEquipped(item.name)}
                    onToggleEquip={toggleEquip}
                  />
                ),
              )}
            </ul>
          </section>
        ))}

        {canManage && (
          <div className="space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <InventoryCatalogAdd items={inv.items} onChange={(items) => setInv({ items })} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInv({ items: [...inv.items, { name: "Item homebrew", quantity: 1 }] })}
            >
              + Item custom/homebrew
            </Button>
          </div>
        )}
        {editMode && !canManage && (
          <p className="text-xs text-zinc-500">
            Só o Mestre adiciona ou remove itens. Equipar e desequipar armadura e escudo você faz a qualquer momento.
          </p>
        )}
      </CardBody>
    </Card>
  );
}

/**
 * Uma linha do inventário fora do modo de edição. Armaduras e escudos aparecem
 * com o nome completo do livro, a CA que dão, o aviso de desvantagem e o botão
 * de equipar — é equipando que a peça entra na conta da CA.
 */
function InventoryRow({
  item,
  equipped,
  onToggleEquip,
}: {
  item: Item;
  equipped: boolean;
  onToggleEquip: (name: string) => void;
}) {
  const catalog = findItem(item.name);
  const shield = isShieldItem(item.name);
  const wearable = shield || isArmorItem(item.name);
  const penalty = [
    catalog?.stealthDisadvantage ? "desvantagem em Destreza (Furtividade)" : "",
    catalog?.strengthRequirement ? `exige Força ${catalog.strengthRequirement}` : "",
  ].filter(Boolean);

  return (
    <li className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="min-w-0 flex-1">
        <strong className="text-zinc-900 dark:text-zinc-100">{itemDisplayName(item.name)}</strong>
        {equipped && (
          <span className="ml-1.5 rounded bg-emerald-100 px-1 text-[10px] font-medium uppercase text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
            equipado
          </span>
        )}
        {wearable && catalog?.ac && <span className="ml-1.5 font-mono text-xs text-zinc-500">CA {catalog.ac}</span>}
        {item.description && <span className="ml-1 text-xs text-zinc-500">— {item.description}</span>}
        {penalty.length > 0 && (
          <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">⚠ {penalty.join(" · ")}</span>
        )}
      </span>
      {(item.quantity ?? 1) > 1 && <span className="shrink-0 font-mono text-xs text-zinc-500">×{item.quantity}</span>}
      {wearable && (
        <Button
          size="sm"
          variant={equipped ? "success" : "outline"}
          className="shrink-0"
          onClick={() => onToggleEquip(item.name)}
          title={equipped ? "Tirar: para de somar na CA" : "Vestir: soma a CA desta peça"}
        >
          {equipped ? <ShieldOff className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
          {equipped ? "Desequipar" : shield ? "Equipar escudo" : "Equipar armadura"}
        </Button>
      )}
    </li>
  );
}

function InventoryCatalogAdd({ items, onChange }: { items: Item[]; onChange: (items: Item[]) => void }) {
  const [name, setName] = useState(ITEMS_CATALOG[0]?.name ?? "");
  const add = () => {
    const catalog = findItem(name);
    if (!catalog) return;
    const existing = items.find((item) => item.name === catalog.name);
    if (existing) {
      onChange(items.map((item) => (item === existing ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item)));
    } else {
      onChange([...items, { name: catalog.name, description: catalog.detail, quantity: 1 }]);
    }
  };
  return (
    <div className="flex gap-2">
      <select
        className="h-8 min-w-0 flex-1 rounded border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900"
        value={name}
        onChange={(event) => setName(event.target.value)}
      >
        {ITEMS_CATALOG.map((item) => (
          <option key={item.name} value={item.name}>
            {item.name} — {item.detail}
          </option>
        ))}
      </select>
      <Button variant="outline" size="sm" onClick={add}>
        Adicionar
      </Button>
    </div>
  );
}

/** Personalidade e história. A aparência saiu da ficha: agora é a foto de perfil no topo. */
export function Personality({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const editMode = useStore((s) => s.editMode);
  const patchSheet = useStore((s) => s.patchSheet);
  if (!c) return null;
  const p = c.sheet.personality;
  // A história ganhou bloco próprio no fim da ficha (ver components/sheet/Backstory.tsx).
  const persKeys: [string, keyof typeof p][] = [
    ["Personalidade", "trait"],
    ["Ideal", "ideal"],
    ["Defeito", "flaw"],
    ["Por que estou aqui", "why"],
  ];

  if (editMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personalidade & História</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2 text-sm">
          {persKeys.map(([label, key]) => (
            <label key={key} className="block text-xs text-zinc-500">
              {label}
              <EditableText
                value={p[key]}
                onSave={(v) => void patchSheet(id, { personality: { ...p, [key]: v } })}
                multiline={key === "why"}
              />
            </label>
          ))}
        </CardBody>
      </Card>
    );
  }
  const blocks = persKeys.filter(([, key]) => p[key] && p[key] !== "—");
  if (blocks.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalidade & História</CardTitle>
      </CardHeader>
      <CardBody className="space-y-2 text-sm">
        {blocks.map(([label, key]) => (
          <div key={key}>
            <div className="text-xs uppercase text-zinc-500">{label}</div>
            <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{p[key]}</p>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
