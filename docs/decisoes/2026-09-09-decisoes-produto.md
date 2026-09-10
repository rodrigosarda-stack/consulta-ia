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
