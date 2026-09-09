## Resumo executivo

O caminho mais provável para custo marginal próximo de zero combina três elementos que já existem hoje: transcrição no celular via frameworks nativos gratuitos da Apple e Google, redação do prontuário em hardware próprio usando modelos MoE de poucos parâmetros ativos (não o denso 27B já testado), e monetização por publicidade farmacêutica dirigida ao médico durante o uso do app — modelo que OpenEvidence provou em escala real, chegando a US$ 300 milhões de receita anualizada em julho de 2026 com 90% de margem bruta, atendendo mais de 40% dos médicos americanos gratuitamente.[^1]

O Foundation Models Framework da Apple (iOS 26+) oferece um LLM de ~3B parâmetros rodando 100% no dispositivo, gratuito, sem chamada de rede, com geração estruturada via `@Generable` — mas seu contexto é de apenas 4-8K tokens e ele não tem qualquer evidência publicada de desempenho na tarefa de redação clínica com confissão de erro. Isso o torna um candidato interessante para pré-processamento ou rascunho, não para a tarefa completa sozinho.[^2][^3][^4]

A maior descoberta técnica desta rodada é que a arquitetura de servidor MLX mudou significativamente desde a pesquisa anterior: o `mlx-lm.server` agora tem continuous batching nativo, e implementações mais recentes como vllm-mlx alcançam até 4,3x de escala agregada em 16 requisições simultâneas, com Qwen3-30B-A3B (MoE) chegando a 233 tok/s agregados em batch de 5 num M4 Max, contra 98 tok/s em requisição única. Isso muda a conta de prontuários/hora por Mac mini para uma faixa muito mais otimista do que a estimativa da pesquisa anterior.[^5][^6][^7]

No mercado brasileiro, o precedente mais relevante é a Memed: operou de graça por 14 anos, queimando caixa, até encontrar na publicidade farmacêutica dentro do fluxo de prescrição digital o modelo que a levou ao lucro em 2025, com uma base de 150 mil médicos ativos e projeção de R$ 100 milhões em receita para 2026, com ROI de publicidade reportado entre 3x e 4x para os anunciantes. Isso é evidência direta de que o modelo "grátis pago por pharma" funciona no Brasil, especificamente com médicos, especificamente em um fluxo de trabalho clínico digital.[^8][^9]

Do lado regulatório, a LGPD permite tratamento de dados de saúde sem consentimento explícito do paciente quando for para "tutela da saúde, exclusivamente, em procedimento realizado por profissionais de saúde" (art. 11), mas qualquer uso de dados de consulta para publicidade ou treinamento de modelo exige consentimento específico e destacado, e a RDC 96/2008 da ANVISA proíbe publicidade indireta ou dissimulada de medicamento — a linha entre "informação educativa ao médico" e "propaganda disfarçada" é o ponto de maior risco jurídico do modelo de monetização por pharma.[^10][^11][^12]

A ordem de ataque recomendada é: (1) validar a régua de qualidade ampliada em Qwen3-30B-A3B com continuous batching, porque é o maior ganho de custo sem trade-off óbvio de LGPD; (2) prototipar o híbrido celular-servidor usando Apple Speech framework para transcrição e Gemini/Claude para redação, medindo economia real de tokens; (3) desenhar a camada de monetização por publicidade farmacêutica com um advogado especializado em LGPD e ANVISA antes de qualquer lançamento, porque o risco regulatório aqui é maior que o risco técnico.

## Três arquiteturas completas para o grátis em escala

### Arquitetura A — Tudo no celular

Transcrição via SpeechAnalyzer/SpeechTranscriber (iOS 26+) ou equivalente Android, redação via Foundation Models Framework (~3B parâmetros, gratuito, offline). Custo marginal por hora: zero em processamento, mas a bateria consome 22-40%/hora em STT contínuo, tornando 4 horas diárias inviável sem recarga. Custo fixo mensal: apenas manutenção de app, sem servidor de inferência. Qualidade esperada contra a régua: baixa a incerta — não há evidência publicada de que o modelo de 3B da Apple confesse erros de transcrição da forma exigida, e seu contexto de 4-8K tokens pode ser insuficiente para transcrições longas de consulta de 35 minutos. Risco LGPD: mínimo, dado nunca sai do aparelho. Esforço para time pequeno: alto — requer app nativo Swift para acessar o framework, sem equivalente maduro em Android com a mesma profundidade. O que ninguém mediu: desempenho do Foundation Models Framework especificamente na tarefa de confissão de erro em português clínico.[^13][^3][^4][^14][^2]

