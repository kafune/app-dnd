import type { ClassDef } from "@/lib/types";

/**
 * Paladino — progressão completa (níveis 1–20) e todos os Juramentos Sagrados
 * do Livro do Jogador, do Guia de Xanathar e do Caldeirão de Tasha (PT-BR).
 *
 * Fontes: PHB p.109–114 (cap. 3, Paladino) e p.166–167 (Multiclasse);
 * XGtE p.54–56 (Conquista, Redenção); TCoE p.76–79 (estilos de luta, Glória, Vigilância).
 */

const CURA_PELAS_MAOS_POR_NIVEL: Record<string, number> = {
  "1": 5, "2": 10, "3": 15, "4": 20, "5": 25, "6": 30, "7": 35, "8": 40, "9": 45, "10": 50,
  "11": 55, "12": 60, "13": 65, "14": 70, "15": 75, "16": 80, "17": 85, "18": 90, "19": 95, "20": 100,
};

const EXPULSAO_TEXTO =
  "Uma criatura expulsa deve gastar seus turnos tentando se mover para longe de você da melhor forma possível e não pode, voluntariamente, se mover para um espaço a menos de 9 metros de você. Ela também não pode realizar reações. Como ação, ela só pode realizar a ação de Disparada ou tentar escapar de um efeito que a impeça de se mover. Se não houver para onde se mover, a criatura pode usar a ação de Esquivar.";

