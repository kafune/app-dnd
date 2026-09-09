import type { RaceDef, RaceTraitDef, SubraceDef } from "@/lib/types";

/**
 * Catálogo de raças (PT-BR) com traços completos e efeitos mecânicos.
 *
 * - Livro do Jogador (PHB, cap. 2): as 9 raças e todas as sub-raças, autoradas
 *   a partir do texto do livro.
 * - Guia de Volo (VGtM), Elemental Evil (EEPC), Tomo de Mordenkainen (MToF) e
 *   The Tortle Package: raças usadas na mesa, autoradas a partir das regras oficiais.
 * - Homebrew: Thri-kreen (não existe versão oficial em 5e 2014).
 *
 * Nomes de magias em `spells` são idênticos aos de `spellsCatalog.json`.
 */

// ---------------------------------------------------------------------------
// Traços reaproveitados
// ---------------------------------------------------------------------------

function visaoNoEscuro(prefixo: string): RaceTraitDef {
  return {
    name: "Visão no Escuro",
    description:
      prefixo +
      " você tem uma visão superior no escuro e na penumbra. " +
      "Você enxerga na penumbra a até 18 metros como se fosse luz plena, e no escuro como se fosse na penumbra. " +
      "Você não pode discernir cores no escuro, apenas tons de cinza.",
  };
}

const CONSTITUICAO_PODEROSA: RaceTraitDef = {
  name: "Constituição Poderosa",
  description:
    "Você conta como uma criatura de um tamanho maior ao determinar sua capacidade de carga e o peso que você pode empurrar, arrastar ou levantar.",
};

const ANCESTRAL_FEERICO: RaceTraitDef = {
  name: "Ancestral Feérico",
  description:
    "Você tem vantagem nos testes de resistência para resistir a ser enfeitiçado, e magias não podem colocá-lo para dormir.",
};

const TREINAMENTO_ELFICO_ARMAS: RaceTraitDef = {
  name: "Treinamento Élfico com Armas",
  description: "Você possui proficiência com espadas longas, espadas curtas, arcos longos e arcos curtos.",
  proficiencies: ["Espada longa", "Espada curta", "Arco longo", "Arco curto"],
};

const SENSIBILIDADE_LUZ_SOLAR: RaceTraitDef = {
  name: "Sensibilidade à Luz Solar",
  description:
    "Você possui desvantagem nas jogadas de ataque e nos testes de Sabedoria (Percepção) relacionados à visão quando você, o alvo do seu ataque ou qualquer coisa que você esteja tentando perceber estiver sob luz solar direta.",
};

/** Truques da lista do mago presentes no catálogo de magias (para o traço Truque do Alto Elfo). */
const TRUQUES_DE_MAGO = [
  "Amizade",
  "Ataque Certeiro",
  "Chicote Elétrico",
  "Consertar",
  "Controlar Chamas",
  "Criar Fogueira",
  "Espirro Ácido",
  "Farpa Mental",
  "Globos de Luz",
  "Golpe Trovejante",
  "Ilusão Menor",
  "Infestação",
  "Lufada",
  "Luz",
  "Lâmina da Chama Esverdeada",
  "Lâmina Estrondosa",
  "Mensagem",
  "Mãos Mágicas",
  "Picada Congelante",
  "Prestidigitação",
  "Proteção Contra Lâminas",
  "Raio de Fogo",
  "Raio de Gelo",
  "Rajada de Veneno",
  "Rompante de Espadas",
  "Soar Os Mortos",
  "Toque Arrepiante",
  "Toque Chocante",
];

// ---------------------------------------------------------------------------
// Livro do Jogador
// ---------------------------------------------------------------------------

const ANAO: RaceDef = {
  name: "Anão",
  source: "PHB",
  description:
    "Ousados e resistentes, os anões são conhecidos como hábeis guerreiros, mineradores e trabalhadores em pedra e metal. Vivem em reinos escavados nas montanhas e valorizam clã, tradição e honra.",
  abilityScoreIncrease: { con: 2 },
  size: "Médio",
  speed: 7.5,
  languages: ["Comum", "Anão"],
  extraLanguages: 0,
  subraceRequired: true,
  traits: [
    {
      name: "Deslocamento Anão",
      description:
        "Seu deslocamento base de caminhada é de 7,5 metros. Seu deslocamento não é reduzido quando estiver usando armadura pesada.",
    },
    visaoNoEscuro("Acostumado à vida subterrânea,"),
    {
      name: "Resiliência Anã",
      description: "Você possui vantagem em testes de resistência contra veneno e resistência contra dano de veneno.",
    },
    {
      name: "Treinamento Anão em Combate",
      description: "Você tem proficiência com machados de batalha, machadinhas, martelos leves e martelos de guerra.",
      proficiencies: ["Machado de batalha", "Machadinha", "Martelo leve", "Martelo de guerra"],
    },
    {
      name: "Proficiência com Ferramentas",
      description:
        "Você tem proficiência em uma ferramenta de artesão à sua escolha entre: ferramentas de ferreiro, suprimentos de cervejeiro ou ferramentas de pedreiro.",
      choice: {
        label: "Ferramenta de artesão",
        options: ["Ferramentas de ferreiro", "Suprimentos de cervejeiro", "Ferramentas de pedreiro"],
      },
    },
    {
      name: "Especialização em Rochas",
      description:
        "Sempre que você realizar um teste de Inteligência (História) relacionado à origem de um trabalho em pedra, você é considerado proficiente na perícia História e adiciona o dobro do seu bônus de proficiência ao teste, ao invés do seu bônus de proficiência normal.",
    },
  ],
  subraces: [
    {
      name: "Anão da Colina",
      source: "PHB",
      description:
        "Sentidos aguçados, maior intuição e notável resiliência. Os anões dourados de Faerûn e os Neidar de Krynn são anões da colina.",
      abilityScoreIncrease: { wis: 1 },
      traits: [
        {
          name: "Tenacidade Anã",
          description:
            "Seu máximo de pontos de vida aumenta em 1, e cada vez que você sobe um nível, você recebe 1 ponto de vida adicional.",
        },
      ],
    },
    {
      name: "Anão da Montanha",
      source: "PHB",
      description:
        "Forte e resistente, acostumado a uma vida difícil em terrenos difíceis. Os anões do escudo do norte de Faerûn e os clãs Hylar e Daewar de Dragonlance são anões da montanha.",
      abilityScoreIncrease: { str: 2 },
      traits: [
        {
          name: "Treinamento Anão com Armaduras",
          description: "Você adquire proficiência em armaduras leves e médias.",
          proficiencies: ["Armaduras leves", "Armaduras médias"],
        },
      ],
    },
  ],
};

