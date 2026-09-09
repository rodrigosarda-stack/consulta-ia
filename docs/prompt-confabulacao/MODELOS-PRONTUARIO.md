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

## 08/09/2026 (noite, 3) — 14 modelos baratos via OpenRouter (chave do Rodrigo), mesma régua, 2 rodadas, temp 0,2, sem raciocínio (ou `effort: low` quando obrigatório)

Régua da confissão corrigida: antes exigia a string literal "de pirona"; agora = escreveu **dipirona** no texto E citou "pirona" na seção O QUE EU INTERPRETEI. Script: `medir-openrouter.mjs`. Custo real por chamada vem do `usage.cost` do OpenRouter.

| modelo | tipo | US$/prontuário | termos | confissão pirona | veredito |
|---|---|---|---|---|---|
| **google/gemma-4-31b-it** | denso 31B, **pesos abertos** | **0,0007** | 5/5 · 5/5 | ✓ ✓ ("de pirona → dipirona, correção ortográfica de medicamento") | **PASSA 2/2** ⭐ cabe num mini de 32 GB |
| qwen/qwen3.8-27b (hospedado) | denso 27B, aberto | 0,0035 | 5/5 · 5/5 | ✓ ✓ | PASSA 2/2 (igual ao local) |
| deepseek/deepseek-v4-flash | MoE 277B (6 ativos), aberto mas gigante | 0,0006–0,0011 | 5/5 · 5/5 | ✓ ✓ (r1 até avisa "pode ser piroxicam [?]") | PASSA 2/2 — **só API; servidor chinês/sem DPA nos provedores testados** |
| z-ai/glm-5.3-flash | ? | 0,0007 | 5/5 · 4/5 (perdeu bicicleta) | ✓ ✓ | 1/2 — host Z.AI (China) |
| openai/gpt-5-mini (effort low) | API | 0,0050 | 4/5 (perdeu travamento) · 5/5 | ✓ ✓ | 1/2 — e não é mais barato que o Gemini |
| qwen/qwen3.6-35b-a3b | **MoE 3B ativos** | 0,0018 | 4/5 · 4/5 | ✗ ✗ — **inventou** "Pirona = condroitina" (r1) e "Pirrona = diclofenaco" (r2) | REPROVADO (perigoso) |
| google/gemma-4-26b-a4b-it | **MoE 4B ativos** | 0,0003–0,0006 | 4/5 · 3/5 | ✗ ✗ — manteve "Pirona" como remédio | REPROVADO |
| nvidia/nemotron-3.5-lightning | MoE 3B ativos | 0,0005 | 3/5 · 3/5 | ✗ ✗ (nem seção INTERPRETEI) | REPROVADO |
| nvidia/nemotron-3-nano-30b-a3b | MoE 3B ativos | 0,0008 | 0/5 · 2/5 | ✗ ✗ | REPROVADO |
| mistralai/mistral-small-2603 | denso 24B | 0,0014 | 4/5 · 3/5 | ✓ ✗ | REPROVADO |
| openai/gpt-5-nano (effort low) | API | 0,0008–0,0013 | 3/5 · 3/5 | ✗ ✗ | REPROVADO |
| deepseek/deepseek-v4-flash-0731 | versão nova | 0,0003–0,0004 | 4/5 · 4/5 | ✗ ✗ | REPROVADO (regrediu vs. o Flash original) |

**Padrão que fechou (4 de 4):** todo MoE de poucos parâmetros ativos (Qwen A3B, Gemma A4B, Nemotron A3B ×2) **reprova exatamente no conserto do remédio** — ou mantém "Pirona" como se fosse fármaco, ou inventa um. Todo denso ≥ 27B testado (Qwen 27B, Gemma 31B) passa. A velocidade 5× do MoE não vem de graça: os 3B ativos não carregam o "cuidado" que a tarefa exige. **Para os minis, o candidato passa a ser o Gemma 4 31B denso** (mesma classe de velocidade do Qwen 27B, ~40 prontuários/h por mini com lote de 4, a medir).

**Para a API (enquanto não há mini):** Gemma 4 31B hospedado a US$ 0,0007 = **9× mais barato que o Gemini 3.7** com a mesma régua. Falta checar DPA do provedor (Novita/DeepInfra) — ou hospedar em Vertex/Together com contrato.


## 09/09/2026 (madrugada) — VARREDURA: 141 modelos de texto ≤ US$ 2,50/M do OpenRouter, 2 rodadas cada, mesma régua (US$ 0,58 no total)

Filtro: todo modelo de texto do catálogo com saída ≤ US$ 2,5/M e entrada ≤ US$ 1/M, sem os já testados, sem código/roleplay/imagem/free/batch. 4 processos em paralelo, ~40 min. Régua automática: 5/5 termos + dipirona no texto com "pirona" citado no INTERPRETEI + psiculécia citada + JSON válido, nas 2 rodadas. Lista completa: `varredura-openrouter-2026-09-09.txt`.

