## Resumo executivo

A hipótese de arquitetura do pedido (Mac mini 32 GB + Whisper + Qwen3.8-27B 4-bit em lote) está tecnicamente correta na direção, mas a estimativa de ~130 prontuários/hora por mini é otimista para um modelo denso de 27B e deveria ser revisada para baixo ou substituída por um modelo MoE de poucos parâmetros ativos. A causa raiz é a lei de bandwidth: decodificação em Apple Silicon é limitada por memória, não por compute, e o teto de tokens/s é aproximadamente bandwidth ÷ bytes de peso lidos por token. Num M4 Pro (273 GB/s), um denso de 27B em 4-bit (~15 GB) lê ~15 GB por token gerado por sequência; em lote de N sequências simultâneas, cada passo ainda lê os mesmos 15 GB uma vez (compartilhado), então o batching amplia bastante o throughput agregado — mas a estimativa de 130/hora não foi medida e provavelmente está abaixo do que um MoE ativo-baixo entregaria no mesmo hardware.[^1]

Modelos MoE com poucos parâmetros ativos por token (ex.: Qwen3-30B-A3B, ~3B ativos de 30B totais) leem uma fração da memória por token e por isso rodam de 35 a 100+ tok/s em M4 Pro/Max, contra 7,5–11 tok/s do denso Qwen3.8-27B medido pelo usuário. Isso é uma ordem de grandeza de diferença em velocidade de geração — o próximo teste prioritário deveria ser essa família MoE, não continuar otimizando em torno do 27B denso.[^2][^3][^4][^1]

Speculative decoding via n-gram/prompt-lookup — que o pedido supunha vantajoso porque a transcrição está no prompt — foi medido e **não** acelera em arquiteturas limitadas por bandwidth de memória em batch size 1: ganhos de apenas 0,85–1,00x versus teórico de 5x, porque o gargalo é a leitura de memória, não o compute de verificação. Isso invalida uma das apostas técnicas centrais do pedido e deve ser descartado como via de otimização isolada.[^5]

Não existe (nas fontes levantadas) um MedGemma ou Sabiá validado publicamente na tarefa exata "transcrição pt-BR com erro → prontuário com autoconfissão de correção", o que confirma a suspeita do usuário: essa é uma medição que precisará ser feita internamente, não algo replicável de benchmark publicado.[^6][^7][^8][^9]

## Tabela de candidatos para o prontuário

