# Hábito do médico — ideias EM DISCUSSÃO

> **NADA AQUI ESTÁ APROVADO.** Rodrigo, 10/09/2026: "segura essas ideias, não jogar fora,
> mas não vamos dar como aprovado, a gente vai discutir mais."
> Este arquivo é o caderno da discussão. Quando algo for decidido, vira emenda em
> `docs/decisoes/2026-09-09-decisoes-produto.md` e entra na spec.

## O problema, na frase do Rodrigo

Se o médico não pega o costume de usar, ele nunca paga nada nem vira ativo para
monetizar por outra via. Hábito é pré-requisito de tudo que vem depois: pagante,
indicação, dado, audiência da dica.

## Achado que trabalha contra o plano atual

A spec v5.2 (§6, linha do painel) dá painel completo nas **primeiras 25 consultas**.
Um médico com 150 consultas/mês faz 25 em **três a cinco dias de consultório**.
A métrica de hábito do beta mede a **8ª semana**. Ou seja: o prêmio some na semana 1
e o costume é medido na semana 8, com sete semanas de nada no meio.

## Sobre o custo (levantado pelo Rodrigo, e a notícia é boa)

Os R$ 0,80/médico grátis/mês do modelo **já supõem ~150 prontuários/mês**
(spec §"a dica na tela é a mídia"). O médico com hábito custa o que já está no modelo.
Quem custa menos é quem quase não usa, e esse não vale nada.
Hábito não estoura o orçamento; hábito **é** o orçamento.
O que encarece de verdade é o lado do paciente (mensagem da Meta a partir de 01/10/2026),
e para isso a resposta já decidida é o app instalável com aviso.

## Bloco A — as sete de 10/09 (minhas, não aprovadas)

1. **Agenda do dia como botão de gravar.** Lista da manhã, cada nome é um botão; tocar
   já grava e já amarra ao paciente. Aproveita a agenda da porta 12. Se não houver
   agenda, a secretária digita a lista ou manda foto.
2. **Botão de começar na mão da secretária.** "Pode entrar, doutor" já acontece toda vez;
   ela toca em "começou" e abre a gravação na tela dele. Depende do perfil de secretária
   (semanas 3–6 do plano).
3. **Painel vivo enquanto grava** (em vez das 25 consultas). Gravou na semana, painel vivo;
   parou, congela; voltou, descongela na hora. **Mata a regra das 25 consultas do resgate
   de janeiro — decisão do Rodrigo.**
4. **Revisão humana nos 10 primeiros prontuários de cada médico.** ~2 min cada, ~20 min por
   médico, uma vez. Em 120 médicos, ~40 h diluídas na rampa. Motivo: escrever à mão é grátis
   e sempre disponível, então um prontuário ruim na semana 1 não custa nada para abandonar.
   Vira amostragem quando a régua dos 5 termos segurar em campo.
5. **O paciente como trava.** Nada novo para construir; é o lado do paciente já previsto.
   O que muda é a pressa: depois de 3–4 consultas o paciente espera o resumo, e o médico
   que parar tem que explicar. Única pressão que não vem da gente.
6. **Aparecer só nos dias de consultório.** Aprender os dias das últimas 4 semanas.
   Cutucar quem não atende naquele dia vira silenciar, e Helena silenciada é Helena morta.
7. **Medir o buraco, não a média.** 20 consultas na semana 1 e nada nas 3 seguintes dá
   média 5/semana e parece saudável. Acompanhar: dias desde a última gravação e maior
   intervalo do próprio médico. Passou do normal dele, dispara resgate.

Prioridade sugerida (não aprovada): 3 e 5 primeiro (custam quase nada, mexem no que pesa);
4 é a mais cara e a que mais protege o começo.

## Bloco B — a ideia do Rodrigo, inspirada no Manus (10/09)

**O que o Manus fazia:** bonificação por usar **todo dia** + bonificação por **indicar**.
O memorando de janeiro sobre o Manus trouxe prova social pública e escassez controlada,
mas **deixou de fora justamente a bonificação por uso** — e é essa que o Rodrigo quer.

**Contribuição do Rodrigo:** para continuar ganhando mais, ele tem que gravar mais.

**O nó a resolver:** a gravação é ilimitada e grátis por decisão
("o grátis nunca acaba"; "grátis de verdade é a única posição que o Noa não copia").
Se a moeda for gravação, é preciso **primeiro tornar a gravação escassa**, o que
contradiz a posição central. Então a moeda tem que ser outra coisa. Ver Bloco C.

## Bloco C — ideias de moeda (minhas, para a discussão)

- **Moeda = tempo de Pro.** Uma só moeda, duas formas de ganhar (gravar e indicar),
  como no Manus. Gravou na semana → painel da semana; 50 no mês → o mês; indicou e o
  colega gravou → um mês. O núcleo grátis nunca é tocado.
  Risco a decidir: se Pro é sempre ganhável, quem paga? (Parecer do investidor: base é o
  negócio, conversão 3 %. Possível teto: o ganho cobre gestão, não Clínica nem o pesado
  do Cérebro.)
- **Moeda = o que realmente custa.** Cérebro/RAG, armazenamento de áudio, réguas
  (mensagem custa dinheiro), exportação. Escassez honesta, porque de fato pesa na conta.
  Ex.: cada consulta gravada dá N perguntas ao Cérebro.
- **Moeda = capacidade de laço.** Gravar libera vagas de régua (add-on R$ 29,90),
  ligando o uso diretamente ao que dá dinheiro ao médico (paciente que volta).
- **Só status (sequência), sem nada material.** Barato, funciona em alguns perfis,
  fraco sozinho.

## Bloco D — cuidados que a discussão tem que levar em conta

- **Cadência diária não serve.** Manus fala com quem senta na mesa todo dia; médico atende
  2 a 5 dias por semana. Sequência diária pune comportamento normal. A unidade tem que ser
  a **semana** ou o **dia de consultório**.
- **Pontuação em medicina tem cara ruim.** "Ganhe pontos gravando consultas" pode ser lido
  como incentivo a gravar por prêmio, não por cuidado. Checar com o advogado junto das
  outras 5 perguntas.
- **Ganho por indicação já foi derrubado uma vez** (decisão de 09/09: prêmio em Pro não
  converte quem nunca vai pagar). O Bloco C reabre isso de outro jeito: o prêmio deixa de
  ser só da indicação e passa a ser do **uso**, com a indicação alimentando o mesmo medidor.
  É reabertura consciente, precisa de decisão explícita.

## Como isso conversa com o que já está decidido

| Já decidido | O que estas ideias mexem |
| --- | --- |
| Painel congela nas primeiras 25 consultas | Bloco A.3 troca por continuidade semanal |
| Sem prêmio por indicação (09/09) | Bloco C reabre como medidor único de uso + indicação |
| Grátis ilimitado, nunca acaba | Nenhuma ideia toca nisso; a moeda é sempre o pago |
| Momentos Pro | Compatível: vira o mesmo medidor, em vez de gatilhos soltos |
| Beta: hábito na 8ª semana ≥ 50 % | A.7 acrescenta "maior intervalo sem gravar" |
