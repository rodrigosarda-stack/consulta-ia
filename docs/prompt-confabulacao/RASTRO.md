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
