import type { ClassDef } from "@/lib/types";

const ASI_DESC =
  "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.";

const INVOCACOES_PHB = [
  "Armadura de Sombras. Você pode conjurar armadura arcana em si mesmo, à vontade, sem gastar um espaço de magia ou componentes materiais.",
  "Correntes de Cárceri (pré-requisito: 15° nível, característica Pacto da Corrente). Você pode conjurar imobilizar monstro à vontade – tendo como alvo um celestial, corruptor ou elemental – sem gastar um espaço de magia ou componentes materiais. Você deve terminar um descanso longo antes de poder usar essa invocação na mesma criatura novamente.",
  "Encharcar a Mente (pré-requisito: 5° nível). Você pode conjurar lentidão uma vez usando um espaço de magia de bruxo. Você não pode fazer isso novamente até terminar um descanso longo.",
  "Escultor de Carne (pré-requisito: 7° nível). Você pode conjurar metamorfose uma vez usando um espaço de magia de bruxo. Você não pode fazer isso novamente até terminar um descanso longo.",
  "Explosão Agonizante (pré-requisito: truque rajada mística). Quando você conjura rajada mística, adicione seu modificador de Carisma ao dano causado em cada acerto.",
  "Explosão Repulsiva (pré-requisito: truque rajada mística). Quando você atinge uma criatura com rajada mística, você pode empurrá-la até 3 metros para longe de você em linha reta.",
  "Idioma Bestial. Você pode conjurar falar com animais à vontade, sem gastar um espaço de magia.",
  "Influência Enganadora. Você ganha proficiência nas perícias Enganação e Persuasão.",
  "Lacaios do Caos (pré-requisito: 9° nível). Você pode conjurar conjurar elemental uma vez usando um espaço de magia de bruxo. Você não pode fazer isso novamente até terminar um descanso longo.",
  "Lâmina Sedenta (pré-requisito: 5° nível, característica Pacto da Lâmina). Você pode atacar com sua arma de pacto duas vezes, ao invés de uma, quando usa a ação de Ataque no seu turno.",
  "Lança Mística (pré-requisito: truque rajada mística). Quando você conjura rajada mística, seu alcance é de 90 metros.",
  "Larápio dos Cinco Destinos. Você pode conjurar perdição uma vez usando um espaço de magia de bruxo. Você não pode fazer isso novamente até terminar um descanso longo.",
  "Livro de Segredos Antigos (pré-requisito: característica Pacto do Tomo). Você pode registrar rituais mágicos no seu Livro das Sombras. Escolha duas magias de 1° nível que possuam o descritor ritual da lista de magias de qualquer classe. As magias aparecem no livro e não contam no número de magias que você conhece. Com o seu Livro das Sombras em mãos, você pode conjurar as magias escolhidas como rituais. Você não pode conjurar essas magias exceto como rituais, a não ser que as tenha aprendido por outros meios. Você também pode conjurar uma magia de bruxo que conheça como ritual se ela possuir o descritor ritual. Os rituais não precisam ser da mesma lista de magias.\nDurante suas aventuras, você pode adicionar outras magias de ritual ao seu Livro das Sombras. Quando encontrar tal magia, você pode adicioná-la ao livro se o nível da magia for igual ou inferior à metade do seu nível de bruxo (arredondado para baixo) e se tiver tempo para transcrevê-la. Para cada nível da magia, a transcrição leva 2 horas e custa 50 po pelas tintas raras necessárias.",
  "Máscara das Muitas Faces. Você pode conjurar disfarçar-se à vontade, sem gastar um espaço de magia.",
  "Mestre das Infindáveis Formas (pré-requisito: 15° nível). Você pode conjurar alterar-se à vontade, sem gastar um espaço de magia.",
  "Olhar de Duas Mentes. Você pode usar sua ação para tocar um humanoide voluntário e perceber através dos sentidos dele até o final do seu próximo turno. Enquanto a criatura estiver no mesmo plano de existência que você, você pode usar sua ação nos turnos subsequentes para manter a conexão, estendendo a duração até o final do seu próximo turno. Enquanto estiver percebendo através dos sentidos de outra criatura, você se beneficia de todos os sentidos especiais possuídos por ela, e fica cego e surdo ao que está à sua volta.",
  "Olhos do Guardião das Runas. Você pode ler todas as escritas.",
  "Palavra Terrível (pré-requisito: 7° nível). Você pode conjurar confusão uma vez usando um espaço de magia de bruxo. Você não pode fazer isso novamente até terminar um descanso longo.",
  "Passo Ascendente (pré-requisito: 9° nível). Você pode conjurar levitação em si mesmo à vontade, sem gastar um espaço de magia ou componentes materiais.",
  "Salto Transcendental (pré-requisito: 9° nível). Você pode conjurar salto em si mesmo à vontade, sem gastar um espaço de magia ou componentes materiais.",
  "Sinal de Mau Agouro (pré-requisito: 5° nível). Você pode conjurar rogar maldição uma vez usando um espaço de magia de bruxo. Você não pode fazer isso novamente até terminar um descanso longo.",
  "Sorvedor de Vida (pré-requisito: 12° nível, característica Pacto da Lâmina). Quando você atinge uma criatura com sua arma de pacto, a criatura sofre dano necrótico adicional igual ao seu modificador de Carisma (mínimo 1).",
  "Sussurros da Sepultura (pré-requisito: 9° nível). Você pode conjurar falar com os mortos à vontade, sem gastar um espaço de magia.",
  "Sussurros Sedutores (pré-requisito: 7° nível). Você pode conjurar compulsão uma vez usando um espaço de magia de bruxo. Você não pode fazer isso novamente até terminar um descanso longo.",
  "Uno com as Sombras (pré-requisito: 5° nível). Quando você estiver em uma área de penumbra ou escuridão, você pode usar sua ação para ficar invisível até se mover ou realizar uma ação ou reação.",
  "Vigor Abissal. Você pode conjurar vitalidade falsa em si mesmo à vontade, como uma magia de 1° nível, sem gastar um espaço de magia ou componentes materiais.",
  "Visão da Bruxa (pré-requisito: 15° nível). Você pode ver a verdadeira forma de qualquer metamorfo ou criatura oculta por magias de ilusão ou transmutação, contanto que a criatura esteja a até 9 metros de você e você tenha linha de visão.",
  "Visão Diabólica. Você pode ver normalmente na escuridão, tanto mágica quanto normal, com um alcance de 36 metros.",
  "Visão Mística. Você pode conjurar detectar magia à vontade, sem gastar um espaço de magia.",
  "Visões de Reinos Distantes (pré-requisito: 15° nível). Você pode conjurar olho arcano à vontade, sem gastar um espaço de magia.",
  "Visões nas Brumas. Você pode conjurar imagem silenciosa à vontade, sem gastar um espaço de magia ou componentes materiais.",
  "Voz do Mestre das Correntes (pré-requisito: característica Pacto da Corrente). Você pode se comunicar telepaticamente com seu familiar e perceber através dos sentidos dele enquanto ambos estiverem no mesmo plano de existência. Além disso, enquanto estiver percebendo através dos sentidos do seu familiar, você também pode falar através dele com a sua voz, mesmo que ele normalmente seja incapaz de falar.",
];

