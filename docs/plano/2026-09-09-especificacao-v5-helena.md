# Helena (ex-MarIA) — Especificação v5.2

> **v5.1 (09/09, noite):** emendas 24–33 após o parecer de sete especialistas independentes (`docs/plano/parecer-dos-sete.html`, `docs/plano/pareceres/`). Onde esta versão contradiz o texto original abaixo, valem as emendas, marcadas com **[v5.1]**.

**Data:** 09/09/2026 · **Aprovada por:** Rodrigo Sardá, nesta data, sobre a página "Projeto MarIA" (artifact `00522272`) e a página "Resgate de janeiro" (artifact `a9893ab1`).
**Substitui:** Especificação V4 (01/04/2026) e a Especificação Unificada v2 (janeiro/2026), que fica em `docs/plano/2026-01-especificacao-unificada-v2.md` como histórico.
**Nome:** o produto passa a se chamar **Helena**. Código, repositório e URLs ainda dizem MarIA; a troca é tarefa separada.

> **Este é o documento mestre da Helena.** Páginas visuais desta versão, todas nesta pasta: `projeto-helena.html` (o projeto de ponta a ponta), `potencial-helena.html` (as 12 portas de receita, rampa, equipe, comparáveis), `mundo-da-helena.html` (o ecossistema em 5 desenhos), `parecer-dos-sete.html` + `pareceres/` (revisão por 7 especialistas), `resgate-janeiro.html` (o que voltou de janeiro), `helena-vs-noa.html` (concorrência), `estudo-modelos.html` (167 modelos medidos), `prontuarios-em-lote.html` (por que o lote funciona). Decisões numeradas em `docs/decisoes/2026-09-09-decisoes-produto.md` (1–35). Versão: **v5.2, 10/09/2026** (8b e 13 novas; porta 12).

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

**Identidade dos dois lados = telefone.** A consulta nasce ligada ao médico (telefone + CRM/CRO/CRP) e ao paciente (telefone). **[v5.1]** Um número pode ter **dependentes** (mãe com filhos, filho com pai idoso); existe **perfil de secretária**; o histórico exige **passkey** e tem **bloqueio de 72 h após troca de chip**.

**Médico:** grava e esquece; prontuário estruturado com "O que eu interpretei"; CRM (pago) com linha do tempo, **Conexão** (ganchos de conversa: filhos, time, o que estuda) e **Sobre a pessoa** (contexto de vida), escritos pela IA a partir dos pedaços etiquetados "conversa"; anexa receita, exame, vídeo para o paciente; pede acesso ao histórico do paciente com outros médicos.

**Paciente (sempre grátis):** versão em linguagem simples do que o médico mandou (**[v5.1]** só depois da revisão de um toque do médico; dose com dúvida vira "confirme com o consultório"; rodapé "mensagem automática · urgência: ligue X"; a resposta do paciente cai numa caixa do consultório com prazo); lembretes no WhatsApp (retorno, remédio, "pode voltar a caminhar"); histórico de vida cruzando médicos ("aplicativo chefe da saúde" da pessoa); traz exame e foto do remédio; decide quem vê o quê. **Não vê o áudio nem o prontuário técnico na tela.** **[v5.1]** Mas pode ler o que existe sobre ele (inclusive "Sobre a pessoa" e "Conexão"), baixar o histórico simples em PDF, e obter o áudio grátis sob pedido em 15 dias (LGPD art. 18/19).

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

**[v5.1] Isto é hipótese, não decisão.** A transcrição no aparelho não dá diarização MÉDICO/PACIENTE nem a "dica" que corrige remédios; Android é fragmentado; PWA no iOS não grava com tela bloqueada. **Semana 1 é gate binário:** WER e 5 termos em 12 gravações de 3 especialidades contra o pipeline atual; avaliar híbrido (aparelho no "modo espera", servidor na consulta). Minis = piloto de 2 máquinas com UPS e runbook; API com contrato como caminho principal até provar. Até medir, o custo assumido por médico é **R$ 3–8/mês**, não R$ 1.

## 5. Qual IA escreve o prontuário

