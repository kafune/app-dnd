import { useState } from "react";
import { EscolhasHabilidades } from "@/components/create/EscolhasHabilidades";
import { useIsMaster, useStore } from "@/lib/store";
import { escolhasHabilidadesPendentes, magiasComEscolhas } from "@/lib/progression";
import { sheetPermissions } from "@/lib/permissions";
import type { EscolhasHabilidades as Selecoes } from "@/lib/types";

export function EscolhasHabilidadesFicha({ id }: { id: string }) {
  const ficha = useStore((s) => s.characters[id]?.sheet);
  const editando = useStore((s) => s.editMode);
  const patchSheet = useStore((s) => s.patchSheet);
  const pushToast = useStore((s) => s.pushToast);
  const mestre = useIsMaster(id);
  const [salvando, setSalvando] = useState(false);
  if (!ficha || !sheetPermissions(mestre, ficha).escolhasHabilidades) return null;
  if (!editando && !escolhasHabilidadesPendentes(ficha).length) return null;

  // Igual aos outros campos da ficha, cada mudança é salva imediatamente.
  // Assim, "Concluir edição" ou uma atualização de nível não perde a seleção.
  const salvar = async (escolhasHabilidades: Selecoes) => {
    setSalvando(true);
    const contexto = { ...ficha, escolhasHabilidades };
    const ok = await patchSheet(id, { escolhasHabilidades, spells: magiasComEscolhas(contexto) });
    setSalvando(false);
    if (ok && !escolhasHabilidadesPendentes(contexto).length) {
      pushToast({ title: "Escolhas de habilidades completas.", tone: "success" });
    }
  };
  return <EscolhasHabilidades ficha={ficha} onChange={(escolhas) => void salvar(escolhas)} disabled={salvando} />;
}
