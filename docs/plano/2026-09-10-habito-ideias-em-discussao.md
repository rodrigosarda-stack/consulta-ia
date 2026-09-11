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

---

# Rodada 3 — 10/09/2026: a direção escolhida

> Rodrigo: **"acho que esse é o caminho."**
> Isto é **direção acordada**, não emenda fechada. Os números ainda não estão calibrados.
> Quando calibrar, vira emenda em `docs/decisoes/` e entra na spec.

## O modelo: crédito, no estilo Manus, adaptado

O 1º nível continua **grátis e ilimitado para sempre**: gravar a consulta e receber o
prontuário. É o que faz o médico entrar e é a posição contra o Noa.

O que é medido por crédito é **a Helena que sabe sobre os pacientes dele**: o painel de
gestão, perguntar sobre a própria base, relatório, mês fechado, fila de pendências,
exportação. Ele vê o **produto completo**, nunca uma versão capada com tela borrada
(compatível com a regra já decidida: "quando mostra, mostra de verdade").

## De onde vem o crédito (cinco fontes)

| Fonte | Tamanho | Acumula? | Para que serve |
| --- | --- | --- | --- |
| **Entrada** | Gordo | Sim | Ele sente o poder antes de qualquer limite apertar |
| **Diária, só por entrar** | Pequena | **Não**, zera todo dia | Objetivo 1: voltar todo dia |
| **Por gravar**, com **teto diário** | O grosso | Sim | Objetivo 2: gravar todo dia |
| **Por indicar** colega que grava a 1ª | Alto, separado, teto próprio | Sim | Motor 2, e devolve o prêmio derrubado em 09/09 |
| **Comprando** | — | — | É a receita |

## As duas alavancas que são só nossas

1. **Teto diário do que se ganha gravando.** Resolve o médico que usa muito.
   **Tem que ser por DIA, nunca por mês:** por mês ele bate no 2º dia e passa 28 dias sem
   motivo de gravar. Calibrar **um pouco abaixo do dia normal dele** (ex.: teto que fecha em
   ~6 consultas, se o típico faz 8–10), para quase todo mundo sentir que **completou** a meta.
2. **Câmbio.** Quem decide quanto o crédito compra somos nós, e dá para apertar e afrouxar
   sem mexer no número que ele vê. **É isso que resolve o buraco que matou as ideias
   anteriores:** com regra fixa, quem grava muito ganha tudo para sempre; com câmbio, o teto
   nunca fica abaixo do que ele consegue ganhar. Começar apertado e afrouxar, porque apertar
   depois gera revolta.

## O freio natural (só existe na Helena, o Manus não tem)

**Crédito só compra análise das consultas que ele mesmo gravou.** Médico com saldo cheio e
base vazia não tem o que comprar. Logo, **entrar todo dia e indicar colega nunca substituem
gravar** — e isso não precisa de regra, o produto se defende sozinho.

## O que esta direção substitui

- **A regra das 25 consultas** (spec §6): morre. Vira saldo de entrada gasto no ritmo dele.
  Some o corte seco, que era o pior pedaço: hoje o prêmio acaba na semana 1 e o hábito é
  medido na semana 8.
- **"Sem prêmio por indicação"** (decisão 09/09): reaberto de outro jeito. O prêmio deixa de
  ser tempo de Pro (que não converte quem nunca ia pagar) e passa a ser crédito, que é a coisa
  que acaba na mão dele.

## Regra de honestidade, a botar por escrito antes de construir

**O crédito só pode representar coisa que custa de verdade** (pergunta, relatório, exportação).
Se for relógio disfarçado, o dia em que um médico fizer a conta a gente perde a confiança, e em
saúde não há margem para isso. O Noa já vai atacar com "grátis vende seus dados"; não dar de
bandeja um segundo ataque. **Não chamar de minuto** — o próprio Rodrigo sentiu que fica safado.
Nome da unidade: em aberto.

## Números reais do Manus (conferidos em 10/09/2026, não presumidos)

- 1.000 créditos no cadastro · 300 por dia, **que não acumulam** · 500 por indicação.
- Fontes: https://www.getaiperks.com/en/ai/manus-credits-explained ·
  https://apidog.com/blog/manus-ai-public-free-credits/
- **Não copiar o tamanho da indicação.** 500 contra 300/dia faz uma indicação valer menos de
  dois dias de só logar. Para nós uma indicação é o celular pessoal de um médico, que é o ativo
  mais difícil do negócio. Tem que estar numa ordem de grandeza acima.

## O que falta calibrar (nada disso está decidido)

