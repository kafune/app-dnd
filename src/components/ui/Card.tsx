import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
      {...p}
    />
  );
}

export function CardHeader({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-zinc-100 px-4 py-3 dark:border-zinc-800", className)} {...p} />;
}

export function CardTitle({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return (
    <h3
      className={cn(
        "text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300",
        className,
      )}
      {...p}
    />
  );
}

export function CardBody({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...p} />;
}