const ELFO: RaceDef = {
  name: "Elfo",
  source: "PHB",
  description:
    "Elfos são um povo mágico de graça sobrenatural, vivendo no mundo sem pertencer inteiramente a ele. Amam a natureza e a magia, a arte e o estudo, a música e a poesia.",
  abilityScoreIncrease: { dex: 2 },
  size: "Médio",
  speed: 9,
  languages: ["Comum", "Élfico"],
  extraLanguages: 0,
  subraceRequired: true,
  traits: [
    visaoNoEscuro("Acostumado às florestas crepusculares e ao céu noturno,"),
    {
      name: "Sentidos Aguçados",
      description: "Você tem proficiência na perícia Percepção.",
      skills: ["Percepção"],
    },
    ANCESTRAL_FEERICO,
    {
      name: "Transe",
      description:
        "Elfos não precisam dormir. Ao invés disso, eles meditam profundamente, permanecendo semiconscientes, durante 4 horas por dia. (A palavra em idioma Comum para tal meditação é \"transe\".) Enquanto medita, um elfo é capaz de sonhar de certo modo; esses sonhos na verdade são exercícios mentais que se tornam reflexos através de anos de prática. Depois de descansar dessa forma, você ganha os mesmos benefícios que um humano depois de 8 horas de sono.",
    },
  ],
  subraces: [
    {
      name: "Alto Elfo",
      source: "PHB",
      description:
        "Mente afiada e domínio básico da magia. Inclui os elfos do sol e os elfos da lua dos Reinos Esquecidos, os Silvanesti e Qualinesti de Dragonlance e os elfos cinzentos de Greyhawk.",
      abilityScoreIncrease: { int: 1 },
      traits: [
        TREINAMENTO_ELFICO_ARMAS,
        {
          name: "Truque",
          description:
            "Você conhece um truque, à sua escolha, da lista de truques do mago. Inteligência é a habilidade usada para conjurar esse truque.",
          choice: { label: "Truque de mago", options: TRUQUES_DE_MAGO },
        },
        {
          name: "Idioma Adicional",
          description: "Você pode falar, ler e escrever um idioma adicional à sua escolha.",
          extraLanguages: 1,
        },
      ],
    },
    {
      name: "Elfo da Floresta",
      source: "PHB",
      description:
        "Sentidos e intuição aguçados; pés ágeis guiam-no rápida e furtivamente pelas florestas nativas. Inclui os elfos selvagens (grugach) de Greyhawk e os Kagonesti de Dragonlance.",
      abilityScoreIncrease: { wis: 1 },
      speed: 10.5,
      traits: [
        TREINAMENTO_ELFICO_ARMAS,
        {
          name: "Pés Ligeiros",
          description: "Seu deslocamento base de caminhada aumenta para 10,5 metros.",
        },
        {
          name: "Máscara da Natureza",
          description:
            "Você pode tentar se esconder mesmo quando estiver apenas levemente obscurecido por folhagem, chuva forte, neve caindo, névoa ou outro fenômeno natural.",
        },
      ],
    },
    {
      name: "Elfo Negro (Drow)",
      source: "PHB",
      description:
        "Descendentes de uma antiga sub-raça de elfos banida da superfície por seguir a deusa Lolth. Pele negra como obsidiana, cabelos brancos e olhos muito pálidos. Verifique com o Mestre se a raça está disponível.",
      abilityScoreIncrease: { cha: 1 },
      traits: [
        {
          name: "Visão no Escuro Superior",
          description: "Sua visão no escuro tem alcance de 36 metros.",
        },
        SENSIBILIDADE_LUZ_SOLAR,
        {
          name: "Magia Drow",
          description:
            "Você conhece o truque globos de luz. Quando você alcança o 3º nível, você pode conjurar a magia fogo das fadas uma vez. Quando você alcança o 5º nível, você também pode conjurar escuridão uma vez. Você precisa terminar um descanso longo para poder conjurar as magias desse traço novamente. Carisma é sua habilidade de conjuração para essas magias.",
          spells: ["Globos de Luz", "Fogo das Fadas", "Escuridão"],
        },
        {
          name: "Treinamento Drow com Armas",
          description: "Você possui proficiência com rapieiras, espadas curtas e bestas de mão.",
          proficiencies: ["Rapieira", "Espada curta", "Besta de mão"],
        },
      ],
    },
    {
      name: "Shadar-Kai",
      source: "MToF",
      description:
        "Elfos de Shadowfell ligados à Rainha Corvo, marcados pela sombra: pele pálida ou acinzentada, olhos sem brilho e um distanciamento melancólico do mundo material.",
      abilityScoreIncrease: { con: 1 },
      traits: [
        {
          name: "Resistência Necrótica",
          description: "Você tem resistência a dano necrótico.",
        },
        {
          name: "Bênção da Rainha Corvo",
          description:
            "Com uma ação bônus, você pode se teleportar magicamente até 9 metros para um espaço desocupado que possa ver. Depois de usar esse traço, você não pode usá-lo novamente até terminar um descanso longo. A partir do 3º nível, você também ganha resistência a todo dano quando se teleporta usando esse traço; a resistência dura até o início do seu próximo turno, e durante esse tempo você parece fantasmagórico e translúcido.",
        },
      ],
    },
  ],
};

const HALFLING: RaceDef = {
  name: "Halfling",
  source: "PHB",
  description:
    "Os halflings buscam o conforto do lar, uma boa refeição e a companhia de amigos, e são notavelmente furtivos e sortudos. Vivem em comunidades pequenas e pacíficas ou entre outras raças, onde sua lealdade e trabalho duro são bem-vindos.",
  abilityScoreIncrease: { dex: 2 },
  size: "Pequeno",
  speed: 7.5,
  languages: ["Comum", "Halfling"],
  extraLanguages: 0,
  subraceRequired: true,
  traits: [
    {
      name: "Sortudo",
      description:
        "Quando você obtiver um 1 natural em uma jogada de ataque, teste de habilidade ou teste de resistência, você pode jogar de novo o dado e deve utilizar o novo resultado.",
    },
    {
      name: "Bravura",
      description: "Você tem vantagem em testes de resistência contra ficar amedrontado.",
    },
    {
      name: "Agilidade Halfling",
      description: "Você pode mover-se através do espaço de qualquer criatura que for de um tamanho maior que o seu.",
    },
  ],
  subraces: [
    {
      name: "Pés Leves",
      source: "PHB",
      description:
        "Esconde-se com facilidade, mesmo usando apenas outras pessoas como cobertura. Afáveis e propensos a viajar; a variedade mais comum nos Reinos Esquecidos.",
      abilityScoreIncrease: { cha: 1 },
      traits: [
        {
          name: "Furtividade Natural",
          description:
            "Você pode tentar se esconder mesmo quando possuir apenas a cobertura de uma criatura que for no mínimo um tamanho maior que o seu.",
        },
      ],
    },
    {
      name: "Robusto",
      source: "PHB",
      description:
        "Mais resistente que a média da raça, com certa resistência a venenos. Alguns dizem que os robustos têm sangue de anões; nos Reinos Esquecidos são chamados de austeros.",
      abilityScoreIncrease: { con: 1 },
      traits: [
        {
          name: "Resiliência dos Robustos",
          description: "Você tem vantagem em testes de resistência contra veneno e tem resistência contra dano de veneno.",
        },
      ],
    },
  ],
};

