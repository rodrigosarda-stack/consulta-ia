import { useState, useEffect } from 'react'
import { getConsulta, getProntuario } from '../lib/api'

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

  useEffect(() => {
    if (!consulta?.id) return

    // Poll status a cada 3 segundos
    const interval = setInterval(async () => {
      const c = await getConsulta(consulta.id)
      if (!c) return

      if (c.status === 'done') {
        setCurrentStep(4)
        setTimeout(() => setDone(true), 1500)
        clearInterval(interval)
      } else if (c.status === 'failed') {
        setFailed(true)
        setErro(c.erro || 'Erro no processamento')
        clearInterval(interval)
      } else {
        // NUNCA volta pra trás — só avança
        const newStep = stepFromStatus(c.status)
        setCurrentStep(prev => Math.max(prev, newStep))
      }
    }, 3000)

    // Simular progresso visual enquanto espera (uploaded → queued → processing)
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

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#060c14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif" }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.2)', marginBottom: 20 }}>✓</div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 24, marginBottom: 8, textAlign: 'center' }}>Prontuário enviado!</div>
        <div style={{ fontSize: 15, ...muted, marginBottom: 4, textAlign: 'center' }}>Confira no seu WhatsApp.</div>
        <div style={{ fontSize: 13, ...muted, marginBottom: 32, textAlign: 'center' }}>
          Paciente: {consulta.paciente_nome}
        </div>
        <button onClick={onNova} style={{ padding: '14px 32px', background: 'linear-gradient(145deg, #2dd4bf, #60a5fa)', border: 'none', borderRadius: 12, color: 'white', fontFamily: 'inherit', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          🎙️ Nova consulta
        </button>
      </div>
    )
  }

  if (failed) {
    return (
      <div style={{ minHeight: '100vh', background: '#060c14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif" }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.2)', marginBottom: 20 }}>✕</div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 24, marginBottom: 8 }}>Erro no processamento</div>
        <div style={{ fontSize: 14, color: '#f87171', marginBottom: 24 }}>{erro}</div>
        <button onClick={onNova} style={{ padding: '14px 32px', background: 'linear-gradient(145deg, #2dd4bf, #60a5fa)', border: 'none', borderRadius: 12, color: 'white', fontFamily: 'inherit', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060c14', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 24, marginBottom: 4 }}>Processando consulta...</div>
        <div style={{ fontSize: 13, ...muted, marginBottom: 8 }}>Paciente: {consulta.paciente_nome}</div>
        <div style={{ fontSize: 14, ...muted, marginBottom: 24 }}>Prontuário chega no seu WhatsApp em ~2 minutos.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {STEPS.map((step, i) => {
            const st = i < currentStep ? 'done' : i === currentStep ? 'run' : 'wait'
            return (
              <div key={step.id} style={{ background: '#0c1622', borderRadius: 14, padding: 15, display: 'flex', alignItems: 'center', gap: 13, opacity: st === 'wait' ? 0.35 : 1, border: st === 'run' ? '1px solid rgba(45,212,191,0.25)' : st === 'done' ? '1px solid rgba(74,222,128,0.2)' : '1px solid rgba(99,179,237,0.1)', transition: 'all 0.4s' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, fontSize: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: st === 'run' ? 'rgba(45,212,191,0.15)' : st === 'done' ? 'rgba(74,222,128,0.12)' : '#101e30', transition: 'background 0.3s' }}>{step.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{step.name}</div>
                  <div style={{ fontSize: 12, ...muted, marginTop: 2 }}>{step.detail}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, flexShrink: 0, background: st === 'run' ? 'rgba(45,212,191,0.15)' : st === 'done' ? 'rgba(74,222,128,0.12)' : 'rgba(107,133,164,0.15)', color: st === 'run' ? '#2dd4bf' : st === 'done' ? '#4ade80' : '#6b85a4' }}>
                  {st === 'wait' ? 'Aguardando' : st === 'run' ? 'Processando...' : '✓ Pronto'}
                </span>
              </div>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 13, ...muted }}>
          Não feche esta tela. Você também pode sair — o prontuário chega no WhatsApp de qualquer forma.
        </div>
      </div>
    </div>
  )
}
