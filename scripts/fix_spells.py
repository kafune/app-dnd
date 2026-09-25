#!/usr/bin/env python3
"""
Correções manuais do src/data/spellsCatalog.json depois do parse_spells.py.

O OCR do Guia de Xanathar (duas colunas, quadros laterais) grudou magias umas
nas outras: o fim de uma página caía dentro da magia anterior, com o título da
seguinte em CAIXA ALTA no meio da descrição ("Tremor de Terra … VENDAVAL raio,
9 metros…"). Nove magias do livro nem existiam como entrada própria, então
apareciam dentro de outras, com o círculo errado. Este script:

  - corta de cada descrição o texto que era de outra magia e o lixo do OCR
    (cabeçalho "CAPÍTULO 3 | MAGIAS", restos de marca d'água);
  - cria as magias que faltavam com o texto que estava grudado, completando
    com um resumo curto da regra onde o OCR perdeu o começo;
  - acerta círculo e cabeçalho de Invocar Prole Sombria e Invocar Fera (Tasha).

É idempotente: rodar de novo não muda nada. Uso:
  python3 scripts/fix_spells.py [src/data/spellsCatalog.json]
"""
import json
import sys

PATH = sys.argv[1] if len(sys.argv) > 1 else "src/data/spellsCatalog.json"

with open(PATH, encoding="utf-8") as f:
    spells = json.load(f)
by_name = {s["name"]: s for s in spells}


def spell(name):
    return by_name[name]


def cut(name, marker):
    """Devolve (antes, depois) do marcador na descrição; o 'antes' fica na magia."""
    s = spell(name)
    desc = s["description"]
    if marker not in desc:
        return None
    before, after = desc.split(marker, 1)
    s["description"] = before.rstrip()
    return after


def replace(name, old, new):
    s = spell(name)
    if old in s["description"]:
        s["description"] = s["description"].replace(old, new)


def between(text, start, end=None):
    i = text.index(start)
    j = text.index(end, i) if end else len(text)
    return text[i:j]


def add(entry):
    if entry["name"] in by_name:
        return
    entry.setdefault("ritual", False)
    entry.setdefault("concentration", entry["duration"].lower().startswith("concentração"))
    ordered = {k: entry[k] for k in (
        "name", "level", "school", "castingTime", "range", "components", "duration",
        "description", "ritual", "concentration", "source", "classes",
    )}
    spells.append(ordered)
    by_name[entry["name"]] = ordered


CHAPTER = "CAPÍTULO 3 I MAGIAS"

# --- Tremor de Terra (1º) levava o Vendaval (7º) inteiro ----------------------
rest = cut("Tremor de Terra", " VENDAVAL\n\n")
if rest is not None:
    add({
        "name": "Vendaval",
        "level": 7,
        "school": "Evocação",
        "castingTime": "1 ação",
        "range": "90 metros",
        "components": "V, M (um pedaço de palha)",
        "duration": "Concentração, até 1 minuto",
        "description": (
            "Um redemoinho uivante desce sobre um ponto no solo que você possa ver, dentro do alcance. "
            "O vendaval é um cilindro de 3 metros de " + rest.strip()
        ).replace("puxada 1,5 metros para o alvo dentro dele ,", "puxada 1,5 metro para o alto dentro dele,")
         .replace("num tumo", "num turno"),
        "source": "XGtE",
        "classes": ["Druida", "Feiticeiro", "Mago"],
    })

