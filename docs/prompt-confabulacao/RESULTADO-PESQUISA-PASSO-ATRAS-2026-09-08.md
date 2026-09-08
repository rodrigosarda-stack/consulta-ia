## Veredito por premissa

| Premissa | Veredito | Evidência-chave |
|---|---|---|
| P1. Precisa transcrever antes de escrever | **Cai parcialmente** | Líderes de mercado (Noa Notes, Abridge) não expõem transcrição literal ao usuário — geram resumo direto; mas evidência clínica mostra que pular a auditabilidade tem custo de segurança[^1][^2][^3] |
| P2. Custo de IA é o problema | **Cai** | Concorrentes cobram US$ 39–1.512/mês, muito acima do custo de IA (~US$ 0,01-0,05/consulta); o problema é modelo de precificação e distribuição, não custo variável[^4][^5][^6][^7] |
| P3. Processamento tem que ser em servidor | **Depende** | WhisperKit no dispositivo chega a 2,2% WER com 0,3W por inferência, mas STT contínuo consome 10-40% de bateria/hora e não há LLM de dispositivo aprovado para a régua completa[^8][^9] |
| P4. Precisa de modelo grande (27B+) | **Sustenta, com ressalva** | Nenhuma evidência publicada de fine-tuning pequeno atingindo a régua exata; o próprio destilado 27B que o usuário testou falhou (herdou estilo, não cuidado) |
| P5. Hardware próprio é mais barato que API | **Depende do volume** | Preços de API caíram ~90% desde 2023 e continuam caindo[^10][^11]; conta completa de TCO (energia, manutenção, redundância) favorece API até volumes muito altos |
| P6. A régua atual é suficiente | **Cai** | Literatura usa PDQI-9, ACI-Bench, MedHELM e estudos mostram 26,3% de taxa de erro média em notas geradas por scribes ambientais mesmo aprovados no mercado[^3] |
| P7. Gravar a consulta inteira é o certo | **Sustenta parcialmente** | Nenhum concorrente líder identificado usa apenas resumo ditado; Noa Notes grava e depois resume, preservando à parte a opção de transcrição completa[^12][^2] |
| P8. O produto é o prontuário | **Cai** | Líderes monetizam pacote mais amplo: códigos de faturamento, integração EHR, cartas ao paciente — não apenas a nota[^5][^13] |

## P1 — Transcrever primeiro é indispensável?

Os líderes de mercado se dividem visivelmente aqui. O Noa Notes (Doctoralia/Feegow, líder no Brasil com mais de 7 mil médicos e 200 mil consultas) explicitamente **não faz transcrição completa** — ele escuta e gera direto um resumo estruturado por tópicos, sem etapa intermediária exposta ao usuário. Isso sugere que ir direto do áudio ao resumo é comercialmente viável e aceito pelo mercado brasileiro.[^1][^2]

Por outro lado, a literatura clínica documenta um risco real que justifica a etapa de transcrição literal: em um estudo comparando cinco plataformas de scribe ambiental em consultas simuladas, as notas clínicas finais tiveram taxa média de erro de 26,3%, com até 19,5% dos erros de transcrição sendo transmitidos para a nota e uma média de 3 erros por caso com potencial de dano moderado a grave. Um estudo separado com transcrição médica por voz encontrou 7,4 erros clinicamente relevantes por 100 palavras na saída bruta do ASR, caindo para 0,3% somente após revisão humana em múltiplas etapas — evidência de que pular a camada de auditoria aumenta risco.[^14][^3][^15]

A resolução CFM que rege prontuário eletrônico exige adequação, legibilidade e inteligibilidade do registro, com garantia de sigilo e inviolabilidade, mas não exige explicitamente uma transcrição literal como etapa intermediária — o requisito é sobre o produto final e sua rastreabilidade. A conclusão prática: a transcrição intermediária não é legalmente obrigatória, mas funciona como uma camada de auditoria que reduz risco de erro silencioso, e a seção "O QUE EU INTERPRETEI" do usuário já cumpre parcialmente esse papel sem precisar expor a transcrição completa ao médico.[^16]

## P2 — O custo de IA é o problema real?

