import type { ClassDef } from "@/lib/types";

const ASI_DESC =
  "Você pode aumentar um valor de habilidade à sua escolha em 2, ou dois valores de habilidade à sua escolha em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica. Pela regra opcional de talentos, você pode escolher um talento em vez do incremento.";

/**
 * Monge — Livro do Jogador (PHB) cap. 3, com Tradições Monásticas do PHB,
 * do Guia de Xanathar (XGtE) e do Caldeirão de Tasha (TCoE).
 * Dado de Vida: 1d8. CD de resistência de Chi = 8 + proficiência + mod. de Sabedoria.
 */
export const MONGE: ClassDef = {
  name: "Monge",
  source: "PHB",
  subclassLabel: "Tradição Monástica",
  subclassLevel: 3,
  features: [
    {
      name: "Defesa sem Armadura",
      level: 1,
      description:
        "Quando você não estiver vestindo nenhuma armadura nem empunhando um escudo, sua Classe de Armadura é 10 + seu modificador de Destreza + seu modificador de Sabedoria.",
    },
    {
      name: "Artes Marciais",
      level: 1,
      description:
        "Sua prática nas artes marciais concede maestria nos estilos de combate que usam golpes desarmados e armas de monge: espadas curtas e quaisquer armas simples corpo a corpo que não tenham a propriedade duas mãos ou pesada.\n" +
        "Enquanto estiver desarmado ou empunhando apenas armas de monge, e não estiver vestindo armadura nem empunhando escudo, você ganha os seguintes benefícios:\n" +
        "• Você pode usar Destreza em vez de Força nas jogadas de ataque e dano dos seus golpes desarmados e armas de monge.\n" +
        "• Você pode rolar o dado de Artes Marciais no lugar do dano normal dos seus golpes desarmados e armas de monge. O dado é 1d4 do 1º ao 4º nível, 1d6 do 5º ao 10º nível, 1d8 do 11º ao 16º nível e 1d10 do 17º nível em diante.\n" +
        "• Quando você usa a ação de Ataque com um golpe desarmado ou uma arma de monge no seu turno, você pode realizar um golpe desarmado com uma ação bônus (por exemplo, atacar com um bordão e então dar um golpe desarmado como ação bônus).\n" +
        "Alguns monastérios usam formas especializadas de armas de monge, como o nunchaku (uma clava de dois pedaços de madeira ligados por corrente) ou o kama (uma foice de lâmina fina); use as estatísticas das armas correspondentes do capítulo 5.",
    },
    {
      name: "Chi",
      level: 2,
      description:
        "Seu treinamento permite controlar a energia mística do chi, representada por pontos de chi. Você tem um número de pontos de chi igual ao seu nível de monge. Você pode gastar esses pontos para abastecer várias características de chi; começa conhecendo três delas (Rajada de Golpes, Defesa Paciente e Passo do Vento) e aprende mais à medida que sobe de nível.\n" +
        "Quando você gasta um ponto de chi, ele fica indisponível até você terminar um descanso curto ou longo, ao fim do qual todos os pontos gastos retornam. Você deve gastar pelo menos 30 minutos do descanso meditando para recuperá-los.\n" +
        "Algumas características de chi exigem um teste de resistência do alvo. CD de resistência de Chi = 8 + seu bônus de proficiência + seu modificador de Sabedoria.\n" +
        "Rajada de Golpes. Imediatamente após realizar a ação de Ataque no seu turno, você pode gastar 1 ponto de chi para realizar dois golpes desarmados com uma ação bônus.\n" +
        "Defesa Paciente. Você pode gastar 1 ponto de chi para realizar a ação de Esquivar com uma ação bônus no seu turno.\n" +
        "Passo do Vento. Você pode gastar 1 ponto de chi para realizar a ação de Desengajar ou Disparada com uma ação bônus no seu turno, e sua distância de salto é dobrada nesse turno.",
      resource: { name: "Pontos de Chi", max: "level", recharge: "short" },
    },
    {
      name: "Movimento sem Armadura",
      level: 2,
      description:
        "Seu deslocamento aumenta enquanto você não estiver usando armadura nem empunhando escudo: +3 metros do 2º ao 5º nível, +4,5 metros do 6º ao 9º nível, +6 metros do 10º ao 13º nível, +7,5 metros do 14º ao 17º nível e +9 metros do 18º nível em diante.\n" +
        "No 9º nível, você ganha a habilidade de se mover através de superfícies verticais e sobre líquidos no seu turno sem cair durante o movimento.",
    },
    {
      name: "Tradição Monástica",
      level: 3,
      description:
        "No 3º nível você ingressa em uma tradição monástica: Caminho da Mão Aberta, Caminho da Sombra ou Caminho dos Quatro Elementos (Livro do Jogador); Estilo do Mestre Bêbado, Estilo do Kensei ou Estilo da Alma Solar (Guia de Xanathar); Caminho da Misericórdia ou Caminho da Forma Astral (Caldeirão de Tasha). Sua tradição concede características no 3º nível e novamente no 6º, 11º e 17º nível.",
    },
    {
      name: "Defletir Projéteis",
      level: 3,
      description:
        "Você pode usar sua reação para defletir ou apanhar o projétil quando for atingido por um ataque com arma à distância. O dano sofrido do ataque é reduzido em 1d10 + seu modificador de Destreza + seu nível de monge.\n" +
        "Se o dano for reduzido a 0, você pode apanhar o projétil, se ele for pequeno o suficiente para ser segurado em uma mão e você tiver pelo menos uma mão livre. Nesse caso, você pode gastar 1 ponto de chi para realizar um ataque à distância com a arma ou munição apanhada, como parte da mesma reação. Você faz esse ataque com proficiência, independentemente das armas em que é proficiente, e o projétil conta como arma de monge para o ataque, com distância de 6/18 metros.",
    },
    { name: "Incremento no Valor de Habilidade", level: 4, asi: true, description: ASI_DESC },
    {
      name: "Queda Lenta",
      level: 4,
      description:
        "Você pode usar sua reação, quando cair, para reduzir o dano de queda sofrido em um valor igual a cinco vezes o seu nível de monge.",
    },
    {
      name: "Ataque Extra",
      level: 5,
      description:
        "Você pode atacar duas vezes, em vez de uma, sempre que realizar a ação de Ataque no seu turno.",
    },
    {
      name: "Ataque Atordoante",
      level: 5,
      description:
        "Você pode interferir no fluxo de chi do corpo de um oponente. Quando atingir outra criatura com um ataque corpo a corpo com arma, você pode gastar 1 ponto de chi para tentar um ataque atordoante. O alvo deve ser bem-sucedido em um teste de resistência de Constituição (CD de Chi) ou ficará atordoado até o final do seu próximo turno.",
    },
    {
      name: "Golpes de Chi",
      level: 6,
      description:
        "Seus golpes desarmados contam como armas mágicas para o propósito de superar resistência e imunidade a ataques e danos não mágicos.",
    },
    {
      name: "Evasão",
      level: 7,
      description:
        "Você pode se esquivar agilmente de certos efeitos em área, como o sopro elétrico de um dragão azul ou uma bola de fogo. Quando for alvo de um efeito que permite um teste de resistência de Destreza para sofrer metade do dano, você não sofre dano algum se passar e apenas metade do dano se falhar.",
    },
    {
      name: "Mente Tranquila",
      level: 7,
      description:
        "Você pode usar sua ação para terminar um efeito em si mesmo que esteja lhe deixando enfeitiçado ou amedrontado.",
    },
    { name: "Incremento no Valor de Habilidade", level: 8, asi: true, description: ASI_DESC },
    {
      name: "Aprimoramento de Movimento sem Armadura",
      level: 9,
      description:
        "Você ganha a habilidade de se mover através de superfícies verticais e sobre líquidos no seu turno sem cair durante o movimento (o bônus de deslocamento de Movimento sem Armadura continua subindo pela tabela: +4,5 m no 9º nível, +6 m no 10º).",
    },
    {
      name: "Pureza Corporal",
      level: 10,
      description:
        "Sua maestria do chi flui através de você, tornando-o imune a doenças e venenos.",
    },
    { name: "Incremento no Valor de Habilidade", level: 12, asi: true, description: ASI_DESC },
    {
      name: "Idiomas do Sol e da Lua",
      level: 13,
      description:
        "Você aprende a tocar o chi de outras mentes, o que faz com que você compreenda todos os idiomas falados. Além disso, qualquer criatura que possa entender um idioma pode entender o que você fala.",
    },
    {
      name: "Alma de Diamante",
      level: 14,
      description:
        "Sua maestria do chi concede proficiência em todos os testes de resistência.\n" +
        "Além disso, toda vez que você realizar um teste de resistência e falhar, você pode gastar 1 ponto de chi para rolá-lo novamente e ficar com o segundo resultado.",
    },
    {
      name: "Corpo Atemporal",
      level: 15,
      description:
        "Seu chi o sustenta de tal forma que você não sofre os efeitos da velhice e não pode ser envelhecido magicamente; você ainda morrerá de velhice, no entanto. Além disso, você não precisa mais de comida ou água.",
    },
    { name: "Incremento no Valor de Habilidade", level: 16, asi: true, description: ASI_DESC },
    {
      name: "Corpo Vazio",
      level: 18,
      description:
        "Você pode usar sua ação para gastar 4 pontos de chi e ficar invisível por 1 minuto. Durante esse tempo, você também tem resistência a todos os danos, exceto dano de energia.\n" +
        "Além disso, você pode gastar 8 pontos de chi para conjurar a magia projeção astral, sem precisar de componentes materiais. Ao fazê-lo, você não pode levar nenhuma outra criatura com você.",
    },
    { name: "Incremento no Valor de Habilidade", level: 19, asi: true, description: ASI_DESC },
    {
      name: "Auto Aperfeiçoamento",
      level: 20,
      description:
        "Quando você rolar iniciativa e não tiver nenhum ponto de chi restante, você recupera 4 pontos de chi.",
    },
  ],
  subclasses: [
    // ------------------------------------------------------------------ PHB
    {
      name: "Caminho da Mão Aberta",
      source: "PHB",
      description:
        "Mestres supremos das artes de combate marcial, armado e desarmado. Aprendem técnicas para empurrar e derrubar oponentes, manipular o chi para curar ferimentos e meditar para se proteger de mazelas.",
      features: [
        {
          name: "Técnica da Mão Aberta",
          level: 3,
          description:
            "Você pode manipular o chi do seu inimigo enquanto controla o seu. Toda vez que você atingir uma criatura com um dos ataques concedidos pela sua Rajada de Golpes, você pode impor um dos seguintes efeitos no alvo:\n" +
            "• Ele deve ser bem-sucedido em um teste de resistência de Destreza ou cairá no chão (caído).\n" +
            "• Ele deve realizar um teste de resistência de Força; se falhar, você pode empurrá-lo 4,5 metros para longe de você.\n" +
            "• Ele não pode realizar reações até o final do seu próximo turno.",
        },
        {
          name: "Integridade Corporal",
          level: 6,
          description:
            "Você ganha a habilidade de se curar. Com uma ação, você recupera pontos de vida iguais a três vezes o seu nível de monge. Você deve terminar um descanso longo antes de poder usar essa característica novamente.",
          resource: { name: "Integridade Corporal", max: 1, recharge: "long" },
        },
        {
          name: "Tranquilidade",
          level: 11,
          description:
            "Você pode entrar em um estado especial de meditação que o rodeia com uma aura pacífica. No final de um descanso longo, você ganha o efeito da magia santuário, que dura até o começo do seu próximo descanso longo (a magia pode terminar antes, como de costume). A CD do teste de resistência é 8 + seu modificador de Sabedoria + seu bônus de proficiência.",
        },
        {
          name: "Palma Vibrante",
          level: 17,
          description:
            "Você ganha a habilidade de criar vibrações letais no corpo de alguém. Quando atingir uma criatura com um golpe desarmado, você pode gastar 3 pontos de chi para iniciar vibrações imperceptíveis, que duram um número de dias igual ao seu nível de monge. As vibrações são inofensivas a menos que você use sua ação para terminá-las; para tanto, você e o alvo devem estar no mesmo plano de existência. Ao usar essa ação, a criatura deve realizar um teste de resistência de Constituição: se falhar, é reduzida a 0 pontos de vida; se passar, sofre 10d10 de dano necrótico.\n" +
            "Você só pode ter uma criatura sob o efeito dessa característica por vez, e pode terminar as vibrações inofensivamente sem usar uma ação.",
        },
      ],
    },
    {
      name: "Caminho da Sombra",
      source: "PHB",
      description:
        "Tradição que valoriza furtividade e subterfúgio. Seus monges são chamados de ninjas ou dançarinos das sombras e servem como espiões e assassinos.",
      features: [
        {
          name: "Artes Sombrias",
          level: 3,
          description:
            "Você pode usar seu chi para simular o efeito de certas magias. Com uma ação, você pode gastar 2 pontos de chi para conjurar escuridão, visão no escuro, passos sem pegadas ou silêncio, sem precisar de componentes materiais. Além disso, você ganha o truque ilusão menor, se ainda não o conhecia.",
        },
        {
          name: "Passo das Sombras",
          level: 6,
          description:
            "Você ganha a habilidade de entrar em uma sombra e sair de outra. Quando estiver sob penumbra ou escuridão, com uma ação bônus, você pode se teletransportar até 18 metros para um espaço desocupado que possa ver e que também esteja sob penumbra ou escuridão. Você então tem vantagem no primeiro ataque corpo a corpo que fizer antes do final do turno.",
        },
        {
          name: "Manto de Sombras",
          level: 11,
          description:
            "Você aprendeu a se tornar uno com as sombras. Quando estiver em uma área de penumbra ou escuridão, você pode usar sua ação para ficar invisível. Você permanece invisível até realizar um ataque, conjurar uma magia ou entrar em uma área de luz plena.",
        },
        {
          name: "Oportunista",
          level: 17,
          description:
            "Você pode explorar o momento de distração de uma criatura quando ela é atingida por um ataque. Toda vez que uma criatura a até 1,5 metro de você for atingida por um ataque realizado por outra criatura que não você, você pode usar sua reação para realizar um ataque corpo a corpo contra essa criatura.",
        },
      ],
      spells: { "3": ["Ilusão Menor", "Escuridão", "Visão no Escuro", "Passos Sem Pegadas", "Silêncio"] },
    },
    {
      name: "Caminho dos Quatro Elementos",
      source: "PHB",
      description:
        "Ensina a dominar os elementos: ao focar o chi, o monge se alinha às forças da criação e molda água, ar, fogo e terra como extensão do próprio corpo.",
      features: [
        {
          name: "Discípulo dos Elementos",
          level: 3,
          description:
            "Você aprende disciplinas mágicas que manipulam o poder dos quatro elementos. Uma disciplina exige que você gaste pontos de chi cada vez que a usa. Você conhece a disciplina Sintonia Elemental e uma outra à sua escolha, e aprende uma disciplina adicional no 6º, 11º e 17º nível. Toda vez que aprender uma nova disciplina, você pode substituir uma disciplina que já conhecia por outra.\n" +
            "Conjurando magias elementais. Algumas disciplinas permitem conjurar magias; você usa o tempo de conjuração e as outras regras da magia, mas não precisa fornecer componentes materiais. A partir do 5º nível, você pode gastar pontos de chi adicionais para aumentar o nível da magia conjurada (se ela tiver efeito de aprimoramento): o nível sobe em 1 para cada ponto de chi adicional. Por exemplo, um monge de 5º nível pode gastar 3 pontos de chi em Golpe de Varredura Cauterizante para conjurar mãos flamejantes como magia de 2º nível. O máximo de pontos de chi gastos em uma magia (custo base + adicionais) é 3 do 5º ao 8º nível, 4 do 9º ao 12º, 5 do 13º ao 16º e 6 do 17º ao 20º nível.\n" +
            "Disciplinas elementais (o nível indicado é o mínimo na classe para aprendê-la):\n" +
            "• Cavalgar o Vento (11º nível). Gaste 4 pontos de chi para conjurar voo em si mesmo.\n" +
            "• Chamas da Fênix (11º nível). Gaste 4 pontos de chi para conjurar bola de fogo.\n" +
            "• Chicote de Água. Com uma ação, gaste 2 pontos de chi: uma criatura que você possa ver a até 9 metros faz um teste de resistência de Destreza. Se falhar, sofre 3d10 de dano de concussão (+1d10 para cada ponto de chi adicional gasto) e você pode derrubá-la ou puxá-la até 7,5 metros na sua direção; se passar, sofre metade do dano e não é puxada nem derrubada.\n" +
            "• Defesa Eterna da Montanha (17º nível). Gaste 5 pontos de chi para conjurar pele de pedra em si mesmo.\n" +
            "• Golpe de Varredura Cauterizante. Gaste 2 pontos de chi para conjurar mãos flamejantes.\n" +
            "• Gongo do Pico (6º nível). Gaste 3 pontos de chi para conjurar despedaçar.\n" +
            "• Investida dos Espíritos da Ventania. Gaste 2 pontos de chi para conjurar lufada de vento.\n" +
            "• Moldar o Rio Corrente. Com uma ação, gaste 1 ponto de chi para escolher uma área de gelo ou água de até 9 metros quadrados a até 36 metros de você. Você pode transformar água em gelo e vice-versa e remodelar o gelo como desejar: elevar ou rebaixar a superfície, escavar ou encher uma vala, erguer ou achatar uma parede ou formar um pilar. A extensão das mudanças não pode exceder metade da maior dimensão da área (numa área de 9 m², um pilar de até 4,5 m, uma vala de 4,5 m etc.). Você não pode moldar o gelo para aprisionar ou ferir uma criatura na área.\n" +
            "• Onda de Pedras Rolantes (17º nível). Gaste 6 pontos de chi para conjurar muralha de pedra.\n" +
            "• Postura da Neblina (11º nível). Gaste 4 pontos de chi para conjurar forma gasosa em si mesmo.\n" +
            "• Presas da Serpente de Fogo. Quando usar a ação de Ataque no seu turno, gaste 1 ponto de chi para que gavinhas de chamas se estendam de seus punhos e pés: o alcance dos seus golpes desarmados aumenta em 3 metros durante essa ação e pelo resto do turno. Um acerto causa dano de fogo em vez de concussão e, se você gastar 1 ponto de chi adicional ao acertar, causa 1d10 de dano de fogo extra.\n" +
            "• Punho do Ar Contínuo. Com uma ação, gaste 2 pontos de chi e escolha uma criatura a até 9 metros; ela faz um teste de resistência de Força. Se falhar, sofre 3d10 de dano de concussão (+1d10 por ponto de chi adicional gasto) e você pode empurrá-la até 6 metros para longe e derrubá-la; se passar, sofre metade do dano e não é empurrada nem derrubada.\n" +
            "• Punho dos Quatro Trovões. Gaste 2 pontos de chi para conjurar onda trovejante.\n" +
            "• Rio de Chamas Famintas (17º nível). Gaste 5 pontos de chi para conjurar muralha de fogo.\n" +
            "• Serragem do Vento do Norte (6º nível). Gaste 3 pontos de chi para conjurar imobilizar pessoa.\n" +
            "• Sintonia Elemental. Com uma ação, controle momentaneamente as forças elementais próximas causando um dos efeitos: criar um efeito sensorial inofensivo ligado a água, ar, fogo ou terra (chuva de faíscas, sopro de vento, névoa leve, estrondo de pedra); acender ou apagar instantaneamente uma vela, tocha ou pequena fogueira; esfriar ou esquentar 0,5 quilo de material inorgânico por até 1 hora; ou fazer terra, fogo, ar ou névoa que caiba em um cubo de 30 centímetros assumir uma forma bruta esculpida por você por 1 minuto.\n" +
            "• Sopro do Inverno (17º nível). Gaste 6 pontos de chi para conjurar cone de frio.",
        },
        {
          name: "Disciplina Elemental Adicional",
          level: 6,
          description:
            "Você aprende uma disciplina elemental adicional à sua escolha (podendo escolher as de 6º nível: Gongo do Pico e Serragem do Vento do Norte). Ao aprendê-la, você pode substituir uma disciplina que já conhecia por outra.",
        },
        {
          name: "Disciplina Elemental Adicional",
          level: 11,
          description:
            "Você aprende uma disciplina elemental adicional à sua escolha (podendo escolher as de 11º nível: Cavalgar o Vento, Chamas da Fênix e Postura da Neblina). Ao aprendê-la, você pode substituir uma disciplina que já conhecia por outra.",
        },
        {
          name: "Disciplina Elemental Adicional",
          level: 17,
          description:
            "Você aprende uma disciplina elemental adicional à sua escolha (podendo escolher as de 17º nível: Defesa Eterna da Montanha, Onda de Pedras Rolantes, Rio de Chamas Famintas e Sopro do Inverno). Ao aprendê-la, você pode substituir uma disciplina que já conhecia por outra.",
        },
      ],
    },
    // ----------------------------------------------------------------- XGtE
    {
      name: "Estilo do Mestre Bêbado",
      source: "XGtE",
      description:
        "Ensina a se mover com os passos imprevisíveis e cambaleantes de um bêbado, escondendo uma dança cuidadosamente executada de bloqueios, esquivas, avanços, ataques e recuos.",
      features: [
        {
          name: "Proficiências Bônus",
          level: 3,
          description:
            "Você recebe proficiência na perícia Atuação, se ainda não a tiver. Suas técnicas de artes marciais misturam treinamento em combate com a precisão de um dançarino e a excentricidade de um palhaço. Você também ganha proficiência com suprimentos de cervejeiro, se ainda não a tiver.",
        },
        {
          name: "Técnica Bêbada",
          level: 3,
          description:
            "Você aprende a girar e desviar rapidamente como parte da sua Rajada de Golpes. Quando usar Rajada de Golpes, você ganha o benefício da ação de Desengajar e seu deslocamento aumenta em 3 metros até o final do turno atual.",
        },
        {
          name: "Balanço Bêbado",
          level: 6,
          description:
            "Você pode se mover de forma cambaleante e repentina. Você ganha os seguintes benefícios:\n" +
            "Levantar do Chão. Quando estiver caído, você pode se levantar gastando 1,5 metro do seu deslocamento, em vez de metade dele.\n" +
            "Redirecionar Ataque. Quando uma criatura errar um ataque corpo a corpo contra você, você pode gastar 1 ponto de chi como reação para fazer com que esse ataque acerte outra criatura à sua escolha, que não o atacante, que você possa ver a até 1,5 metro de você.",
        },
        {
          name: "Sorte do Bêbado",
          level: 11,
          description:
            "Você parece ter uma maré de sorte no momento certo. Quando fizer um teste de habilidade, uma jogada de ataque ou um teste de resistência com desvantagem, você pode gastar 2 pontos de chi para cancelar a desvantagem naquela rolagem.",
        },
        {
          name: "Frenesi do Bêbado",
          level: 17,
          description:
            "Você ganha a habilidade de desferir uma sequência de ataques esmagadores contra um grupo de inimigos. Quando usar Rajada de Golpes, você pode fazer até três ataques adicionais com ela (totalizando cinco ataques da Rajada de Golpes), desde que cada ataque da Rajada de Golpes nesse turno atinja uma criatura diferente.",
        },
      ],
    },
    {
      name: "Estilo do Kensei",
      source: "XGtE",
      description:
        "Monges que treinam incansavelmente com suas armas até que elas se tornem extensão do corpo, vendo cada arma como o pincel de um calígrafo: ferramenta para expressar a beleza e a precisão das artes marciais.",
      features: [
        {
          name: "Caminho do Kensei",
          level: 3,
          description:
            "Seu treinamento em artes marciais leva você a dominar o uso de certas armas, e inclui instrução na fina arte da caligrafia ou da pintura. Você ganha os seguintes benefícios:\n" +
            "Armas Kensei. Escolha dois tipos de armas para serem suas armas kensei: uma arma corpo a corpo e uma arma à distância. Podem ser armas simples ou marciais que não tenham as propriedades pesada ou especial (o arco longo é uma escolha válida). Você ganha proficiência com essas armas, caso não tenha, e elas contam como armas de monge para você. Muitas características dessa tradição funcionam somente com suas armas kensei. Ao alcançar o 6º, 11º e 17º nível de monge, você pode escolher outro tipo de arma (corpo a corpo ou à distância) para ser uma arma kensei, seguindo os mesmos critérios.\n" +
            "Esquiva Rápida. Se você fizer um golpe desarmado como parte da sua ação de Ataque no seu turno e estiver segurando uma arma kensei corpo a corpo, você pode usá-la para se defender: enquanto a arma estiver em sua mão e você não estiver incapacitado, você ganha +2 na CA até o começo do seu próximo turno.\n" +
            "Tiro do Kensei. Você pode usar uma ação bônus no seu turno para tornar seus ataques à distância com uma arma kensei mais mortais: até o final do turno, qualquer alvo atingido por um ataque à distância com arma kensei sofre 1d4 de dano adicional do tipo da arma.\n" +
            "Caminho do Pincel. Você ganha proficiência com suprimentos de calígrafo ou com ferramentas de pintor, à sua escolha.",
        },
        {
          name: "Uno com a Lâmina",
          level: 6,
          description:
            "Você imbui suas armas kensei com chi, ganhando os seguintes benefícios:\n" +
            "Armas Kensei Mágicas. Seus ataques com armas kensei contam como mágicos para o propósito de superar resistência e imunidade a ataques e danos não mágicos.\n" +
            "Golpe Habilidoso. Quando atingir um alvo com uma arma kensei, você pode gastar 1 ponto de chi para que a arma cause dano extra igual ao seu dado de Artes Marciais. Você pode usar essa característica apenas uma vez em cada um dos seus turnos.\n" +
            "Além disso, você escolhe uma terceira arma kensei.",
        },
        {
          name: "Aguçar a Lâmina",
          level: 11,
          description:
            "Você ganha a habilidade de aprimorar suas armas com chi. Com uma ação bônus, você pode gastar até 3 pontos de chi para conceder a uma arma kensei que tocar um bônus nas jogadas de ataque e dano igual ao número de pontos de chi gastos. O bônus dura 1 minuto ou até você usar essa característica novamente. Essa característica não tem efeito em armas mágicas que já tenham bônus nas jogadas de ataque e dano.\n" +
            "Além disso, você escolhe uma quarta arma kensei.",
        },
        {
          name: "Precisão Infalível",
          level: 17,
          description:
            "Seu domínio com armas garante uma precisão extraordinária. Quando errar um ataque com uma arma de monge no seu turno, você pode rolar o ataque novamente. Você pode usar essa característica apenas uma vez em cada um dos seus turnos.\n" +
            "Além disso, você escolhe uma quinta arma kensei.",
        },
      ],
    },
    {
      name: "Estilo da Alma Solar",
      source: "XGtE",
      description:
        "Monges que aprendem a canalizar sua energia vital em calcinantes raios de luz solar, atacando à distância com o brilho do próprio chi.",
      features: [
        {
          name: "Raio Solar Radiante",
          level: 3,
          description:
            "Você pode lançar raios mágicos radiantes. Você ganha uma nova opção de ataque que pode usar com a ação de Ataque: um ataque à distância especial com alcance de 9 metros. Você é proficiente com ele e adiciona seu modificador de Destreza às jogadas de ataque e dano. O dano é radiante e o dado de dano é 1d4; esse dado muda conforme você ganha níveis de monge, seguindo a coluna Artes Marciais.\n" +
            "Quando você usar a ação de Ataque no seu turno e utilizar esse ataque especial como parte dela, você pode gastar 1 ponto de chi para fazer o ataque especial duas vezes com uma ação bônus.\n" +
            "Quando ganhar Ataque Extra, esse ataque especial pode ser usado em qualquer um dos ataques que fizer como parte da ação de Ataque.",
        },
        {
          name: "Golpe do Arco Abrasador",
          level: 6,
          description:
            "Você ganha a habilidade de canalizar seu chi em ondas abrasadoras de energia. Imediatamente após realizar a ação de Ataque no seu turno, você pode gastar 2 pontos de chi para conjurar a magia mãos flamejantes como ação bônus.\n" +
            "Cada ponto de chi adicional gasto aumenta o nível da magia em 1. O número máximo de pontos de chi (2 mais os adicionais) que você pode gastar na magia é igual à metade do seu nível de monge.",
        },
        {
          name: "Explosão Calcinante",
          level: 11,
          description:
            "Você ganha a habilidade de criar um orbe de luz que entra em erupção em uma explosão devastadora. Com uma ação, você cria magicamente um orbe e o lança em um ponto à sua escolha a até 45 metros, onde ele irrompe em uma esfera de luz radiante por um breve mas mortal momento. Cada criatura em uma esfera de 6 metros de raio deve ser bem-sucedida em um teste de resistência de Constituição ou sofrerá 2d6 de dano radiante. Uma criatura não precisa fazer o teste se estiver atrás de cobertura total opaca.\n" +
            "Você pode aumentar o dano da esfera gastando pontos de chi: cada ponto gasto, até o máximo de 3, aumenta o dano em 2d6.",
        },
        {
          name: "Escudo Solar",
          level: 17,
          description:
            "Você é rodeado por uma aura mágica luminosa. Você emite luz plena em um raio de 9 metros e penumbra por mais 9 metros, e pode extinguir ou restaurar a luz com uma ação bônus.\n" +
            "Se uma criatura o atingir com um ataque corpo a corpo enquanto sua luz brilhar, você pode usar sua reação para causar dano radiante à criatura igual a 5 + seu modificador de Sabedoria.",
        },
      ],
      spells: { "6": ["Mãos Flamejantes"] },
    },
    // ----------------------------------------------------------------- TCoE
    {
      name: "Caminho da Misericórdia",
      source: "TCoE",
      description:
        "Monges que manipulam a força vital dos outros para auxiliar os necessitados: médicos ambulantes dos pobres e feridos que, para os que estão além de ajuda, trazem um fim rápido como ato de misericórdia.",
      features: [
        {
          name: "Implementos da Misericórdia",
          level: 3,
          description:
            "Você adquire proficiência nas perícias Intuição e Medicina e com o kit de herbalismo. Você também recebe uma máscara especial, que costuma vestir ao usar as características dessa subclasse; você determina sua aparência ou a gera na tabela Máscara Misericordiosa (d6): 1 corvo, 2 preta e branca, 3 rosto chorando, 4 rosto gargalhando, 5 caveira, 6 borboleta.",
        },
        {
          name: "Mãos Curativas",
          level: 3,
          description:
            "Seu toque místico pode curar ferimentos. Com uma ação, você pode gastar 1 ponto de chi para tocar uma criatura e restaurar pontos de vida iguais a uma rolagem do seu dado de Artes Marciais + seu modificador de Sabedoria.\n" +
            "Quando usar sua Rajada de Golpes, você pode substituir um dos golpes desarmados por um uso dessa característica sem gastar ponto de chi pela cura.",
        },
        {
          name: "Mãos da Injúria",
          level: 3,
          description:
            "Você pode usar seu chi para causar ferimentos. Quando acertar uma criatura com um golpe desarmado, você pode gastar 1 ponto de chi para causar dano necrótico extra igual a uma rolagem do seu dado de Artes Marciais + seu modificador de Sabedoria. Você pode usar essa característica apenas uma vez por turno.",
        },
        {
          name: "Toque do Curandeiro",
          level: 6,
          description:
            "Você pode administrar curas ainda maiores com seu toque e, se necessário, usar seu conhecimento para causar dano.\n" +
            "Quando usar Mãos Curativas em uma criatura, você também pode remover uma doença ou uma das seguintes condições que a esteja afetando: atordoado, cego, ensurdecido, envenenado ou paralisado.\n" +
            "Quando usar Mãos da Injúria em uma criatura, você pode sujeitá-la à condição envenenado até o final do seu próximo turno.",
        },
        {
          name: "Torrente de Cura e Dor",
          level: 11,
          description:
            "Você pode propagar uma torrente de cura e dor. Quando usar sua Rajada de Golpes, você pode substituir cada um dos golpes desarmados por um uso de Mãos Curativas sem gastar pontos de chi pela cura.\n" +
            "Além disso, quando realizar um golpe desarmado com a Rajada de Golpes e acertar, você pode usar Mãos da Injúria com esse golpe sem gastar o ponto de chi. Você ainda pode usar Mãos da Injúria apenas uma vez por turno.",
        },
        {
          name: "Mão da Misericórdia Final",
          level: 17,
          description:
            "Seu domínio sobre a energia vital abriu a porta para a misericórdia final. Com uma ação, você pode tocar o corpo de uma criatura que morreu nas últimas 24 horas e gastar 5 pontos de chi. A criatura retorna à vida, recuperando pontos de vida iguais a 4d10 + seu modificador de Sabedoria. Se ela morreu sob o efeito de uma destas condições, a condição é removida ao voltar: cego, ensurdecido, paralisado, envenenado ou atordoado.\n" +
            "Uma vez usada, você não pode usar essa característica novamente até terminar um descanso longo.",
          resource: { name: "Mão da Misericórdia Final", max: 1, recharge: "long" },
        },
      ],
    },
    {
      name: "Caminho da Forma Astral",
      source: "TCoE",
      description:
        "Monges que acreditam que o corpo é uma ilusão e veem o chi como a representação de sua forma verdadeira, a forma astral, que manifestam para lutar como uma força da ordem ou da desordem.",
      features: [
        {
          name: "Braços da Forma Astral",
          level: 3,
          description:
            "Seu domínio do chi permite manifestar parte de sua forma astral. Com uma ação bônus, você pode gastar 1 ponto de chi para invocar os braços da sua forma astral. Ao fazê-lo, cada criatura à sua escolha que você possa ver a até 3 metros deve ser bem-sucedida em um teste de resistência de Destreza ou sofrerá dano de energia igual a duas rolagens do seu dado de Artes Marciais.\n" +
            "Durante 10 minutos, esses braços espectrais pairam perto de seus ombros ou cercam seus braços (você determina a aparência); eles desaparecem se você ficar incapacitado ou morrer. Enquanto os braços estiverem presentes, você ganha os seguintes benefícios:\n" +
            "• Você pode usar seu modificador de Sabedoria em vez do de Força para testes de habilidade e testes de resistência de Força.\n" +
            "• Você pode usar os braços espectrais para realizar golpes desarmados.\n" +
            "• Quando realizar um golpe desarmado com esses braços no seu turno, seu alcance para eles é 1,5 metro maior que o normal.\n" +
            "• Os golpes desarmados feitos com os braços espectrais podem usar seu modificador de Sabedoria em vez de Força ou Destreza nas jogadas de ataque e dano, e o tipo de dano é energia.",
        },
        {
          name: "Semblante da Forma Astral",
          level: 6,
          description:
            "Você pode invocar o semblante de sua forma astral. Com uma ação bônus, ou como parte da ação bônus usada para ativar os Braços da Forma Astral, você pode gastar 1 ponto de chi para invocar essa aparência por 10 minutos; ela desaparece se você ficar incapacitado ou morrer. Enquanto o semblante espectral estiver presente, você ganha os seguintes benefícios:\n" +
            "Visão Astral. Você enxerga normalmente na escuridão, mágica ou não, a até 36 metros.\n" +
            "Sabedoria Espiritual. Você tem vantagem em testes de Sabedoria (Intuição) e Carisma (Intimidação).\n" +
            "Palavra Espiritual. Quando você fala, pode direcionar suas palavras a uma criatura à sua escolha que possa ver a até 18 metros, de modo que apenas ela o ouça; ou pode amplificar sua voz para que todas as criaturas a até 180 metros o escutem.",
        },
        {
          name: "Corpo Astral",
          level: 11,
          description:
            "Quando tiver tanto os braços quanto o semblante da forma astral ativos, você pode fazer o corpo de sua forma astral aparecer (nenhuma ação é necessária). Esse corpo espectral recobre sua forma física como uma armadura, conectando braços e semblante; você determina a aparência. Enquanto o corpo astral estiver ativo, você ganha os seguintes benefícios:\n" +
            "Defletir Energia. Quando sofrer dano de ácido, frio, fogo, elétrico, trovejante ou de energia, você pode usar sua reação para defleti-lo: o dano sofrido é reduzido em 1d10 + seu modificador de Sabedoria (redução mínima de 1).\n" +
            "Braços Aprimorados. Uma vez em cada um dos seus turnos, quando acertar um alvo com os Braços da Forma Astral, você pode causar dano extra ao alvo igual a uma rolagem do seu dado de Artes Marciais.",
        },
        {
          name: "Forma Astral Desperta",
          level: 17,
          description:
            "Sua conexão com sua forma astral está completa. Com uma ação bônus, você pode gastar 5 pontos de chi para invocar os braços, o semblante e o corpo de sua forma astral e despertá-los por 10 minutos; a forma desaparece se você ficar incapacitado ou morrer. Enquanto sua forma astral estiver desperta, você ganha os seguintes benefícios:\n" +
            "Armadura Espiritual. Você ganha +2 na CA.\n" +
            "Barreira Astral. Sempre que usar Ataque Extra para atacar duas vezes, você pode atacar uma terceira vez se todos os ataques forem feitos com os braços da forma astral.",
        },
      ],
    },
  ],
  multiclass: {
    prerequisite: "Destreza 13 e Sabedoria 13",
    proficiencies: "Armas simples, espadas curtas",
    skills: 0,
  },
};