# --- Raio de Caos levava o quadro de estatísticas do Pequeno Servo -------------
rest = cut("Raio de Caos", "\n\n-•\n\nPEQUENO SERVO")
replace(
    "Raio de Caos",
    "como mostrado abaixo. d8\n\nTipo de Dano\n\n1\n\nÁcido\n\n2\n\nFrio\n\n3\n\nFogo\n\n4\n\nEnergia\n\n"
    "5 6 7 8\n\nElétrico Veneno Psíquico Trovejante\n\n",
    "como mostrado abaixo (d8 — tipo de dano): 1 ácido; 2 frio; 3 fogo; 4 energia; 5 elétrico; "
    "6 veneno; 7 psíquico; 8 trovejante. ",
)
servo = spell("Pequeno Servo")
if "Estatísticas do Pequeno Servo" not in servo["description"]:
    servo["description"] = (
        servo["description"].replace(" " + CHAPTER, "").replace(" (na página 169)", " (abaixo)").rstrip()
        + "\n\nEstatísticas do Pequeno Servo. Construto Miúdo, sem alinhamento. Classe de Armadura 15 "
        "(armadura natural). Pontos de Vida 10 (4d4). Deslocamento 9 m, escalar 9 m. FOR 4 (-3), DES 16 (+3), "
        "CON 10 (+0), INT 2 (-4), SAB 10 (+0), CAR 1 (-5). Imunidades a Danos veneno, psíquico. Imunidades a "
        "Condições cego, encantado, surdo, exausto, amedrontado, paralisado, petrificado, envenenado. Sentidos "
        "visão às cegas 18 m (cego além desse raio), Percepção passiva 10. Idiomas —. Ações: Pancada. Ataque "
        "Corpo-a-Corpo com Arma: +5 para atingir, alcance 1,5 m, um alvo. Acerto: 5 (1d4 + 3) de dano de concussão."
    )

# --- Cabeçalho de página no meio do texto ---------------------------------------
for name in ("Vínculo com a Besta", "Espírito Curativo", "Invocar Demônios Menores", "Manto de Pedra",
             "Ossos da Terra", "Coroa de Estrelas"):
    replace(name, " " + CHAPTER + "\n\n", " ")
    replace(name, CHAPTER + "\n\n", "")
    replace(name, " " + CHAPTER, "")
replace("Manto de Pedra", "LÂMINA SOMBRIA\n\n", "")
replace("Coroa de Estrelas", "acima do 4 o.", "acima do 7º.")
spell("Cerimônia")["range"] = "Toque"

# --- Erupção de Terra: título de outra magia no meio da frase -------------------
replace("Erupção de Terra", "C~da porção de 1,5 metros quadrados da área requer pelo\n\nENCONTRAR MONTARIA MAIOR\n\nmenos 1 minuto para ~ er limpa",
        "Cada porção de 1,5 metro quadrado da área requer pelo menos 1 minuto para ser limpa")

# --- Infestar de Inimigos (3º) levava a Inundação de Energia Negativa (5º) ------
rest = cut("Infestar de Inimigos", " INUNDAÇÃO DE ENERGIA NEGATIVA")
if rest is not None:
    add({
        "name": "Inundação de Energia Negativa",
        "level": 5,
        "school": "Necromancia",
        "castingTime": "1 ação",
        "range": "18 metros",
        "components": "V, M (um osso quebrado e um quadrado de seda negra)",
        "duration": "Instantânea",
        "description": between(rest, "Você envia fitas")
            .replace("fazer um lance de salvação da Constituição, levando 5d12 dano necrótico",
                     "realizar um teste de resistência de Constituição, sofrendo 5d12 de dano necrótico")
            .replace("levanta como um zumbi", "se levanta como um zumbi")
            .replace("seu próximo tumo", "seu próximo turno")
            .replace("morto vivo ,", "morto-vivo,"),
        "source": "XGtE",
        "classes": ["Bruxo", "Mago"],
    })

replace("Invocar Demônios Menores",
        "Role na tabela a seguir para determinar o que aparece. d6\n\nDemônios Invocados\n\n1-2\n\nDois demônios de classificação de desafio 1 ou menor\n\n3-4\n\nQuatro demônios de classificação de desafio 1/2 ou menor\n\n5-6\n\nOito demônios de classificação de desafio 1/4 ou menor\n\n",
        "Role um d6 para determinar o que aparece: 1-2, dois demônios de classificação de desafio 1 ou menor; "
        "3-4, quatro demônios de classificação de desafio 1/2 ou menor; 5-6, oito demônios de classificação de desafio 1/4 ou menor. ")
replace("Invocar Demônios Menores", "do g o ou g o nível", "do 8º ou 9º nível")