**Régua:** transcrição real de 07/09; 5 termos (losartana, dipirona, travamento, bicicleta, condropatia); "de pirona" tem que virar dipirona **e** ser confessado; "psiculécia" confessada sem inventar remédio; JSON válido, sem markdown; 2 de 2 rodadas a temp 0,2.

**167 modelos medidos** (docs/prompt-confabulacao/MODELOS-PRONTUARIO.md): 28 passam, 25 oscilam, 110 reprovam. Aprovados que importam: Gemini 3.7 Flash sem pensar (US$ 0,006, produção hoje), **Gemma 4 31B** (US$ 0,0007, pesos abertos, cabe em mini 32 GB), Qwen3.8-27B (local, passa 9/9; lote de 4 → 39 prontuários/h), GPT-4.1 mini (US$ 0,0026, DPA pronto), Mistral Medium 3.1 (US$ 0,004, UE), DeepSeek V4 Flash (US$ 0,0006, só API, sem DPA). **Todo MoE de poucos ativos reprova no remédio (4/4).** Modelos derivados (destilado, podado) reprovam. Só pesos oficiais.

**Falta medir:** Gemma 4 31B num mini 32 GB com lote; transcrição do iPhone em pt-BR com ruído; régua com 10–20 gravações; preço do Gemma na Vertex.

## 6. Grátis e pago

| Recurso | Grátis | Rápido (R$ 27) | Pro (R$ 77; anual R$ 770) |
|---|---|---|---|
| Gravar consultas de saúde | sem limite | sem limite | sem limite |
| Prontuário com "o que eu interpretei" | ✓ | ✓ | ✓ |
| Prontuário pronto em | fila, até ~1 h | 1 minuto | 1 minuto |
| Paciente recebe versão simples e lembretes | ✓ | ✓ | ✓ |
| Painel de gestão | congelado nas primeiras 25 consultas | congelado | vivo |
| CRM: linha do tempo, Conexão, Sobre a pessoa | só a consulta de hoje | só a consulta de hoje | tudo, com busca |
| Pergunte ao histórico, ache o trecho, exporte a prova (fase 2) | ✗ | ✗ | ✓ |
| Gravar reunião, aula, ditado | a primeira, de presente | a primeira | ✓ |
| Áudio guardado | 75 consultas | 75 (+ espaço à parte) | 3.800 · 13.000 · degrau R$ 29,90 |
| Receita, exame, atestado, carta | ✗ | ✗ | ✓ |
| Modelos por especialidade, editar na tela | ✗ | ✗ | ✓ |
| Extensão do Chrome | ✓ | ✓ | ✓ |
| Exportar dados **[v5.1]** | ✓ (PDF em lote + JSON) | ✓ | ✓ |

**Escada de preço (09/09, noite):** Rápido R$ 27 compra só velocidade (o único atrito diário; cadastra o cartão); Pro R$ 77 é gestão (quase 3× o Rápido, "menos que uma consulta", um terço do Noa); Anual R$ 770 (dez meses pelo preço de doze) libera o período sem pagar; **Clínica**: 2+ médicos, desconto por volume. Três degraus, nunca quatro; o Rápido nunca ganha gestão.

**Mensal:** Pro daqui em diante; tudo que grava pagando é dele (3 anos de mensal = 3 anos de painel); o período em que não pagava fica congelado.
**Anual recorrente:** tudo isso **e o período sem pagar liberado**. "Contrate o ano e libere tudo que você gravou de graça." Cancelou, fecha de novo **só o painel** daquele período **[v5.1]**; ficha, prontuário e exportação nunca fecham.

**Momentos Pro** (aparece quando vale mais, e some): primeiras 25 consultas (tudo); toda vez que um paciente volta (a ficha dele, uma vez); fim de cada mês ("seu mês em números" por 24 h); a cada 50 consultas gravadas (7 dias de Pro); todo dia (a fila). Regras: quando mostra, mostra de verdade, sem tela borrada; a mensagem de trancar lista o que ele acabou de ver (sem eufemismo); nunca se tira o que é do grátis.

