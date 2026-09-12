/**
 * Catálogo de equipamento do Livro do Jogador (5e, PT-BR, capítulo 5):
 * armas, armaduras, escudos, munição, pacotes, focos de conjuração,
 * ferramentas, kits, instrumentos musicais e equipamento de aventura.
 *
 * Nomes iguais aos das tabelas do livro (Armas p151, Armaduras p147,
 * Equipamento p152, Ferramentas p156, Pacotes p153). Preços em pc/pp/po,
 * pesos em kg (edição métrica). Os dois escudos extras são homebrew.
 */

import type { SourceBook } from "@/lib/types";

export type ItemCategory =
  | "Arma simples"
  | "Arma marcial"
  | "Armadura leve"
  | "Armadura média"
  | "Armadura pesada"
  | "Escudo"
  | "Munição"
  | "Pacote"
  | "Foco de conjuração"
  | "Ferramenta"
  | "Kit"
  | "Instrumento musical"
  | "Equipamento de aventura";

export type CatalogItem = {
  name: string;
  /** Nome completo para exibicao ("Couro" -> "Armadura de Couro"). */
  fullName?: string;
  category: ItemCategory;
  /** Preço em moedas (texto, ex.: "10 po"). */
  price: string;
  /** Peso (texto, ex.: "1,5 kg"). Omitido quando o livro lista "–". */
  weight?: string;
  /** Resumo de 1 linha: dano + propriedades (armas), CA + requisitos (armaduras),
   *  conteúdo (pacotes) ou utilidade (demais). */
  detail: string;
  /** Texto completo do livro quando o item tem regra própria. */
  description?: string;
  /** Armas: dado de dano (ex. "1d8"). */
  damage?: string;
  /** Armas: tipo de dano ("cortante", "perfurante", "concussão"). */
  damageType?: string;
  /** Armas: propriedades (ex. "Versátil (1d10)"). */
  properties?: string[];
  /** Armaduras/escudos: CA (ex. "12 + Des (máx. +2)" ou "+2"). */
  ac?: string;
  /** Armaduras: CA base numérica (11, 14, 18…). Escudos: bônus (+1, +2, +3). */
  acBase?: number;
  /** Armaduras: teto do modificador de Destreza somado (0 = não soma; ausente = sem teto). */
  maxDex?: number;
  /** Armaduras/escudos: Força mínima; abaixo dela o deslocamento cai 3 m. */
  strengthRequirement?: number;
  /** Armaduras/escudos: impõe desvantagem em testes de Destreza (Furtividade). */
  stealthDisadvantage?: boolean;
  /** Pacotes: itens contidos, com quantidade. */
  contents?: string[];
  /** Livro de origem; omitido para o Livro do Jogador. */
  source?: SourceBook;
};

// ---------------------------------------------------------------------------
// Helpers de autoria (mantêm as entradas curtas)
// ---------------------------------------------------------------------------

type WeaponSpec = [
  name: string,
  price: string,
  damage: string | null,
  damageType: string | null,
  weight: string | null,
  properties: string[],
  description?: string,
];

function weapon(category: "Arma simples" | "Arma marcial", spec: WeaponSpec): CatalogItem {
  const [name, price, damage, damageType, weight, properties, description] = spec;
  const dmg = damage ? `${damage} ${damageType}` : "—";
  const item: CatalogItem = {
    name,
    category,
    price,
    detail: properties.length ? `${dmg} · ${properties.join(", ")}` : dmg,
    properties,
  };
  if (weight) item.weight = weight;
  if (damage) item.damage = damage;
  if (damageType) item.damageType = damageType;
  if (description) item.description = description;
  return item;
}

type ArmorSpec = [
  name: string,
  price: string,
  ac: string,
  strength: string | null,
  stealthDisadvantage: boolean,
  weight: string,
  description: string,
];

/** Nome completo das armaduras: a tabela do livro lista só o qualificador ("Couro"). */
const ARMOR_FULL_NAMES: Record<string, string> = {
  "Acolchoada": "Armadura Acolchoada",
  "Couro": "Armadura de Couro",
  "Couro Batido": "Armadura de Couro Batido",
  "Gibão de Peles": "Gibão de Peles",
  "Camisão de Malha": "Camisão de Malha",
  "Brunea": "Brunea (armadura de escamas)",
  "Peitoral": "Armadura Peitoral",
  "Meia-Armadura": "Meia-Armadura",
  "Cota de Anéis": "Cota de Anéis",
  "Cota de Malha": "Cota de Malha",
  "Cota de Talas": "Cota de Talas",
  "Placas": "Armadura de Placas",
};

/** "11 + Des" -> base 11 sem teto; "14 + Des (máx. +2)" -> base 14, teto 2; "16" -> base 16, teto 0. */
function parseArmorAc(ac: string): { base: number; maxDex?: number } {
  const base = Number(/^\s*(\d+)/.exec(ac)?.[1] ?? 10);
  if (!/\+\s*Des/i.test(ac)) return { base, maxDex: 0 };
  const cap = /m[áa]x\.?\s*\+?(\d+)/i.exec(ac)?.[1];
  return cap ? { base, maxDex: Number(cap) } : { base };
}

function armor(
  category: "Armadura leve" | "Armadura média" | "Armadura pesada",
  spec: ArmorSpec,
): CatalogItem {
  const [name, price, ac, strength, stealth, weight, description] = spec;
  const parts = [`CA ${ac}`];
  if (strength) parts.push(strength);
  if (stealth) parts.push("Furtividade em desvantagem");
  const { base, maxDex } = parseArmorAc(ac);
  const item: CatalogItem = {
    name,
    fullName: ARMOR_FULL_NAMES[name] ?? `Armadura de ${name}`,
    category,
    price,
    weight,
    ac,
    acBase: base,
    detail: parts.join(" · "),
    description,
  };
  if (maxDex !== undefined) item.maxDex = maxDex;
  if (strength) item.strengthRequirement = Number(/(\d+)/.exec(strength)?.[1] ?? 0);
  if (stealth) item.stealthDisadvantage = true;
  return item;
}

type GearSpec = [name: string, price: string, weight: string | null, detail: string, description?: string];

function gear(category: ItemCategory, spec: GearSpec): CatalogItem {
  const [name, price, weight, detail, description] = spec;
  const item: CatalogItem = { name, category, price, detail };
  if (weight) item.weight = weight;
  if (description) item.description = description;
  return item;
}

// ---------------------------------------------------------------------------
// Textos de regra reutilizados
// ---------------------------------------------------------------------------

const LANCA_MONTARIA_DESC =
  "Você tem desvantagem quando usar a lança de montaria para atacar um alvo a até 1,5 metro de você. Além disso, uma lança de montaria requer as duas mãos para ser empunhada quando você não está em uma montaria.";

const REDE_DESC =
  "Uma criatura Grande ou menor atingida por uma rede fica impedida até se libertar. Uma rede não afeta criaturas que não possuam uma forma definida, ou criaturas Enormes ou maiores. A criatura pode usar sua ação para realizar um teste de Força CD 10 para se libertar, ou outra criatura dentro do alcance que obtiver sucesso no teste pode fazer isso por ela. Causar 5 de dano cortante à rede (CA 10) também liberta a criatura sem feri-la, encerrando o efeito e destruindo a rede. Quando você usa uma ação, ação bônus ou reação para atacar com a rede, você pode realizar apenas um ataque, independentemente do número de ataques que você possa realizar normalmente.";

const ARMADURA_PESADA_NOTA =
  "Armadura pesada: não adiciona o modificador de Destreza à CA (nem penaliza se for negativo). Se o usuário não tiver a Força mínima listada, seu deslocamento é reduzido em 3 metros.";

