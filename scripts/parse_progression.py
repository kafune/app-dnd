#!/usr/bin/env python3
"""
Extrai a progressão de características por nível de cada classe (coluna "Características"
das tabelas do Cap. 3 do PHB) para src/data/classProgression.json:
  { "Classe": { "1": ["Fúria","Defesa sem Armadura"], "3": ["Caminho Primitivo"], ... } }

As tabelas saem alinhadas com `pdftotext -layout`. A coluna Características é o texto
alfabético da linha; as demais colunas (bônus, espaços de magia, dados de Ki, etc.) são
tokens numéricos/dados/traços que removemos em qualquer posição (a ordem das colunas
varia: no Monge a Característica vem por último). Quebras de célula continuam na linha
seguinte (curta) e são anexadas.
"""
import re, json, sys

NAME = {"barbaro":"Bárbaro","bardo":"Bardo","bruxo":"Bruxo","clerigo":"Clérigo",
        "druida":"Druida","feiticeiro":"Feiticeiro","guerreiro":"Guerreiro","ladino":"Ladino",
        "mago":"Mago","monge":"Monge","paladino":"Paladino","patrulheiro":"Patrulheiro"}

LEVEL_RE = re.compile(r'^\s*(\d{1,2})\s*[°º]\s+\+?(\d)\s+(.+?)\s*$')

def is_col_token(tok):
    """Token de coluna numérica (não faz parte do nome da característica)?"""
    if tok in ("–", "—", "-", "Ilimitado", "Ilimitadas", "+"):
        return True
    return bool(
        re.fullmatch(r'[+\-]?\d+', tok)        # inteiros / com sinal
        or re.fullmatch(r'\d*d\d+', tok)       # dados (1d4, d6)
        or re.fullmatch(r'[+\-]?[\d.,½]+m', tok)  # deslocamento (+3m, 9m, +4,5m)
    )

def features_from(text):
    kept = [t for t in text.split() if not is_col_token(t)]
    joined = " ".join(kept).strip(" ,")
    if not joined:
        return []
    return [f.strip() for f in joined.split(",") if f.strip() and f.strip() not in ("–", "-")]

def parse_class(path):
    lines = [l.rstrip() for l in open(path, encoding='utf-8')]
    prog = {}
    cur = None       # nível atual
    max_seen = 0
    saw_blank_after_20 = False
    for raw in lines:
        m = LEVEL_RE.match(raw)
        if m:
            lvl = int(m.group(1))
            if 1 <= lvl <= 20:
                cur = str(lvl)
                max_seen = max(max_seen, lvl)
                prog[cur] = prog.get(cur, "") + " " + m.group(3)
                continue
        s = raw.strip()
        if not s:
            if max_seen >= 20:
                saw_blank_after_20 = True
            cur = None  # célula encerra na linha em branco
            continue
        # continuação de célula: linha curta logo após uma linha de nível
        if cur and not saw_blank_after_20 and len(s) < 50 and not s.isupper():
            prog[cur] += " " + s
    return {lvl: features_from(text) for lvl, text in prog.items()}

if __name__ == "__main__":
    SD = sys.argv[1]
    out = {}
    for key, name in NAME.items():
        out[name] = parse_class(f"{SD}/prog/{key}.txt")
    json.dump(out, open(f"{SD}/classProgression.json", "w"), ensure_ascii=False, indent=1)
    for name, p in out.items():
        levels = sorted(int(k) for k in p)
        nfeat = sum(len(v) for v in p.values())
        print(f"{name:12} níveis {min(levels) if levels else '-'}–{max(levels) if levels else '-'} ({len(levels)}), {nfeat} características", file=sys.stderr)
