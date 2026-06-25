#!/usr/bin/env python3
"""
Gera src/data/classesCatalog.json a partir do Capítulo 3 do Livro do Jogador (PT-BR).

Extraia o texto de cada classe (pdftotext padrão; o box "CARACTERÍSTICAS DE CLASSE"
sai contíguo na ordem de leitura) para classes/<nome>.txt, com os intervalos de página:
  barbaro 48-52, bardo 53-57, bruxo 58-64, clerigo 65-72, druida 73-78,
  feiticeiro 79-84, guerreiro 85-90, ladino 91-95, mago 96-103, monge 104-109,
  paladino 110-116, patrulheiro 117-121  (cap. 4 começa na pág 122)
  python3 scripts/parse_classes.py <dir_com_classes/>

Lê os campos rotulados do box (Dado de Vida, Armaduras, Armas, Ferramentas, Testes de
Resistência, Perícias), a habilidade primária da "Construção Rápida", e os nomes das
subclasses pela frase de seleção (enumeração antes de "detalhad..."). A habilidade de
conjuração é fixada por classe (mapa CAST), conforme o recurso Conjuração de cada uma.
"""
import re, json, sys, unicodedata

NAME={"barbaro":"Bárbaro","bardo":"Bardo","bruxo":"Bruxo","clerigo":"Clérigo",
      "druida":"Druida","feiticeiro":"Feiticeiro","guerreiro":"Guerreiro","ladino":"Ladino",
      "mago":"Mago","monge":"Monge","paladino":"Paladino","patrulheiro":"Patrulheiro"}
# habilidade de conjuração base (do recurso Conjuração de cada classe); None = não conjura na base
CAST={"barbaro":None,"bardo":"cha","bruxo":"cha","clerigo":"wis","druida":"wis",
      "feiticeiro":"cha","guerreiro":None,"ladino":None,"mago":"int","monge":None,
      "paladino":"cha","patrulheiro":"wis"}
ABIL={"força":"str","forca":"str","destreza":"dex","constituição":"con","constituicao":"con",
      "inteligência":"int","inteligencia":"int","sabedoria":"wis","carisma":"cha"}
NUM={"uma":1,"um":1,"duas":2,"dois":2,"três":3,"tres":3,"quatro":4}
LABELS=["Dado de Vida","Pontos de Vida no 1","Pontos de Vida nos Níveis","Armaduras",
        "Armas","Ferramentas","Testes de Resistência","Perícias"]

def norm(s):
    s=unicodedata.normalize('NFD',s.lower());return ''.join(c for c in s if unicodedata.category(c)!='Mn').strip()

def field(lines, label):
    """valor de um campo rotulado, juntando continuações até o próximo rótulo/cabeçalho."""
    for i,l in enumerate(lines):
        if l.strip().startswith(label):
            val=l.split(':',1)[1].strip() if ':' in l else ''
            j=i+1
            while j<len(lines):
                s=lines[j].strip()
                if not s: break
                if any(s.startswith(L) for L in LABELS): break
                # cabeçalho em CAIXA ALTA (EQUIPAMENTO, PROFICIÊNCIAS, nome de característica)
                letters=[c for c in s if c.isalpha()]
                if letters and sum(c.isupper() for c in letters)/len(letters)>0.85: break
                val=(val[:-1]+s) if val.endswith('-') else (val+' '+s).strip()
                j+=1
            return val.strip()
    return ""

ALL_SKILLS=["Acrobacia","Adestrar Animais","Arcanismo","Atletismo","Atuação","Enganação",
    "Furtividade","História","Intimidação","Intuição","Investigação","Medicina","Natureza",
    "Percepção","Persuasão","Prestidigitação","Religião","Sobrevivência"]

def parse_skills(val):
    m=re.search(r'[Ee]scolha\s+(\w+)\s+(?:dentre|entre|de)\s+(.+)', val)
    if m:
        opts=[o.strip().rstrip('.').strip() for o in re.split(r',\s*| e ', m.group(2)) if o.strip()]
        return {"choose":NUM.get(norm(m.group(1))),"from":opts}
    # Bardo: "Escolha três quaisquer" -> qualquer perícia
    m=re.search(r'[Ee]scolha\s+(\w+)\s+quaisquer', val)
    if m:
        return {"choose":NUM.get(norm(m.group(1))),"from":ALL_SKILLS}
    return None

def parse_saves(val):
    return [ABIL[norm(x.strip())] for x in re.split(r',| e ', val) if norm(x.strip()) in ABIL]

def parse_subclasses(txt):
    """Extrai os nomes das subclasses da frase de seleção (antes de 'detalhad...')."""
    pos=txt.find('detalhad')
    if pos<0: return []
    win=txt[max(0,pos-300):pos]
    cm=list(re.finditer(r'\b(?:ambos|todos|todas|cada)\b', win, re.I))  # corta no conector final
    if cm: win=win[:cm[-1].start()]
    win=win.rstrip(' ,.;:')
    starts=[win.rfind(':')]                                       # após último ':' ou 'Escolha'
    starts+=[em.end() for em in re.finditer(r'[Ee]scolha?e?\b', win)]
    s=max(starts)
    enum=win[s+1:] if s>=0 else win
    enum=enum.split('. ')[-1]
    out=[]
    for it in re.split(r',\s*| ou | e ', enum):
        it=re.sub(r'^(?:o|a|os|as)\s+','',it.strip()).strip(' .')
        if it and len(it)>2 and not it[0].islower(): out.append(it)
    return out

def parse_class(path, key):
    lines=[l.rstrip() for l in open(path,encoding='utf-8')]
    hd=field(lines,"Dado de Vida")
    m=re.search(r'1\s*d\s*(\d+)', hd)
    hit=f"d{m.group(1)}" if m else ""
    # construção rápida: habilidade primária
    txt=" ".join(lines)
    pm=re.search(r'valor de habilidade mais alto em (\w+)', txt) \
       or re.search(r'Primeiro,?\s+(\w+) deve ser', txt)
    prim=ABIL.get(norm(pm.group(1)),None) if pm else None
    return {
        "name": NAME[key],
        "hitDie": hit,
        "primaryAbility": prim,
        "savingThrows": parse_saves(field(lines,"Testes de Resistência")),
        "spellcastingAbility": CAST[key],
        "armorProficiencies": field(lines,"Armaduras").rstrip('.'),
        "weaponProficiencies": field(lines,"Armas").rstrip('.'),
        "toolProficiencies": field(lines,"Ferramentas").rstrip('.'),
        "skillProficiencies": parse_skills(field(lines,"Perícias")),
        "subclasses": parse_subclasses(re.sub(r'\s+',' ',txt)),
    }

if __name__=="__main__":
    SD=sys.argv[1]
    out=[parse_class(f"{SD}/classes/{k}.txt",k) for k in NAME]
    json.dump(out, open(f"{SD}/classes.json","w"), ensure_ascii=False, indent=1)
    for c in out:
        print(f"{c['name']:12} {c['hitDie']:4} prim={c['primaryAbility']} saves={c['savingThrows']} cast={c['spellcastingAbility']} perícias={c['skillProficiencies']['choose'] if c['skillProficiencies'] else '?'}", file=sys.stderr)