const MUNICAO_DESC =
  "Você pode usar uma arma com a propriedade munição para realizar um ataque à distância apenas se possuir munição para dispará-la. Cada ataque gasta uma peça de munição; sacá-la de uma aljava, bolsa ou outro recipiente faz parte do ataque. No fim da batalha, você pode recuperar metade da munição gasta se tiver um minuto para procurar pelo campo de batalha.";

const FOCO_ARCANO_DESC =
  "Um foco arcano é um item especial – um orbe, um cristal, um bastão, um cajado especialmente construído, uma varinha de madeira, ou algum item semelhante – projetado para canalizar o poder de magias arcanas. Um feiticeiro, bruxo ou mago pode usá-lo como um foco de conjuração, conforme descrito no capítulo 10.";

const FOCO_DRUIDICO_DESC =
  "Um foco druídico pode ser um ramo de visco ou azevinho, uma varinha ou cetro de teixo ou de outra madeira especial, um cajado esculpido de uma árvore viva, ou um totem adornado com penas, peles, ossos e dentes de animais sagrados. Um druida pode usar tal objeto como um foco de conjuração, conforme descrito no capítulo 10.";

const SIMBOLO_SAGRADO_DESC =
  "Um símbolo sagrado é a representação de uma divindade ou um panteão. Pode ser um amuleto com o símbolo de uma divindade, um símbolo talhado cuidadosamente ou encrustado como um emblema em um escudo, ou até mesmo uma caixa pequena que guarda um fragmento de uma relíquia sagrada. Um clérigo ou paladino pode usar um símbolo sagrado como um foco de conjuração. Para usá-lo dessa forma, o conjurador precisa segurá-lo em uma mão, usá-lo visivelmente ou ostentá-lo em seu escudo.";

const FERRAMENTA_ARTESAO_DESC =
  "Ferramentas de artesão incluem os itens necessários para executar um ofício ou profissão. Proficiência com um conjunto de ferramentas de artesão permite adicionar o bônus de proficiência a quaisquer testes de habilidade que você fizer usando as ferramentas do seu ofício. Cada tipo de ferramenta de artesão requer uma proficiência em separado.";

const KIT_JOGO_DESC =
  "Esse item abrange uma ampla gama de peças de jogo, incluindo dados e baralhos de cartas. Se você for proficiente com um conjunto de jogos, pode adicionar seu bônus de proficiência nos testes de habilidade que realizar usando esse conjunto. Cada tipo de conjunto de jogo exige uma proficiência em separado.";

const INSTRUMENTO_DESC =
  "Se você possuir proficiência com um determinado instrumento musical, você pode adicionar seu bônus de proficiência a quaisquer testes de habilidade que fizer para tocar música com o instrumento. Cada tipo de instrumento musical exige uma proficiência em separado. Um bardo pode usar um instrumento musical como foco de conjuração.";

const CORDA_DESC =
  "A corda é feita de cânhamo ou de seda, tem 2 pontos de vida e pode ser arrebentada com um teste de Força CD 17 bem sucedido.";

// ---------------------------------------------------------------------------
// Armas (PHB p151)
// ---------------------------------------------------------------------------

const SIMPLE_MELEE: WeaponSpec[] = [
  ["Adaga", "2 po", "1d4", "perfurante", "0,5 kg", ["Acuidade", "Leve", "Arremesso (6/18 m)"]],
  ["Azagaia", "5 pp", "1d6", "perfurante", "1 kg", ["Arremesso (9/36 m)"]],
  ["Bordão", "2 pp", "1d6", "concussão", "2 kg", ["Versátil (1d8)"]],
  ["Clava Grande", "2 pp", "1d8", "concussão", "5 kg", ["Pesada", "Duas mãos"]],
  ["Foice Curta", "1 po", "1d4", "cortante", "1 kg", ["Leve"]],
  ["Lança", "1 po", "1d6", "perfurante", "1,5 kg", ["Arremesso (6/18 m)", "Versátil (1d8)"]],
  ["Maça", "5 po", "1d6", "concussão", "2 kg", []],
  ["Machadinha", "5 po", "1d6", "cortante", "1 kg", ["Leve", "Arremesso (6/18 m)"]],
  ["Martelo Leve", "2 po", "1d4", "concussão", "1 kg", ["Leve", "Arremesso (6/18 m)"]],
  ["Porrete", "1 pp", "1d4", "concussão", "1 kg", ["Leve"]],
];

const SIMPLE_RANGED: WeaponSpec[] = [
  ["Arco Curto", "25 po", "1d6", "perfurante", "1 kg", ["Munição (24/96 m)", "Duas mãos"]],
  ["Besta Leve", "25 po", "1d8", "perfurante", "2,5 kg", ["Munição (24/96 m)", "Recarga", "Duas mãos"]],
  ["Dardo", "5 pc", "1d4", "perfurante", "0,1 kg", ["Acuidade", "Arremesso (6/18 m)"]],
  ["Funda", "1 pp", "1d4", "concussão", null, ["Munição (9/36 m)"]],
];

const MARTIAL_MELEE: WeaponSpec[] = [
  ["Alabarda", "20 po", "1d10", "cortante", "3 kg", ["Pesada", "Alcance", "Duas mãos"]],
  ["Cimitarra", "25 po", "1d6", "cortante", "1,5 kg", ["Acuidade", "Leve"]],
  ["Chicote", "2 po", "1d4", "cortante", "1,5 kg", ["Acuidade", "Alcance"]],
  ["Espada Curta", "10 po", "1d6", "perfurante", "1 kg", ["Acuidade", "Leve"]],
  ["Espada Grande", "50 po", "2d6", "cortante", "3 kg", ["Pesada", "Duas mãos"]],
  ["Espada Longa", "15 po", "1d8", "cortante", "1,5 kg", ["Versátil (1d10)"]],
  ["Glaive", "20 po", "1d10", "cortante", "3 kg", ["Pesada", "Alcance", "Duas mãos"]],
  ["Lança de Montaria", "10 po", "1d12", "perfurante", "3 kg", ["Alcance", "Especial"], LANCA_MONTARIA_DESC],
  ["Lança Longa", "5 po", "1d10", "perfurante", "4 kg", ["Pesada", "Alcance", "Duas mãos"]],
  ["Maça Estrela", "15 po", "1d8", "perfurante", "2 kg", []],
  ["Machado Grande", "30 po", "1d12", "cortante", "3,5 kg", ["Pesada", "Duas mãos"]],
  ["Machado de Batalha", "10 po", "1d8", "cortante", "2 kg", ["Versátil (1d10)"]],
  ["Malho", "10 po", "2d6", "concussão", "5 kg", ["Pesada", "Duas mãos"]],
  ["Mangual", "10 po", "1d8", "concussão", "1 kg", []],
  ["Martelo de Guerra", "15 po", "1d8", "concussão", "1 kg", ["Versátil (1d10)"]],
  ["Picareta de Guerra", "5 po", "1d8", "perfurante", "1 kg", []],
  ["Rapieira", "25 po", "1d8", "perfurante", "1 kg", ["Acuidade"]],
  ["Tridente", "5 po", "1d6", "perfurante", "2 kg", ["Arremesso (6/18 m)", "Versátil (1d8)"]],
];

const MARTIAL_RANGED: WeaponSpec[] = [
  ["Arco Longo", "50 po", "1d8", "perfurante", "1 kg", ["Munição (45/180 m)", "Pesada", "Duas mãos"]],
  ["Besta de Mão", "75 po", "1d6", "perfurante", "1,5 kg", ["Munição (9/36 m)", "Leve", "Recarga"]],
  ["Besta Pesada", "50 po", "1d10", "perfurante", "4,5 kg", ["Munição (30/120 m)", "Pesada", "Recarga", "Duas mãos"]],
  ["Rede", "1 po", null, null, "1,5 kg", ["Especial", "Arremesso (1,5/4,5 m)"], REDE_DESC],
  ["Zarabatana", "10 po", "1", "perfurante", "0,5 kg", ["Munição (7,5/30 m)", "Recarga"]],
];

