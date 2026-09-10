# Parecer 5 — Indústria farmacêutica e mídia médica

## Nota geral (0 a 10) e uma frase de veredito

**5,5.** A tese "base grátis de médicos validados vira ativo de mídia" é correta e é o que a indústria já compra de Memed e PEBMED — mas o estudo liga a porta pharma cedo demais, precifica sem densidade por especialidade e apoia a maior receita ("receita vira compra") numa função que, na própria spec, é paga e sem assinatura digital.

## O que está certo (até 5 pontos, com o porquê)

1. **"Pharma compra atenção do médico, nunca conteúdo do paciente" (spec §7, decisão 4).** É a única frase que passa num comitê de compliance; ninguém contrata plataforma que segmenta por dado de paciente (LGPD art. 11).
2. **Comparar com Memed/Doximity/OpenEvidence, não com o Noa (spec §9).** Quem paga a conta dos três é a indústria. A Memed é a prova brasileira: grátis 14 anos, monetizada por farmácia e laboratório.
3. **Painel de pesquisa como primeira porta B2B (potencial, aprovação E).** É o produto pharma mais fácil e menos regulado: não é propaganda (RDC 96 não se aplica), o Código Interfarma permite honorário a valor justo, e o comprador precisa de amostra por especialidade, não de escala nacional.
4. **"Advogado antes de pharma" (decisão 19).** Certo: o laboratório pedirá esse parecer antes da primeira inserção.
5. **Rampa por patamar (potencial §4).** Honesto; o erro é o número, não o método.

## O que está errado ou perigoso (até 5 pontos, específicos, citando a parte do documento)

1. **Propaganda dentro do prontuário (spec §8: "A dica no prontuário é a mídia").** Prontuário é documento legal (CFM Res. 1.821/2007). Nenhum laboratório aceita peça promocional *no documento* que o médico assina: perito abre o PDF, acha "Marca X", vira caso de compliance. A dica pode existir na tela, nunca no prontuário.
2. **O rodízio "1/3 Pro, 1/3 M3A, 1/3 indústria" (spec §8) é invendável.** A indústria compra alcance e frequência garantidos por especialidade, com relatório auditado por terceiro. Slot que gira com a oferta comercial da própria plataforma ("paciente novo custa R$ 300 em mídia") cria adjacência entre medicamento e venda de marketing — o MLR (revisão médico-legal) reprova.
3. **"Receita vira compra" é a maior porta (potencial §2, R$ 360/médico/ano) e não existe no produto.** A tabela da spec §6 marca "Receita, exame, atestado, carta" só no Pro (3 % da base). E não há assinatura ICP-Brasil (CFM Res. 2.299/2021; Portaria MS 467/2020): sem ela a farmácia não dispensa antibiótico nem controlado. A conta assume ~1.000 receitas/ano para *todo* médico ativo; superestimada por fator de dez ou mais.
4. **Números pharma inconsistentes.** Spec §8: "R$ 0–40/médico/mês" (até R$ 480/ano); potencial §2: R$ 250; spec §9: "R$ 300–650". A âncora Memed (R$ 475) inclui **prescrição estruturada no fluxo**; scribe sem prescrição vende banner contextual. Estimativa minha, pelo que pago a PEBMED/Medscape por campanha de especialidade: **R$ 50–150/médico/ano**, só onde há lançamento em pipeline.
5. **RWE contradiz a parede.** Spec §7 diz "nunca conteúdo do paciente"; potencial §3 vende à indústria "evidência do mundo real", que é conteúdo do paciente anonimizado. Pode ser legal (LGPD art. 12), mas o documento não pode afirmar as duas coisas. RWE exige dado **estruturado** (CID-10, DCB, dose, desfecho), não prosa; CEP/CONEP por estudo; e o comprador (IQVIA, Close-Up, HEOR do laboratório) paga por estudo — centenas de milhares de reais por contrato (estimativa), não por médico.

## O que falta e ninguém pensou (até 5)

1. **Escala é por especialidade, não total.** Um brand manager aloca verba quando a plataforma prova, com CRM validado, uns 1.500–3.000 médicos ativos da especialidade dele (estimativa: 5–10 % dela). 10 mil profissionais espalhados por dentistas, psicólogos e fisioterapeutas valem quase zero. Quem compra: cardio, endócrino, psiquiatria, derma, gineco, pediatria, ortopedia, reumato, onco.
2. **Infra de ad-tech regulada.** Peça aprovada pelo MLR com bula, referências e registro (RDC 96); frequency cap; impressões por CRM auditáveis por terceiro; opt-out do médico; log de quem viu o quê. Nada disso está na spec.
3. **Painel de pesquisa: preço e mecânica.** Estimativa (base: o que pago a Sermo/M3/agências no Brasil): R$ 800–2.500 por entrevista completa de 20–30 min, com R$ 150–600 de honorário ao médico. O gargalo não é "2 pesquisas/ano"; é N=100–300 por especialidade, CRM e volume de pacientes validados, pagamento com RPA/NF e transparência (Lei mineira 22.440/2016).
4. **PSP/PBM é o modelo certo para "receita vira compra", não comissão de farmácia.** A indústria já paga ePharma, Funcional e Vidalink por ativação e adesão em programas de desconto; o médico cadastra o paciente. Tem verba e é permitido. "Botão de comprar remédio" com marca no app do paciente esbarra na RDC 96 (proibida propaganda de prescrição ao público).
5. **Apple Saúde/Health Connect + indústria = nunca.** O estudo diz certo, mas precisa de trava técnica e contratual: é a primeira pergunta do jurídico do laboratório.

## Recomendações concretas (até 5, acionáveis)

1. Tirar a dica do documento do prontuário; especificar um **slot de tela** com regras de mídia (frequência, MLR, auditoria) como spec separada.
2. Reescrever a porta pharma como **campanhas por especialidade** com gatilho de densidade (ex.: ≥ 2.000 CRMs validados numa especialidade) e baixar o base para R$ 50–150/médico/ano até haver prescrição estruturada.
3. Mover "receita vira compra" para **depois** da assinatura ICP-Brasil e do PSP; não contar receita para todo médico ativo.
4. Painel de pesquisa: fechar parceria com agência (Sermo, M3, Ipsos Healthcare); a Helena entrega recrutamento e validação, a agência entrega cliente e conformidade.
5. Resolver a contradição da parede num parágrafo: o que sai (agregado de médico; RWE anonimizada e estruturada, por estudo, com CEP) e o que nunca sai (identificado; dado de dispositivo).

## Perguntas que eu faria ao Rodrigo antes de continuar (até 3)

1. A dica com conteúdo de indústria aparece no PDF que o médico assina, ou só na interface? Se for no PDF, aceita retirar?
2. Quantos médicos ativos, **por especialidade**, no mês 12 e no mês 24? Sem isso nenhum laboratório atende a reunião.
3. Prescrição com assinatura digital entra no roadmap? Sem ela a Helena é scribe; scribe vende atenção, não fluxo, e o múltiplo da Memed não se aplica.
