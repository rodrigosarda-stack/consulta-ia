# Pedido de pesquisa profunda — inferência eficiente para prontuários médicos em hardware próprio

> Cole o texto abaixo, inteiro, numa ferramenta de pesquisa profunda (Claude Research, Gemini Deep Research, ChatGPT Deep Research, Perplexity). Escrito em 08/09/2026.

---

Quero uma pesquisa exaustiva, com fontes datadas e números, sobre **como produzir prontuários médicos a partir de áudio de consulta com o menor custo por consulta possível, em hardware próprio, sem perder qualidade clínica**. Não quero um resumo genérico de "melhores LLMs de 2026". Quero que você parta do que já medi, questione minhas escolhas e me devolva alternativas concretas, ranqueadas, com evidência.

## 1. Contexto: o que o sistema faz

Produto brasileiro (MarIA). O médico grava a consulta pelo celular. O sistema:

1. **Transcreve** o áudio em português do Brasil, com vocabulário médico (nomes de remédios, doses, exames), separando quem fala (médico / paciente / terceiro).
2. **Vigia** o conteúdo enquanto grava, com um modelo barato: é consulta ou não? terminou?
3. **Escreve o prontuário** a partir da transcrição: texto clínico estruturado, sem inventar nada, e com uma seção obrigatória **"O QUE EU INTERPRETEI"** onde o modelo confessa cada trecho que a transcrição trouxe quebrado e ele consertou (ex.: "de pirona" → dipirona; "psiculécia" → ?).
4. Devolve tudo ao médico em menos de ~2 minutos.

Escala alvo: **1.000 médicos, ~4 horas gravadas por dia cada, consulta média de 35 min**, pico de ~690 prontuários por hora.

## 2. Restrições não negociáveis

- **LGPD**: áudio e transcrição são dados de saúde. Não podem ir para fornecedor sem contrato de tratamento de dados (DPA) e sem garantia de não-treinamento. Marketplaces de GPU de terceiros (Vast.ai, RunPod community) e APIs sem DPA (DeepSeek) estão **fora**. Hardware próprio é preferido.
- **Hardware que já tenho, parado**: dezenas de **Mac mini M4 Pro com 32 GB** de memória unificada. Posso comprar mais ou comprar servidor com GPU, mas quero saber se preciso.
- **Idioma**: português do Brasil, fala espontânea, ruído de consultório, criança ao fundo, duas ou três vozes.
- **Qualidade clínica não pode cair**: o critério de aprovação está na seção 4.

## 3. O que já medi (não repita, parta daqui)

**Transcrição** (duas gravações reais de iPhone, 2 vozes, criança ao fundo, comparadas palavra a palavra com o roteiro):
- Whisper large-v3 (via Groq): 91,9 % e 87,8 % de acerto; 5/8 e 6/8 termos médicos críticos. Errou "de pirona", "ergonômica", "chondropatia", "provamento". Sem separação de falantes. ~US$ 0,11/hora.
- Gemini 3.7 Flash ouvindo o áudio direto: 93,9 % e 90,5 %; 8/8 termos; falantes 7/7 corretos. ~US$ 0,12/hora.
- Gemini 3.5 Flash-Lite áudio: 8/8 e 7/8; ~US$ 0,055/hora.
- Ressalva conhecida: um LLM transcrevendo pode **normalizar** a fala (corrigir o que o paciente disse errado), o que é bom para remédio e ruim para literalidade.

**Prontuário** (mesma transcrição real; régua na seção 4; 2 a 4 rodadas cada):
- Aprovados: **Gemini 3.7 Flash sem thinking** (US$ 0,006/prontuário, 3,5 s) e **Claude Sonnet 5** (US$ 0,04, 25 s).
- **Qwen3.8-27B 4-bit rodando localmente via MLX** num MacBook M4 Pro 24 GB: aprovado 2/2, mas **7,5–8,1 tokens/s → ~200 s por prontuário**, 15 GB de memória.
- Reprovados: gpt-oss-120b (escreve bem, não conserta o remédio 4/4), gpt-oss-20b e Qwen3.6 (estouram raciocinando), Claude Haiku 4.5 e Gemini lites (acertam termos, não confessam), Qwen3.5-9B (vê o erro, confessa, mas não corrige no texto), Qwen3.5-27B "destilado do Claude Opus" (trocou dipirona por "Piroxicam 1 g" e confessou com confiança: perigoso).
- Gemini 3.x com thinking ligado dobrou o custo e não melhorou nada mensurável em tarefa de extração.

