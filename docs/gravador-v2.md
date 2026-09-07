# Gravador v2 — como a MarIA grava, transcreve e decide que a consulta acabou

**07/09/2026.** Reescrito depois dos dois primeiros testes reais no celular do
Rodrigo. Este documento explica o desenho e o **porquê** de cada decisão. O
código está em `src/lib/gravador.js`, `src/components/Recorder.jsx` e
`supabase/functions/api/index.ts` (actions `session-start`, `chunk`, `finalize`).

## O problema que estava lá

Até 07/09 o gravador guardava a consulta inteira **na memória do navegador** e
subia **um arquivo só** quando o médico apertava Parar. Três coisas ruins ao
mesmo tempo:

1. Celular morre, aba fecha, 4G cai no fim → **perde a consulta inteira**.
2. Ninguém tinha dito ao celular em que qualidade gravar. Os dois testes deram
   26 e 50 KB/s — **94 a 180 MB por hora** — acima do limite de 50 MB. Na
   prática só passavam ~15-20 minutos. A auditoria de abril *assumiu*
   "60 min ≈ 30-40 MB" e baixou o limite pra 50 com base nisso. Ninguém mediu.
3. Havia um corte em 1 hora escrito no código. Consulta de 1h30 nem entrava.

O Rodrigo: *"a gente vai ter consulta de uma hora, uma hora e meia"* e *"se
cair no meio você perde tudo, não?"* Sim.

## O desenho

```
celular                                  servidor (Edge Function api)
───────                                  ──────────────────────────
Gravar ──► session-start ─────────────►  gravacao_sessoes (nome, nota, mime)
           │
           ├─ MediaRecorder A (0-30 s)
           │     └─ para → pedaço 0 ──► chunk: guarda + TRANSCREVE (Whisper, com dica)
           ├─ MediaRecorder B (30-60 s)               └─ dica = "Consulta médica PT-BR. Paciente: X.
           │     └─ para → pedaço 1 ──► chunk           <nota do médico>. <fim do pedaço anterior>"
           │                             │
           │                             └─ a cada 2 pedaços: Gemini lê o fim do texto
           │                                "a consulta claramente terminou?" ──► resposta
           │  ◄──── { terminou: true, motivo } ◄─────────────────────────────────────┘
           │        tela: "🤖 Parece que terminou — Parar agora / Continuar"
           │        2ª vez seguida sem resposta → para sozinho
           │
Parar ───► espera a fila esvaziar ───► finalize: junta os TEXTOS → consultas(transcricao_pronta)
                                                  └─► gatilho → fila → process-consultation
                                                       (pula download + Whisper) → prontuário
```

### Por que reiniciar o MediaRecorder a cada pedaço, em vez de fatiar um só

A primeira versão (commit fc73d55) usava um MediaRecorder com `timeslice` e
o servidor **colava os bytes** no fim. Funcionava — mas os pedaços do meio não
têm cabeçalho, então não dá pra transcrever cada um sozinho. Quando o Rodrigo
pediu que a detecção de fim fosse **pelo conteúdo, já** (não "depois"), a
transcrição precisou virar progressiva, e cada pedaço precisou ser um arquivo
completo. Reiniciar o gravador resolve. O próximo começa **antes** do anterior
parar, pra não ter buraco.

Efeito colateral bom: ao apertar Parar, a transcrição já está pronta. O
prontuário sai em ~30 s em vez de ~70.

### Por que cortar na pausa, e não no relógio

Rodrigo: *"ter tudo picotadinho de 30 em 30 segundos não vai prejudicar a
transcrição ou a interpretação?"* Três respostas:

- **A transcrição, não.** O Whisper só escuta em janelas de 30 s por
  arquitetura — um arquivo de 1 h ele mesmo corta em 120. Nossos pedaços são o
  que ele já faria, e ainda recebem o fim do pedaço anterior como contexto.
- **A interpretação, não.** A IA do prontuário recebe o texto inteiro colado;
  as etiquetas só decidem quais pedaços entram.
- **A palavra na emenda, SIM.** Corte no relógio parte "losar-" | "-tana" e o
  Whisper perde as duas metades. Numa consulta de 1 h são 120 emendas.

Conserto (`criarGravadorEmPedacos`, commit desta seção):
1. Corta numa **pausa de fala** (o detector de silêncio já mede 4x/s). Rodrigo:
   *"só dá picote quando encontra dois segundos de pausa"* — 2 s é fim de frase,
   0,35 s pode ser vírgula. Dois limites: **mínimo 20 s** (o Groq cobra no mínimo
   10 s por pedaço; pedaço de 3 s custa 10) e **máximo 60 s** (é o que se perde
   se o celular morrer). Entre eles a exigência relaxa: 20-35 s pausa ≥ 2 s ·
   35-45 s ≥ 1 s · 45-60 s ≥ 0,35 s · 60 s forçado.