# --- Esfera Cáustica (4º) levava a Esfera Tempestuosa (4º) ----------------------
esfera = spell("Esfera Cáustica")
if "ESFERA TEMPESTUOSA" in esfera["description"]:
    rest = esfera["description"].split("ESFERA TEMPESTUOSA", 1)[1]
    esfera["description"] = (
        esfera["description"].split(" Em Níveis Superiores.", 1)[0]
        + " Em Níveis Superiores. Quando você conjura essa magia usando um espaço de magia de 5º nível ou "
        "superior, o dano inicial aumenta em 2d4 para cada nível do espaço acima do 4º."
    )
    add({
        "name": "Esfera Tempestuosa",
        "level": 4,
        "school": "Evocação",
        "castingTime": "1 ação",
        "range": "45 metros",
        "components": "V, S",
        "duration": "Concentração, até 1 minuto",
        "description": between(rest, "Uma esfera de 6 metros")
            .replace("seus tumos", "seus turnos"),
        "source": "XGtE",
        "classes": ["Feiticeiro", "Mago"],
    })

# --- Guardião da Natureza (4º) levava a Imolação (5º) ---------------------------
rest = cut("Guardião da Natureza", " IMOLAÇÃO")
if rest is not None:
    add({
        "name": "Imolação",
        "level": 5,
        "school": "Evocação",
        "castingTime": "1 ação",
        "range": "27 metros",
        "components": "V",
        "duration": "Concentração, até 1 minuto",
        "description": between(rest, "Chamas rodeiam")
            .replace("dos tumos dele", "dos turnos dele")
            .replace("mews não mágicos", "meios não mágicos"),
        "source": "XGtE",
        "classes": ["Feiticeiro", "Mago"],
    })

# --- Chamado Infernal: parte perdida no meio e nível errado no texto ------------
replace("Chamado Infernal", "O mestre tem as estatísticas da criatura.\n\nda magia,",
        "O mestre tem as estatísticas da criatura. Em cada um dos seus turnos, você pode tentar dar um comando "
        "verbal ao demônio (não exige ação). Ele obedece se o resultado provável combinar com os desejos dele; "
        "caso contrário, você faz um teste de Carisma (Enganação, Intimidação ou Persuasão) resistido por um "
        "teste de Sabedoria (Intuição) do demônio, com vantagem se disser o nome verdadeiro dele. Se o seu teste "
        "falhar, o demônio fica imune aos seus comandos verbais pela duração da magia,")
replace("Chamado Infernal", "acima do 2 o.", "acima do 5º.")

# --- Controlar os Ventos: lixo do OCR e título da Dança Macabra -----------------
ventos = spell("Controlar Os Ventos")
if "DANÇA MACABRA" in ventos["description"]:
    head = ventos["description"].split("Ventos Ascendentes.", 1)[0]
    tail = ventos["description"].split("Ventos Descendentes.", 1)[1]
    ventos["description"] = (
        head + "Ventos Ascendentes. Você cria uma corrente de ar ascendente constante dentro do cubo, subindo "
        "a partir da face inferior. Criaturas que terminam uma queda dentro do cubo sofrem apenas metade do dano "
        "de queda. Quando uma criatura no cubo faz um salto vertical, ela pode saltar até 3 metros mais alto "
        "que o normal. Ventos Descendentes." + tail
    ).replace(" tumo", " turno")

# --- Enervação (5º) levava o Enfeitiçar Monstro (4º) ----------------------------
ener = spell("Enervação")
if "Componentes: V, S Duração: 1 hora" in ener["description"]:
    rest = ener["description"].split("Componentes: V, S Duração: 1 hora", 1)[1]
    ener["description"] = ener["description"].split(" \"'s,", 1)[0].rstrip()
    add({
        "name": "Enfeitiçar Monstro",
        "level": 4,
        "school": "Encantamento",
        "castingTime": "1 ação",
        "range": "9 metros",
        "components": "V, S",
        "duration": "1 hora",
        "description": rest.strip()
            .replace("dentro alcance", "dentro do alcance")
            .replace("quando você às incluir", "quando você as incluir"),
        "source": "XGtE",
        "classes": ["Bardo", "Bruxo", "Druida", "Feiticeiro", "Mago"],
    })

