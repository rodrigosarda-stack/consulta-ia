# Helena (ex-MarIA) — Especificação v5

**Data:** 09/09/2026 · **Aprovada por:** Rodrigo Sardá, nesta data, sobre a página "Projeto MarIA" (artifact `00522272`) e a página "Resgate de janeiro" (artifact `a9893ab1`).
**Substitui:** Especificação V4 (01/04/2026) e a Especificação Unificada v2 (janeiro/2026), que fica em `docs/plano/2026-01-especificacao-unificada-v2.md` como histórico.
**Nome:** o produto passa a se chamar **Helena**. Código, repositório e URLs ainda dizem MarIA; a troca é tarefa separada.

> Páginas visuais desta versão: `projeto-helena.html` (o projeto de ponta a ponta), `resgate-janeiro.html` (o que voltou de janeiro), `helena-vs-noa.html` (concorrência), `estudo-modelos.html` (167 modelos medidos), `prontuarios-em-lote.html` (por que o lote funciona). Todas nesta pasta.

---

## 1. A ideia

Não é um programa de prontuário. É um **laço entre médico e paciente** que gira sozinho. O prontuário é a matéria-prima; o vínculo é o produto; a base é o negócio.

1. Médico grava a consulta no celular, sem instalar nada.
2. Prontuário pronto; o médico revisa e assina em 1 minuto.
3. Paciente recebe no WhatsApp o que o médico disse: remédio, dose, quando voltar, lembretes.
4. Histórico de vida do paciente: todas as consultas, todos os médicos, um lugar só.
5. O paciente puxa o próximo médico ("doutor, o senhor usa a Helena?"), ou o médico pede acesso ao histórico.
6. O novo médico entra e traz todos os pacientes dele. O laço fecha e cresce.

**Por que gira sem empurrar:** é de graça para os dois; o médico quer porque fortalece o vínculo dele; o paciente quer porque nunca mais perde nada.

**O que a base vira** (ordem do plano de abril): serviços da Método 3A pelo canal (mês 6) → canal pharma e educação, por especialidade (mês 12) → dados anonimizados (mês 18) → IA própria (mês 24).

**A parede:** vende-se a atenção do médico e o dado anonimizado. O conteúdo identificado do paciente fica dentro (CRM do médico, histórico do paciente) e nunca é vendido.

**Como o médico convida o médico:** mensagem pronta cujo link carrega o telefone do indicador; a Helena lê o número por regex e registra o vínculo; a indicação só conta quando o indicado grava a primeira consulta de saúde real. **Sem prêmio** (nem dinheiro, nem Pro). Texto da mensagem (do Rodrigo): *"Cansou de perder tempo escrevendo prontuário? Resolva de graça. Teste a Helena: grava a consulta e o prontuário sai pronto em 2 minutos. De graça. 👉 [link]"*

**Abertura/marketing:** 9 minutos por paciente, 1h30 por dia, **30 horas por mês**, um mês de trabalho por ano. Em dinheiro, só o defensável: "mesmo que só uma hora em quatro vire consulta, são ~13 atendimentos a mais por mês; faz a conta com o valor da sua consulta".

## 2. Os dois lados da mesma consulta

**Identidade dos dois lados = telefone.** A consulta nasce ligada ao médico (telefone + CRM/CRO/CRP) e ao paciente (telefone).

**Médico:** grava e esquece; prontuário estruturado com "O que eu interpretei"; CRM (pago) com linha do tempo, **Conexão** (ganchos de conversa: filhos, time, o que estuda) e **Sobre a pessoa** (contexto de vida), escritos pela IA a partir dos pedaços etiquetados "conversa"; anexa receita, exame, vídeo para o paciente; pede acesso ao histórico do paciente com outros médicos.

**Paciente (sempre grátis):** versão em linguagem simples do que o médico mandou; lembretes no WhatsApp (retorno, remédio, "pode voltar a caminhar"); histórico de vida cruzando médicos ("aplicativo chefe da saúde" da pessoa); traz exame e foto do remédio; decide quem vê o quê. **Nunca vê o áudio nem o prontuário técnico.** Pedido formal de dados (LGPD/CFM) é raro e tratado à mão pelo médico.

