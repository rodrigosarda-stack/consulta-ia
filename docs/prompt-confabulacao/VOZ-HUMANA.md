# Voz humana — 06/09/2026

O Rodrigo gravou o mesmo roteiro no celular, pelo WhatsApp (ogg/opus, mono
48 kHz, 2min31s). Mesmo pipeline, mesmo prompt de produção, tudo igual — só o
áudio deixou de ser sintetizado.

**O resultado inverte quase tudo que a rodada anterior sugeria.**

---

## A transcrição

| Termo | Voz sintética | **Voz humana** |
|---|---|---|
| joelho direito | ❌ "Joulo Dorito" | ✅ |
| condropatia patelar | ❌ | ✅ |
| menisco medial | ✅ | ✅ |
| ressonância magnética | ❌ | ✅ |
| quadríceps | ❌ | ✅ |
| fisioterapia | ❌ | ✅ |
| **losartana** | ❌ "Sou la certana" | ⚠️ **"lasartana"** |
| dipirona | ❌ | ⚠️ "de pirona" |

**6/8 corretos sem vocabulário nenhum**, contra 1/8 com voz sintética. E os dois
erros que sobraram são *quase-acertos*:

```
sintética:  "Sou la certana para o preceo, 50 miligramas, todo dia de manta."
humana:     "Só lasartana para pressão 50mg todo dia de manhã."
```

Uma vogal trocada, contra uma frase irreconhecível.

## O prontuário — 8 rodadas, prompt de produção

```
ACERTOU  7/8      "Em uso de Losartana 50mg/dia para controle pressórico"
INVENTOU 0/8
OMITIU   1/8      (não mencionou medicação)
```

Contra **1/8 de invenção** na rodada com voz sintética.

O modelo corrigiu "lasartana" → **losartana** e "de pirona" → **Dipirona**, e
acertou as duas. É o mesmo mecanismo que produziu "Sertralina" da outra vez —
ele continua preenchendo lacuna — só que com material bom o suficiente, ele
preenche certo.

---

## O que isso muda

**O risco era muito menor do que a primeira medição sugeria.** A voz sintética
do macOS destrói informação que fala humana preserva, e eu construí um cenário
que não representa uso real.

O que **não** muda:

1. **O mecanismo é o mesmo.** O modelo não sinalizou incerteza em nenhuma das
   8 rodadas — nem quando corrigiu "lasartana". Ele acertou, mas acertou
   chutando bem.
2. **A distância entre quase-acerto e erro grave é curta.** Aqui "lasartana"
   resolveu pra losartana. Um consultório com ruído, um paciente falando baixo,
   um nome menos comum, e vira "Sertralina" de novo.
3. **8 rodadas, uma gravação, um roteiro, um sotaque.** Sinal forte, não prova.

## Recomendação revisada

| Antes desta medição | Depois |
|---|---|
| Prompt endurecido = conserto urgente | **Precaução barata** |
| Vocabulário no Whisper = alta prioridade | **Vale, mas o ganho é menor** |

Continua valendo aplicar os dois — o custo é quase zero e eles cobrem
justamente a cauda que este teste não alcançou (ruído, sotaque, remédio raro).
Mas **não é o que bloqueia a MarIA de receber médico.**

O que bloqueia continua sendo o WhatsApp desconectado.

## Fixtures

- `fixture-roteiro-original.txt` — o roteiro, com falas separadas por papel
- `fixture-transcricao-humana.txt` — o que o Whisper devolveu da voz humana
- `fixture-transcricao-degradada.txt` — o que devolveu da voz sintética
