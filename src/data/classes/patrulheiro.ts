import type { ClassDef } from "@/lib/types";

/**
 * Patrulheiro — progressão completa (níveis 1–20) e todos os Arquétipos de Patrulheiro
 * do Livro do Jogador, do Guia de Xanathar e do Caldeirão de Tasha (PT-BR).
 *
 * Fontes: PHB cap. 3 (Patrulheiro) e p.166–167 (Multiclasse); XGtE p.58–60
 * (Perseguidor Obscuro, Andarilho do Horizonte, Exterminador de Monstros);
 * TCoE p.52–55 (estilos de luta, Andarilho Feérico, Portador do Enxame — o Tasha
 * em PT-BR chama a classe de "Guardião").
 *
 * Apenas as características base do PHB entram aqui; as características opcionais
 * do Tasha (Consciência Primordial, Véu Natural, Versatilidade Marcial etc.) ficam de fora.
 */

const ASI_TEXTO =
  "Você pode aumentar um valor de habilidade, à sua escolha, em 2, ou pode aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.";

export const PATRULHEIRO: ClassDef = {
  name: "Patrulheiro",
  source: "PHB",
  subclassLabel: "Arquétipo de Patrulheiro",
  subclassLevel: 3,
  multiclass: {
    prerequisite: "Destreza 13 e Sabedoria 13",
    proficiencies:
      "Armadura leve, armadura média, escudos, armas simples, armas marciais, uma perícia da lista de perícias da classe",
    skills: 1,
  },
  features: [
    {
      name: "Inimigo Favorito",
      level: 1,
      description:
        "A partir do 1° nível, você tem experiência significativa estudando, rastreando, caçando e até mesmo conversando com certo tipo de inimigo.\nEscolha um tipo de inimigo favorito: aberrações, bestas, celestiais, constructos, corruptores, dragões, elementais, fadas, gigantes, limos, monstruosidades, mortos-vivos ou plantas. Alternativamente, você pode selecionar duas raças de humanoides (como gnolls e orcs) como inimigos favoritos.\nVocê tem vantagem em testes de Sabedoria (Sobrevivência) para rastrear seus inimigos favoritos, assim como em testes de Inteligência para lembrar informações sobre eles.\nQuando você adquire essa característica, também aprende um idioma, à sua escolha, que seja falado pelos seus inimigos favoritos, se eles falarem algum.\nVocê escolhe um inimigo favorito adicional, assim como um idioma associado, no 6° e no 14° nível. Conforme você ganha níveis, suas escolhas devem refletir os tipos de monstros que você encontrou em suas aventuras.",
    },
    {
      name: "Explorador Natural",
      level: 1,
      description:
        "Você está particularmente familiarizado com um tipo de ambiente natural e é hábil em viajar e sobreviver em tais regiões. Escolha um tipo de terreno favorito: ártico, costa, deserto, floresta, pasto, montanha, pântano ou Subterrâneo. Quando você fizer um teste de Inteligência ou Sabedoria relacionado ao seu terreno favorito, seu bônus de proficiência é dobrado se você estiver usando uma perícia na qual seja proficiente.\nEnquanto estiver viajando por uma hora ou mais no seu terreno favorito, você ganha os seguintes benefícios:\n• Terreno difícil não atrasa a viagem do seu grupo.\n• Seu grupo não pode se perder, exceto por meios mágicos.\n• Mesmo quando você está engajado em outra atividade além de viajar (como forragear, navegar ou rastrear), você permanece alerta ao perigo.\n• Se você estiver viajando sozinho, pode se mover furtivamente com um ritmo de viagem normal.\n• Quando você forrageia, encontra o dobro de comida que normalmente encontraria.\n• Enquanto estiver rastreando outras criaturas, você também descobre o número exato delas, seus tamanhos e há quanto tempo passaram pela área.\nVocê escolhe um tipo de terreno favorito adicional no 6° e no 10° nível.",
    },
    {
      name: "Estilo de Luta",
      level: 2,
      description:
        "No 2° nível, você adota um estilo de combate particular que será sua especialidade. Escolha uma das opções a seguir. Você não pode escolher o mesmo Estilo de Luta mais de uma vez, mesmo se puder escolher de novo.\nArquearia. Você ganha +2 de bônus nas jogadas de ataque realizadas com armas de ataque à distância.\nCombate com Duas Armas. Quando você estiver lutando com duas armas, pode adicionar o seu modificador de habilidade na jogada de dano do segundo ataque.\nDefesa. Enquanto estiver usando armadura, você ganha +1 de bônus na CA.\nDuelismo. Quando você empunhar uma arma corpo a corpo em uma mão e nenhuma outra arma, você ganha +2 de bônus nas jogadas de dano com essa arma.\nLuta às Cegas (Caldeirão de Tasha). Você tem percepção às cegas com alcance de 3 metros. Dentro desse alcance, você pode efetivamente ver qualquer coisa que não esteja sob cobertura total, mesmo se estiver cego ou na escuridão. Além disso, você pode ver uma criatura invisível dentro desse alcance, a menos que a criatura se esconda de você com sucesso.\nGuerreiro Druídico (Caldeirão de Tasha). Você aprende dois truques, à sua escolha, da lista de magias do druida. Eles contam como magias de patrulheiro para você, e Sabedoria é sua habilidade de conjuração para eles. Sempre que você adquirir um nível nesta classe, pode substituir um desses truques por outro truque da lista de magias do druida.\nArremesso de Armas (Caldeirão de Tasha). Você pode sacar uma arma que possua a propriedade arremesso como parte do ataque que fizer com ela. Além disso, quando você acerta um ataque à distância usando uma arma de arremesso, ganha +2 de bônus na jogada de dano.",
    },
    {
      name: "Conjuração",
      level: 2,
      description:
        "Quando você alcança o 2° nível, você aprende a usar a essência mágica da natureza para conjurar magias, como um druida faz. Veja o capítulo 10 para as regras gerais de conjuração e o capítulo 11 para a lista de magias de patrulheiro.\nEspaços de Magia. A tabela do Patrulheiro mostra quantos espaços de magia você tem para conjurar suas magias de 1° nível e superiores. Para conjurar uma dessas magias, você deve gastar um espaço de magia do nível da magia ou superior. Você recupera todos os espaços de magia gastos quando completa um descanso longo.\nEspaços de magia por nível de patrulheiro (1°/2°/3°/4°/5°): 2°: 2; 3°–4°: 3; 5°–6°: 4/2; 7°–8°: 4/3; 9°–10°: 4/3/2; 11°–12°: 4/3/3; 13°–14°: 4/3/3/1; 15°–16°: 4/3/3/2; 17°–18°: 4/3/3/3/1; 19°–20°: 4/3/3/3/2.\nPor exemplo, se você quiser conjurar a magia de 1° nível amizade animal e tiver um espaço de magia de 1° nível e um de 2° nível disponíveis, poderá conjurar amizade animal usando qualquer um dos dois espaços.\nMagias Conhecidas de 1° Nível e Superiores. Você conhece duas magias de 1° nível, à sua escolha, da lista de magias de patrulheiro. A coluna Magias Conhecidas da tabela do Patrulheiro mostra quando você aprende mais magias de patrulheiro, à sua escolha: 2 no 2° nível, 3 no 3°, 4 no 5°, 5 no 7°, 6 no 9°, 7 no 11°, 8 no 13°, 9 no 15°, 10 no 17° e 11 no 19° nível. Cada uma dessas magias deve ser de um nível para o qual você tenha espaços de magia. Por exemplo, quando você alcança o 5° nível nesta classe, pode aprender uma nova magia de 1° ou 2° nível.\nAlém disso, quando você adquire um nível nesta classe, pode escolher uma magia de patrulheiro que conheça e substituí-la por outra magia da lista de magias de patrulheiro, que também deve ser de um nível para o qual você tenha espaços de magia.\nHabilidade de Conjuração. Sabedoria é a sua habilidade de conjuração para as magias de patrulheiro, já que sua magia vem da sua sintonia com a natureza. Você usa sua Sabedoria sempre que alguma magia se referir à sua habilidade de conjuração. Além disso, você usa o seu modificador de Sabedoria para definir a CD dos testes de resistência das magias de patrulheiro que você conjura e quando realiza uma jogada de ataque com uma magia.\nCD para suas magias = 8 + seu bônus de proficiência + seu modificador de Sabedoria.\nModificador de ataque de magia = seu bônus de proficiência + seu modificador de Sabedoria.",
    },
    {
      name: "Prontidão Primitiva",
      level: 3,
      description:
        "A partir do 3° nível, você pode usar sua ação e gastar um espaço de magia de patrulheiro para focar sua consciência na região ao seu redor. Por 1 minuto por nível do espaço de magia gasto, você pode sentir se os seguintes tipos de criatura estão presentes a até 1,5 quilômetro de você (ou até 9 quilômetros se você estiver no seu terreno favorito): aberrações, celestiais, corruptores, dragões, elementais, fadas e mortos-vivos. Essa característica não revela a localização nem o número das criaturas.",
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
      name: "Aprimoramentos de Inimigo Favorito e Explorador Natural",
      level: 6,
      description:
        "No 6° nível, você escolhe um tipo de inimigo favorito adicional (aberrações, bestas, celestiais, constructos, corruptores, dragões, elementais, fadas, gigantes, limos, monstruosidades, mortos-vivos, plantas ou duas raças de humanoides), assim como um idioma associado a ele, ganhando contra ele todos os benefícios de Inimigo Favorito.\nVocê também escolhe um tipo de terreno favorito adicional (ártico, costa, deserto, floresta, pasto, montanha, pântano ou Subterrâneo), ganhando nele todos os benefícios de Explorador Natural.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 8,
      asi: true,
      description: ASI_TEXTO,
    },
    {
      name: "Caminho da Floresta",
      level: 8,
      description:
        "A partir do 8° nível, mover-se através de terreno difícil não mágico não custa deslocamento extra. Você também pode atravessar plantas não mágicas sem ser atrasado por elas e sem sofrer dano delas, caso tenham espinhos, acúleos ou perigo similar.\nAlém disso, você tem vantagem em testes de resistência contra plantas criadas ou manipuladas magicamente para impedir o movimento, como as criadas pela magia enredar.",
    },
    {
      name: "Aprimoramento de Explorador Natural",
      level: 10,
      description:
        "No 10° nível, você escolhe um tipo de terreno favorito adicional (ártico, costa, deserto, floresta, pasto, montanha, pântano ou Subterrâneo), ganhando nele todos os benefícios de Explorador Natural.",
    },
    {
      name: "Mimetismo",
      level: 10,
      description:
        "A partir do 10° nível, você pode gastar 1 minuto criando uma camuflagem para si mesmo. Você deve ter acesso a lama fresca, terra, plantas, fuligem e outros materiais de ocorrência natural com os quais fabricar sua camuflagem.\nUma vez camuflado dessa forma, você pode tentar se esconder pressionando-se contra uma superfície sólida, como uma árvore ou uma parede, que seja pelo menos tão alta e larga quanto você. Você ganha +10 de bônus em testes de Destreza (Furtividade) enquanto permanecer ali sem se mover ou realizar ações. Assim que você se mover ou realizar uma ação ou reação, precisa se camuflar novamente para ganhar esse benefício.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 12,
      asi: true,
      description: ASI_TEXTO,
    },
    {
      name: "Aprimoramento de Inimigo Favorito",
      level: 14,
      description:
        "No 14° nível, você escolhe um tipo de inimigo favorito adicional (aberrações, bestas, celestiais, constructos, corruptores, dragões, elementais, fadas, gigantes, limos, monstruosidades, mortos-vivos, plantas ou duas raças de humanoides), assim como um idioma associado a ele, ganhando contra ele todos os benefícios de Inimigo Favorito.",
    },
    {
      name: "Desaparecer",
      level: 14,
      description:
        "Começando no 14° nível, você pode usar a ação de Esconder com uma ação bônus no seu turno. Além disso, você não pode ser rastreado por meios não mágicos, a não ser que decida deixar um rastro.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 16,
      asi: true,
      description: ASI_TEXTO,
    },
    {
      name: "Sentidos Selvagens",
      level: 18,
      description:
        "No 18° nível, você ganha sentidos preternaturais que o ajudam a lutar contra criaturas que você não pode ver. Quando você atacar uma criatura que não possa ver, sua incapacidade de vê-la não impõe desvantagem nas suas jogadas de ataque contra ela.\nVocê também está ciente da localização de qualquer criatura invisível a até 9 metros de você, desde que a criatura não esteja escondida de você e você não esteja cego ou surdo.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 19,
      asi: true,
      description: ASI_TEXTO,
    },
    {
      name: "Matador de Inimigos",
      level: 20,
      description:
        "No 20° nível, você se torna um caçador incomparável dos seus inimigos. Uma vez em cada um dos seus turnos, você pode adicionar seu modificador de Sabedoria na jogada de ataque ou na jogada de dano de um ataque que fizer contra um dos seus inimigos favoritos. Você pode escolher usar essa característica antes ou depois da rolagem, mas antes de qualquer efeito da rolagem ser aplicado.",
    },
  ],
  subclasses: [
    {
      name: "Caçador",
      source: "PHB",
      description:
        "Emular o Caçador significa aceitar seu lugar como baluarte entre a civilização e os terrores do ermo, aprendendo técnicas especializadas contra as ameaças mais terríveis, de ogros enfurecidos e hordas de orcs a gigantes e dragões.",
      features: [
        {
          name: "Presa do Caçador",
          level: 3,
          description:
            "No 3° nível, você ganha uma das seguintes características, à sua escolha.\nAssassino de Colossos. Sua tenacidade pode derrubar os mais poderosos oponentes. Quando você atinge uma criatura com um ataque com arma, a criatura sofre 1d8 de dano extra se estiver abaixo do máximo de pontos de vida dela. Você só pode causar esse dano extra uma vez por turno.\nMatador de Gigantes. Quando uma criatura Grande ou maior a até 1,5 metro de você atingir ou errar um ataque contra você, você pode usar sua reação para atacar a criatura imediatamente após o ataque dela, desde que possa vê-la.\nDestruidor de Hordas. Uma vez em cada um dos seus turnos, quando você fizer um ataque com arma, pode realizar outro ataque com a mesma arma contra uma criatura diferente que esteja a até 1,5 metro do alvo original e dentro do alcance da sua arma.",
        },
        {
          name: "Táticas Defensivas",
          level: 7,
          description:
            "No 7° nível, você ganha uma das seguintes características, à sua escolha.\nEscapar da Horda. Ataques de oportunidade contra você são feitos com desvantagem.\nDefesa Contra Múltiplos Ataques. Quando uma criatura atinge você com um ataque, você recebe +4 de bônus na CA contra todos os ataques subsequentes feitos por essa criatura no resto do turno.\nVontade de Aço. Você tem vantagem em testes de resistência para evitar ser amedrontado.",
        },
        {
          name: "Ataque Múltiplo",
          level: 11,
          description:
            "No 11° nível, você ganha uma das seguintes características, à sua escolha.\nSaraivada. Você pode usar sua ação para realizar um ataque à distância contra qualquer número de criaturas a até 3 metros de um ponto que você possa ver, dentro do alcance da sua arma. Você deve ter munição para cada alvo, como normal, e realiza uma jogada de ataque separada para cada alvo.\nAtaque Giratório. Você pode usar sua ação para realizar um ataque corpo a corpo contra qualquer número de criaturas a até 1,5 metro de você, realizando uma jogada de ataque separada para cada alvo.",
        },
        {
          name: "Defesa de Caçador Superior",
          level: 15,
          description:
            "No 15° nível, você ganha uma das seguintes características, à sua escolha.\nEvasão. Você pode se esquivar agilmente de certos efeitos em área, como o sopro de fogo de um dragão vermelho ou uma magia relâmpago. Quando você for alvo de um efeito que exige um teste de resistência de Destreza para sofrer metade do dano, você não sofre dano algum se passar, e somente metade do dano se falhar.\nManter-se Contra a Maré. Quando uma criatura hostil errar um ataque corpo a corpo contra você, você pode usar sua reação para forçar a criatura a repetir o mesmo ataque contra outra criatura (que não ela mesma), à sua escolha.\nEsquiva Sobrenatural. Quando um atacante que você possa ver atinge você com um ataque, você pode usar sua reação para reduzir o dano causado pelo ataque à metade.",
        },
      ],
    },
    {
      name: "Mestre das Bestas",
      source: "PHB",
      description:
        "Incorpora a amizade entre as raças civilizadas e as bestas do mundo: unidos em foco, besta e patrulheiro lutam juntos contra os monstros que ameaçam tanto a civilização quanto o ermo.",
      features: [
        {
          name: "Companheiro do Patrulheiro",
          level: 3,
          description:
            "No 3° nível, você ganha um companheiro bestial que o acompanha em suas aventuras e é treinado para lutar ao seu lado. Escolha uma besta que não seja maior que Média e que tenha nível de desafio 1/4 ou menor (o apêndice D apresenta as estatísticas do falcão, do mastim e da pantera como exemplos). Adicione seu bônus de proficiência à CA, às jogadas de ataque e às jogadas de dano da besta, assim como a qualquer teste de resistência e perícia em que ela seja proficiente. O máximo de pontos de vida dela é igual ao máximo normal dela ou a quatro vezes o seu nível de patrulheiro, o que for maior.\nA besta obedece aos seus comandos da melhor forma possível. Ela rola iniciativa e age no próprio turno. No seu turno, você pode ordenar verbalmente à besta para onde se mover (isso não exige ação). Você pode usar sua ação para ordenar verbalmente que ela realize a ação de Ataque, Disparada, Desengajar, Esquivar ou Ajudar. Uma vez que você tenha a característica Ataque Extra, você pode fazer um ataque com arma sozinho quando ordenar que a besta realize a ação de Ataque.\nEnquanto estiver viajando pelo seu terreno favorito apenas com a besta, vocês dois podem se mover furtivamente em ritmo normal.\nSe a besta morrer, você pode obter outra gastando 8 horas criando um vínculo mágico com outra besta que não seja hostil a você, seja do mesmo tipo da anterior ou de um tipo diferente.",
        },
        {
          name: "Treinamento Excepcional",
          level: 7,
          description:
            "A partir do 7° nível, em qualquer um dos seus turnos em que seu companheiro bestial não atacar, você pode usar uma ação bônus para ordenar verbalmente que a besta realize a ação de Disparada, Desengajar, Esquivar ou Ajudar no turno dela.\nAlém disso, os ataques da besta contam como mágicos para fins de superar resistência e imunidade a ataques e dano não mágicos.",
        },
        {
          name: "Fúria Bestial",
          level: 11,
          description:
            "A partir do 11° nível, quando você ordenar que seu companheiro bestial realize a ação de Ataque, a besta pode fazer dois ataques, ou realizar a ação de Ataques Múltiplos se ela possuir essa ação.",
        },
        {
          name: "Compartilhar Magias",
          level: 15,
          description:
            "A partir do 15° nível, quando você conjurar uma magia que tenha você como alvo, também pode afetar seu companheiro bestial com a magia, desde que ele esteja a até 9 metros de você.",
        },
      ],
    },
    {
      name: "Perseguidor Obscuro",
      source: "XGtE",
      description:
        "Sente-se em casa em ambientes escuros — profundezas da terra, becos sombrios, florestas primitivas — e se aventura corajosamente na escuridão para emboscar ameaças antes que cheguem ao mundo externo.",
      spells: {
        "3": ["Disfarçar-se"],
        "5": ["Truque de Corda"],
        "9": ["Medo"],
        "13": ["Invisibilidade Maior"],
        "17": ["Similaridade"],
      },
      features: [
        {
          name: "Magia do Perseguidor Obscuro",
          level: 3,
          description:
            "A partir do 3° nível, você aprende magias adicionais quando alcança certos níveis nesta classe, conforme mostrado na tabela de Magias do Perseguidor Obscuro: 3° nível, disfarçar-se; 5° nível, truque de corda; 9° nível, medo; 13° nível, invisibilidade maior; 17° nível, similaridade. Cada magia conta como uma magia de patrulheiro para você, mas não conta no número de magias de patrulheiro que você conhece.",
        },
        {
          name: "Emboscador Terrível",
          level: 3,
          description:
            "No 3° nível, você domina a arte da emboscada. Você recebe um bônus nas suas jogadas de iniciativa igual ao seu modificador de Sabedoria.\nNo primeiro turno de cada combate, seu deslocamento de caminhada aumenta em 3 metros até o fim desse turno. Se você realizar a ação de Ataque nesse turno, pode realizar um ataque com arma adicional como parte dessa ação. Se esse ataque acertar, o alvo sofre 1d8 de dano extra do mesmo tipo de dano da arma.",
        },
        {
          name: "Visão Umbral",
          level: 3,
          description:
            "No 3° nível, você ganha visão no escuro com alcance de 18 metros. Se você já possui visão no escuro da sua raça, o alcance dela aumenta em 9 metros.\nVocê também é adepto de evitar criaturas que dependem da visão no escuro. Enquanto estiver na escuridão, você fica invisível para qualquer criatura que dependa de visão no escuro para enxergá-lo nessa escuridão.",
        },
        {
          name: "Mente de Ferro",
          level: 7,
          description:
            "No 7° nível, você afiou sua capacidade de resistir aos poderes de alteração mental das suas presas. Você ganha proficiência em testes de resistência de Sabedoria. Se você já possui essa proficiência, ganha proficiência em testes de resistência de Inteligência ou Carisma (à sua escolha).",
        },
        {
          name: "Agitação Perseguidora",
          level: 11,
          description:
            "No 11° nível, você aprende a atacar com uma velocidade tão inesperada que pode transformar uma falha em outro ataque. Uma vez em cada um dos seus turnos, quando errar um ataque com arma, você pode fazer outro ataque com arma como parte da mesma ação.",
        },
        {
          name: "Evasiva Sombria",
          level: 15,
          description:
            "A partir do 15° nível, você pode se esquivar de maneiras imprevisíveis, com sombras sobrenaturais ao seu redor. Sempre que uma criatura fizer uma jogada de ataque contra você e não tiver vantagem na jogada, você pode usar sua reação para impor desvantagem nela. Você deve usar essa característica antes de saber o resultado da jogada de ataque.",
        },
      ],
    },
    {
      name: "Andarilho do Horizonte",
      source: "XGtE",
      description:
        "Guarda o mundo contra ameaças de outros planos, vigiando portais e se arriscando pelos Planos Internos e Externos para perseguir seus inimigos; aliado de dragões benevolentes, fadas e elementais que preservam a ordem dos planos.",
      spells: {
        "3": ["Proteção Contra o Bem e Mal"],
        "5": ["Passo Nebuloso"],
        "9": ["Velocidade"],
        "13": ["Banimento"],
        "17": ["Círculo de Teletransporte"],
      },
      features: [
        {
          name: "Magia do Andarilho do Horizonte",
          level: 3,
          description:
            "A partir do 3° nível, você aprende magias adicionais quando alcança certos níveis nesta classe, conforme mostrado na tabela de Magias do Andarilho do Horizonte: 3° nível, proteção contra o bem e mal; 5° nível, passo nebuloso; 9° nível, velocidade; 13° nível, banimento; 17° nível, círculo de teletransporte. Cada magia conta como uma magia de patrulheiro para você, mas não conta no número de magias de patrulheiro que você conhece.",
        },
        {
          name: "Detectar Portais",
          level: 3,
          description:
            "No 3° nível, você ganha a habilidade de detectar magicamente a presença de um portal planar. Com uma ação, você detecta a distância e a direção do portal planar mais próximo a até 1,5 quilômetro de você.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso curto ou longo.\nVeja a seção \"Viagem Planar\" no capítulo 2 do Guia do Mestre para exemplos de portais planares.",
          resource: { max: 1, recharge: "short" },
        },
        {
          name: "Guerreiro Planar",
          level: 3,
          description:
            "No 3° nível, você aprende a canalizar a energia do multiverso para aumentar seus ataques.\nCom uma ação bônus, escolha uma criatura que você possa ver a até 9 metros de você. Na próxima vez que você atingir essa criatura neste turno com um ataque com arma, todo o dano causado pelo ataque se torna dano de energia, e a criatura sofre 1d8 de dano de energia extra do ataque. Quando você alcança o 11° nível nesta classe, o dano extra aumenta para 2d8.",
        },
        {
          name: "Passo Etéreo",
          level: 7,
          description:
            "No 7° nível, você aprende a atravessar o Plano Etéreo. Com uma ação bônus, você pode conjurar a magia forma etérea com essa característica, sem gastar um espaço de magia, mas a magia termina no final do turno atual.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
        {
          name: "Ataque Distante",
          level: 11,
          description:
            "No 11° nível, você ganha a habilidade de passar entre os planos em um piscar de olhos. Quando você realiza a ação de Ataque, pode se teletransportar até 3 metros antes de cada ataque para um espaço desocupado que possa ver.\nSe você atacar pelo menos duas criaturas diferentes com essa ação, pode fazer um ataque adicional contra uma terceira criatura.",
        },
        {
          name: "Defesa Espectral",
          level: 15,
          description:
            "No 15° nível, sua capacidade de se mover entre os planos permite que você deslize pelas bordas dos planos para diminuir o dano sofrido em batalha. Quando você sofrer dano de um ataque, pode usar sua reação para ganhar resistência a todo o dano desse ataque neste turno.",
        },
      ],
    },
    {
      name: "Exterminador de Monstros",
      source: "XGtE",
      description:
        "Dedica-se a caçar criaturas da noite e praticantes de magia sombria — vampiros, dragões, fadas malignas, demônios — usando técnicas sobrenaturais para desenterrar e derrotar inimigos poderosos e místicos.",
      spells: {
        "3": ["Proteção Contra o Bem e Mal"],
        "5": ["Zona da Verdade"],
        "9": ["Círculo Mágico"],
        "13": ["Banimento"],
        "17": ["Imobilizar Monstro"],
      },
      features: [
        {
          name: "Magia do Exterminador de Monstros",
          level: 3,
          description:
            "A partir do 3° nível, você aprende magias adicionais quando alcança certos níveis nesta classe, conforme mostrado na tabela de Magias do Exterminador de Monstros: 3° nível, proteção contra o bem e mal; 5° nível, zona da verdade; 9° nível, círculo mágico; 13° nível, banimento; 17° nível, imobilizar monstro. Cada magia conta como uma magia de patrulheiro para você, mas não conta no número de magias de patrulheiro que você conhece.",
        },
        {
          name: "Sentido do Caçador",
          level: 3,
          description:
            "No 3° nível, você ganha a habilidade de avaliar uma criatura e discernir magicamente a melhor maneira de feri-la. Com uma ação, escolha uma criatura que você possa ver a até 18 metros de você. Você descobre imediatamente se a criatura tem imunidades, resistências ou vulnerabilidades a dano e quais são. Se a criatura estiver oculta de magia de adivinhação, você sente que ela não tem imunidades, resistências nem vulnerabilidades a dano.\nVocê pode usar essa característica um número de vezes igual ao seu modificador de Sabedoria (mínimo de uma vez). Você recupera todos os usos gastos quando termina um descanso longo.",
          resource: { max: "wis", recharge: "long" },
        },
        {
          name: "Exterminador de Presas",
          level: 3,
          description:
            "A partir do 3° nível, você pode concentrar sua ira em um inimigo, aumentando o dano que causa a ele. Com uma ação bônus, você escolhe uma criatura que possa ver a até 18 metros de você como alvo dessa característica. A primeira vez em cada turno que você atingir esse alvo com um ataque com arma, causa 1d6 de dano extra da arma.\nEsse benefício dura até você terminar um descanso curto ou longo. O efeito termina antes se você designar uma criatura diferente.",
        },
        {
          name: "Defesa Sobrenatural",
          level: 7,
          description:
            "No 7° nível, você ganha resiliência adicional contra os ataques da sua presa à sua mente e ao seu corpo. Sempre que o alvo do seu Exterminador de Presas forçá-lo a fazer um teste de resistência, e sempre que você fizer um teste de habilidade para escapar de uma agarrada desse alvo, adicione 1d6 à sua rolagem.",
        },
        {
          name: "Nêmesis do Conjurador",
          level: 11,
          description:
            "No 11° nível, você ganha a habilidade de frustrar a magia de outra pessoa. Quando você vir uma criatura conjurando uma magia ou se teletransportando a até 18 metros de você, pode usar sua reação para tentar fazê-la fracassar. A criatura deve ser bem-sucedida em um teste de resistência de Sabedoria contra a CD das suas magias, ou a magia ou o teletransporte dela falha e é desperdiçado.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
        {
          name: "Contra-Ataque do Exterminador",
          level: 15,
          description:
            "No 15° nível, você ganha a habilidade de contra-atacar quando sua presa tenta sabotá-lo. Se o alvo do seu Exterminador de Presas forçá-lo a fazer um teste de resistência, você pode usar sua reação para fazer um ataque com arma contra a presa. Você faz esse ataque imediatamente antes de fazer o teste de resistência. Se o seu ataque atingir, o seu teste é automaticamente bem-sucedido, além dos efeitos normais do ataque.",
        },
      ],
    },
    {
      name: "Andarilho Feérico",
      source: "TCoE",
      description:
        "Cercado por um misticismo feérico — dádiva de uma arquifada, de uma fruta encantada ou de um córrego mágico —, representa tanto o reino mortal quanto Faéria: seu riso alegra os oprimidos e seu poder marcial aterroriza os inimigos.",
      spells: {
        "3": ["Enfeitiçar Pessoa"],
        "5": ["Passo Nebuloso"],
        "9": ["Dissipar Magia"],
        "11": ["Invocar Feérico"],
        "13": ["Porta Dimensional"],
        "17": ["Despistar"],
      },
      features: [
        {
          name: "Golpes Aterrorizantes",
          level: 3,
          description:
            "No 3° nível, você pode ampliar os golpes das suas armas com uma magia assustadora, vinda das profundezas melancólicas de Faéria. Quando você acerta uma criatura com um ataque com arma, pode causar 1d4 de dano psíquico extra ao alvo, que só pode sofrer esse dano extra uma vez por turno.\nO dano extra aumenta para 1d6 quando você alcança o 11° nível nesta classe.",
        },
        {
          name: "Magia do Andarilho Feérico",
          level: 3,
          description:
            "No 3° nível, você aprende uma magia adicional ao alcançar certos níveis nesta classe, conforme mostrado na tabela de Magias do Andarilho Feérico: 3° nível, enfeitiçar pessoa; 5° nível, passo nebuloso; 9° nível, dissipar magia; 13° nível, porta dimensional; 17° nível, despistar. Essas magias contam como magias de patrulheiro para você, mas não contam no número de magias de patrulheiro que você conhece.\nVocê também possui uma bênção sobrenatural adquirida de um local ou aliado feérico. Escolha sua bênção na tabela Dons de Faéria ou determine-a aleatoriamente (d6): 1, borboletas ilusórias adejam ao seu redor enquanto você realiza um descanso curto ou longo; 2, flores sazonais frescas brotam dos seus cabelos a cada amanhecer; 3, você tem um leve aroma de canela, lavanda, noz-moscada ou outra erva ou tempero reconfortante; 4, sua sombra dança quando ninguém está olhando diretamente para ela; 5, chifres ou antenas nascem na sua cabeça; 6, sua pele e cabelo mudam de cor para combinar com o clima a cada amanhecer.",
        },
        {
          name: "Glamour Sobrenatural",
          level: 3,
          description:
            "No 3° nível, suas qualidades feéricas lhe dão um charme sobrenatural. Sempre que você realizar um teste de Carisma, ganha um bônus igual ao seu modificador de Sabedoria (mínimo de +1).\nAlém disso, você ganha proficiência em uma das seguintes perícias, à sua escolha: Atuação, Enganação ou Persuasão.",
        },
        {
          name: "Distorcer Engodo",
          level: 7,
          description:
            "No 7° nível, a magia feérica protege sua mente. Você tem vantagem em testes de resistência contra ser amedrontado ou enfeitiçado.\nAlém disso, sempre que você ou uma criatura que você possa ver a até 36 metros de você for bem-sucedida em um teste de resistência contra ser amedrontada ou enfeitiçada, você pode usar sua reação para forçar uma criatura diferente que possa ver dentro dessa mesma distância a fazer um teste de resistência de Sabedoria contra a CD das suas magias. Se falhar, o alvo fica amedrontado ou enfeitiçado por você (à sua escolha) por 1 minuto. O alvo pode repetir o teste de resistência no final de cada turno dele, encerrando o efeito em caso de sucesso.",
        },
        {
          name: "Reforço Feérico",
          level: 11,
          description:
            "No 11° nível, as cortes reais de Faéria o abençoaram com o auxílio de seres feéricos: você conhece a magia invocar feérico (invocar fada, do capítulo 3 do Caldeirão de Tasha). Ela não conta no número de magias de patrulheiro que você conhece, e você pode conjurá-la sem componente material. Você também pode conjurá-la uma vez sem gastar um espaço de magia, e recupera a capacidade de fazer isso quando termina um descanso longo.\nSempre que começar a conjurar essa magia, você pode modificá-la para que não exija concentração. Se fizer isso, a duração da magia passa a ser de 1 minuto nessa conjuração.",
          resource: { name: "Reforço Feérico (Invocar Feérico grátis)", max: 1, recharge: "long" },
        },
        {
          name: "Andarilho da Névoa",
          level: 15,
          description:
            "No 15° nível, você pode saltar para dentro e para fora de Faéria para se mover em um piscar de olhos: você pode conjurar passo nebuloso sem gastar um espaço de magia. Você pode fazer isso um número de vezes igual ao seu modificador de Sabedoria (mínimo de uma vez) e recupera todos os usos gastos quando termina um descanso longo.\nAlém disso, sempre que conjurar passo nebuloso, você pode levar consigo uma criatura voluntária que possa ver a até 1,5 metro de você. Essa criatura se teletransporta para um espaço desocupado, à sua escolha, a até 1,5 metro do seu espaço de destino.",
          resource: { max: "wis", recharge: "long" },
        },
      ],
    },
    {
      name: "Portador do Enxame",
      source: "TCoE",
      description:
        "Sentindo uma conexão profunda com o ambiente, vincula-se a um enxame de espíritos da natureza que se torna uma força poderosa em batalha e uma companhia constante — sejam insetos, pássaros ou pixies brincalhonas.",
      spells: {
        "3": ["Fogo das Fadas", "Mãos Mágicas"],
        "5": ["Teia"],
        "9": ["Forma Gasosa"],
        "13": ["Olho Arcano"],
        "17": ["Praga de Insetos"],
      },
      features: [
        {
          name: "Enxame Reunido",
          level: 3,
          description:
            "No 3° nível, um enxame de espíritos da natureza intangíveis se vinculou a você e pode ajudá-lo em batalha. Até que você morra, o enxame permanece no seu espaço, rastejando sobre você ou voando e adejando ao seu redor dentro do seu espaço. Você determina a aparência dele rolando na tabela Aparência do Enxame (d4): 1, enxame de insetos; 2, criaturinhas em miniatura; 3, pássaros esvoaçantes; 4, pixies brincalhonas.\nUma vez por turno, você pode fazer com que o enxame o auxilie em combate de uma das seguintes maneiras, imediatamente após você acertar uma criatura com um ataque:\n• O alvo do ataque sofre 1d6 de dano perfurante do enxame.\n• O alvo do ataque deve ser bem-sucedido em um teste de resistência de Força contra a CD das suas magias ou será movido pelo enxame até 4,5 metros horizontalmente em uma direção à sua escolha.\n• Você é movido pelo enxame 1,5 metro horizontalmente em uma direção à sua escolha.",
        },
        {
          name: "Magia do Portador do Enxame",
          level: 3,
          description:
            "No 3° nível, você aprende o truque mãos mágicas, caso ainda não o conheça. Quando você o conjura, a mão toma a forma do seu enxame de espíritos da natureza. Você também aprende uma magia adicional de 1° nível ou superior ao alcançar certos níveis nesta classe, conforme mostrado na tabela de Magias do Portador do Enxame: 3° nível, fogo das fadas; 5° nível, teia; 9° nível, forma gasosa; 13° nível, olho arcano; 17° nível, praga de insetos. Essas magias contam como magias de patrulheiro para você, mas não contam no número de magias de patrulheiro que você conhece.",
        },
        {
          name: "Maré Ondulante",
          level: 7,
          description:
            "No 7° nível, você pode condensar parte do seu enxame em uma massa focalizada que o levanta. Com uma ação bônus, você adquire deslocamento de voo de 3 metros e pode pairar. Esse efeito dura 1 minuto ou até você ficar incapacitado.\nVocê pode usar essa característica um número de vezes igual ao seu bônus de proficiência e recupera todos os usos gastos quando termina um descanso longo.",
          resource: { max: "prof", recharge: "long" },
        },
        {
          name: "Enxame Poderoso",
          level: 11,
          description:
            "No 11° nível, seu Enxame Reunido torna-se mais forte das seguintes formas:\n• O dano do Enxame Reunido aumenta para 1d8.\n• Se uma criatura falhar no teste de resistência para não ser movida pelo Enxame Reunido, você também pode fazer com que o enxame derrube a criatura (condição caído).\n• Quando você for movido pelo Enxame Reunido, ele lhe fornece meia cobertura até o início do seu próximo turno.",
        },
        {
          name: "Dispersão do Enxame",
          level: 15,
          description:
            "No 15° nível, você pode se desincorporar dentro do seu enxame, evitando o perigo. Quando você sofrer dano, pode usar sua reação para conceder a si mesmo resistência a esse dano. Você desaparece dentro do seu enxame e então se teletransporta para um espaço desocupado que possa ver a até 9 metros de você, onde reaparece com o enxame.\nVocê pode usar essa característica um número de vezes igual ao seu bônus de proficiência e recupera todos os usos gastos quando termina um descanso longo.",
          resource: { max: "prof", recharge: "long" },
        },
      ],
    },
  ],
};
