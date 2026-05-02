"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useStore, type AppToast } from "@/lib/store";
import { cn } from "@/lib/cn";

const toneClass: Record<NonNullable<AppToast["tone"]>, string> = {
  default: "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  danger: "border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950 dark:text-red-100",
};

export function ToastViewport() {
  const toasts = useStore((s) => s.toasts);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed right-3 top-3 z-50 flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-2 sm:right-4 sm:top-4"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: AppToast }) {
  const dismiss = useStore((s) => s.dismissToast);

  useEffect(() => {
    const timeout = setTimeout(() => dismiss(toast.id), 4500);
    return () => clearTimeout(timeout);
  }, [dismiss, toast.id]);

  return (
    <div
      className={cn(
        "pointer-events-auto rounded-xl border p-3 shadow-lg backdrop-blur transition",
        toneClass[toast.tone ?? "default"],
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{toast.title}</div>
          {toast.description && (
            <div className="mt-0.5 text-xs opacity-75">{toast.description}</div>
          )}
        </div>
        <button
          type="button"
          aria-label="Fechar notificação"
          className="rounded p-1 opacity-60 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
          onClick={() => dismiss(toast.id)}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
