export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "Força",
  dex: "Destreza",
  con: "Constituição",
  int: "Inteligência",
  wis: "Sabedoria",
  cha: "Carisma",
};

export const ABILITY_ORDER: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

export type AbilityScores = Record<AbilityKey, number>;

/** Tamanhos de criatura (D&D 5e, PT-BR), do menor ao maior. */
export const CREATURE_SIZES = [
  "Miúdo",
  "Pequeno",
  "Médio",
  "Grande",
  "Enorme",
  "Imenso",
] as const;

/** Tendências (alinhamentos) padrão do D&D 5e, em PT-BR. */
export const ALIGNMENTS = [
  "Leal e Bom",
  "Neutro e Bom",
  "Caótico e Bom",
  "Leal e Neutro",
  "Neutro",
  "Caótico e Neutro",
  "Leal e Mau",
  "Neutro e Mau",
  "Caótico e Mau",
] as const;

export type SkillName =
  | "Acrobacia"
  | "Adestrar Animais"
  | "Arcanismo"
  | "Atletismo"
  | "Atuação"
  | "Enganação"
  | "Furtividade"
  | "História"
  | "Intimidação"
  | "Intuição"
  | "Investigação"
  | "Medicina"
  | "Natureza"
  | "Percepção"
  | "Persuasão"
  | "Prestidigitação"
  | "Religião"
  | "Sobrevivência";

export const SKILL_TO_ABILITY: Record<SkillName, AbilityKey> = {
  "Acrobacia": "dex",
  "Adestrar Animais": "wis",
  "Arcanismo": "int",
  "Atletismo": "str",
  "Atuação": "cha",
  "Enganação": "cha",
  "Furtividade": "dex",
  "História": "int",
  "Intimidação": "cha",
  "Intuição": "wis",
  "Investigação": "int",
  "Medicina": "wis",
  "Natureza": "int",
  "Percepção": "wis",
  "Persuasão": "cha",
  "Prestidigitação": "dex",
  "Religião": "int",
  "Sobrevivência": "wis",
};

export type Skill = {
  name: SkillName;
  proficient: boolean;
  expert?: boolean;
};

export type Feature = {
  name: string;
  source: string;
  description: string;
  /** Origem estruturada (classe/subclasse/raça/talento/antecedente) — usada pela automação de nível. */
  origin?: FeatureOrigin;
};

export type Spell = {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  ritual?: boolean;
  concentration?: boolean;
  prepared?: boolean;
  /** Classe pela qual a magia foi aprendida (multiclasse); ausente em fichas antigas. */
  classSource?: string;
  /** Magia sempre preparada concedida por subclasse/raça (não conta no limite). */
  granted?: string;
};

/** Livro de origem de uma magia do catálogo. */
export type SpellSource = "PHB" | "XGtE" | "TCoE";

export const SPELL_SOURCE_LABELS: Record<SpellSource, string> = {
  PHB: "Livro do Jogador",
  XGtE: "Guia de Xanathar",
  TCoE: "Caldeirão de Tasha",
};

/** Classes conjuradoras (inclui Artífice, do Caldeirão de Tasha). */
export type SpellClass =
  | "Artífice"
  | "Bardo"
  | "Bruxo"
  | "Clérigo"
  | "Druida"
  | "Feiticeiro"
  | "Mago"
  | "Paladino"
  | "Patrulheiro";

/** Uma magia do catálogo de referência (extraído dos livros). */
export type CatalogSpell = Spell & {
  ritual: boolean;
  concentration: boolean;
  source: SpellSource;
  /** Classes que podem conjurar esta magia (das listas de magia dos livros). */
  classes: SpellClass[];
};

/** Escolha de perícias de uma classe: quantas e dentre quais. */
export type ClassSkillChoice = { choose: number; from: string[] };

/** Equipamento inicial de uma classe: grupos de escolha "(a) ou (b)" + itens fixos. */
export type StartingEquipment = {
  choices: string[][];
  fixed: string[];
};