**Espaço: vende acesso imediato. [v5.1]** Além da cota, o áudio novo sai do acesso imediato do médico; **prazo e finalidade escritos**: áudio identificado guardado por cota + 12 meses, depois só a transcrição; ao titular (paciente ou médico) o áudio é entregue grátis sob pedido em 15 dias; "guardar para sempre" só do que passou por anonimização medida. Sem tabela de resgate na tela. A palavra "apagado" segue fora; "indisponível" só com o prazo escrito ao lado. Prontuário e transcrição nunca ficam indisponíveis. Espaço e Réguas são **add-ons**; a escada continua com três degraus. Espaço vendido como proteção jurídica ("por menos de 1 centavo por consulta você tem a prova"), em consultas guardadas, nunca em GB; aviso aos 90 %.

**Limite de 3 consultas/dia:** existe no código, desligado; saída de emergência.

**Agenda e pagamento da consulta pela Helena [v5.2, decisões 34–35]:** o paciente agenda o retorno pela Helena e pode pagar antes; o Theo recebe; a Helena fica com 3 % líquido. **Opcional por médico**, liga e desliga quando quiser, sem trava contratual (a Doctoralia prende quem contrata pacote com Pagamentos). O médico configura um **desconto** (0 / 5 / 10 %) apresentado ao paciente como benefício: "garanta o horário e ganhe 5 % pagando agora"; com falta de 20–30 %, 5 % de desconto rende R$ 30–60 a mais por horário. **Pix como padrão** (Asaas R$ 1,99), cartão como opção com a taxa mostrada (2,99 % + R$ 0,49); reembolso claro (24 h devolve tudo; depois, regra do médico); repasse no dia seguinte; comprovante e nota pelo Theo; taxa pública antes de ligar. Advogado: CFM veda anunciar preço/desconto em publicidade; dentro da agenda, ao próprio paciente, a linha é fina.

## 7. Dados, consentimento e a parede

**Quem consente [v5.1]:** médico aceita os Termos no cadastro; a Helena fala o aviso dentro do áudio ("gravação em curso; detalhes em [link]") — **aviso não é consentimento**; o paciente consente **em camadas** na conta dele: prontuário (tutela da saúde, só informação) → histórico e lembretes (consentimento) → anonimização e treino (consentimento destacado, revogável); paciente autoriza cada médico que pede acesso. **Sem conta do paciente, a gravação serve ao médico e ponto:** não entra em anonimização, dataset nem treino. Controlador por fluxo: o médico no prontuário; a Helena no histórico cruzado, CRM, anonimização e treino. DPAs (Vertex, Supabase, Meta) antes do piloto; DeepSeek fora. RIPD e encarregado.

**Dentro da parede (identificado):** consultas, CRM do médico (tudo que o paciente contou, sem filtro de assunto — o médico tem direito de saber), histórico do paciente.
**Anonimização de verdade** (sem nome, data exata, cidade pequena, combinação rara) → **fora da parede:** banco de consultas em português, IA própria, canal pharma = atenção do médico, nunca conteúdo do paciente. Dado anonimizado não é dado pessoal (LGPD art. 12); o trabalho é a anonimização ser real (ANPD, ago/2026).

**Guardamos o que tem base. [v5.1]** Texto identificado enquanto há relação com médico ou paciente (prontuário é guardado 20 anos pelo médico, exportável); áudio identificado por prazo; para sempre só o anonimizado, com anonimização medida (k-anonimato, datas deslocadas, NER de nomes, combinação rara). O que sai para o negócio: agregado do médico e evidência do mundo real anonimizada e estruturada, por estudo, com comitê de ética. O que nunca sai: identificado, dado de dispositivo (Apple Saúde/Health Connect), conteúdo do paciente para segmentar.

**Advogado antes de pharma e do banco anonimizado**, com quatro perguntas: anonimização suficiente; fornecedores de IA (DPA); consentimento do paciente na conta; a palavra "indisponível" na política de retenção.

## 8. Como ganha dinheiro

