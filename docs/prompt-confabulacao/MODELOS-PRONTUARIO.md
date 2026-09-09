# Que modelo escreve o prontuário? — medido, 08/09/2026

Rodrigo: *"tem open source e IAs chinesas mais baratas e boas tanto quanto,
certo? Pesquise. Faltou Anthropic, ChatGPT — às vezes o top de linha é caro e
não precisa."*

Instrumento: a transcrição real do teste 2 (voz humana, 2 pessoas, criança ao
fundo) com o prompt de produção. Checa **5 termos** (losartana, dipirona,
travamento, bicicleta, condropatia), **2 confissões** que o modelo deve fazer
na seção "O QUE EU INTERPRETEI" (`psiculécia → bicicleta`, `de pirona →
dipirona`), idade inventada, markdown, JSON válido. 2 rodadas por modelo.
`$/chamada` = preço real pelos tokens cobrados.

## Medidos

| modelo | onde | $/chamada | tempo | termos | confessa | JSON | veredito |
|---|---|---|---|---|---|---|---|
| **gemini-3.7-flash sem pensamento** (produção) | Google | **$0,006** | 3,5 s | 5/5 | 2/2 | ✓ | **referência** |
| gemini-3.7-flash pensando | Google | $0,013 | 8 s | 5/5 | 2/2 | ✓ | igual, 2× o preço |
| gemini-3.5-flash-lite | Google | $0,0037 | 3,6 s | 5/5 | 1/2 | ✓ | não confessa "de pirona" |
| gemini-3.1-flash-lite | Google | $0,0019 | 3,4 s | 5/5 | 1/2 | ✓ | idem |
| gpt-oss-120b (aberto, esforço baixo) | Groq | $0,001 | 3–4 s | 4/5 — **não conserta "de pirona"** | 1/2 | ✓ | barato, erra o remédio |
| gpt-oss-20b | Groq | — | — | 0/5 (raciocina até estourar) | — | ✗ | inútil aqui |
| qwen3.8-27b (aberto) | Groq | $0,005 | 3 s | 4/5 — não escreveu "dipirona" | 2/2 | ✓ | promissor; 1 rodada só (limite do Groq grátis) |
| qwen3.6-27b | Groq | — | 10 s | 0/5 (estourou pensando) | — | ✗ | — |
| claude-haiku-4.5 | Anthropic | $0,012 | 17 s | 5/5 | **1/2** | ✓ | escreve certo, não confessa "de pirona"; 5× mais lento |
| claude-sonnet-5 | Anthropic | $0,035–0,046 | 24–31 s | 5/5 | 2/2 | 1/2 (estourou 4 k tokens) | faz tudo; 6× o preço, 8× o tempo |

## Rodando NO MAC (MLX, M4 Pro 24 GB) — custo zero por consulta

| modelo | tok/s | tempo por prontuário | termos | confessa | JSON | veredito |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-4bit | 27 | 60 s | 3/5 — não conserta "de pirona" nem "psiculécia" | 2/2 (vê o erro, lista, mas não corrige no texto) | ✓ | não serve |
| **Qwen3.8-27B-4bit** | 7,5* | 225 s* | **5/5** | **2/2** + declarou "provamento → travamento" e "les → lesão" | ✓ | **passa na mesma régua do Gemini 3.7** — 2 de 2 rodadas (7,5 e 8,1 tok/s) |

| Qwen3.5-27B "Claude-4.6-Opus-Distilled" | 8,2–8,4 | 208–235 s | 3/5 — **inventou "Piroxicam 1 g a cada 6–8 h"** no lugar de Dipirona; "ciclismo" no lugar de bicicleta | 2/2 e 1/2 — confessa, mas o conserto é ERRADO | ✓ (com markdown) | **reprovado — o pior tipo de erro: remédio trocado com dose absurda** |

*Medido com o Mac no limite de memória (0,1 GB livre, swap). Num Mac mini Pro
de 32 GB — que o Rodrigo tem, parados — roda sem swap; estimativa 10–15 tok/s,
~2 min por prontuário, ~30 prontuários/hora por máquina.

**O 27B puro é o primeiro modelo abaixo do Sonnet 5 que conserta o remédio
partido E confessa. E roda numa máquina que já existe, sem o dado de paciente
sair.** O "destilado do Claude" — o boato do "Claude copiado" — é um Qwen
treinado imitando respostas do Claude: escreve mais bonito, com markdown, e
**trocou dipirona por piroxicam 1 g** (dose 50× a usual) enquanto confessava a
troca com toda a confiança. Transparência não salva conserto errado.

## Só preço de tabela (não medidos — sem conta ou sem contrato de dados)

| modelo | onde | entrada / saída (por M) | ≈ $/chamada | LGPD |
|---|---|---|---|---|
| GPT-5-nano | OpenAI, EUA | $0,05 / $0,40 | $0,0007 | DPA ok |
| GPT-5-mini | OpenAI, EUA | $0,25 / $2,00 | $0,0034 | DPA ok |
| GPT-5.6 Luna | OpenAI, EUA | $0,20 / $1,20 | $0,002 | DPA ok |
| DeepSeek V4 Flash | **China** | $0,14 / $0,28 | $0,0006 | **sem DPA — não pra dado de paciente** |
| Qwen 3.8 Flash | Alibaba, Singapura | $0,14 / $0,42 | $0,0008 | DPA com advogado |
| Mistral Small | França | $0,20 / $0,60 | $0,0012 | UE — ok |
| Qwen / Gemma / Llama abertos | **Mac minis** | 0 | 0 | **dado não sai** |