// ---------------------------------------------------------------------------
// Armaduras e escudos (PHB p147)
// ---------------------------------------------------------------------------

const LIGHT_ARMOR: ArmorSpec[] = [
  ["Acolchoada", "5 po", "11 + Des", null, true, "4 kg", "A armadura acolchoada consiste em camadas de panos acolchoados e batidos."],
  ["Couro", "10 po", "11 + Des", null, false, "5 kg", "O peitoral e as ombreiras da armadura de couro são feitos de couro que foi endurecido após ser fervido em óleo. O resto da armadura é feito de materiais mais macios e mais flexíveis."],
  ["Couro Batido", "45 po", "12 + Des", null, false, "6,5 kg", "Feita de couro resistente, mas flexível, a armadura de couro batido é reforçada com rebites ou cravos."],
];

const MEDIUM_ARMOR: ArmorSpec[] = [
  ["Gibão de Peles", "10 po", "12 + Des (máx. +2)", null, false, "6 kg", "Um gibão de peles é uma armadura bruta consistindo de peles grossas. É comumente usada por tribos bárbaras, humanoides malignos e outros povos que não têm acesso às ferramentas e materiais necessários para criar uma armadura melhor."],
  ["Camisão de Malha", "50 po", "13 + Des (máx. +2)", null, false, "10 kg", "Feito de anéis de metal intercalados, um camisão de cota de malha é usado entre as camadas de roupa. Essa armadura oferece proteção modesta para a parte superior do corpo e permite que o som dos anéis de metal seja amortecido pelas camadas exteriores."],
  ["Brunea", "50 po", "14 + Des (máx. +2)", null, true, "22,5 kg", "Essa armadura consiste em um casaco e calças (e talvez uma saia separada) de couro coberto com peças sobrepostas de metal, assim como as escamas de peixe. O conjunto inclui manoplas."],
  ["Peitoral", "400 po", "14 + Des (máx. +2)", null, false, "10 kg", "A armadura peitoral é constituída por um peitoral de metal usado com couro flexível em seu interior. Embora deixe as pernas e braços relativamente desprotegidos, fornece boa proteção para os órgãos vitais, deixando quem a usa relativamente sem restrições."],
  ["Meia-Armadura", "750 po", "15 + Des (máx. +2)", null, true, "20 kg", "Essa armadura é composta de placas de metal moldadas que cobrem a maior parte do corpo. Ela não inclui proteção para as pernas além de caneleiras fixadas com tiras de couro."],
];

const HEAVY_ARMOR: ArmorSpec[] = [
  ["Cota de Anéis", "30 po", "14", null, true, "20 kg", `Esta armadura é feita de couro com pesados anéis presos a ela. Os anéis ajudam a reforçar a armadura contra golpes de espadas e machados. A cota de anéis é inferior à cota de malha e geralmente é vestida apenas por aqueles que não podem pagar por uma armadura melhor. ${ARMADURA_PESADA_NOTA}`],
  ["Cota de Malha", "75 po", "16", "For 13", true, "27,5 kg", `Feita de anéis de metal entrelaçados, a cota de malha inclui uma camada de tecido acolchoado usada por baixo da malha de metal para evitar atrito e amortecer o impacto dos golpes. O conjunto inclui manoplas. ${ARMADURA_PESADA_NOTA}`],
  ["Cota de Talas", "200 po", "17", "For 15", true, "30 kg", `Essa armadura é feita de tiras verticais de metal, rebitadas a um suporte de couro, usadas sobre um preenchimento de pano. Cotas de malha flexíveis protegem as articulações. ${ARMADURA_PESADA_NOTA}`],
  ["Placas", "1.500 po", "18", "For 15", true, "32,5 kg", `A armadura de placas consiste em placas de metal moldadas para cobrir todo o corpo. Inclui luvas, botas de couro pesadas, um capacete com viseira e espessas camadas de enchimento por baixo da armadura. Fivelas e tiras de couro distribuem o peso ao longo do corpo. ${ARMADURA_PESADA_NOTA}`],
];

const SHIELDS: CatalogItem[] = [
  {
    name: "Escudo",
    category: "Escudo",
    price: "10 po",
    weight: "3 kg",
    ac: "+2",
    acBase: 2,
    detail: "CA +2",
    description:
      "Um escudo é feito de madeira ou metal e é usado com uma mão. Empunhar um escudo aumenta sua Classe de Armadura em 2. Você só pode se beneficiar de um escudo por vez. Vestir ou remover um escudo leva 1 ação.",
  },
  {
    name: "Broquel",
    category: "Escudo",
    price: "5 po",
    weight: "0,9 kg",
    ac: "+1",
    acBase: 1,
    detail: "CA +1 · Especial: ocupa uma mão; perde o bônus ao conjurar com essa mão",
    description:
      "Pequeno e leve, cobre menos área mas dá mais liberdade à mão. Enquanto equipado, não impede um conjurador de usar componentes somáticos, mas você perde o bônus de CA do broquel até o início do seu próximo turno ao conjurar uma magia com essa mão. Conteúdo homebrew (escudos expandidos), não oficial.",
    source: "Homebrew",
  },
  {
    name: "Escudo de Torre",
    category: "Escudo",
    price: "50 po",
    weight: "6,75 kg",
    ac: "+3",
    acBase: 3,
    strengthRequirement: 13,
    stealthDisadvantage: true,
    detail: "CA +3 · For 13 · Furtividade em desvantagem",
    description:
      "Enorme e pesado, permite ao portador defender melhor quem está atrás dele ao avançar. Depois de mover metade do seu deslocamento, você pode gastar o deslocamento restante para o escudo funcionar como meia-cobertura para você e para qualquer aliado diretamente atrás de você em relação à direção do ataque inimigo, até o início do seu próximo turno. Essa cobertura não permite usar a ação de Esconder-se. Requer Força 13 e impõe desvantagem em Destreza (Furtividade). Conteúdo homebrew (escudos expandidos), não oficial.",
    source: "Homebrew",
  },
];

// ---------------------------------------------------------------------------
// Munição (PHB p152)
// ---------------------------------------------------------------------------

const AMMUNITION: GearSpec[] = [
  ["Flechas (20)", "1 po", "0,5 kg", "Munição para arco curto e arco longo; uma aljava guarda até 20 flechas"],
  ["Virotes (20)", "1 po", "0,75 kg", "Munição para bestas; um porta-virotes guarda até 20 virotes"],
  ["Agulhas de Zarabatana (50)", "1 po", "0,5 kg", "Munição para zarabatana; uma algibeira guarda até 50 agulhas"],
  ["Balas de Funda (20)", "4 pc", "0,75 kg", "Munição para funda; uma algibeira guarda até 20 balas"],
];

// ---------------------------------------------------------------------------
// Pacotes de equipamento (PHB p153)
// ---------------------------------------------------------------------------

