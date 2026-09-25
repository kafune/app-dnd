/**
 * Áreas de efeito das magias e habilidades, para desenhar em escala no mapa.
 *
 * Revisão feita sobre o catálogo de magias (PHB, Xanathar, Tasha) e as
 * características de classe/raça em PT-BR. Cada entrada diz a forma (PHB cap. 10),
 * as dimensões em metros e de onde a área parte:
 *
 *  - `origin: "self"`  — sai do conjurador (cone, linha, aura). No mapa, a forma
 *    fica presa ao token do personagem: só dá para girar o personagem.
 *  - `origin: "point"` — o conjurador escolhe um ponto dentro do alcance. No mapa
 *    a forma pode ser arrastada; o alcance vem do catálogo (`range`).
 *
 * Duas categorias, separadas de propósito:
 *  - área FIXA: o livro dá o tamanho ("esfera de 6 metros de raio");
 *  - área REGULÁVEL (`adjustable`): o texto diz "até X metros" ou a área cresce
 *    com o espaço de magia — o jogador digita o tamanho que quer.
 */
import type { ShapeKind } from "@/lib/map";

export type AreaDimension = "radius" | "length" | "side";

export type SpellArea = {
  kind: ShapeKind;
  radius?: number;
  length?: number;
  width?: number;
  side?: number;
  /** Cubo/quadrado centrado na origem (default: apoiado na origem quando `self`, centrado quando `point`). */
  centered?: boolean;
  origin: "self" | "point";
  /** A dimensão que o jogador regula, com os limites do texto. */
  adjustable?: { dimension: AreaDimension; min: number; max: number; step?: number };
  note?: string;
};

export type AreaCategory = "fixa" | "regulavel";

export const AREA_CATEGORY_LABELS: Record<AreaCategory, string> = {
  fixa: "Área fixa",
  regulavel: "Área regulável (\"até X metros\")",
};

export const areaCategory = (area: SpellArea): AreaCategory => (area.adjustable ? "regulavel" : "fixa");

const sphere = (radius: number, origin: SpellArea["origin"], note?: string): SpellArea => ({
  kind: "esfera",
  radius,
  origin,
  ...(note ? { note } : {}),
});
const cylinder = (radius: number, note?: string): SpellArea => ({ kind: "cilindro", radius, origin: "point", ...(note ? { note } : {}) });
const cube = (side: number, origin: SpellArea["origin"], note?: string): SpellArea => ({
  kind: "cubo",
  side,
  origin,
  centered: origin === "point",
  ...(note ? { note } : {}),
});
const square = (side: number, note?: string): SpellArea => ({ kind: "quadrado", side, origin: "point", centered: true, ...(note ? { note } : {}) });
const cone = (length: number, origin: SpellArea["origin"] = "self", note?: string): SpellArea => ({
  kind: "cone",
  length,
  origin,
  ...(note ? { note } : {}),
});
const line = (length: number, width: number, origin: SpellArea["origin"] = "self", note?: string): SpellArea => ({
  kind: "linha",
  length,
  width,
  origin,
  ...(note ? { note } : {}),
});
/** Muralhas e afins: "até X metros de comprimento". */
const wall = (max: number, width: number, note?: string): SpellArea => ({
  kind: "linha",
  length: max,
  width,
  origin: "point",
  adjustable: { dimension: "length", min: 1.5, max },
  ...(note ? { note } : {}),
});

