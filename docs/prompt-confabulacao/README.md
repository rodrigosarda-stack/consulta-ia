# Confabulação de medicamento em transcrição degradada

**Medido em 05/09/2026.** Teste de vida do pipeline da MarIA, com consulta
fictícia de ortopedia gravada por voz sintética.

## O achado

O roteiro dizia:

> "Só **losartana** para **pressão**, cinquenta miligramas, todo dia de manhã."

O Whisper transcreveu:

> "Sou la certana para o preceo, 50 miligramas, todo dia de manta."

E numa das rodadas o prontuário saiu:

> "Faz uso de **Sertralina 50mg/dia** pela manhã para **estresse**."

Losartana é anti-hipertensivo; sertralina é antidepressivo. Trocou o remédio,
a classe e a indicação — **e manteve a dose e o horário**, o que faz a invenção
parecer verificada.

## O que mais importa: é aleatório

A mesma consulta, o mesmo prompt, rodada de novo, saiu **correta**
("Losartana 50mg… para controle da pressão arterial").

Erro constante você descobre no primeiro teste. Erro que aparece em ~1 de cada
8 execuções passa por qualquer validação manual e chega no cliente.

## O experimento

`experimento.mjs` roda 3 variantes de prompt, 8 vezes cada, contra a mesma
transcrição degradada (`fixture-transcricao-degradada.txt`), e classifica o que
o modelo fez com o medicamento. Modelo: `gemini-2.5-flash`.

| Prompt | Acertou | Admitiu não entender | Inventou |
|---|---|---|---|
| **A** — o de produção hoje | 6/8 | 1/8 (omitiu) | **1/8** |
| **B** — + regra literal p/ medicamento | 2/8 | 6/8 | **0/8** |
| **C** — B + citar trechos literais antes | 0/8 | 8/8 | **0/8** |

### O trade-off é real

- **A acerta mais** (6/8 contra 2/8) — mas inventa às vezes.
- **B e C nunca inventam** — mas na maioria das vezes se recusam a nomear o
  remédio, mesmo quando A teria acertado.

Saída típica de B:

```
Faz uso de [medicamento nao compreendido: "Sou la certana"] 50 mg,
diariamente pela manhã, para [indicação não compreendida: "preceo"].
```

Para documento clínico, essa troca provavelmente vale a pena: um médico lendo
`[não compreendido: "Sou la certana"]` corrige em dois segundos. Um médico
lendo "Sertralina" não tem como saber que está errado.

## Ressalvas honestas

1. **A transcrição ruim é artefato do teste.** Usei voz sintética do macOS, que
   o Whisper transcreve mal ("joelho direito" virou "Joulo Dorito"). Com fala
   humana real a transcrição seria muito melhor, e a taxa de confabulação
   provavelmente menor. **Isto não mede a qualidade do produto em uso real.**
2. **O que o teste mede de verdade** é o comportamento do modelo diante de
   entrada degradada: ele preenche a lacuna com confiança em vez de sinalizar.
3. **O classificador do experimento tem um viés conhecido:** ele checa
   "admitiu" antes de "inventou". Uma saída como *"Sertralina 50mg para
   condição [?]"* — que inventa o remédio mas hedges a indicação — é contada
   como ADMITIU. A tabela acima já está corrigida à mão para esse caso.
4. **8 rodadas por variante é amostra pequena.** Serve pra ver a direção, não
   pra cravar a taxa.

## A lição que vale além da MarIA

Instrução de *"marque com [?] o que for incerto"* **não é garantia**. O modelo
só marca quando ele sabe que está incerto — e diante de um texto mal
transcrito ele não vê áudio ruim, vê texto. Para ele a frase está lá, legível.

O que funcionou não foi pedir para sinalizar dúvida. Foi **proibir a correção**
e **exigir a citação literal** do trecho original.

Vale para qualquer pipeline que extrai campo estruturado de entrada suja — OCR
de nota fiscal, transcrição, scraping. E o corolário: **testar só com entrada
limpa não mede isso.**

## Como repetir

```bash
node experimento.mjs
```

Precisa de um endpoint que chame o modelo (o teste original usou uma Edge
Function temporária, já desativada). Ajuste `URL_LAB` no topo do arquivo.