const PACKS: CatalogItem[] = [
  {
    name: "Pacote de Artista",
    category: "Pacote",
    price: "40 po",
    detail: "Mochila, saco de dormir, 2 fantasias, 5 velas, 5 dias de rações, cantil e kit de disfarce",
    contents: ["Mochila", "Saco de dormir", "2 fantasias (roupas de entretenimento)", "5 velas", "5 dias de rações de viagem", "Cantil", "Kit de disfarce"],
  },
  {
    name: "Pacote de Assaltante",
    category: "Pacote",
    price: "16 po",
    detail: "Mochila, esferas de metal, linha, sino, 5 velas, pé de cabra, martelo, 10 pítons, lanterna coberta, 2 óleos, 5 dias de rações, caixa de fogo, cantil e 15 m de corda",
    contents: ["Mochila", "Saco com 1.000 esferas de metal", "3 metros de linha", "Sino", "5 velas", "Pé de cabra", "Martelo", "10 pítons", "Lanterna coberta", "2 frascos de óleo", "5 dias de rações de viagem", "Caixa de fogo", "Cantil", "Corda de cânhamo (15 metros)"],
  },
  {
    name: "Pacote de Aventureiro",
    category: "Pacote",
    price: "12 po",
    detail: "Mochila, pé de cabra, martelo, 10 pítons, 10 tochas, caixa de fogo, 10 dias de rações, cantil e 15 m de corda",
    contents: ["Mochila", "Pé de cabra", "Martelo", "10 pítons", "10 tochas", "Caixa de fogo", "10 dias de rações de viagem", "Cantil", "Corda de cânhamo (15 metros)"],
  },
  {
    name: "Pacote de Diplomata",
    category: "Pacote",
    price: "39 po",
    detail: "Baú, 2 porta-mapas, roupas finas, tinta, caneta tinteiro, lâmpada, 2 óleos, 5 folhas de papel, perfume, parafina e sabão",
    contents: ["Baú", "2 porta-mapas ou pergaminhos", "Roupas finas", "Frasco de tinta", "Caneta tinteiro", "Lâmpada", "2 frascos de óleo", "5 folhas de papel", "Frasco de perfume", "Parafina", "Sabão"],
  },
  {
    name: "Pacote de Estudioso",
    category: "Pacote",
    price: "40 po",
    detail: "Mochila, livro de estudo, tinta, caneta tinteiro, 10 folhas de pergaminho, saquinho de areia e faca pequena",
    contents: ["Mochila", "Livro de estudo", "Frasco de tinta", "Caneta tinteiro", "10 folhas de pergaminho", "Saquinho de areia", "Faca pequena"],
  },
  {
    name: "Pacote de Explorador",
    category: "Pacote",
    price: "10 po",
    detail: "Mochila, saco de dormir, kit de refeição, caixa de fogo, 10 tochas, 10 dias de rações, cantil e 15 m de corda",
    contents: ["Mochila", "Saco de dormir", "Kit de refeição", "Caixa de fogo", "10 tochas", "10 dias de rações de viagem", "Cantil", "Corda de cânhamo (15 metros)"],
  },
  {
    name: "Pacote de Sacerdote",
    category: "Pacote",
    price: "19 po",
    detail: "Mochila, cobertor, 10 velas, caixa de fogo, caixa de esmolas, 2 blocos de incenso, incensário, vestes, 2 dias de rações e cantil",
    contents: ["Mochila", "Cobertor", "10 velas", "Caixa de fogo", "Caixa de esmolas", "2 blocos de incenso", "Incensário", "Vestes", "2 dias de rações de viagem", "Cantil"],
  },
];

// ---------------------------------------------------------------------------
// Focos de conjuração (PHB p152, p154–155)
// ---------------------------------------------------------------------------

const FOCI: GearSpec[] = [
  ["Foco Arcano", "5–20 po", null, "Cristal, orbe, bastão, cajado ou varinha — escolha um; foco de conjuração para feiticeiro, bruxo e mago", FOCO_ARCANO_DESC],
  ["Cristal (foco arcano)", "10 po", "0,5 kg", "Foco arcano", FOCO_ARCANO_DESC],
  ["Orbe (foco arcano)", "20 po", "1,5 kg", "Foco arcano", FOCO_ARCANO_DESC],
  ["Bastão (foco arcano)", "10 po", "1 kg", "Foco arcano", FOCO_ARCANO_DESC],
  ["Cajado (foco arcano)", "5 po", "2 kg", "Foco arcano; também serve como bordão", FOCO_ARCANO_DESC],
  ["Varinha (foco arcano)", "10 po", "0,5 kg", "Foco arcano", FOCO_ARCANO_DESC],
  ["Foco Druídico", "1–10 po", null, "Ramo de visco, totem, cajado de madeira ou varinha de teixo — escolha um; foco de conjuração para druida", FOCO_DRUIDICO_DESC],
  ["Ramo de Visco (foco druídico)", "1 po", null, "Foco druídico", FOCO_DRUIDICO_DESC],
  ["Totem (foco druídico)", "1 po", null, "Foco druídico", FOCO_DRUIDICO_DESC],
  ["Cajado de Madeira (foco druídico)", "5 po", "2 kg", "Foco druídico; também serve como bordão", FOCO_DRUIDICO_DESC],
  ["Varinha de Teixo (foco druídico)", "10 po", "0,5 kg", "Foco druídico", FOCO_DRUIDICO_DESC],
  ["Símbolo Sagrado", "5 po", null, "Amuleto, emblema ou relicário — escolha um; foco de conjuração para clérigo e paladino", SIMBOLO_SAGRADO_DESC],
  ["Amuleto (símbolo sagrado)", "5 po", "0,5 kg", "Símbolo sagrado usado no pescoço ou segurado", SIMBOLO_SAGRADO_DESC],
  ["Emblema (símbolo sagrado)", "5 po", null, "Símbolo sagrado ostentado em um escudo ou vestimenta", SIMBOLO_SAGRADO_DESC],
  ["Relicário (símbolo sagrado)", "5 po", "1 kg", "Caixa pequena com um fragmento de relíquia sagrada", SIMBOLO_SAGRADO_DESC],
  ["Bolsa de Componentes", "25 po", "1 kg", "Guarda os componentes materiais sem custo das suas magias", "Trata-se de uma pequena bolsa de couro à prova d'água que pode ser fixada em um cinto. Ela possui compartimentos para armazenar todos os componentes materiais e outros itens especiais que você precisa para lançar suas magias, exceto os componentes que possuem um custo específico (conforme indicado na descrição da magia)."],
  ["Grimório", "50 po", "1,5 kg", "Livro com 100 páginas em branco para registrar magias", "Essencial para os magos, um grimório é um volume encadernado em couro com 100 páginas de pergaminho em branco, adequado para armazenar magias."],
];

// ---------------------------------------------------------------------------
// Ferramentas, kits, jogos e instrumentos (PHB p156)
// ---------------------------------------------------------------------------

const ARTISAN_SPECS: GearSpec[] = [
  ["Ferramentas de Carpinteiro", "8 po", "3 kg", "Ferramentas de artesão"],
  ["Ferramentas de Cartógrafo", "15 po", "3 kg", "Ferramentas de artesão"],
  ["Ferramentas de Costureiro", "1 po", "2,5 kg", "Ferramentas de artesão"],
  ["Ferramentas de Coureiro", "5 po", "2,5 kg", "Ferramentas de artesão"],
  ["Ferramentas de Entalhador", "1 po", "2,5 kg", "Ferramentas de artesão"],
  ["Ferramentas de Ferreiro", "20 po", "4 kg", "Ferramentas de artesão"],
  ["Ferramentas de Funileiro", "50 po", "5 kg", "Ferramentas de artesão"],
  ["Ferramentas de Joalheiro", "25 po", "1 kg", "Ferramentas de artesão"],
  ["Ferramentas de Oleiro", "10 po", "1,5 kg", "Ferramentas de artesão"],
  ["Ferramentas de Pedreiro", "10 po", "4 kg", "Ferramentas de artesão"],
  ["Ferramentas de Pintor", "10 po", "2,5 kg", "Ferramentas de artesão"],
  ["Ferramentas de Sapateiro", "5 po", "2,5 kg", "Ferramentas de artesão"],
  ["Ferramentas de Vidreiro", "30 po", "2,5 kg", "Ferramentas de artesão"],
  ["Suprimentos de Alquimista", "50 po", "4 kg", "Ferramentas de artesão"],
  ["Suprimentos de Cervejeiro", "20 po", "4,5 kg", "Ferramentas de artesão"],
  ["Suprimentos de Caligrafia", "10 po", "2,5 kg", "Ferramentas de artesão"],
  ["Utensílios de Cozinheiro", "1 po", "4 kg", "Ferramentas de artesão"],
];