# --- Estática Sináptica (5º) levava a Evaporação de Abi-Dalzim (8º) -------------
rest = cut("Estática Sináptica", " EVAPORAÇÃO DE ABI- DALZIM- DALZIM")
if rest is not None:
    add({
        "name": "Evaporação de Abi-Dalzim",
        "level": 8,
        "school": "Necromancia",
        "castingTime": "1 ação",
        "range": "45 metros",
        "components": "V, S, M (um pedaço de esponja)",
        "duration": "Instantânea",
        "description": between(rest, "Você suga")
            .replace("humidade", "umidade")
            .replace("Constructos", "Construtos"),
        "source": "XGtE",
        "classes": ["Feiticeiro", "Mago"],
    })

# --- Manto de Vento: os benefícios do meio se perderam --------------------------
replace("Manto de Vento", "os seguintes beneficios:\n\nresistência de Força.",
        "os seguintes benefícios: • Ataques à distância com arma feitos contra você têm desvantagem. • Você "
        "ganha deslocamento de voo de 18 metros; se ainda estiver voando quando a magia acabar, você cai, a menos "
        "que tenha outro meio de se manter no ar. • Você pode usar sua ação para criar um cubo de 4,5 metros de "
        "vento rodopiante centrado num ponto que você possa ver a até 18 metros. Cada criatura na área deve "
        "realizar um teste de resistência de Força.")

# --- Prisão Mental (6º) levava a Proteção Primordial (6º) -----------------------
prisao = spell("Prisão Mental")
if "PROTEÇÃO PRIMORDIAL" in prisao["description"]:
    rest = prisao["description"].split("PROTEÇÃO PRIMORDIAL", 1)[1]
    prisao["description"] = (
        prisao["description"].split("o alvo recebe 10d10 de dano psíquico", 1)[0]
        + "o alvo recebe 10d10 de dano psíquico e a magia termina."
    ).replace("magia temlina", "magia termina")
    add({
        "name": "Proteção Primordial",
        "level": 6,
        "school": "Abjuração",
        "castingTime": "1 ação",
        "range": "Pessoal",
        "components": "V, S",
        "duration": "Concentração, até 1 minuto",
        "description": between(rest, "Você tem resistência"),
        "source": "XGtE",
        "classes": ["Druida"],
    })

# --- Templo dos Deuses: lixo do OCR no meio de uma frase -------------------------
templo = spell("Templo dos Deuses")
if "rola gé t" in templo["description"]:
    head = templo["description"].split("sempre que ela fizer uma rola", 1)[0]
    tail = templo["description"].split("subtrair o número rolado da rolagem de um d20.", 1)[1]
    templo["description"] = (
        head + "sempre que ela fizer uma jogada de ataque, um teste de habilidade ou um teste de resistência "
        "dentro do templo, ela deve rolar um d4 e subtrair o número rolado da jogada de d20." + tail
    )
spell("Templo dos Deuses")["components"] = "V, S, M (um símbolo sagrado valendo, no mínimo, 5 po)"

# --- Escuridão Enlouquecedora: lixo do OCR ---------------------------------------
escuridao = spell("Escuridão Enlouquecedora")
if "Grunhidos" in escuridao["description"] and "~" in escuridao["description"]:
    escuridao["description"] = (
        "A escuridão mágica se espalha a partir de um ponto que você escolher dentro do alcance para preencher "
        "uma esfera de 18 metros de raio até que a magia termine. A escuridão se espalha dobrando esquinas. Uma "
        "criatura com visão no escuro não consegue ver através dessa escuridão. Luz não mágica, assim como luz "
        "criada por magias de 8º nível ou inferior, não consegue iluminar a área. "
        + between(escuridao["description"], "Grunhidos")
    )

