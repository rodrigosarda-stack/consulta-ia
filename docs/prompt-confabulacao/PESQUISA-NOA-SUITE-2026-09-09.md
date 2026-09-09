## Visão geral da suíte Noa

Noa não é um único produto, é uma suíte de assistentes de IA do Docplanner (Doctoralia no Brasil, ZnanyLekarz na Polônia, MioDottore na Itália) com quatro módulos principais: Noa Notes (documentação clínica), Noa Booking (atendimento telefônico e agendamento), Noa Evidence (pesquisa de literatura médica) e Noa Summary (organização de exames para pacientes). Uma confirmação técnica direta encontrada nesta rodada, não presente na pesquisa anterior: a Doctoralia usa **Azure OpenAI's GPT-4 Turbo** para processamento de linguagem natural na transcrição e estruturação clínica, integrado com Azure App Service, Azure DevOps, GitHub Copilot e SignalR para a infraestrutura de rollout.[^1][^2][^3][^4][^5]

## Noa Notes — funcionalidades completas

### Captura e fluxo durante a consulta

- Escuta a conversa em segundo plano via microfone do computador ou celular, sem interromper o fluxo de atendimento nem exigir instalação de aplicativo.[^6][^7]
- Funciona tanto para consulta presencial quanto para teleconsulta, desde a versão v2.[^8]
- QR code permite conectar o celular do médico como microfone remoto enquanto trabalha no computador.[^9]
- Não transcreve a consulta inteira: filtra e retém apenas conteúdo clinicamente relevante (queixas, histórico familiar, exames, recomendações), descartando conversa informal — exceto quando psiquiatras ou psicólogos preferem manter o contexto social.[^7][^9]

### Geração e estrutura da nota

- Gera resumo estruturado por tópicos ao final do atendimento, organizado segundo modelo escolhido pelo médico.[^10][^9]
- Suporta mais de 50 especialidades médicas, com anotações adaptadas às necessidades clínicas de cada área.[^11][^12]
- **Modelos (templates) totalmente personalizáveis**: o médico define exatamente o formato e as informações que quer capturar, podendo instruir a IA a registrar até falas literais do paciente dentro do modelo; pode criar quantos modelos quiser e trocar entre eles com um clique.[^13][^8]
- Templates de exemplo se adaptam ao tipo de consulta (ex.: nutricionista tem campos como "mudanças de peso", "adesão ao plano alimentar", "próxima consulta e metas").[^13]
- A versão v2 reporta captura de 30% mais detalhes clínicos em comparação com a versão anterior.[^8]
- Resumo é editável antes de ser copiado para o prontuário — o médico revisa e ajusta antes de salvar.[^6]
- Domínio de terminologia médica, com múltiplos idiomas suportados (inglês, alemão, polonês, português confirmados).[^14]

### Integração e distribuição

- Extensão para Chrome: abre o Noa Notes dentro de qualquer prontuário eletrônico, sem precisar trocar de aba ou sair do sistema em uso.[^8][^6]
- Funciona com qualquer prontuário eletrônico, seja o sistema nativo da Doctoralia ou plataformas de terceiros (Feegow confirmado como integração real).[^10][^7]
- Duas formas de acesso: dentro da agenda Doctoralia integrada, ou de forma independente via app web sem necessidade de instalação (notes.br.noa.ai).[^9]
- Uso ilimitado de notas, sem restrição de volume no plano pago.[^15][^6]

### Segurança e conformidade

- Conformidade com LGPD (Brasil) e GDPR (Europa).[^7][^8]
- Certificação ISO/IEC 27001 desde a versão v2.[^8]
- Criptografia avançada de dados e processamento em servidores compatíveis com regulação local.[^15][^7]

## Noa Booking — atendimento telefônico e agendamento automatizado

### O que faz diretamente

- Atende 100% das chamadas de pacientes, 24 horas por dia, 7 dias por semana, incluindo fora do horário comercial.[^16][^3]
- Agenda, cancela e remarca consultas automaticamente, atualizando a agenda em tempo real.[^17][^18]
- Responde perguntas frequentes sobre serviços, preços e localização do consultório.[^18]
- Confirma consultas futuras automaticamente com os pacientes.[^18]
- Número de telefone dedicado, exibido no perfil Doctoralia/ZnanyLekarz e no Google Meu Negócio, substituindo o número tradicional do consultório nessas plataformas.[^19][^18]
- Envia confirmações pós-chamada por SMS e WhatsApp.[^20]