const HUMANO: RaceDef = {
  name: "Humano",
  source: "PHB",
  description:
    "Os mais adaptáveis e ambiciosos entre as raças comuns, os humanos têm gostos, costumes e morais muito variados. Vivem menos de um século, mas são os inovadores, realizadores e pioneiros dos mundos.",
  abilityScoreIncrease: {},
  size: "Médio",
  speed: 9,
  languages: ["Comum"],
  extraLanguages: 1,
  subraceRequired: true,
  traits: [],
  subraces: [
    {
      name: "Humano Padrão",
      source: "PHB",
      description: "Traços raciais padrão do Livro do Jogador: todos os valores de habilidade aumentam em 1.",
      abilityScoreIncrease: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
      traits: [],
    },
    {
      name: "Humano Variante",
      source: "PHB",
      description:
        "Traços raciais alternativos (regra opcional de talentos): dois valores de habilidade à sua escolha aumentam em 1, uma perícia e um talento.",
      abilityScoreIncrease: { choose: { count: 2, amount: 1 } },
      traits: [
        {
          name: "Perícias",
          description: "Você ganha proficiência em uma perícia, à sua escolha.",
          skillChoices: 1,
        },
        {
          name: "Talento",
          description: "Você adquire um talento de sua escolha.",
          feat: true,
        },
      ],
    },
  ],
};

const DRACONATO: RaceDef = {
  name: "Draconato",
  source: "PHB",
  description:
    "Descendentes de dragões, os draconatos parecem dragões de pé em forma humanoide, sem asas nem cauda. Moldados por deuses dracônicos ou pelos próprios dragões, andam orgulhosamente por um mundo que os saúda com temor.",
  abilityScoreIncrease: { str: 2, cha: 1 },
  size: "Médio",
  speed: 9,
  languages: ["Comum", "Dracônico"],
  extraLanguages: 0,
  traits: [
    {
      name: "Ancestral Dracônico",
      description:
        "Você possui um ancestral dracônico. Escolha um tipo de dragão da tabela Ancestral Dracônico. Sua arma de sopro e resistência a dano são determinadas pelo tipo de dragão. " +
        "Azul: elétrico, linha de 1,5 m × 9 m (teste de Destreza). " +
        "Branco: frio, cone de 4,5 m (teste de Constituição). " +
        "Bronze: elétrico, linha de 1,5 m × 9 m (teste de Destreza). " +
        "Cobre: ácido, linha de 1,5 m × 9 m (teste de Destreza). " +
        "Dourado: fogo, cone de 4,5 m (teste de Destreza). " +
        "Latão: fogo, linha de 1,5 m × 9 m (teste de Destreza). " +
        "Negro: ácido, linha de 1,5 m × 9 m (teste de Destreza). " +
        "Prateado: frio, cone de 4,5 m (teste de Constituição). " +
        "Verde: veneno, cone de 4,5 m (teste de Constituição). " +
        "Vermelho: fogo, cone de 4,5 m (teste de Destreza).",
      choice: {
        label: "Tipo de dragão",
        options: ["Azul", "Branco", "Bronze", "Cobre", "Dourado", "Latão", "Negro", "Prateado", "Verde", "Vermelho"],
      },
    },
    {
      name: "Arma de Sopro",
      description:
        "Você pode usar uma ação para exalar energia destrutiva. Seu ancestral dracônico determina o tamanho, o formato e o tipo de dano que você expele. Quando você usa sua arma de sopro, cada criatura na área exalada deve realizar um teste de resistência, cujo tipo é determinado pelo seu ancestral dracônico. A CD do teste de resistência é 8 + seu modificador de Constituição + seu bônus de proficiência. Uma criatura sofre 2d6 de dano em um fracasso e metade desse dano em um sucesso. O dano aumenta para 3d6 no 6º nível, 4d6 no 11º nível e 5d6 no 16º nível. Depois de usar sua arma de sopro, você não poderá utilizá-la novamente até completar um descanso curto ou longo.",
    },
    {
      name: "Resistência a Dano",
      description: "Você possui resistência ao tipo de dano associado ao seu ancestral dracônico.",
    },
  ],
  subraces: [],
};

const GNOMO: RaceDef = {
  name: "Gnomo",
  source: "PHB",
  description:
    "Gnomos regozijam a vida, apreciando cada momento de invento, exploração, investigação, criação e brincadeira. Pequenos, curiosos e falantes, vivem de três a cinco séculos e ainda acham que não é tempo suficiente.",
  abilityScoreIncrease: { int: 2 },
  size: "Pequeno",
  speed: 7.5,
  languages: ["Comum", "Gnômico"],
  extraLanguages: 0,
  subraceRequired: true,
  traits: [
    visaoNoEscuro("Acostumado à vida subterrânea,"),
    {
      name: "Esperteza Gnômica",
      description: "Você possui vantagem em todos os testes de resistência de Inteligência, Sabedoria e Carisma contra magia.",
    },
  ],
  subraces: [
    {
      name: "Gnomo da Floresta",
      source: "PHB",
      description:
        "Traquejo natural com ilusões, velocidade e furtividade. Raros e reservados, vivem em comunidades escondidas em florestas silvestres e fazem amizade com pequenos animais.",
      abilityScoreIncrease: { dex: 1 },
      traits: [
        {
          name: "Ilusionista Nato",
          description: "Você conhece o truque ilusão menor. Inteligência é a sua habilidade de conjuração para ele.",
          spells: ["Ilusão Menor"],
        },
        {
          name: "Falar com Bestas Pequenas",
          description:
            "Através de sons e gestos, você pode comunicar ideias simples para Bestas de tamanho Pequeno ou menor. Gnomos da floresta amam os animais e normalmente possuem esquilos, doninhas, coelhos, toupeiras, pica-paus e outras criaturas como amados animais de estimação.",
        },
      ],
    },
    {
      name: "Gnomo das Rochas",
      source: "PHB",
      description:
        "Inventividade e resistência naturais acima dos outros gnomos. A maioria dos gnomos dos mundos de D&D são gnomos das rochas, incluindo os engenhoqueiros de Dragonlance.",
      abilityScoreIncrease: { con: 1 },
      traits: [
        {
          name: "Conhecimento de Artífice",
          description:
            "Toda vez que você fizer um teste de Inteligência (História) relacionado a itens mágicos, objetos alquímicos ou mecanismos tecnológicos, você pode adicionar o dobro do seu bônus de proficiência, ao invés de qualquer bônus de proficiência que você normalmente use.",
        },
        {
          name: "Engenhoqueiro",
          description:
            "Você possui proficiência com ferramentas de artesão (ferramentas de engenhoqueiro). Usando essas ferramentas, você pode gastar 1 hora e 10 po em materiais para construir um mecanismo Miúdo (CA 5, 1 pv). O mecanismo para de funcionar após 24 horas (a não ser que você gaste 1 hora reparando-o para mantê-lo funcionando), ou quando você usa sua ação para desmantelá-lo; nesse momento, você pode recuperar o material usado para criá-lo. Você pode ter até três desses mecanismos ativos ao mesmo tempo. Quando criar um mecanismo, escolha uma das opções: Brinquedo Mecânico (um animal, monstro ou pessoa mecânica; quando colocado no chão, move-se 1,5 metro em cada um dos seus turnos em uma direção aleatória e faz barulhos apropriados à criatura que representa); Isqueiro Mecânico (produz uma chama em miniatura, que você pode usar para acender uma vela, tocha ou fogueira; usar o mecanismo requer sua ação); Caixa de Música (quando aberta, toca uma canção a volume moderado; para de tocar ao alcançar o fim da música ou quando é fechada).",
          proficiencies: ["Ferramentas de engenhoqueiro"],
        },
      ],
    },
  ],
};