## Conclusão

- O que separa os modelos não é escrever o prontuário — quase todos escrevem.
  É **consertar "de pirona" e confessar que consertou**. Só o Gemini 3.7 e o
  Sonnet 5 fizeram os dois em 2/2. O Gemini custa 6× menos e é 8× mais rápido.
- O "top de linha" (Sonnet, Opus, GPT-5.6) não precisa — o Rodrigo está certo.
  Mas o "barato demais" também não serve: **abaixo do Gemini 3.7, todos
  falharam no remédio partido**.
- O caminho de custo zero é o modelo aberto **nos Mac minis** — a medir com
  este mesmo instrumento assim que houver um mini ligado. Qwen 3.8 é o
  candidato (o 27B no Groq foi o melhor aberto).
- Próximo com conta nova: GPT-5-nano / GPT-5-mini e Qwen 3.8 Flash (Alibaba).

Scripts: `medir-*.mjs` desta pasta (precisam das actions `lab-*`, removidas —
estão no histórico do git).

## 08/09/2026 (noite) — MoE de poucos ativos no MacBook: velocidade confirmada, qualidade da versão podada REPROVADA

Motivação: as pesquisas apontaram MoE "A3B" (3B ativos) como 5–10× mais rápido que o denso 27B em Apple Silicon. O oficial `Qwen3.6-35B-A3B` em 4-bit MLX tem **20,4 GB** — não cabe no MacBook de 24 GB. Testei a única variante que cabe: `mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B` (14,9 GB; REAP = experts podados de 35B → 19B).

| | carga | geração | tok/s | termos | INTERPRETEI | psiculécia | de pirona | JSON |
|---|---|---|---|---|---|---|---|---|
| r1 | 7 s | 72,0 s | **40,1** | 2/5 (losartana, condropatia) | ✓ | ✓ | ✗ | ✓ |
| r2 | 7 s | 71,3 s | **42,1** | 2/5 | ✓ | ✓ | ✗ | ✗ |

**Velocidade: 5× o denso** (40 tok/s vs 7,5–8; 72 s vs ~200 s por prontuário). Isso confirma a tese da pesquisa: 3B ativos leem ~2 GB por token em vez de 15.

**Qualidade: inutilizável.** Escreveu em inglês misturado com português ("Prescrevo of pirona 1 gram until of 6 in 6 hours"), trocou "pirona" por **"Losartana 1 g a cada 6 h"** (r1) e por "pain relief" (r2), "psiculécia ergométrica" virou "psychological ergometrics", "travamento" e "bicicleta" sumiram, e na r2 entrou em loop ("Actually, condropatia might be condropatia…") e estourou o JSON. É colapso de idioma típico de poda de experts: os experts que carregavam o português foram cortados.

**Conclusão honesta:** o resultado **não diz nada sobre o Qwen3.6-35B-A3B completo** — só sobre a versão podada. Diz duas coisas: (1) a velocidade do MoE é real e resolve o gargalo do mini; (2) **terceira variante "derivada" reprovada** (destilado, REAP… só pesos oficiais daqui pra frente). O teste que vale — modelo completo de 20,4 GB, 1/4/8 em lote — precisa de um **Mac de 32 GB**. Saída bruta: `local-qwen3.6-35B-A3B-REAP-19B-r1-2026-09-08.txt`.

## 08/09/2026 (noite, 2) — O "ônibus" MEDIDO: Qwen3.8-27B escrevendo 1, 2 e 4 prontuários ao mesmo tempo (MacBook M4 Pro 24 GB)

`mlx_lm.batch_generate`, mesmo prompt real (1.590 tokens), temp 0,2, `prefill_batch_size=1, prefill_step_size=256` (sem isso o lote 2 estoura a memória da GPU: o Mac de 24 GB dá 19 GB pra GPU e o modelo ocupa 15). Script: `medir-lote-mlx.py`.

| juntos | tempo | tok/s total | tok/s cada | **prontuários/h** | régua (termos, de-pirona, JSON) |
|---|---|---|---|---|---|
| 1 | 202 s | 8,1 | 8,1 | **17,8** | 5/5 ✓ ✓ |
| 2 | 257 s | 13,3 | 6,7 | **28,0** | 5/5 ✓ ✓ · 5/5 ✓ ✓ |
| 4 | 366 s | 17,6 | 4,4 | **39,3** | 5/5 ✓ ✓ ×4 |

- **Lote funciona e não degrada nada**: 7 de 7 prontuários passaram inteiros (termos, confissão de "de pirona", JSON).
- **×2,2 com 4 juntos** — abaixo dos ×3,5 que eu estimava. O custo por passo cresce mais que o previsto: 0,123 s (1) → 0,150 s (2) → 0,228 s (4). Culpa provável: atenção sobre KV cache maior + máquina de 24 GB no limite (só 4 GB de folga pra cache). Num mini de 32 GB (17 GB de folga) e com o MoE (2 GB de pesos por passo em vez de 15) a curva deve ser bem melhor — **a medir lá**.
- Não tentei 8: não cabe em 24 GB.
- Com este número conservador: 1 mini ≈ 40 prontuários/h com o denso 27B → ~400/dia em 10 h → cobre ~60 médicos (4 h/dia, 35 min/consulta ≈ 7 consultas/dia). 1.000 médicos ≈ 17 minis só com o que está medido hoje; o MoE deve cortar isso em 3–5×.