1. Nome da unidade (não "minuto", não "ponto"?).
2. Tabela de preços: quanto custa cada coisa que o crédito compra.
3. Tamanho do saldo de entrada, da diária, do ganho por consulta e do teto diário.
4. Tamanho do pacote de indicação e se o indicado também ganha.
5. Se a diária exige só entrar ou exige entrar **e** gravar.
6. O que fazer quando bater o teto todo dia virar automático e parar de motivar
   (bônus de semana fechada, extra em dia cheio) — ajuste para depois de funcionar.
7. Levar ao advogado junto das outras 5 perguntas: premiação por gravar consulta em produto
   de saúde.

---

# Rodada 4 — 11/09/2026: o que o médico ganha em cima do que gravou

> Aprovado pelo Rodrigo para registro em 11/09. Continua sendo **caderno**, não emenda:
> os números e o degrau de plano ainda não estão decididos.

Três coisas novas (A, B, C), a conversão que amarra as três (D, E), e o ciclo de melhora
com o vídeo (F, G).

## A. Perguntar pelo WhatsApp

O Cérebro já está na spec como "pergunte ao histórico, ache o trecho, exporte a prova",
fase 2, só no Pro. O Rodrigo acrescenta a **porta**: ele pergunta direto no WhatsApp, sem
abrir nada.

**A cena que vale:** o paciente está na frente dele e diz "o senhor me receitou tal coisa".
Ele não lembra. Escreve no WhatsApp e a resposta chega ali, na hora.

**Cuidados.** A Meta cobra por mensagem a partir de 01/10/2026, então cada pergunta tem custo
real — o que nesse caso é bom, dá lastro ao crédito. Dado clínico trafegando pelo WhatsApp vai
para a lista do advogado.

## B. Assistente ao vivo durante a consulta (modo coach)

Enquanto ele atende, a Helena avisa na tela. Exemplos do Rodrigo: o paciente diz "o senhor me
falou tal coisa" e ela avisa que ele não disse; "fale com calma"; lembra de algo pessoal do
paciente.

**Por que é a mais forte estruturalmente.** É a primeira coisa do plano que faz ele deixar a
Helena aberta a consulta inteira. Voltar e gravar deixam de depender da mecânica de crédito e
viram consequência do produto. E é ela que dá **lastro ao crédito**: painel não custa nada para
mostrar; coach ao vivo custa por minuto.

**A LINHA, escrita antes da primeira linha de código:**

> O assistente fala sobre **a conversa e o registro**. Nunca sobre **medicina**.

- **Pode:** "ele não disse isso"; "ela mencionou que mora sozinha"; "você pediu ressonância em
  março e ela não trouxe"; "ele não repetiu a posologia".
- **Não pode:** dose, diagnóstico, conduta, contraindicação, interação. Vira apoio à decisão
  clínica, com ANVISA como software de saúde e CFM junto.
- Todos os exemplos do Rodrigo caíram do lado certo da linha sozinhos.

**Cuidados.** Duas ou três intervenções na consulta inteira, no máximo: o paciente vê o médico
olhando a tela, e seria irônico a Helena atrapalhar o vínculo que ela existe para fortalecer.
Tecnicamente é outro bicho — transcrição em fluxo com modelo no meio, nada a ver com o custo de
hoje (R$ 0,80/mês por ~150 prontuários em lote), e provavelmente não roda no mini.

## C. Análise de oportunidade (o lado coach de negócio)

Depois da consulta, a Helena aponta onde ele perdeu dinheiro pela forma de conduzir.

**Por que pode ser a maior das três.** É exatamente o que a Método 3A já sabe e ensina, e nenhum
concorrente tem uma agência com 400 médicos atrás. E funde duas ideias que estavam soltas: o
coach e o "prêmio vem do 3A". Em vez de convidar para um workshop, aplica o método do 3A na
consulta real dele, toda vez.

**A LINHA, mais afiada que a do clínico:**

> Melhorar **a conversa e o desfecho**, sim. Aumentar **o ticket**, não.

O lado seguro é também o que dá mais dinheiro: paciente que entendeu, marcou o retorno e voltou
vale mais que ticket espremido numa consulta.

- **Pode:** ofereceu parcelamento antes de perguntarem; falou o preço sem antes explicar o que o
  paciente ganha; a consulta acabou sem marcar retorno; objeção ficou sem resposta; ele falou
  80 % do tempo; ninguém perguntou como o paciente chegou até ele.
- **Não pode:** sugerir subir preço, empurrar procedimento, ou qualquer coisa que trate o
  paciente como alvo. Manchete "IA ensina médico a vender mais para o paciente" mata o produto.
  O CEM já tem artigo sobre mercantilização, citado na spec para a farmácia.

