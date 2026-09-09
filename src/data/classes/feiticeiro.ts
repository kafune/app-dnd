import type { ClassDef } from "@/lib/types";

/**
 * Feiticeiro — Livro do Jogador (p. 78–82), Guia de Xanathar (p. 33–35) e Caldeirão de Tasha (p. 46–50).
 * Progressão completa (níveis 1–20) e todas as Origens de Feitiçaria dos três livros.
 */
export const FEITICEIRO: ClassDef = {
  name: "Feiticeiro",
  source: "PHB",
  subclassLabel: "Origem de Feitiçaria",
  subclassLevel: 1,
  features: [
    {
      name: "Conjuração",
      level: 1,
      description:
        "Um evento do seu passado, ou na vida de um parente ou ancestral, deixou uma marca indelével em você, infundindo-o com magia arcana. A fonte desse poder, independente da origem, flui em suas magias.\n" +
        "Truques. Você conhece quatro truques, à sua escolha, da lista de magias de feiticeiro. Você aprende truques adicionais em níveis mais altos: 5 truques no 4° nível e 6 truques no 10° nível.\n" +
        "Espaços de Magia. A tabela O Feiticeiro mostra quantos espaços de magia de 1° nível e superiores você possui. Para conjurar uma magia, você gasta um espaço do nível da magia ou superior. Você recobra todos os espaços gastos ao completar um descanso longo.\n" +
        "Magias Conhecidas de 1° Nível e Superiores. Você conhece duas magias de 1° nível, à sua escolha, da lista de feiticeiro. A coluna Magias Conhecidas mostra quando você aprende mais magias (3 no 2° nível, 4 no 3°, 5 no 4°, 6 no 5°, 7 no 6°, 8 no 7°, 9 no 8°, 10 no 9°, 11 no 10°, 12 no 11° e 12°, 13 no 13° e 14°, 14 no 15° e 16°, 15 do 17° ao 20°). Cada magia deve ser de um nível para o qual você tenha espaços de magia. Além disso, sempre que você adquire um nível nessa classe, pode substituir uma magia de feiticeiro conhecida por outra da lista, que também deve ser de um nível para o qual você tenha espaços.\n" +
        "Habilidade de Conjuração. Carisma é a sua habilidade de conjuração. CD para suas magias = 8 + bônus de proficiência + modificador de Carisma. Modificador de ataque de magia = bônus de proficiência + modificador de Carisma.\n" +
        "Foco de Conjuração. Você pode usar um foco arcano como foco de conjuração das suas magias de feiticeiro.",
    },
    {
      name: "Magias Adicionais de Feiticeiro (opcional, Tasha)",
      level: 1,
      description:
        "Característica opcional do Caldeirão de Tasha, adotada em acordo com o Mestre.\n" +
        "As magias a seguir ampliam a lista de magias do feiticeiro que consta no Livro do Jogador. A lista está organizada por círculo de magia, não por nível de personagem. Se uma magia puder ser conjurada como ritual, o descritor de ritual aparece depois do nome.\n" +
        "• Truques: Lâmina Estrondosa, Lâmina da Chama Esverdeada, Chicote Elétrico, Farpa Mental, Rompante de Espadas\n" +
        "• 1° círculo: Área Escorregadia, Beberagem Cáustica de Tasha\n" +
        "• 2° círculo: Lâmina Flamejante, Esfera Flamejante, Arma Mágica, Chicote Mental de Tasha\n" +
        "• 3° círculo: Flechas Flamejantes, Fortaleza Intelectual, Toque Vampírico\n" +
        "• 4° círculo: Escudo de Fogo\n" +
        "• 6° círculo: Carne para Pedra",
    },
    {
      name: "Fonte de Magia",
      level: 2,
      description:
        "No 2° nível, você alcança uma profunda fonte de magia dentro de você. Essa fonte é representada pelos pontos de feitiçaria, que permitem que você crie uma variedade de efeitos mágicos.\n" +
        "Pontos de Feitiçaria. Você tem 2 pontos de feitiçaria e ganha mais à medida que sobe de nível: seu total de pontos de feitiçaria é igual ao seu nível de feiticeiro (2 no 2° nível, 3 no 3°, e assim por diante até 20 no 20° nível). Você nunca pode ter mais pontos de feitiçaria que o mostrado na tabela para o seu nível. Você recupera todos os pontos de feitiçaria gastos quando termina um descanso longo.\n" +
        "Conjuração Flexível. Você pode usar seus pontos de feitiçaria para ganhar novos espaços de magia ou sacrificar espaços de magia para ganhar pontos de feitiçaria adicionais. Você aprende novas formas de usar seus pontos de feitiçaria ao alcançar níveis mais altos. Os espaços de magia criados desaparecem ao final de um descanso longo.\n" +
        "Criando Espaços de Magia. Com uma ação bônus no seu turno, você pode transformar pontos de feitiçaria disponíveis em um espaço de magia. Você não pode criar espaços de magia acima do 5° nível. Custo em pontos de feitiçaria por nível do espaço criado:\n" +
        "• Espaço de 1° nível: 2 pontos\n" +
        "• Espaço de 2° nível: 3 pontos\n" +
        "• Espaço de 3° nível: 5 pontos\n" +
        "• Espaço de 4° nível: 6 pontos\n" +
        "• Espaço de 5° nível: 7 pontos\n" +
        "Convertendo um Espaço de Magia em Pontos de Feitiçaria. Com uma ação bônus no seu turno, você pode gastar um espaço de magia disponível e ganhar uma quantidade de pontos de feitiçaria igual ao nível do espaço.",
      resource: { name: "Pontos de Feitiçaria", max: "level", recharge: "long" },
    },
    {
      name: "Metamágica",
      level: 3,
      description:
        "No 3° nível, você adquire a habilidade de distorcer suas magias para se adequarem às suas necessidades. Você ganha duas das seguintes opções de Metamágica, à sua escolha. Você adquire outra no 10° e no 17° nível.\n" +
        "Você pode usar apenas uma opção de Metamágica em uma magia quando a conjura, a não ser que esteja descrito o contrário.\n" +
        "Magia Acelerada (2 pontos). Quando você conjurar uma magia com tempo de conjuração de 1 ação, você pode gastar 2 pontos de feitiçaria para mudar o tempo de conjuração para 1 ação bônus para essa magia.\n" +
        "Magia Aumentada (3 pontos). Quando você conjurar uma magia que obriga uma criatura a realizar um teste de resistência contra o seu efeito, você pode gastar 3 pontos de feitiçaria para dar desvantagem a um alvo da magia no primeiro teste de resistência feito contra ela.\n" +
        "Magia Cuidadosa (1 ponto). Quando você conjurar uma magia que obriga outras criaturas a realizarem um teste de resistência, você pode proteger algumas dessas criaturas da força total da magia. Para tanto, você gasta 1 ponto de feitiçaria e escolhe um número dessas criaturas até o seu modificador de Carisma (mínimo de uma criatura). Uma criatura escolhida passa automaticamente no teste de resistência contra a magia.\n" +
        "Magia Distante (1 ponto). Quando você conjurar uma magia que tenha alcance de 1,5 metro ou maior, você pode gastar 1 ponto de feitiçaria para dobrar o alcance da magia. Quando você conjurar uma magia com alcance de toque, você pode gastar 1 ponto de feitiçaria para mudar o alcance da magia para 9 metros.\n" +
        "Magia Duplicada (nível da magia em pontos; 1 se truque). Quando você conjurar uma magia que seja incapaz de ter mais de uma criatura como alvo no nível atual dela e não possua alcance pessoal, você pode gastar um número de pontos de feitiçaria igual ao nível da magia para ter uma segunda criatura, no alcance da magia, como alvo (1 ponto de feitiçaria se a magia for um truque).\n" +
        "Magia Estendida (1 ponto). Quando você conjurar uma magia que tenha duração de 1 minuto ou maior, você pode gastar 1 ponto de feitiçaria para dobrar sua duração, até uma duração máxima de 24 horas.\n" +
        "Magia Potencializada (1 ponto). Quando você rolar o dano de uma magia, você pode gastar 1 ponto de feitiçaria para rolar novamente um número de dados de dano até o seu modificador de Carisma (mínimo de um). Você deve usar a nova rolagem. Você pode usar Magia Potencializada mesmo que já tenha usado uma opção diferente de Metamágica durante a conjuração da magia.\n" +
        "Magia Sutil (1 ponto). Quando você conjurar uma magia, você pode gastar 1 ponto de feitiçaria para fazê-lo sem qualquer componente somático ou verbal.\n" +
        "Magia Perseguidora (2 pontos) [Caldeirão de Tasha]. Se você realizar uma jogada de ataque para uma magia e errar, você pode gastar 2 pontos de feitiçaria para jogar novamente o d20, e deve ficar com o novo resultado. Você pode utilizar a Magia Perseguidora mesmo se já estiver usando outra opção de Metamágica durante a conjuração da magia.\n" +
        "Magia Transmutada (1 ponto) [Caldeirão de Tasha]. Quando você conjurar uma magia que cause um tipo de dano da lista a seguir, você pode gastar 1 ponto de feitiçaria para mudar o tipo de dano para outro dentre os listados: ácido, frio, fogo, elétrico, veneno ou trovejante.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 4,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
    {
      name: "Versatilidade Feiticeira (opcional, Tasha)",
      level: 4,
      description:
        "Característica opcional do Caldeirão de Tasha, adotada em acordo com o Mestre.\n" +
        "Sempre que você alcançar um nível nessa classe que forneça a característica Incremento no Valor de Habilidade (4°, 8°, 12°, 16° e 19° nível), você pode fazer uma das coisas a seguir, representando uma mudança no seu fluxo de magia interior:\n" +
        "• Substituir uma de suas opções escolhidas de Metamágica por outra que esteja disponível para você.\n" +
        "• Substituir um truque que você tenha aprendido pela característica Conjuração da classe de feiticeiro por outro truque da lista de magias de feiticeiro.",
    },
    {
      name: "Orientação Mágica (opcional, Tasha)",
      level: 5,
      description:
        "Característica opcional do Caldeirão de Tasha, adotada em acordo com o Mestre.\n" +
        "Você pode acessar sua fonte interna de magia para tentar arrancar o sucesso do fracasso. Quando você fizer um teste de habilidade e falhar, você pode gastar 1 ponto de feitiçaria para rolar novamente o d20, e deve usar o novo resultado, potencialmente transformando a falha em um sucesso.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 8,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
    {
      name: "Metamágica",
      level: 10,
      description:
        "No 10° nível, você aprende uma opção adicional de Metamágica, à sua escolha, dentre as listadas na característica Metamágica do 3° nível (incluindo Magia Perseguidora e Magia Transmutada, do Caldeirão de Tasha). Você passa a conhecer três opções.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 12,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 16,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
    {
      name: "Metamágica",
      level: 17,
      description:
        "No 17° nível, você aprende uma opção adicional de Metamágica, à sua escolha, dentre as listadas na característica Metamágica do 3° nível (incluindo Magia Perseguidora e Magia Transmutada, do Caldeirão de Tasha). Você passa a conhecer quatro opções.",
    },
    {
      name: "Incremento no Valor de Habilidade",
      level: 19,
      asi: true,
      description:
        "Você pode aumentar um valor de habilidade, à sua escolha, em 2 ou aumentar dois valores de habilidade, à sua escolha, em 1. Como padrão, você não pode elevar um valor de habilidade acima de 20 com essa característica.",
    },
    {
      name: "Restauração Mística",
      level: 20,
      description:
        "No 20° nível, você recupera 4 pontos de feitiçaria gastos sempre que terminar um descanso curto.",
    },
  ],
  subclasses: [
    {
      name: "Linhagem Dracônica",
      source: "PHB",
      description:
        "Sua magia inata vem de magia dracônica que foi misturada ao seu sangue ou ao sangue dos seus ancestrais. Escamas, resistência e, por fim, asas e a presença de um dragão se manifestam em você.",
      features: [
        {
          name: "Ancestral Dracônico",
          level: 1,
          description:
            "No 1° nível, você escolhe um tipo de dragão como seu ancestral. O tipo de dano associado a cada dragão será usado por características que você ganhará posteriormente.\n" +
            "• Azul: elétrico\n• Branco: frio\n• Bronze: elétrico\n• Cobre: ácido\n• Latão: fogo\n• Negro: ácido\n• Ouro: fogo\n• Prata: frio\n• Verde: veneno\n• Vermelho: fogo\n" +
            "Você pode falar, ler e escrever em Dracônico. Além disso, sempre que você fizer um teste de Carisma ao interagir com dragões, seu bônus de proficiência será dobrado se ele se aplicar a esse teste.",
        },
        {
          name: "Resiliência Dracônica",
          level: 1,
          description:
            "À medida que a magia flui pelo seu corpo, ela faz com que os traços físicos do seu ancestral dracônico surjam. No 1° nível, seu máximo de pontos de vida aumenta em 1 e aumenta em mais 1 sempre que você ganhar um nível nessa classe.\n" +
            "Além disso, partes da sua pele são cobertas com minúsculas escamas lustrosas de dragão. Quando você não estiver usando armadura, sua CA será igual a 13 + seu modificador de Destreza.",
        },
        {
          name: "Afinidade Elemental",
          level: 6,
          description:
            "A partir do 6° nível, quando você conjurar uma magia que cause dano do tipo associado ao seu ancestral dracônico, adicione seu modificador de Carisma ao dano. O bônus de dano se aplica a uma única rolagem de dano da magia, não a diversas rolagens.\n" +
            "Ao mesmo tempo, você pode gastar 1 ponto de feitiçaria para ganhar resistência a esse tipo de dano por 1 hora.",
        },
        {
          name: "Asas de Dragão",
          level: 14,
          description:
            "No 14° nível, você adquire a habilidade de brotar um par de asas de dragão das suas costas, ganhando deslocamento de voo igual ao seu deslocamento atual. Você pode criar essas asas com uma ação bônus no seu turno. Elas duram até que você as dissipe, com uma ação bônus no seu turno.\n" +
            "Você não pode manifestar suas asas enquanto estiver vestindo uma armadura, a não ser que a armadura seja feita para acomodá-las, e roupas que não forem feitas para acomodar suas asas podem ser destruídas quando você as manifestar.",
        },
        {
          name: "Presença Dracônica",
          level: 18,
          description:
            "A partir do 18° nível, você pode canalizar a assustadora presença do seu ancestral dracônico, fazendo com que aqueles ao seu redor fiquem impressionados ou amedrontados. Com uma ação, você pode gastar 5 pontos de feitiçaria para recorrer a esse poder e exalar uma aura de admiração ou medo (à sua escolha) a uma distância de 18 metros. Por 1 minuto ou até você perder a concentração (como se estivesse se concentrando em uma magia), cada criatura hostil que começar seu turno nessa aura deve ser bem-sucedida em um teste de resistência de Sabedoria ou ficará enfeitiçada (se você escolheu admiração) ou amedrontada (se você escolheu medo) até a aura terminar. Uma criatura que for bem-sucedida no teste de resistência fica imune à sua aura por 24 horas.",
        },
      ],
    },
    {
      name: "Magia Selvagem",
      source: "PHB",
      description:
        "Sua magia inata vem das forças selvagens do caos que constituem a base da ordem da criação. Essa magia caótica fervilha dentro de você, esperando por qualquer brecha para escapar em surtos imprevisíveis.",
      features: [
        {
          name: "Surto de Magia Selvagem",
          level: 1,
          description:
            "A partir do momento em que você escolhe essa origem, no 1° nível, sua conjuração pode liberar surtos de magia selvagem. Imediatamente após você conjurar uma magia de feiticeiro de 1° nível ou superior, o Mestre pode solicitar que você role um d20. Se você rolar um 1, role na tabela Surto de Magia Selvagem para criar um efeito mágico aleatório. Um surto só pode ocorrer uma vez por turno. Se o efeito de um surto for uma magia, ela é selvagem demais para ser afetada por Metamágica. Se ela normalmente exigir concentração, nesse caso não será necessário; a magia permanece por sua duração total.\n" +
            "Tabela Surto de Magia Selvagem (d100):\n" +
            "01–02: Role nessa tabela no começo de cada um dos seus turnos pelo próximo minuto, ignorando esse resultado em rolagens subsequentes.\n" +
            "03–04: Pelo próximo minuto, você pode ver qualquer criatura invisível, se tiver linha de visão até ela.\n" +
            "05–06: Um modron, escolhido e controlado pelo Mestre, aparece em um espaço desocupado a 1,5 metro de você e desaparece após 1 minuto.\n" +
            "07–08: Você conjura bola de fogo, como uma magia de 3° nível, centrada em você.\n" +
            "09–10: Você conjura mísseis mágicos como uma magia de 5° nível.\n" +
            "11–12: Role um d10. Sua altura muda em um valor igual a 3 cm × o resultado. Se o valor for ímpar, você encolhe. Se for par, você cresce.\n" +
            "13–14: Você conjura confusão, centrada em você.\n" +
            "15–16: Pelo próximo minuto, você recupera 5 pontos de vida no começo de cada um dos seus turnos.\n" +
            "17–18: Uma longa barba feita de penas cresce em você; ela dura até você espirrar, momento em que as penas explodem para fora do seu rosto.\n" +
            "19–20: Você conjura área escorregadia, centrada em você.\n" +
            "21–22: Criaturas têm desvantagem nos testes de resistência contra a próxima magia que exija teste de resistência que você conjurar no próximo minuto.\n" +
            "23–24: Sua pele adquire um tom vibrante de azul. A magia remover maldição pode acabar com esse efeito.\n" +
            "25–26: Um olho aparece na sua testa pelo próximo minuto. Durante esse tempo, você tem vantagem em testes de Sabedoria (Percepção) relacionados à visão.\n" +
            "27–28: Pelo próximo minuto, todas as suas magias com tempo de conjuração de 1 ação podem ser conjuradas com 1 ação bônus.\n" +
            "29–30: Você se teletransporta até 18 metros para um espaço desocupado, à sua escolha, que você possa ver.\n" +
            "31–32: Você é transportado para o Plano Astral até o fim do seu próximo turno; após esse tempo, você volta para o espaço em que estava ou para o espaço desocupado mais próximo, se aquele estiver ocupado.\n" +
            "33–34: Maximize o dano da próxima magia que cause dano que você conjurar no próximo minuto.\n" +
            "35–36: Role um d10. Sua idade muda em um número de anos igual ao resultado. Se o valor for ímpar, você fica mais jovem (mínimo 1 ano). Se for par, você fica mais velho.\n" +
            "37–38: 1d6 flumphs, controlados pelo Mestre, aparecem em espaços desocupados a até 18 metros de você e estão amedrontados por você. Eles desaparecem após 1 minuto.\n" +
            "39–40: Você recupera 2d10 pontos de vida.\n" +
            "41–42: Você se transforma em uma planta em um vaso até o início do seu próximo turno. Enquanto for uma planta, você está incapacitado e tem vulnerabilidade a todos os danos. Se você cair a 0 pontos de vida, seu vaso quebra e sua forma é revertida.\n" +
            "43–44: Pelo próximo minuto, você pode se teletransportar até 6 metros, com uma ação bônus, em cada um dos seus turnos.\n" +
            "45–46: Você conjura levitação em si mesmo.\n" +
            "47–48: Um unicórnio, controlado pelo Mestre, aparece em um espaço a 1,5 metro de você e desaparece 1 minuto depois.\n" +
            "49–50: Você não consegue falar pelo próximo minuto. Sempre que tentar, bolhas cor-de-rosa saem da sua boca.\n" +
            "51–52: Um escudo espectral flutua próximo a você pelo próximo minuto, concedendo +2 de bônus na CA e imunidade a mísseis mágicos.\n" +
            "53–54: Você é imune a intoxicação por álcool pelos próximos 5d6 dias.\n" +
            "55–56: Seu cabelo cai, mas volta a crescer dentro de 24 horas.\n" +
            "57–58: Pelo próximo minuto, qualquer objeto inflamável que você tocar, que não esteja sendo segurado ou carregado por outra criatura, entra em combustão.\n" +
            "59–60: Você recupera o seu espaço de magia gasto de menor nível.\n" +
            "61–62: Pelo próximo minuto, você deve gritar quando falar.\n" +
            "63–64: Você conjura névoa obscurecente, centrada em você.\n" +
            "65–66: Até três criaturas, à sua escolha, a até 9 metros de você, sofrem 4d10 de dano elétrico.\n" +
            "67–68: Você fica amedrontado pela criatura mais próxima até o fim do seu próximo turno.\n" +
            "69–70: Cada criatura a até 9 metros de você fica invisível pelo próximo minuto. A invisibilidade termina em uma criatura quando ela ataca ou conjura uma magia.\n" +
            "71–72: Você ganha resistência a todos os danos pelo próximo minuto.\n" +
            "73–74: Uma criatura aleatória, a até 9 metros de você, fica envenenada por 1d4 horas.\n" +
            "75–76: Você brilha com luz plena num raio de 9 metros pelo próximo minuto. Qualquer criatura que terminar seu turno a 1,5 metro de você fica cega até o fim do próximo turno dela.\n" +
            "77–78: Você conjura metamorfose em si mesmo. Se falhar no teste de resistência, você se torna uma ovelha pela duração da magia.\n" +
            "79–80: Borboletas e pétalas de flores ilusórias flutuam no ar a até 3 metros de você pelo próximo minuto.\n" +
            "81–82: Você pode realizar uma ação adicional imediatamente.\n" +
            "83–84: Cada criatura a até 9 metros de você sofre 1d10 de dano necrótico. Você recupera uma quantidade de pontos de vida igual à soma do dano necrótico causado.\n" +
            "85–86: Você conjura reflexos.\n" +
            "87–88: Você conjura voo em uma criatura aleatória a até 18 metros de você.\n" +
            "89–90: Você fica invisível pelo próximo minuto. Durante esse período, outras criaturas não podem ouvi-lo. A invisibilidade termina se você atacar ou conjurar uma magia.\n" +
            "91–92: Se você morrer no próximo minuto, você volta imediatamente à vida como se pela magia reencarnação.\n" +
            "93–94: Seu tamanho aumenta em uma categoria pelo próximo minuto.\n" +
            "95–96: Você e todas as criaturas a até 9 metros de você ganham vulnerabilidade a dano perfurante pelo próximo minuto.\n" +
            "97–98: Você é envolto por uma suave música etérea pelo próximo minuto.\n" +
            "99–00: Você recupera todos os pontos de feitiçaria gastos.",
        },
        {
          name: "Marés de Caos",
          level: 1,
          description:
            "A partir do 1° nível, você pode manipular as forças do acaso e do caos para ganhar vantagem em uma jogada de ataque, teste de habilidade ou teste de resistência. Quando o fizer, você deve terminar um descanso longo antes de poder usar essa característica novamente.\n" +
            "A qualquer momento antes de você recuperar o uso dessa característica, o Mestre pode rolar na tabela Surto de Magia Selvagem imediatamente após você conjurar uma magia de feiticeiro de 1° nível ou superior. Após isso, você recupera o uso dessa característica.",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Dobrar a Sorte",
          level: 6,
          description:
            "A partir do 6° nível, você adquire a habilidade de mudar o destino usando sua magia selvagem. Quando outra criatura que você possa ver realizar uma jogada de ataque, um teste de habilidade ou um teste de resistência, você pode usar sua reação e gastar 2 pontos de feitiçaria para rolar 1d4 e aplicar o número rolado como bônus ou penalidade (à sua escolha) na rolagem da criatura. Você pode fazer isso depois de a criatura rolar, mas antes de o efeito ocorrer.",
        },
        {
          name: "Caos Controlado",
          level: 14,
          description:
            "No 14° nível, você ganha um controle módico sobre seus surtos de magia selvagem. Sempre que rolar na tabela Surto de Magia Selvagem, você pode rolar duas vezes e usar qualquer um dos resultados.",
        },
        {
          name: "Bombardeio de Magia",
          level: 18,
          description:
            "A partir do 18° nível, a energia nociva das suas magias se intensifica. Quando você rolar o dano de uma magia e obtiver o maior resultado possível em qualquer dado, escolha um desses dados, role-o novamente e adicione o valor rolado ao dano. Você pode usar essa característica apenas uma vez por turno.",
        },
      ],
    },
    {
      name: "Alma Favorecida",
      source: "XGtE",
      description:
        "A centelha da magia que o alimenta vem de uma fonte divina que brilha dentro da sua alma — um ancestral angelical ou uma profecia antiga. Você aprende magias de clérigo e é protegido pelos deuses.",
      spells: {
        "1": ["Curar Ferimentos", "Infligir Ferimentos", "Bênção", "Perdição", "Proteção Contra o Bem e Mal"],
      },
      features: [
        {
          name: "Magia Divina",
          level: 1,
          description:
            "Seu vínculo com o divino permite que você aprenda magias da classe clérigo. Quando sua característica Conjuração permite que você aprenda ou substitua um truque ou uma magia de feiticeiro de 1° nível ou superior, você pode escolher a nova magia da lista de magias do clérigo ou da lista de magias do feiticeiro. Você deve obedecer a todas as restrições para selecionar a magia, e ela se torna uma magia de feiticeiro para você.\n" +
            "Além disso, escolha uma afinidade pela fonte do seu poder divino: bem, mal, ordem, caos ou neutralidade. Você aprende uma magia adicional com base nessa afinidade: Bem — curar ferimentos; Mal — infligir ferimentos; Ordem — bênção; Caos — perdição; Neutralidade — proteção contra o bem e o mal. É uma magia de feiticeiro para você, mas não conta para o seu número de magias conhecidas. Se você substituir essa magia mais tarde, deve substituí-la por uma magia da lista de magias do clérigo.",
        },
        {
          name: "Favorecido pelos Deuses",
          level: 1,
          description:
            "A partir do 1° nível, o poder divino protege seu destino. Se você falhar em um teste de resistência ou errar uma jogada de ataque, pode rolar 2d4 e adicionar o resultado ao total, possivelmente alterando o resultado. Depois de usar essa característica, você não pode usá-la novamente até terminar um descanso curto ou longo.",
          resource: { max: 1, recharge: "short" },
        },
        {
          name: "Cura Fortalecida",
          level: 6,
          description:
            "A partir do 6° nível, a energia divina que o percorre pode fortalecer as magias de cura. Sempre que você ou um aliado a até 1,5 metro de você rolar dados para determinar o número de pontos de vida que uma magia restaura, você pode gastar 1 ponto de feitiçaria para rolar novamente qualquer número desses dados uma vez, desde que você não esteja incapacitado. Você pode usar essa característica apenas uma vez por turno.",
        },
        {
          name: "Asas Transcendentais",
          level: 14,
          description:
            "A partir do 14° nível, você pode usar uma ação bônus para manifestar um par de asas espectrais nas suas costas. Enquanto as asas estiverem presentes, você tem deslocamento de voo de 9 metros. As asas duram até que você fique incapacitado, morra ou as desfaça com uma ação bônus.\n" +
            "A afinidade que você escolheu para a característica Magia Divina determina a aparência das asas espectrais: asas de águia para o bem ou a ordem, asas de morcego para o mal ou o caos e asas de libélula para a neutralidade.",
        },
        {
          name: "Recuperação Sublime",
          level: 18,
          description:
            "No 18° nível, você ganha a capacidade de superar lesões graves. Com uma ação bônus, quando tiver menos da metade dos seus pontos de vida restantes, você pode recuperar um número de pontos de vida igual à metade dos seus pontos de vida máximos. Depois de usar essa característica, você não pode usá-la novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
    {
      name: "Adepto das Sombras",
      source: "XGtE",
      description:
        "Você é uma criatura de sombra: sua magia inata vem do próprio Pendor das Sombras. A centelha da vida que o sustenta está abafada, lutando contra a energia escura que imbui sua alma.",
      features: [
        {
          name: "Olhos da Escuridão",
          level: 1,
          description:
            "A partir do 1° nível, você tem visão no escuro com alcance de 36 metros.\n" +
            "Quando você alcança o 3° nível nesta classe, aprende a magia escuridão, que não conta para o seu número de magias conhecidas. Além disso, você pode conjurá-la gastando 2 pontos de feitiçaria ou gastando um espaço de magia. Se conjurá-la com pontos de feitiçaria, você pode ver através da escuridão criada pela magia.",
        },
        {
          name: "Força do Túmulo",
          level: 1,
          description:
            "A partir do 1° nível, sua existência em um estado de crepúsculo entre a vida e a morte dificulta a sua derrota. Quando receber dano que o reduza a 0 pontos de vida, você pode fazer um teste de resistência de Carisma (CD 5 + o dano recebido). Em um sucesso, você cai para 1 ponto de vida em vez disso. Você não pode usar essa característica se for reduzido a 0 pontos de vida por dano radiante ou por um acerto crítico.\n" +
            "Depois de ser bem-sucedido nesse teste de resistência, você não pode usar essa característica novamente até terminar um descanso longo.",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Cão do Mau Presságio",
          level: 6,
          description:
            "No 6° nível, você ganha a habilidade de invocar uma criatura uivante da escuridão para perseguir seus inimigos. Com uma ação bônus, você pode gastar 3 pontos de feitiçaria para invocar magicamente um cão do mau presságio para atacar uma criatura que você possa ver a até 36 metros. O cão usa as estatísticas do lobo atroz, com as seguintes alterações:\n" +
            "• O cão é de tamanho Médio, não Grande, e conta como uma monstruosidade, não uma fera.\n" +
            "• Ele aparece com uma quantidade de pontos de vida temporários igual à metade do seu nível de feiticeiro.\n" +
            "• Ele pode se mover através de outras criaturas e objetos como se fossem terreno difícil. O cão sofre 5 de dano de energia se terminar o turno dentro de um objeto.\n" +
            "• No início do turno dele, o cão conhece automaticamente a localização do alvo. Se o alvo estava escondido, ele não está mais escondido do cão.\n" +
            "O cão aparece em um espaço desocupado, à sua escolha, a até 9 metros do alvo. Role iniciativa para o cão. No turno dele, ele só pode se mover em direção ao alvo pela rota mais direta, e só pode usar sua ação para atacar o alvo. O cão pode fazer ataques de oportunidade, mas apenas contra o alvo. Além disso, enquanto o cão estiver a até 1,5 metro do alvo, o alvo tem desvantagem nos testes de resistência contra qualquer magia que você conjurar. O cão desaparece se for reduzido a 0 pontos de vida, se o alvo for reduzido a 0 pontos de vida ou após 5 minutos.",
        },
        {
          name: "Caminhar nas Sombras",
          level: 14,
          description:
            "No 14° nível, você ganha a habilidade de passar de uma sombra para outra. Quando estiver em luz fraca ou escuridão, com uma ação bônus, você pode se teletransportar magicamente até 36 metros para um espaço desocupado que possa ver e que também esteja em luz fraca ou escuridão.",
        },
        {
          name: "Forma Umbral",
          level: 18,
          description:
            "A partir do 18° nível, você pode gastar 6 pontos de feitiçaria com uma ação bônus para se transformar magicamente em uma forma de sombras. Nessa forma, você tem resistência a todos os danos, exceto dano de energia e dano radiante, e pode se mover através de outras criaturas e objetos como se fossem terreno difícil. Você sofre 5 de dano de energia se terminar o turno dentro de um objeto.\n" +
            "Você permanece nessa forma por 1 minuto. Ela termina antes se você ficar incapacitado, morrer ou a desfizer com uma ação bônus.",
        },
      ],
    },
    {
      name: "Feiticeiro da Tempestade",
      source: "XGtE",
      description:
        "Sua magia inata vem do poder elemental do ar — uma experiência de quase morte em uma tormenta, um nascimento durante um temporal lendário ou a influência de criaturas do ar como um djinni. A magia da tempestade permeia seu ser.",
      features: [
        {
          name: "Orador do Vento",
          level: 1,
          description:
            "A magia arcana que você comanda é infundida com o elemento do ar. Você pode falar, ler e escrever Primordial. Conhecer esse idioma permite que você compreenda e seja compreendido por aqueles que falam seus dialetos: Aquan, Auran, Ignan e Terran.",
        },
        {
          name: "Magia Tempestuosa",
          level: 1,
          description:
            "A partir do 1° nível, você pode usar uma ação bônus no seu turno para fazer rajadas giratórias de ar elemental envolvê-lo brevemente, imediatamente antes ou depois de conjurar uma magia de 1° nível ou superior. Ao fazê-lo, você pode voar até 3 metros sem provocar ataques de oportunidade.",
        },
        {
          name: "Coração da Tempestade",
          level: 6,
          description:
            "No 6° nível, você ganha resistência a dano elétrico e trovejante. Além disso, sempre que começar a conjurar uma magia de 1° nível ou superior que cause dano elétrico ou trovejante, a magia tempestuosa se manifesta a partir de você. Essa manifestação faz com que as criaturas à sua escolha que você possa ver a até 3 metros recebam dano elétrico ou trovejante (escolha um tipo de dano cada vez que essa característica for ativada) igual à metade do seu nível de feiticeiro.",
        },
        {
          name: "Guia da Tempestade",
          level: 6,
          description:
            "No 6° nível, você ganha a habilidade de controlar sutilmente o clima ao seu redor.\n" +
            "Se estiver chovendo, você pode usar uma ação para fazer a chuva parar de cair em uma esfera de 6 metros de raio centrada em você. Você pode encerrar esse efeito com uma ação bônus.\n" +
            "Se estiver ventando, você pode usar uma ação bônus a cada rodada para escolher a direção em que o vento sopra em uma esfera de 30 metros de raio centrada em você. O vento sopra nessa direção até o final do seu próximo turno. Essa característica não altera a velocidade do vento.",
        },
        {
          name: "Fúria da Tempestade",
          level: 14,
          description:
            "A partir do 14° nível, quando você for atingido por um ataque corpo a corpo, pode usar sua reação para causar dano elétrico ao atacante. O dano é igual ao seu nível de feiticeiro. O atacante também deve fazer um teste de resistência de Força contra a CD das suas magias de feiticeiro. Em uma falha, o atacante é empurrado em linha reta até 6 metros para longe de você.",
        },
        {
          name: "Alma do Vento",
          level: 18,
          description:
            "No 18° nível, você ganha imunidade a dano elétrico e trovejante.\n" +
            "Você também ganha um deslocamento de voo mágico de 18 metros. Com uma ação, você pode reduzir seu deslocamento de voo para 9 metros por 1 hora e escolher um número de criaturas a até 9 metros de você igual a 3 + seu modificador de Carisma. As criaturas escolhidas ganham um deslocamento de voo mágico de 9 metros por 1 hora. Uma vez que reduza seu deslocamento de voo dessa maneira, você não pode fazê-lo novamente até terminar um descanso curto ou longo.",
          resource: { name: "Alma do Vento (compartilhar voo)", max: 1, recharge: "short" },
        },
      ],
    },
    {
      name: "Mente Aberrante",
      source: "TCoE",
      description:
        "Uma influência alienígena envolveu seus tentáculos em sua mente, dando-lhe poderes psiônicos. Você toca outras mentes e altera o mundo ao seu redor controlando a energia mágica do multiverso.",
      spells: {
        "1": ["Braços de Hadar", "Farpa Mental", "Sussurros Dissonantes"],
        "3": ["Acalmar Emoções", "Detectar Pensamentos"],
        "5": ["Fome de Hadar", "Banimento"],
        "7": ["Invocar Aberração", "Tentáculos Negros de Evard"],
        "9": ["Ligação Telepática de Rary", "Telecinésia"],
      },
      features: [
        {
          name: "Magias Psiônicas",
          level: 1,
          description:
            "Você aprende magias adicionais ao alcançar certos níveis nesta classe, como mostrado na tabela Magias Psiônicas. Essas magias são consideradas magias de feiticeiro para você, mas não contam contra o número de magias de feiticeiro que você conhece.\n" +
            "• 1° nível: braços de Hadar, farpa mental, sussurros dissonantes\n" +
            "• 3° nível: acalmar emoções, detectar pensamentos\n" +
            "• 5° nível: fome de Hadar, banimento\n" +
            "• 7° nível: invocar aberração, tentáculos negros de Evard\n" +
            "• 9° nível: ligação telepática de Rary, telecinésia\n" +
            "Sempre que ganhar um nível de feiticeiro, você pode substituir uma magia adquirida por esta característica por outra magia do mesmo círculo. A nova magia deve ser de adivinhação ou encantamento das listas de bruxo, feiticeiro ou mago.",
        },
        {
          name: "Discurso Telepático",
          level: 1,
          description:
            "Você pode estabelecer uma conexão telepática entre sua mente e a de outra criatura. Com uma ação bônus, escolha uma criatura a até 9 metros que você possa ver. Você e a criatura escolhida podem falar telepaticamente enquanto estiverem a uma distância de até 1,5 km × seu modificador de Carisma (mínimo de 1,5 km). Para entenderem um ao outro, ambos devem ser capazes de se comunicar mentalmente em um idioma que o outro compreenda.\n" +
            "A conexão telepática dura por um número de minutos igual ao seu nível de feiticeiro. Ela se encerra antes se você ficar incapacitado ou morrer, ou se usar essa característica para formar uma conexão com uma criatura diferente.",
        },
        {
          name: "Feitiçaria Psiônica",
          level: 6,
          description:
            "Quando você conjura qualquer magia de 1° círculo ou superior da sua característica Magias Psiônicas, você pode conjurá-la gastando um espaço de magia normalmente ou gastando uma quantidade de pontos de feitiçaria igual ao círculo da magia. Se você a conjurar gastando pontos de feitiçaria, ela não exige componentes verbais ou somáticos, nem componentes materiais, a menos que sejam consumidos pela magia.",
        },
        {
          name: "Defesas Psíquicas",
          level: 6,
          description:
            "Você ganha resistência a dano psíquico e tem vantagem em testes de resistência contra ser amedrontado ou enfeitiçado.",
        },
        {
          name: "Revelação na Carne",
          level: 14,
          description:
            "Você pode libertar a verdadeira aberração oculta dentro de si. Com uma ação bônus, você pode gastar 1 ou mais pontos de feitiçaria para transformar seu corpo magicamente por 10 minutos. Para cada ponto de feitiçaria gasto dessa forma, você ganha um dos seguintes benefícios, à sua escolha, cujos efeitos duram até a transformação se encerrar:\n" +
            "• Você pode ver qualquer criatura invisível a até 18 metros de você, desde que ela não esteja sob cobertura total. Seus olhos também se tornam negros ou se transformam em gavinhas sensoriais que se contorcem.\n" +
            "• Você ganha deslocamento de voo igual ao seu deslocamento terrestre e pode pairar. Conforme voa, sua pele cintila com muco ou brilha com uma luz sobrenatural.\n" +
            "• Você ganha deslocamento de natação igual a duas vezes o seu deslocamento terrestre e pode respirar debaixo d'água. Além disso, brânquias surgem no seu pescoço ou se abrem atrás das suas orelhas, seus dedos se tornam palmados ou você desenvolve cílios que se contorcem e se estendem por sua roupa.\n" +
            "• Seu corpo, junto com qualquer equipamento que esteja vestindo ou carregando, torna-se viscoso e elástico. Você pode se mover através de qualquer espaço tão estreito quanto 2,5 cm sem se espremer, e pode gastar 1,5 metro de deslocamento para escapar de amarras não mágicas ou da condição agarrado.",
        },
        {
          name: "Implosão Anômala",
          level: 18,
          description:
            "Você pode liberar seu poder aberrante como uma anomalia de distorção espacial. Com uma ação, você pode se teletransportar para um espaço desocupado que possa ver a até 36 metros de você. Imediatamente após você desaparecer, todas as criaturas a até 9 metros do espaço que você deixou devem realizar um teste de resistência de Força. Em caso de falha, a criatura sofre 3d10 de dano de energia e é puxada diretamente para o espaço que você deixou, terminando em um espaço desocupado tão perto do seu espaço anterior quanto possível. Em caso de sucesso, a criatura sofre metade do dano e não é puxada.\n" +
            "Assim que usar essa característica, você não pode usá-la novamente até terminar um descanso longo, a menos que gaste 5 pontos de feitiçaria para ativá-la de novo.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
    {
      name: "Alma Cronométrica",
      source: "TCoE",
      description:
        "A força cósmica da ordem inundou você com magia vinda de Mecânus, o plano moldado com eficiência mecânica. O poder da ordem pode parecer estranho aos outros, mas para você é parte de um grande e glorioso sistema.",
      spells: {
        "1": ["Alarme", "Proteção Contra o Bem e Mal"],
        "3": ["Auxílio", "Restauração Menor"],
        "5": ["Dissipar Magia", "Proteção Contra Energia"],
        "7": ["Invocar Construto", "Movimentação Livre"],
        "9": ["Muralha de Energia", "Restauração Maior"],
      },
      features: [
        {
          name: "Magia Cronométrica",
          level: 1,
          description:
            "Você aprende magias adicionais ao alcançar certos níveis nesta classe, como mostrado na tabela Magias Cronométricas. Essas magias são consideradas magias de feiticeiro para você, mas não contam contra o número de magias de feiticeiro que você conhece.\n" +
            "• 1° nível: alarme, proteção contra o bem e o mal\n" +
            "• 3° nível: auxílio, restauração menor\n" +
            "• 5° nível: dissipar magia, proteção contra energia\n" +
            "• 7° nível: invocar construto, movimentação livre\n" +
            "• 9° nível: muralha de energia, restauração maior\n" +
            "Sempre que ganhar um nível de feiticeiro, você pode substituir uma magia adquirida por esta característica por outra magia do mesmo círculo. A nova magia deve ser de abjuração ou transmutação das listas de bruxo, feiticeiro ou mago.\n" +
            "Além disso, consulte a tabela Manifestações da Ordem e escolha ou determine aleatoriamente como sua conexão com a ordem se manifesta enquanto você conjura magias de feiticeiro: (1) engrenagens espectrais pairam às suas costas; (2) os ponteiros de um relógio giram em seus olhos; (3) sua pele brilha em um tom de bronze metálico; (4) equações flutuantes e objetos geométricos recobrem seu corpo; (5) seu foco de conjuração toma temporariamente a forma de um mecanismo de relojoaria Miúdo; (6) o som de engrenagens ou o soar de um relógio pode ser ouvido por você e por aqueles afetados pela sua magia.",
        },
        {
          name: "Restaurar o Equilíbrio",
          level: 1,
          description:
            "Sua conexão com o plano da ordem absoluta permite que você uniformize momentos caóticos. Quando uma criatura que você possa ver a até 18 metros estiver prestes a fazer uma rolagem de d20 com vantagem ou desvantagem, você pode usar sua reação para impedir que a rolagem seja afetada por vantagem e desvantagem.\n" +
            "Você pode usar essa característica um número de vezes igual ao seu bônus de proficiência, e recupera todos os usos ao terminar um descanso longo.",
          resource: { max: "prof", recharge: "long" },
        },
        {
          name: "Bastião da Ordem",
          level: 6,
          description:
            "Você pode acessar a grande equação da existência para imbuir uma criatura com um escudo cintilante da ordem. Com uma ação, você pode gastar de 1 a 5 pontos de feitiçaria para criar uma proteção mágica ao redor de si mesmo ou de outra criatura que possa ver a até 9 metros de você.\n" +
            "A proteção dura até que você termine um descanso longo ou use essa característica novamente. A proteção é representada por uma quantidade de d8 igual ao número de pontos de feitiçaria gastos para criá-la. Quando a criatura protegida sofrer dano, ela pode gastar qualquer número desses dados, rolá-los e reduzir o dano sofrido pelo total rolado.",
        },
        {
          name: "Arrebatamento da Ordem",
          level: 14,
          description:
            "Você adquire a habilidade de alinhar sua consciência aos infinitos cálculos de Mecânus. Com uma ação bônus, você entra nesse estado de transe por 1 minuto. Durante esse período, jogadas de ataque contra você não podem se beneficiar de vantagem, e sempre que você fizer uma jogada de ataque, um teste de habilidade ou um teste de resistência, pode tratar qualquer resultado de 9 ou menos no d20 como um 10.\n" +
            "Assim que usar essa ação bônus, você não pode usá-la novamente até terminar um descanso longo, a menos que gaste 5 pontos de feitiçaria para usá-la de novo.",
          resource: { max: 1, recharge: "long" },
        },
        {
          name: "Marcha Cronometrada",
          level: 18,
          description:
            "Você invoca espíritos da ordem para expurgar a desordem ao seu redor. Com uma ação, você invoca os espíritos em um cubo de 9 metros originado a partir de você. Os espíritos se assemelham a modrons ou a outros construtos, à sua escolha. Eles são intangíveis e invulneráveis, e criam os seguintes efeitos dentro do cubo antes de desaparecerem:\n" +
            "• Os espíritos restauram até 100 pontos de vida, divididos como você escolher entre qualquer número de criaturas dentro do cubo.\n" +
            "• Quaisquer objetos danificados que estejam completamente dentro do cubo são reparados instantaneamente.\n" +
            "• Toda magia de 6° círculo ou inferior tem seu efeito encerrado em criaturas e objetos à sua escolha dentro do cubo.\n" +
            "Assim que usar essa ação, você não pode usá-la novamente até terminar um descanso longo, a menos que gaste 7 pontos de feitiçaria para isso.",
          resource: { max: 1, recharge: "long" },
        },
      ],
    },
  ],
  multiclass: {
    prerequisite: "Carisma 13",
    proficiencies: "Nenhuma",
    skills: 0,
  },
};
