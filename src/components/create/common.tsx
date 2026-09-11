import { SOURCE_LABELS, type SourceBook } from "@/lib/types";
import { cn } from "@/lib/cn";

export const selectCls =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export const textareaCls =
  "min-h-[4rem] w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-zinc-500">{hint}</span>}
    </label>
  );
}

export function ChoiceGrid({
  label,
  options,
  selected,
  max,
  onChange,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  max: number;
  onChange: (next: string[]) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-zinc-500">
        {label} ({selected.length}/{max})
      </div>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
        {options.map((option) => {
          const checked = selected.includes(option);
          return (
            <label key={option} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={checked}
                disabled={!checked && selected.length >= max}
                onChange={() => onChange(checked ? selected.filter((value) => value !== option) : [...selected, option])}
              />
              {option}
            </label>
          );
        })}
      </div>
    </div>
  );
}

/** Selo do livro de origem (Homebrew em destaque). */
export function SourceBadge({ source, className }: { source: SourceBook; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        source === "Homebrew"
          ? "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/50 dark:text-fuchsia-300"
          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
        className,
      )}
    >
      {SOURCE_LABELS[source]}
    </span>
  );
}
