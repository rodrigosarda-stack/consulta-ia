#!/usr/bin/env python3
"""medir-local.py — o mesmo teste do prontuário, rodando modelos abertos NESTE Mac (MLX).

Mede o que importa pro plano dos Mac minis: acerta os termos? confessa os
consertos? e a que velocidade (tokens/s) — porque velocidade decide quantos
médicos um mini aguenta.
"""
import json, re, sys, time
from pathlib import Path
from mlx_lm import load, generate
from mlx_lm.sample_utils import make_sampler

PC = Path("/Users/greenvalreflorestamento/Documents/Sistemas/consulta-ia")
src = (PC / "supabase/functions/process-consultation/index.ts").read_text()
def literal(nome):
    m = re.search(r"const %s = `([\s\S]*?)`;" % nome, src)
    return m.group(1).encode().decode("unicode_escape").encode("latin-1").decode("utf-8")
PRONT = literal("PRONTUARIO_PROMPT"); JSONI = literal("JSON_INSTRUCTION")
T2 = (PC / "docs/prompt-confabulacao/fixture-transcricao-2vozes-teste2-2026-09-07.txt").read_text()
prompt = f"{PRONT}{JSONI}\n\n===== INICIO DO CONTEUDO =====\nPaciente: Ana\n\nTranscricao:\n{T2}\n===== FIM DO CONTEUDO ====="

MODELOS = sys.argv[1:] or ["mlx-community/Qwen3.5-9B-4bit", "mlx-community/Qwen3.8-27B-4bit", "mlx-community/Qwen3.5-27B-Claude-4.6-Opus-Distilled-MLX-4bit"]
RODADAS = int(__import__("os").environ.get("RODADAS", "2"))

print("referência: gemini-3.7-flash sem pensar → $0,006 · 3,5 s · termos 5/5 · confessa 2/2")
print(f"{'modelo':46} {'carga':>6} {'ger.':>6} {'tok/s':>6}  losart dipir travam bicicl condrop | INTERPRETEI psiculécia de-pirona | idade | md | JSON")
for nome in MODELOS:
    t0 = time.time()
    try:
        model, tok = load(nome)
    except Exception as e:
        print(f"{nome:46}  ERRO ao carregar: {str(e)[:80]}"); continue
    carga = time.time() - t0
    msgs = [{"role": "user", "content": prompt}]
    try:
        chat = tok.apply_chat_template(msgs, add_generation_prompt=True, enable_thinking=False)
    except TypeError:
        chat = tok.apply_chat_template(msgs, add_generation_prompt=True)
    for r in range(RODADAS):
        t1 = time.time()
        out = generate(model, tok, prompt=chat, max_tokens=3000, sampler=make_sampler(temp=0.2), verbose=False)
        dt = time.time() - t1
        ntok = len(tok.encode(out))
        full = re.sub(r"<think>[\s\S]*?</think>", "", out)   # tira raciocínio, se o modelo cuspiu
        t = full.split("---JSON---")[0]; low = t.lower()
        chk = lambda w: "✓" if w in low else "✗"
        interp = "✓" if re.search(r"O QUE EU INTERPRETEI", t, re.I) else "✗"
        d1 = "✓" if re.search(r"psicul", t, re.I) else "✗"; d2 = "✓" if re.search(r"de pirona", t, re.I) else "✗"
        idade = "SIM" if re.search(r"\d{2}\s*anos", t) else "não"; md = "**" if re.search(r"\*\*|^#", t, re.M) else "ok"
        jok = "✗"
        try:
            j = full.split("---JSON---")[1]; json.loads(re.sub(r"```json\n?|```\n?", "", j).strip()); jok = "✓"
        except Exception: pass
        print(f"{nome.replace('mlx-community/',''):46} {carga:5.0f}s {dt:5.1f}s {ntok/dt:6.1f}  {chk('losartana'):6} {chk('dipirona'):5} {chk('travamento'):6} {chk('bicicleta'):6} {chk('condropatia'):7} | {interp}           {d1}          {d2}       | {idade:5} | {md} | {jok}")
        Path(f"local-{nome.split('/')[-1]}-r{r+1}.txt").write_text(out)
    del model