/** Uma classe do catálogo de referência (extraída do Livro do Jogador). */
export type CatalogClass = {
  name: string;
  hitDie: string; // ex: "d8"
  primaryAbility: AbilityKey | null;
  savingThrows: AbilityKey[];
  spellcastingAbility: AbilityKey | null; // null = não conjura na base
  armorProficiencies: string;
  weaponProficiencies: string;
  toolProficiencies: string;
  skillProficiencies: ClassSkillChoice | null;
  subclasses: string[];
  startingEquipment: StartingEquipment;
  /** Características ganhas por nível: { "1": ["Fúria", ...], "3": [...] }. */
  progression: Record<string, string[]>;
};

/** Um antecedente do catálogo de referência (Livro do Jogador, Costa da Espada, caseiros). */
export type CatalogBackground = {
  name: string;
  /** Perícias concedidas (texto, pois muitos têm escolhas). */
  skills: string;
  /** Proficiências em ferramentas (opcional). */
  tools?: string;
  /** Idiomas adicionais (opcional). */
  languages?: string;
  /** Equipamento inicial (texto). */
  equipment: string;
  /** Recurso do antecedente: nome + descrição. */
  feature: { name: string; description: string };
  /** Livro/fonte de origem. */
  source: string;
  /** Nomes de variantes do antecedente (ex.: Espião, Pirata). */
  variants?: string[];
};

/** Um traço racial ou talento (feat) do catálogo de referência. */
export type CatalogTrait = {
  name: string;
  description: string;
  kind: "trait" | "talento";
};

/** Incremento de atributos de uma raça/sub-raça (chave de atributo -> bônus).
 *  `choose` representa incrementos à escolha (ex.: meio-elfo: +1 em dois à escolha). */
export type AbilityScoreIncrease = Partial<Record<AbilityKey, number>> & {
  /** Pontos à escolha: `count` pontos de +`amount`. `maxPerAbility` (padrão 1) limita quantos pontos
   *  vão no mesmo atributo (Monstros do Multiverso: 3 pontos, até 2 no mesmo = +2/+1 ou +1/+1/+1).
   *  `exclude` lista atributos que não podem receber os pontos (Meio-elfo: não Carisma). */
  choose?: { count: number; amount: number; maxPerAbility?: number; exclude?: AbilityKey[] };
};

/** Uma sub-raça (ex.: Anão da Colina). */
export type CatalogSubrace = {
  name: string;
  abilityScoreIncrease: AbilityScoreIncrease;
  traits: string[];
};

/** Uma raça do catálogo de referência (extraída do Livro do Jogador). */
export type CatalogRace = {
  name: string;
  abilityScoreIncrease: AbilityScoreIncrease;
  size: string; // "Médio" | "Pequeno"
  speed: number | null; // metros
  languages: string;
  traits: string[];
  subraces: CatalogSubrace[];
};

export type Weapon = {
  name: string;
  damage: string;
  damageType: string;
  attackBonus: number;
  properties: string[];
  description?: string;
};

export type Item = {
  name: string;
  description?: string;
  quantity?: number;
  weight?: number;
  /** Categoria escolhida à mão; sem ela a categoria é inferida pelo nome/catálogo. */
  category?: InventoryCategory;
};

/** Grupos do inventário na ficha. */
export type InventoryCategory =
  | "armas"
  | "armaduras"
  | "magicos"
  | "kits"
  | "ferramentas"
  | "consumiveis"
  | "materiais"
  | "tesouro"
  | "outros";

export type Coins = {
  gp: number;
  sp: number;
  cp: number;
};

export type Personality = {
  trait: string;
  ideal: string;
  flaw: string;
  why: string;
  backstory: string;
};

export type Appearance = {
  size: string;
  height: string;
  description?: string;
  imageUrl?: string;
};

export type ClassEntry = {
  name: string;
  subclass?: string;
  level: number;
};