const OTHER_TOOLS: GearSpec[] = [
  ["Ferramentas de Ladrão", "25 po", "0,5 kg", "Proficiência: desarmar armadilhas e abrir fechaduras", "Esse conjunto de ferramentas inclui uma pequena pasta, um conjunto de chaves mestras, um pequeno espelho montado em uma alça de metal, um conjunto de tesouras de lâminas estreitas e um par de alicates. Proficiência com essas ferramentas permite adicionar o bônus de proficiência a quaisquer testes de habilidade que você fizer para desarmar armadilhas ou abrir fechaduras."],
  ["Ferramentas de Navegação", "25 po", "1 kg", "Proficiência: traçar cursos, seguir cartas náuticas e não se perder no mar", "Esse conjunto de instrumentos é usado para navegação no mar. Proficiência com as ferramentas de navegador permite traçar o curso de um navio e seguir cartas de navegação. Além disso, essas ferramentas permitem que você adicione seu bônus de proficiência a qualquer teste de habilidade que fizer para não se perder no mar."],
];

const GAMING_SPECS: GearSpec[] = [
  ["Baralho de Cartas", "5 pp", null, "Kit de jogo", KIT_JOGO_DESC],
  ["Conjunto de Dados", "1 pp", null, "Kit de jogo", KIT_JOGO_DESC],
  ["Jogo dos Três Dragões", "5 po", null, "Kit de jogo (jogo de cartas)", KIT_JOGO_DESC],
  ["Xadrez do Dragão", "1 po", "0,25 kg", "Kit de jogo (tabuleiro)", KIT_JOGO_DESC],
];

const KITS: GearSpec[] = [
  ["Kit de Disfarce", "25 po", "1,5 kg", "Proficiência: criar disfarces visuais", "Essa bolsa de cosméticos, tintura de cabelo e pequenos adereços permite criar disfarces que mudam sua aparência física. Proficiência com este kit permite adicionar o bônus de proficiência a quaisquer testes de habilidade que você fizer para criar um disfarce visual."],
  ["Kit de Falsificação", "15 po", "2,5 kg", "Proficiência: falsificar documentos físicos", "Essa pequena caixa contém uma variedade de papéis e pergaminhos, canetas e tintas, selos e lacres, folha de ouro e prata, e outros suprimentos necessários para criar falsificações convincentes de documentos físicos. Proficiência com esse kit permite adicionar o bônus de proficiência a quaisquer testes de habilidade que você fizer para criar uma falsificação de um documento físico."],
  ["Kit de Herbalismo", "5 po", "1,5 kg", "Proficiência: identificar/aplicar ervas; necessário para criar antídotos e poções de cura", "Esse kit contém uma variedade de instrumentos, como alicates, almofariz e pilão, e bolsas e frascos utilizados pelos herbalistas para criar remédios e poções. Proficiência com este kit permite adicionar o bônus de proficiência a quaisquer testes de habilidade que você fizer para identificar ou aplicar ervas. Além disso, a proficiência com esse kit é necessária para criar antídotos e poções de cura."],
  ["Kit de Venenos", "50 po", "1 kg", "Proficiência: criar e utilizar venenos", "O kit de venenos inclui os frascos, produtos químicos e outros equipamentos necessários para a criação de venenos. Proficiência com esse kit permite adicionar o bônus de proficiência a quaisquer testes de habilidade que você fizer para criar ou utilizar venenos."],
];

const INSTRUMENT_SPECS: GearSpec[] = [
  ["Alaúde", "35 po", "1 kg", "Instrumento de cordas"],
  ["Flauta", "2 po", "0,5 kg", "Instrumento de sopro"],
  ["Flauta de Pã", "12 po", "1 kg", "Instrumento de sopro"],
  ["Gaita de Foles", "30 po", "3 kg", "Instrumento de sopro"],
  ["Lira", "30 po", "1 kg", "Instrumento de cordas"],
  ["Oboé", "2 po", "0,5 kg", "Instrumento de sopro"],
  ["Tambor", "6 po", "1,5 kg", "Instrumento de percussão"],
  ["Trombeta", "3 po", "1 kg", "Instrumento de sopro"],
  ["Violino", "30 po", "3 kg", "Instrumento de cordas"],
  ["Xilofone", "25 po", "5 kg", "Instrumento de percussão"],
];

// ---------------------------------------------------------------------------
// Equipamento de aventura (PHB p152, p150–155)
// ---------------------------------------------------------------------------