const MEIO_ELFO: RaceDef = {
  name: "Meio-elfo",
  source: "PHB",
  description:
    "Vagando entre dois mundos sem pertencer a nenhum, os meio-elfos combinam a curiosidade, inventividade e ambição humanas com os sentidos refinados, o amor à natureza e o gosto artístico dos elfos. Costumam ser excelentes embaixadores e intermediadores.",
  abilityScoreIncrease: { cha: 2, choose: { count: 2, amount: 1 } },
  size: "Médio",
  speed: 9,
  languages: ["Comum", "Élfico"],
  extraLanguages: 1,
  traits: [
    visaoNoEscuro("Graças ao seu sangue élfico,"),
    ANCESTRAL_FEERICO,
    {
      name: "Versatilidade em Perícia",
      description: "Você ganha proficiência em duas perícias, à sua escolha.",
      skillChoices: 2,
    },
  ],
  subraces: [],
};

const MEIO_ORC: RaceDef = {
  name: "Meio-orc",
  source: "PHB",
  description:
    "Marcados pela herança orc, os meio-orcs sentem emoções poderosas e se firmam pela força física, pela resistência e pela pura determinação herdada dos ancestrais humanos. Vivem entre orcs ou em terras humanas, conquistando aceitação a duras penas.",
  abilityScoreIncrease: { str: 2, con: 1 },
  size: "Médio",
  speed: 9,
  languages: ["Comum", "Orc"],
  extraLanguages: 0,
  traits: [
    visaoNoEscuro("Graças ao seu sangue orc,"),
    {
      name: "Ameaçador",
      description: "Você adquire proficiência na perícia Intimidação.",
      skills: ["Intimidação"],
    },
    {
      name: "Resistência Implacável",
      description:
        "Quando você é reduzido a 0 pontos de vida mas não é completamente morto, você pode voltar para 1 ponto de vida. Você não pode usar essa característica novamente até completar um descanso longo.",
    },
    {
      name: "Ataques Selvagens",
      description:
        "Quando você atinge um acerto crítico com uma arma corpo-a-corpo, você pode rolar um dos dados de dano da arma mais uma vez e adicioná-lo ao dano extra causado pelo acerto crítico.",
    },
  ],
  subraces: [],
};

const TIEFLING: RaceDef = {
  name: "Tiefling",
  source: "PHB",
  description:
    "Descendentes de um antigo pacto com Asmodeus, os tieflings carregam chifres, cauda e olhos sólidos como marcas de sua herança infernal. Enfrentam desconfiança por toda parte e aprendem a sobrepujar o preconceito com charme ou intimidação.",
  abilityScoreIncrease: { int: 1, cha: 2 },
  size: "Médio",
  speed: 9,
  languages: ["Comum", "Infernal"],
  extraLanguages: 0,
  traits: [
    visaoNoEscuro("Graças à sua herança infernal,"),
    {
      name: "Resistência Infernal",
      description: "Você possui resistência a dano de fogo.",
    },
    {
      name: "Legado Infernal",
      description:
        "Você conhece o truque taumaturgia. Quando você atingir o 3º nível, você poderá conjurar a magia repreensão infernal como uma magia de 2º nível uma vez. Quando você atingir o 5º nível, você também poderá conjurar a magia escuridão uma vez. Você precisa terminar um descanso longo para poder usar as magias desse traço novamente. Sua habilidade de conjuração para essas magias é Carisma.",
      spells: ["Taumaturgia", "Repreensão Infernal", "Escuridão"],
    },
  ],
  subraces: [],
};

// ---------------------------------------------------------------------------
// Elemental Evil / Guia de Volo / Tortle Package
// ---------------------------------------------------------------------------

const AARAKOCRA: RaceDef = {
  name: "Aarakocra",
  source: "EEPC",
  description:
    "Humanoides aviários vindos do Plano Elemental do Ar, os aarakocra vivem em ninhos nos picos das montanhas mais altas e são desconfortáveis em espaços fechados. São sentinelas dos céus e inimigos jurados dos cultistas elementais malignos.",
  abilityScoreIncrease: { dex: 2, wis: 1 },
  size: "Médio",
  speed: 7.5,
  languages: ["Comum", "Aarakocra", "Aéreo (Auran)"],
  extraLanguages: 0,
  traits: [
    {
      name: "Voo",
      description:
        "Você tem deslocamento de voo de 15 metros. Para usar esse deslocamento, você não pode estar usando armadura média ou pesada.",
    },
    {
      name: "Garras",
      description:
        "Você tem garras, que são armas naturais que você pode usar para realizar ataques desarmados. Se você acertar com elas, causa dano cortante igual a 1d4 + seu modificador de Força, ao invés do dano de concussão normal de um ataque desarmado.",
    },
  ],
  subraces: [],
};

