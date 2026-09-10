# Decisões de produto — 09/09/2026

Aprovadas pelo Rodrigo sobre as páginas "Projeto Helena" e "Resgate de janeiro". Detalhe e contexto em `docs/plano/2026-09-09-especificacao-v5-helena.md`.

| # | Decisão | Porquê |
|---|---|---|
| 1 | Nome do produto: **Helena** | Nome da filha do Rodrigo. Código/URLs ainda dizem MarIA. |
| 2 | Grátis sem limite para consultas de saúde; monetização por base (serviços M3A, pharma, dados, IA própria) | Estratégia de abril reafirmada: "de graça, disruptivo, monetizar por outras vias". |
| 3 | Lado do paciente sempre grátis, construído antes dos extras pagos | É o motor viral (paciente puxa o próximo médico) e a defesa contra o Noa. |
| 4 | Identidade = telefone para médico e paciente | Resolve "Ana vs Ana Paula" e liga a consulta aos dois lados. |
| 5 | A parede: identificado fica dentro (CRM do médico, histórico do paciente); para o negócio sai anonimizado; pharma compra atenção do médico | LGPD art. 11/12; Memed e OpenEvidence fazem assim. |
| 6 | Guardamos tudo; áudio além da cota fica **"indisponível"**, nunca "apagado" | Áudio é produto (espaço/proteção jurídica) e ativo (dataset). Dizer "apagado" e guardar seria contradição. |
| 7 | Espaço "tem ou não tem": sem tabela de resgate, sem "arquivo" na tela; resgate só por atendimento, sem garantia, com custo | Se anunciar resgate, ninguém compra espaço. O dinheiro está nos R$ 9,90. |
| 8 | Painel de gestão vivo nas primeiras **25 consultas**, depois congelado; atualizar = Pro | Gatilho por consultas, não por dias (14 dias podem não gerar dado). |
| 9 | Mensal = Pro daqui em diante (o que grava pagando é dele); anual recorrente = libera o período em que não pagava | Fecha o "malandrão" com uma regra simples. |
| 10 | Momentos Pro: 25 primeiras consultas; paciente que volta; fim do mês por 24 h; 7 dias a cada 50 consultas; fila todo dia | Experiência do Pro sem acesso pleno; sem tela borrada; sem tirar o grátis. |
| 11 | Indicação médico→médico sem prêmio; conta só quando o indicado grava consulta real | Prêmio em Pro não converte quem nunca pagará; evita conta falsa. |
| 12 | A dica no fim do prontuário é a mídia, com os números do médico; rodízio Pro / M3A / indústria | Momento de atenção total; R$ 0,02 por dica. |
| 13 | Uso pessoal: primeira gravação não-saúde é degustação com botão do Pro; depois tranca | Converte melhor que bloquear; custo por tentativa R$ 0,29 → 0,02. |
| 14 | Oferta do Pro sem eufemismo: lista o que o grátis não tem | "Só demora um pouquinho" não vende. |
| 15 | **Sem opção de exportar dados** em nenhum plano | Decisão do Rodrigo. |
| 16 | Paciente não vê áudio nem prontuário técnico; só a versão simples | Médicos odiariam; gravação deixaria de acontecer. Pedido formal LGPD/CFM é manual. |
| 17 | Transcrição sai da API (aparelho do médico); redação em Gemma 4 31B / Qwen 27B nos minis; API com DPA de reserva | Custo por médico R$ 44 → ~R$ 1. Condição: medir ditado no iPhone e Gemma no mini. |
| 18 | Só pesos oficiais de modelos; nenhum MoE de poucos ativos para o prontuário | 4/4 MoE e 3/3 derivados reprovaram na régua (remédio). |
| 19 | Advogado LGPD/ANVISA antes de pharma e do banco anonimizado | Anonimização, DPAs, consentimento do paciente, palavra "indisponível". |
| 20 | Cérebro = "pergunte ao histórico, ache o trecho, exporte a prova" (fase 2); todas as profissões de saúde; área jurídica futuro; ligação com o Theo futura | Resgate de janeiro adaptado. |
| 21 | Escada de preço: Rápido R$ 27 (só velocidade), Pro R$ 77 (gestão; anual R$ 770 libera o passado), Clínica 2+ médicos por volume | Rápido cadastra o cartão; distância de ~3× entre degraus; Rápido nunca ganha gestão. |
| 22 | Canais: WhatsApp para entrar e garantir; app para viver. A janela grátis de 24 h da Meta acaba em 01/10/2026; PWA instalável é a primeira entrega; nativo na fase 2 | Pelo WhatsApp o canal custaria ~R$ 400/médico/ano, 25× a IA. |
| 23 | Onze portas de receita e sete compradores (médico, farmácia, laboratório, indústria, plano de saúde, M3A; SUS fase 3); plano de saúde nunca vê a consulta | Estudo "Potencial da Helena" (docs/plano/potencial-helena.html). |

## Emendas de 09/09 (noite), após o parecer dos sete especialistas — aprovadas pelo Rodrigo ("já emenda as propostas")