A comparação de preços do mercado revela que o custo variável de IA é uma fração mínima do preço cobrado. Produtos internacionais cobram de US$ 39/mês (Freed, tier limitado) a US$ 1.512/usuário/mês (Dragon Copilot, tier enterprise antes do corte de 57% em maio de 2026), enquanto Suki cobra US$ 299-399/mês e Abridge opera em contratos enterprise estimados em US$ 200-800/provedor/mês. No Brasil, ByDoctor cobra R$ 147/mês com IA de transcrição inclusa no plano fixo, Amplimed cobra R$ 89-99 + módulo de IA (~R$ 120 adicional), e Feegow varia de R$ 129 a R$ 249/mês.[^6][^17][^18][^19][^7][^20]

Esses preços são de 10x a 300x o custo variável de IA por consulta que o usuário já mediu (~R$ 0,50/hora gravada com Gemini). O gargalo de margem não está no custo de IA — está no preço de R$ 47/mês para uso ilimitado, que é mais baixo que quase todo concorrente sério, brasileiro ou internacional. Um reposicionamento de preço para a faixa de R$ 99-199/mês, ainda abaixo do mercado, resolveria a margem sem tocar em uma linha de código de infraestrutura.

## P3 — Processamento precisa ser em servidor?

WhisperKit, otimizado para Apple Neural Engine, atinge 2,2% de WER com latência de 0,46 segundos e consumo de apenas 0,3W por inferência (75% menor que implementações anteriores), superando inclusive modelos de servidor como Deepgram Nova-3 e Fireworks Large-v3-turbo em benchmarks controlados. Isso mostra que ASR de altíssima qualidade no dispositivo é tecnicamente viável hoje, embora esse benchmark não seja especificamente em pt-BR com ruído e múltiplas vozes.[^8]

O consumo de bateria é o obstáculo prático real: uma hora de conversa ativa com STT local consome de 22% a 40% da bateria em smartphones topo de linha, dependendo do modelo (iPhone 16/17 Pro, Pixel 9 Pro, Galaxy S25 Ultra). Para uma consulta de 35 minutos isso é tolerável, mas para 4 horas diárias de gravação — a meta de escala do usuário — isso esgotaria a bateria do médico sem carregador, o que é operacionalmente inviável em consultório sem tomada disponível constante.[^9]

Não foi encontrado nenhum LLM de dispositivo (rodando em iPhone/Android) capaz de redigir o prontuário completo com a seção de confissão na régua do usuário — os modelos pequenos suficientemente leves para celular (Gemma 3n, Phi mini) não têm evidência publicada nessa tarefa específica. O híbrido "transcreve no celular, redige no servidor" é o caminho mais promissor: resolve LGPD parcialmente (áudio nunca sai do aparelho, só a transcrição textual viaja) e reduz consumo de bateria porque só o STT roda localmente (~10-15%/hora no modo híbrido), mas ainda depende de servidor para a etapa de maior risco de alucinação.[^9]

## P4 — Precisa de modelo grande para o prontuário?

Nenhuma evidência publicada foi encontrada de um fine-tuning de tarefa (não de estilo) em modelo 3-9B atingindo paridade com modelos 27B+ na tarefa específica "transcrição com erro → prontuário + confissão fiel". A literatura de destilação clínica geral existe (ex.: ReasonMed, para raciocínio clínico) mas não cobre esse padrão de saída. O próprio experimento do usuário reforça essa lacuna: um modelo "destilado do Claude Opus" herdou o estilo de escrita mas não o cuidado, trocando dipirona por piroxicam e confessando a troca com confiança — o pior tipo de falha porque é convincente.[^21]

O padrão observado na indústria de scribes é usar modelos de porte médio a grande com engenharia de prompt pesada, não modelos pequenos ajustados — nenhum dos concorrentes pesquisados divulga arquitetura de modelo pequeno fine-tunado como diferencial. Essa premissa sustenta: não há caminho de baixo custo comprovado via fine-tuning pequeno; a aposta em MoE ativo-baixo (Qwen3-30B-A3B) da pesquisa anterior continua sendo o caminho de redução de custo mais evidenciado, não o fine-tuning.