# --- Fortaleza Poderosa (8º) levava a Gaiola da Alma (6º) ------------------------
forte = spell("Fortaleza Poderosa")
if "GAIOLA nA ALMA" in forte["description"]:
    desc = forte["description"]
    head = desc.split("Cada painel é contíguo", 1)[0]
    middle = between(desc, "Cada um dos pisos", " GAIOLA nA ALMA")
    rest = desc.split("GAIOLA nA ALMA", 1)[1]
    forte["description"] = (
        head + "Cada painel é contíguo a dois outros painéis, ou a um painel e uma torre. Você pode colocar até "
        "quatro portas de pedra na parede exterior da fortaleza. Um pequeno forte fica dentro da área fechada. "
        "O forte tem base quadrada de 15 metros de lado e três andares com 3 metros de pé-direito. "
        + middle
    )
    for old, new in [
        ("pare~es", "paredes"), ("mtenores", "interiores"), ("com? você", "como você"), ("pe_ssoas", "pessoas"),
        ("cnados", "criados"), ("qu~que~", "qualquer"), ("voce _designa quand~", "você designa quando"),
        ("funcwna como se cnado", "funciona como se criado"), ("magiaem ~gum ~utro", "magia em algum outro"),
        ("mofensivamente", "inofensivamente"), ("1,54 centímetros", "30 centímetros"),
    ]:
        forte["description"] = forte["description"].replace(old, new)
    soul = between(rest, "Esta magia arrebata")
    for old, new in [
        ("à m~dida que elt~ morre", "à medida que ele morre"), ("ga~ola que voce", "gaiola que você"),
        ("Um~ alma ~oubada", "Uma alma roubada"), ("magi~ termma: ou", "magia terminar ou"),
        ("termma a mag~a", "termina a magia"), ("de_scrita abaixo. _Yocê", "descrita abaixo. Você"),
        ("Depms", "Depois"), ("alm~ , ~ stá presa", "alma está presa"),
        ("n~<?!P.Pfie ser revivido", "não pode ser revivido"), ("'Roubar a Vida", "Roubar a Vida"),
        ("p _a ra", "para"), ("?reve", "breve"), ("mdependentemente", "independentemente"),
        ("conhe?e o 9-ue sabia", "conhece o que sabia"), ("smcendade", "sinceridade"),
        ("respo~ta r:ã? é", "resposta não é"), ("enigmatlca. _Emprestar", "enigmática. Emprestar"),
        ("Vocé pode usar uma ação bonus", "Você pode usar uma ação bônus"),
        ("da ~ma,_ fazendo ~':la próxima rolagem de ataque, venficaçao de habilidade ou teste de resistência.",
         "da alma, ganhando vantagem na sua próxima jogada de ataque, teste de habilidade ou teste de resistência."),
        (" " + CHAPTER + "\n\n", " "), ("\n\nda gaiola", " da gaiola"),
    ]:
        soul = soul.replace(old, new)
    add({
        "name": "Gaiola da Alma",
        "level": 6,
        "school": "Necromancia",
        "castingTime": "1 reação, que você faz quando um humanoide que você possa ver a até 18 metros de você morre",
        "range": "18 metros",
        "components": "V, S, M (uma pequena gaiola de prata valendo, no mínimo, 100 po)",
        "duration": "8 horas",
        "description": soul,
        "source": "XGtE",
        "classes": ["Bruxo", "Mago"],
    })

# --- Grito Psíquico: lixo no fim --------------------------------------------------
grito = spell("Grito Psíquico")
if "ato\" d oa" in grito["description"]:
    grito["description"] = (
        grito["description"].split("Em um sucesso, o efeito", 1)[0].replace("cada uma d . s, seus tumos", "cada um dos seus turnos")
        + "Em um sucesso, o efeito de atordoamento termina."
    )

# --- Invulnerabilidade (9º) levava a Ira da Natureza (5º) -------------------------
inv = spell("Invulnerabilidade")
if "IRA DA NATUREZA" in inv["description"]:
    rest = inv["description"].split("FORTALEZA PODEROSA", 1)[1]
    inv["description"] = "Você é imune a todo tipo de dano até a magia terminar."
    add({
        "name": "Ira da Natureza",
        "level": 5,
        "school": "Evocação",
        "castingTime": "1 ação",
        "range": "36 metros",
        "components": "V, S",
        "duration": "Concentração, até 1 minuto",
        "description": (
            "Você desperta os espíritos da natureza num cubo de 18 metros centrado num ponto que você possa ver, "
            "dentro do alcance. As árvores, rochas e plantas no cubo ganham os efeitos a seguir até a magia "
            "acabar. " + rest.strip()
        ).replace("seus tumos", "seus turnos").replace("a s e lançar", "se lançar"),
        "source": "XGtE",
        "classes": ["Druida", "Patrulheiro"],
    })

