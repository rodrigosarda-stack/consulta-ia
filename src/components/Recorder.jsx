import { useState, useRef } from 'react'
import { uploadAudio, criarConsulta, canRecord, isInTrial } from '../lib/api'

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function Recorder({ usuario, telefone, onConsultaCriada, onLogout }) {
  const [mode, setMode] = useState('presencial')
  const [isRec, setIsRec] = useState(false)
  const [secs, setSecs] = useState(0)
  const [patient, setPatient] = useState('')
  const [permErr, setPermErr] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const secsRef = useRef(0)
  const wakeLockRef = useRef(null)

  // Wake Lock: mantém tela ligada durante gravação
  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      }
    } catch {}
  }
  function releaseWakeLock() {
    if (wakeLockRef.current) {
      wakeLockRef.current.release()
      wakeLockRef.current = null
    }
  }

  const isTele = mode === 'tele'
  const accent = isTele ? '#a78bfa' : (isRec ? '#f87171' : '#2dd4bf')
  const btnGrad = isRec
    ? 'linear-gradient(145deg,#ef4444,#f97316)'
    : isTele
      ? 'linear-gradient(145deg,#a78bfa,#60a5fa)'
      : 'linear-gradient(145deg,#2dd4bf,#60a5fa)'

  // Créditos info
  const inTrial = isInTrial(usuario)
  const trialDias = inTrial ? Math.ceil((new Date(usuario.trial_fim) - new Date()) / (1000 * 60 * 60 * 24)) : 0
  const allowed = canRecord(usuario)

  function startTimer() {
    secsRef.current = 0; setSecs(0)
    timerRef.current = setInterval(() => { secsRef.current++; setSecs(secsRef.current) }, 1000)
  }
  function stopTimer() { clearInterval(timerRef.current) }

  async function toggleRecord() { if (!isRec) await startRec(); else stopRec() }

  async function startRec() {
    if (!patient.trim()) {
      setPermErr('Informe o nome do paciente antes de gravar.')
      return
    }
    if (!allowed) {
      setPermErr('Créditos esgotados. Indique um colega para +3 dias ou assine um plano.')
      return
    }
    setPermErr('')
    try {
      let stream
      if (isTele) {
        const scr = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        try {
          const mic = await navigator.mediaDevices.getUserMedia({ audio: true })
          stream = new MediaStream([...scr.getTracks(), ...mic.getAudioTracks()])
        } catch { stream = scr }
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      }
      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
        .find(t => MediaRecorder.isTypeSupported(t)) || ''
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {})
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => { stream.getTracks().forEach(t => t.stop()); handleUpload() }
      recorder.start(1000)
      recorderRef.current = recorder
      setIsRec(true); startTimer()
      requestWakeLock()
    } catch (e) {
      setPermErr(e.name === 'NotAllowedError'
        ? 'Permissão negada. Clique no ícone 🔒 na barra de endereço → Permissões → Microfone → Permitir.'
        : 'Erro: ' + e.message)
    }
  }

  function stopRec() {
    stopTimer(); setIsRec(false)
    releaseWakeLock()
    if (recorderRef.current?.state !== 'inactive') recorderRef.current.stop()
  }

  async function handleUpload() {
    setUploading(true)
    setUploadProgress('Enviando gravação...')
    try {
      const blob = new Blob(chunksRef.current, { type: recorderRef.current?.mimeType || 'audio/webm' })
      const duracao = secsRef.current

      setUploadProgress('Fazendo upload...')
      const { path, size } = await uploadAudio(telefone, blob, duracao)

      setUploadProgress('Criando consulta...')
      const consulta = await criarConsulta(telefone, patient.trim(), path, size, duracao)

      onConsultaCriada(consulta)
    } catch (e) {
      setUploading(false)
      setPermErr('Erro no upload: ' + e.message)
    }
  }

  const card = { background: '#0c1622', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 14, padding: 15, marginBottom: 10 }
  const muted = { color: '#6b85a4' }

  if (uploading) {
    return (
      <div style={{ minHeight: '100vh', background: '#060c14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2dd4bf, #60a5fa)', marginBottom: 20 }}>☁️</div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 22, marginBottom: 8 }}>{uploadProgress}</div>
        <div style={{ fontSize: 14, ...muted }}>Não feche esta tela.</div>
      </div>
    )
  }

  return (
    <div style={{ background: '#060c14', color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0 40px', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient glow */}
      <div style={{ position: 'fixed', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0, width: 500, height: 400, top: -120, left: '50%', transform: 'translateX(-50%)', background: `radial-gradient(circle,${isTele ? 'rgba(167,139,250,0.07)' : isRec ? 'rgba(248,113,113,0.09)' : 'rgba(45,212,191,0.07)'} 0%,transparent 70%)`, transition: 'background 0.8s' }} />

      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, padding: '0 20px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '44px 0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isTele ? 'linear-gradient(135deg,#a78bfa,#60a5fa)' : 'linear-gradient(135deg,#2dd4bf,#60a5fa)', transition: 'background 0.5s' }}>🩺</div>
            <span style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>
              Consulta<span style={{ color: accent, transition: 'color 0.5s' }}>IA</span>
            </span>
          </div>
          <button onClick={onLogout} style={{ fontSize: 11, ...muted, background: '#101e30', border: '1px solid rgba(99,179,237,0.1)', padding: '5px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontFamily: 'inherit' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
            {telefone.replace('+55', '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
          </button>
        </div>

        {/* Status bar */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '10px 15px' }}>
          {inTrial ? (
            <>
              <span style={{ fontSize: 12, color: '#4ade80' }}>Trial ativo</span>
              <span style={{ fontSize: 12, ...muted }}>{trialDias} dia{trialDias !== 1 ? 's' : ''} restante{trialDias !== 1 ? 's' : ''} — ilimitado</span>
            </>
          ) : usuario.plano === 'free' ? (
            <>
              <span style={{ fontSize: 12, color: accent }}>{usuario.creditos_hoje}/3 consultas hoje</span>
              <span style={{ fontSize: 12, ...muted, cursor: 'pointer', color: accent }}>Indicar colega</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 12, color: '#4ade80' }}>Plano {usuario.plano === 'maria' ? 'MarIA' : 'Cérebro'}</span>
              <span style={{ fontSize: 12, ...muted }}>Ilimitado</span>
            </>
          )}
        </div>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[{ id: 'presencial', icon: '🎙️', label: 'Presencial', sub: 'Só microfone' }, { id: 'tele', icon: '🖥️', label: 'Teleconsulta', sub: 'Tela + mic' }].map(m => {
            const active = mode === m.id
            const col = m.id === 'tele' ? '#a78bfa' : '#2dd4bf'
            const dim = m.id === 'tele' ? 'rgba(167,139,250,0.15)' : 'rgba(45,212,191,0.15)'
            return (
              <button key={m.id} onClick={() => !isRec && setMode(m.id)} style={{ flex: 1, padding: '13px 10px', borderRadius: 14, cursor: isRec ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontFamily: 'inherit', border: active ? `1px solid ${col}44` : '1px solid rgba(99,179,237,0.1)', background: active ? dim : '#0c1622', transition: 'all 0.3s' }}>
                <span style={{ fontSize: 22 }}>{m.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: active ? col : '#6b85a4' }}>{m.label}</span>
                <span style={{ fontSize: 11, color: '#6b85a4', opacity: 0.7 }}>{m.sub}</span>
              </button>
            )
          })}
        </div>

        {isTele && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: 'rgba(167,139,250,0.9)', marginBottom: 12, lineHeight: 1.5 }}>
            O browser pedirá pra você escolher qual janela compartilhar.
          </div>
        )}

        {/* Patient */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 11, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isTele ? 'rgba(167,139,250,0.15)' : 'rgba(45,212,191,0.15)', flexShrink: 0, transition: 'background 0.5s' }}>👤</div>
          <input
            type="text"
            value={patient}
            onChange={e => setPatient(e.target.value)}
            placeholder="Nome do paciente"
            disabled={isRec}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e2eaf6', fontFamily: 'inherit', fontSize: 15 }}
          />
        </div>

        {/* Big record button */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '12px 0' }}>
          <div style={{ position: 'relative', width: 196, height: 196, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[{ s: 0, op: 1 }, { s: -16, op: 0.5 }, { s: -32, op: 0.2 }].map((r, i) => (
              <div key={i} style={{ position: 'absolute', borderRadius: '50%', top: r.s, left: r.s, right: r.s, bottom: r.s, border: isRec ? `1px solid rgba(248,113,113,${0.35 - i * 0.12})` : '1px solid rgba(99,179,237,0.1)', opacity: r.op, transition: 'border 0.5s' }} />
            ))}
            <button onClick={toggleRecord} disabled={!allowed && !isRec} style={{ width: 152, height: 152, borderRadius: '50%', border: 'none', background: !allowed && !isRec ? 'linear-gradient(145deg,#374151,#4b5563)' : btnGrad, cursor: !allowed && !isRec ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7, position: 'relative', zIndex: 1, boxShadow: isRec ? '0 20px 60px rgba(239,68,68,0.25)' : isTele ? '0 20px 60px rgba(167,139,250,0.2)' : '0 20px 60px rgba(45,212,191,0.18)', transition: 'all 0.35s' }}>
              <span style={{ fontSize: 38, lineHeight: 1 }}>{isRec ? '⏹' : isTele ? '🖥️' : '🎙️'}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'white', letterSpacing: 0.8, textTransform: 'uppercase' }}>{isRec ? 'Parar' : 'Gravar'}</span>
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 50, fontWeight: 300, letterSpacing: 3, color: isRec ? '#f87171' : '#e2eaf6', transition: 'color 0.3s', fontVariantNumeric: 'tabular-nums' }}>{fmt(secs)}</div>
            <div style={{ fontSize: 12, color: isRec ? 'rgba(248,113,113,0.65)' : '#6b85a4', marginTop: 4, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              {isRec ? (isTele ? 'Gravando teleconsulta...' : 'Gravando consulta...') : 'Pronto para gravar'}
            </div>
          </div>

          {isRec && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 36 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ width: 3, background: '#f87171', borderRadius: 3, animation: `wv ${0.6 + i * 0.05}s ease-in-out ${i * 0.04}s infinite alternate` }} />
              ))}
              <style>{`@keyframes wv{from{height:4px}to{height:28px}}`}</style>
            </div>
          )}
        </div>

        {/* Quick note */}
        <div style={{ ...card, marginBottom: 0 }}>
          <div style={{ fontSize: 11, ...muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Nota rápida (opcional)</div>
          <textarea rows={2} placeholder="Ex: Paciente com HAS, retorno..." style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#e2eaf6', fontFamily: 'inherit', fontSize: 14, resize: 'none', lineHeight: 1.5 }} />
        </div>

        {permErr && (
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginTop: 12, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, padding: '13px 14px', fontSize: 13, color: '#f87171', lineHeight: 1.5 }}>
            {permErr}
          </div>
        )}
      </div>
    </div>
  )
}
