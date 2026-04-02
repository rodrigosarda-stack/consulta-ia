import { useState, useEffect } from 'react'
import { getTokenFromURL, validateToken, getSessionFromStorage, saveSession, clearSession } from './lib/auth'
import Recorder from './components/Recorder'
import Status from './components/Status'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [screen, setScreen] = useState('recorder')
  const [consulta, setConsulta] = useState(null)

  useEffect(() => {
    async function init() {
      // 1. Tenta recuperar sessão existente
      const stored = getSessionFromStorage()
      if (stored) {
        setSession(stored)
        setLoading(false)
        return
      }

      // 2. Tenta validar token da URL
      const token = getTokenFromURL()
      if (token) {
        try {
          const data = await validateToken(token)
          // session_token vem do backend (diferente do auth token da URL)
          saveSession(data)
          setSession(data)
          // Limpa token da URL (não fica visível)
          window.history.replaceState({}, '', window.location.pathname)
        } catch (err) {
          setError(err.message || 'Link inválido ou expirado')
        }
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

  function handleLogout() {
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

  // Sem sessão e sem token = tela de boas-vindas
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

  return (
    <Recorder
      usuario={usuario}
      telefone={telefone}
      onConsultaCriada={handleConsultaCriada}
      onLogout={handleLogout}
    />
  )
}
