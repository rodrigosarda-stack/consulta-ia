# Pedido de pesquisa profunda — como oferecer prontuário por IA de graça, em escala, sem perder qualidade

> Cole o texto abaixo, inteiro, numa ferramenta de pesquisa profunda. Escrito em 08/09/2026.
> Terceiro pedido. O primeiro otimizava uma solução escolhida; o segundo questionou premissas e concluiu "aumente o preço", o que serve para SaaS e não para nós. Este fixa o modelo de negócio e pergunta como chegar lá.

---

Quero uma pesquisa exaustiva, com fontes datadas e números, para um objetivo que **não está em discussão**: oferecer a médicos brasileiros um prontuário escrito por IA a partir da gravação da consulta, **de graça e sem limite de uso**, e monetizar por outras vias. Não me proponha cobrar assinatura. Não me diga que o preço é o problema. A pergunta é: **como levar o custo marginal por consulta a praticamente zero mantendo qualidade clínica, e como quem já fez produto grátis para médicos pagou a conta.**

## 1. O produto e o que já funciona

- Médico grava a consulta pelo celular (app web, iPhone e Android). Áudio sobe em pedaços de ~30 s, com fila offline.
- Transcrição por LLM ouvindo o áudio (Gemini 3.7 Flash), com falantes MÉDICO/PACIENTE. Medido em gravações reais: ~92 % de acerto de palavra, 8/8 termos médicos, falantes corretos.
- Prontuário escrito por LLM com uma seção obrigatória "O QUE EU INTERPRETEI", onde o modelo confessa cada trecho quebrado que consertou ("de pirona" → dipirona) ou não entendeu ("psiculécia").
- Régua de qualidade atual (a ser ampliada): 5 termos certos, 2 confissões, nada inventado, JSON válido, 2 de 2 rodadas. Passaram: Gemini 3.7 Flash sem thinking (US$ 0,006/prontuário), Claude Sonnet 5 (US$ 0,04), **Qwen3.8-27B 4-bit rodando localmente num Mac** (grátis, ~200 s, 7,5–8 tokens/s). Reprovaram: gpt-oss 120b/20b, Haiku 4.5, Gemini lites, Qwen 9B, um Qwen "destilado".
- Custo hoje, tudo em API: **~R$ 0,50 por hora gravada** (≈ US$ 0,09). Transcrição é 70 % disso.

## 2. A escala e a conta que precisa fechar

- Alvo: **1.000 médicos em 12 meses, 10.000 depois**, ~4 horas gravadas por dia cada, consulta média de 35 min.
- 1.000 médicos = 4.000 horas/dia. Na API de hoje: ~R$ 60 mil/mês. **Isso mata o grátis.**
- Meta: custo marginal **≤ R$ 0,02 por hora gravada** (≈ US$ 0,004), ou zero, com custo fixo mensal que caiba em poucos milhares de reais por 1.000 médicos.
- Restrições: LGPD (dado de saúde: sem fornecedor sem contrato de tratamento e sem cláusula de não-treinamento; marketplaces de GPU e APIs sem contrato estão fora); português do Brasil com ruído e 2–3 vozes; time pequeno sem equipe de ML.
- Ativos: **dezenas de Mac mini M4 Pro 32 GB parados**; um MacBook M4 Pro; posso comprar servidor GPU se a conta provar.

## 3. O que a pesquisa anterior já achou (parta daqui, não repita)

- Em Apple Silicon a geração é limitada por leitura de memória. Modelos **MoE de poucos parâmetros ativos** (Qwen3-30B-A3B e sucessores) rodam 35–75+ tokens/s no M4 Pro contra 7,5 do denso 27B. Qualidade na nossa régua ainda não medida.
- Prompt-lookup / n-gram speculative decoding **não rende** em Apple Silicon (0,85–1,0×). Draft model dedicado rende 1,8–2,3× em GPU; suporte MLX limitado.
- WhisperKit no iPhone: 2,2 % WER em inglês, 0,3 W por inferência; STT contínuo gasta 22–40 % de bateria/hora; híbrido (só STT local) 10–15 %/h. **Nada medido em pt-BR com ruído.**
- Nenhum LLM de celular com evidência de escrever o prontuário na nossa régua.
- Scribes comerciais têm ~26 % de taxa de erro média em notas (estudo com 5 plataformas); nossa régua de 1 transcrição é estreita e precisa virar 10–20 gravações reais com taxa de erro por 100 palavras.
- Mercado: Noa Notes (Doctoralia/Feegow) resume direto sem expor transcrição; Doximity Scribe é **grátis** para 100 mil médicos; Heidi tem grátis permanente; Nabla grátis até 30 consultas/mês; Abridge liga cada frase ao trecho de áudio.

