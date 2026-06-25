#!/usr/bin/env python3
"""
Gera src/data/spellsCatalog.json a partir dos PDFs dos livros de regras (PT-BR).

As páginas de magias são em DUAS COLUNAS; o pdftotext padrão embaralha a ordem,
então extraímos cada coluna separadamente (esquerda, depois direita) por página.
Largura A4 = 595pt (metade ~298), Carta = 612pt (metade ~306).

  extrai() {  # arquivo  pág_inicial  pág_final  meia_largura  saída
    : > "$5"
    for p in $(seq "$2" "$3"); do
      pdftotext -f $p -l $p -x 0   -y 40 -W "$4" -H 780 "$1" - >> "$5"; printf '\\n' >> "$5"
      pdftotext -f $p -l $p -x "$4" -y 40 -W "$4" -H 780 "$1" - >> "$5"; printf '\\n' >> "$5"
    done
  }
  extrai "Livro do Jogador.pdf"   214 289 298 phb_cols.txt   # compêndio alfabético
  extrai "Guia de Xanathar.pdf"   153 174 298 xan_cols.txt
  extrai "Caldeirão de Tasha.pdf" 105 117 306 tas_cols.txt
  python3 scripts/parse_spells.py <dir_com_os_*_cols.txt>   # gera spells.json (sem classes)
  python3 scripts/parse_spelllists.py <mesmo_dir>           # adiciona campo `classes`

As classes vêm das tabelas "Lista de Magias" por classe (PHB pág 209-213 e
Xanathar pág 150-152, ambas em 3 colunas) e da "Tabela de Feitiços" do Tasha
(pág 103-104). Veja scripts/parse_spelllists.py.

O parser tolera artefatos de OCR ("1rempo"->"Tempo", "J>uração"->"Duração") e
detecta o nome da magia pelo estilo do título (CAIXA ALTA no PHB/Xanathar,
Title Case no Tasha), já que linhas em branco entre parágrafos são inconsistentes.
"""
import re, json, sys
from collections import Counter

ESCOLAS = {"abjuração","adivinhação","conjuração","encantamento",
           "evocação","ilusão","necromancia","transmutação",
           "invocação"}  # Tasha traduz Conjuration como "Invocação"
SCHOOL_NORM = {"invocação":"conjuração"}  # unifica nomenclatura entre livros

LVL_PHB = re.compile(r'^\s*(\d)\s*[°ºo]?\s*n[íi]vel de ([a-zçãõéíóúâêô]+)\s*(\(ritual\))?\s*\.?\s*$', re.I)
CAN_PHB = re.compile(r'^\s*[Tt]ruque de ([a-zçãõéíóúâêô]+)\s*(\(ritual\))?\s*\.?\s*$')
LVL_TAS = re.compile(r'^\s*(\d)\s*[ºo°]?\s*[Cc]írculo,\s*([A-Za-zçãõéíóúâêôÇÃÕ]+)\s*(\(ritual\))?\s*\.?\s*$')
CAN_TAS = re.compile(r'^\s*[Tt]ruque,\s*([A-Za-zçãõéíóúâêôÇÃÕ]+)\s*(\(ritual\))?\s*\.?\s*$')

LABELS = ["Tempo de Conjura", "Alcance", "Componentes", "Duração"]
INTRO = ("DESCRIÇÕES DAS MAGIAS","DESCRIÇÃO DAS MAGIAS","DESCRIÇÃO DE MAGIAS",
         "Descrições de Magia","DESCRIÇÕES DE MAGIAS","Descrições de Magias")

def match_level(line):
    m=LVL_PHB.match(line)
    if m and m.group(2).lower() in ESCOLAS: return int(m.group(1)),m.group(2).lower(),bool(m.group(3)),'phb'
    m=CAN_PHB.match(line)
    if m and m.group(1).lower() in ESCOLAS: return 0,m.group(1).lower(),bool(m.group(2)),'phb'
    m=LVL_TAS.match(line)
    if m and m.group(2).lower() in ESCOLAS: return int(m.group(1)),m.group(2).lower(),bool(m.group(3)),'tas'
    m=CAN_TAS.match(line)
    if m and m.group(1).lower() in ESCOLAS: return 0,m.group(1).lower(),bool(m.group(2)),'tas'
    return None

LOWER_WORDS={"de","da","do","das","dos","e","a","o","à","com","na","no","em","para","ou"}
def pt_title(s):
    words=s.split()
    out=[]
    for i,w in enumerate(words):
        lw=w.lower()
        out.append(lw if (i>0 and lw in LOWER_WORDS) else (lw[:1].upper()+lw[1:]))
    return " ".join(out)

def is_upper_name(s):
    s=s.strip()
    if not s or s.endswith(':') or s.endswith('.'): return False
    letters=[c for c in s if c.isalpha()]
    if len(letters)<2: return False
    up=sum(1 for c in letters if c.isupper())
    return up/len(letters) >= 0.60

def is_title_line(s):
    s=s.strip()
    if not s or len(s)>48 or s.endswith('.') or s.endswith(':'): return False
    a=next((c for c in s if c.isalpha()), '')
    return a.isupper()

