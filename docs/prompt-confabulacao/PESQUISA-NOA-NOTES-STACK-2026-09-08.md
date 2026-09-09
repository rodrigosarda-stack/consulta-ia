## Visão geral

Noa Notes é o assistente de documentação clínica por IA do Docplanner (dono da Doctoralia no Brasil e ZnanyLekarz/Jameda na Europa), lançado em 2024, hoje usado por mais de 30 mil médicos pagantes em 13 países, com mais de 3 milhões de consultas processadas — 1 milhão só no Brasil, crescendo cerca de 30% ao mês. A stack técnica real foi confirmada por documentos de privacidade regionais da própria empresa (Alemanha e Polônia), que são fontes primárias e mais confiáveis que o material de marketing.[^1][^2]

## Pipeline técnico, passo a passo

O fluxo completo é: **microfone → gravação em segmentos → transcrição via ASR → sumarização via LLM → nota estruturada revisável pelo médico**.[^3][^4]

1. **Captura de áudio**: o médico ativa manualmente o Noa Notes (desligado por padrão), pede consentimento do paciente, e a gravação começa via microfone do computador ou celular (com QR code para conectar o celular como microfone remoto).[^5][^3]

2. **Envio em tempo real por segmentos**: o áudio é enviado em blocos de 30 segundos para permitir transcrição em tempo real, não em lote ao final da consulta — a mesma técnica que o usuário já usa em seu próprio produto.[^4][^3]

3. **Transcrição (Speech-to-Text)**: a base é o **OpenAI Whisper (open source)**, mas rodando na própria infraestrutura da empresa — não como serviço da OpenAI. Na Alemanha, é operado nos servidores próprios da Jameda na UE; na versão descrita para a Polônia, é executado via infraestrutura própria na AWS. Isso é uma decisão de arquitetura relevante: eles auto-hospedam Whisper em vez de usar a API da OpenAI diretamente, provavelmente por controle de custo, latência e conformidade de dados de saúde.[^6][^4]

4. **Sumarização (LLM)**: a nota estruturada é gerada pelo **Microsoft Azure OpenAI Service**, não pela API pública da OpenAI. O processamento ocorre dentro da UE, com os EUA servindo apenas como solução de backup, protegida pelo EU-U.S. Data Privacy Framework. Isso indica que o modelo de linguagem usado é da família GPT (via Azure), embora a versão exata (GPT-4o, GPT-4.1, ou mais recente) não seja divulgada publicamente em nenhuma fonte encontrada.[^6][^4]

5. **Infraestrutura de nuvem**: **Amazon Web Services (AWS)** hospeda a plataforma e armazenamento; **Microsoft Azure OpenAI** processa a inferência de linguagem — uma arquitetura multi-cloud deliberada, separando hospedagem de processamento de IA.[^4][^6]

6. **Retenção de dados**: o áudio fica disponível por 24 horas para revisão e é apagado em até 14 dias; a transcrição é retida por até 1 ano (para fins de auditoria de qualidade); a nota final permanece nos servidores da empresa só até o médico revisar e transferir ao prontuário. Explicitamente, **os dados de pacientes não são usados para treinar os modelos de IA**.[^3][^4]

## O que confirma um engenheiro que trabalhou no projeto

Michal Przadka, que apresentou sobre o Noa Notes na AI Summit Warsaw 2024 junto com Karol Traczykowski (então Head of AI, hoje VP AI Solutions do Docplanner), descreve o projeto como envolvendo "sumarização em ambiente desafiador, transcrição médica, **modelos open-source com fine-tuning**, avaliação avançada e datasets complexos de ground truth". Isso é a confirmação mais direta encontrada de que a empresa não usa apenas modelos prontos — eles fazem fine-tuning de modelos abertos, embora a fonte não especifique quais modelos são ajustados nem em qual etapa do pipeline (mais provavelmente no Whisper, para vocabulário médico e adaptação de idioma/acento, dado que a transcrição já roda em infraestrutura própria).[^7]

