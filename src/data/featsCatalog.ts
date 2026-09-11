import type { FeatDef } from "@/lib/types";
import { homebrewItems, homebrewVersion } from "./homebrewRegistry";

// Catálogo de talentos (feats) em PT-BR, autorado a partir dos livros:
// - PHB: Livro do Jogador, cap. 6 "Opções de Personalização" (42 talentos)
// - XGtE: Guia de Xanathar para Todas as Coisas, cap. 1 "Talentos Raciais" (15 talentos)
// - TCoE: Caldeirão de Tudo da Tasha, cap. 1 "Talentos" (15 talentos)

const FEATS: FeatDef[] = [
  // ==========================================================================
  // Livro do Jogador
  // ==========================================================================
  {
    name: "Adepto Elemental",
    source: "PHB",
    prerequisite: "Capacidade de conjurar pelo menos uma magia",
    description:
      "Quando você ganha esse talento, escolha um dos tipos de dano a seguir: ácido, elétrico, fogo, frio ou trovão.\n" +
      "As magias que você conjurar ignoram resistência a dano do tipo escolhido. Além disso, quando você rola o dano para uma magia que você conjurar que cause dano desse tipo, você pode tratar qualquer 1 num dado de dano como um 2.\n" +
      "Você pode escolher esse talento diversas vezes. A cada vez que o fizer, você deve escolher um tipo diferente de dano.",
  },
  {
    name: "Adepto Marcial",
    source: "PHB",
    description:
      "Você tem treinamento marcial que permite a você realizar manobras de combate especiais. Você ganha os seguintes benefícios:\n" +
      "• Você aprende duas manobras, à sua escolha, das que estão disponíveis ao arquétipo Mestre de Batalha na classe guerreiro. Se a manobra que você usar obrigar um alvo a realizar um teste de resistência, a CD do teste de resistência será igual a 8 + seu bônus de proficiência + seu modificador de Força ou Destreza (à sua escolha).\n" +
      "• Se você já tiver dados de superioridade, você ganha um adicional; do contrário, você terá um dado de superioridade, que é um d6. Esse dado é usado para abastecer suas manobras. Um dado de superioridade é gasto quando você o usa. Você recupera seus dados de superioridade gastos quando termina um descanso curto ou longo.",
  },
  {
    name: "Alerta",
    source: "PHB",
    description:
      "Sempre à espera de perigo, você ganha os seguintes benefícios:\n" +
      "• Você recebe +5 de bônus em iniciativa.\n" +
      "• Você não pode ser surpreendido enquanto estiver consciente.\n" +
      "• Outras criaturas não ganham vantagem nas jogadas de ataque contra você por estarem escondidas de você.",
  },
  {
    name: "Ambidestro",
    source: "PHB",
    description:
      "Você dominou o estilo de luta com duas armas, ganhando os seguintes benefícios:\n" +
      "• Você ganha +1 de bônus na CA enquanto estiver empunhando uma arma corpo-a-corpo em cada mão.\n" +
      "• Você pode usar combater com duas armas mesmo que as armas de uma mão que você está empunhando não sejam leves.\n" +
      "• Você pode sacar ou guardar duas armas de uma mão quando você, normalmente, seria capaz de sacar ou guardar apenas uma.",
  },
  {
    name: "Atacante Bestial",
    source: "PHB",
    description:
      "Uma vez por turno, quando você rolar o dano para um ataque corpo-a-corpo com arma, você pode jogar novamente o dado de dano da arma e usar qualquer dos valores.",
  },
  {
    name: "Atirador Aguçado",
    source: "PHB",
    description:
      "Você dominou o uso de armas à distância e pode realizar tiros que seriam impossíveis para outros. Você ganha os seguintes benefícios:\n" +
      "• Atacar um alvo além da distância normal não impõe desvantagem nas suas jogadas de ataque com armas à distância.\n" +
      "• Seus ataques com armas à distância ignoram meia-cobertura e três-quartos de cobertura.\n" +
      "• Antes de realizar um ataque com uma arma à distância na qual você seja proficiente, você pode escolher sofrer –5 de penalidade na jogada de ataque. Se o ataque atingir, você adiciona +10 no dano do ataque.",
  },
  {
    name: "Atirador de Magia",
    source: "PHB",
    prerequisite: "Capacidade de conjurar pelo menos uma magia",
    description:
      "Você aprendeu técnicas para aprimorar seus ataques com certos tipos de magia, ganhando os seguintes benefícios:\n" +
      "• Quando você conjura uma magia que requer que você realize uma jogada de ataque, o alcance da magia é dobrado.\n" +
      "• Seus ataques à distância com magia ignoram meia-cobertura ou três-quartos de cobertura.\n" +
      "• Você aprende um truque que requer uma jogada de ataque. Escolha o truque da lista de magias do bardo, bruxo, clérigo, druida, feiticeiro ou mago. Sua habilidade de conjuração para esse truque depende da lista de magia da qual você escolheu o truque: Carisma para bardo, bruxo ou feiticeiro; Sabedoria para clérigo ou druida; ou Inteligência para mago.",
  },
  {
    name: "Atleta",
    source: "PHB",
    abilityIncrease: { choose: ["str", "dex"], amount: 1 },
    description:
      "Você passou por extenso treinamento físico para ganhar os seguintes benefícios:\n" +
      "• Aumente seu valor de Força ou Destreza em 1, até o máximo de 20.\n" +
      "• Quando você estiver caído, se levantar requer apenas 1,5 metro do seu deslocamento.\n" +
      "• Escalar não custa movimento adicional a você.\n" +
      "• Você pode realizar um salto em distância correndo ou um salto em altura correndo se movendo apenas um passo de ajuste de 1,5 metro, ao invés de 3 metros.",
  },
  {
    name: "Ator",
    source: "PHB",
    abilityIncrease: { choose: ["cha"], amount: 1 },
    description:
      "Perito em mímica e dramaturgia, você recebe os seguintes benefícios:\n" +
      "• Aumente seu valor de Carisma em 1, até o máximo de 20.\n" +
      "• Você tem vantagem em testes de Carisma (Atuação) e Carisma (Enganação) quando você estiver tentando se passar por uma pessoa diferente.\n" +
      "• Você pode imitar a articulação de outra pessoa ou os sons feitos por outras criaturas. Você deve ter ouvido a pessoa falando ou ouvido a criatura fazendo o som por, pelo menos, 1 minuto. Um sucesso num teste de Sabedoria (Intuição) resistido pelo seu teste de Carisma (Enganação) permite que um ouvinte determine que o efeito é falso.",
  },
  {
    name: "Combatente Montado",
    source: "PHB",
    description:
      "Você é um oponente perigoso de se enfrentar quando está montado. Enquanto estiver montado e não estiver incapacitado, você ganha os seguintes benefícios:\n" +
      "• Você tem vantagem nas jogadas de ataque corpo-a-corpo contra qualquer criatura desmontada que seja menor que a sua montaria.\n" +
      "• Você pode forçar que um ataque direcionado à sua montaria seja direcionado a você, em seu lugar.\n" +
      "• Se sua montaria for alvo de um efeito que permita a ela realizar um teste de resistência de Destreza para reduzir o dano à metade, ao invés disso, ela não sofre qualquer dano se for bem-sucedida no teste de resistência, e apenas metade se falhar.",
  },
  {
    name: "Conjurador de Guerra",
    source: "PHB",
    prerequisite: "Capacidade de conjurar pelo menos uma magia",
    description:
      "Você praticou a conjuração de magias no meio do combate, aprendendo técnicas que lhe concedem os seguintes benefícios:\n" +
      "• Você tem vantagem em testes de resistência de Constituição para manter sua concentração em uma magia quando você sofrer dano.\n" +
      "• Você pode realizar os componentes somáticos de uma magia mesmo quando está com armas ou um escudo em uma ou ambas as mãos.\n" +
      "• Quando o movimento de uma criatura hostil provocar um ataque de oportunidade para você, você pode usar sua reação para conjurar uma magia na criatura, ao invés de realizar o ataque de oportunidade. A magia deve ter um tempo de conjuração de 1 ação e deve ter apenas uma criatura como alvo.",
  },
  {
    name: "Conjurador de Ritual",
    source: "PHB",
    prerequisite: "Inteligência ou Sabedoria 13 ou maior",
    description:
      "Você aprendeu um número de magias que você pode conjurar como rituais. Essas magias são escritas em um livro de rituais, o qual deve estar em suas mãos enquanto você conjura uma dessas magias.\n" +
      "Quando você escolhe esse talento, você adquire um livro de rituais que contém duas magias de 1º nível, à sua escolha. Escolha uma das seguintes classes: bardo, bruxo, clérigo, druida, feiticeiro ou mago. Você deve escolher suas magias da lista de magias dessa classe e as magias escolhidas devem ter o descritor ritual. A classe que você escolheu também determina a habilidade de conjuração dessas magias: Carisma para bardo, bruxo ou feiticeiro; Sabedoria para clérigo ou druida; ou Inteligência para mago.\n" +
      "Se você encontrar uma magia na forma escrita, como a contida em um pergaminho de magia ou o grimório de um mago, você é capaz de adicioná-la ao seu livro de rituais. A magia deve estar na lista de magias da classe escolhida, o nível da magia não pode ser maior que metade do seu nível (arredondado para cima) e deve conter o descritor ritual. O processo para copiar a magia no seu livro de rituais leva 2 horas por nível da magia e custa 50 po por nível. O custo representa os componentes materiais que você gasta para experimentar a magia até dominá-la, bem como as finas tintas utilizadas para escrevê-la.",
  },
  {
    name: "Curandeiro",
    source: "PHB",
    description:
      "Você é um cirurgião capacitado, permitindo que você trate de ferimentos rapidamente, trazendo seus aliados de volta à luta. Você adquire os seguintes benefícios:\n" +
      "• Quando você usar um kit de primeiros-socorros para estabilizar uma criatura morrendo, a criatura recupera 1 ponto de vida, ao invés disso.\n" +
      "• Com uma ação, você pode gastar um uso do kit de primeiros-socorros para tratar de uma criatura e restaurar 1d6 + 4 pontos de vida mais uma quantidade de pontos de vida adicionais igual ao número total de Dados de Vida da criatura. A criatura não pode recuperar pontos de vida através desse talento novamente até ter terminado um descanso curto ou longo.",
  },
  {
    name: "Duelista Defensivo",
    source: "PHB",
    prerequisite: "Destreza 13 ou maior",
    description:
      "Quando você estiver empunhando uma arma de acuidade com a qual você seja proficiente e outra criatura atingir você com um ataque corpo-a-corpo, você pode usar sua reação para adicionar seu bônus de proficiência à sua CA para esse ataque, potencialmente fazendo o ataque errar.",
  },
  {
    name: "Especialista em Besta",
    source: "PHB",
    description:
      "Graças à sua prática extensiva com bestas, você ganha os seguintes benefícios:\n" +
      "• Você ignora a qualidade de recarga de bestas nas quais você é proficiente.\n" +
      "• Estar a 1,5 metro de uma criatura hostil não impõe desvantagem nas suas jogadas de ataque à distância.\n" +
      "• Quando você usa a ação de Ataque e ataca com uma arma de uma mão, você pode usar sua ação bônus para atacar com uma besta de mão carregada que você esteja empunhando.",
  },
  {
    name: "Especialista em Briga",
    source: "PHB",
    abilityIncrease: { choose: ["str", "con"], amount: 1 },
    description:
      "Acostumado a brigas de bar usando qualquer coisa como armas, e na falta, os punhos, você ganha os seguintes benefícios:\n" +
      "• Aumente o valor de Força ou Constituição em 1, até o máximo de 20.\n" +
      "• Seus ataques desarmados causam 1d4 de dano.\n" +
      "• Quando você atinge uma criatura com um ataque desarmado ou com uma arma improvisada, no seu turno, você pode usar uma ação bônus para tentar agarrar o alvo.",
  },
  {
    name: "Explorador de Cavernas",
    source: "PHB",
    description:
      "Alerta às armadilhas escondidas e portas secretas encontradas em muitas masmorras, você ganha os seguintes benefícios:\n" +
      "• Você tem vantagem em testes de Sabedoria (Percepção) e de Inteligência (Investigação) feitos para detectar a presença de portas secretas.\n" +
      "• Você tem vantagem em testes de resistência feitos para evitar ou resistir a armadilhas.\n" +
      "• Você tem resistência ao dano causado por armadilhas.\n" +
      "• Você pode procurar armadilhas enquanto viaja a um ritmo normal, ao invés de metade do ritmo.",
  },
  {
    name: "Imobilizador",
    source: "PHB",
    prerequisite: "Força 13 ou maior",
    description:
      "Você desenvolveu a perícia necessária para se prender a alguém em um combate engajado. Você recebe os seguintes benefícios:\n" +
      "• Você tem vantagem nas jogadas de ataque contra uma criatura agarrada por você.\n" +
      "• Você pode usar sua ação para tentar imobilizar uma criatura agarrada por você. Para tanto, realize outro teste de agarrar. Se você for bem-sucedido, você e a criatura estarão ambos impedidos até o agarre terminar.",
  },
  {
    name: "Iniciado em Magia",
    source: "PHB",
    description:
      "Escolha uma classe: bardo, bruxo, clérigo, druida, feiticeiro ou mago. Você aprende dois truques da lista de magias da classe escolhida.\n" +
      "Além disso, escolha uma magia de 1º nível da mesma lista. Você aprende essa magia e pode conjurá-la com o menor nível possível. Uma vez que a conjure, você precisa terminar um descanso longo para poder conjurá-la novamente. Essa restrição aplica-se apenas à magia adquirida através desse talento.\n" +
      "Sua habilidade de conjuração depende da classe que você escolher: Carisma para bardo, bruxo ou feiticeiro; Sabedoria para clérigo ou druida; ou Inteligência para mago.",
  },
  {
    name: "Investida Poderosa",
    source: "PHB",
    description:
      "Quando você usa a ação de Disparada, você pode usar sua ação bônus para realizar um ataque corpo-a-corpo com arma ou para empurrar uma criatura.\n" +
      "Se você se mover, pelo menos, 3 metros em linha reta imediatamente antes de realizar essa ação bônus, você pode tanto ganhar +5 de bônus na jogada de dano do ataque (se você escolher realizar um ataque corpo-a-corpo e atingir) ou empurrar o alvo até 3 metros de você (se você escolher empurrar e for bem-sucedido).",
  },
  {
    name: "Líder Inspirador",
    source: "PHB",
    prerequisite: "Carisma 13 ou maior",
    description:
      "Você pode gastar 10 minutos inspirando seus companheiros, fortalecendo a vontade deles de lutar. Quando fizer isso, escolha até seis criaturas amigáveis (que podem incluir você) a até 9 metros de você que possam ver ou ouvir você e possam te compreender. Cada criatura ganha pontos de vida temporários igual ao seu nível + seu modificador de Carisma. Uma criatura não pode ganhar pontos de vida temporários desse talento novamente até terminar um descanso curto ou longo.",
  },
  {
    name: "Maestria em Arma de Haste",
    source: "PHB",
    description:
      "Você consegue manter seus inimigos afastados utilizando armas de haste. Você ganha os seguintes benefícios:\n" +
      "• Quando você realiza a ação de Ataque e ataca com uma glaive, alabarda ou bordão, você pode usar uma ação bônus para realizar um ataque corpo-a-corpo com a outra extremidade da arma. Esse ataque usa o mesmo modificador de habilidade do ataque primário. O dado de dano da arma para esse ataque é um d4 e o ataque causa dano de concussão.\n" +
      "• Enquanto você estiver empunhando uma glaive, alabarda, lança longa ou bordão, as outras criaturas provocam um ataque de oportunidade de você quando entrarem no seu alcance.",
  },
  {
    name: "Maestria em Armadura Média",
    source: "PHB",
    prerequisite: "Proficiência em armadura média",
    description:
      "Você praticou seus movimentos usando armaduras médias para ganhar os seguintes benefícios:\n" +
      "• Vestir uma armadura média não lhe impõe desvantagem em testes de Destreza (Furtividade).\n" +
      "• Quando você estiver vestindo uma armadura média, você pode adicionar 3, ao invés de 2, à sua CA, se você tiver Destreza 16 ou maior.",
  },
  {
    name: "Maestria em Armadura Pesada",
    source: "PHB",
    prerequisite: "Proficiência em armadura pesada",
    abilityIncrease: { choose: ["str"], amount: 1 },
    description:
      "Você pode usar sua armadura para defletir ataques potencialmente fatais a outros. Você ganha os seguintes benefícios:\n" +
      "• Aumente seu valor de Força em 1, até o máximo de 20.\n" +
      "• Quando você estiver vestindo uma armadura pesada, dano de concussão, cortante e perfurante que você receba de ataques não-mágicos será reduzido em 3.",
  },
  {
    name: "Matador de Conjuradores",
    source: "PHB",
    description:
      "Você praticou técnicas úteis em combate corpo-a-corpo contra conjuradores, ganhando os seguintes benefícios:\n" +
      "• Quando uma criatura a até 1,5 metro de você conjurar uma magia, você pode usar sua reação para realizar um ataque corpo-a-corpo contra ela.\n" +
      "• Quando você causa dano em uma criatura que está se concentrando em uma magia, a criatura terá desvantagem no teste de resistência que ela fizer para manter a concentração.\n" +
      "• Você tem vantagem em testes de resistência contra magias conjuradas por criaturas a até 1,5 metro de você.",
  },
  {
    name: "Mente Afiada",
    source: "PHB",
    abilityIncrease: { choose: ["int"], amount: 1 },
    description:
      "Você tem uma mente que pode cronometrar o tempo e memorizar direção e detalhes com precisão absurda. Você ganha os seguintes benefícios:\n" +
      "• Aumente seu valor de Inteligência em 1, até o máximo de 20.\n" +
      "• Você sempre sabe qual a direção do norte.\n" +
      "• Você sempre sabe o número de horas restantes para o próximo nascer ou pôr do sol.\n" +
      "• Você pode relembrar, com precisão, qualquer coisa que você tenha visto ou ouvido no último mês.",
  },
  {
    name: "Mestre de Armas",
    source: "PHB",
    abilityIncrease: { choose: ["str", "dex"], amount: 1 },
    description:
      "Você tem praticado extensamente com uma variedade de armas, ganhando os seguintes benefícios:\n" +
      "• Aumente o valor de Força ou Destreza em 1, até o máximo de 20.\n" +
      "• Você ganha proficiência com quatro armas simples ou marciais, à sua escolha.",
  },
  {
    name: "Mestre de Armas Grandes",
    source: "PHB",
    description:
      "Você aprendeu a usar o peso em sua vantagem, deixando o balanço potencializar seus golpes. Você recebe os seguintes benefícios:\n" +
      "• No seu turno, quando você atingir um acerto crítico com uma arma corpo-a-corpo ou reduzir os pontos de vida de uma criatura a 0, você pode realizar um ataque corpo-a-corpo com arma, com uma ação bônus.\n" +
      "• Antes de você realizar um ataque corpo-a-corpo com uma arma pesada na qual você seja proficiente, você pode escolher sofrer –5 de penalidade em sua jogada de ataque. Se o ataque atingir, você adiciona +10 ao dano do ataque.",
  },
  {
    name: "Mestre de Escudo",
    source: "PHB",
    description:
      "Você não usa escudos apenas para proteção, mas também de forma ofensiva. Você ganha os seguintes benefícios enquanto estiver empunhando um escudo:\n" +
      "• Se você realizar a ação de Ataque no seu turno, você pode usar uma ação bônus para tentar empurrar uma criatura, a até 1,5 metro de você, com seu escudo.\n" +
      "• Se você não estiver incapacitado, você pode adicionar seu bônus de CA do escudo a qualquer teste de resistência de Destreza que você fizer contra uma magia ou outro efeito nocivo que tenha você como alvo.\n" +
      "• Se você for alvo de um efeito que permita realizar um teste de resistência de Destreza para sofrer apenas metade do dano, você pode usar sua reação para não sofrer dano se passar no teste de resistência, interpondo seu escudo entre você e a fonte do efeito.",
  },
  {
    name: "Mobilidade",
    source: "PHB",
    description:
      "Você é excepcionalmente rápido e ágil. Você ganha os seguintes benefícios:\n" +
      "• Seu deslocamento aumenta em 3 metros.\n" +
      "• Quando você usa a ação de Disparada, mover-se através de terreno difícil não lhe custa qualquer movimento adicional neste turno.\n" +
      "• Quando você realiza um ataque corpo-a-corpo contra uma criatura, você não provoca ataques de oportunidade dessa criatura pelo resto do turno, independentemente de ter atingido ou não.",
  },
  {
    name: "Observador",
    source: "PHB",
    abilityIncrease: { choose: ["int", "wis"], amount: 1 },
    description:
      "Rápido em perceber os detalhes do ambiente, você ganha os seguintes benefícios:\n" +
      "• Aumente seu valor de Inteligência ou Sabedoria em 1, até o máximo de 20.\n" +
      "• Se você puder ver a boca de uma criatura enquanto ela fala um idioma que você compreende, você pode interpretar o que ela está dizendo ao ler os seus lábios.\n" +
      "• Você tem +5 de bônus nos seus valores passivos de Sabedoria (Percepção) e Inteligência (Investigação).",
  },
  {
    name: "Perito",
    source: "PHB",
    description:
      "Você ganha proficiência em qualquer combinação de três perícias ou ferramentas, à sua escolha.",
  },
  {
    name: "Poliglota",
    source: "PHB",
    abilityIncrease: { choose: ["int"], amount: 1 },
    description:
      "Você estudou línguas e códigos, ganhando os seguintes benefícios:\n" +
      "• Aumente seu valor de Inteligência em 1, até o máximo de 20.\n" +
      "• Você aprende três idiomas, à sua escolha.\n" +
      "• Você é capaz de criar criptogramas escritos. Outros não podem decifrar um código criado por você a não ser que você os ensine, eles sejam bem-sucedidos num teste de Inteligência (CD igual ao seu valor de Inteligência + seu bônus de proficiência) ou usem magia para decifrá-lo.",
  },
  {
    name: "Proteção Leve",
    source: "PHB",
    abilityIncrease: { choose: ["str", "dex"], amount: 1 },
    description:
      "Você treinou até dominar o uso de armaduras leves, ganhando os seguintes benefícios:\n" +
      "• Aumente seu valor de Força ou Destreza em 1, até o máximo de 20.\n" +
      "• Você ganha proficiência com armaduras leves.",
  },
  {
    name: "Proteção Moderada",
    source: "PHB",
    prerequisite: "Proficiência em armadura leve",
    abilityIncrease: { choose: ["str", "dex"], amount: 1 },
    description:
      "Você treinou até dominar o uso de armaduras médias e escudos, ganhando os seguintes benefícios:\n" +
      "• Aumente seu valor de Força ou Destreza em 1, até o máximo de 20.\n" +
      "• Você ganha proficiência com armadura média e escudos.",
  },
  {
    name: "Proteção Pesada",
    source: "PHB",
    prerequisite: "Proficiência em armadura média",
    abilityIncrease: { choose: ["str"], amount: 1 },
    description:
      "Você treinou até dominar o uso de armaduras pesadas, ganhando os seguintes benefícios:\n" +
      "• Aumente seu valor de Força em 1, até o máximo de 20.\n" +
      "• Você ganha proficiência com armadura pesada.",
  },
  {
    name: "Resiliente",
    source: "PHB",
    abilityIncrease: { choose: ["str", "dex", "con", "int", "wis", "cha"], amount: 1 },
    description:
      "Escolha um valor de habilidade. Você ganha os seguintes benefícios:\n" +
      "• Aumente o valor de habilidade escolhido em 1, até o máximo de 20.\n" +
      "• Você ganha proficiência em testes de resistência usando a habilidade escolhida.",
  },
  {
    name: "Resistente",
    source: "PHB",
    abilityIncrease: { choose: ["con"], amount: 1 },
    description:
      "Duro e resistente, você ganha os seguintes benefícios:\n" +
      "• Aumente seu valor de Constituição em 1, até o máximo de 20.\n" +
      "• Quando você rolar um Dado de Vida para recuperar pontos de vida, o valor mínimo de pontos de vida que você recupera dessa rolagem será igual a duas vezes seu modificador de Constituição (mínimo de 2).",
  },
  {
    name: "Robusto",
    source: "PHB",
    description:
      "Seu máximo de pontos de vida aumenta em um valor igual a duas vezes seu nível quando você adquire esse talento. Toda vez que você ganhar um nível, após isso, seu máximo de pontos de vida aumenta em 2 pontos de vida adicionais.",
  },
  {
    name: "Sentinela",
    source: "PHB",
    description:
      "Você domina técnicas para obter vantagem a cada vez que qualquer inimigo baixar a guarda, ganhando os seguintes benefícios:\n" +
      "• Quando você atinge uma criatura com um ataque de oportunidade, o deslocamento da criatura se torna 0 pelo resto do turno.\n" +
      "• As criaturas provocam ataques de oportunidade de você mesmo se realizarem a ação de Desengajar antes de saírem do seu alcance.\n" +
      "• Quando uma criatura a até 1,5 metro de você realizar um ataque contra um alvo diferente de você (e o alvo não possuir esse talento), você pode usar sua reação para realizar um ataque corpo-a-corpo com arma contra a criatura atacante.",
  },
  {
    name: "Sorrateiro",
    source: "PHB",
    prerequisite: "Destreza 13 ou maior",
    description:
      "Você é especialista em espreitar através das sombras. Você ganha os seguintes benefícios:\n" +
      "• Você pode tentar se esconder quando estiver levemente obscurecido para a criatura de quem você está tentando se esconder.\n" +
      "• Quando você estiver escondido de uma criatura e errar um ataque à distância contra ela, realizar esse ataque não revelará sua posição.\n" +
      "• Penumbra não impõe desvantagem nos seus testes de Sabedoria (Percepção) relacionados à visão.",
  },
  {
    name: "Sortudo",
    source: "PHB",
    description:
      "Você tem uma sorte inexplicável que parece surgir nos momentos exatos.\n" +
      "Você tem 3 pontos de sorte. A qualquer momento que você realizar uma jogada de ataque, teste de habilidade ou teste de resistência, você pode gastar um ponto de sorte para rolar um d20 adicional. Você pode escolher gastar um dos seus pontos de sorte depois de rolar o dado, mas antes de saber o resultado da jogada. Você escolhe qual dos d20s irá usar para a jogada de ataque, teste de habilidade ou teste de resistência.\n" +
      "Você também pode gastar um ponto de sorte quando uma jogada de ataque for feita contra você. Role um d20, e então escolha se o ataque irá usar a jogada do atacante ou a sua.\n" +
      "Se mais de uma criatura gastar um ponto de sorte para influenciar uma mesma jogada, os pontos se cancelam mutuamente; nenhum dado adicional é rolado.\n" +
      "Você recupera seus pontos de sorte gastos após terminar um descanso longo.",
  },

  // ==========================================================================
  // Guia de Xanathar — Talentos Raciais
  // ==========================================================================
  {
    name: "Agachamento Ágil",
    source: "XGtE",
    prerequisite: "Anão ou Raças Pequenas",
    races: ["Anão", "Gnomo", "Halfling"],
    abilityIncrease: { choose: ["str", "dex"], amount: 1 },
    description:
      "Você é estranhamente ágil para sua raça. Receba os seguintes benefícios:\n" +
      "• Aumente seu valor de Força ou Destreza em 1, até o máximo de 20.\n" +
      "• Aumente seu deslocamento de caminhada em 1,5 metro.\n" +
      "• Você ganha proficiência em Acrobacia ou Atletismo (à sua escolha).\n" +
      "• Você tem vantagem em qualquer teste de Força (Atletismo) ou Destreza (Acrobacia) que faça para escapar de ser agarrado.",
  },
  {
    name: "Alta Magia Drow",
    source: "XGtE",
    prerequisite: "Elfo (Drow)",
    races: ["Elfo"],
    description:
      "Você aprende mais da magia típica dos elfos negros. Aprende a magia detectar magia e pode conjurá-la à vontade, sem gastar um espaço de magia. Também aprende as magias levitação e dissipar magia, podendo conjurar cada uma delas uma vez sem gastar espaços de magia. Recupera a capacidade de conjurar essas duas magias dessa maneira assim que terminar um descanso longo. O Carisma é a sua habilidade de conjuração para as três magias.",
  },
  {
    name: "Boa Sorte",
    source: "XGtE",
    prerequisite: "Halfling",
    races: ["Halfling"],
    description:
      "Seu povo tem uma sorte extraordinária, que você aprendeu a emprestar misticamente a seus companheiros quando os vê hesitar. Você não tem certeza de como fazê-lo; você apenas deseja, e isso acontece. Certamente, um sinal de favor da fortuna!\n" +
      "Quando um aliado que você possa ver dentro de 9 metros de alcance rola um 1 no d20 para uma jogada de ataque, um teste de habilidade ou um teste de resistência, você pode usar sua reação para permitir que o aliado refaça a rolagem. O aliado deve usar o novo resultado.\n" +
      "Quando usa essa característica, você não pode usar seu traço racial Sortudo antes do final do seu próximo turno.",
  },
  {
    name: "Chamas de Phlegethos",
    source: "XGtE",
    prerequisite: "Tiefling",
    races: ["Tiefling"],
    abilityIncrease: { choose: ["int", "cha"], amount: 1 },
    description:
      "Você aprende a invocar o fogo infernal para servir seus comandos. Você ganha os seguintes benefícios:\n" +
      "• Aumente seu valor de Inteligência ou Carisma em 1, até o máximo de 20.\n" +
      "• Quando rolar dano de fogo por alguma magia que tenha conjurado, pode rolar novamente qualquer 1 no dado de dano por fogo, mas deve usar esta nova rolagem, mesmo que seja outro 1.\n" +
      "• Sempre que conjurar uma magia que cause dano por fogo, pode produzir chamas que se enrolam em você até o final do seu turno. As chamas não causam dano a você ou às coisas que estiver portando, e elas vertem luz plena até 9 metros e luz fraca por mais 9 metros adicionais. Enquanto as chamas estiverem presentes, qualquer criatura a até 1,5 metro de alcance que lhe atinja com um ataque corpo-a-corpo recebe 1d4 de dano por fogo.",
  },
  {
    name: "Constituição Infernal",
    source: "XGtE",
    prerequisite: "Tiefling",
    races: ["Tiefling"],
    abilityIncrease: { choose: ["con"], amount: 1 },
    description:
      "Sangue demoníaco corre fortemente em suas veias, libertando uma resiliência semelhante à possuída por alguns demônios. Você ganha os seguintes benefícios:\n" +
      "• Aumente seu valor de Constituição em 1, até o máximo de 20.\n" +
      "• Você recebe resistência a dano por frio e por veneno.\n" +
      "• Você tem vantagem em testes de resistência contra ser envenenado.",
  },
  {
    name: "Couro de Dragão",
    source: "XGtE",
    prerequisite: "Draconato",
    races: ["Draconato"],
    abilityIncrease: { choose: ["str", "con", "cha"], amount: 1 },
    description:
      "Você desenvolve escamas e garras que relembram seus ancestrais dracônicos. Você ganha os seguintes benefícios:\n" +
      "• Aumente seu valor de Força, Constituição ou Carisma em 1, até o máximo de 20.\n" +
      "• Suas escamas se endurecem. Enquanto não estiver vestindo armadura, pode calcular sua CA como 13 + seu modificador de Destreza. Você pode usar um escudo e ainda assim ganhar esse benefício.\n" +
      "• Você faz crescer garras retráteis das pontas dos seus dedos. Estender ou retrair as garras não requer nenhuma ação. As garras são armas naturais com as quais você pode fazer ataques desarmados. Se atacar com elas, causa dano cortante igual a 1d4 + seu modificador de Força, ao invés do dano de concussão convencional de um ataque desarmado.",
  },
  {
    name: "Desvanecer",
    source: "XGtE",
    prerequisite: "Gnomo",
    races: ["Gnomo"],
    abilityIncrease: { choose: ["dex", "int"], amount: 1 },
    description:
      "Seu povo é esperto, com uma aptidão para ilusão mágica. Você aprendeu um truque mágico para desaparecer quando sofre dano. Você ganha os seguintes benefícios:\n" +
      "• Aumente seu valor de Destreza ou Inteligência em 1, até o máximo de 20.\n" +
      "• Imediatamente após receber dano, pode usar sua reação para magicamente se tornar invisível até o fim do seu próximo turno ou até que realize um ataque, cause dano, ou faça com que alguém realize um teste de resistência. Após usar essa característica, só pode usá-la novamente assim que terminar um descanso curto ou longo.",
  },
  {
    name: "Fortitude Anã",
    source: "XGtE",
    prerequisite: "Anão",
    races: ["Anão"],
    abilityIncrease: { choose: ["con"], amount: 1 },
    description:
      "Você tem o sangue de heróis anões correndo em suas veias. Você ganha os seguintes benefícios:\n" +
      "• Aumente seu valor de Constituição em 1, até o máximo de 20.\n" +
      "• Sempre que você realiza a ação Esquivar em combate, pode gastar um Dado de Vida para se curar. Role o dado, adicione seu modificador de Constituição, e recupere um número de pontos de vida igual a este total (mínimo de 1).",
  },
  {
    name: "Fúria Orc",
    source: "XGtE",
    prerequisite: "Meio-orc",
    races: ["Meio-orc"],
    abilityIncrease: { choose: ["str", "con"], amount: 1 },
    description:
      "Sua fúria interior queima incansavelmente. Você recebe os benefícios a seguir:\n" +
      "• Aumente seu valor de Força ou Constituição em 1, até o máximo de 20.\n" +
      "• Quando acertar um ataque usando uma arma simples ou marcial, pode rolar um dos dados de dano da arma uma vez adicionalmente e somar o resultado à jogada. O tipo de dano é o mesmo originário da arma. Uma vez que use essa característica, não pode usá-la novamente até terminar um descanso curto ou longo.\n" +
      "• Imediatamente após usar seu traço racial Resistência Implacável, pode usar sua reação para realizar um ataque com arma.",
  },
  {
    name: "Magia do Elfo da Floresta",
    source: "XGtE",
    prerequisite: "Elfo (floresta)",
    races: ["Elfo"],
    description:
      "Você aprende a magia das florestas primitivas, que são reverenciadas e protegidas pelo seu povo. Aprende um truque de druida à sua escolha. Também aprende passos longos e passos sem pegadas, cada uma das quais pode conjurar uma vez sem gastar espaços de magia. Recupera a capacidade de conjurar essas duas magias desta maneira quando terminar um descanso longo. A Sabedoria é a sua habilidade de conjuração para as três magias.",
  },
  {
    name: "Precisão Élfica",
    source: "XGtE",
    prerequisite: "Elfo ou Meio-elfo",
    races: ["Elfo", "Meio-elfo"],
    abilityIncrease: { choose: ["dex", "int", "wis", "cha"], amount: 1 },
    description:
      "A precisão dos elfos é lendária, especialmente dos arqueiros e conjuradores. Você tem uma mira sobrenatural em ataques que dependem da precisão ao invés do dano bruto. Você ganha os seguintes benefícios:\n" +
      "• Aumente seu valor de Destreza, Inteligência, Sabedoria ou Carisma em 1, até o máximo de 20.\n" +
      "• Sempre que tiver vantagem em uma jogada de ataque usando Destreza, Inteligência, Sabedoria ou Carisma, você pode rolar novamente um dos dados do ataque, uma vez.",
  },
  {
    name: "Prodígio",
    source: "XGtE",
    prerequisite: "Meio-elfo, Meio-orc ou Humano",
    races: ["Humano", "Meio-elfo", "Meio-orc"],
    description:
      "Você tem facilidade de aprender coisas novas. Você ganha os seguintes benefícios:\n" +
      "• Você ganha uma proficiência de perícia à sua escolha, uma proficiência em ferramenta à sua escolha, e fluência em um idioma à sua escolha.\n" +
      "• Escolha uma perícia em que tenha proficiência. Você ganha especialização com essa perícia, o que significa que seu bônus de proficiência é dobrado para qualquer teste de habilidade que você venha a realizar com ela. A perícia que escolher deve ser uma que não esteja sob o benefício de nenhuma outra característica, como Especialização, que já dobre seu bônus de proficiência.",
  },
  {
    name: "Segunda Chance",
    source: "XGtE",
    prerequisite: "Halfling",
    races: ["Halfling"],
    abilityIncrease: { choose: ["con", "cha"], amount: 1 },
    description:
      "A sorte te favorece quando alguém tenta atingi-lo. Os seguintes benefícios lhe são dados:\n" +
      "• Aumente seu valor de Constituição ou Carisma em 1, até o máximo de 20.\n" +
      "• Quando uma criatura que você possa ver te acertar com uma jogada de ataque, você pode usar sua reação para forçar a criatura a rolar novamente. Uma vez usada essa característica, não pode usá-la novamente até que role a iniciativa ao iniciar outro combate ou então termine um descanso curto ou longo.",
  },
  {
    name: "Teleporte das Fadas",
    source: "XGtE",
    prerequisite: "Elfo (alto)",
    races: ["Elfo"],
    abilityIncrease: { choose: ["int", "cha"], amount: 1 },
    description:
      "Seu estudo de combate dos altos elfos desbloqueou um poder feérico que apenas poucos elfos possuem, exceto seus primos eladrin. Com base em sua ascendência feérica, pode caminhar momentaneamente pela Agrestia das Fadas para encurtar seu caminho de um lugar para outro. Você ganha os seguintes benefícios:\n" +
      "• Aumente seu valor de Inteligência ou Carisma em 1, até o máximo de 20.\n" +
      "• Você aprende a falar, ler e escrever Silvestre.\n" +
      "• Você aprende a magia passo nebuloso e pode conjurá-la uma vez sem gastar um espaço de magia. Recupera a capacidade de conjurá-la dessa maneira quando terminar um descanso curto ou longo. A Inteligência é a sua habilidade de conjuração para essa magia.",
  },
  {
    name: "Temor Dracônico",
    source: "XGtE",
    prerequisite: "Draconato",
    races: ["Draconato"],
    abilityIncrease: { choose: ["str", "con", "cha"], amount: 1 },
    description:
      "Quando estiver com raiva, pode irradiar ameaça. Você ganha os seguintes benefícios:\n" +
      "• Aumente seu valor de Força, Constituição ou Carisma em 1, até o máximo de 20.\n" +
      "• Ao invés de exalar energia destrutiva, pode gastar um uso do seu traço Arma de Sopro para rugir, forçando cada criatura à sua escolha a até 9 metros de alcance a fazer um teste de resistência de Sabedoria (CD 8 + seu bônus de proficiência + seu modificador de Carisma). Um alvo automaticamente tem sucesso no teste se ele não puder ouvi-lo ou vê-lo. Em caso de falha, o alvo fica amedrontado de você por 1 minuto. Se o alvo amedrontado receber qualquer dano, ele pode repetir o teste de resistência, terminando o efeito em caso de sucesso.",
  },

  // ==========================================================================
  // Caldeirão de Tudo da Tasha
  // ==========================================================================
  {
    name: "Adepto Metamágico",
    source: "TCoE",
    prerequisite: "Habilidade de Conjuração ou característica de Magia de Pacto",
    description:
      "Você aprendeu a exercer sua vontade sobre suas magias para mudar a forma como elas funcionam:\n" +
      "• Você aprende duas opções à sua escolha de Metamagia da lista do feiticeiro. Você pode usar apenas uma opção de Metamagia em uma magia quando a conjura, a menos que a opção diga o contrário. Sempre que alcançar um nível que forneça a característica de Aumento no Valor de Atributo, você pode substituir uma dessas opções de Metamagia por outra da lista de feiticeiro.\n" +
      "• Você ganha 2 pontos de feitiçaria para gastar com Metamagia (esses pontos são adicionados a qualquer ponto de feitiçaria que você possua de outra fonte, mas podem ser usados apenas em Metamagia). Você recupera todos os pontos de feitiçaria gastos ao terminar um descanso longo.",
  },
  {
    name: "Adepto Místico",
    source: "TCoE",
    prerequisite: "Habilidade de Conjuração ou característica de Magia de Pacto",
    description:
      "Estudando os conhecimentos de ocultismo, você desbloqueou o poder místico dentro de si mesmo: você aprende uma Invocação Mística da classe do bruxo à sua escolha. Se a invocação tiver algum tipo de requisito, você poderá escolhê-la apenas se você for um bruxo que cumpra esse requisito.\n" +
      "Sempre que você adquire um nível de personagem, você pode trocar essa invocação por outra da classe de bruxo.",
  },
  {
    name: "Chef",
    source: "TCoE",
    abilityIncrease: { choose: ["con", "wis"], amount: 1 },
    description:
      "O tempo gasto se especializando na arte culinária valeu a pena, fornecendo a você os seguintes benefícios:\n" +
      "• Aumente o seu valor de Constituição ou de Sabedoria em 1, até o máximo de 20.\n" +
      "• Você adquire proficiência com utensílios de cozinheiro, caso não a possua.\n" +
      "• Como parte de um descanso curto, você pode cozinhar uma comida especial, desde que você possua os ingredientes e utensílios de cozinheiro disponíveis. Você pode preparar uma quantia dessa comida suficiente para um número de criaturas igual a 4 + seu bônus de proficiência. No final desse descanso curto, qualquer criatura que coma essa comida e gaste um ou mais Dados de Vida para recuperar pontos de vida recupera um valor adicional de 1d8 pontos de vida.\n" +
      "• Com uma hora de trabalho ou ao finalizar um descanso longo, você pode cozinhar uma quantia de aperitivos igual ao seu bônus de proficiência. Esses aperitivos especiais duram por até 8 horas após terem sido feitos. Uma criatura pode usar uma ação bônus para comer um desses aperitivos e ganhar pontos de vida temporários em uma quantia igual ao seu bônus de proficiência.",
  },
  {
    name: "Envenenador",
    source: "TCoE",
    description:
      "Você pode preparar e aplicar venenos mortais, fornecendo a você os seguintes benefícios:\n" +
      "• Quando você faz uma jogada que provoque dano venenoso, ela ignora resistências a dano venenoso.\n" +
      "• Você pode aplicar veneno em uma arma ou peça de munição com uma ação bônus, em vez de uma ação.\n" +
      "• Você adquire proficiência com o kit de envenenador se você ainda não a possuir. Com uma hora de trabalho utilizando um kit de envenenador e gastando 50 po em materiais, você pode criar uma quantia de doses de um veneno potente igual ao seu bônus de proficiência. Uma vez aplicado em uma arma ou munição, o veneno retém sua potência por 1 minuto ou até um acerto utilizando o item envenenado. Quando uma criatura recebe dano pela arma ou munição recoberta, ela deve ser bem-sucedida em uma salvaguarda de Constituição CD 14 ou sofre 2d8 de dano venenoso e fica envenenada até o final do seu próximo turno.",
  },
  {
    name: "Esmagador",
    source: "TCoE",
    abilityIncrease: { choose: ["str", "con"], amount: 1 },
    description:
      "Você praticou a arte de esmagar os seus inimigos, fornecendo a você os seguintes benefícios:\n" +
      "• Aumente o seu valor de Força ou Constituição em 1, até o máximo de 20.\n" +
      "• Uma vez por turno, quando você acerta uma criatura com um ataque que provoca dano contundente, você pode movê-la até 1,5 metro para um espaço desocupado, desde que seu alvo não possua mais do que uma categoria de tamanho superior à sua.\n" +
      "• Quando você acerta um golpe crítico que provoque dano contundente a uma criatura, jogadas de ataque feitas contra essa criatura são realizadas com vantagem até o começo do seu próximo turno.",
  },
  {
    name: "Especializado em Perícia",
    source: "TCoE",
    abilityIncrease: { choose: ["str", "dex", "con", "int", "wis", "cha"], amount: 1 },
    description:
      "Você aprimorou sua proficiência com uma perícia em particular, garantindo a você os seguintes benefícios:\n" +
      "• Aumente o valor de um atributo à sua escolha em 1, até o máximo de 20.\n" +
      "• Você adquire proficiência em uma perícia à sua escolha.\n" +
      "• Escolha uma perícia na qual seja proficiente. Você ganha maestria com essa perícia, o que implica que seu bônus de proficiência é dobrado para qualquer teste de habilidade feito com essa perícia. A perícia escolhida deve ser uma que não seja beneficiada por esse talento ou características similares, como Especialização, que forneçam o mesmo efeito de dobrar o bônus de proficiência.",
  },
  {
    name: "Iniciado Artífice",
    source: "TCoE",
    description:
      "Você aprendeu algumas das engenhosidades dos artífices:\n" +
      "• Você aprende um truque da lista do artífice, bem como uma magia de 1º círculo dessa mesma lista, ambos à sua escolha. Inteligência é seu atributo de conjuração para essas magias.\n" +
      "• Você pode conjurar a magia de 1º círculo adquirida por esse talento sem um espaço de magia, e você deve terminar um descanso longo antes de poder conjurá-la dessa forma novamente. Você também pode conjurar essa magia utilizando qualquer espaço de magia que você possua.\n" +
      "• Você adquire proficiência com um tipo de ferramentas de artesão à sua escolha, e você pode usar esse tipo de ferramenta como foco de conjuração para qualquer magia que utilize Inteligência como seu atributo de conjuração.",
  },
  {
    name: "Iniciado em Combate",
    source: "TCoE",
    prerequisite: "Proficiência com uma arma marcial",
    description:
      "Seu treinamento marcial o ajudou a desenvolver um estilo de luta único. Como resultado, você aprende uma opção de Estilo de Luta à sua escolha da lista de guerreiro. Se você já possuir um Estilo de Luta, o estilo que você escolher deve ser diferente.\n" +
      "Sempre que você alcançar um nível que forneça a característica de Aumento no Valor de Atributo, você pode trocar esse Estilo de Luta por outro da lista de guerreiro que você não possua.",
  },
  {
    name: "Lacerador",
    source: "TCoE",
    abilityIncrease: { choose: ["str", "dex"], amount: 1 },
    description:
      "Você aprendeu onde cortar para obter os melhores resultados, concedendo a você os seguintes benefícios:\n" +
      "• Aumente seu valor de Força ou Destreza em 1, até o máximo de 20.\n" +
      "• Uma vez por turno, ao acertar uma criatura com um ataque que provoque dano cortante, você pode reduzir o deslocamento do alvo em 3 metros até o início do seu próximo turno.\n" +
      "• Quando você acerta um golpe crítico que provoque dano cortante em uma criatura, você a fere gravemente. Até o início do seu próximo turno, o alvo possui desvantagem em jogadas de ataque.",
  },
  {
    name: "Perfurador",
    source: "TCoE",
    abilityIncrease: { choose: ["str", "dex"], amount: 1 },
    description:
      "Você alcançou uma precisão de perfuração em combate, dando a você os seguintes benefícios:\n" +
      "• Aumente seu valor de Força ou Destreza em 1, até o máximo de 20.\n" +
      "• Uma vez por turno, quando você acertar uma criatura com um ataque que provoque dano perfurante, você pode jogar novamente um dos dados de dano do ataque, e você deve ficar com a nova jogada.\n" +
      "• Quando você acerta um golpe crítico que provoque dano perfurante a uma criatura, você pode jogar um dado de dano adicional quando determinar o dano perfurante adicional que o alvo recebe.",
  },
  {
    name: "Pistoleiro",
    source: "TCoE",
    abilityIncrease: { choose: ["dex"], amount: 1 },
    description:
      "Você tem uma mão rápida e um olhar afiado quando utiliza armas de fogo, garantindo a você os seguintes benefícios:\n" +
      "• Aumente o seu valor de Destreza em 1, até o máximo de 20.\n" +
      "• Você ganha proficiência com armas de fogo (veja \"Armas de Fogo\" no Guia do Mestre).\n" +
      "• Você ignora a propriedade de recarga de armas de fogo.\n" +
      "• Estar a 1,5 metro de distância de uma criatura hostil não impõe desvantagem em suas jogadas de ataque à distância.",
  },
  {
    name: "Telecinético",
    source: "TCoE",
    abilityIncrease: { choose: ["int", "wis", "cha"], amount: 1 },
    description:
      "Você aprende a mover coisas com sua mente, concedendo a você os seguintes benefícios:\n" +
      "• Aumente seu valor de Inteligência, Sabedoria ou Carisma em 1, até o máximo de 20.\n" +
      "• Você aprende o truque Mãos Mágicas. Você pode conjurá-lo sem componentes verbais ou somáticos, e você pode tornar a mão espectral invisível. Se você já souber essa magia, seu alcance é ampliado em 9 metros quando você a conjura. Seu atributo de conjuração para essa magia é o atributo que recebeu o aumento através desse talento.\n" +
      "• Como uma ação bônus, você pode tentar empurrar telecineticamente uma criatura que você possa ver a até 9 metros de você. Ao fazer isso, o alvo deve ser bem-sucedido em uma salvaguarda de Força (CD 8 + seu bônus de proficiência + o modificador do atributo aprimorado por este talento) ou será movido 1,5 metro em sua direção ou afastando-se de você. Uma criatura pode falhar propositalmente nessa salvaguarda.",
  },
  {
    name: "Telepático",
    source: "TCoE",
    abilityIncrease: { choose: ["int", "wis", "cha"], amount: 1 },
    description:
      "Você despertou a habilidade de se conectar mentalmente com os outros, concedendo a você os seguintes benefícios:\n" +
      "• Aumente seu valor de Inteligência, Sabedoria ou Carisma em 1, até o máximo de 20.\n" +
      "• Você pode falar telepaticamente com qualquer criatura que você possa ver a até 18 metros de você. Suas emissões telepáticas são em um idioma que você conheça, e a criatura compreende você apenas se souber esse idioma. Sua comunicação não fornece à criatura a habilidade de lhe responder telepaticamente.\n" +
      "• Você pode conjurar a magia Detectar Pensamentos sem a necessidade de espaço de magia ou componentes, e você deve finalizar um descanso longo antes de poder conjurar essa magia dessa forma novamente. Seu atributo de conjuração para essa magia é o atributo ampliado através desse talento. Se você tiver espaços de magia de 2º círculo ou superior, você pode conjurar essa magia com eles.",
  },
  {
    name: "Tocado pelas Fadas",
    source: "TCoE",
    abilityIncrease: { choose: ["int", "wis", "cha"], amount: 1 },
    description:
      "Sua exposição à magia de Faéria o modificou, fornecendo a você os seguintes benefícios:\n" +
      "• Aumente o seu valor de Inteligência, Sabedoria ou Carisma em 1, até o máximo de 20.\n" +
      "• Você aprende a magia Passo Nebuloso e mais uma magia de 1º círculo à sua escolha. Essa magia de 1º círculo deve ser das escolas de Adivinhação ou Encantamento. Você pode conjurar ambas as magias sem o gasto de um espaço de magia. Assim que conjurar uma dessas magias dessa forma, você não poderá conjurar a mesma magia novamente através desse talento até terminar um descanso longo. Você também pode conjurar essas magias usando um espaço de magia de círculo apropriado. O atributo de conjuração para essas magias é o atributo que recebeu o aprimoramento por este talento.",
  },
  {
    name: "Tocado pelas Sombras",
    source: "TCoE",
    abilityIncrease: { choose: ["int", "wis", "cha"], amount: 1 },
    description:
      "Sua exposição à magia do Sombral o modificou, fornecendo a você os seguintes benefícios:\n" +
      "• Aumente o seu valor de Inteligência, Sabedoria ou Carisma em 1, até o máximo de 20.\n" +
      "• Você aprende a magia Invisibilidade e mais uma magia de 1º círculo à sua escolha. Essa magia de 1º círculo deve ser das escolas de Ilusão ou Necromancia. Você pode conjurar ambas as magias sem o gasto de um espaço de magia. Assim que conjurar uma dessas magias dessa forma, você não poderá conjurar a mesma magia novamente através desse talento até terminar um descanso longo. Você também pode conjurar essas magias usando um espaço de magia de círculo apropriado. O atributo de conjuração para essas magias é o atributo que recebeu o aprimoramento por este talento.",
  },
];