**Sigilo entre médicos:** o prontuário do Dr. João é dele e do paciente. O Dr. Pedro só vê se o paciente aceitar; fica registrado quem viu o quê e quando. Existe desde o dia um.

## 3. Uma consulta, do começo ao fim (o que existe hoje)

Gravar em pedaços cortados na pausa da fala (20–60 s; sobreposição 0,3 s na pausa, 2 s em corte forçado; pré-roll 0,5 s) → silêncio > 3 s pausa e não sobe nem custa → sobe na hora, fila offline em IndexedDB → transcreve cada pedaço com MÉDICO/PACIENTE/OUTRO (Gemini áudio; Whisper de reserva; trocável em `config.transcricao`) → vigia por evento (é saúde? acabou? virou aula/reunião?; fraude a cada 4 pedaços) → para sozinho → etiqueta cada pedaço clínico/conversa → prontuário + "O que eu interpretei" → médico revisa.

**Ainda não construído (tracejado):** Conexão/Sobre a pessoa a partir da conversa; versão simples para o paciente; WhatsApp do paciente e lembretes.

**Regras novas aprovadas:**
- **Uso pessoal:** a primeira gravação que não é consulta vai de presente ("degustação"), com o botão do Pro; da segunda em diante tranca. Custo por tentativa: R$ 0,29 hoje na API, R$ 0,02 no desenho final.
- **Onboarding em 4 mensagens:** "salva meu contato, sem isso não funciona" → termos em uma linha → link de gravação. Não avança sem salvar o contato; primeira gravação na primeira conversa, < 5 min. Mesmo desenho para o paciente.

## 4. Onde roda e quanto custa

**Hoje:** celular → servidor (Supabase) → Google transcreve e escreve. **R$ 0,50 por hora gravada** (60 % de fala): transcrição R$ 0,36, redação R$ 0,06, vigia/etiquetas R$ 0,03, armazenamento R$ 0,03. Por médico com 4 h/dia, 22 dias: **R$ 44/mês**.

**Desenho final:** celular ou PC do médico transcreve no aparelho (R$ 0) → servidor com fila com prioridade → Mac minis próprios (Gemma 4 31B ou Qwen3.8-27B) → API com contrato de dados só no pico e para o pago. **~R$ 0,05 por hora; ~R$ 1 por médico/mês** contando fixo. Táxi (API) vs academia (máquina própria): o plano de janeiro já dizia; o Mac mini medido dá ~60 médicos; o aparelho do médico é melhor que academia: é grátis.

**Para 1.000 médicos/mês:** transcrição na API R$ 57 mil vs R$ 0 no aparelho; redação R$ 4.900 no Gemini vs R$ 570 no Gemma hospedado vs ~R$ 150 de energia nos minis; fixo ~R$ 500. **Total ~R$ 1.100/mês. Trinta pagantes de R$ 47 bancam 1.000 grátis.**

**Condição:** a transcrição no aparelho tem que ser boa em português com ruído. Não medida. Teste do ditado no iPhone pendente.

## 5. Qual IA escreve o prontuário

**Régua:** transcrição real de 07/09; 5 termos (losartana, dipirona, travamento, bicicleta, condropatia); "de pirona" tem que virar dipirona **e** ser confessado; "psiculécia" confessada sem inventar remédio; JSON válido, sem markdown; 2 de 2 rodadas a temp 0,2.

**167 modelos medidos** (docs/prompt-confabulacao/MODELOS-PRONTUARIO.md): 28 passam, 25 oscilam, 110 reprovam. Aprovados que importam: Gemini 3.7 Flash sem pensar (US$ 0,006, produção hoje), **Gemma 4 31B** (US$ 0,0007, pesos abertos, cabe em mini 32 GB), Qwen3.8-27B (local, passa 9/9; lote de 4 → 39 prontuários/h), GPT-4.1 mini (US$ 0,0026, DPA pronto), Mistral Medium 3.1 (US$ 0,004, UE), DeepSeek V4 Flash (US$ 0,0006, só API, sem DPA). **Todo MoE de poucos ativos reprova no remédio (4/4).** Modelos derivados (destilado, podado) reprovam. Só pesos oficiais.