const INVOCACOES_XGTE = [
  "Aperto de Hadar (pré-requisito: truque rajada mística). Uma vez em cada um dos seus turnos, quando atingir uma criatura com sua rajada mística, você pode deslocar essa criatura em linha reta 3 metros em sua direção.",
  "Arma de Pacto Aprimorada (pré-requisito: característica Pacto da Lâmina). Você pode usar qualquer arma que conjure com sua característica Pacto da Lâmina como foco de conjuração para suas magias de bruxo. Além disso, a arma ganha +1 de bônus nas jogadas de ataque e dano, a menos que seja uma arma mágica que já tenha um bônus nessas jogadas. Além disso, a arma que você conjura pode ser um arco curto, arco longo, besta leve ou besta pesada.",
  "Aspecto da Lua (pré-requisito: característica Pacto do Tomo). Você não precisa mais dormir e não pode ser forçado a dormir de nenhuma maneira. Para obter os benefícios de um descanso longo, você pode passar todas as 8 horas fazendo atividades leves, como ler o seu Livro das Sombras e manter a vigília.",
  "Dádiva das Profundezas (pré-requisito: 5° nível). Você pode respirar debaixo d'água e ganha um deslocamento de natação igual ao seu deslocamento de caminhada. Você também pode conjurar respirar na água uma vez sem gastar um espaço de magia. Você recupera a capacidade de fazê-lo quando termina um descanso longo.",
  "Destruição Mística (pré-requisito: 5° nível, característica Pacto da Lâmina). Uma vez por turno, quando você atinge uma criatura com sua arma de pacto, você pode gastar um espaço de magia de bruxo para causar 1d8 de dano de energia adicional ao alvo, mais 1d8 por nível do espaço de magia, e você pode derrubar o alvo se ele for Enorme ou menor.",
  "Fuga do Escapista (pré-requisito: 7° nível). Você pode conjurar movimentação livre em si mesmo uma vez sem gastar um espaço de magia. Você recupera a capacidade de fazê-lo quando termina um descanso longo.",
  "Lança da Letargia (pré-requisito: truque rajada mística). Uma vez em cada um dos seus turnos, quando atingir uma criatura com sua rajada mística, você pode reduzir o deslocamento dessa criatura em 3 metros até o final do seu próximo turno.",
  "Maldição Enlouquecedora (pré-requisito: 5° nível, magia bruxaria ou uma característica de bruxo que amaldiçoe, como Maldição da Lâmina Maldita ou Sinal de Mau Agouro). Com uma ação bônus, você causa uma distorção psíquica em torno do alvo amaldiçoado pela sua magia bruxaria ou por uma característica de bruxo sua. Quando fizer isso, você causa dano psíquico ao alvo amaldiçoado e a cada criatura à sua escolha que você possa ver a até 1,5 metro dele. O dano psíquico é igual ao seu modificador de Carisma (mínimo de 1 de dano). Para usar essa invocação, você deve poder ver o alvo amaldiçoado e ele deve estar a até 9 metros de você.",
  "Maldição Incansável (pré-requisito: 7° nível, magia bruxaria ou uma característica de bruxo que amaldiçoe, como Maldição da Lâmina Maldita ou Sinal de Mau Agouro). Sua maldição cria um vínculo temporário com seu alvo. Com uma ação bônus, você pode se teletransportar magicamente até 9 metros para um espaço desocupado que possa ver a até 1,5 metro do alvo amaldiçoado pela sua magia bruxaria ou por uma característica de bruxo sua. Para se teletransportar dessa maneira, você precisa poder ver o alvo amaldiçoado.",
  "Manto de Moscas (pré-requisito: 5° nível). Com uma ação bônus, você pode se cercar com uma aura mágica que parece um zumbido de moscas. A aura se estende a 1,5 metro de você em todas as direções, mas não através de cobertura total. Ela dura até você ficar incapacitado ou dispensá-la com uma ação bônus. A aura lhe concede vantagem em testes de Carisma (Intimidação), mas desvantagem em todos os outros testes de Carisma. Qualquer outra criatura que comece o turno na aura sofre dano de veneno igual ao seu modificador de Carisma (mínimo de 0 de dano).\nUma vez que use essa invocação, você não pode usá-la novamente até terminar um descanso curto ou longo.",
  "Olhar Fantasmagórico (pré-requisito: 7° nível). Com uma ação, você ganha a capacidade de ver através de objetos sólidos até um alcance de 9 metros. Dentro desse alcance, você tem visão no escuro caso ainda não a possua. Essa visão especial dura 1 minuto ou até sua concentração terminar (como se estivesse se concentrando em uma magia). Durante esse tempo, você percebe objetos como imagens fantasmagóricas e translúcidas.\nUma vez que use essa invocação, você não pode usá-la novamente até terminar um descanso curto ou longo.",
  "Presente dos Sempre-Vivos (pré-requisito: característica Pacto da Corrente). Sempre que recuperar pontos de vida enquanto o seu familiar estiver a até 30 metros de você, trate todos os dados rolados para determinar os pontos de vida recuperados como tendo obtido seu valor máximo.",
  "Sudário das Sombras (pré-requisito: 15° nível). Você pode conjurar invisibilidade à vontade, sem gastar um espaço de magia.",
  "Túmulo de Levisto (pré-requisito: 5° nível). Como uma reação, quando você sofrer dano, você pode se cobrir de gelo, que derrete no final do seu próximo turno. Você ganha 10 pontos de vida temporários por nível de bruxo, que absorvem o máximo possível do dano que desencadeou a reação. Imediatamente após sofrer o dano, você ganha vulnerabilidade a dano de fogo, seu deslocamento é reduzido a 0 e você fica incapacitado. Esses efeitos, incluindo quaisquer pontos de vida temporários remanescentes, terminam quando o gelo derrete.\nUma vez que use essa invocação, você não pode usá-la novamente até terminar um descanso curto ou longo.",
];