const ADVENTURING_GEAR: GearSpec[] = [
  ["Ábaco", "2 po", "1 kg", "Instrumento de cálculo com contas deslizantes"],
  ["Ácido (vidro)", "25 po", "0,5 kg", "Arremesso (6 m) como arma improvisada: 2d6 de dano ácido", "Usando uma ação, você pode despejar o conteúdo desse vidro em uma criatura a até 1,5 metro de você, ou arremessar o vidro a até 6 metros de distância, quebrando-o no impacto. Em ambos os casos, você deve realizar um ataque à distância contra uma criatura ou objeto, tratando o ácido como uma arma improvisada. Se acertar, o alvo sofre 2d6 de dano ácido."],
  ["Água Benta (frasco)", "25 po", "0,5 kg", "Arremesso (6 m): 2d6 de dano radiante em corruptores e mortos-vivos", "Usando uma ação, você pode espalhar o conteúdo desse frasco em uma criatura a até 1,5 metro de você ou arremessar a até 6 metros, quebrando o frasco com o impacto. Em ambos os casos, você deve realizar um ataque à distância contra uma criatura alvo, tratando a água benta como uma arma improvisada. Se o alvo for um corruptor ou morto-vivo, ele sofre 2d6 de dano radiante. Um clérigo ou paladino pode criar água benta realizando um ritual especial. O ritual leva 1 hora para ser realizado, consome 25 po de prata em pó e exige que se gaste um espaço de magia de 1º nível."],
  ["Algemas", "2 po", "2 kg", "Prendem criatura Pequena ou Média · Escapar Des CD 20, quebrar For CD 20, abrir com ferramentas de ladrão Des CD 15", "Essas algemas de metal podem prender uma criatura Pequena ou Média. Escapar das algemas exige sucesso em um teste de Destreza CD 20. Quebrá-las exige um teste de Força CD 20 bem sucedido. Cada conjunto de algemas vem com uma chave. Sem a chave, uma criatura proficiente com ferramentas de ladrão pode abrir a fechadura das algemas com um sucesso em um teste de Destreza CD 15. As algemas têm 15 pontos de vida."],
  ["Algibeira", "5 po", "0,5 kg", "Bolsa de pano ou couro; guarda 20 balas de funda ou 50 agulhas de zarabatana", "Uma bolsa de pano ou couro que pode armazenar até 20 munições de funda ou 50 munições de zarabatana, entre outras coisas. Para armazenar componentes de magia, veja bolsa de componentes."],
  ["Aljava", "1 po", "0,5 kg", "Guarda até 20 flechas", "Uma aljava pode guardar até 20 flechas."],
  ["Ampulheta", "25 po", "0,5 kg", "Mede a passagem do tempo"],
  ["Antídoto (vidro)", "50 po", null, "Beber: vantagem em testes de resistência contra veneno por 1 hora", "Uma criatura que beber o líquido desse vidro tem vantagem em testes de resistência contra venenos por 1 hora. O antídoto não confere nenhum benefício para mortos-vivos ou constructos."],
  ["Apito de Advertência", "25 po", "0,5 kg", "Apito de sinalização, audível a grande distância"],
  ["Aríete Portátil", "4 po", "17,5 kg", "+4 em testes de Força para arrombar portas; ajuda concede vantagem", "Você pode usar um aríete portátil para quebrar portas. Ao fazer isso, você ganha um bônus de +4 no teste de Força. Outra criatura pode ajudá-lo a usar o aríete, o que concede vantagem no teste."],
  ["Armadilha de Caça", "5 po", "12,5 kg", "Ação para armar · Des CD 13 ou 1d4 perfurante e preso; For CD 13 para se soltar", "Quando você usa sua ação para armá-la, essa armadilha forma um anel de aço com dentes serrilhados. Eles se fecham quando uma criatura pisa sobre uma placa de pressão no seu centro. A armadilha é fixada por uma pesada corrente em um objeto fixo e imóvel, como uma árvore ou um cravo enterrado no chão. Uma criatura que pisar na placa de pressão deve ser bem sucedida em um teste de resistência de Destreza CD 13 ou sofrerá 1d4 de dano perfurante e para de se mover. Daí em diante, até que a criatura se liberte da armadilha, seu movimento é limitado ao comprimento da corrente (tipicamente 1 metro de comprimento). A criatura presa pode usar sua ação para fazer um teste de Força CD 13 e se libertar, ou outra criatura no alcance pode fazer o teste para libertá-la. Cada fracasso no teste causa 1 de dano perfurante à criatura presa."],
  ["Arpéu", "2 po", "2 kg", "Gancho de ferro para prender cordas em bordas e muralhas"],
  ["Balança de Mercador", "5 po", "1,5 kg", "Balança com pesos de até 1 kg para avaliar metais e bens", "Trata-se de uma pequena balança, pratos e um sortimento adequado de pesos de até 1 kg. Com ela, você pode medir o peso exato de pequenos objetos, como metais preciosos brutos ou bens comerciais, para ajudar a determinar seu valor."],
  ["Balde", "5 pc", "1 kg", "Capacidade: 12 litros ou 15 cm³ de sólidos"],
  ["Barril", "2 po", "35 kg", "Capacidade: 160 litros ou 1,2 m³ de sólidos"],
  ["Baú", "5 po", "12,5 kg", "Capacidade: 3,5 m³ ou 150 kg de equipamentos"],
  ["Caixa de Fogo", "5 pp", "0,5 kg", "Pederneira, isqueiro e pavio · Acender tocha: 1 ação; outro fogo: 1 minuto", "Esse pequeno recipiente detém uma pederneira, isqueiro e um pavio (um pano geralmente seco embebido em óleo) usado para acender uma fogueira. Usá-lo para acender uma tocha – ou qualquer outra coisa exposta a um combustível abundante – leva uma ação. Acender qualquer outro fogo leva 1 minuto."],
  ["Caneca", "2 pc", "0,5 kg", "Capacidade: 500 ml"],
  ["Caneta Tinteiro", "2 pc", null, "Pena para escrever com tinta"],
  ["Cantil", "2 pp", "2,5 kg", "Capacidade: 2 litros"],
  ["Cesto", "4 pp", "1 kg", "Capacidade: 60 cm³ ou 20 kg de equipamentos"],
  ["Cobertor de Inverno", "5 pp", "1,5 kg", "Cobertor grosso para o frio"],
  ["Corda de Cânhamo (15 metros)", "1 po", "5 kg", "2 pontos de vida · Arrebentar: For CD 17", CORDA_DESC],
  ["Corda de Seda (15 metros)", "10 po", "2,5 kg", "2 pontos de vida · Arrebentar: For CD 17 · Mais leve que a de cânhamo", CORDA_DESC],
  ["Corrente (3 metros)", "5 po", "5 kg", "10 pontos de vida · Arrebentar: For CD 20", "Uma corrente possui 10 pontos de vida e pode ser arrebentada com um teste de Força CD 20 bem sucedido."],
  ["Equipamento de Pescaria", "1 po", "2 kg", "Vara, linha de seda, boias, anzóis, chumbadas, iscas e redes", "Este kit inclui uma vara de pesca de madeira, linha de seda, boias de cortiça, anzóis de aço, chumbadas, iscas e redes de pesca."],
  ["Escada (3 metros)", "1 pp", "12,5 kg", "Escada portátil de 3 metros"],
  ["Esferas de Metal (sacola com 1.000)", "1 po", "1 kg", "Ação: cobre quadrado de 3 m · Des CD 10 ou cai; metade do deslocamento evita o teste", "Usando uma ação, você pode despejar essas minúsculas esferas de metal para cobrir a área de um quadrado de 3 metros de lado. A criatura que se mover dentro da área deve ser bem sucedida em um teste de resistência de Destreza CD 10 para não cair no chão. Uma criatura que se mover pela área usando metade do seu deslocamento não precisa fazer o teste de resistência."],
  ["Espelho de Aço", "5 po", "0,25 kg", "Espelho de mão polido"],
  ["Estrepes (bolsa com 20)", "1 po", "1 kg", "Ação: cobre quadrado de 1,5 m · Des CD 15 ou 1 perfurante, para e −3 m de deslocamento", "Usando uma ação, você pode espalhar um único saco de estrepes para cobrir a área de um quadrado de 1,5 metro de lado. Qualquer criatura que entrar na área deve ser bem sucedida em um teste de resistência de Destreza CD 15. Se falhar, para de se mover e sofre 1 de dano perfurante. Até que a criatura recupere pelo menos 1 ponto de vida, seu deslocamento de caminhada é reduzido em 3 metros. Uma criatura que se mover pela área usando metade do seu deslocamento não precisa fazer o teste de resistência."],
  ["Fechadura", "10 po", "0,5 kg", "Vem com chave · Abrir sem chave: ferramentas de ladrão, Des CD 15", "A fechadura vem com chave. Sem a chave, uma criatura proficiente com ferramentas de ladrão pode abrir a fechadura com um sucesso em um teste de Destreza CD 15. O Mestre pode decidir que fechaduras melhores estão disponíveis por preços mais elevados."],
  ["Fogo Alquímico (frasco)", "50 po", "0,5 kg", "Arremesso (6 m): 1d4 de fogo no início de cada turno do alvo até apagar (ação, Des CD 10)", "Esse líquido pegajoso e adesivo inflama em contato com o ar. Usando uma ação, você pode arremessar esse frasco a até 6 metros de distância, quebrando-o com o impacto. Você deve realizar um ataque à distância contra uma criatura ou objeto, tratando o fogo alquímico como uma arma improvisada. Em um sucesso, o alvo sofre 1d4 de dano de fogo no início de cada um de seus turnos. Uma criatura pode terminar esse dano usando sua ação e fazendo um teste de Destreza CD 10 para apagar as chamas."],
  ["Frasco", "2 pc", "1 kg", "Capacidade: 120 ml"],
  ["Garrafa de Vidro", "1 po", "1 kg", "Capacidade: 750 ml"],
  ["Giz (1 peça)", "1 pc", null, "Para marcar paredes e pisos"],
  ["Jarra", "4 pc", "2 kg", "Capacidade: 5 litros"],
  ["Kit de Escalada", "25 po", "6 kg", "Ação para se ancorar: não cai nem sobe mais de 7,5 m do ponto de ancoragem", "Um kit de escalada inclui pítons especiais, botas com solas pontiagudas, luvas e um cinto. Você pode usar o kit de escalada como uma ação para \"ancorar-se\". Quando faz isso, você não pode cair mais de 7,5 metros a partir do ponto onde se ancorou, e não pode subir mais de 7,5 metros de distância desse ponto, sem desfazer a âncora."],
  ["Kit de Primeiros Socorros", "5 po", "1,5 kg", "10 usos · Ação: estabiliza criatura com 0 PV sem teste de Medicina", "Esse kit é uma bolsa de couro contendo ataduras, pomadas e talas. O kit possui material suficiente para dez usos. Usando uma ação, você pode gastar um uso do kit para estabilizar uma criatura que tenha 0 pontos de vida, sem a necessidade de realizar um teste de Sabedoria (Medicina)."],
  ["Kit de Refeição", "2 pp", "0,5 kg", "Caixa de metal com copo e talheres; vira panela e prato", "Essa caixa de metal contém um copo e talheres simples. A caixa se desmonta no meio, um lado pode ser utilizado como uma panela para cozinhar e o outro como um prato ou uma tigela rasa."],
  ["Lâmpada", "5 pp", "0,5 kg", "Luz plena 4,5 m + penumbra 9 m · 6 horas por frasco de óleo", "Uma lâmpada lança luz plena em um raio de 4,5 metros e penumbra por mais 9 metros. Uma vez acesa, a lâmpada queima por 6 horas usando um frasco de óleo (500 ml)."],
  ["Lanterna Coberta", "5 po", "1 kg", "Luz plena 9 m + penumbra 9 m · 6 horas por frasco de óleo · Ação: reduz a penumbra em 1,5 m", "Uma lanterna coberta lança luz plena em um raio de 9 metros e penumbra por mais 9 metros. Uma vez acesa, ela queima por 6 horas usando um frasco de óleo (500 ml). Usando uma ação, você pode abaixar a cobertura, reduzindo a claridade para penumbra em um raio de 1,5 metro."],
  ["Lanterna Furta-Fogo", "10 po", "1 kg", "Luz plena em cone de 18 m + penumbra 18 m · 6 horas por frasco de óleo", "Uma lanterna furta-fogo lança luz plena em um cone de 18 metros e penumbra por mais 18 metros. Uma vez acesa, ela queima por 6 horas usando um frasco de óleo (500 ml)."],
  ["Lente de Aumento", "100 po", null, "Vantagem para avaliar ou inspecionar itens pequenos/detalhados; acende fogo com sol em 5 minutos", "Essa lente permite ver pequenos objetos mais de perto. Ela também é útil como um substituto da pederneira e isqueiro para acender fogo. Usar uma lupa para acender fogo necessita de luz tão brilhante como a luz do sol para focar, um pavio e cerca de 5 minutos. Uma lente de aumento concede vantagem em qualquer teste de habilidade feito para avaliar ou inspecionar um item que é pequeno ou muito detalhado."],
  ["Livro", "25 po", "2,5 kg", "Poesia, relatos, conhecimento de uma área ou diagramas", "Um livro pode conter poesia, relatos históricos, informações relativas a um campo particular de sabedoria, diagramas e notas sobre engenhocas gnômicas, ou qualquer outra coisa que possa ser representada usando texto ou imagens. Um livro com magias é um grimório."],
  ["Luneta", "1.000 po", "0,5 kg", "Amplia objetos até o dobro do tamanho", "Objetos vistos através de uma luneta são ampliados até o dobro do seu tamanho."],
  ["Manto", "1 po", "2 kg", "Capa de viagem"],
  ["Marreta", "2 po", "5 kg", "Martelo pesado de duas mãos para demolição"],
  ["Martelo", "1 po", "1,5 kg", "Martelo de mão, para pítons e pregos"],
  ["Mochila", "2 po", "2,5 kg", "Capacidade: 30 cm³ ou 15 kg de equipamentos; saco de dormir e corda podem ir por fora"],
  ["Óleo (frasco)", "1 pp", "0,5 kg", "Arremesso (6 m): alvo coberto sofre +5 de fogo se queimar em 1 min · No chão: 1,5 m², 2 rodadas, 5 de fogo", "Geralmente vem em um frasco de argila que contém 500 ml. Usando uma ação, você pode espirrar o óleo desse frasco em uma criatura a até 1,5 metro de você ou arremessar a até 6 metros, quebrando-o com o impacto. Você deve realizar um ataque à distância contra uma criatura ou objeto, tratando o óleo como uma arma improvisada. Com um sucesso, o alvo é coberto de óleo. Se o alvo sofrer qualquer dano flamejante antes do óleo secar (depois de 1 minuto), a criatura sofre 5 de dano flamejante adicional pela queima do óleo. Você também pode derramar um frasco de óleo no chão para cobrir uma área de um quadrado de 1,5 metro de lado, desde que a superfície esteja nivelada. Se aceso, o óleo queima por 2 rodadas e causa 5 de dano flamejante a qualquer criatura que entrar na área ou terminar seu turno dentro da área. Uma criatura pode sofrer esse dano apenas uma vez por turno."],
  ["Pá", "2 po", "2,5 kg", "Para cavar"],
  ["Panela de Ferro", "2 po", "5 kg", "Capacidade: 4 litros"],
  ["Papel (uma folha)", "2 pp", null, "Folha de papel"],
  ["Parafina", "5 pp", null, "Cera para lacrar cartas e documentos"],
  ["Pé de Cabra", "2 po", "2,5 kg", "Vantagem em testes de Força onde uma alavanca possa ser aplicada", "Usar um pé de cabra concede vantagem nos testes de Força onde uma alavanca possa ser aplicada."],
  ["Pedra de Amolar", "1 pc", null, "Para afiar lâminas"],
  ["Perfume (frasco)", "5 po", null, "Frasco de perfume"],
  ["Pergaminho (uma folha)", "1 pp", null, "Folha de pergaminho"],
  ["Picareta de Minerador", "2 po", "5 kg", "Para quebrar pedra"],
  ["Píton", "5 pc", null, "Cravo de ferro para fixar cordas"],
  ["Poção de Cura", "50 po", "0,25 kg", "Ação para beber: recupera 2d4 + 2 pontos de vida", "Um personagem que beber o líquido vermelho mágico deste frasco recupera 2d4 + 2 pontos de vida. Beber ou administrar uma poção exige uma ação."],
  ["Porta-Mapas ou Pergaminhos", "1 po", "0,5 kg", "Estojo cilíndrico de couro: 10 folhas de papel ou 5 de pergaminho enroladas", "Esse estojo cilíndrico de couro pode armazenar até 10 folhas de papel enroladas ou 5 folhas de pergaminho enroladas."],
  ["Porta-Virotes", "1 po", "0,5 kg", "Estojo de madeira para até 20 virotes", "Esse estojo de madeira pode armazenar até 20 virotes de besta."],
  ["Pregos de Ferro (10)", "1 po", "2,5 kg", "Pregos de ferro"],
  ["Rações de Viagem (1 dia)", "5 pp", "1 kg", "Alimento desidratado para 1 dia de viagem", "Rações de viagem consistem em alimentos desidratados adequados para viagens longas, incluindo carne seca, frutas secas, bolachas e nozes."],
  ["Robes", "1 po", "2 kg", "Vestes longas"],
  ["Roldana e Polia", "1 po", "2,5 kg", "Permite içar até quatro vezes o peso que você ergueria normalmente", "Um conjunto de roldanas com um cabo entre elas e um gancho para fixar aos objetos, a roldana e polia permitem içar até quatro vezes o peso que você ergueria normalmente."],
  ["Roupas Comuns", "5 pp", "1,5 kg", "Vestimenta comum"],
  ["Roupas de Viajante", "2 po", "2 kg", "Vestimenta resistente para viagens"],
  ["Roupas de Entretenimento", "5 po", "2 kg", "Fantasia/traje de artista"],
  ["Roupas Finas", "15 po", "3 kg", "Vestimenta elegante para a alta sociedade"],
  ["Sabão", "2 pc", null, "Barra de sabão"],
  ["Saco", "1 pc", "0,25 kg", "Capacidade: 30 cm³ ou 13 kg de equipamentos"],
  ["Saco de Dormir", "1 po", "3,5 kg", "Para dormir ao relento"],
  ["Sinete", "5 po", null, "Anel ou selo com brasão pessoal, para lacrar documentos"],
  ["Sino", "1 po", null, "Sino pequeno de mão"],
  ["Tenda para Duas Pessoas", "2 po", "10 kg", "Abrigo simples e portátil que acomoda duas pessoas", "Um abrigo simples e portátil que acomoda duas pessoas."],
  ["Tocha", "1 pc", "0,5 kg", "Luz plena 6 m + penumbra 6 m por 1 hora · Ataque corpo-a-corpo acesa: 1 de fogo", "A tocha queima por 1 hora, fornecendo luz plena em um raio de 6 metros e penumbra por mais 6 metros. Se você realizar um ataque corpo-a-corpo com uma tocha acesa e acertar, causa 1 de dano flamejante."],
  ["Tinta (frasco de 30 ml)", "10 po", null, "Frasco de tinta para escrever"],
  ["Vara (3 metros)", "5 pc", "3,5 kg", "Vara de 3 metros para sondar o caminho"],
  ["Vela", "1 pc", null, "Luz plena 1,5 m + penumbra 1,5 m por 1 hora", "Por uma hora, a vela emana luz plena em um raio de 1,5 metro e penumbra por mais 1,5 metro."],
  ["Veneno Básico (frasco)", "100 po", null, "Ação para aplicar em arma cortante/perfurante ou 3 munições · Con CD 10 ou 1d4 de veneno · Dura 1 minuto", "Você pode usar o veneno contido nesse vidro para cobrir a lâmina de uma arma cortante ou perfurante ou até três peças de munição. Aplicar o veneno leva uma ação. Uma criatura atingida pela arma ou munição envenenada deve obter sucesso em um teste de resistência de Constituição CD 10 ou sofrerá 1d4 de dano de veneno. Uma vez aplicado, o veneno retém sua potência durante 1 minuto antes de secar."],
];