### Arquitetura B — Híbrido celular + servidor

Transcrição no celular (Speech framework Apple ou AICore/Gemini Nano Android), envio apenas do texto transcrito (~1.500 tokens) para redação em servidor via API ou hardware próprio. Isso elimina o custo de transcrição por áudio, que hoje representa 70% do gasto total medido pelo usuário — reduzindo o custo de API de ~R$ 0,50/hora para uma fração equivalente apenas ao custo de redação (~R$ 0,006-0,04 por prontuário já medido com Gemini/Claude). Custo fixo mensal: baixo, sem necessidade de manter frota de hardware property só para transcrição. Qualidade esperada: alta na etapa de redação (já validada), incerta na etapa de transcrição on-device em pt-BR com ruído — nenhuma fonte testou isso especificamente. Risco LGPD: baixo, pois só texto (não áudio) trafega, e o dado de saúde já foi processado localmente antes de qualquer transmissão. Esforço: médio — requer desenvolvimento nativo apenas para a etapa de STT, mantendo a redação como já está hoje.

### Arquitetura C — Tudo em hardware próprio com API de reserva

Transcrição e redação totalmente nos Mac minis já possuídos, usando modelos MoE de poucos parâmetros ativos com continuous batching, com API entrando apenas quando a fila de espera excede um limiar. A evidência mais recente mostra que Qwen3-30B-A3B com continuous batching em 5 requisições simultâneas atinge 233 tok/s agregados em M4 Max, e implementações como vllm-mlx escalam até 4,3x em 16 requisições concorrentes para modelos até a família 30B. Isso sugere throughput muito mais alto do que os ~130 prontuários/hora estimados na pesquisa anterior, mas ainda precisa ser medido no Mac mini M4 Pro 32GB especificamente (a maioria dos benchmarks usa M4 Max/M5 Max com mais memória e bandwidth). Custo marginal: possivelmente abaixo de R$ 0,02/hora, mas o TCO de operar dezenas de máquinas 24/7 continua sem fonte quantificada. Risco LGPD: mínimo, dado nunca sai da infraestrutura própria. Esforço: alto — requer scheduler de fila e monitoramento de frota sem equipe de ML dedicada.[^6][^5]

## Tabelas

### Transcrição no aparelho e no Mac

| Solução | WER pt-BR | Falantes | Léxico personalizado | Bateria/throughput |
|---|---|---|---|---|
| Apple SpeechAnalyzer/SpeechTranscriber (iOS 26+) | Não publicado especificamente em pt-BR com ruído | Não nativo | Suporte a vocabulário customizado via API, não testado em pt-BR | Não medido; roda no Neural Engine |
| WhisperKit (CoreML) | 2,2% WER em inglês, condições controladas[^15] | Não nativo | Não nativo | 0,3W por inferência; STT contínuo 22-40%/hora[^14] |
| Foundation Models 3B (Apple) | Não é ASR, é LLM de texto | N/A | N/A | Gratuito, offline, 2-bit quantizado, contexto 4-8K tokens[^16][^3] |
| Qwen3-30B-A3B (MoE, Mac local, redação) | N/A (modelo de texto) | N/A | Não testado na régua específica | 98-233 tok/s (1-5 req simultâneas, M4 Max)[^5] |
| Continuous batching MLX (mlx-lm.server / vllm-mlx) | N/A | N/A | N/A | Até 4,3x escala em 16 req concorrentes; ganho maior em modelos pequenos, menor em modelos grandes por saturação de bandwidth[^5][^6] |

### Produtos grátis para médicos e como pagam a conta

