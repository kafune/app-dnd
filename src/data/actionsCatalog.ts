/**
 * Economia de turno (D&D 5e, PT-BR, cap. 9 "Combate").
 *
 * O que todo personagem pode fazer num turno — e as características/talentos que
 * mudam isso (Ação Ardilosa, Surto de Ação, Rajada de Golpes…). A aba "Ações" da
 * ficha monta a lista a partir daqui + das características que o personagem tem.
 */

/** Onde a opção cabe no turno. */
export type ActionSlot = "acao" | "bonus" | "movimento" | "reacao" | "livre";

export const ACTION_SLOT_LABELS: Record<ActionSlot, string> = {
  acao: "Ação Principal",
  bonus: "Ação Bônus",
  movimento: "Movimento",
  reacao: "Reação",
  livre: "Ação Livre / Interação",
};

export const ACTION_SLOT_ORDER: ActionSlot[] = ["acao", "bonus", "movimento", "reacao", "livre"];

export type ActionOption = {
  name: string;
  slot: ActionSlot;
  description: string;
  /** De onde vem (ausente = regra básica do livro). */
  source?: string;
};

/** Ações disponíveis a qualquer personagem (PHB cap. 9). */
export const BASE_ACTIONS: ActionOption[] = [
  {
    name: "Atacar",
    slot: "acao",
    description:
      "Um ataque corpo a corpo ou à distância com uma arma (ou desarmado). Role 1d20 + modificador do atributo + bônus de proficiência (se for proficiente) contra a CA do alvo. Características como Ataque Extra permitem mais de um ataque nesta mesma ação.",
  },
  {
    name: "Conjurar uma Magia",
    slot: "acao",
    description:
      "Conjura uma magia cujo tempo de conjuração seja 1 ação. Só é possível conjurar uma magia usando um espaço por turno se você já tiver conjurado outra com ação bônus (nesse caso, a segunda precisa ser um truque de 1 ação).",
  },
  {
    name: "Desengajar",
    slot: "acao",
    description:
      "Seu movimento não provoca ataques de oportunidade pelo resto do turno.",
  },
  {
    name: "Esconder-se",
    slot: "acao",
    description:
      "Faça um teste de Destreza (Furtividade). Se passar, você fica escondido de quem não puder vê-lo: ataques contra alvos que não o enxergam têm vantagem, e os ataques deles contra você têm desvantagem.",
  },
  {
    name: "Esquivar",
    slot: "acao",
    description:
      "Até o começo do seu próximo turno, ataques contra você têm desvantagem (se você puder ver quem ataca) e você tem vantagem em testes de resistência de Destreza. Perde o efeito se ficar incapacitado ou com deslocamento 0.",
  },
  {
    name: "Ajudar",
    slot: "acao",
    description:
      "Dê vantagem no próximo teste de habilidade de um aliado numa tarefa em que você poderia ajudar, ou vantagem no próximo ataque de um aliado contra uma criatura a até 1,5 m de você. Vale até o começo do seu próximo turno.",
  },
  {
    name: "Preparar",
    slot: "acao",
    description:
      "Escolha um gatilho perceptível e a reação que você tomará quando ele acontecer (“se o goblin sair da porta, eu atiro”). A reação preparada gasta a sua reação do turno; manter uma magia preparada exige concentração.",
  },
  {
    name: "Agarrar",
    slot: "acao",
    description:
      "Substitui um dos seus ataques. Teste de Força (Atletismo) contra Força (Atletismo) ou Destreza (Acrobacia) do alvo — o alvo precisa estar a no máximo uma categoria de tamanho acima da sua. Agarrado, o deslocamento dele vira 0.",
  },
  {
    name: "Empurrar",
    slot: "acao",
    description:
      "Substitui um dos seus ataques. Teste de Força (Atletismo) contra Força (Atletismo) ou Destreza (Acrobacia) do alvo. Se passar, você derruba o alvo ou o empurra 1,5 m para longe.",
  },
  {
    name: "Usar um Objeto",
    slot: "acao",
    description:
      "Interagir com um segundo objeto no turno (a primeira interação é gratuita) ou usar um objeto que exija uma ação, como beber uma poção ou acender uma tocha com pederneira.",
  },
  {
    name: "Conjurar Magia de Ação Bônus",
    slot: "bonus",
    description:
      "Só magias cujo tempo de conjuração seja “1 ação bônus”. Depois de conjurar uma magia assim no turno, a única outra magia que você pode conjurar no mesmo turno é um truque de 1 ação.",
  },
  {
    name: "Atacar com a Segunda Arma",
    slot: "bonus",
    description:
      "Combate com duas armas: ao usar a ação de Atacar com uma arma corpo a corpo leve numa mão, você pode atacar com outra arma corpo a corpo leve na outra mão. Não soma o modificador de atributo ao dano dessa segunda arma (a menos que ele seja negativo).",
  },
  {
    name: "Andar / Correr",
    slot: "movimento",
    description:
      "Você pode gastar até o seu deslocamento no turno, dividindo-o entre as ações. Terreno difícil custa o dobro, e mover-se por 1,5 m agachado custa 1,5 m a mais.",
  },
  {
    name: "Levantar-se",
    slot: "movimento",
    description:
      "Sair da condição caído custa metade do seu deslocamento. Com deslocamento 0, você não consegue se levantar.",
  },
  {
    name: "Disparada",
    slot: "acao",
    description: "Ganhe deslocamento extra igual ao seu deslocamento neste turno.",
  },
  {
    name: "Ataque de Oportunidade",
    slot: "reacao",
    description:
      "Quando uma criatura hostil que você possa ver sai do seu alcance corpo a corpo, você pode gastar sua reação para fazer um ataque corpo a corpo contra ela. Só um ataque, e ela precisa sair do alcance usando movimento (não teleporte).",
  },
  {
    name: "Conjurar Magia de Reação",
    slot: "reacao",
    description:
      "Magias com tempo de conjuração “1 reação” (ex.: escudo arcano, contramágica) são conjuradas quando o gatilho descrito na magia acontece.",
  },
  {
    name: "Reação Preparada",
    slot: "reacao",
    description: "Executa o gatilho combinado na ação Preparar deste turno ou do turno anterior.",
  },
  {
    name: "Interagir com um Objeto",
    slot: "livre",
    description:
      "Uma interação gratuita por turno: sacar ou guardar uma arma, abrir uma porta, pegar um item caído, beber de um odre já na mão.",
  },
  {
    name: "Falar",
    slot: "livre",
    description: "Frases curtas cabem no seu turno sem custo nenhum.",
  },
];