**Falta medir:** Gemma 4 31B num mini 32 GB com lote; transcrição do iPhone em pt-BR com ruído; régua com 10–20 gravações; preço do Gemma na Vertex.

## 6. Grátis e pago

| Recurso | Grátis | Pro (R$ 47/mês ou anual) |
|---|---|---|
| Gravar consultas de saúde | sem limite | sem limite |
| Prontuário com "o que eu interpretei" | ✓ | ✓ |
| Prontuário pronto em | fila, até ~1 h | 1 minuto |
| Paciente recebe versão simples e lembretes | ✓ | ✓ |
| Painel de gestão (atendimentos, queixas, retornos) | congelado nas primeiras 25 consultas | vivo |
| CRM: linha do tempo, Conexão, Sobre a pessoa | só a consulta de hoje | tudo, com busca |
| Pergunte ao histórico, ache o trecho, exporte a prova (fase 2) | ✗ | ✓ |
| Gravar reunião, aula, ditado | a primeira, de presente | ✓ |
| Áudio guardado | 75 consultas | 3.800 · 13.000 · degrau R$ 29,90 |
| Receita, exame, atestado, carta | ✗ | ✓ |
| Modelos por especialidade, editar na tela | ✗ | ✓ |
| Extensão do Chrome | ✓ | ✓ |
| Exportar dados | ✗ | ✗ |

**Mensal:** Pro daqui em diante; tudo que grava pagando é dele (3 anos de mensal = 3 anos de painel); o período em que não pagava fica congelado.
**Anual recorrente:** tudo isso **e o período sem pagar liberado**. "Contrate o ano e libere tudo que você gravou de graça." Cancelou, aquele período fecha de novo.

**Momentos Pro** (aparece quando vale mais, e some): primeiras 25 consultas (tudo); toda vez que um paciente volta (a ficha dele, uma vez); fim de cada mês ("seu mês em números" por 24 h); a cada 50 consultas gravadas (7 dias de Pro); todo dia (a fila). Regras: quando mostra, mostra de verdade, sem tela borrada; a mensagem de trancar lista o que ele acabou de ver (sem eufemismo); nunca se tira o que é do grátis.

**Espaço: tem ou não tem.** Além da cota, a gravação nova fica **"indisponível para o médico"**. Sem tabela de resgate, sem "arquivo" na tela. Resgate só por atendimento: "podemos tentar recuperar, sem garantia, com custo", caso a caso. **A palavra "apagado" não existe**: guardamos tudo (é o ativo) e a política de privacidade diz isso. Prontuário e transcrição nunca ficam indisponíveis; só o áudio. Espaço vendido como proteção jurídica ("por menos de 1 centavo por consulta você tem a prova"), em consultas guardadas, nunca em GB; aviso aos 90 %.

**Limite de 3 consultas/dia:** existe no código, desligado; saída de emergência.

## 7. Dados, consentimento e a parede

**Quem consente:** médico aceita os Termos no cadastro; a Helena fala o aviso dentro do áudio ("Gravação iniciada. Consulta documentada por inteligência artificial") e a tela lembra o médico; paciente aceita os Termos dele ao criar a conta (consentimento específico e destacado, cobrindo dado sensível, histórico, compartilhamento e uso anonimizado); paciente autoriza cada médico que pede acesso.

**Dentro da parede (identificado):** consultas, CRM do médico (tudo que o paciente contou, sem filtro de assunto — o médico tem direito de saber), histórico do paciente.
**Anonimização de verdade** (sem nome, data exata, cidade pequena, combinação rara) → **fora da parede:** banco de consultas em português, IA própria, canal pharma = atenção do médico, nunca conteúdo do paciente. Dado anonimizado não é dado pessoal (LGPD art. 12); o trabalho é a anonimização ser real (ANPD, ago/2026).

**Guardamos tudo.** Áudio por cota; texto para sempre. O Noa apaga em 14 dias porque vive da assinatura; nós vivemos da base.

**Advogado antes de pharma e do banco anonimizado**, com quatro perguntas: anonimização suficiente; fornecedores de IA (DPA); consentimento do paciente na conta; a palavra "indisponível" na política de retenção.

