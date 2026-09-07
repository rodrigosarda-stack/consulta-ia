#!/usr/bin/env python3
"""comparar.py — alinha o que FOI DITO com o que o Whisper OUVIU.

Comparar de olho só acha o que chama atenção. Isto acha tudo: alinha as duas
sequências de palavras e lista cada divergência, com o contexto ao redor.

  python3 comparar.py fixture-roteiro-original.txt fixture-transcricao-humana.txt
"""
import re
import sys
import unicodedata
from difflib import SequenceMatcher

# termos onde errar tem consequência clínica
CRITICOS = re.compile(
    r"travament|palpa|carga|direit|esquerd|losartan|dipiron|mg|miligram|grama|"
    r"hora|dia|semana|alergi|nega|sem |não|nao|socorro|ressonan|menisc|condropat",
    re.I,
)


def falas(texto: str) -> str:
    """Extrai só o que é para ser falado (o que vem depois de DOUTOR:/PACIENTE:)."""
    # corta o rodape de instrucoes, senao ele entra como se fosse fala
    texto = re.split(r"^DEPOIS DE GRAVAR", texto, flags=re.M)[0]
    ditas = re.findall(r"^\s*(?:DOUTOR|PACIENTE)\s*:\s*(.+?)(?=^\s*(?:DOUTOR|PACIENTE)\s*:|\Z)",
                       texto, re.M | re.S)
    return " ".join(" ".join(d.split()) for d in ditas) if ditas else texto


def normaliza(p: str) -> str:
    p = unicodedata.normalize("NFKD", p.lower())
    p = "".join(c for c in p if not unicodedata.combining(c))
    return re.sub(r"[^\w]", "", p)


def palavras(texto: str):
    cruas = texto.split()
    return [(normaliza(p), p) for p in cruas if normaliza(p)]


def contexto(lista, ini, fim, margem=4):
    antes = " ".join(p for _, p in lista[max(0, ini - margem):ini])
    meio = " ".join(p for _, p in lista[ini:fim])
    depois = " ".join(p for _, p in lista[fim:fim + margem])
    return antes, meio, depois


roteiro = palavras(falas(open(sys.argv[1], encoding="utf8").read()))
ouvido = palavras(open(sys.argv[2], encoding="utf8").read())

sm = SequenceMatcher(None, [n for n, _ in roteiro], [n for n, _ in ouvido], autojunk=False)
blocos = sm.get_opcodes()
iguais = sum(i2 - i1 for tag, i1, i2, _, _ in blocos if tag == "equal")

print(f"palavras ditas: {len(roteiro)}   ouvidas: {len(ouvido)}")
print(f"palavras que bateram: {iguais}/{len(roteiro)} = {100*iguais/len(roteiro):.1f}%\n")

divergencias = [b for b in blocos if b[0] != "equal"]
print(f"{len(divergencias)} divergências:\n" + "─" * 74)

for tag, i1, i2, j1, j2 in divergencias:
    _, dito, _ = contexto(roteiro, i1, i2)
    antes, houve, depois = contexto(ouvido, j1, j2)
    critico = CRITICOS.search(dito or "") or CRITICOS.search(houve or "")
    marca = "🔴" if critico else "  "
    rotulo = {"replace": "trocou", "delete": "sumiu ", "insert": "surgiu"}[tag]
    print(f"{marca} {rotulo}  dito: {dito or '—'!r}")
    print(f"           ouviu: {houve or '—'!r}")
    print(f"           contexto: …{antes} [{houve}] {depois}…\n")

criticas = sum(
    1 for tag, i1, i2, j1, j2 in divergencias
    if CRITICOS.search(" ".join(p for _, p in roteiro[i1:i2]) or "")
    or CRITICOS.search(" ".join(p for _, p in ouvido[j1:j2]) or "")
)
print("─" * 74)
print(f"{criticas} das {len(divergencias)} divergências tocam termo de consequência clínica")