/** Efeito de uma característica/talento sobre a economia de turno. */
export type ActionModifier = {
  /** Nome normalizado da característica ou talento (sem acento, minúsculo). */
  match: string;
  /** Opções que a característica acrescenta. */
  adds?: Omit<ActionOption, "source">[];
  /** Ajustes de contagem: +1 ação, +1 reação, mais ataques na ação de Atacar. */
  extraActions?: number;
  extraReactions?: number;
  /** Ataques por ação de Atacar (o valor final é o maior encontrado). */
  attacksPerAction?: number;
  /** Observação mostrada no topo da aba. */
  note?: string;
};

/**
 * Características e talentos que mudam o que cabe no turno.
 *
 * A chave `match` é comparada com o nome normalizado da característica da ficha —
 * qualquer característica cujo nome comece por ela conta (pega "Ataque Extra (2)",
 * "Ação Ardilosa Aprimorada"…).
 */
export const ACTION_MODIFIERS: ActionModifier[] = [
  {
    match: "acao ardilosa",
    adds: [
      { name: "Disparada (Ação Ardilosa)", slot: "bonus", description: "O Ladino pode Disparar como ação bônus em cada turno." },
      { name: "Desengajar (Ação Ardilosa)", slot: "bonus", description: "O Ladino pode Desengajar como ação bônus em cada turno." },
      { name: "Esconder-se (Ação Ardilosa)", slot: "bonus", description: "O Ladino pode se Esconder como ação bônus em cada turno." },
    ],
  },
  {
    match: "mira firme",
    adds: [
      {
        name: "Mira Firme",
        slot: "bonus",
        description:
          "Conceda a si mesmo vantagem na sua próxima jogada de ataque do turno. Só funciona se você ainda não tiver se movido no turno e, depois de usar, seu deslocamento vira 0 até o fim do turno.",
      },
    ],
  },
  {
    match: "surto de acao",
    extraActions: 1,
    note: "Surto de Ação: uma vez por descanso curto ou longo, você ganha 1 ação extra no turno.",
  },
  { match: "ataque extra", attacksPerAction: 2 },
  {
    match: "furia",
    adds: [{ name: "Entrar em Fúria", slot: "bonus", description: "Entre em fúria como ação bônus: vantagem em testes e salvaguardas de Força, bônus de dano corpo a corpo e resistência a concussão, cortante e perfurante." }],
  },
  {
    match: "artes marciais",
    adds: [
      {
        name: "Ataque Desarmado (Artes Marciais)",
        slot: "bonus",
        description: "Depois de atacar com um ataque desarmado ou arma de monge na ação de Atacar, faça um ataque desarmado como ação bônus.",
      },
    ],
  },
  {
    match: "rajada de golpes",
    adds: [{ name: "Rajada de Golpes", slot: "bonus", description: "Gaste 1 ponto de ki depois da ação de Atacar para fazer dois ataques desarmados como ação bônus." }],
  },
  {
    match: "defesa paciente",
    adds: [{ name: "Defesa Paciente", slot: "bonus", description: "Gaste 1 ponto de ki para realizar a ação de Esquivar como ação bônus." }],
  },
  {
    match: "passo do vento",
    adds: [{ name: "Passo do Vento", slot: "bonus", description: "Gaste 1 ponto de ki para realizar Disparada ou Desengajar como ação bônus; seu salto dobra de distância no turno." }],
  },
  {
    match: "inspiracao de bardo",
    adds: [{ name: "Inspiração de Bardo", slot: "bonus", description: "Conceda um dado de inspiração a uma criatura a até 18 m que possa ouvi-lo." }],
  },
  {
    match: "canalizar divindade",
    adds: [{ name: "Canalizar Divindade", slot: "acao", description: "Canalize energia divina num dos efeitos do seu domínio (a maioria custa uma ação; confira a sua subclasse)." }],
  },
  {
    match: "cura pelas maos",
    adds: [{ name: "Cura pelas Mãos", slot: "acao", description: "Toque uma criatura e gaste pontos da sua reserva de cura (5 × nível de paladino) para restaurar PV ou curar uma doença/veneno (5 pontos)." }],
  },
  {
    match: "retomar o folego",
    adds: [{ name: "Retomar o Fôlego", slot: "bonus", description: "Recupere 1d10 + seu nível de guerreiro em PV. Recarrega com descanso curto ou longo." }],
  },
  {
    match: "forma selvagem",
    adds: [{ name: "Forma Selvagem", slot: "acao", description: "Assuma a forma de uma fera que já tenha visto (Druida da Lua usa ação bônus a partir do 2º nível)." }],
  },
  {
    match: "esquiva sobrenatural",
    adds: [{ name: "Esquiva Sobrenatural", slot: "reacao", description: "Reduza pela metade o dano de um ataque de um inimigo que você possa ver." }],
  },
  {
    match: "sentinela",
    adds: [{ name: "Sentinela (talento)", slot: "reacao", description: "Faça um ataque de oportunidade quando uma criatura a até 1,5 m atacar um alvo que não seja você; e acertar um ataque de oportunidade zera o deslocamento do alvo no turno." }],
  },
  {
    match: "combatente montado",
    adds: [{ name: "Proteger a Montaria", slot: "reacao", description: "Redirecione para você um ataque feito contra a sua montaria a até 1,5 m." }],
  },
  {
    match: "protetor",
    adds: [{ name: "Proteger Aliado", slot: "reacao", description: "Imponha desvantagem num ataque contra um aliado a até 1,5 m de você (estilo de luta Proteção; requer escudo)." }],
  },
  {
    match: "mestre de escudo",
    adds: [{ name: "Empurrão com Escudo", slot: "bonus", description: "Depois da ação de Atacar, tente empurrar uma criatura a até 1,5 m com o escudo (derrubando-a ou afastando-a 1,5 m)." }],
  },
  {
    match: "especialista em briga",
    adds: [{ name: "Agarrar (Especialista em Briga)", slot: "bonus", description: "Depois de acertar uma criatura com um ataque desarmado, tente agarrá-la como ação bônus." }],
  },
  {
    match: "ambidestro",
    note: "Ambidestro: você pode usar armas de uma mão que não sejam leves no combate com duas armas e ganha +1 de CA enquanto empunha duas armas corpo a corpo.",
  },
  {
    match: "mestre de armas grandes",
    adds: [{ name: "Ataque Extra (Armas Grandes)", slot: "bonus", description: "Ao reduzir uma criatura a 0 PV ou acertar um crítico com arma corpo a corpo, faça um ataque corpo a corpo como ação bônus." }],
  },
  {
    match: "especialista em besta",
    note: "Especialista em Besta: você ignora a propriedade Recarga das bestas em que é proficiente e pode atacar com uma besta de mão como ação bônus.",
  },
  {
    match: "investida poderosa",
    note: "Investida Poderosa: ao usar Disparada, gaste a ação bônus para um ataque corpo a corpo (+5 de dano) ou um empurrão de 3 m.",
  },
  {
    match: "adepto marcial",
    adds: [{ name: "Manobra de Superioridade", slot: "bonus", description: "Você tem 1 dado de superioridade (d6) e duas manobras à escolha; algumas delas usam a sua ação bônus." }],
  },
  {
    match: "magia acelerada",
    adds: [{ name: "Magia Acelerada", slot: "bonus", description: "Gaste 2 pontos de feitiçaria para conjurar como ação bônus uma magia cujo tempo de conjuração seja 1 ação." }],
  },
  {
    match: "conjurador de guerra",
    adds: [{ name: "Contra-ataque Mágico", slot: "reacao", description: "Em vez de um ataque de oportunidade, conjure uma magia de 1 ação que tenha um único alvo contra quem provocou a reação." }],
  },
  {
    match: "duelista defensivo",
    adds: [{ name: "Aparar (Duelista Defensivo)", slot: "reacao", description: "Ao ser acertado por um ataque corpo a corpo, some seu bônus de proficiência à CA contra esse ataque (empunhando uma arma de acuidade)." }],
  },
  {
    match: "imobilizador",
    note: "Imobilizador: você pode agarrar criaturas até duas categorias maiores que a sua e um agarrão bem-sucedido pode deixar o alvo contido.",
  },
  {
    match: "movimento rapido",
    note: "Movimento Rápido (Bárbaro): +3 m de deslocamento enquanto não estiver usando armadura pesada.",
  },
  {
    match: "movimento sem armadura",
    note: "Movimento sem Armadura (Monge): deslocamento extra enquanto não usar armadura nem escudo.",
  },
];