// ---------------------------------------------------------------------------
// Catálogo consolidado
// ---------------------------------------------------------------------------

export const ITEMS_CATALOG: CatalogItem[] = [
  ...SIMPLE_MELEE.map((s) => weapon("Arma simples", s)),
  ...SIMPLE_RANGED.map((s) => weapon("Arma simples", s)),
  ...MARTIAL_MELEE.map((s) => weapon("Arma marcial", s)),
  ...MARTIAL_RANGED.map((s) => weapon("Arma marcial", s)),
  ...LIGHT_ARMOR.map((s) => armor("Armadura leve", s)),
  ...MEDIUM_ARMOR.map((s) => armor("Armadura média", s)),
  ...HEAVY_ARMOR.map((s) => armor("Armadura pesada", s)),
  ...SHIELDS,
  ...AMMUNITION.map((s) => ({ ...gear("Munição", s), description: MUNICAO_DESC })),
  ...PACKS,
  ...FOCI.map((s) => gear("Foco de conjuração", s)),
  ...ARTISAN_SPECS.map((s) => ({ ...gear("Ferramenta", s), description: FERRAMENTA_ARTESAO_DESC })),
  ...OTHER_TOOLS.map((s) => gear("Ferramenta", s)),
  ...GAMING_SPECS.map((s) => gear("Ferramenta", s)),
  ...KITS.map((s) => gear("Kit", s)),
  ...INSTRUMENT_SPECS.map((s) => ({ ...gear("Instrumento musical", s), description: INSTRUMENTO_DESC })),
  ...ADVENTURING_GEAR.map((s) => gear("Equipamento de aventura", s)),
];