## 4. O que quero que você pesquise

### A. O caminho do celular (custo zero por consulta, dado nunca sai do aparelho)
- Estado real, em 2026, da transcrição **no próprio aparelho** em **português do Brasil**: Apple SpeechAnalyzer / Speech framework (iOS 26+), WhisperKit e modelos Whisper pt-BR em CoreML, Android AICore / Gemini Nano áudio, Qwen3-ASR pequeno, Moonshine, Kyutai, Parakeet mobile. Para cada: WER em pt-BR (qualquer fonte), suporte a vocabulário personalizado (nomes de remédios), separação de falantes no aparelho, latência, **bateria medida por hora**, e se funciona em segundo plano por 1 hora sem o iOS matar o app.
- **LLM no aparelho**: Apple Foundation Models framework (iOS 26, modelo ~3B no aparelho, geração guiada por schema, sem custo), Gemma 3n, Phi-4-mini, Qwen3 4B em MLX-Swift/llama.cpp iOS. Alguém mediu qualidade em redação clínica ou extração fiel? Chance de passar na nossa régua. Se não passa sozinho, serve como **primeiro rascunho** que o servidor só revisa (barato)?
- **Web vs. nativo**: dá para fazer isso num app web (WebGPU/WASM: whisper.cpp wasm, transformers.js, WebLLM) no Safari do iPhone e no Chrome Android, com qualidade e bateria aceitáveis? Ou é obrigatório app nativo? Custo e prazo de um app nativo mínimo para um time pequeno (Capacitor/Expo com módulo nativo vs. Swift puro).
- **Híbrido**: transcreve no celular, redige no servidor. Reduz o custo de servidor em quanto (só texto, ~1.500 tokens de entrada por consulta)? Estimativa concreta de custo/hora nesse arranjo com API e com hardware próprio.
- Bateria: soluções práticas usadas por apps de gravação longa (gravar só quando há voz, processar em lotes quando conectado ao carregador, Apple Watch/AirPods como microfone, iPad do consultório na tomada).

### B. Hardware próprio como espinha dorsal do grátis
- Throughput **medido** de modelos MoE de poucos ativos (Qwen3-30B-A3B, Qwen3.6-35B-A3B, GPT-OSS-20B como referência, Mixtral/Granite MoE, Llama 4 Scout) em Mac mini/Studio M4 Pro/Max com **4, 8, 16 sequências simultâneas**; qual servidor faz continuous batching hoje em Mac (mlx-lm server, vllm-mlx, llama.cpp server, LM Studio, Ollama) e com que ganho real.
- Transcrição local **com falantes** no Mac: whisper.cpp / MLX Whisper / WhisperKit macOS em lote (quantas horas de áudio por hora de máquina), Qwen3-ASR, Voxtral Small, Gemma áudio, Canary/Parakeet multilíngue; diarização (pyannote, NeMo, sortformer) com custo computacional. WER pt-BR de cada.
- **Conta completa** de operar 5, 10 e 25 Mac minis 24/7: energia (watts sob carga × tarifa brasileira), link, monitoramento, taxa de falha, redundância, quem cuida. Compare com **um** servidor GPU usado (2× RTX 4090 / RTX 6000 / DGX Spark) e com GPU dedicada alugada com contrato de dados. Diga em que ponto cada opção vence.
- Fila + reserva: arquitetura onde os minis processam o normal e a API entra só no pico; quanto do volume cairia na API num dia típico e quanto custaria.

