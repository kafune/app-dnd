import { useMemo, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/SearchInput";
import {
  CATALOG_FILTERS,
  ITEMS_CATALOG,
  groupCatalogItems,
  type CatalogFilterId,
  type CatalogGroup,
  type CatalogItem,
} from "@/data/itemsCatalog";
import { cn } from "@/lib/cn";
import { matchesSearch } from "@/lib/search";

/** Catálogo inteiro já agrupado e em ordem alfabética (não muda em tempo de execução). */
const ALL_GROUPS = groupCatalogItems(ITEMS_CATALOG);

type Props = {
  /** Confirma a escolha: o chamador junta o item ao inventário. */
  onAdd: (item: CatalogItem, quantity: number) => void;
  /** Quantas unidades do item o inventário já tem (para avisar que a quantidade soma). */
  ownedQuantity?: (name: string) => number;
};

/** Grupos visíveis com o filtro e a busca aplicados. A busca também casa com o nome do grupo. */
function visibleGroups(query: string, filter: CatalogFilterId | null): CatalogGroup[] {
  return ALL_GROUPS.filter((group) => !filter || group.filter === filter).flatMap((group) => {
    const items = group.items.filter((item) => matchesSearch(query, item.name, item.fullName, item.detail, group.label));
    return items.length ? [{ ...group, items }] : [];
  });
}

/**
 * Seletor do catálogo de itens: grupos em ordem fixa (armas simples, marciais,
 * armaduras leves…), cada um com cabeçalho fixo explicando o que tem em comum,
 * itens em ordem alfabética, busca sem acento, filtros rápidos e um painel com
 * os detalhes do item escolhido antes de adicionar.
 */
export function ItemCatalogPicker({ onAdd, ownedQuantity }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CatalogFilterId | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const groups = useMemo(() => visibleGroups(query, filter), [query, filter]);
  /** Quantos itens cada filtro mostraria com a busca atual. */
  const counts = useMemo(() => {
    const byFilter = new Map<CatalogFilterId | null, number>([[null, 0]]);
    for (const group of visibleGroups(query, null)) {
      byFilter.set(group.filter, (byFilter.get(group.filter) ?? 0) + group.items.length);
      byFilter.set(null, (byFilter.get(null) ?? 0) + group.items.length);
    }
    return byFilter;
  }, [query]);

  const selectedGroup = groups.find((group) => group.items.some((item) => item.name === selectedName));
  const selected = selectedGroup?.items.find((item) => item.name === selectedName) ?? null;

  const select = (name: string) => {
    setSelectedName(name);
    setQuantity(1);
    setLastAdded(null);
  };
  const add = () => {
    if (!selected) return;
    onAdd(selected, quantity);
    setLastAdded(`${selected.name}${quantity > 1 ? ` ×${quantity}` : ""}`);
    setQuantity(1);
  };

  const chips: { id: CatalogFilterId | null; label: string }[] = [{ id: null, label: "Todos" }, ...CATALOG_FILTERS];

  return (
    <div className="min-w-0 space-y-2">
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar item, dano, propriedade…" label="Buscar no catálogo de itens" />

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por tipo de item">
        {chips.map((chip) => {
          const active = filter === chip.id;
          const count = counts.get(chip.id) ?? 0;
          return (
            <button
              key={chip.id ?? "todos"}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(active && chip.id ? null : chip.id)}
              className={cn(
                "inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-medium transition",
                active
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
                count === 0 && !active && "opacity-50",
              )}
            >
              {chip.label}
              <span className={cn("font-mono text-[10px]", active ? "opacity-80" : "text-zinc-400")}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="max-h-80 overflow-y-auto overscroll-contain rounded-md border border-zinc-200 dark:border-zinc-800">
        {groups.length === 0 && (
          <p className="p-3 text-xs text-zinc-500">
            Nenhum item do catálogo com essa busca{filter ? " neste filtro" : ""}.
          </p>
        )}
        {groups.map((group) => (
          <section key={group.id} aria-label={group.label} className="border-t border-zinc-200 first:border-t-0 dark:border-zinc-800">
            <header className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/95 px-3 py-1.5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
              <div className="flex items-baseline justify-between gap-2">
                <h5 className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">{group.label}</h5>
                <span className="shrink-0 font-mono text-[10px] text-zinc-400">{group.items.length}</span>
              </div>
              <p className="text-[11px] leading-snug text-zinc-500">{group.hint}</p>
            </header>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
              {group.items.map((item) => {
                const active = item === selected;
                const owned = ownedQuantity?.(item.name) ?? 0;
                return (
                  <li key={item.name}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => select(item.name)}
                      className={cn(
                        "flex min-h-11 w-full flex-col gap-0.5 px-3 py-2 text-left transition",
                        active
                          ? "bg-amber-50 ring-2 ring-inset ring-amber-400 dark:bg-amber-950/40 dark:ring-amber-600"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
                      )}
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="min-w-0 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {item.name}
                          {item.source === "Homebrew" && (
                            <span className="ml-1.5 rounded bg-violet-100 px-1 align-middle text-[10px] font-medium uppercase text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                              homebrew
                            </span>
                          )}
                          {owned > 0 && (
                            <span className="ml-1.5 rounded bg-emerald-100 px-1 align-middle text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              tem ×{owned}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-zinc-500">
                          {item.price}
                          {item.weight ? ` · ${item.weight}` : ""}
                        </span>
                      </span>
                      <span className="line-clamp-2 text-xs text-zinc-500">{item.detail}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <ItemDetails
        item={selected}
        groupLabel={selectedGroup?.label}
        owned={selected ? (ownedQuantity?.(selected.name) ?? 0) : 0}
        quantity={quantity}
        onQuantity={setQuantity}
        onAdd={add}
        lastAdded={lastAdded}
      />
    </div>
  );
}

/** Painel do item escolhido: números do livro, texto completo e o botão de adicionar. */
function ItemDetails({
  item,
  groupLabel,
  owned,
  quantity,
  onQuantity,
  onAdd,
  lastAdded,
}: {
  item: CatalogItem | null;
  groupLabel?: string;
  owned: number;
  quantity: number;
  onQuantity: (quantity: number) => void;
  onAdd: () => void;
  lastAdded: string | null;
}) {
  if (!item) {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 p-3 text-xs text-zinc-500 dark:border-zinc-700">
        {lastAdded ? (
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" /> {lastAdded} foi para o inventário.
          </span>
        ) : (
          "Toque em um item da lista para ver os detalhes e adicionar."
        )}
      </div>
    );
  }

  const stats: string[] = [];
  if (item.damage) stats.push(`Dano ${item.damage} ${item.damageType ?? ""}`.trim());
  if (item.ac) stats.push(`CA ${item.ac}`);
  if (item.strengthRequirement) stats.push(`Força ${item.strengthRequirement}`);
  if (item.stealthDisadvantage) stats.push("Desvantagem em Furtividade");
  stats.push(...(item.properties ?? []));
  const title = item.fullName ?? item.name;

  return (
    <div className="space-y-2 rounded-md border border-amber-300 bg-amber-50/50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
          {groupLabel && <div className="text-[11px] uppercase tracking-wide text-zinc-500">{groupLabel}</div>}
        </div>
        <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
          {item.price}
          {item.weight ? ` · ${item.weight}` : ""}
        </span>
      </div>

      {stats.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {stats.map((stat) => (
            <span
              key={stat}
              className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[11px] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {stat}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-700 dark:text-zinc-300">{item.detail}</p>
      )}

      {item.contents && (
        <ul className="list-disc pl-4 text-xs text-zinc-600 marker:text-zinc-400 dark:text-zinc-400">
          {item.contents.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      )}

      {item.description && (
        <p className="max-h-32 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          {item.description}
        </p>
      )}

      {owned > 0 && (
        <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
          Já tem ×{owned} no inventário; adicionar soma à quantidade.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <span className="flex items-center rounded-md border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
            aria-label="Diminuir quantidade"
            disabled={quantity <= 1}
            onClick={() => onQuantity(quantity - 1)}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[2rem] text-center font-mono text-sm" aria-label="Quantidade">
            {quantity}
          </span>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Aumentar quantidade"
            onClick={() => onQuantity(quantity + 1)}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </span>
        <Button type="button" variant="success" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Adicionar{quantity > 1 ? ` ×${quantity}` : ""}
        </Button>
      </div>
      {lastAdded && (
        <p className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400">
          <Check className="h-3.5 w-3.5" /> {lastAdded} foi para o inventário.
        </p>
      )}
    </div>
  );
}
