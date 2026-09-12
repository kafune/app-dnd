import type { ClassDef } from "@/lib/types";

/**
 * Ladino — Livro do Jogador (p. 90–93), Guia de Xanathar (p. 42–45) e
 * Caldeirão de Tasha (p. 64–67). Texto em PT-BR fiel aos livros.
 */
export const LADINO: ClassDef = {
  name: "Ladino",
  source: "PHB",
  subclassLabel: "Arquétipo de Ladino",
  subclassLevel: 3,
  multiclass: {
    prerequisite: "Destreza 13",
    proficiencies:
      "Armaduras leves, uma perícia da lista de perícias da classe, ferramentas de ladrão",
    skills: 1,
  },
  features: [
    {
      name: "Especialização",
      level: 1,
      expertise: { count: 2 },
      description:
        "No 1º nível, você escolhe duas de suas perícias em que seja proficiente, ou uma perícia em que seja proficiente e ferramentas de ladrão. Seu bônus de proficiência é dobrado em qualquer teste de habilidade que fizer com elas.\nNo 6º nível, você pode escolher outras duas de suas proficiências (em perícias ou ferramentas de ladrão) para ganhar esse benefício.",
    },
    {
      name: "Ataque Furtivo",
      level: 1,
      description:
        "A partir do 1º nível, você sabe como atacar sutilmente e explorar a distração de seus inimigos. Uma vez por turno, você pode adicionar 1d6 nas jogadas de dano contra qualquer criatura que acertar, desde que tenha vantagem na jogada de ataque. O ataque deve ser com uma arma de acuidade ou à distância.\nVocê não precisa ter vantagem na jogada de ataque se outro inimigo do seu alvo estiver a 1,5 metro dele, desde que esse inimigo não esteja incapacitado e você não tenha desvantagem na jogada de ataque.\nA quantidade de dano extra aumenta conforme você ganha níveis nessa classe, como mostrado na coluna Ataque Furtivo da tabela O Ladino: 1d6 (1º–2º nível), 2d6 (3º–4º), 3d6 (5º–6º), 4d6 (7º–8º), 5d6 (9º–10º), 6d6 (11º–12º), 7d6 (13º–14º), 8d6 (15º–16º), 9d6 (17º–18º) e 10d6 (19º–20º).",
    },
    {
      name: "Gíria de Ladrão",
      level: 1,
      description:
        "Durante seu treinamento você aprendeu as gírias de ladrão, um misto de dialeto, jargão e códigos secretos que permitem passar mensagens secretas durante uma conversa aparentemente normal. Somente outra criatura que conheça as gírias de ladrão entende as mensagens. Leva-se quatro vezes mais tempo para transmitir essa mensagem do que falar a mesma ideia claramente.\nAlém disso, você entende um conjunto de sinais secretos e símbolos usados para transmitir mensagens curtas e simples, como saber se uma área é perigosa ou se é território de uma guilda de ladrões, se o saque está próximo, se as pessoas na área são alvos fáceis ou até mesmo indicar lugares seguros para ladinos se esconderem.",
    },
    {
      name: "Ação Ardilosa",
      level: 2,
      description:
        "A partir do 2º nível, seu pensamento rápido e agilidade fazem você se mover e agir rapidamente. Você pode usar uma ação bônus durante cada um de seus turnos em combate. Essa ação pode ser usada somente para Disparada, Desengajar ou Esconder.",
    },
    {
      name: "Mira Firme (opcional, Tasha)",
      level: 3,
      optional: true,
      description:
        "Característica opcional de classe do Caldeirão de Tasha (3º nível), adotada com a aprovação do Mestre.\nComo uma ação bônus, você pode se conceder vantagem em sua próxima jogada de ataque no turno atual. Você pode utilizar essa ação bônus apenas se não tiver se movido durante esse turno e, após usá-la, seu deslocamento é 0 até o fim do turno atual.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 4,
      asi: true,
      description:
        "Quando você atinge o 4º nível e novamente no 8º, 10º, 12º, 16º e 19º nível, você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
    {
      name: "Esquiva Sobrenatural",
      level: 5,
      description:
        "A partir do 5º nível, quando um inimigo que você possa ver o acerta com um ataque, você pode usar sua reação para reduzir pela metade o dano sofrido.",
    },
    {
      name: "Especialização (melhoria)",
      level: 6,
      expertise: { count: 2 },
      description:
        "No 6º nível, você pode escolher outras duas de suas proficiências (em perícias ou ferramentas de ladrão) para dobrar o bônus de proficiência nos testes de habilidade feitos com elas, totalizando quatro proficiências com Especialização.",
    },
    {
      name: "Evasão",
      level: 7,
      description:
        "A partir do 7º nível, você pode esquivar-se agilmente de certos efeitos em área, como o sopro flamejante de um dragão vermelho ou uma magia tempestade de gelo. Quando você for alvo de um efeito que exige um teste de resistência de Destreza para sofrer metade do dano, você não sofre dano algum se passar, e somente metade do dano se falhar.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 8,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 10,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
    {
      name: "Talento Confiável",
      level: 11,
      description:
        "No 11º nível, você refinou suas perícias beirando a perfeição. Toda vez que fizer um teste de habilidade no qual possa adicionar seu bônus de proficiência, você trata um resultado no d20 de 9 ou menor como um 10.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 12,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
    {
      name: "Sentido Cego",
      level: 14,
      description:
        "No 14º nível, se você for capaz de ouvir, você está ciente da localização de qualquer criatura escondida ou invisível a até 3 metros de você.",
    },
    {
      name: "Mente Escorregadia",
      level: 15,
      description:
        "No 15º nível, você adquire uma grande força de vontade, adquirindo proficiência nos testes de resistência de Sabedoria.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 16,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
    {
      name: "Elusivo",
      level: 18,
      description:
        "A partir do 18º nível, você se torna tão sagaz que raramente alguém encosta a mão em você. Nenhuma jogada de ataque tem vantagem contra você, desde que você não esteja incapacitado.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 19,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
    {
      name: "Golpe de Sorte",
      level: 20,
      description:
        "No 20º nível, você adquire um dom incrível para ter sucesso nos momentos em que mais precisa. Se um ataque seu falhar contra um alvo ao seu alcance, você pode transformar essa falha em um acerto. Ou, se falhar em um teste de habilidade, você pode tratar a jogada do d20 como um 20 natural.\nUma vez que use essa característica, você não pode usá-la de novo até terminar um descanso curto ou longo.",
      resource: { max: 1, recharge: "short" },
    },
  ],
  subclasses: [
    // ------------------------------------------------------------------ PHB
    {
      name: "Ladrão",
      source: "PHB",
      description:
        "Você aprimorou suas habilidades na arte do furto. Gatunos, bandidos, batedores de carteira, caçadores de tesouro e exploradores de masmorras seguem este arquétipo, que aprimora agilidade e furtividade e permite usar itens mágicos que normalmente não poderia.",
      features: [
        {
          name: "Mãos Rápidas",
          level: 3,
          description:
            "A partir do 3º nível, você pode usar a ação bônus concedida pela Ação Ardilosa para fazer um teste de Destreza (Prestidigitação), usar suas ferramentas de ladrão para desarmar uma armadilha ou abrir uma fechadura, ou realizar a ação Usar um Objeto.",
        },
        {
          name: "Andarilho de Telhados",
          level: 3,
          description:
            "No 3º nível, você adquire a habilidade de escalar mais rápido que o normal. Escalar não possui mais custo adicional de movimento para você.\nAlém disso, quando você fizer um salto com corrida, a distância que pode saltar aumenta um número de metros igual a 0,3 vezes o seu modificador de Destreza.",
        },
        {
          name: "Furtividade Suprema",
          level: 9,
          description:
            "A partir do 9º nível, você tem vantagem no teste de Destreza (Furtividade) se não se mover mais do que a metade de seu deslocamento no turno.",
        },
        {
          name: "Usar Instrumento Mágico",
          level: 13,
          description:
            "No 13º nível, você aprende o suficiente sobre como a magia funciona para improvisar o uso de itens que nem mesmo foram destinados a você. Você ignora todos os requisitos de classe, raça e nível para o uso de qualquer item mágico.",
        },
        {
          name: "Reflexos de Ladrão",
          level: 17,
          description:
            "Quando atinge o 17º nível, você se torna adepto em fazer emboscadas e fugas rápidas de situações perigosas. Você pode realizar dois turnos durante a primeira rodada de cada combate. Você realiza seu primeiro turno na sua iniciativa normal e o segundo na sua iniciativa menos 10.\nVocê não pode usar essa característica quando estiver surpreso.",
        },
      ],
    },
    {
      name: "Assassino",
      source: "PHB",
      description:
        "Você focou seu treinamento na macabra arte da morte: assassinos de aluguel, espiões, caçadores de recompensa e sacerdotes exterminadores. Subterfúgio, veneno e disfarces ajudam você a eliminar seus oponentes com eficiência mortífera.",
      features: [
        {
          name: "Proficiência Adicional",
          level: 3,
          description:
            "Quando você escolhe esse arquétipo, no 3º nível, você ganha proficiência com kit de disfarce e kit de venenos.",
        },
        {
          name: "Assassinar",
          level: 3,
          description:
            "A partir do 3º nível, você fica mais mortal quando pega seus oponentes desprevenidos. Você tem vantagem nas jogadas de ataque contra qualquer criatura que ainda não tenha agido no combate. Além disso, qualquer acerto que você fizer contra uma criatura que esteja surpresa é um acerto crítico.",
        },
        {
          name: "Especialização em Infiltração",
          level: 9,
          description:
            "A partir do 9º nível, você pode criar identidades falsas para si mesmo de forma infalível. Você deve gastar sete dias e 25 po para estabelecer o histórico, a profissão e as filiações de uma identidade. Você não pode estabelecer uma identidade que pertença a outra pessoa. Por exemplo, você pode adquirir roupas apropriadas, cartas de apresentação e um certificado aparentemente oficial para se estabelecer como membro de uma casa de comércio de uma cidade remota e, assim, introduzir-se na companhia de outros comerciantes abastados.\nPosteriormente, se você adotar a nova identidade como disfarce, outras criaturas acreditarão que você é aquela pessoa até terem algum motivo óbvio para pensarem o contrário.",
        },
        {
          name: "Impostor",
          level: 13,
          description:
            "No 13º nível, você adquire a habilidade de imitar infalivelmente a fala, a escrita e o comportamento de outra pessoa. Você deve gastar pelo menos três horas estudando esses três componentes do comportamento da pessoa, ouvindo sua articulação, examinando sua escrita e observando seus maneirismos.\nSeu ardil é imperceptível para um observador casual. Se uma criatura desconfiada suspeitar que algo está errado, você tem vantagem em qualquer teste de Carisma (Enganação) que fizer para evitar ser detectado.",
        },
        {
          name: "Golpe Letal",
          level: 17,
          description:
            "No 17º nível, você se torna um mestre da morte instantânea. Quando você atacar e atingir uma criatura que esteja surpresa, ela deve realizar um teste de resistência de Constituição (CD 8 + seu modificador de Destreza + seu bônus de proficiência). Se falhar, dobre o dano do seu ataque contra a criatura.",
        },
      ],
    },
    {
      name: "Trapaceiro Arcano",
      source: "PHB",
      description:
        "Alguns ladinos aprimoram suas finas perícias de furtividade e agilidade com magia, aprendendo truques de encantamento e ilusão. Incluem batedores de carteira e assaltantes, mas também trapaceiros, enganadores e muitos aventureiros.",
      features: [
        {
          name: "Conjuração",
          level: 3,
          description:
            "Quando você alcança o 3º nível, adquire a habilidade de conjurar magias. Veja o capítulo 10 para as regras gerais de conjuração e o capítulo 11 para a lista de magias de mago.\nTruques. Você aprende três truques: mãos mágicas e outros dois truques, à sua escolha, da lista de magias de mago. Você aprende um truque de mago adicional, à sua escolha, no 10º nível.\nEspaços de Magia. A tabela Conjuração de Trapaceiro Arcano mostra quantos espaços de magia de 1º nível e superiores você possui. Para conjurar uma dessas magias, você deve gastar um espaço de magia do nível da magia ou superior. Você recobra todos os espaços de magia gastos quando completa um descanso longo. Por exemplo, se você quiser conjurar a magia de 1º nível enfeitiçar pessoa e tiver um espaço de 1º nível e um de 2º nível disponíveis, poderá conjurá-la usando qualquer dos dois.\nMagias Conhecidas de 1º Nível e Superiores. Você conhece três magias de 1º nível, à sua escolha, das quais duas devem ser magias de encantamento ou ilusão da lista de magias de mago. A coluna Magias Conhecidas mostra quando você aprende mais magias de mago de 1º nível ou superior. Cada uma dessas magias deve ser de encantamento ou ilusão, à sua escolha, de um nível a que você tenha acesso na tabela. Por exemplo, ao alcançar o 7º nível da classe, você pode aprender uma nova magia de 1º ou 2º nível. As magias que você aprende no 8º, 14º e 20º nível podem vir de qualquer escola de magia.\nAlém disso, quando você adquire um nível nessa classe, pode escolher uma magia de mago que conheça e substituí-la por outra da lista de mago, que também deve ser de um nível para o qual tenha espaços de magia e deve ser de encantamento ou ilusão, exceto as magias substituídas no 8º, 14º e 20º nível.\nHabilidade de Conjuração. Inteligência é sua habilidade de conjuração para suas magias de mago. CD para suas magias = 8 + bônus de proficiência + modificador de Inteligência. Modificador de ataque de magia = bônus de proficiência + modificador de Inteligência.\nTabela Conjuração de Trapaceiro Arcano (nível de ladino: truques conhecidos / magias conhecidas / espaços de 1º, 2º, 3º, 4º nível):\n3º: 3 / 3 / 2, –, –, –\n4º: 3 / 4 / 3, –, –, –\n5º: 3 / 4 / 3, –, –, –\n6º: 3 / 4 / 3, –, –, –\n7º: 3 / 5 / 4, 2, –, –\n8º: 3 / 6 / 4, 2, –, –\n9º: 3 / 6 / 4, 2, –, –\n10º: 4 / 7 / 4, 3, –, –\n11º: 4 / 8 / 4, 3, –, –\n12º: 4 / 8 / 4, 3, –, –\n13º: 4 / 9 / 4, 3, 2, –\n14º: 4 / 10 / 4, 3, 2, –\n15º: 4 / 10 / 4, 3, 2, –\n16º: 4 / 11 / 4, 3, 3, –\n17º: 4 / 11 / 4, 3, 3, –\n18º: 4 / 11 / 4, 3, 3, –\n19º: 4 / 12 / 4, 3, 3, 1\n20º: 4 / 13 / 4, 3, 3, 1",
        },
        {
          name: "Mãos Mágicas Malabaristas",
          level: 3,
          description:
            "A partir do 3º nível, quando você conjurar mãos mágicas, pode tornar a mão espectral invisível e realizar as seguintes tarefas adicionais com ela:\n• Guardar um objeto que a mão esteja segurando em um recipiente vestido ou carregado por outra criatura.\n• Recuperar um objeto guardado em um recipiente vestido ou carregado por outra criatura.\n• Usar ferramentas de ladrão para abrir fechaduras ou desarmar armadilhas à distância.\nVocê pode realizar qualquer dessas tarefas sem ser notado por uma criatura se for bem-sucedido num teste de Destreza (Prestidigitação) resistido pelo teste de Sabedoria (Percepção) da criatura.\nAlém disso, você pode usar a ação bônus concedida pela Ação Ardilosa para controlar a mão.",
        },
        {
          name: "Emboscada Mágica",
          level: 9,
          description:
            "A partir do 9º nível, se você estiver escondido de uma criatura quando conjurar uma magia nela, a criatura terá desvantagem em qualquer teste de resistência que fizer contra a magia nesse turno.",
        },
        {
          name: "Trapaceiro Versátil",
          level: 13,
          description:
            "No 13º nível, você ganha a habilidade de distrair alvos com suas mãos mágicas. Com uma ação bônus no seu turno, você pode designar uma criatura a até 1,5 metro da mão espectral criada pela magia. Fazer isso lhe concede vantagem nas jogadas de ataque contra essa criatura até o final do turno.",
        },
        {
          name: "Ladrão de Magia",
          level: 17,
          description:
            "No 17º nível, você ganha a habilidade de roubar magicamente o conhecimento de como conjurar uma magia de outro conjurador.\nImediatamente depois de uma criatura conjurar uma magia que tenha você como alvo ou o inclua na área de efeito, você pode usar sua reação para forçar a criatura a realizar um teste de resistência com o modificador de habilidade de conjuração dela. A CD é igual à CD das suas magias. Numa falha, você ignora o efeito da magia sobre você e rouba o conhecimento da magia, se ela for de pelo menos 1º nível e de um nível que você possa conjurar (não precisa ser uma magia de mago). Pelas próximas 8 horas, você conhece a magia e pode conjurá-la usando seus espaços de magia. A criatura não pode conjurar a magia até que 8 horas tenham se passado.\nUma vez que tenha usado essa característica, você não pode usá-la novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
    // ----------------------------------------------------------------- XGtE
    {
      name: "Inquiridor",
      source: "XGtE",
      description:
        "Você é notável em desenterrar segredos e desvendar mistérios, confiando em seu olho para detalhes e na habilidade de ler palavras e atos das criaturas. Destaca-se em expor e derrotar os males ocultos que se alimentam das pessoas comuns.",
      features: [
        {
          name: "Ouvido do Enganador",
          level: 3,
          description:
            "Quando você escolhe esse arquétipo no 3º nível, desenvolve um talento para descobrir mentiras. Sempre que fizer um teste de Sabedoria (Intuição) para determinar se uma criatura está mentindo, trate um resultado de 7 ou inferior no d20 como um 8.",
        },
        {
          name: "Olhar do Detalhe",
          level: 3,
          description:
            "Começando no 3º nível, você pode usar sua ação bônus para fazer um teste de Sabedoria (Percepção) para detectar um objeto ou uma criatura escondida, ou um teste de Inteligência (Investigação) para descobrir ou decifrar pistas.",
        },
        {
          name: "Combatente Perspicaz",
          level: 3,
          description:
            "No 3º nível, você obtém a habilidade de decifrar a tática de um oponente e desenvolver um contra-ataque. Como uma ação bônus, você pode realizar um teste de Sabedoria (Intuição) resistido pelo teste de Carisma (Enganação) de uma criatura que possa ver e que não esteja incapacitada. Se for bem-sucedido, você pode usar o Ataque Furtivo contra esse alvo mesmo sem vantagem na jogada de ataque, mas não se tiver desvantagem. Esse benefício dura por 1 minuto ou até você ser bem-sucedido usando esta característica contra outro alvo.",
        },
        {
          name: "Olhar Constante",
          level: 9,
          description:
            "Começando no 9º nível, você tem vantagem em qualquer teste de Sabedoria (Percepção) ou Inteligência (Investigação) caso não tenha se movido mais da metade de seu deslocamento no mesmo turno.",
        },
        {
          name: "Olhar Inflexível",
          level: 13,
          description:
            "A partir do 13º nível, seus sentidos são quase impossíveis de serem despistados. Como uma ação, você percebe a presença de ilusões, metamorfos que não estejam em sua forma original e outras magias projetadas para enganar os sentidos a até 9 metros de você, desde que não esteja cego ou surdo. Você sente que um efeito está tentando enganá-lo, mas não obtém nenhuma visão sobre o que está escondido ou sobre sua verdadeira natureza.\nVocê pode usar essa característica um número de vezes igual ao seu modificador de Sabedoria (mínimo de uma vez) e recupera todos os usos gastos quando termina um descanso longo.",
          resource: { max: "wis", recharge: "long" },
        },
        {
          name: "Olhar da Fraqueza",
          level: 17,
          description:
            "No 17º nível, você aprende a explorar a fraqueza de uma criatura estudando cuidadosamente suas táticas e seus movimentos. Enquanto seu Combatente Perspicaz estiver ativo sobre um alvo, o dano do seu Ataque Furtivo contra esse alvo aumenta em 3d6.",
        },
      ],
    },
    {
      name: "Mentor",
      source: "XGtE",
      description:
        "Seu foco está nas pessoas, na influência e nos segredos que elas têm. Espiões, cortesãos e manipuladores escolhem este arquétipo: palavras são suas armas tanto quanto facas ou veneno, e segredos e favores são seus maiores tesouros.",
      features: [
        {
          name: "Mestre da Intriga",
          level: 3,
          description:
            "Quando você escolhe esse arquétipo no 3º nível, obtém proficiência com kit de disfarce, kit de falsificação e um conjunto de jogo à sua escolha. Também aprende dois idiomas adicionais, à sua escolha.\nAlém disso, você pode imitar infalivelmente os padrões de fala e o sotaque de uma criatura que tenha ouvido falar por ao menos 1 minuto, possibilitando que se passe por um nativo de uma terra específica, desde que conheça o idioma.",
        },
        {
          name: "Mestre de Tática",
          level: 3,
          description:
            "Começando no 3º nível, você pode usar a ação Ajudar como uma ação bônus. Além disso, quando usar a ação Ajudar para auxiliar um aliado a atacar uma criatura, o alvo desse ataque pode estar a até 9 metros de você, em vez de 1,5 metro, desde que o aliado possa ver ou ouvir você.",
        },
        {
          name: "Manipulador Perspicaz",
          level: 9,
          description:
            "No 9º nível, se você gastar ao menos 1 minuto observando ou interagindo com outra criatura fora de combate, pode obter certas informações sobre suas capacidades comparadas às suas. O Mestre dirá se a criatura é igual, superior ou inferior a você em duas das seguintes características, à sua escolha:\n• Valor de Inteligência\n• Valor de Sabedoria\n• Valor de Carisma\n• Níveis de classe (caso existam)\nA critério do Mestre, você também pode descobrir um trecho da história da criatura ou um de seus traços de personalidade, se tiver algum.",
        },
        {
          name: "Redirecionar",
          level: 13,
          description:
            "A partir do 13º nível, você pode às vezes redirecionar para outra criatura um ataque destinado a você. Quando for alvo de um ataque enquanto uma criatura a até 1,5 metro de você estiver lhe concedendo cobertura contra esse ataque, você pode usar sua reação para fazer com que o ataque tenha essa criatura como alvo em vez de você.",
        },
        {
          name: "Alma do Enganador",
          level: 17,
          description:
            "A partir do 17º nível, seus pensamentos não podem ser lidos por telepatia ou outros meios, a menos que você permita. Você pode apresentar pensamentos falsos sendo bem-sucedido em um teste de Carisma (Enganação) resistido pelo teste de Sabedoria (Intuição) do leitor de mentes.\nAlém disso, não importa o que você diga, magia que determinaria se você está dizendo a verdade indica que você está sendo sincero, se assim escolher, e você não pode ser compelido a dizer a verdade por magia.",
        },
      ],
    },
    {
      name: "Batedor",
      source: "XGtE",
      description:
        "Você é hábil em furtividade e sobrevivência longe das ruas da cidade, avançando à frente de seus companheiros nas expedições. Emboscadores, espiões e caçadores de recompensas assumem este arquétipo, sentindo-se em casa nos ermos, entre bárbaros e patrulheiros.",
      features: [
        {
          name: "Escaramuça",
          level: 3,
          description:
            "A partir do 3º nível, você é difícil de segurar durante uma luta. Você pode mover-se até a metade do seu deslocamento como uma reação quando um inimigo termina o turno dele a até 1,5 metro de você. Esse movimento não provoca ataques de oportunidade.",
        },
        {
          name: "Sobrevivente",
          level: 3,
          expertise: { count: 0, fixed: ["Natureza", "Sobrevivência"] },
          description:
            "Quando você escolhe este arquétipo no 3º nível, ganha proficiência nas perícias Natureza e Sobrevivência, caso ainda não as possua. Seu bônus de proficiência é dobrado em qualquer teste de habilidade que fizer usando qualquer uma dessas proficiências.",
        },
        {
          name: "Mobilidade Superior",
          level: 9,
          description:
            "No 9º nível, seu deslocamento de caminhada aumenta em 3 metros. Se você possui um deslocamento de escalada ou natação, esse aumento aplica-se a esse deslocamento também.",
        },
        {
          name: "Mestre da Emboscada",
          level: 13,
          description:
            "A partir do 13º nível, você se destaca em liderar emboscadas e em agir primeiro numa luta.\nVocê tem vantagem em testes de iniciativa. Além disso, a primeira criatura que você atingir durante a primeira rodada de um combate torna-se um alvo mais fácil para você e para os outros. As jogadas de ataque contra esse alvo têm vantagem até o início do seu próximo turno.",
        },
        {
          name: "Golpe Súbito",
          level: 17,
          description:
            "Começando no 17º nível, você pode atacar com velocidade mortal. Se você realizar a ação Atacar em seu turno, pode fazer um ataque adicional como uma ação bônus. Esse ataque pode se beneficiar do seu Ataque Furtivo mesmo que você já o tenha usado neste turno, mas somente se o ataque for o único que fizer contra esse alvo no turno.",
        },
      ],
    },
    {
      name: "Espadachim",
      source: "XGtE",
      description:
        "Seu treinamento na arte da lâmina divide-se em partes iguais de velocidade, elegância e fascínio. Duelistas e piratas escolhem este arquétipo: seu estilo de luta é quase uma performance, destacando-se no combate a uma mão e na luta enquanto se afasta do oponente.",
      features: [
        {
          name: "Passo Elegante",
          level: 3,
          description:
            "Quando você escolhe esse arquétipo no 3º nível, aprende a entrar e sair do alcance de um inimigo sem sofrer as consequências. Durante seu turno, se você efetuar um ataque corpo a corpo contra uma criatura, essa criatura não pode efetuar ataques de oportunidade contra você pelo resto do seu turno.",
        },
        {
          name: "Audácia Devassa",
          level: 3,
          description:
            "A partir do 3º nível, sua confiança o impulsiona para a batalha. Você pode adicionar seu modificador de Carisma às suas jogadas de iniciativa.\nVocê também obtém uma forma adicional de usar seu Ataque Furtivo: você não precisa de vantagem na jogada de ataque se estiver a 1,5 metro do alvo, nenhuma outra criatura estiver a 1,5 metro de você e você não tiver desvantagem na jogada de ataque. Todas as outras regras do Ataque Furtivo ainda se aplicam.",
        },
        {
          name: "Penachar",
          level: 9,
          description:
            "No 9º nível, seu encanto torna-se extraordinariamente sedutor. Como uma ação, você pode fazer um teste de Carisma (Persuasão) resistido pelo teste de Sabedoria (Intuição) de uma criatura. A criatura deve ser capaz de ouvi-lo e vocês devem compartilhar um idioma.\nSe você for bem-sucedido e a criatura for hostil, ela tem desvantagem nas jogadas de ataque contra alvos que não sejam você e não pode realizar ataques de oportunidade contra alvos que não sejam você. Esse efeito dura 1 minuto, até que um dos seus companheiros ataque o alvo ou o afete com uma magia, ou até que você e o alvo fiquem a mais de 18 metros um do outro.\nSe você for bem-sucedido e a criatura não for hostil, ela fica enfeitiçada por você por 1 minuto. Enquanto enfeitiçada, ela o considera um amigo confiável. Esse efeito termina imediatamente se você ou seus companheiros fizerem algo prejudicial a ela.",
        },
        {
          name: "Manobra Elegante",
          level: 13,
          description:
            "Começando no 13º nível, você pode usar sua ação bônus no seu turno para ganhar vantagem no próximo teste de Destreza (Acrobacia) ou Força (Atletismo) que fizer no mesmo turno.",
        },
        {
          name: "Mestre Duelista",
          level: 17,
          description:
            "A partir do 17º nível, sua maestria com a lâmina permite transformar um erro em um sucesso em combate. Se você errar uma jogada de ataque, pode repeti-la com vantagem. Uma vez que use esta característica, só poderá usá-la novamente depois de terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
      ],
    },
    // ----------------------------------------------------------------- TCoE
    {
      name: "Fantasma",
      source: "TCoE",
      description:
        "Ladinos que caminham na linha tênue entre a vida e a morte e descobrem uma conexão mística com a própria morte, tornando-se imersos em energia negativa até se aproximarem de fantasmas. Guildas os valorizam como coletores de informação e espiões.",
      features: [
        {
          name: "Sussurros da Morte",
          level: 3,
          description:
            "Ecos daqueles que morreram se prendem a você. Sempre que terminar um descanso curto ou longo, você pode escolher uma proficiência com ferramenta ou perícia que não possua e adquiri-la, conforme uma presença fantasmagórica compartilha seu conhecimento com você. Você perde essa proficiência quando utilizar essa característica para escolher outra proficiência que não possua.",
        },
        {
          name: "Lamentos da Sepultura",
          level: 3,
          description:
            "Conforme você empurra alguém para perto do túmulo, pode canalizar o poder da morte para ferir outra pessoa. Imediatamente após causar dano com seu Ataque Furtivo a uma criatura em seu turno, você pode escolher uma segunda criatura que possa ver a até 9 metros da primeira. Jogue metade do número de dados do seu Ataque Furtivo (arredondado para cima), e a segunda criatura sofre dano necrótico igual ao total da jogada, conforme os lamentos da sepultura soam ao seu redor por um momento.\nVocê pode usar essa característica um número de vezes igual ao seu bônus de proficiência e recupera todos os usos gastos ao terminar um descanso longo.",
          resource: { max: "prof", recharge: "long" },
        },
        {
          name: "Símbolos dos Mortos",
          level: 9,
          description:
            "Quando uma vida se encerra em sua presença, você é capaz de arrebatar um símbolo da alma que parte, um fragmento de sua essência vital que toma forma física: como uma reação, quando uma criatura que você possa ver morre a até 9 metros de você, você pode abrir sua mão livre e fazer com que uma bugiganga Minúscula apareça nela, um berloque da alma. O Mestre determina a forma do berloque ou rola na tabela de Bugigangas do Livro do Jogador para gerá-lo.\nVocê pode ter um número máximo de berloques da alma igual ao seu bônus de proficiência e não pode criar outro enquanto estiver nesse limite.\nVocê pode usar os berloques da alma das seguintes formas:\n• Enquanto estiver carregando um berloque da alma, você tem vantagem em testes de resistência de Constituição e testes de resistência contra a morte, pois sua vitalidade é aprimorada pela essência de vida no objeto.\n• Quando você causar dano com o Ataque Furtivo em seu turno, pode destruir um dos seus berloques da alma que esteja em sua posse e imediatamente usar Lamentos da Sepultura sem gastar um uso dessa característica.\n• Com uma ação, você pode destruir um dos seus berloques da alma, independentemente de onde ele esteja. Ao fazer isso, você pode fazer uma pergunta ao espírito associado ao item. O espírito aparece para você e responde em um idioma que conhecia em vida. Ele não é obrigado a ser sincero, e sua resposta é o mais breve possível, ansioso por ser libertado. O espírito sabe apenas o que conhecia em vida, conforme determinado pelo Mestre.",
          resource: { name: "Berloques da Alma", max: "prof", recharge: "long" },
        },
        {
          name: "Passo Fantasma",
          level: 13,
          description:
            "Você pode passar parcialmente para o reino dos mortos, transformando-se em uma espécie de fantasma. Como uma ação bônus, você assume uma forma espectral. Enquanto nessa forma, você tem deslocamento de voo de 3 metros, pode pairar, e jogadas de ataque têm desvantagem contra você. Você também pode se mover através de criaturas e objetos como se fossem terreno difícil, mas sofre 1d10 de dano de energia se terminar seu turno dentro deles.\nVocê permanece nessa forma por 10 minutos ou até encerrá-la como uma ação bônus. Para usar essa característica novamente, você deve terminar um descanso longo ou destruir um dos seus berloques da alma como parte da ação bônus usada para ativar o Passo Fantasma.",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Amigo da Morte",
          level: 17,
          description:
            "Sua associação com a morte tornou-se tão próxima que você adquire os seguintes benefícios:\n• Quando você usa Lamentos da Sepultura, pode causar o dano necrótico tanto na primeira quanto na segunda criatura.\n• Ao final de um descanso longo, um berloque da alma aparece em sua mão se você não tiver nenhum, conforme os espíritos dos mortos são atraídos para você.",
        },
      ],
    },
    {
      name: "Alma Laminada",
      source: "TCoE",
      description:
        "Uma Alma Laminada golpeia e se infiltra com a mente, cortando barreiras físicas e psíquicas com o poder psiônico descoberto dentro de si. Encontram lugar em guildas de ladrões, como espiões de governos e como guardiões silenciosos das florestas.",
      features: [
        {
          name: "Poder Psiônico",
          level: 3,
          description:
            "Você abriga uma fonte de energia psiônica dentro de si. Essa energia é representada por seus dados de Energia Psiônica, que são d6. Você possui um número de dados de Energia Psiônica igual ao dobro do seu bônus de proficiência, e eles alimentam vários dos seus poderes psiônicos, detalhados abaixo.\nAlguns dos seus poderes gastam os dados de Energia Psiônica que utilizam, conforme especificado na descrição, e você não pode usar um poder que exija um dado se não tiver nenhum disponível. Você recupera todos os dados de Energia Psiônica gastos quando termina um descanso longo. Além disso, como uma ação bônus, você pode recuperar um dado de Energia Psiônica gasto, mas só poderá fazer isso novamente após terminar um descanso curto ou longo.\nQuando você alcança certos níveis nessa classe, o tamanho do seu dado de Energia Psiônica aumenta: no 5º nível (d8), no 11º nível (d10) e no 17º nível (d12).\nOs poderes abaixo utilizam seus dados de Energia Psiônica.\nAuxílio Psiônico. Quando seu treinamento não psiônico falha, sua energia psiônica pode ajudar: se você falhar em um teste de habilidade usando uma perícia ou ferramenta em que seja proficiente, você pode rolar um dado de Energia Psiônica e adicionar o resultado ao teste, potencialmente transformando a falha em sucesso. Você gasta o dado apenas se a rolagem tornar o teste bem-sucedido.\nSussurros Psíquicos. Você pode estabelecer comunicação telepática entre você e outros, perfeito para uma infiltração silenciosa. Como uma ação, escolha uma ou mais criaturas que possa ver, até um número igual ao seu bônus de proficiência, e então role um dado de Energia Psiônica. Por um número de horas igual ao resultado, as criaturas escolhidas podem falar telepaticamente com você e você com elas. Para enviar ou receber uma mensagem (sem ação necessária), você e a outra criatura devem estar a até 1,5 km um do outro. Uma criatura não pode usar essa telepatia se não souber falar nenhum idioma, e pode encerrar a conexão a qualquer momento (sem ação necessária). Vocês não precisam falar o mesmo idioma para se entenderem.\nA primeira vez que usar esse poder após um descanso longo, você não gasta o dado de Energia Psiônica. Todas as outras vezes, você gasta o dado ao ativar o poder.",
          resource: {
            name: "Dados de Energia Psiônica",
            max: 4,
            recharge: "long",
            byLevel: { "3": 4, "5": 6, "9": 8, "13": 10, "17": 12 },
          },
        },
        {
          name: "Lâminas Psíquicas",
          level: 3,
          description:
            "Você pode manifestar seu poder psiônico como lâminas cintilantes de energia psíquica. Sempre que realizar a ação Atacar, você pode manifestar uma lâmina psíquica em uma mão livre e fazer o ataque com ela. Essa lâmina mágica é uma arma simples corpo a corpo com as propriedades acuidade e arremesso. Seu alcance normal é de 18 metros e o alcance longo, 36 metros, e ao acertar ela causa 1d6 de dano psíquico mais o modificador do atributo usado na jogada de ataque. A lâmina desaparece imediatamente após o ataque, tendo acertado ou errado o alvo, e não deixa marca no alvo caso tenha causado dano.\nApós atacar com a lâmina, você pode realizar um ataque corpo a corpo ou à distância com uma segunda lâmina psíquica como uma ação bônus no mesmo turno, desde que sua outra mão esteja livre para criá-la. O dado de dano desse ataque bônus é 1d4, em vez de 1d6.",
        },
        {
          name: "Lâminas da Alma",
          level: 9,
          description:
            "Suas Lâminas Psíquicas são agora uma expressão da sua alma infundida de energia psiônica, concedendo a você as seguintes habilidades que utilizam seus dados de Energia Psiônica:\nGolpe Teleguiado. Se você fizer uma jogada de ataque com suas Lâminas Psíquicas e errar, pode rolar um dado de Energia Psiônica e adicionar o número rolado ao resultado do ataque. Se isso fizer o ataque acertar, você gasta o dado de Energia Psiônica.\nTeletransporte Psíquico. Como uma ação bônus, você manifesta uma de suas Lâminas Psíquicas, gastando e rolando um dado de Energia Psiônica. Você arremessa a lâmina para um espaço desocupado que possa ver a até um número de metros igual a 3 vezes o resultado do dado. Você se teletransporta para esse espaço, e a lâmina desaparece.",
        },
        {
          name: "Véu Psíquico",
          level: 13,
          description:
            "Você pode envolver-se em um véu de energia psíquica para mascarar a si mesmo. Como uma ação, você pode magicamente ficar invisível, junto com qualquer coisa que esteja vestindo ou carregando, por 1 hora ou até dissipar o efeito (sem ação necessária). Essa invisibilidade termina antes caso você cause dano a uma criatura ou a force a realizar um teste de resistência.\nUma vez que use esta característica, você não poderá usá-la novamente até terminar um descanso longo, a menos que gaste um dado de Energia Psiônica para ativá-la novamente.",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Mente Pura",
          level: 17,
          description:
            "Você pode direcionar suas Lâminas Psíquicas diretamente para a mente de uma criatura. Quando você usar suas Lâminas Psíquicas para causar dano de Ataque Furtivo em uma criatura, pode forçar o alvo a realizar um teste de resistência de Sabedoria (CD 8 + seu bônus de proficiência + seu modificador de Destreza). Se falhar, o alvo fica atordoado por 1 minuto. O alvo atordoado pode repetir o teste de resistência ao final de cada um de seus turnos, encerrando o efeito sobre si em caso de sucesso.\nUma vez que use esta característica, você não poderá usá-la novamente até terminar um descanso longo, a menos que gaste um dado de Energia Psiônica para ativá-la novamente.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
  ],
};
