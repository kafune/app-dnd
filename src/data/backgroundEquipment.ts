/**
 * Equipamento, ouro e proficiências em ferramentas dos antecedentes, estruturados a
 * partir do texto de `backgroundsCatalog.json` (Livro do Jogador, Costa da Espada e
 * caseiros). Nomes iguais aos de `itemsCatalog` quando o item existe no catálogo;
 * o resto (livro de orações, troféu, carta da guilda…) fica como item livre com nota.
 *
 * A criação de ficha soma tudo isso ao inventário, às moedas e às proficiências.
 */
import type { Item } from "@/lib/types";
import { itemFromName, mergeItems } from "@/lib/items";
import { ARTISAN_TOOLS, GAMING_SETS, MUSICAL_INSTRUMENTS } from "./itemsCatalog";

export type KitItem = { item: string; qty?: number; /** Descrição no inventário (senão, a do catálogo). */ note?: string };

export type KitOption = { label: string; items: KitItem[] };

export type ToolGroup = { group: string; options: string[] };

/** Proficiência em ferramenta à escolha do jogador. */
export type BackgroundToolChoice = {
  label: string;
  /** Quantas ferramentas diferentes escolher. */
  count: number;
  from: ToolGroup[];
  /** Cada escolha precisa vir de um grupo diferente (ex.: instrumento e jogo, não dois instrumentos). */
  distinctGroups?: boolean;
  /** A ferramenta escolhida também faz parte do equipamento e vai para o inventário. */
  addsItem?: boolean;
};

export type BackgroundKit = {
  /** Itens que sempre vêm. */
  items: KitItem[];
  /** Grupos "um ou outro" do equipamento (o primeiro é o padrão). */
  choices?: KitOption[][];
  /** Ouro inicial em po. */
  gold: number;
  /** Proficiências fixas em ferramentas e veículos. */
  tools?: string[];
  toolChoices?: BackgroundToolChoice[];
};

const INSTRUMENTS: ToolGroup = { group: "Instrumentos musicais", options: MUSICAL_INSTRUMENTS };
const GAMES: ToolGroup = { group: "Kits de jogo", options: GAMING_SETS };
const ARTISAN: ToolGroup = { group: "Ferramentas de artesão", options: ARTISAN_TOOLS };
const THIEVES: ToolGroup = { group: "Ferramentas de ladrão", options: ["Ferramentas de Ladrão"] };

const ROUPAS_COMUNS: KitItem = { item: "Roupas Comuns" };
const ROUPAS_VIAJANTE: KitItem = { item: "Roupas de Viajante" };
const ROUPAS_FINAS: KitItem = { item: "Roupas Finas" };