### Quando transfere para humano

- Quando o paciente pede para falar diretamente com alguém.[^18]
- Quando não há horários disponíveis na agenda.[^18]
- Quando surgem perguntas médicas ou situações de urgência.[^18]
- Em pedidos complexos que exigem julgamento humano.[^19][^18]

### Stack técnica confirmada

- Construído sobre **Twilio ConversationRelay e Programmable Voice**, permitindo alternar entre modelos de speech-to-text e text-to-speech sem que o Docplanner precise construir infraestrutura de voz própria.[^20]
- Usa **modelo de linguagem localizado por idioma/sotaque** — decisão explícita da equipe para atender clientes menos familiarizados com tecnologia, com fallback humano garantido em caso de falha.[^20]
- Resultados reportados: dobrou o volume de agendamentos e integrou 1.300 médicos em apenas três dias de rollout em um mercado testado.[^20]
- Métricas de negócio divulgadas: até 10% mais faturamento (menos ligações perdidas) e até 70% menos tempo do médico/equipe ao telefone.[^3]
- Disponível atualmente para clientes dos planos Plus e VIP (conforme documentação polonesa) — não é feature universal do plano básico.[^18]

## Noa Evidence — assistente de literatura médica

- Pesquisa literatura médica revisada por pares e diretrizes clínicas locais, gerando resumos estruturados com atribuição de fonte transparente e link clicável direto ao artigo original.[^21][^1]
- Fluxo de uso: pergunta clínica → análise de IA busca em diretrizes e artigos → resumo estruturado com evidências, protocolos de tratamento e contraindicações documentadas → possibilidade de perguntas de acompanhamento para refinar.[^1]
- Explicitamente não fornece aconselhamento médico, diagnóstico ou apoio à decisão clínica — é ferramenta de pesquisa, não substitui julgamento do médico, e instrui o usuário a nunca inserir dados identificáveis de paciente.[^21][^1]
- Disponível gratuitamente para todos os médicos, clientes ou não da Doctoralia, com até 3 perguntas gratuitas para usuários não cadastrados antes de exigir registro.[^1]
- Integrado automaticamente dentro da interface do Noa Notes Standalone e do sistema EHR SaaS para clientes pagantes.[^21][^1]
- Caso de uso divulgado pela empresa: uma cardiologista brasileira usou a ferramenta para investigar um caso de diagnóstico duplamente equivocado, e a busca de literatura contribuiu para o diagnóstico correto de linfoma.[^22]

## Noa Summary e recursos para pacientes

- Recurso gratuito no app para pacientes (Android e iOS): paciente faz upload de exame ou laudo médico e recebe em segundos um resumo em texto com os pontos essenciais do documento.[^5]
- Escaneamento de documentos via câmera do celular, com qualidade superior a uma foto comum, armazenado na aba "Documentos" do app e compartilhável diretamente com profissionais de saúde.[^5]
- Reduz risco de perda de exames impressos e agiliza fluxo de informação entre paciente e médico.[^5]

## Precificação e planos (Brasil)

| Item | Detalhe |
|---|---|
| Noa Notes standalone | R$ 199/mês, anotações ilimitadas, modelos personalizados por especialidade, criptografia avançada, integração com qualquer prontuário, domínio de linguagem médica[^15] |
| Noa & Doctoralia Pro | Combina Noa Notes + acesso a ferramentas avançadas da Doctoralia Pro (perfil profissional completo, agendamento online); Noa Booking listado como "em breve" nesse pacote no momento da coleta[^15] |
| Noa Booking | Disponível para planos Plus e VIP em mercados onde já lançado; não incluído no plano básico[^18] |
| Noa Evidence | Gratuito para todos os médicos, clientes Doctoralia ou não[^1] |
| Noa Summary (pacientes) | Gratuito, dentro do app para pacientes[^5] |