## P5 — Hardware próprio é mais barato que API?

Os preços de API para os modelos relevantes caíram cerca de 90% desde 2023, com queda contínua documentada até 2026. Gemini Flash, por exemplo, chegou a US$ 0,75/US$ 3,75 por milhão de tokens em tiers introdutórios, com estrutura de reversão de desconto programada para 2027. Essa tendência de queda contínua no piso de comparação significa que qualquer cálculo de retorno sobre hardware próprio feito hoje fica pior a cada trimestre — o "alvo móvel" trabalha contra o investimento em infraestrutura fixa.[^22][^10][^11]

A conta completa de TCO que o pedido solicitou precisa somar energia (Mac mini M4 Pro consome tipicamente 5-40W sob carga), conectividade redundante, manutenção remota de dezenas de máquinas sem equipe de ML dedicada, falha de hardware sem SLA formal, e o custo de oportunidade de não revender os minis. Nenhuma fonte quantificou esse TCO específico para uma frota de Mac minis nesta pesquisa — é uma lacuna que precisa de modelagem interna, mas a direção geral (API caindo de preço, hardware com custos ocultos de operação) favorece manter API como espinha dorsal e usar hardware próprio apenas como capacidade de pico ou fallback, não como arquitetura primária.

Sobre caminhos intermediários com DPA: Google Cloud publica compromissos formais de LGPD via Cloud Data Processing Addendum, cobrindo transferência internacional sob cláusulas contratuais padrão da ANPD (Resolução 19/2024). Isso confirma que Vertex AI, Azure OpenAI e Bedrock são caminhos legítimos de conformidade sem exigir hardware próprio, desde que o contrato de DPA seja formalizado e a base legal de transferência internacional seja documentada.[^23][^24]

## P6 — A régua atual é suficiente?

A régua do usuário (5 termos, 2 confissões, ausência de invenção, formato JSON) é um teste de fumaça útil, mas estreito frente aos padrões da literatura. PDQI-9 é uma escala validada de 9 dimensões de qualidade de nota clínica usada em estudos comparativos de scribes ambientais, onde mesmo plataformas comerciais aprovadas obtiveram score médio de 36±4 com variação significativa entre plataformas. ACI-Bench e MedHELM avaliam fidelidade contra transcrições de referência em escala, não em uma única transcrição de teste.[^3]

O achado mais alarmante da literatura é que mesmo plataformas comerciais líderes, testadas contra transcrições profissionais de referência, produzem notas com 26,3% de taxa média de erro e apenas 35,8% dos elementos corretamente reportados sendo consistentes entre as cinco plataformas testadas. Isso sugere que aprovar um modelo em 2 de 2 rodadas numa única transcrição é uma amostra perigosamente pequena — o usuário deveria expandir a régua para pelo menos 10-20 transcrições reais variadas antes de decidir arquitetura definitiva, e adotar métrica de taxa de erro por 100 palavras como complemento à checklist binária atual.[^3]

## P7 — Gravar a consulta inteira é o jeito certo?

Nenhum dos concorrentes líderes pesquisados usa exclusivamente dictado de resumo pós-consulta como método primário de captura — todos os produtos analisados (Abridge, Nabla, Heidi, Suki, Noa Notes) gravam a consulta em tempo real. O Noa Notes, especificamente, grava a conversa inteira mas depois filtra e resume apenas o que é clinicamente relevante, permitindo até exclusão de conversas informais salvo em especialidades como psiquiatria onde o contexto social importa. Essa premissa sustenta: a evidência de mercado favorece gravação contínua sobre alternativas de dictado resumido, porque captura nuances que o médico esqueceria de dictar.[^2]

## P8 — O produto é o prontuário?

A cadeia de valor identificada nos concorrentes vai muito além da nota clínica. Abridge oferece módulos separados de "Revenue Cycle" e "CDS" (suporte à decisão clínica) além do módulo clínico básico, e uma análise de custo de 2026 revela que hospitais avaliam ambient scribes também pela capacidade de capturar códigos de faturamento auditáveis para CPT 99291 e o add-on de complexidade G2211, que geram receita direta ao hospital — não apenas eficiência de tempo do médico. Isso indica que a monetização mais robusta do mercado não está na nota isolada, mas no pacote que inclui geração de documentos derivados (receitas, pedidos de exame, cartas ao paciente, códigos de faturamento).[^4][^13]