| Modelo | Tamanho / ativos | Licença | Memória 4-bit | Tok/s estimado M4 Pro 32GB | Evidência pt-BR/clínica | Chance de passar na régua | Prioridade de teste |
|---|---|---|---|---|---|---|---|
| Qwen3-30B-A3B (MoE) | 30B total / ~3B ativos | Apache 2.0 (uso comercial ok) | ~17-20 GB | 35–75 tok/s medido[^2][^3][^1][^4] | Sem benchmark clínico publicado; qualidade geral próxima de densos 30B+ em tarefas gerais | Média-alta — precisa testar confissão/correção especificamente | **1º — maior ganho esperado** |
| Qwen3.6-35B-A3B (MoE, sucessor) | 35B / ~3B ativos | Aberta (verificar termos) | ~21 GB (Q4) | 9,8–33,8 tok/s em hardware mais limitado (M1 Pro 16GB); esperado bem mais alto em M4 Pro 32GB | Comparado informalmente a Claude Sonnet 4.5, não validado[^10][^1] | Média — mais recente que A3B original, potencialmente melhor fidelidade | 2º |
| Qwen3.8-27B 4-bit (denso) | 27B / 27B ativos | — | ~15 GB | 7,5–8,1 tok/s (medido pelo usuário) | Aprovado 2/2 na régua do usuário — única evidência direta de fidelidade na tarefa exata | Alta (já comprovado), mas lento | Baseline confirmado — manter como referência de qualidade |
| MedGemma-27B-text | 27B denso | Health AI Open Weights (uso comercial variável, revisar termos) | ~15-16 GB estimado | Não medido em M4 Pro | 87,7% MedQA, "~3 pontos do DeepSeek-R1 a ~1/10 do custo"; sem evidência em pt-BR ou na tarefa de confissão de erro de transcrição[^11][^7] | Média — forte em conhecimento clínico, desconhecido em pt-BR e na tarefa de auto-correção fiel | 3º — vale testar, mas viés de treino em inglês |
| MedGemma-4B | 4B | Health AI Open Weights | ~2-3 GB | Alto (>60 tok/s esperado) | 64,4% MedQA — abaixo de modelos maiores; risco alto de reprovar régua de fidelidade | Baixa | Teste rápido de descarte |
| Sabiá-4 / Sabiazinho-4 (Maritaca) | Não divulgado publicamente em detalhe | Fechado/comercial (API), não confirmado peso aberto para todos os tamanhos | — | — | Foco declarado em pt-BR jurídico/geral, não clínico especificamente; sem benchmark clínico ou de confissão de erro[^8] | Baixa-média | Testar apenas se houver pesos abertos disponíveis |
| gpt-oss-120b | 120B (MoE) | Apache 2.0 | Excede 32GB tipicamente | — | Reprovado pelo usuário (não conserta remédio 4/4); forte em HealthBench geral mas hallucination rate alto em SimpleQA (78,2%)[^12][^13][^14] | Baixa — já reprovado empiricamente | Descartar |
| gpt-oss-20b | 20B (MoE) | Apache 2.0 | ~11-12 GB | — | Reprovado pelo usuário (estoura raciocinando); hallucination rate ainda maior (91,4%)[^12][^13] | Baixa | Descartar |

## Tabela de técnicas de inferência

| Técnica | Ganho medido | Onde roda hoje | Maturidade | Risco para qualidade | Esforço |
|---|---|---|---|---|---|
| Batching / lote de sequências | Throughput agregado escala quase linearmente até saturar bandwidth; não substitui MoE | MLX-LM server, llama.cpp server, vLLM | Madura | Baixo (não altera geração por sequência) | Médio |
| N-gram / prompt-lookup speculative decoding | 0,85–1,00x em Qwen3-8B e Qwen3.5-9B — **sem ganho real**, contraria a hipótese do pedido[^5] | llama.cpp (`--spec-type ngram-*`), disponível nativamente[^15] | Madura mas ineficaz nesse regime | Nenhum risco de qualidade (saída idêntica), mas ganho de velocidade nulo/negativo | Baixo, mas não vale o esforço |
| Speculative decoding com draft model dedicado | 1,8–2,3x em pares 70B+1B; 2,5–3,5x com EAGLE-2 | llama.cpp `-md`, vLLM, SGLang, TensorRT-LLM[^16] | Madura para GPU; suporte MLX mais limitado | Nenhum (saída matematicamente idêntica ao alvo) | Médio-alto (requer draft model compatível) |
| Quantização KV cache (8-bit/4-bit) | ~28% redução de memória com ajuste de threshold | MLX (mudança de 1 linha)[^5] | Emergente | Baixo-médio, não testado especificamente em fidelidade clínica | Baixo |
| MoE ativo-baixo (Qwen3-30B-A3B e família) | 4–10x mais tokens/s que denso equivalente no mesmo hardware[^1] | MLX, llama.cpp, Ollama | Madura | Desconhecido — precisa validar régua de fidelidade especificamente | Baixo (já disponível) |
| Structured/constrained decoding (JSON schema) | Reduz tokens de saída e erros de formato; melhora acceptance rate de speculative decoding para 50-70% em saída estruturada[^16] | llama.cpp, vLLM, MLX-LM (grammars) | Madura | Baixo | Baixo |
| Particionamento entre múltiplos Macs (rede) | Não encontrada medição direta em Mac minis via Thunderbolt para este caso; DGX Spark multi-nó mostra ~4x quase-linear em 4 nós para fine-tuning, não necessariamente generalizável a inferência single-stream[^17] | exo, MLX distributed | Experimental | Médio — latência de rede pode neutralizar ganho em sequências curtas | Alto |