## Tabela-resumo de toda a suíte

| Módulo | Público | Função principal | Custo | Stack confirmada |
|---|---|---|---|---|
| Noa Notes | Médicos | Transcrição + resumo estruturado da consulta | R$ 199/mês, ilimitado[^15] | Whisper auto-hospedado (ASR) + Azure OpenAI GPT-4 Turbo (sumarização)[^4][^23] |
| Noa Booking | Médicos/clínicas | Atendimento telefônico 24/7, agendamento automático | Planos Plus/VIP[^18] | Twilio ConversationRelay + Programmable Voice[^20] |
| Noa Evidence | Médicos | Pesquisa de literatura médica com citação de fonte | Gratuito[^1] | Não especificado — busca em base de artigos peer-reviewed e diretrizes locais[^1] |
| Noa Summary | Pacientes | Resumo de exames e laudos enviados pelo app | Gratuito[^5] | Não especificado |
| Escaneamento de documentos | Pacientes | Digitalização de exames via câmera do celular | Gratuito[^5] | Não especificado |

## O que não foi encontrado

- Nenhuma confirmação pública se o "modelo de linguagem localizado por sotaque" do Noa Booking é um LLM proprietário treinado pela Docplanner ou um serviço de terceiro além da camada Twilio.
- Nenhum detalhe técnico sobre a stack de IA usada no Noa Evidence (qual motor de busca, qual LLM sintetiza os resultados).
- Nenhum detalhe técnico sobre a stack do Noa Summary e do escaneamento de documentos para pacientes.
- Preço específico do Noa Booking (planos Plus/VIP) não foi encontrado em reais para o mercado brasileiro — a única tabela de preço granular encontrada é polonesa, sem valores numéricos, e a brasileira só cobre o Noa Notes standalone.
- Não foi encontrada confirmação se GPT-4 Turbo ainda é o modelo em uso atualmente (a fonte que confirma isso é de maio de 2025) ou se já foi substituído por versão mais recente do GPT via Azure, já que a pesquisa anterior sobre a stack (baseada em documentos de privacidade de 2026) não especifica a versão do modelo.

---

## References

