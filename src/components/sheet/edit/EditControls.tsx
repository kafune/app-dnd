"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

/** Campo de texto editável que salva ao sair do foco (ou Enter). */
export function EditableText({
  value,
  onSave,
  placeholder,
  className,
  multiline,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}) {
  const [v, setV] = useState(value);
  const commit = () => {
    if (v !== value) onSave(v);
  };
  if (multiline) {
    return (
      <textarea
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={commit}
        placeholder={placeholder}
        className={cn(
          "min-h-[3rem] w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm",
          "placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/40",
          "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
      />
    );
  }
  return (
    <Input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      placeholder={placeholder}
      className={className}
    />
  );
}

/** Campo numérico editável que salva ao sair do foco (ou Enter). */
export function EditableNumber({
  value,
  onSave,
  className,
  min,
  max,
}: {
  value: number;
  onSave: (v: number) => void;
  className?: string;
  min?: number;
  max?: number;
}) {
  const [v, setV] = useState(String(value));
  const commit = () => {
    let n = Number(v);
    if (!Number.isFinite(n)) n = value;
    if (min != null) n = Math.max(min, n);
    if (max != null) n = Math.min(max, n);
    if (n !== value) onSave(n);
    setV(String(n));
  };
  return (
    <Input
      type="number"
      inputMode="numeric"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      className={cn("w-20", className)}
    />
  );
}