O próprio VP de IA do Docplanner, em entrevista publicada em maio de 2026, descreve o sistema como testado em múltiplas camadas isoladas — "garantimos que cada nova versão do modelo de transcrição é melhor que a anterior, cada versão do modelo de sumarização é melhor que a anterior" — e depois testado em conjunto para verificar regressões, com testes graduais em produção e revisão humana constante no loop. Isso confirma uma arquitetura de dois modelos distintos e versionados separadamente (um de ASR, um de sumarização), exatamente como a arquitetura do produto do usuário.[^8]

## Detalhes de produto e diferenciação do que a empresa expõe publicamente

Um ponto central de posicionamento: o Noa Notes explicitamente **não expõe a transcrição literal ao médico como produto final** — ele filtra e resume apenas o conteúdo clinicamente relevante, descartando conversas informais (exceto quando psiquiatras/psicólogos optam por manter contexto social). A transcrição existe internamente (por até 1 ano, para auditoria de qualidade), mas não é o output principal entregue ao médico.[^9][^10]

A empresa divulga uma metodologia de avaliação com peso declarado: 70% do peso na acurácia de terminologia médica e 30% na precisão geral de transcrição medida por Word Error Rate — priorizando erro de termo clínico sobre erro geral porque tem consequência direta de segurança do paciente. Segundo a mesma fonte, o Noa Notes teria atingido a maior precisão clínica no Brasil, Polônia e México entre soluções comparadas, superando concorrentes em média de 5,5 pontos percentuais — mas essa afirmação vem de conteúdo patrocinado da própria empresa, sem metodologia pública auditável ou publicação independente que a valide.[^1]

## Segurança, certificações e conformidade

O produto opera com certificação **ISO/IEC 27001** (gestão de segurança da informação), equivalente ao padrão alemão **BSI C5 Type 2** para provedores de eHealth. Na Alemanha, a base legal de tratamento é consentimento explícito do paciente (Art. 9(2)(a) GDPR) combinado com base de cuidado à saúde (Art. 9(2)(h) GDPR + § 22 BDSG). O sistema é explicitamente classificado como **não sendo dispositivo médico** e não substitui julgamento clínico — toda decisão médica, diagnóstico e conduta permanece exclusivamente do médico, com revisão obrigatória antes de qualquer nota entrar no prontuário.[^6][^4]

## Tabela-resumo da stack

| Camada | Tecnologia | Detalhe confirmado |
|---|---|---|
| Captura de áudio | App web/celular, QR code para microfone remoto | Segmentos de 30s enviados em tempo real[^3][^4] |
| Hospedagem/infraestrutura | Amazon Web Services (AWS) | Servidores na Alemanha/UE para clientes europeus[^4] |
| Transcrição (ASR) | OpenAI Whisper, auto-hospedado (não API OpenAI) | Rodando em infraestrutura própria da empresa, não na nuvem da OpenAI[^6][^4] |
| Sumarização (LLM) | Microsoft Azure OpenAI Service | Processamento na UE, EUA só como backup via EU-US DPF[^6][^4] |
| Fine-tuning | Modelos open-source com ajuste fino (não especificado qual etapa) | Confirmado por apresentação de engenheiro do projeto na AI Summit 2024[^7] |
| Avaliação de qualidade | Framework end-to-end, testes isolados por modelo + testes conjuntos + revisão humana no loop | Descrito pelo VP de IA em entrevista de 2026[^8] |
| Retenção de dados | Áudio: 24h disponível, apagado em até 14 dias. Transcrição: até 1 ano. Nota: até revisão médica | Documento de privacidade Alemanha[^4] |
| Certificações | ISO/IEC 27001; equivalente a BSI C5 Type 2 (Alemanha) | Documento de privacidade[^4] |
| Treinamento de modelo com dados de paciente | Não ocorre | Confirmado explicitamente em FAQ e política de privacidade[^3][^4] |

## O que não foi encontrado