const INVOCACOES_TCOE = [
  "Dádiva dos Protetores (pré-requisito: 9° nível, característica Pacto do Tomo). Uma nova página aparece em seu Livro das Sombras. Com sua permissão, uma criatura pode usar a ação dela para escrever o nome dela nessa página, que pode conter um número de nomes igual ao seu bônus de proficiência. Quando uma criatura cujo nome está na página é reduzida a 0 pontos de vida mas não morre imediatamente, ela magicamente cai para 1 ponto de vida em vez disso. Uma vez que essa magia seja desencadeada, nenhuma criatura pode se beneficiar dela novamente até que você termine um descanso longo. Com uma ação, você pode apagar magicamente um nome da página ao tocá-lo.",
  "Escrita Longínqua (pré-requisito: 5° nível, característica Pacto do Tomo). Uma nova página aparece em seu Livro das Sombras. Com sua permissão, uma criatura pode usar a ação dela para escrever o nome dela nessa página, que pode conter um número de nomes igual ao seu bônus de proficiência. Você pode conjurar a magia enviar mensagem, tendo como alvo uma criatura cujo nome esteja na página, sem usar um espaço de magia e sem componentes materiais. Para isso, você escreve a mensagem na página. O alvo ouve a mensagem em sua mente e, se responder, a resposta aparece na página, em vez de na sua mente. A escrita desaparece após 1 minuto. Com uma ação, você pode apagar magicamente um nome da página ao tocá-lo.",
  "Implemento do Mestre da Corrente (pré-requisito: característica Pacto da Corrente). Quando você conjura convocar familiar, você imbui o familiar invocado com uma parcela do seu poder místico, concedendo à criatura os seguintes benefícios:\n• O familiar adquire um deslocamento de voo ou de natação (à sua escolha) de 12 metros.\n• Com uma ação bônus, você pode comandar seu familiar a realizar a ação de Ataque.\n• Os ataques com arma do familiar são considerados mágicos para o propósito de superar resistências e imunidades a ataques e danos não mágicos.\n• Se o familiar obrigar uma criatura a realizar um teste de resistência, ele usa a CD das suas magias.\n• Quando o familiar sofre dano, você pode usar sua reação para conceder a ele resistência contra esse dano.",
  "Ligado ao Talismã (pré-requisito: 12° nível, característica Pacto do Talismã). Enquanto outra pessoa estiver usando seu talismã, você pode usar sua ação para se teletransportar para um espaço desocupado próximo a ela, desde que ambos estejam no mesmo plano de existência. O portador do seu talismã pode fazer o mesmo, usando a ação dele para se teletransportar até você. O teletransporte pode ser usado um número de vezes igual ao seu bônus de proficiência, e todos os usos são recuperados quando você termina um descanso longo.",
  "Mente Mística. Você tem vantagem nos testes de resistência de Constituição realizados para manter a concentração em uma magia.",
  "Proteção do Talismã (pré-requisito: 7° nível, característica Pacto do Talismã). Quando o portador do seu talismã falhar em um teste de resistência, ele pode adicionar um d4 à jogada, potencialmente transformando-a em um sucesso. Esse benefício pode ser usado um número de vezes igual ao seu bônus de proficiência, e todos os usos gastos são recuperados quando você termina um descanso longo.",
  "Repreensão do Talismã (pré-requisito: característica Pacto do Talismã). Quando o portador do seu talismã for atingido por um atacante que você possa ver a até 9 metros de você, você pode usar sua reação para causar dano psíquico ao atacante igual ao seu bônus de proficiência e empurrá-lo até 3 metros para longe do portador do talismã.",
  "Servidão Eterna (pré-requisito: 5° nível). Você pode conjurar animar mortos sem usar um espaço de magia. Uma vez que o faça, você não pode conjurar essa magia dessa forma novamente até terminar um descanso longo.",
];