| # | Emenda | Substitui | Porquê |
|---|---|---|---|
| 24 | **Exportação em todo plano**, para médico (PDF em lote + JSON) e paciente (histórico simples em PDF). Ao cancelar o anual fecha só o painel do período sem pagar; ficha e prontuário nunca fecham. | 15 | LGPD art. 18 II/V e 19; guarda de 20 anos (Lei 13.787, CFM 1.821); CEM art. 88; CDC 51. Seis dos sete apontaram. |
| 25 | **Áudio com prazo e finalidade escritos:** identificado por cota + 12 meses, depois só transcrição; áudio ao titular grátis sob pedido em 15 dias; "guardar para sempre" só do que passou por anonimização medida; espaço vende **acesso imediato**. Palavra "apagado" continua fora; "indisponível" só com prazo escrito. | 6, 7 | LGPD 6 I/III, 11, 15–16, 18 VI; CDC 39 V; voz é biométrico; raio de dano em incidente. |
| 26 | **Receita, exame e leads sem comissão por receita/encaminhamento e nada em nome do médico.** Viram serviço que o paciente escolhe (programa de desconto de laboratório / PSP, farmácia como assinante de plataforma), só depois da assinatura digital e do parecer. **Valor zero no modelo até existir.** | 23 (portas) | CEM 68/69; LGPD 11 §4º; CFM 2.299 (sem ICP-Brasil a farmácia não dispensa); contradizia o Pro. Cinco dos sete. |
| 27 | **A dica só na tela, nunca no PDF/prontuário;** identificada como publicidade, com "dispensar"; até 5 mil médicos só Pro e M3A; indústria **por especialidade** (gatilho ~2.000 CRMs), **nunca por queixa ou diagnóstico**; 1 dica a cada 5 prontuários; medir clique e "dispensar". Números do médico só em "seu mês em números", opt-in. | 12 | CFM 1.821 (prontuário é documento); CDC 36; MLR da indústria reprova adjacência; "nunca se sentir vigiado". Quatro dos sete. |
| 28 | **Identidade = telefone, com dependentes (um número, N pessoas), perfil de secretária, passkey e bloqueio de 72 h após troca de chip.** | 4 | LGPD art. 14 (menores); SIM swap; quem opera o consultório é a recepção. Cinco dos sete. |
| 29 | **Consentimento em camadas na conta do paciente** (prontuário → histórico e lembretes → anonimização e treino, destacado e revogável). **Sem conta do paciente, a gravação serve ao médico e ponto:** não entra em anonimização, dataset nem treino. Aviso falado vira "gravação em curso; detalhes em [link]". Mapa controlador/operador por fluxo + DPAs (Vertex, Supabase, Meta) antes do piloto; DeepSeek fora. RIPD e encarregado. | 5 (complementa) | Aviso falado não é consentimento (LGPD 8 §1º, 9); 11 I; 33; 38/41; 39. |
| 30 | **Versão simples ao paciente só após revisão de um toque do médico;** dose com dúvida vira "confirme com o consultório"; rodapé fixo "mensagem automática da Helena · urgência: ligue X"; resposta do paciente cai numa caixa do consultório com prazo. | — (novo) | Orientação escrita é ato médico; 110 de 167 modelos erram remédio. |
| 31 | **Transcrição no aparelho e minis passam de decisão para hipótese com gate.** Semana 1 = gate binário (WER + 5 termos, 12 gravações de 3 especialidades, contra o pipeline atual; avaliar híbrido aparelho no "modo espera" + servidor na consulta). Minis = piloto de 2 máquinas com UPS e runbook; API com contrato (Vertex/GPT-4.1 mini/Mistral) como caminho principal até provar. Custo por médico assumido R$ 3–8/mês até medir. | 17 | Diarização e "dica" não existem no aparelho; PWA no iOS não grava com tela bloqueada; ninguém listou plantão/local/UPS. |
| 32 | **Ordem de ataque:** beta de papel com 10 médicos do 3A (versão simples mandada à mão, 2 semanas) e advogado **antes** de construir o lado do paciente. Régua v2 com 20–30 consultas e 5 rodadas. Assinatura digital (ICP-Brasil) entra no roadmap do Pro; até lá, a Helena se apresenta como rascunho que o médico leva ao sistema dele. | 11 (ordem) | Perguntar antes de construir; sem assinatura é anotação, não prontuário. |
| 33 | **Modelo financeiro v3:** cada porta rotulada medida / benchmark / chute; receita, exame e leads valem zero; pharma R$ 50–150/médico/ano por especialidade; venda pelo app é chute (mantida, rotulada); coorte com retenção, impostos e taxas; múltiplo de baixo dígito até prova. Espaço e Réguas são add-ons (a escada continua com três degraus). Modelo de 36 meses corrigido para Pro 77 / 3 %. | — | Investidor, produto, pharma. |
| 34 | Porta 12: **agenda e pagamento da consulta pela Helena** (o paciente agenda o retorno e paga antes; Theo recebe; 3 % líquido; falta cai). Chute: 10 % das consultas, R$ 162/médico/ano no regime. Cobrar consulta é limpo no CFM; nunca "pacote com cobertura" (ANS). | — | Rodrigo, 10/09: "ele pode inclusive cobrar o paciente; o paciente agenda já por ali". É a agenda da Doctoralia, chegando pelo retorno, não pela busca. |
