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

*Medido com o Mac no limite de memória (0,1 GB livre, swap). Num Mac mini Pro
de 32 GB — que o Rodrigo tem, parados — roda sem swap; estimativa 10–15 tok/s,
~2 min por prontuário, ~30 prontuários/hora por máquina.

**É o primeiro modelo abaixo do Sonnet 5 que conserta o remédio partido E
confessa. E roda numa máquina que já existe, sem o dado de paciente sair.**

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
