# Parecer 3 — Advogado (LGPD, CFM, ANVISA, ANS, CDC)

## Nota geral (0 a 10) e uma frase de veredito

**4/10.** A "parede" está certa em tese e o núcleo é defensável, mas quatro decisões escritas — sem exportar, áudio "indisponível" com resgate pago, comissão de farmácia sobre receita e DeepSeek sem DPA — são ilícitas ou de alto risco, e a espec não define quem é controlador de quê.

## O que está certo (até 5 pontos, com o porquê e a norma)

1. **A parede.** Dado de saúde é sensível (LGPD art. 5º II); só sai como anonimizado (art. 12), e a vedação de uso compartilhado de dado de saúde para vantagem econômica (art. 11 §4º) deixa de incidir.
2. **"Remédio de receita só se anuncia para médico"** (potencial §3). Alinha com Lei 9.294/96 art. 7º §1º e RDC ANVISA 96/2008 (propaganda de medicamento sob prescrição só para prescritores).
3. **"Plano de saúde nunca vê a consulta; só agregado ou guia"** (decisão 23). Atende art. 11 §4º e §5º.
4. **Sigilo entre médicos por autorização do paciente, com registro de quem viu** (§2). Exigido por CEM (Res. CFM 2.217/2018) arts. 73 e 85 e art. 46 LGPD.
5. **"O que eu interpretei" + médico revisa e assina.** Médico segue autor do prontuário (Res. CFM 1.638/2002; CEM art. 87).

## O que está errado ou perigoso (até 5 pontos, específicos, citando a parte do documento e a norma)

1. **"Sem opção de exportar dados em nenhum plano" (decisão 15; §6).** Paciente: viola art. 18 II (acesso), V (portabilidade; regulamentação ANPD — verificar) e art. 19 II (cópia completa em 15 dias). Médico: ele responde pela guarda do prontuário por 20 anos (Lei 13.787/2018 art. 6º; Res. CFM 1.821/2007); sem exportação, se sair ou a Helena fechar, infringe CEM art. 87/88 por culpa da plataforma. Cláusula abusiva (CDC art. 51 IV). O PDF por consulta mitiga, não resolve.
2. **Áudio "indisponível", "a palavra apagado não existe", resgate "sem garantia, com custo" (§6; decisões 6–7).** Guardar "porque é o ativo (dataset)" é finalidade nova sem base — dado sensível não admite legítimo interesse (art. 11) — e viola arts. 6º I/III e 15–16. Cobrar para acessar peça do prontuário, que o paciente tem direito de obter (art. 18 II; CEM art. 88), é CDC art. 39 V. "Indisponível" só é lícito com prazo e finalidade escritos, acesso gratuito sob pedido e eliminação a pedido (art. 18 VI).
3. **"Receita vira compra" com comissão de farmácia (maior porta) e "exame vira agendamento".** Enviar receita a farmácia "padrão" que paga pelo fluxo é comunicação de dado de saúde para vantagem econômica (art. 11 §4º); a exceção cobre assistência farmacêutica em benefício do titular, não farmácia pagando pela receita. CEM arts. 68 e 69 vedam ao médico interação com farmácia e vantagem por encaminhamento ou comercialização de medicamento; mesmo com comissão na Helena, é o Dr. João quem "manda a receita pelo app dele". "Leads a R$ 20" cai no mesmo art. 69.
4. **DeepSeek "sem DPA" como aprovado (§5); Gemini em produção.** Áudio identificado a operador sem contrato viola art. 39; host fora do Brasil exige art. 33 (Res. CD/ANPD 19/2024 — verificar). China não tem adequação. Gemini e Supabase: verificar região e DPA. Sem contratos, a parede não existe.
5. **Papéis e consentimento (§7).** No prontuário identificado o controlador é o médico (art. 11 II "f", tutela da saúde) e a Helena é operadora. Em histórico cruzado, CRM "Conexão/Sobre a pessoa", anonimização e treino, a Helena é controladora e precisa de consentimento específico e destacado (art. 11 I). O aviso falado não é consentimento (arts. 8º §1º e 9º) e omite quem guarda, por quanto tempo e que sai anonimizado. CRM "sem filtro de assunto" viola necessidade (art. 6º III).

## O que falta e ninguém pensou (até 5)

1. **RIPD e encarregado** (arts. 38 e 41). Não aparecem.
2. **Menores e incapazes** (art. 14): "identidade = telefone" quebra quando o telefone é da mãe.
3. **Voz é biometria; anonimizar texto não anonimiza áudio.** Combinação rara reidentifica (art. 12 §1º). Guia ANPD "ago/2026" — verificar existência.
4. **Meta como operadora e incidente.** Mensagem com "remédio, dose" passa pela Meta (art. 33); telefone errado é incidente notificável (art. 48).
5. **Outras profissões.** CRO, CRP (Res. CFP 11/2018), nutri, fisio têm regimes próprios de prontuário e sigilo.

## Recomendações concretas (até 5, acionáveis)

1. **Reescrever decisões 15 e 6/7 antes da Semana 2:** exportação (PDF em lote + JSON) grátis em todo plano; áudio ao titular grátis sob pedido em 15 dias; áudio além da cota retido por prazo definido ou eliminado. Espaço vende **acesso imediato**, não acesso.
2. **Mapa controlador/operador por fluxo + DPAs antes do piloto:** Google (Vertex, região BR/UE), Supabase, Meta; DeepSeek fora.
3. **Consentimento em camadas na conta do paciente:** prontuário (tutela da saúde, só informação); histórico e lembretes (consentimento); anonimização/treino (consentimento destacado, revogável). Aviso falado: "gravação em curso; detalhes em [link]".
4. **Refazer farmácia/laboratório como serviço escolhido pelo paciente,** sem comissão por receita nem farmácia "padrão"; a rede paga assinatura de plataforma; nada no nome do médico. Plano contínuo do médico: submeter à ANS (Lei 9.656/98 art. 1º I; Res. CFM 1.649/2002 — verificar) antes de vender cobertura recorrente.
5. **Tirar a "dica" do documento do prontuário** (Res. 1.638/2002): anúncio na tela, identificado como publicidade (CDC art. 36), com opt-out e legítimo interesse documentado (arts. 7º IX e 10) para usar os números do médico.

## Perguntas que eu faria ao Rodrigo antes de continuar (até 3)

1. Se um médico com 2.000 consultas sair amanhã, o que ele leva — e você aceita que a resposta legal é "tudo, de graça"?
2. O áudio além da cota é guardado para quê, por quanto tempo, e quem responde se vazar: o médico ou a Helena?
3. Na "receita vira compra", quem o paciente enxerga vendendo: a Helena ou o Dr. João? Ele sabe que responde pelo CEM art. 69?