1. [Noa Evidence: Su asistente de literatura médica impulsado por IA](https://help.docplanner.com/8/doc/noa-evidence-su-asistente-de-literatura-medica-impulsado-por-ia) - Noa Evidence: Su asistente de literatura médica impulsado por IA Sintetice al instante literatura mé...

2. [Assistente de IA para profissionais de saúde | Noa](https://noa.ai/pt-br/) - O assistente virtual que prepara o resumo dos atendimentos médicos, atende as ligações e facilita o ...

3. [Nunca mais perca uma ligação ou um agendamento](https://noa.ai/pt-br/noa-booking) - Nunca mais perca uma ligação ou um agendamento. O Noa Booking é o assistente de IA que atende todas ...

4. [Doctoralia Uses Microsoft AI to Streamline Medical Scheduling](https://mexicobusiness.news/health/news/doctoralia-uses-microsoft-ai-streamline-medical-scheduling) - Doctoralia uses Microsoft AI to reduce admin tasks for healthcare professionals, boosting patient ca...

5. [Doctoralia lança recursos com IA para empoderar pacientes](https://medicinasa.com.br/noa-notes-recursos/) - Home Quem somos Cadastre-se Anuncie Redação Contato X PARCERIA DE CONTEÚDO Conteúdo exclusivo de emp...

6. [Noa Notes por Doctoralia - Web Store do Chrome](https://chromewebstore.google.com/detail/noa-notes-by-docplanner/fhbkphgopfnhbbldhjgcncllngmkcndi?hl=pt-PT) - AI-powered medical note-taking assistant for healthcare professionals

7. [Noa Notes - assistente virtual com IA revoluciona a rotina ...](https://press.doctoralia.com.br/435372-noa-notes-assistente-virtual-com-ia-revoluciona-a-rotina-medica) - Economizando até 30% do tempo das consultas, a ferramenta Noa Notes já está disponível no Brasil e r...

8. [Suas anotações clínicas geradas com IA | Noa Notes](https://noa.ai/pt-br/noa-notes-v2) - Não se preocupe mais em fazer as anotações clínicas e economize até 30% do seu tempo em atendimentos...

9. [Primeiros passos com Noa Notes - Central de Ajuda](https://help.docplanner.com/11/doc/primeiros-passos-com-o-noa-notes) - Primeiros passos com Noa Notes. Noa Notes é parte do Noa, o assistente virtual da Doctoralia que ope...

10. [Como utilizar o Noa Notes : Central de Ajuda - Feegow](https://ajuda.feegow.com/support/solutions/articles/67000748555-como-utilizar-o-noa-notes) - Neste artigo estaremos demonstrando como utilizar a ferramenta NOA NOTES, que se trata de uma inteli...

11. [Suas anotações clínicas geradas com IA - Noa Notes](https://noa.ai/pt-br/noa-notes) - Não se preocupe mais em fazer as anotações clínicas e economize até 30% do seu tempo em atendimentos...

12. [Noa Notes: Notas médicas generadas con IA](https://noa.ai/es-es/noa-notes) - Di adiós a las tediosas notas médicas y ahorra hasta un 30% de tiempo en las visitas gracias a la IA...

13. [Cómo Noa Notes crea plantillas para tu especialidad](https://noa.ai/es-es/ia-centro-recursos/blog/como-noa-notes-crea-plantillas-para-tu-especialidad) - Descubre cómo Noa Notes crea plantillas personalizadas para tu especialidad, ayudándote a generar no...

14. [Noa - Is This The Best AI Health Tool in 2025? 🏆](https://www.bestaitools.com/tool/noa/) - What is Noa? Automates medical documentation and streamlines administrative tasks for healthcare pro...

15. [Noa | Descubra planos sob medida para você](https://noa.ai/pt-br/preco) - Planos flexíveis para médicos, clínicas e hospitais. O assistente virtual com IA que atende ligações...

16. [L'assistente AI che risponde sempre | Noa Booking](https://noa.ai/it/noa-booking) - Ottimizza ogni opportunità di prenotazione, senza interruzioni. Noa Booking risponde automaticamente...

17. [Noa Booking | Noa](https://noa.ai/es-es/noa-booking) - Aprovecha cada oportunidad de agendar citas, sin interrupciones telefónicas. Noa Booking atiende tod...

18. [Noa Booking: Asystent AI do umawiania wizyt - Centrum Pomocy](https://help.docplanner.com/2/doc/noa-booking-asystent-ai-do-umawiania-wizyt-telefonicznych) - Noa Booking: Asystent AI do umawiania wizyt Zautomatyzuj połączenia telefoniczne dotyczące spotkań i...

19. [“Vorrei prenotare una visita...”. E te la fissa l'AI con MioDottore NOA ...](https://www.dday.it/redazione/55340/vorrei-prenotare-una-visita-e-te-la-fissa-lai-con-miodottore-noa-booking) - Presentato a Milano il nuovo sviluppo in chiave AI della popolare (tra i medici) piattaforma MioDott...

20. [Docplanner rolls out AI voice booking agent with Twilio](https://itbrief.co.uk/story/docplanner-rolls-out-ai-voice-booking-agent-with-twilio) - Docplanner's AI voice agent, built on Twilio tech, has doubled doctor bookings and onboarded 1,300 c...

21. [Noa Evidence: il tuo assistente per la letteratura medica ...](https://help.docplanner.com/12/doc/noa-evidence-il-tuo-assistente-per-la-letteratura-medica-potenziato-dallia) - Noa Evidence: Il tuo assistente per la letteratura medica basato sull'intelligenza artificiale Sinte...

22. [Karol Traczykowski's Post - LinkedIn](https://www.linkedin.com/posts/ktraczykowski_healthcareai-healthtech-medicalai-activity-7462762868762013697-JP3a) - Doctors today continue balancing packed schedules, administrative work, and increasingly complex pat...

23. [AI-assisted documentation (Noa Notes) - NeuroPraxis Kleinmachnow](https://www.neuropraxis-kleinmachnow.de/en/datenschutz/50-noa-ki-dokumentation/index.html) - Data protection information on AI-assisted documentation of doctor-patient conversations with Noa No...