/** Todos os talentos, ordenados por nome (pt-BR). */
export const FEATS_CATALOG: FeatDef[] = [...FEATS].sort((a, b) =>
  a.name.localeCompare(b.name, "pt-BR"),
);

/** Normaliza um nome: remove acentos, minúsculas, sem espaços nas pontas. */
function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const FEATS_BY_KEY: ReadonlyMap<string, FeatDef> = new Map(
  FEATS_CATALOG.map((f) => [normalizeName(f.name), f]),
);

type HomebrewFeats = { version: number; all: FeatDef[]; byKey: Map<string, FeatDef> };

let homebrewCache: HomebrewFeats | null = null;

/** Talentos homebrew do Mestre (do registro), com cache por versão. */
function homebrewFeats(): HomebrewFeats {
  const version = homebrewVersion();
  if (homebrewCache?.version === version) return homebrewCache;
  const feats: FeatDef[] = homebrewItems().flatMap((item) =>
    // Homebrew nunca sobrescreve um talento oficial com o mesmo nome.
    item.kind === "feat" && !FEATS_BY_KEY.has(normalizeName(item.data.name))
      ? [{ ...item.data, source: "Homebrew" as const, homebrewId: item.id }]
      : [],
  );
  homebrewCache = {
    version,
    all: [...FEATS_CATALOG, ...feats].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    byKey: new Map(feats.map((feat) => [normalizeName(feat.name), feat])),
  };
  return homebrewCache;
}

/** Talentos oficiais + homebrew do Mestre, em ordem alfabética. */
export function allFeats(): FeatDef[] {
  return homebrewFeats().all;
}

/** Busca um talento pelo nome (oficial ou homebrew), ignorando acentos, caixa e espaços nas pontas. */
export function findFeat(name: string): FeatDef | undefined {
  const key = normalizeName(name);
  return FEATS_BY_KEY.get(key) ?? homebrewFeats().byKey.get(key);
}
