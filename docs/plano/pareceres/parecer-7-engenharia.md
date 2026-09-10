# Parecer 7 — Engenharia de IA, infraestrutura e segurança

## Nota geral (0 a 10) e uma frase de veredito
**6/10.** Gravador e disciplina de medir são de primeira; a tese de custo (R$ 1/médico) e a parede de dados dependem de duas apostas não medidas (ASR no aparelho, minis sem equipe) e de retenção/segurança que não sustentam a promessa.

## O que está certo (até 5 pontos, com o porquê)
1. **Gravador v2 em pedaços com fila offline** (gravador-v2.md): corte na pausa, sobreposição, costura, IndexedDB, perda ≤ 30 s. Desenho certo para 4G ruim e consulta de 1h30.
2. **Régua "conserto + confissão"** (MODELOS-PRONTUARIO): "de pirona → dipirona *e* confessar" é a métrica certa para scribe clínico; "MoE de poucos ativos e derivados reprovam no remédio" é reproduzível.
3. **Custo medido, não estimado**: R$ 0,06/consulta e 3,5 s no 3.7 sem pensamento vieram de `usageMetadata`.
4. **Vigia por evento e trava com dois "não"**: controla custo e abuso sem IA por minuto; "na dúvida = clínico" erra para o lado seguro.
5. **Admite o que falta** (§5; "n=2 é filtro, não veredito") e põe medição na Semana 1.

## O que está errado ou perigoso (até 5 pontos, específicos, citando a parte do documento)
1. **"Transcrição no aparelho (R$ 0)" está como decisão (§4, §12.6) e é hipótese.** O pipeline atual depende do que o aparelho não dá: diarização MÉDICO/PACIENTE/OUTRO (Gemini áudio), a "dica" que virou "lasartana" em losartana, os dois níveis de Whisper. SpeechAnalyzer/WhisperKit em pt-BR com ruído, sem vocabulário médico nem quem-falou, tende a render texto pior; "quem falou" é diferencial contra o Noa (§9). Android: WhisperKit é só Apple; whisper.cpp em aparelho médio esquenta e drena bateria. PC de clínica: sem GPU; a Web Speech API do Chrome manda o áudio ao Google.
2. **Minis "sem equipe" (§4; §8 "sem equipe/suporte").** Pelos próprios números (40/h, 10 h flat) são 17 minis para 1.000 médicos; consulta concentra em ~8 h com pico, e a fila do grátis estoura a "~1 h". Ninguém listou: quem troca fonte/disco, atualiza macOS/MLX sem quebrar o modelo, monitora, faz plantão; onde ficam (residência = dado sensível sem controle físico nem SLA de link/energia); a fila quando um cai. Gemma 4 31B no mini **não foi medido** (o 27B rodou em MacBook com swap).
3. **Régua frágil (§5):** 1 transcrição, 5 termos, 2 rodadas a temp 0,2. Entre 22 aprovados com n=2 há falsos positivos (o doc admite); aprovar Gemma/Qwen assim é sorte. E o "1 minuto" do Pro (§6) segue em API: o pagante não custa R$ 1.
4. **"Guardamos tudo; apagado não existe" (§6, §7, decisão 6)** junta o pior dos dois lados: áudio sem prazo (voz é biométrico, dado sensível) de pacientes que **nunca criaram conta** (aviso falado é notícia, não consentimento; "tutela da saúde" cobre o médico, não o dataset/pharma), "indisponível" para o médico e disponível para nós. Em incidente, vaza tudo. O gravador-v2 estima ~R$ 350/mês acumulando por mês de áudio a 400 médicos; Supabase Storage não é cold storage.
5. **Telefone como única identidade + OTP, sem exportação (§2; decisão 15).** SIM swap e número reciclado entregam o histórico do paciente e todos os pacientes do médico a quem tiver o chip. "Sem exportar" colide com portabilidade (LGPD art. 18) e com o dever do médico de guardar prontuário (CFM). §8 ainda modela Pro a R$ 47 e custo R$ 0,80; §6 diz R$ 77, §4 diz R$ 1.

## O que falta e ninguém pensou (até 5)
1. **Versão de modelo muda por baixo.** "Gemini 3.7 flash" hospedado é alvo móvel; a régua tem que rodar em CI a cada versão, e o prontuário deve gravar modelo+versão (como `gravacao_pedacos.modelo` já faz).
2. **PWA no iOS não grava com tela bloqueada.** Safari suspende AudioContext/MediaRecorder com tela trancada ou troca de app; "gravação em segundo plano que não cai" (potencial §1) exige nativo. Push só com PWA instalado. HealthKit/Health Connect só nativo, e a Apple proíbe dado HealthKit em publicidade: a "dica" tem que provar isolamento.
3. **WhatsApp Business API.** Lembrete de "quando voltar" nunca coube na janela de 24 h (sempre foi template pago); 01/10 muda o resto. Faltam: verificação da Meta, número único ou um por médico ("no nome do médico" só funciona por médico), aprovação de templates, rating de qualidade/bloqueio por denúncia, política da Meta sobre remédio de receita.
4. **IA própria memoriza.** Treinar nos textos (mês 24) sem teste de extração recria o dado identificado no modelo.
5. **Sem plano de incidente nem trilha imutável.** Quem notifica a ANPD (art. 48), em quanto tempo, com que log append-only de "quem viu o quê"; backup/restore testados fora do Supabase (20 anos de guarda).

## Recomendações concretas (até 5, acionáveis)
1. **Semana 1 vira gate binário.** Ditado no iPhone com as 2 gravações reais **e** 10 novas de 3 especialidades, comparado por WER e pelos 5 termos contra o pipeline atual. Sem diarização e dica, avaliar híbrido: aparelho transcreve o papo ("modo espera"), servidor a consulta. Só depois escrever "R$ 1".
2. **Régua v2.** 20–30 consultas reais (ruído, dentista, psicólogo), 5 rodadas, itens pontuados por clínico cego (remédio, dose, alergia, invenção), intervalo de confiança; em produção, amostra semanal revisada.
3. **Minis como piloto, não plano.** 2 minis em escritório/colocation com UPS, link dedicado, monitoração e runbook; medir Gemma 4 31B em lote 1/4/8. Recalcular o "R$ 1" com depreciação, link, energia e plantão (estimativa minha: R$ 3–8/médico/mês); API com DPA (gpt-4.1-mini, Mistral, Vertex) como caminho principal até o piloto provar.
4. **Retenção defensável.** Áudio identificado com prazo (cota + N meses, depois só transcrição), cold storage com chave por tenant, `deleted_at` real. "Guardar tudo" só do que passou por anonimização medida: k-anonimato, datas deslocadas, NER de nomes em texto livre, revisão de combinação rara (especialidade + cidade + doença). Quinta pergunta ao advogado: base legal do paciente sem conta.
5. **Segurança mínima antes do beta.** OTP + passkey para o histórico; bloqueio de 72 h após troca de chip; log de acesso append-only; backup diário fora do Supabase com restore testado; exportação PDF/JSON para o médico; rotacionar chaves expostas em docs/config.

## Perguntas que eu faria ao Rodrigo antes de continuar (até 3)
1. Qual endpoint Gemini está em produção (AI Studio vs Vertex) e há DPA assinado cobrindo dado de paciente?
2. Onde ficam os minis, quem é a pessoa de plantão, e o "R$ 500 fixo" inclui hardware, link e essa pessoa?
3. Se o iPhone perder para o servidor em termos e "quem falou", aceitamos perder a diarização, ou o custo volta a R$ 44 e o modelo financeiro é refeito?
