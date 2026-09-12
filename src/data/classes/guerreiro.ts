import type { ClassDef } from "@/lib/types";

/**
 * Guerreiro — progressão completa (níveis 1–20) e todos os Arquétipos Marciais
 * do Livro do Jogador, do Guia de Xanathar e do Caldeirão de Tasha (PT-BR).
 */
export const GUERREIRO: ClassDef = {
  name: "Guerreiro",
  source: "PHB",
  subclassLabel: "Arquétipo Marcial",
  subclassLevel: 3,
  features: [
    {
      name: "Estilo de Luta",
      level: 1,
      description:
        "Você adota um estilo de combate particular que será sua especialidade. Escolha uma das opções a seguir. Você não pode escolher o mesmo Estilo de Luta mais de uma vez, mesmo se puder escolher de novo.\n" +
        "Arquearia. Você ganha +2 de bônus nas jogadas de ataque realizadas com uma arma de ataque à distância.\n" +
        "Combate com Armas Grandes. Quando você rolar um 1 ou um 2 num dado de dano de um ataque com arma corpo-a-corpo que você esteja empunhando com duas mãos, você pode rolar o dado novamente e usar a nova rolagem, mesmo que resulte em 1 ou 2. A arma deve ter a propriedade duas mãos ou versátil para ganhar esse benefício.\n" +
        "Combate com Duas Armas. Quando você estiver engajado em uma luta com duas armas, você pode adicionar o seu modificador de habilidade de dano na jogada de dano de seu segundo ataque.\n" +
        "Defesa. Enquanto estiver usando armadura, você ganha +1 de bônus em sua CA.\n" +
        "Duelismo. Quando você empunhar uma arma de ataque corpo-a-corpo em uma mão e nenhuma outra arma, você ganha +2 de bônus nas jogadas de dano com essa arma.\n" +
        "Proteção. Quando uma criatura que você possa ver atacar um alvo diferente de você que esteja a até 1,5 metro de você, você pode usar sua reação para impor desvantagem na jogada de ataque da criatura. Você deve estar empunhando um escudo.\n" +
        "Luta às Cegas (Caldeirão de Tasha). Você tem percepção às cegas com um alcance de 3 metros. Dentro desse alcance, você pode efetivamente ver qualquer coisa que não esteja sob cobertura total, mesmo se você estiver cego ou na escuridão. Além disso, você pode ver uma criatura invisível nessa área, a menos que a criatura se esconda de você com sucesso.\n" +
        "Interceptador (Caldeirão de Tasha). Quando uma criatura que você possa ver acerta um alvo que não seja você, a até 1,5 metro de distância de você, com um ataque, você pode usar sua reação para reduzir o dano recebido por esse alvo em 1d10 + seu bônus de proficiência (até um mínimo de 0 de dano). Você deve estar empunhando um escudo ou uma arma simples ou marcial para usar essa reação.\n" +
        "Técnica Superior (Caldeirão de Tasha). Você aprende uma manobra à sua escolha dentre aquelas disponíveis para o arquétipo Mestre de Batalha. Se uma manobra que você utilizar exigir que o alvo realize um teste de resistência para resistir ao efeito dela, a CD será igual a 8 + seu bônus de proficiência + seu modificador de Força ou Destreza (à sua escolha). Você ganha um dado de superioridade, que é um d6 (esse dado é adicionado a quaisquer dados de superioridade que você tenha de outra fonte). Esse dado é usado para abastecer suas manobras. Um dado de superioridade é gasto quando você o utiliza. Você recupera os dados gastos quando termina um descanso curto ou longo.\n" +
        "Arremesso de Armas (Caldeirão de Tasha). Você pode sacar uma arma que possua a propriedade arremesso como parte do ataque que fizer com ela. Adicionalmente, quando você acerta um ataque à distância usando uma arma de arremesso, você ganha +2 de bônus na jogada de dano.\n" +
        "Ataque Desarmado (Caldeirão de Tasha). Seus ataques desarmados podem causar dano contundente igual a 1d6 + seu modificador de Força em caso de acerto. Se você não estiver empunhando nenhuma arma ou escudo ao realizar a jogada de ataque, esse d6 se transforma em um d8. No começo de cada um de seus turnos, você pode causar 1d4 de dano contundente a uma criatura agarrada por você.",
    },
    {
      name: "Retomar o Fôlego",
      level: 1,
      description:
        "Você possui uma reserva de estamina e pode usá-la para proteger a si mesmo contra danos. No seu turno, você pode usar uma ação bônus para recuperar pontos de vida igual a 1d10 + seu nível de guerreiro.\n" +
        "Uma vez que você use essa característica, você precisa terminar um descanso curto ou longo para usá-la de novo.",
      resource: { max: 1, recharge: "short" },
    },
    {
      name: "Surto de Ação (um uso)",
      level: 2,
      description:
        "A partir do 2º nível, você pode forçar o seu limite para além do normal por um momento. Durante o seu turno, você pode realizar uma ação adicional juntamente com sua ação e possível ação bônus.\n" +
        "Uma vez que você use essa característica, você precisa terminar um descanso curto ou longo para usá-la de novo. A partir do 17º nível, você pode usá-la duas vezes antes do descanso, porém somente uma vez por turno.",
      resource: { name: "Surto de Ação", max: 1, recharge: "short", byLevel: { "2": 1, "17": 2 } },
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 4,
      description:
        "Quando você atinge o 4º nível e novamente no 6º, 8º, 12º, 14º, 16º e 19º nível, você pode aumentar um valor de habilidade, à sua escolha, em 2 ou você pode aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
      asi: true,
    },
    {
      name: "Versatilidade Marcial (opcional, Tasha)",
      optional: true,
      level: 4,
      description:
        "Regra opcional do Caldeirão de Tasha (decida com o Mestre se ela se aplica). Sempre que você alcança um nível nessa classe que forneça a característica Incremento no Valor de Habilidade, você pode fazer uma das coisas a seguir, conforme você muda o foco do seu treino marcial:\n" +
        "• Substituir um Estilo de Luta que você conhece por outro da lista disponível para guerreiros.\n" +
        "• Se você sabe qualquer manobra do arquétipo Mestre de Batalha, você pode substituir uma manobra que conheça por outra disponível.",
    },
    {
      name: "Ataque Extra",
      level: 5,
      description:
        "A partir do 5º nível, você pode atacar duas vezes, ao invés de uma, quando usar a ação de Ataque durante seu turno.\n" +
        "O número de ataques aumenta para três quando você alcançar o 11º nível de guerreiro e para quatro quando alcançar o 20º nível de guerreiro.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 6,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
      asi: true,
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 8,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
      asi: true,
    },
    {
      name: "Indomável (um uso)",
      level: 9,
      description:
        "A partir do 9º nível, você pode jogar de novo um teste de resistência que falhou. Se o fizer, você deve usar o novo valor e não pode usar essa característica de novo antes de terminar um descanso longo.\n" +
        "Você pode usar esta característica duas vezes entre descansos longos quando chegar no 13º nível e três vezes entre descansos longos quando chegar no 17º nível.",
      resource: { name: "Indomável", max: 1, recharge: "long", byLevel: { "9": 1, "13": 2, "17": 3 } },
    },
    {
      name: "Ataque Extra (2)",
      level: 11,
      description:
        "A partir do 11º nível, você pode atacar três vezes, ao invés de duas, quando usar a ação de Ataque durante seu turno.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 12,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
      asi: true,
    },
    {
      name: "Indomável (dois usos)",
      level: 13,
      description:
        "A partir do 13º nível, você pode usar Indomável duas vezes entre descansos longos: jogar de novo um teste de resistência que falhou, usando obrigatoriamente o novo valor.",
      resource: { name: "Indomável", max: 2, recharge: "long", byLevel: { "9": 1, "13": 2, "17": 3 } },
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 14,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
      asi: true,
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 16,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
      asi: true,
    },
    {
      name: "Surto de Ação (dois usos)",
      level: 17,
      description:
        "A partir do 17º nível, você pode usar Surto de Ação duas vezes antes de terminar um descanso curto ou longo, porém somente uma vez por turno.",
      resource: { name: "Surto de Ação", max: 2, recharge: "short", byLevel: { "2": 1, "17": 2 } },
    },
    {
      name: "Indomável (três usos)",
      level: 17,
      description:
        "A partir do 17º nível, você pode usar Indomável três vezes entre descansos longos: jogar de novo um teste de resistência que falhou, usando obrigatoriamente o novo valor.",
      resource: { name: "Indomável", max: 3, recharge: "long", byLevel: { "9": 1, "13": 2, "17": 3 } },
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 19,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
      asi: true,
    },
    {
      name: "Ataque Extra (3)",
      level: 20,
      description:
        "A partir do 20º nível, você pode atacar quatro vezes, ao invés de três, quando usar a ação de Ataque durante seu turno.",
    },
  ],
  subclasses: [
    // ------------------------------------------------------------------
    // PHB
    // ------------------------------------------------------------------
    {
      name: "Campeão",
      source: "PHB",
      description:
        "O arquétipo Campeão foca no desenvolvimento da pura força física acompanhada por uma perfeição mortal. Aqueles que trilham esse caminho combinam rigorosos treinamentos com excelência física para desferir golpes devastadores.",
      features: [
        {
          name: "Crítico Aprimorado",
          level: 3,
          description:
            "A partir do 3º nível, seus ataques com armas adquirem uma margem de acerto crítico de 19 a 20 nas jogadas de ataque.",
        },
        {
          name: "Atletismo Extraordinário",
          level: 7,
          description:
            "A partir do 7º nível, você adiciona metade de seu bônus de proficiência (arredondado para cima) em qualquer teste de Força, Destreza ou Constituição que já não aplique seu bônus de proficiência.\n" +
            "Além disso, quando você fizer um salto longo com corrida, a distância em metros que poderá saltar aumenta em 0,3 vezes o seu modificador de Força.",
        },
        {
          name: "Estilo de Luta Adicional",
          level: 10,
          description:
            "No 10º nível, você pode escolher um segundo Estilo de Luta da sua característica de classe.",
        },
        {
          name: "Crítico Superior",
          level: 15,
          description:
            "A partir do 15º nível, seus ataques com armas adquirem uma margem de acerto crítico de 18 a 20 nas jogadas de ataque.",
        },
        {
          name: "Sobrevivente",
          level: 18,
          description:
            "No 18º nível, você alcança o topo da resiliência em batalha. No começo de cada um de seus turnos, você recupera uma quantidade de pontos de vida igual a 5 + seu modificador de Constituição se não estiver com mais que metade de seus pontos de vida. Você não recebe esse benefício se estiver com 0 pontos de vida.",
        },
      ],
    },
    {
      name: "Mestre de Batalha",
      source: "PHB",
      description:
        "Aqueles que emulam o arquétipo de Mestre de Batalha empregam técnicas marciais passadas de geração em geração. Para um Mestre de Batalha, o combate é um campo acadêmico, e aqueles que absorvem suas lições de história, teoria e arte tornam-se guerreiros de grande perícia e conhecimento.",
      features: [
        {
          name: "Superioridade em Combate",
          level: 3,
          description:
            "Quando você escolhe esse arquétipo, no 3º nível, você aprende manobras que são abastecidas com dados especiais chamados dados de superioridade.\n" +
            "Manobras. Você aprende três manobras, à sua escolha, detalhadas abaixo. Muitas manobras aprimoram um ataque de várias formas. Você só pode usar uma manobra por ataque. Você aprende duas manobras adicionais, à sua escolha, no 7º, 10º e 15º nível. A cada vez que você aprende uma nova manobra, você pode substituir uma manobra conhecida por uma diferente.\n" +
            "Dados de Superioridade. Você tem quatro dados de superioridade, que são d8s. Um dado de superioridade é gasto quando você o usa. Você recupera todos os dados de superioridade gastos quando terminar um descanso curto ou longo. Você adquire outro dado de superioridade no 7º nível e mais um no 15º nível.\n" +
            "Teste de Resistência. Algumas das suas manobras exigem que o alvo realize um teste de resistência contra o efeito da manobra. CD para suas manobras = 8 + seu bônus de proficiência + seu modificador de Força ou Destreza (à sua escolha).\n" +
            "MANOBRAS (Livro do Jogador)\n" +
            "Aparar. Quando outra criatura causar dano a você com um ataque corpo-a-corpo, você pode usar sua reação e gastar um dado de superioridade para reduzir o dano pelo número rolado no dado de superioridade + seu modificador de Destreza.\n" +
            "Ataque Ameaçador. Quando você atingir uma criatura com um ataque com arma, você pode gastar um dado de superioridade para tentar amedrontar o alvo. Você adiciona seu dado de superioridade à jogada de dano do ataque e o alvo deve realizar um teste de resistência de Sabedoria. Se falhar, ele ficará amedrontado por você até o final do seu próximo turno.\n" +
            "Ataque de Encontrão. Quando você atingir uma criatura com um ataque com arma, você pode gastar um dado de superioridade para tentar empurrar o alvo para trás. Você adiciona seu dado de superioridade à jogada de dano do ataque e, se o alvo for Grande ou menor, ele deve realizar um teste de resistência de Força. Se falhar, você empurra o alvo para até 4,5 metros de você.\n" +
            "Ataque de Finta. Você pode gastar um dado de superioridade e usar uma ação bônus, no seu turno, para fintar, escolhendo uma criatura a 1,5 metro de você como alvo. Você tem vantagem na sua próxima jogada de ataque contra essa criatura, nesse turno. Se o ataque atingir, você adiciona seu dado de superioridade ao dano do ataque.\n" +
            "Ataque de Manobra. Quando você atingir uma criatura com um ataque com arma, você pode gastar um dado de superioridade para tentar manobrar um de seus companheiros para uma posição mais vantajosa. Você adiciona seu dado de superioridade à jogada de dano do ataque e escolhe uma criatura amigável que possa ver ou ouvir você. Aquela criatura pode usar sua reação para se mover até metade do seu deslocamento, sem provocar ataques de oportunidade do alvo do seu ataque.\n" +
            "Ataque de Precisão. Quando você realizar uma jogada de ataque com arma contra uma criatura, você pode gastar um dado de superioridade para adicioná-lo à jogada. Você pode usar essa manobra antes ou depois de realizar a jogada de ataque, mas deve usá-la antes de qualquer efeito do ataque ser aplicado.\n" +
            "Ataque Desarmante. Quando você atingir uma criatura com um ataque com arma, você pode gastar um dado de superioridade para tentar desarmar o alvo, forçando-o a derrubar um item, à sua escolha, que ele esteja empunhando. Você adiciona o dado de superioridade à jogada de dano do ataque e o alvo deve realizar um teste de resistência de Força. Se fracassar, ele derrubará o objeto escolhido. O objeto cai aos pés dele.\n" +
            "Ataque Estendido. Quando você atingir uma criatura com um ataque corpo-a-corpo com arma, você pode gastar um dado de superioridade para aumentar o alcance do seu ataque em 1,5 metro. Se você atingir, você adiciona o seu dado de superioridade ao dano causado pelo ataque.\n" +
            "Ataque Provocante. Quando você atingir uma criatura com um ataque com arma, você pode gastar um dado de superioridade para tentar incitar o alvo a atacar você. Você adiciona seu dado de superioridade à jogada de dano do ataque e o alvo deve realizar um teste de resistência de Sabedoria. Se falhar, o alvo terá desvantagem em todas as jogadas de ataque contra alvos diferentes de você, até o fim do seu próximo turno.\n" +
            "Ataque Trespassante. Quando você atingir uma criatura com um ataque corpo-a-corpo com arma, você pode gastar um dado de superioridade para tentar causar dano a outra criatura com o mesmo ataque. Escolha uma criatura a 1,5 metro do alvo original e que esteja no seu alcance. Se a jogada de ataque original atingiria a segunda criatura, ela sofre dano igual ao número rolado no dado de superioridade. O dano é do mesmo tipo que o causado pelo ataque original.\n" +
            "Contra-Atacar. Quando uma criatura atacar você com um ataque corpo-a-corpo e errar, você pode usar sua reação e gastar um dado de superioridade para realizar um ataque corpo-a-corpo com arma contra essa criatura. Se você atingir, você adiciona seu dado de superioridade à jogada de dano do ataque.\n" +
            "Derrubar. Quando você atingir uma criatura com um ataque com arma, você pode gastar um dado de superioridade para tentar derrubar o alvo no chão. Você adiciona seu dado de superioridade à jogada de dano do ataque e, se o alvo for Grande ou menor, ele deve realizar um teste de resistência de Força. Se falhar, o alvo ficará caído no chão.\n" +
            "Golpe Distrativo. Quando você atingir uma criatura com um ataque com arma, você pode gastar um dado de superioridade para tentar distrair a criatura, abrindo uma brecha para um de seus aliados. Você adiciona seu dado de superioridade à jogada de dano do ataque. A próxima jogada de ataque realizada contra o alvo por uma criatura diferente de você tem vantagem, se o ataque for realizado antes do começo do seu próximo turno.\n" +
            "Golpe do Comandante. Quando você realiza a ação de Ataque, no seu turno, você pode desistir de um dos seus ataques e usar uma ação bônus para direcionar o ataque de um dos seus companheiros. Quando você faz isso, escolha uma criatura amigável que possa ver ou ouvir você e gaste um dado de superioridade. Essa criatura pode, imediatamente, usar sua reação para realizar um ataque com arma, adicionando seu dado de superioridade à jogada de dano do ataque.\n" +
            "Inspirar. No seu turno, você pode usar uma ação bônus e gastar um dado de superioridade para reforçar a determinação dos seus companheiros. Quando o fizer, escolha uma criatura amigável que possa ver ou ouvir você. Essa criatura ganha uma quantidade de pontos de vida temporários igual à sua rolagem de dado de superioridade + seu modificador de Carisma.\n" +
            "Passo Evasivo. Quando você se mover, você pode gastar um dado de superioridade, rolar o dado e adicionar o número rolado à sua CA até você terminar seu deslocamento.\n" +
            "MANOBRAS (Caldeirão de Tasha)\n" +
            "Emboscada. Quando você realizar um teste de Destreza (Furtividade) ou uma jogada de iniciativa, você pode gastar um dado de superioridade e adicionar o valor do dado à rolagem, desde que você não esteja incapacitado.\n" +
            "Engodo. Quando você estiver a até 1,5 metro de uma criatura em seu turno, você pode gastar um dado de superioridade e trocar de lugar com essa criatura, desde que você gaste pelo menos 1,5 metro de movimento e a criatura seja voluntária e não esteja incapacitada. Esse movimento não provoca ataques de oportunidade. Jogue o dado de superioridade. Até o começo do seu próximo turno, você ou a outra criatura (à sua escolha) ganha um bônus na CA igual ao número rolado.\n" +
            "Enganchar. Quando uma criatura que você possa ver se move dentro do alcance de uma arma corpo-a-corpo que você está empunhando, você pode usar sua reação para gastar um dado de superioridade e realizar um ataque contra essa criatura, usando essa arma. Se o ataque acertar, adicione o dado de superioridade à jogada de dano da arma.\n" +
            "Presença Dominante. Quando você realizar um teste de Carisma (Intimidação, Atuação ou Persuasão), você pode gastar um dado de superioridade e adicionar o resultado dele a esse teste.\n" +
            "Golpe Imobilizador. Imediatamente após acertar uma criatura com um ataque corpo-a-corpo em seu turno, você pode gastar um dado de superioridade e então tentar agarrar o alvo como uma ação bônus (veja as regras de Agarrar no Livro do Jogador). Adicione o dado de superioridade ao seu teste de Força (Atletismo).\n" +
            "Lançamento Rápido. Como uma ação bônus, você pode gastar um dado de superioridade e realizar um ataque com uma arma que tenha a propriedade arremesso. Você pode sacar a arma como parte desse ataque. Se você acertar, adicione o dado de superioridade à jogada de dano da arma.\n" +
            "Avaliação Tática. Quando você fizer um teste de Inteligência (Investigação), Inteligência (História) ou Sabedoria (Intuição), você pode gastar um dado de superioridade e adicioná-lo a esse teste.",
          resource: { name: "Dados de Superioridade", max: 4, recharge: "short", byLevel: { "3": 4, "7": 5, "15": 6 } },
        },
        {
          name: "Estudioso da Guerra",
          level: 3,
          description:
            "No 3º nível, você ganha proficiência com um tipo de ferramenta de artesão, à sua escolha.",
        },
        {
          name: "Conheça seu Inimigo",
          level: 7,
          description:
            "A partir do 7º nível, se você gastar, pelo menos, 1 minuto observando ou interagindo com outra criatura fora de combate, você pode aprender certas informações sobre as capacidades dela comparadas às suas. O Mestre conta a você se a criatura é igual, superior ou inferior a você a respeito de duas das seguintes características, à sua escolha:\n" +
            "• Valor de Força\n• Valor de Destreza\n• Valor de Constituição\n• Classe de Armadura\n• Pontos de Vida atuais\n• Nível total de classe (se possuir)\n• Níveis da classe guerreiro (se possuir)",
        },
        {
          name: "Superioridade em Combate Aprimorada",
          level: 10,
          description:
            "No 10º nível, seus dados de superioridade se tornam d10s. No 18º nível, eles se tornam d12s.",
        },
        {
          name: "Implacável",
          level: 15,
          description:
            "No 15º nível, quando você rolar iniciativa e não tiver nenhum dado de superioridade restante, você recupera um dado de superioridade.",
        },
        {
          name: "Superioridade em Combate Aprimorada (d12)",
          level: 18,
          description: "No 18º nível, seus dados de superioridade se tornam d12s.",
        },
      ],
    },
    {
      name: "Cavaleiro Arcano",
      source: "PHB",
      description:
        "O arquétipo de Cavaleiro Arcano combina a maestria marcial comum a todos os guerreiros com um cuidadoso estudo de magia, focado nas escolas de abjuração e evocação. Esses cavaleiros aprendem um pequeno número de magias de mago, guardando-as na memória ao invés de mantê-las em um grimório.",
      features: [
        {
          name: "Conjuração",
          level: 3,
          description:
            "Quando você alcançar o 3º nível, você amplia o seu poderio marcial com a habilidade de conjurar magias. Veja o capítulo 10 para as regras gerais de conjuração e o capítulo 11 para a lista de magias de mago.\n" +
            "Truques. Você aprende dois truques, à sua escolha, da lista de magias de mago. Você aprende um truque de mago adicional, à sua escolha, no 10º nível.\n" +
            "Espaços de Magia. A tabela Conjuração de Cavaleiro Arcano mostra quantos espaços de magia de 1º nível e superiores você possui disponíveis para conjuração. Para conjurar uma dessas magias, você deve gastar um espaço de magia do nível da magia ou superior. Você recobra todos os espaços de magia gastos quando completa um descanso longo.\n" +
            "Magias Conhecidas de 1º Nível e Superiores. Você conhece três magias de 1º nível, à sua escolha, das quais duas devem ser escolhidas dentre as magias de abjuração e evocação da lista de magias de mago. A coluna Magias Conhecidas mostra quando você aprende mais magias de mago, de 1º nível ou superior. Cada uma dessas magias deve ser uma magia de abjuração ou evocação, à sua escolha, de um nível a que você tenha acesso, como mostrado na tabela. Por exemplo, quando você alcança o 7º nível da classe, você pode aprender uma nova magia de 1º ou 2º nível. As magias que você aprende no 8º, 14º e 20º nível podem vir de qualquer escola de magia.\n" +
            "Além disso, quando você adquire um nível nessa classe, você pode escolher uma magia de mago que você conheça e substituí-la por outra magia da lista de magias de mago, que também deve ser de um nível ao qual você tenha espaços de magia e deve ser uma magia de abjuração ou evocação, a não ser que você esteja substituindo a magia que ganhou no 3º, 8º, 14º ou 20º nível, que pode ser de qualquer escola de magia.\n" +
            "Habilidade de Conjuração. Sua habilidade de conjuração é Inteligência para suas magias de mago. CD para suas magias = 8 + bônus de proficiência + seu modificador de Inteligência. Modificador de ataque de magia = seu bônus de proficiência + seu modificador de Inteligência.\n" +
            "CONJURAÇÃO DE CAVALEIRO ARCANO (nível de guerreiro: truques conhecidos / magias conhecidas / espaços de 1º, 2º, 3º, 4º nível)\n" +
            "3º: 2 / 3 / 2, –, –, –\n4º: 2 / 4 / 3, –, –, –\n5º: 2 / 4 / 3, –, –, –\n6º: 2 / 4 / 3, –, –, –\n7º: 2 / 5 / 4, 2, –, –\n8º: 2 / 6 / 4, 2, –, –\n9º: 2 / 6 / 4, 2, –, –\n10º: 3 / 7 / 4, 3, –, –\n11º: 3 / 8 / 4, 3, –, –\n12º: 3 / 8 / 4, 3, –, –\n13º: 3 / 9 / 4, 3, 2, –\n14º: 3 / 10 / 4, 3, 2, –\n15º: 3 / 10 / 4, 3, 2, –\n16º: 3 / 11 / 4, 3, 3, –\n17º: 3 / 11 / 4, 3, 3, –\n18º: 3 / 11 / 4, 3, 3, –\n19º: 3 / 12 / 4, 3, 3, 1\n20º: 3 / 13 / 4, 3, 3, 1",
        },
        {
          name: "Vínculo com Arma",
          level: 3,
          description:
            "No 3º nível, você aprende um ritual que cria um vínculo mágico entre você e uma arma. Você realiza esse ritual no curso de 1 hora, que pode ser realizada durante um descanso curto. A arma deve estar ao seu alcance no decorrer do ritual; ao concluí-lo, você toca a arma e forja o elo.\n" +
            "Uma vez que você tenha vinculado uma arma a você, você não pode ser desarmado dessa arma, a menos que esteja incapacitado. Se ela estiver no mesmo plano de existência, você pode invocar essa arma com uma ação bônus, no seu turno, fazendo-a se teletransportar instantaneamente para a sua mão.\n" +
            "Você pode ter até duas armas vinculadas, mas só pode invocar uma por vez com sua ação bônus. Se você quiser criar um elo com uma terceira arma, você deve quebrar o vínculo com uma das outras duas.",
        },
        {
          name: "Magia de Guerra",
          level: 7,
          description:
            "A partir do 7º nível, quando você usar sua ação para conjurar um truque, você pode realizar um ataque com arma com uma ação bônus.",
        },
        {
          name: "Golpe Místico",
          level: 10,
          description:
            "No 10º nível, você aprende como fazer com que os seus golpes com arma penetrem a resistência de uma criatura às suas magias. Quando você atingir uma criatura com um ataque com arma, aquela criatura terá desvantagem no próximo teste de resistência que ela fizer contra uma magia que você conjurar antes do final do seu próximo turno.",
        },
        {
          name: "Investida Arcana",
          level: 15,
          description:
            "No 15º nível, você ganha a capacidade de se teletransportar até 9 metros para um espaço desocupado que você possa ver, quando você usar seu Surto de Ação. Você pode se teletransportar antes ou depois da ação adicional.",
        },
        {
          name: "Magia de Guerra Aprimorada",
          level: 18,
          description:
            "A partir do 18º nível, quando você usar sua ação para conjurar uma magia, você pode realizar um ataque com arma com uma ação bônus.",
        },
      ],
    },
    // ------------------------------------------------------------------
    // XGtE
    // ------------------------------------------------------------------
    {
      name: "Arqueiro Arcano",
      source: "XGtE",
      description:
        "Um Arqueiro Arcano estuda um método élfico único de arquearia que mistura magia em ataques para produzir efeitos sobrenaturais. Eles vigiam as fronteiras dos domínios élficos, usando flechas infundidas com magia para derrotar monstros e invasores.",
      features: [
        {
          name: "Tradição do Arqueiro Arcano",
          level: 3,
          description:
            "No 3º nível, você aprende a teoria mágica e alguns dos segredos da natureza típicos dos praticantes desta tradição marcial élfica. Você escolhe ganhar proficiência na perícia Arcanismo ou Natureza, e escolhe aprender o truque prestidigitação ou druidismo.",
        },
        {
          name: "Disparo Arcano",
          level: 3,
          description:
            "No 3º nível, você aprende a liberar efeitos mágicos especiais com alguns de seus tiros. Quando você ganha essa característica, aprende duas opções de Disparo Arcano à sua escolha (ver abaixo).\n" +
            "Uma vez por turno, quando você dispara uma flecha mágica de um arco curto ou arco longo como parte da ação de Ataque, pode aplicar uma das suas opções de Disparo Arcano a essa flecha. Você decide usar a opção quando a flecha acerta uma criatura, a menos que a opção não envolva uma jogada de ataque. Você tem dois usos dessa característica e recupera todos os usos quando terminar um descanso curto ou longo.\n" +
            "Você ganha uma opção adicional de Disparo Arcano à sua escolha quando alcança certos níveis nesta classe: 7º, 10º, 15º e 18º. Cada opção também melhora quando você se torna um guerreiro de 18º nível.\n" +
            "Se uma opção exigir um teste de resistência, a CD do Disparo Arcano é igual a 8 + seu bônus de proficiência + seu modificador de Inteligência.\n" +
            "OPÇÕES DE DISPARO ARCANO\n" +
            "Flecha da Explosão. Você infunde sua flecha com energia extraída da escola de evocação. Imediatamente após a flecha atingir a criatura, o alvo e todas as outras criaturas a até 3 metros dele recebem 2d6 de dano de energia cada. O dano de energia aumenta para 4d6 no 18º nível.\n" +
            "Flecha da Sedução. Sua magia de encantamento faz com que a flecha temporariamente seduza o alvo. A criatura atingida recebe 2d6 de dano psíquico adicional, e você escolhe um dos seus aliados a até 9 metros do alvo. O alvo deve ter sucesso em um teste de resistência de Sabedoria ou ficará enfeitiçado pelo aliado escolhido até o início do seu próximo turno. O efeito acaba se o aliado escolhido atacar o alvo, causar dano a ele ou forçá-lo a fazer um teste de resistência. O dano psíquico aumenta para 4d6 no 18º nível.\n" +
            "Flecha do Agarrar. Quando esta flecha atinge o alvo, a magia de conjuração cria um emaranhado de espinheiros venenosos que o envolve. A criatura atingida recebe 2d6 de dano de veneno adicional, seu deslocamento é reduzido em 3 metros e, na primeira vez que se mover 30 centímetros ou mais em um turno sem se teletransportar, recebe 2d6 de dano cortante. O alvo ou qualquer criatura que possa alcançá-lo pode usar sua ação para remover os espinheiros com um teste de Força (Atletismo) contra a CD do Disparo Arcano. Caso contrário, os espinheiros duram 1 minuto ou até você usar esta opção novamente. O dano de veneno e o dano cortante aumentam para 4d6 no 18º nível.\n" +
            "Flecha do Banimento. Você usa magia de abjuração para tentar banir temporariamente o alvo para um local inofensivo na Agrestia das Fadas. A criatura atingida deve ter sucesso em um teste de resistência de Carisma ou será banida. Enquanto banido, o deslocamento do alvo é 0 e ele está incapacitado. No final do próximo turno da criatura, o alvo reaparece no espaço que ocupava ou no espaço desocupado mais próximo, caso aquele esteja ocupado. A partir do 18º nível, o alvo também recebe 2d6 de dano de energia quando a flecha o atinge.\n" +
            "Flecha do Enfraquecimento. Você tece magia de necromancia em sua flecha. A criatura atingida recebe 2d6 de dano necrótico adicional. O alvo deve ter sucesso em um teste de resistência de Constituição ou o dano causado pelos ataques com arma dele é reduzido à metade até o início do seu próximo turno. O dano necrótico aumenta para 4d6 no 18º nível.\n" +
            "Flecha Perfurante. Você usa magia de transmutação para dar à sua flecha uma qualidade etérea. Quando você usa essa opção, não faz uma jogada de ataque. Em vez disso, a flecha dispara em uma linha de 30 centímetros de largura e 9 metros de comprimento, antes de desaparecer. A flecha passa inofensivamente pelos objetos, ignorando cobertura. Cada criatura nessa linha deve fazer um teste de resistência de Destreza. Em uma falha, a criatura recebe o dano como se tivesse sido atingida pela flecha mais 1d6 de dano perfurante. Em um sucesso, recebe metade do dano. O dano perfurante aumenta para 2d6 no 18º nível.\n" +
            "Flecha Perseguidora. Usando magia de adivinhação, você concede à sua flecha a capacidade de perseguir um alvo. Quando você usa esta opção, não faz uma jogada de ataque. Em vez disso, escolha uma criatura que você viu no último minuto. A flecha voa em direção àquela criatura, contornando cantos e curvas se necessário e ignorando cobertura de três quartos e meia cobertura. Se o alvo estiver dentro do alcance da arma e houver um caminho grande o suficiente para a flecha chegar até ele, o alvo deve fazer um teste de resistência de Destreza. Caso contrário, a flecha desaparece depois de viajar o máximo que puder. Em uma falha, o alvo recebe o dano como se fosse atingido pela flecha mais 1d6 de dano de energia, e você descobre a posição atual do alvo. Em um sucesso, o alvo recebe metade do dano e você não descobre sua localização. O dano de energia aumenta para 2d6 no 18º nível.\n" +
            "Flecha Sombria. Você entrelaça magia de ilusão em sua flecha, ofuscando a visão do inimigo com sombras. A criatura atingida recebe 2d6 de dano psíquico adicional e deve ter sucesso em um teste de resistência de Sabedoria ou ficará incapaz de ver qualquer coisa a mais de 1,5 metro de distância até o início do seu próximo turno. O dano psíquico aumenta para 4d6 no 18º nível.",
          resource: { name: "Disparo Arcano", max: 2, recharge: "short" },
        },
        {
          name: "Flecha Mágica",
          level: 7,
          description:
            "No 7º nível, você ganha a capacidade de infundir flechas com magia. Sempre que disparar uma flecha não mágica de um arco curto ou arco longo, pode torná-la mágica para o propósito de superar resistência e imunidade a ataques e danos não mágicos. A magia desaparece da flecha imediatamente após ela acertar ou errar o alvo.",
        },
        {
          name: "Tiro Curvado",
          level: 7,
          description:
            "No 7º nível, você aprende a direcionar uma flecha errante para um novo alvo. Quando realiza um ataque com uma flecha mágica e erra, pode usar uma ação bônus para rolar novamente a jogada de ataque contra um alvo diferente a até 18 metros do alvo original.",
        },
        {
          name: "Disparo Arcano (4 opções)",
          level: 10,
          description: "No 10º nível, você aprende mais uma opção de Disparo Arcano, totalizando quatro.",
        },
        {
          name: "Disparo Sempre Pronto",
          level: 15,
          description:
            "A partir do 15º nível, seu tiro mágico está disponível sempre que a batalha começar. Se você rolar iniciativa e não tiver usos de Disparo Arcano restantes, recupera um uso.\nVocê também aprende mais uma opção de Disparo Arcano, totalizando cinco.",
        },
        {
          name: "Disparo Arcano (6 opções, disparos aperfeiçoados)",
          level: 18,
          description:
            "No 18º nível, você aprende mais uma opção de Disparo Arcano, totalizando seis, e todas as opções de Disparo Arcano melhoram conforme descrito em cada uma (em geral, o dano adicional dobra: 2d6 passa a 4d6 e 1d6 passa a 2d6; a Flecha do Banimento passa a causar 2d6 de dano de energia).",
        },
      ],
    },
    {
      name: "Cavaleiro",
      source: "XGtE",
      description:
        "O arquétipo de Cavaleiro destaca-se no combate montado. Geralmente nascido entre a nobreza e criado na corte, um cavaleiro pode liderar a cavalaria do reino em uma investida ou trocar réplicas espirituosas em um jantar real, e sabe proteger aqueles sob sua responsabilidade.",
      features: [
        {
          name: "Bônus de Proficiência",
          level: 3,
          description:
            "Quando você escolhe esse arquétipo no 3º nível, você ganha proficiência em uma das seguintes perícias, à sua escolha: Adestrar Animais, História, Intuição, Atuação ou Persuasão. Alternativamente, você aprende um idioma à sua escolha.",
        },
        {
          name: "Nascido para a Sela",
          level: 3,
          description:
            "A partir do 3º nível, seu domínio como cavaleiro torna-se evidente. Você tem vantagem em testes de resistência para evitar cair da sua montaria. Se você cair de sua montaria e não descer mais do que 3 metros, poderá cair em pé se não estiver incapacitado.\n" +
            "Finalmente, montar ou desmontar uma criatura custa a você apenas 1,5 metro de deslocamento, em vez de metade do seu deslocamento.",
        },
        {
          name: "Marca Inabalável",
          level: 3,
          description:
            "A partir do 3º nível, você pode ameaçar seus inimigos, frustrar seus ataques e puni-los por causar dano aos outros. Quando atingir uma criatura com um ataque corpo-a-corpo com arma, pode marcar a criatura até o final do seu próximo turno. Este efeito acaba prematuramente se você estiver incapacitado ou morrer, ou se outra pessoa marcar a criatura.\n" +
            "Enquanto estiver a até 1,5 metro de você, uma criatura marcada por você tem desvantagem em qualquer jogada de ataque que não o tenha como alvo.\n" +
            "Além disso, se uma criatura marcada por você causar dano a alguém além de você, você pode fazer um ataque especial corpo-a-corpo com arma contra a criatura marcada como uma ação bônus no seu próximo turno. Você tem vantagem nesse ataque e, se ele atingir, o ataque causa dano extra ao alvo igual à metade do seu nível de guerreiro.\n" +
            "Independentemente do número de criaturas que você marcar, só poderá fazer esse ataque especial um número de vezes igual ao seu modificador de Força (mínimo de uma vez) e recupera os usos gastos quando terminar um descanso longo.",
          resource: { name: "Marca Inabalável (ataque especial)", max: "str", recharge: "long" },
        },
        {
          name: "Manobra de Proteção",
          level: 7,
          description:
            "No 7º nível, você aprende a afastar os golpes direcionados a você, à sua montaria e a outras criaturas próximas. Se você ou uma criatura que possa ver a até 1,5 metro de você for atingida por um ataque, poderá usar sua reação para rolar 1d8 caso esteja empunhando uma arma corpo-a-corpo ou um escudo. Role o dado e adicione o número rolado à CA do alvo contra esse ataque. Se o ataque ainda assim atingir, o alvo tem resistência contra o dano do ataque.\n" +
            "Você pode usar essa característica um número de vezes igual ao seu modificador de Constituição (mínimo de uma vez), e recupera todos os usos gastos quando terminar um descanso longo.",
          resource: { max: "con", recharge: "long" },
        },
        {
          name: "Mantenha a Formação",
          level: 10,
          description:
            "No 10º nível, você se torna um mestre em travar seus inimigos. Criaturas provocam um ataque de oportunidade de você quando se movem 1,5 metro ou mais enquanto estão dentro do seu alcance, e se você atingir uma criatura com um ataque de oportunidade, o deslocamento do alvo é reduzido a 0 até o final do turno atual.",
        },
        {
          name: "Investida Feroz",
          level: 15,
          description:
            "A partir do 15º nível, você pode derrubar seus inimigos mais facilmente, esteja montado ou não. Caso se desloque pelo menos 3 metros em linha reta antes de atacar uma criatura e a acerte com o ataque, esse alvo deve ser bem-sucedido em um teste de resistência de Força (CD 8 + seu bônus de proficiência + seu modificador de Força) ou ficará caído. Você pode usar essa característica apenas uma vez em cada um de seus turnos.",
        },
        {
          name: "Defensor Vigilante",
          level: 18,
          description:
            "A partir do 18º nível, você responde ao perigo com extraordinária agilidade. Em combate, você obtém uma reação especial que pode realizar uma vez no turno de cada criatura, exceto no seu próprio turno. Você pode usar essa reação especial somente para fazer um ataque de oportunidade, e não pode usá-la no mesmo turno em que realizou sua reação normal.",
        },
      ],
    },
    {
      name: "Samurai",
      source: "XGtE",
      description:
        "O Samurai é um lutador que se baseia em um implacável espírito de luta para vencer inimigos. A determinação do samurai é quase indestrutível, e os inimigos em seu caminho têm duas escolhas: render-se ou morrer lutando.",
      features: [
        {
          name: "Bônus de Proficiência",
          level: 3,
          description:
            "Quando você escolhe esse arquétipo no 3º nível, você ganha proficiência em uma das seguintes perícias, à sua escolha: História, Intuição, Atuação ou Persuasão. Alternativamente, você aprende um idioma à sua escolha.",
        },
        {
          name: "Espírito Guerreiro (5 PV temp.)",
          level: 3,
          description:
            "A partir do 3º nível, seu ímpeto em batalha pode resguardá-lo e ajudá-lo a atingir o êxito. Como uma ação bônus em seu turno, você pode se conceder vantagem nas jogadas de ataque com arma até o final do turno atual. Quando fizer isso, também ganha 5 pontos de vida temporários. O número de pontos de vida temporários aumenta quando você atinge determinados níveis nesta classe: 10 no 10º nível e 15 no 15º nível.\n" +
            "Você pode usar essa característica três vezes, e recupera todos os usos gastos quando terminar um descanso longo.",
          resource: { name: "Espírito Guerreiro", max: 3, recharge: "long" },
        },
        {
          name: "Cortesão Elegante",
          level: 7,
          description:
            "A partir do 7º nível, sua disciplina e atenção a detalhes permitem que você se destaque em situações sociais. Sempre que fizer um teste de Carisma (Persuasão), você ganha um bônus no teste igual ao seu modificador de Sabedoria.\n" +
            "Seu autocontrole também faz você ganhar proficiência em testes de resistência de Sabedoria. Caso já possua essa proficiência, em vez disso você ganha proficiência em testes de resistência de Inteligência ou de Carisma (à sua escolha).",
        },
        {
          name: "Espírito Incansável",
          level: 10,
          description:
            "A partir do 10º nível, quando você rolar iniciativa e não tiver nenhum uso de Espírito Guerreiro restante, recupera um uso.\nOs pontos de vida temporários do Espírito Guerreiro passam a ser 10.",
        },
        {
          name: "Golpe Rápido",
          level: 15,
          description:
            "A partir do 15º nível, você aprende a trocar a precisão dos seus ataques por um golpe veloz. Se realizar a ação de Ataque no seu turno e tiver vantagem em uma jogada de ataque contra um dos alvos, pode renunciar à vantagem dessa jogada para fazer um ataque adicional com arma contra esse alvo, como parte da mesma ação. Você pode fazer isso somente uma vez por turno.\nOs pontos de vida temporários do Espírito Guerreiro passam a ser 15.",
        },
        {
          name: "Força Diante da Morte",
          level: 18,
          description:
            "A partir do 18º nível, seu espírito guerreiro pode atrasar o abraço da morte. Se você receber um dano que o reduza a 0 pontos de vida sem matá-lo de imediato, poderá usar sua reação para atrasar a queda na inconsciência, e pode imediatamente realizar um turno extra, interrompendo o turno atual. Enquanto tiver 0 pontos de vida durante o turno extra, sofrer dano provoca uma falha em teste de resistência contra a morte, como de costume, e três falhas ainda podem matá-lo. Quando o turno extra se encerrar, você cai inconsciente se ainda estiver com 0 pontos de vida.\n" +
            "Depois que utilizar essa característica, não poderá utilizá-la novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
    // ------------------------------------------------------------------
    // TCoE
    // ------------------------------------------------------------------
    {
      name: "Guerreiro Psiônico",
      source: "TCoE",
      description:
        "Desperto para o poder mental dentro de si, um Guerreiro Psiônico aumenta seu poder físico com golpes de arma infundidos por energia psíquica, chicotadas telecinéticas e barreiras de força mental. Muitos githyanki e alguns alto elfos disciplinados treinam para se tornar tais guerreiros.",
      features: [
        {
          name: "Poder Psíquico",
          level: 3,
          description:
            "Você abriga uma fonte de energia psíquica dentro de você. Essa energia é representada pelos seus dados de Energia Psíquica, que são d6. Você possui um número de dados de Energia Psíquica igual ao dobro do seu bônus de proficiência, e eles alimentam vários dos seus poderes psiônicos, detalhados abaixo.\n" +
            "Alguns de seus poderes gastam os dados de Energia Psíquica que utilizam, conforme especificado na descrição, e você não pode usar um poder que exija gastar um dado se não tiver nenhum disponível. Você recupera todos os dados de Energia Psíquica gastos quando termina um descanso longo. Adicionalmente, como uma ação bônus, você pode recuperar um dado de Energia Psíquica gasto, mas só poderá fazer isso novamente após um descanso curto ou longo. Quando você alcança certos níveis nesta classe, o valor do dado de Energia Psíquica aumenta: no 5º nível (d8), no 11º nível (d10) e no 17º nível (d12).\n" +
            "Campo Protetor. Quando você ou uma criatura que você possa ver a até 9 metros de você receber dano, você pode usar sua reação para gastar um dado de Energia Psíquica, rolá-lo e reduzir o dano sofrido pelo resultado + seu modificador de Inteligência (mínimo de 1 de redução), conforme você cria um escudo momentâneo de energia telecinética.\n" +
            "Golpe Psiônico. Você pode impulsionar suas armas com energia psíquica. Uma vez por turno, imediatamente após acertar um alvo a até 9 metros de você com um ataque e causar dano nele com uma arma, você pode gastar um dado de Energia Psíquica, rolá-lo e causar ao alvo dano de energia adicional igual ao resultado do dado + seu modificador de Inteligência.\n" +
            "Movimento Telecinético. Você pode mover um objeto ou uma criatura com sua mente. Como uma ação, você foca em um objeto solto de tamanho Grande ou menor, ou em uma criatura voluntária que não seja você. Se você puder ver o alvo e ele estiver a até 9 metros de você, pode movê-lo por até 9 metros para um espaço desocupado que você possa ver. Alternativamente, se for um objeto Miúdo, você pode movê-lo para a sua mão ou a partir dela. Em qualquer caso, você pode mover o alvo horizontalmente, verticalmente ou ambos. Uma vez que realize essa ação, você não pode repeti-la até terminar um descanso curto ou longo, a menos que gaste um dado de Energia Psíquica para usá-la de novo.",
          resource: {
            name: "Energia Psíquica",
            max: 4,
            recharge: "long",
            byLevel: { "3": 4, "5": 6, "9": 8, "13": 10, "17": 12 },
          },
        },
        {
          name: "Adepto Telecinético",
          level: 7,
          description:
            "Você dominou novas formas de usar suas habilidades telecinéticas, descritas abaixo.\n" +
            "Salto Telecinético. Como uma ação bônus, você pode impulsionar seu corpo com sua mente. Você ganha um deslocamento de voo igual ao dobro do seu deslocamento terrestre até o final do turno atual. Uma vez que realize essa ação bônus, você não pode repeti-la até terminar um descanso curto ou longo, a menos que gaste um dado de Energia Psíquica para usá-la de novo.\n" +
            "Empurrão Telecinético. Quando você causa dano a um alvo com seu Golpe Psiônico, você pode forçar o alvo a fazer um teste de resistência de Força com CD igual a 8 + seu bônus de proficiência + seu modificador de Inteligência. Se falhar, você pode derrubar o alvo ou movê-lo por até 3 metros horizontalmente em qualquer direção.",
        },
        {
          name: "Mente Protegida",
          level: 10,
          description:
            "A energia psíquica fluindo através de você reforçou sua mente. Você tem resistência a dano psíquico. Além disso, se você iniciar seu turno amedrontado ou enfeitiçado, pode gastar um dado de Energia Psíquica e encerrar todo efeito sobre você que cause qualquer dessas condições.",
        },
        {
          name: "Baluarte Telecinético",
          level: 15,
          description:
            "Você pode proteger a si mesmo e aos outros com energia telecinética. Como uma ação bônus, você pode escolher criaturas que possa ver a até 9 metros de você (incluindo você), até uma quantidade de criaturas igual ao seu modificador de Inteligência (mínimo de uma criatura). Cada criatura escolhida é protegida por meia cobertura por 1 minuto ou até você ficar incapacitado. Uma vez que realize essa ação bônus, você não pode repeti-la até terminar um descanso curto ou longo, a menos que gaste um dado de Energia Psíquica para usá-la de novo.",
        },
        {
          name: "Mestre Telecinético",
          level: 18,
          description:
            "Sua habilidade de mover criaturas e objetos com a mente é inigualável. Você pode conjurar a magia telecinesia, sem a necessidade de componentes, e sua habilidade de conjuração para essa magia é Inteligência. Em cada um dos seus turnos enquanto você se concentra na magia, incluindo o turno em que a conjura, você pode realizar um ataque com arma como uma ação bônus. Uma vez que conjure a magia através dessa característica, você não poderá fazê-lo novamente até terminar um descanso longo, a menos que gaste um dado de Energia Psíquica para usá-la de novo.",
        },
      ],
    },
    {
      name: "Cavaleiro Rúnico",
      source: "TCoE",
      description:
        "Cavaleiros Rúnicos aprimoram sua proeza marcial utilizando o poder sobrenatural das runas, uma prática ancestral que se originou com os gigantes. Você estudou o ofício dos gigantes e aprendeu a aplicar runas para fortalecer seu equipamento e a si mesmo.",
      features: [
        {
          name: "Proficiências Bônus",
          level: 3,
          description:
            "Você ganha proficiência com ferramentas de artesão (à sua escolha) e aprende a falar, ler e escrever Gigante.",
        },
        {
          name: "Entalhador de Runas",
          level: 3,
          description:
            "Você pode usar runas mágicas para aprimorar seu equipamento. Ao ganhar esta característica, você aprende a inscrever duas runas à sua escolha dentre as descritas abaixo, e cada vez que ganhar um nível nesta classe pode substituir uma runa que conheça por outra desta característica. Quando alcança certos níveis nesta classe, você aprende runas adicionais: 2 runas no 3º nível, 3 no 7º, 4 no 10º e 5 no 15º.\n" +
            "Sempre que terminar um descanso longo, você pode tocar uma quantidade de objetos igual ao número de runas que conhece e gravar uma runa diferente em cada um deles. Para isso, o objeto deve ser uma arma, armadura, escudo, joia ou alguma outra coisa que você possa vestir ou segurar em uma mão. Sua runa permanece no objeto até você terminar outro descanso longo, e um objeto pode conter apenas uma runa por vez.\n" +
            "Se uma runa tiver requisito de nível, você deve estar pelo menos nesse nível de guerreiro para aprendê-la. Se uma runa exigir um teste de resistência, a CD da runa é 8 + seu bônus de proficiência + seu modificador de Constituição. Ao invocar uma runa, você não pode invocá-la de novo até terminar um descanso curto ou longo.\n" +
            "Runa da Nuvem. Enquanto estiver usando ou carregando um item com esta runa, você tem vantagem nos testes de Destreza (Prestidigitação) e Carisma (Enganação). Adicionalmente, quando você ou uma criatura a até 9 metros de você for acertada por um ataque, você pode usar sua reação para invocar a runa e escolher outra criatura a até 9 metros de você, que não seja o atacante. A criatura escolhida se torna o alvo do ataque, usando a mesma jogada. Esta magia pode transferir o efeito do ataque independentemente do alcance original dele.\n" +
            "Runa do Fogo. Enquanto estiver usando ou carregando um item com esta runa, seu bônus de proficiência é dobrado em qualquer teste de habilidade que utilize ferramentas. Além disso, ao acertar um ataque com arma em uma criatura, você pode invocar a runa para conjurar grilhões incandescentes: o alvo recebe 2d6 de dano de fogo e deve ser bem-sucedido em um teste de resistência de Força ou ficará impedido por 1 minuto. Enquanto estiver impedido pelas correntes, o alvo sofre 2d6 de dano de fogo no começo de cada um dos turnos dele. O alvo pode repetir o teste no final de cada um dos turnos dele, e os grilhões desaparecem se ele for bem-sucedido.\n" +
            "Runa do Gelo. Enquanto estiver usando ou carregando um item com esta runa, você tem vantagem nos testes de Sabedoria (Adestrar Animais) e Carisma (Intimidação). Além disso, você pode invocar a runa como uma ação bônus para aumentar sua resistência: por 10 minutos, você ganha +2 de bônus em todos os testes de habilidade e testes de resistência que utilizem Força ou Constituição.\n" +
            "Runa da Pedra. Enquanto estiver usando ou carregando um item com esta runa, você tem vantagem nos testes de Sabedoria (Intuição) e adquire visão no escuro com alcance de 36 metros. Adicionalmente, quando uma criatura que você possa ver termina o turno dela a até 9 metros de você, você pode usar sua reação para invocar a runa e forçar a criatura a fazer um teste de resistência de Sabedoria. Se falhar, a criatura fica enfeitiçada por você por 1 minuto. Enquanto estiver enfeitiçada desta forma, a criatura tem deslocamento 0 e fica incapacitada, caindo em um estupor cheio de sonhos. A criatura repete o teste ao final de cada um dos turnos dela, encerrando o efeito em caso de sucesso.\n" +
            "Runa da Colina (7º nível ou superior). Enquanto estiver usando ou carregando um item com esta runa, você tem vantagem em testes de resistência contra ficar envenenado e resistência a dano de veneno. Além disso, você pode invocar a runa como uma ação bônus, ganhando resistência a dano cortante, perfurante e contundente por 1 minuto.\n" +
            "Runa da Tempestade (7º nível ou superior). Enquanto estiver usando ou carregando um item com esta runa, você tem vantagem nos testes de Inteligência (Arcanismo) e não pode ser surpreendido, desde que não esteja incapacitado. Além disso, você pode invocar a runa como uma ação bônus para entrar em um estado profético por 1 minuto ou até ficar incapacitado. Enquanto estiver neste estado, quando você ou outra criatura que possa ver a até 18 metros de você fizer uma jogada de ataque, um teste de resistência ou um teste de habilidade, você pode usar sua reação para conceder vantagem ou desvantagem nessa rolagem.",
        },
        {
          name: "Poderio Gigante",
          level: 3,
          description:
            "Você aprendeu a imbuir a si mesmo com o poder dos gigantes. Como uma ação bônus, você magicamente ganha os seguintes benefícios, que duram por 1 minuto:\n" +
            "• Caso seu tamanho seja menor do que Grande, você se torna Grande, junto com tudo que estiver vestindo. Se não houver espaço para crescer, seu tamanho não muda.\n" +
            "• Você tem vantagem em testes de Força e testes de resistência de Força.\n" +
            "• Uma vez por turno, um dos seus ataques com arma ou ataques desarmados pode causar 1d6 de dano adicional ao alvo em um acerto.\n" +
            "Você pode usar esta característica um número de vezes igual ao seu bônus de proficiência, e recupera todos os usos gastos ao terminar um descanso longo.",
          resource: { max: "prof", recharge: "long" },
        },
        {
          name: "Escudo Rúnico",
          level: 7,
          description:
            "Você aprende a invocar sua magia rúnica para proteger seus aliados. Quando outra criatura que você possa ver a até 18 metros de você for atingida por um ataque, você pode usar sua reação para forçar o atacante a rolar novamente o d20 e usar o novo resultado.\n" +
            "Você pode usar esta característica um número de vezes igual ao seu bônus de proficiência, e recupera todos os usos gastos ao terminar um descanso longo.\nVocê também aprende uma terceira runa.",
          resource: { max: "prof", recharge: "long" },
        },
        {
          name: "Grande Estatura",
          level: 10,
          description:
            "A magia das runas o afetou permanentemente. Ao ganhar esta característica, role 3d4. Você cresce em altura um número de centímetros igual ao resultado × 2,5.\n" +
            "Além disso, o dano extra causado pelo seu Poderio Gigante aumenta para 1d8.\nVocê também aprende uma quarta runa.",
        },
        {
          name: "Mestre das Runas",
          level: 15,
          description:
            "Você agora pode invocar cada runa que conhece duas vezes, em vez de uma, entre descansos, e recupera todos os usos gastos ao terminar um descanso curto ou longo.\nVocê também aprende uma quinta runa.",
        },
        {
          name: "Colosso Rúnico",
          level: 18,
          description:
            "Você aprendeu a amplificar sua transformação rúnica. Como resultado, o dano extra que você causa com o Poderio Gigante aumenta para 1d10.\n" +
            "Adicionalmente, quando utilizar essa característica, seu tamanho pode aumentar para Enorme e, enquanto estiver nesse tamanho, seu alcance é ampliado em 1,5 metro.",
        },
      ],
    },
  ],
  multiclass: {
    prerequisite: "Força 13 ou Destreza 13",
    proficiencies: "Armadura leve, armadura média, escudos, armas simples, armas marciais",
    skills: 0,
  },
};