const AASIMAR: RaceDef = {
  name: "Aasimar",
  source: "VGtM",
  description:
    "Mortais que carregam uma centelha dos Planos Superiores, os aasimar nascem para servir como campeões dos deuses e são guiados desde jovens por um guia celestial em sonhos. Sua natureza radiante pode ser corrompida, gerando os aasimar caídos.",
  abilityScoreIncrease: { cha: 2 },
  size: "Médio",
  speed: 9,
  languages: ["Comum", "Celestial"],
  extraLanguages: 0,
  subraceRequired: true,
  traits: [
    visaoNoEscuro("Abençoado com uma visão radiante,"),
    {
      name: "Resistência Celestial",
      description: "Você tem resistência a dano necrótico e a dano radiante.",
    },
    {
      name: "Mãos Curandeiras",
      description:
        "Com uma ação, você pode tocar uma criatura e fazer com que ela recupere um número de pontos de vida igual ao seu nível. Depois de usar esse traço, você não pode usá-lo novamente até terminar um descanso longo.",
    },
    {
      name: "Portador de Luz",
      description: "Você conhece o truque luz. Carisma é a sua habilidade de conjuração para ele.",
      spells: ["Luz"],
    },
  ],
  subraces: [
    {
      name: "Aasimar Protetor",
      source: "VGtM",
      description:
        "Encarregado por poderes do bem de guardar os fracos, combater o mal e enfrentar as forças das trevas. Sente desde cedo o chamado para agir.",
      abilityScoreIncrease: { wis: 1 },
      traits: [
        {
          name: "Alma Radiante",
          description:
            "A partir do 3º nível, você pode usar sua ação para liberar a energia divina dentro de si, fazendo seus olhos brilharem e duas asas luminosas e incorpóreas brotarem das suas costas. Sua transformação dura 1 minuto ou até você encerrá-la com uma ação bônus. Durante ela, você tem deslocamento de voo de 9 metros e, uma vez em cada um dos seus turnos, pode causar dano radiante extra a um alvo quando causar dano a ele com um ataque ou magia; o dano extra é igual ao seu nível. Depois de usar esse traço, você não pode usá-lo novamente até terminar um descanso longo.",
        },
      ],
    },
    {
      name: "Aasimar Flagelo",
      source: "VGtM",
      description:
        "Imbuído de uma energia divina que arde com intensidade, ansiosa por ser liberada e consumir o mal — mesmo à custa do próprio corpo.",
      abilityScoreIncrease: { con: 1 },
      traits: [
        {
          name: "Consumação Radiante",
          description:
            "A partir do 3º nível, você pode usar sua ação para liberar a energia divina dentro de si, fazendo uma luz cegante jorrar dos seus olhos e da sua boca e ameaçar queimá-lo. Sua transformação dura 1 minuto ou até você encerrá-la com uma ação bônus. Durante ela, você emite luz plena em um raio de 3 metros e penumbra por mais 3 metros; ao final de cada um dos seus turnos, você e cada criatura a até 3 metros de você sofrem dano radiante igual a metade do seu nível (arredondado para cima). Além disso, uma vez em cada um dos seus turnos, você pode causar dano radiante extra a um alvo quando causar dano a ele com um ataque ou magia; o dano extra é igual ao seu nível. Depois de usar esse traço, você não pode usá-lo novamente até terminar um descanso longo.",
        },
      ],
    },
    {
      name: "Aasimar Caído",
      source: "VGtM",
      description:
        "Um aasimar tocado por poderes sombrios na juventude ou que se voltou para o mal, cuja luz interior se converteu em sombra.",
      abilityScoreIncrease: { str: 1 },
      traits: [
        {
          name: "Mortalha Necrótica",
          description:
            "A partir do 3º nível, você pode usar sua ação para liberar a energia divina dentro de si, fazendo seus olhos se tornarem poços de escuridão e duas asas esqueléticas e fantasmagóricas brotarem das suas costas. No instante em que você se transforma, cada criatura a até 3 metros de você que possa vê-lo deve ser bem-sucedida em um teste de resistência de Carisma (CD 8 + seu bônus de proficiência + seu modificador de Carisma) ou ficará amedrontada por você até o final do seu próximo turno. Sua transformação dura 1 minuto ou até você encerrá-la com uma ação bônus. Durante ela, uma vez em cada um dos seus turnos, você pode causar dano necrótico extra a um alvo quando causar dano a ele com um ataque ou magia; o dano extra é igual ao seu nível. Depois de usar esse traço, você não pode usá-lo novamente até terminar um descanso longo.",
        },
      ],
    },
  ],
};

const BUGBEAR: RaceDef = {
  name: "Bugbear",
  source: "VGtM",
  description:
    "Os maiores e mais fortes dos goblinoides, os bugbears são caçadores peludos que preferem a emboscada ao combate aberto e vivem de saques e do que a floresta oferece. Muitos são preguiçosos e brutais, mas alguns buscam vida fora das tribos.",
  abilityScoreIncrease: { str: 2, dex: 1 },
  size: "Médio",
  speed: 9,
  languages: ["Comum", "Goblin"],
  extraLanguages: 0,
  traits: [
    visaoNoEscuro("Acostumado a rondar à noite,"),
    {
      name: "Membros Longos",
      description:
        "Quando você realiza um ataque corpo-a-corpo no seu turno, seu alcance para esse ataque é 1,5 metro maior do que o normal.",
    },
    CONSTITUICAO_PODEROSA,
    {
      name: "Furtivo",
      description: "Você tem proficiência na perícia Furtividade.",
      skills: ["Furtividade"],
    },
    {
      name: "Ataque Surpresa",
      description:
        "Se você surpreender uma criatura e acertá-la com um ataque no seu primeiro turno do combate, o ataque causa 2d6 de dano extra. Você só pode usar esse traço uma vez por combate.",
    },
  ],
  subraces: [],
};

const FIRBOLG: RaceDef = {
  name: "Firbolg",
  source: "VGtM",
  description:
    "Gigantes-parentes reclusos e gentis que vivem em clãs nas florestas remotas, atuando como seus guardiões. Preferem passar despercebidos e evitar conflitos, usando magia natural para se ocultar e se comunicar com bestas e plantas.",
  abilityScoreIncrease: { wis: 2, str: 1 },
  size: "Médio",
  speed: 9,
  languages: ["Comum", "Élfico", "Gigante"],
  extraLanguages: 0,
  traits: [
    {
      name: "Magia Firbolg",
      description:
        "Você pode conjurar detectar magia e disfarçar-se com esse traço, usando Sabedoria como sua habilidade de conjuração. Depois de conjurar qualquer uma dessas magias com esse traço, você não pode conjurá-la novamente com ele até terminar um descanso curto ou longo. Quando você usa esta versão de disfarçar-se, pode parecer até 90 centímetros mais baixo do que o normal, o que facilita se misturar a humanos e elfos.",
      spells: ["Detectar Magia", "Disfarçar-se"],
    },
    {
      name: "Passo Oculto",
      description:
        "Com uma ação bônus, você pode ficar magicamente invisível até o início do seu próximo turno ou até você atacar, realizar uma jogada de dano ou forçar alguém a fazer um teste de resistência. Depois de usar esse traço, você não pode usá-lo novamente até terminar um descanso curto ou longo.",
    },
    CONSTITUICAO_PODEROSA,
    {
      name: "Fala das Bestas e das Folhas",
      description:
        "Você tem a capacidade limitada de se comunicar com bestas e plantas. Elas podem entender o significado das suas palavras, embora você não tenha nenhuma capacidade especial de entendê-las em troca. Você tem vantagem em todos os testes de Carisma que fizer para influenciá-las.",
    },
  ],
  subraces: [],
};

