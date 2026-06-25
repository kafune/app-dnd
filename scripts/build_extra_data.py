#!/usr/bin/env python3
"""
Conteúdo autorado (D&D 5e oficial / SRD, PT-BR) — NÃO extraído dos PDFs:
- 13 raças do "pacote comum" (Volo's/Mordenkainen), mescladas em racesCatalog.json
- descrições de TODOS os traços raciais (PHB + novas raças)
- talentos (feats) do PHB

Gera:
- src/data/racesCatalog.json  (com as raças novas e o humano variante corrigido)
- src/data/traitsCatalog.json (traços raciais + talentos, com descrição)

Uso: python3 scripts/build_extra_data.py <root_do_projeto>
"""
import json, sys, os

# === descrições de traços raciais (nome -> descrição) ===
TRAITS = {
  # Comuns
  "Visão no Escuro": "Enxerga na penumbra a até 18m como se fosse luz plena e no escuro como penumbra (só tons de cinza).",
  "Visão no Escuro Superior": "Visão no escuro com alcance de 36m.",
  "Sensibilidade à Luz Solar": "Desvantagem em ataques e em testes de Percepção (visão) sob luz solar direta.",
  "Constituição Poderosa": "Conta como uma categoria de tamanho acima para carga e peso que pode empurrar/arrastar/erguer.",
  "Ameaçador": "Você é proficiente na perícia Intimidação.",
  # Anão
  "Resiliência Anã": "Vantagem em testes de resistência contra veneno e resistência a dano de veneno.",
  "Treinamento Anão em Combate": "Proficiência com machados de batalha, machadinhas, martelos leves e martelos de guerra.",
  "Especialização em Rochas": "Dobra o bônus de proficiência em testes de Inteligência (História) sobre trabalhos em pedra.",
  "Tenacidade Anã": "Seu máximo de pontos de vida aumenta em 1 e em +1 a cada nível.",
  "Treinamento Anão com Armaduras": "Proficiência com armaduras leves e médias.",
  # Elfo
  "Sentidos Aguçados": "Você é proficiente na perícia Percepção.",
  "Ancestral Feérico": "Vantagem contra ser enfeitiçado e a magia do sono não o afeta.",
  "Transe": "Não dorme; medita 4 horas em vez de dormir 8 para o equivalente a um descanso.",
  "Treinamento Élfico com Armas": "Proficiência com espadas longas e curtas, arcos curtos e longos.",
  "Idioma Adicional": "Você fala, lê e escreve um idioma adicional à sua escolha.",
  "Pés Ligeiros": "Seu deslocamento base aumenta para 10,5m.",
  "Máscara da Natureza": "Pode se esconder mesmo apenas levemente obscurecido por folhagem, chuva, neve, névoa, etc.",
  "Magia Drow": "Conhece o truque Globos de Luz; no 3º nível conjura Fogo das Fadas e no 5º Escuridão (1x/dia, por Carisma).",
  "Treinamento Drow com Armas": "Proficiência com rapieiras, espadas curtas e bestas de mão.",
  # Halfling
  "Sortudo": "Ao rolar 1 num d20 de ataque, teste de habilidade ou resistência, role de novo e use o novo resultado.",
  "Bravura": "Vantagem em testes de resistência contra ficar amedrontado.",
  "Agilidade Halfling": "Pode se mover através do espaço de criaturas de tamanho maior que o seu.",
  "Furtividade Natural": "Pode tentar se esconder mesmo quando obscurecido só por uma criatura ao menos um tamanho maior.",
  "Resiliência dos Robustos": "Vantagem em testes de resistência contra veneno e resistência a dano de veneno.",
  # Draconato
  "Ancestral Dracônico": "Escolha um tipo de dragão; define o dano e a forma do seu sopro e a resistência associada.",
  "Arma de Sopro": "Usa uma ação para exalar energia destrutiva (CD por Constituição), 2d6 escalando com o nível.",
  "Resistência a Dano": "Resistência ao tipo de dano associado ao seu ancestral dracônico.",
  # Gnomo
  "Esperteza Gnômica": "Vantagem em testes de resistência de Int, Sab e Car contra magia.",
  "Ilusionista Nato": "Conhece o truque Ilusão Menor (conjurado com Inteligência).",
  "Falar com Bestas Pequenas": "Comunica ideias simples a bestas Pequenas ou menores.",
  "Conhecimento de Artífice": "Adiciona o dobro do bônus de proficiência em testes de Int sobre dispositivos mágicos, alquímicos ou tecnológicos.",
  "Isqueiro Mecânico": "Pode construir pequenos engenhos (isqueiro, brinquedo mecânico, caixa de música).",
  "Caixa de Música": "Pode construir uma caixa de música que toca uma única canção ao abrir.",
  # Meio-elfo / Meio-orc / Tiefling
  "Versatilidade em Perícia": "Proficiência em duas perícias à sua escolha.",
  "Resistência Implacável": "Ao cair a 0 PV (sem morrer direto), fica com 1 PV (1x por descanso longo).",
  "Ataques Selvagens": "Num acerto crítico corpo-a-corpo, role um dado de dano da arma adicional.",
  "Resistência Infernal": "Resistência a dano de fogo.",
  "Legado Infernal": "Conhece o truque Taumaturgia; no 3º nível Repreensão Infernal e no 5º Escuridão (1x/dia, por Carisma).",
  # Humano variante
  "Perícia": "Proficiência em uma perícia à sua escolha.",
  "Talento": "Você ganha um talento (feat) à sua escolha.",
  # --- Novas raças ---
  "Resistência Celestial": "Resistência a dano necrótico e radiante.",
  "Mãos Curandeiras": "Como ação, toca uma criatura e ela recupera PV igual ao seu nível (1x por descanso longo).",
  "Portador de Luz": "Conhece o truque Luz (conjurado com Carisma).",
  "Alma Radiante": "No 3º nível, pode emanar asas e causar dano radiante extra (1x por descanso longo).",
  "Alma Flagelo": "No 3º nível, libera energia radiante numa explosão ao seu redor (1x por descanso longo).",
  "Alma Necrótica": "No 3º nível, manifesta asas esqueléticas e amedronta inimigos próximos (1x por descanso longo).",
  "Resistência Montanhesa": "Resistência a dano de frio e aclimatado a grandes altitudes.",
  "Pele de Pedra": "Como reação ao sofrer dano, reduz o dano em 1d12 + Constituição (1x por descanso curto).",
  "Agilidade Felina": "Dobra a distância de movimento numa rodada (1x até se mover 0m numa rodada).",
  "Garras Felinas": "Garras como armas naturais (1d4 cortante) e deslocamento de escalada de 6m.",
  "Faro de Caçador": "Proficiência em Percepção e Furtividade.",
  "Magia Firbolg": "Conjura Detectar Magia e Disfarçar-se (por Sabedoria), 1x cada por descanso curto.",
  "Disfarce Oculto": "Como ação bônus, fica invisível por 1 turno (1x por descanso curto).",
  "Discurso Bestial e Plantas": "Pode se comunicar de forma simples com bestas e plantas.",
  "Astúcia": "Como ação bônus, pode se Esconder ou Disparar (Desengajar).",
  "Fúria dos Pequenos": "Quando acerta um alvo maior que você, causa dano extra (1x por turno).",
  "Salvação Marcial": "Quando falha numa salvaguarda perto de aliados, ganha bônus por aliado visível (1x por descanso curto).",
  "Treinamento Marcial": "Proficiência com armaduras leves e duas armas marciais à sua escolha.",
  "Membros Longos": "Seu alcance de ataques corpo-a-corpo é 1,5m maior na sua vez.",
  "Furtivo": "Você é proficiente na perícia Furtividade.",
  "Surpresa Brutal": "Causa dano extra (2d6) ao acertar uma criatura surpresa no 1º turno do combate.",
  "Táticas de Matilha": "Vantagem em ataques contra um inimigo se um aliado seu estiver a até 1,5m dele.",
  "Covardia": "Como ação, pode se encolher e dar vantagem a aliados próximos contra um inimigo (até o fim do seu turno).",
  "Agressivo": "Como ação bônus, move-se até seu deslocamento em direção a um inimigo visível.",
  "Mordida": "Mordida como arma natural (1d6 perfurante).",
  "Fabricar Itens": "Proficiência para criar itens simples a partir de partes de criaturas (escudo, etc.).",
  "Camuflagem do Pântano": "Vantagem em Furtividade em terreno pantanoso.",
  "Prender o Fôlego": "Pode prender a respiração por até 15 minutos.",
  "Faminto Voraz": "Ao comer parte de um inimigo abatido e descansar, ganha PV temporários e um bônus.",
  "Armadura Natural": "Sua CA base é 17 (não se beneficia de armadura); pode usar escudo.",
  "Garras": "Garras como armas naturais (1d4 cortante).",
  "Defesa de Casco": "Recolhe-se no casco: +4 CA, vantagem em salvaguardas de For e Con, mas fica incapacitado e com deslocamento 0.",
  "Instinto de Sobrevivência": "Proficiência na perícia Sobrevivência.",
  "Voo": "Deslocamento de voo de 15m (não pode usar armadura média/pesada para voar).",
  "Garras (Talons)": "Garras como armas naturais (1d4 cortante).",
  "Resistência Elemental": "Resistência ao tipo de dano do seu elemento (Genasi).",
  "Alcançar o Ar": "Conjura Levitação 1x por descanso longo (Genasi do Ar).",
  "Passo Cambiante": "Conjura Passos Largos 1x por descanso longo (Genasi da Terra).",
  "Filho do Fogo": "Conhece o truque Produzir Chama; no 3º nível conjura Mãos Flamejantes 1x/dia (Genasi do Fogo).",
  "Filho do Mar": "Pode respirar na água; deslocamento de natação de 9m; conjura Modelar Água (Genasi da Água).",
}