## 8. Como ganha dinheiro

Ordem: Pro e espaço pagam a operação (mês 1) → serviços M3A (mês 6) → Plano Clínica (mês 6) → canal pharma/educação por especialidade (mês 12) → dados anonimizados (mês 18) → IA própria (mês 24). Precedentes: Memed (grátis 14 anos, 150 mil médicos, lucro em 2025, R$ 100 mi projetados), OpenEvidence (grátis, US$ 300 mi/ano, 90 % margem), Doximity (US$ 228/médico/ano).

**A dica no prontuário é a mídia.** Cada prontuário entregue é um momento de atenção total. A dica usa os números do consultório do médico ("mês passado 5 pacientes/dia, este mês 4: caiu 20 %; um paciente novo de endocrinologia custa R$ 300 em mídia; quer ver como recuperar? [MARCAR UMA CONVERSA]"). Rodízio: 1/3 vende o Pro, 1/3 serviço M3A ou conteúdo, 1/3 indústria; nunca duas iguais seguidas; nunca usa o conteúdo do paciente para escolher. Custo R$ 0,02 por dica, leitura ~100 %. O médico grátis custa R$ 0,80/mês e lê a Helena ~150×/mês: é ativo de mídia, não custo.

**Modelo financeiro (36 meses, 5 cenários, sem equipe/suporte/advogado/marketing):** custo R$ 0,80/médico + R$ 500 fixo; Pro R$ 47; espaço R$ 9,90 (5–25 % dos ativos); pharma R$ 0–40/médico/mês a partir do mês 9–18; base inicial 120 ativos (30 % dos 400 clientes do 3A); teto 100 mil.

| Cenário | Cresc./mês | Conversão | Ativos M36 | Pagantes M36 | Lucro 36 m |
|---|---|---|---|---|---|
| Catastrófico | 2 % | 3 % | 240 | 7 | −R$ 11 mil |
| Pessimista | 5 % | 5 % | 662 | 33 | R$ 95 mil |
| **Base** | 10 % | 7 % | 3.372 | 236 | **R$ 798 mil** |
| Otimista | 15 % | 8 % | 15.981 | 1.278 | R$ 4,1 mi |
| Explosivo | 20 % | 10 % | 70.880 | 7.088 | R$ 19,6 mi |

Vs. janeiro (custo R$ 10/pagante, Pro R$ 147, só assinatura): o base tinha 811 pagantes e R$ 609 mil; hoje tem menos pagantes e mais lucro. O jogo não é conversão; é base grátis grande e barata.

## 9. Concorrência

Detalhe em `helena-vs-noa.html`. Resumo: **Noa Notes** (Doctoralia) R$ 199/mês avulso ou no pacote Doctoralia Pro/Feegow, 30 mil pagantes, 1 mi consultas no Brasil; Whisper próprio na AWS + GPT-4 Turbo via Azure; pedaços de 30 s; modelos por especialidade; extensão do Chrome; apaga áudio em 14 dias; não treina; ISO 27001; grátis só Evidence (literatura) e Summary (paciente). Custo de IA deles ~R$ 0,10–0,15/consulta vs preço R$ 1,30/consulta: 90 % de margem, nenhum motivo para baixar preço.

**Maior:** transparência ("o que interpretei", quem falou), lado do paciente, preço, custo (se o híbrido funcionar), dados no tempo. **Igual:** tecnologia. **Menor:** distribuição, integração, recursos maduros, confiança institucional.

**Como o Noa pode reagir:** ignorar (provável no início); esconder o preço no pacote da agenda (mais provável); freemium com limite; **levar a consulta ao app do paciente (mais perigoso: eles já têm o paciente)**; guerra de recursos; atacar o modelo ("grátis vende seus dados"); copiar o custo (baixa); comprar. Defesa contra os dois principais: o lado do paciente, construído antes de tudo, funcionando com qualquer médico. A briga não é pelo médico que já paga Doctoralia; é pelos outros 500 mil.

**Perspectiva:** comparação certa é com Memed/OpenEvidence. Cenários de 100 → 1.000 → 10 mil → 50–100 mil médicos; receita possível de pharma R$ 300–650/médico/ano; 600 mil médicos, > 2 milhões de profissionais de saúde (dentistas, psicólogos, fisio, nutri, fono, TO, enfermeiros); área jurídica como futuro, com outro tratamento.

