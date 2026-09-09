import type { ClassDef } from "@/lib/types";

/**
 * Clérigo — progressão completa (níveis 1–20) e todos os Domínios Divinos do
 * Livro do Jogador (PHB p. 64–71), Guia de Xanathar (XGtE p. 23–25) e
 * Caldeirão de Tasha (TCoE p. 36–41).
 */
export const CLERIGO: ClassDef = {
  name: "Clérigo",
  source: "PHB",
  subclassLabel: "Domínio Divino",
  subclassLevel: 1,
  features: [
    {
      name: "Conjuração",
      level: 1,
      description:
        "Como um canalizador de poder divino, você pode conjurar magias de clérigo.\n" +
        "Truques. Você conhece três truques, à sua escolha, da lista de magias de clérigo. Você aprende truques de clérigo adicionais em níveis mais altos: 4 truques no 4º nível e 5 truques no 10º nível.\n" +
        "Preparando e Conjurando Magias. A tabela O Clérigo mostra quantos espaços de magia você tem para conjurar suas magias de 1º nível e superiores. Para conjurar uma dessas magias, você precisa gastar um espaço do nível da magia ou superior. Você recupera todos os espaços gastos quando termina um descanso longo.\n" +
        "Você prepara a lista de magias disponíveis selecionando-as da lista de magias de clérigo. Você seleciona um número de magias igual ao seu modificador de Sabedoria + seu nível de clérigo (mínimo de uma magia). Essas magias devem ser de níveis para os quais você possua espaços de magia. Ao conjurar a magia, você não a retira de sua lista de magias preparadas. Você pode modificar a sua lista de magias preparadas quando termina um descanso longo; preparar uma nova lista requer tempo gasto em preces e meditação: no mínimo 1 minuto por nível de magia para cada magia preparada.\n" +
        "Habilidade de Conjuração. Sabedoria é a sua habilidade de conjuração para suas magias de clérigo. CD para suas magias = 8 + bônus de proficiência + seu modificador de Sabedoria. Modificador de ataque de magia = seu bônus de proficiência + seu modificador de Sabedoria.\n" +
        "Conjuração de Ritual. Você pode conjurar qualquer magia de clérigo que você tenha preparada como um ritual se ela possuir o descritor ritual.\n" +
        "Foco de Conjuração. Você pode usar um símbolo sagrado como foco de conjuração das suas magias de clérigo.",
    },
    {
      name: "Domínio Divino",
      level: 1,
      description:
        "Escolha um domínio relacionado à sua divindade. Essa escolha, realizada no 1º nível, concede magias de domínio e outras características. Ela também concede a você outras formas de utilizar seu Canalizar Divindade quando você ganhá-lo no 2º nível, bem como outros benefícios no 6º, 8º e 17º níveis.\n" +
        "Magias de Domínio. Cada domínio tem uma lista de magias – as magias de domínio – que você adquire nos níveis especificados pelo seu domínio. Quando você ganha uma magia de domínio, você sempre a tem preparada, e essa magia não conta no número de magias que você pode preparar a cada dia. Se você tem uma magia de domínio que não aparece na lista de magias de clérigo, mesmo assim ela é uma magia de clérigo para você.",
    },
    {
      name: "Canalizar Divindade (1/descanso)",
      level: 2,
      description:
        "No 2º nível, você se torna capaz de canalizar energia diretamente de sua divindade, utilizando-a como combustível para efeitos mágicos. Você começa com dois efeitos: Expulsar Mortos-Vivos e um efeito determinado pelo seu domínio. Alguns domínios conferem efeitos adicionais conforme você avança de nível.\n" +
        "Quando você usar seu Canalizar Divindade, você escolhe qual efeito quer criar. Você precisa terminar um descanso curto ou longo para usar a característica de novo. Alguns efeitos requerem teste de resistência; quando você usar um desses efeitos, a CD é igual à das suas magias de clérigo.\n" +
        "A partir do 6º nível, você pode usar Canalizar Divindade duas vezes entre descansos e, a partir do 18º nível, três vezes. Você recupera os usos gastos quando termina um descanso curto ou longo.\n" +
        "Canalizar Divindade: Expulsar Mortos-Vivos. Usando uma ação, você levanta seu símbolo sagrado e murmura uma prece repreendendo os mortos-vivos. Cada morto-vivo que puder ver ou ouvir você em um raio de 9 metros deve fazer um teste de resistência de Sabedoria. Se falhar, a criatura está expulsa por 1 minuto ou até sofrer algum dano.\n" +
        "Uma criatura expulsa deve usar seu turno para fugir de você da melhor forma possível e não pode, por vontade própria, aproximar-se a menos de 9 metros de você. Ela também não pode usar reações. Como ação, ela só pode realizar a ação Disparada ou tentar escapar de um efeito que a impeça de se mover. Se não há para onde ir, a criatura pode usar a ação Esquivar.",
      resource: { name: "Canalizar Divindade", max: 1, recharge: "short", byLevel: { "2": 1, "6": 2, "18": 3 } },
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 4,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
      asi: true,
    },
    {
      name: "Destruir Mortos-Vivos (ND 1/2)",
      level: 5,
      description:
        "A partir do 5º nível, quando um morto-vivo falhar no teste de resistência contra a sua característica Expulsar Mortos-Vivos, ele é instantaneamente destruído se o Nível de Desafio dele for menor ou igual ao valor da tabela Destruir Mortos-Vivos, de acordo com seu nível de clérigo.\n" +
        "Destruir Mortos-Vivos: 5º nível – ND 1/2 ou menor; 8º nível – ND 1 ou menor; 11º nível – ND 2 ou menor; 14º nível – ND 3 ou menor; 17º nível – ND 4 ou menor.",
    },
    {
      name: "Canalizar Divindade (2/descanso)",
      level: 6,
      description:
        "A partir do 6º nível, você pode usar Canalizar Divindade duas vezes entre descansos. Você recupera os usos gastos quando termina um descanso curto ou longo.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 8,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
      asi: true,
    },
    {
      name: "Destruir Mortos-Vivos (ND 1)",
      level: 8,
      description:
        "A partir do 8º nível, um morto-vivo que falhar no teste de resistência contra seu Expulsar Mortos-Vivos é instantaneamente destruído se tiver Nível de Desafio 1 ou menor.",
    },
    {
      name: "Intervenção Divina",
      level: 10,
      description:
        "A partir do 10º nível, você pode rogar à sua divindade para que auxilie você em uma árdua tarefa.\n" +
        "Implorar pelo auxílio requer uma ação. Você precisa descrever o que busca e realizar uma rolagem de dado de porcentagem. Se o resultado for menor ou igual ao seu nível de clérigo, sua divindade intervém. O Mestre escolhe a natureza da intervenção; o efeito de qualquer magia de clérigo ou magia de domínio é apropriado como resultado.\n" +
        "Se sua divindade intervir, você fica impedido de usar essa característica de novo por 7 dias. Do contrário, você pode usá-la de novo após terminar um descanso longo. (O recurso é marcado como recarga por descanso longo; se a intervenção ocorrer, anote que só volta após 7 dias.)\n" +
        "No 20º nível, seus pedidos de intervenção funcionam automaticamente, sem necessidade de rolagem de dados.",
      resource: { max: 1, recharge: "long" },
    },
    {
      name: "Destruir Mortos-Vivos (ND 2)",
      level: 11,
      description:
        "A partir do 11º nível, um morto-vivo que falhar no teste de resistência contra seu Expulsar Mortos-Vivos é instantaneamente destruído se tiver Nível de Desafio 2 ou menor.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 12,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
      asi: true,
    },
    {
      name: "Destruir Mortos-Vivos (ND 3)",
      level: 14,
      description:
        "A partir do 14º nível, um morto-vivo que falhar no teste de resistência contra seu Expulsar Mortos-Vivos é instantaneamente destruído se tiver Nível de Desafio 3 ou menor.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 16,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
      asi: true,
    },
    {
      name: "Destruir Mortos-Vivos (ND 4)",
      level: 17,
      description:
        "A partir do 17º nível, um morto-vivo que falhar no teste de resistência contra seu Expulsar Mortos-Vivos é instantaneamente destruído se tiver Nível de Desafio 4 ou menor.",
    },
    {
      name: "Canalizar Divindade (3/descanso)",
      level: 18,
      description:
        "A partir do 18º nível, você pode usar Canalizar Divindade três vezes entre descansos. Você recupera os usos gastos quando termina um descanso curto ou longo.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 19,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
      asi: true,
    },
    {
      name: "Aprimoramento de Intervenção Divina",
      level: 20,
      description:
        "No 20º nível, seus pedidos de Intervenção Divina funcionam automaticamente, sem necessidade de rolagem de dados. A restrição de 7 dias após uma intervenção continua valendo.",
    },
  ],
  subclasses: [
    // ------------------------------------------------------------------ PHB
    {
      name: "Domínio do Conhecimento",
      source: "PHB",
      description:
        "Os deuses do conhecimento – como Oghma, Boccob, Gilean, Aureon e Thoth – valorizam o estudo e a compreensão acima de tudo. Seus seguidores estudam conhecimento esotérico, coletam tomos antigos, escavam locais secretos e aprendem tudo que podem.",
      spells: {
        "1": ["Comando", "Identificação"],
        "3": ["Augúrio", "Sugestão"],
        "5": ["Dificultar Detecção", "Falar com Os Mortos"],
        "7": ["Olho Arcano", "Confusão"],
        "9": ["Conhecimento Lendário", "Vidência"],
      },
      features: [
        {
          name: "Magias de Domínio",
          level: 1,
          description:
            "Você ganha as magias de domínio nos níveis de clérigo indicados; elas estão sempre preparadas e não contam no número de magias que você pode preparar.\n1º: comando, identificação. 3º: augúrio, sugestão. 5º: dificultar detecção, falar com os mortos. 7º: olho arcano, confusão. 9º: conhecimento lendário, vidência.",
        },
        {
          name: "Bênçãos do Conhecimento",
          level: 1,
          description:
            "No 1º nível, você aprende dois idiomas, à sua escolha. Você também se torna proficiente em duas perícias, à sua escolha, dentre as seguintes: Arcanismo, História, Natureza ou Religião.\nSeu bônus de proficiência é dobrado em qualquer teste de habilidade que você fizer usando qualquer dessas duas perícias.",
        },
        {
          name: "Canalizar Divindade: Conhecimento das Eras",
          level: 2,
          description:
            "A partir do 2º nível, você pode usar seu Canalizar Divindade para beber da fonte divina do conhecimento. Com uma ação, você escolhe uma perícia ou ferramenta. Por 10 minutos, você terá proficiência com a perícia ou ferramenta escolhida.",
        },
        {
          name: "Canalizar Divindade: Ler Pensamentos",
          level: 6,
          description:
            "No 6º nível, você pode usar seu Canalizar Divindade para ler a mente de uma criatura e, então, usar seu acesso à mente dela para comandá-la.\nCom uma ação, escolha uma criatura que você possa ver a até 18 metros de você. Essa criatura deve realizar um teste de resistência de Sabedoria. Se for bem-sucedida, você não poderá usar essa característica contra ela novamente até terminar um descanso longo.\nSe a criatura falhar no teste, você pode ler seus pensamentos superficiais (os mais atuais, que refletem suas emoções e aquilo em que ela está pensando no momento) enquanto ela estiver a até 18 metros de você. Esse efeito dura 1 minuto.\nDurante esse tempo, você pode usar sua ação para terminar esse efeito e conjurar a magia sugestão na criatura sem gastar um espaço de magia. O alvo falha automaticamente no teste de resistência contra essa magia.",
        },
        {
          name: "Conjuração Poderosa",
          level: 8,
          description:
            "A partir do 8º nível, você adiciona seu modificador de Sabedoria ao dano causado por qualquer truque de clérigo.",
        },
        {
          name: "Visões do Passado",
          level: 17,
          description:
            "A partir do 17º nível, você pode convocar visões do passado relacionadas a um objeto que você esteja segurando ou ao ambiente ao seu redor. Você gasta pelo menos 1 minuto meditando e rezando e, então, recebe vislumbres oníricos e turvos de eventos recentes. Você pode meditar dessa maneira por um número de minutos igual ao seu valor de Sabedoria e deve manter a concentração durante esse tempo, como se estivesse conjurando uma magia.\nQuando você usa essa característica, não pode usá-la novamente até terminar um descanso curto ou longo.\nLeitura de Objeto. Ao segurar um objeto enquanto medita, você pode ter visões do dono anterior do objeto. Depois de meditar por 1 minuto, você descobre como o antigo dono adquiriu e perdeu o objeto, assim como o evento recente mais significativo envolvendo o objeto e seu dono. Se o objeto foi portado por outra criatura num passado recente (dentro de um número de dias igual ao seu valor de Sabedoria), você pode gastar 1 minuto adicional por dono para descobrir as mesmas informações sobre essa criatura.\nLeitura Local. À medida que você medita, você tem visões dos eventos recentes nas suas vizinhanças próximas (uma sala, rua, túnel, clareira ou similar, de até 15 metros cúbicos), voltando um número de dias igual ao seu valor de Sabedoria. Para cada minuto que você meditar, você descobre um evento significativo, a partir dos mais recentes. Eventos significativos normalmente envolvem emoções fortes, como batalhas e traições, casamentos e assassinatos, nascimentos e funerais, mas também podem incluir eventos mais mundanos que sejam relevantes na sua situação atual.",
          resource: { max: 1, recharge: "short" },
        },
      ],
    },
    {
      name: "Domínio da Enganação",
      source: "PHB",
      description:
        "Deuses da enganação – como Tymora, Beshaba, Olidammara, o Viajante, Garl Glittergold e Loki – são causadores de travessuras e instigadores, patronos de ladrões, trapaceiros, apostadores, rebeldes e libertadores. Seus clérigos preferem subterfúgio, trapaças e enganação ao confronto direto.",
      spells: {
        "1": ["Enfeitiçar Pessoa", "Disfarçar-se"],
        "3": ["Reflexos", "Passos Sem Pegadas"],
        "5": ["Piscar", "Dissipar Magia"],
        "7": ["Porta Dimensional", "Metamorfose"],
        "9": ["Dominar Pessoa", "Modificar Memória"],
      },
      features: [
        {
          name: "Magias de Domínio",
          level: 1,
          description:
            "Você ganha as magias de domínio nos níveis de clérigo indicados; elas estão sempre preparadas e não contam no número de magias que você pode preparar.\n1º: enfeitiçar pessoa, disfarçar-se. 3º: reflexos, passos sem pegadas. 5º: piscar, dissipar magia. 7º: porta dimensional, metamorfose. 9º: dominar pessoa, modificar memória.",
        },
        {
          name: "Bênção do Trapaceiro",
          level: 1,
          description:
            "A partir do momento em que você escolhe esse domínio, no 1º nível, você pode usar sua ação para tocar uma criatura voluntária além de você mesmo para conceder a ela vantagem em testes de Destreza (Furtividade). Essa bênção dura por 1 hora ou até você usar essa característica novamente.",
        },
        {
          name: "Canalizar Divindade: Invocar Duplicidade",
          level: 2,
          description:
            "A partir do 2º nível, você pode usar seu Canalizar Divindade para criar uma duplicata ilusória de si mesmo.\nCom uma ação, você cria uma ilusão perfeita de si mesmo que dura por 1 minuto ou até você perder sua concentração (como se estivesse se concentrando em uma magia). A ilusão aparece em um espaço desocupado que você possa ver a até 9 metros de você. Com uma ação bônus, no seu turno, você pode mover a ilusão até 9 metros para um espaço que você possa ver, mas ela deve permanecer a até 36 metros de você.\nPela duração, você pode conjurar magias como se estivesse no espaço ocupado pela ilusão, mas deve usar seus próprios sentidos. Além disso, quando tanto você quanto sua ilusão estiverem a 1,5 metro de uma criatura que possa ver a ilusão, você tem vantagem nas jogadas de ataque contra essa criatura, devido à distração causada no alvo pela ilusão.",
        },
        {
          name: "Canalizar Divindade: Manto de Sombras",
          level: 6,
          description:
            "No 6º nível, você pode usar seu Canalizar Divindade para desaparecer.\nCom uma ação, você se torna invisível até o final do seu próximo turno. Você se torna visível se atacar ou conjurar uma magia.",
        },
        {
          name: "Golpe Divino",
          level: 8,
          description:
            "No 8º nível, você ganha a habilidade de imbuir seus ataques com arma com veneno – uma dádiva da sua divindade. Uma vez em cada um de seus turnos, quando você acertar uma criatura com um ataque com arma, você pode fazer o ataque causar 1d8 de dano de veneno extra ao alvo. Quando alcançar o 14º nível, o dano extra aumenta para 2d8.",
        },
        {
          name: "Duplicidade Aprimorada",
          level: 17,
          description:
            "A partir do 17º nível, você pode criar até quatro duplicatas de você, ao invés de uma, quando usar Invocar Duplicidade. Com uma ação bônus, no seu turno, você pode mover quantas duplicatas quiser até 9 metros, até no máximo 36 metros de distância de você.",
        },
      ],
    },
    {
      name: "Domínio da Guerra",
      source: "PHB",
      description:
        "Os deuses da guerra – campeões da honra e bravura (Torm, Heironeous, Kir-Jolith), deuses da destruição e pilhagem (Erythnul, a Fúria, Gruumsh, Ares), da conquista (Bane, Hextor, Maglubiyet) ou neutros (Tempus, Nike, Nuada) – zelam pelos guerreiros. Seus clérigos se sobressaem em batalha, inspirando os outros ou oferecendo atos de violência como orações.",
      spells: {
        "1": ["Auxílio Divino", "Escudo da Fé"],
        "3": ["Arma Mágica", "Arma Espiritual"],
        "5": ["Manto do Cruzado", "Espíritos Guardiões"],
        "7": ["Movimentação Livre", "Pele de Pedra"],
        "9": ["Coluna de Chamas", "Imobilizar Monstro"],
      },
      features: [
        {
          name: "Magias de Domínio",
          level: 1,
          description:
            "Você ganha as magias de domínio nos níveis de clérigo indicados; elas estão sempre preparadas e não contam no número de magias que você pode preparar.\n1º: auxílio divino, escudo da fé. 3º: arma mágica, arma espiritual. 5º: manto do cruzado, espíritos guardiões. 7º: movimentação livre, pele de pedra. 9º: coluna de chamas, imobilizar monstro.",
        },
        {
          name: "Proficiência Adicional",
          level: 1,
          description: "No 1º nível, você adquire proficiência em armas marciais e em armaduras pesadas.",
        },
        {
          name: "Sacerdote da Guerra",
          level: 1,
          description:
            "A partir do 1º nível, seu deus envia rajadas de inspiração a você quando você está engajado em combate. Quando você usa a ação de Ataque, você pode realizar um ataque com arma como uma ação bônus.\nVocê pode usar essa característica um número de vezes igual ao seu modificador de Sabedoria (mínimo uma vez). Você recupera todos os usos gastos após terminar um descanso longo.",
          resource: { max: "wis", recharge: "long" },
        },
        {
          name: "Canalizar Divindade: Ataque Dirigido",
          level: 2,
          description:
            "A partir do 2º nível, você pode usar seu Canalizar Divindade para golpear com precisão sobrenatural. Quando você realiza uma jogada de ataque, você pode usar seu Canalizar Divindade para receber +10 de bônus na jogada. Você realiza essa escolha depois de ver a rolagem, mas antes de o Mestre dizer se o ataque atingiu ou errou.",
        },
        {
          name: "Canalizar Divindade: Bênção do Deus da Guerra",
          level: 6,
          description:
            "No 6º nível, quando uma criatura a até 9 metros de você realizar uma jogada de ataque, você pode usar sua reação para conceder à criatura +10 de bônus nessa jogada, usando seu Canalizar Divindade. Você realiza essa escolha depois de ver a rolagem, mas antes de o Mestre dizer se o ataque atingiu ou errou.",
        },
        {
          name: "Golpe Divino",
          level: 8,
          description:
            "No 8º nível, você ganha a habilidade de imbuir seus ataques com energia divina. Uma vez em cada um de seus turnos, quando você acertar uma criatura com um ataque com arma, você pode fazer o ataque causar 1d8 de dano extra do mesmo tipo do dano da arma ao alvo. Quando alcançar o 14º nível, o dano extra aumenta para 2d8.",
        },
        {
          name: "Avatar da Batalha",
          level: 17,
          description:
            "A partir do 17º nível, você ganha resistência a dano de concussão, cortante e perfurante de ataques não mágicos.",
        },
      ],
    },
    {
      name: "Domínio da Luz",
      source: "PHB",
      description:
        "Deuses da luz – como Helm, Lathander, Pholtus, Branchala, a Chama Prateada, Belenus, Apolo e Re-Horakhty – promovem os ideais de renascimento e renovação, verdade, vigilância e beleza. Seus clérigos são almas esclarecidas, infundidas com radiância, conhecidas por afastar as mentiras e incinerar a escuridão.",
      spells: {
        "1": ["Mãos Flamejantes", "Fogo das Fadas"],
        "3": ["Esfera Flamejante", "Raio Ardente"],
        "5": ["Luz do Dia", "Bola de Fogo"],
        "7": ["Guardião da Fé", "Muralha de Fogo"],
        "9": ["Coluna de Chamas", "Vidência"],
      },
      features: [
        {
          name: "Magias de Domínio",
          level: 1,
          description:
            "Você ganha as magias de domínio nos níveis de clérigo indicados; elas estão sempre preparadas e não contam no número de magias que você pode preparar.\n1º: mãos flamejantes, fogo das fadas. 3º: esfera flamejante, raio ardente. 5º: luz do dia, bola de fogo. 7º: guardião da fé, muralha de fogo. 9º: coluna de chamas, vidência.",
        },
        {
          name: "Truque Adicional",
          level: 1,
          description: "Quando você escolhe esse domínio no 1º nível, você ganha o truque luz, se ainda não o conhecia.",
        },
        {
          name: "Labareda Protetora",
          level: 1,
          description:
            "Também a partir do 1º nível, você pode interpor luz divina entre você e uma criatura atacante. Quando você for atacado por uma criatura a até 9 metros de você que você possa ver, você pode usar sua reação para impor desvantagem na jogada de ataque, causando labaredas de luz na frente do atacante antes de ele atingir ou errar. Um atacante que não puder ser cegado é imune a essa característica.\nVocê pode usar essa característica um número de vezes igual ao seu modificador de Sabedoria (mínimo uma vez). Você recupera todos os usos gastos após terminar um descanso longo.",
          resource: { max: "wis", recharge: "long" },
        },
        {
          name: "Canalizar Divindade: Radiação do Amanhecer",
          level: 2,
          description:
            "A partir do 2º nível, você pode usar seu Canalizar Divindade para criar uma explosão de luz solar, banindo a escuridão e causando dano radiante aos inimigos.\nCom uma ação, você ergue seu símbolo sagrado e qualquer escuridão mágica num raio de 9 metros de você é dissipada. Além disso, cada criatura hostil a até 9 metros de você deve realizar um teste de resistência de Constituição. Uma criatura sofre dano radiante igual a 2d10 + seu nível de clérigo se falhar no teste, e metade desse dano se for bem-sucedida. Uma criatura que tenha cobertura total contra você não é afetada.",
        },
        {
          name: "Labareda Aprimorada",
          level: 6,
          description:
            "No 6º nível, você também pode utilizar sua característica Labareda Protetora quando uma criatura que você possa ver a até 9 metros de você atacar outra criatura diferente de você.",
        },
        {
          name: "Conjuração Poderosa",
          level: 8,
          description:
            "A partir do 8º nível, você adiciona seu modificador de Sabedoria ao dano causado por qualquer truque de clérigo.",
        },
        {
          name: "Coroa de Luz",
          level: 17,
          description:
            "A partir do 17º nível, você pode usar sua ação para ativar uma aura de luz solar que dura por 1 minuto ou até você dissipá-la usando outra ação. Você emite luz plena num raio de 18 metros e penumbra a até 9 metros além disso. Os seus inimigos na área de luz plena têm desvantagem nos testes de resistência contra suas magias que causam dano de fogo ou dano radiante.",
        },
      ],
    },
    {
      name: "Domínio da Natureza",
      source: "PHB",
      description:
        "Os deuses da natureza são tão variados quanto a natureza – de deuses inescrutáveis de florestas profundas (Silvanus, Obad-Hai, Chislev, Balinor, Pã) a divindades amigáveis de fontes e bosques (Eldath). Seus clérigos caçam monstruosidades que usurpam os bosques, abençoam colheitas e fazem murchar as culturas de quem irrita seus deuses.",
      spells: {
        "1": ["Amizade Animal", "Falar com Animais"],
        "3": ["Pele de Árvore", "Crescer Espinhos"],
        "5": ["Ampliar Plantas", "Muralha de Vento"],
        "7": ["Dominar Besta", "Vinha Esmagadora"],
        "9": ["Praga de Insetos", "Caminhar em Árvores"],
      },
      features: [
        {
          name: "Magias de Domínio",
          level: 1,
          description:
            "Você ganha as magias de domínio nos níveis de clérigo indicados; elas estão sempre preparadas e não contam no número de magias que você pode preparar.\n1º: amizade animal, falar com animais. 3º: pele de árvore, crescer espinhos. 5º: ampliar plantas, muralha de vento. 7º: dominar besta, vinha esmagadora. 9º: praga de insetos, caminhar em árvores.",
        },
        {
          name: "Acólito da Natureza",
          level: 1,
          description:
            "No 1º nível, você aprende um truque de druida, à sua escolha. Você também ganha proficiência em uma das seguintes perícias, à sua escolha: Adestrar Animais, Natureza ou Sobrevivência.",
        },
        {
          name: "Proficiência Adicional",
          level: 1,
          description: "Também a partir do 1º nível, você adquire proficiência com armaduras pesadas.",
        },
        {
          name: "Canalizar Divindade: Enfeitiçar Animais e Plantas",
          level: 2,
          description:
            "A partir do 2º nível, você pode usar seu Canalizar Divindade para enfeitiçar animais e plantas.\nCom uma ação, você ergue seu símbolo sagrado e invoca o nome do seu deus. Cada besta ou criatura-planta que puder ver você num raio de 9 metros deve realizar um teste de resistência de Sabedoria. Se a criatura falhar, ela estará enfeitiçada por você durante 1 minuto ou até sofrer dano. Enquanto estiver enfeitiçada por você, ela será amistosa a você e às criaturas que você designar.",
        },
        {
          name: "Amortecer Elementos",
          level: 6,
          description:
            "No 6º nível, quando você ou uma criatura a até 9 metros de você sofrer dano de ácido, frio, fogo, elétrico ou trovão, você pode usar sua reação para conceder resistência à criatura contra aquele tipo de dano (apenas para aquela instância de dano).",
        },
        {
          name: "Golpe Divino",
          level: 8,
          description:
            "No 8º nível, você ganha a habilidade de imbuir seus ataques com energia divina. Uma vez em cada um de seus turnos, quando você acertar uma criatura com um ataque com arma, você pode fazer o ataque causar 1d8 de dano extra de frio, fogo ou elétrico (à sua escolha) ao alvo. Quando alcançar o 14º nível, o dano extra aumenta para 2d8.",
        },
        {
          name: "Senhor da Natureza",
          level: 17,
          description:
            "A partir do 17º nível, você ganha a habilidade de comandar animais e criaturas-planta. Enquanto criaturas estiverem enfeitiçadas pela sua característica Enfeitiçar Animais e Plantas, você pode usar uma ação bônus no seu turno para dizer verbalmente o que cada uma dessas criaturas deve fazer no próximo turno delas.",
        },
      ],
    },
    {
      name: "Domínio da Tempestade",
      source: "PHB",
      description:
        "Deuses da tempestade – como Talos, Umberlee, Kord, Zeboim, o Devorador, Zeus e Thor – governam tormentas, mares e céus. Eles enviam seus clérigos para inspirar temor no povo comum, mantendo-o no caminho da justiça e da coragem, ou para oferecer sacrifícios que afastem a ira divina.",
      spells: {
        "1": ["Névoa Obscurecente", "Onda Trovejante"],
        "3": ["Lufada de Vento", "Despedaçar"],
        "5": ["Convocar Relâmpagos", "Nevasca"],
        "7": ["Controlar a Água", "Tempestade de Gelo"],
        "9": ["Onda Destrutiva", "Praga de Insetos"],
      },
      features: [
        {
          name: "Magias de Domínio",
          level: 1,
          description:
            "Você ganha as magias de domínio nos níveis de clérigo indicados; elas estão sempre preparadas e não contam no número de magias que você pode preparar.\n1º: névoa obscurecente, onda trovejante. 3º: lufada de vento, despedaçar. 5º: convocar relâmpagos, nevasca. 7º: controlar a água, tempestade de gelo. 9º: onda destrutiva, praga de insetos.",
        },
        {
          name: "Proficiência Adicional",
          level: 1,
          description: "A partir do 1º nível, você adquire proficiência em armas marciais e armaduras pesadas.",
        },
        {
          name: "Ira da Tormenta",
          level: 1,
          description:
            "Também a partir do 1º nível, você pode repreender ataques violentamente. Quando uma criatura a 1,5 metro de você que você possa ver atingir você com um ataque, você pode usar sua reação para forçar a criatura a realizar um teste de resistência de Destreza. A criatura sofre 2d8 de dano elétrico ou de trovão (à sua escolha) caso falhe no teste, e metade desse dano caso seja bem-sucedida.\nVocê pode usar essa característica um número de vezes igual ao seu modificador de Sabedoria (mínimo uma vez). Você recupera todos os usos gastos após terminar um descanso longo.",
          resource: { max: "wis", recharge: "long" },
        },
        {
          name: "Canalizar Divindade: Ira Destruidora",
          level: 2,
          description:
            "A partir do 2º nível, você pode usar seu Canalizar Divindade para empunhar o poder da tormenta com ferocidade desmedida.\nQuando você rolar dano elétrico ou trovejante, você pode usar seu Canalizar Divindade para causar o máximo de dano, ao invés de rolá-lo.",
        },
        {
          name: "Golpe de Relâmpago",
          level: 6,
          description:
            "No 6º nível, quando você causar dano elétrico a uma criatura Grande ou menor, você também pode empurrá-la até 3 metros para longe de você.",
        },
        {
          name: "Golpe Divino",
          level: 8,
          description:
            "No 8º nível, você ganha a habilidade de imbuir seus ataques com energia divina. Uma vez em cada um de seus turnos, quando você acertar uma criatura com um ataque com arma, você pode fazer o ataque causar 1d8 de dano trovejante extra ao alvo. Quando alcançar o 14º nível, o dano extra aumenta para 2d8.",
        },
        {
          name: "Filho da Tormenta",
          level: 17,
          description:
            "A partir do 17º nível, você adquire deslocamento de voo igual ao seu deslocamento de caminhada atual, contanto que você não esteja no subterrâneo ou em local fechado.",
        },
      ],
    },
    {
      name: "Domínio da Vida",
      source: "PHB",
      description:
        "O domínio da vida foca na vívida energia positiva que sustenta toda a vida. Os deuses da vida promovem a vitalidade e a saúde, curando os doentes e feridos, cuidando dos necessitados e afastando as forças da morte e as hordas de mortos-vivos.",
      spells: {
        "1": ["Bênção", "Curar Ferimentos"],
        "3": ["Restauração Menor", "Arma Espiritual"],
        "5": ["Sinal de Esperança", "Revivificar"],
        "7": ["Proteção Contra a Morte", "Guardião da Fé"],
        "9": ["Curar Ferimentos em Massa", "Reviver Os Mortos"],
      },
      features: [
        {
          name: "Magias de Domínio",
          level: 1,
          description:
            "Você ganha as magias de domínio nos níveis de clérigo indicados; elas estão sempre preparadas e não contam no número de magias que você pode preparar.\n1º: bênção, curar ferimentos. 3º: restauração menor, arma espiritual. 5º: sinal de esperança, revivificar. 7º: proteção contra a morte, guardião da fé. 9º: curar ferimentos em massa, reviver os mortos.",
        },
        {
          name: "Proficiência Adicional",
          level: 1,
          description: "Quando você escolhe este domínio no 1º nível, você ganha proficiência com armaduras pesadas.",
        },
        {
          name: "Discípulo da Vida",
          level: 1,
          description:
            "Também no 1º nível, suas magias de cura são mais efetivas. Sempre que você conjurar uma magia de 1º nível ou superior para recuperar pontos de vida, o alvo daquela magia recupera pontos de vida adicionais iguais a 2 + o nível da magia.",
        },
        {
          name: "Canalizar Divindade: Preservar a Vida",
          level: 2,
          description:
            "A partir do 2º nível, você pode usar seu Canalizar Divindade para curar os feridos.\nComo uma ação, você usa seu símbolo sagrado para invocar energia que pode recuperar um total de pontos de vida igual a 5 vezes seu nível de clérigo. Você escolhe quaisquer criaturas a até 9 metros de você e divide esses pontos entre elas. Essa característica só pode curar as criaturas até a metade de seu máximo de pontos de vida. Você não pode usar essa característica em um morto-vivo ou constructo.",
        },
        {
          name: "Curandeiro Abençoado",
          level: 6,
          description:
            "A partir do 6º nível, as magias que você conjurar para curar os outros também curam você. Quando conjurar uma magia de 1º nível ou superior que recupere pontos de vida de outra criatura, você também recupera pontos de vida em um total de 2 + o nível da magia.",
        },
        {
          name: "Golpe Divino",
          level: 8,
          description:
            "No 8º nível, você ganha a habilidade de imbuir seus ataques com poder divino. Uma vez em cada um de seus turnos, quando você acertar uma criatura com um ataque com arma, você pode fazer o ataque causar 1d8 de dano radiante extra ao alvo. Quando alcançar o 14º nível, o dano extra aumenta para 2d8.",
        },
        {
          name: "Cura Suprema",
          level: 17,
          description:
            "A partir do 17º nível, quando você normalmente jogaria um ou mais dados para recuperar pontos de vida com uma magia, você usa o maior resultado possível nos dados. Por exemplo, ao invés de recuperar 2d6 pontos de vida, você recupera 12.",
        },
      ],
    },
    // ----------------------------------------------------------------- XGtE
    {
      name: "Domínio da Forja",
      source: "XGtE",
      description:
        "Os deuses da forja – Gond, Reorx, Onatar, Moradin, Hefesto e Goibhniu – são patronos dos artesãos do metal e ensinam que, com paciência e trabalho árduo, até o metal mais intratável pode ser transformado em um objeto belamente forjado. Seus clérigos orgulham-se de seu trabalho e usam armaduras pesadas e armas poderosas.",
      spells: {
        "1": ["Identificação", "Destruição Lancinante"],
        "3": ["Esquentar Metal", "Arma Mágica"],
        "5": ["Arma Elemental", "Proteção Contra Energia"],
        "7": ["Fabricar", "Muralha de Fogo"],
        "9": ["Animar Objetos", "Criação"],
      },
      features: [
        {
          name: "Magias de Domínio",
          level: 1,
          description:
            "Você ganha magias de domínio nos níveis de clérigo listados; elas estão sempre preparadas e não contam no número de magias que você pode preparar.\n1º: identificação, destruição lancinante. 3º: esquentar metal, arma mágica. 5º: arma elemental, proteção contra energia. 7º: fabricar, muralha de fogo. 9º: animar objetos, criação.",
        },
        {
          name: "Proficiência Bônus",
          level: 1,
          description: "Quando escolhe esse domínio no 1º nível, você ganha proficiência com armadura pesada e ferramentas de ferreiro.",
        },
        {
          name: "Bênção da Forja",
          level: 1,
          description:
            "No 1º nível, você ganha a habilidade de imbuir magia em uma arma ou armadura. No fim de um descanso longo, você pode tocar um objeto não mágico que seja uma armadura ou uma arma simples ou marcial. Até o fim do seu próximo descanso longo ou até você morrer, o objeto se torna um item mágico, garantindo +1 de bônus na CA se for uma armadura ou +1 de bônus nas jogadas de ataque e dano se for uma arma.\nUma vez utilizada essa característica, você não pode usá-la novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Canalizar Divindade: Bênção do Artesão",
          level: 2,
          description:
            "Começando no 2º nível, você pode usar seu Canalizar Divindade para criar itens simples.\nVocê conduz um ritual de 1 hora de duração que cria um item não mágico que precisa incluir algum metal: uma arma simples ou marcial, uma armadura, 10 peças de munição, um conjunto de ferramentas ou outro objeto metálico. A criação é completada no final da hora, aglutinando-se em um espaço desocupado à sua escolha, em uma superfície a até 1,5 metro de você.\nO que você criar não pode valer mais do que 100 po. Como parte desse ritual, você precisa dispor de metal, que pode incluir moedas, com valor igual ao da criação. O metal une-se irreversivelmente e se transforma na sua criação no fim do ritual, formando magicamente até as partes não metálicas da criação.\nO ritual pode criar uma duplicata de um item não mágico que contenha metal, como uma chave, se você possuir o original durante o ritual.",
        },
        {
          name: "Alma da Forja",
          level: 6,
          description:
            "Começando no 6º nível, sua maestria na forja garante habilidades especiais:\n• Você ganha resistência a dano de fogo.\n• Enquanto vestir armadura pesada, você ganha +1 de bônus na CA.",
        },
        {
          name: "Impacto Divino",
          level: 8,
          description:
            "No 8º nível, você ganha a habilidade de infundir seus ataques com arma com o poder incandescente da forja. Uma vez por turno, quando acertar uma criatura com um ataque com arma, você pode fazer o ataque causar 1d8 de dano de fogo extra. Ao alcançar o 14º nível, o dano extra aumenta para 2d8.",
        },
        {
          name: "Santo da Forja e Fogo",
          level: 17,
          description:
            "No 17º nível, você é abençoado com afinidade ao fogo e ao metal e se torna mais poderoso:\n• Você ganha imunidade a dano de fogo.\n• Enquanto vestir armadura pesada, você tem resistência a dano cortante, de concussão e perfurante de ataques não mágicos.",
        },
      ],
    },
    {
      name: "Domínio da Sepultura",
      source: "XGtE",
      description:
        "Deuses da sepultura – Kelemvor, Wee Jas, os Espíritos Ancestrais da Corte Divina, Hades, Anúbis e Osíris – guardam a linha entre a vida e a morte. Seus seguidores colocam espíritos errantes para descansar, destroem mortos-vivos e aliviam o sofrimento dos moribundos, e sua magia permite adiar a morte por um tempo – um atraso, não uma negação.",
      spells: {
        "1": ["Vitalidade Falsa", "Perdição"],
        "3": ["Raio do Enfraquecimento", "Repouso Tranquilo"],
        "5": ["Revivificar", "Toque Vampírico"],
        "7": ["Malogro", "Proteção Contra a Morte"],
        "9": ["Cúpula Antivida", "Reviver Os Mortos"],
      },
      features: [
        {
          name: "Magias de Domínio",
          level: 1,
          description:
            "Você ganha magias de domínio nos níveis de clérigo listados; elas estão sempre preparadas e não contam no número de magias que você pode preparar.\n1º: falsa vitalidade, perdição. 3º: raio do enfraquecimento, repouso tranquilo. 5º: revivificar, toque vampírico. 7º: malogro, proteção contra a morte. 9º: cúpula antivida, reviver os mortos.",
        },
        {
          name: "Círculo da Mortalidade",
          level: 1,
          description:
            "No 1º nível, você ganha a habilidade de manipular a linha entre vida e morte. Quando você normalmente rolaria um ou mais dados para restaurar os pontos de vida de uma criatura que esteja a 0 pontos de vida com uma magia, você pode usar os maiores valores possíveis de cada dado.\nAlém disso, você aprende o truque estabilizar, que não conta no número de truques de clérigo que você conhece. Para você, ele tem 9 metros de alcance, e você pode conjurá-lo como uma ação bônus.",
        },
        {
          name: "Olhos da Sepultura",
          level: 1,
          description:
            "No 1º nível, você ganha a habilidade de ocasionalmente sentir a presença de mortos-vivos, cuja existência é um insulto ao ciclo natural da vida. Como uma ação, você pode abrir sua consciência para detectar magicamente os mortos-vivos. Até o final do seu próximo turno, você conhece a localização de qualquer morto-vivo a até 18 metros de você que não esteja atrás de cobertura total e que não esteja protegido contra magias de adivinhação. Esse sentido não diz nada sobre as capacidades ou a identidade da criatura.\nVocê pode usar essa característica um número de vezes igual ao seu modificador de Sabedoria (mínimo de uma vez). Você recupera todos os usos gastos quando termina um descanso longo.",
          resource: { max: "wis", recharge: "long" },
        },
        {
          name: "Canalizar Divindade: Caminho da Sepultura",
          level: 2,
          description:
            "Começando no 2º nível, você pode usar seu Canalizar Divindade para marcar a terminação da vida de outra criatura. Como uma ação, você escolhe uma criatura que possa ver a até 9 metros de você, amaldiçoando-a até o final do seu próximo turno. Da próxima vez que você ou um aliado atingir a criatura amaldiçoada com um ataque, a criatura tem vulnerabilidade a todo o dano desse ataque, e então a maldição termina.",
        },
        {
          name: "Sentinela na Porta da Morte",
          level: 6,
          description:
            "No 6º nível, você ganha a habilidade de impedir o progresso da morte. Como uma reação, quando você ou uma criatura que possa ver a até 9 metros de você sofrer um acerto crítico, você pode transformar esse acerto em um acerto normal. Todos os efeitos desencadeados por um acerto crítico são cancelados.\nVocê pode usar essa característica um número de vezes igual ao seu modificador de Sabedoria (mínimo de uma vez). Você recupera todos os usos gastos quando termina um descanso longo.",
          resource: { max: "wis", recharge: "long" },
        },
        {
          name: "Conjuração Potente",
          level: 8,
          description: "Começando no 8º nível, você adiciona seu modificador de Sabedoria ao dano causado por qualquer truque de clérigo.",
        },
        {
          name: "Guardião das Almas",
          level: 17,
          description:
            "A partir do 17º nível, você pode aproveitar um vestígio de vitalidade de uma alma que se despede e usá-la para curar os vivos. Quando um inimigo que você possa ver morre a até 18 metros de você, você ou uma criatura à sua escolha que esteja a até 18 metros de você recupera pontos de vida iguais ao número de Dados de Vida do inimigo. Você só pode usar essa característica se não estiver incapacitado. Depois de usá-la, você não pode fazê-lo novamente até o início do seu próximo turno.",
        },
      ],
    },
    // ----------------------------------------------------------------- TCoE
    {
      name: "Domínio da Ordem",
      source: "TCoE",
      description:
        "O Domínio da Ordem representa a disciplina e a devoção às leis que governam uma sociedade, instituição ou filosofia. Clérigos da Ordem (de deuses como Aureon, Bane, Majere, Pholtus e Tyr) acreditam que leis bem formuladas estabelecem hierarquias legítimas e tecem uma rede de obrigações que cria ordem e segurança em um multiverso caótico.",
      spells: {
        "1": ["Comando", "Heroísmo"],
        "3": ["Imobilizar Pessoa", "Zona da Verdade"],
        "5": ["Palavra Curativa em Massa", "Lentidão"],
        "7": ["Compulsão", "Localizar Criatura"],
        "9": ["Comunhão", "Dominar Pessoa"],
      },
      features: [
        {
          name: "Magias de Domínio",
          level: 1,
          description:
            "Você ganha magias de domínio nos níveis de clérigo listados; elas estão sempre preparadas e não contam no número de magias que você pode preparar.\n1º: comando, heroísmo. 3º: imobilizar pessoa, zona da verdade. 5º: palavra curativa em massa, lentidão. 7º: compulsão, localizar criatura. 9º: comunhão, dominar pessoa.",
        },
        {
          name: "Proficiência Bônus",
          level: 1,
          description:
            "Você adquire proficiência com armadura pesada. Você também ganha proficiência na perícia Intimidação ou Persuasão (à sua escolha).",
        },
        {
          name: "Voz de Autoridade",
          level: 1,
          description:
            "Você pode invocar o poder da lei para encorajar um aliado a atacar. Se você conjurar uma magia com um espaço de magia de 1º nível ou superior e tiver como alvo um aliado, esse aliado pode usar sua reação imediatamente depois da magia para realizar um ataque com arma contra uma criatura à sua escolha que você possa ver.\nSe a magia tiver mais de um aliado como alvo, você escolhe qual aliado pode realizar esse ataque.",
        },
        {
          name: "Canalizar Divindade: Demanda da Ordem",
          level: 2,
          description:
            "Você pode usar seu Canalizar Divindade para exercer uma presença intimidadora sobre os outros.\nComo uma ação, você exibe seu símbolo sagrado, e cada criatura à sua escolha a até 9 metros de você que possa ver ou ouvir você deve ser bem-sucedida em um teste de resistência de Sabedoria ou ficará enfeitiçada por você até o final do seu próximo turno ou até receber dano. Você também pode fazer com que qualquer uma das criaturas enfeitiçadas solte o que estiver segurando quando falhar nesse teste.",
        },
        {
          name: "Personificação da Lei",
          level: 6,
          description:
            "Você se tornou notavelmente hábil em canalizar energia mágica para compelir os outros. Se você conjurar uma magia da escola de encantamento usando um espaço de magia de 1º nível ou superior, você pode mudar o tempo de conjuração dessa magia para 1 ação bônus nessa conjuração, desde que o tempo de conjuração normal da magia seja de 1 ação.\nVocê pode usar essa característica um número de vezes igual ao seu modificador de Sabedoria (mínimo de 1 vez), e recupera todos os usos quando termina um descanso longo.",
          resource: { max: "wis", recharge: "long" },
        },
        {
          name: "Golpe Divino",
          level: 8,
          description:
            "Você ganha a habilidade de infundir os golpes da sua arma com energia divina. Uma vez por turno, quando atingir uma criatura com um ataque com arma, você pode fazer o ataque causar 1d8 de dano psíquico adicional. Ao alcançar o 14º nível, o dano adicional aumenta para 2d8.",
        },
        {
          name: "Ira da Ordem",
          level: 17,
          description:
            "Os inimigos que você designa para destruição definham perante os esforços combinados de você e seus aliados. Se você causar dano com o seu Golpe Divino a uma criatura no seu turno, você pode amaldiçoar aquela criatura até o início do seu próximo turno. Na próxima vez que um de seus aliados acertar a criatura amaldiçoada com um ataque, o alvo também sofre 2d8 de dano psíquico e a maldição termina. Você pode amaldiçoar uma criatura dessa forma apenas uma vez por turno.",
        },
      ],
    },
    {
      name: "Domínio da Paz",
      source: "TCoE",
      description:
        "O bálsamo da paz nasce no coração de comunidades saudáveis, entre nações amigas e nas almas dos de coração gentil. Clérigos de deuses da paz (Angharradh, Berronar Prata-Verdadeira, Boldrei, Cyrrollalee, Eldath, Gaerdal Mão-de-Ferro, Paladine, Rao) arbitram disputas, e suas bênçãos unem as pessoas e as ajudam a carregar os fardos umas das outras.",
      spells: {
        "1": ["Heroísmo", "Santuário"],
        "3": ["Ajuda", "Vínculo Protetor"],
        "5": ["Enviar Mensagem", "Sinal de Esperança"],
        "7": ["Aura de Pureza", "Esfera Resiliente de Otiluke"],
        "9": ["Restauração Maior", "Ligação Telepática de Rary"],
      },
      features: [
        {
          name: "Magias de Domínio",
          level: 1,
          description:
            "Você ganha magias de domínio nos níveis de clérigo listados; elas estão sempre preparadas e não contam no número de magias que você pode preparar.\n1º: heroísmo, santuário. 3º: auxílio (ajuda), vínculo de proteção (vínculo protetor). 5º: remeter (enviar mensagem), sinal de esperança. 7º: aura de pureza, esfera resiliente de Otiluke. 9º: restauração maior, ligação telepática de Rary.",
        },
        {
          name: "Implemento da Paz",
          level: 1,
          description: "Você ganha proficiência na perícia Atuação, Intuição ou Persuasão (à sua escolha).",
        },
        {
          name: "Vínculo Encorajador",
          level: 1,
          description:
            "Você pode criar uma ligação energética entre pessoas que estão em paz entre si. Como uma ação, você escolhe um número de criaturas voluntárias igual ao seu bônus de proficiência (podendo incluir você mesmo). Essas criaturas devem estar a até 9 metros de você. Você cria um vínculo mágico entre elas que dura por 10 minutos ou até que você use essa característica novamente. Enquanto qualquer criatura vinculada estiver a até 9 metros de outra criatura do vínculo, ela pode jogar um d4 e adicionar o resultado a uma jogada de ataque, teste de habilidade ou teste de resistência que fizer. Cada criatura vinculada pode adicionar o d4 não mais do que uma vez por turno.",
        },
        {
          name: "Canalizar Divindade: Bálsamo da Paz",
          level: 2,
          description:
            "Você pode usar o seu Canalizar Divindade para tornar a sua presença um bálsamo calmante. Como uma ação, você pode se mover até o seu deslocamento sem provocar ataques de oportunidade e, quando você se mover a até 1,5 metro de qualquer outra criatura durante essa ação, você pode restaurar um número de pontos de vida dessa criatura igual a 2d6 + seu modificador de Sabedoria (mínimo de 1 ponto de vida). Uma criatura pode receber essa cura apenas uma vez sempre que você realiza essa ação.",
        },
        {
          name: "Vínculo de Proteção",
          level: 6,
          description:
            "O vínculo que você cria entre as pessoas as auxilia a protegerem umas às outras. Quando uma criatura afetada por seu Vínculo Encorajador estiver prestes a receber dano, uma segunda criatura vinculada que esteja a até 9 metros da primeira pode usar sua reação para se teletransportar para um espaço desocupado a até 1,5 metro da primeira criatura. A segunda criatura então recebe todo o dano em seu lugar.",
        },
        {
          name: "Conjuração Poderosa",
          level: 8,
          description: "Você adiciona o seu modificador de Sabedoria ao dano que você causa com qualquer truque de clérigo.",
        },
        {
          name: "Vínculo Expandido",
          level: 17,
          description:
            "Os benefícios do seu Vínculo Encorajador e do seu Vínculo de Proteção agora funcionam quando as criaturas estiverem a até 18 metros umas das outras. Além disso, quando uma criatura utilizar o Vínculo de Proteção para receber dano no lugar de outra, a criatura ganha resistência a esse dano.",
        },
      ],
    },
    {
      name: "Domínio do Crepúsculo",
      source: "TCoE",
      description:
        "A transição crepuscular da luz para a escuridão traz calma e descanso, mas a escuridão também pode trazer terrores. Clérigos de deuses do crepúsculo (Boldrei, Celestian, Dol Arrah, Helm, Ilmater, Mishakal, Selûne, Yondalla) trazem conforto aos que buscam descanso e se aventuram na escuridão para garantir que ela seja um conforto, não um terror.",
      spells: {
        "1": ["Fogo das Fadas", "Sono"],
        "3": ["Raio Lunar", "Ver o Invisível"],
        "5": ["Aura de Vitalidade", "Pequena Cabana de Leomund"],
        "7": ["Aura de Vida", "Invisibilidade Maior"],
        "9": ["Círculo de Poder", "Despistar"],
      },
      features: [
        {
          name: "Magias de Domínio",
          level: 1,
          description:
            "Você ganha magias de domínio nos níveis de clérigo listados; elas estão sempre preparadas e não contam no número de magias que você pode preparar.\n1º: fogo das fadas, sono. 3º: raio lunar, ver o invisível. 5º: aura de vitalidade, pequena cabana de Leomund. 7º: aura de vida, invisibilidade maior. 9º: círculo de poder, despistar.",
        },
        {
          name: "Proficiência Bônus",
          level: 1,
          description: "Você adquire proficiência com armas marciais e armaduras pesadas.",
        },
        {
          name: "Olhos da Noite",
          level: 1,
          description:
            "Você pode ver através da escuridão mais profunda. Você tem visão no escuro com alcance de 90 metros. Nesse raio, você pode ver na penumbra como se estivesse em luz plena e na escuridão como se estivesse na penumbra.\nCom uma ação, você pode compartilhar magicamente a visão no escuro dessa característica com criaturas voluntárias que você possa ver a até 3 metros de você, até um número de criaturas igual ao seu modificador de Sabedoria (mínimo de uma criatura). A visão no escuro compartilhada dura 1 hora. Depois de compartilhá-la, você não pode fazê-lo novamente até terminar um descanso longo, a menos que gaste um espaço de magia de qualquer nível para compartilhá-la novamente.",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Bênção da Vigilância",
          level: 1,
          description:
            "A noite ensinou você a ser vigilante. Como uma ação, você concede vantagem a uma criatura que tocar (podendo escolher a si mesmo) na próxima jogada de iniciativa que a criatura fizer. Esse benefício termina imediatamente após a jogada ou se você usar essa característica novamente.",
        },
        {
          name: "Canalizar Divindade: Santuário Crepuscular",
          level: 2,
          description:
            "Você pode usar sua característica Canalizar Divindade para revigorar os seus aliados com um crepúsculo calmante.\nComo uma ação, você exibe seu símbolo sagrado, e uma esfera de crepúsculo emana a partir de você. A esfera é centrada em você, possui 9 metros de raio e é preenchida com penumbra. A esfera move-se com você e dura por 1 minuto ou até que você fique incapacitado ou morra. Sempre que uma criatura (incluindo você) encerra seu turno dentro da esfera, você pode fornecer a essa criatura um destes benefícios:\n• Você concede à criatura pontos de vida temporários iguais a 1d6 + seu nível de clérigo.\n• Você encerra um efeito sobre ela que a estivesse deixando amedrontada ou enfeitiçada.",
        },
        {
          name: "Passos da Noite",
          level: 6,
          description:
            "Você pode se valer do poder místico da noite para elevar-se no ar. Como uma ação bônus, quando você estiver em penumbra ou escuridão, você pode magicamente conceder a si mesmo um deslocamento de voo igual ao seu deslocamento de caminhada por 1 minuto.\nVocê pode usar essa ação bônus um número de vezes igual ao seu bônus de proficiência, e recupera todos os usos ao final de um descanso longo.",
          resource: { max: "prof", recharge: "long" },
        },
        {
          name: "Golpe Divino",
          level: 8,
          description:
            "Você ganha a habilidade de infundir os golpes da sua arma com energia divina. Uma vez por turno, quando atingir uma criatura com um ataque com arma, você pode fazer o ataque causar 1d8 de dano radiante adicional. Ao alcançar o 14º nível, o dano adicional aumenta para 2d8.",
        },
        {
          name: "Manto Crepuscular",
          level: 17,
          description:
            "O crepúsculo que você invoca oferece um abraço protetor: você e seus aliados têm meia cobertura enquanto estiverem dentro da esfera criada pelo seu Santuário Crepuscular.",
        },
      ],
    },
  ],
  multiclass: {
    prerequisite: "Sabedoria 13",
    proficiencies: "Armadura leve, armadura média, escudos",
    skills: 0,
  },
};