Ordem: Pro e espaço pagam a operação (mês 1) → serviços M3A (mês 6) → Plano Clínica (mês 6) → canal pharma/educação por especialidade (mês 12) → dados anonimizados (mês 18) → IA própria (mês 24). Precedentes: Memed (grátis 14 anos, 150 mil médicos, lucro em 2025, R$ 100 mi projetados), OpenEvidence (grátis, US$ 300 mi/ano, 90 % margem), Doximity (US$ 228/médico/ano).

**A dica na tela é a mídia. [v5.1]** Cada prontuário entregue é um momento de atenção. A dica aparece **na tela, nunca no PDF/prontuário**, identificada como publicidade, com "dispensar"; 1 a cada 5 prontuários; até 5 mil médicos só Pro e M3A; indústria **por especialidade** (gatilho ~2.000 CRMs validados), **nunca por queixa ou diagnóstico**. Os números do consultório aparecem em "seu mês em números", opt-in, não como gatilho de venda. Custo R$ 0,02 por dica; leitura a medir (clique e "dispensar"). O médico grátis custa R$ 0,80/mês e vê a Helena ~150×/mês: é ativo de mídia, não custo.

**Modelo financeiro (36 meses, 5 cenários, sem equipe/suporte/advogado/marketing):** custo R$ 0,80/médico + R$ 500 fixo; Pro R$ 47; espaço R$ 9,90 (5–25 % dos ativos); pharma R$ 0–40/médico/mês a partir do mês 9–18; base inicial 120 ativos (30 % dos 400 clientes do 3A); teto 100 mil.

| Cenário | Cresc./mês | Conversão | Ativos M36 | Pagantes M36 | Lucro 36 m |
|---|---|---|---|---|---|
| Catastrófico | 2 % | 3 % | 240 | 7 | −R$ 11 mil |
| Pessimista | 5 % | 5 % | 662 | 33 | R$ 95 mil |
| **Base** | 10 % | 7 % | 3.372 | 236 | **R$ 798 mil** |
| Otimista | 15 % | 8 % | 15.981 | 1.278 | R$ 4,1 mi |
| Explosivo | 20 % | 10 % | 70.880 | 7.088 | R$ 19,6 mi |

Vs. janeiro (custo R$ 10/pagante, Pro R$ 147, só assinatura): o base tinha 811 pagantes e R$ 609 mil; hoje tem menos pagantes e mais lucro. O jogo não é conversão; é base grátis grande e barata.


## 8b. As portas da receita, quem compra, e o potencial (v3.1)

Detalhe visual em `potencial-helena.html`. Doze portas; cada uma rotulada **medida** (nenhuma ainda), **benchmark** (tem comparável de mercado) ou **chute** (ninguém mediu). Valores por médico ativo por ano, no regime (todas as portas ligadas), cenário base; conservador e agressivo mudam só as taxas de adoção.

| Porta | Rótulo | Base do número | R$/médico/ano (base) |
|---|---|---|---|
| Rápido (R$ 27) | benchmark | 7 % pagam só pela velocidade; cadastra o cartão | 23 |
| Pro (R$ 77; anual R$ 770) | benchmark | 3 % pagam por gestão | 28 |
| Espaço (R$ 9,90) | benchmark | 10 % assinam | 12 |
| Réguas (R$ 29,90) | chute | 5 %; depende do lado do paciente | 18 |
| Painel de pesquisa para a indústria | benchmark | metade da base é de especialidades pesquisadas; 2/ano, 30 % respondem, R$ 150 de margem | 45 |
| Encaminhamento e leads | emenda 26 | sem comissão por encaminhamento (CEM 69); valor zero até existir como serviço | 0 |
| Agenda e pagamento da consulta (Theo) | chute | 10 % das consultas pagas pela Helena, R$ 300, 3 % líquido | 162 |
| Médico vende pelo app (Theo) | chute | 15 % vendem R$ 5 mil/mês; 3 % líquido; plano contínuo depende da ANS | 270 |
| Receita vira compra | emenda 26 | sem comissão por receita; PSP escolhido pelo paciente; só após assinatura digital | 0 |
| Exame vira agendamento | emenda 26 | idem; laboratório como assinante de plataforma | 0 |
| Canal pharma (dica na tela) | benchmark | R$ 50–150 por especialidade, gatilho ~2.000 CRMs | 100 |
| Serviços da Método 3A | benchmark | 0,7 % contratam R$ 3 mil/mês, margem 30 % | 75 |
| Dados anonimizados / evidência do mundo real | chute | por estudo, com comitê de ética | 30 |
| **Total no regime** | | conservador R$ 430 · **base R$ 763** · agressivo R$ 1.440 | **763** |

