/**
 * Lembretes de combate escritos à mão.
 *
 * A varredura automática das descrições (ver `src/lib/reminders.ts`) tira frases
 * do meio do texto e, com isso, some com a condição que liga o efeito: a ficha
 * acabava dando a entender que o Shade tem resistência a concussão o tempo todo
 * (só tem com a Carne Fantasmagórica ligada) ou que o clérigo anda com os bônus
 * de Canalizar Divindade ativos (só valem no uso gasto).
 *
 * Por isso cada característica que importa em combate ganha aqui um texto sem
 * ambiguidade e, quando for o caso, a condição em `when`. `when: null` significa
 * "vale o tempo todo"; qualquer outro valor vira um rótulo na frente do texto.
 * O que não estiver aqui continua saindo da varredura automática — que também
 * passou a marcar a condição quando a característica precisa ser ligada.
 */

import type { ReminderTone } from "@/lib/types";

export type { ReminderTone };

export type ReminderRule = {
  /** Nome da característica/traço/talento como aparece na ficha. */
  feature: string;
  /** Casa também com nomes que começam por este ("Canalizar Divindade: Destruir Mortos-Vivos"). */
  prefix?: boolean;
  /** Condição que liga o efeito. `null` = vale o tempo todo. */
  when: string | null;
  text: string;
  tone: ReminderTone;
};

/**
 * Características cuja descrição não deve virar lembrete automático: são tabelas
 * (Surto de Magia Selvagem), fichas de criaturas invocadas ou listas de opções
 * das quais o personagem só tem uma.
 */
export const REMINDER_IGNORE: string[] = [
  "Surto de Magia Selvagem",
  "Espetáculo Animado",
  "Invocar Espírito do Fogo Selvagem",
  "Receptáculo do Gênio",
  "Pedra de Transmutador",
  "Manifestar Mente",
  "O Terceiro Olho",
  "Artes Sombrias",
  "Comandar Mortos-Vivos",
  "Sintonia Totêmica",
  "Anjo Vingador",
  "Ancestral Dracônico", // tratado à parte: a resistência depende do dragão escolhido
];

/** Resistência concedida por cada tipo de dragão (PHB, tabela Ancestral Dracônico). */
export const DRACONIC_DAMAGE: Record<string, string> = {
  azul: "elétrico",
  branco: "frio",
  bronze: "elétrico",
  cobre: "ácido",
  dourado: "fogo",
  latao: "fogo",
  negro: "ácido",
  prateado: "frio",
  verde: "veneno",
  vermelho: "fogo",
};