- A versão exata do modelo Azure OpenAI usado (GPT-4o, GPT-4.1, GPT-5, ou outro) não é divulgada em nenhuma fonte pública encontrada.
- Qual modelo especificamente recebe fine-tuning (o Whisper para vocabulário médico/idioma, o LLM de sumarização, ou ambos) não é especificado — apenas confirmado que "modelos open-source com fine-tuning" fazem parte do sistema.[^7]
- Nenhuma métrica pública e auditável de WER ou taxa de erro clínico foi encontrada — os números de "5,5 pontos percentuais acima da concorrência" vêm de conteúdo patrocinado pela própria empresa, sem benchmark independente publicado.
- Não foi encontrado se a arquitetura usada no Brasil é idêntica à europeia (AWS + Azure OpenAI) ou se há adaptação regional de infraestrutura — as fontes mais detalhadas de stack são de operações na Alemanha e Polônia.
- Nenhuma informação sobre como a diarização (separação médico/paciente) é feita tecnicamente — se é nativa do pipeline de Whisper customizado ou uma camada adicional.

---

## References

1. [Noa Notes: como a IA está elevando o padrão de ...](https://medicinasa.com.br/noa-notes-entrevista/) - Home Quem somos Cadastre-se Anuncie Redação Contato X PARCERIA DE CONTEÚDO Conteúdo exclusivo de emp...

2. [O avanço da inteligência artificial nas clínicas: impactos e ...](https://medicinasa.com.br/ia-clinicas/) - Home Quem somos Cadastre-se Anuncie Redação Contato X PARCERIA DE CONTEÚDO Conteúdo exclusivo de emp...

3. [Najczęściej zadawane pytania (FAQ) dotyczące Noa Notes](https://help.docplanner.com/2/doc/najczesciej-zadawane-pytania-faq-dotyczace-noa-notes) - Najczęściej zadawane pytania (FAQ) dotyczące Noa Notes Witamy w sekcji często zadawanych pytań dotyc...

4. [AI-assisted documentation (Noa Notes) :: NeuroPraxis Kleinmachnow](https://www.neuropraxis-kleinmachnow.de/en/datenschutz/50-noa-ki-dokumentation/) - Data protection information on AI-assisted documentation of doctor-patient conversations with Noa No...

5. [Primeiros passos com Noa Notes - Central de Ajuda](https://help.docplanner.com/11/doc/primeiros-passos-com-o-noa-notes) - Primeiros passos com Noa Notes. Noa Notes é parte do Noa, o assistente virtual da Doctoralia que ope...

6. [AI-assisted documentation (Noa Notes) - NeuroPraxis Kleinmachnow](https://www.neuropraxis-kleinmachnow.de/en/datenschutz/50-noa-ki-dokumentation/index.html) - Data protection information on AI-assisted documentation of doctor-patient conversations with Noa No...

7. [Noa Notes - Building AI That Listens and Summarizes](https://blog.michalprzadka.com/posts/ai-summit-noa/) - Noa Notes at the AI Summit

8. [NOA - AI assistant for doctors: How it's built | Docplanner - LinkedIn](https://www.linkedin.com/posts/docplannergroup_noa-ai-assistant-for-doctors-how-its-activity-7462838968343257088-A04F) - Building clinical AI isn’t just about models. It’s about systems. Episode 2 of our series at Docplan...

9. [Noa Notes - assistente virtual com IA revoluciona a rotina ...](https://press.doctoralia.com.br/435372-noa-notes-assistente-virtual-com-ia-revoluciona-a-rotina-medica) - Ela permite que o médico esteja mais presente durante a consulta, com mais escuta e atenção ao pacie...

10. [comparativo entre ferramentas de IA para médicos](https://noa.ai/pt-br/biblioteca-ia/blog/chatgpt-vs.-noa-notes-comparativo) - Conheça as similaridades e diferenças entre Noa Notes e ChatGPT. Duas ferramentas que se têm sido ca...

