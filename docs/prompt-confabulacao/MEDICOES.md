# Medições — 05/09/2026

Duas perguntas, medidas contra o mesmo áudio (consulta fictícia de ortopedia,
2min24s, voz sintética do macOS). Modelo: `whisper-large-v3` no Groq.

---

## 1. Enxertar vocabulário médico melhora a transcrição?

**Sim, e bastante — mas não salvou o caso que importava.**

O Whisper aceita um parâmetro `prompt` que enviesa o reconhecimento na direção
de um vocabulário. **A MarIA hoje não usa** (ver `transcribeAudio` em
`supabase/functions/process-consultation/index.ts`).

6 rodadas com e sem, contando quantas vezes cada termo do roteiro sai correto:

| Termo | Sem vocabulário | Com vocabulário |
|---|---|---|
| **losartana** ⚠️ | 0/6 | **0/6** |
| joelho direito | 0/6 | 0/6 |
| ressonância magnética | 0/6 | 0/6 |
| condropatia patelar | 0/6 | **6/6** |
| dipirona | 0/6 | **6/6** |
| quadríceps | 0/6 | **6/6** |
| fisioterapia | 0/6 | **6/6** |
| menisco medial | 6/6 | 6/6 |
| **total** | **6/48** | **30/48** |

Cinco vezes mais termos corretos. Vale implementar, é um parâmetro.

### Mas tem um efeito colateral perigoso

Olha o trecho do remédio nas duas condições:

```
sem:  "Sou la certana para o preceo, 50 miligramas, todo dia de manta."
com:  "Sola sertana para o pressão, 50 miligramas, todo dia de manhã."
```

Com vocabulário, o **contexto ao redor melhorou** — "preceo" virou "pressão",
"manta" virou "manhã". Mas o **nome do remédio continuou errado**, e ficou até
mais perto de *sertralina* que de *losartana*.

Ou seja: a frase inteira passou a ler bem, **exceto a única palavra que
importa**. Isso torna o erro *mais* convincente pro modelo que vai escrever o
prontuário — ele agora vê uma frase limpa com um nome estranho no meio, e
resolver esse nome vira ainda mais tentador.

**Melhorar a transcrição sem endurecer o prompt pode piorar o risco clínico.**

---

## 2. Dá pra saber ONDE o Whisper ficou inseguro?

**Não. Isso não funciona — e eu tinha afirmado que funcionaria.**

Trocando `response_format=text` por `verbose_json`, o Groq devolve 31 segmentos
com `avg_logprob` e `no_speech_prob`. O dado existe. Mas ele **não aponta o
erro**:

| Trecho | Confiança | Verdade |
|---|---|---|
| "Sou la certana para o preceo…" | **−0,385** (acima da média) | ❌ completamente errado |
| "Obrigada." | −0,668 (a pior de todas) | ✅ correto |
| "Estendo perna-pró-mim" | −0,478 | ❌ errado |

Média geral: −0,402. **O trecho do remédio, que está todo errado, tem confiança
ACIMA da média.** O pior segmento do áudio é a palavra "Obrigada", que saiu
perfeita.

### Por quê

`avg_logprob` mede o quanto o modelo estava seguro **dos tokens que escolheu** —
não se esses tokens estão certos. "Sou la certana" é uma sequência fluente de
sons portugueses: o modelo não estava hesitando, estava produzindo com folga.

**Confiança mede fluência, não acerto.** Um modelo pode errar com convicção, e
foi exatamente o que aconteceu.

### O que isso derruba

A ideia de perguntar ao médico **só onde o Whisper ficou inseguro** não é
viável — o sinal não existe. O gatilho da pergunta tem que vir da etapa
seguinte: o modelo que escreve o prontuário, obrigado a citar o trecho literal,
é quem percebe que "Sola sertana" não resolve pra nenhum remédio conhecido.

---

## O que sobra de recomendação

1. **Usar o parâmetro `prompt`** com vocabulário médico — ganho grande e barato.
2. **Mas nunca sozinho.** Ele reduz a frequência da dúvida e aumenta o disfarce
   dos casos restantes.
3. **A regra literal no prompt do prontuário continua sendo a única defesa que
   funciona** (ver `README.md`: prompts B e C, 0/8 invenções).
4. **A pergunta ao médico nasce ali**, não no Whisper.

## Ressalva que vale pra tudo acima

Áudio de voz sintética. É o pior caso pro Whisper e não representa consulta
real — "losartana" pode ter falhado simplesmente porque o TTS do macOS
pronunciou mal. **Nada aqui mede a taxa de erro em uso real.** O que estas
medições estabelecem é o *comportamento* de cada camada quando a entrada vem
degradada.

Pra medir de verdade, precisa de gravação humana.

## Como repetir

`medir-vocabulario.mjs` roda a comparação. Precisa de uma Edge Function que
exponha o Whisper — o modelo dela está em `lab-transcricao.ts` (a função usada
neste teste foi apagada depois).
