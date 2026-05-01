import type { Character } from "@/lib/types";

export const ruda: Character = {
  id: "ruda-felpudo",
  playerName: "Rudá",
  characterName: "Edson Manoel Fagundes Peixoto",
  color: "#dc2626",
  hpCurrent: 35,
  hpMax: 35,
  hpTemp: 0,
  spellSlots: {
    "1": { current: 3, max: 3 },
  },
  resources: [
    {
      name: "Cura pelas Mãos (pool)",
      current: 15,
      max: 15,
      recharge: "long",
      description:
        "Toco uma criatura e distribuo cura até 15 PV. Posso gastar 5 PV do pool para curar veneno ou doença (não funciona em morto-vivo/constructo).",
    },
    {
      name: "Sentido Divino",
      current: 4,
      max: 4,
      recharge: "long",
      description:
        "Localiza morto-vivo, celestial ou corruptor em 18m sem cobertura total. Detecta locais consagrados/conspurcados também.",
    },
    {
      name: "Canalização Divina",
      current: 1,
      max: 1,
      recharge: "short",
      description:
        "Abjurar Inimigo (ação): criatura em 18m faz save de Sab. Falha: amedrontada 1 min. Sucesso: deslocamento metade por 1 min. Voto de Inimizade (ação bônus): vantagem em todos os ataques contra alvo em 3m por 1 min.",
    },
    {
      name: "Drenagem de Vida",
      current: 1,
      max: 1,
      recharge: "short",
      description:
        "Quando dou dano, posso adicionar meu nível como dano necrótico. Se o alvo for thri-kreen, ganho esse dano como vida temporária.",
    },
    {
      name: "Carne Fantasmagórica",
      current: 1,
      max: 1,
      recharge: "long",
      description:
        "Ação. Aparência translúcida, ar gelado. Ganho 9m de fly speed, resistência a perfurante/cortante/concussão não-mágico (não-prata) e vantagem em resistir a agarrar. Atravesso criaturas/objetos como terreno difícil. 1 minuto.",
    },
  ],
  sheet: {
    species: "Shade (Thri-kreen)",
    classes: [{ name: "Paladino", subclass: "Juramento de Vingança", level: 3 }],
    background: "Mercante Falho",
    abilityScores: { str: 17, dex: 10, con: 14, int: 11, wis: 13, cha: 16 },
    saves: ["wis", "cha"],
    skills: [
      { name: "Atletismo", proficient: true },
      { name: "Intuição", proficient: true },
      { name: "Investigação", proficient: true },
      { name: "Persuasão", proficient: true },
    ],
    proficiencies: [
      "Todas as armaduras",
      "Escudos",
      "Armas Simples e Marciais",
      "Ferramentas de Entalhador",
    ],
    languages: ["Comum", "Goblin", "Subcomum"],
    ac: 18,
    speed: 9,
    initiativeBonus: 0,
    proficiencyBonus: 2,
    weapons: [
      {
        name: "Espada Grande",
        damage: "2d6+3",
        damageType: "cortante",
        attackBonus: 5,
        properties: ["Pesada", "Duas mãos"],
      },
      {
        name: "Machado Grande",
        damage: "1d12+3",
        damageType: "cortante",
        attackBonus: 5,
        properties: ["Pesada", "Duas mãos"],
      },
      {
        name: "Machadinha",
        damage: "1d6+3",
        damageType: "cortante",
        attackBonus: 5,
        properties: ["Leve", "Arremesso 6/18m"],
      },
    ],
    features: [
      {
        name: "Sentido Divino (4/longo)",
        source: "Paladino",
        description:
          "Conheço a localização de morto-vivo, celestial ou corruptor em 18m sem cobertura total. Também detecto consagração/conspurcação.",
      },
      {
        name: "Cura pelas Mãos (pool 15)",
        source: "Paladino",
        description:
          "Pool de cura = 3× nível paladino. Ação para tocar e distribuir. 5 PV do pool curam veneno ou doença.",
      },
      {
        name: "Destruição Divina",
        source: "Paladino",
        description:
          "Gasto spell slot para causar +2d8 radiante (1° nível) ou +1d8 por nível acima até 5d8. +1d8 contra corruptor ou morto-vivo. Pode critar.",
      },
      {
        name: "Canalização Divina (1/curto)",
        source: "Juramento de Vingança",
        description:
          "Abjurar Inimigo (ação): save de Sabedoria, mortos-vivos/corruptores com desvantagem. Falha: amedrontado 1 min. Sucesso: meia velocidade 1 min. Voto de Inimizade (ação bônus): vantagem em ataques contra alvo em 3m por 1 min.",
      },
      {
        name: "Drenagem de Vida (1/curto)",
        source: "Shade",
        description:
          "Adiciono meu nível como dano necrótico. Se alvo for thri-kreen, ganho esse dano como PV temporários.",
      },
      {
        name: "Carne Fantasmagórica (1/longo)",
        source: "Shade",
        description:
          "Ação para virar translúcido. 9m de fly speed, resistência a perf/cort/conc não-mágico não-prata, vantagem contra agarrar, atravesso criaturas/objetos (1d10 força se terminar dentro). Dura 1 min.",
      },
      {
        name: "Visão no Escuro",
        source: "Shade",
        description: "Em 18m vejo penumbra como luz plena e escuridão como penumbra.",
      },
      {
        name: "Morte Imperfeita",
        source: "Shade",
        description: "Sou humanoide, porém efeitos contra mortos-vivos também me afetam.",
      },
      {
        name: "Resiliência Espectral",
        source: "Shade",
        description: "Resistência a dano necrótico.",
      },
      {
        name: "Combate com Armas Grandes",
        source: "Estilo de Luta",
        description: "Com arma de duas mãos, rerrolo dado de dano que cair 1 ou 2.",
      },
      {
        name: "Saúde Divina",
        source: "Paladino",
        description: "Não posso ficar doente.",
      },
      {
        name: "Braços Pequenininhos",
        source: "Thri-kreen",
        description:
          "Tenho mais dois braços menores. Podem manejar objetos pequenos, abrir portas e empunhar armas leves.",
      },
    ],
    spells: {
      saveDC: 12,
      attackMod: 4,
      castingAbility: "cha",
      cantrips: [],
      known: [
        {
          name: "Perdição",
          level: 1,
          school: "Encantamento",
          castingTime: "1 ação",
          range: "9 metros",
          components: "V, S, M (gota de sangue)",
          duration: "Concentração, 1 minuto",
          concentration: true,
          description:
            "Até 3 criaturas: save de Carisma. Falha: subtraem 1d4 de cada ataque/save enquanto a magia estiver ativa.",
        },
        {
          name: "Marca do Caçador",
          level: 1,
          school: "Adivinhação",
          castingTime: "1 ação bônus",
          range: "27 metros",
          components: "V",
          duration: "Concentração, 1 hora",
          concentration: true,
          description:
            "+1d6 de dano (mesmo tipo da arma) em ataques contra o alvo. Vantagem em Percepção/Sobrevivência para encontrá-lo. Se alvo zerar, posso re-marcar outro no próximo turno.",
        },
        {
          name: "Destruição Colérica",
          level: 1,
          school: "Evocação",
          castingTime: "1 ação bônus",
          range: "Pessoal",
          components: "V",
          duration: "Concentração, até 1 minuto",
          concentration: true,
          description:
            "+1d6 de dano psíquico no próximo ataque com arma. Save de Sabedoria: falha amedronta até o fim da magia. (1 ataque só)",
        },
        {
          name: "Comando",
          level: 1,
          school: "Encantamento",
          castingTime: "1 ação",
          range: "18 metros",
          components: "V",
          duration: "1 rodada",
          description:
            "Save de Sabedoria. Falha: alvo cumpre comando no próximo turno. Comandos válidos: Aproxime-se, Largue, Fuja, Deite-se, Parado.",
        },
        {
          name: "Heroísmo",
          level: 1,
          school: "Encantamento",
          castingTime: "1 ação",
          range: "Toque",
          components: "V, S",
          duration: "Concentração, até 1 minuto",
          concentration: true,
          description:
            "Imune a amedrontado e ganha PV temporários = mod conjuração no início de cada turno. Ao acabar, perde os temporários.",
        },
      ],
    },
    inventory: {
      coins: { gp: 120, sp: 0, cp: 0 },
      items: [
        {
          name: "Cota de Malha",
          description: "Armadura pesada, CA 16, desvantagem em furtividade. 27,5 kg.",
        },
        {
          name: "Escudo Pequeno",
          description: "+1 CA. (Contado na CA total: 18)",
        },
        {
          name: "Símbolo Sagrado",
          description: "Amuleto com olho de gato desenhado. (Bast)",
        },
        {
          name: "Bugigangas",
          description: "Pedaço de couro de estandarte. Leque que abre revelando um gato.",
        },
        { name: "Saquinho de moedas", description: "Contém 10 po extras." },
        { name: "Balança de mercador", description: "Pratos e pesinhos somando 1 kg." },
        { name: "Roupas finas" },
        { name: "Mochila" },
        { name: "Saco de dormir" },
        { name: "Corda 15m" },
        { name: "Algema" },
        { name: "Ração para 5 dias" },
      ],
    },
    appearance: {
      size: "Médio",
      height: "1,93m",
      description:
        "Frequentemente troca de roupa, tentando se sentir confortável neste corpo. Quando ativa Carne Fantasmagórica, fica translúcido com ar gelado em volta.",
    },
    personality: {
      trait:
        "Cara tranquilo, mais na sua, não é de bater papo. Fechado sobre o passado, mas fala tranquilo sobre estar em outro corpo. Fica puto se mexem com quem ele se importa.",
      ideal:
        "Compaixão pelos shadow goblins (foram injustiçados). Empatia com feridos e oprimidos. Ama gatos. Vinga quem fez mal aos seus.",
      flaw:
        "Se culpa muito quando algo dá errado. Cabeça dura quando puto. Pode machucar quem ama na busca por vingança. Evita pensar no próprio corpo. Esquecido sobre a vida passada.",
      why: "Entender o que aconteceu com Leandro, vingar-se de Pierre, se acostumar com este corpo (ou achar um novo / antigo).",
      backstory:
        "Vida tranquila com pais e irmã. Aos quase 30 anos, montou uma loja de artesanato perto do porto em Solus. Pierre (Acidôn), um cuzão, ficou enciumado e me ameaçou — fechei a loja por medo de ele machucar quem eu amo. Conheci Leandro, um paladino foda; virei amigo dele e aprendi as bases de combate. Um dia fui entregar uma encomenda na casa dele e o achei sendo atacado — fugi covarde e nunca soube se ele sobreviveu. Voltei depois e segui os atacantes (jurei ouvir o nome de Pierre); acabei sendo apagado numa pancada na nuca em uma cidade desconhecida. Voltei como ente quase incorpóreo, possuí o corpo do Rudá (um Thri-kreen) que vi morrer lutando. Estou nesse corpo há alguns meses. Hoje aventuro para descobrir o que aconteceu, me vingar e talvez reaver meu corpo. Religião: Bast.",
    },
  },
};