# === 13 raças novas (pacote comum) ===
A = lambda **kw: kw  # ability bonuses helper
NEW_RACES = [
  {"name":"Aasimar","abilityScoreIncrease":{"cha":2},"size":"Médio","speed":9,
   "languages":["Comum","Celestial"],
   "traits":["Visão no Escuro","Resistência Celestial","Mãos Curandeiras","Portador de Luz"],
   "subraces":[
     {"name":"Aasimar Protetor","abilityScoreIncrease":{"wis":1},"traits":["Alma Radiante"]},
     {"name":"Aasimar Flagelo","abilityScoreIncrease":{"con":1},"traits":["Alma Flagelo"]},
     {"name":"Aasimar Caído","abilityScoreIncrease":{"str":1},"traits":["Alma Necrótica"]},
   ]},
  {"name":"Golias","abilityScoreIncrease":{"str":2,"con":1},"size":"Médio","speed":9,
   "languages":["Comum","Gigante"],
   "traits":["Constituição Poderosa","Resistência Montanhesa","Pele de Pedra","Ameaçador"],"subraces":[]},
  {"name":"Tabaxi","abilityScoreIncrease":{"dex":2,"cha":1},"size":"Médio","speed":9,
   "languages":["Comum","um à escolha"],
   "traits":["Visão no Escuro","Agilidade Felina","Garras Felinas","Faro de Caçador"],"subraces":[]},
  {"name":"Firbolg","abilityScoreIncrease":{"wis":2,"str":1},"size":"Médio","speed":9,
   "languages":["Comum","Elfo","Gigante"],
   "traits":["Magia Firbolg","Disfarce Oculto","Discurso Bestial e Plantas","Constituição Poderosa"],"subraces":[]},
  {"name":"Goblin","abilityScoreIncrease":{"dex":2,"con":1},"size":"Pequeno","speed":9,
   "languages":["Comum","Goblin"],
   "traits":["Visão no Escuro","Astúcia","Fúria dos Pequenos"],"subraces":[]},
  {"name":"Hobgoblin","abilityScoreIncrease":{"con":2,"int":1},"size":"Médio","speed":9,
   "languages":["Comum","Goblin"],
   "traits":["Visão no Escuro","Salvação Marcial","Treinamento Marcial"],"subraces":[]},
  {"name":"Bugbear","abilityScoreIncrease":{"str":2,"dex":1},"size":"Médio","speed":9,
   "languages":["Comum","Goblin"],
   "traits":["Visão no Escuro","Membros Longos","Constituição Poderosa","Furtivo","Surpresa Brutal"],"subraces":[]},
  {"name":"Kobold","abilityScoreIncrease":{"dex":2,"str":-2},"size":"Pequeno","speed":9,
   "languages":["Comum","Dracônico"],
   "traits":["Visão no Escuro","Táticas de Matilha","Sensibilidade à Luz Solar","Covardia"],"subraces":[]},
  {"name":"Orc","abilityScoreIncrease":{"str":2,"con":1,"int":-2},"size":"Médio","speed":9,
   "languages":["Comum","Orc"],
   "traits":["Visão no Escuro","Agressivo","Constituição Poderosa","Ameaçador"],"subraces":[]},
  {"name":"Homem-lagarto","abilityScoreIncrease":{"con":2,"wis":1},"size":"Médio","speed":9,
   "languages":["Comum","Dracônico"],
   "traits":["Mordida","Fabricar Itens","Camuflagem do Pântano","Prender o Fôlego","Faminto Voraz"],"subraces":[]},
  {"name":"Tortle","abilityScoreIncrease":{"str":2,"wis":1},"size":"Médio","speed":9,
   "languages":["Comum","Aquan"],
   "traits":["Armadura Natural","Garras","Prender o Fôlego","Instinto de Sobrevivência","Defesa de Casco"],"subraces":[]},
  {"name":"Aarakocra","abilityScoreIncrease":{"dex":2,"wis":1},"size":"Médio","speed":7.5,
   "languages":["Comum","Aarakocra","Aéreo"],
   "traits":["Voo","Garras (Talons)"],"subraces":[]},
  {"name":"Genasi","abilityScoreIncrease":{"con":2},"size":"Médio","speed":9,
   "languages":["Comum","Primordial"],
   "traits":["Resistência Elemental"],
   "subraces":[
     {"name":"Genasi do Ar","abilityScoreIncrease":{"dex":1},"traits":["Alcançar o Ar"]},
     {"name":"Genasi da Terra","abilityScoreIncrease":{"str":1},"traits":["Passo Cambiante"]},
     {"name":"Genasi do Fogo","abilityScoreIncrease":{"int":1},"traits":["Filho do Fogo","Resistência Infernal"]},
     {"name":"Genasi da Água","abilityScoreIncrease":{"wis":1},"traits":["Filho do Mar"]},
   ]},
]