### C. Modelos pequenos treinados para a tarefa (o custo cai com o tamanho)
- Evidência de fine-tuning de tarefa (LoRA/QLoRA/DPO) levando um modelo 3–9B a fidelidade e "confissão de incerteza" comparáveis a um 27B+, em domínio clínico ou em extração fiel. Como construir o dataset com poucas gravações reais (síntese de consultas em pt-BR com TTS multi-voz + ruído, rotulagem pelo Gemini/Sonnet, revisão médica), quanto custa, quanto tempo, e o risco do que já vi: destilado herda estilo, não cuidado. Como medir isso.
- Datasets públicos de diálogo clínico ou consulta em português (qualquer origem) que sirvam para ampliar a régua sem depender só de gravações minhas.

### D. Quem já fez grátis para médicos e como pagou a conta
- **Brasil**: Memed (receita digital grátis, pharma), PEBMED/Whitebook, Medscape/Univadis, Afya, Doctoralia grátis, iClinic grátis, Prescreva, Nilo, Conexa. **Fora**: Doximity (grátis, receita de pharma e recrutamento), Epocrates, UpToDate modelo institucional, Heidi grátis, OpenEvidence (grátis, pharma). Para cada: como monetiza, receita por médico ativo por ano (quando público), quanto tempo até monetizar, o que deu errado.
- **Regras do jogo no Brasil**: o que o CFM, a ANVISA (RDC 96/2008 e sucessoras), o CONAR e a LGPD permitem em publicidade de medicamento dirigida a médico dentro de um app, uso de dados anonimizados/agregados de consultas (anonimização segundo a ANPD), e o que exige consentimento do paciente. Onde o modelo "grátis pago por pharma/dados" já foi contestado.
- Programas que reduzem custo a zero no começo: créditos de nuvem para startups de saúde (Google, AWS, Azure, NVIDIA Inception, Microsoft for Startups), preços com desconto para uso em lote (batch API 50 %), cache de prompt, e se algum tem contrato de dados compatível com LGPD.

### E. Ampliar a régua barato
- Metodologia para avaliar fidelidade de prontuário com 10–20 gravações: PDQI-9 adaptado, taxa de erro por 100 palavras, "hallucination rate", concordância entre 2 médicos revisores. Ferramentas abertas (ACI-Bench, MedHELM, scripts) que eu possa adaptar para pt-BR. Quanto custa gerar 20 consultas sintéticas realistas em pt-BR (TTS multi-voz, ruído de consultório) e se a literatura aceita isso como proxy.

## 5. O que quero de volta

1. **Resumo executivo** (20 linhas): o caminho mais provável para custo marginal ~zero com qualidade, e a ordem de ataque.
2. **Três arquiteturas completas** para o grátis em escala — (a) tudo no celular, (b) híbrido celular + servidor, (c) tudo em hardware próprio com API de reserva — cada uma com: custo marginal por hora, custo fixo mensal para 1.000 e 10.000 médicos, qualidade esperada contra a régua, risco LGPD, bateria, esforço para time pequeno, e o que ainda ninguém mediu.
3. **Tabelas**: modelos de transcrição no aparelho e no Mac (WER pt-BR, falantes, léxico, bateria/throughput); modelos de redação (tamanho, ativos, tokens/s medido, evidência de fidelidade); hardware (opção, custo total mensal, prontuários/hora); produtos grátis para médicos (país, como paga a conta, receita por médico, tempo até monetizar).
4. **Mapa regulatório** de monetização indireta no Brasil: permitido / cinza / proibido, com a norma.
5. **Plano de experimentos de 4 semanas**, semana a semana, que eu consiga rodar com 1 Mac mini, 1 MacBook, 1 iPhone e 2 gravações reais (mais as sintéticas que você propuser), com critério de aprovação de cada semana.
6. **O que você não achou** e eu terei que medir.

Regras: cite fonte e data para cada número; separe **medido**, **estimado** e **opinião**; priorize 2026 e final de 2025; quando fontes discordarem, mostre as duas; não invente benchmark, produto nem norma. Escreva em português do Brasil.
