# O modelo consegue declarar o que consertou?

**06/09/2026.** Sim — de 4% para 94%, só mudando o pedido.

## Por que dava pra medir isso direito

A rodada com voz humana deixou três artefatos alinhados: o roteiro (o que foi
dito), a transcrição (o que o Whisper ouviu) e a lista exata dos 8 consertos
que o modelo fez em silêncio. Isso é **ground truth** — dá pra contar quantos
ele revela quando o prompt pede, em vez de julgar por impressão.

## O resultado

6 rodadas por variante, mesma transcrição humana, `gemini-2.5-flash`.

| Conserto que ele fez calado | A · produção | B · pede rastro | C · citar + rastro |
|---|---|---|---|
| `tratamento` → travamento | 2/6 | **6/6** | **6/6** |
| `palpitação` → palpação | 0/6 | **6/6** | **6/6** |
| `cala a boca` descartado | 0/6 | **6/6** | **6/6** |
| `sem que` → sem carga | 0/6 | **6/6** | **6/6** |
| `lasartana` → losartana | 0/6 | 4/6 | **6/6** |
| `de pirona` → Dipirona | 0/6 | 5/6 | **6/6** |
| `provavelmente procure` removido | 0/6 | 3/6 | **6/6** |
| `Olha o dedo e` descartado | 0/6 | 2/6 | 3/6 |
| **total declarado** | **2/48 (4%)** | 38/48 (79%) | **45/48 (94%)** |

A variante C acerta **6/6 em todos os sete que importam**. O único irregular é
"Olha o dedo e" — a fala intrusa mais curta, e a menos consequente.

## O que fez a diferença

**A → B:** pedir uma seção "O QUE EU INTERPRETEI", explicando que a transcrição
chega com erro e que ele provavelmente vai corrigir sem perceber.

**B → C:** mandar **copiar os trechos literais antes** de escrever o prontuário.
Isso força ele a olhar o texto cru enquanto ainda não decidiu o que ele
significa. Depois de interpretar, lembrar do que estava escrito é mais difícil.

## O custo, medido

Nenhum dos consertos deixou de ser feito — o prontuário continua correto nas
três variantes. A seção de rastro **soma** informação, não substitui.

Mas tem um efeito colateral que apareceu:

> **A variante C inventou a idade da paciente em 1 de 6 rodadas.**
> "A Sra. Ana Ficticia, **60 anos**" — a idade nunca foi mencionada na consulta.
> A e B: 0/6.

Amostra pequena (apareceu 2 vezes em ~7 saídas de C que eu olhei), então não dá
pra cravar taxa. Mas o mecanismo faz sentido e vale registrar.

### E ele expõe um limite importante do desenho

A seção "O QUE EU INTERPRETEI" cobre **divergências em relação à transcrição**.
Uma idade inventada não é divergência — é **acréscimo sem fonte nenhuma**. Não
tem trecho literal pra citar, então não cai na rede.

São dois modos de falha diferentes:

| | Coberto pelo rastro? |
|---|---|
| trocar uma palavra da transcrição por outra | ✅ sim |
| descartar fala que não pertence à consulta | ✅ sim |
| **acrescentar fato que ninguém disse** | ❌ **não** |

O prompt endurecido resolve o primeiro problema — que era o que a gente estava
perseguindo — e não toca no segundo.

## Recomendação

**Aplicar a variante C**, com uma regra a mais contra acréscimo sem fonte
(algo como *"não inclua idade, sexo, profissão ou qualquer dado que não tenha
sido dito"*) — e **medir de novo** depois, porque essa regra não foi testada.

O ganho é grande e o custo é uma seção a mais no fim do prontuário. Mas não é
grátis, e não é completo.

## Como repetir

```bash
node medir-rastro.mjs
```

Precisa de uma Edge Function que exponha o Gemini (modelo em
`lab-transcricao.ts`; a usada aqui foi apagada). A lista `CONSERTOS` no topo é
o ground truth — trocar junto se trocar a fixture.

---

# Anexo — troca da cascata de modelos (06/09/2026)

A MarIA usava `gemini-2.5-flash` com fallback pra `gemini-2.0-flash-001` e
`gemini-1.5-flash`. **Os dois fallbacks já tinham sumido da API** — a chave não
os lista mais. E o principal tem desligamento marcado pra **16/10/2026**, com
relatos de 404 antes da data. Quando morresse, a MarIA pararia de gerar
prontuário.

## Como a nova cascata foi escolhida

Cada candidato rodou contra a mesma transcrição humana. 5 rodadas para a
triagem, 6 para o desempate.

| modelo | losartana | dipirona | travamento | inventou remédio | inventou idade | tempo |
|---|---|---|---|---|---|---|
| gemini-2.5-flash *(atual)* | 5/5 | 5/5 | 5/5 | 0/5 | **1/5** | 10,8 s |
| **gemini-3.7-flash** | 5/5 | 5/5 | 5/5 | 0/5 | 0/5 | **4,3 s** |
| gemini-3.8-flash | 5/5 | 5/5 | 5/5 | 0/5 | 0/5 | 5,0 s |
| gemini-3.6-flash | 5/5 | 5/5 | **4/5** | 0/5 | 0/5 | 9,9 s |
| gemini-3.5-flash | 5/5 | 5/5 | 5/5 | 0/5 | 0/5 | 10,9 s |
| gemini-3.5-flash-lite | 5/5 | 5/5 | 5/5 | 0/5 | 0/5 | **2,1 s** |

**Cascata escolhida:** `gemini-3.7-flash` → `gemini-3.8-flash` → `gemini-3.5-flash`

O `flash-lite` foi descartado no desempate: escreveu "ergonômica" no lugar de
"ergométrica" em **4 de 6** rodadas. Rápido, mas desleixado com termo técnico.

## O achado do desempate

| modelo | escreve "ergo**métrica**" | preserva "sem carga" |
|---|---|---|
| gemini-2.5-flash | 5/6 | **3/6** |
| gemini-3.7-flash | **6/6** | 0/6 |
| gemini-3.8-flash | **6/6** | 0/6 |
| gemini-3.5-flash-lite | 2/6 | 3/6 |

Os modelos novos são **mais literais**: consertam a palavra claramente errada
("ergonômica" → ergométrica) e **não preenchem o que simplesmente não está lá**.

A expressão "sem carga" **não existe na transcrição** — o Whisper comeu a
palavra e sobrou "sem que". O 2.5 adivinhava "sem resistência" em metade das
vezes; o 3.7 nunca adivinha.

**Isso não é regressão da troca — é a perda da transcrição aparecendo.** O
modelo antigo estava encobrindo o buraco com um palpite que por acaso acertava.

E reforça a recomendação do rastro: com a variante C, "sem que" apareceria como
trecho não resolvido, e o médico veria que ali faltou alguma coisa. Hoje, ou
some em silêncio (3.7) ou é preenchido por adivinhação (2.5). Nenhum dos dois
avisa.

## Verificado ponta a ponta

Áudio humano real → upload → fila → Whisper → gemini-3.7-flash → prontuário,
em **30 segundos**. Losartana, Dipirona, travamento, condropatia: todos
corretos. Nenhuma invenção de remédio ou idade.
