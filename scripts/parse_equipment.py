#!/usr/bin/env python3
"""
Extrai o equipamento inicial de cada classe (seção EQUIPAMENTO do Cap. 3 do PHB)
para src/data/classEquipment.json: { "Classe": {"choices": [[a,b],...], "fixed": [...] } }.

Usa os mesmos classes/<nome>.txt gerados para parse_classes.py (pdftotext padrão).
Escolhas são linhas "(a) X ou (b) Y"; itens fixos são linhas próprias; continuações
(quebra de linha) começam em minúscula/parêntese; a seção termina no próximo cabeçalho
em CAIXA ALTA. Bullets (glifo PUA) no início das linhas são removidos.
"""
import re, json, sys

NAME = {"barbaro":"Bárbaro","bardo":"Bardo","bruxo":"Bruxo","clerigo":"Clérigo",
        "druida":"Druida","feiticeiro":"Feiticeiro","guerreiro":"Guerreiro","ladino":"Ladino",
        "mago":"Mago","monge":"Monge","paladino":"Paladino","patrulheiro":"Patrulheiro"}

def is_caps_header(s):
    letters = [c for c in s if c.isalpha()]
    return bool(letters) and len(s) < 40 and sum(c.isupper() for c in letters) / len(letters) > 0.9

def split_choice(text):
    # "(a) X ou (b) Y [ou (c) Z]" -> ["X","Y","Z"]
    parts = re.split(r'\([a-d]\)', text)
    opts = [re.sub(r'\bou\s*$', '', p).strip().rstrip(',').strip() for p in parts if p.strip()]
    return [o for o in opts if o]

def parse_class(path):
    lines = [l.rstrip() for l in open(path, encoding='utf-8')]
    start = None
    for i, l in enumerate(lines):
        if l.strip() == "EQUIPAMENTO":
            start = i
            break
    if start is None:
        return {"choices": [], "fixed": []}
    j = start + 1
    while j < len(lines) and "antecedente" not in lines[j]:
        j += 1
    j += 1  # primeira linha após o intro
    items = []  # [tipo, texto]
    seen = 0
    while j < len(lines) and seen < 24:
        # remove marcadores/bullets do início (mantém letras e o "(" das escolhas)
        s = re.sub(r'^[^\w(]+', '', lines[j].strip())
        j += 1
        if not s or re.fullmatch(r'[\d\W]+', s):  # vazio / só número ou pontuação
            continue
        if is_caps_header(s):
            break
        seen += 1
        if re.match(r'\([a-d]\)', s):
            items.append(["choice", s])
        elif (s[0].islower() or (s.startswith("(") and not re.match(r'\([a-d]\)', s))) and items:
            items[-1][1] += " " + s  # continuação de linha
        else:
            items.append(["fixed", s])
    choices, fixed = [], []
    for kind, text in items:
        if kind == "choice":
            opts = split_choice(text)
            if len(opts) >= 2:
                choices.append(opts)
            elif opts:
                fixed.append(opts[0])
        else:
            fixed.append(text)
    return {"choices": choices, "fixed": fixed}

if __name__ == "__main__":
    SD = sys.argv[1]
    out = {name: parse_class(f"{SD}/classes/{key}.txt") for key, name in NAME.items()}
    json.dump(out, open(f"{SD}/classEquipment.json", "w"), ensure_ascii=False, indent=1)
    for name, eq in out.items():
        print(f"{name:12} {len(eq['choices'])} escolhas, {len(eq['fixed'])} fixos", file=sys.stderr)
