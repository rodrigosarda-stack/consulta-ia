# Parecer 6 — Produto e growth

## Nota geral (0 a 10) e uma frase de veredito

**6/10.** A tese (grátis ilimitado, laço médico↔paciente, negócio na base) está certa e é defensável contra o Noa; mas o motor viral é hipótese não testada apresentada como cenário-base, a escada tem furos, e duas decisões (sem exportar; dica de indústria por queixa) contradizem a própria "parede".

## O que está certo (até 5 pontos, com o porquê)

1. **Grátis sem limite para saúde, negócio na base.** Contra incumbente a R$ 199 com 90 % de margem, a única posição que ele não copia sem se canibalizar é "de graça" (spec §8, Memed).
2. **Gatilho por 25 consultas, não por dias** (decisão 8). Garante que o médico viu o painel com dado dele; trial por calendário é onde freemium mais falha.
3. **"Mostra de verdade, sem tela borrada, nunca tira o grátis"** (spec §6). Evita o dark pattern que gera má fama num público que conversa entre si.
4. **"Ativo" = gravou consulta real** (resgate, item 3). Mede a ação de valor, não o cadastro.
5. **Oferta sem eufemismo + Rápido como porta do cartão** (decisões 14/21). Ataca o atrito real do primeiro pagamento: o cartão, não o preço.

## O que está errado ou perigoso (até 5 pontos, específicos, citando a parte do documento)

1. **O loop viral não gira na velocidade do modelo.** Spec §1: "o paciente puxa o próximo médico". Cadeia real: recebe versão simples → salva/instala → vai a *outro* médico (de memória, 2–4 consultas/ano) → *pede* ao médico que use uma ferramenta (inversão de autoridade, raríssimo) → médico grava. Com 150 pacientes/mês, 60 % opt-in, 30 % engajados, 20 % em outro médico em 90 dias, 5 % mencionam, 20 % testam: ~0,05 médico novo por médico em 90 dias. **K plausível: 0,1–0,3 ao ano, ciclo de meses.** Boca-a-boca lento, não viralidade; o cenário-base (10 %/mês sem CAC) é o viral. Quebra porque o paciente não abre nada entre consultas, e o médico novo entra por colega ou secretária.
2. **Escada: 3 degraus no discurso, 5 SKUs na prática, preço inconsistente.** Spec §6: "três degraus, nunca quatro"; potencial-helena lista Espaço R$ 9,90 e Réguas R$ 29,90. O modelo de 36 meses (§8) usa Pro **R$ 47** e 7 %; a escada aprovada é **R$ 77** e o potencial usa 3 %. Se o "único atrito diário" é a fila, o Rápido vira o plano "suficiente" e canibaliza o Pro; o "efeito cartão" que compensaria é confessadamente não medido.
3. **"Fila até ~1 h" é atraso artificial disfarçado.** Decisão 2: "sem atraso artificial"; §4: um mini serve 60 médicos. Se há capacidade, a espera é design (diga); se não há, o grátis fica ruim nos picos. Nas duas leituras o Rápido é frágil.
4. **"Sem exportar dados" (decisão 15) é lock-in por cadeado e contradiz o mesmo dia.** Resgate item 4: "ele exporta o que tem acesso, e ponto". Somado a "cancelou o anual, aquele período fecha de novo", o médico lê "meus pacientes são reféns". LGPD art. 18 e CFM vão notar; e mata a indicação médico→médico, único canal barato sem prêmio.
5. **A dica de indústria fura a parede.** Spec §8: "nunca usa o conteúdo do paciente para escolher". Resgate item 5, exemplo aprovado: "12 pacientes com dor no joelho → conteúdo de condropatia por [laboratório]". É segmentação por diagnóstico — o "grátis vende seus dados" que a §9 lista como ataque do Noa. E "leitura ~100 %" não foi medida.

## O que falta e ninguém pensou (até 5)

1. **Retenção do médico não tem métrica**, e na consulta 26 fila, ficha e painel trancam **juntos**: cliff concentrado é o pior ponto de churn.
2. **A secretária.** Quem opera consultório é a recepção; onboarding e convite assumem médico sozinho no WhatsApp.
3. **Ordem invertida:** potencial §6 manda "perguntar aos 10 do beta antes de construir" o lado do paciente; §11 constrói nas semanas 3–6 e faz beta depois: a parte mais cara antes da pergunta mais barata.
4. **O bot exige API oficial da Meta.** "Salva meu contato senão não funciona" é gambiarra de número não-oficial, que cai em escala.
5. **Anual à vista não se vende no Brasil.** R$ 770 vira 12× no cartão; "libera o passado" precisa de regra para parcela cancelada no mês 3.

## Recomendações concretas (até 5, acionáveis)

1. **Beta de papel antes de código:** com os 10 médicos do 3A, mandar a versão simples à mão por 2 semanas. Mede opt-in do médico e reação do paciente por ~R$ 0.
2. **Fechar a escada:** Rápido 27 / Pro 77 / Anual 770 / Clínica; Espaço e Réguas são *add-ons*. Refazer o modelo com R$ 77 e 3 %.
3. **Devolver a exportação** do que ele tem acesso (item 4 de janeiro). Manter "anual libera o passado"; ao cancelar, fecha o painel, nunca a ficha.
4. **Dica:** só Pro e M3A até base ≥ 5 mil; nunca por queixa; 1 dica a cada 5 prontuários; medir CTR e "dispensar".
5. **Onboarding com valor antes do gate:** link de gravação na 1ª mensagem; "salva meu contato" na entrega do 1º prontuário. Avisar na consulta 20; escalonar a tranca (fila, depois painel).

## Perguntas que eu faria ao Rodrigo antes de continuar (até 3)

1. A fila de 1 h do grátis é capacidade real ou design? Muda o Rápido inteiro.
2. Dos 400 clientes do 3A, quantos já disseram que deixam o paciente receber a versão simples em nome deles? Se ninguém foi perguntado, metade das portas é hipótese.
3. O que "sem exportar" protege? Se é o malandrão, o anual já resolve; se é retenção, é o item mais perto de uma manchete.

---

**Cinco métricas de beta que decidem tudo (10 médicos, 90 dias)**

| Métrica | Meta |
|---|---|
| Ativação: 10 consultas reais em 14 dias | ≥ 60 % |
| Hábito: grava na 4ª e na 8ª semana | ≥ 50 % |
| Laço: médico deixa enviar versão simples / paciente salva contato ou abre | ≥ 70 % / ≥ 40 % |
| Pós-25: assina em 30 dias / queda de uso semanal após tranca | ≥ 8 % / < 20 % |
| K: médicos novos por médico ativo em 90 dias | ≥ 0,3 (abaixo de 0,1 não é viral: é vendas) |