const GENASI: RaceDef = {
  name: "Genasi",
  source: "EEPC",
  description:
    "Descendentes de gênios ou tocados pelos Planos Elementais, os genasi carregam o poder do ar, da terra, do fogo ou da água na própria carne. Costumam ser raros e viver isolados, sem uma cultura própria.",
  abilityScoreIncrease: { con: 2 },
  size: "Médio",
  speed: 9,
  languages: ["Comum", "Primordial"],
  extraLanguages: 0,
  subraceRequired: true,
  traits: [],
  subraces: [
    {
      name: "Genasi do Ar",
      source: "EEPC",
      description:
        "Herdeiros do vento: pele azulada, cabelos que esvoaçam sem brisa e uma voz que soa como um sussurro distante. Leves, rápidos e imprevisíveis.",
      abilityScoreIncrease: { dex: 1 },
      traits: [
        {
          name: "Fôlego Infinito",
          description: "Você pode prender a respiração indefinidamente enquanto não estiver incapacitado.",
        },
        {
          name: "Mesclar-se ao Vento",
          description:
            "Você pode conjurar a magia levitação uma vez com esse traço, sem precisar de componentes materiais, e recupera a capacidade de fazê-lo ao terminar um descanso longo. Constituição é a sua habilidade de conjuração para essa magia.",
          spells: ["Levitação"],
        },
      ],
    },
    {
      name: "Genasi da Terra",
      source: "EEPC",
      description:
        "Herdeiros da rocha: pele com tons de terra, metal ou pedra, fragmentos minerais no cabelo e um andar pesado e firme. Lentos para se decidir, imóveis quando decididos.",
      abilityScoreIncrease: { str: 1 },
      traits: [
        {
          name: "Caminhar na Terra",
          description:
            "Você pode se mover através de terreno difícil feito de terra ou pedra sem gastar movimento adicional.",
        },
        {
          name: "Fundir-se à Pedra",
          description:
            "Você pode conjurar a magia passos sem pegadas uma vez com esse traço, sem precisar de componentes materiais, e recupera a capacidade de fazê-lo ao terminar um descanso longo. Constituição é a sua habilidade de conjuração para essa magia.",
          spells: ["Passos Sem Pegadas"],
        },
      ],
    },
    {
      name: "Genasi do Fogo",
      source: "EEPC",
      description:
        "Herdeiros da chama: pele em tons de carvão, vermelho ou dourado, cabelos que tremulam como fogo e olhos brilhantes. Temperamento rápido e vivaz.",
      abilityScoreIncrease: { int: 1 },
      traits: [
        {
          name: "Visão no Escuro",
          description:
            "Você pode enxergar na penumbra a até 18 metros como se fosse luz plena, e no escuro como se fosse na penumbra. Seus laços com o Plano Elemental do Fogo fazem sua visão no escuro ser incomum: tudo o que você vê no escuro aparece em tons de vermelho.",
        },
        {
          name: "Resistência ao Fogo",
          description: "Você tem resistência a dano de fogo.",
        },
        {
          name: "Alcançar as Chamas",
          description:
            "Você conhece o truque criar chamas. Quando você atinge o 3º nível, você pode conjurar a magia mãos flamejantes uma vez com esse traço como uma magia de 1º nível, e recupera a capacidade de fazê-lo ao terminar um descanso longo. Constituição é a sua habilidade de conjuração para essas magias.",
          spells: ["Criar Chamas", "Mãos Flamejantes"],
        },
      ],
    },
    {
      name: "Genasi da Água",
      source: "EEPC",
      description:
        "Herdeiros das marés: pele azul ou verde, cabelos ondulados como algas e uma calma que esconde a força de uma correnteza. Sentem-se em casa no mar.",
      abilityScoreIncrease: { wis: 1 },
      traits: [
        {
          name: "Resistência a Ácido",
          description: "Você tem resistência a dano de ácido.",
        },
        {
          name: "Anfíbio",
          description: "Você pode respirar ar e água.",
        },
        {
          name: "Nadador",
          description: "Você tem deslocamento de natação de 9 metros.",
        },
        {
          name: "Chamado da Onda",
          description:
            "Você conhece o truque moldar água. Quando você atinge o 3º nível, você pode conjurar a magia criar ou destruir água uma vez com esse traço como uma magia de 2º nível, e recupera a capacidade de fazê-lo ao terminar um descanso longo. Constituição é a sua habilidade de conjuração para essas magias.",
          spells: ["Moldar Água", "Criar ou Destruir Água"],
        },
      ],
    },
  ],
};

const GOBLIN: RaceDef = {
  name: "Goblin",
  source: "VGtM",
  description:
    "Pequenos, numerosos e astutos, os goblins vivem sob a bota de bugbears e hobgoblins e adoram tudo o que lhes dê vantagem: emboscadas, armadilhas e números. Individualmente covardes, em grupo são um perigo real.",
  abilityScoreIncrease: { dex: 2, con: 1 },
  size: "Pequeno",
  speed: 9,
  languages: ["Comum", "Goblin"],
  extraLanguages: 0,
  traits: [
    visaoNoEscuro("Acostumado a cavernas e tocas,"),
    {
      name: "Fúria dos Pequenos",
      description:
        "Quando você causa dano a uma criatura com um ataque ou magia e o tamanho dela é maior que o seu, você pode fazer o ataque ou magia causar dano extra igual ao seu nível. Depois de usar esse traço, você não pode usá-lo novamente até terminar um descanso curto ou longo.",
    },
    {
      name: "Fuga Ágil",
      description: "Você pode realizar as ações de Desengajar ou Esconder-se como uma ação bônus em cada um dos seus turnos.",
    },
  ],
  subraces: [],
};

const GOLIAS: RaceDef = {
  name: "Golias",
  source: "VGtM",
  description:
    "Nômades dos picos mais altos, os golias são enormes, resistentes e obcecados por competição e autossuficiência. Cada membro da tribo deve provar seu valor, e a fraqueza é vista como algo a ser superado.",
  abilityScoreIncrease: { str: 2, con: 1 },
  size: "Médio",
  speed: 9,
  languages: ["Comum", "Gigante"],
  extraLanguages: 0,
  traits: [
    {
      name: "Atleta Nato",
      description: "Você tem proficiência na perícia Atletismo.",
      skills: ["Atletismo"],
    },
    {
      name: "Resistência de Pedra",
      description:
        "Você pode se concentrar para ignorar ferimentos ocasionalmente. Quando você sofre dano, você pode usar sua reação para rolar um d12. Adicione seu modificador de Constituição ao número rolado e reduza o dano sofrido por esse total. Depois de usar esse traço, você não pode usá-lo novamente até terminar um descanso curto ou longo.",
    },
    CONSTITUICAO_PODEROSA,
    {
      name: "Nascido na Montanha",
      description:
        "Você está aclimatado a grandes altitudes, incluindo elevações acima de 6.000 metros. Você também está naturalmente adaptado a climas frios, conforme descrito no capítulo 5 do Guia do Mestre.",
    },
  ],
  subraces: [],
};

const HOBGOBLIN: RaceDef = {
  name: "Hobgoblin",
  source: "VGtM",
  description:
    "Goblinoides marciais e disciplinados, os hobgoblins vivem em legiões rigidamente hierárquicas onde honra, obediência e conquista são tudo. Um hobgoblin aventureiro carrega esse orgulho militar aonde quer que vá.",
  abilityScoreIncrease: { con: 2, int: 1 },
  size: "Médio",
  speed: 9,
  languages: ["Comum", "Goblin"],
  extraLanguages: 0,
  traits: [
    visaoNoEscuro("Acostumado a marchas noturnas e fortalezas subterrâneas,"),
    {
      name: "Treinamento Marcial",
      description: "Você tem proficiência com duas armas marciais à sua escolha e com armaduras leves.",
      proficiencies: ["Duas armas marciais à escolha", "Armaduras leves"],
    },
    {
      name: "Salvar as Aparências",
      description:
        "Hobgoblins são cuidadosos para não demonstrar fraqueza na frente dos aliados, por medo de perder status. Se você errar uma jogada de ataque ou falhar em um teste de habilidade ou de resistência, você pode ganhar um bônus na jogada igual ao número de aliados que possa ver a até 9 metros de você (bônus máximo de +5). Depois de usar esse traço, você não pode usá-lo novamente até terminar um descanso curto ou longo.",
    },
  ],
  subraces: [],
};