/** Nome da magia (igual ao catálogo) → área. */
export const SPELL_AREAS: Record<string, SpellArea> = {
  // --- Truques ---
  "Golpe Trovejante": sphere(1.5, "self", "Cada criatura a até 1,5 m de você."),
  "Palavra do Esplendor": sphere(1.5, "self", "Criaturas à sua escolha a até 1,5 m de você."),
  "Criar Fogueira": cube(1.5, "point"),

  // --- 1º círculo ---
  "Beberagem Cáustica de Tasha": line(9, 1.5),
  "Braços de Hadar": sphere(3, "self"),
  "Constrição": square(6),
  "Criar ou Destruir Água": {
    kind: "cubo",
    side: 9,
    origin: "point",
    centered: true,
    adjustable: { dimension: "side", min: 9, max: 21 },
    note: "Cubo de 9 m; +1,5 m de lado para cada nível do espaço acima do 1º.",
  },
  "Faca de Gelo": sphere(1.5, "point", "Explode ao redor do alvo."),
  "Fogo das Fadas": cube(6, "point"),
  "Leque Cromático": cone(4.5),
  "Mãos Flamejantes": cone(4.5),
  "Névoa Obscurecente": sphere(6, "point"),
  "Onda Trovejante": cube(4.5, "self"),
  "Purificar Alimentos": sphere(1.5, "point"),
  "Sono": sphere(6, "point"),
  "Tremor de Terra": sphere(3, "self"),
  "Área Escorregadia": square(3),

  // --- 2º círculo ---
  "Acalmar Emoções": sphere(6, "point"),
  "Bafo de Dragão": cone(4.5, "self", "Quem recebe a magia exala o cone."),
  "Chuva de Bolas de Neve de Snilloc": sphere(1.5, "point"),
  "Crescer Espinhos": square(6),
  "Despedaçar": sphere(3, "point"),
  "Escuridão": sphere(4.5, "point"),
  "Esfera Flamejante": sphere(1.5, "point", "Quem termina o turno a até 1,5 m da esfera."),
  "Lufada de Vento": line(18, 3),
  "Nuvem de Adagas": cube(1.5, "point"),
  "Pirotecnia": sphere(3, "point", "Fogos: cegueira a até 3 m. Fumaça: nuvem de 6 m de raio."),
  "Queimadura de Aganazzar": line(9, 1.5),
  "Raio Lunar": cylinder(1.5, "Cilindro de 12 m de altura."),
  "Silêncio": sphere(6, "point"),
  "Teia": cube(6, "point"),
  "Vento Protetor": sphere(3, "self"),
  "Zona da Verdade": sphere(4.5, "point"),

  // --- 3º círculo ---
  "Ampliar Plantas": sphere(30, "point", "Crescimento excessivo: 30 m de raio."),
  "Aura de Vitalidade": sphere(9, "self"),
  "Bola de Fogo": sphere(6, "point"),
  "Conjurar Rajada": cone(18),
  "Convocar Relâmpagos": sphere(1.5, "point", "O raio atinge a até 1,5 m do ponto; a nuvem tem 18 m de raio."),
  "Círculo Mágico": cylinder(3, "Cilindro de 6 m de altura."),
  "Erupção de Terra": cube(6, "point"),
  "Flecha Relampejante": sphere(3, "point", "Ao redor do alvo da flecha."),
  "Fome de Hadar": sphere(6, "point"),
  "Glifo de Vigilância": sphere(6, "point", "Runas explosivas: esfera centrada no glifo."),
  "Lentidão": cube(12, "point"),
  "Luz do Dia": sphere(18, "point"),
  "Manto do Cruzado": sphere(9, "self"),
  "Maremoto": {
    kind: "linha",
    length: 9,
    width: 3,
    origin: "point",
    adjustable: { dimension: "length", min: 1.5, max: 9 },
    note: "Até 9 m de comprimento, 3 m de largura e 3 m de altura.",
  },
  "Medo": cone(9),
  "Meteoros Momentâneos de Melf": sphere(1.5, "point", "Cada meteoro explode a até 1,5 m do ponto."),
  "Muralha de Areia": wall(9, 3, "Até 9 m de largura, 3 m de altura e 3 m de espessura."),
  "Muralha de Vento": wall(15, 0.3, "Até 15 m de comprimento, 4,5 m de altura e 30 cm de espessura."),
  "Muralha de Água": wall(9, 0.3, "Até 9 m de largura, ou um anel de 6 m de diâmetro."),
  "Nevasca": cylinder(12, "Cilindro de 6 m de altura."),
  "Névoa Fétida": sphere(6, "point"),
  "Padrão Hipnótico": cube(9, "point"),
  "Pequena Cabana de Leomund": sphere(3, "self", "Domo de 3 m de raio ao seu redor."),
  "Relâmpago": line(30, 1.5),

  // --- 4º círculo ---
  "Aura de Pureza": sphere(9, "self"),
  "Aura de Vida": sphere(9, "self"),
  "Confusão": {
    kind: "esfera",
    radius: 3,
    origin: "point",
    adjustable: { dimension: "radius", min: 3, max: 10.5 },
    note: "3 m de raio; +1,5 m para cada nível do espaço acima do 4º.",
  },
  "Controlar a Água": cube(30, "point"),
  "Esfera Aquosa": sphere(3, "point"),
  "Esfera Cáustica": sphere(6, "point"),
  "Guardião da Fé": sphere(3, "point", "Quem entra a até 3 m do guardião."),
  "Muralha de Fogo": wall(18, 0.3, "Até 18 m de comprimento, ou um anel de 6 m de diâmetro. Queima a até 3 m de um dos lados."),
  "Resplendor Enjoativo": sphere(9, "point"),
  "Santuário Particular de Mordenkainen": {
    kind: "cubo",
    side: 30,
    origin: "point",
    centered: true,
    adjustable: { dimension: "side", min: 1.5, max: 30 },
    note: "Cubo de 1,5 m a 30 m de lado.",
  },
  "Sombra de Transtorno": sphere(3, "self"),
  "Esfera Tempestuosa": sphere(6, "point", "Terreno difícil; relâmpagos a até 18 m do centro."),
  "Tempestade de Gelo": cylinder(6, "Cilindro de 12 m de altura."),
  "Tentáculos Negros de Evard": square(6),
  "Terreno Alucinógeno": cube(45, "point"),

  // --- 5º círculo ---
  "Aurora": cylinder(9, "Cilindro de 12 m de altura."),
  "Coluna de Chamas": cylinder(3, "Cilindro de 12 m de altura."),
  "Cone de Frio": cone(18),
  "Conjurar Saraivada": cylinder(12, "Cilindro de 6 m de altura."),
  "Consagrar": {
    kind: "esfera",
    radius: 18,
    origin: "point",
    adjustable: { dimension: "radius", min: 1.5, max: 18 },
    note: "Área de até 18 m de raio.",
  },
  "Controlar Os Ventos": cube(30, "point"),
  "Curar Ferimentos em Massa": sphere(9, "point"),
  "Círculo de Poder": sphere(9, "self"),
  "Cúpula Antivida": sphere(3, "self"),
  "Estática Sináptica": sphere(6, "point"),
  "Muralha de Energia": wall(30, 0.3, "Dez painéis de 3 m × 3 m, ou um domo/esfera de até 3 m de raio."),
  "Muralha de Pedra": wall(30, 0.3, "Dez painéis de 3 m × 3 m (15 cm de espessura)."),
  "Névoa Mortal": sphere(6, "point"),
  "Onda Destrutiva": sphere(9, "self"),
  "Parede de Luz": wall(18, 1.5, "Até 18 m de comprimento, 3 m de altura e 1,5 m de espessura."),
  "Praga de Insetos": sphere(6, "point"),
  "Redemoinho": sphere(9, "point"),
  "Ira da Natureza": cube(18, "point"),
  "Transmutar Pedra": cube(12, "point"),

  // --- 6º círculo ---
  "Barreira de Lâminas": wall(30, 1.5, "Até 30 m de comprimento, ou um anel de até 18 m de diâmetro."),
  "Bosque de Druida": {
    kind: "cubo",
    side: 9,
    origin: "point",
    centered: true,
    adjustable: { dimension: "side", min: 9, max: 27 },
    note: "Cubo de 9 m a 27 m de lado.",
  },
  "Círculo da Morte": sphere(18, "point"),
  "Esfera Congelante de Otiluke": sphere(18, "point"),
  "Globo de Invulnerabilidade": sphere(3, "self"),
  "Manto de Chamas": line(4.5, 1.5, "self", "Linha de fogo com a ação; queima quem chega a 1,5 m de você."),
  "Manto de Gelo": cone(4.5, "self", "Cone de vento gélido com a ação; terreno difícil a 3 m de você."),
  "Manto de Pedra": sphere(4.5, "self", "Terremoto com a ação, centrado em você."),
  "Manto de Vento": cube(4.5, "point"),
  "Mover Terra": {
    kind: "quadrado",
    side: 12,
    origin: "point",
    centered: true,
    adjustable: { dimension: "side", min: 1.5, max: 12 },
    note: "Área de até 12 m de lado.",
  },
  "Muralha de Espinhos": wall(18, 1.5, "Até 18 m de comprimento, ou um círculo de 6 m de diâmetro."),
  "Muralha de Gelo": wall(30, 0.3, "Dez painéis de 3 m × 3 m, ou um domo/esfera de até 3 m de raio."),
  "Ossos da Terra": sphere(0.75, "point", "Cada pilar tem 1,5 m de diâmetro (até seis pilares)."),
  "Proteger Fortaleza": {
    kind: "quadrado",
    side: 15,
    origin: "point",
    centered: true,
    adjustable: { dimension: "side", min: 1.5, max: 15 },
    note: "Até 225 m² (um quadrado de 15 m).",
  },
  "Raio Solar": line(18, 1.5),

  // --- 7º círculo ---
  "Bola de Fogo Controlável": sphere(6, "point"),
  "Vendaval": cylinder(3, "Cilindro de 9 m de altura; move-se até 9 m com a sua ação."),
  "Inverter a Gravidade": cylinder(15, "Cilindro de 30 m de altura."),
  "Rajada Prismática": cone(18),
  "Símbolo": sphere(18, "point"),
  "Tempestade de Fogo": cube(3, "point", "Dez cubos de 3 m, cada um encostado em outro."),

  // --- 8º círculo ---
  "Aura Sagrada": sphere(9, "self"),
  "Campo Antimagia": sphere(3, "self"),
  "Dragão Ilusório": cone(18, "point", "O sopro sai do espaço da ilusão."),
  "Escuridão Enlouquecedora": sphere(18, "point"),
  "Evaporação de Abi-Dalzim": cube(9, "point"),
  "Explosão Solar": sphere(18, "point"),
  "Nuvem Incendiária": sphere(6, "point"),
  "Terremoto": sphere(30, "point"),
  "Tsunami": {
    kind: "linha",
    length: 90,
    width: 15,
    origin: "point",
    adjustable: { dimension: "length", min: 1.5, max: 90 },
    note: "Até 90 m de comprimento, 90 m de altura e 15 m de espessura.",
  },

  // --- 9º círculo ---
  "Chuva de Meteoros": sphere(12, "point", "Quatro pontos; esfera de 12 m de raio em cada."),
  "Encarnação Fantasmagórica": sphere(9, "point"),
  "Muralha Prismática": wall(27, 0.3, "Até 27 m de comprimento, ou uma esfera de 9 m de diâmetro."),
  "Tempestade da Vingança": sphere(108, "point"),
};