export const ITEM_CATEGORY_ORDER: ItemCategory[] = [
  "Arma simples",
  "Arma marcial",
  "Armadura leve",
  "Armadura média",
  "Armadura pesada",
  "Escudo",
  "Munição",
  "Pacote",
  "Foco de conjuração",
  "Ferramenta",
  "Kit",
  "Instrumento musical",
  "Equipamento de aventura",
];

// ---------------------------------------------------------------------------
// Busca por nome
// ---------------------------------------------------------------------------

function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ITEM_INDEX: Map<string, CatalogItem> = new Map(
  ITEMS_CATALOG.map((item) => [normalizeName(item.name), item]),
);

/** Reduz uma forma plural simples ao singular ("adagas" → "adaga", "bordoes" → "bordao"). */
function singularize(s: string): string {
  return s
    .replace(/oes\b/g, "ao")
    .replace(/ais\b/g, "al")
    .replace(/eis\b/g, "el")
    .replace(/res\b/g, "r")
    .replace(/([aeiou])s\b/g, "$1");
}

/**
 * Localiza um item pelo nome, tolerando acentos, maiúsculas, artigo/numeral
 * inicial ("uma adaga", "duas adagas"), prefixo "armadura de" e plural simples.
 */
export function findItem(name: string): CatalogItem | undefined {
  const base = normalizeName(name);
  const noArticle = base.replace(/^(um|uma|dois|duas|o|a|os|as|de|da|do)\s+/, "");
  const noArmor = noArticle.replace(/^armadura( de| da| do)?\s+/, "");
  const roots = [base, noArticle, noArmor];
  const candidates = [...roots, ...roots.map(singularize), ...roots.map((c) => c.replace(/s$/, ""))];
  for (const c of candidates) {
    const hit = ITEM_INDEX.get(c);
    if (hit) return hit;
  }
  return undefined;
}

/** Nome de exibição de um item: o nome completo da armadura quando houver. */
export function itemDisplayName(name: string): string {
  return findItem(name)?.fullName ?? name;
}

const ARMOR_CATEGORIES: ItemCategory[] = ["Armadura leve", "Armadura média", "Armadura pesada"];

/** É uma armadura vestível (não escudo)? */
export function isArmorItem(name: string): boolean {
  const item = findItem(name);
  return !!item && ARMOR_CATEGORIES.includes(item.category);
}

/** É um escudo? */
export function isShieldItem(name: string): boolean {
  return findItem(name)?.category === "Escudo";
}

/** Armaduras vestíveis do catálogo (leve, média e pesada), na ordem do livro. */
export const ARMOR_ITEMS: CatalogItem[] = ITEMS_CATALOG.filter((i) => ARMOR_CATEGORIES.includes(i.category));

/** Escudos do catálogo (oficial + homebrew dos escudos expandidos). */
export const SHIELD_ITEMS: CatalogItem[] = ITEMS_CATALOG.filter((i) => i.category === "Escudo");

// ---------------------------------------------------------------------------
// Listas para escolhas do tipo "qualquer arma simples"
// ---------------------------------------------------------------------------

const names = (specs: WeaponSpec[] | GearSpec[]): string[] => specs.map((s) => s[0]);

/** Armas simples corpo-a-corpo (tabela do PHB). */
export const SIMPLE_MELEE_WEAPONS: string[] = names(SIMPLE_MELEE);
/** Armas marciais corpo-a-corpo (tabela do PHB). */
export const MARTIAL_MELEE_WEAPONS: string[] = names(MARTIAL_MELEE);
/** Todas as armas simples (corpo-a-corpo e à distância). */
export const SIMPLE_WEAPONS: string[] = [...SIMPLE_MELEE_WEAPONS, ...names(SIMPLE_RANGED)];
/** Todas as armas marciais (corpo-a-corpo e à distância). */
export const MARTIAL_WEAPONS: string[] = [...MARTIAL_MELEE_WEAPONS, ...names(MARTIAL_RANGED)];
/** Instrumentos musicais da tabela Ferramentas. */
export const MUSICAL_INSTRUMENTS: string[] = names(INSTRUMENT_SPECS);
/** Ferramentas de artesão da tabela Ferramentas. */
export const ARTISAN_TOOLS: string[] = names(ARTISAN_SPECS);
/** Kits de jogo da tabela Ferramentas. */
export const GAMING_SETS: string[] = names(GAMING_SPECS);