export const BACKGROUND_KITS: Record<string, BackgroundKit> = {
  "Acólito": {
    items: [
      { item: "Símbolo Sagrado" },
      { item: "Livro de orações", note: "Livro de preces da sua fé" },
      { item: "Bastões de incenso", qty: 5 },
      { item: "Vestimentas", note: "Vestes cerimoniais do seu templo" },
      ROUPAS_COMUNS,
    ],
    gold: 15,
  },
  "Agente": {
    items: [
      { item: "Emblema da organização", note: "Identifica você como agente da sua organização" },
      { item: "Livro de códigos", note: "Cifras usadas pela sua organização" },
      ROUPAS_COMUNS,
    ],
    gold: 15,
  },
  "Artesão de Guilda": {
    items: [{ item: "Carta de referência da guilda", note: "Apresenta você como membro da guilda" }, ROUPAS_VIAJANTE],
    gold: 15,
    toolChoices: [{ label: "Ferramenta de artesão", count: 1, from: [ARTISAN], addsItem: true }],
  },
  "Artista (Entretenimento)": {
    items: [
      { item: "Lembrança de um admirador", note: "Carta de amor, mecha de cabelo ou bijuteria" },
      { item: "Roupas de Entretenimento" },
    ],
    gold: 15,
    tools: ["Kit de Disfarce"],
    toolChoices: [{ label: "Instrumento musical", count: 1, from: [INSTRUMENTS], addsItem: true }],
  },
  "Caçador de Recompensas": {
    items: [{ item: "Roupas da profissão", note: "Roupas apropriadas para caçar recompensas" }],
    gold: 20,
    toolChoices: [
      {
        label: "Duas entre ferramentas de ladrão, instrumento musical ou jogo",
        count: 2,
        from: [THIEVES, INSTRUMENTS, GAMES],
        distinctGroups: true,
      },
    ],
  },
  "Cavaleiro da Ordem": {
    items: [ROUPAS_VIAJANTE],
    choices: [
      [
        { label: "Estandarte da ordem", items: [{ item: "Estandarte da ordem" }] },
        { label: "Sinete da ordem", items: [{ item: "Sinete", note: "Com o brasão da sua ordem" }] },
        { label: "Selo da ordem", items: [{ item: "Selo da ordem" }] },
      ],
    ],
    gold: 10,
    toolChoices: [{ label: "Instrumento musical ou jogo", count: 1, from: [INSTRUMENTS, GAMES] }],
  },
  "Charlatão": {
    items: [ROUPAS_FINAS, { item: "Kit de Disfarce" }],
    choices: [
      [
        {
          label: "Golpe favorito: 10 garrafas tampadas com líquido colorido",
          items: [{ item: "Garrafas tampadas com líquido colorido", qty: 10 }],
        },
        { label: "Golpe favorito: dados viciados", items: [{ item: "Dados viciados", note: "Ferramenta do seu golpe favorito" }] },
        {
          label: "Golpe favorito: baralho de cartas marcadas",
          items: [{ item: "Baralho de cartas marcadas", note: "Ferramenta do seu golpe favorito" }],
        },
        {
          label: "Golpe favorito: sinete de um duque imaginário",
          items: [{ item: "Sinete de um duque imaginário", note: "Ferramenta do seu golpe favorito" }],
        },
      ],
    ],
    gold: 15,
    tools: ["Kit de Disfarce", "Kit de Falsificação"],
  },
  "Cortesão": {
    items: [ROUPAS_FINAS],
    gold: 5,
  },
  "Criminoso": {
    items: [{ item: "Pé de Cabra" }, { item: "Roupas Comuns", note: "Roupas escuras com capuz" }],
    gold: 15,
    tools: ["Ferramentas de Ladrão"],
    toolChoices: [{ label: "Kit de jogo", count: 1, from: [GAMES] }],
  },
  "Eremita": {
    items: [
      { item: "Porta-Mapas ou Pergaminhos", note: "Cheio de anotações dos seus estudos ou orações" },
      { item: "Cobertor de Inverno" },
      ROUPAS_COMUNS,
      { item: "Kit de Herbalismo" },
    ],
    gold: 5,
    tools: ["Kit de Herbalismo"],
  },
  "Escolástico": {
    items: [
      { item: "Robes", note: "Robes da sua ordem" },
      { item: "Kit de escrita", note: "Pena, tinta, pergaminho dobrado e um canivete" },
      { item: "Livro emprestado", note: "Sobre um assunto do seu interesse" },
    ],
    gold: 10,
  },
  "Forasteiro": {
    items: [
      { item: "Bordão" },
      { item: "Armadilha de Caça" },
      { item: "Troféu de uma presa", note: "De um animal que você matou" },
      ROUPAS_VIAJANTE,
    ],
    gold: 10,
    toolChoices: [{ label: "Instrumento musical", count: 1, from: [INSTRUMENTS] }],
  },
  "Guarda da Cidade": {
    items: [
      { item: "Uniforme da guarda" },
      { item: "Chifre de sinal", note: "Para dar o alarme" },
      { item: "Algemas" },
    ],
    gold: 10,
  },
  "Herdeiro": {
    items: [{ item: "Herança", note: "Documento, relíquia ou objeto que prova sua herança" }, ROUPAS_VIAJANTE],
    gold: 15,
    toolChoices: [{ label: "Instrumento musical ou jogo", count: 1, from: [INSTRUMENTS, GAMES], addsItem: true }],
  },
  "Herói do Povo": {
    items: [{ item: "Pá" }, { item: "Panela de Ferro" }, ROUPAS_COMUNS],
    gold: 10,
    tools: ["Veículos (terrestres)"],
    toolChoices: [{ label: "Ferramenta de artesão", count: 1, from: [ARTISAN], addsItem: true }],
  },
  "Marujo (Navegante)": {
    items: [
      { item: "Porrete" },
      { item: "Corda de Seda (15 metros)" },
      { item: "Amuleto da sorte", note: "Pé de coelho ou pedra com um furo no meio" },
      ROUPAS_COMUNS,
    ],
    gold: 10,
    tools: ["Ferramentas de Navegação", "Veículos (aquáticos)"],
  },
  "Mercenário Veterano": {
    items: [{ item: "Uniforme da companhia" }, { item: "Insígnia de posto" }],
    gold: 10,
    tools: ["Veículos (terrestres)"],
    toolChoices: [{ label: "Kit de jogo", count: 1, from: [GAMES], addsItem: true }],
  },
  "Meretriz": {
    items: [{ item: "Capa longa" }, ROUPAS_COMUNS, { item: "Roupas reveladoras" }],
    gold: 15,
    toolChoices: [{ label: "Jogo ou instrumento musical", count: 1, from: [GAMES, INSTRUMENTS] }],
  },
  "Nobre": {
    items: [ROUPAS_FINAS, { item: "Sinete" }, { item: "Pergaminho de linhagem", note: "Identificação da sua linhagem" }],
    gold: 25,
    toolChoices: [{ label: "Kit de jogo", count: 1, from: [GAMES] }],
  },
  "Órfão": {
    items: [
      { item: "Faca pequena" },
      { item: "Mapa da cidade natal", note: "Da cidade onde você cresceu" },
      { item: "Bichinho de estimação", note: "Um camundongo ou outro animal pequeno" },
      { item: "Lembrança dos pais" },
      ROUPAS_COMUNS,
    ],
    gold: 10,
    tools: ["Kit de Disfarce", "Ferramentas de Ladrão"],
  },
  "Sábio": {
    items: [
      { item: "Tinta (frasco de 30 ml)", note: "Tinta preta" },
      { item: "Caneta Tinteiro" },
      { item: "Faca pequena" },
      { item: "Carta com uma pergunta sem resposta", note: "De um colega já morto" },
      ROUPAS_COMUNS,
    ],
    gold: 10,
  },
  "Soldado": {
    items: [
      { item: "Insígnia de patente" },
      { item: "Troféu de um oponente caído", note: "Adaga, lâmina quebrada ou pedaço de estandarte" },
      ROUPAS_COMUNS,
    ],
    gold: 10,
    tools: ["Veículos (terrestres)"],
    toolChoices: [{ label: "Kit de jogo", count: 1, from: [GAMES], addsItem: true }],
  },
  "Viajante Distante": {
    items: [
      ROUPAS_VIAJANTE,
      { item: "Mapa simples", note: "Mostra onde você está em relação à sua terra natal" },
      { item: "Joia da terra natal", note: "Vale 15 po" },
    ],
    gold: 5,
    toolChoices: [
      { label: "Instrumento musical ou jogo da sua terra natal", count: 1, from: [INSTRUMENTS, GAMES], addsItem: true },
    ],
  },
};