## 10. O que existe e o que falta

**Pronto:** gravador em pedaços, fila offline, silêncio não cobrado, pré-roll; transcrição com falantes trocável por config, Whisper de reserva; vigia (saúde, fim, aula, fraude); etiquetas por pedaço; prontuário com "o que eu interpretei"; painel/linha do tempo/PDF/validação CRM-CRO-CRP/planos Asaas.
**Pendente (existe, falta ligar):** links de Termos/Privacidade; validação CRM no front; tocar na etiqueta para virar.
**Novo:** paciente como entidade (telefone) com sugestão de nome; Conexão e Sobre a pessoa; plataforma do paciente (versão simples, lembretes, histórico, anexos, compartilhar); fila com prioridade; convite pelo telefone + onboarding + bot de WhatsApp; painel de gestão, momentos Pro, mensal/anual, espaço tem-ou-não-tem; a dica como mídia; transcrição no celular/PC; minis com Gemma/Qwen em lote; receita/exame/atestado/carta, modelos por especialidade, extensão do Chrome.
**Decisão do Rodrigo:** advogado LGPD/ANVISA; anonimização; lista de fornecedores; nome Helena no código; qual mini/onde.

## 11. Ordem de ataque

- **Semana 1 (medição):** ditado no iPhone contra as 2 gravações reais; Gemma 4 31B num mini 32 GB com 1/4/8 em lote.
- **Semana 2:** paciente = telefone; Termos ligados; régua com 10 gravações.
- **Semanas 3–4:** versão simples + WhatsApp do paciente; fila com prioridade; convite pelo telefone.
- **Semanas 5–6:** histórico do paciente; compartilhar entre médicos; Conexão e Sobre a pessoa; painel de gestão.
- **Semanas 7–8:** transcrição no aparelho; minis em produção; extensão do Chrome.
- **Beta com médicos reais** (validar com 10 médicos do 3A, como já dizia janeiro).

## 12. Decisões aprovadas em 09/09/2026

1. O laço é o produto; lado do paciente sempre grátis, construído antes dos extras pagos.
2. Grátis sem limite para saúde; pago = velocidade, CRM, gestão, extras. Fila com prioridade, sem atraso artificial. Limite 3/dia desligado.
3. Paciente e médico são o telefone; a consulta nasce ligada aos dois.
4. A parede: tudo que o paciente contou entra no CRM do médico; para o negócio sai anonimizado; pharma compra atenção do médico, nunca conteúdo do paciente; sigilo entre médicos por autorização do paciente.
5. Guardamos tudo; áudio por cota ("indisponível", nunca "apagado"); texto para sempre.
6. Custo: transcrição sai da API (aparelho do médico); redação em Gemma/Qwen nos minis com API de reserva; Gemini como reserva e como "pago".
7. Semana 1 é medição (iPhone e mini).
8. Advogado antes de pharma e do banco anonimizado (4 perguntas).
9. Resgate de janeiro: convite pelo telefone sem prêmio; painel nas primeiras 25 consultas e depois congelado; mensal daqui em diante, anual libera o período sem pagar; momentos Pro; espaço tem ou não tem; a dica é a mídia com os números do médico; degustação de uso pessoal; oferta do Pro sem eufemismo; 30 h/mês na abertura sem os R$ 25 mil; Cérebro = "pergunte ao histórico, ache o trecho, exporte a prova" (fase 2); todas as profissões de saúde; área jurídica futuro; **sem opção de exportar dados; paciente não vê áudio**.
10. Nome: Helena. Ligação futura com o Theo (financeiro da clínica): a consulta gera a cobrança.

## Fica como histórico (não volta)

Gravar pelo WhatsApp; 3 transcrições por dia após trial; preços R$ 147/247/397; apagar áudio em 24 h; Cérebro Pro com Opus; RTX 4090 alugada; prêmio de "+3 dias" por indicação; cortar no dia 3; tabela pública de resgate de arquivo (R$ 149/399); "cada mês pago abre 3 meses"; trava de exportação.
