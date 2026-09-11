import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";

/** Selo do estado da conexão em tempo real (SSE). */
export function RealtimeBadge({ className }: { className?: string }) {
  const ready = useStore((s) => s.realtimeReady);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs",
        ready
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        className,
      )}
    >
      {ready ? "🟢 Sincronizado em tempo real" : "🟡 Conectando…"}
    </span>
  );
}
