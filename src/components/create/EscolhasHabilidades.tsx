import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  escolhasHabilidadesDisponiveis,
  impedimentoOpcaoHabilidade,
  normalizarEscolhasHabilidades,
  norm,
  type ContextoEscolhasHabilidades,
  type EscolhaHabilidade,
} from "@/lib/progression";
import type { EscolhasHabilidades as Selecoes } from "@/lib/types";

type Props = { ficha: ContextoEscolhasHabilidades; onChange: (escolhas: Selecoes) => void; disabled?: boolean };

/** O mesmo seletor atende criação, progressão e fichas antigas com escolhas pendentes. */
export function EscolhasHabilidades({ ficha, onChange, disabled }: Props) {
  const escolhas = normalizarEscolhasHabilidades(ficha);
  const contexto = { ...ficha, escolhasHabilidades: escolhas };
  const disponiveis = escolhasHabilidadesDisponiveis(contexto);
  if (!disponiveis.length) return null;
  return (
    <Card>
      <CardHeader><CardTitle>Escolhas de habilidades e talentos</CardTitle></CardHeader>
      <CardBody className="space-y-3">
        <p className="text-xs text-zinc-500">Escolha o que seu personagem aprendeu. Novas vagas aparecem conforme o nível da classe; apenas as opções escolhidas ficam na ficha.</p>
        {disponiveis.map((escolha) => <GrupoEscolha key={escolha.chave} ficha={contexto} escolha={escolha} disabled={disabled} onChange={onChange} />)}
      </CardBody>
    </Card>
  );
}

function GrupoEscolha({ ficha, escolha, onChange, disabled }: Props & { escolha: EscolhaHabilidade }) {
  const [busca, setBusca] = useState("");
  const escolhidas = ficha.escolhasHabilidades?.[escolha.chave] ?? [];
  const faltam = escolha.quantidade - escolhidas.length;
  const alterar = (nome: string) => {
    const proxima = escolhidas.includes(nome) ? escolhidas.filter((n) => n !== nome) : [...escolhidas, nome];
    onChange(normalizarEscolhasHabilidades({ ...ficha, escolhasHabilidades: { ...ficha.escolhasHabilidades, [escolha.chave]: proxima } }));
  };
  return (
    <details className="rounded-md border border-zinc-200 p-3 dark:border-zinc-700" open={faltam > 0 ? true : undefined}>
      <summary className="cursor-pointer text-sm font-medium">
        {escolha.caracteristica} · {escolha.origem}
        <span className={`ml-2 text-xs ${faltam ? "text-amber-600" : "text-emerald-600"}`}>{escolhidas.length}/{escolha.quantidade} escolhidas</span>
        {escolhidas.length > 0 && <span className="mt-1 block text-xs font-normal text-zinc-500">{escolhidas.join(", ")}</span>}
      </summary>
      <div className="mt-3 space-y-2">
        <p className="whitespace-pre-line text-xs text-zinc-500">{escolha.resumo}</p>
        {escolha.fixas?.length ? <p className="text-xs">Já concedida: {escolha.fixas.join(", ")}.</p> : null}
        {escolha.opcoes.length > 10 && <Input aria-label={`Buscar opções de ${escolha.caracteristica}`} placeholder="Buscar opção…" value={busca} onChange={(e) => setBusca(e.target.value)} />}
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {escolha.opcoes.filter((o) => !escolha.fixas?.includes(o.nome) && norm(o.nome).includes(norm(busca))).map((opcao) => {
            const marcada = escolhidas.includes(opcao.nome);
            const impedimento = impedimentoOpcaoHabilidade(ficha, escolha, opcao);
            return (
              <div key={opcao.nome} className={`rounded border p-2 text-xs ${marcada ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "border-zinc-200 dark:border-zinc-800"}`}>
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={marcada} disabled={disabled || (!marcada && (!!impedimento || faltam <= 0))} onChange={() => alterar(opcao.nome)} />
                  <span><strong>{opcao.nome}</strong>{impedimento && <span className="ml-2 text-amber-600">{impedimento}</span>}</span>
                </label>
                <details className="mt-1 ml-5"><summary className="cursor-pointer text-zinc-500">Descrição</summary><p className="mt-1 whitespace-pre-line">{opcao.descricao}</p></details>
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}