export const PALADINO: ClassDef = {
  name: "Paladino",
  source: "PHB",
  subclassLabel: "Juramento Sagrado",
  subclassLevel: 3,
  multiclass: {
    prerequisite: "Força 13 e Carisma 13",
    proficiencies: "Armadura leve, armadura média, escudos, armas simples, armas marciais",
    skills: 0,
  },
  features: [
    {
      name: "Sentido Divino",
      level: 1,
      description:
        "A presença de um mal poderoso é registrada nos seus sentidos como um odor nocivo, e o bem poderoso soa como música celestial nos seus ouvidos. Com uma ação, você pode expandir sua consciência para detectar tais forças. Até o final do seu próximo turno, você sabe a localização de qualquer celestial, corruptor ou morto-vivo a até 18 metros de você que não esteja sob cobertura total. Você sabe o tipo (celestial, corruptor ou morto-vivo) de qualquer ser cuja presença você sentiu, mas não sua identidade (o vampiro Conde Strahd von Zarovich, por exemplo). Dentro do mesmo raio, você também detecta a presença de qualquer lugar ou objeto que tenha sido consagrado ou profanado, como pela magia consagrar.\nVocê pode usar essa característica um número de vezes igual a 1 + seu modificador de Carisma. Quando você termina um descanso longo, recupera todos os usos gastos.",
      resource: { max: "cha", recharge: "long" },
    },
    {
      name: "Cura pelas Mãos",
      level: 1,
      description:
        "Seu toque abençoado pode curar ferimentos. Você tem uma reserva de poder curativo que se enche quando você realiza um descanso longo. Com essa reserva, você pode restaurar um número total de pontos de vida igual ao seu nível de paladino × 5.\nCom uma ação, você pode tocar uma criatura e extrair poder da sua reserva para restaurar um número de pontos de vida da criatura, até o máximo de pontos restantes na reserva.\nAlternativamente, você pode gastar 5 pontos de vida da sua reserva de cura para curar o alvo de uma doença ou neutralizar um veneno que o esteja afetando. Você pode curar múltiplas doenças e neutralizar múltiplos venenos com um único uso de Cura pelas Mãos, gastando pontos de vida separadamente para cada um.\nEssa característica não tem efeito em mortos-vivos e constructos.",
      resource: { name: "Cura pelas Mãos (PV)", max: 5, recharge: "long", byLevel: CURA_PELAS_MAOS_POR_NIVEL },
    },
    {
      name: "Estilo de Luta",
      level: 2,
      description:
        "No 2° nível, você adota um estilo de combate particular que será sua especialidade. Escolha uma das opções a seguir. Você não pode escolher o mesmo Estilo de Luta mais de uma vez, mesmo se puder escolher de novo.\nCombate com Armas Grandes. Quando você rolar um 1 ou um 2 num dado de dano de um ataque com arma corpo a corpo que você esteja empunhando com duas mãos, você pode rolar o dado novamente e usar a nova rolagem, mesmo que resulte em 1 ou 2. A arma deve ter a propriedade duas mãos ou versátil para ganhar esse benefício.\nDefesa. Enquanto estiver usando armadura, você ganha +1 de bônus na CA.\nDuelismo. Quando você empunhar uma arma corpo a corpo em uma mão e nenhuma outra arma, você ganha +2 de bônus nas jogadas de dano com essa arma.\nProteção. Quando uma criatura que você possa ver atacar um alvo diferente de você que esteja a até 1,5 metro de você, você pode usar sua reação para impor desvantagem na jogada de ataque da criatura. Você deve estar empunhando um escudo.\nGuerreiro Abençoado (Caldeirão de Tasha). Você aprende dois truques, à sua escolha, da lista de magias do clérigo. Eles contam como magias de paladino para você, e Carisma é sua habilidade de conjuração para eles. Sempre que você adquirir um nível nesta classe, pode substituir um desses truques por outro truque da lista de magias do clérigo.\nLuta às Cegas (Caldeirão de Tasha). Você tem percepção às cegas com alcance de 3 metros. Dentro desse alcance, você pode efetivamente ver qualquer coisa que não esteja sob cobertura total, mesmo se estiver cego ou na escuridão. Além disso, você pode ver uma criatura invisível dentro desse alcance, a menos que a criatura se esconda de você com sucesso.\nInterceptador (Caldeirão de Tasha). Quando uma criatura que você possa ver acertar um ataque contra um alvo que não seja você, a até 1,5 metro de você, você pode usar sua reação para reduzir o dano recebido por esse alvo em 1d10 + seu bônus de proficiência (até um mínimo de 0 de dano). Você deve estar empunhando um escudo ou uma arma simples ou marcial para usar essa reação.",
    },
    {
      name: "Conjuração",
      level: 2,
      description:
        "No 2° nível, você aprende a extrair magia divina através de meditação e oração para conjurar magias, como um clérigo faz. Veja o capítulo 10 para as regras gerais de conjuração e o capítulo 11 para a lista de magias de paladino.\nPreparando e Conjurando Magias. A tabela do Paladino mostra quantos espaços de magia você tem para conjurar suas magias de 1° nível e superiores. Para conjurar uma dessas magias, você precisa gastar um espaço do nível da magia ou superior. Você recupera todos os espaços gastos quando termina um descanso longo.\nEspaços de magia por nível de paladino (1°/2°/3°/4°/5°): 2°: 2; 3°–4°: 3; 5°–6°: 4/2; 7°–8°: 4/3; 9°–10°: 4/3/2; 11°–12°: 4/3/3; 13°–14°: 4/3/3/1; 15°–16°: 4/3/3/2; 17°–18°: 4/3/3/3/1; 19°–20°: 4/3/3/3/2.\nVocê prepara a lista de magias disponíveis selecionando-as da lista de magias de paladino. Você seleciona um número de magias igual ao seu modificador de Carisma + metade do seu nível de paladino, arredondado para baixo (mínimo de uma magia). Essas magias devem ser de níveis para os quais você possua espaços de magia.\nPor exemplo, se você é um paladino de 5° nível, possui quatro espaços de magia de 1° nível e dois de 2° nível. Com Carisma 14, sua lista de magias preparadas pode incluir quatro magias, combinando as de 1° e 2° nível em qualquer proporção. Se você preparar a magia de 1° nível curar ferimentos, pode conjurá-la com um espaço de magia de 1° ou de 2° nível. Conjurar a magia não a remove da sua lista de magias preparadas.\nVocê pode modificar a sua lista de magias preparadas quando termina um descanso longo. Preparar uma nova lista de magias de paladino requer tempo gasto em preces e meditação: no mínimo 1 minuto por nível de magia para cada magia preparada.\nHabilidade de Conjuração. Carisma é a sua habilidade de conjuração para as magias de paladino, já que seu poder deriva da força das suas convicções. Você usa seu Carisma sempre que alguma magia se referir à sua habilidade de conjuração. Além disso, você usa o seu modificador de Carisma para definir a CD dos testes de resistência das magias de paladino que você conjura e quando realiza uma jogada de ataque com uma magia.\nCD para suas magias = 8 + seu bônus de proficiência + seu modificador de Carisma.\nModificador de ataque de magia = seu bônus de proficiência + seu modificador de Carisma.\nFoco de Conjuração. Você pode usar um símbolo sagrado (veja o capítulo 5) como foco de conjuração das suas magias de paladino.",
    },
    {
      name: "Destruição Divina",
      level: 2,
      description:
        "A partir do 2° nível, quando você atingir uma criatura com um ataque corpo a corpo com arma, você pode gastar um espaço de magia de paladino para causar dano radiante no alvo, além do dano normal da arma. O dano extra é de 2d8 para um espaço de magia de 1° nível, mais 1d8 para cada nível de espaço de magia acima do 1°, até o máximo de 5d8. O dano aumenta em 1d8 se o alvo for um corruptor ou um morto-vivo.",
    },
    {
      name: "Saúde Divina",
      level: 3,
      description: "No 3° nível, a magia divina que flui através de você torna você imune a doenças.",
    },
    {
      name: "Juramento Sagrado",
      level: 3,
      description:
        "Quando você alcança o 3° nível, você faz um juramento que o torna paladino para sempre. Até então, você estava em um estágio preparatório, comprometido com o caminho, mas ainda não jurado a ele. Agora você escolhe um Juramento Sagrado, como o Juramento de Devoção, o Juramento dos Anciões ou o Juramento de Vingança, detalhados no final da descrição da classe.\nSua escolha lhe confere características no 3° nível e novamente no 7°, 15° e 20° nível. Tais características incluem as magias de juramento e a característica Canalizar Divindade.\nMagias de Juramento. Cada juramento possui uma lista de magias associada a ele. Você ganha acesso a essas magias nos níveis especificados na descrição do juramento. Uma vez que você tenha ganhado acesso a uma magia de juramento, você sempre a terá preparada. Magias de juramento não contam no número de magias que você pode preparar a cada dia. Se você ganhar uma magia de juramento que não apareça na lista de magias de paladino, a magia será, no entanto, uma magia de paladino para você.\nCanalizar Divindade. Seu juramento permite que você canalize energia divina para abastecer efeitos mágicos. Cada opção de Canalizar Divindade concedida por um juramento explica como usá-la. Quando você usa o seu Canalizar Divindade, escolhe qual opção usar. Você deve terminar um descanso curto ou longo para poder usar seu Canalizar Divindade novamente.\nAlguns efeitos de Canalizar Divindade requerem um teste de resistência. Quando você usar tais efeitos desta classe, a CD será igual à CD das suas magias de paladino.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 4,
      asi: true,
      description:
        "Quando você atinge o 4° nível e novamente no 8°, 12°, 16° e 19° nível, você pode aumentar um valor de habilidade, à sua escolha, em 2, ou pode aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
    {
      name: "Ataque Extra",
      level: 5,
      description: "A partir do 5° nível, você pode atacar duas vezes, ao invés de uma, sempre que realizar a ação de Ataque no seu turno.",
    },
    {
      name: "Aura de Proteção",
      level: 6,
      description:
        "A partir do 6° nível, sempre que você ou uma criatura amigável a até 3 metros de você tiver que fazer um teste de resistência, essa criatura ganha um bônus no teste de resistência igual ao seu modificador de Carisma (bônus mínimo de +1). Você deve estar consciente para conceder esse bônus.\nNo 18° nível, o alcance dessa aura aumenta para 9 metros.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 8,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2, ou pode aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
    {
      name: "Aura da Coragem",
      level: 10,
      description:
        "A partir do 10° nível, você e as criaturas amigáveis a até 3 metros de você não podem ser amedrontadas enquanto você estiver consciente.\nNo 18° nível, o alcance dessa aura aumenta para 9 metros.",
    },
    {
      name: "Destruição Divina Aprimorada",
      level: 11,
      description:
        "No 11° nível, você fica tão imbuído do poder da justiça que todos os seus ataques corpo a corpo com arma carregam poder divino. Sempre que você atingir uma criatura com um ataque corpo a corpo com arma, a criatura sofre 1d8 de dano radiante extra. Se você também usar sua Destruição Divina no ataque, você adiciona esse dano ao dano extra da Destruição Divina.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 12,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2, ou pode aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
    {
      name: "Toque Purificador",
      level: 14,
      description:
        "A partir do 14° nível, você pode usar sua ação para encerrar uma magia em si mesmo ou em uma criatura voluntária que você tocar.\nVocê pode usar essa característica um número de vezes igual ao seu modificador de Carisma (mínimo de uma vez). Você recupera os usos gastos quando termina um descanso longo.",
      resource: { max: "cha", recharge: "long" },
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 16,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2, ou pode aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
    {
      name: "Aprimoramentos de Aura",
      level: 18,
      description:
        "No 18° nível, o alcance das suas auras aumenta de 3 para 9 metros. Isso vale para a Aura de Proteção, a Aura da Coragem e a aura de 7° nível concedida pelo seu Juramento Sagrado (por exemplo, Aura de Devoção, Aura de Vigilância, Aura da Conquista ou Aura do Guardião).",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 19,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2, ou pode aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
  ],
  subclasses: [
    {
      name: "Juramento de Devoção",
      source: "PHB",
      description:
        "Vincula o paladino aos mais sublimes ideais de justiça, virtude e ordem: o cavaleiro de armadura brilhante que age com honra em busca da justiça e do bem maior. Dogmas: Honestidade, Coragem, Compaixão, Honra e Dever.",
      spells: {
        "3": ["Proteção Contra o Bem e Mal", "Santuário"],
        "5": ["Restauração Menor", "Zona da Verdade"],
        "9": ["Sinal de Esperança", "Dissipar Magia"],
        "13": ["Movimentação Livre", "Guardião da Fé"],
        "17": ["Comunhão", "Coluna de Chamas"],
      },
      features: [
        {
          name: "Canalizar Divindade",
          level: 3,
          description:
            "Quando você faz esse juramento, no 3° nível, você ganha as duas opções de Canalizar Divindade a seguir.\nArma Sagrada. Com uma ação, você pode imbuir uma arma que esteja empunhando com energia positiva, usando seu Canalizar Divindade. Por 1 minuto, você adiciona seu modificador de Carisma às jogadas de ataque feitas com essa arma (bônus mínimo de +1). A arma também emite luz plena num raio de 6 metros e penumbra por mais 6 metros. Se a arma ainda não for mágica, ela se torna mágica por essa duração.\nVocê pode encerrar o efeito no seu turno como parte de qualquer outra ação. Se você não estiver mais segurando ou portando a arma, ou se ficar inconsciente, o efeito termina.\nExpulsar o Profano. Com uma ação, você apresenta seu símbolo sagrado e faz uma oração censurando corruptores e mortos-vivos, usando seu Canalizar Divindade. Cada corruptor ou morto-vivo que puder ver ou ouvir você e estiver a até 9 metros deve realizar um teste de resistência de Sabedoria. Se a criatura falhar no teste, ela é expulsa por 1 minuto ou até sofrer dano.\n" +
            EXPULSAO_TEXTO,
          resource: { name: "Canalizar Divindade", max: 1, recharge: "short" },
        },
        {
          name: "Aura de Devoção",
          level: 7,
          description:
            "A partir do 7° nível, você e as criaturas amigáveis a até 3 metros de você não podem ser enfeitiçadas enquanto você estiver consciente.\nNo 18° nível, o alcance dessa aura aumenta para 9 metros.",
        },
        {
          name: "Pureza de Espírito",
          level: 15,
          description: "A partir do 15° nível, você está sempre sob o efeito da magia proteção contra o bem e mal.",
        },
        {
          name: "Halo Sagrado",
          level: 20,
          description:
            "No 20° nível, com uma ação, você pode emanar uma aura de luz solar. Por 1 minuto, luz plena emana de você num raio de 9 metros e penumbra brilha por mais 9 metros.\nSempre que uma criatura inimiga começar seu turno na luz plena, ela sofre 10 de dano radiante.\nAlém disso, por essa duração, você tem vantagem em testes de resistência contra magias conjuradas por corruptores ou mortos-vivos.\nUma vez que você use essa característica, não poderá usá-la novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
    {
      name: "Juramento dos Anciões",
      source: "PHB",
      description:
        "Tão antigo quanto a raça dos elfos e os rituais dos druidas: cavaleiros feéricos e verdejantes que lutam ao lado da luz por amor às coisas belas e vivificantes do mundo. Dogmas: Acenda a Luz, Abrigue a Luz, Preserve Sua Própria Luz, Seja a Luz.",
      spells: {
        "3": ["Golpe Constritor", "Falar com Animais"],
        "5": ["Raio Lunar", "Passo Nebuloso"],
        "9": ["Ampliar Plantas", "Proteção Contra Energia"],
        "13": ["Tempestade de Gelo", "Pele de Pedra"],
        "17": ["Comunhão com a Natureza", "Caminhar em Árvores"],
      },
      features: [
        {
          name: "Canalizar Divindade",
          level: 3,
          description:
            "Quando você faz esse juramento, no 3° nível, você ganha as duas opções de Canalizar Divindade a seguir.\nFúria da Natureza. Você pode usar seu Canalizar Divindade para invocar forças primitivas para enredar um oponente. Com uma ação, você faz vinhas espectrais crescerem e alcançarem uma criatura a até 3 metros de você que você possa ver. A criatura deve ser bem-sucedida num teste de resistência de Força ou Destreza (à escolha dela) ou ficará impedida. Enquanto estiver impedida pelas vinhas, a criatura repete o teste de resistência no final de cada turno dela. Se obtiver sucesso, ela se liberta e as vinhas desaparecem.\nExpulsar os Infiéis. Você pode usar seu Canalizar Divindade para pronunciar palavras antigas que são dolorosas para fadas e corruptores que as ouvem. Com uma ação, você ergue seu símbolo sagrado, e cada fada ou corruptor que puder ver ou ouvir você e estiver a até 9 metros deve realizar um teste de resistência de Sabedoria. Se a criatura falhar no teste, ela é expulsa por 1 minuto ou até sofrer dano.\n" +
            EXPULSAO_TEXTO,
          resource: { name: "Canalizar Divindade", max: 1, recharge: "short" },
        },
        {
          name: "Aura de Vigilância",
          level: 7,
          description:
            "A partir do 7° nível, a magia antiga fica tão profunda em você que forma uma proteção mística. Você e as criaturas amigáveis a até 3 metros de você têm resistência ao dano de magias.\nNo 18° nível, o alcance dessa aura aumenta para 9 metros.",
        },
        {
          name: "Sentinela Imortal",
          level: 15,
          description:
            "A partir do 15° nível, quando você for reduzido a 0 pontos de vida sem morrer imediatamente, você pode escolher cair para 1 ponto de vida em vez disso. Uma vez que você use essa característica, não poderá usá-la novamente até terminar um descanso longo.\nAlém disso, você não sofre nenhum efeito colateral por envelhecer e não pode ser envelhecido magicamente.",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Campeão dos Anciões",
          level: 20,
          description:
            "No 20° nível, você pode assumir a forma de uma antiga força da natureza, tomando a aparência que desejar. Por exemplo, sua pele pode ficar verde ou adquirir textura de casca de árvore, seu cabelo pode ficar com aparência de folhas ou musgo, ou podem crescer galhadas ou uma juba de leão.\nUsando sua ação, você sofre uma transformação. Por 1 minuto, você ganha os seguintes benefícios:\n• No início de cada um dos seus turnos, você recupera 10 pontos de vida.\n• Sempre que você conjurar uma magia de paladino que tenha tempo de conjuração de 1 ação, você pode conjurá-la usando uma ação bônus em vez disso.\n• Criaturas inimigas a até 3 metros de você têm desvantagem em testes de resistência contra suas magias de paladino e opções de Canalizar Divindade.\nUma vez que você use essa característica, não poderá usá-la novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
    {
      name: "Juramento de Vingança",
      source: "PHB",
      description:
        "Um comprometimento solene de punir aqueles que cometeram pecados graves; para esses vingadores e cavaleiros negros, a própria pureza importa menos que fazer justiça. Dogmas: Combater o Mal Maior, Sem Misericórdia para os Malignos, A Todo Custo, Restituição.",
      spells: {
        "3": ["Perdição", "Marca do Caçador"],
        "5": ["Imobilizar Pessoa", "Passo Nebuloso"],
        "9": ["Velocidade", "Proteção Contra Energia"],
        "13": ["Banimento", "Porta Dimensional"],
        "17": ["Imobilizar Monstro", "Vidência"],
      },
      features: [
        {
          name: "Canalizar Divindade",
          level: 3,
          description:
            "Quando você faz esse juramento, no 3° nível, você ganha as duas opções de Canalizar Divindade a seguir.\nAbjurar Inimigo. Com uma ação, você ergue seu símbolo sagrado e faz uma prece de condenação, usando seu Canalizar Divindade. Escolha uma criatura a até 18 metros de você que você possa ver. A criatura deve realizar um teste de resistência de Sabedoria, a não ser que seja imune a ser amedrontada. Corruptores e mortos-vivos têm desvantagem nesse teste de resistência.\nSe falhar no teste, a criatura fica amedrontada por 1 minuto ou até sofrer qualquer dano. Enquanto estiver amedrontada, o deslocamento da criatura é 0 e ela não pode se beneficiar de qualquer bônus de deslocamento.\nSe for bem-sucedida, o deslocamento da criatura é reduzido à metade por 1 minuto ou até ela sofrer qualquer dano.\nVoto de Inimizade. Com uma ação bônus, você pode pronunciar um voto de inimizade contra uma criatura que você possa ver a até 3 metros, usando seu Canalizar Divindade. Você ganha vantagem nas jogadas de ataque contra a criatura por 1 minuto ou até ela cair a 0 pontos de vida ou ficar inconsciente.",
          resource: { name: "Canalizar Divindade", max: 1, recharge: "short" },
        },
        {
          name: "Vingador Implacável",
          level: 7,
          description:
            "No 7° nível, seu foco sobrenatural ajuda você a impedir a fuga de um inimigo. Quando você atinge uma criatura com um ataque de oportunidade, você pode se mover até metade do seu deslocamento imediatamente depois do ataque, como parte da mesma reação. Esse movimento não provoca ataques de oportunidade.",
        },
        {
          name: "Alma de Vingança",
          level: 15,
          description:
            "A partir do 15° nível, a autoridade com a qual você pronuncia seu Voto de Inimizade lhe dá maior poder sobre seu inimigo. Quando uma criatura sob efeito do seu Voto de Inimizade realizar um ataque, você pode usar sua reação para realizar um ataque corpo a corpo com arma contra essa criatura, se ela estiver ao seu alcance.",
        },
        {
          name: "Anjo Vingador",
          level: 20,
          description:
            "No 20° nível, você pode assumir a forma de um anjo vingador. Usando sua ação, você sofre uma transformação. Por 1 hora, você ganha os seguintes benefícios:\n• Asas crescem nas suas costas e lhe concedem deslocamento de voo de 18 metros.\n• Você emana uma aura de ameaça num raio de 9 metros. A primeira vez que qualquer criatura inimiga entrar na aura ou começar seu turno nela durante uma batalha, a criatura deve ser bem-sucedida num teste de resistência de Sabedoria ou ficará amedrontada por você por 1 minuto ou até sofrer qualquer dano. Jogadas de ataque contra a criatura amedrontada têm vantagem.\nUma vez que você use essa característica, não poderá usá-la novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
    {
      name: "Juramento da Conquista",
      source: "XGtE",
      description:
        "Chama os paladinos que buscam a glória na batalha e a subjugação de seus inimigos: cavaleiros tiranos e cavaleiros do inferno que esmagam as forças do caos pelo medo. Dogmas: Apagar a Chama da Esperança, Governar com Punho de Ferro, Força Acima de Tudo.",
      spells: {
        "3": ["Armadura de Agathys", "Comando"],
        "5": ["Imobilizar Pessoa", "Arma Espiritual"],
        "9": ["Rogar Maldição", "Medo"],
        "13": ["Dominar Besta", "Pele de Pedra"],
        "17": ["Névoa Mortal", "Dominar Pessoa"],
      },
      features: [
        {
          name: "Canalizar Divindade",
          level: 3,
          description:
            "Quando você faz esse juramento, no 3° nível, você ganha as duas opções de Canalizar Divindade a seguir.\nPresença Conquistadora. Você pode usar seu Canalizar Divindade para exalar uma presença aterrorizante. Com uma ação, você força cada criatura à sua escolha que você possa ver a até 9 metros de você a fazer um teste de resistência de Sabedoria. Se falhar, a criatura fica amedrontada por você por 1 minuto. A criatura amedrontada pode repetir o teste no final de cada um dos turnos dela, encerrando o efeito sobre si mesma em caso de sucesso.\nGolpe Guiado. Você pode usar seu Canalizar Divindade para atacar com precisão sobrenatural. Quando você faz uma jogada de ataque, pode usar seu Canalizar Divindade para ganhar +10 de bônus na jogada. Você pode fazer essa escolha depois de ver a rolagem, mas antes de o Mestre dizer se o ataque acertou ou errou.",
          resource: { name: "Canalizar Divindade", max: 1, recharge: "short" },
        },
        {
          name: "Aura da Conquista",
          level: 7,
          description:
            "A partir do 7° nível, você emana constantemente uma aura ameaçadora enquanto não estiver incapacitado. A aura se estende por 3 metros a partir de você em todas as direções, mas não através de cobertura total.\nSe uma criatura estiver amedrontada por você, o deslocamento dela é reduzido a 0 enquanto ela estiver na aura, e ela sofre dano psíquico igual à metade do seu nível de paladino se começar o turno dela dentro da aura.\nNo 18° nível, o alcance dessa aura aumenta para 9 metros.",
        },
        {
          name: "Repreensão Arrogante",
          level: 15,
          description:
            "A partir do 15° nível, aqueles que ousam atacá-lo são punidos psiquicamente por sua audácia. Sempre que uma criatura atingir você com um ataque, essa criatura sofre dano psíquico igual ao seu modificador de Carisma (mínimo de 1), desde que você não esteja incapacitado.",
        },
        {
          name: "Conquistador Invencível",
          level: 20,
          description:
            "No 20° nível, você ganha a capacidade de exercer uma proeza marcial extraordinária. Com uma ação, você pode se tornar magicamente um avatar da conquista, ganhando os seguintes benefícios por 1 minuto:\n• Você tem resistência a todo tipo de dano.\n• Quando você realiza a ação de Ataque no seu turno, pode fazer um ataque adicional como parte dessa ação.\n• Seus ataques corpo a corpo com arma causam acerto crítico com uma rolagem de 19 ou 20 no d20.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
    {
      name: "Juramento da Redenção",
      source: "XGtE",
      description:
        "Um caminho difícil que exige usar a violência apenas como último recurso: os redentores acreditam que qualquer pessoa pode ser redimida, embora tragam toda a ira de suas armas contra mortos-vivos e corruptores. Dogmas: Paz, Inocência, Paciência, Sabedoria.",
      spells: {
        "3": ["Santuário", "Sono"],
        "5": ["Acalmar Emoções", "Imobilizar Pessoa"],
        "9": ["Contramágica", "Padrão Hipnótico"],
        "13": ["Esfera Resiliente de Otiluke", "Pele de Pedra"],
        "17": ["Imobilizar Monstro", "Muralha de Energia"],
      },
      features: [
        {
          name: "Canalizar Divindade",
          level: 3,
          description:
            "Quando você faz esse juramento, no 3° nível, você ganha as duas opções de Canalizar Divindade a seguir.\nEmissário da Paz. Você pode usar seu Canalizar Divindade para fortalecer sua presença com poder divino. Com uma ação bônus, você se concede +5 de bônus nos testes de Carisma (Persuasão) pelos próximos 10 minutos.\nRepreender a Violência. Você pode usar seu Canalizar Divindade para repreender aqueles que usam a violência. Imediatamente após um atacante a até 9 metros de você causar dano com um ataque contra uma criatura diferente de você, você pode usar sua reação para forçar o atacante a fazer um teste de resistência de Sabedoria. Se falhar, o atacante sofre dano radiante igual ao dano que acabou de causar. Se for bem-sucedido, sofre metade desse dano.",
          resource: { name: "Canalizar Divindade", max: 1, recharge: "short" },
        },
        {
          name: "Aura do Guardião",
          level: 7,
          description:
            "A partir do 7° nível, você pode proteger os outros do dano ao custo da sua própria saúde. Quando uma criatura a até 3 metros de você sofrer dano, você pode usar sua reação para, magicamente, sofrer esse dano no lugar dela. Essa característica não transfere quaisquer outros efeitos que possam acompanhar o dano, e esse dano não pode ser reduzido de forma alguma.\nNo 18° nível, o alcance dessa aura aumenta para 9 metros.",
        },
        {
          name: "Espírito Protetor",
          level: 15,
          description:
            "A partir do 15° nível, uma presença sagrada repara suas feridas em batalha. Você recupera pontos de vida iguais a 1d6 + metade do seu nível de paladino se terminar o seu turno em combate com menos da metade dos seus pontos de vida restantes e não estiver incapacitado.",
        },
        {
          name: "Emissário da Redenção",
          level: 20,
          description:
            "No 20° nível, você se torna um avatar da paz, o que lhe dá dois benefícios:\n• Você tem resistência a todo dano causado por outras criaturas (seus ataques, magias e outros efeitos).\n• Sempre que uma criatura atingir você com um ataque, ela sofre dano radiante igual à metade do dano que você sofreu.\nSe você atacar uma criatura, conjurar uma magia sobre ela ou causar dano a ela por qualquer meio que não seja essa característica, nenhum desses benefícios funciona contra essa criatura até você terminar um descanso longo.",
        },
      ],
    },
    {
      name: "Juramento da Glória",
      source: "TCoE",
      description:
        "Paladinos que acreditam que eles e seus companheiros estão destinados à glória através de atos de heroísmo; treinam diligentemente e encorajam seus aliados para o chamado do destino. Princípios: Ações antes das palavras, Desafios são testes, Aprimore o corpo, Discipline a alma.",
      spells: {
        "3": ["Raio Guiador", "Heroísmo"],
        "5": ["Aprimorar Habilidade", "Arma Mágica"],
        "9": ["Velocidade", "Proteção Contra Energia"],
        "13": ["Compulsão", "Movimentação Livre"],
        "17": ["Comunhão", "Coluna de Chamas"],
      },
      features: [
        {
          name: "Canalizar Divindade",
          level: 3,
          description:
            "No 3° nível, você adquire as duas opções de Canalizar Divindade a seguir.\nAtleta Inigualável. Com uma ação bônus, você pode usar seu Canalizar Divindade para aprimorar seu atletismo. Pelos próximos 10 minutos, você tem vantagem nos testes de Força (Atletismo) e Destreza (Acrobacia); pode carregar, empurrar, arrastar e levantar o dobro do peso normal; e a distância dos seus saltos à distância e em altura aumenta em 3 metros (essa distância extra consome deslocamento normalmente).\nGolpe Inspirador. Imediatamente após causar dano a uma criatura com sua Destruição Divina, você pode usar seu Canalizar Divindade como uma ação bônus para distribuir pontos de vida temporários entre criaturas à sua escolha a até 9 metros de você, podendo incluir a si mesmo. O total de pontos de vida temporários é igual a 2d8 + seu nível nesta classe, dividido entre as criaturas escolhidas da forma que você preferir.",
          resource: { name: "Canalizar Divindade", max: 1, recharge: "short" },
        },
        {
          name: "Aura de Vivacidade",
          level: 7,
          description:
            "A partir do 7° nível, você emana uma aura que preenche você e seus companheiros com velocidade sobrenatural, permitindo atravessar rapidamente o campo de batalha em formação. Seu deslocamento aumenta em 3 metros. Além disso, se você não estiver incapacitado, o deslocamento de qualquer aliado que comece o turno dele a até 1,5 metro de você também aumenta em 3 metros até o final daquele turno.\nNo 18° nível, o alcance da aura aumenta para 3 metros.",
        },
        {
          name: "Defesa Gloriosa",
          level: 15,
          description:
            "A partir do 15° nível, você pode transformar sua defesa em um golpe súbito. Quando você ou outra criatura que você possa ver a até 3 metros de você for atingida por uma jogada de ataque, você pode usar sua reação para conceder um bônus na CA do alvo contra esse ataque, potencialmente fazendo com que ele erre. O bônus é igual ao seu modificador de Carisma (mínimo de +1). Se o ataque errar, você pode realizar um ataque com arma contra o atacante como parte dessa reação, desde que ele esteja dentro do alcance da sua arma.\nVocê pode usar essa característica um número de vezes igual ao seu modificador de Carisma (mínimo de uma vez) e recupera todos os usos gastos ao terminar um descanso longo.",
          resource: { max: "cha", recharge: "long" },
        },
        {
          name: "Lenda Viva",
          level: 20,
          description:
            "No 20° nível, você pode fortalecer a si mesmo por meio das lendas – verdadeiras ou exageradas – dos seus grandes feitos. Com uma ação bônus, você adquire os seguintes benefícios por 1 minuto:\n• Você é abençoado com uma presença sobrenatural, ganhando vantagem em todos os testes de Carisma.\n• Uma vez por turno, quando você realizar um ataque com arma e errar, você pode fazer com que o ataque acerte em vez disso.\n• Se você falhar em um teste de resistência, pode usar sua reação para rolá-lo novamente. Você deve usar o novo resultado.\nAssim que usar essa ação bônus, você não poderá usá-la novamente até terminar um descanso longo, a menos que gaste um espaço de magia de 5° nível para usá-la de novo.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
    {
      name: "Juramento da Vigilância",
      source: "TCoE",
      description:
        "Compromete o paladino a proteger os reinos mortais da predação de criaturas extraplanares, mantendo prontidão constante e uma suspeita saudável de cultos e corrupção. Princípios: Vigilância, Lealdade, Disciplina.",
      spells: {
        "3": ["Alarme", "Detectar Magia"],
        "5": ["Raio Lunar", "Ver o Invisível"],
        "9": ["Contramágica", "Indetectável"],
        "13": ["Aura de Pureza", "Banimento"],
        "17": ["Imobilizar Monstro", "Vidência"],
      },
      features: [
        {
          name: "Canalizar Divindade",
          level: 3,
          description:
            "No 3° nível, você adquire as duas opções de Canalizar Divindade a seguir.\nVontade do Vigilante. Você pode usar seu Canalizar Divindade para investir sua presença com a força protetora da sua fé. Com uma ação, você escolhe um número de criaturas que possa ver a até 9 metros de você, até um máximo igual ao seu modificador de Carisma (mínimo de uma criatura). Por 1 minuto, você e as criaturas escolhidas têm vantagem em testes de resistência de Inteligência, Sabedoria e Carisma.\nExpulsar Extraplanares. Você pode usar seu Canalizar Divindade para punir seres de outros mundos. Com uma ação, você exibe seu símbolo sagrado, e cada aberração, celestial, elemental, fada ou corruptor a até 9 metros de você que possa ouvi-lo deve fazer um teste de resistência de Sabedoria. Se falhar, a criatura é expulsa por 1 minuto ou até sofrer dano.\n" +
            EXPULSAO_TEXTO,
          resource: { name: "Canalizar Divindade", max: 1, recharge: "short" },
        },
        {
          name: "Aura do Sentinela",
          level: 7,
          description:
            "A partir do 7° nível, você emite uma aura de prontidão enquanto não estiver incapacitado. Quando você ou qualquer criatura à sua escolha a até 3 metros de você rolar iniciativa, todos vocês ganham um bônus na iniciativa igual ao seu bônus de proficiência.\nNo 18° nível, o alcance dessa aura aumenta para 9 metros.",
        },
        {
          name: "Repreensão do Vigilante",
          level: 15,
          description:
            "A partir do 15° nível, você aprendeu a punir qualquer um que ouse usar de engodos contra você e seus seguidores. Sempre que você ou uma criatura que você possa ver a até 9 metros de você for bem-sucedida em um teste de resistência de Inteligência, Sabedoria ou Carisma, você pode usar sua reação para causar 2d8 + seu modificador de Carisma de dano de energia à criatura que provocou o teste de resistência.",
        },
        {
          name: "Baluarte Mortal",
          level: 20,
          description:
            "No 20° nível, você manifesta uma centelha do poder divino em defesa dos reinos mortais. Com uma ação bônus, você adquire os seguintes benefícios por 1 minuto:\n• Você ganha visão verdadeira com alcance de 36 metros.\n• Você tem vantagem nas jogadas de ataque contra aberrações, celestiais, elementais, fadas e corruptores.\n• Quando você atinge uma criatura com um ataque e causa dano a ela, você também pode forçá-la a fazer um teste de resistência de Carisma contra a CD das suas magias. Se falhar, a criatura é magicamente banida para seu plano de existência natal, caso não esteja nele no momento. Se for bem-sucedida, a criatura não pode ser banida por essa característica por 24 horas.\nAssim que usar essa ação bônus, você não poderá usá-la novamente até terminar um descanso longo, a menos que gaste um espaço de magia de 5° nível para usá-la de novo.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
  ],
};
