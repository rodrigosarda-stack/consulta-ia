#!/usr/bin/env python3
"""medir-lote.py — o 'ônibus' na prática: quantos prontuários por hora o Qwen3.8-27B faz
escrevendo 1, 2 e 4 ao mesmo tempo neste Mac (mlx_lm.batch_generate)."""
import re, sys, time, json
from pathlib import Path
from mlx_lm import load, batch_generate
from mlx_lm.sample_utils import make_sampler

PC = Path("/Users/greenvalreflorestamento/Documents/Sistemas/consulta-ia")
src = (PC / "supabase/functions/process-consultation/index.ts").read_text()
def literal(nome):
    m = re.search(r"const %s = `([\s\S]*?)`;" % nome, src)
    return m.group(1).encode().decode("unicode_escape").encode("latin-1").decode("utf-8")
PRONT = literal("PRONTUARIO_PROMPT"); JSONI = literal("JSON_INSTRUCTION")
T2 = (PC / "docs/prompt-confabulacao/fixture-transcricao-2vozes-teste2-2026-09-07.txt").read_text()
prompt = f"{PRONT}{JSONI}\n\n===== INICIO DO CONTEUDO =====\nPaciente: Ana\n\nTranscricao:\n{T2}\n===== FIM DO CONTEUDO ====="

nome = sys.argv[1] if len(sys.argv) > 1 else "mlx-community/Qwen3.8-27B-4bit"
lotes = [int(x) for x in (sys.argv[2].split(",") if len(sys.argv) > 2 else "1,2,4".split(","))]
model, tok = load(nome)
msgs = [{"role": "user", "content": prompt}]
try: chat = tok.apply_chat_template(msgs, add_generation_prompt=True, enable_thinking=False)
except TypeError: chat = tok.apply_chat_template(msgs, add_generation_prompt=True)
ids = chat if isinstance(chat, list) else tok.encode(chat)
print(f"modelo {nome} · prompt {len(ids)} tokens", flush=True)
print(f"{'lote':>4} {'tempo':>7} {'tok gerados':>11} {'tok/s total':>11} {'tok/s cada':>10} {'pront/h':>8}  régua por prontuário (termos/5, de-pirona, JSON)", flush=True)
for n in lotes:
    t0 = time.time()
    r = batch_generate(model, tok, prompts=[ids]*n, max_tokens=2200, sampler=make_sampler(temp=0.2), verbose=False, prefill_batch_size=1, prefill_step_size=256)
    dt = time.time() - t0
    textos = r.texts; ntok = sum(len(tok.encode(t)) for t in textos)
    reg = []
    for i, t in enumerate(textos):
        low = t.lower(); termos = sum(w in low for w in ["losartana","dipirona","travamento","bicicleta","condropatia"])
        dp = "✓" if re.search(r"de pirona", t, re.I) else "✗"
        try: json.loads(re.sub(r"```json\n?|```\n?", "", t.split("---JSON---")[1]).strip()); jk="✓"
        except Exception: jk="✗"
        reg.append(f"{termos}/5 {dp} {jk}"); Path(f"lote{n}-{i+1}.txt").write_text(t)
    print(f"{n:>4} {dt:6.0f}s {ntok:>11} {ntok/dt:11.1f} {ntok/dt/n:10.1f} {n*3600/dt:8.1f}  {' | '.join(reg)}", flush=True)