export const BRUXO: ClassDef = {
  name: "Bruxo",
  source: "PHB",
  subclassLabel: "Patrono Transcendental",
  subclassLevel: 1,
  multiclass: {
    prerequisite: "Carisma 13",
    proficiencies: "Armadura leve, armas simples",
    skills: 0,
  },
  features: [
    {
      name: "Patrono Transcendental",
      level: 1,
      description:
        "No 1° nível, você conclui uma barganha com um ser transcendental, à sua escolha: a Arquifada, o Corruptor ou o Grande Antigo (Livro do Jogador), o Celestial ou a Lâmina Maldita (Guia de Xanathar), ou o Insondável ou o Gênio (Caldeirão de Tasha). Sua escolha lhe confere características no 1° nível e novamente no 6°, 10° e 14° níveis.",
    },
    {
      name: "Magia de Pacto",
      level: 1,
      description:
        "Sua pesquisa arcana e a magia outorgada a você por seu patrono lhe concedem uma gama de magias. Veja o capítulo 10 do Livro do Jogador para as regras gerais de conjuração e o capítulo 11 para a lista de magias de bruxo.\nTruques. Você conhece dois truques, à sua escolha, da lista de magias de bruxo. Você aprende truques de bruxo adicionais em níveis mais altos: 3 truques conhecidos no 4° nível e 4 truques no 10° nível.\nEspaços de Magia. A tabela O Bruxo mostra quantos espaços de magia você possui e qual o nível desses espaços; todos os seus espaços de magia são do mesmo nível. Para conjurar uma magia de bruxo de 1° nível ou superior, você deve gastar um espaço de magia. Você recobra todos os espaços de magia gastos quando completa um descanso curto ou longo. Espaços e nível dos espaços por nível de bruxo: 1° nível: 1 espaço de 1° nível; 2°: 2 espaços de 1° nível; 3°–4°: 2 espaços de 2° nível; 5°–6°: 2 espaços de 3° nível; 7°–8°: 2 espaços de 4° nível; 9°–10°: 2 espaços de 5° nível; 11°–16°: 3 espaços de 5° nível; 17°–20°: 4 espaços de 5° nível. Por exemplo, no 5° nível você tem dois espaços de magia de 3° nível; para conjurar a magia de 1° nível raio de bruxa, você gasta um desses espaços e a conjura como uma magia de 3° nível.\nMagias Conhecidas de 1° Nível e Superiores. No 1° nível, você conhece duas magias de 1° nível, à sua escolha, da lista de magias de bruxo. A coluna Magias Conhecidas da tabela O Bruxo mostra quando você aprende mais magias de bruxo de 1° nível ou superior: 2 no 1° nível, 3 no 2°, 4 no 3°, 5 no 4°, 6 no 5°, 7 no 6°, 8 no 7°, 9 no 8°, 10 no 9° e 10°, 11 no 11° e 12°, 12 no 13° e 14°, 13 no 15° e 16°, 14 no 17° e 18° e 15 no 19° e 20°. Cada uma dessas magias deve ser de um nível igual ou inferior ao da coluna Nível de Magia para o seu nível (no 6° nível, por exemplo, você aprende uma nova magia de bruxo, que pode ser de 1°, 2° ou 3° nível). Além disso, quando você adquire um nível nessa classe, você pode escolher uma magia de bruxo que conheça e substituí-la por outra magia da lista de bruxo, que também deve ser de um nível para o qual você tenha espaços de magia.\nHabilidade de Conjuração. Carisma é a sua habilidade de conjuração para as magias de bruxo. Você usa seu Carisma sempre que uma magia se referir à sua habilidade de conjuração, para definir a CD dos testes de resistência das suas magias de bruxo e nas jogadas de ataque com magia. CD das magias = 8 + seu bônus de proficiência + seu modificador de Carisma. Modificador de ataque de magia = seu bônus de proficiência + seu modificador de Carisma.\nFoco de Conjuração. Você pode usar um foco arcano (capítulo 5 do Livro do Jogador) como foco de conjuração das suas magias de bruxo.",
    },
    {
      name: "Invocações Místicas",
      level: 2,
      description:
        "Durante seus estudos sobre conhecimento oculto, você descobriu as invocações místicas, fragmentos de conhecimento proibido que infundiram você com habilidade mágica permanente.\nNo 2° nível, você ganha duas invocações místicas, à sua escolha. Quando você atinge certos níveis de bruxo, você adquire novas invocações, como mostrado na coluna Invocações Conhecidas da tabela O Bruxo: 2 no 2° nível, 3 no 5°, 4 no 7°, 5 no 9°, 6 no 12°, 7 no 15° e 8 no 18°.\nAlém disso, quando você adquire um nível nessa classe, você pode escolher uma invocação que conheça e substituí-la por outra invocação que possa aprender nesse nível.\nSe uma invocação mística tiver pré-requisitos, você deve possuí-los para aprendê-la. Você pode aprender a invocação ao mesmo tempo em que adquire os pré-requisitos dela. O pré-requisito de nível nas invocações se refere ao nível de bruxo, não ao nível de personagem.\n\nINVOCAÇÕES DO LIVRO DO JOGADOR\n" +
        INVOCACOES_PHB.join("\n") +
        "\n\nINVOCAÇÕES DO GUIA DE XANATHAR\n" +
        INVOCACOES_XGTE.join("\n") +
        "\n\nINVOCAÇÕES DO CALDEIRÃO DE TASHA\n" +
        INVOCACOES_TCOE.join("\n"),
    },
    {
      name: "Dádiva do Pacto",
      level: 3,
      description:
        "No 3° nível, seu patrono transcendental lhe confere um dom por seus leais serviços. Você adquire uma das características a seguir, à sua escolha.\nPacto da Corrente. Você aprende a magia convocar familiar e pode conjurá-la como um ritual. Essa magia não conta no número de magias que você conhece. Quando você conjura essa magia, você pode escolher uma das formas convencionais para o seu familiar ou uma das seguintes formas especiais: diabrete, pseudodragão, quasit ou sprite. Além disso, quando você realiza a ação de Ataque, você pode renunciar a um dos seus ataques para permitir que seu familiar realize um ataque com a reação dele.\nPacto da Lâmina. Você pode usar sua ação para criar uma arma de pacto em sua mão vazia. Você escolhe a forma que essa arma corpo-a-corpo tem a cada vez que a cria (veja as opções de arma no capítulo 5 do Livro do Jogador). Você é proficiente com ela enquanto a empunhar. Essa arma conta como mágica para o propósito de superar resistência e imunidade a ataques e danos não mágicos. Sua arma de pacto desaparece se ficar a mais de 1,5 metro de você por 1 minuto ou mais. Ela também desaparece se você usar essa característica novamente, se você dissipar a arma (não requer ação) ou se você morrer. Você pode transformar uma arma mágica em sua arma de pacto ao realizar um ritual especial enquanto a empunha. Você precisa de 1 hora para concluir o ritual, que pode ser realizado durante um descanso curto. Você pode então dissipar a arma, guardando-a em um espaço extradimensional, e ela reaparece toda vez que você criar sua arma de pacto. A arma deixa de ser sua arma de pacto se você morrer, se você realizar o ritual de 1 hora com outra arma ou se você realizar um ritual de 1 hora para romper seu elo com ela. A arma aparece aos seus pés se estiver no espaço extradimensional quando o elo for quebrado.\nPacto do Tomo. Seu patrono lhe deu um grimório chamado Livro das Sombras. Quando você adquire essa característica, escolha três truques da lista de magias de qualquer classe (não precisam ser da mesma lista). Enquanto o livro estiver com você, você pode conjurar esses truques à vontade. Eles não contam no número de truques que você conhece e são considerados magias de bruxo para você. Se você perder seu Livro das Sombras, você pode realizar uma cerimônia de 1 hora para receber um substituto do seu patrono. Essa cerimônia pode ser realizada durante um descanso curto ou longo e destrói o livro anterior. O livro se torna cinzas quando você morre.\nPacto do Talismã (Caldeirão de Tasha). Seu patrono dá a você um amuleto, um talismã que pode auxiliar seu portador quando a necessidade exigir. Quando o portador falhar em um teste de habilidade, ele pode adicionar um d4 ao resultado, potencialmente transformando a jogada em um sucesso. Esse benefício pode ser usado um número de vezes igual ao seu bônus de proficiência, e todos os usos são recuperados quando você termina um descanso longo. Se você perder o talismã, você pode realizar uma cerimônia de 1 hora para receber um substituto do seu patrono. A cerimônia pode ser realizada durante um descanso curto ou longo e destrói o amuleto anterior. O talismã se transforma em cinzas quando você morre.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 4,
      asi: true,
      description: ASI_DESC,
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 8,
      asi: true,
      description: ASI_DESC,
    },
    {
      name: "Arcana Mística (6° nível)",
      level: 11,
      description:
        "No 11° nível, seu patrono confere a você um segredo mágico conhecido como arcana. Escolha uma magia de 6° nível da lista de magias de bruxo como sua arcana.\nVocê pode conjurar essa magia arcana uma vez sem gastar um espaço de magia. Você deve terminar um descanso longo antes de poder fazer isso novamente.\nEm níveis mais altos, você adquire mais magias de bruxo, à sua escolha, que podem ser conjuradas dessa forma: uma magia de 7° nível no 13° nível, uma magia de 8° nível no 15° nível e uma magia de 9° nível no 17° nível. Você recupera todos os usos de sua Arcana Mística quando termina um descanso longo.",
      resource: { max: 1, recharge: "long" },
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 12,
      asi: true,
      description: ASI_DESC,
    },
    {
      name: "Arcana Mística (7° nível)",
      level: 13,
      description:
        "No 13° nível, escolha uma magia de 7° nível da lista de magias de bruxo como uma arcana adicional. Você pode conjurá-la uma vez sem gastar um espaço de magia e recupera esse uso quando termina um descanso longo.",
      resource: { max: 1, recharge: "long" },
    },
    {
      name: "Arcana Mística (8° nível)",
      level: 15,
      description:
        "No 15° nível, escolha uma magia de 8° nível da lista de magias de bruxo como uma arcana adicional. Você pode conjurá-la uma vez sem gastar um espaço de magia e recupera esse uso quando termina um descanso longo.",
      resource: { max: 1, recharge: "long" },
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 16,
      asi: true,
      description: ASI_DESC,
    },
    {
      name: "Arcana Mística (9° nível)",
      level: 17,
      description:
        "No 17° nível, escolha uma magia de 9° nível da lista de magias de bruxo como uma arcana adicional. Você pode conjurá-la uma vez sem gastar um espaço de magia e recupera esse uso quando termina um descanso longo.",
      resource: { max: 1, recharge: "long" },
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 19,
      asi: true,
      description: ASI_DESC,
    },
    {
      name: "Mestre Místico",
      level: 20,
      description:
        "No 20° nível, você pode recarregar sua reserva interior de poder místico ao suplicar ao seu patrono para recuperar espaços de magia gastos. Você pode gastar 1 minuto suplicando pela ajuda do seu patrono para recuperar todos os espaços de magia gastos da sua característica Magia de Pacto. Uma vez que tenha recuperado espaços de magia com essa característica, você deve terminar um descanso longo antes de fazê-lo novamente.",
      resource: { max: 1, recharge: "long" },
    },
  ],
  subclasses: [
    {
      name: "A Arquifada",
      source: "PHB",
      description:
        "Seu patrono é um senhor ou senhora das fadas, uma criatura lendária que detém segredos esquecidos antes de as raças mortais nascerem. Suas motivações são muitas vezes inescrutáveis e excêntricas – como o Príncipe do Frio, a Rainha do Ar e Trevas, Titania, Oberon ou Hyrsam.",
      spells: {
        "1": ["Fogo das Fadas", "Sono"],
        "2": ["Acalmar Emoções", "Força Fantasmagórica"],
        "3": ["Piscar", "Ampliar Plantas"],
        "4": ["Dominar Besta", "Invisibilidade Maior"],
        "5": ["Dominar Pessoa", "Similaridade"],
      },
      features: [
        {
          name: "Lista de Magias Expandida",
          level: 1,
          description:
            "A Arquifada permite que você escolha magias de uma lista expandida quando for aprender magias de bruxo. As seguintes magias são adicionadas à sua lista de magias de bruxo: 1° nível – fogo das fadas, sono; 2° nível – acalmar emoções, força fantasmagórica; 3° nível – piscar, ampliar plantas; 4° nível – dominar besta, invisibilidade maior; 5° nível – dominar pessoa, similaridade.",
        },
        {
          name: "Presença Feérica",
          level: 1,
          description:
            "A partir do 1° nível, seu patrono concede a você a habilidade de projetar a sedução e a temeridade da presença das fadas. Com uma ação, você pode fazer com que cada criatura num cubo de 3 metros centrado em você faça um teste de resistência de Sabedoria contra a CD das suas magias de bruxo. As criaturas que falharem ficam enfeitiçadas ou amedrontadas por você (à sua escolha) até o início do seu próximo turno.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
        {
          name: "Névoa de Fuga",
          level: 6,
          description:
            "A partir do 6° nível, você pode desaparecer em uma lufada de névoa em resposta a um ferimento. Quando você sofrer dano, você pode usar sua reação para ficar invisível e se teletransportar até 18 metros para um espaço desocupado que possa ver. Você permanece invisível até o início do seu próximo turno ou até realizar um ataque ou conjurar uma magia.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
        {
          name: "Defesa Sedutora",
          level: 10,
          description:
            "A partir do 10° nível, seu patrono ensina você a voltar as magias de efeito mental dos seus inimigos contra eles. Você não pode ser enfeitiçado e, quando outra criatura tentar enfeitiçá-lo, você pode usar sua reação para tentar reverter o encanto contra aquela criatura. A criatura deve ser bem-sucedida num teste de resistência de Sabedoria contra a CD das suas magias de bruxo ou fica enfeitiçada por você por 1 minuto ou até sofrer dano.",
        },
        {
          name: "Delírio Sombrio",
          level: 14,
          description:
            "A partir do 14° nível, você pode imergir uma criatura num reino ilusório. Com uma ação, escolha uma criatura que você possa ver a até 18 metros de você. Ela deve ser bem-sucedida num teste de resistência de Sabedoria contra a CD das suas magias de bruxo. Se falhar, ela fica enfeitiçada ou amedrontada por você (à sua escolha) por 1 minuto ou até você perder a concentração (como se estivesse se concentrando em uma magia). Esse efeito termina prematuramente se a criatura sofrer dano.\nAté a ilusão terminar, a criatura acredita que está perdida num reino enevoado, cuja aparência fica a seu critério. A criatura só pode ver e ouvir a si mesma, a você e à sua ilusão.\nVocê deve terminar um descanso curto ou longo antes de poder usar essa característica novamente.",
          resource: { max: 1, recharge: "short" },
        },
      ],
    },
    {
      name: "O Corruptor",
      source: "PHB",
      description:
        "Você realizou um pacto com um corruptor dos planos inferiores, um ser cujos objetivos são o mal, mesmo que você se oponha a eles. Lordes demônios como Demogorgon e Orcus, arquidiabos como Asmodeus e Mefistófeles, e senhores dos yugoloths estão entre os corruptores poderosos o bastante para forjar pactos.",
      spells: {
        "1": ["Mãos Flamejantes", "Comando"],
        "2": ["Cegueira/surdez", "Raio Ardente"],
        "3": ["Bola de Fogo", "Névoa Fétida"],
        "4": ["Escudo de Fogo", "Muralha de Fogo"],
        "5": ["Coluna de Chamas", "Consagrar"],
      },
      features: [
        {
          name: "Lista de Magias Expandida",
          level: 1,
          description:
            "O Corruptor permite que você escolha magias de uma lista expandida quando for aprender magias de bruxo. As seguintes magias são adicionadas à sua lista de magias de bruxo: 1° nível – mãos flamejantes, comando; 2° nível – cegueira/surdez, raio ardente; 3° nível – bola de fogo, névoa fétida; 4° nível – escudo de fogo, muralha de fogo; 5° nível – coluna de chamas, consagrar.",
        },
        {
          name: "Bênção do Obscuro",
          level: 1,
          description:
            "A partir do 1° nível, quando você reduzir uma criatura hostil a 0 pontos de vida, você ganha uma quantidade de pontos de vida temporários igual ao seu modificador de Carisma + seu nível de bruxo (mínimo 1).",
        },
        {
          name: "Sorte do Próprio Obscuro",
          level: 6,
          description:
            "A partir do 6° nível, você pode pedir ao seu patrono para alterar o destino em seu favor. Quando você realizar um teste de habilidade ou um teste de resistência, você pode usar essa característica para adicionar 1d10 à sua jogada. Você pode fazer isso após ver a jogada inicial, mas antes que qualquer efeito dela ocorra.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
        {
          name: "Resistência Demoníaca",
          level: 10,
          description:
            "A partir do 10° nível, você pode escolher um tipo de dano quando terminar um descanso curto ou longo. Você adquire resistência contra esse tipo de dano até escolher um tipo de dano diferente com essa característica. Dano causado por armas mágicas ou armas de prata ignora essa resistência.",
        },
        {
          name: "Lançar no Inferno",
          level: 14,
          description:
            "A partir do 14° nível, quando você atingir uma criatura com um ataque, você pode usar essa característica para transportar instantaneamente o alvo para os planos inferiores. A criatura desaparece e é lançada numa paisagem de pesadelo.\nNo final do seu próximo turno, o alvo retorna ao espaço que ocupava anteriormente ou ao espaço desocupado mais próximo. Se o alvo não for um corruptor, ele sofre 10d10 de dano psíquico ao se recuperar da experiência traumática.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
      ],
    },
    {
      name: "O Grande Antigo",
      source: "PHB",
      description:
        "Seu patrono é uma entidade misteriosa cuja natureza é profundamente alheia ao tecido da realidade – vinda do Reino Distante ou um dos deuses anciões das lendas, como Ghaunadar, Tharizdun, Dendar, Zargon ou o Grande Cthulhu. Ele pode nem saber da sua existência, mas os segredos que você desvendou permitem obter suas magias dele.",
      spells: {
        "1": ["Sussurros Dissonantes", "Riso Histérico de Tasha"],
        "2": ["Detectar Pensamentos", "Força Fantasmagórica"],
        "3": ["Clarividência", "Enviar Mensagem"],
        "4": ["Dominar Besta", "Tentáculos Negros de Evard"],
        "5": ["Dominar Pessoa", "Telecinésia"],
      },
      features: [
        {
          name: "Lista de Magias Expandida",
          level: 1,
          description:
            "O Grande Antigo permite que você escolha magias de uma lista expandida quando for aprender magias de bruxo. As seguintes magias são adicionadas à sua lista de magias de bruxo: 1° nível – sussurros dissonantes, riso histérico de Tasha; 2° nível – detectar pensamentos, força fantasmagórica; 3° nível – clarividência, enviar mensagem; 4° nível – dominar besta, tentáculos negros de Evard; 5° nível – dominar pessoa, telecinésia.",
        },
        {
          name: "Despertar a Mente",
          level: 1,
          description:
            "A partir do 1° nível, seu conhecimento alienígena concede a você a habilidade de tocar a mente de outras criaturas. Você pode se comunicar telepaticamente com qualquer criatura que possa ver a até 9 metros de você. Você não precisa compartilhar um idioma com a criatura para que ela compreenda suas expressões telepáticas, mas a criatura deve ser capaz de compreender pelo menos um idioma.",
        },
        {
          name: "Proteção Entrópica",
          level: 6,
          description:
            "A partir do 6° nível, você aprende a se proteger magicamente contra ataques e a transformar os ataques malsucedidos dos seus inimigos em boa sorte para você. Quando uma criatura realizar uma jogada de ataque contra você, você pode usar sua reação para impor desvantagem nessa jogada. Se o ataque errar, sua próxima jogada de ataque contra essa criatura tem vantagem se você a fizer antes do final do seu próximo turno.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
        {
          name: "Escudo de Pensamentos",
          level: 10,
          description:
            "A partir do 10° nível, seus pensamentos não podem ser lidos por telepatia ou outros meios, a não ser que você permita. Você também adquire resistência a dano psíquico e, toda vez que uma criatura causar dano psíquico a você, essa criatura sofre a mesma quantidade de dano que você sofreu.",
        },
        {
          name: "Criar Lacaio",
          level: 14,
          description:
            "No 14° nível, você adquire a habilidade de infectar a mente de um humanoide com a magia alienígena do seu patrono. Você pode usar sua ação para tocar um humanoide incapacitado. Essa criatura fica enfeitiçada por você até que a magia remover maldição seja conjurada sobre ela, a condição enfeitiçado seja removida dela ou você use essa característica novamente.\nVocê pode se comunicar telepaticamente com a criatura enfeitiçada contanto que ambos estejam no mesmo plano de existência.",
        },
      ],
    },
    {
      name: "O Celestial",
      source: "XGtE",
      description:
        "Seu patrono é um poderoso ser dos Planos Superiores – um empíreo, solar, ki-rin, unicórnio ou outra entidade dos planos das bênçãos eternas. Seu pacto permite que você toque a luz sagrada que ilumina o multiverso e o obriga a trazer luz aos lugares escuros do mundo.",
      spells: {
        "1": ["Curar Ferimentos", "Raio Guiador"],
        "2": ["Esfera Flamejante", "Restauração Menor"],
        "3": ["Luz do Dia", "Revivificar"],
        "4": ["Guardião da Fé", "Muralha de Fogo"],
        "5": ["Coluna de Chamas", "Restauração Maior"],
      },
      features: [
        {
          name: "Lista de Magias Expandida",
          level: 1,
          description:
            "O Celestial permite que você escolha magias de uma lista expandida quando aprende uma magia de bruxo. As seguintes magias são adicionadas à sua lista de magias de bruxo: 1° nível – curar ferimentos, raio guiador; 2° nível – esfera flamejante, restauração menor; 3° nível – luz do dia, revivificar; 4° nível – guardião da fé, muralha de fogo; 5° nível – coluna de chamas, restauração maior.",
        },
        {
          name: "Truques Adicionais",
          level: 1,
          description:
            "No 1° nível, você aprende os truques luz e chama sagrada. Eles contam como truques de bruxo para você, mas não contam no seu número de truques conhecidos.",
        },
        {
          name: "Iluminação Curativa",
          level: 1,
          description:
            "No 1° nível, você ganha a capacidade de canalizar energia celestial para curar ferimentos. Você tem uma reserva de d6 que gasta para alimentar essa cura. O número de dados na reserva é igual a 1 + seu nível de bruxo.\nCom uma ação bônus, você pode curar uma criatura que possa ver a até 18 metros de você, gastando dados dessa reserva. O número máximo de dados que pode gastar de uma vez é igual ao seu modificador de Carisma (mínimo de um dado). Role os dados gastos, some-os e a criatura recupera essa quantidade de pontos de vida.\nSua reserva recupera todos os dados gastos quando você termina um descanso longo.",
        },
        {
          name: "Alma Radiante",
          level: 6,
          description:
            "A partir do 6° nível, sua conexão com o Celestial permite que você sirva como um canal para a energia radiante. Você tem resistência a dano radiante e, quando conjurar uma magia que cause dano radiante ou de fogo, pode adicionar seu modificador de Carisma à jogada de dano radiante ou de fogo dessa magia contra um dos alvos.",
        },
        {
          name: "Resiliência Celestial",
          level: 10,
          description:
            "A partir do 10° nível, você ganha pontos de vida temporários sempre que terminar um descanso curto ou longo. Esses pontos de vida temporários são iguais ao seu nível de bruxo + seu modificador de Carisma. Além disso, escolha até cinco criaturas que possa ver no final desse descanso. Cada uma dessas criaturas ganha pontos de vida temporários iguais à metade do seu nível de bruxo + seu modificador de Carisma.",
        },
        {
          name: "Vingança Ardente",
          level: 14,
          description:
            "A partir do 14° nível, a energia radiante que você canaliza permite que você resista à morte. Quando tiver que realizar um teste de resistência contra a morte no início do seu turno, você pode, em vez disso, se erguer com uma explosão de energia radiante. Você recupera pontos de vida iguais à metade do seu máximo de pontos de vida e então se levanta, se assim desejar. Cada criatura à sua escolha a até 9 metros de você sofre dano radiante igual a 2d8 + seu modificador de Carisma e fica cega até o final do turno atual.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
    {
      name: "A Lâmina Maldita",
      source: "XGtE",
      description:
        "Você fez seu pacto com uma entidade misteriosa do Pendor das Sombras – uma força que se manifesta em armas mágicas inteligentes esculpidas da matéria da sombra, como a espada Lâmina Negra. Muitos sábios especulam que essa força e a Rainha Corvo são uma só.",
      spells: {
        "1": ["Escudo Arcano", "Destruição Colérica"],
        "2": ["Nublar", "Marca da Punição"],
        "3": ["Piscar", "Arma Elemental"],
        "4": ["Assassino Fantasmagórico", "Destruição Estonteante"],
        "5": ["Destruição Banidora", "Cone de Frio"],
      },
      features: [
        {
          name: "Lista de Magias Expandida",
          level: 1,
          description:
            "A Lâmina Maldita permite que você escolha magias de uma lista expandida quando aprende uma magia de bruxo. As seguintes magias são adicionadas à sua lista de magias de bruxo: 1° nível – escudo arcano, destruição colérica; 2° nível – nublar, marca da punição; 3° nível – piscar, arma elemental; 4° nível – assassino fantasmagórico, destruição estonteante; 5° nível – destruição banidora, cone de frio.",
        },
        {
          name: "Maldição da Lâmina Maldita",
          level: 1,
          description:
            "Começando no 1° nível, você ganha a habilidade de colocar uma maldição perniciosa em alguém. Com uma ação bônus, escolha uma criatura que possa ver a até 9 metros de você. O alvo fica amaldiçoado por 1 minuto. A maldição termina mais cedo se o alvo morrer, se você morrer ou se você ficar incapacitado. Até a maldição terminar, você ganha os seguintes benefícios:\n• Você ganha um bônus nas jogadas de dano contra o alvo amaldiçoado. O bônus é igual ao seu bônus de proficiência.\n• Qualquer jogada de ataque que fizer contra o alvo amaldiçoado é um acerto crítico com um resultado de 19 ou 20 no d20.\n• Se o alvo amaldiçoado morrer, você recupera pontos de vida iguais ao seu nível de bruxo + seu modificador de Carisma (mínimo de 1 ponto de vida).\nVocê não pode usar essa característica novamente até terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
        {
          name: "Guerreiro Maldito",
          level: 1,
          description:
            "No 1° nível, você adquire o treinamento necessário para se armar efetivamente para a batalha. Você ganha proficiência com armaduras médias, escudos e armas marciais.\nA influência do seu patrono também permite que você canalize sua vontade através de uma arma específica. Sempre que terminar um descanso longo, você pode tocar uma arma com a qual seja proficiente e que não possua a propriedade duas mãos. Quando atacar com essa arma, você pode usar seu modificador de Carisma, em vez de Força ou Destreza, nas jogadas de ataque e dano. Esse benefício dura até você terminar um descanso longo. Se mais tarde você ganhar a característica Pacto da Lâmina, esse benefício se estende a todas as armas de pacto que conjurar com essa característica, independentemente do tipo da arma.",
        },
        {
          name: "Espectro Amaldiçoado",
          level: 6,
          description:
            "A partir do 6° nível, você pode amaldiçoar a alma de uma pessoa que matar, vinculando-a temporariamente aos seus serviços. Quando você matar um humanoide, pode fazer com que o espírito dele se levante do cadáver como um espectro, cujas estatísticas estão no Manual dos Monstros. Quando o espectro aparece, ele ganha pontos de vida temporários iguais à metade do seu nível de bruxo. Role iniciativa para o espectro, que tem seus próprios turnos. Ele obedece aos seus comandos verbais e ganha um bônus especial nas jogadas de ataque igual ao seu modificador de Carisma (mínimo de +0).\nO espectro permanece ao seu serviço até o final do seu próximo descanso longo, momento em que se desvanece para a vida após a morte.\nDepois de vincular um espectro com essa característica, você não pode usá-la novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Armadura de Maldições",
          level: 10,
          description:
            "No 10° nível, suas maldições tornam-se mais poderosas. Se o alvo amaldiçoado pela sua Maldição da Lâmina Maldita o atingir com uma jogada de ataque, você pode usar sua reação para rolar um d6. Com um resultado de 4 ou mais, o ataque erra você, independentemente do resultado da jogada.",
        },
        {
          name: "Mestre das Maldições",
          level: 14,
          description:
            "A partir do 14° nível, você pode espalhar sua Maldição da Lâmina Maldita de uma criatura morta para outra. Quando a criatura amaldiçoada pela sua Maldição da Lâmina Maldita morrer, você pode aplicar a maldição a uma criatura diferente que possa ver a até 9 metros de você, desde que não esteja incapacitado. Quando aplica a maldição dessa maneira, você não recupera pontos de vida pela morte da criatura anteriormente amaldiçoada.",
        },
      ],
    },
    {
      name: "O Insondável",
      source: "TCoE",
      description:
        "Você mergulhou em um pacto com as profundezas: uma entidade do oceano, do Plano Elemental da Água ou de outro mar sobrenatural – um kraken, um elemental da água ancestral, uma alucinação quase divina dos kuo-toa ou uma laia de megeras do mar – agora permite que você use seus poderes talássicos.",
      spells: {
        "1": ["Criar ou Destruir Água", "Onda Trovejante"],
        "2": ["Lufada de Vento", "Silêncio"],
        "3": ["Nevasca", "Relâmpago"],
        "4": ["Controlar a Água", "Invocar Elemental"],
        "5": ["Cone de Frio", "Mão de Bigby"],
      },
      features: [
        {
          name: "Lista de Magias Expandida",
          level: 1,
          description:
            "Quando você aprende uma magia de bruxo, o Insondável permite escolher a partir de uma lista expandida. As seguintes magias são adicionadas à sua lista de magias de bruxo: 1° nível – criar ou destruir água, onda trovejante; 2° nível – lufada de vento, silêncio; 3° nível – nevasca, relâmpago; 4° nível – controlar a água, invocar elemental (apenas água); 5° nível – cone de frio, mão de Bigby (com a aparência de um tentáculo).",
        },
        {
          name: "Tentáculo das Profundezas",
          level: 1,
          description:
            "Você pode invocar magicamente um tentáculo espectral que golpeia seus inimigos. Com uma ação bônus, você cria um tentáculo de 3 metros de comprimento em um ponto que possa ver a até 18 metros de você. O tentáculo dura 1 minuto ou até você usar essa característica para criar outro tentáculo.\nQuando você cria o tentáculo, você pode realizar um ataque corpo-a-corpo com magia contra uma criatura a até 3 metros dele. Em um acerto, o alvo sofre 1d8 de dano de frio, e o deslocamento dele é reduzido em 3 metros até o início do seu próximo turno. Quando você chega ao 10° nível nessa classe, o dano aumenta para 2d8.\nCom uma ação bônus no seu turno, você pode mover o tentáculo até 9 metros e repetir o ataque.\nVocê pode invocar o tentáculo um número de vezes igual ao seu bônus de proficiência, e recupera todos os usos ao terminar um descanso longo.",
          resource: { max: "prof", recharge: "long" },
        },
        {
          name: "Dom do Mar",
          level: 1,
          description:
            "Você adquire um deslocamento de natação de 12 metros e pode respirar debaixo d'água.",
        },
        {
          name: "Alma Oceânica",
          level: 6,
          description:
            "Você se sente ainda mais em casa nas profundezas. Você adquire resistência a dano de frio. Além disso, quando você estiver completamente submerso, qualquer criatura que também esteja completamente submersa pode entender sua fala, e você pode entender a dela.",
        },
        {
          name: "Espiral Guardiã",
          level: 6,
          description:
            "Seu Tentáculo das Profundezas pode defender você e outros, posicionando-se entre vocês e a ameaça. Quando você ou uma criatura que possa ver sofrer dano enquanto estiver a até 3 metros do tentáculo, você pode usar sua reação para escolher uma dessas criaturas e reduzir o dano sofrido por ela em 1d8. Quando você chegar ao 10° nível nessa classe, a redução de dano aumenta para 2d8.",
        },
        {
          name: "Tentáculos Enredantes",
          level: 10,
          description:
            "Você aprende a magia tentáculos negros de Evard. Ela é considerada uma magia de bruxo para você, mas não conta no número de magias que você conhece. Você também pode conjurá-la uma vez sem gastar um espaço de magia, recuperando essa habilidade ao terminar um descanso longo.\nSempre que você conjura essa magia, a magia do seu patrono o inunda, concedendo a você pontos de vida temporários iguais ao seu nível de bruxo. Além disso, nenhum dano pode quebrar sua concentração nessa magia.",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Mergulho no Insondável",
          level: 14,
          description:
            "Você pode abrir magicamente canais temporários para destinos aquáticos. Com uma ação, você pode teletransportar a si mesmo e até cinco outras criaturas voluntárias que possa ver a até 9 metros de você. Em meio a um turbilhão de tentáculos, todos vocês desaparecem e reaparecem a até 1,5 km de distância em um corpo d'água que você já viu (do tamanho de uma lagoa ou maior) ou a até 9 metros dele, cada um aparecendo em um espaço desocupado a até 9 metros dos demais.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
      ],
    },
    {
      name: "O Gênio",
      source: "TCoE",
      description:
        "Você fez um pacto com um dos mais raros tipos de gênio, um nobre – dao (terra), djinni (ar), ifrit (fogo) ou marid (água). Tais entidades comandam vastos territórios nos Planos Elementais, detêm poderes que rivalizam com divindades menores e se deleitam em virar o jogo contra os mortais.",
      spells: {
        "1": [
          "Detectar o Bem e Mal",
          "Santuário",
          "Onda Trovejante",
          "Mãos Flamejantes",
          "Névoa Obscurecente",
        ],
        "2": [
          "Força Fantasmagórica",
          "Crescer Espinhos",
          "Lufada de Vento",
          "Raio Ardente",
          "Nublar",
        ],
        "3": [
          "Criar Alimentos",
          "Mesclar-se Às Rochas",
          "Muralha de Vento",
          "Bola de Fogo",
          "Nevasca",
        ],
        "4": [
          "Assassino Fantasmagórico",
          "Moldar Rochas",
          "Invisibilidade Maior",
          "Escudo de Fogo",
          "Controlar a Água",
        ],
        "5": [
          "Criação",
          "Muralha de Pedra",
          "Similaridade",
          "Coluna de Chamas",
          "Cone de Frio",
        ],
        "9": ["Desejo"],
      },
      features: [
        {
          name: "Receptáculo do Gênio",
          level: 1,
          description:
            "Seu patrono o presenteia com um receptáculo mágico que lhe concede uma parcela do poder do gênio. O receptáculo é um objeto Miúdo, e você pode usá-lo como foco de conjuração para suas magias de bruxo. Você decide o que o objeto é, ou pode determiná-lo aleatoriamente (1d6): 1 – lâmpada de óleo; 2 – urna; 3 – anel com compartimento; 4 – garrafa com rolha; 5 – estatueta oca; 6 – lanterna ornamentada.\nEnquanto estiver tocando o receptáculo, você pode usá-lo das seguintes maneiras:\nDescanso Engarrafado. Com uma ação, você pode desaparecer magicamente e entrar em seu receptáculo, que permanece no espaço que você deixou. O interior do receptáculo é um espaço extradimensional na forma de um cilindro de 6 metros de raio e 6 metros de altura, e lembra o objeto. O interior é mobiliado com almofadas e mesas baixas e fica em uma temperatura confortável. Enquanto estiver dentro, você pode ouvir a área ao redor do receptáculo como se estivesse no espaço dele. Você pode permanecer dentro do receptáculo por um número de horas igual a duas vezes o seu bônus de proficiência. Você sai do receptáculo antes disso se usar uma ação bônus para sair, se morrer ou se o receptáculo for destruído. Quando você sai do receptáculo, você aparece no espaço desocupado mais próximo dele. Qualquer objeto deixado no receptáculo permanece lá até ser carregado para fora, e se o receptáculo for destruído, todo objeto contido nele reaparece sem danos nos espaços desocupados mais próximos da antiga localização do receptáculo. Uma vez que entre no receptáculo, você não pode fazê-lo novamente até terminar um descanso longo.\nIra do Gênio. Uma vez por turno, quando você acertar uma jogada de ataque, você pode causar dano extra ao alvo igual ao seu bônus de proficiência. O tipo desse dano é determinado por seu patrono: concussão (dao), trovão (djinni), fogo (ifrit) ou frio (marid).\nA CA do receptáculo é igual à CD das suas magias. Ele tem pontos de vida iguais ao seu nível de bruxo mais seu bônus de proficiência e é imune a dano de veneno e psíquico.\nSe o receptáculo for destruído ou você o perder, você pode realizar uma cerimônia de 1 hora para receber um substituto do seu patrono. Essa cerimônia pode ser realizada durante um descanso curto ou longo, e o receptáculo anterior é destruído caso ainda exista. O receptáculo desaparece em um clarão de poder elemental quando você morre.",
          resource: { name: "Descanso Engarrafado", max: 1, recharge: "long" },
        },
        {
          name: "Lista de Magias Expandida",
          level: 1,
          description:
            "O Gênio permite que você escolha a partir de uma lista expandida de magias quando aprende uma magia de bruxo. As magias de Gênio (todos os tipos) e as magias associadas ao seu tipo de patrono são adicionadas à sua lista de magias de bruxo.\nMagias de Gênio (todos): 1° nível – detectar o bem e mal; 2° nível – força fantasmagórica; 3° nível – criar alimentos; 4° nível – assassino fantasmagórico; 5° nível – criação; 9° nível – desejo.\nDao: 1° – santuário; 2° – crescer espinhos; 3° – mesclar-se às rochas; 4° – moldar rochas; 5° – muralha de pedra.\nDjinni: 1° – onda trovejante; 2° – lufada de vento; 3° – muralha de vento; 4° – invisibilidade maior; 5° – similaridade.\nIfrit: 1° – mãos flamejantes; 2° – raio ardente; 3° – bola de fogo; 4° – escudo de fogo; 5° – coluna de chamas.\nMarid: 1° – névoa obscurecente; 2° – nublar; 3° – nevasca; 4° – controlar a água; 5° – cone de frio.",
        },
        {
          name: "Dom Elemental",
          level: 6,
          description:
            "Você começa a desenvolver características do seu tipo de patrono. Você tem resistência a um tipo de dano determinado por seu tipo de patrono: concussão (dao), trovão (djinni), fogo (ifrit) ou frio (marid).\nAlém disso, com uma ação bônus, você pode conceder a si mesmo um deslocamento de voo de 9 metros por 10 minutos, durante os quais você pode pairar. Você pode usar essa ação bônus um número de vezes igual ao seu bônus de proficiência, e recupera todos os usos quando termina um descanso longo.",
          resource: { name: "Voo do Dom Elemental", max: "prof", recharge: "long" },
        },
        {
          name: "Receptáculo Protetor",
          level: 10,
          description:
            "Quando você entra em seu Receptáculo do Gênio usando o Descanso Engarrafado, você pode levar consigo até 5 criaturas voluntárias que possa ver a até 9 metros de você, e elas entram no receptáculo com você. Com uma ação bônus, você pode ejetar qualquer número de criaturas do receptáculo, e todas são ejetadas se você sair ou morrer, ou se o receptáculo for destruído.\nAlém disso, qualquer um (incluindo você) que permaneça dentro do receptáculo por pelo menos 10 minutos adquire os benefícios de terminar um descanso curto, e qualquer um pode adicionar o seu bônus de proficiência ao número de pontos de vida que recupera ao gastar Dados de Vida como parte de um descanso curto ali.",
        },
        {
          name: "Desejo Restrito",
          level: 14,
          description:
            "Você roga ao seu patrono que lhe conceda um pequeno desejo. Com uma ação, você pode formular seu desejo ao seu Receptáculo do Gênio, solicitando o efeito de uma magia de 6° nível ou inferior que tenha tempo de conjuração de 1 ação. A magia pode ser de qualquer lista de classe, e você não precisa atender aos requisitos dessa magia, incluindo o custo de componentes; a magia simplesmente faz efeito como parte dessa ação.\nDepois de usar essa característica, você não pode usá-la novamente até terminar 1d4 descansos longos.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
  ],
};