## Tabela de transcrição local

| Modelo | WER pt-BR | Tempo real / velocidade | Falantes (diarização) | Léxico médico |
|---|---|---|---|---|
| Whisper Large-v3 | ~8,2% (Common Voice BR); outra fonte relata 4,9% em benchmark próprio[^18][^19] | ~0,166 RTF (mais lento que tempo real dependendo do hardware)[^20] | Não nativo — requer WhisperX/pyannote | Não nativo — requer biasing/pós-correção |
| Whisper Large-v3-Turbo | 5,97% (benchmark independente) a 6,7% (WER pt específico)[^21][^20] | RTF ~0,163, mais rápido que Large-v3[^20] | Não nativo | Não nativo |
| Distil-Whisper pt-BR (freds0) | 8,221% WER (validação Common Voice 16) | Mais rápido que Large-v3 por ser destilado | Não | Não |
| TheWhisper (otimizado) | 4,07% pt (openASR leaderboard) | Otimizado para streaming/on-device | Não nativo | Não |
| WhisperX (Whisper + pyannote + align) | Hereda WER do Whisper base (não melhora transcrição); DER diarização 5-9% em 2 falantes clínicos limpos, sobe a 20-30%+ com ruído/crosstalk[^22][^23][^24][^25] | Adiciona custo de alinhamento + diarização | Sim, nativo — 90-95% acurácia com 2-3 falantes cooperativos, degrada com sobreposição[^22][^23][^26] | Não nativo |
| pyannote.audio 3.1 (standalone) | N/A (só diarização) | — | DER 11-19% em benchmarks padrão; 5-9% em consultório clínico limpo com 2 falantes conhecidos[^27][^24][^26][^25] | N/A |

Ponto crítico para o caso de uso: consultório com criança ao fundo e 2-3 vozes é justamente o cenário em que diarização degrada — DER sobe de ~5-9% (2 falantes limpos) para 15-30%+ com ruído e sobreposição. Fixar o número de falantes esperado (`min_speakers`/`max_speakers`) reduz o DER em 5-10 pontos e deveria ser prática obrigatória.[^24][^26]

## Tabela de hardware

| Opção | Preço | Prontuários/hora estimados | Observação sobre custo/LGPD | Fonte |
|---|---|---|---|---|
| Mac mini M4 Pro 32GB (já possuído) | Custo de oportunidade ~zero (parado) | Com MoE ativo-baixo: potencialmente 400-800/hora (extrapolação a partir de 35-75 tok/s vs. 7,5-8 tok/s do denso, não medido diretamente na tarefa) | Hardware próprio resolve LGPD por padrão (sem terceiros) | Estimado — não medido diretamente na tarefa de prontuário |
| NVIDIA DGX Spark (128GB, GB10) | US$ 4.699 (subiu de US$ 3.999 em fev/2026)[^17][^28] | Single-stream fraco em modelos densos grandes (2,7 tok/s em 70B), mas até 862 tok/s agregado em concorrência 256 com gpt-oss-120B MoE[^17][^29] | Hardware próprio, resolve LGPD; mas gpt-oss já reprovado na tarefa | Medido (concorrência) e medido (single-stream) |
| Cluster de 4x DGX Spark | ~US$ 18.796 antes de interconexão[^28] | ~74.600 tok/s agregado em fine-tuning (não inferência direta); 27,2 tok/s single-stream para GLM-5.3[^17][^28] | Resolve LGPD, custo alto | Medido |
| Mac Studio M4 Max/Ultra | Não coletado preço específico nesta rodada | 100+ tok/s em MoE 30B-A3B (M4 Max, 4-bit)[^3] | Resolve LGPD | Medido |
| API com DPA (Gemini/Claude enterprise) | Gemini 3.7/3.8 Flash: US$ 0,75/US$ 3,75 por 1M tokens; Claude Sonnet 5: US$ 2/US$ 10[^30][^31] | Sem limite de hardware, mas dependente de contrato DPA | Requer DPA formal — viável para enterprise tier, mas contraria preferência declarada por hardware próprio | Medido (preços públicos) |

