import type { Character } from "@/lib/types";

export const camargo: Character = {
  id: "camargo-fofo",
  playerName: "Camargo",
  characterName: "Xopscoch ReiVahn",
  color: "#0ea5e9",
  hpCurrent: 25,
  hpMax: 25,
  hpTemp: 0,
  spellSlots: {
    "1": { current: 4, max: 4 },
    "2": { current: 2, max: 2 },
  },
  resources: [
    {
      name: "Inspiração de Bardo",
      current: 3,
      max: 3,
      recharge: "long",
      description:
        "Ação bônus para dar a um aliado em até 18m um d6 que ele pode somar a teste/ataque/save. Ou (Palavras Desconcertantes) gastar para fazer um inimigo subtrair o d6 do próximo save dele.",
    },
    {
      name: "Lembrança Kenku",
      current: 2,
      max: 2,
      recharge: "long",
      description: "Posso me dar vantagem antes de rolar o d20 em algum teste no qual eu tenho proficiência.",
    },
  ],
  sheet: {
    species: "Kenku",
    classes: [{ name: "Bardo", subclass: "Colégio da Eloquência", level: 3 }],
    background: "Pirata",
    abilityScores: { str: 13, dex: 15, con: 12, int: 14, wis: 11, cha: 17 },
    saves: ["dex", "cha"],
    skills: [
      { name: "Atletismo", proficient: true },
      { name: "Percepção", proficient: true },
      { name: "Enganação", proficient: true },
      { name: "Atuação", proficient: true },
      { name: "Acrobacia", proficient: true },
    ],
    proficiencies: [
      "Armadura Leve",
      "Armas Simples",
      "Bestas de Mão",
      "Espadas Longas e Curtas",
      "Rapieiras",
      "Pistola",
      "Escudos",
    ],
    languages: ["Comum", "Aquan"],
    ac: 14,
    speed: 9,
    initiativeBonus: 2,
    proficiencyBonus: 2,
    weapons: [
      {
        name: "Clava",
        damage: "1d8+1",
        damageType: "concussão",
        attackBonus: 3,
        properties: [],
      },
      {
        name: "Rapieira",
        damage: "1d8+2",
        damageType: "perfurante",
        attackBonus: 4,
        properties: ["Acuidade"],
      },
      {
        name: "Pistola",
        damage: "2d6+2",
        damageType: "perfurante",
        attackBonus: 4,
        properties: ["Distância 4,5m / 12m", "14 munições"],
      },
    ],
    features: [
      {
        name: "Inspiração de Bardo (3/longo)",
        source: "Bardo",
        description:
          "Ação bônus para escolher uma criatura em até 18m que possa me ouvir. Ela ganha um d6 que pode somar a um teste/ataque/save em até 10 minutos.",
      },
      {
        name: "Palavras Desconcertantes",
        source: "Colégio da Eloquência",
        description:
          "Como ação bônus, gasto Inspiração de Bardo para escolher uma criatura em até 18m. Rolo o dado e ela subtrai o valor do próximo save antes do meu próximo turno.",
      },
      {
        name: "Versatilidade",
        source: "Bardo",
        description: "Adiciono metade do bônus de proficiência em qualquer teste sem proficiência.",
      },
      {
        name: "Canção do Descanso",
        source: "Bardo",
        description:
          "Aliados que me ouvirem e gastarem Dados de Vida em descanso curto recuperam +1d6 PV adicionais.",
      },
      {
        name: "Fonte de Inspiração",
        source: "Colégio da Eloquência",
        description:
          "Recupero todos os usos de Inspiração de Bardo após descanso curto ou longo.",
      },
      {
        name: "Língua Prateada",
        source: "Colégio da Eloquência",
        description: "Em testes de Persuasão ou Enganação, trato 9 ou menos no d20 como 10.",
      },
      {
        name: "Lembrança Kenku (2/longo)",
        source: "Kenku",
        description: "Posso me dar vantagem antes de rolar o d20 em algum teste no qual eu tenho proficiência.",
      },
      {
        name: "Expert em Duplicação",
        source: "Kenku",
        description: "Vantagem em testes para produzir cópia exata de escrita ou trabalho.",
      },
      {
        name: "Mimicry",
        source: "Kenku",
        description:
          "Imito sons e vozes que tenha escutado. Intuição CD 8 + prof + mod Car (= 13) para perceber.",
      },
      {
        name: "Reputação Ruim",
        source: "Antecedente: Pirata",
        description:
          "As pessoas têm medo da minha reputação. Em terras civilizadas escapo de ofensas menores (não pagar bebida, briga) — a maioria não tem coragem de me entregar.",
      },
    ],
    spells: {
      saveDC: 13,
      attackMod: 5,
      castingAbility: "cha",
      cantrips: [
        {
          name: "Luz",
          level: 0,
          school: "Evocação",
          castingTime: "1 ação",
          range: "Toque",
          components: "V, M (vaga-lume ou musgo fosforescente)",
          duration: "1 hora",
          description:
            "Toco objeto até 3m em qualquer dimensão. Emite luz plena em 6m e penumbra em mais 6m.",
        },
        {
          name: "Orientação",
          level: 0,
          school: "Adivinhação",
          castingTime: "1 ação",
          range: "Toque",
          components: "V, S",
          duration: "Concentração, até 1 minuto",
          concentration: true,
          description:
            "O alvo voluntário pode rolar 1d4 e adicionar a um teste de habilidade à escolha dele, antes ou depois.",
        },
      ],
      known: [
        {
          name: "Infringir Ferimentos",
          level: 1,
          school: "Necromancia",
          castingTime: "1 ação",
          range: "Toque",
          components: "V, S",
          duration: "Instantânea",
          description: "Ataque corpo-a-corpo com magia. Se atingir, 3d10 de dano necrótico. +1d10 por nível acima.",
        },
        {
          name: "Curar Ferimentos",
          level: 1,
          school: "Evocação",
          castingTime: "1 ação",
          range: "Toque",
          components: "V, S",
          duration: "Instantânea",
          description:
            "Criatura tocada recupera 1d8 + mod conjuração de PV. Não funciona em mortos-vivos/constructos. +1d8 por nível acima.",
        },
        {
          name: "Coroa da Loucura",
          level: 2,
          school: "Encantamento",
          castingTime: "1 ação",
          range: "36 metros",
          components: "V, S",
          duration: "Concentração, até 1 minuto",
          concentration: true,
          description:
            "Humanoide deve passar em save de Sabedoria ou ficar enfeitiçado. Deve atacar uma criatura que eu escolher mentalmente. Repete save no fim de cada turno.",
        },
        {
          name: "Despedaçar",
          level: 2,
          school: "Evocação",
          castingTime: "1 ação",
          range: "18 metros",
          components: "V, S, M (lasca de mica)",
          duration: "Instantânea",
          description:
            "Esfera de 3m de raio. Save de Constituição: 3d8 de dano trovejante (metade no sucesso). Material inorgânico tem desvantagem. +1d8 por nível acima do 2°.",
        },
        {
          name: "Zona da Verdade",
          level: 2,
          school: "Encantamento",
          castingTime: "1 ação",
          range: "18 metros",
          components: "V, S",
          duration: "10 minutos",
          description:
            "Esfera de 4,5m de raio. Save de Carisma: criatura que falhar não pode mentir deliberadamente. Sei quem passou ou falhou.",
        },
        {
          name: "Silêncio",
          level: 2,
          school: "Ilusão",
          castingTime: "1 ação",
          range: "36 metros",
          components: "V, S",
          duration: "Concentração, até 10 minutos",
          concentration: true,
          ritual: true,
          description:
            "Esfera de 6m de raio. Nenhum som dentro/atravessa. Imune a dano trovejante, criaturas surdas. Sem componentes verbais possíveis.",
        },
      ],
    },
    inventory: {
      coins: { gp: 67, sp: 0, cp: 0 },
      items: [
        { name: "Armadura de Couro", description: "CA 11 + mod Des. 5 kg." },
        { name: "Escudo Buckler", description: "+1 CA. 1 kg." },
        {
          name: "Ferramentas de Navegação",
          description: "Adiciona bônus de proficiência em testes para evitar se perder no mar.",
        },
        { name: "Corda de Seda (15m)" },
        { name: "Flauta" },
        { name: "Alaúde" },
        { name: "Xilofone Colorido" },
        {
          name: "Pacote de Artista",
          description:
            "Mochila, saco de dormir, 2 fantasias, 5 velas, ração para 5 dias, odre de água, kit de disfarce.",
        },
      ],
    },
    appearance: {
      size: "Médio",
      height: "1,78m",
    },
    personality: {
      trait: "Engraçado (comentarista) e bem vaidoso.",
      ideal: "—",
      flaw: "Muito folgado e MEGA supersticioso.",
      why: "—",
      backstory:
        "Criado pela mãe Swanna ReiVahn e irmãs gêmeas Roxxiy e Moxie. Pai ausente, morto por um shadow goblin. Mãe cigana, cultura vibrante. Após a morte do pai mudaram para o Reino de Solus, onde tocava alaúde nas ruas (odiava) enquanto as irmãs faziam furtos. As irmãs foram pegas por um shadow goblin. Matriculou-se no Colégio da Eloquência. Recrutado pelo capitão orc Lags-Ostar e tripulação Pedra de Chão; subiu de cargo, ficou próximo da tiefling Estêniah. Planejou roubar o tesouro de emergência com Estêniah — ela foi enforcada após ser entregue por um shadow goblin. Fugiu com a grana. Antes de partir entregou o dinheiro à mãe, recebeu um anel de rubi. Cruzou um canal de ninfas, caiu na água, esfaqueou uma ninfa vermelha com a faca de Estêniah — a faca ficou eternamente vermelha e ele jura ouvir a ninfa. Hoje conhecido como 'Mendigo do Alaúde'.",
    },
  },
};