2. O pedaço novo começa antes do antigo parar (ideia do Rodrigo): **0,3 s** se o corte foi na pausa (só cobre a demora do celular em começar), **2 s** se foi forçado aos 45 s. Custo da sobreposição: <1% do Whisper. A palavra da fronteira
   sai inteira em pelo menos um dos dois.
3. O servidor **costura** (`costurar()`): acha o maior bloco de 2 a 8 palavras
   em que o fim de A == o começo de B (sem acento/pontuação/caixa) e fica com a
   versão de B, que tem a pontuação que continua a frase. Testado em 5 casos.

### Por que a fila offline

`criarFila` guarda cada pedaço no IndexedDB **antes** de tentar enviar. Falhou:
espera 2 s, 4 s, 8 s… até 30 s, e tenta de novo; o evento `online` acorda a
fila na hora. Se a aba morrer, ao reabrir aparece "Gravação de X não foi
enviada — Enviar agora / Descartar", e `finalize` sem `total_chunks` usa o que
chegou (exigindo sequência contínua a partir do 0).

### Por que dois detectores de fim

- **Silêncio** (`criarDetectorSilencio`): 3 min sem fala → para. Cliente, de
  graça, sem rede. Pega o caso "esqueceu de desligar e saiu da sala".
- **Conteúdo** (`consultaTerminou` no servidor): a cada ~1 min, o Gemini olha as
  últimas ~500 palavras e responde `{terminou, motivo}`. Pega "Obrigada,
  doutor" seguido de conversa de corredor — que **não é** silêncio.

O de conteúdo **pergunta** antes de agir. Só para sozinho na 2ª resposta
positiva seguida (~2 min) sem o médico tocar em nada. "Continuar gravando"
silencia a pergunta por ~2 min.

### Por que a dica pro Whisper

O Whisper aceita até 224 tokens de "prompt" — contexto do que esperar. A MarIA
não mandava nada. Agora manda nome do paciente, a **nota rápida** do médico (que
era um `<textarea>` sem estado — o médico digitava e sumia) e o fim do pedaço
anterior. Medido no primeiro teste: o **mesmo áudio** que ontem deu "lasartana"
e "tratamento", com a nota "HAS em uso de losartana", deu **losartana** e
**travamento**.

### Por que parar quando não é saúde

Rodrigo: *"se ficar claro que não é consulta, tem que parar imediatamente e
dizer — pra não ficar comendo recurso nosso."* A mesma chamada do monitor
responde também **"é saúde? sim / nao / incerto"**, olhando o início e o fim do
texto. `nao` + plano free → o servidor tranca a sessão (`bloqueada_em`): o
pedaço seguinte volta 409 **sem guardar nem transcrever**, `finalize` volta
409, o celular para na hora e mostra o motivo. Nada vira prontuário.

Rodrigo, logo depois: *"médico e paciente falam da família, da vida, da
política — isso é comum. Isso acabaria fazendo o agente desligar."* Verdade. A
primeira versão decidia no minuto 1 e era definitiva. Então a régua virou:

- A pergunta é "existe **algum** sinal de atendimento em **toda** a gravação?",
  com a regra explícita de que papo de família/política/futebol entre médico e
  paciente **faz parte** da consulta. Olha 400 palavras do início + 500 do fim.
- Só decide depois de **170 s** de áudio.
- Precisa de **dois "nao" seguidos**. O primeiro só avisa na tela
  ("⚠️ está parecendo não ser consulta — É consulta, pode continuar").
  Qualquer sim/incerto zera o contador.
- "É consulta" (`action=confirm-saude`) → `saude_confirmada`: nunca mais
  pergunta nessa sessão; se já tinha trancado, destranca.
- Trancou por engano? O que subiu fica guardado; o card vermelho oferece
  "Era consulta, sim — enviar".
- Pagante nunca é trancado — "gravar qualquer conteúdo" está na tabela de planos.
- `incerto` nunca tranca. Custo extra: zero (mesma chamada do "terminou?").

Testado com voz sintética (07/09):
- 4 min de papo puro (viagem, debate, Grêmio) entre "doutor" e "dona Ana" →
  "início de atendimento médico com conversa inicial" — sem aviso, sem trava;
  depois dos sintomas, "consulta em andamento". Prontuário saiu.
- Reunião do início ao fim → 2 min nada (abaixo do mínimo), 4 min **aviso**,
  6 min **trancou**, pedaço seguinte 409.
- `confirm-saude` na sessão trancada → `finalize` passa.

### Por que dois níveis de transcrição

Rodrigo: *"as pessoas conversam por dezenas de minutos antes da consulta. Uma
transcrição bem barata e uma análise barata de tempo em tempo; quando perceber
que é saúde, vai pra análise mais interessante."*