Nota de custo: os preços de API caíram fortemente nos últimos 12-18 meses — Gemini Flash caiu de ~US$ 1,50/US$ 7,50 para US$ 0,75/US$ 3,75 em tiers introdutórios, com reversão programada para janeiro de 2027. Isso significa que a "meta" de R$ 0,02/hora em hardware próprio compete com um piso de API que também está caindo, e a decisão de migrar para hardware próprio deve considerar essa tendência de queda contínua no piso de comparação.[^31]

## Plano de testes para uma semana com 1 Mac mini

1. **Dia 1-2**: baixar Qwen3-30B-A3B em MLX 4-bit e rodar a régua de aprovação da seção 4 do pedido original (5 termos, conserto de "de pirona", confissão de "psiculécia", ausência de invenção, saída JSON válida, 2/2 rodadas a temperatura 0,2). Medir tok/s real e tempo por prontuário simultaneamente.
2. **Dia 2-3**: repetir com Qwen3.6-35B-A3B (sucessor mais recente) se disponível em MLX, comparando fidelidade e velocidade contra o A3B anterior.[^10]
3. **Dia 3-4**: testar MedGemma-27B-text na mesma régua, mesmo sem evidência prévia em pt-BR, para descartar ou confirmar candidatura.[^11][^7]
4. **Dia 4-5**: medir throughput em lote (4, 8, 16 sequências simultâneas) com o melhor candidato aprovado, usando mlx-lm server ou llama.cpp server, para validar a estimativa de prontuários/hora por mini.
5. **Dia 5-6**: testar pipeline de transcrição completo (Whisper Large-v3-Turbo + WhisperX/pyannote com `min_speakers=2, max_speakers=3` fixado) nas gravações reais já usadas, medindo WER e DER especificamente nessas amostras.
6. **Dia 6-7**: testar quantização de KV cache (8-bit) no modelo aprovado para medir ganho de memória sem perda de fidelidade na régua.

Critério de aprovação em cada etapa: mesma régua de 6 pontos da seção 4 do pedido original, aplicada de forma idêntica, com registro de tokens/s e tempo total por prontuário para permitir comparação direta com os números já medidos (Gemini 3.7 Flash sem thinking, Claude Sonnet 5, Qwen3.8-27B local).

## O que não foi encontrado (lacunas para medição própria)

- Nenhuma medição publicada de tokens/s para modelos 27-32B especificamente em Mac mini M4 Pro 32GB (a maioria dos benchmarks localizados usa M4 Max ou M4 Pro com 48-64GB) — a estimativa de throughput no hardware exato do usuário precisará ser medida diretamente.
- Nenhum benchmark publicado de MedGemma, Sabiá, ou qualquer modelo aberto na tarefa exata de "consertar termo médico quebrado por ASR e confessar a correção" — essa é uma medição proprietária que o usuário terá que fazer.
- Nenhuma evidência encontrada de fine-tuning LoRA/QLoRA publicado especificamente para a tarefa "transcrição com erro → prontuário + seção de confissão" em domínio clínico pt-BR; a literatura de destilação de tarefa em domínio clínico geral (ex.: Reason·Med) existe, mas não cobre esse padrão de saída específico.[^11]
- Nenhuma medição direta de particionamento de modelo entre múltiplos Mac minis via rede (Thunderbolt/exo) para a carga de trabalho de geração de texto em lote — apenas dados de DGX Spark multi-nó para fine-tuning, que não é diretamente comparável.[^17][^28]
- Preços de Mac mini M4 Pro 32GB e Mac Studio no Brasil/Paraguai não foram coletados nesta rodada de pesquisa.
- Não foi encontrada nenhuma API de transcrição pt-BR com diarização e DPA por menos de US$ 0,05/hora — os preços localizados (Whisper via API, Gemini áudio) ficam na faixa de US$ 0,055-0,12/hora, já medida pelo próprio usuário.