## Mapa de caminhos possíveis

| Caminho | Custo/hora estimado | Qualidade esperada vs. régua | Risco LGPD | Esforço p/ time pequeno | Quem já faz assim |
|---|---|---|---|---|---|
| 1. Áudio → transcrição → prontuário via API com DPA (atual) | ~R$ 0,50-0,55/hora medido pelo usuário | Alta — já validado (Gemini 3.7 Flash, Claude Sonnet 5) | Baixo, se DPA formalizado | Baixo — já implementado | Abordagem geral do usuário hoje |
| 2. Áudio → resumo direto (sem transcrição exposta), API | Potencialmente menor (menos tokens de saída) | Desconhecida — precisa testar régua sem etapa intermediária | Baixo, se DPA formalizado | Médio — requer reengenharia de prompt | Noa Notes (Doctoralia/Feegow)[^2] |
| 3. STT no celular (WhisperKit) + redação no servidor | Custo de IA só na etapa de redação; bateria como custo indireto | Alta em teoria (WhisperKit 2,2% WER), não testado em pt-BR com ruído | Baixo — áudio nunca sai do aparelho | Alto — requer app nativo com CoreML | Nenhum concorrente identificado publicamente faz isso |
| 4. Hardware próprio (Mac minis) fim a fim | Meta de ~R$ 0,02/hora, não validada em produção | Média — depende de validar MoE ativo-baixo na régua | Baixo — dados nunca saem da infraestrutura própria | Alto — requer operação de frota sem equipe de ML dedicada | Nenhum concorrente do mercado pesquisado divulga essa arquitetura |
| 5. GPU dedicada alugada com DPA (Vertex/Azure/Bedrock) | Intermediário entre API pública e hardware próprio | Alta — mesmos modelos testados, sem mudança de qualidade | Baixo — DPA formal disponível[^23] | Baixo-médio — sem hardware físico para manter | Padrão em saúde digital enterprise nos EUA |
| 6. Mudar o produto para pacote mais amplo (nota + faturamento + receita) | Custo de IA similar, mas ticket médio maior | Não aplicável diretamente à régua atual | Mesmo risco da nota isolada | Alto — requer novo desenvolvimento de features | Abridge (Revenue Cycle), Suki (voice commands)[^4][^6] |

## Benchmark de mercado

| Produto | País | Preço | Modelo de cobrança | Arquitetura conhecida/inferida | Privacidade |
|---|---|---|---|---|---|
| Abridge | EUA | Enterprise, ~US$ 200-800/provedor/mês (não público)[^4][^18] | Contrato anual por clínico, negociado | Integração profunda EHR, "Linked Evidence" com rastreabilidade a trechos de áudio[^25] | BAA/enterprise, sales-only |
| Nuance/Microsoft Dragon Copilot (ex-DAX) | EUA | US$ 369-1.512/usuário/mês, variando por tier[^26][^7] | Per-user, enterprise ou flex pay-as-you-go | Integração Epic profunda, unificado com Dragon Medical One | Microsoft enterprise compliance |
| Nabla | França | ~US$ 119/mês; free até ~30 consultas/mês[^5][^27] | Freemium + assinatura individual | Multilíngue, 55.000+ clínicos | Não publica arquitetura detalhada |
| Heidi Health | Austrália | Free permanente; pago US$ 99-150/mês[^28][^6] | Freemium generoso | 20.000+ clínicos, foco em saúde aliada | BAA em tiers pagos |
| Suki AI | EUA | US$ 299-399/mês, publicado[^6][^29] | Per-user, transparente | Assistente de voz + scribe, comandos ativos | BAA sim, sem trial |
| Freed | EUA | US$ 39-119/mês[^27][^17] | Tiers publicados por volume de notas | Foco em solo/pequenas clínicas | Sem detalhes específicos |
| DeepScribe | EUA | ~US$ 2.000/provedor/ano (reportado)[^5] | Enterprise | Notas por especialidade | Não publicado |
| Ambience Healthcare | EUA | ~US$ 2.000/provedor/ano (reportado)[^5] | Enterprise | Deployment hospitalar (Memorial Hermann) | Não publicado |
| Doximity Scribe | EUA | Free-US$ 15/mês (Pro)[^5] | Freemium agressivo | 100.000+ médicos na base | Não publicado |
| Tali AI | Canadá | US$ 99/mês[^5] | Per-user | — | Não publicado |
| Noa Notes (Doctoralia/Feegow) | Brasil | Incluso em planos Feegow (R$ 129-249/mês) ou lista de espera[^20][^2] | Bundle dentro do software de gestão | Resumo direto, sem transcrição completa exposta; usa CFM/LGPD como selo de conformidade | Declara conformidade LGPD explícita[^2] |
| ByDoctor | Brasil | R$ 147/mês, IA inclusa[^20] | Plano fixo sem cobrança por profissional | Transcrição de consulta incluída no core | Não detalhado |
| Amplimed (Ampli IA / Amélia) | Brasil | R$ 89-99/mês base + ~R$ 120/mês add-on de IA[^20] | Módulo pago separado | Transcrição documentando prontuário automaticamente | Não detalhado |