# --- Bosque de Druida: lixo do OCR no meio ---------------------------------------
bosque = spell("Bosque de Druida")
if "CQ , 1m bolos" in bosque["description"]:
    head = bosque["description"].split("exceto que áS não podem falar", 1)[0]
    tail = bosque["description"].split("\n\ncomandos falados", 1)[1]
    bosque["description"] = (
        head + "exceto que não podem falar, e sua casca é coberta de símbolos druídicos. Se alguma criatura que "
        "não seja imune a este efeito entrar na área protegida, os guardiões do bosque lutam até expulsar ou "
        "matar os intrusos. Os guardiões do bosque também obedecem aos seus comandos falados" + tail
    ).replace("as <'irvores", "as árvores").replace("\n\n", " ")

# --- Começos que o OCR perdeu (a página anterior levou) ---------------------------
LEADS = {
    "Lufada": (
        "persianas ou suas roupas",
        "Você toma o controle do ar e cria um dos efeitos a seguir num ponto que você possa ver, dentro do "
        "alcance: • Uma criatura Média ou menor, à sua escolha, deve ser bem-sucedida num teste de resistência "
        "de Força ou será empurrada até 1,5 metro para longe de você. • Um pequeno sopro de ar move um objeto "
        "que não esteja sendo vestido nem carregado e que pese até 2,5 quilos: ele é empurrado até 3 metros "
        "para longe de você, sem força para causar dano. • Um efeito sensorial inofensivo com o ar, como fazer "
        "folhas farfalharem, portas e ",
    ),
    "Moldar Terra": (
        "dano. •",
        "Você escolhe uma porção de terra ou pedra que você possa ver, dentro do alcance, e que caiba num cubo "
        "de 1,5 metro. Você a manipula de uma das seguintes formas: • Se escolher uma área de terra solta, você "
        "pode escavá-la instantaneamente, movê-la pelo chão e depositá-la a até 1,5 metro. Esse movimento não "
        "tem força suficiente para causar ",
    ),
    "Diabo da Poeira": (
        "da poeira se mover",
        "Escolha um cubo desocupado de 1,5 metro de ar que você possa ver, dentro do alcance. Uma força "
        "elemental semelhante a um redemoinho de poeira surge no cubo e permanece pela duração da magia. "
        "Qualquer criatura que termine seu turno a até 1,5 metro do diabo da poeira deve realizar um teste de "
        "resistência de Força: se falhar, sofre 1d8 de dano de concussão e é empurrada 3 metros para longe; se "
        "obtiver sucesso, sofre metade do dano e não é empurrada. Com uma ação bônus, você pode mover o diabo "
        "da poeira até 9 metros em qualquer direção. Se o diabo ",
    ),
    "Passo Trovejante": (
        "peso não exceda",
        "Você se teleporta para um espaço desocupado que você possa ver, dentro do alcance. Logo que você "
        "some, um estrondo ecoa: cada criatura a até 3 metros do espaço que você deixou deve realizar um teste "
        "de resistência de Constituição, sofrendo 3d10 de dano trovejante se falhar, ou metade desse dano se "
        "obtiver sucesso. O trovão pode ser ouvido a até 90 metros. Você leva consigo os objetos que estiver "
        "vestindo ou carregando, desde que o ",
    ),
    "Invocar Demônio Maior": (
        "ou um balgura.",
        "Você pronuncia palavras profanas, invocando um demônio do caos do Abismo. Você escolhe o tipo do "
        "demônio, que deve ter classificação de desafio 5 ou inferior, como um demônio das sombras ",
    ),
    "Sombra de Transtorno": (
        "sombras tomam luz fraca",
        "Sombras semelhantes a chamas envolvem seu corpo até a magia terminar, deixando você densamente "
        "obscurecido para os outros. As ",
    ),
}
for name, (start, lead) in LEADS.items():
    s = spell(name)
    if s["description"].startswith(start):
        s["description"] = (lead + s["description"]).replace("sombras tomam luz fraca", "sombras tornam a luz fraca")

