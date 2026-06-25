#!/usr/bin/env python3
"""
Gera src/data/racesCatalog.json a partir do Capítulo 2 do Livro do Jogador (PT-BR).

O capítulo é em 2 colunas; o pdftotext padrão embaralha a ordem (o incremento de
atributo de uma raça aparece antes do header dela), então extraímos cada coluna
separada por página (esquerda, depois direita), pág 19-44 (cap. 3 começa na 46):
  for p in $(seq 19 44); do
    for x in 0 297; do pdftotext -f $p -l $p -x $x -y 38 -W 300 -H 790 PHB.pdf - >> races_raw.txt; printf '\\n' >> races_raw.txt; done
  done
  python3 scripts/parse_races.py <dir_com_races_raw.txt>

As 9 raças-base são ancoradas pelos headers "TRAÇOS RACIAIS DOS X". Dentro de cada
seção, o 1º bloco "Aumento no Valor de Habilidade" é da raça-base e os seguintes são
sub-raças (nome pelo header em CAIXA ALTA acima). Extrai incremento de atributo,
tamanho, deslocamento (m), idiomas e nomes de traços.
"""
import re, json, sys, unicodedata

# raças-base na ordem em que aparecem no capítulo (9, cada uma tem bloco com "Tamanho.")
BASE_ORDER=["Anão","Elfo","Halfling","Humano","Draconato","Gnomo","Meio-elfo","Meio-orc","Tiefling"]
ABIL={"força":"str","forca":"str","destreza":"dex","constituição":"con","constituicao":"con",
      "inteligência":"int","inteligencia":"int","sabedoria":"wis","carisma":"cha"}

def norm(s):
    s=unicodedata.normalize('NFD',s.lower());return ''.join(c for c in s if unicodedata.category(c)!='Mn')

def title_pt(s):
    low={"da","de","do","das","dos","e","o","a"}
    ws=s.lower().split()
    return " ".join(w if (i>0 and w in low) else w.capitalize() for i,w in enumerate(ws))

def parse_abil(text):
    """retorna dict {abilkey:+N} e/ou 'choose' p/ incrementos."""
    out={}
    for m in re.finditer(r'valor de (\w+) aumenta em (\d)', text):
        k=ABIL.get(norm(m.group(1)))
        if k: out[k]=int(m.group(2))
    if re.search(r'Todos os seus valores de habilidade aumentam em 1', text):
        out={k:1 for k in ["str","dex","con","int","wis","cha"]}
    m=re.search(r'[Dd]ois valores de habilidade .*? aumentam em 1', text)
    if m: out["choose"]={"count":2,"amount":1}
    # "dois outros valores ... aumentam em 1" (meio-elfo)
    if re.search(r'(dois outros|outros dois).{0,40}aumentam em 1', text):
        out["choose"]={"count":2,"amount":1}
    return out

def is_hdr(s):
    s=s.strip();L=[c for c in s if c.isalpha()]
    return bool(s) and len(L)>=3 and len(s)<34 and sum(c.isupper() for c in L)/len(L)>0.9

def find_size(t):
    m=re.search(r'[Ss]eu tamanho é (\w+)', t); return m.group(1) if m else ""
def find_speed(t):
    m=re.search(r'caminhada é (?:de )?([\d,]+)\s*met', t); return float(m.group(1).replace(',','.')) if m else None
def find_langs(t):
    m=re.search(r'Idiomas\.\s*(.+?)(?:\.\s|\Z)', t)
    return m.group(1).strip() if m else ""

STRUCT={"aumento no valor de habilidade","idade","tamanho","deslocamento","tendencia",
        "idiomas","sub-raca","sub-racas","subraca","alinhamento","nome","sub-racas principais"}
LOWERW={"de","da","do","das","dos","e","no","na","em","com","ou","a","o"}
def traits(block):
    """nomes de traços raciais: frases título-case seguidas de '. ' + frase, fora as estruturais."""
    out=[]
    for m in re.finditer(r'(?:^|[.\)!]\s)([A-ZÁÉÍÓÚÂÊÔÃÕ][\wáéíóúâêôãõç-]+(?: [\wáéíóúâêôãõç-]+){0,4}?)\.\s+[A-ZÁÉÍÓÚ]', block):
        name=m.group(1).strip()
        ws=name.split()
        # toda palavra significativa (>2 letras) deve começar maiúscula
        if any(len(w)>2 and not w[0].isupper() and w.lower() not in LOWERW for w in ws): continue
        if norm(name) in STRUCT or len(name)>38 or len(ws)<1: continue
        if name not in out: out.append(name)
    return out

BASE_HDR={"anoes":"Anão","elfos":"Elfo","halflings":"Halfling","humanos":"Humano",
    "draconatos":"Draconato","gnomos":"Gnomo","meio-elfos":"Meio-elfo","meio-orcs":"Meio-orc",
    "tieflings":"Tiefling"}

def header_above(txt, pos):
    for l in reversed(txt[:pos].split("\n")):
        if is_hdr(l) and not norm(l).startswith("nomes"): return l.strip()
    return ""

def main(path):
    txt="\n".join(l.rstrip() for l in open(path,encoding='utf-8'))
    # âncoras das raças-base: headers "TRAÇOS RACIAIS DOS X"
    bases=[]
    for m in re.finditer(r'TRAÇOS RACIAIS DOS ([A-ZÁÂÃÉÊÍÓÔÕÚÜÇ\-]+)', txt):
        key=norm(m.group(1))
        if key in BASE_HDR: bases.append((m.start(), BASE_HDR[key]))
    bases.append((len(txt), None))
    incs=[m.start() for m in re.finditer(r'Aumento no Valor de Habilidade', txt)]
    races=[]
    for (start,name),(end,_) in zip(bases, bases[1:]):
        sec_inc=[p for p in incs if start<=p<end]
        if not sec_inc: continue
        base_block=re.sub(r'\s+',' ',txt[sec_inc[0]:(sec_inc[1] if len(sec_inc)>1 else end)])
        race={"name":name,"abilityScoreIncrease":parse_abil(base_block),
            "size":find_size(base_block),"speed":find_speed(base_block),
            "languages":find_langs(base_block),"traits":traits(base_block),"subraces":[]}
        for i in range(1,len(sec_inc)):
            a=sec_inc[i]; b=sec_inc[i+1] if i+1<len(sec_inc) else end
            blk=re.sub(r'\s+',' ',txt[a:b])
            hdr=header_above(txt, a)
            race["subraces"].append({"name":title_pt(hdr),
                "abilityScoreIncrease":parse_abil(blk),"traits":traits(blk)})
        races.append(race)
    return races

if __name__=="__main__":
    SD=sys.argv[1]
    r=main(f"{SD}/races_raw.txt")
    json.dump(r, open(f"{SD}/races.json","w"), ensure_ascii=False, indent=1)
    for x in r:
        subs=", ".join(s['name'] for s in x['subraces'])
        print(f"{x['name']:11} {x['abilityScoreIncrease']} | {x['size']} | {x['speed']}m | subs: {subs}", file=sys.stderr)