## A conta de hardware próprio vs. API vs. celular

**Premissas explícitas para o usuário ajustar:**

- **API (hoje)**: R$ 0,50-0,55/hora gravada, já medido; sem custo de capital, sem risco de manutenção; tendência de queda contínua de preço documentada em 90% desde 2023.[^10][^11]
- **Hardware próprio**: custo de capital zero (minis já possuídos), mas custo de energia (~5-40W por mini sob carga, não convertido em R$/hora nesta pesquisa), custo de conectividade redundante, custo de manutenção remota sem equipe de ML dedicada, risco de falha sem SLA, e custo de oportunidade de não vender os minis — nenhum desses itens foi quantificado em fonte encontrada especificamente para Mac mini M4 Pro em operação 24/7; é uma lacuna que precisa de modelagem própria.
- **Celular (híbrido)**: custo de bateria de 10-15%/hora no modo híbrido (só STT local), que se traduz em necessidade de carregador em consultas de 4h/dia — não elimina custo de servidor para a etapa de redação, apenas reduz volume de áudio transmitido.[^9]
- **Ponto de equilíbrio**: não encontrado nenhum cálculo publicado específico para este caso de uso; a orientação é que, com o preço de API em queda contínua e custos ocultos de operação de hardware não quantificados, o volume necessário para hardware próprio compensar provavelmente é maior do que a intuição inicial sugere — só é seguro afirmar isso após medir o TCO real com uma frota piloto pequena (2-3 minis) por 30 dias.

## Recomendação

A aposta de maior retorno é **não migrar para hardware próprio agora e, em vez disso, atacar três coisas em paralelo**: (1) expandir a régua de qualidade para 10-20 transcrições reais variadas com métrica de taxa de erro por 100 palavras, alinhada a PDQI-9, porque a régua atual de uma única transcrição é estatisticamente frágil frente ao que a literatura mostra sobre variabilidade de scribes ambientais; (2) reprecificar o produto para a faixa de R$ 99-199/mês, ainda abaixo de todo concorrente identificado, porque o custo de IA nunca foi o problema real de margem; (3) testar o caminho "áudio → resumo direto sem transcrição exposta" como o Noa Notes já faz, que pode reduzir custo de tokens de saída sem sacrificar a régua.[^3]

O primeiro experimento de uma semana que mais reduz incerteza é rodar a régua expandida (10-20 transcrições reais, não sintéticas) contra os três candidatos já aprovados (Gemini 3.7 Flash, Claude Sonnet 5, Qwen3.8-27B local) e contra a variante "resumo direto sem transcrição". Isso responde simultaneamente às premissas P1, P2 e P6 — as três com maior impacto financeiro imediato — antes de qualquer decisão de hardware, que só deveria ser revisitada depois que o modelo de preço e a régua de qualidade estiverem estabilizados.

