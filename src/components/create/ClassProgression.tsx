import { useState } from "react";
import { classFeaturesUpTo, findClassDef, findSubclassDef, type ClassFeatureWithOrigin } from "@/data/classesCatalog";
import { cn } from "@/lib/cn";
import { SourceBadge } from "./common";

type Props = { className: string; level: number; subclass?: string };

/**
 * Características que a classe (e a subclasse, a partir do nível em que é escolhida)
 * dá até o nível escolhido, cada uma com a descrição do que faz.
 */
export function ClassProgression({ className, level, subclass }: Props) {
  const definition = findClassDef(className);
  const features = classFeaturesUpTo(className, level, subclass);
  if (!definition || features.length === 0) return null;
  const sub = findSubclassDef(className, subclass);
  const levels = [...new Set(features.map((feature) => feature.level))].sort((a, b) => a - b);
  const missingSubclass = !sub && level >= definition.subclassLevel && definition.subclasses.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-sm font-semibold">
          {className}
          {sub ? ` · ${sub.name}` : ""}{" "}
          <span className="text-xs font-normal text-zinc-500">(até o nível {level})</span>
        </div>
        {sub && <SourceBadge source={sub.source} />}
      </div>
      {sub && <p className="text-xs text-zinc-600 dark:text-zinc-400">{sub.description}</p>}
      {missingSubclass && (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          No nível {definition.subclassLevel} você escolhe {definition.subclassLabel.toLowerCase()}. Escolha a subclasse no card de classes para ver as características dela aqui.
        </p>
      )}
      {!sub && level < definition.subclassLevel && definition.subclasses.length > 0 && (
        <p className="text-xs text-zinc-500">
          {definition.subclassLabel} (subclasse) é escolhido no nível {definition.subclassLevel}.
        </p>
      )}
      <ol className="space-y-2">
        {levels.map((featureLevel) => (
          <li key={featureLevel} className="flex gap-2">
            <span className="w-8 shrink-0 pt-1.5 text-right font-mono text-xs text-zinc-500">{featureLevel}º</span>
            <div className="min-w-0 flex-1 space-y-1.5">
              {features
                .filter((feature) => feature.level === featureLevel)
                .map((feature) => (
                  <FeatureItem key={`${feature.origin.kind}:${feature.name}`} feature={feature} />
                ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function FeatureItem({ feature }: { feature: ClassFeatureWithOrigin }) {
  const [open, setOpen] = useState(false);
  const fromSubclass = feature.origin.kind === "subclass";
  const long = feature.description.length > 260;
  return (
    <div
      className={cn(
        "rounded-md border px-2 py-1.5",
        fromSubclass
          ? "border-violet-200 bg-violet-50/60 dark:border-violet-900 dark:bg-violet-950/20"
          : "border-zinc-200 dark:border-zinc-800",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <span className="text-sm font-medium">{feature.name}</span>
        <span
          className={cn(
            "text-[10px] uppercase tracking-wide",
            fromSubclass ? "text-violet-700 dark:text-violet-400" : "text-zinc-400",
          )}
        >
          {fromSubclass ? feature.origin.name : "classe"}
        </span>
      </div>
      {feature.asi ? (
        <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
          Aumente atributos ou escolha um talento no card “Aumentos de atributo ou talentos”, logo abaixo.
        </p>
      ) : (
        <>
          <p
            className={cn(
              "mt-0.5 whitespace-pre-line text-xs text-zinc-600 dark:text-zinc-400",
              long && !open && "line-clamp-3",
            )}
          >
            {feature.description}
          </p>
          {long && (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="mt-0.5 text-xs font-medium text-violet-700 hover:underline dark:text-violet-400"
            >
              {open ? "mostrar menos" : "ler tudo"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