**Cuidados.** É análise **depois**, nunca ao vivo: dica de venda na tela com o paciente na frente
é distração e risco de ele ver. Opt-in e privado de verdade — não pode passar pela cabeça dele
que alguém do 3A lê aquilo. E é isso que justifica um degrau acima do Pro: não é prontuário, não
é memória, é outra categoria.

## D. A demo como conversão, no momento da entrega

O momento é o certo: ele acabou de receber o prontuário, com a prova fresca na mão. A spec já
diz que cada prontuário entregue é um momento de atenção.

**Menu primeiro, texto livre depois.** O Rodrigo corrigiu minha proposta e está certo: deixando
em branco, o médico pergunta o que já sabe que existe, e o que ele já sabe não impressiona. O
menu é que ensina o que a Helena faz. O "ou pergunta o que você quiser" fica no fim, para quando
ele já entendeu o brinquedo.

**As opções vêm com o número dele dentro, não genéricas.** "Quem eu pedi exame e não voltou" é
folheto. **"Três pacientes seus fizeram exame em agosto e não voltaram, quer ver quem?" é soco.**
Ele nem precisa perguntar para entender o que ganhou.

**Ordem do menu, dinheiro na frente:** exames pedidos ou encaminhamentos que não voltaram;
retornos vencidos; quem parou o tratamento no meio. Depois as de memória: o que prescrevi pro
fulano da última vez; alguém já falou de alergia. Por último, texto livre.

**O coach se demonstra de trás para frente.** Ao vivo não dá antes de assinar, mas dá para pegar
uma consulta já gravada e mostrar o que ele teria avisado: "nessa de terça, eu teria te dito que
ele não repetiu a posologia". Mesma prova, com o material dele.

**A demo precisa de lastro.** Com três consultas gravadas não há o que perguntar sobre três
semanas atrás. Então ela só dispara quando há material — e isso vira mecânica: a Helena pode
anunciar antes ("daqui a tantas consultas eu te mostro uma coisa"), o que é motivo para continuar
gravando.

## E. O gotejo, e como convive com a regra da dica

Rodrigo: "ele vai ter um pouquinho pra sentir o gostinho, a gente mostra um ou outro, mas ele tem
que saber: assina o Pro. E ver isso o tempo todo."

**A distinção que faz isso caber:** a observação é **produto**; o "assina o Pro" é **anúncio**.
A observação pode aparecer sempre, porque é útil sozinha e é motivo de abrir. A frase de venda é
que tem freio, e segue a regra já decidida de 1 a cada 5.

**Como mostra:** uma observação real, inteira, sem tela borrada, como a spec já manda. E a frase
sem eufemismo: "essa consulta teve mais quatro observações; no Pro você vê todas, em todas as
consultas."

**E é o ralo de crédito perfeito:** o gostinho cabe na diária grátis, o resto custa.

## F. As medidas, em formato de exame