## O que não foi encontrado

- Nenhum cálculo publicado de TCO específico para operação de frota de Mac mini M4 Pro em produção 24/7 (energia, manutenção, falha, redundância) — precisa ser medido internamente com um piloto de 30 dias.
- Nenhuma evidência de arquitetura de nenhum concorrente pesquisado usando fine-tuning de modelo pequeno (3-9B) para a tarefa de transcrição-com-erro-para-prontuário-com-confissão.
- Nenhum benchmark de WhisperKit ou ASR on-device especificamente em português brasileiro com ruído de consultório e múltiplas vozes — o benchmark de 2,2% WER é em inglês/condições controladas.
- Nenhum dado de disposição a pagar de médicos brasileiros especificamente (pesquisas de mercado formais não localizadas), apenas preços praticados por concorrentes já no mercado.
- Nenhuma métrica pública de PDQI-9 ou ACI-Bench aplicada a Noa Notes ou outro produto brasileiro — os números de qualidade de scribes ambientais citados são de estudos com produtos predominantemente americanos.

---

## References

1. [IA para prontuário médico: saiba como funciona o Noa ...](https://feegowclinic.com.br/blog/noa-notes-ia-para-prontuario-medico) - Reduza o tempo de documentação e organize melhor os registros com IA para prontuário médico do Noa N...

2. [Noa Notes - assistente virtual com IA revoluciona a rotina ...](https://press.doctoralia.com.br/435372-noa-notes-assistente-virtual-com-ia-revoluciona-a-rotina-medica) - Ela permite que o médico esteja mais presente durante a consulta, com mais escuta e atenção ao pacie...

3. [Evaluating the Quality and Safety of Ambient Digital Scribe Platforms Using Simulated Ambulatory Encounters](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5255300) - Background: Ambient digital scribe (ADS) platforms utilize ambient speech recognition and large-lang...

4. [Abridge Pricing | UsagePricing](https://www.usagepricing.com/blueprint/abridge) - Abridge pricing is sales-only: EHR-integrated ambient AI scribing sold to health systems on negotiat...

5. [AI Medical Scribe and Ambient Clinical Documentation Complete ...](https://en.ai-pedias.com/blog/ai-medical-scribe-2026) - Deep comparison of AI medical scribe and ambient clinical documentation. Abridge ($2.75B, 150+ hospi...

6. [Best AI Medical Scribes 2026: Top 10 Tools Compared](https://www.commure.com/blog-scribe/best-ai-medical-scribes) - Freed, Heidi Health, & Commure Scribe tie for 1st on a published, weighted scorecard. Compare 10 AI ...

7. [DAX Copilot Nuance Review 2026: Features and Limitations](https://www.trytwofold.com/compare/dax-copilot-review) - Evaluate DAX Copilot's medical scribing features in 2026. Explore the pros and cons and compare it w...

8. [WhisperKit: On-device Real-time ASR with Billion-Scale ...](https://arxiv.org/html/2507.10860v1) - WhisperKit is an optimized on-device inference system designed to deploy Whisper models for real-tim...

9. [Crie um assistente de voz local no seu telefone: Whisper + LLM local (sem nuvem) — 2026](https://www.promptquorum.com/pt/power-local-llm/voice-assistant-local-mobile-offline) - IA de voz totalmente offline no iPhone e Android em 2026: Whisper STT + LLM local + Piper TTS. Confi...

10. [The LLM Pricing Collapse of 2026: How to Build When ...](https://www.aimagicx.com/blog/llm-pricing-collapse-developer-guide-building-cheap-ai-2026) - LLM API costs have dropped over 90% since 2023. This guide covers smart routing, caching strategies,...

11. [LLM API Pricing Trends Q2 2026 — Who Got Cheaper, Who Got Expensive](https://dev.to/benchwright/llm-api-pricing-trends-q2-2026-who-got-cheaper-who-got-expensive-8hh) - The LLM market has repriced dramatically since early 2025. Frontier intelligence that cost $10/M...

12. [FAQ - Dúvidas Frequentes sobre o NOA](https://ajuda.feegow.com/support/solutions/articles/67000744016-faq-d%C3%BAvidas-frequentes-sobre-o-noa) - 1 - Como transformar a transcrição em um resumo? 2 - Como inserir um resumo na anamnese ou evolução?...

13. [Abridge AI Scribe Cost Analysis: Procurement Playbook for ...](https://www.scribing.io/blog/abridge-ai-scribe-cost-analysis) - Detailed Abridge AI Scribe cost analysis for hospital procurement teams. Compare pricing, ROI benchm...

14. [[PDF] Analysis of errors in dictated clinical documents assisted by speech ...](https://psnet.ahrq.gov/node/46990/psn-pdf)

15. [Analysis of Errors in Dictated Clinical Documents Assisted by Speech Recognition Software and Professional Transcriptionists](https://pmc.ncbi.nlm.nih.gov/articles/mid/NIHMS990954/) - Accurate clinical documentation is critical to health care quality and safety. Dictation services su...

16. [CRM-PA - Conselho Federal de Medicina.](https://sistemas.cfm.org.br/normas/arquivos/pareceres/PA/2022/19_2022.pdf)

17. [Where To Go Next](https://clunic.com/best/ai-medical-scribes) - Independent comparison of AI medical scribe vendors on EHR depth, HIPAA posture, published pricing a...

18. [Abridge Pricing, Reviews & Alternatives (2026)](https://getlimeai.com/blog/abridge-pricing-reviews-alternatives/) - What Abridge costs in 2026, why it wins Best in KLAS, who it fits, and the alternatives to consider,...

19. [Abridge Review 2026: Best AI Clinical Scribe for Epic](https://hokai.io/hub/tools/abridge) - Abridge is an ambient AI scribe at Epic-integrated systems as Epic's first PAL partner, generating c...

20. [Softwares médicos com IA inclusa em 2026: quem cobra à parte](https://bydoctor.com.br/alternativas/software-medico-com-ia) - Quais softwares médicos incluem IA de transcrição sem custo extra e quais cobram à parte? Comparamos...

21. [An Open Clinical Reasoning Model via Continued Pretraining ...](https://chandravikram.com/papers/09-reasonmed)

22. [AI API pricing history — GPT, Claude, Gemini, Grok, Llama ...](https://mungomash.com/ai/pricing-history/) - The per-million-token price of every major frontier AI model from GPT-3 to today — current rates, fu...

23. [Lei Geral de Proteção de Dados (LGPD)](https://cloud.google.com/security/compliance/lgpd) - Lei Geral de Proteção de Dados (LGPD) - Compliance

24. [LGPD e IA: como manter conformidade usando OpenAI ...](https://assistente.usetokia.com/blog/lgpd-ia-providers-internacionais) - Checklist prático pra DPO + dev: bases legais, contratos, anonimização, data residency, direito ao e...

25. [Abridge Review 2026: #1 Best in KLAS Ambient AI for ...](https://ai-health-apps.com/reviews/abridge-review/) - In-depth Abridge review for 2026. #1 Best in KLAS, deployed at Mayo Clinic, Kaiser, and the VA. Epic...

26. [Nuance DAX Copilot Review 2026: Microsoft's Ambient AI Scribe ...](https://ai-health-apps.com/reviews/nuance-dax-review/) - In-depth Nuance DAX Copilot review for 2026. Microsoft-backed ambient AI clinical documentation, Epi...

27. [Best AI Medical Scribes for 2026 - Beginners in AI](https://beginnersinai.org/best-ai-medical-scribes/) - Freed, Heidi, Nabla, Suki, and Abridge compared: verified July 2026 pricing, real free tiers, and a ...

28. [Best AI Medical Scribes 2026 [Updated]](https://www.heidihealth.com/en-us/blog/best-ai-medical-scribe) - Compare the best AI medical scribes trusted by healthcare teams today. Learn what makes Heidi the mo...

29. [Best AI Medical Scribe 2026 - VoiceboxMD](https://voiceboxmd.com/best-ai-medical-scribe/) - 12 AI medical scribes compared on price, EHR fit, HIPAA and accuracy, including DAX and Dragon. Voic...

