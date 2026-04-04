import { useState, useEffect } from 'react'
import { getConsulta } from '../lib/api'
import { track, Events } from '../lib/analytics'

const STEPS = [
  { id: 'upload', icon: '☁️', name: 'Gravação recebida', detail: 'Áudio salvo com segurança' },
  { id: 'queue', icon: '📋', name: 'Na fila de processamento', detail: 'Aguardando sua vez' },
  { id: 'transcribe', icon: '🎙️', name: 'Transcrição com Whisper', detail: 'Português médico (PT-BR)' },
  { id: 'analyze', icon: '🧠', name: 'Gerando prontuário com IA', detail: 'Estruturando consulta' },
  { id: 'deliver', icon: '📲', name: 'Enviando para WhatsApp', detail: 'Prontuário formatado' },
]

function stepFromStatus(status) {
  switch (status) {
    case 'uploaded': return 0
    case 'queued': return 1
    case 'processing': return 2
    case 'done': return 4
    case 'failed': return -1
    default: return 0
  }
}

export default function Status({ consulta, onNova }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [done, setDone] = useState(false)
  const [failed, setFailed] = useState(false)
  const [erro, setErro] = useState('')
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (!consulta?.id) return

    const interval = setInterval(async () => {
      try {
        const c = await getConsulta(consulta.id)
        if (!c) return

        if (c.status === 'done') {
          setCurrentStep(4)
          track(Events.PRONTUARIO_DONE)
          setTimeout(() => setDone(true), 1200)
          clearInterval(interval)
        } else if (c.status === 'failed') {
          track(Events.PRONTUARIO_FAILED, { erro: c.erro })
          setFailed(true)
          setErro(c.erro || 'Erro no processamento')
          clearInterval(interval)
        } else {
          const newStep = stepFromStatus(c.status)
          setCurrentStep(prev => Math.max(prev, newStep))
        }
      } catch {}
    }, 3000)

    const sim1 = setTimeout(() => setCurrentStep(s => Math.max(s, 1)), 2000)
    const sim2 = setTimeout(() => setCurrentStep(s => Math.max(s, 2)), 5000)
    const sim3 = setTimeout(() => setCurrentStep(s => Math.max(s, 3)), 12000)

    return () => {
      clearInterval(interval)
      clearTimeout(sim1)
      clearTimeout(sim2)
      clearTimeout(sim3)
    }
  }, [consulta?.id])

  const muted = { color: '#6b85a4' }
  const accent = '#2dd4bf'

  // ── TELA: SUCESSO ──
  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#060c14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif", position: 'relative', overflow: 'hidden' }}>
        {/* Glow de sucesso */}
        <div style={{ position: 'fixed', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0, width: 400, height: 400, top: '30%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 88, height: 88, borderRadius: 22, fontSize: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', marginBottom: 24, animation: 'fadeIn 0.5s ease' }}>
            <span style={{ animation: 'scaleIn 0.4s ease 0.2s both' }}>✓</span>
          </div>

          <div style={{ fontFamily: 'Georgia,serif', fontSize: 26, fontWeight: 600, marginBottom: 8, textAlign: 'center', letterSpacing: -0.3 }}>
            Prontuário a caminho!
          </div>

          <div style={{ fontSize: 15, ...muted, marginBottom: 6, textAlign: 'center' }}>
            Confira no seu WhatsApp em instantes.
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 14px', borderRadius: 20, background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)', color: accent, marginBottom: 36 }}>
            👤 {consulta.paciente_nome}
          </div>

          <button onClick={onNova} style={{ padding: '16px 40px', background: `linear-gradient(145deg, ${accent}, #60a5fa)`, border: 'none', borderRadius: 14, color: 'white', fontFamily: 'inherit', fontSize: 17, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 12px 40px rgba(45,212,191,0.2)', transition: 'transform 0.2s' }}>
            🎙️ Próximo paciente
          </button>
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
        `}</style>
      </div>
    )
  }

  // ── TELA: ERRO ──
  if (failed) {
    return (
      <div style={{ minHeight: '100vh', background: '#060c14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif" }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', marginBottom: 20 }}>!</div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 22, marginBottom: 8, textAlign: 'center' }}>Algo deu errado</div>
        <div style={{ fontSize: 14, ...muted, marginBottom: 24, textAlign: 'center', maxWidth: 320 }}>Sua gravação foi salva. Vamos tentar processar novamente.</div>
        <button onClick={onNova} style={{ padding: '14px 32px', background: `linear-gradient(145deg, ${accent}, #60a5fa)`, border: 'none', borderRadius: 12, color: 'white', fontFamily: 'inherit', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
          Tentar novamente
        </button>
      </div>
    )
  }

  // ── TELA: PROCESSANDO ──
  return (
    <div style={{ minHeight: '100vh', background: '#060c14', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px', color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif", position: 'relative', overflow: 'hidden' }}>
      {/* Glow animado */}
      <div style={{ position: 'fixed', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0, width: 500, height: 400, top: -100, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 70%)', animation: 'pulse 3s ease-in-out infinite' }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80 }}>

        {/* Ícone animado */}
        <div style={{ width: 100, height: 100, borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)', marginBottom: 28, position: 'relative' }}>
          <span style={{ fontSize: 44, animation: 'float 2s ease-in-out infinite' }}>🩺</span>
          {/* Spinner sutil ao redor */}
          <div style={{ position: 'absolute', inset: -4, borderRadius: 30, border: '2px solid transparent', borderTopColor: accent, animation: 'spin 2s linear infinite', opacity: 0.4 }} />
        </div>

        <div style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 600, marginBottom: 10, textAlign: 'center', letterSpacing: -0.3 }}>
          Recebemos sua consulta
        </div>

        <div style={{ fontSize: 14, color: '#a8c0d8', textAlign: 'center', lineHeight: 1.6, marginBottom: 16, maxWidth: 340 }}>
          Fique tranquilo, agora \u00e9 com a gente.
          <br />O prontu\u00e1rio chegar\u00e1 no seu WhatsApp em instantes.
        </div>

        {/* Steps colapsados — logo abaixo do título */}
        <div style={{
          width: '100%',
          maxHeight: showDetails ? 350 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.4s ease, opacity 0.3s ease, margin 0.3s ease',
          opacity: showDetails ? 1 : 0,
          marginBottom: showDetails ? 16 : 0,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {STEPS.map((step, i) => {
              const st = i < currentStep ? 'done' : i === currentStep ? 'run' : 'wait'
              return (
                <div key={step.id} style={{
                  background: '#0c1622', borderRadius: 10, padding: '10px 12px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  opacity: st === 'wait' ? 0.3 : 1,
                  border: st === 'run' ? '1px solid rgba(45,212,191,0.2)' : st === 'done' ? '1px solid rgba(74,222,128,0.15)' : '1px solid rgba(99,179,237,0.06)',
                  transition: 'all 0.4s'
                }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: st === 'run' ? 'rgba(45,212,191,0.12)' : st === 'done' ? 'rgba(74,222,128,0.1)' : '#101e30' }}>{step.icon}</div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{step.name}</div>
                  <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 14, background: st === 'run' ? 'rgba(45,212,191,0.12)' : st === 'done' ? 'rgba(74,222,128,0.1)' : 'rgba(107,133,164,0.1)', color: st === 'run' ? '#2dd4bf' : st === 'done' ? '#4ade80' : '#6b85a4' }}>
                    {st === 'wait' ? '...' : st === 'run' ? 'processando' : '✓'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '5px 12px', borderRadius: 20, background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.12)', color: accent, marginBottom: 16 }}>
          👤 {consulta.paciente_nome}
        </div>

        {/* Botão nova consulta */}
        <button onClick={onNova} style={{ width: '100%', padding: '16px', background: `linear-gradient(145deg, ${accent}, #60a5fa)`, border: 'none', borderRadius: 14, color: 'white', fontFamily: 'inherit', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 30px rgba(45,212,191,0.15)', marginBottom: 20 }}>
          🎙️ Gravar pr\u00f3ximo paciente
        </button>

        {/* Acompanhar — abaixo do botão, mais visível */}
        <button
          onClick={() => setShowDetails(d => !d)}
          style={{ background: '#0c1622', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 12, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, color: '#6b85a4', width: '100%', justifyContent: 'center', marginBottom: 8 }}
        >
          <span style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', display: 'inline-block', fontSize: 10 }}>\u25bc</span>
          {showDetails ? 'Ocultar detalhes do processamento' : 'Acompanhar o processamento'}
        </button>

      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