const HOMEM_LAGARTO: RaceDef = {
  name: "Homem-lagarto",
  source: "VGtM",
  description:
    "Répteis humanoides dos pântanos, os homens-lagarto pensam de forma fria e prática: tudo é comida, ferramenta ou ameaça. Sua mentalidade alienígena os torna sobreviventes implacáveis e companheiros surpreendentemente leais.",
  abilityScoreIncrease: { con: 2, wis: 1 },
  size: "Médio",
  speed: 9,
  languages: ["Comum", "Dracônico"],
  extraLanguages: 0,
  traits: [
    {
      name: "Mordida",
      description:
        "Sua boca cheia de presas é uma arma natural, que você pode usar para realizar ataques desarmados. Se você acertar com ela, causa dano perfurante igual a 1d6 + seu modificador de Força, ao invés do dano de concussão normal de um ataque desarmado.",
    },
    {
      name: "Artesão Astuto",
      description:
        "Como parte de um descanso curto, você pode colher ossos e couro de uma criatura morta do tipo besta, dragão, humanoide, monstruosidade ou planta, de tamanho Pequeno ou maior, para criar um dos seguintes itens: um escudo, um porrete, uma azagaia ou 1d4 dardos ou agulhas de zarabatana. Para usar esse traço, você precisa de uma lâmina, como uma adaga, ou de ferramentas de artesão apropriadas, como ferramentas de coureiro.",
    },
    {
      name: "Prender o Fôlego",
      description: "Você pode prender a respiração por até 15 minutos de uma vez.",
    },
    {
      name: "Conhecimento do Caçador",
      description:
        "Você ganha proficiência em duas das seguintes perícias, à sua escolha: Adestrar Animais, Natureza, Percepção, Furtividade e Sobrevivência.",
      choice: {
        label: "Perícias do caçador (escolha duas)",
        options: ["Adestrar Animais", "Natureza", "Percepção", "Furtividade", "Sobrevivência"],
      },
      skillChoices: 2,
    },
    {
      name: "Armadura Natural",
      description:
        "Você tem escamas duras e resistentes. Quando não estiver usando armadura, sua CA é 13 + seu modificador de Destreza. Você pode usar sua armadura natural para determinar sua CA se a armadura que estiver usando lhe deixar com uma CA menor. O bônus de um escudo se aplica normalmente enquanto você usa sua armadura natural.",
    },
    {
      name: "Mandíbulas Famintas",
      description:
        "Em combate, você pode entrar em um frenesi alimentar. Com uma ação bônus, você pode realizar um ataque especial com sua mordida. Se o ataque acertar, ele causa seu dano normal e você ganha pontos de vida temporários (mínimo 1) iguais ao seu modificador de Constituição. Depois de usar esse traço, você não pode usá-lo novamente até terminar um descanso curto ou longo.",
    },
    {
      name: "Nadador",
      description: "Você tem deslocamento de natação de 9 metros.",
    },
  ],
  subraces: [],
};

const KENKU: RaceDef = {
  name: "Kenku",
  source: "VGtM",
  description:
    "Humanoides corvídeos amaldiçoados há eras: perderam as asas, a voz própria e a criatividade, e só falam imitando sons que já ouviram. Vivem nas margens das cidades como ladrões, falsificadores e mensageiros.",
  abilityScoreIncrease: { dex: 2, wis: 1 },
  size: "Médio",
  speed: 9,
  languages: ["Comum", "Aéreo (Auran)"],
  extraLanguages: 0,
  traits: [
    {
      name: "Falsificador Perito",
      description:
        "Você pode duplicar a caligrafia e o trabalho artesanal de outras criaturas. Você tem vantagem em todos os testes feitos para produzir falsificações ou duplicatas de objetos existentes.",
    },
    {
      name: "Treinamento Kenku",
      description:
        "Você tem proficiência em duas das seguintes perícias, à sua escolha: Acrobacia, Enganação, Furtividade e Prestidigitação.",
      choice: {
        label: "Perícias kenku (escolha duas)",
        options: ["Acrobacia", "Enganação", "Furtividade", "Prestidigitação"],
      },
      skillChoices: 2,
    },
    {
      name: "Mímica",
      description:
        "Você pode imitar sons que já ouviu, incluindo vozes. Uma criatura que ouça os sons pode perceber que são imitações com um teste de Sabedoria (Intuição) bem-sucedido, disputado contra o seu teste de Carisma (Enganação).",
    },
    {
      name: "Idiomas Kenku",
      description:
        "Você pode ler e escrever Comum e Aéreo (Auran), mas só consegue falar usando o traço Mímica.",
    },
  ],
  subraces: [],
};

const KOBOLD: RaceDef = {
  name: "Kobold",
  source: "VGtM",
  description:
    "Pequenos répteis que se dizem parentes dos dragões, os kobolds compensam a fragilidade com números, armadilhas e uma covardia oportunista. Vivem em tocas subterrâneas e servem dragões sempre que podem.",
  abilityScoreIncrease: { dex: 2, str: -2 },
  size: "Pequeno",
  speed: 9,
  languages: ["Comum", "Dracônico"],
  extraLanguages: 0,
  traits: [
    visaoNoEscuro("Acostumado à vida subterrânea,"),
    {
      name: "Rastejar, Encolher-se e Implorar",
      description:
        "Com uma ação no seu turno, você pode se encolher pateticamente para distrair os inimigos próximos. Até o final do seu próximo turno, seus aliados têm vantagem nas jogadas de ataque contra inimigos a até 3 metros de você que possam vê-lo. Depois de usar esse traço, você não pode usá-lo novamente até terminar um descanso curto ou longo.",
    },
    {
      name: "Táticas de Matilha",
      description:
        "Você tem vantagem em uma jogada de ataque contra uma criatura se pelo menos um dos seus aliados estiver a até 1,5 metro da criatura e o aliado não estiver incapacitado.",
    },
    SENSIBILIDADE_LUZ_SOLAR,
  ],
  subraces: [],
};

const ORC: RaceDef = {
  name: "Orc",
  source: "VGtM",
  description:
    "Guerreiros ferozes moldados pela fúria de Gruumsh, os orcs vivem para a batalha e a conquista, avançando sobre o inimigo antes que ele possa reagir. Um orc aventureiro carrega essa agressividade e a força bruta de sua tribo.",
  abilityScoreIncrease: { str: 2, con: 1, int: -2 },
  size: "Médio",
  speed: 9,
  languages: ["Comum", "Orc"],
  extraLanguages: 0,
  traits: [
    visaoNoEscuro("Graças ao seu sangue orc,"),
    {
      name: "Agressivo",
      description:
        "Com uma ação bônus, você pode se mover até o seu deslocamento em direção a um inimigo à sua escolha que possa ver ou ouvir. Você deve terminar esse movimento mais perto do inimigo do que começou.",
    },
    {
      name: "Ameaçador",
      description: "Você tem proficiência na perícia Intimidação.",
      skills: ["Intimidação"],
    },
    CONSTITUICAO_PODEROSA,
  ],
  subraces: [],
};

