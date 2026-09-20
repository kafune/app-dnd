import { findSpell } from "@/data/spellsCatalog";
import type { Spell } from "./types";

type Magia = Pick<Spell, "name"> & Partial<Pick<Spell, "components">>;

const NOMES = { V: "Verbal (V)", S: "Somático (S)", M: "Material (M)" } as const;
const SIGLAS = /^([VSM](?:[\s,]+[VSM])*)\s*(?=\(|$)/;

/** Recupera dados ausentes em fichas antigas, preservando componentes personalizados. */
export function componentesDaMagia(magia: Magia): string {
  const salvo = magia.components?.trim();
  const catalogo = findSpell(magia.name)?.components.trim() ?? "";
  if (!salvo) return catalogo;
  const siglas = salvo.match(SIGLAS);
  const originais = catalogo.match(SIGLAS);
  // Uma extração antiga de Lâmina Estrondosa guardou o material sem as siglas.
  if (!siglas && originais && catalogo.slice(originais[0].length).trim() === salvo) return catalogo;
  // Algumas fichas antigas guardaram apenas V/S/M, sem o material entre parênteses.
  if (siglas?.[0] === salvo && originais && siglas[1].replace(/[\s,]/g, "") === originais[1].replace(/[\s,]/g, "")) {
    return catalogo;
  }
  return salvo;
}

/** Explica as siglas sem alterar materiais, custos ou indicações de consumo. */
export function descreverComponentes(magia: Magia, resumido = false): string {
  const texto = componentesDaMagia(magia);
  if (!texto) return "Não informados";
  const siglas = texto.match(SIGLAS);
  if (!siglas) return texto;
  const nomes = siglas[1].split(/[\s,]+/).map((sigla) => NOMES[sigla as keyof typeof NOMES]).join(" · ");
  const material = texto.slice(siglas[0].length).trim();
  return resumido || !material ? nomes : `${nomes} ${material}`;
}
