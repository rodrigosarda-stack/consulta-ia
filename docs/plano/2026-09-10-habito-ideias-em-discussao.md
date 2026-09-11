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

---

# Rodada 2 — 10/09/2026, fim do dia

## Os dois objetivos, na palavra do Rodrigo

1. **Fazer ele voltar todo dia.**
2. **Fazer ele gravar todo dia.**

Tudo tem que ser medido contra esses dois. Ideia que não move nenhum dos dois, cai.

## Correção importante: o médico que some NÃO é perda total

Rodrigo, 10/09: "a gente vai pegar o número dele. Isso é super difícil, conseguir um número
do médico pessoal. Na realidade esse foi o motivo principal inicial da viralização, que era
a lista. Eu não conseguia acessar o telefone do médico, eu caía sempre na secretária."

Então o médico que grava 3 vezes e some já entregou: **celular pessoal validado**, CRM,
especialidade e prova de que topa testar. O que falta é todo o resto, e o resto depende do
costume.

## O Rodrigo mudou de modelo no meio da conversa (e a mudança está certa)

- **Antes:** "a gente tem que dar um prêmio, não tem que tirar."
- **Agora:** "não é assim que funciona os sistemas. Eles bloqueiam o uso, eles limitam o uso,
  e a pessoa gosta, usa, e se ela quer mais, ela tem que pagar. Pega o ChatGPT, pega o Claude,
  pega o Manus."
- Regra que fica: **o 1º nível (gravar + prontuário) é grátis e ilimitado para sempre**,
  porque é o que faz ele entrar. Os níveis acima são limitados, e a diferença entre eles
  tem que ser **sentida muito forte**.

## O que morreu nesta rodada, e por quê (tudo do Rodrigo)

| Ideia | Por que caiu |
| --- | --- |
| Opção 1, a Helena avisa pela agenda | Depende da agenda, que não é nossa, cada médico tem a sua e muitas vezes quem controla não é ele. Tem que ser algo **nosso**. |
| Opção 2, o prontuário fica com a cara dele | É melhoria de qualidade. Não obriga ninguém a voltar nem a gravar. Não move os dois objetivos. |
| Opção 4, desconto no Pro por volume | Dá desconto para quem não está pagando nada. Sem sentido. |
| Prêmio = Pro de graça (rodada 1) | Quem usa muito bate a meta e nunca paga; quem usa pouco não ia pagar. O Pro para de vender. |

## MELHOR IDEIA ATÉ AGORA (guardada a pedido do Rodrigo, 10/09)

> "Interessante. O caminho melhorou, mas ainda não é isso. Guarda essa ideia, a melhor ideia,
> por enquanto."

**Cota diária de Cérebro, que zera todo dia e que ele enche gravando.**

- Gravar e receber o prontuário: **grátis, ilimitado, nunca tocado.**
- A Helena que **sabe sobre os pacientes dele** é o que fica limitado.
- Todo médico ganha ~3 perguntas por dia, de graça.
- **Gravou uma consulta hoje → ganha mais perguntas hoje.** Gravou cinco → pergunta o dia inteiro.
- Acabou a cota e ele quer mais agora → paga.

Por que serve: **a cota zera todo dia** (objetivo 1, voltar todo dia) e **gravar é o jeito de
enchê-la** (objetivo 2, gravar todo dia). É a mecânica do Manus/ChatGPT com a moeda certa:
a moeda não é a gravação, é a inteligência em cima do que ele gravou. E o teto dói no momento
certo, logo depois da primeira resposta boa.

**Segundo motivo de abrir todo dia, e esse é 100 % nosso, sem depender de agenda de terceiro:**
a **fila de pendências tirada das próprias gravações**. "Pedi ressonância para 3 pacientes esta
semana e nenhum voltou." "A Maria era para retornar em 30 dias e já faz 45." "O João parou o
remédio." Não existe em lugar nenhum hoje, é dinheiro na mesa dele, e a fila só tem conteúdo
se ele gravou.

**Status:** o Rodrigo achou o caminho melhor, mas ainda não é isso. Continua aberto.
