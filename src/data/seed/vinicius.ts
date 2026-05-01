import type { Character } from "@/lib/types";

export const vinicius: Character = {
  id: "vinicius-fofo",
  playerName: "Vinicíus",
  characterName: "Holg Smough",
  color: "#16a34a",
  hpCurrent: 16,
  hpMax: 24,
  hpTemp: 0,
  spellSlots: {
    "1": { current: 4, max: 4 },
    "2": { current: 2, max: 2 },
  },
  resources: [
    {
      name: "Forma Selvagem",
      current: 2,
      max: 2,
      recharge: "short",
      description:
        "Ação para virar criatura ND ≤ 1/4 (não nada nem voa por enquanto). Duração: metade do nível de druida em horas. Próximo upgrade no nível 4.",
    },
    {
      name: "Recuperação Natural",
      current: 1,
      max: 1,
      recharge: "long",
      description:
        "Em descanso curto, recupero espaços de magia até nível ≤ metade do meu nível de druida (e nunca de 6° ou mais).",
    },
    {
      name: "Resistência Implacável",
      current: 1,
      max: 1,
      recharge: "long",
      description: "Quando for derrubado a 0 PV, posso voltar para 1 PV.",
    },
  ],
  sheet: {
    species: "Meio-Orc",
    classes: [{ name: "Druida", subclass: "Círculo da Terra (Ártico)", level: 3 }],
    background: "Eremita",
    abilityScores: { str: 16, dex: 10, con: 16, int: 12, wis: 15, cha: 11 },
    saves: ["int", "wis"],
    skills: [
      { name: "Intimidação", proficient: true },
      { name: "Natureza", proficient: true },
      { name: "Sobrevivência", proficient: true },
      { name: "Medicina", proficient: true },
      { name: "Religião", proficient: true },
    ],
    proficiencies: [
      "Escudos (não-metal)",
      "Clavas",
      "Adagas",
      "Dardos",
      "Azagaias",
      "Maças",
      "Bordões",
      "Cimitarra",
      "Foices",
      "Funda",
      "Lanças",
      "Kit de Herbalismo",
      "Armaduras Leves e Médias (não-metal)",
    ],
    languages: ["Comum", "Orc", "Anão", "Druídico"],
    ac: 12,
    speed: 9,
    initiativeBonus: 0,
    proficiencyBonus: 2,
    weapons: [
      {
        name: "Lança de Camélia",
        damage: "1d6+3",
        damageType: "perfurante",
        attackBonus: 5,
        properties: ["Arremesso 6m", "Versátil 1d8"],
      },
      {
        name: "Bordão Místico (Lança)",
        damage: "1d8+2",
        damageType: "perfurante",
        attackBonus: 4,
        properties: ["Usa Sab para ataque/dano", "Arma mágica", "Concentração 1 min"],
      },
    ],
    features: [
      {
        name: "Resistência Implacável (1/longo)",
        source: "Meio-Orc",
        description: "Quando for derrubado a 0 PV posso voltar para 1 PV.",
      },
      {
        name: "Forma Selvagem (2/curto)",
        source: "Druida",
        description:
          "Tomo a forma de criatura ND ≤ 1/4 que tenha visto. Limites atuais: não nada, não voa. Mantenho Int/Sab/Car. Vida vira a da criatura. Volto automaticamente a 0 PV. Sem magias enquanto transformado.",
      },
      {
        name: "Recuperação Natural (1/longo)",
        source: "Druida",
        description:
          "Em descanso curto recupero espaços de magia até nível ≤ metade do meu nível de druida (não recupera 6° ou mais).",
      },
      {
        name: "Druídico",
        source: "Druida",
        description:
          "Conheço o idioma secreto dos druidas. Mensagens escondidas: outros precisam de Sabedoria (Percepção) CD 15 para perceber.",
      },
      {
        name: "Planta Sagrada (Camélia)",
        source: "Círculo da Terra (Ártico)",
        description:
          "Camélia: associada a coragem, honra e longevidade. Minhas armas são feitas dela. Cultuo a planta como sagrada.",
      },
      {
        name: "Visão no Escuro",
        source: "Meio-Orc",
        description:
          "Em até 18m, na penumbra enxergo como luz plena, na escuridão como penumbra. Apenas tons de cinza.",
      },
      {
        name: "Ataques Selvagens",
        source: "Meio-Orc",
        description: "Em crítico rolo um dado de dano a mais e adiciono como dano extra.",
      },
      {
        name: "Não pode usar metal",
        source: "Druida",
        description: "Não posso usar armaduras ou escudos de metal.",
      },
    ],
    spells: {
      saveDC: 12,
      attackMod: 4,
      castingAbility: "wis",
      cantrips: [
        {
          name: "Orientação",
          level: 0,
          school: "Adivinhação",
          castingTime: "1 ação",
          range: "Toque",
          components: "V, S",
          duration: "Concentração, 1 minuto",
          concentration: true,
          description:
            "Alvo voluntário pode rolar 1d4 e adicionar a um teste de habilidade, antes ou depois.",
        },
        {
          name: "Bordão Místico",
          level: 0,
          school: "Transmutação",
          castingTime: "1 ação bônus",
          range: "Toque",
          components: "V, S, M (lasca de árvore)",
          duration: "1 minuto",
          description:
            "Lasca da arma é imbuída pela natureza. Uso Sab no lugar de For para ataque/dano corpo-a-corpo, dado de dano vira d8. Arma se torna mágica.",
        },
        {
          name: "Rajada de Veneno",
          level: 0,
          school: "Conjuração",
          castingTime: "1 ação",
          range: "3 metros",
          components: "V, S",
          duration: "Instantânea",
          description:
            "Save de Constituição. Falha: 1d12 de dano de veneno. +1d12 nos níveis 5/11/17.",
        },
      ],
      known: [
        {
          name: "Curar Ferimentos",
          level: 1,
          school: "Evocação",
          castingTime: "1 ação",
          range: "Toque",
          components: "V, S",
          duration: "Instantânea",
          description: "Criatura tocada recupera 1d8 + mod Sab de PV. +1d8 por nível acima.",
        },
        {
          name: "Onda Trovejante",
          level: 1,
          school: "Evocação",
          castingTime: "1 ação",
          range: "Pessoal (cubo de 4,5m)",
          components: "V, S",
          duration: "Instantânea",
          description:
            "Save de Constituição. Falha: 2d8 trovejante e empurrado 3m. Sucesso: metade, sem empurrão. Objetos não vestidos também tomam dano.",
        },
        {
          name: "Criar/Destruir Água",
          level: 1,
          school: "Transmutação",
          castingTime: "1 ação",
          range: "9 metros",
          components: "V, S, M (1 gota de água ou pitada de areia)",
          duration: "Instantânea",
          description:
            "Crio até 38L de água ou destruo a mesma quantidade. Pode também ser nuvem de chuva ou nevoa.",
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
            "Esfera de 6m de raio de névoa = escuridão densa. Vento moderado dispersa. +6m de raio por nível acima.",
        },
        {
          name: "Imobilizar Pessoa (Magia de Círculo)",
          level: 2,
          school: "Encantamento",
          castingTime: "1 ação",
          range: "18 metros",
          components: "V, S",
          duration: "Concentração, até 1 minuto",
          concentration: true,
          description:
            "Humanoide deve passar em save de Sabedoria ou fica paralisado. Repete save a cada turno. Não funciona em mortos-vivos.",
        },
        {
          name: "Crescer Espinhos (Magia de Círculo)",
          level: 2,
          school: "Transmutação",
          castingTime: "1 ação",
          range: "45 metros",
          components: "V, S",
          duration: "Concentração, até 10 minutos",
          concentration: true,
          description:
            "Solos em até 6m do ponto criam espinhos: terreno difícil, 2d4 de dano por 1,5m atravessado. Camuflado como normal — Percepção para reconhecer.",
        },
      ],
    },
    inventory: {
      coins: { gp: 100, sp: 0, cp: 0 },
      items: [
        {
          name: "Escudo de Madeira de Camélia",
          description: "+2 CA. 2,7 kg. (já contado na CA)",
        },
        {
          name: "Ramo de Camélia",
          description: "Foco druídico para conjurar magias.",
        },
        {
          name: "Kit de Herbalismo",
          description:
            "Identificar, coletar e processar plantas para criar remédios. 1,5 kg.",
        },
      ],
    },
    appearance: {
      size: "Médio",
      height: "1,95m",
    },
    personality: {
      trait: "—",
      ideal: "—",
      flaw: "—",
      why: "—",
      backstory:
        "Quando tinha 10~11 anos, minha tribo havia sido banida e buscou refúgio em local de temperaturas baixíssimas. Descobriram a camélia, planta resistente a frios extremos, que fez a tribo prosperar e a maioria aprender druidismo. Um exército de civilização vizinha atacou; lembro apenas de ter apagado quando arrombaram a porta de casa, e acordei perto do Reino de Solus do lado do corpo frio do Presa, meu lobo do ártico, que se sacrificou para me salvar. Jurei proteger até o fim os restos de camélia que tinha comigo. Durante anos me isolei melhorando minha conexão com a planta a ponto de criar armas com ela, e melhorei minhas habilidades druídicas conseguindo me transformar em mais animais.",
    },
  },
};
