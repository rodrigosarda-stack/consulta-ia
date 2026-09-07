// gravador.js — gravação em pedaços, fila offline e detector de silêncio.
//
// Por que existe (07/09/2026): até aqui o gravador guardava a consulta inteira
// na memória do navegador e subia um arquivo só no fim. Celular morre, aba
// fecha, 4G cai → perde tudo. Agora cada pedaço vai pro servidor assim que
// sai do microfone; o que não subiu fica no IndexedDB e sobe quando a rede
// voltar. No fim, o servidor junta (action=finalize).

const DB = 'maria_gravador'
const PEDACOS = 'pedacos'   // { chave, sessao, seq, blob, criado }
const SESSOES = 'sessoes'   // { sessao, paciente, pacienteTel, mime, inicio, ultimoSeq }

function abrir() {
  return new Promise((ok, erro) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(PEDACOS)) {
        db.createObjectStore(PEDACOS, { keyPath: 'chave' }).createIndex('sessao', 'sessao')
      }
      if (!db.objectStoreNames.contains(SESSOES)) db.createObjectStore(SESSOES, { keyPath: 'sessao' })
    }
    req.onsuccess = () => ok(req.result)
    req.onerror = () => erro(req.error)
  })
}

function tx(db, store, modo, fn) {
  return new Promise((ok, erro) => {
    const t = db.transaction(store, modo)
    const r = fn(t.objectStore(store))
    t.oncomplete = () => ok(r && r.result)
    t.onerror = () => erro(t.error)
  })
}

const chaveDe = (sessao, seq) => `${sessao}:${String(seq).padStart(5, '0')}`

export async function salvarSessao(meta) {
  const db = await abrir()
  await tx(db, SESSOES, 'readwrite', s => s.put(meta))
}

export async function lerSessoes() {
  const db = await abrir()
  return (await tx(db, SESSOES, 'readonly', s => s.getAll())) || []
}

export async function pedacosDaSessao(sessao) {
  const db = await abrir()
  const todos = (await tx(db, PEDACOS, 'readonly', s => s.index('sessao').getAll(sessao))) || []
  return todos.sort((a, b) => a.seq - b.seq)
}

export async function apagarSessao(sessao) {
  const db = await abrir()
  const pend = await pedacosDaSessao(sessao)
  await tx(db, PEDACOS, 'readwrite', s => { for (const p of pend) s.delete(p.chave) })
  await tx(db, SESSOES, 'readwrite', s => s.delete(sessao))
}

async function guardarPedaco(sessao, seq, blob, dur) {
  const db = await abrir()
  await tx(db, PEDACOS, 'readwrite', s => s.put({ chave: chaveDe(sessao, seq), sessao, seq, blob, dur, criado: Date.now() }))
}

async function apagarPedaco(chave) {
  const db = await abrir()
  await tx(db, PEDACOS, 'readwrite', s => s.delete(chave))
}

// Fila de envio: um pedaço por vez, em ordem. Falhou → espera e tenta de novo
// (2 s, 4 s, 8 s… até 30 s). Quando a rede volta, tenta na hora.
//   enviar(sessao, seq, blob, dur) — faz o POST; deve lançar se falhar
//   aoMudar(pendentes, erro)       — pra UI mostrar quantos faltam
//   aoResposta(seq, resposta)      — o servidor responde se a consulta parece ter terminado
export function criarFila({ enviar, aoMudar, aoResposta }) {
  const pendentes = new Map()
  let rodando = false, espera = 2000, parado = false

  async function ciclo() {
    if (rodando) return
    rodando = true
    while (!parado && pendentes.size) {
      const [chave, p] = [...pendentes.entries()].sort((a, b) => a[1].seq - b[1].seq)[0]
      try {
        const resposta = await enviar(p.sessao, p.seq, p.blob, p.dur)
        pendentes.delete(chave)
        await apagarPedaco(chave)
        espera = 2000
        aoMudar?.(pendentes.size, null)
        aoResposta?.(p.seq, resposta)
      } catch (e) {
        if (e?.permanente) {
          // servidor disse que essa sessão não aceita mais pedaços (ex.: não é saúde) — descarta tudo dela
          for (const [k, q] of [...pendentes.entries()]) if (q.sessao === p.sessao) { pendentes.delete(k); apagarPedaco(k).catch(() => {}) }
          aoMudar?.(pendentes.size, e)
          aoResposta?.(p.seq, { nao_saude: e.message === 'nao_saude', nao_saude_motivo: e.motivo || '', terminou: null })
          continue
        }
        aoMudar?.(pendentes.size, e)
        await new Promise(r => setTimeout(r, espera))
        espera = Math.min(espera * 2, 30000)
      }
    }
    rodando = false
  }

  const aoVoltarRede = () => { espera = 2000; ciclo() }
  window.addEventListener('online', aoVoltarRede)

  return {
    // guarda no IndexedDB ANTES de tentar enviar — se a aba morrer, está lá
    async adicionar(sessao, seq, blob, dur) {
      await guardarPedaco(sessao, seq, blob, dur)
      pendentes.set(chaveDe(sessao, seq), { sessao, seq, blob, dur })
      aoMudar?.(pendentes.size, null)
      ciclo()
    },
    // retoma o que ficou no IndexedDB de uma gravação anterior
    async carregar(sessao) {
      for (const p of await pedacosDaSessao(sessao)) pendentes.set(p.chave, p)
      aoMudar?.(pendentes.size, null)
      ciclo()
    },
    pendentes: () => pendentes.size,
    async esperarVazia(timeoutMs = 120000, aoTick) {
      const fim = Date.now() + timeoutMs
      let ultimo = -1
      while (pendentes.size && Date.now() < fim) {
        if (pendentes.size !== ultimo) { ultimo = pendentes.size; aoTick?.(ultimo) }
        await new Promise(r => setTimeout(r, 300))
      }
      return pendentes.size === 0
    },
    parar() { parado = true; window.removeEventListener('online', aoVoltarRede) },
  }
}