# === Talentos (feats) do PHB ===
FEATS = [
  ("Alerta","+5 na iniciativa; não pode ser surpreendido enquanto consciente; criaturas ocultas não têm vantagem contra você."),
  ("Atacante Selvagem","1x por turno, ao acertar um ataque corpo-a-corpo, pode rolar de novo os dados de dano e usar o melhor."),
  ("Atleta","+1 For ou Des; levantar-se custa só 1,5m; escala sem custo extra; corre/salta após 1,5m de impulso."),
  ("Atirador de Elite","Ignora cobertura leve/média e penalidade de longo alcance; pode trocar -5 no ataque por +10 no dano."),
  ("Conjurador de Guerra","Vantagem em salvaguardas para manter concentração; pode conjurar com mãos ocupadas; pode usar reação para conjurar."),
  ("Combatente com Armas Grandes","Em arma pesada de duas mãos, ao matar/critar ganha ataque bônus; pode trocar -5 no ataque por +10 no dano."),
  ("Combatente com Duas Armas","+1 CA empunhando duas armas; pode usar duas armas mesmo sem a propriedade leve."),
  ("Curandeiro","Com um kit de curandeiro, estabiliza e cura criaturas de forma mais eficaz."),
  ("Defensor com Escudo","Bônus defensivos com escudo; pode empurrar inimigos e proteger-se de áreas de efeito."),
  ("Especialista em Bestas","Ignora a recarga de bestas leves; sem desvantagem em alcance curto; pode atacar com besta de mão e outra arma."),
  ("Iniciado em Magia","Aprende dois truques e uma magia de 1º nível de uma classe à sua escolha."),
  ("Mestre em Armas de Haste","Ganha ataque bônus com a haste da arma; provoca ataque de oportunidade quando inimigos entram no seu alcance."),
  ("Mobilidade","+3m de deslocamento; correr não provoca ataques de oportunidade do alvo que você atacou."),
  ("Observador","+1 Int ou Sab; lê lábios; +5 em Percepção e Investigação passivas."),
  ("Resiliente","+1 num atributo à escolha e ganha proficiência em salvaguardas desse atributo."),
  ("Robusto","Seu máximo de pontos de vida aumenta em 2 por nível de personagem."),
  ("Sentinela","Acerto de oportunidade reduz o deslocamento do alvo a 0; ataca quem desengaja ou ataca um aliado próximo."),
  ("Sortudo","Tem 3 pontos de sorte por descanso longo para rolar um d20 extra em ataques, testes ou salvaguardas."),
  ("Talentoso","Ganha proficiência em três perícias ou ferramentas à sua escolha."),
  ("Usuário de Armadura Pesada","+1 Con; reduz em 3 o dano de ataques não-mágicos enquanto usa armadura pesada."),
]

