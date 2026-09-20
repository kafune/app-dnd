import { descreverComponentes } from "@/lib/componentesMagia";
import type { Spell } from "@/lib/types";

/** Requisitos de conjuração legíveis também em telas pequenas. */
export function ComponentesMagia({ magia, resumido = false }: {
  magia: Pick<Spell, "name"> & Partial<Pick<Spell, "components">>;
  resumido?: boolean;
}) {
  return (
    <span className="text-xs text-zinc-600 dark:text-zinc-300">
      <strong>Componentes:</strong> {descreverComponentes(magia, resumido)}
    </span>
  );
}
