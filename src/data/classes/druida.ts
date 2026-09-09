import type { ClassDef } from "@/lib/types";

const ASI_DESC =
  "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.";

/**
 * Druida — progressão completa (níveis 1–20) e todos os Círculos Druídicos do
 * Livro do Jogador (PHB p. 71–76), Guia de Xanathar (XGtE p. 26–29) e
 * Caldeirão de Tasha (TCoE p. 41–45).
 */
export const DRUIDA: ClassDef = {
  name: "Druida",
  source: "PHB",
  subclassLabel: "Círculo Druídico",
  subclassLevel: 2,
  features: [
    {
      name: "Druídico",
      level: 1,
      description:
        "Você conhece o Druídico, o idioma secreto dos druidas. Você pode falar esse idioma e usá-lo para deixar mensagens escondidas. Você e outros que conheçam esse idioma automaticamente veem tais mensagens. Outros perceberão a presença da mensagem se passarem num teste de Sabedoria (Percepção) CD 15, mas não conseguirão decifrá-la sem magia.",
    },
    {
      name: "Conjuração",
      level: 1,
      description:
        "Baseado na essência divina da própria natureza, você pode conjurar magias para moldar essa essência à sua vontade.\n" +
        "Truques. Você conhece dois truques, à sua escolha, da lista de magias de druida. Você aprende truques de druida adicionais em níveis mais altos: 3 truques no 4º nível e 4 truques no 10º nível.\n" +
        "Preparando e Conjurando Magias. A tabela O Druida mostra quantos espaços de magia você tem para conjurar suas magias de 1º nível e superiores. Para conjurar uma dessas magias, você precisa gastar um espaço do nível da magia ou superior. Você recupera todos os espaços gastos quando termina um descanso longo.\n" +
        "Você prepara a lista de magias disponíveis selecionando-as da lista de magias de druida. Você seleciona um número de magias igual ao seu modificador de Sabedoria + seu nível de druida (mínimo de uma magia). Essas magias devem ser de níveis para os quais você possua espaços de magia. Ao conjurar a magia, você não a retira de sua lista de magias preparadas. Você pode modificar a sua lista de magias preparadas quando termina um descanso longo; preparar uma nova lista requer tempo gasto em preces e meditação: no mínimo 1 minuto por nível de magia para cada magia preparada.\n" +
        "Habilidade de Conjuração. Sabedoria é a sua habilidade de conjuração para suas magias de druida, já que sua magia vem da sua devoção e sintonia com a natureza. CD para suas magias = 8 + bônus de proficiência + seu modificador de Sabedoria. Modificador de ataque de magia = seu bônus de proficiência + seu modificador de Sabedoria.\n" +
        "Conjuração de Ritual. Você pode conjurar qualquer magia de druida que você tenha preparada como um ritual se ela possuir o descritor ritual.\n" +
        "Foco de Conjuração. Você pode usar um foco druídico como foco de conjuração das suas magias de druida.",
    },
    {
      name: "Círculo Druídico",
      level: 2,
      description:
        "No 2º nível, você escolhe se identificar com um círculo de druidas. Sua escolha lhe concede características no 2º nível e novamente no 6º, 10º e 14º nível.",
    },
    {
      name: "Forma Selvagem",
      level: 2,
      description:
        "A partir do 2º nível, você pode usar sua ação para assumir magicamente a forma de uma besta que você já tenha visto antes. Você pode usar essa característica duas vezes. Você recupera os usos gastos quando termina um descanso curto ou longo.\n" +
        "Seu nível de druida determina as bestas em que você pode se transformar, como mostrado na tabela Formas de Besta. No 2º nível, por exemplo, você pode se transformar em qualquer besta que possua nível de desafio 1/4 ou inferior e que não possua deslocamento de voo ou de natação.\n" +
        "Formas de Besta: 2º nível – ND máx. 1/4, sem deslocamento de voo ou natação (ex.: lobo); 4º nível – ND máx. 1/2, sem deslocamento de voo (ex.: crocodilo); 8º nível – ND máx. 1, sem limitações (ex.: águia gigante).\n" +
        "Você pode continuar na forma de besta por um número de horas igual à metade do seu nível de druida (arredondado para baixo). Então, você volta à sua forma normal, a não ser que gaste outro uso dessa característica. Você pode reverter à sua forma normal prematuramente usando uma ação bônus no seu turno. Você reverte automaticamente se cair inconsciente, cair a 0 pontos de vida ou morrer.\n" +
        "Enquanto estiver transformado, as seguintes regras se aplicam:\n" +
        "• Suas estatísticas de jogo são substituídas pelas estatísticas da besta, mas você mantém sua tendência, personalidade e valores de Inteligência, Sabedoria e Carisma. Você também mantém suas proficiências em todas as suas perícias e testes de resistência, além de receber as proficiências da criatura. Se a criatura possuir a mesma proficiência que você e o bônus no bloco de estatísticas dela for maior que o seu, você usa o bônus da criatura. Se a criatura possuir qualquer ação lendária ou de covil, você não pode usá-las.\n" +
        "• Quando você se transforma, você assume os pontos de vida e Dados de Vida da criatura. Quando você reverte à sua forma normal, você retorna ao número de pontos de vida que tinha antes de se transformar. Porém, se você reverter como resultado de ter caído a 0 pontos de vida, todo o dano excedente é transferido para a sua forma normal. Por exemplo, se você sofrer 10 pontos de dano em forma animal e tiver apenas 1 ponto de vida restante, você reverte e sofre 9 de dano. Contanto que o dano excedente não reduza você a 0 pontos de vida, você não cai inconsciente.\n" +
        "• Você não pode conjurar magias, e sua capacidade de falar ou de realizar qualquer ação que requeira mãos é limitada pelas capacidades da forma de besta. Transformar-se não interrompe sua concentração em uma magia que você já tenha conjurado, nem impede você de realizar ações que sejam parte de uma magia, como convocar relâmpagos, que você já tenha conjurado.\n" +
        "• Você mantém os benefícios de todas as características de classe, raça ou outras fontes, e pode usá-las caso a nova forma seja fisicamente capaz de fazê-lo. No entanto, você não pode usar qualquer dos seus sentidos especiais, como visão no escuro, a não ser que a nova forma também tenha esse sentido.\n" +
        "• Você pode escolher se o seu equipamento cai no chão no seu espaço, é assimilado à sua nova forma ou é usado por ela. Equipamentos vestidos e carregados funcionam normalmente, mas o Mestre decide qual equipamento é viável para a nova forma vestir ou usar, baseado na forma e tamanho da criatura. O seu equipamento não muda de forma ou tamanho para se adaptar à nova forma, e qualquer equipamento que a nova forma não possa vestir deve cair no chão ou ser assimilado por ela. Equipamentos assimilados não têm efeito até você deixar a forma.",
      resource: { max: 2, recharge: "short" },
    },
    {
      name: "Aprimoramento de Forma Selvagem",
      level: 4,
      description:
        "A partir do 4º nível, sua Forma Selvagem pode assumir bestas de ND máximo 1/2, desde que não possuam deslocamento de voo (deslocamento de natação passa a ser permitido). Exemplo: crocodilo.",
    },
    { name: "Incremento no Valor de Habilidade", level: 4, description: ASI_DESC, asi: true },
    {
      name: "Aprimoramento de Forma Selvagem",
      level: 8,
      description:
        "A partir do 8º nível, sua Forma Selvagem pode assumir bestas de ND máximo 1, sem limitação de deslocamento (voo e natação permitidos). Exemplo: águia gigante.",
    },
    { name: "Incremento no Valor de Habilidade", level: 8, description: ASI_DESC, asi: true },
    { name: "Incremento no Valor de Habilidade", level: 12, description: ASI_DESC, asi: true },
    { name: "Incremento no Valor de Habilidade", level: 16, description: ASI_DESC, asi: true },
    {
      name: "Corpo Atemporal",
      level: 18,
      description:
        "Começando no 18º nível, a magia primordial que você controla faz com que você envelheça mais lentamente. Para cada 10 anos que passarem, seu corpo envelhece apenas 1.",
    },
    {
      name: "Magias da Besta",
      level: 18,
      description:
        "A partir do 18º nível, você pode conjurar muitas das suas magias de druida em qualquer forma que assumir usando a Forma Selvagem. Você pode realizar os componentes somáticos e verbais de uma magia de druida na forma de besta, mas não é capaz de prover os componentes materiais.",
    },
    { name: "Incremento no Valor de Habilidade", level: 19, description: ASI_DESC, asi: true },
    {
      name: "Arquidruida",
      level: 20,
      description:
        "No 20º nível, você pode usar sua Forma Selvagem um número ilimitado de vezes.\nAlém disso, você pode ignorar os componentes verbais e somáticos das suas magias de druida, assim como qualquer componente material que não tenha custo e não seja consumido pela magia. Você recebe esse benefício tanto na sua forma normal quanto na forma de besta da sua Forma Selvagem.",
    },
  ],
  subclasses: [
    // ------------------------------------------------------------------ PHB
    {
      name: "Círculo da Terra",
      source: "PHB",
      description:
        "O Círculo da Terra é constituído por místicos e sábios que salvaguardam conhecimento e ritos antigos através de uma vasta tradição oral. Como membro desse círculo, sua magia é influenciada pela terra onde você foi iniciado nos ritos misteriosos do círculo.",
      // As magias dependem do terreno escolhido (ver descrição de "Magias de Círculo");
      // a lista genérica fica vazia por nível para não impor um terreno.
      spells: { "3": [], "5": [], "7": [], "9": [] },
      features: [
        {
          name: "Truque Adicional",
          level: 2,
          description: "Quando você escolhe esse círculo no 2º nível, você aprende um truque de druida adicional, à sua escolha.",
        },
        {
          name: "Recuperação Natural",
          level: 2,
          description:
            "A partir do 2º nível, você pode recuperar parte da sua energia mágica parando para fazer uma meditação e comunhão com a natureza. Durante um descanso curto, você escolhe espaços de magia gastos para recuperar. Os espaços de magia podem ter um nível combinado igual ou menor que metade do seu nível de druida (arredondado para cima), e nenhum dos espaços pode ser de 6º nível ou superior. Você não pode usar essa característica novamente até terminar um descanso longo.\nPor exemplo, quando você for um druida de 4º nível, você pode recuperar até dois níveis em espaços de magia: um espaço de 2º nível ou dois espaços de 1º nível.",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Magias de Círculo",
          level: 3,
          description:
            "Sua conexão mística com a terra infunde você com a habilidade de conjurar certas magias. No 3º, 5º, 7º e 9º nível, você ganha acesso a magias de círculo ligadas ao terreno em que você se tornou druida. Escolha o terreno – ártico, costa, deserto, floresta, montanha, pântano, planície ou subterrâneo – e consulte a lista de magias associada.\n" +
            "Uma vez que você tenha acesso a uma magia de círculo, você sempre a tem preparada e ela não conta no número de magias que você pode preparar a cada dia. Se você tiver acesso a uma magia que não aparece na lista de magias de druida, a magia é, no entanto, uma magia de druida para você.\n" +
            "Ártico — 3º: imobilizar pessoa, crescer espinhos; 5º: nevasca, lentidão; 7º: movimentação livre, tempestade de gelo; 9º: comunhão com a natureza, cone de frio.\n" +
            "Costa — 3º: passo nebuloso, reflexos; 5º: andar na água, respirar na água; 7º: movimentação livre, controlar a água; 9º: vidência, conjurar elemental.\n" +
            "Deserto — 3º: nublar, silêncio; 5º: criar alimentos, proteção contra energia; 7º: praga, terreno alucinógeno; 9º: muralha de pedra, praga de insetos.\n" +
            "Floresta — 3º: patas de aranha, pele de árvore; 5º: convocar relâmpagos, ampliar plantas; 7º: adivinhação, movimentação livre; 9º: comunhão com a natureza, caminhar em árvores.\n" +
            "Montanha — 3º: crescer espinhos, patas de aranha; 5º: mesclar-se às rochas, relâmpago; 7º: moldar rochas, pele de pedra; 9º: criar passagem, muralha de pedra.\n" +
            "Pântano — 3º: escuridão, flecha ácida de Melf; 5º: andar na água, névoa fétida; 7º: localizar criatura, movimentação livre; 9º: vidência, praga de insetos.\n" +
            "Planície — 3º: invisibilidade, passos sem pegadas; 5º: luz do dia, velocidade; 7º: adivinhação, movimentação livre; 9º: praga de insetos, sonho.\n" +
            "Subterrâneo — 3º: patas de aranha, teia; 5º: forma gasosa, névoa fétida; 7º: invisibilidade maior, moldar rochas; 9º: praga de insetos, névoa mortal.",
        },
        {
          name: "Caminho da Floresta",
          level: 6,
          description:
            "A partir do 6º nível, mover-se através de terreno difícil não mágico não custa a você nenhum movimento extra. Você também pode passar através de plantas não mágicas sem ser atrasado por elas e sem sofrer dano delas se tiverem espinhos, acúleos ou perigos similares.\nAlém disso, você tem vantagem em testes de resistência contra plantas criadas ou manipuladas magicamente para impedir movimentação, como as criadas pela magia constrição.",
        },
        {
          name: "Proteção Natural",
          level: 10,
          description:
            "Quando você atinge o 10º nível, você não pode ser enfeitiçado ou amedrontado por elementais ou fadas, e você se torna imune a veneno e doenças.",
        },
        {
          name: "Santuário Natural",
          level: 14,
          description:
            "A partir do 14º nível, as criaturas do mundo natural sentem sua ligação com a natureza e hesitam em atacar você. Quando uma besta ou criatura-planta atacar você, essa criatura deve fazer um teste de resistência de Sabedoria contra a CD das suas magias de druida. Em uma falha, a criatura deve escolher um alvo diferente, ou o ataque erra automaticamente. Em um sucesso, a criatura se torna imune a esse efeito por 24 horas.\nA criatura está ciente desse efeito antes de decidir atacar você.",
        },
      ],
    },
    {
      name: "Círculo da Lua",
      source: "PHB",
      description:
        "Os druidas do Círculo da Lua são ferrenhos guardiões da natureza que assombram as partes mais profundas das florestas. Tão mutáveis quanto a lua, espreitam como grandes felinos, voam como águias e investem como ursos – a selvageria está no sangue desses druidas.",
      features: [
        {
          name: "Forma Selvagem de Combate",
          level: 2,
          description:
            "Quando você escolhe esse círculo, no 2º nível, você recebe a habilidade de usar sua Forma Selvagem no seu turno com uma ação bônus, ao invés de com uma ação.\nAlém disso, enquanto estiver transformado pela sua Forma Selvagem, você pode usar uma ação bônus para gastar um espaço de magia e recuperar 1d8 pontos de vida por nível do espaço de magia gasto.",
        },
        {
          name: "Formas de Círculo",
          level: 2,
          description:
            "Os ritos do seu círculo garantem a você a habilidade de se transformar em formas animais mais poderosas. A partir do 2º nível, você pode usar sua Forma Selvagem para se transformar em uma besta com nível de desafio de até 1 (você ignora a coluna ND Máx. da tabela Formas de Besta, mas ainda deve acatar as limitações descritas lá: sem voo/natação no 2º nível, sem voo no 4º).\nA partir do 6º nível, você pode se transformar em uma besta com nível de desafio tão alto quanto seu nível de druida dividido por 3, arredondado para baixo.",
        },
        {
          name: "Ataque Primordial",
          level: 6,
          description:
            "A partir do 6º nível, seus ataques na forma de besta contam como mágicos para os propósitos de ultrapassar resistência e imunidade a ataques e danos não mágicos.",
        },
        {
          name: "Forma Selvagem de Elemental",
          level: 10,
          description:
            "No 10º nível, você pode gastar dois usos da sua Forma Selvagem ao mesmo tempo para se transformar em um elemental da água, elemental do ar, elemental do fogo ou elemental da terra.",
        },
        {
          name: "Mil Formas",
          level: 14,
          description:
            "No 14º nível, você aprende a usar magia para alterar sua forma física de maneiras mais sutis. Você pode conjurar a magia alterar-se à vontade.",
        },
      ],
    },
    // ----------------------------------------------------------------- XGtE
    {
      name: "Círculo dos Sonhos",
      source: "XGtE",
      description:
        "Druidas do Círculo dos Sonhos vêm de regiões com fortes laços com a Agrestia das Fadas e seus reinos de sonho. Sua magia cura feridas e traz alegria a corações abatidos, e os reinos que protegem são lugares reluzentes onde sonho e realidade se misturam e os cansados encontram descanso.",
      features: [
        {
          name: "Bálsamo da Corte de Verão",
          level: 2,
          description:
            "No 2º nível, você fica imbuído das bênçãos da Corte de Verão. Você é uma fonte de energia que oferece alívio para ferimentos. Você tem uma reserva de energia feérica representada por um número de d6 igual ao seu nível de druida.\nComo uma ação bônus, você pode escolher uma criatura que possa ver a até 36 metros de você e gastar um número desses dados igual à metade do seu nível de druida ou menos. Role os dados gastos e some-os. O alvo recupera um número de pontos de vida igual ao total. O alvo também ganha 1 ponto de vida temporário por dado gasto.\nVocê recupera todos os dados gastos quando termina um descanso longo.",
          resource: { name: "Bálsamo da Corte de Verão (d6)", max: "level", recharge: "long" },
        },
        {
          name: "Lareira de Sombra e Luar",
          level: 6,
          description:
            "No 6º nível, sua casa pode estar onde quer que você esteja. Durante um descanso curto ou longo, você pode invocar o poder sombrio da Corte do Crepúsculo para ajudar a proteger seu descanso. No início do descanso, você toca um ponto no espaço, e surge uma esfera de magia invisível de 9 metros de raio centrada nesse ponto. Cobertura total bloqueia a esfera.\nEnquanto estiverem dentro da esfera, você e seus aliados ganham +5 de bônus em testes de Destreza (Furtividade) e Sabedoria (Percepção), e qualquer luz de fontes não mágicas dentro da esfera (fogueira, tochas ou similares) não é visível de fora dela.\nA esfera desaparece ao final do descanso ou quando você sair dela.",
        },
        {
          name: "Caminhos Ocultos",
          level: 10,
          description:
            "A partir do 10º nível, você pode usar os caminhos escondidos e mágicos que algumas fadas usam para atravessar o espaço em um piscar de olhos. Como uma ação bônus no seu turno, você pode se teletransportar até 18 metros para um espaço desocupado que possa ver. Alternativamente, você pode usar sua ação para teletransportar uma criatura voluntária que você toque até 9 metros para um espaço desocupado que possa ver.\nVocê pode usar essa característica um número de vezes igual ao seu modificador de Sabedoria (mínimo uma vez), e recupera todos os usos gastos quando termina um descanso longo.",
          resource: { max: "wis", recharge: "long" },
        },
        {
          name: "Caminhante dos Sonhos",
          level: 14,
          description:
            "No 14º nível, a magia da Agrestia das Fadas lhe concede a capacidade de viajar mental ou fisicamente através das terras dos sonhos.\nQuando terminar um descanso curto, você pode conjurar uma das seguintes magias sem gastar um espaço de magia ou exigir componentes materiais: sonho (com você atuando como o mensageiro), vidência ou círculo de teletransporte.\nEsse uso de círculo de teletransporte é especial. Ao invés de abrir um portal para um círculo de teletransporte permanente, ele abre um portal para o último local onde você terminou um descanso longo no seu plano de existência atual. Se você não tiver feito um descanso longo no seu plano atual, a magia falha, mas não é desperdiçada.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
    {
      name: "Círculo do Pastor",
      source: "XGtE",
      description:
        "Os druidas do Círculo do Pastor comungam com os espíritos da natureza – especialmente os de animais e fadas – e os chamam para ajudar. Os pastores protegem animais e criaturas feéricas que têm dificuldade em se defender, e onde quer que forem, os espíritos da natureza estão com eles.",
      features: [
        {
          name: "Voz da Natureza",
          level: 2,
          description:
            "No 2º nível, você ganha a capacidade de conversar com bestas e muitos feéricos.\nVocê aprende a falar, ler e escrever Silvestre. Além disso, as bestas podem entender a sua fala, e você ganha a capacidade de decifrar seus ruídos e movimentos. A maioria das bestas não tem inteligência para transmitir ou entender conceitos sofisticados, mas uma besta amigável pode transmitir o que viu ou ouviu no passado recente. Essa habilidade não lhe concede amizade com bestas, embora você possa combiná-la com presentes para angariar favores com elas como faria com qualquer PdM.",
        },
        {
          name: "Espírito Totêmico",
          level: 2,
          description:
            "A partir do 2º nível, você pode chamar espíritos da natureza para influenciar o mundo ao seu redor. Como uma ação bônus, você pode invocar magicamente um espírito incorpóreo em um ponto que possa ver a até 18 metros de você. O espírito cria uma aura em um raio de 9 metros em torno desse ponto. Ele não conta nem como criatura nem como objeto, embora tenha a aparência espectral da criatura que representa.\nComo uma ação bônus, você pode mover o espírito até 18 metros para um ponto que possa ver.\nO espírito persiste por 1 minuto ou até você ficar incapacitado. Depois de usar essa característica, você não pode usá-la novamente até terminar um descanso curto ou longo.\nO efeito da aura do espírito depende do tipo de espírito que você convoca:\nEspírito do Urso. O espírito do urso concede a você e seus aliados seu poder e resistência. Cada criatura à sua escolha na aura quando o espírito aparece ganha pontos de vida temporários iguais a 5 + seu nível de druida. Além disso, você e seus aliados ganham vantagem em testes de Força e testes de resistência de Força enquanto estiverem na aura.\nEspírito do Falcão. O espírito do falcão é um caçador consumado, ajudando você e seus aliados com sua visão afiada. Quando uma criatura fizer uma jogada de ataque contra um alvo na aura do espírito, você pode usar sua reação para conceder vantagem a essa jogada. Além disso, você e seus aliados têm vantagem em testes de Sabedoria (Percepção) enquanto estiverem na aura.\nEspírito do Unicórnio. O espírito do unicórnio concede proteção aos que estão nas proximidades. Você e seus aliados ganham vantagem em todos os testes de habilidade feitos para detectar criaturas dentro da aura do espírito. Além disso, se você conjurar uma magia usando um espaço de magia que restaure pontos de vida de qualquer criatura dentro ou fora da aura, cada criatura à sua escolha na aura também recupera pontos de vida iguais ao seu nível de druida.",
          resource: { max: 1, recharge: "short" },
        },
        {
          name: "Invocador Poderoso",
          level: 6,
          description:
            "A partir do 6º nível, bestas e feéricos que você conjura são mais resistentes do que o normal. Qualquer besta ou feérico convocado ou criado por uma magia que você conjure ganha os seguintes benefícios:\n• A criatura surge com mais pontos de vida do que o normal: 2 pontos de vida adicionais por cada Dado de Vida que ela tenha.\n• O dano de suas armas naturais é considerado mágico com o objetivo de superar imunidade e resistência a ataques e danos não mágicos.",
        },
        {
          name: "Espírito Guardião",
          level: 10,
          description:
            "A partir do 10º nível, o seu Espírito Totêmico protege as bestas e feéricos que você invoca com sua magia. Quando uma besta ou feérico que você tenha convocado ou criado com uma magia termina seu turno na aura do seu Espírito Totêmico, essa criatura recupera pontos de vida iguais à metade do seu nível de druida.",
        },
        {
          name: "Chamado de Fidelidade",
          level: 14,
          description:
            "A partir do 14º nível, os espíritos da natureza com os quais você comunga protegem você quando você está mais indefeso. Se você for reduzido a 0 pontos de vida ou ficar incapacitado contra a sua vontade, você pode ganhar imediatamente os benefícios da magia conjurar animais, como se ela fosse conjurada usando um espaço de magia de 9º nível. Ela convoca quatro bestas à sua escolha de nível de desafio 2 ou inferior. As bestas conjuradas aparecem a até 6 metros de você. Se elas não receberem nenhum comando seu, elas protegem você contra dano e atacam seus inimigos. A magia dura 1 hora, não requer concentração, ou até você dispensá-la (nenhuma ação necessária).\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
    // ----------------------------------------------------------------- TCoE
    {
      name: "Círculo dos Esporos",
      source: "TCoE",
      description:
        "Druidas do Círculo dos Esporos encontram beleza na decadência: veem nos bolores e fungos a habilidade de transformar matéria morta em vida abundante, ainda que estranha. Acreditam que vida e morte são parte de um grande ciclo e combatem os mortos-vivos que tentam substituir toda a vida pela morte ou evitar seu descanso final.",
      spells: {
        "2": ["Toque Arrepiante"],
        "3": ["Cegueira/surdez", "Repouso Tranquilo"],
        "5": ["Animar Mortos", "Forma Gasosa"],
        "7": ["Malogro", "Confusão"],
        "9": ["Névoa Mortal", "Praga"],
      },
      features: [
        {
          name: "Magias de Círculo",
          level: 2,
          description:
            "Sua ligação simbiótica com os fungos e sua habilidade de transitar pelo ciclo da vida e da morte dá a você acesso a certas magias. No 2º nível, você aprende o truque toque arrepiante (toque necrótico).\nNo 3º, 5º, 7º e 9º níveis, você ganha acesso às magias listadas: 3º: cegueira/surdez, repouso tranquilo; 5º: animar mortos, forma gasosa; 7º: malogro, confusão; 9º: névoa mortal, praga.\nAssim que você ganha acesso a essas magias, elas são sempre consideradas preparadas e não contam no número de magias que você pode preparar por dia. Se com isso você adquirir uma magia que não esteja na lista de magias de druida, ela passa a ser uma magia de druida para você.",
        },
        {
          name: "Aura de Esporos",
          level: 2,
          description:
            "Você é cercado por esporos necróticos invisíveis, inofensivos até que você os libere em uma criatura próxima. Quando uma criatura que você possa ver se move para um espaço a 3 metros ou menos de você ou começa seu turno nessa distância, você pode usar sua reação para causar 1d4 de dano necrótico a essa criatura, a menos que ela seja bem-sucedida em um teste de resistência de Constituição contra a CD das suas magias. O dano necrótico aumenta para 1d6 no 6º nível, 1d8 no 10º nível e 1d10 no 14º nível.",
        },
        {
          name: "Entidade Simbiótica",
          level: 2,
          description:
            "Você ganha a habilidade de canalizar magia em seus esporos. Como uma ação, você pode gastar um uso da sua Forma Selvagem para despertar esses esporos, em vez de se transformar em uma besta, e você ganha 4 pontos de vida temporários para cada nível que tiver nesta classe. Enquanto essa característica estiver ativa, você ganha os seguintes benefícios:\n• Quando você causa dano com a Aura de Esporos, jogue o dado de dano uma segunda vez e adicione o resultado ao total de dano.\n• Seus ataques corpo a corpo com arma causam 1d6 de dano necrótico extra a qualquer alvo que você acertar.\nEsses benefícios duram 10 minutos, até você perder todos esses pontos de vida temporários ou até usar sua Forma Selvagem novamente.",
        },
        {
          name: "Infestação Fúngica",
          level: 6,
          description:
            "Seus esporos ganham a habilidade de infestar um corpo e animá-lo. Se uma besta ou humanoide de tamanho Pequeno ou Médio morrer a até 3 metros de você, você pode usar sua reação para animá-la, fazendo com que se levante imediatamente com 1 ponto de vida. A criatura usa o bloco de estatísticas do zumbi do Manual dos Monstros. Ela permanece animada por 1 hora, após o que colapsa e morre. Em combate, o turno do zumbi ocorre logo após o seu. Ele obedece seus comandos mentais, e a única ação que pode realizar é a ação de Ataque, realizando um ataque corpo a corpo.\nVocê pode usar essa característica um número de vezes igual ao seu modificador de Sabedoria (mínimo de 1), e recupera todos os usos ao terminar um descanso longo.",
          resource: { max: "wis", recharge: "long" },
        },
        {
          name: "Expansão de Esporos",
          level: 10,
          description:
            "Você adquire a habilidade de semear uma área com esporos mortais. Como uma ação bônus enquanto sua Entidade Simbiótica estiver ativa, você pode espalhar esporos em um ponto a até 9 metros de você, onde eles pairam em um cubo de 3 metros por 1 minuto. Os esporos desaparecem antes se você usar essa característica novamente, se os dissipar com uma ação bônus ou se sua Entidade Simbiótica não estiver mais ativa.\nSempre que uma criatura entrar nesse cubo ou começar seu turno lá, ela sofre o dano da sua Aura de Esporos, a menos que seja bem-sucedida em um teste de resistência de Constituição contra a CD das suas magias. Uma criatura não pode sofrer esse dano mais do que uma vez por turno.\nEnquanto o cubo de esporos durar, você não pode usar a reação da Aura de Esporos.",
        },
        {
          name: "Corpo Fúngico",
          level: 14,
          description:
            "Os esporos fúngicos em seu corpo o alteram: você não pode mais ser cegado, ensurdecido, amedrontado ou envenenado, e qualquer acerto crítico contra você conta como um acerto normal, exceto se você estiver incapacitado.",
        },
      ],
    },
    {
      name: "Círculo das Estrelas",
      source: "TCoE",
      description:
        "O Círculo das Estrelas permite que os druidas retirem seus poderes da luz estelar. Esses druidas rastreiam padrões celestiais desde tempos imemoriais, registrando as constelações em círculos de pedra, pirâmides e templos, e buscam controlar o poder do cosmo.",
      spells: { "2": ["Orientação", "Raio Guiador"] },
      features: [
        {
          name: "Mapa Estelar",
          level: 2,
          description:
            "Você criou uma carta estelar como parte de seus estudos celestiais. Ela é um objeto Miúdo e pode servir como foco de conjuração para suas magias de druida. Você determina a forma desse item rolando na tabela Mapa Estelar ou escolhendo uma (pergaminho coberto de constelações; placa de pedra com pequenos furos; pele de urso-coruja entalhada; coleção de mapas encadernada em ébano; cristal que projeta padrões estelares contra a luz; discos de vidro que representam constelações). Enquanto segurar esse mapa, você tem os seguintes benefícios:\n• Você conhece o truque orientação.\n• Você tem a magia raio guiador preparada. Ela é considerada uma magia de druida para você e não conta no número de magias que você pode preparar.\n• Você pode conjurar raio guiador sem gastar um espaço de magia. Você pode fazer isso um número de vezes igual ao seu bônus de proficiência, e recupera os usos ao terminar um descanso longo.\nSe você perder o mapa, pode realizar uma cerimônia mágica de 1 hora para criar um substituto. A cerimônia pode ser realizada durante um descanso curto ou longo e destrói o mapa anterior.",
          resource: { name: "Raio Guiador (Mapa Estelar)", max: "prof", recharge: "long" },
        },
        {
          name: "Forma Estelar",
          level: 2,
          description:
            "Com uma ação bônus, você pode gastar um uso da sua Forma Selvagem para assumir uma forma estelar, em vez de se transformar em uma besta.\nEnquanto estiver em sua forma estelar, você mantém as suas estatísticas de jogo, mas seu corpo se torna luminoso: suas juntas cintilam como estrelas e linhas brilhantes as conectam como em uma carta estelar. Essa forma emite luz plena em um raio de 3 metros e penumbra por mais 3 metros. A forma dura 10 minutos. Ela termina antes se você a dissipar (nenhuma ação necessária), ficar incapacitado, morrer ou usar essa característica novamente.\nSempre que assumir sua forma estelar, escolha qual das constelações a seguir brilha em seu corpo; sua escolha concede certos benefícios enquanto estiver nessa forma:\nArqueiro. Uma constelação de um arqueiro aparece em você. Quando ativar essa forma, e como uma ação bônus em cada um de seus turnos subsequentes enquanto ela durar, você pode realizar um ataque com magia à distância, atirando uma flecha luminosa contra uma criatura a até 18 metros de você. Em um acerto, o ataque causa dano radiante igual a 1d8 + seu modificador de Sabedoria.\nCálice. Uma constelação de um cálice doador de vida aparece em você. Sempre que gastar um espaço de magia para conjurar uma magia que restaure pontos de vida de uma criatura, você ou outra criatura a até 9 metros de você pode recuperar pontos de vida iguais a 1d8 + seu modificador de Sabedoria.\nDragão. Uma constelação de um dragão sagaz aparece em você. Quando você realizar um teste de Inteligência ou de Sabedoria, ou um teste de resistência de Constituição para manter a concentração em uma magia, você pode considerar um resultado de 9 ou menos no d20 como um 10.",
        },
        {
          name: "Presságio Cósmico",
          level: 6,
          description:
            "Sempre que encerrar um descanso longo, você pode consultar seu Mapa Estelar em busca de presságios. Quando fizer isso, jogue um dado. Até o fim do seu próximo descanso longo, você ganha acesso a uma reação especial baseada em ter tirado um número par ou ímpar no dado:\nProsperidade (par). Sempre que uma criatura a até 9 metros de você que você possa ver estiver prestes a fazer uma jogada de ataque, teste de resistência ou teste de habilidade, você pode usar sua reação para rolar um d6 e adicionar o número rolado ao total.\nInfortúnio (ímpar). Sempre que uma criatura a até 9 metros de você que você possa ver estiver prestes a fazer uma jogada de ataque, teste de resistência ou teste de habilidade, você pode usar sua reação para rolar um d6 e subtrair o número rolado do total.\nVocê pode usar essa reação um número de vezes igual ao seu bônus de proficiência, e recupera todos os usos ao final de um descanso longo.",
          resource: { max: "prof", recharge: "long" },
        },
        {
          name: "Constelações Cintilantes",
          level: 10,
          description:
            "As constelações da sua Forma Estelar são aprimoradas. O 1d8 das constelações do Arqueiro e do Cálice se torna 2d8, e enquanto a constelação do Dragão estiver ativa, você adquire um deslocamento de voo de 6 metros e pode pairar.\nAlém disso, no começo de cada um de seus turnos enquanto estiver na Forma Estelar, você pode trocar qual constelação brilha em seu corpo.",
        },
        {
          name: "Totalmente Estrelado",
          level: 14,
          description:
            "Enquanto estiver em sua Forma Estelar, você se torna parcialmente incorpóreo, ganhando resistência a dano de concussão, cortante e perfurante.",
        },
      ],
    },
    {
      name: "Círculo do Fogo Selvagem",
      source: "TCoE",
      description:
        "Druidas do Círculo do Fogo Selvagem compreendem que a destruição às vezes é precursora da criação, como quando um incêndio florestal promove o crescimento posterior. Esses druidas se ligam a um espírito primitivo de criação e destruição, criando chamas controladas que queimam uma coisa para dar vida a outra.",
      spells: {
        "2": ["Mãos Flamejantes", "Curar Ferimentos"],
        "3": ["Esfera Flamejante", "Raio Ardente"],
        "5": ["Ampliar Plantas", "Revivificar"],
        "7": ["Aura de Vida", "Escudo de Fogo"],
        "9": ["Coluna de Chamas", "Curar Ferimentos em Massa"],
      },
      features: [
        {
          name: "Magias de Círculo",
          level: 2,
          description:
            "Você criou um vínculo com um espírito do fogo selvagem, uma criatura primitiva de criação e destruição. Sua ligação com esse espírito dá a você acesso a algumas magias quando alcança certos níveis nesta classe: 2º: mãos flamejantes, curar ferimentos; 3º: esfera flamejante, raio ardente; 5º: ampliar plantas (crescimento de plantas), revivificar; 7º: aura de vida, escudo de fogo (escudo ardente); 9º: coluna de chamas, curar ferimentos em massa.\nAssim que você ganha acesso a essas magias, elas são sempre consideradas preparadas e não contam no número de magias que você pode preparar por dia. Se com isso você adquirir uma magia que não esteja na lista de magias de druida, ela passa a ser uma magia de druida para você.",
        },
        {
          name: "Invocar Espírito do Fogo Selvagem",
          level: 2,
          description:
            "Você pode invocar o espírito primitivo conectado à sua alma. Como uma ação, você pode gastar um uso da sua Forma Selvagem para invocar seu espírito do fogo selvagem, em vez de assumir a forma de uma besta.\nO espírito aparece em um espaço desocupado à sua escolha que você possa ver a até 9 metros de você. Quando o espírito aparece, cada criatura a até 3 metros dele (exceto você) deve ser bem-sucedida em um teste de resistência de Destreza contra a CD das suas magias ou sofre 2d6 de dano de fogo.\nO espírito é amigável a você e seus companheiros e obedece aos seus comandos. Ele usa o bloco de estatísticas do Espírito do Fogo Selvagem, que usa seu bônus de proficiência (BP) em várias coisas. Você determina a aparência do seu espírito: alguns assumem uma forma humanoide feita de galhos retorcidos envoltos em chamas, enquanto outros parecem bestas feitas de chamas.\nEm combate, o espírito compartilha sua contagem de iniciativa, mas executa seu turno logo após o seu. A única ação que ele realiza no turno é a ação Esquivar, a menos que você use sua ação bônus para comandá-lo a realizar outra ação. Essa ação pode ser uma do bloco de estatísticas dele ou qualquer outra. Se você estiver incapacitado, o espírito pode executar qualquer ação à sua escolha, não apenas Esquivar.\nO espírito se manifesta por 1 hora, até ser reduzido a 0 pontos de vida, até você usar essa característica para invocá-lo novamente ou até você morrer.\n" +
            "Espírito do Fogo Selvagem — Elemental Pequeno. CA 13 (armadura natural). PV 5 + cinco vezes seu nível de druida. Deslocamento 9 m, voo 9 m (pairar). FOR 10 (+0), DES 14 (+2), CON 14 (+2), INT 13 (+1), SAB 15 (+2), CAR 15 (+2). Imunidade a dano: fogo. Imunidade a condições: enfeitiçado, amedrontado, agarrado, caído, impedido. Sentidos: visão no escuro 18 m, Percepção passiva 12. Idiomas: compreende os idiomas que você fala. Bônus de proficiência (BP): igual ao seu.\nSemente de Fogo. Ataque com arma à distância: seu modificador de ataque com magia para acertar, alcance 18 m, um alvo que você possa ver. Acerto: 1d6 + BP de dano de fogo.\nTeletransporte Feérico. O espírito e cada criatura voluntária à sua escolha a até 1,5 metro dele se teletransportam até 4,5 metros para um espaço desocupado que você possa ver. Então, cada criatura a até 1,5 metro do espaço que o espírito deixou deve ser bem-sucedida em um teste de resistência de Destreza contra a CD das suas magias ou sofre 1d6 + BP de dano de fogo.",
        },
        {
          name: "Vínculo Aprimorado",
          level: 6,
          description:
            "O vínculo com seu espírito do fogo selvagem aprimora suas magias de restauração e destruição. Sempre que você conjurar uma magia que cause dano de fogo ou que restaure pontos de vida enquanto seu espírito do fogo selvagem estiver invocado, jogue 1d8, e você ganha um bônus igual ao número rolado em uma jogada de dano ou de cura dessa magia.\nAlém disso, quando você conjura uma magia com um alcance que não seja pessoal, a magia pode se originar do seu espírito do fogo selvagem.",
        },
        {
          name: "Cauterizar Chamas",
          level: 10,
          description:
            "Você ganha a habilidade de transformar a morte em chamas mágicas que podem curar ou incinerar. Quando uma criatura Pequena ou maior morre a até 9 metros de você ou do seu espírito do fogo selvagem, uma chama espectral inofensiva brota do espaço da criatura morta e brilha ali por 1 minuto. Quando uma criatura que você possa ver entra nesse espaço, você pode usar sua reação para extinguir a chama espectral e curar ou causar dano de fogo a essa criatura. O valor dessa cura ou dano é igual a 2d10 + seu modificador de Sabedoria.\nVocê pode usar essa reação um número de vezes igual ao seu bônus de proficiência, e recupera todos os usos quando termina um descanso longo.",
          resource: { max: "prof", recharge: "long" },
        },
        {
          name: "Renovação Ardente",
          level: 14,
          description:
            "O vínculo com seu espírito do fogo selvagem pode salvar você da morte. Se o espírito estiver a até 36 metros de você quando você for reduzido a 0 pontos de vida e cair inconsciente, você pode fazer com que o espírito caia a 0 pontos de vida. Você então recupera metade dos seus pontos de vida e imediatamente se levanta. Assim que usar essa característica, você não pode usá-la novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
  ],
  multiclass: {
    prerequisite: "Sabedoria 13",
    proficiencies: "Armadura leve, armadura média, escudos (druidas não usarão armaduras ou escudos feitos de metal)",
    skills: 0,
  },
};