/** Área de uma magia pelo nome (tolera diferença de caixa). */
export function spellAreaOf(name: string): SpellArea | undefined {
  const direct = SPELL_AREAS[name];
  if (direct) return direct;
  const wanted = name.trim().toLowerCase();
  const key = Object.keys(SPELL_AREAS).find((k) => k.toLowerCase() === wanted);
  return key ? SPELL_AREAS[key] : undefined;
}

/**
 * Habilidades (características de classe, raça e afins) com área. `match` compara
 * com o nome da característica na ficha; `variants` permite mais de uma forma
 * (o Sopro Dracônico é cone ou linha conforme o ancestral).
 */
export type FeatureArea = {
  /** Nome exato ou prefixo ("Canalizar Divindade") da característica na ficha. */
  match: string;
  /** Só vale para esta classe/origem (nome da classe da ficha). */
  className?: string;
  label: string;
  area: SpellArea;
  /** Escolhas dentro do traço (ex.: cor do dragão) que puxam outra forma. */
  variants?: { label: string; choices?: string[]; area: SpellArea }[];
};

const BREATH_CONE = ["Branco", "Dourado", "Prateado", "Verde", "Vermelho"];
const BREATH_LINE = ["Azul", "Bronze", "Cobre", "Latão", "Negro"];

