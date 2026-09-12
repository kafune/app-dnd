import type { ClassDef } from "@/lib/types";

/**
 * Mago — Livro do Jogador (PHB) cap. 3, com Tradições Arcanas do PHB,
 * do Guia de Xanathar (XGtE) e do Caldeirão de Tasha (TCoE).
 * Dado de Vida: 1d6. Habilidade de conjuração: Inteligência.
 */
export const MAGO: ClassDef = {
  name: "Mago",
  source: "PHB",
  subclassLabel: "Tradição Arcana",
  subclassLevel: 2,
  features: [
    {
      name: "Conjuração",
      level: 1,
      description:
        "Como um estudante da magia arcana, você possui um grimório (livro de magias) que revela os primeiros vislumbres de seu verdadeiro poder. Inteligência é a sua habilidade de conjuração: CD das magias = 8 + bônus de proficiência + modificador de Inteligência; modificador de ataque de magia = bônus de proficiência + modificador de Inteligência. Você pode usar um foco arcano como foco de conjuração.\n" +
        "Truques. No 1º nível você conhece três truques da lista de mago. Você aprende truques adicionais conforme avança de nível: 3 truques do 1º ao 3º nível, 4 do 4º ao 9º nível e 5 a partir do 10º nível.\n" +
        "Grimório. No 1º nível seu grimório contém seis magias de mago de 1º nível à sua escolha. Um grimório não contém truques. A cada nível de mago adquirido, você adiciona duas magias de mago à sua escolha ao grimório, cada uma de um nível para o qual você possua espaços de magia.\n" +
        "Copiar uma magia para o grimório. Quando encontrar uma magia de mago de 1º nível ou superior (em um pergaminho ou em outro grimório), você pode copiá-la desde que seja de um nível que você possa preparar: gasta-se 2 horas e 50 po por nível da magia (componentes para experimentar a magia e tintas finas). Copiar uma magia do seu próprio grimório para outro livro (cópia reserva) custa apenas 1 hora e 10 po por nível de magia. Se perder o grimório, você pode transcrever as magias que tiver preparadas em um novo livro pelo mesmo procedimento.\n" +
        "Preparar e conjurar magias. A tabela O Mago mostra seus espaços de magia; para conjurar uma magia de 1º nível ou superior você gasta um espaço do nível da magia ou superior, e recupera todos os espaços gastos ao terminar um descanso longo. Você prepara, do seu grimório, uma lista de magias em número igual ao seu modificador de Inteligência + seu nível de mago (mínimo de uma), todas de níveis para os quais você tenha espaços. Conjurar uma magia não a remove da lista. Você pode mudar a lista ao terminar um descanso longo, gastando ao menos 1 minuto por nível de magia para cada magia da nova lista.\n" +
        "Conjuração de ritual. Você pode conjurar qualquer magia de mago do seu grimório que tenha o descritor ritual como um ritual, sem precisar tê-la preparada.",
    },
    {
      name: "Recuperação Arcana",
      level: 1,
      description:
        "Você aprendeu a recuperar parte de sua energia mágica estudando seu grimório. Uma vez por dia, ao terminar um descanso curto, você pode escolher espaços de magia gastos para recuperar. Os espaços recuperados podem ser de qualquer combinação de níveis, desde que a soma dos níveis seja igual ou inferior à metade do seu nível de mago (arredondado para cima) e nenhum deles seja de 6º nível ou superior.\n" +
        "Por exemplo, um mago de 4º nível pode recuperar até 2 níveis de espaços de magia: um espaço de 2º nível ou dois espaços de 1º nível.",
      resource: { name: "Recuperação Arcana", max: 1, recharge: "long" },
    },
    {
      name: "Tradição Arcana",
      level: 2,
      description:
        "No 2º nível você escolhe uma Tradição Arcana, moldando sua prática de magia: uma das oito escolas do Livro do Jogador (Abjuração, Adivinhação, Conjuração, Encantamento, Evocação, Ilusão, Necromancia e Transmutação), o Mago de Guerra (Guia de Xanathar) ou a Lâmina Cantante e a Ordem dos Escribas (Caldeirão de Tasha). Sua escolha concede características no 2º nível e novamente no 6º, 10º e 14º nível.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 4,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade à sua escolha em 2, ou dois valores de habilidade à sua escolha em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica. Pela regra opcional de talentos, você pode escolher um talento em vez do incremento.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 8,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade à sua escolha em 2, ou dois valores de habilidade à sua escolha em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica. Pela regra opcional de talentos, você pode escolher um talento em vez do incremento.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 12,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade à sua escolha em 2, ou dois valores de habilidade à sua escolha em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica. Pela regra opcional de talentos, você pode escolher um talento em vez do incremento.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 16,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade à sua escolha em 2, ou dois valores de habilidade à sua escolha em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica. Pela regra opcional de talentos, você pode escolher um talento em vez do incremento.",
    },
    {
      name: "Dominar Magia",
      level: 18,
      description:
        "No 18º nível você alcança tamanha maestria em determinadas magias que pode conjurá-las à vontade. Escolha uma magia de mago de 1º nível e uma magia de mago de 2º nível do seu grimório. Enquanto as tiver preparadas, você pode conjurá-las em seu nível mínimo sem gastar espaços de magia. Se quiser conjurá-las com um espaço de nível superior, gasta o espaço normalmente.\n" +
        "Gastando 8 horas de estudo, você pode trocar uma ou ambas as magias escolhidas por outras magias dos mesmos níveis.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 19,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade à sua escolha em 2, ou dois valores de habilidade à sua escolha em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica. Pela regra opcional de talentos, você pode escolher um talento em vez do incremento.",
    },
    {
      name: "Assinatura Mágica",
      level: 20,
      description:
        "No 20º nível você adquire domínio completo de duas poderosas magias e pode conjurá-las sem muito esforço. Escolha duas magias de mago de 3º nível do seu grimório como sua assinatura mágica. Você sempre tem essas magias preparadas, elas não contam no número de magias preparadas e você pode conjurar cada uma delas uma vez como magia de 3º nível sem gastar espaço de magia. Ao fazê-lo, você não pode repetir até terminar um descanso curto ou longo.\n" +
        "Se quiser conjurá-las com espaços de nível superior, gasta o espaço normalmente.",
      resource: { name: "Assinatura Mágica", max: 2, recharge: "short" },
    },
  ],
  subclasses: [
    // ------------------------------------------------------------------ PHB
    {
      name: "Escola de Abjuração",
      source: "PHB",
      description:
        "Enfatiza magias que bloqueiam, expulsam ou protegem. Os abjuradores são procurados para exorcizar espíritos, guardar locais contra espionagem mágica e selar portais planares.",
      features: [
        {
          name: "Abjuração Instruída",
          level: 2,
          description:
            "O ouro e o tempo que você precisa gastar para copiar uma magia da escola de abjuração em seu grimório são reduzidos à metade.",
        },
        {
          name: "Proteção Arcana",
          level: 2,
          description:
            "Quando você conjura uma magia de abjuração de 1º nível ou superior, pode simultaneamente usar uma vertente do poder da magia para criar uma proteção mágica em si mesmo, que dura até você terminar um descanso longo. A proteção tem pontos de vida iguais ao dobro do seu nível de mago + seu modificador de Inteligência. Sempre que você sofrer dano, a proteção sofre o dano no lugar; se o dano reduzir a proteção a 0 pontos de vida, você sofre o dano remanescente.\n" +
            "Quando a proteção estiver com 0 pontos de vida ela não absorve dano, mas a magia permanece: toda vez que você conjurar uma magia de abjuração de 1º nível ou superior, a proteção recupera pontos de vida iguais ao dobro do nível da magia.\n" +
            "Uma vez criada a proteção, você não pode criá-la novamente até terminar um descanso longo.",
          resource: { name: "Proteção Arcana", max: 1, recharge: "long" },
        },
        {
          name: "Proteção Projetada",
          level: 6,
          description:
            "Quando uma criatura que você possa ver a até 9 metros sofrer dano, você pode usar sua reação para fazer com que sua Proteção Arcana absorva aquele dano. Se o dano reduzir a proteção a 0 pontos de vida, a criatura protegida sofre o dano remanescente.",
        },
        {
          name: "Abjuração Aprimorada",
          level: 10,
          description:
            "Quando você conjurar uma magia de abjuração que exija um teste de habilidade como parte da conjuração (como contramágica e dissipar magia), você adiciona seu bônus de proficiência a esse teste de habilidade.",
        },
        {
          name: "Resistência à Magia",
          level: 14,
          description:
            "Você tem vantagem em testes de resistência contra magias. Além disso, você tem resistência contra o dano de magias.",
        },
      ],
    },
    {
      name: "Escola de Adivinhação",
      source: "PHB",
      description:
        "Os adivinhos separam os véus do espaço, tempo e consciência para ver com clareza o passado, o presente e o futuro, dominando magias de discernimento, visão remota, conhecimento sobrenatural e previsão.",
      features: [
        {
          name: "Adivinhação Instruída",
          level: 2,
          description:
            "O ouro e o tempo que você precisa gastar para copiar uma magia da escola de adivinhação em seu grimório são reduzidos à metade.",
        },
        {
          name: "Prodígio",
          level: 2,
          description:
            "Vislumbres do futuro começam a aparecer em sua consciência. Quando você termina um descanso longo, role dois d20 e anote os resultados. Você pode substituir qualquer jogada de ataque, teste de resistência ou teste de habilidade feito por você ou por outra criatura que você possa ver por uma dessas rolagens de premonição. Você deve decidir antes da rolagem e só pode substituir uma rolagem dessa forma uma vez por rodada.\n" +
            "Cada rolagem de premonição pode ser usada apenas uma vez. Ao terminar um descanso longo, você perde as rolagens não utilizadas.",
          resource: { name: "Prodígio", max: 2, recharge: "long", byLevel: { "2": 2, "14": 3 } },
        },
        {
          name: "Especialista em Adivinhação",
          level: 6,
          description:
            "Conjurar magias de adivinhação exige apenas uma fração do seu esforço. Quando você conjura uma magia de adivinhação de 2º nível ou superior usando um espaço de magia, você recupera um espaço de magia gasto. O espaço recuperado deve ser de nível inferior ao da magia conjurada e não pode ser maior que 5º nível.",
        },
        {
          name: "O Terceiro Olho",
          level: 10,
          description:
            "Você pode usar sua ação para aumentar seus poderes de percepção. Escolha um dos benefícios a seguir, que dura até você ficar incapacitado ou realizar um descanso curto ou longo. Você não pode usar essa característica novamente até terminar um descanso longo.\n" +
            "Visão no Escuro. Você adquire visão no escuro com alcance de 18 metros.\n" +
            "Visão Etérea. Você pode ver no Plano Etéreo com alcance de 18 metros.\n" +
            "Compreensão Maior. Você pode ler qualquer idioma.\n" +
            "Ver Invisibilidade. Você pode ver criaturas e objetos invisíveis a até 3 metros de você, desde que tenha linha de visão.",
          resource: { name: "O Terceiro Olho", max: 1, recharge: "long" },
        },
        {
          name: "Prodígio Maior",
          level: 14,
          description:
            "As visões em seus sonhos se intensificam e pintam um quadro mais preciso do que está para acontecer. Você rola três d20 para sua característica Prodígio, em vez de dois.",
        },
      ],
    },
    {
      name: "Escola de Conjuração",
      source: "PHB",
      description:
        "Prefere magias que produzem objetos e criaturas do nada: nuvens de gás mortal, criaturas invocadas de outros lugares e, com o domínio, teletransporte por vastas distâncias e outros planos.",
      features: [
        {
          name: "Conjuração Instruída",
          level: 2,
          description:
            "O ouro e o tempo que você precisa gastar para copiar uma magia da escola de conjuração em seu grimório são reduzidos à metade.",
        },
        {
          name: "Conjuração Menor",
          level: 2,
          description:
            "Você pode usar sua ação para conjurar um objeto inanimado em sua mão ou no chão, em um espaço desocupado que você possa ver a até 3 metros. O objeto não pode ter mais de 90 centímetros de lado nem pesar mais de 5 quilos, e sua forma deve ser a de um objeto não mágico que você já tenha visto. O objeto é visivelmente mágico, emanando penumbra a 1,5 metro.\n" +
            "O objeto desaparece depois de 1 hora, quando você usa essa característica novamente ou se sofrer ou causar qualquer dano.",
        },
        {
          name: "Transposição Benigna",
          level: 6,
          description:
            "Você pode usar sua ação para se teletransportar até 9 metros para um espaço desocupado que você possa ver. Alternativamente, você pode escolher um espaço no alcance ocupado por uma criatura Pequena ou Média; se ela for voluntária, vocês dois se teletransportam, trocando de lugar.\n" +
            "Uma vez usada, você não pode usar essa característica novamente até terminar um descanso longo ou até conjurar uma magia de conjuração de 1º nível ou superior.",
          resource: { name: "Transposição Benigna", max: 1, recharge: "long" },
        },
        {
          name: "Conjuração Focada",
          level: 10,
          description:
            "Enquanto você estiver concentrado em uma magia de conjuração, sua concentração não pode ser quebrada como resultado de ter sofrido dano.",
        },
        {
          name: "Invocações Resistentes",
          level: 14,
          description:
            "Qualquer criatura que você invocar ou criar com uma magia de conjuração terá 30 pontos de vida temporários.",
        },
      ],
    },
    {
      name: "Escola de Encantamento",
      source: "PHB",
      description:
        "Afia a habilidade de entrar magicamente na mente e seduzir pessoas e monstros; alguns encantadores são pacifistas que desarmam os violentos, outros são tiranos que dominam os involuntários.",
      features: [
        {
          name: "Encantamento Instruído",
          level: 2,
          description:
            "O ouro e o tempo que você precisa gastar para copiar uma magia da escola de encantamento em seu grimório são reduzidos à metade.",
        },
        {
          name: "Olhar Hipnotizante",
          level: 2,
          description:
            "Suas palavras suaves e olhar encantador podem escravizar magicamente outra criatura. Com uma ação, escolha uma criatura que você possa ver a até 1,5 metro. Se o alvo puder ver ou ouvir você, ele deve ser bem-sucedido em um teste de resistência de Sabedoria contra a CD de suas magias de mago ou ficará enfeitiçado por você até o final do seu próximo turno. O deslocamento da criatura enfeitiçada cai para 0, e ela fica incapacitada e visivelmente aturdida.\n" +
            "Nos turnos seguintes, você pode usar sua ação para manter o efeito, estendendo a duração até o final do seu próximo turno. O efeito termina se você se afastar mais de 1,5 metro da criatura, se ela não puder ver nem ouvir você ou se ela sofrer dano.\n" +
            "Assim que o efeito terminar, ou se a criatura for bem-sucedida no teste de resistência inicial, você não pode usar essa característica nessa criatura novamente até terminar um descanso longo.",
        },
        {
          name: "Encanto Instintivo",
          level: 6,
          description:
            "Quando uma criatura que você possa ver a até 9 metros realizar uma jogada de ataque contra você, você pode usar sua reação para desviar o ataque, desde que exista outra criatura no alcance do ataque. O atacante deve realizar um teste de resistência de Sabedoria contra a CD de suas magias de mago; se falhar, deve atacar a criatura mais próxima dele, excluindo você e ele mesmo (se houver várias, o atacante escolhe). Em um sucesso, você não pode usar essa característica contra esse atacante novamente até terminar um descanso longo.\n" +
            "Você deve decidir usar essa característica antes de saber se o ataque acertou ou errou. Criaturas que não podem ser enfeitiçadas são imunes ao efeito.",
        },
        {
          name: "Dividir Encantamento",
          level: 10,
          description:
            "Quando você conjurar uma magia de encantamento de 1º nível ou superior que tenha uma única criatura como alvo, você pode fazer com que ela afete uma segunda criatura.",
        },
        {
          name: "Alterar Memórias",
          level: 14,
          description:
            "Você ganha a habilidade de tornar uma criatura inconsciente da sua influência mágica. Quando você conjurar uma magia de encantamento para enfeitiçar uma ou mais criaturas, você pode alterar a compreensão de uma delas para que continue sem saber que foi enfeitiçada.\n" +
            "Além disso, uma vez antes de a magia expirar, você pode usar sua ação para tentar fazer a criatura escolhida esquecer parte do tempo em que ficou enfeitiçada. A criatura deve ser bem-sucedida em um teste de resistência de Inteligência contra a CD de suas magias de mago ou perderá uma quantidade de horas de memória igual a 1 + seu modificador de Carisma (mínimo 1). Você pode fazer a criatura esquecer menos tempo, e o total não pode exceder a duração da sua magia de encantamento.",
        },
      ],
    },
    {
      name: "Escola de Evocação",
      source: "PHB",
      description:
        "Foca o estudo em criar poderosos efeitos elementais: frio cortante, chamas intensas, trovão estrondoso, relâmpagos devastadores e ácido ardente. Evocadores servem como artilharia de exércitos ou protegem os fracos.",
      features: [
        {
          name: "Evocação Instruída",
          level: 2,
          description:
            "O ouro e o tempo que você precisa gastar para copiar uma magia da escola de evocação em seu grimório são reduzidos à metade.",
        },
        {
          name: "Esculpir Magias",
          level: 2,
          description:
            "Você pode criar bolsões de segurança relativa contra os efeitos de suas magias de evocação. Quando você conjurar uma magia de evocação que afete outras criaturas que você possa ver, você pode escolher um número delas igual a 1 + o nível da magia. As criaturas escolhidas passam automaticamente em seus testes de resistência contra a magia e não sofrem dano se normalmente sofreriam metade do dano em um sucesso.",
        },
        {
          name: "Truque Potente",
          level: 6,
          description:
            "Seus truques de dano afetam até mesmo as criaturas que evitariam a força do efeito. Quando uma criatura passa em um teste de resistência contra um truque seu, ela sofre metade do dano do truque (se houver), mas não sofre nenhum efeito adicional.",
        },
        {
          name: "Evocação Potencializada",
          level: 10,
          description:
            "Você pode adicionar seu modificador de Inteligência a uma jogada de dano de qualquer magia de evocação de mago que você conjurar. O bônus se aplica a uma única rolagem de dano da magia, não a múltiplas rolagens.",
        },
        {
          name: "Sobrecarga",
          level: 14,
          description:
            "Você pode aumentar o poder de suas magias mais simples. Quando você conjurar uma magia de mago de 5º nível ou inferior (exceto truques) que cause dano, a magia causa o dano máximo.\n" +
            "Na primeira vez que fizer isso, você não sofre efeito adverso. Se usar a característica de novo antes de terminar um descanso longo, você sofre 2d12 de dano necrótico para cada nível da magia imediatamente após conjurá-la. Cada vez que usar a característica novamente antes de terminar um descanso longo, o dano necrótico por nível da magia aumenta em 1d12. Esse dano ignora resistência e imunidade.",
        },
      ],
    },
    {
      name: "Escola de Ilusão",
      source: "PHB",
      description:
        "Estuda magias que ofuscam os sentidos, confundem a mente e enganam até os mais sábios. Sua magia é sutil, mas as ilusões fazem o impossível parecer real.",
      // Ilusão Menor Aprimorada (2º nível) dá o truque de graça.
      spells: { "2": ["Ilusão Menor"] },
      features: [
        {
          name: "Ilusão Instruída",
          level: 2,
          description:
            "O ouro e o tempo que você precisa gastar para copiar uma magia da escola de ilusão em seu grimório são reduzidos à metade.",
        },
        {
          name: "Ilusão Menor Aprimorada",
          level: 2,
          description:
            "Você aprende o truque ilusão menor. Se já o conhece, aprende um truque de mago diferente à sua escolha. O truque não conta no número de truques que você conhece.\n" +
            "Quando você conjurar ilusão menor, pode criar tanto um som quanto uma imagem com uma única conjuração da magia.",
        },
        {
          name: "Ilusões Moldáveis",
          level: 6,
          description:
            "Quando você conjura uma magia de ilusão com duração de 1 minuto ou mais, você pode usar sua ação para mudar a natureza da ilusão (respeitando os parâmetros normais da magia), desde que possa ver a ilusão.",
        },
        {
          name: "Eu Ilusório",
          level: 10,
          description:
            "Você pode criar uma duplicata ilusória de si mesmo em um instante, como reação instintiva ao perigo. Quando uma criatura realizar uma jogada de ataque contra você, você pode usar sua reação para interpor a duplicata ilusória entre o atacante e você. O ataque erra você automaticamente e então a ilusão se dissipa.\n" +
            "Uma vez usada, você não pode usar essa característica novamente até terminar um descanso curto ou longo.",
          resource: { name: "Eu Ilusório", max: 1, recharge: "short" },
        },
        {
          name: "Realidade Ilusória",
          level: 14,
          description:
            "Você aprendeu a tecer magia sombria em suas ilusões para torná-las semirreais. Quando você conjura uma magia de ilusão de 1º nível ou superior, você pode escolher um objeto inanimado e não mágico que faça parte da ilusão e torná-lo real. Você pode fazer isso no seu turno, com uma ação bônus, enquanto a magia estiver em efeito. O objeto permanece real por 1 minuto (por exemplo, uma ponte ilusória sobre um abismo que se torna real tempo suficiente para os aliados atravessarem).\n" +
            "O objeto não pode causar dano ou ferimento direto a ninguém.",
        },
      ],
    },
    {
      name: "Escola de Necromancia",
      source: "PHB",
      description:
        "Explora as forças cósmicas da vida, morte e morte-vida, aprendendo a manipular a energia que anima todas as coisas e a transformar força vital em poder mágico.",
      features: [
        {
          name: "Necromancia Instruída",
          level: 2,
          description:
            "O ouro e o tempo que você precisa gastar para copiar uma magia da escola de necromancia em seu grimório são reduzidos à metade.",
        },
        {
          name: "Colheita Sinistra",
          level: 2,
          description:
            "Você ganha a habilidade de ceifar a energia vital das criaturas que mata com suas magias. Uma vez por turno, quando você matar uma ou mais criaturas com uma magia de 1º nível ou superior, você recupera pontos de vida iguais ao dobro do nível da magia, ou ao triplo do nível da magia se ela pertencer à escola de necromancia. Você não recebe esse benefício por matar constructos ou mortos-vivos.",
        },
        {
          name: "Escravos Mortos-Vivos",
          level: 6,
          description:
            "Você adiciona a magia animar mortos ao seu grimório, se ainda não a possuir. Quando você conjurar animar mortos, pode escolher um corpo ou pilha de ossos adicional, criando outro zumbi ou esqueleto.\n" +
            "Toda vez que você criar um morto-vivo com uma magia de necromancia, ele tem benefícios adicionais: o máximo de pontos de vida da criatura aumenta em uma quantidade igual ao seu nível de mago, e a criatura adiciona seu bônus de proficiência às jogadas de dano dela.",
        },
        {
          name: "Acostumado à Morte-Vida",
          level: 10,
          description:
            "Você tem resistência a dano necrótico e seu máximo de pontos de vida não pode ser reduzido. Você gastou tanto tempo lidando com mortos-vivos e com as forças que os animam que se acostumou a alguns dos seus piores efeitos.",
        },
        {
          name: "Comandar Mortos-Vivos",
          level: 14,
          description:
            "Você pode usar magia para trazer mortos-vivos ao seu controle, até os criados por outros magos. Com uma ação, escolha um morto-vivo que você possa ver a até 18 metros. A criatura deve realizar um teste de resistência de Carisma contra a CD de suas magias de mago. Se for bem-sucedida, você não pode usar essa característica nela novamente. Se falhar, ela se torna amistosa a você e obedece a seus comandos até você usar essa característica novamente.\n" +
            "Mortos-vivos inteligentes são mais difíceis de controlar: se o alvo tiver Inteligência 8 ou superior, tem vantagem no teste de resistência; se falhar e tiver Inteligência 12 ou superior, pode repetir o teste ao final de cada hora até obter sucesso e se libertar.",
        },
      ],
      spells: { "6": ["Animar Mortos"] },
    },
    {
      name: "Escola de Transmutação",
      source: "PHB",
      description:
        "Estuda magias que modificam energia e matéria. O mundo é eminentemente mutável e o transmutador se deleita em ser o ferreiro na forja da realidade.",
      features: [
        {
          name: "Transmutação Instruída",
          level: 2,
          description:
            "O ouro e o tempo que você precisa gastar para copiar uma magia da escola de transmutação em seu grimório são reduzidos à metade.",
        },
        {
          name: "Alquimia Menor",
          level: 2,
          description:
            "Você pode alterar temporariamente as propriedades físicas de um objeto não mágico, mudando-o de uma substância para outra. Você realiza um procedimento alquímico especial em um objeto composto inteiramente de madeira, pedra (mas não pedra preciosa), ferro, cobre ou prata, transformando-o em um material diferente dentre esses. Para cada 10 minutos gastos no procedimento, você pode transformar até 30 centímetros cúbicos de material. Após 1 hora, ou se você perder a concentração (como se estivesse se concentrando em uma magia), o material reverte à substância original.",
        },
        {
          name: "Pedra de Transmutador",
          level: 6,
          description:
            "Você pode gastar 8 horas criando uma pedra de transmutador que armazena magia de transmutação. Você pode se beneficiar da pedra ou dá-la a outra criatura; quem a possuir ganha um benefício, escolhido por você ao criar a pedra:\n" +
            "• Visão no escuro com alcance de 18 metros.\n" +
            "• Um aumento de 3 metros no deslocamento enquanto a criatura não estiver sobrecarregada.\n" +
            "• Proficiência em testes de resistência de Constituição.\n" +
            "• Resistência a dano de ácido, frio, fogo, elétrico ou trovejante (à sua escolha ao conceder o benefício).\n" +
            "Cada vez que você conjurar uma magia de transmutação de 1º nível ou superior, pode mudar o efeito da pedra, se ela estiver em sua posse. Se você criar uma nova pedra de transmutador, a anterior para de funcionar.",
        },
        {
          name: "Metamorfo",
          level: 10,
          description:
            "Você adiciona a magia metamorfose ao seu grimório, se ainda não a possuir. Você pode conjurar metamorfose sem gastar um espaço de magia; ao fazê-lo, só pode escolher a si mesmo como alvo e se transforma em uma besta com nível de desafio 1 ou menor.\n" +
            "Uma vez conjurada dessa forma, você não pode fazê-lo novamente até terminar um descanso curto ou longo, mas ainda pode conjurá-la normalmente usando espaços de magia.",
          resource: { name: "Metamorfo", max: 1, recharge: "short" },
        },
        {
          name: "Mestre Transmutador",
          level: 14,
          description:
            "Você pode usar sua ação para consumir a reserva de magia de transmutação armazenada em sua pedra de transmutador em uma única explosão. Escolha um dos efeitos a seguir; a pedra é destruída e não pode ser refeita até você terminar um descanso longo.\n" +
            "Transformação Maior. Você transmuta um objeto não mágico de até 1,5 metro cúbico em outro objeto não mágico de tamanho e massa similares e de valor igual ou inferior. Você deve gastar 10 minutos manipulando o objeto.\n" +
            "Panaceia. Você remove todas as maldições, doenças e venenos que afetam uma criatura tocada com a pedra. A criatura também recupera todos os pontos de vida.\n" +
            "Restaurar Vida. Você conjura reviver os mortos em uma criatura tocada com a pedra, sem gastar espaço de magia nem precisar ter a magia no grimório.\n" +
            "Restaurar Juventude. Você toca a pedra em uma criatura voluntária e a idade aparente dela é reduzida em 3d10 anos, até o mínimo de 13 anos. Esse efeito não estende o tempo de vida da criatura.",
        },
      ],
      spells: { "10": ["Metamorfose"] },
    },
    // ----------------------------------------------------------------- XGtE
    {
      name: "Mago de Guerra",
      source: "XGtE",
      description:
        "Combina os princípios de evocação e abjuração em vez de se especializar em uma delas: a magia é ao mesmo tempo arma e armadura, e o mago de guerra age rápido para obter controle tático da batalha.",
      features: [
        {
          name: "Deflexão Arcana",
          level: 2,
          description:
            "Você aprendeu a moldar sua magia para se fortificar contra danos. Quando for atingido por um ataque ou falhar em um teste de resistência, você pode usar sua reação para ganhar +2 na CA contra aquele ataque ou +4 naquele teste de resistência.\n" +
            "Quando usar essa característica, você não pode conjurar magias que não sejam truques até o final do seu próximo turno.",
        },
        {
          name: "Astúcia Tática",
          level: 2,
          description:
            "Sua aguda capacidade de avaliar situações táticas permite agir rapidamente em batalha. Você pode adicionar seu modificador de Inteligência às suas jogadas de iniciativa.",
        },
        {
          name: "Surto de Poder",
          level: 6,
          description:
            "Você pode armazenar energia mágica dentro de si para fortalecer suas magias ofensivas. Em sua forma armazenada, essa energia é chamada de surto de poder.\n" +
            "Você pode armazenar um número máximo de surtos de poder igual ao seu modificador de Inteligência (mínimo de um). Sempre que terminar um descanso longo, seu número de surtos de poder é reiniciado para um. Sempre que terminar com sucesso uma magia com dissipar magia ou contramágica, você ganha um surto de poder, como se roubasse a magia da magia que evitou. Se terminar um descanso curto sem surtos de poder, você ganha um surto de poder.\n" +
            "Uma vez por turno, quando causar dano a uma criatura ou objeto com uma magia de mago, você pode gastar um surto de poder para causar dano de energia adicional a esse alvo igual à metade do seu nível de mago.",
          resource: { name: "Surtos de Poder", max: "int", recharge: "long" },
        },
        {
          name: "Magia Duradoura",
          level: 10,
          description:
            "A magia que você canaliza ajuda a evitar danos. Enquanto mantiver concentração em uma magia, você tem +2 na CA e em todos os testes de resistência.",
        },
        {
          name: "Blindagem Defletora",
          level: 14,
          description:
            "Sua Deflexão Arcana se infunde com magia mortal. Quando usar Deflexão Arcana, você pode gerar energia mágica sobre si mesmo: até três criaturas à sua escolha que você possa ver a até 18 metros sofrem, cada uma, dano de energia igual à metade do seu nível de mago.",
        },
      ],
    },
    // ----------------------------------------------------------------- TCoE
    {
      name: "Lâmina Cantante",
      source: "TCoE",
      description:
        "Tradição criada pelos elfos que incorpora o manejo das espadas e a dança: manobras intrincadas e elegantes que repelem danos e canalizam a magia em ataques devastadores e defesas astuciosas.",
      features: [
        {
          name: "Treinamento na Guerra e na Música",
          level: 2,
          description:
            "Você adquire proficiência com armaduras leves e com um tipo de arma corpo a corpo de uma mão à sua escolha. Você também ganha proficiência na perícia Atuação, caso ainda não a possua.",
        },
        {
          name: "Canção da Lâmina",
          level: 2,
          description:
            "Você pode invocar uma magia élfica secreta chamada Canção da Lâmina, desde que não esteja vestindo armadura média ou pesada nem usando escudo. Com uma ação bônus, você inicia a Canção da Lâmina, que dura 1 minuto. Ela termina antes se você ficar incapacitado, vestir armadura média ou pesada, usar um escudo ou usar as duas mãos para atacar com uma arma. Você também pode dissipá-la quando desejar (nenhuma ação é necessária).\n" +
            "Enquanto a Canção da Lâmina estiver ativa: você ganha um bônus na CA igual ao seu modificador de Inteligência (mínimo +1); seu deslocamento aumenta em 3 metros; você tem vantagem em testes de Destreza (Acrobacia); e você ganha um bônus igual ao seu modificador de Inteligência (mínimo +1) em qualquer teste de resistência de Constituição para manter a concentração em uma magia.\n" +
            "Você pode usar essa característica um número de vezes igual ao seu bônus de proficiência e recupera todos os usos ao terminar um descanso curto ou longo.",
          resource: { name: "Canção da Lâmina", max: "prof", recharge: "short" },
        },
        {
          name: "Ataque Extra",
          level: 6,
          description:
            "Você pode atacar duas vezes, em vez de uma, sempre que realizar a ação de Ataque no seu turno. Além disso, você pode conjurar um de seus truques no lugar de um desses ataques.",
        },
        {
          name: "Canção da Defesa",
          level: 10,
          description:
            "Você pode direcionar sua magia para absorver dano enquanto a Canção da Lâmina estiver ativa. Quando sofrer dano, você pode usar sua reação para gastar um espaço de magia e reduzir o dano sofrido em uma quantia igual a cinco vezes o nível do espaço gasto.",
        },
        {
          name: "Canção da Vitória",
          level: 14,
          description:
            "Você pode adicionar seu modificador de Inteligência (mínimo +1) ao dano dos seus ataques com arma corpo a corpo enquanto a Canção da Lâmina estiver ativa.",
        },
      ],
    },
    {
      name: "Ordem dos Escribas",
      source: "TCoE",
      description:
        "A mais estudiosa das ordens de magos, dedicada a registrar descobertas mágicas. Um mago escriba desperta magicamente seu grimório, transformando-o em um companheiro consciente.",
      features: [
        {
          name: "Pena Mágica",
          level: 2,
          description:
            "Com uma ação bônus, você pode criar magicamente uma pena Minúscula em sua mão livre. A pena mágica tem as seguintes propriedades:\n" +
            "• A pena não requer tinta; ao usá-la, ela produz tinta na cor que você escolher sobre a superfície de escrita.\n" +
            "• O tempo para copiar uma magia para seu grimório é de 2 minutos por nível da magia se você usar a pena para a transcrição.\n" +
            "• Com uma ação bônus, você pode apagar qualquer coisa que tenha escrito com a pena balançando-a sobre o texto, desde que o texto esteja a até 1,5 metro de você.\n" +
            "A pena desaparece se você criar outra ou se morrer.",
        },
        {
          name: "Livro de Magia Desperto",
          level: 2,
          description:
            "Usando tintas especialmente preparadas e encantamentos antigos de sua ordem, você desperta uma consciência arcana dentro do seu grimório. Enquanto estiver segurando o livro, ele fornece os seguintes benefícios:\n" +
            "• Você pode usar o livro como foco de conjuração para suas magias de mago.\n" +
            "• Quando você conjurar uma magia de mago com um espaço de magia, pode substituir temporariamente o tipo de dano dela pelo tipo de dano de outra magia do seu grimório, alterando a fórmula da magia apenas para essa conjuração. A magia usada como base para o tipo de dano precisa ser do mesmo nível do espaço de magia utilizado.\n" +
            "• Quando você conjurar uma magia de mago como ritual, pode usar o tempo de conjuração normal da magia em vez de adicionar 10 minutos. Uma vez usado esse benefício, você não pode usá-lo novamente até terminar um descanso longo.\n" +
            "Se necessário, você pode substituir o livro durante um descanso curto usando sua Pena Mágica para escrever selos arcanos em outro livro em branco ou em um grimório mágico ao qual esteja sintonizado. Ao fim do descanso, a consciência do seu grimório é transportada para o novo livro junto com todas as suas magias; se o grimório anterior ainda existir, as magias desaparecem de suas páginas.",
        },
        {
          name: "Manifestar Mente",
          level: 6,
          description:
            "Você pode invocar a mente do seu Livro de Magia Desperto. Com uma ação bônus, enquanto portar o livro, você faz a mente dele se manifestar como um objeto espectral Minúsculo pairando em um espaço desocupado à sua escolha a até 18 metros. A mente espectral é intangível, não ocupa seu espaço e irradia penumbra em um raio de 3 metros; ela se parece com um tomo fantasmagórico, uma cascata de texto ou um estudioso do seu passado (à sua escolha).\n" +
            "Enquanto manifesta, a mente espectral pode ver e ouvir e tem visão no escuro de 18 metros; ela compartilha telepaticamente com você o que percebe (nenhuma ação é necessária). Sempre que você conjurar uma magia de mago no seu turno, pode fazê-lo como se estivesse no espaço da mente espectral, usando os sentidos dela; você pode fazer isso um número de vezes igual ao seu bônus de proficiência e recupera todos os usos ao terminar um descanso longo.\n" +
            "Com uma ação bônus, você pode mover a mente espectral até 9 metros para um espaço desocupado que possa ver; ela atravessa criaturas, mas não objetos.\n" +
            "A mente espectral para de se manifestar se ficar a mais de 90 metros de você, se alguém conjurar dissipar magia sobre ela, se o Livro de Magia Desperto for destruído, se você morrer ou se usar sua ação bônus para dispensá-la. Uma vez manifestada, você não pode fazê-lo de novo até terminar um descanso longo, a menos que gaste um espaço de magia de qualquer nível para isso.",
          resource: { name: "Manifestar Mente", max: 1, recharge: "long" },
        },
        {
          name: "Mestre Escriba",
          level: 10,
          description:
            "Sempre que terminar um descanso longo, você pode criar um pergaminho de magia tocando sua Pena Mágica em um papel ou pergaminho em branco e fazendo com que uma magia do seu Livro de Magia Desperto seja copiada para ele. O grimório deve estar a até 1,5 metro de você.\n" +
            "A magia escolhida deve ser de 1º ou 2º nível e ter tempo de conjuração de 1 ação. No pergaminho, o poder da magia é aprimorado: ela conta como um nível acima do normal. Você pode conjurar a magia do pergaminho usando uma ação para lê-lo. O pergaminho é ininteligível para os outros, e a magia desaparece dele quando você a conjura ou quando termina seu próximo descanso longo.\n" +
            "Você também é apto na criação de pergaminhos de magia (descritos no Guia do Mestre): o ouro e o tempo gastos para criar um pergaminho caem pela metade se você usar sua Pena Mágica.",
        },
        {
          name: "Um com a Palavra",
          level: 14,
          description:
            "Sua alma se entrelaçou ao seu Livro de Magia Desperto. Enquanto o livro estiver com você, você tem vantagem em todos os testes de Inteligência (Arcanismo).\n" +
            "Além disso, se você sofrer dano enquanto a mente espectral do livro estiver manifestada, você pode prevenir todo esse dano usando sua reação para fazer a mente espectral desaparecer. Então role 3d6: o grimório perde temporariamente magias à sua escolha cujos níveis somem um valor igual ou maior que a rolagem (por exemplo, com um total 9, podem desaparecer uma magia de 9º nível, três de 3º nível ou qualquer combinação que some 9). Se não houver magias suficientes no grimório para cobrir esse custo, você cai a 0 pontos de vida.\n" +
            "Até você terminar 1d6 descansos longos, você é incapaz de conjurar as magias perdidas, mesmo que as encontre em um pergaminho ou em outro grimório. Após terminar o número de descansos exigido, as magias reaparecem no seu grimório.\n" +
            "Uma vez usada essa reação, você não pode usá-la novamente até terminar um descanso longo.",
          resource: { name: "Um com a Palavra", max: 1, recharge: "long" },
        },
      ],
    },
  ],
  multiclass: {
    prerequisite: "Inteligência 13",
    proficiencies: "Nenhuma",
    skills: 0,
  },
};
