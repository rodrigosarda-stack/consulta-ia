import { useState, useRef } from 'react'
import { uploadAndCreateConsulta, canRecord } from '../lib/api'
import { track, Events } from '../lib/analytics'

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function Recorder({ usuario, telefone, onConsultaCriada, onLogout, onPainel, onPlanos }) {
  const [mode, setMode] = useState('presencial')
  const [isRec, setIsRec] = useState(false)
  const [secs, setSecs] = useState(0)
  const [patient, setPatient] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [permErr, setPermErr] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [patientShake, setPatientShake] = useState(false)

  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const secsRef = useRef(0)
  const wakeLockRef = useRef(null)
  const patientRef = useRef(null)

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen')
    } catch {}
  }
  function releaseWakeLock() {
    if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null }
  }

  const isTele = mode === 'tele'
  const accent = isTele ? '#a78bfa' : (isRec ? '#f87171' : '#2dd4bf')
  const btnGrad = isRec
    ? 'linear-gradient(145deg,#ef4444,#f97316)'
    : isTele
      ? 'linear-gradient(145deg,#a78bfa,#60a5fa)'
      : 'linear-gradient(145deg,#2dd4bf,#60a5fa)'

  const allowed = canRecord()

  function startTimer() {
    secsRef.current = 0; setSecs(0)
    timerRef.current = setInterval(() => { secsRef.current++; setSecs(secsRef.current) }, 1000)
  }
  function stopTimer() { clearInterval(timerRef.current) }

  async function toggleRecord() { if (!isRec) await startRec(); else stopRec() }

  async function startRec() {
    if (!patient.trim()) {
      // Shake + foco no campo — visível sem scroll
      setPatientShake(true)
      setTimeout(() => setPatientShake(false), 600)
      patientRef.current?.focus()
      setPermErr('Informe o nome do paciente')
      return
    }
    setPermErr('')
    try {
      // Áudio de consentimento antes de gravar
      try {
        const utterance = new SpeechSynthesisUtterance('Gravação iniciada. Consulta documentada por inteligência artificial.')
        utterance.lang = 'pt-BR'
        utterance.rate = 1.1
        utterance.volume = 0.7
        speechSynthesis.speak(utterance)
      } catch {}

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
      track(Events.RECORDING_START, { mode })
    } catch (e) {
      setPermErr(e.name === 'NotAllowedError'
        ? 'Permissão de microfone negada. Toque no ícone de cadeado na barra de endereço e permita o microfone.'
        : 'Erro: ' + e.message)
    }
  }

  function stopRec() {
    const duracao = secsRef.current
    stopTimer(); setIsRec(false)
    releaseWakeLock()
    track(Events.RECORDING_STOP, { mode, duracao })
    if (recorderRef.current?.state !== 'inactive') recorderRef.current.stop()
  }

  async function handleUpload() {
    setUploading(true)
    setUploadProgress('Enviando gravação...')
    track(Events.UPLOAD_START)
    try {
      const blob = new Blob(chunksRef.current, { type: recorderRef.current?.mimeType || 'audio/webm' })
      const duracao = secsRef.current
      setUploadProgress('Enviando para processamento...')
      const consulta = await uploadAndCreateConsulta(telefone, patient.trim(), patientPhone.replace(/\D/g, ''), blob, duracao)
      track(Events.UPLOAD_SUCCESS, { duracao })
      onConsultaCriada(consulta)
    } catch (e) {
      track(Events.UPLOAD_ERROR, { error: e.message })
      setUploading(false)
      setPermErr('Erro no upload: ' + e.message)
    }
  }

  function formatPatientPhone(raw) {
    const digits = raw.replace(/\D/g, '')
    if (digits.length <= 2) return digits ? `(${digits}` : ''
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  const card = { background: '#0c1622', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 14, padding: 15 }
  const muted = { color: '#6b85a4' }
  const inputStyle = { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e2eaf6', fontFamily: 'inherit', fontSize: 15 }

  if (uploading) {
    return (
      <div style={{ minHeight: '100vh', background: '#060c14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2dd4bf, #60a5fa)', marginBottom: 20, position: 'relative' }}>
          ☁️
          <div style={{ position: 'absolute', inset: -3, borderRadius: 19, border: '2px solid transparent', borderTopColor: '#2dd4bf', animation: 'spin 1.5s linear infinite' }} />
        </div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 20, marginBottom: 8 }}>{uploadProgress}</div>
        <div style={{ fontSize: 14, ...muted }}>Não feche esta tela.</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
          <div style={{ display: 'flex', gap: 6 }}>
          {onPainel && <button onClick={onPainel} style={{ fontSize: 11, ...muted, background: '#101e30', border: '1px solid rgba(99,179,237,0.1)', padding: '5px 10px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit' }}>📋 Prontuários</button>}
          <button onClick={onLogout} style={{ fontSize: 11, ...muted, background: '#101e30', border: '1px solid rgba(99,179,237,0.1)', padding: '5px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontFamily: 'inherit' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
            {telefone.replace('+55', '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
          </button>
          </div>
        </div>

        {/* PACIENTE — primeiro, acima de tudo */}
        <div style={{
          ...card,
          marginBottom: 6,
          border: patientShake
            ? '1px solid rgba(248,113,113,0.5)'
            : !patient.trim()
              ? '1px solid rgba(45,212,191,0.3)'
              : '1px solid rgba(99,179,237,0.1)',
          animation: patientShake ? 'shake 0.4s ease' : 'none',
          transition: 'border-color 0.3s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isTele ? 'rgba(167,139,250,0.15)' : 'rgba(45,212,191,0.15)', flexShrink: 0, transition: 'background 0.5s' }}>👤</div>
            <input
              ref={patientRef}
              type="text"
              value={patient}
              onChange={e => { setPatient(e.target.value); if (permErr === 'Informe o nome do paciente') setPermErr('') }}
              placeholder={patientShake ? 'Digite o nome do paciente' : 'Nome do paciente'}
              disabled={isRec}
              autoFocus
              style={{ ...inputStyle, color: patientShake ? '#f87171' : '#e2eaf6' }}
            />
          </div>
          {/* Telefone do paciente */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(99,179,237,0.06)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99,179,237,0.08)', flexShrink: 0 }}>📱</div>
            <input
              type="tel"
              value={patientPhone}
              onChange={e => setPatientPhone(formatPatientPhone(e.target.value))}
              placeholder="Celular do paciente (opcional)"
              disabled={isRec}
              maxLength={16}
              style={{ ...inputStyle, fontSize: 14, color: '#a8c0d8' }}
            />
          </div>
        </div>

        {/* Erro — visível entre paciente e botão */}
        {permErr && (
          <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 6, textAlign: 'center' }}>
            {permErr}
          </div>
        )}

        {/* Mode selector — compacto */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {[{ id: 'presencial', icon: '🎙️', label: 'Presencial' }, { id: 'tele', icon: '🖥️', label: 'Teleconsulta' }].map(m => {
            const active = mode === m.id
            const col = m.id === 'tele' ? '#a78bfa' : '#2dd4bf'
            return (
              <button key={m.id} onClick={() => !isRec && setMode(m.id)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, cursor: isRec ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit', border: active ? `1px solid ${col}44` : '1px solid rgba(99,179,237,0.08)', background: active ? (m.id === 'tele' ? 'rgba(167,139,250,0.12)' : 'rgba(45,212,191,0.12)') : '#0c1622', transition: 'all 0.3s' }}>
                <span style={{ fontSize: 16 }}>{m.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: active ? col : '#6b85a4' }}>{m.label}</span>
              </button>
            )
          })}
        </div>

        {isTele && (
          <div style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'rgba(167,139,250,0.9)', marginBottom: 10, lineHeight: 1.5, textAlign: 'center' }}>
            O browser pedirá pra escolher qual janela compartilhar.
          </div>
        )}

        {/* BOTÃO DE GRAVAR */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '8px 0 12px' }}>
          <div style={{ position: 'relative', width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[{ s: 0, op: 1 }, { s: -14, op: 0.4 }, { s: -28, op: 0.15 }].map((r, i) => (
              <div key={i} style={{ position: 'absolute', borderRadius: '50%', top: r.s, left: r.s, right: r.s, bottom: r.s, border: isRec ? `1px solid rgba(248,113,113,${0.35 - i * 0.12})` : '1px solid rgba(99,179,237,0.1)', opacity: r.op, transition: 'border 0.5s' }} />
            ))}
            <button onClick={toggleRecord} style={{ width: 140, height: 140, borderRadius: '50%', border: 'none', background: btnGrad, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, position: 'relative', zIndex: 1, boxShadow: isRec ? '0 16px 50px rgba(239,68,68,0.25)' : isTele ? '0 16px 50px rgba(167,139,250,0.2)' : '0 16px 50px rgba(45,212,191,0.18)', transition: 'all 0.35s' }}>
              <span style={{ fontSize: 34, lineHeight: 1 }}>{isRec ? '⏹' : isTele ? '🖥️' : '🎙️'}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'white', letterSpacing: 0.8, textTransform: 'uppercase' }}>{isRec ? 'Parar' : 'Gravar'}</span>
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 44, fontWeight: 300, letterSpacing: 3, color: isRec ? '#f87171' : '#e2eaf6', transition: 'color 0.3s', fontVariantNumeric: 'tabular-nums' }}>{fmt(secs)}</div>
            <div style={{ fontSize: 11, color: isRec ? 'rgba(248,113,113,0.65)' : '#6b85a4', marginTop: 3, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              {isRec ? (isTele ? 'Gravando teleconsulta...' : 'Gravando consulta...') : 'Pronto para gravar'}
            </div>
          </div>

          {isRec && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ width: 3, background: '#f87171', borderRadius: 3, animation: `wv ${0.6 + i * 0.05}s ease-in-out ${i * 0.04}s infinite alternate` }} />
              ))}
            </div>
          )}
        </div>

        {/* Nota rápida */}
        {!isRec && (
          <div style={{ ...card, marginTop: 4 }}>
            <div style={{ fontSize: 10, ...muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Nota rápida (opcional)</div>
            <textarea rows={2} placeholder="Ex: Paciente com HAS, retorno..." style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#e2eaf6', fontFamily: 'inherit', fontSize: 13, resize: 'none', lineHeight: 1.5 }} />
          </div>
        )}

        {/* Consentimento LGPD */}
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#4a6a8a', lineHeight: 1.6, padding: '0 10px' }}>
          Ao gravar, voc\u00ea confirma que informou ao paciente sobre o uso de IA para documenta\u00e7\u00e3o cl\u00ednica.
          <br />
          <span style={{ cursor: 'pointer', color: accent, opacity: 0.7 }}>Termos de Uso</span>
          {' \u00b7 '}
          <span style={{ cursor: 'pointer', color: accent, opacity: 0.7 }}>Privacidade</span>
        </div>
      </div>

      <style>{`
        @keyframes wv{from{height:4px}to{height:24px}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
      `}</style>
    </div>
  )
}