**Passaram 2/2: 22 de 141.** Base da coluna R$/mês: 1.000 médicos × 4 h/dia × 22 dias, consulta de 35 min ≈ 151 mil prontuários/mês, dólar 5,40.

| modelo | US$/prontuário | R$/mês p/ 1.000 médicos | onde roda |
|---|---|---|---|
| deepseek/deepseek-v3.2 | 0.0007 | 595 | pesos abertos (671B MoE) — só nuvem; hosts EUA existem |
| minimax/minimax-m3 | 0.0009 | 713 | API MiniMax (China) |
| tencent/hy3 | 0.0013 | 1.048 | API Tencent (China) |
| microsoft/wizardlm-2-8x22b | 0.0022 | 1.757 | pesos abertos. 141B — só nuvem |
| deepseek/deepseek-v3.1-terminus | 0.0022 | 1.769 | pesos abertos. 671B — só nuvem |
| deepseek/deepseek-chat-v3.1 | 0.0022 | 1.822 | pesos abertos. 671B — só nuvem |
| qwen/qwen3.7-plus | 0.0025 | 2.047 | API Alibaba |
| openai/gpt-4.1-mini | 0.0026 | 2.132 | API OpenAI/Azure — **tem DPA** |
| meituan/longcat-2.0 | 0.0027 | 2.210 | API Meituan (China) |
| qwen/qwen3.5-plus-02-15 | 0.0032 | 2.589 | API Alibaba |
| z-ai/glm-4.6 | 0.0033 | 2.675 | pesos abertos. 355B — só nuvem |
| z-ai/glm-4.7 | 0.0037 | 3.009 | pesos abertos. 355B — só nuvem |
| qwen/qwen3.6-plus | 0.0037 | 3.050 | API Alibaba |
| qwen/qwen3.5-122b-a10b | 0.0038 | 3.094 | pesos abertos. 122B — não cabe em 32 GB |
| mistralai/mistral-medium-3.1 | 0.0040 | 3.278 | API Mistral (UE) — **tem DPA** |
| bytedance-seed/seed-2.0-lite | 0.0042 | 3.429 | API ByteDance (China) |
| z-ai/glm-5 | 0.0044 | 3.588 | pesos abertos. grande — só nuvem |
| deepseek/deepseek-v4-pro | 0.0055 | 4.509 | API DeepSeek |
| deepseek/deepseek-v4-pro-0813 | 0.0058 | 4.701 | API DeepSeek |
| moonshotai/kimi-k2.5 | 0.0064 | 5.194 | pesos abertos. 1T — só nuvem |
| aion-labs/aion-2.0 | 0.0083 | 6.796 | API |
| x-ai/grok-build-0.1 | 0.0130 | 10.564 | API xAI |

Referências na mesma base: Gemini 3.7 Flash 0.0060 → R$ 4.892/mês · **Gemma 4 31B 0.0007 → R$ 571/mês** (medido na rodada anterior. passa 2/2. cabe num mini) · Sonnet 5 0.04 → R$ 32.616/mês.

**1/2 (22 modelos):** qwen3.5-flash, mimo-v2.5, qwen-plus, minimax-m2.x, gpt-5.6-luna, qwen3.6-flash, qwen3.5-35b-a3b, gemini-3.5-flash-lite, gemini-2.5-flash, glm-4.5, qwen3.5-27b, qwen3.6-27b, kimi-k2-0905, seed-2-1-turbo… — instáveis na régua; não servem sem mais rodadas.

**Leitura:**
- **Nenhum modelo aberto que caiba num Mac mini de 32 GB apareceu além dos que já tínhamos** (Gemma 4 31B e Qwen3.8-27B). Os abertos que passam (DeepSeek V3.x, GLM 4.6/4.7, Kimi, WizardLM 8x22B, Qwen 122B) são de 120 B a 1 T de parâmetros — só nuvem.
- **Para API com contrato de dados hoje:** `gpt-4.1-mini` (US$ 0,0026, OpenAI/Azure) e `mistral-medium-3.1` (US$ 0,004, UE). Ambos mais baratos que o Gemini 3.7 e com DPA de prateleira. Gemma 4 31B na Vertex é 4× mais barato ainda — a confirmar preço lá.
- **Os mais baratos absolutos (DeepSeek V3.2 US$ 0,0007, MiniMax M3, Tencent HY3)** são servidos por empresas chinesas ou por hosts americanos sem contrato verificado. DeepSeek V3.2 tem pesos abertos: um host com DPA (Together/Fireworks/Azure) o torna legal — a verificar.
- A régua com n=2 é filtro, não veredito: 22 aprovados com 2 rodadas cada terão falsos positivos. O passo seguinte é a régua de 10–20 gravações nos 5–6 finalistas.