// Detector de silêncio: mede o volume do microfone 4x por segundo. Sem fala
// por limiteMs → aoSilencio(). Caso comum: médico esquece de parar e a gente
// transcreveria uma hora de sala vazia (e pagaria por ela).
export function criarDetectorSilencio(stream, { limiar = 0.012, limiarSom = 0.005, limiteMs = 5 * 60000, aoTick, aoSilencio }) {
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return { parar() {} }
  const ctx = new Ctx()
  ctx.resume?.().catch?.(() => {})   // iOS começa suspenso
  const src = ctx.createMediaStreamSource(stream)
  const an = ctx.createAnalyser()
  an.fftSize = 1024
  src.connect(an)
  const buf = new Float32Array(an.fftSize)
  let ultimaFala = Date.now(), ultimoSom = Date.now(), disparou = false

  const timer = setInterval(() => {
    an.getFloatTimeDomainData(buf)
    let soma = 0
    for (let i = 0; i < buf.length; i++) soma += buf[i] * buf[i]
    const rms = Math.sqrt(soma / buf.length)
    const agora = Date.now()
    if (rms > limiar) ultimaFala = agora
    if (rms > limiarSom) ultimoSom = agora      // qualquer som acima do ruído de fundo — fala baixa conta
    const semFalaMs = agora - ultimaFala
    aoTick?.({ rms, semFalaMs })
    if (!disparou && semFalaMs >= limiteMs) { disparou = true; aoSilencio?.(semFalaMs) }
  }, 250)

  return {
    semFalaMs: () => Date.now() - ultimaFala,   // o gravador usa pra cortar o pedaço numa pausa
    semSomMs: () => Date.now() - ultimoSom,     // o gravador usa pra NÃO ENVIAR pedaço mudo (limiar bem mais baixo)
    parar() {
      clearInterval(timer)
      try { src.disconnect(); ctx.close() } catch {}
    },
  }
}

// Gravador em pedaços: reinicia o MediaRecorder a cada pedaço, então cada
// pedaço é um ARQUIVO COMPLETO (com cabeçalho) e pode ser transcrito sozinho,
// assim que chega.
//
// ONDE cortar importa (Rodrigo, 07/09: "picotar de 30 em 30 não prejudica?").
// Cortar no relógio parte palavra ao meio ("losar-" | "-tana") e o Whisper
// perde as duas metades. Então: a partir de minMs, corta numa PAUSA de fala
// (o detector de silêncio já mede o volume 4x/s) — de preferência 2 s, relaxando
// conforme o pedaço cresce; se ninguém pausar, corta em maxMs. E o pedaço novo começa 2 s ANTES do antigo parar (ideia do
// Rodrigo — "começa a gravar o segundo dois segundos antes do término do primeiro"):
// a palavra da fronteira sai inteira em pelo menos um dos dois — o servidor
// costura a repetição.
//   semFala()               → ms desde a última fala (vem do detector)
//   aoPedaco(blob, seq, duracaoSeg)
// Sobreposição só onde precisa (Rodrigo, 07/09: "pra gente não gastar"): corte na
// pausa não tem palavra na fronteira → 0,3 s, só pra cobrir a demora do celular em
// começar a gravar. Corte forçado em maxMs (ninguém parou de falar) → 2 s. O custo
// da sobreposição cai de ~7% pra <1% do Whisper.
// Quando cortar (Rodrigo, 07/09: "só dá picote quando encontra dois segundos
// de pausa"). Pausa de 2 s é fim de frase de verdade; 0,35 s pode ser vírgula.
// Mas dois limites ficam: MÍNIMO de 20 s, porque o Groq cobra no mínimo 10 s
// por pedaço (pedaço de 3 s custa 10); e MÁXIMO, porque se ninguém pausa o
// pedaço cresce e é o que se perde se o celular morrer. Entre os dois, a
// exigência de pausa relaxa aos poucos:
//   20-35 s: pausa ≥ 2 s · 35-45 s: ≥ 1 s · 45-60 s: ≥ 0,35 s · 60 s: forçado
const PAUSA_POR_DURACAO = [[35_000, 2_000], [45_000, 1_000], [60_000, 350]]
function pausaExigida(durMs) { for (const [ate, pausa] of PAUSA_POR_DURACAO) if (durMs < ate) return pausa; return 0 }