| Produto | País | Como monetiza | Receita/ARPU (quando público) | Tempo até monetizar |
|---|---|---|---|---|
| OpenEvidence | EUA | Publicidade farmacêutica, CPM US$ 70-1.000+[^17][^1] | ~US$ 124 ARPU; US$ 300M receita anualizada (jul/2026)[^1] | Rápido — monetização desde early stage |
| Doximity | EUA | 80% publicidade pharma, resto recrutamento[^18][^19] | ~US$ 228 ARPU; US$ 620M TTM receita[^18] | Anos, mas modelo consolidado |
| Memed | Brasil | Publicidade farmacêutica no fluxo de prescrição digital, marketplace/comissão de farmácia[^8][^9] | R$ 100 milhões projetados para 2026; ROI publicitário de 3-4x reportado[^9] | 14 anos até lucro consistente (breakeven em jun/2025)[^9] |
| UpToDate | Global | Licença paga por assento hospitalar (não é grátis) | US$ 595M receita, modelo $500/assento[^17][^1] | N/A — nunca foi grátis |
| Heidi Health | Austrália | Freemium permanente + tiers pagos | Não público nesta pesquisa | Não determinado |
| Nabla | França | Freemium (30 consultas/mês grátis) + assinatura | Não público | Não determinado |

## Mapa regulatório de monetização indireta no Brasil

| Prática | Status | Norma |
|---|---|---|
| Publicidade de medicamento registrado na ANVISA, direcionada a médico, com conteúdo compatível com a bula registrada | Permitido | RDC 96/2008, art. 3º[^10] |
| Publicidade de medicamento não registrado na ANVISA | Proibido | RDC 96/2008[^11] |
| Publicidade enganosa, abusiva ou indireta/dissimulada (ex.: parecer informativo que na prática promove marca) | Proibido | RDC 96/2008, princípio geral[^20] |
| Uso de dados de consulta anonimizados (irreversível, sem possibilidade de reidentificação) para segmentação de anúncio | Permitido, mas com barra técnica alta — anonimização precisa ser irreversível e validada | LGPD art. 12; se puder ser revertido por meios razoáveis, não conta como anonimizado[^21] |
| Uso de dados de consulta pseudonimizados/identificáveis para publicidade sem consentimento específico | Cinza/proibido — dado de saúde é sensível e exige consentimento destacado para finalidade específica | LGPD art. 11[^22][^23] |
| Tratamento de dado de saúde sem consentimento, exclusivamente para tutela da saúde do próprio paciente (ex.: gerar o prontuário) | Permitido | LGPD art. 11, hipótese de dispensa de consentimento[^22][^24] |
| Compartilhamento de dados de saúde com terceiros (ex.: farmacêutica) para fins de pesquisa/publicidade | Exige anonimização sempre que possível e não pode ser usado para finalidade diferente da acordada com o paciente | LGPD art. 13; ANPD orientação de agosto 2026[^25] |

O ponto de maior risco jurídico é usar o conteúdo da própria consulta (mesmo anonimizado) para segmentar publicidade — a ANPD reforça que dados de saúde não podem ser usados para finalidade diferente da acordada com o paciente, e a barra técnica de "anonimização efetiva" (irreversível) é alta. O modelo Memed/OpenEvidence evita esse problema ao monetizar pela **atenção do médico durante o uso do produto** (impressão publicitária no momento de uso), não pelo conteúdo da consulta do paciente — essa distinção é crucial para reproduzir o modelo com segurança jurídica.[^25][^21]

## Plano de experimentos de 4 semanas

**Semana 1**: Instalar mlx-lm.server ou vllm-mlx com continuous batching no Mac mini disponível; rodar Qwen3-30B-A3B na régua de qualidade atual (5 termos, 2 confissões, JSON válido) nas 2 gravações reais já existentes, com 1, 4 e 8 requisições simultâneas, medindo tok/s agregado e por requisição. Critério de aprovação: mesma régua da pesquisa anterior, mais registro de throughput real.

**Semana 2**: No iPhone, testar Apple Speech framework (SpeechAnalyzer) nas mesmas 2 gravações reais, medindo WER manualmente contra o roteiro conhecido; testar Foundation Models Framework enviando a transcrição resultante e pedindo extração estruturada simples (não a régua completa ainda), para avaliar se serve como pré-filtro barato. Critério de aprovação: WER mensurável e resposta estruturada válida do modelo de 3B, mesmo que imperfeita.

