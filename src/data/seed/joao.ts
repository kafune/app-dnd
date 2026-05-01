import type { Character } from "@/lib/types";

export const joao: Character = {
  id: "joao-lindao",
  playerName: "João",
  characterName: "Zorrilho Pabrantes",
  color: "#7c3aed",
  hpCurrent: 18,
  hpMax: 18,
  hpTemp: 0,
  spellSlots: {
    "1": { current: 2, max: 2 },
  },
  resources: [
    {
      name: "Graça da Rainha Corvo",
      current: 2,
      max: 2,
      recharge: "long",
      description:
        "Ação bônus para teleportar até 9m. Ganha resistência a todo dano até o início do próximo turno.",
    },
  ],
  sheet: {
    species: "Shadar-Kai",
    classes: [{ name: "Ladino", subclass: "Trapaceiro Arcano", level: 3 }],
    background: "Viajante Distante",
    abilityScores: { str: 12, dex: 18, con: 11, int: 14, wis: 11, cha: 13 },
    saves: ["dex", "int"],
    skills: [
      { name: "Furtividade", proficient: true },
      { name: "Atletismo", proficient: true },
      { name: "Enganação", proficient: true },
      { name: "Persuasão", proficient: true },
      { name: "Intuição", proficient: true },
      { name: "Percepção", proficient: true },
    ],
    proficiencies: [
      "Armas Simples",
      "Besta de Mão",
      "Espadas Longas e Curtas",
      "Rapieiras",
      "Escudo Leve (Trance)",
      "Besta de Mão (Trance)",
    ],
    languages: ["Comum", "Élfico"],
    ac: 17,
    speed: 9,
    initiativeBonus: 4,
    proficiencyBonus: 2,
    weapons: [
      {
        name: "Espada Curta",
        damage: "1d6+4",
        damageType: "perfurante",
        attackBonus: 6,
        properties: ["Acuidade", "Leve"],
      },
      {
        name: "Rapieira",
        damage: "1d8+4",
        damageType: "perfurante",
        attackBonus: 6,
        properties: ["Acuidade"],
      },
    ],
    features: [
      {
        name: "Ataque Furtivo (1/turno)",
        source: "Ladino",
        description:
          "Uma vez por turno adiciono 2d6 nas jogadas de dano contra qualquer criatura que eu acertar, desde que tenha vantagem nas jogadas de ataque (com arma de acuidade ou distância). Não preciso ter vantagem se estiver a 1,5m do inimigo, desde que ele não esteja incapacitado e que eu não tenha desvantagem.",
      },
      {
        name: "Graça da Rainha Corvo",
        source: "Shadar-Kai",
        description:
          "Como ação bônus posso teleportar para qualquer quadrado em 9 metros que eu possa ver. Ganho resistência a todo tipo de dano até o início do meu próximo turno. Enquanto resistente, fico parecendo um fantasma translúcido.",
      },
      {
        name: "Gíria de Ladrão",
        source: "Ladino",
        description:
          "Conheço gírias e sinais secretos para passar mensagens disfarçadas em conversa normal. Leva 4× mais tempo que falar diretamente.",
      },
      {
        name: "Ação Ardilosa",
        source: "Ladino",
        description:
          "Ganho uma ação bônus em todos os meus turnos, mas só pode ser usada para Disparada, Desengajar ou Esconder.",
      },
      {
        name: "Mãos Mágicas Malabaristas",
        source: "Trapaceiro Arcano",
        description:
          "Quando conjurar Mãos Mágicas posso: guardar/recuperar objeto em recipiente vestido por outra criatura; usar Ferramentas de Ladrão à distância. Posso fazer essas ações furtivamente com teste de Destreza (Prestidigitação) vs Sabedoria (Percepção). Posso usar a ação bônus de Ação Ardilosa para controlar a mão.",
      },
      {
        name: "Visão no Escuro",
        source: "Shadar-Kai",
        description:
          "Em até 18 metros vejo penumbra como luz plena e escuridão como penumbra. Apenas tons de cinza.",
      },
      {
        name: "Ancestralidade Fey",
        source: "Shadar-Kai",
        description: "Vantagem em rolagens contra ficar enfeitiçado ou para sair do estado enfeitiçado.",
      },
      {
        name: "Resistência a Dano Necrótico",
        source: "Shadar-Kai",
        description: "Tomo metade do dano necrótico.",
      },
      {
        name: "Trance",
        source: "Shadar-Kai",
        description:
          "Não durmo e magias não me botam para dormir. Termino descanso longo em 4 horas em meditação consciente. Ao acabar o trance ganho duas proficiências/perícias que eu não tenho até o próximo descanso longo.",
      },
      {
        name: "Olhos em Você",
        source: "Antecedente: Viajante Distante",
        description:
          "Meu sotaque, maneirismo e aparência me marcam como estrangeiro. Atrai pessoas curiosas (nobres, escolásticos) com sua história exótica.",
      },
    ],
    spells: {
      saveDC: 12,
      attackMod: 4,
      castingAbility: "int",
      cantrips: [
        {
          name: "Mãos Mágicas",
          level: 0,
          school: "Conjuração",
          castingTime: "1 ação",
          range: "9 metros",
          components: "V, S",
          duration: "1 minuto",
          description:
            "Crio uma mão espectral que dura 1 minuto. Posso usar minha ação para controlar — pode manipular objeto, abrir porta destrancada, guardar/pegar item de recipiente aberto, derramar conteúdo de frasco. Move até 9m por uso. Não pode atacar, usar itens mágicos ou carregar mais de 5kg.",
        },
        {
          name: "Toque Chocante",
          level: 0,
          school: "Conjuração",
          castingTime: "1 ação",
          range: "Toque",
          components: "V, S",
          duration: "Instantânea",
          description:
            "Faça um ataque corpo-a-corpo com magia. Vantagem se o alvo estiver com armadura de metal. Se atingir, 1d8 de dano elétrico e o alvo não pode usar reações até o início do próximo turno dele.",
        },
        {
          name: "Ilusão Menor",
          level: 0,
          school: "Conjuração",
          castingTime: "1 ação",
          range: "9 metros",
          components: "V",
          duration: "1 minuto",
          description:
            "Crio som ou imagem de um objeto. Som varia de sussurro a grito. Imagem até 1,5 metro cúbico, sem som/luz/cheiro. Investigação contra a CD para discernir.",
        },
      ],
      known: [
        {
          name: "Imagem Silenciosa",
          level: 1,
          school: "Ilusão",
          castingTime: "1 ação",
          range: "18 metros",
          components: "V, S",
          duration: "Concentração, até 10 minutos",
          concentration: true,
          description:
            "Crio imagem de objeto, criatura ou fenômeno visual até 4,5 metros cúbicos. Posso usar minha ação para mover. Investigação CD vence.",
        },
        {
          name: "Leque Cromático",
          level: 1,
          school: "Ilusão",
          castingTime: "1 ação",
          range: "Pessoal (Cone de 4,5m)",
          components: "V, S, M",
          duration: "1 rodada",
          description:
            "Rolo 6d10; total = HP de criaturas afetadas em ordem ascendente. Cada criatura afetada fica cega até o fim da magia. Em níveis superiores: +2d10 por nível acima do 1°.",
        },
        {
          name: "Névoa Obscurecente",
          level: 1,
          school: "Conjuração",
          castingTime: "1 ação",
          range: "36 metros",
          components: "V, S",
          duration: "Concentração, até 1 hora",
          concentration: true,
          description:
            "Esfera de 6m de raio de névoa = escuridão densa. Vento moderado dispersa. Em níveis superiores: +6m de raio por nível.",
        },
      ],
    },
    inventory: {
      coins: { gp: 75, sp: 0, cp: 0 },
      items: [
        {
          name: "Armadura de Couro Batido",
          description: "CA 12 + mod Des. 6,5 kg.",
        },
        { name: "Escudo Buckler", description: "+1 CA. 1 kg." },
        {
          name: "Kit de Ferramentas de Ladrão",
          description:
            "Adiciona bônus de proficiência ao teste de Destreza para destrancar portas ou desarmar armadilhas.",
        },
        {
          name: "Instrumento Musical",
          description: "Um instrumento de minha escolha.",
        },
      ],
    },
    appearance: {
      size: "Médio",
      height: "1,67m",
    },
    personality: {
      trait:
        "Um homem que tenta fazer piada com tudo, não levando situações a sério, e irritando bastante as pessoas à minha volta.",
      ideal: "Tenho um ego alto, com um senso de justiça absurdamente alto.",
      flaw: "Sempre vai pensar o pior de si mesmo, e muito teimoso.",
      why: "Tentar recomeçar sem o sentimento de culpa e vergonha.",
      backstory:
        "Nasci em uma vila de elfos nas Cordilheiras de Rumtor. Minha infância foi muito simples porém feliz, com a constante presença da minha irmã mais velha. Tínhamos uma dança: 'Jogar de ladinho'. Tudo mudou quando uma guerra começou por uma briga territorial. Minha irmã foi convocada e morreu de fome — não lutando. Isso me despertou uma vontade de fazer algo, mas meus pais me proibiram. Lidei com o luto rindo e fazendo piadas. Os líderes da vila procuraram voluntários para roubar mantimentos e fui sem pensar duas vezes, criando um conflito familiar enorme. Consegui roubar pouco até que a guerra acabou — perdemos. Não querendo enfrentar meus pais, decidi fugir sem rumo por vergonha.",
    },
  },
};