```
sessão nasce em MODO ESPERA ── whisper-large-v3-turbo ($0,04/h)
      │  a cada ~1 min o monitor pergunta "é saúde?"
      ├─ "sim" (free) ou qualquer coisa definida (pagante) ──► MODO CONSULTA
      │        whisper-large-v3 + dica ($0,11/h); refaz os 2 últimos pedaços
      │        (é onde a parte clínica começou); nunca mais tranca
      └─ "nao" 2× depois de 170 s (free) ──► tranca
```

O turbo erra mais em termo técnico — e não importa, porque o que ele transcreve
é o papo, que não vai pro prontuário. `gravacao_pedacos.modelo` registra qual
Whisper transcreveu cada pedaço. "É consulta" na tela também promove.

Na escala planejada (400 médicos × 20 consultas × ~10 min de conversa) a
diferença entre os dois Whispers é **~R$15 mil/mês**.

Testado (voz sintética): papo → clínico foi promovido no 1º minuto (a
saudação "doutor / dona Ana" já é contexto de consulta) e os pedaços 0-1 foram
refeitos com o large-v3; reunião ficou no turbo do início ao fim.

### Por que etiquetar cada pedaço

Rodrigo: *"daria pra marcar os pedaços que devem passar? esse pedaço sim,
esse pedaço não — quase uma edição."* Cada pedaço já é um arquivo com a
própria transcrição, então no `finalize` uma chamada ao Gemini etiqueta cada
um: `clinico` true/false + `tema`. Regras: qualquer conteúdo clínico = true;
saudação colada em clínico = true; **na dúvida = true** (errar pra esse lado
custa pouco; errar pro outro perde informação do prontuário).

- O prontuário recebe **só os pedaços clínicos** (`consultas.transcricao_pronta`).
  O papo não entra nem pra confundir a IA nem pra custar token.
- Tudo que foi dito fica em `transcricao_completa`; o mapa em `mapa_pedacos`.
- Se nada for marcado clínico, manda tudo — nunca prontuário vazio.
- Tela de sucesso: fileira de quadradinhos (verde consulta, cinza conversa).
  **Passo 2 (não feito):** tocar num quadradinho vira a etiqueta e refaz o
  prontuário. **Passo 3 (decisão do Rodrigo):** apagar o áudio dos pedaços
  "conversa" e guardar só o clínico — retenção inteligente.

Testado: 3 pedaços de papo + 3 clínicos → `□0 □1 □2 ■3 ■4 ■5`, temas
"conversa sobre viagem e futebol" / "dor no joelho e exame"; o prontuário
recebeu 1.361 dos 2.597 caracteres. Finalize em 2 s.

## Números

| | antes | agora |
|---|---|---|
| bitrate | o celular escolhia (26-50 KB/s) | 24 kbps (~11 MB/h) |
| teto | 1 h (código) / ~20 min (50 MB) | 2 h |
| perda se o celular morrer | tudo | ≤ 30 s |
| tempo Parar → prontuário | ~70 s | ~30 s |
| custo Whisper por hora | $0,11 | $0,04 enquanto é papo, $0,11 quando vira consulta |
| custo detecção de fim | — | ~$0,01/h (Gemini, 60 chamadas curtas) |

## Armadilhas encontradas (e como não cair de novo)

- **Bucket com `allowed_mime_types` recusa `audio/webm;codecs=opus`** (com
  parâmetro) e `application/octet-stream`, com erro genérico "Upload falhou".
  `mimeBase()` normaliza pro tipo base antes de subir.
- **Gemini 3.x pensa antes de responder e o pensamento conta no
  `maxOutputTokens`.** Com 80 tokens pra um JSON de 10 palavras, a resposta
  vinha vazia — falha silenciosa. Use 1-2k e extraia o primeiro `{...}`.
- **`storage.objects` não aceita DELETE por SQL** (`storage.protect_delete`).
  Limpeza de arquivo é pela API ou pelo painel.
- **"Descartar" tem que apagar no servidor também.** Até 07/09 só o celular
  esquecia; os pedaços ficavam no bucket pra sempre — áudio de paciente órfão.
  `action=discard-session` apaga `{uid}/rec/{sid}/` e a sessão (recusa se já
  virou consulta). O `supabase storage rm` da CLI (experimental) responde ok e
  não apaga nada.
- **O gatilho `tr_enqueue_consulta` só roda no INSERT.** Pra reenfileirar,
  seta `status='queued'` direto (action `retry`, cron `requeue_failed_consultas`).

## O que ainda não foi testado

- Safari/iOS gravando em `audio/mp4` por pedaço (cada pedaço é arquivo inteiro,
  então o risco é menor que na v2.0 — mas precisa do celular do Rodrigo).
- Matar o Safari no meio e retomar.
- Modo avião no meio.
- Consulta de 1 hora de verdade.