**Semana 3**: Montar o híbrido — transcrever no iPhone (Speech framework), enviar só o texto para o Mac mini rodando o modelo aprovado na semana 1, medindo o tempo total ponta a ponta e o consumo de bateria em uma simulação de consulta de 35 minutos. Critério de aprovação: pipeline completo funcionando em menos de 2 minutos após o fim da consulta, com consumo de bateria documentado.

**Semana 4**: Gerar 5-10 consultas sintéticas adicionais (TTS multi-voz com ruído de fundo, se disponível, ou gravações extras com colaboradores simulando consulta) para expandir a régua de 2 para pelo menos 7-10 transcrições, aplicando a metodologia de taxa de erro por 100 palavras como complemento ao checklist binário. Critério de aprovação: taxa de erro consistente e reprodutível no modelo campeão da semana 1, documentada para decisão de arquitetura.

## O que não foi encontrado

- Nenhuma medição publicada do Foundation Models Framework da Apple (3B) em tarefa de redação clínica ou extração fiel com confissão de erro, em nenhum idioma — essa é uma lacuna central que só se resolve testando diretamente.
- Nenhum benchmark de continuous batching MLX especificamente no Mac mini M4 Pro 32GB — a maioria dos números levantados usa M4 Max ou M5 Max/Ultra com mais memória e bandwidth, então a extrapolação para o hardware exato do usuário é uma aposta, não uma medição.
- Nenhuma fonte quantificou o TCO completo (energia, manutenção, falha, redundância) de operar 5, 10 ou 25 Mac minis 24/7 no Brasil — segue sendo a maior lacuna identificada em todas as três rodadas de pesquisa.
- Nenhuma evidência de WER do SpeechAnalyzer/Speech framework da Apple especificamente em português brasileiro com ruído de consultório e múltiplas vozes.
- Nenhum caso publicado de fine-tuning de tarefa (LoRA/QLoRA) levando modelo 3-9B a paridade de fidelidade com modelo 27B+ na tarefa exata de confissão de erro clínico em pt-BR — segue sem resposta após três rodadas de pesquisa.
- Nenhuma jurisprudência ou parecer formal da ANPD tratando especificamente do caso "app de prontuário gratuito monetizado por publicidade farmacêutica" — a análise regulatória desta pesquisa é uma extrapolação de normas gerais de LGPD e ANVISA, não um precedente direto validado por autoridade.

---

## References

