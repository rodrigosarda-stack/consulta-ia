# Pedido de pesquisa profunda — um passo atrás: qual é o melhor jeito de transformar uma consulta médica em prontuário?

> Cole o texto abaixo, inteiro, numa ferramenta de pesquisa profunda. Escrito em 08/09/2026.
> Diferença em relação ao pedido anterior (PEDIDO-PESQUISA-EFICIENCIA.md): aquele pedia pra otimizar uma solução já escolhida. Este pede pra questionar a escolha.

---

Quero uma pesquisa exaustiva, com fontes datadas e números, que **questione as premissas** de um produto que estou construindo, antes de eu gastar dinheiro em hardware. Não quero que você otimize o que eu já decidi. Quero que você me diga onde eu provavelmente estou errado, o que o mercado inteiro está fazendo diferente de mim, e quais caminhos eu não considerei.

Regra do jogo: para cada premissa da seção 3, você deve tentar derrubá-la com evidência. Se não conseguir, diga por que ela se sustenta. Se conseguir, mostre o caminho alternativo com números.

## 1. O objetivo, sem solução embutida

Um médico brasileiro atende um paciente. Ao final, ele precisa de um **prontuário clínico escrito**, fiel ao que foi dito, que ele leia, corrija e assine em menos de dois minutos. O sistema não pode inventar nada. Onde a fala chegou ambígua ou quebrada, o sistema tem que **mostrar ao médico o que interpretou**, em vez de esconder.

Metas de negócio:
- Preço ao médico em torno de **R$ 47 por mês**, uso ilimitado, ou um modelo de preço melhor que você me sugira.
- Escala alvo: **1.000 médicos, ~4 horas de atendimento por dia cada**, consulta média de 35 minutos.
- Margem saudável. Hoje o custo variável está em ~R$ 0,50 por hora gravada só em IA, o que a R$ 47/mês fecha para ~3,4 h/dia e não para 4.

Restrições reais:
- **LGPD**: áudio e texto são dados de saúde. Nada vai para fornecedor sem contrato de tratamento de dados e sem cláusula de não-treinamento.
- Português do Brasil, fala espontânea, consultório com ruído, duas ou três vozes.
- Time pequeno. Sem equipe de ML dedicada.
- Tenho **dezenas de Mac mini M4 Pro 32 GB parados**. Isso é um ativo, não uma obrigação: não assuma que a solução tem que usá-los.

## 2. O que já existe e funciona (para você não partir do zero)

- App web no celular do médico grava em pedaços de ~30 s, sobe cada pedaço na hora, com fila offline.
- Transcrição por pedaço com um LLM ouvindo o áudio (Gemini 3.7 Flash) que já rotula MÉDICO / PACIENTE. Medido em gravações reais: ~92 % de acerto de palavra, 8/8 termos médicos críticos, falantes 7/7. Whisper large-v3 ficou atrás (~90 %, 5–6 de 8 termos, sem falantes).
- Um vigia barato decide se aquilo é consulta mesmo e se ela acabou, só quando há sinal (despedida, silêncio).
- O prontuário é escrito por um LLM a partir da transcrição, com a seção obrigatória "O QUE EU INTERPRETEI".
- Régua de qualidade que uso em todo modelo: acertar 5 termos (losartana, dipirona, travamento, bicicleta, condropatia), **consertar** "de pirona" → dipirona e confessar o conserto, confessar "psiculécia" como não entendido sem inventar remédio, não inventar idade/exame/dose, sair sem markdown com JSON válido, 2 de 2 rodadas.
- Passaram na régua: Gemini 3.7 Flash sem thinking (US$ 0,006/prontuário, 3,5 s), Claude Sonnet 5 (US$ 0,04), Qwen3.8-27B 4-bit rodando localmente num Mac (grátis, ~200 s). Reprovaram: gpt-oss 120b/20b, Haiku 4.5, Gemini lites, Qwen 9B, um Qwen "destilado do Claude" que trocou dipirona por piroxicam 1 g.
- Uma pesquisa anterior sugeriu testar modelos MoE de poucos parâmetros ativos (Qwen3-30B-A3B) para ganhar 5–10× de velocidade local, e mostrou que prompt-lookup decoding não rende em Apple Silicon.

## 3. As premissas que quero que você tente derrubar

**P1. "Precisa transcrever primeiro e depois escrever o prontuário."**
Existe evidência de que ir **direto do áudio para o prontuário** com um modelo multimodal dá resultado igual ou melhor, mais barato? E o contrário: existe evidência de que a etapa de transcrição literal é indispensável para auditoria e responsabilidade legal do médico (CFM, prontuário eletrônico, SBIS)? O que os produtos líderes fazem?

