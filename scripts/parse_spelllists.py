#!/usr/bin/env python3
import re, json, sys, unicodedata

CLASSES = {"BARDO":"Bardo","BRUXO":"Bruxo","CLÉRIGO":"Clérigo","DRUIDA":"Druida",
           "FEITICEIRO":"Feiticeiro","MAGO":"Mago","PALADINO":"Paladino","PATRULHEIRO":"Patrulheiro"}

def norm(s):
    s=unicodedata.normalize('NFD',s.lower())
    s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    return re.sub(r'\s+',' ',s).strip()

# nomes na lista de classes que divergem do compêndio de descrições (variantes de tradução)
ALIASES={  # norm(lista) -> norm(catálogo)
    "banquete dos herois":"banquete de herois",
    "construir":"fabricar",
    "dominar criatura":"dominar monstro",
    "enfraquecer o intelecto":"enfraquecer intelecto",
    "guardioes espirituais":"espiritos guardioes",
    "infringir ferimentos":"infligir ferimentos",
    "vida falsa":"vitalidade falsa",
    # OCR corrompido nas listas do Xanathar
    "destruicao e/ementa/":"destruicao elemental",
    "meteoros momentaneos de me/f":"meteoros momentaneos de melf",
    "escuridao en/ouquecedora":"escuridao enlouquecedora",
    "ossos da terra":"ossos da terra",
}

def parse(path):
    lines=[l.rstrip() for l in open(path,encoding='utf-8')]
    cur=None
    out={}  # class -> set of normalized names (with display)
    raw_names={}  # norm -> display
    i=0
    n=len(lines)
    while i<n:
        s=lines[i].strip()
        i+=1
        if not s: continue
        mu=s.upper()
        hit=next((CLASSES[k] for k in CLASSES if mu.startswith("MAGIAS DE "+k)), None)
        if hit: cur=hit; continue
        if cur is None: continue
        if re.search(r'N.VEL', mu) or 'NIVEL' in mu or mu.startswith('TRUQUE') and 'CORDA' not in mu or 'MAGIAS DE' in mu or 'NFVN' in mu:
            continue
        if s.startswith('('):  # stray continuation
            continue
        if '(' in s:
            name=s[:s.index('(')].strip()
        else:
            # wrapped name? next nonempty line starts with '('
            j=i
            while j<n and lines[j].strip()=='': j+=1
            if j<n and lines[j].strip().startswith('('):
                name=s
            else:
                name=None
        if name and len(name)>1:
            k=norm(name)
            out.setdefault(cur,set()).add(k)
            raw_names.setdefault(k,name)
    return out, raw_names

SCHOOLS_TBL=r'(?:Abjuração|Adivinhação|Conjuração|Invocação|Encantamento|Evocação|Ilusão|Necromancia|Transmutação)'
# nome de classe (norm, s/ acento) -> exibição canônica. "guardião" = Ranger no Tasha.
CLASS_DISPLAY={"artifice":"Artífice","bardo":"Bardo","bruxo":"Bruxo","clerigo":"Clérigo",
    "druida":"Druida","feiticeiro":"Feiticeiro","mago":"Mago","paladino":"Paladino",
    "patrulheiro":"Patrulheiro","guardiao":"Patrulheiro"}
TASHA_ALIAS={"invocar fada":"invocar feerico"}  # nome tabela -> nome compêndio

def parse_tasha_table(path):
    """Tabela de Feitiços do Tasha: nível, nome, escola, ritual, conc, CLASSES."""
    rx=re.compile(r'^\s*\d\s+(.+?)\s+'+SCHOOLS_TBL+r'\s+(?:Sim|Não)\s+(?:Sim|Não)\s+(.+?)\s*$')
    out={}
    for line in open(path,encoding='utf-8'):
        m=rx.match(line)
        if not m: continue
        name=norm(m.group(1)); name=TASHA_ALIAS.get(name,name)
        clss={CLASS_DISPLAY[norm(c)] for c in m.group(2).split(',') if norm(c) in CLASS_DISPLAY}
        out[name]=clss
    return out

if __name__=="__main__":
    SD=sys.argv[1]
    bylclass, raws = parse(f"{SD}/spelllists3.txt")
    xb, xr = parse(f"{SD}/xan_spelllists3.txt")
    for c,names in xb.items(): bylclass.setdefault(c,set()).update(names)
    raws.update(xr)
    # build name(norm)->classes
    name2cls={}
    for cls,names in bylclass.items():
        for k in names:
            k=ALIASES.get(k,k)
            name2cls.setdefault(k,set()).add(cls)
    # Tasha: tabela de feitiços (nome -> conjunto de classes)
    for k,clss in parse_tasha_table(f"{SD}/tasha_table.txt").items():
        name2cls.setdefault(k,set()).update(clss)
    for cls in sorted(bylclass): print(f"  {cls}: {len(bylclass[cls])} magias", file=sys.stderr)
    print("nomes distintos nas listas:", len(name2cls), file=sys.stderr)
    # merge into catalog
    cat=json.load(open(f"{SD}/spells.json"))
    catnorm={norm(s['name']):s for s in cat}
    matched=0; unmatched_list=[]
    for s in cat: s['classes']=[]
    for k,clss in name2cls.items():
        if k in catnorm:
            catnorm[k]['classes']=sorted(clss)
            matched+=1
        else:
            unmatched_list.append(raws[k])
    print(f"listas casadas com catálogo: {matched} | não-casadas: {len(unmatched_list)}", file=sys.stderr)
    print("NÃO CASADAS (nome da lista sem magia no catálogo):", file=sys.stderr)
    for u in sorted(unmatched_list): print("   -",u, file=sys.stderr)
    # quais magias do catálogo ficaram sem classe (truques/níveis baixos podem ser de subclasse só)
    noclass=[s['name'] for s in cat if not s['classes']]
    print(f"\nmagias do catálogo SEM classe: {len(noclass)}", file=sys.stderr)
    json.dump(cat, open(f"{SD}/spells.json","w"), ensure_ascii=False, indent=1)