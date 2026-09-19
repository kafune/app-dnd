import regras from "./featureChoicesCatalog.json";

export type OpcaoHabilidade = {
  nome: string;
  descricao: string;
  nivel?: number;
  pacto?: string;
  magia?: string;
  maldicao?: boolean;
  concedeMagia?: string;
};

export type RegraEscolhaHabilidade = {
  id: string;
  classe?: string;
  subclasse?: string;
  talento?: string;
  caracteristica: string;
  grupo: string;
  /** Total de opções conhecidas em cada marco de nível da classe. */
  niveis: Record<string, number>;
  resumo: string;
  opcoes: OpcaoHabilidade[];
  fixas?: string[];
  conjuracao?: { classe: string; atributo: "cha" | "wis"; ritual?: boolean };
  dependentes?: { caracteristica: string; resumo: string; opcoes: OpcaoHabilidade[] }[];
  exigeOpcao?: { grupo: string; nome: string };
};

/** Gerado dos catálogos dos livros por scripts/export-feature-choices.ts; também lido pelo Rust. */
export const ESCOLHAS_HABILIDADES = regras as unknown as RegraEscolhaHabilidade[];
