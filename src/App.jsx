import { useState, useEffect } from 'react'
import { getTokenFromURL, validateToken, getSessionFromStorage, saveSession, clearSession } from './lib/auth'
import { logoutServer } from './lib/api'
import { initAnalytics, identify, track, resetAnalytics, Events } from './lib/analytics'
import Recorder from './components/Recorder'
import Status from './components/Status'
import Painel from './components/Painel'
import Planos from './components/Planos'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [screen, setScreen] = useState('recorder') // recorder | status | painel
  const [consulta, setConsulta] = useState(null)

  useEffect(() => {
    initAnalytics()

    async function init() {
      const urlToken = getTokenFromURL()

      if (urlToken) {
        try {
          const data = await validateToken(urlToken)
          saveSession(data)
          setSession(data)
          identify(data.telefone, data.usuario)
          track(Events.LOGIN)
          window.history.replaceState({}, '', window.location.pathname)
        } catch (err) {
          clearSession()
          setError(err.message || 'Link inválido ou expirado')
        }
        setLoading(false)
        return
      }

      const stored = getSessionFromStorage()
      if (stored) {
        setSession(stored)
        identify(stored.telefone, stored.usuario)
      }
      setLoading(false)
    }
    init()
  }, [])

  function handleConsultaCriada(c) {
    setConsulta(c)
    setScreen('status')
  }

  function handleNova() {
    setConsulta(null)
    setScreen('recorder')
  }

  async function handleLogout() {
    track(Events.LOGOUT)
    resetAnalytics()
    await logoutServer()
    clearSession()
    setSession(null)
    setScreen('recorder')
    setConsulta(null)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#060c14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b85a4', fontFamily: "'Outfit',system-ui,sans-serif" }}>
        Carregando...
      </div>
    )
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: '#060c14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif" }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, fontSize: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2dd4bf, #60a5fa)', marginBottom: 16 }}>🩺</div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 28, fontWeight: 600, letterSpacing: -0.3, marginBottom: 8 }}>
          Consulta<span style={{ color: '#2dd4bf' }}>IA</span>
        </div>
        <div style={{ fontSize: 16, color: '#6b85a4', marginBottom: 24, textAlign: 'center' }}>
          Grava a consulta, prontuário sai pronto.
        </div>
        {error ? (
          <div style={{ padding: '14px 20px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, fontSize: 14, color: '#f87171', textAlign: 'center', maxWidth: 400 }}>
            {error}
          </div>
        ) : (
          <div style={{ padding: '14px 20px', background: '#0c1622', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 12, fontSize: 14, color: '#6b85a4', textAlign: 'center', maxWidth: 400 }}>
            Acesse pelo link que a MarIA enviou no seu WhatsApp.
          </div>
        )}
      </div>
    )
  }

  const { telefone, usuario } = session

  if (screen === 'status' && consulta) {
    return <Status consulta={consulta} onNova={handleNova} />
  }

  if (screen === 'painel') {
    return <Painel onBack={() => setScreen('recorder')} />
  }

  if (screen === 'planos') {
    return <Planos planoAtual={usuario?.plano || 'free'} onBack={() => setScreen('recorder')} />
  }

  return (
    <Recorder
      usuario={usuario}
      telefone={telefone}
      onConsultaCriada={handleConsultaCriada}
      onLogout={handleLogout}
      onPainel={() => setScreen('painel')}
      onPlanos={() => setScreen('planos')}
    />
  )
}