**Custos hoje**, por hora gravada, tudo em API: ~R$ 0,50 (Whisper/Gemini áudio é ~70 % disso). Meta com hardware próprio: ~R$ 0,02.

**Hipótese atual de arquitetura local**: Mac mini 32 GB rodando Whisper + Qwen3.8-27B 4-bit, servindo 4–8 prontuários em lote (batching) para amortizar a leitura dos 15 GB de pesos por token, possivelmente com multi-token prediction. Estimativa não medida: ~130 prontuários/hora por mini → ~8 minis no pico. Gemini como reserva quando a fila estoura.

## 4. A régua de aprovação (use-a para julgar tudo que propuser)

Um modelo de prontuário só é aprovado se, na transcrição real de teste:
1. Acerta os 5 termos: losartana, dipirona, travamento, bicicleta, condropatia.
2. **Conserta** "de pirona" → dipirona no texto **e** confessa o conserto na seção "O QUE EU INTERPRETEI".
3. Confessa "psiculécia" como não entendido (não inventa um remédio).
4. Não inventa idade, exame ou dose que não está na transcrição.
5. Sai sem markdown e com o bloco JSON final válido.
6. Faz isso em 2 de 2 rodadas com temperatura 0,2.

Para transcrição: acerto de palavra ≥ 92 %, 8/8 termos críticos, falantes corretos, em português do Brasil com ruído.

## 5. O que quero que você pesquise (seja exaustivo em cada item)

### A. Modelos abertos para o prontuário
- Todos os modelos abertos (pesos disponíveis) lançados até hoje que rodem em ≤ 32 GB de memória unificada quantizados, com resultado publicado em português ou em tarefas clínicas: Qwen 3.x/4.x, Llama 4.x, Gemma 3/4, Mistral/Mixtral/Magistral, Phi-4/5, GLM-4.x/5, Kimi, MiniMax, Nemotron, Granite, Aya/Command, EXAONE, Sabiá/Maritaca (brasileiros), Med-PaLM-like abertos, MedGemma, OpenBioLLM, Meditron, ClinicalCamel, e o que eu não conheço.
- Para cada candidato: tamanho, licença (uso comercial?), quantizações disponíveis (GGUF/MLX/AWQ/GPTQ), desempenho reportado em português, desempenho em benchmarks clínicos (MedQA, PubMedQA, HealthBench, MedHELM, ACI-Bench para notas clínicas), se tem versão com **multi-token prediction**, **MoE** (parâmetros ativos vs. totais, o que importa para velocidade em memória unificada), e evidência de **alucinação baixa em extração fiel**.
- Modelos **MoE pequenos-ativos** me interessam muito: um 30B-A3B lê pouco da memória por token. Compare a qualidade deles com densos 27B na tarefa de fidelidade.
- Fine-tuning: quanto custa e quanto rende fazer um LoRA/QLoRA de um modelo 7–14B especificamente para "transcrição → prontuário + confissão" com poucos milhares de exemplos sintéticos gerados pelo Gemini 3.7/Sonnet 5? Casos publicados de destilação **de tarefa** (não de estilo) em domínio clínico. Riscos (o destilado que reprovei herdou estilo, não cuidado).