**Leitura:** assinaturas são 11 % do potencial; mais da metade são duas portas não provadas que passam pelo Theo (agenda paga e venda pelo app). O grátis abre as portas; as portas precisam existir de verdade antes de valer dinheiro.

**Custo variável por médico por ano:** IA R$ 12 + armazenamento ~R$ 3 = **R$ 15**. Mensagens iniciadas pela Helena pelo WhatsApp custam R$ 0,037 cada a partir de 01/10/2026 (fim da janela grátis de 24 h; 1.000 grátis por número/mês): ~900/mês por médico = +R$ 400/ano → **app com notificação é obrigatório**; PWA instalável é a primeira entrega.

**Rampa por patamar (não linear), com a equipe como o Rodrigo definiu:**

| Médicos | Portas ligadas | R$/médico/ano | Equipe (folha/mês) | Receita/ano | Resultado/ano |
|---|---|---|---|---|---|
| 1.000 | Rápido, Pro, espaço, pesquisa parcial, M3A | 150 | 1 (R$ 5 mil) | R$ 150 mil | R$ 72 mil |
| 5.000 | lado do paciente, agenda paga e venda pelo app começando, réguas | 400 | 3 (R$ 16 mil) | R$ 2,0 mi | R$ 1,7 mi |
| 10.000 | pharma por especialidade, dados | 620 | 8 (R$ 50 mil) | R$ 6,2 mi | R$ 5,4 mi |
| 25.000 | regime | 760 | 10 (R$ 70 mil) | R$ 19 mi | R$ 17,8 mi |
| 100.000 | regime | 810 | 20 (R$ 160 mil) | R$ 81 mi | R$ 77,6 mi |

Fora da conta ainda: impostos (13–19 %), taxa de pagamento, CAC se o laço não girar, Apple/Google 15–30 % no app nativo, coorte com retenção. Múltiplo de baixo dígito até prova.

**Quem compra:** médico (Rápido, Pro, espaço, réguas, comissão do que vende e da consulta paga, serviços M3A); farmácia e indústria (programa de desconto/PSP escolhido pelo paciente, assinatura de plataforma; sem comissão por receita); laboratório (agendamento que o paciente escolhe); indústria (dica na tela por especialidade, painel via agência, estudos com comitê de ética; nunca conteúdo do paciente nem dado de dispositivo); plano de saúde (adesão e retorno por beneficiário, guia pré-preenchida, Helena para a rede; **nunca vê a consulta**); Método 3A (o canal); prefeituras e SUS (fase 3).

**O que precisa ser verdade (checklist do beta):** mensagens pelo app, não WhatsApp (medir instalação do PWA); transcrição no aparelho passa o gate (WER + 5 termos); o laço gira (K ≥ 0,3 em 90 dias); o médico deixa o paciente receber a versão simples (≥ 70 %); o paciente abre (≥ 40 %); hábito na 8ª semana (≥ 50 %; consultas por médico por semana); "efeito cartão" existe; anonimização e consentimento passam no advogado; plano de saúde aceita só agregado e guia; plano contínuo não é lido como plano de saúde (ANS).

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

- **Semana 1 (medição e beta de papel) [v5.1]:** gate binário da transcrição no aparelho (12 gravações, 3 especialidades, WER + 5 termos); Gemma 4 31B num mini 32 GB com 1/4/8 em lote; **beta de papel** com 10 médicos do 3A (versão simples mandada à mão por 2 semanas: o médico deixa? o paciente abre?); **advogado** com cinco perguntas (portabilidade, retenção de áudio, controlador por fluxo, comissão de farmácia, paciente sem conta).
- **Semana 2:** paciente = telefone; Termos ligados; régua com 10 gravações.
- **Semanas 3–4:** só se o beta de papel passar: versão simples + WhatsApp do paciente (com revisão do médico); fila com prioridade; convite pelo telefone; exportação PDF/JSON.
- **Semanas 5–6:** histórico do paciente; compartilhar entre médicos; Conexão e Sobre a pessoa; painel de gestão.
- **Semanas 7–8:** transcrição no aparelho; minis em produção; extensão do Chrome.
- **Beta com médicos reais** (validar com 10 médicos do 3A, como já dizia janeiro).

