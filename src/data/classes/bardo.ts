import type { ClassDef } from "@/lib/types";

const ASI_DESC =
  "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.";

export const BARDO: ClassDef = {
  name: "Bardo",
  source: "PHB",
  subclassLabel: "Colégio de Bardo",
  subclassLevel: 3,
  multiclass: {
    prerequisite: "Carisma 13",
    proficiencies:
      "Armadura leve, uma perícia de sua escolha, um instrumento musical de sua escolha",
    skills: 1,
  },
  features: [
    {
      name: "Conjuração",
      level: 1,
      description:
        "Você aprendeu a desembaraçar e remodelar o tecido da realidade em harmonia com os seus desejos e música. Suas magias são parte do seu vasto repertório, magia que você pode entoar em diferentes situações. Veja o capítulo 10 do Livro do Jogador para as regras gerais de conjuração e o capítulo 11 para a lista de magias de bardo.\nTruques. Você conhece dois truques, à sua escolha, da lista de magias de bardo. Você aprende truques de bardo adicionais em níveis mais altos: 3 truques conhecidos no 4° nível e 4 truques no 10° nível.\nEspaços de Magia. A tabela O Bardo mostra quantos espaços de magia de 1° nível e superiores você possui. Para conjurar uma dessas magias, você deve gastar um espaço de magia do nível da magia ou superior. Você recobra todos os espaços de magia gastos quando completa um descanso longo. Espaços por nível de bardo (1°/2°/3°/4°/5°/6°/7°/8°/9°): 1° nível: 2; 2°: 3; 3°: 4/2; 4°: 4/3; 5°: 4/3/2; 6°: 4/3/3; 7°: 4/3/3/1; 8°: 4/3/3/2; 9°: 4/3/3/3/1; 10°: 4/3/3/3/2; 11°–12°: 4/3/3/3/2/1; 13°–14°: 4/3/3/3/2/1/1; 15°–16°: 4/3/3/3/2/1/1/1; 17°: 4/3/3/3/2/1/1/1/1; 18°: 4/3/3/3/3/1/1/1/1; 19°: 4/3/3/3/3/2/1/1/1; 20°: 4/3/3/3/3/2/2/1/1.\nMagias Conhecidas de 1° Nível e Superiores. Você conhece quatro magias de 1° nível, à sua escolha, da lista de magias de bardo. A coluna Magias Conhecidas da tabela O Bardo mostra quando você aprende mais magias de bardo, à sua escolha: 4 no 1° nível, 5 no 2°, 6 no 3°, 7 no 4°, 8 no 5°, 9 no 6°, 10 no 7°, 11 no 8°, 12 no 9°, 14 no 10°, 15 no 11° e 12°, 16 no 13°, 18 no 14°, 19 no 15° e 16°, 20 no 17° e 22 do 18° ao 20°. Cada uma dessas magias deve ser de um nível para o qual você tenha espaços de magia. Além disso, quando você adquire um nível nessa classe, você pode escolher uma magia de bardo que conheça e substituí-la por outra magia da lista de bardo, que também deve ser de um nível para o qual você tenha espaços de magia.\nHabilidade de Conjuração. Carisma é a sua habilidade de conjuração para as magias de bardo. Você usa seu Carisma sempre que uma magia se referir à sua habilidade de conjuração, para definir a CD dos testes de resistência das suas magias de bardo e nas jogadas de ataque com magia. CD das magias = 8 + seu bônus de proficiência + seu modificador de Carisma. Modificador de ataque de magia = seu bônus de proficiência + seu modificador de Carisma.\nConjuração de Ritual. Você pode conjurar qualquer magia de bardo que conheça como um ritual se ela possuir o descritor ritual.\nFoco de Conjuração. Você pode usar um instrumento musical (capítulo 5 do Livro do Jogador) como foco de conjuração das suas magias de bardo.",
    },
    {
      name: "Inspiração de Bardo (d6)",
      level: 1,
      description:
        "Você pode inspirar os outros através de palavras animadoras ou música. Para tanto, você usa uma ação bônus no seu turno para escolher uma criatura, que não seja você mesmo, a até 18 metros de você que possa ouvi-lo. Essa criatura ganha um dado de Inspiração de Bardo, um d6.\nUma vez, nos próximos 10 minutos, a criatura pode rolar o dado e adicionar o valor rolado a um teste de habilidade, jogada de ataque ou teste de resistência que ela fizer. A criatura pode esperar até rolar o d20 antes de decidir usar o dado de Inspiração de Bardo, mas deve decidir antes de o Mestre dizer se a rolagem foi bem ou malsucedida. Quando o dado de Inspiração de Bardo for rolado, ele é gasto. Uma criatura pode ter apenas um dado de Inspiração de Bardo por vez.\nVocê pode usar essa característica um número de vezes igual ao seu modificador de Carisma (no mínimo uma vez). Você recupera todos os usos quando termina um descanso longo.\nSeu dado de Inspiração de Bardo muda quando você atinge certos níveis na classe: o dado se torna um d8 no 5° nível, um d10 no 10° nível e um d12 no 15° nível.",
      resource: { max: "cha", recharge: "long" },
    },
    {
      name: "Versatilidade",
      level: 2,
      description:
        "A partir do 2° nível, você pode adicionar metade do seu bônus de proficiência, arredondado para baixo, a qualquer teste de habilidade que você fizer que ainda não inclua seu bônus de proficiência.",
    },
    {
      name: "Canção do Descanso (d6)",
      level: 2,
      description:
        "A partir do 2° nível, você pode usar música ou oração calmantes para ajudar a revitalizar seus aliados feridos durante um descanso curto. Se você ou qualquer criatura amigável que puder ouvir sua atuação recuperar pontos de vida no fim do descanso curto ao gastar um ou mais Dados de Vida, cada uma dessas criaturas recupera 1d6 pontos de vida adicionais.\nOs pontos de vida adicionais aumentam quando você alcança determinados níveis na classe: para 1d8 no 9° nível, 1d10 no 13° nível e 1d12 no 17° nível.",
    },
    {
      name: "Colégio de Bardo",
      level: 3,
      description:
        "No 3° nível, você investiga as técnicas avançadas de um colégio de bardo, à sua escolha: o Colégio do Conhecimento ou o Colégio da Bravura (Livro do Jogador), o Colégio do Glamour, o Colégio das Espadas ou o Colégio dos Sussurros (Guia de Xanathar), ou o Colégio da Criação ou o Colégio da Eloquência (Caldeirão de Tasha). Sua escolha lhe concede características no 3° nível e novamente no 6° e 14° níveis.",
    },
    {
      name: "Aptidão",
      level: 3,
      expertise: { count: 2 },
      description:
        "No 3° nível, escolha duas das perícias em que você é proficiente. Seu bônus de proficiência é dobrado em qualquer teste de habilidade que você fizer que utilize qualquer das perícias escolhidas.\nNo 10° nível, você escolhe mais duas perícias em que é proficiente para ganhar esse benefício.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 4,
      asi: true,
      description: ASI_DESC,
    },
    {
      name: "Inspiração de Bardo (d8)",
      level: 5,
      description:
        "No 5° nível, seu dado de Inspiração de Bardo se torna um d8.",
    },
    {
      name: "Fonte de Inspiração",
      level: 5,
      description:
        "Começando no momento em que você atinge o 5° nível, você recupera todas as utilizações gastas da sua Inspiração de Bardo quando termina um descanso curto ou longo.",
      resource: { name: "Inspiração de Bardo", max: "cha", recharge: "short" },
    },
    {
      name: "Canção de Proteção",
      level: 6,
      description:
        "No 6° nível, você adquire a habilidade de usar notas musicais ou palavras de poder para interromper efeitos de influência mental. Com uma ação, você pode começar uma atuação que dura até o fim do seu próximo turno. Durante esse tempo, você e qualquer criatura amigável a até 9 metros de você têm vantagem em testes de resistência para não ser amedrontado ou enfeitiçado. Uma criatura deve ser capaz de ouvir você para receber esse benefício. A atuação termina prematuramente se você for incapacitado ou silenciado ou se você terminá-la voluntariamente (não requer ação).",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 8,
      asi: true,
      description: ASI_DESC,
    },
    {
      name: "Canção do Descanso (d8)",
      level: 9,
      description:
        "No 9° nível, os pontos de vida adicionais da sua Canção do Descanso aumentam para 1d8.",
    },
    {
      name: "Inspiração de Bardo (d10)",
      level: 10,
      description:
        "No 10° nível, seu dado de Inspiração de Bardo se torna um d10.",
    },
    {
      name: "Aptidão",
      level: 10,
      expertise: { count: 2 },
      description:
        "No 10° nível, você escolhe mais duas perícias em que é proficiente para receber o benefício de Aptidão: seu bônus de proficiência é dobrado em qualquer teste de habilidade que utilize essas perícias.",
    },
    {
      name: "Segredos Mágicos",
      level: 10,
      description:
        "No 10° nível, você usurpou conhecimento mágico de um vasto espectro de disciplinas. Escolha duas magias de qualquer classe, incluindo essa. Cada magia escolhida deve ser de um nível que você possa conjurar, como mostrado na tabela O Bardo, ou um truque.\nAs magias escolhidas contam como magias de bardo para você e já estão incluídas no número da coluna Magias Conhecidas da tabela O Bardo.\nVocê aprende duas magias adicionais de qualquer classe no 14° nível e novamente no 18° nível.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 12,
      asi: true,
      description: ASI_DESC,
    },
    {
      name: "Canção do Descanso (d10)",
      level: 13,
      description:
        "No 13° nível, os pontos de vida adicionais da sua Canção do Descanso aumentam para 1d10.",
    },
    {
      name: "Segredos Mágicos",
      level: 14,
      description:
        "No 14° nível, você aprende duas magias adicionais de qualquer classe, incluindo essa. Cada magia deve ser de um nível que você possa conjurar, como mostrado na tabela O Bardo, ou um truque. Elas contam como magias de bardo para você e já estão incluídas no número da coluna Magias Conhecidas.",
    },
    {
      name: "Inspiração de Bardo (d12)",
      level: 15,
      description:
        "No 15° nível, seu dado de Inspiração de Bardo se torna um d12.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 16,
      asi: true,
      description: ASI_DESC,
    },
    {
      name: "Canção do Descanso (d12)",
      level: 17,
      description:
        "No 17° nível, os pontos de vida adicionais da sua Canção do Descanso aumentam para 1d12.",
    },
    {
      name: "Segredos Mágicos",
      level: 18,
      description:
        "No 18° nível, você aprende duas magias adicionais de qualquer classe, incluindo essa. Cada magia deve ser de um nível que você possa conjurar, como mostrado na tabela O Bardo, ou um truque. Elas contam como magias de bardo para você e já estão incluídas no número da coluna Magias Conhecidas.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 19,
      asi: true,
      description: ASI_DESC,
    },
    {
      name: "Inspiração Superior",
      level: 20,
      description:
        "No 20° nível, quando você rolar iniciativa e não tiver nenhum uso restante de Inspiração de Bardo, você recupera um uso.",
    },
  ],
  subclasses: [
    {
      name: "Colégio do Conhecimento",
      source: "PHB",
      description:
        "Bardos que conhecem algo sobre a maioria das coisas, coletando pedaços de conhecimento de fontes tão diversas quanto tomos eruditos ou contos de camponeses. Sua fidelidade reside na busca pela beleza e verdade, e eles usam seus dons para expor corrupção, desvendar mentiras e zombar de figuras de autoridade.",
      features: [
        {
          name: "Proficiência Adicional",
          level: 3,
          description:
            "Quando você se junta ao Colégio do Conhecimento no 3° nível, você ganha proficiência em três perícias, à sua escolha.",
        },
        {
          name: "Palavras de Interrupção",
          level: 3,
          description:
            "Também no 3° nível, você aprende a usar sua perspicácia para distrair, confundir e, de outras formas, atrapalhar a confiança e a competência dos outros. Quando uma criatura que você pode ver a até 18 metros de você realizar uma jogada de ataque, um teste de habilidade ou uma jogada de dano, você pode usar sua reação para gastar um uso de Inspiração de Bardo, rolando o dado de Inspiração de Bardo e subtraindo o número rolado da rolagem da criatura. Você escolhe usar essa característica depois de a criatura fazer a rolagem, mas antes de o Mestre determinar se a jogada de ataque ou o teste de habilidade foi bem ou malsucedido, ou antes de a criatura causar dano. A criatura é imune se não puder ouvi-lo ou se não puder ser enfeitiçada.",
        },
        {
          name: "Segredos Mágicos Adicionais",
          level: 6,
          description:
            "No 6° nível, você aprende duas magias, à sua escolha, de qualquer classe. As magias que você escolher devem ser de um nível que você possa conjurar, como mostrado na tabela O Bardo, ou um truque. As magias escolhidas contam como magias de bardo para você, mas não contam no número de magias de bardo que você conhece.",
        },
        {
          name: "Perícia Inigualável",
          level: 14,
          description:
            "A partir do 14° nível, quando você fizer um teste de habilidade, você pode gastar um uso de Inspiração de Bardo. Role o dado de Inspiração de Bardo e adicione o número rolado ao seu teste de habilidade. Você pode escolher fazer isso depois de rolar o dado do teste de habilidade, mas antes de o Mestre dizer se foi bem ou malsucedido.",
        },
      ],
    },
    {
      name: "Colégio da Bravura",
      source: "PHB",
      description:
        "Escaldos destemidos cujos contos mantêm viva a memória dos grandes heróis do passado, inspirando uma nova geração de heróis. Reúnem-se em salões de hidromel ou ao redor de fogueiras para cantar os feitos dos grandiosos e viajam para testemunhar grandes eventos em primeira mão.",
      features: [
        {
          name: "Proficiência Adicional",
          level: 3,
          description:
            "Quando você se junta ao Colégio da Bravura no 3° nível, você adquire proficiência com armaduras médias, escudos e armas marciais.",
        },
        {
          name: "Inspiração em Combate",
          level: 3,
          description:
            "Também no 3° nível, você aprende a inspirar os outros em batalha. Uma criatura que possuir um dado de Inspiração de Bardo seu pode rolar esse dado e adicionar o número rolado a uma jogada de dano que ela tenha acabado de fazer. Alternativamente, quando uma jogada de ataque for realizada contra essa criatura, ela pode usar sua reação para rolar o dado de Inspiração de Bardo e adicionar o número rolado à sua CA contra esse ataque, depois de a rolagem ser feita, mas antes de saber se errou ou acertou.",
        },
        {
          name: "Ataque Extra",
          level: 6,
          description:
            "A partir do 6° nível, você pode atacar duas vezes, ao invés de uma, sempre que realizar a ação de Ataque no seu turno.",
        },
        {
          name: "Magia de Batalha",
          level: 14,
          description:
            "No 14° nível, você dominou a arte de tecer a conjuração e o uso de armas em um ato harmonioso. Quando você usar sua ação para conjurar uma magia de bardo, você pode realizar um ataque com arma com uma ação bônus.",
        },
      ],
    },
    {
      name: "Colégio do Glamour",
      source: "XGtE",
      description:
        "Bardos que dominaram seu ofício no vibrante reino de Faéria ou sob a tutela de alguém que morou lá. Treinados por sátiros, eladrins e outros seres feéricos, aprendem a usar sua magia para deleitar e cativar os outros – e para dobrar mentes.",
      features: [
        {
          name: "Manto da Inspiração",
          level: 3,
          description:
            "Quando se une ao Colégio do Glamour no 3° nível, você ganha a habilidade de entoar uma canção de magia feérica que imbui seus aliados com vigor e velocidade.\nCom uma ação bônus, você pode gastar um uso de Inspiração de Bardo para se conceder uma aparência maravilhosa. Quando fizer isso, escolha um número de criaturas que você possa ver e que possam vê-lo a até 18 metros de você, até um número igual ao seu modificador de Carisma (mínimo de uma). Cada uma ganha 5 pontos de vida temporários. Quando uma criatura ganha esses pontos de vida temporários, ela pode usar imediatamente sua reação para se deslocar até o seu deslocamento sem provocar ataques de oportunidade.\nO número de pontos de vida temporários aumenta quando você atinge determinados níveis nesta classe: 8 no 5° nível, 11 no 10° nível e 14 no 15° nível.",
        },
        {
          name: "Performance Deslumbrante",
          level: 3,
          description:
            "A partir do 3° nível, você pode carregar sua performance com magia sedutora e feérica.\nSe você se apresentar por pelo menos 1 minuto, você pode tentar inspirar admiração em sua plateia, cantando, recitando um poema ou dançando. No final da sua atuação, escolha um número de humanoides a até 18 metros de você que assistiram e escutaram tudo, até um número igual ao seu modificador de Carisma (mínimo de um). Cada alvo deve ser bem-sucedido em um teste de resistência de Sabedoria contra a CD das suas magias ou fica enfeitiçado por você. Enquanto enfeitiçado dessa maneira, o alvo o idolatra, fala maravilhas a seu respeito a qualquer um que fale com ele sobre você e impede qualquer um de se opor a você, embora evite violência, a menos que já fosse inclinado a lutar em seu favor. O efeito no alvo termina após 1 hora, se ele sofrer qualquer dano, se você o atacar ou se ele testemunhar você atacando ou causando dano a qualquer um de seus aliados.\nSe o alvo obtiver sucesso no teste de resistência, ele não tem noção de que você tentou enfeitiçá-lo.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
        {
          name: "Manto da Majestade",
          level: 6,
          description:
            "No 6° nível, você ganha a habilidade de se cobrir com uma magia feérica que faz com que os outros queiram servi-lo. Com uma ação bônus, você conjura comando, sem gastar um espaço de magia, e adquire uma aparência de beleza sobrenatural por 1 minuto ou até que sua concentração acabe (como se estivesse se concentrando em uma magia). Durante esse tempo, você pode conjurar comando como uma ação bônus em qualquer um de seus turnos, sem gastar um espaço de magia.\nQualquer criatura enfeitiçada por você falha automaticamente nos testes de resistência contra o comando que você conjura com essa característica.\nUma vez usada essa característica, você só pode usá-la novamente após terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Majestade Inquebrável",
          level: 14,
          description:
            "No 14° nível, sua aparência ganha permanentemente traços de outro mundo, parecendo mais adorável e feroz.\nAlém disso, como uma ação bônus, você pode assumir uma presença magicamente majestosa por 1 minuto ou até que esteja incapacitado. Durante a duração, sempre que qualquer criatura tentar atacá-lo pela primeira vez em um turno, o atacante deve fazer um teste de resistência de Carisma contra a CD das suas magias. Se falhar, não pode atacá-lo neste turno e deve escolher um novo alvo para o ataque, ou o ataque é desperdiçado. Em caso de sucesso, a criatura pode atacá-lo neste turno, mas tem desvantagem em qualquer teste de resistência contra suas magias no seu próximo turno.\nUma vez que assuma essa presença majestosa, você não pode fazê-lo novamente até terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
      ],
    },
    {
      name: "Colégio das Espadas",
      source: "XGtE",
      description:
        "Bardos chamados de Lâminas, que entretêm através de façanhas ousadas com armas – engolir espadas, atirar facas, malabarismo e combates simulados. Embora usem suas armas para entreter, são também guerreiros altamente treinados, e muitos levam uma vida dupla.",
      features: [
        {
          name: "Proficiência Bônus",
          level: 3,
          description:
            "Quando você entra no Colégio das Espadas no 3° nível, você ganha proficiência com armaduras médias e cimitarras.\nSe você for proficiente com uma arma simples ou marcial, você pode usá-la como foco de conjuração para suas magias de bardo.",
        },
        {
          name: "Estilo de Luta",
          level: 3,
          description:
            "No 3° nível, você adota um estilo de luta como sua especialidade. Escolha uma das seguintes opções. Você não pode escolher uma opção de Estilo de Luta mais de uma vez, mesmo que algo no jogo lhe permita escolher novamente.\nDuelo. Quando você está empunhando uma arma corpo-a-corpo em uma mão e nenhuma outra arma, você ganha +2 de bônus nas jogadas de dano com essa arma.\nCombate com Duas Armas. Quando você luta com duas armas, você pode adicionar o modificador de habilidade ao dano do segundo ataque.",
        },
        {
          name: "Floreio de Lâminas",
          level: 3,
          description:
            "No 3° nível, você aprende a realizar exibições impressionantes de proeza marcial e velocidade.\nSempre que você realiza a ação de Ataque no seu turno, seu deslocamento de caminhada aumenta em 3 metros até o final do turno, e se um ataque com arma que você fizer como parte dessa ação atingir uma criatura, você pode usar uma das seguintes opções de Floreio de Lâminas, à sua escolha. Você pode usar apenas uma opção de Floreio de Lâminas por turno.\nFloreio Defensivo. Você pode gastar um uso de Inspiração de Bardo para causar dano extra ao alvo atingido. O dano é igual ao número que você rolar no dado de Inspiração de Bardo. Você também adiciona o número rolado à sua CA até o início do seu próximo turno.\nFloreio Cortante. Você pode gastar um uso de Inspiração de Bardo para causar dano extra ao alvo atingido e a qualquer outra criatura à sua escolha que você possa ver a até 1,5 metro de você. O dano é igual ao número que você rolar no dado de Inspiração de Bardo.\nFloreio Móvel. Você pode gastar um uso de Inspiração de Bardo para causar dano extra ao alvo atingido. O dano é igual ao número que você rolar no dado de Inspiração de Bardo. Você também pode empurrar o alvo até 1,5 metro para longe de você, mais 30 centímetros para cada ponto rolado no dado. Você pode então usar imediatamente sua reação para se deslocar até o seu deslocamento para um espaço desocupado a até 1,5 metro do alvo.",
        },
        {
          name: "Ataque Extra",
          level: 6,
          description:
            "No 6° nível, você pode atacar duas vezes, ao invés de uma, sempre que realizar a ação de Ataque no seu turno.",
        },
        {
          name: "Floreio de Mestre",
          level: 14,
          description:
            "No 14° nível, sempre que você usar um Floreio de Lâminas, você pode rolar um d6 e usá-lo ao invés de gastar um dado de Inspiração de Bardo.",
        },
      ],
    },
    {
      name: "Colégio dos Sussurros",
      source: "XGtE",
      description:
        "Bardos que parecem iguais aos outros – compartilhando notícias, cantando e contando histórias – mas que na verdade são lobos entre ovelhas: usam seus conhecimentos e magias para descobrir segredos e usá-los contra os outros através de extorsão e ameaças.",
      features: [
        {
          name: "Lâminas Psíquicas",
          level: 3,
          description:
            "Quando você entra no Colégio dos Sussurros no 3° nível, você ganha a habilidade de tornar seus ataques com armas magicamente tóxicos para a mente de uma criatura.\nQuando você atinge uma criatura com um ataque com arma, você pode gastar um uso de Inspiração de Bardo para causar 2d6 de dano psíquico extra ao alvo. Você pode fazer isso somente uma vez por turno.\nO dano psíquico aumenta quando você alcança certos níveis de bardo: 3d6 no 5° nível, 5d6 no 10° nível e 8d6 no 15° nível.",
        },
        {
          name: "Palavras de Terror",
          level: 3,
          description:
            "No 3° nível, você aprende a infundir palavras de aparência inocente com uma magia traiçoeira que pode inspirar terror. Se você falar com um humanoide a sós por pelo menos 1 minuto, você pode tentar semear a paranoia em sua mente. No fim da conversa, o alvo deve ser bem-sucedido em um teste de resistência de Sabedoria contra a CD das suas magias ou fica amedrontado por você ou por outra criatura à sua escolha. O alvo fica amedrontado dessa maneira por 1 hora, até ser atacado ou sofrer dano, ou até testemunhar seus aliados sendo atacados ou feridos.\nSe o alvo for bem-sucedido no teste de resistência, ele não tem nenhum indício de que você tentou amedrontá-lo.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
        {
          name: "Manto de Sussurros",
          level: 6,
          description:
            "No 6° nível, você ganha a habilidade de adotar a persona de um humanoide. Quando um humanoide morrer a até 9 metros de você, você pode capturar magicamente sua sombra usando sua reação. Você mantém essa sombra até usá-la ou até terminar um descanso longo.\nVocê pode usar a sombra com uma ação. Quando faz isso, ela desaparece, transformando-se magicamente em um disfarce que aparece em você. Você agora se parece com a pessoa morta, mas saudável e viva. Esse disfarce dura 1 hora ou até você terminá-lo com uma ação bônus.\nEnquanto está no disfarce, você ganha acesso a todas as informações que o humanoide compartilharia livremente com um conhecido casual. Essas informações incluem detalhes gerais sobre seus antecedentes e vida pessoal, mas não incluem segredos. A informação é suficiente para que você possa se passar pela pessoa, inspirando-se em suas memórias.\nOutra criatura pode ver através do disfarce se for bem-sucedida em um teste de Sabedoria (Percepção) contra o seu teste de Carisma (Enganação). Você ganha +5 de bônus no seu teste.\nDepois de capturar uma sombra com essa característica, você não pode capturar outra até terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
        {
          name: "Conhecimento das Sombras",
          level: 14,
          description:
            "No 14° nível, você ganha a habilidade de tecer magia sombria em suas palavras e aproveitar os medos mais profundos de uma criatura.\nCom uma ação, você sussurra magicamente uma frase que apenas uma criatura à sua escolha a até 9 metros de você pode ouvir. O alvo deve fazer um teste de resistência de Sabedoria contra a CD das suas magias. Ele é bem-sucedido automaticamente se não compartilhar um idioma com você ou não puder ouvi-lo. Em um teste bem-sucedido, seu sussurro soa como murmúrios incompreensíveis e não tem efeito.\nEm um teste de resistência falho, o alvo fica enfeitiçado por você pelas próximas 8 horas ou até que você ou seus aliados o ataquem, causem dano a ele ou o forcem a fazer um teste de resistência. Ele interpreta os sussurros como uma descrição de seu segredo mais mortificante. Você não conhece esse segredo, mas o alvo está convencido de que você sabe. A criatura enfeitiçada obedece aos seus comandos por medo de que você revele o segredo. Ela não arrisca a própria vida nem luta por você, a menos que já estivesse inclinada a fazê-lo. Ela lhe concede favores e presentes que ofereceria a um amigo próximo.\nQuando o efeito acaba, a criatura não compreende por que o temia tanto.\nDepois de usar essa característica, você não pode usá-la novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
    {
      name: "Colégio da Criação",
      source: "TCoE",
      description:
        "Bardos que recorrem à Canção da Criação – as harmonias primordiais que os primeiros dragões e deuses usaram para compor o cosmos – por meio da dança, da música e da poesia, dando vida e forma às coisas ao seu redor.",
      features: [
        {
          name: "Partícula de Potencial",
          level: 3,
          description:
            "Sempre que você dá uma Inspiração de Bardo a uma criatura, você pode emitir uma nota da Canção da Criação para gerar uma partícula de potencial minúscula, que orbita a até 1,5 metro dessa criatura. A partícula é intangível e invulnerável, e dura até que o dado de Inspiração de Bardo seja perdido. Essa partícula se parece com uma nota musical, uma estrela, uma flor ou outro símbolo de arte ou de vida à sua escolha.\nQuando a criatura utiliza o dado de Inspiração de Bardo, a partícula fornece um efeito adicional, dependendo de o dado beneficiar um teste de habilidade, uma jogada de ataque ou um teste de resistência, como detalhado abaixo:\nTeste de Habilidade. Quando a criatura rolar o dado de Inspiração de Bardo para adicioná-lo a um teste de habilidade, ela pode rolar esse dado de Inspiração uma segunda vez e escolher qual resultado usar, conforme a partícula explode e emite centelhas multicoloridas e inofensivas por um instante.\nJogada de Ataque. Imediatamente após a criatura rolar o dado de Inspiração de Bardo para adicioná-lo à sua jogada de ataque contra um alvo, a partícula se rompe estrondosamente. O alvo e cada criatura à sua escolha que você possa ver a até 1,5 metro dele devem ser bem-sucedidos em um teste de resistência de Constituição contra a CD das suas magias ou sofrem dano de trovão igual ao número rolado no dado de Inspiração de Bardo.\nTeste de Resistência. Imediatamente após a criatura rolar o dado de Inspiração de Bardo e adicioná-lo a um teste de resistência, a partícula desvanece com o som de uma música suave, fazendo com que a criatura ganhe pontos de vida temporários iguais ao número rolado no dado de Inspiração de Bardo mais o seu modificador de Carisma (mínimo de 1 ponto de vida temporário).",
        },
        {
          name: "Execução da Criação",
          level: 3,
          description:
            "Com uma ação, você pode canalizar a magia da Canção da Criação para criar um item não mágico à sua escolha em um espaço desocupado a até 3 metros de você. O item deve surgir sobre uma superfície ou em um líquido capaz de contê-lo. O valor do item em peças de ouro não pode ser superior a 20 vezes o seu nível de bardo, e o item deve ser Médio ou menor. O item cintila suavemente, e uma criatura pode ouvir uma música tênue ao tocá-lo. O item criado desaparece após um número de horas igual ao seu bônus de proficiência. Para exemplos de itens que você pode criar, veja o capítulo sobre equipamento do Livro do Jogador.\nUma vez que tenha criado um item com essa característica, você não pode fazê-lo novamente até terminar um descanso longo, a menos que gaste um espaço de magia de 2° nível ou superior para usar essa característica de novo. Você pode ter apenas um item criado por essa característica por vez; se você usar essa ação já tendo um item criado por ela, o primeiro desaparece imediatamente.\nO tamanho do item que você pode criar com essa característica aumenta em uma categoria de tamanho quando você chega ao 6° nível (Grande) e novamente no 14° nível (Enorme).",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Espetáculo Animado",
          level: 6,
          description:
            "Com uma ação, você pode focar em um item não mágico Grande ou menor que você possa ver a até 9 metros de você e animá-lo. O item animado utiliza o bloco de estatísticas do Item Dançante, que usa o seu bônus de proficiência (BP). O item é amigável a você e seus companheiros e obedece aos seus comandos. Ele dura 1 hora, até ser reduzido a 0 pontos de vida ou até você morrer.\nEm combate, o item compartilha a sua contagem de iniciativa, mas realiza o turno imediatamente após o seu. Ele pode se mover e usar sua reação por conta própria, mas a única ação que realiza em seu turno é a ação de Esquiva, a menos que você use sua ação bônus no seu turno para ordenar que ele faça outra ação. Essa ação pode ser uma do bloco de estatísticas dele ou qualquer outra ação. Se você estiver incapacitado, o item pode realizar qualquer ação à sua escolha, e não apenas Esquiva.\nQuando você usar sua característica Inspiração de Bardo, você pode comandar o item como parte da mesma ação bônus.\nUma vez que tenha animado um item com essa característica, você não pode fazê-lo novamente até terminar um descanso longo, a menos que gaste um espaço de magia de 3° nível ou superior para isso. Você pode ter apenas um item animado por essa característica por vez; se usar essa ação já tendo um item dançante por ela, o primeiro imediatamente se torna inanimado.\nItem Dançante: construto Grande ou menor; CA 16 (armadura natural); pontos de vida 10 + 5 vezes seu nível de bardo; deslocamento 9 m, voo 9 m (levitação); FOR 18 (+4), DES 14 (+2), CON 16 (+3), INT 4 (−3), SAB 10 (+0), CAR 6 (−2); imunidade a dano de veneno e psíquico; imunidade às condições amedrontado, enfeitiçado, exausto e envenenado; visão no escuro 18 m, Percepção passiva 10; entende os idiomas que você fala; bônus de proficiência (BP) igual ao seu. Forma Imutável: o item é imune a qualquer magia ou efeito que alteraria sua forma. Dança Irresistível: quando uma criatura inicia seu turno a até 3 metros do item, o item pode aumentar ou reduzir (à sua escolha) o deslocamento dessa criatura em 3 metros até o final do turno, desde que o item não esteja incapacitado. Ação – Batida Energizada: ataque corpo-a-corpo com arma, seu modificador de ataque de magia para acertar, alcance 1,5 m, um alvo que você possa ver; acerto: 1d10 + BP de dano de energia.",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Crescendo Criativo",
          level: 14,
          description:
            "Quando você usa a sua característica Execução da Criação, você pode criar mais de um item por vez. O número de itens é igual ao seu modificador de Carisma (mínimo de 2). Se você criar um item que faça esse número ser excedido, você escolhe qual dos itens criados previamente desaparece. Apenas um desses itens pode ser do tamanho máximo que você pode criar; o restante deve ser Pequeno ou Miúdo.\nVocê não fica mais limitado ao valor em ouro ao criar itens com a característica Execução da Criação.",
        },
      ],
    },
    {
      name: "Colégio da Eloquência",
      source: "TCoE",
      description:
        "Adeptos que dominam a arte da oratória. Esses bardos usam uma mistura de lógica e jogos de palavras teatrais, conquistando céticos e detratores com argumentos lógicos e dedilhando as cordas do coração para apelar às emoções do público.",
      features: [
        {
          name: "Língua Prateada",
          level: 3,
          description:
            "Você é um mestre em dizer a coisa certa no momento certo. Quando você realiza um teste de Carisma (Persuasão) ou Carisma (Enganação), você pode tratar um resultado de 9 ou menos no d20 como um 10.",
        },
        {
          name: "Palavras Desconcertantes",
          level: 3,
          description:
            "Você pode tecer palavras emaranhadas com magia que desconcertam uma criatura e fazem com que ela duvide de si mesma. Com uma ação bônus, você pode gastar um uso de Inspiração de Bardo e escolher uma criatura que você possa ver a até 18 metros de você. Role o dado de Inspiração de Bardo. A criatura deve subtrair o valor rolado do próximo teste de resistência que fizer antes do início do seu próximo turno.",
        },
        {
          name: "Inspiração Infalível",
          level: 6,
          description:
            "Suas palavras inspiradoras são tão persuasivas que os outros se sentem compelidos ao sucesso. Quando uma criatura adiciona um dos seus dados de Inspiração de Bardo a um teste de habilidade, jogada de ataque ou teste de resistência e a rolagem falha, a criatura pode manter o dado de Inspiração de Bardo.",
        },
        {
          name: "Língua Universal",
          level: 6,
          description:
            "Você adquire a capacidade de fazer com que seu discurso seja compreensível para qualquer criatura. Com uma ação, escolha uma ou mais criaturas a até 18 metros de você, até um número igual ao seu modificador de Carisma (mínimo de uma criatura). As criaturas escolhidas podem compreendê-lo magicamente, independentemente do idioma que você falar, por 1 hora.\nUma vez que use essa característica, você não pode usá-la novamente até terminar um descanso longo, a menos que gaste um espaço de magia de qualquer nível para usá-la novamente.",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Inspiração Contagiante",
          level: 14,
          description:
            "Quando você é bem-sucedido em inspirar alguém, o poder da sua eloquência pode se espalhar para outras pessoas. Quando uma criatura a até 18 metros de você adiciona um dos seus dados de Inspiração de Bardo a um teste de habilidade, jogada de ataque ou teste de resistência e a rolagem é bem-sucedida, você pode usar sua reação para encorajar uma criatura diferente (que não seja você mesmo) que possa ouvi-lo e esteja a até 18 metros de você, dando a ela um dado de Inspiração de Bardo sem gastar nenhum uso da sua característica Inspiração de Bardo.\nVocê pode usar essa reação um número de vezes igual ao seu modificador de Carisma (mínimo de uma), e recupera todos os usos quando termina um descanso longo.",
          resource: { max: "cha", recharge: "long" },
        },
      ],
    },
  ],
};