function norm(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

const KIT_BY_NAME = new Map(Object.entries(BACKGROUND_KITS).map(([name, kit]) => [norm(name), kit]));

export function findBackgroundKit(name: string): BackgroundKit | undefined {
  return KIT_BY_NAME.get(norm(name));
}

export function toolChoiceOptions(choice: BackgroundToolChoice): string[] {
  return choice.from.flatMap((group) => group.options);
}

/** Grupo ao qual pertence uma ferramenta escolhida. */
export function toolGroupOf(choice: BackgroundToolChoice, tool: string): string | undefined {
  return choice.from.find((group) => group.options.includes(tool))?.group;
}

export type BackgroundGrants = { items: Item[]; gold: number; tools: string[] };

/** Itens, ouro e proficiências em ferramentas que o antecedente dá, com as escolhas do jogador. */
export function backgroundGrants(
  name: string,
  equipmentChoices: readonly number[] = [],
  toolPicks: readonly (readonly string[])[] = [],
): BackgroundGrants {
  const kit = findBackgroundKit(name);
  if (!kit) return { items: [], gold: 0, tools: [] };
  const refs: KitItem[] = [...kit.items];
  (kit.choices ?? []).forEach((group, index) => {
    const option = group[equipmentChoices[index] ?? 0] ?? group[0];
    if (option) refs.push(...option.items);
  });
  const tools = [...(kit.tools ?? [])];
  (kit.toolChoices ?? []).forEach((choice, index) => {
    const options = toolChoiceOptions(choice);
    for (const pick of toolPicks[index] ?? []) {
      if (!pick || !options.includes(pick) || tools.includes(pick)) continue;
      tools.push(pick);
      if (choice.addsItem) refs.push({ item: pick });
    }
  });
  const items = refs.map((ref) => {
    const item = itemFromName(ref.item, ref.qty ?? 1);
    return ref.note ? { ...item, description: ref.note } : item;
  });
  return { items: mergeItems([], items), gold: kit.gold, tools };
}

/** Rótulo da primeira escolha de ferramenta incompleta ou inválida (null = tudo certo). */
export function missingToolChoice(name: string, toolPicks: readonly (readonly string[])[] = []): string | null {
  const kit = findBackgroundKit(name);
  for (const [index, choice] of (kit?.toolChoices ?? []).entries()) {
    const picks = (toolPicks[index] ?? []).filter(Boolean);
    const options = toolChoiceOptions(choice);
    const valid =
      picks.length === choice.count &&
      new Set(picks).size === picks.length &&
      picks.every((pick) => options.includes(pick)) &&
      (!choice.distinctGroups || new Set(picks.map((pick) => toolGroupOf(choice, pick))).size === picks.length);
    if (!valid) return choice.label;
  }
  return null;
}