## 12. Decisões aprovadas em 09/09/2026 (ver emendas 24–33 em `docs/decisoes/`, que prevalecem)

1. O laço é o produto; lado do paciente sempre grátis, construído antes dos extras pagos.
2. Grátis sem limite para saúde; pago = velocidade (Rápido R$ 27), gestão (Pro R$ 77, anual R$ 770), Clínica por volume. Fila com prioridade, sem atraso artificial. Limite 3/dia desligado.
3. Paciente e médico são o telefone; a consulta nasce ligada aos dois.
4. A parede: tudo que o paciente contou entra no CRM do médico; para o negócio sai anonimizado; pharma compra atenção do médico, nunca conteúdo do paciente; sigilo entre médicos por autorização do paciente.
5. Guardamos tudo; áudio por cota ("indisponível", nunca "apagado"); texto para sempre.
6. Custo: transcrição sai da API (aparelho do médico); redação em Gemma/Qwen nos minis com API de reserva; Gemini como reserva e como "pago".
7. Semana 1 é medição (iPhone e mini).
8. Advogado antes de pharma e do banco anonimizado (4 perguntas).
9. Resgate de janeiro: convite pelo telefone sem prêmio; painel nas primeiras 25 consultas e depois congelado; mensal daqui em diante, anual libera o período sem pagar; momentos Pro; espaço vende acesso imediato; a dica na tela; degustação de uso pessoal; oferta do Pro sem eufemismo; 30 h/mês na abertura sem os R$ 25 mil; Cérebro = "pergunte ao histórico, ache o trecho, exporte a prova" (fase 2); todas as profissões de saúde; área jurídica futuro. **[v5.1]** Exportação em todo plano (emenda 24); paciente não vê áudio na tela, mas o obtém sob pedido (emenda 25).
10. Nome: Helena. **[v5.2]** O Theo deixou de ser "ligação futura": com a agenda paga e a venda pelo app, mais da metade do potencial passa por cobrar e receber. Decisões 34–35.


## 13. O mundo da Helena (o ecossistema)

Cinco desenhos em `mundo-da-helena.html`. Em texto:

**Os atores e a linha de cada um.** *Quem usa* (médico, secretária, paciente, dependentes): nunca se sentir vigiado; nunca perder o próprio dado (exportação). *Quem paga* (indústria, farmácia/rede, laboratório, plano de saúde, Método 3A): nunca conteúdo do paciente; nada em nome do médico; sem comissão por receita. *Quem regula* (CFM/CRO/CRP, ANVISA, ANS, ANPD, CDC): cada um tem uma resolução que já derrubou uma decisão nossa. *Quem fornece* (Meta, Apple e Google, Google Cloud/Vertex, Supabase/Vercel, Mac minis, Asaas): podem mudar preço e regra sem avisar; ter mais de um caminho. *Quem concorre* (Noa/Doctoralia, ByDoctor/Amplimed/Feegow, Memed como aliada ou rival, Abridge/Nuance nos EUA): o que não copiam sem se canibalizar é dar de graça e ter o paciente.

**Por onde passa o dinheiro:** de cima, os que pagam (médico; indústria; farmácia e laboratório, valor zero até existir; plano; M3A; médico vendendo pelo app), cada um rotulado benchmark/chute/zero. Embaixo, para onde vai: IA e armazenamento (R$ 15/médico/ano), equipe (1 em 1.000; 8 em 10 mil), Meta (R$ 0,037 por mensagem iniciada; zero pelo app), infra (~R$ 3 mil/ano) e taxa de pagamento (~2 %), Apple/Google (15–30 % no app nativo), impostos (13–19 %).

