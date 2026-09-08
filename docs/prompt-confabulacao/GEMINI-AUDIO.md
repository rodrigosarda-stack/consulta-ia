# Gemini ouvindo o áudio direto — com falantes

**08/09/2026.** Rodrigo: *"tem algum jeito de descobrir quem está falando o quê?"*
O Whisper não separa falantes. O Gemini recebe o áudio e transcreve com
`MÉDICO:` / `PACIENTE:` / `OUTRO:`. Medido nas **duas gravações reais de domingo**
(iPhone, 2 vozes, criança ao fundo), contra o roteiro palavra por palavra
(`comparar.py`) e contra o que o Whisper large-v3 devolveu.

| modelo | gravação | bateu com o roteiro | termos críticos (8) | falantes | custo | tempo |
|---|---|---|---|---|---|---|
| Whisper large-v3 (hoje) | teste 1 | 91,9 % | 5/8 — errou dipirona, ergométrica, condropatia | não | $0,0023 | ~4 s |
| **gemini-3.7-flash** | teste 1 | **93,9 %** | **8/8** | 7 méd · 7 pac, todos certos | $0,0046 | 4,8 s |
| gemini-3.5-flash-lite | teste 1 | 92,6 % | 8/8 | 15 méd · 7 pac (partiu falas demais) | $0,0025 | 5,1 s |
| Whisper large-v3 (hoje) | teste 2 | 87,8 % | 6/8 — errou dipirona, travamento | não | $0,0044 | ~5 s |
| **gemini-3.7-flash** | teste 2 | **90,5 %** | **8/8** | 7 · 7, certos | $0,0048 | 4,7 s |
| gemini-3.5-flash-lite | teste 2 | 90,2 % | 7/8 — errou condropatia | 8 · 7 | $0,0024 | 4,7 s |

Termos: losartana, dipirona, travamento, palpação, ergométrica, sem carga,
condropatia, menisco. "Quem disse losartana" → PACIENTE nas 4 rodadas;
"quem prescreveu" → MÉDICO nas 4.

## O que isso significa

- **Mais fiel que o Whisper** nas duas gravações, inclusive nos termos que o
  Whisper errava sistematicamente ("de pirona", "ergonômica", "chondropatia").
- **Separa falantes de graça**, por papel — não "falante 1/2", mas médico/paciente.
- **Custo por hora**: 3.7 ≈ $0,12 (parecido com o Whisper, $0,11); lite ≈ $0,055
  (mais barato que o Whisper turbo + bom que usamos hoje).
- **Uma IA em vez de duas**: o Gemini transcreve; o Whisper vira reserva.

## Ressalvas (não medidas)

- O Gemini é um modelo de linguagem: ao transcrever ele pode **normalizar** o
  que foi dito (arrumar uma frase mal falada). O "bateu mais com o roteiro" pode
  ser em parte isso. Pra prontuário, acertar o remédio importa mais que a
  literalidade; mas a seção "o que eu interpretei" passa a ter menos "cru" pra
  citar. Vale medir com uma fala propositalmente truncada.
- Falantes por pedaço de 30 s: cada pedaço é transcrito sozinho; o papel é
  inferido pelo conteúdo. Com 3 pessoas (mãe, criança, médico) não medido.
- Preço do 3.7 dobra em 01/01/2027 (o lite não foi anunciado).
- Alucinação em silêncio: não testado — mas silêncio já não é enviado.

## Como repetir

`node medir-gemini-audio.mjs` (precisa da action `lab-audio`, removida; está no
histórico do git em `cde37e7..`). Transcrições em `fixture-gemini-audio-*.txt`.