def clean(lines, lo, hi):
    out=[]
    for l in lines:
        l=l.replace("1rempo de Conjura","Tempo de Conjura")
        l=re.sub(r'^([A-Za-zÀ-ÿ]{0,2}[>}\)]?uração:)', 'Duração:', l)  # OCR: J>uração->Duração
        st=l.strip()
        if re.fullmatch(r'\d{1,3}', st) and lo<=int(st)<=hi: continue
        if st in INTRO: continue
        if st.startswith("As magias são apresentadas em ordem"): continue
        out.append(l)
    return out

def name_block(lines, a, fmt):
    """Return (name, start_index_of_name_block) for anchor at index a."""
    j=a-1
    while j>=0 and lines[j].strip()=='': j-=1
    nm=[]
    if fmt=='phb':
        while j>=0 and is_upper_name(lines[j]):
            nm.insert(0, lines[j].strip()); j-=1
            if len(nm)>=3: break
    else:  # tasha: title-case, 1-2 lines
        while j>=0 and is_title_line(lines[j]):
            nm.insert(0, lines[j].strip()); j-=1
            if len(nm)>=2: break
    if not nm:
        # fallback: nome logo acima do nível (1 linha curta), p/ OCR como "LAço" (<60% maiúsc.)
        j2=a-1
        while j2>=0 and lines[j2].strip()=='': j2-=1
        cand=lines[j2].strip() if j2>=0 else ''
        if cand and len(cand)<=35 and not cand.endswith('.') and not cand.endswith(':'):
            nm=[cand]; j=j2-1
    start = j+1
    while start<a and lines[start].strip()=='' : start+=1
    return " ".join(nm).strip(), start

def join_desc(dl):
    paras=[]; para=""
    for line in dl:
        st=line.strip()
        if st=="":
            if para: paras.append(para); para=""
        elif para.endswith('-'):
            para=para[:-1]+st
        else:
            para=(para+' '+st).strip() if para else st
    if para: paras.append(para)
    return "\n\n".join(paras).strip()

def parse(path, source, lo, hi):
    lines=clean(open(path,encoding='utf-8').read().split('\n'),lo,hi)
    recs=[]
    for i,l in enumerate(lines):
        lv=match_level(l)
        if not lv: continue
        if 'empo de Conjura' not in "\n".join(lines[i+1:i+5]): continue
        level,school,ritual,fmt=lv
        name,nstart=name_block(lines,i,fmt)
        recs.append(dict(a=i,level=level,school=school,ritual=ritual,fmt=fmt,name=name,nstart=nstart))
    spells=[]
    for idx,r in enumerate(recs):
        a=r['a']
        # metadata: find labels in order, bounded
        pos={}; cur=a+1
        for L in LABELS:
            for x in range(cur, min(cur+8, len(lines))):  # labels are compact; don't cross into next spell
                if lines[x].strip().startswith(L): pos[L]=x; cur=x+1; break
        def val(label, end):
            if label not in pos: return ""
            s=pos[label]; e=pos.get(end, s+1)
            t=lines[s].split(':',1)[1].strip() if ':' in lines[s] else ''
            for x in range(s+1, e):
                cs=lines[x].strip()
                if cs: t=(t[:-1]+cs) if t.endswith('-') else (t+' '+cs).strip()
            return t.rstrip('.')
        tempo=val("Tempo de Conjura","Alcance")
        alc=val("Alcance","Componentes")
        comp=val("Componentes","Duração")
        du=pos.get("Duração")
        dur=lines[du].split(':',1)[1].strip().rstrip('.') if du is not None else ""
        body=(du+1) if du is not None else cur
        end=recs[idx+1]['nstart'] if idx+1<len(recs) else len(lines)
        desc=join_desc(lines[body:end])
        spells.append({
            "name": pt_title(r['name']),
            "level": r['level'], "school": SCHOOL_NORM.get(r['school'],r['school']).capitalize(),
            "castingTime": tempo, "range": alc, "components": comp, "duration": dur,
            "description": desc, "ritual": r['ritual'],
            "concentration": "oncentra" in dur.lower(), "source": source,
        })
    return spells

if __name__=="__main__":
    SD=sys.argv[1]
    allsp=[]
    allsp+=parse(f"{SD}/phb_cols.txt","PHB",213,289)
    allsp+=parse(f"{SD}/xan_cols.txt","XGtE",153,174)
    allsp+=parse(f"{SD}/tas_cols.txt","TCoE",105,117)
    # dedup by (name) keeping the one with longest description; sort by level then name
    best={}
    for s in allsp:
        k=s['name'].lower()
        if k not in best or len(s['description'])>len(best[k]['description']):
            best[k]=s
    allsp=sorted(best.values(), key=lambda s:(s['level'], s['name'].lower()))
    print("TOTAL:",len(allsp),Counter(s['source'] for s in allsp),file=sys.stderr)
    json.dump(allsp, open(f"{SD}/spells.json","w"), ensure_ascii=False, indent=1)