**Por onde passa o dado, e a parede:** dentro (identificado, com dono e consentimento): prontuário do médico (controlador; 20 anos; exportável), histórico do paciente (controlador: a Helena; consentimento em camadas), CRM (o paciente pode ler), dados do celular e relógio (só cuidado), compartilhar entre médicos (só com o sim, com log), áudio identificado (cota + 12 meses; ao titular sob pedido). *Nunca sai:* identificado, dado de dispositivo, conteúdo do paciente para segmentar, voz. A parede = anonimização medida (k-anonimato, nomes tirados do texto, combinação rara revisada; voz nunca). Fora (não é mais dado pessoal): agregado do médico, evidência do mundo real por estudo com comitê de ética, IA própria treinada só no anonimizado com teste de memorização, canal pharma = atenção do médico por especialidade. Sem conta do paciente, nada desce.

**Uma consulta do começo ao fim, e onde a Helena está no meio:** o médico grava (Helena: prontuário, grátis) → revisa e assina (um toque; assinatura digital no roadmap) → o paciente recebe (versão simples, lembretes) → o paciente faz o que o médico mandou (farmácia, laboratório: hoje fora; amanhã serviço que ele escolhe) → o paciente volta e paga (agenda o retorno e paga pela Helena; Theo recebe; falta cai) → o médico enxerga o consultório (painel, CRM, dica na tela) → a base cresce (o paciente puxa o próximo médico). A Helena não inventa transação: se coloca no meio das que já existem.

**Como o mercado ganha dinheiro, e onde a Helena se coloca:** assinatura pelo médico (Noa R$ 199, ByDoctor, Amplimed, Freed, Heidi, Nabla: margem 90 %, sem incentivo a baixar preço); contrato com hospital vendido pelo faturamento (Abridge, Nuance, Suki, Ambience); grátis para o médico pago pela indústria (Doximity, OpenEvidence, Memed, PEBMED: anos até lucrar); marketplace na receita (Memed: exige assinatura digital e regra do CFM); plataforma do paciente com o médico dentro (Doctoralia, apps de plano). **A Helena junta o terceiro com o quinto e tira o primeiro:** grátis para os dois, com o paciente dentro, vivendo do resto.

**O tamanho do campo:** ~600 mil médicos; > 2 milhões de profissionais que fazem consulta; ~150 consultas por médico por mês; ~1 bilhão de consultas/ano só de médicos (estimativa grosseira); ~100 pacientes com conta por médico ativo; Noa 30 mil pagantes no mundo e 1 mi de consultas no Brasil; Memed 150–210 mil médicos; um médico ativo vale R$ 763/ano no regime (base v3.1).

**Pagamentos (pesquisado 10/09):** Asaas: Pix R$ 1,99 (100 grátis/mês), cartão 2,99 % + R$ 0,49, split e subcontas nativos. Stripe Brasil: cartão 3,99 % + R$ 0,39, Pix 1,19 % (por convite). Doctoralia usa Stripe Connect (conta conectada por médico), comissão não pública, repasse de cartão ~30 dias, e prende quem contrata pacote com Pagamentos. Helena: Pix padrão, cartão com taxa mostrada, repasse no dia seguinte, taxa pública, opcional.

## Fica como histórico (não volta)

**[v5.1] Também ficam como histórico, derrubados pelos sete:** "sem exportar dados"; áudio "indisponível" sem prazo com resgate pago por atendimento; comissão por receita/exame/lead em nome do médico; a dica dentro do PDF com os números do médico e indústria por queixa; transcrição no aparelho e minis como decisão (viraram hipótese com gate); modelo de 36 meses com Pro R$ 47 e 7 %.

Gravar pelo WhatsApp; 3 transcrições por dia após trial; preços R$ 147/247/397; apagar áudio em 24 h; Cérebro Pro com Opus; RTX 4090 alugada; prêmio de "+3 dias" por indicação; cortar no dia 3; tabela pública de resgate de arquivo (R$ 149/399); "cada mês pago abre 3 meses"; trava de exportação.