---

## References

1. [Model Size vs Hardware Bandwidth in Local LLM Inference - LinkedIn](https://www.linkedin.com/posts/khushipatel5499_localllm-inference-aiagents-activity-7492692738522517504-vE8p) - A 30B model on an M4 Pro tops out around 9 tokens per second, and a faster chip does not fix it. Tha...

2. [Qwen 3 30B-A3B on M4 Pro — Speed, Setup & Benchmarks | LLMCheck](https://llmcheck.net/models/qwen-3-30b-a3b-on-m4-pro/) - Qwen 3 30B-A3B runs at 35 tok/s on M4 Pro with 24 GB RAM. Q4_K_M quantization via MLX. Complete setu...

3. [Run Qwen3-VL-30B-A3B-Thinking on macOS (Apple Silicon)](https://codersera.com/blog/run-qwen3-vl-30b-a3b-thinking-on-macos-installation-guide/) - Discover how to install, configure, and optimize Qwen3-VL-30B-A3B-Thinking on macOS. Learn about har...

4. [Qwen3 30B a3b on MacBook Pro M4, Frankly, it's crazy to be able to use models of this quality with such fluidity. The years to come promise to be incredible. 76 Tok/sec. Thank you to the community and to all those who share their discoveries with us!](https://www.reddit.com/r/LocalLLM/comments/1l6lxcr/qwen3_30b_a3b_on_macbook_pro_m4_frankly_its_crazy/) - Qwen3 30B a3b on MacBook Pro M4, Frankly, it's crazy to be able to use models of this quality with s...

5. [Demystifying LLM Inference Optimization on Apple Silicon: Why ...](https://atomgradient.github.io/mlx-inference-bench/paper.pdf)

6. [MedGemma: Open-Weight Multimodal Clinical Foundation Model ...](https://openphr.org/news/medgemma-open-weight-clinical-multimodal-foundation/) - Health system technology executives, clinical informatics leaders, and hospital AI committees are sh...

7. [[PDF] MedGemma Technical Report - Rivista AI](https://www.rivista.ai/wp-content/uploads/2025/09/2507.05201v3.pdf)

8. [Pesquisa](https://www.maritaca.ai/research/) - LLM Bias Bench: Medindo Viés de Opinião e Sycophancy em LLMs. 2026. Benchmark para mensurar viés ide...

9. [Melhores LLMs locais para português do Brasil (2026)](https://www.promptquorum.com/pt/local-llms/best-local-llms-portuguese-language-2026) - Melhores LLMs locais para português do Brasil em 2026: Qwen3 8B via Ollama, Sabiá-3 da Maritaca AI, ...

10. [Andrea Borio's Post](https://www.linkedin.com/posts/borioandrea_localai-ondeviceai-applesilicon-activity-7484868314767376385-W59g) - A model benchmarked close to Claude Sonnet 4.5, running locally on a 16 GB M1 Pro from 2021. Over th...

11. [An Open Clinical Reasoning Model via Continued Pretraining ...](https://chandravikram.com/papers/09-reasonmed)

12. [Technical Report: Performance and baseline evaluations of gpt ...](https://cdn.openai.com/pdf/08b7dee4-8bc6-4955-a219-7793fb69090c/Technical_report__Research_Preview_of_gpt_oss_safeguard.pdf)

13. [gpt-oss-120b & gpt-oss-20b Model Card - cdn.openai.com](https://cdn.openai.com/pdf/419b6906-9da6-406c-a19d-1bb078ac7637/oai_gpt-oss_model_card.pdf)

14. [gpt-oss-120b & gpt-oss-20b Model Card](https://arxiv.org/html/2508.10925v1) - 4.5 Hallucinations. We check for hallucinations in gpt-oss-120b and gpt-oss-20b using the following ...

15. [llama.cpp/tools/server/README.md at master · ggml-org ... - GitHub](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md) - LLM inference in C/C++. Contribute to ggml-org/llama.cpp development by creating an account on GitHu...

16. [Speculative Decoding Guide: EAGLE, Medusa, n-grams (2026)](https://localaimaster.com/blog/speculative-decoding-guide) - This guide covers every modern speculation technique — separate draft models, EAGLE-2 / EAGLE-3, Med...

17. [NVIDIA DGX Spark Review: Price, Specs & Performance (2026)](https://gpusmith.com/articles/en/nvidia-dgx-spark-review-specs-performance) - Independent 2026 review of the NVIDIA DGX Spark: verified pricing history to $4,699, GB10 Grace Blac...

18. [freds0/distil-whisper-large-v3-ptbr](https://huggingface.co/freds0/distil-whisper-large-v3-ptbr) - We’re on a journey to advance and democratize artificial intelligence through open source and open s...

19. [Whisper accuracy in 29 languages | Lesskeys](https://lesskeys.com/whisper-accuracy-29-languages.html) - Word and character error rates for six Whisper models across 29 languages, measured locally on Apple...

20. [tech4humans/Audio-Transcription-Models-Comparison-PT ...](https://huggingface.co/datasets/tech4humans/Audio-Transcription-Models-Comparison-PT-BR/blob/main/README.md) - We’re on a journey to advance and democratize artificial intelligence through open source and open s...

21. [TheWhisper/benchmark/README.md at main](https://github.com/TheStageAI/TheWhisper/blob/main/benchmark/README.md) - Optimized Whisper models for streaming and on-device use - TheStageAI/TheWhisper

22. [WhisperX: 22K+ Stars — Production ASR Setup Guide 2026](https://dibi8.com/resources/ai-tools/whisperx/) - WhisperX is an open-source ASR toolkit with word-level timestamps and speaker diarization. Compatibl...

23. [WhisperX 2026: Word Timestamps + Speaker Diarization ...](https://localaimaster.com/blog/whisperx-guide) - Word-level timestamps and speaker diarization for local speech-to-text.

24. [Whisper speaker diarization 2026: what works, what doesn’t ...](https://lessrec.com/blog/whisper-speaker-diarization.html) - What works in 2026, what still fails, GPU/CPU trade-offs, and per-use-case accuracy.

25. [Best Speaker Diarization Models Compared [2026]](https://brasstranscripts.com/blog/speaker-diarization-models-comparison) - Compare the best speaker diarization models of 2026. Benchmarks for Pyannote 3.1, NVIDIA NeMo, and W...

26. [Best Speaker Diarization Tools 2026 — DER Benchmarks ...](https://vexascribe.com/compare/best-speaker-diarization-tools) - Consumer apps, developer APIs, and open-source diarization compared with DER benchmarks. Fireflies 7...

27. [pyannote.audio — Open-Source Speaker Diarization ...](https://vexascribe.com/pyannote-audio) - How pyannote.audio does speaker diarization. Pipeline walkthrough (segmentation, embedding, clusteri...

28. [Local AI Hardware Guide 2026: What Models Run at Every ...](https://kingy.ai/blog/local-ai-hardware-guide/) - Evidence-led local AI PC picks from $2,400 to $9,449, with exact models, quants, context limits, mea...

29. [NVIDIA DGX Spark Benchmark: 120x Faster Than Single- ...](https://www.linkedin.com/posts/mimcgreal_ai-inference-nvidia-activity-7452699620515930112-qkZg) - The online verdict on the NVIDIA DGX Spark: £4,000 for 2.7 tokens per second. Slower than a gaming G...

30. [AI LLM API Pricing 2026: GPT-6 Astra, Gemini 3.8, Claude ...](https://www.scriptbyai.com/gpt-gemini-claude-pricing/) - Compare current LLM API prices for GPT, Claude, Gemini, Grok, DeepSeek, Qwen, Kimi, GLM and more, wi...

31. [AI API pricing history — GPT, Claude, Gemini, Grok, Llama ...](https://mungomash.com/ai/pricing-history/) - The per-million-token price of every major frontier AI model from GPT-3 to today — current rates, fu...