# --- Textos com cortes de linha do OCR (parágrafo quebrado no meio) -------------
for name, old, new in [
    ("Controlar Chamas", "desses\n\ncom uma ação.", "desses com uma ação."),
    ("Infestação", "teste de resistência de\n\nConstituição", "teste de resistência de Constituição"),
    ("Laço", "a corda\n\ndesaparece", "a corda desaparece"),
    ("Dança Macabra", "médios\n\nque você", "médios que você"),
    ("Redemoinho", "e qualquer\n\ncriatura", "e qualquer criatura"),
    ("Faca de Gelo", "frio.\n\nEm Níveis", "frio. Em Níveis"),
]:
    replace(name, old, new)

# --- Cabeçalhos com erro de OCR ----------------------------------------------------
HEADERS = {
    "Lufada": {"range": "9 metros", "components": "V, S"},
    "Maremoto": {"range": "36 metros"},
    "Transmutar Pedra": {"range": "36 metros"},
    "Chuva de Bolas de Neve de Snilloc": {"range": "27 metros"},
    "Laço": {"castingTime": "1 minuto"},
    "Pequeno Servo": {"castingTime": "1 minuto"},
    "Criar Homúnculo": {"castingTime": "1 hora"},
    "Templo dos Deuses": {"castingTime": "1 hora"},
    "Diabo da Poeira": {"duration": "Concentração, até 1 minuto"},
    "Redemoinho": {"duration": "Concentração, até 1 minuto"},
    "Invocar Demônio Maior": {"duration": "Concentração, até 1 hora", "concentration": True},
    "Sombra de Transtorno": {"duration": "Concentração, até 1 minuto", "concentration": True},
    # Tasha: o cabeçalho destas duas saiu de outra magia (e a Prole Sombria é de 3º círculo).
    "Invocar Prole Sombria": {
        "level": 3,
        "range": "36m",
        "components": "V, S, M (lágrimas dentro de uma gema valendo, no mínimo, 300 po)",
        "duration": "Concentração, até 1 hora",
        "concentration": True,
    },
    "Invocar Fera": {
        "range": "27m",
        "components": "V, S, M (uma pena, um tufo de pelos e uma cauda de peixe dentro de uma bolota dourada valendo, no mínimo, 200 po)",
        "duration": "Concentração, até 1 hora",
        "concentration": True,
    },
}
for name, fields in HEADERS.items():
    spell(name).update(fields)

replace("Transferência de Vida", "acima do 2 o.", "acima do 3º.")
replace("Invocar Construto", "espaço de magia de 4° círculo", "espaço de magia de 5° círculo")
replace("Invocar Construto", "40 + 15 para cada círculo de magia acima do 3°", "40 + 15 para cada círculo de magia acima do 4°")
if spell("Invocar Construto")["description"].startswith("Manifesta em"):
    spell("Invocar Construto")["description"] = (
        "Você convoca o espírito de um construto. Ele se m" + spell("Invocar Construto")["description"][1:]
    )
replace("Invocar Fera", "Pontos de vida 40 + 10 para cada círculo de magia acima do 4°20", "Pontos de vida 20")
replace("Mortalha Espiritual", "invulneráveis.\n\nMiscelânea Mágica\n\n1d8 de dano extra",
        "invulneráveis. Até a magia acabar, qualquer ataque que você faça causa 1d8 de dano extra")
replace("Soar Os Mortos", "(3d8 ou ~~d12)", "(3d8 ou 3d12)")
replace("Catapulta", "sofrem ~~d8 de dano", "sofrem 3d8 de dano")
replace("Dança Macabra", "Manual dos 1\\tlonstros)", "Manual dos Monstros)")
# Cabeçalho de página do Tasha no meio (ou no fim) das descrições.
for s in spells:
    if s["source"] == "TCoE" and "Miscelânea Mágica" in s["description"]:
        s["description"] = s["description"].replace("\n\nMiscelânea Mágica\n\n", "\n\n").replace("\n\nMiscelânea Mágica", "")

spells.sort(key=lambda s: (s["level"], s["name"].lower()))
with open(PATH, "w", encoding="utf-8") as f:
    json.dump(spells, f, ensure_ascii=False, indent=1)
    f.write("\n")
print(f"{len(spells)} magias")
