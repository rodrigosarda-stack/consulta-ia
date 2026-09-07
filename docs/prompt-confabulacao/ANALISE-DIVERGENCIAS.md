# O que a transcrição fez com a consulta — comparação sistemática

**06/09/2026.** Gravação humana (mais de uma voz, ruído de fundo), 2min31s.
Alinhamento palavra a palavra entre o roteiro e o que o Whisper devolveu, feito
por `comparar.py` — não a olho.

```
palavras ditas: 296    ouvidas: 308
bateram:        270/296 = 91,2%
divergências:   29, das quais 7 tocam termo de consequência clínica
```

**Por que sistemático e não a olho:** na primeira leitura eu achei 5 problemas,
todos os dramáticos (nome de remédio). O alinhamento achou 29 — incluindo o
sumiço de uma palavra que é tão perigosa quanto o remédio errado, e que meu
olho pulou porque a frase continuava fazendo sentido sem ela.

---

## Os três que são perigosos de verdade

### 1. `travamento` → `tratamento`

> dito: "…menos provável porque não teve **travamento**"
> ouviu: "…menos provável porque não teve **tratamento**"

Ausência de travamento é o **sinal clínico** que torna lesão de menisco menos
provável. Trocado por "tratamento", a justificativa da hipótese diagnóstica
deixa de existir — vira "menos provável porque não foi tratado", que não é
raciocínio nenhum.

### 2. `palpação` → `palpitação`, e fala de terceiro entrando

> dito: "…encontrei dor **à palpação** na região medial"
> ouviu: "…encontrei dor **e palpitação cala a boca** certo encontrei dor e palpa na regi medial"

Duas coisas ao mesmo tempo. **Palpitação** é sintoma cardíaco — num exame de
joelho, é achado inventado. E **"cala a boca"** não foi dito por ninguém na
consulta: é o ruído de fundo, alguém falando perto do celular, que o Whisper
transcreveu como se fosse fala do atendimento.

O mesmo acontece antes: **"Olha o dedo e"** aparece do nada.

Isso é o risco menos óbvio de todos: **conversa de corredor entra no prontuário
do paciente.**

### 3. `sem carga` → `sem que` — o parâmetro sumiu

> dito: "pode fazer bicicleta ergométrica **sem carga**, que não castiga a articulação"
> ouviu: "pode fazer bicicleta ergonômica **sem que** não castiga a articulação"

A palavra `carga` **desapareceu**. E "sem carga" é a prescrição inteira: bicicleta
*com* carga em condropatia patelar piora o quadro. A frase continua gramatical,
o que é justamente o motivo de eu não ter visto na leitura.

---

## Os quatro moderados

| Dito | Ouvido | Problema |
|---|---|---|
| ergo**métrica** | ergo**nômica** | equipamento errado |
| "procure o pronto-socorro" | "**provavelmente** procure o pronto-socorro" | hedge numa instrução de emergência |
| losartana | **la**sartana | quase-acerto em nome de remédio |
| dipirona | **de pirona** | quase-acerto, palavra partida |

## O resto (22) é ruído inofensivo

Numerais no lugar de extenso ("cinquenta miligramas" → "50mg", "vinte e um" →
"21"), sinônimos ("remédio" → "medicamento"), artigos, e fala natural que não
estava no roteiro ("por favor", "ok?", "você"). Nada disso muda sentido clínico.

---

## O que o prontuário fez com cada um

| Divergência | No prontuário |
|---|---|
| tratamento | "menos provável pela **ausência de travamento**" ✅ |
| palpitação | "Dor à **palpação** em região medial" ✅ |
| "cala a boca" / "Olha o dedo e" | *não apareceram* ✅ |
| sem que | "sem **resistência**" ✅ |
| provavelmente procure | "Orientado a procurar pronto-socorro" ✅ |
| lasartana | **losartana** ✅ |
| de pirona | **Dipirona** ✅ |
| ergonômica | **ergonômica** ❌ *(único que passou)* |

**Sete consertos em silêncio. Um erro que passou.**

## A conclusão que importa

O prontuário parece impecável porque **o modelo fez uma reforma inteira que não
deixa rastro**. Lendo a saída, não há como saber se foram zero consertos ou
sete — nem quais.

Isso é diferente do risco que eu vinha perseguindo. Não é "o modelo erra às
vezes". É:

> **A qualidade do texto final esconde a qualidade do que entrou.**

E é a mesma faculdade que, no teste com voz sintética, produziu "Sertralina" no
lugar de "losartana". Aqui ela acertou sete de sete. Não existe nada no texto
que avise quando ela erra.

## O que isso muda na recomendação

O prompt endurecido deixa de ser sobre *impedir* a correção — que é útil e
acertou quase tudo. Passa a ser sobre **deixar rastro dela**:

- o médico vê que houve interpretação, e onde
- os casos em que o modelo repara errado ficam visíveis em vez de invisíveis
- "sem carga" sumindo vira algo que aparece, não algo que se descobre depois

## Como repetir

```bash
python3 comparar.py fixture-roteiro-original.txt fixture-transcricao-humana.txt
```

Serve pra qualquer par roteiro/transcrição. A lista `CRITICOS` no topo marca os
termos onde errar tem consequência — ajustar por domínio.