// SILÊNCIO NÃO SAI DO CELULAR (Rodrigo, 07/09: "o médico começa a escrever e fica
// um minuto, dois, sem falar — e a gente vai ser cobrado por isso?"). O Whisper
// cobra por segundo de áudio e, pior, ALUCINA em silêncio ("Obrigado por
// assistir"). Então: pedaço em que não houve SOM NENHUM (limiar bem abaixo do de
// fala — fala baixa conta como som) é jogado fora a cada silencioRecicloMs e um
// novo começa; nada é enviado. Quando alguém volta a falar, o pedaço aberto tem
// no máximo 10 s de silêncio antes. seq só conta o que é enviado — a sequência
// fica contínua pro finalize.
export function criarGravadorEmPedacos(stream, { mime, bitrate, minMs = 20_000, maxMs = 60_000, sobreposicaoPausaMs = 300, sobreposicaoForcadaMs = 2_000, silencioRecicloMs = 10_000, semFala = () => 0, semSom = () => 0, aoPedaco, aoSilencioMudo }) {
  const opts = { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: bitrate }
  const vivos = new Set()
  let atual = null, seq = 0, parando = false, inicioAtual = 0, timerStop = null, houveSomNoAtual = false, mudoAvisado = false

  function novo() {
    const rec = new MediaRecorder(stream, opts)
    const partes = []
    const inicio = Date.now()
    rec.descartar = false
    rec.terminou = new Promise(res => {
      rec.ondataavailable = e => { if (e.data.size > 0) partes.push(e.data) }
      rec.onstop = () => {
        vivos.delete(rec)
        if (rec.descartar) { res(); return }                    // mudo: não vira pedaço, não sobe, não custa
        const blob = new Blob(partes, { type: rec.mimeType || mime || 'audio/webm' })
        const meuSeq = seq++                                     // numera só o que é enviado
        try { aoPedaco(blob, meuSeq, (Date.now() - inicio) / 1000) } finally { res() }
      }
    })
    rec.start()
    vivos.add(rec)
    inicioAtual = inicio
    houveSomNoAtual = false
    return rec
  }

  function girar(forcado) {
    if (parando) return
    const anterior = atual
    atual = novo()                                            // o novo já grava…
    timerStop = setTimeout(() => {                            // …o antigo ainda grava um pouco (sobreposição)
      timerStop = null
      if (anterior && anterior.state !== 'inactive') anterior.stop()
    }, forcado ? sobreposicaoForcadaMs : sobreposicaoPausaMs)
  }
  // pedaço mudo: joga fora e recomeça, sem sobreposição — não há nada pra emendar
  function reciclarMudo() {
    if (parando) return
    const anterior = atual
    atual = novo()
    if (anterior) { anterior.descartar = true; if (anterior.state !== 'inactive') anterior.stop() }
    if (!mudoAvisado) { mudoAvisado = true; aoSilencioMudo?.(true) }
  }

  atual = novo()
  // 4x por segundo: já passou do mínimo e há pausa? ou passou do máximo? → gira
  const relogio = setInterval(() => {
    if (parando) return
    const dur = Date.now() - inicioAtual
    if (semSom() < 250) { if (!houveSomNoAtual) { houveSomNoAtual = true; if (mudoAvisado) { mudoAvisado = false; aoSilencioMudo?.(false) } } }
    if (!houveSomNoAtual) { if (dur >= silencioRecicloMs) reciclarMudo(); return }   // mudo até agora: recicla a cada 10 s, não corta pra enviar
    if (dur >= maxMs) girar(true)                                        // ninguém pausou em 60 s: corte forçado, sobreposição longa
    else if (dur >= minMs && semFala() >= pausaExigida(dur)) girar(false) // pausa (2 s → 1 s → 0,35 s conforme o pedaço cresce): corte limpo
  }, 250)

  return {
    mimeType: () => atual?.mimeType || mime,
    totalPedacos: () => seq,
    // resolve quando TODOS os pedaços (inclusive o da sobreposição) foram entregues a aoPedaco
    parar() {
      parando = true
      clearInterval(relogio)
      if (timerStop) { clearTimeout(timerStop); timerStop = null }
      if (atual && !houveSomNoAtual) atual.descartar = true   // terminou em silêncio: o último pedaço não sobe
      const promessas = []
      for (const r of vivos) { promessas.push(r.terminou); if (r.state !== 'inactive') r.stop() }
      return Promise.all(promessas)
    },
  }
}
