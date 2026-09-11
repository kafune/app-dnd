import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Rótulo acessível (o campo não tem label visível). */
  label: string;
};

/** Campo de busca com lupa e botão de limpar. */
export function SearchInput({ value, onChange, placeholder, label }: Props) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <Input
        type="text"
        enterKeyHint="search"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