### B. Técnicas de inferência mais eficientes que "batching + MTP"
- Speculative decoding (draft model, EAGLE-3, Medusa, self-speculative, n-gram/prompt lookup: a transcrição está no prompt, então prompt-lookup deve render muito), com números em Apple Silicon.
- Continuous batching, paged KV cache, prefix caching (meu prompt de sistema é fixo e longo), chunked prefill. O que existe **em MLX** hoje (mlx-lm server, vLLM-MLX, exo, LM Studio, Ollama MLX) vs. llama.cpp Metal. Throughput real medido em M4 Pro 32 GB para modelos 27–32B 4-bit, com 1, 4, 8, 16 sequências.
- Quantização: 4-bit vs. 3-bit vs. mixed (AWQ, GPTQ, QuIP#, AQLM, DWQ do MLX, K-quants do llama.cpp) e o efeito **medido** em fidelidade clínica, não só perplexidade. Existe quantização que caiba um 70B em 32 GB com qualidade aceitável?
- KV cache quantizado (8-bit, 4-bit) para caber mais sequências.
- Estruturar a saída (constrained decoding / grammar / JSON schema) para reduzir tokens e erros de formato.
- Fatiar a tarefa: um modelo pequeno extrai fatos estruturados e um maior redige? Ou dois passos no mesmo modelo? Evidência de que reduz alucinação ou custo.
- Um modelo grande particionado entre vários Mac minis via rede (exo, MLX distributed, Thunderbolt 5 ring). Vale a pena ou a latência de rede mata? Números.

### C. Transcrição em hardware próprio
- Whisper large-v3 / large-v3-turbo / distil-whisper em pt-BR: WER publicado e tempo real em M4 Pro (whisper.cpp Metal, MLX Whisper, faster-whisper, WhisperKit).
- Alternativas: NVIDIA Parakeet/Canary (há versão multilíngue com pt-BR?), Voxtral (Mistral) e Voxtral small local, Gemma-áudio / Qwen3-Omni / Qwen-Audio abertos que **transcrevam e rotulem falantes** localmente como o Gemini faz, Seamless, Moonshine, Kyutai, Sherpa/Zipformer, modelos brasileiros (FalaBrasil, CORAA, NURC-SP, Whisper fine-tuned pt-BR no Hugging Face).
- Diarização local (pyannote 3.x, NeMo, WhisperX, diart) em duas ou três vozes com ruído: acurácia e custo computacional.
- Léxico: como injetar 20 mil termos médicos em pt-BR sem estourar o prompt (biasing, fine-tune, correção pós-ASR com LLM barato, dicionário fonético). O que funciona **de verdade** para nomes de remédios.
- Transcrição em streaming vs. em lote quando o médico para: custo e qualidade de cada.

### D. Hardware: Mac mini vs. alternativas
- Throughput medido (tokens/s, prontuários/hora) de modelos 27–32B 4-bit em: Mac mini M4 Pro 32/64 GB, Mac Studio M4 Max/Ultra, RTX 4090/5090 (24/32 GB), RTX 6000 Ada/Blackwell, DGX Spark (GB10, 128 GB), AMD Strix Halo 128 GB, Jetson Thor. Preço em reais no Brasil e no Paraguai, consumo em watts, custo por 1.000 prontuários incluindo energia.
- Para GPU NVIDIA: vLLM/SGLang/TensorRT-LLM com FP8, quanto de batching real cabe, e se **uma** GPU substitui **N** minis.
- Alugar GPU **dedicada** em data center com DPA (Azure/AWS/GCP Brasil, Oracle, Lambda, CoreWeave, Nebius, provedores brasileiros): preço/hora e se resolve LGPD.

### E. Custo da API como piso de comparação
- Preço atual e tendência (últimos 12 meses) de Gemini Flash/Flash-Lite, Claude Haiku/Sonnet, GPT-5-mini/nano, Mistral, e APIs abertas com DPA (Together, Fireworks, Groq enterprise, Cerebras) para os modelos abertos aprovados. Batch APIs com 50 % de desconto: meu caso aceita 1–2 min de latência?
- Se existe qualquer API que transcreva áudio pt-BR com falantes por menos de US$ 0,05/hora com DPA.

## 6. Formato da resposta

1. **Resumo executivo** em 15 linhas: o que eu deveria fazer diferente do plano atual e por quê.
2. **Tabela de candidatos para o prontuário**: modelo, tamanho/ativos, licença, memória em 4-bit, tokens/s estimado em M4 Pro 32 GB (com fonte), evidência em pt-BR, evidência clínica, chance de passar na régua da seção 4 (alta/média/baixa com justificativa), o que testar primeiro.
3. **Tabela de técnicas de inferência**: técnica, ganho medido (×), onde roda hoje (MLX / llama.cpp / vLLM), maturidade, risco para a qualidade, esforço.
4. **Tabela de transcrição local**: modelo, WER pt-BR, tempo real em M4 Pro, falantes sim/não, léxico sim/não.
5. **Tabela de hardware**: opção, preço, prontuários/hora estimados, custo por 1.000 prontuários, consumo, prós/contras LGPD.
6. **Plano de testes** que eu consiga rodar em uma semana com 1 Mac mini: o que baixar, em que ordem, o que medir, critério de aprovação.
7. **O que você não achou**: lacunas onde não há medição publicada e eu terei que medir.

Regras: cite fonte e data para cada número; distinga claramente **medido** de **estimado** de **opinião**; priorize resultados de 2026 e final de 2025; quando duas fontes discordarem, mostre as duas; não invente benchmark. Se algum modelo que citei já tem sucessor, diga qual. Escreva em português do Brasil.