def to_catalog_race(r):
    return {
      "name": r["name"],
      "abilityScoreIncrease": r["abilityScoreIncrease"],
      "size": r["size"],
      "speed": r["speed"],
      "languages": r["languages"],
      "traits": r["traits"],
      "subraces": [
        {"name": s["name"], "abilityScoreIncrease": s["abilityScoreIncrease"], "traits": s["traits"]}
        for s in r["subraces"]
      ],
    }

if __name__ == "__main__":
    ROOT = sys.argv[1]
    races_path = os.path.join(ROOT, "src/data/racesCatalog.json")
    races = json.load(open(races_path, encoding="utf-8"))
    # corrige traços lixo do humano variante
    for r in races:
        if r["name"] == "Humano":
            for s in r["subraces"]:
                if "Alternativos" in s["name"]:
                    s["traits"] = ["Perícia", "Talento"]
    existing = {r["name"] for r in races}
    for r in NEW_RACES:
        if r["name"] not in existing:
            races.append(to_catalog_race(r))
    races.sort(key=lambda r: r["name"])
    json.dump(races, open(races_path, "w"), ensure_ascii=False, indent=1)

    # traços usados em qualquer raça
    used = set()
    for r in races:
        used.update(r["traits"])
        for s in r["subraces"]:
            used.update(s["traits"])
    missing = sorted(n for n in used if n not in TRAITS)
    catalog = [{"name": n, "description": TRAITS.get(n, ""), "kind": "trait"} for n in sorted(used)]
    catalog += [{"name": n, "description": d, "kind": "talento"} for n, d in FEATS]
    json.dump(catalog, open(os.path.join(ROOT, "src/data/traitsCatalog.json"), "w"),
              ensure_ascii=False, indent=1)

    print(f"raças: {len(races)} | traços usados: {len(used)} | sem descrição: {missing}")
    print(f"catálogo de traços/talentos: {len(catalog)} entradas ({len(FEATS)} talentos)")
