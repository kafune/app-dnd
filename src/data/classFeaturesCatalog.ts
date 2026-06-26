/**
 * Descrições das características de classe (D&D 5e, PT-BR / SRD).
 *
 * O catálogo de classes (`classesCatalog.json`) lista apenas os *nomes* das
 * características ganhas por nível. Aqui guardamos as descrições, casadas pelo
 * nome normalizado — qualificadores entre parênteses e indicadores de nível
 * (ex.: "(d8)", "(+1 dado)", "(um uso)") são ignorados na busca, de modo que
 * "Inspiração de Bardo (d8)" cai na mesma descrição de "Inspiração de Bardo".
 */

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    // remove qualificadores entre parênteses e indicadores de nível/uso ao final
    .replace(/\([^)]*\)/g, "")
    .replace(/\s*\d+°?\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const RAW: Record<string, string> = {
  // === Genéricas (várias classes) ===
  "Incremento no Valor de Habilidade":
    "Você pode aumentar um valor de habilidade à sua escolha em 2, ou dois valores de habilidade à sua escolha em 1. Nenhum valor pode passar de 20 com este recurso. Alternativamente, você pode escolher um talento no lugar do incremento.",
  "Conjuração":
    "Você consegue conjurar magias. Use a tabela da sua classe para saber quantos truques e espaços de magia possui. Sua habilidade de conjuração define a CD de resistência (8 + bônus de proficiência + modificador) e o bônus de ataque mágico (bônus de proficiência + modificador) das suas magias.",
  "Ataque Extra":
    "Você pode atacar duas vezes, em vez de uma, sempre que realizar a ação de Ataque no seu turno.",

  // === Bruxo ===
  "Patrono Transcendental":
    "No 1º nível você fez um pacto com um ser sobrenatural à sua escolha (Arquifada, Corruptor ou Grande Antigo). Sua escolha concede características no 1º nível e novamente nos níveis 6, 10 e 14.",
  "Magia de Pacto":
    "Seu acesso à magia é regido pelo pacto com seu patrono. Você possui espaços de magia que recuperam ao terminar um descanso curto OU longo, e todos eles são do mesmo nível (o nível mais alto que você pode conjurar). Carisma é sua habilidade de conjuração.",
  "Invocações Místicas":
    "Fragmentos de conhecimento proibido que conferem habilidades mágicas permanentes. No 2º nível você aprende duas invocações à sua escolha; você ganha mais invocações conforme sobe de nível e pode trocar uma já conhecida ao subir de nível.",
  "Dádiva do Pacto":
    "No 3º nível seu patrono concede um presente: Pacto da Corrente (familiar especial), Pacto da Lâmina (invocar uma arma de pacto) ou Pacto do Grimório (livro com truques adicionais).",
  "Arcana Mística":
    "A partir do 11º nível você ganha uma magia arcana de nível superior que pode conjurar uma vez sem gastar espaço de magia, recuperando o uso ao terminar um descanso longo. Você ganha magias de níveis mais altos nos níveis 13, 15 e 17.",
  "Mestre Místico":
    "No 20º nível você pode, uma vez por descanso curso ou longo, pedir ao seu patrono que recupere alguns dos seus espaços de Magia de Pacto como ação.",
  "Característica de Patrono Transcendental":
    "Característica concedida pelo seu patrono (Arquifada, Corruptor ou Grande Antigo). Consulte a descrição da sua subclasse para os detalhes do nível correspondente.",

  // === Comuns de outras classes (amostra útil) ===
  "Fúria":
    "Como ação bônus você entra em fúria, ganhando vantagem em testes e salvaguardas de Força, bônus de dano corpo a corpo e resistência a dano de concussão, cortante e perfurante. Dura até 1 minuto.",
  "Defesa sem Armadura":
    "Quando não estiver usando armadura, sua CA é calculada de forma especial pela sua classe (geralmente 10 + modificador de Destreza + modificador de Constituição/Sabedoria).",
  "Estilo de Luta":
    "Você adota um estilo de combate à sua escolha (ex.: Arquearia, Defesa, Duelo, Armas Grandes), ganhando um benefício permanente relacionado a ele.",
  "Surto de Ação":
    "No seu turno, você pode realizar uma ação adicional além da sua ação normal. Recupera-se ao terminar um descanso curto ou longo.",
  "Retomar o Fôlego":
    "Como ação bônus você pode recuperar pontos de vida iguais a 1d10 + seu nível de guerreiro. Recupera-se ao terminar um descanso curto ou longo.",
  "Inspiração de Bardo":
    "Como ação bônus você concede um dado de inspiração a uma criatura, que pode adicioná-lo a um teste, ataque ou salvaguarda. Número de usos igual ao seu modificador de Carisma por descanso.",
  "Ataque Furtivo":
    "Uma vez por turno você causa dano extra a um alvo que atinge com uma arma de acuidade ou à distância, desde que tenha vantagem no ataque ou um aliado adjacente ao alvo.",
  "Especialização":
    "Escolha proficiências em perícias (ou ferramentas): seu bônus de proficiência é dobrado em qualquer teste de habilidade que as utilize.",
  "Ação Ardilosa":
    "Sua agilidade permite usar uma ação bônus em cada turno para Disparar, Desengajar ou Esconder-se.",
  "Canalizar Divindade":
    "Você canaliza energia divina para alimentar efeitos mágicos, como Expulsar Mortos-Vivos. Os usos recuperam ao terminar um descanso curto ou longo.",
  "Forma Selvagem":
    "Como ação você pode assumir magicamente a forma de uma fera que já tenha visto. Você pode usar este recurso um número de vezes por descanso curto ou longo.",
  "Metamágica":
    "Você ganha a capacidade de moldar suas magias gastando pontos de feitiçaria para alterá-las (ex.: Magia Gêmea, Magia Acelerada, Magia Distante).",
  "Fonte de Magia":
    "Você possui um reservatório de energia mágica representado por pontos de feitiçaria, que pode converter em espaços de magia e vice-versa.",
  "Artes Marciais":
    "Você pode usar Destreza em vez de Força nos ataques desarmados e com armas de monge, e fazer um ataque desarmado como ação bônus após atacar.",
  "Cura pelas Mãos":
    "Você possui uma reserva de cura igual a 5 × seu nível de paladino. Com uma ação, você pode tocar uma criatura e restaurar pontos de vida dessa reserva.",
  "Sentido Divino":
    "Você percebe a presença de celestiais, corruptores e mortos-vivos fortemente bons ou maus num raio de 18 metros. O número de usos é 1 + seu modificador de Carisma por descanso longo.",
  "Inimigo Favorito":
    "Você tem vantagem em testes de Sabedoria (Sobrevivência) para rastrear seus inimigos favoritos e em testes de Inteligência para lembrar informações sobre eles.",
  "Explorador Natural":
    "Você é um mestre na navegação por um tipo de terreno favorito, ignorando diversas penalidades de viagem e exploração nesse ambiente.",
};

const BY_NAME = new Map<string, string>(
  Object.entries(RAW).map(([k, v]) => [norm(k), v]),
);

/** Descrição de uma característica de classe pelo nome (ignora qualificadores). */
export function findClassFeatureDescription(name: string): string {
  return BY_NAME.get(norm(name)) ?? "";
}