/** Decisão tomada num nível de "Incremento no Valor de Habilidade": atributos ou talento. */
export type AsiDecision = {
  className: string;
  level: number;
  kind: "asi" | "feat";
  /** kind = "asi": incrementos aplicados (ex.: { str: 2 } ou { dex: 1, con: 1 }). */
  abilities?: Partial<Record<AbilityKey, number>>;
  /** kind = "feat": nome do talento escolhido. */
  feat?: string;
  /** kind = "feat": magias escolhidas nas opções que o talento abre (nomes do catálogo). */
  spells?: string[];
};

/** Escolhas feitas na raça (para reconstruir/validar a ficha). */
export type RaceInfo = {
  race: string;
  subrace?: string;
  /** Escolhas embutidas em traços (ex.: "Ancestral Dracônico" -> "Vermelho"). */
  choices?: Record<string, string>;
  /** Anotação livre pedida pela raça (ex.: Shade: raça de origem cuja aparência assume). */
  note?: string;
};

/** Regras da casa aplicadas na criação (ficam na ficha para a edição respeitar o mesmo limite). */
export type HouseRules = {
  /** Cada classe de multiclasse dá a escolha completa de perícias dela (o PHB só dá para Bardo, Ladino e Patrulheiro). */
  multiclassSkills?: boolean;
};

export type Sheet = {
  species: string;
  /** Raça/sub-raça estruturadas (fichas antigas só têm `species`). */
  raceInfo?: RaceInfo;
  /** Decisões de ASI/talento por nível de classe. */
  advancement?: AsiDecision[];
  /** Regras da casa escolhidas na criação. */
  houseRules?: HouseRules;
  classes: ClassEntry[];
  background: string;
  alignment?: string;
  abilityScores: AbilityScores;
  saves: AbilityKey[];
  skills: Skill[];
  proficiencies: string[];
  languages: string[];
  /** CA registrada (espelho do valor calculado; mantida em sincronia ao equipar). */
  ac: number;
  /** CA totalmente manual do Mestre (ignora armadura/atributos quando definida). */
  acOverride?: number | null;
  /** Bônus avulso de CA (anel de proteção, magia, homebrew do Mestre). */
  acBonus?: number;
  /** Nome do item de armadura equipado (do inventário). */
  equippedArmor?: string | null;
  /** Nome do escudo equipado (do inventário). */
  equippedShield?: string | null;
  /** Características opcionais (Tasha) que o jogador escolheu adotar. */
  optionalFeatures?: string[];
  /** Características opcionais que o jogador recusou (param de ser sugeridas). */
  declinedFeatures?: string[];
  /** Ferramentas com especialização (bônus de proficiência dobrado). */
  expertTools?: string[];
  speed: number; // metros
  initiativeBonus: number;
  proficiencyBonus: number;
  weapons: Weapon[];
  features: Feature[];
  spells: {
    saveDC: number;
    attackMod: number;
    castingAbility: AbilityKey;
    cantrips: Spell[];
    known: Spell[];
  };
  inventory: {
    coins: Coins;
    items: Item[];
  };
  appearance: Appearance;
  personality: Personality;
};

export type SpellSlot = { current: number; max: number };

/** Como um recurso se comporta: recarrega com descanso ou é uma "moeda" gasta e recebida. */
export type ResourceKind = "recarregavel" | "moeda";

export type Resource = {
  name: string;
  current: number;
  max: number;
  recharge: "short" | "long" | "none" | "dawn";
  description?: string;
  /** "moeda": não recarrega com descanso; `max` 0 = sem teto. Default: "recarregavel". */
  kind?: ResourceKind;
  /** Só o Mestre pode aumentar (o jogador só gasta). Usado pela Inspiração. */
  masterOnly?: boolean;
};

/** Recurso-moeda que toda ficha tem, sempre no topo da lista. Só o Mestre concede. */
export const INSPIRATION = "Inspiração";

