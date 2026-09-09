import type { ClassDef } from "@/lib/types";

const ASI_DESC =
  "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.";

export const BARBARO: ClassDef = {
  name: "Bárbaro",
  source: "PHB",
  subclassLabel: "Caminho Primitivo",
  subclassLevel: 3,
  multiclass: {
    prerequisite: "Força 13",
    proficiencies: "Escudos, armas simples, armas marciais",
    skills: 0,
  },
  features: [
    {
      name: "Fúria",
      level: 1,
      description:
        "Em batalha, você luta com uma ferocidade primitiva. No seu turno, você pode entrar em fúria com uma ação bônus.\nEnquanto estiver em fúria, você recebe os seguintes benefícios se não estiver vestindo uma armadura pesada:\n• Você tem vantagem em testes de Força e testes de resistência de Força.\n• Quando você desferir um ataque com arma corpo-a-corpo usando Força, você recebe um bônus nas jogadas de dano que aumenta à medida que você adquire níveis de bárbaro: +2 do 1° ao 8° nível, +3 do 9° ao 15° nível e +4 a partir do 16° nível (coluna Dano de Fúria da tabela O Bárbaro).\n• Você possui resistência contra dano de concussão, cortante e perfurante.\nSe você for capaz de conjurar magias, você não poderá conjurá-las nem se concentrar nelas enquanto estiver em fúria.\nSua fúria dura 1 minuto. Ela termina prematuramente se você cair inconsciente ou se seu turno acabar e você não tiver atacado nenhuma criatura hostil desde seu último turno nem tiver sofrido dano nesse período. Você também pode terminar sua fúria no seu turno com uma ação bônus.\nQuando você tiver usado a quantidade de fúrias mostrada para o seu nível de bárbaro na coluna Fúrias da tabela O Bárbaro (2 no 1° nível, 3 no 3°, 4 no 6°, 5 no 12°, 6 no 17° e ilimitadas no 20°), você precisará terminar um descanso longo antes de poder entrar em fúria novamente.",
      resource: {
        max: 2,
        recharge: "long",
        byLevel: { "1": 2, "3": 3, "6": 4, "12": 5, "17": 6 },
      },
    },
    {
      name: "Defesa sem Armadura",
      level: 1,
      description:
        "Quando você não estiver vestindo qualquer armadura, sua Classe de Armadura será 10 + seu modificador de Destreza + seu modificador de Constituição. Você pode usar um escudo e continuar a receber esse benefício.",
    },
    {
      name: "Ataque Descuidado",
      level: 2,
      description:
        "A partir do 2° nível, você pode desistir de toda preocupação com sua defesa para atacar com um desespero feroz. Quando você fizer o seu primeiro ataque no turno, você pode decidir atacar descuidadamente. Fazer isso lhe concede vantagem nas jogadas de ataque com armas corpo-a-corpo usando Força durante seu turno, porém as jogadas de ataque feitas contra você possuem vantagem até o início do seu próximo turno.",
    },
    {
      name: "Sentido de Perigo",
      level: 2,
      description:
        "No 2° nível, você adquire um sentido sobrenatural de quando as coisas próximas não estão como deveriam, concedendo a você uma chance maior quando estiver evitando perigos.\nVocê possui vantagem em testes de resistência de Destreza contra efeitos que você possa ver, como armadilhas e magias. Para receber esse benefício, você não pode estar cego, surdo ou incapacitado.",
    },
    {
      name: "Caminho Primitivo",
      level: 3,
      description:
        "No 3° nível, você escolhe um caminho que molda a natureza da sua fúria: o Caminho do Furioso ou o Caminho do Guerreiro Totêmico (Livro do Jogador), o Caminho do Guardião Ancestral, o Caminho do Arauto da Tempestade ou o Caminho do Fanático (Guia de Xanathar), ou a Trilha da Besta ou a Trilha da Magia Selvagem (Caldeirão de Tasha). Sua escolha lhe concede características no 3° nível e novamente no 6°, 10° e 14° níveis.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 4,
      asi: true,
      description: ASI_DESC,
    },
    {
      name: "Ataque Extra",
      level: 5,
      description:
        "A partir do 5° nível, você pode atacar duas vezes, ao invés de uma, sempre que você realizar a ação de Ataque no seu turno.",
    },
    {
      name: "Movimento Rápido",
      level: 5,
      description:
        "Começando no 5° nível, seu deslocamento aumenta em 3 metros enquanto você não estiver vestindo uma armadura pesada.",
    },
    {
      name: "Instinto Selvagem",
      level: 7,
      description:
        "No 7° nível, seu instinto está tão apurado que você recebe vantagem nas jogadas de iniciativa.\nAlém disso, se você estiver surpreso no começo de um combate e não estiver incapacitado, você pode agir normalmente no seu primeiro turno, mas apenas se você entrar em fúria antes de realizar qualquer outra coisa nesse turno.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 8,
      asi: true,
      description: ASI_DESC,
    },
    {
      name: "Crítico Brutal (+1 dado)",
      level: 9,
      description:
        "A partir do 9° nível, você pode rolar um dado de dano de arma adicional quando estiver determinando o dano extra de um acerto crítico com uma arma corpo-a-corpo.\nIsso aumenta para dois dados adicionais no 13° nível e três dados adicionais no 17° nível.",
    },
    {
      name: "Fúria Implacável",
      level: 11,
      description:
        "A partir do 11° nível, sua fúria pode manter você lutando independentemente da gravidade dos seus ferimentos. Se você cair a 0 pontos de vida enquanto estiver em fúria e não morrer, você pode realizar um teste de resistência de Constituição CD 10. Se for bem-sucedido, você volta para 1 ponto de vida ao invés disso.\nCada vez que você utilizar essa característica após a primeira, a CD aumenta em 5. Assim que você terminar um descanso curto ou longo, a CD volta para 10.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 12,
      asi: true,
      description: ASI_DESC,
    },
    {
      name: "Crítico Brutal (+2 dados)",
      level: 13,
      description:
        "A partir do 13° nível, você rola dois dados de dano de arma adicionais (em vez de um) quando estiver determinando o dano extra de um acerto crítico com uma arma corpo-a-corpo.",
    },
    {
      name: "Fúria Persistente",
      level: 15,
      description:
        "A partir do 15° nível, sua fúria é tão brutal que ela só termina prematuramente se você cair inconsciente ou se você decidir terminá-la.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 16,
      asi: true,
      description: ASI_DESC,
    },
    {
      name: "Crítico Brutal (+3 dados)",
      level: 17,
      description:
        "A partir do 17° nível, você rola três dados de dano de arma adicionais (em vez de dois) quando estiver determinando o dano extra de um acerto crítico com uma arma corpo-a-corpo.",
    },
    {
      name: "Força Indomável",
      level: 18,
      description:
        "A partir do 18° nível, se o total de um teste de Força seu for menor que o seu valor de Força, você pode usar esse valor no lugar do resultado.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 19,
      asi: true,
      description: ASI_DESC,
    },
    {
      name: "Campeão Primitivo",
      level: 20,
      description:
        "No 20° nível, você incorpora os poderes da natureza. Seus valores de Força e Constituição aumentam em 4. Seu máximo para esses valores agora é 24.\nAlém disso, no 20° nível não há limite para o número de vezes que você pode entrar em fúria (a coluna Fúrias da tabela O Bárbaro passa a ser \"Ilimitado\").",
    },
  ],
  subclasses: [
    {
      name: "Caminho do Furioso",
      source: "PHB",
      description:
        "Para alguns bárbaros, a fúria é um meio para um fim – esse fim é a violência. O Caminho do Furioso é um caminho de fúria livre, entumecido em sangue: você vibra no caos da batalha, despreocupado com sua própria saúde ou bem-estar.",
      features: [
        {
          name: "Frenesi",
          level: 3,
          description:
            "Começando no momento em que você escolhe esse caminho no 3° nível, você pode entrar num frenesi quando estiver em fúria. Se você desejar, pela duração da sua fúria, você pode realizar um único ataque corpo-a-corpo com arma, com uma ação bônus, em cada um dos seus turnos após esse. Quando sua fúria acabar, você sofre um nível de exaustão (como descrito no apêndice A do Livro do Jogador).",
        },
        {
          name: "Fúria Inconsciente",
          level: 6,
          description:
            "A partir do 6° nível, você não pode ser enfeitiçado ou amedrontado enquanto estiver em fúria. Se você estava enfeitiçado ou amedrontado quando entrou em fúria, o efeito é suspenso pela duração da fúria.",
        },
        {
          name: "Presença Intimidante",
          level: 10,
          description:
            "A partir do 10° nível, você pode usar sua ação para amedrontar alguém com sua presença intimidante. Quando o fizer, escolha uma criatura que você possa ver a até 9 metros. Se a criatura puder ver ou ouvir você, ela deve ser bem-sucedida num teste de resistência de Sabedoria (CD igual a 8 + seu bônus de proficiência + seu modificador de Carisma) ou ficará amedrontada por você até o fim do seu próximo turno. Nos turnos seguintes, você pode usar sua ação para estender a duração desse efeito na criatura amedrontada até o fim do seu próximo turno. Esse efeito termina se a criatura terminar seu turno fora da sua linha de visão ou a mais de 18 metros de você.\nSe a criatura for bem-sucedida no teste de resistência, você não poderá usar essa característica nessa criatura novamente por 24 horas.",
        },
        {
          name: "Retaliação",
          level: 14,
          description:
            "A partir do 14° nível, quando você sofrer dano de uma criatura que esteja a até 1,5 metro de você, você pode usar sua reação para realizar um ataque corpo-a-corpo com arma contra essa criatura.",
        },
      ],
    },
    {
      name: "Caminho do Guerreiro Totêmico",
      source: "PHB",
      description:
        "O Caminho do Guerreiro Totêmico é uma jornada espiritual em que o bárbaro aceita um espírito animal como seu guia, protetor e inspiração. Em batalha, seu espírito totêmico preenche você com força sobrenatural, adicionando combustível mágico à sua fúria.",
      features: [
        {
          name: "Conselheiro Espiritual",
          level: 3,
          description:
            "Seu caminho é buscar a sintonia com o mundo natural, concedendo a você uma afinidade com as bestas. A partir do 3° nível, quando você toma esse caminho, você recebe a habilidade de conjurar as magias sentido bestial e falar com animais, mas apenas na forma de rituais, como descrito no capítulo 10 do Livro do Jogador.",
        },
        {
          name: "Totem Espiritual",
          level: 3,
          description:
            "A partir do 3° nível, quando você adota esse caminho, você escolhe um totem espiritual e ganha suas características. Você deve fazer ou adquirir um objeto físico como totem – um amuleto ou adorno similar – que incorpora o pelo ou penas, garras, dente ou ossos do animal totêmico. Se quiser, você também adquire pequenos atributos físicos que o assemelham ao seu totem espiritual (por exemplo, pelos e pele grossa para o urso, ou olhos de brilho amarelado para a águia).\nSeu totem animal deve ser um animal relacionado aos listados aqui, mas pode ser um mais apropriado à sua terra natal (por exemplo, falcão ou abutre ao invés de águia).\nÁguia. Quando estiver em fúria e não estiver vestindo armadura pesada, as outras criaturas têm desvantagem nas jogadas de ataque de oportunidade contra você e você pode usar a ação de Disparada como uma ação bônus no seu turno. O espírito da águia torna você um predador que pode vagar pelo meio da briga com facilidade.\nLobo. Quando estiver em fúria, seus amigos têm vantagem nas jogadas de ataque corpo-a-corpo realizadas contra qualquer criatura a 1,5 metro de você que seja hostil a você. O espírito do lobo transforma você em um líder de caça.\nUrso. Quando estiver em fúria, você adquire resistência a todos os tipos de dano, exceto dano psíquico. O espírito do urso torna você vigoroso o suficiente para permanecer de pé diante de qualquer castigo.",
        },
        {
          name: "Aspecto da Besta",
          level: 6,
          description:
            "No 6° nível, você adquire um benefício místico baseado no totem que você escolheu. Você pode escolher o mesmo animal que selecionou no 3° nível ou um diferente.\nÁguia. Você ganha a visão aguçada de uma águia. Você pode ver a até 1,6 km sem dificuldade, sendo capaz de discernir até os menores detalhes quando estiver olhando para algo a menos de 30 metros de você. Além disso, penumbra não impõe desvantagem nos seus testes de Sabedoria (Percepção).\nLobo. Você ganha a sensibilidade predatória de um lobo. Você pode rastrear outras criaturas quando estiver viajando a passo rápido e pode se mover furtivamente quando estiver viajando a passo normal (veja o capítulo 8 do Livro do Jogador para as regras de passo de viagem).\nUrso. Você ganha a força de um urso. Sua capacidade de carga (incluindo carga máxima e capacidade de erguer) é dobrada e você tem vantagem em testes de Força realizados para empurrar, puxar, erguer ou quebrar objetos.",
        },
        {
          name: "Andarilho Espiritual",
          level: 10,
          description:
            "No 10° nível, você pode conjurar a magia comunhão com a natureza, mas apenas como um ritual. Quando o fizer, uma versão espiritual de um dos animais que você escolheu como Totem Espiritual ou Aspecto da Besta aparece para você para transmitir a informação que você busca.",
        },
        {
          name: "Sintonia Totêmica",
          level: 14,
          description:
            "No 14° nível, você ganha um benefício mágico baseado em um totem animal, à sua escolha. Você pode escolher o mesmo animal que selecionou anteriormente ou um diferente.\nÁguia. Quando estiver em fúria, você adquire um deslocamento de voo igual ao seu deslocamento de caminhada. Esse benefício funciona apenas em pequenas explosões: você cai se terminar seu turno no ar e não tiver nada em que possa se agarrar.\nLobo. Quando estiver em fúria, você pode usar uma ação bônus no seu turno para derrubar uma criatura Grande ou menor no chão quando você atingi-la com um ataque corpo-a-corpo com arma.\nUrso. Quando estiver em fúria, qualquer criatura a até 1,5 metro de você que for hostil a você terá desvantagem nas jogadas de ataque contra outros alvos além de você ou outro personagem com essa característica. Um inimigo é imune a esse efeito se não puder ver ou ouvir você ou caso não possa ser amedrontado.",
        },
      ],
    },
    {
      name: "Caminho do Guardião Ancestral",
      source: "XGtE",
      description:
        "Bárbaros de culturas que reverenciam seus antepassados: ao entrar em fúria, o bárbaro entra em contato com o mundo espiritual e convida os espíritos guardiões dos guerreiros do passado para ajudá-lo a proteger sua tribo e seus aliados.",
      features: [
        {
          name: "Protetor Ancestral",
          level: 3,
          description:
            "Começando quando você escolhe esse caminho no 3° nível, guerreiros espectrais aparecem quando você entra em fúria. Enquanto você estiver em fúria, a primeira criatura que você acertar com um ataque no seu turno torna-se o alvo dos guerreiros, o que dificulta seus ataques. Até o início do seu próximo turno, esse alvo tem desvantagem em qualquer jogada de ataque que não seja contra você e, quando o alvo atingir uma criatura diferente de você com um ataque, essa criatura tem resistência ao dano causado pelo ataque. O efeito sobre o alvo termina mais cedo se sua fúria terminar.",
        },
        {
          name: "Escudo Espiritual (2d6)",
          level: 6,
          description:
            "Começando no 6° nível, os guardiões espirituais que o protegem podem prover uma defesa sobrenatural para aqueles que você defende. Se você estiver em fúria e outra criatura que possa ver a até 9 metros de você sofrer dano, você pode usar sua reação para reduzir esse dano em 2d6.\nQuando você atinge determinados níveis nesta classe, pode reduzir esse dano ainda mais: em 3d6 no 10° nível e em 4d6 no 14° nível.",
        },
        {
          name: "Consultar os Espíritos",
          level: 10,
          description:
            "No 10° nível, você ganha a habilidade de se consultar com seus espíritos ancestrais. Quando o faz, pode conjurar as magias augúrio ou clarividência, sem usar espaços de magia ou componentes materiais. Em vez de criar um sensor esférico, esse uso de clarividência invoca invisivelmente um de seus espíritos ancestrais para o local escolhido. Sabedoria é sua habilidade de conjuração para essas magias.\nDepois de conjurar qualquer das magias dessa forma, você não pode usar essa característica novamente até terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
        {
          name: "Escudo Espiritual (3d6)",
          level: 10,
          description:
            "No 10° nível, a redução de dano do seu Escudo Espiritual aumenta para 3d6.",
        },
        {
          name: "Ancestral Vingativo",
          level: 14,
          description:
            "No 14° nível, seus espíritos ancestrais aumentam de poder o suficiente para retaliar. Quando você usa seu Escudo Espiritual para reduzir o dano de um ataque, o atacante sofre uma quantidade de dano de energia igual ao dano que seu Escudo Espiritual evitou.",
        },
        {
          name: "Escudo Espiritual (4d6)",
          level: 14,
          description:
            "No 14° nível, a redução de dano do seu Escudo Espiritual aumenta para 4d6.",
        },
      ],
    },
    {
      name: "Caminho do Arauto da Tempestade",
      source: "XGtE",
      description:
        "Bárbaros que aprendem a transformar sua fúria interior em um manto de magia primal que os envolve. Quando em fúria, um bárbaro desse caminho toca as forças da natureza para criar poderosos efeitos mágicos de deserto, mar ou tundra.",
      features: [
        {
          name: "Aura da Tempestade",
          level: 3,
          description:
            "Começando no 3° nível, você emana uma aura tempestuosa e mágica enquanto está em fúria. A aura se estende a 3 metros de você em todas as direções, mas não através de cobertura total.\nSua aura tem um efeito que se ativa quando você entra em fúria, e você pode ativar o efeito novamente em cada um dos seus turnos como uma ação bônus. Escolha entre deserto, mar ou tundra. O efeito da aura depende do ambiente escolhido, conforme detalhado abaixo. Você pode alterar sua escolha de ambiente sempre que ganhar um nível nesta classe.\nSe os efeitos da sua aura exigirem um teste de resistência, a CD é igual a 8 + seu bônus de proficiência + seu modificador de Constituição.\nDeserto. Quando este efeito é ativado, todas as outras criaturas em sua aura sofrem 2 de dano de fogo cada. O dano aumenta quando você alcança certos níveis nesta classe: 3 no 5° nível, 4 no 10° nível, 5 no 15° nível e 6 no 20° nível.\nMar. Quando este efeito é ativado, você pode escolher uma outra criatura que possa ver em sua aura. O alvo deve fazer um teste de resistência de Destreza, sofrendo 1d6 de dano elétrico em caso de falha ou metade do dano se for bem-sucedido. O dano aumenta quando você alcança certos níveis nesta classe: 2d6 no 10° nível, 3d6 no 15° nível e 4d6 no 20° nível.\nTundra. Quando este efeito é ativado, cada criatura à sua escolha em sua aura ganha 2 pontos de vida temporários, já que os espíritos gélidos a acostumam ao sofrimento. Os pontos de vida temporários aumentam quando você atinge certos níveis nesta classe: 3 no 5° nível, 4 no 10° nível, 5 no 15° nível e 6 no 20° nível.",
        },
        {
          name: "Alma da Tempestade",
          level: 6,
          description:
            "No 6° nível, a tempestade lhe concede benefícios mesmo quando sua aura não está ativa. Os benefícios são baseados no ambiente que você escolheu para sua Aura da Tempestade.\nDeserto. Você ganha resistência a dano de fogo e não sofre os efeitos do calor extremo, conforme descrito no Guia do Mestre. Além disso, com uma ação, você pode tocar um objeto inflamável que não esteja sendo usado ou transportado por ninguém e incendiá-lo.\nMar. Você ganha resistência a dano elétrico e pode respirar debaixo d'água. Você também ganha um deslocamento de natação de 9 metros.\nTundra. Você ganha resistência a dano de frio e não sofre os efeitos do frio extremo, conforme descrito no Guia do Mestre. Além disso, com uma ação, você pode tocar a água e transformar um cubo de 1,5 metro dela em gelo, que derrete após 1 minuto. Essa ação falha se uma criatura estiver no cubo.",
        },
        {
          name: "Tempestade Protetora",
          level: 10,
          description:
            "No 10° nível, você aprende a usar seu domínio da tempestade para proteger os outros. Cada criatura à sua escolha tem a resistência a dano que você ganhou com a característica Alma da Tempestade enquanto estiver em sua Aura da Tempestade.",
        },
        {
          name: "Tempestade Furiosa",
          level: 14,
          description:
            "No 14° nível, o poder da tempestade que você canaliza cresce mais forte, atacando seus inimigos. O efeito é baseado no ambiente que você escolheu para a Aura da Tempestade.\nDeserto. Imediatamente depois que uma criatura em sua aura acertar um ataque contra você, você pode usar sua reação para forçar essa criatura a fazer um teste de resistência de Destreza. Em caso de falha, a criatura sofre dano de fogo igual à metade do seu nível de bárbaro.\nMar. Quando você atinge uma criatura em sua aura com um ataque, pode usar sua reação para forçar essa criatura a fazer um teste de resistência de Força. Em caso de falha, a criatura é derrubada, como se tivesse sido atingida por uma onda.\nTundra. Sempre que o efeito de sua Aura da Tempestade for ativado, você pode escolher uma criatura que possa ver na aura. Essa criatura deve ser bem-sucedida em um teste de resistência de Força, ou seu deslocamento é reduzido a 0 até o início do seu próximo turno, pois uma geada mágica a encobre.",
        },
      ],
    },
    {
      name: "Caminho do Fanático",
      source: "XGtE",
      description:
        "Algumas divindades inspiram seus seguidores a se lançarem em uma fúria selvagem. Esses bárbaros são guerreiros-fanáticos que canalizam sua fúria em espetaculares demonstrações de poder divino.",
      features: [
        {
          name: "Fúria Divina",
          level: 3,
          description:
            "Começando quando você escolhe esse caminho no 3° nível, você pode canalizar fúria divina em seus ataques com armas. Enquanto estiver em fúria, a primeira criatura que você atingir em cada um dos seus turnos com um ataque com arma sofre dano extra igual a 1d6 + metade do seu nível de bárbaro. O dano extra é necrótico ou radiante; você escolhe o tipo de dano quando adquire essa característica.",
        },
        {
          name: "Guerreiro dos Deuses",
          level: 3,
          description:
            "No 3° nível, sua alma está marcada para uma batalha infinita. Se uma magia, como reviver os mortos, tiver o único intuito de trazê-lo de volta à vida (mas não como um morto-vivo), o conjurador não precisa de componentes materiais para conjurar a magia em você.",
        },
        {
          name: "Foco Fanático",
          level: 6,
          description:
            "A partir do 6° nível, o poder divino que abastece sua fúria pode protegê-lo. Se você falhar em um teste de resistência enquanto estiver em fúria, pode refazê-lo e deve usar o novo resultado. Você pode usar essa característica apenas uma vez por fúria.",
        },
        {
          name: "Presença Zelosa",
          level: 10,
          description:
            "No 10° nível, você aprende a canalizar o poder divino para inspirar o fanatismo nos outros. Com uma ação bônus, você desencadeia um grito de batalha imbuído de energia divina. Até dez outras criaturas à sua escolha a até 18 metros de você que possam ouvi-lo ganham vantagem em jogadas de ataque e testes de resistência até o início do seu próximo turno.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Fúria Além da Morte",
          level: 14,
          description:
            "A partir do 14° nível, o poder divino que alimenta sua fúria permite que você ignore golpes fatais. Enquanto estiver em fúria, ter 0 pontos de vida não o deixa inconsciente. Você ainda deve fazer testes de resistência contra a morte e sofre os efeitos normais de receber dano enquanto estiver com 0 pontos de vida. No entanto, se você morreria por falhar nos testes de resistência contra a morte, você não morre até que sua fúria termine, e só morre então se ainda estiver com 0 pontos de vida.",
        },
      ],
    },
    {
      name: "Trilha da Besta",
      source: "TCoE",
      description:
        "Bárbaros que tiram sua fúria de uma centelha bestial que queima em suas almas. Essa besta irrompe no auge da fúria, transformando fisicamente o bárbaro – seja por possessão de um espírito primitivo, seja por descendência de metamorfos.",
      features: [
        {
          name: "Forma da Besta",
          level: 3,
          description:
            "Quando você entra em fúria, você pode se transformar, revelando o poder bestial que há dentro de você. Até que a fúria se encerre, você manifesta uma arma natural. Ela conta como uma arma simples corpo-a-corpo para você, e você adiciona seu modificador de Força às jogadas de ataque e dano quando ataca com ela, como normalmente. Você escolhe a forma da arma cada vez que entra em fúria:\nMordida. Sua boca se transforma em um focinho bestial ou em grandes mandíbulas (à sua escolha). Ela causa 1d8 de dano perfurante em um acerto. Uma vez por turno, quando você causa dano a uma criatura com essa mordida, você recupera uma quantidade de pontos de vida igual ao seu bônus de proficiência, desde que esteja com metade ou menos dos seus pontos de vida máximos no momento do acerto.\nGarras. Cada uma de suas mãos se transforma em uma pata com garras, que você pode usar como arma caso suas mãos estejam livres. Elas causam 1d6 de dano cortante em um acerto. Uma vez por turno, quando você atacar com suas garras usando a ação de Ataque, você pode realizar um ataque de garra adicional como parte da mesma ação.\nCauda. Cresce em você uma cauda chicoteante e espinhosa, que causa 1d8 de dano perfurante em um acerto e possui a propriedade alcance. Se uma criatura a até 3 metros de você que você possa ver o acertar com uma jogada de ataque, você pode usar sua reação para golpear com sua cauda e rolar um d8, aplicando um bônus à sua CA igual ao valor rolado, fazendo com que o ataque potencialmente o erre.",
        },
        {
          name: "Alma Bestial",
          level: 6,
          description:
            "O poder feral dentro de você aumenta, fazendo com que a arma natural da sua Forma da Besta conte como mágica para o propósito de superar resistências e imunidades a ataques e danos não mágicos.\nVocê também pode alterar sua forma para se adaptar aos seus arredores. Quando você terminar um descanso curto ou longo, escolha um dos seguintes benefícios, que dura até que você termine seu próximo descanso curto ou longo:\n• Você adquire deslocamento de natação igual ao seu deslocamento de caminhada e pode respirar debaixo d'água.\n• Você ganha deslocamento de escalada igual ao seu deslocamento de caminhada e pode escalar superfícies difíceis, incluindo ficar de cabeça para baixo em tetos, sem a necessidade de realizar testes de habilidade.\n• Quando você salta, você pode realizar um teste de Força (Atletismo) e ampliar seu salto por uma quantidade de metros igual a um terço do resultado total. Você pode realizar esse teste especial apenas uma vez por turno.",
        },
        {
          name: "Fúria Contagiosa",
          level: 10,
          description:
            "Quando você acerta uma criatura com suas armas naturais enquanto em fúria, a besta dentro de você pode amaldiçoar seu alvo com uma raiva descontrolada. O alvo deve ser bem-sucedido em um teste de resistência de Sabedoria (CD igual a 8 + seu bônus de proficiência + seu modificador de Constituição) ou sofre um dos seguintes efeitos (à sua escolha):\n• O alvo deve usar sua reação para realizar um ataque corpo-a-corpo contra outra criatura à sua escolha que você possa ver.\n• O alvo sofre 2d12 de dano psíquico.\nVocê pode usar essa característica um número de vezes igual ao seu bônus de proficiência, e recupera todos os usos quando termina um descanso longo.",
          resource: { max: "prof", recharge: "long" },
        },
        {
          name: "Chamado de Caça",
          level: 14,
          description:
            "A besta dentro de você torna-se tão poderosa que você pode espalhar sua ferocidade para os outros e adquirir resiliência através daqueles que se juntarem à sua caçada. Quando você entrar em fúria, você pode escolher um número de outras criaturas voluntárias que possa ver a até 9 metros de você igual ao seu modificador de Constituição (mínimo de uma criatura). Você ganha 5 pontos de vida temporários para cada criatura que aceitar essa característica. Até que a fúria se encerre, cada uma das criaturas escolhidas pode utilizar o seguinte benefício uma vez em cada um dos seus turnos: quando a criatura acertar um alvo com uma jogada de ataque e causar dano a ele, ela pode rolar um d6 e ganhar um bônus no dano igual ao valor rolado.\nVocê pode usar essa característica um número de vezes igual ao seu bônus de proficiência, e recupera todos os usos ao terminar um descanso longo.",
          resource: { max: "prof", recharge: "long" },
        },
      ],
    },
    {
      name: "Trilha da Magia Selvagem",
      source: "TCoE",
      description:
        "Bárbaros inundados pela magia caótica de Faéria, dos Planos Superiores ou de outros mundos de poder sobrenatural. Sua fúria libera surtos de magia selvagem imprevisíveis – elfos, tieflings, aasimares e genasi frequentemente seguem essa trilha.",
      features: [
        {
          name: "Surto Selvagem",
          level: 3,
          description:
            "A energia mágica remexendo-se dentro de você às vezes irrompe de seu corpo. Quando você entra em fúria, role na tabela de Magia Selvagem para determinar o efeito mágico produzido. Se o efeito exigir um teste de resistência, a CD é igual a 8 + seu bônus de proficiência + seu modificador de Constituição.\nMagia Selvagem (1d8):\n1 – Tentáculos sombrios chicoteiam ao seu redor. Cada criatura à sua escolha que você possa ver a até 9 metros de você deve realizar um teste de resistência de Constituição ou sofre 1d12 de dano necrótico. Você também ganha 1d12 pontos de vida temporários.\n2 – Você se teletransporta a até 9 metros para um espaço desocupado que possa ver. Até que sua fúria termine, você pode utilizar esse efeito novamente em cada um dos seus turnos com uma ação bônus.\n3 – Um espírito intangível, parecido com um flumph ou uma pixie (à sua escolha), aparece a até 1,5 metro de uma criatura à sua escolha que você possa ver a até 9 metros de você. No final do turno atual, o espírito explode, e cada criatura a até 1,5 metro dele deve ser bem-sucedida em um teste de resistência de Destreza ou sofre 1d6 de dano de energia. Até que sua fúria acabe, você pode utilizar esse efeito novamente em cada um dos seus turnos, invocando outro espírito com uma ação bônus.\n4 – A magia infiltra-se em uma arma à sua escolha que você esteja empunhando. Até que sua fúria termine, o tipo de dano da arma muda para energia e ela adquire as propriedades leve e arremesso, com alcance normal de 6 metros e alcance longo de 18 metros. Se a arma deixar a sua mão, ela reaparece nela no final do turno atual.\n5 – Sempre que uma criatura o acertar com uma jogada de ataque antes que sua fúria se encerre, essa criatura sofre 1d6 de dano de energia, conforme a magia chicoteia em retribuição.\n6 – Até que sua fúria acabe, você é cercado por luzes protetoras multicoloridas; você ganha +1 de bônus na CA, e enquanto estiverem a até 3 metros de você seus aliados também recebem o mesmo bônus.\n7 – Flores e vinhas temporariamente crescem ao seu redor; até que sua fúria acabe, o terreno a até 4,5 metros de você é considerado terreno difícil para os seus inimigos.\n8 – Um raio de luz é disparado a partir do seu peito. Outra criatura à sua escolha que você possa ver a até 9 metros de você deve realizar um teste de resistência de Constituição ou sofre 1d6 de dano radiante e fica cega até o começo do seu próximo turno. Até que sua fúria se encerre, você pode utilizar esse efeito novamente em cada um dos seus turnos com uma ação bônus.",
        },
        {
          name: "Percepção Mágica",
          level: 3,
          description:
            "Com uma ação, você pode ampliar seus sentidos para notar a presença de concentrações de magia. Até o final do seu próximo turno, você sabe a localização de qualquer magia ou item mágico a até 18 metros de você que não esteja sob cobertura total. Quando você sente uma magia, você também descobre de qual escola ela é.\nVocê pode usar essa característica um número de vezes igual ao seu bônus de proficiência, e recupera todos os usos quando termina um descanso longo.",
          resource: { max: "prof", recharge: "long" },
        },
        {
          name: "Fortalecimento Mágico",
          level: 6,
          description:
            "Você pode domar sua magia selvagem para fortalecer a si mesmo ou a um companheiro. Com uma ação, você pode tocar uma criatura (que pode ser você mesmo) e conferir a ela um dos seguintes benefícios, à sua escolha:\n• Por 10 minutos, a criatura pode rolar um d3 sempre que fizer uma jogada de ataque ou teste de habilidade e adicionar o número rolado ao resultado do d20.\n• Role um d3. A criatura recupera um espaço de magia gasto de nível igual ou menor ao valor rolado (à escolha da criatura). Uma vez que receba esse benefício, a criatura não pode recebê-lo novamente até terminar um descanso longo.\nVocê pode realizar essa ação um número de vezes igual ao seu bônus de proficiência, e recupera todos os usos quando termina um descanso longo.",
          resource: { max: "prof", recharge: "long" },
        },
        {
          name: "Retaliação Instável",
          level: 10,
          description:
            "Quando você estiver ameaçado durante a sua fúria, a magia dentro de você pode escapar: imediatamente após você sofrer dano ou falhar em um teste de resistência enquanto estiver em fúria, você pode utilizar a sua reação para rolar na tabela de Magia Selvagem e imediatamente produzir o efeito rolado. Esse efeito substitui seu efeito de Magia Selvagem atual.",
        },
        {
          name: "Surto Controlado",
          level: 14,
          description:
            "Sempre que rolar na tabela de Magia Selvagem, você pode rolar duas vezes e escolher qual dos dois efeitos liberar. Se você rolar o mesmo número em ambos os dados, você pode ignorar o resultado e escolher qualquer efeito da tabela.",
        },
      ],
    },
  ],
};