export const REMINDER_RULES: ReminderRule[] = [
  // ======================================================================
  // Raças
  // ======================================================================
  {
    feature: "Resistência Celestial",
    when: null,
    text: "Resistência a dano necrótico e a dano radiante.",
    tone: "good",
  },
  {
    feature: "Resiliência Anã",
    when: null,
    text: "Vantagem nas salvaguardas contra veneno e resistência a dano de veneno.",
    tone: "good",
  },
  {
    feature: "Resistência a Dano",
    when: null,
    text: "Resistência ao tipo de dano do seu ancestral dracônico.",
    tone: "good",
  },
  {
    feature: "Arma de Sopro",
    when: "ao gastar um uso da Arma de Sopro",
    text: "O sopro do seu ancestral, na área do tipo de dragão. A CD da salvaguarda é 8 + bônus de proficiência + Constituição.",
    tone: "good",
  },
  {
    feature: "Ancestral Feérico",
    when: null,
    text: "Vantagem nas salvaguardas contra ser enfeitiçado, e magia nenhuma consegue colocar você para dormir.",
    tone: "good",
  },
  {
    feature: "Sensibilidade à Luz Solar",
    when: "sob luz solar direta (em você, no alvo ou no que quer perceber)",
    text: "Desvantagem nas jogadas de ataque e nos testes de Sabedoria (Percepção) que dependem da visão.",
    tone: "bad",
  },
  {
    feature: "Visão no Escuro",
    when: null,
    text: "No escuro você enxerga como se fosse penumbra, em tons de cinza — não distingue cor.",
    tone: "info",
  },
  {
    feature: "Visão no Escuro Superior",
    when: null,
    text: "Visão no escuro de 36 metros, em tons de cinza.",
    tone: "info",
  },
  {
    feature: "Resistência Necrótica",
    when: null,
    text: "Resistência a dano necrótico.",
    tone: "good",
  },
  {
    feature: "Bênção da Rainha Corvo",
    when: "no turno em que usar o teleporte do traço (3º nível ou mais)",
    text: "Resistência a todo dano até o início do seu próximo turno.",
    tone: "good",
  },
  {
    feature: "Carne Fantasmagórica",
    when: "só com a Carne Fantasmagórica ligada (ação; 1 minuto; 1×/descanso longo)",
    text: "Voo 9 m com pairar, resistência a concussão, cortante e perfurante de ataques não mágicos que não sejam de prata, vantagem para escapar de agarrado ou impedido, e você atravessa criaturas e objetos como terreno difícil (1d10 de dano de energia se terminar o turno dentro de um objeto). Fora da transformação você não tem nada disso.",
    tone: "good",
  },
  {
    feature: "Resiliência Espectral",
    when: null,
    text: "Vantagem nas salvaguardas contra veneno e doença, e resistência a dano necrótico.",
    tone: "good",
  },
  {
    feature: "Drenagem de Vida",
    when: "ao causar dano com um ataque ou magia (1×/descanso curto ou longo)",
    text: "Some dano necrótico igual ao seu nível; se a criatura for da sua Origem em Vida, ganhe PV temporários iguais a esse dano.",
    tone: "good",
  },
  {
    feature: "Morte Imperfeita",
    when: null,
    text: "Você é humanoide, mas efeitos que miram mortos-vivos (Expulsar Mortos-Vivos, por exemplo) também pegam em você.",
    tone: "bad",
  },
  { feature: "Resistência ao Fogo", when: null, text: "Resistência a dano de fogo.", tone: "good" },
  { feature: "Resistência a Ácido", when: null, text: "Resistência a dano de ácido.", tone: "good" },
  { feature: "Resistência Infernal", when: null, text: "Resistência a dano de fogo.", tone: "good" },
  {
    feature: "Esperteza Gnômica",
    when: null,
    text: "Vantagem em todas as salvaguardas de Inteligência, Sabedoria e Carisma contra magia.",
    tone: "good",
  },
  {
    feature: "Bravura",
    when: null,
    text: "Vantagem nas salvaguardas contra ficar amedrontado.",
    tone: "good",
  },
  {
    feature: "Sortudo",
    when: "quando tirar 1 natural num ataque, teste de habilidade ou salvaguarda",
    text: "Role o d20 de novo e use o novo resultado.",
    tone: "good",
  },
  {
    feature: "Furtividade Natural",
    when: "quando tiver a cobertura de uma criatura pelo menos um tamanho maior que você",
    text: "Você pode tentar se esconder mesmo assim.",
    tone: "good",
  },
  {
    feature: "Resiliência dos Robustos",
    when: null,
    text: "Vantagem nas salvaguardas contra veneno e resistência a dano de veneno.",
    tone: "good",
  },
  {
    feature: "Sem Sono",
    when: null,
    text: "Você não precisa dormir e magia nenhuma consegue colocar você para dormir.",
    tone: "good",
  },
  {
    feature: "Táticas de Matilha",
    when: "quando um aliado não incapacitado estiver a até 1,5 m do alvo",
    text: "Vantagem na jogada de ataque contra esse alvo.",
    tone: "good",
  },
  {
    feature: "Rastejar, Encolher-se e Implorar",
    when: "ação bônus (usos limitados por descanso longo)",
    text: "Até o fim do seu próximo turno, seus aliados têm vantagem nos ataques contra inimigos a até 3 m de você que possam ver você.",
    tone: "good",
  },
  {
    feature: "Defesa do Casco",
    when: "enquanto estiver recolhido no casco (ação para entrar, ação bônus para sair)",
    text: "+4 de CA e vantagem nas salvaguardas de Força e Constituição — mas você fica caído, com deslocamento 0, desvantagem nas salvaguardas de Destreza, sem reações e sem outra ação a não ser sair do casco.",
    tone: "good",
  },
  {
    feature: "Resistência Implacável",
    when: "quando cair a 0 PV sem morrer na hora (1×/descanso longo)",
    text: "Você fica com 1 PV em vez de cair.",
    tone: "good",
  },
  {
    feature: "Ataques Selvagens",
    when: "ao acertar um crítico com arma corpo-a-corpo",
    text: "Role um dado de dano da arma a mais e some ao dano extra do crítico.",
    tone: "good",
  },
  {
    feature: "Agressivo",
    when: "ação bônus",
    text: "Mova até o seu deslocamento na direção de um inimigo que possa ver ou ouvir — tem de terminar mais perto dele.",
    tone: "good",
  },
  {
    feature: "Ataque Surpresa",
    when: "no seu 1º turno do combate, contra uma criatura surpresa (1×/combate)",
    text: "+2d6 de dano no ataque que acertar.",
    tone: "good",
  },
  {
    feature: "Salvar as Aparências",
    when: "ao errar um ataque ou falhar num teste/salvaguarda (1×/descanso curto ou longo)",
    text: "Some +1 por aliado que você enxergue a até 9 m, até o máximo de +5.",
    tone: "good",
  },
  {
    feature: "Fúria dos Pequenos",
    when: "ao causar dano a uma criatura maior que você (1×/descanso curto ou longo)",
    text: "Dano extra igual ao seu nível.",
    tone: "good",
  },
  {
    feature: "Mordida",
    when: null,
    text: "Seu ataque desarmado com a mordida causa 1d6 perfurante + Força, no lugar do dano normal.",
    tone: "info",
  },
  {
    feature: "Garras",
    when: null,
    text: "Seu ataque desarmado com as garras causa 1d4 cortante + Força, no lugar do dano normal.",
    tone: "info",
  },

  // ======================================================================
  // Talentos
  // ======================================================================
  {
    feature: "Alerta",
    when: null,
    text: "+5 de iniciativa, você não pode ser surpreendido enquanto estiver consciente e quem está escondido de você não ganha vantagem nos ataques contra você.",
    tone: "good",
  },
  {
    feature: "Mestre de Armas Grandes",
    when: "com arma pesada corpo-a-corpo em que seja proficiente",
    text: "Antes do ataque você pode aceitar −5 no acerto para +10 no dano; e, ao acertar um crítico ou levar uma criatura a 0 PV, ganha um ataque corpo-a-corpo de ação bônus.",
    tone: "good",
  },
  {
    feature: "Atirador Aguçado",
    when: "com armas à distância em que seja proficiente",
    text: "Sem desvantagem além do alcance normal, ignora meia-cobertura e três-quartos de cobertura, e você pode aceitar −5 no acerto para +10 no dano.",
    tone: "good",
  },
  {
    feature: "Sentinela",
    when: "quando um inimigo baixa a guarda perto de você",
    text: "Ataque de oportunidade que acerta zera o deslocamento do alvo; inimigos provocam ataque de oportunidade mesmo usando Desengajar; e a reação vira um ataque corpo-a-corpo em quem atacar outro alvo a até 1,5 m de você.",
    tone: "good",
  },
  {
    feature: "Mestre de Escudo",
    when: "empunhando um escudo",
    text: "A ação de Ataque libera um empurrão de ação bônus com o escudo; o bônus de CA do escudo entra nas salvaguardas de Destreza contra efeitos que mirem você; e a reação zera o dano de um efeito de meio dano quando você passa na salvaguarda.",
    tone: "good",
  },
  {
    feature: "Investida Poderosa",
    when: "ao usar a ação de Disparada",
    text: "Ação bônus para um ataque corpo-a-corpo ou um empurrão; com 3 m em linha reta antes, o ataque ganha +5 de dano ou o empurrão joga o alvo a 3 m.",
    tone: "good",
  },
  {
    feature: "Perfurador",
    when: "1×/turno, num ataque que cause dano perfurante",
    text: "Role de novo um dado de dano (fica com o novo); no crítico, role um dado de dano adicional.",
    tone: "good",
  },
  {
    feature: "Esmagador",
    when: "1×/turno, num ataque que cause dano de concussão",
    text: "Empurre o alvo 1,5 m; no crítico, os ataques contra ele têm vantagem até o início do seu próximo turno.",
    tone: "good",
  },
  {
    feature: "Lacerador",
    when: "1×/turno, num ataque que cause dano cortante",
    text: "Reduza o deslocamento do alvo em 3 m até o início do seu próximo turno; no crítico, ele fica com desvantagem nos ataques até lá.",
    tone: "good",
  },
  {
    feature: "Duelista Defensivo",
    when: "reação, empunhando arma de acuidade, quando um ataque corpo-a-corpo acerta você",
    text: "Some o bônus de proficiência à sua CA contra esse ataque — pode fazer o ataque errar.",
    tone: "good",
  },
  {
    feature: "Mobilidade",
    when: null,
    text: "+3 m de deslocamento; ao atacar corpo-a-corpo uma criatura você não provoca ataque de oportunidade dela pelo resto do turno; e Disparada ignora terreno difícil.",
    tone: "good",
  },
  {
    feature: "Boa Sorte",
    when: "reação, quando um aliado a até 9 m tira 1 natural",
    text: "Ele rola de novo e usa o novo resultado (e você fica sem o traço Sortudo até o fim do seu próximo turno).",
    tone: "good",
  },
  {
    feature: "Segunda Chance",
    when: "reação, quando alguém que você vê acerta você (1× até rolar iniciativa ou descansar)",
    text: "A criatura rola a jogada de ataque de novo.",
    tone: "good",
  },
  {
    feature: "Especialista em Briga",
    when: null,
    text: "Seu ataque desarmado causa 1d4 e, ao acertar com desarmado ou arma improvisada, você pode agarrar o alvo com uma ação bônus.",
    tone: "good",
  },
  {
    feature: "Ambidestro",
    when: "empunhando uma arma corpo-a-corpo em cada mão",
    text: "+1 de CA e você combate com duas armas mesmo sem a propriedade leve.",
    tone: "good",
  },
  {
    feature: "Maestria em Arma de Haste",
    when: "empunhando glaive, alabarda, lança longa ou bordão",
    text: "Criaturas provocam ataque de oportunidade só de entrar no seu alcance; e a ação de Ataque com glaive, alabarda ou bordão libera um golpe de ação bônus com a outra ponta (1d4 de concussão).",
    tone: "good",
  },
  {
    feature: "Especialista em Besta",
    when: null,
    text: "Estar a 1,5 m de um inimigo não dá desvantagem nos seus ataques à distância, você ignora a recarga e a ação de Ataque com arma de uma mão libera um tiro de besta de mão de ação bônus.",
    tone: "good",
  },
  {
    feature: "Pistoleiro",
    when: null,
    text: "Você ignora a recarga das armas de fogo e estar a 1,5 m de um inimigo não dá desvantagem nos seus ataques à distância.",
    tone: "good",
  },
  {
    feature: "Atacante Bestial",
    when: "1×/turno, ao rolar o dano de um ataque corpo-a-corpo com arma",
    text: "Role o dado de dano da arma de novo e fique com o resultado que preferir.",
    tone: "good",
  },
  {
    feature: "Temor Dracônico",
    when: "gastando um uso da Arma de Sopro",
    text: "Em vez do sopro, um rugido: cada criatura à sua escolha a até 9 m faz salvaguarda de Sabedoria (CD 8 + proficiência + Carisma) ou fica amedrontada por 1 minuto.",
    tone: "good",
  },
  {
    feature: "Fúria Orc",
    when: "ao acertar um ataque com arma simples ou marcial (1×/descanso curto ou longo)",
    text: "Role um dado de dano da arma a mais. E, logo depois de usar Resistência Implacável, a sua reação vira um ataque com arma.",
    tone: "good",
  },
  {
    feature: "Chamas de Phlegethos",
    when: "ao conjurar uma magia que cause dano de fogo",
    text: "Você pode refazer os 1 nos dados de dano de fogo e chamas envolvem você até o fim do turno: quem acertar você corpo-a-corpo a até 1,5 m sofre 1d4 de fogo.",
    tone: "good",
  },
  {
    feature: "Adepto Elemental",
    when: "nas magias que você conjura, com o tipo de dano escolhido",
    text: "Elas ignoram resistência a esse dano e todo 1 nos dados de dano vira 2.",
    tone: "good",
  },
  {
    feature: "Precisão Élfica",
    when: "quando tiver vantagem num ataque de Destreza, Inteligência, Sabedoria ou Carisma",
    text: "Role de novo um dos dados do ataque, uma vez.",
    tone: "good",
  },
  {
    feature: "Matador de Conjuradores",
    when: null,
    text: "Vantagem nas salvaguardas contra magias de quem está a até 1,5 m; o dano que você causa dá desvantagem no teste de concentração do alvo; e a reação vira um ataque corpo-a-corpo em quem conjurar perto de você.",
    tone: "good",
  },
  {
    feature: "Conjurador de Guerra",
    when: null,
    text: "Vantagem nas salvaguardas de Constituição para manter concentração ao sofrer dano; faz componentes somáticos com as mãos ocupadas; e o ataque de oportunidade pode virar uma magia de 1 ação num alvo só.",
    tone: "good",
  },
  {
    feature: "Constituição Infernal",
    when: null,
    text: "Resistência a dano de frio e de veneno, e vantagem nas salvaguardas contra ser envenenado.",
    tone: "good",
  },
  {
    feature: "Explorador de Cavernas",
    when: null,
    text: "Vantagem nas salvaguardas para evitar ou resistir a armadilhas (e nos testes para achar portas secretas).",
    tone: "good",
  },
  {
    feature: "Maestria em Armadura Média",
    when: null,
    text: "Armadura média não impõe desvantagem em Furtividade.",
    tone: "good",
  },
  {
    feature: "Sorrateiro",
    when: null,
    text: "Penumbra não impõe desvantagem nos seus testes de Percepção que dependem da visão.",
    tone: "good",
  },
  {
    feature: "Observador",
    when: null,
    text: "+5 nos seus valores passivos de Percepção e de Investigação.",
    tone: "info",
  },
  {
    feature: "Resistente",
    when: "ao gastar um Dado de Vida",
    text: "O mínimo recuperado é o dobro do seu modificador de Constituição (mínimo 2).",
    tone: "good",
  },
  {
    feature: "Desvanecer",
    when: "reação, logo após sofrer dano (1×/descanso curto ou longo)",
    text: "Fique invisível até o fim do seu próximo turno ou até atacar, causar dano ou forçar uma salvaguarda.",
    tone: "good",
  },
  {
    feature: "Agachamento Ágil",
    when: "ao tentar escapar de estar agarrado",
    text: "Vantagem no teste de Força (Atletismo) ou Destreza (Acrobacia).",
    tone: "good",
  },
  {
    feature: "Imobilizador",
    when: "contra uma criatura agarrada por você",
    text: "Vantagem nas jogadas de ataque.",
    tone: "good",
  },
  {
    feature: "Combatente Montado",
    when: "enquanto estiver montado",
    text: "Vantagem nos ataques corpo-a-corpo contra criaturas desmontadas menores que a sua montaria.",
    tone: "good",
  },

  // ======================================================================
  // Classes e subclasses
  // ======================================================================
  {
    feature: "Fúria",
    when: "só em fúria (ação bônus; acaba em 1 minuto ou se você não atacar nem sofrer dano no turno)",
    text: "Vantagem em testes e salvaguardas de Força, bônus de dano nos ataques corpo-a-corpo com Força e resistência a dano de concussão, cortante e perfurante. Fora da fúria nada disso vale — e em fúria você não conjura nem mantém concentração em magia.",
    tone: "good",
  },
  {
    feature: "Fúria Inconsciente",
    when: "só em fúria",
    text: "Você não pode ser enfeitiçado nem amedrontado; se já estiver, o efeito fica suspenso até a fúria acabar.",
    tone: "good",
  },
  {
    feature: "Totem Espiritual",
    when: "só em fúria",
    text: "O benefício do totem que você escolheu (urso: resistência a todo dano exceto psíquico; lobo: aliados atacam com vantagem quem estiver a 1,5 m de você; águia: Disparada de ação bônus) só vale com a fúria ligada.",
    tone: "good",
  },
  {
    feature: "Aspecto da Besta",
    when: null,
    text: "O aspecto do seu totem vale o tempo todo, mesmo fora da fúria.",
    tone: "good",
  },
  {
    feature: "Sentido de Perigo",
    when: null,
    text: "Vantagem nas salvaguardas de Destreza contra efeitos que você consiga ver — mas não enquanto estiver cego, surdo ou incapacitado.",
    tone: "good",
  },
  {
    feature: "Instinto Selvagem",
    when: null,
    text: "Vantagem nas jogadas de iniciativa.",
    tone: "good",
  },
  {
    feature: "Alma da Tempestade",
    when: null,
    text: "Resistência ao dano do ambiente que você escolheu (deserto: fogo; mar: elétrico; tundra: frio).",
    tone: "good",
  },
  {
    feature: "Tempestade Protetora",
    when: "só com a Aura da Tempestade ligada",
    text: "Os aliados que você escolher ganham a mesma resistência que a Alma da Tempestade te dá.",
    tone: "good",
  },
  {
    feature: "Presença Zelosa",
    when: "ação bônus (1×/descanso longo)",
    text: "Até 10 criaturas à sua escolha a até 18 m que ouçam você ganham vantagem em ataques e salvaguardas até o início do seu próximo turno.",
    tone: "good",
  },
  {
    feature: "Canção de Proteção",
    when: "enquanto mantiver a canção (ação em cada turno)",
    text: "Você e os aliados a até 9 m têm vantagem nas salvaguardas contra ser amedrontado ou enfeitiçado.",
    tone: "good",
  },
  {
    feature: "Majestade Inquebrável",
    when: "no turno seguinte ao uso (ação bônus, 1×/descanso curto ou longo)",
    text: "Quem quiser atacar você faz salvaguarda de Carisma; falhando, escolhe outro alvo neste turno.",
    tone: "good",
  },
  {
    feature: "Invocações Místicas",
    when: "só as invocações que você escolheu",
    text: "A ficha guarda a lista inteira do livro para consulta: valem apenas as invocações que você de fato escolheu.",
    tone: "info",
  },
  {
    feature: "Dádiva do Pacto",
    when: "com a arma do pacto na mão",
    text: "Ela conta como mágica para superar resistência e imunidade a ataques não mágicos.",
    tone: "good",
  },
  {
    feature: "Defesa Sedutora",
    when: null,
    text: "Você não pode ser enfeitiçado; e a reação pode devolver o encanto para quem tentou.",
    tone: "good",
  },
  {
    feature: "Proteção Entrópica",
    when: "reação, quando alguém ataca você (1×/descanso curto ou longo)",
    text: "Desvantagem nessa jogada de ataque; se ela errar, o seu próximo ataque contra essa criatura tem vantagem.",
    tone: "good",
  },
  {
    feature: "Escudo de Pensamentos",
    when: null,
    text: "Resistência a dano psíquico, e quem causa dano psíquico a você sofre a mesma quantidade de volta.",
    tone: "good",
  },
  { feature: "Alma Oceânica", when: null, text: "Resistência a dano de frio.", tone: "good" },
  {
    feature: "Dom Elemental",
    when: null,
    text: "Resistência ao dano do seu patrono: concussão (dao), trovão (djinni), fogo (ifrit) ou frio (marid).",
    tone: "good",
  },
  {
    feature: "Canalizar Divindade",
    prefix: true,
    when: "só ao gastar um uso de Canalizar Divindade",
    text: "O efeito vale apenas no uso gasto — fora dele você não anda com bônus nenhum. Os usos voltam no descanso curto ou longo.",
    tone: "info",
  },
  {
    feature: "Avatar da Batalha",
    when: null,
    text: "Resistência a dano de concussão, cortante e perfurante de ataques não mágicos.",
    tone: "good",
  },
  { feature: "Alma da Forja", when: null, text: "Resistência a dano de fogo (e +1 de CA).", tone: "good" },
  {
    feature: "Santo da Forja e Fogo",
    when: null,
    text: "Imunidade a dano de fogo. Vestindo armadura pesada, some resistência a dano cortante, de concussão e perfurante de ataques não mágicos.",
    tone: "good",
  },
  {
    feature: "Labareda Protetora",
    when: "reação, quando alguém ataca uma criatura a até 9 m de você (usos limitados)",
    text: "O atacante faz salvaguarda de Constituição ou sofre dano radiante e fica cego até o fim do turno — quem não puder ser cegado escapa.",
    tone: "good",
  },
  {
    feature: "Coroa de Luz",
    when: "enquanto a Coroa de Luz estiver ligada (ação, 1 minuto)",
    text: "Inimigos dentro da luz plena têm desvantagem nas salvaguardas contra as suas magias de fogo e radiantes.",
    tone: "good",
  },
  { feature: "Olhos da Noite", when: null, text: "Visão no escuro de 90 metros.", tone: "info" },
  {
    feature: "Bênção da Vigilância",
    when: "ação",
    text: "Uma criatura que você tocar (pode ser você) ganha vantagem na próxima jogada de iniciativa dela.",
    tone: "good",
  },
  {
    feature: "Forma Selvagem",
    when: "só em forma de besta",
    text: "Você troca CA, PV e atributos físicos pelos da besta e mantém Inteligência, Sabedoria, Carisma e as suas proficiências de salvaguarda e perícia. Os sentidos especiais (visão no escuro, por exemplo) são os da besta, não os seus.",
    tone: "info",
  },
  {
    feature: "Caminho da Floresta",
    when: null,
    text: "Terreno difícil não mágico não custa movimento extra e você tem vantagem nas salvaguardas contra plantas que prendem.",
    tone: "good",
  },
  {
    feature: "Proteção Natural",
    when: null,
    text: "Você não pode ser enfeitiçado nem amedrontado por elementais e fadas, e é imune a veneno e doença.",
    tone: "good",
  },
  {
    feature: "Santuário Natural",
    when: "quando uma besta ou criatura-planta atacar você",
    text: "Ela faz salvaguarda de Sabedoria contra a CD das suas magias de druida; falhando, escolhe outro alvo ou erra automaticamente. Em caso de sucesso, fica imune por 24 horas.",
    tone: "good",
  },
  {
    feature: "Ataque Primordial",
    when: "só em forma de besta",
    text: "Seus ataques contam como mágicos para superar resistência e imunidade.",
    tone: "good",
  },
  {
    feature: "Espírito Totêmico",
    when: "só para quem estiver dentro da aura do espírito",
    text: "O benefício do espírito que você invocou vale enquanto a criatura estiver na aura — fora dela, não.",
    tone: "good",
  },
  {
    feature: "Invocador Poderoso",
    when: "nas criaturas que você invoca",
    text: "Elas ganham PV extras e os ataques delas contam como mágicos.",
    tone: "good",
  },
  {
    feature: "Totalmente Estrelado",
    when: "só em Forma Estelar",
    text: "Resistência a dano de concussão, cortante e perfurante.",
    tone: "good",
  },
  {
    feature: "Afinidade Elemental",
    when: "ao gastar 1 ponto de feitiçaria (dura 1 hora)",
    text: "Resistência ao dano do seu ancestral dracônico.",
    tone: "good",
  },
  { feature: "Marés de Caos", when: "1×/descanso longo, antes de rolar", text: "Vantagem numa jogada de ataque, teste de habilidade ou salvaguarda.", tone: "good" },
  { feature: "Olhos da Escuridão", when: null, text: "Visão no escuro de 36 metros.", tone: "info" },
  {
    feature: "Cão do Mau Presságio",
    when: "enquanto o cão estiver a até 1,5 m do alvo",
    text: "O alvo tem desvantagem nas salvaguardas contra as suas magias.",
    tone: "good",
  },
  {
    feature: "Forma Umbral",
    when: "só com a Forma Umbral ligada (ação bônus, 1 minuto)",
    text: "Resistência a todo dano exceto de energia e radiante, e você atravessa criaturas e objetos como terreno difícil.",
    tone: "good",
  },
  { feature: "Coração da Tempestade", when: null, text: "Resistência a dano elétrico e trovejante.", tone: "good" },
  { feature: "Alma do Vento", when: null, text: "Imunidade a dano elétrico e trovejante.", tone: "good" },
  {
    feature: "Defesas Psíquicas",
    when: null,
    text: "Resistência a dano psíquico e vantagem nas salvaguardas contra ser amedrontado ou enfeitiçado.",
    tone: "good",
  },
  {
    feature: "Superioridade em Combate",
    when: "só ao gastar um dado de superioridade numa manobra que você conhece",
    text: "O bônus vem da manobra usada — a ficha lista todas as manobras do livro, mas valem só as que você escolheu. Os dados voltam no descanso curto ou longo.",
    tone: "info",
  },
  {
    feature: "Flecha Mágica",
    when: "ao disparar uma flecha não mágica de arco curto ou longo",
    text: "Ela conta como mágica para superar resistência e imunidade.",
    tone: "good",
  },
  {
    feature: "Nascido para a Sela",
    when: null,
    text: "Vantagem nas salvaguardas para não cair da sua montaria.",
    tone: "good",
  },
  {
    feature: "Marca Inabalável",
    when: "enquanto a criatura marcada estiver a até 1,5 m de você",
    text: "Ela tem desvantagem em qualquer ataque que não seja contra você.",
    tone: "good",
  },
  {
    feature: "Espírito Guerreiro",
    prefix: true,
    when: "ação bônus (usos limitados por descanso longo)",
    text: "Vantagem nas jogadas de ataque com arma até o fim do turno, mais PV temporários.",
    tone: "good",
  },
  { feature: "Mente Protegida", when: null, text: "Resistência a dano psíquico.", tone: "good" },
  {
    feature: "Poderio Gigante",
    when: "só com Poderio Gigante ligado (ação bônus, 1 minuto)",
    text: "Você fica Grande, tem vantagem em testes e salvaguardas de Força e soma dano extra uma vez por turno.",
    tone: "good",
  },
  {
    feature: "Entalhador de Runas",
    when: "enquanto estiver usando ou carregando o item com a runa",
    text: "Cada runa dá o próprio benefício, e só as runas que você gravou valem.",
    tone: "good",
  },
  {
    feature: "Mira Firme",
    when: "ação bônus, gastando metade do deslocamento",
    text: "Vantagem na sua próxima jogada de ataque neste turno.",
    tone: "good",
  },
  {
    feature: "Elusivo",
    when: null,
    text: "Nenhuma jogada de ataque tem vantagem contra você — a não ser que você esteja incapacitado.",
    tone: "good",
  },
  {
    feature: "Furtividade Suprema",
    when: "se não se mover mais do que metade do deslocamento no turno",
    text: "Vantagem no teste de Destreza (Furtividade).",
    tone: "good",
  },
  {
    feature: "Assassinar",
    when: "contra criaturas que ainda não agiram no combate",
    text: "Vantagem nas jogadas de ataque; e todo acerto numa criatura surpresa é crítico.",
    tone: "good",
  },
  {
    feature: "Combatente Perspicaz",
    when: "depois de estudar a criatura (ação bônus) e passar no teste",
    text: "Você pode usar o Ataque Furtivo nela mesmo sem vantagem — mas não se estiver com desvantagem.",
    tone: "good",
  },
  {
    feature: "Mestre da Emboscada",
    when: null,
    text: "Vantagem nas jogadas de iniciativa. No 1º turno do combate, o ataque contra quem ainda não agiu tem vantagem e, se acertar, os ataques contra esse alvo têm vantagem até o início do seu próximo turno.",
    tone: "good",
  },
  {
    feature: "Manobra Elegante",
    when: "ação bônus",
    text: "Vantagem no próximo teste de Destreza (Acrobacia) ou Força (Atletismo) do turno.",
    tone: "good",
  },
  {
    feature: "Mestre Duelista",
    when: "1×/descanso curto ou longo, ao errar um ataque",
    text: "Repita a jogada de ataque com vantagem.",
    tone: "good",
  },
  {
    feature: "Trapaceiro Versátil",
    when: "ação bônus, com a Mão do Mago sobre a criatura",
    text: "Vantagem nos ataques contra ela até o fim do turno.",
    tone: "good",
  },
  {
    feature: "Passo Fantasma",
    when: "só na forma do Passo Fantasma (ação bônus)",
    text: "Voo 3 m com pairar e os ataques contra você têm desvantagem.",
    tone: "good",
  },
  {
    feature: "Resistência à Magia",
    when: null,
    text: "Vantagem nas salvaguardas contra magias.",
    tone: "good",
  },
  {
    feature: "Acostumado à Morte-Vida",
    when: null,
    text: "Resistência a dano necrótico e seu PV máximo não pode ser reduzido.",
    tone: "good",
  },
  {
    feature: "Canção da Lâmina",
    when: "só com a Canção da Lâmina ligada (ação bônus, 1 minuto)",
    text: "Some Inteligência na CA, +3 m de deslocamento, vantagem em Acrobacia e vantagem nas salvaguardas de Constituição para manter concentração.",
    tone: "good",
  },
  {
    feature: "Um com a Palavra",
    when: "enquanto o seu grimório estiver com você",
    text: "Vantagem em todos os testes de Inteligência (Arcanismo).",
    tone: "good",
  },
  { feature: "Golpes de Chi", when: null, text: "Seus golpes desarmados contam como armas mágicas.", tone: "good" },
  { feature: "Pureza Corporal", when: null, text: "Imune a doença e a veneno.", tone: "good" },
  {
    feature: "Corpo Vazio",
    when: "ao gastar 4 pontos de chi (ação, 1 minuto)",
    text: "Invisível e com resistência a todo dano, exceto de energia.",
    tone: "good",
  },
  {
    feature: "Passo das Sombras",
    when: "ao se teleportar entre sombras (ação bônus)",
    text: "Vantagem no primeiro ataque corpo-a-corpo que fizer antes do fim do turno.",
    tone: "good",
  },
  {
    feature: "Sorte do Bêbado",
    when: "ao gastar 2 pontos de chi numa rolagem com desvantagem",
    text: "Cancela a desvantagem naquela rolagem.",
    tone: "good",
  },
  { feature: "Uno com a Lâmina", when: "com armas kensei", text: "Elas contam como mágicas.", tone: "good" },
  { feature: "Saúde Divina", when: null, text: "Imune a doenças.", tone: "good" },
  {
    feature: "Halo Sagrado",
    when: "só com o Halo Sagrado ligado (ação, 1 minuto)",
    text: "Vantagem nas salvaguardas contra magias de corruptores e mortos-vivos, e inimigos que começam o turno na aura sofrem dano radiante.",
    tone: "good",
  },
  {
    feature: "Campeão dos Anciões",
    when: null,
    text: "Inimigos a até 3 m têm desvantagem nas salvaguardas contra as suas magias de paladino e opções de Canalizar Divindade.",
    tone: "good",
  },
  {
    feature: "Conquistador Invencível",
    when: "só com a característica ligada (ação, 1 minuto, 1×/descanso longo)",
    text: "Resistência a todo dano, um ataque a mais por ação de Ataque e crítico em 19–20.",
    tone: "good",
  },
  {
    feature: "Emissário da Redenção",
    when: null,
    text: "Resistência a todo dano causado por outras criaturas, e quem causa dano a você sofre metade de volta em dano radiante.",
    tone: "good",
  },
  {
    feature: "Lenda Viva",
    when: null,
    text: "Vantagem em todos os testes de Carisma.",
    tone: "good",
  },
  {
    feature: "Baluarte Mortal",
    when: null,
    text: "Vantagem nas jogadas de ataque contra aberrações, celestiais, elementais, fadas e corruptores.",
    tone: "good",
  },
  {
    feature: "Inimigo Favorito",
    when: "contra o seu inimigo favorito",
    text: "Vantagem em Sobrevivência para rastreá-lo e em Inteligência para lembrar informações sobre ele.",
    tone: "good",
  },
  {
    feature: "Sentidos Selvagens",
    when: "ao atacar uma criatura que você não consegue ver",
    text: "Não sofre a desvantagem por não vê-la (mas ainda erra se ela não estiver onde você mirou).",
    tone: "good",
  },
  {
    feature: "Táticas Defensivas",
    when: "só a opção que você escolheu",
    text: "Fuga da Horda: ataques de oportunidade contra você têm desvantagem. Defesa contra Ataque Múltiplo: +4 de CA contra os ataques seguintes da mesma criatura no turno. Vontade de Aço: vantagem nas salvaguardas contra ficar amedrontado.",
    tone: "good",
  },
  {
    feature: "Treinamento Excepcional",
    when: null,
    text: "Os ataques do seu companheiro animal contam como mágicos.",
    tone: "good",
  },
  {
    feature: "Visão Umbral",
    when: null,
    text: "Visão no escuro de 18 m (ou +9 m, se você já tinha). Na escuridão você fica invisível para quem depende de visão no escuro para enxergar ali.",
    tone: "good",
  },
  {
    feature: "Evasiva Sombria",
    when: "reação, quando alguém ataca você sem ter vantagem",
    text: "Impõe desvantagem nessa jogada de ataque.",
    tone: "good",
  },
  {
    feature: "Defesa Espectral",
    when: "reação, ao sofrer dano de um ataque",
    text: "Resistência a todo o dano desse ataque neste turno.",
    tone: "good",
  },
  {
    feature: "Distorcer Engodo",
    when: null,
    text: "Vantagem nas salvaguardas contra ser amedrontado ou enfeitiçado.",
    tone: "good",
  },
  {
    feature: "Dispersão do Enxame",
    when: "reação, ao sofrer dano",
    text: "Resistência a esse dano.",
    tone: "good",
  },
];