export function inspirationResource(current = 0): Resource {
  return {
    name: INSPIRATION,
    current,
    max: 0,
    recharge: "none",
    kind: "moeda",
    masterOnly: true,
    description: "Concedida pelo Mestre. Gaste para ter vantagem em um teste, ataque ou salvaguarda.",
  };
}

export const isInspiration = (r: { name: string }) =>
  r.name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim() === "inspiracao";

/** Pasta: separa as fichas de cada mesa/campanha. A senha nunca vem do servidor. */
export type Folder = {
  id: string;
  name: string;
  /** Versão da foto da pasta (a imagem fica em /api/folders/:id/avatar). */
  avatarVersion?: string | null;
  /** Tem senha? Pasta sem senha abre direto. */
  protected: boolean;
  characterCount: number;
  createdAt?: string;
  updatedAt?: string;
};

/** Criatura simples do Hub do Mestre: nome, PV e CA para acompanhar os mobs da cena. */
export type Creature = {
  id: string;
  folderId: string;
  name: string;
  hpCurrent: number;
  hpMax: number;
  ac: number;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Character = {
  id: string;
  /** Pasta onde a ficha vive: definida na criação, não muda depois. */
  folderId?: string;
  playerName: string;
  characterName: string;
  pin?: string;
  protected?: boolean;
  color?: string; // tailwind hex pra header
  /** Versão da foto de perfil (gerida pelo servidor; a imagem fica em /api/characters/:id/avatar). */
  avatarVersion?: string | null;
  sheet: Sheet;
  hpCurrent: number;
  hpMax: number;
  hpTemp: number;
  spellSlots: Record<string, SpellSlot>;
  resources: Resource[];
  notes?: string;
  updatedAt?: string;
};

/** Uma alteração registrada no log de modificações de uma ficha. */
export type CharacterChange = {
  field: string;
  from?: string;
  to?: string;
  note?: string;
};

/** Entrada do log de modificações (controle de versão leve da ficha). */
export type CharacterLogEntry = {
  id: string;
  characterId: string;
  by: "mestre" | "jogador";
  changes: CharacterChange[];
  createdAt: string;
};

export type DiceRoll = {
  id: string;
  characterId: string | null;
  characterName?: string;
  label: string;
  expression: string;
  result: number;
  detail: {
    rolls: number[];
    modifier: number;
    advantage?: boolean;
    disadvantage?: boolean;
    crit?: boolean;
    fumble?: boolean;
    discarded?: number;
  };
  createdAt: string;
};

export const abilityMod = (score: number) => Math.floor((score - 10) / 2);

export const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

// ============================================================================
// Catálogos de regras (dados autorados a partir dos livros em PT-BR)
// ============================================================================

/** Livro de origem de um conteúdo do catálogo. */
export type SourceBook =
  | "PHB" // Livro do Jogador
  | "XGtE" // Guia de Xanathar
  | "TCoE" // Caldeirão de Tasha
  | "VGtM" // Guia de Volo
  | "MToF" // Tomo dos Inimigos de Mordenkainen
  | "SCAG" // Guia da Costa da Espada
  | "EEPC" // Elemental Evil
  | "MPMM" // Monstros do Multiverso
  | "ERLW" // Eberron: Ascensão do Último Conflito
  | "MHH" // Midgard Heroes Handbook (Kobold Press)
  | "Homebrew";

export const SOURCE_LABELS: Record<SourceBook, string> = {
  PHB: "Livro do Jogador",
  XGtE: "Guia de Xanathar",
  TCoE: "Caldeirão de Tasha",
  VGtM: "Guia de Volo",
  MToF: "Tomo de Mordenkainen",
  SCAG: "Costa da Espada",
  EEPC: "Elemental Evil",
  MPMM: "Monstros do Multiverso",
  ERLW: "Eberron",
  MHH: "Midgard (Kobold Press)",
  Homebrew: "Homebrew",
};

/** Origem estruturada de uma característica na ficha (para automação de nível). */
export type FeatureOrigin = {
  kind: "class" | "subclass" | "race" | "feat" | "background" | "custom";
  /** Nome da classe/raça/talento/antecedente de origem. */
  name: string;
  /** Nível de classe em que foi ganha (classe/subclasse). */
  level?: number;
};

/** Recurso rastreável concedido por uma característica (usos por descanso). */
export type FeatureResource = {
  /** Nome do recurso na ficha (default: nome da característica). */
  name?: string;
  /** Máximo de usos: número fixo ou derivado ("prof" = bônus de proficiência, "level" = nível na classe,
   *  "cha" etc. = modificador do atributo; mínimo 1). */
  max: number | "prof" | "level" | "str" | "dex" | "con" | "int" | "wis" | "cha";
  recharge: "short" | "long" | "dawn";
  /** Progressão do máximo por nível de classe, ex.: Fúria { "1": 2, "3": 3, "6": 4, "12": 5, "17": 6 }.
   *  Vale o maior limiar <= nível atual; sobrescreve `max`. */
  byLevel?: Record<string, number>;
};

/** Característica de classe ou subclasse, com descrição completa. */
export type ClassFeatureDef = {
  name: string;
  /** Nível de classe em que é ganha (1–20). */
  level: number;
  description: string;
  /** true para "Incremento no Valor de Habilidade" (abre a escolha atributos × talento). */
  asi?: boolean;
  /** Recurso com usos rastreáveis que a característica concede. */
  resource?: FeatureResource;
  /** Característica opcional (Caldeirão de Tasha): só entra na ficha se o jogador adotar. */
  optional?: boolean;
  /** Especialização: quantas perícias o jogador dobra o bônus de proficiência (e dentre quais). */
  expertise?: ExpertiseGrant;
};

/** Concessão de especialização (bônus de proficiência dobrado) em perícias à escolha. */
export type ExpertiseGrant = {
  count: number;
  /** Restringe as opções; sem isso, qualquer perícia em que já seja proficiente. */
  from?: SkillName[];
  /** Já vem decidido (ex.: Batedor: Natureza e Sobrevivência). */
  fixed?: SkillName[];
  /** Ferramentas que podem ocupar uma das vagas no lugar de uma perícia
   *  (Ladino: "duas perícias, ou uma perícia e ferramentas de ladrão"). */
  tools?: string[];
};

/** Subclasse (caminho, colégio, domínio, círculo, origem, arquétipo, tradição, juramento, patrono). */
export type SubclassDef = {
  name: string;
  source: SourceBook;
  /** Descrição curta (1–2 frases). */
  description: string;
  features: ClassFeatureDef[];
  /** Magias sempre preparadas/adicionais por nível de classe: { "1": ["Bênção", ...] } (nomes iguais ao catálogo de magias). */
  spells?: Record<string, string[]>;
};

/** Regras de multiclasse de uma classe (PHB cap. 6). */
export type MulticlassRule = {
  /** Pré-requisito de atributo, ex.: "Força 13". */
  prerequisite: string;
  /** Proficiências ganhas ao entrar na classe por multiclasse (texto). */
  proficiencies: string;
  /** Quantas perícias ganha ao entrar por multiclasse (Bardo/Ladino/Patrulheiro = 1; demais = 0). */
  skills: number;
};

/** Classe com progressão completa (níveis 1–20) e subclasses com descrição. */
export type ClassDef = {
  name: string;
  source: SourceBook;
  /** Rótulo da escolha de subclasse ("Caminho Primitivo", "Colégio de Bardo"...). */
  subclassLabel: string;
  /** Nível em que a subclasse é escolhida (1, 2 ou 3). */
  subclassLevel: number;
  /** Características da classe base em todos os níveis, incluindo os ASI (asi: true). */
  features: ClassFeatureDef[];
  subclasses: SubclassDef[];
  multiclass: MulticlassRule;
};

/** Uma escolha de magia aberta por um talento (ex.: "mais uma magia de 1º círculo de Ilusão ou Necromancia"). */
export type FeatSpellChoice = {
  /** Quantas magias escolher. */
  count: number;
  /** Círculo das magias (0 = truque). */
  level: number;
  /** Restringe às escolas de magia (nomes iguais aos do catálogo). */
  schools?: string[];
  /** Restringe às listas de classe. */
  lists?: SpellClass[];
  /** Só magias com o descritor ritual. */
  ritual?: boolean;
  /** Texto curto explicando a escolha. */
  label?: string;
};

/** Magias que um talento concede: fixas e/ou à escolha. */
export type FeatSpellGrant = {
  /** Magias que entram na ficha automaticamente (nomes iguais ao catálogo de magias). */
  fixed?: string[];
  /** Escolhas que o jogador faz ao pegar o talento. */
  choices?: FeatSpellChoice[];
  /** O talento pede que o jogador escolha UMA lista de classe; as escolhas saem dela. */
  pickList?: SpellClass[];
};

/** Talento (feat) com descrição completa. */
export type FeatDef = {
  name: string;
  source: SourceBook;
  prerequisite?: string;
  description: string;
  /** Aumento de atributo embutido no talento (ex.: +1 em For ou Des). */
  abilityIncrease?: { choose: AbilityKey[]; amount: number };
  /** Especialização concedida pelo talento (ex.: Especializado em Perícia, Prodígio). */
  expertise?: ExpertiseGrant;
  /** Proficiências em perícia à escolha concedidas pelo talento. */
  skillChoices?: number;
  /** Magias concedidas pelo talento (fixas e à escolha). */
  spells?: FeatSpellGrant;
  /** Talento racial: raças que podem escolhê-lo. */
  races?: string[];
  /** Presente quando o talento é homebrew do Mestre (id no servidor). */
  homebrewId?: string;
};

/** Traço racial com descrição e efeitos mecânicos automáticos. */
export type RaceTraitDef = {
  name: string;
  description: string;
  /** Perícias em que o traço concede proficiência. */
  skills?: SkillName[];
  /** Perícias à escolha concedidas pelo traço. */
  skillChoices?: number;
  /** Idiomas adicionais à escolha concedidos pelo traço. */
  extraLanguages?: number;
  /** Talento à escolha concedido pelo traço (Humano variante). */
  feat?: boolean;
  /** Escolha embutida no traço (ex.: Ancestral Dracônico → tipo de dragão). */
  choice?: { label: string; options: string[] };
  /** Truques/magias conhecidos pelo traço (nomes iguais ao catálogo de magias). */
  spells?: string[];
  /** Proficiências textuais (armas, armaduras, ferramentas). */
  proficiencies?: string[];
  /** Restringe as perícias à escolha (`skillChoices`) a esta lista. */
  skillChoiceFrom?: SkillName[];
  /** Usos rastreáveis do traço (viram recurso na ficha). "prof"/"level" usam o nível total. */
  resource?: FeatureResource;
};

export type CreatureSize = "Pequeno" | "Médio";

/** Campo de anotação livre que a raça pede na criação (ex.: Shade). */
export type RaceNoteField = {
  label: string;
  placeholder?: string;
  help?: string;
  /** Traço que recebe a anotação no nome/descrição (ex.: "Origem em Vida"). */
  traitName?: string;
};

export type SubraceDef = {
  name: string;
  source?: SourceBook;
  description?: string;
  abilityScoreIncrease: AbilityScoreIncrease;
  traits: RaceTraitDef[];
  /** Sobrescreve o deslocamento da raça. */
  speed?: number;
  /** Variante que SUBSTITUI a raça base (atributos, traços, idiomas), em vez de somar a ela. */
  replaceBase?: boolean;
  /** Sobrescrevem os da raça (usados sobretudo por variantes). */
  languages?: string[];
  extraLanguages?: number;
  size?: CreatureSize;
  sizeOptions?: CreatureSize[];
};

export type RaceDef = {
  name: string;
  source: SourceBook;
  /** Descrição curta (1–2 frases). */
  description: string;
  abilityScoreIncrease: AbilityScoreIncrease;
  size: CreatureSize;
  /** Tamanhos à escolha do jogador (ex.: Shade usa o da raça de origem). */
  sizeOptions?: CreatureSize[];
  /** Deslocamento em metros. */
  speed: number;
  /** O jogador informa o deslocamento (ex.: Shade usa o da raça de origem). */
  speedEditable?: boolean;
  /** Idiomas fixos (ex.: ["Comum", "Anão"]). */
  languages: string[];
  /** Quantos idiomas adicionais à escolha a raça concede. */
  extraLanguages: number;
  traits: RaceTraitDef[];
  subraces: SubraceDef[];
  /** true quando é obrigatório escolher uma sub-raça. */
  subraceRequired?: boolean;
  /** Anotação livre pedida na criação. */
  noteField?: RaceNoteField;
  /** Presente quando a raça é homebrew do Mestre (id no servidor). */
  homebrewId?: string;
};

/** Idiomas do PHB (padrão e exóticos) + os das raças de Volo. */
export const LANGUAGES: readonly string[] = [
  "Comum",
  "Anão",
  "Élfico",
  "Gigante",
  "Gnômico",
  "Goblin",
  "Halfling",
  "Orc",
  "Abissal",
  "Celestial",
  "Dracônico",
  "Dialeto Subterrâneo",
  "Infernal",
  "Primordial",
  "Silvestre",
  "Subcomum",
  "Aarakocra",
  "Aéreo (Auran)",
  "Aquático (Aquan)",
  "Ígneo (Ignan)",
  "Terrano (Terran)",
];

// ============================================================================
// Homebrew do Mestre (guardado no servidor em /api/homebrew)
// ============================================================================

export type HomebrewKind = "race" | "feat" | "trait";

/** Sub-raça de uma raça homebrew: traços referenciados por nome. */
export type HomebrewSubraceData = {
  name: string;
  description?: string;
  abilityScoreIncrease: AbilityScoreIncrease;
  traitNames: string[];
  speed?: number;
};

/** Raça homebrew como fica no servidor: os traços são referências por nome à
 *  biblioteca de traços homebrew ou aos traços oficiais, então editar um traço
 *  atualiza todas as raças que o usam. */
export type HomebrewRaceData = {
  name: string;
  description: string;
  abilityScoreIncrease: AbilityScoreIncrease;
  size: CreatureSize;
  sizeOptions?: CreatureSize[];
  speed: number;
  speedEditable?: boolean;
  languages: string[];
  extraLanguages: number;
  traitNames: string[];
  subraces: HomebrewSubraceData[];
  subraceRequired?: boolean;
  noteField?: RaceNoteField;
};

export type HomebrewFeatData = Omit<FeatDef, "source" | "homebrewId">;

export type HomebrewTraitData = RaceTraitDef;

export type HomebrewItem =
  | { id: string; kind: "race"; data: HomebrewRaceData; updatedAt: string }
  | { id: string; kind: "feat"; data: HomebrewFeatData; updatedAt: string }
  | { id: string; kind: "trait"; data: HomebrewTraitData; updatedAt: string };

/** Referência a um item do equipamento inicial de uma classe. */
export type EquipmentRef =
  | { item: string; qty?: number }
  | {
      /** Coringa: o jogador escolhe um item da categoria. */
      any:
        | "arma simples"
        | "arma marcial"
        | "arma simples corpo-a-corpo"
        | "arma marcial corpo-a-corpo"
        | "instrumento musical"
        | "ferramentas de artesão"
        | "kit de jogo";
      qty?: number;
    };

/** Uma opção "(a)/(b)" do equipamento inicial. */
export type EquipmentOption = { label: string; items: EquipmentRef[] };

/** Equipamento inicial estruturado de uma classe. */
export type StartingEquipmentDef = {
  choices: EquipmentOption[][];
  fixed: EquipmentRef[];
  /** Alternativa em ouro (PHB cap. 5), ex.: "5d4 × 10 po". */
  gold: string;
};