Ideia do Rodrigo — e ele derrubou minha primeira versão com razão. Eu tinha proposto suavizar,
mostrar só o fato e a evolução ("em 4 das suas 10 consultas o paciente saiu com retorno marcado;
mês passado foram 2"). Ele respondeu: médico vive de valor com faixa de referência, e ninguém diz
"seu sangue ficou em quarto entre os oito melhores" — diz se tem ou não tem.
**Então é diagnóstico, não é comentário.**

> **Retorno marcado: 40 %. Referência: 70 %. Abaixo.**

Valor, faixa, veredito, sem rodeio. Bate com a regra já decidida de falar sem eufemismo.

**A faixa tem que dizer de onde veio.** Exame traz método e população. Se ele perguntar "com base
em quê?", a resposta não pode ser "a gente achou". Então: "referência 68 %, de 12.400 consultas de
ortopedia na Helena". Faixa inventada com médico é tiro no pé — ele lê faixa de referência a vida
inteira.

**Ressalva honesta:** essa faixa não existe hoje. O 3A tem método e 400 clientes, mas não tem dado
de dentro da consulta. Até a base existir, mostra o valor e a evolução dele, e diz que a faixa vem
depois. É mais um motivo para a base ser o negócio.

**Faixa de referência sim, ranking não.** "Abaixo da faixa" é linguagem de exame. "Você é o 30º
entre 100 ortopedistas" vira print no grupo do WhatsApp e vira processo.

**Começar só pelo que é contagem, não interpretação.** Glicose é medida; "objeção sem resposta" é
um modelo lendo transcrição. Quanto mais seco o veredito, mais caro errar. Primeiro: retorno
marcado ou não, quanto tempo cada um falou, posologia repetida de volta. As interpretadas entram
depois que a régua provar que acerta.

**Toda linha abre no momento exato.** Ele clica em 40 % e vê as seis consultas em que não marcou,
com o trecho. Sem isso, veredito seco vira briga.

**Janela de mês ou últimas 20 consultas**, nunca consulta a consulta — senão vira vigilância, e
dia ruim todo mundo tem.

**Botão de "não quero mais", por área e não geral.** Ele pode topar ver retorno marcado e odiar ver
quanto tempo falou; botão único mata tudo de uma vez. Fica discreto desde o começo e só é oferecido
na cara quando a mesma medida ruim se repete, que é quando dói.

**O que isso fecha.** Para ver o número mexer, ele precisa continuar gravando. A medição vira o
motivo de gravar, sem mecânica de crédito nenhuma.

**As áreas (método do 3A virando medida):** quantos saíram com retorno marcado; quantos repetiram
a posologia de volta; quanto do tempo quem falou foi o paciente; quantas objeções ficaram sem
resposta; quantas vezes o preço veio antes da explicação do que ele ganha; de quantos ele soube
como chegaram até o consultório.

**As três partes que fazem a medida mover alguém** (o Rodrigo pegou esse furo: "como é que ele vai
melhorar algo que ele não mensura?"): a **referência**, o **quanto aquilo vale em dinheiro**
("seis pacientes seus esse mês saíram sem retorno marcado"), e **uma coisa para fazer diferente**
("marque o retorno antes de ele levantar da cadeira"). Medida sem alvo e sem ação é frustração.

## G. O vídeo do Rodrigo, e o marketing de conteúdo invertido

Quando a medida vem ruim, entra um vídeo curto do Rodrigo ensinando exatamente aquilo.

**Resolve o elo mais fraco do ciclo.** Medir e mostrar a faixa é fácil; "o que fazer" era ruim
porque robô ensinando médico a conduzir consulta é presunçoso e ele rejeita. Com autoridade humana
atrás, vira aula.

**Marketing de conteúdo invertido (nome do Rodrigo).** No normal, publica-se para muita gente
torcendo para achar quem tem o problema agora. Aqui já se sabe **quem** tem, **qual** é e que é
**agora**, porque foi medido na consulta dele. Distribuição custa zero e a relevância é total.

**Custo quase absurdo de baixo.** As medidas são um conjunto fechado, então são uns quinze vídeos,
gravados uma vez, servindo todo médico para sempre.

**A hora é o valor, não o conteúdo.** Curso é genérico e esquecido; 90 segundos logo depois de ver
que perdeu seis retornos é coaching.

**Regras.** Um a dois minutos. Um vídeo por medida, não aula sobre marketing médico. A sequência é
**trecho da consulta dele primeiro, vídeo depois** — o par entre o erro e a explicação é o que
ensina; vídeo solto vira propaganda. E se o vídeo for genérico, queima a credibilidade do Rodrigo
justo quando ela vale mais.

**Duas consequências maiores que o vídeo.**
1. **A base diz ao 3A qual conteúdo produzir**, pelo erro que mais aparece — medido, não chutado.
2. **O agregado vira conteúdo público que só o 3A pode fazer:** "68 % dos médicos não marcam o
   retorno antes de o paciente levantar". Identificado dentro, agregado fora — a parede da spec.

**Depois, canal.** O médico que assistiu e gostou é levado para o Instagram e o YouTube do 3A, e
está a um passo de contratar a agência, que já é uma das portas do plano.

**A trava que não pode cair.** A medida tem que ser verdadeira e útil para um médico que nunca vai
assistir vídeo nenhum e nunca vai contratar a agência. Se ele desconfiar que a medição existe para
vender, o produto inteiro cai junto.

**Uma coisa que só isso resolve:** tudo o mais que a gente desenhou é robô. O Rodrigo aparecendo dá
cara humana ao produto, e em saúde isso vale muito.

## Em aberto da rodada 4

1. Se o coach ao vivo, a análise de oportunidade e as medidas são Pro, Cérebro ou um degrau novo,
   e a que preço.
2. Custo real por minuto de coach ao vivo, **medido**, não estimado.
3. Fronteira do clínico e fronteira da mercantilização — as duas ao advogado, junto das cinco
   perguntas que já estão na lista.
4. Frequência da observação versus frequência da frase de venda.
5. Quantas consultas gravadas a demo exige para não furar.
6. Se a demo sai da bolsa de crédito dele ou é por conta da casa.
7. Como nasce a faixa de referência antes de a base existir.
8. O nome das medidas na tela, que não pode soar a boletim.
9. Se o vídeo é grátis ou Pro (palpite: grátis — puxa confiança e puxa para o 3A; vende-se a
   profundidade).