**P2. "O custo de IA é o problema a resolver."**
Mostre a estrutura de custo e o preço dos produtos que já fazem isso em escala: Abridge, Nuance/Microsoft DAX Copilot, Nabla, Heidi Health, Suki, Ambience, Freed, DeepScribe, Doximity Scribe, Tali, e os brasileiros (Doctoralia/Docplanner Noa, Feegow, iClinic, Amplimed, Memed, Conexa, quaisquer scribes brasileiros). Quanto cobram, por que conseguem cobrar isso, o que o médico valoriza. Meu preço de R$ 47 é o problema? O uso "ilimitado" é o problema? Modelos de preço por consulta, por hora, por plano hospitalar. Evidência de disposição a pagar de médicos no Brasil.

**P3. "O processamento tem que acontecer num servidor."**
O iPhone e o Android modernos têm processador neural. Existe ASR de qualidade clínica **rodando no próprio celular** em pt-BR (Apple Speech framework 2026, Whisper via CoreML/WhisperKit, Gemini Nano, Moonshine, Kyutai)? Qual a qualidade, o consumo de bateria numa consulta de 1 h, e o efeito em LGPD (o áudio nunca sai do aparelho). Existe LLM pequeno no celular capaz de escrever o prontuário com a nossa régua? Se não, um híbrido "transcreve no celular, redige no servidor" muda a conta de custo e de LGPD como?

**P4. "Precisa de um modelo grande (27B ou API de ponta) para escrever o prontuário."**
Evidência de que um modelo pequeno (3–9B) **ajustado especificamente** para "transcrição pt-BR → prontuário + confissão", treinado com alguns milhares de exemplos gerados por um modelo forte, alcança a régua. Casos publicados de destilação **de tarefa** em domínio clínico, custo do ajuste, e riscos (o destilado que reprovei herdou o estilo, não o cuidado). Alternativa: dividir a tarefa (um modelo extrai fatos, outro redige) reduz alucinação e custo?

**P5. "Rodar em hardware próprio é mais barato que a API."**
Faça a conta completa que eu não fiz: energia, internet, alguém para manter as máquinas ligadas e atualizadas, falha de hardware, redundância, latência quando a fila estoura, custo de oportunidade dos minis (revender?), e a tendência de queda dos preços de API nos últimos 24 meses com projeção. Em que volume de horas/dia o hardware próprio passa a compensar de verdade? Existe caminho intermediário com **DPA** (Google Cloud com Vertex, Azure OpenAI, AWS Bedrock, Anthropic enterprise, provedores brasileiros) que resolve LGPD sem hardware?

**P6. "A qualidade se mede como eu estou medindo."**
Minha régua tem 5 termos e 2 confissões, numa transcrição. É pouco? O que a literatura de scribes clínicos usa para avaliar fidelidade e alucinação (ACI-Bench, MedHELM, PDSQI-9, avaliação por médicos, taxa de edição pelo médico)? Como os líderes medem e publicam? Quais métricas eu deveria adotar antes de decidir qualquer arquitetura?

**P7. "Gravar a consulta inteira é o jeito certo de capturar."**
Alternativas: o médico dita um resumo de 2 minutos ao final; o sistema faz perguntas de fechamento; captura da tela do prontuário eletrônico; integração com o sistema da clínica. Evidência de adoção e qualidade de cada abordagem. O que reduz custo e o que reduz valor.

**P8. "O produto é o prontuário."**
O que os líderes descobriram que o médico realmente paga: prontuário, códigos de faturamento, carta ao paciente, pedido de exames, receita, resumo para o próximo médico, lembretes de retorno? Se o valor está em outra coisa, a arquitetura de custo muda?

## 4. O que quero de volta

1. **Veredito por premissa** (P1 a P8): sustenta / cai / depende, com a evidência mais forte a favor e contra, datada.
2. **Mapa de caminhos possíveis** de "consulta → prontuário", pelo menos seis, incluindo os que não usam transcrição, os que rodam no celular, os que usam API com DPA, os que usam hardware próprio, e os que mudam o produto. Para cada um: custo estimado por hora de consulta, qualidade esperada contra a minha régua, risco LGPD, esforço para um time pequeno, e quem já faz assim.
3. **Benchmark de mercado**: tabela com pelo menos 12 produtos (metade fora do Brasil, metade no Brasil ou em português), preço, modelo de cobrança, arquitetura conhecida ou inferida, e o que dizem sobre privacidade.
4. **A conta completa de hardware próprio vs. API vs. celular** com as premissas explícitas, para eu poder mexer nos números.
5. **Recomendação**: se você tivesse que apostar, qual caminho, e qual o **primeiro experimento de uma semana** que mais reduz a incerteza. Justifique.
6. **O que você não achou** e eu terei que medir.

Regras: cite fonte e data para cada número; separe **medido**, **estimado** e **opinião**; priorize 2026 e final de 2025; quando fontes discordarem, mostre as duas; não invente benchmark nem produto. Escreva em português do Brasil.