1. [OpenEvidence revenue, valuation & funding - Sacra](https://sacra.com/c/openevidence/) - AI copilot for doctors to assist in making critical decisions at the point of care

2. [Apple Intelligence Foundation Language Models Tech ...](https://machinelearning.apple.com/research/apple-foundation-models-tech-report-2025) - We introduce two multilingual, multimodal foundation language models that power Apple Intelligence f...

3. [Apple Foundation Models: The On-Device LLM Framework, Explained](https://blakecrosley.com/blog/apple-foundation-models-framework) - Apple's Foundation Models framework: LanguageModelSession, @Generable guided generation, tool callin...

4. [WWDC 2026 - Apple Just Opened the Foundation Models ...](https://dev.to/arshtechpro/wwdc-2026-apple-just-opened-the-foundation-models-framework-to-any-llm-provider-5ejn) - Until WWDC 2026, the Foundation Models framework had one rule: Apple's on-device model or nothing......

5. [vllm-mlx/docs/guides/continuous-batching.md at main](https://github.com/waybarrios/vllm-mlx/blob/main/docs/guides/continuous-batching.md) - Continuous batching enables higher throughput when serving multiple concurrent users. ... Batching 5...

6. [Native LLM and MLLM Inference at Scale on Apple Silicon](https://arxiv.org/html/2601.19139v2) - ... continuous batching scheduler maximizes GPU utilization by processing multiple sequences simulta...

7. [The latest mlx-lm is out and it has continuous batching with ...](https://x.com/awnihannun/status/1996365940343402596) - Well, enjoy the first version in the latest MLX-LM release. The following video is serving 4 consecu...

8. [Memed começa a monetizar prescrição digital após criar base de 210 mil médicos](https://pipelinevalor.globo.com/startups/noticia/memed-comeca-a-monetizar-prescricao-digital-apos-criar-base-de-210-mil-medicos.ghtml) - Healthtech fornecia serviço totalmente gratuito e projeta receita de R$ 12 milhões em um ano com nov...

9. [A Memed queimou caixa por 14 anos. Agora tem lucro e ...](https://www.bloomberglinea.com.br/startups/a-memed-queimou-caixa-por-14-anos-agora-tem-lucro-e-mira-r-100-milhoes-em-receita/) - A plataforma de prescrição de receitas digitais encontrou na publicidade médica um modelo de negócio...

10. [resolução-rdc nº 96, de 17 de dezembro de 2008 - Minist  rio da Sa  de](https://bvsms.saude.gov.br/bvs/saudelegis/anvisa/2008/rdc0096_17_12_2008.html)

11. [[PDF] RDC 96 - Perguntas e Respostas - Portal Gov.br](http://www.gov.br/anvisa/pt-br/assuntos/fiscalizacao-e-monitoramento/propaganda/legislacao/arquivos/8815json-file-1/@@display-file/file)

12. [LGPD na área da saúde](https://docs.bvsalud.org/biblioref/2021/05/1224079/femina-2021-493-p156-160-perguntas-e-respostas-sobre-a-lgpd-na_mQFOlCL.pdf)

13. [SpeechAnalyzer | Apple Developer Documentation](https://developer.apple.com/documentation/speech/speechanalyzer) - Overview. The Speech framework provides several modules that can be added to an analyzer to provide ...

14. [Crie um assistente de voz local no seu telefone: Whisper + LLM local (sem nuvem) — 2026](https://www.promptquorum.com/pt/power-local-llm/voice-assistant-local-mobile-offline) - IA de voz totalmente offline no iPhone e Android em 2026: Whisper STT + LLM local + Piper TTS. Confi...

15. [WhisperKit: On-device Real-time ASR with Billion-Scale ...](https://arxiv.org/html/2507.10860v1) - WhisperKit is an optimized on-device inference system designed to deploy Whisper models for real-tim...

16. [FoundationModels.md](https://gist.github.com/koher/214301df47eeeb5c426cbcfd72700a8e) - GitHub Gist: instantly share code, notes, and snippets.

17. [OpenEvidence at $50M/year growing 30% MoM - Sacra](https://sacra.com/research/openevidence-at-50m-year-growing-30-mom/) - TL;DR: With doctors overwhelmed by the medical literature—which doubles in size every 5 years—OpenEv...

18. [OpenEvidence vs Doximity - Sacra](https://sacra.com/research/openevidence-vs-doximity/) - TL;DR: With the launch of AI scribe Visits (August) and HIPAA-secure Dialer (December), OpenEvidence...

19. [OpenEvidence vs UpToDate vs DoxGPT: The Clinical AI ...](https://www.iatrox.com/blog/openevidence-vs-uptodate-vs-doxgpt-clinical-ai-war-2026) - OpenEvidence: The Pharma Advertising Model. Free. Revenue from pharmaceutical advertising during loa...

20. [regulação da propaganda de medicamentos](https://www.scielo.br/j/physis/a/CKKHWMHvmr6V3yDr4xzYbDp/?lang=pt&format=pdf) - de RCB Lucena · 2012 · Citado por 10 — Resumo: este estudo teve como objetivo analisar o processo de...

21. [DADOS DE SAÚDE](https://baptistaluz.com.br/wp-content/uploads/2024/05/BLuz_PD_20240508_Guia-da-Saude_v02.pdf)

22. [LEI GERAL DE PROTEÇÃO DE DADOS](http://www.anahp.com.br/wp-content/uploads/2022/12/Cartilha-LGPD-Anahp.pdf)

23. [[PDF] governança e boas práticas na lgpd à luz das normas da anpd ...](https://revista.tjpr.jus.br/gralhaazul/article/download/285/221/781)

24. [protecao-de-dados-pessoais-no-setor-de-saude.pdf](https://www.bibliotecadeseguranca.com.br/wp-content/uploads/2021/07/protecao-de-dados-pessoais-no-setor-de-saude.pdf)

25. [Lei diz que dado de saúde de paciente, como diagnósticos e ...](https://oglobo.globo.com/economia/tecnologia/noticia/2026/08/31/lei-diz-que-dado-de-saude-de-paciente-como-diagnosticos-e-exames-e-sensivel.ghtml) - Informações médicas em pesquisas não podem ser compartilhadas com terceiros ou usadas para outros fi...