const TABAXI: RaceDef = {
  name: "Tabaxi",
  source: "VGtM",
  description:
    "Felinos humanoides vindos de terras distantes, os tabaxi são movidos por uma curiosidade insaciável: colecionam histórias, segredos e objetos interessantes, e perdem o interesse tão rápido quanto o ganham.",
  abilityScoreIncrease: { dex: 2, cha: 1 },
  size: "Médio",
  speed: 9,
  languages: ["Comum"],
  extraLanguages: 1,
  traits: [
    visaoNoEscuro("Com olhos de felino,"),
    {
      name: "Agilidade Felina",
      description:
        "Seus reflexos e agilidade permitem que você se mova com uma explosão de velocidade. Quando você se move no seu turno em combate, você pode dobrar seu deslocamento até o final do turno. Depois de usar esse traço, você não pode usá-lo novamente até se mover 0 metro em um dos seus turnos.",
    },
    {
      name: "Garras Felinas",
      description:
        "Por causa das suas garras, você tem deslocamento de escalada de 6 metros. Além disso, suas garras são armas naturais, que você pode usar para realizar ataques desarmados. Se você acertar com elas, causa dano cortante igual a 1d4 + seu modificador de Força, ao invés do dano de concussão normal de um ataque desarmado.",
    },
    {
      name: "Talento Felino",
      description: "Você tem proficiência nas perícias Percepção e Furtividade.",
      skills: ["Percepção", "Furtividade"],
    },
  ],
  subraces: [],
};

const TORTLE: RaceDef = {
  name: "Tortle",
  source: "XGtE",
  description:
    "Tartarugas humanoides pacíficas que nascem perto de praias quentes e vivem a maior parte da vida vagando pelo mundo, carregando a casa nas costas. Raça do suplemento oficial The Tortle Package (lançado com o Guia de Xanathar).",
  abilityScoreIncrease: { str: 2, wis: 1 },
  size: "Médio",
  speed: 9,
  languages: ["Comum", "Aquático (Aquan)"],
  extraLanguages: 0,
  traits: [
    {
      name: "Garras",
      description:
        "Suas garras são armas naturais, que você pode usar para realizar ataques desarmados. Se você acertar com elas, causa dano cortante igual a 1d4 + seu modificador de Força, ao invés do dano de concussão normal de um ataque desarmado.",
    },
    {
      name: "Prender o Fôlego",
      description: "Você pode prender a respiração por até 1 hora de uma vez. Tortles não são nadadores natos, mas podem permanecer submersos por um bom tempo antes de precisar de ar.",
    },
    {
      name: "Armadura Natural",
      description:
        "Por causa do seu casco e da forma do seu corpo, você não se adapta ao uso de armaduras. Seu casco fornece ampla proteção, porém: ele lhe dá uma CA base de 17 (seu modificador de Destreza não afeta esse número). Você não ganha nenhum benefício por usar armadura, mas se estiver usando um escudo, pode aplicar o bônus do escudo normalmente.",
    },
    {
      name: "Defesa do Casco",
      description:
        "Você pode se recolher ao seu casco com uma ação. Até você emergir, você ganha +4 de bônus na CA e tem vantagem em testes de resistência de Força e Constituição. Enquanto estiver no casco, você está caído, seu deslocamento é 0 e não pode aumentar, você tem desvantagem em testes de resistência de Destreza, não pode realizar reações e a única ação que pode realizar é uma ação bônus para emergir do casco.",
    },
    {
      name: "Instinto de Sobrevivência",
      description: "Você tem proficiência na perícia Sobrevivência. Tortles têm instintos de sobrevivência excepcionalmente bons.",
      skills: ["Sobrevivência"],
    },
  ],
  subraces: [],
};

// ---------------------------------------------------------------------------
// Homebrew
// ---------------------------------------------------------------------------

const THRI_KREEN: RaceDef = {
  name: "Thri-kreen",
  source: "Homebrew",
  description:
    "Insetoides nômades de quatro braços vindos dos desertos (clássicos de Dark Sun), caçadores incansáveis que nunca dormem. HOMEBREW: não existe versão oficial desta raça no D&D 5e de 2014; os traços abaixo adaptam a versão clássica para uso na mesa.",
  abilityScoreIncrease: { dex: 2, wis: 1 },
  size: "Médio",
  speed: 9,
  languages: ["Comum"],
  extraLanguages: 1,
  traits: [
    visaoNoEscuro("Com olhos compostos adaptados à noite do deserto,"),
    {
      name: "Braços Secundários",
      description:
        "Você tem dois braços secundários menores abaixo do seu par principal. Eles podem segurar e manipular objetos, sacar ou guardar itens e empunhar armas leves ou um escudo, mas não podem empunhar armas pesadas nem de duas mãos. Ter mais braços não concede ataques adicionais por si só; permite, por exemplo, manter um escudo e uma arma de duas mãos, ou trocar de arma sem gastar sua interação com objetos.",
    },
    {
      name: "Carapaça",
      description:
        "Seu exoesqueleto quitinoso é uma armadura natural. Quando não estiver usando armadura, sua CA é 13 + seu modificador de Destreza. Você pode usar sua armadura natural para determinar sua CA se a armadura que estiver usando lhe deixar com uma CA menor. O bônus de um escudo se aplica normalmente.",
    },
    {
      name: "Garras",
      description:
        "Suas garras são armas naturais, que você pode usar para realizar ataques desarmados. Se você acertar com elas, causa dano cortante igual a 1d4 + seu modificador de Força, ao invés do dano de concussão normal de um ataque desarmado.",
    },
    {
      name: "Salto Prodigioso",
      description:
        "Suas pernas poderosas o impulsionam a distâncias notáveis. Seu salto em distância é de até 9 metros e seu salto em altura é de até 3 metros, com ou sem impulso. Cada metro saltado consome 1 metro de deslocamento normalmente.",
    },
    {
      name: "Sem Sono",
      description:
        "Você não precisa dormir, e magias não podem colocá-lo para dormir. Você pode terminar um descanso longo em 6 horas se passar essas horas em um estado inativo e imóvel, durante o qual mantém consciência do ambiente.",
    },
    {
      name: "Telepatia Limitada",
      description:
        "Você pode se comunicar telepaticamente com uma criatura voluntária que possa ver a até 36 metros de você. A criatura entende o que você transmite apenas se compartilhar algum idioma com você. Você não precisa ver a criatura para encerrar o contato, e só pode manter contato com uma criatura por vez.",
    },
  ],
  subraces: [],
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const RACES_CATALOG: RaceDef[] = [
  AARAKOCRA,
  AASIMAR,
  ANAO,
  BUGBEAR,
  DRACONATO,
  ELFO,
  FIRBOLG,
  GENASI,
  GNOMO,
  GOBLIN,
  GOLIAS,
  HALFLING,
  HOBGOBLIN,
  HOMEM_LAGARTO,
  HUMANO,
  KENKU,
  KOBOLD,
  MEIO_ELFO,
  MEIO_ORC,
  ORC,
  TABAXI,
  THRI_KREEN,
  TIEFLING,
  TORTLE,
].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

/** Normaliza um nome para busca: sem acentos, minúsculas, sem espaços nas pontas. */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const BY_NAME = new Map<string, RaceDef>(RACES_CATALOG.map((r) => [normalize(r.name), r]));

export function findRace(name: string): RaceDef | undefined {
  return BY_NAME.get(normalize(name));
}

export function findSubrace(race: string, sub: string): SubraceDef | undefined {
  const r = findRace(race);
  if (!r) return undefined;
  const key = normalize(sub);
  return r.subraces.find((s) => normalize(s.name) === key);
}