export const FEATURE_AREAS: FeatureArea[] = [
  {
    match: "Arma de Sopro",
    label: "Arma de Sopro",
    area: cone(4.5),
    variants: [
      { label: "Cone de 4,5 m", choices: BREATH_CONE, area: cone(4.5) },
      { label: "Linha de 9 m × 1,5 m", choices: BREATH_LINE, area: line(9, 1.5) },
    ],
  },
  { match: "Canalizar Divindade", className: "Clérigo", label: "Expulsar Mortos-Vivos", area: sphere(9, "self") },
  { match: "Canalizar Divindade", className: "Paladino", label: "Canalizar Divindade (9 m)", area: sphere(9, "self") },
  { match: "Canalizar Divindade: Radiação do Amanhecer", label: "Radiação do Amanhecer", area: sphere(9, "self") },
  { match: "Canalizar Divindade: Enfeitiçar Animais e Plantas", label: "Enfeitiçar Animais e Plantas", area: sphere(9, "self") },
  { match: "Canalizar Divindade: Santuário Crepuscular", label: "Santuário Crepuscular", area: sphere(9, "self") },
  { match: "Canalizar Divindade: Preservar a Vida", label: "Preservar a Vida", area: sphere(9, "self") },
  { match: "Canalizar Divindade: Demanda da Ordem", label: "Demanda da Ordem", area: sphere(9, "self") },
  {
    match: "Aura de Proteção",
    label: "Aura de Proteção",
    area: { kind: "esfera", radius: 3, origin: "self", adjustable: { dimension: "radius", min: 3, max: 9, step: 6 }, note: "3 m; 9 m no 18º nível." },
  },
  {
    match: "Aura da Coragem",
    label: "Aura da Coragem",
    area: { kind: "esfera", radius: 3, origin: "self", adjustable: { dimension: "radius", min: 3, max: 9, step: 6 }, note: "3 m; 9 m no 18º nível." },
  },
  {
    match: "Aura de Devoção",
    label: "Aura de Devoção",
    area: { kind: "esfera", radius: 3, origin: "self", adjustable: { dimension: "radius", min: 3, max: 9, step: 6 }, note: "3 m; 9 m no 18º nível." },
  },
  {
    match: "Aura de Vigilância",
    label: "Aura de Vigilância",
    area: { kind: "esfera", radius: 3, origin: "self", adjustable: { dimension: "radius", min: 3, max: 9, step: 6 }, note: "3 m; 9 m no 18º nível." },
  },
  { match: "Aura do Guardião", label: "Aura do Guardião", area: sphere(3, "self") },
  { match: "Aura do Sentinela", label: "Aura do Sentinela", area: sphere(3, "self") },
  { match: "Halo Sagrado", label: "Halo Sagrado", area: sphere(9, "self") },
  { match: "Anjo Vingador", label: "Aura de ameaça", area: sphere(9, "self") },
  { match: "Coroa de Luz", label: "Coroa de Luz", area: sphere(18, "self") },
  { match: "Presença Feérica", label: "Presença Feérica", area: { kind: "cubo", side: 3, origin: "self", centered: true } },
  { match: "Vingança Ardente", label: "Vingança Ardente", area: sphere(9, "self") },
  { match: "Marcha Cronometrada", label: "Marcha Cronometrada", area: cube(9, "self") },
  { match: "Surto Selvagem", label: "Surto Selvagem", area: sphere(9, "self") },
  { match: "Explosão Calcinante", label: "Explosão Calcinante", area: sphere(6, "point") },
  { match: "Canção de Proteção", label: "Canção de Proteção", area: sphere(9, "self") },
  { match: "Presença Zelosa", label: "Presença Zelosa", area: sphere(18, "self") },
  { match: "Chamado de Caça", label: "Chamado de Caça", area: sphere(9, "self") },
  { match: "Espírito Totêmico", label: "Espírito Totêmico", area: sphere(9, "point") },
  { match: "Lareira de Sombra e Luar", label: "Lareira de Sombra e Luar", area: sphere(9, "point") },
  { match: "Expansão de Esporos", label: "Expansão de Esporos", area: cube(3, "point") },
  { match: "Guia da Tempestade", label: "Guia da Tempestade (chuva)", area: sphere(6, "self") },
];

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Áreas das características de uma ficha (nome da característica → forma). */
export function featureAreasOf(
  features: { name: string; origin?: { name?: string } | null; source?: string }[],
  classNames: string[],
  raceChoices?: Record<string, string>,
): { key: string; label: string; area: SpellArea; variants?: FeatureArea["variants"] }[] {
  const out: { key: string; label: string; area: SpellArea; variants?: FeatureArea["variants"] }[] = [];
  const seen = new Set<string>();
  const classes = classNames.map(normalize);
  for (const feature of features) {
    const name = normalize(feature.name);
    for (const def of FEATURE_AREAS) {
      const wanted = normalize(def.match);
      const exact = name === wanted;
      // Prefixo só para os "Canalizar Divindade (2/descanso)" e afins: o nome pode ter sufixo entre parênteses.
      const prefixed = name.startsWith(wanted) && /^[\s(:]/.test(name.slice(wanted.length));
      if (!exact && !prefixed) continue;
      if (def.className) {
        const cls = normalize(def.className);
        const origin = normalize(feature.origin?.name ?? feature.source ?? "");
        if (origin !== cls && !(origin === "" && classes.includes(cls)) && !origin.includes(cls)) continue;
      }
      // Um "Canalizar Divindade: X" nunca deve virar o genérico de classe.
      if (prefixed && name.includes(":") && !wanted.includes(":")) continue;
      const key = `${def.label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      let area = def.area;
      if (def.variants && raceChoices) {
        const chosen = Object.values(raceChoices).map(normalize);
        const variant = def.variants.find((v) => v.choices?.some((c) => chosen.includes(normalize(c))));
        if (variant) area = variant.area;
      }
      out.push({ key, label: def.label, area, ...(def.variants ? { variants: def.variants } : {}) });
    }
  }
  return out;
}

/** Alcance numérico em metros de uma magia ("18 metros" → 18; "Pessoal"/"Toque" → null). */
export function parseRangeMeters(range: string | undefined): number | null {
  if (!range) return null;
  const m = /(\d+(?:[.,]\d+)?)\s*(?:m\b|metros?)/i.exec(range);
  if (!m) return null;
  if (/^pessoal/i.test(range.trim())) return null;
  return Number(m[1].replace(",", "."));
}
