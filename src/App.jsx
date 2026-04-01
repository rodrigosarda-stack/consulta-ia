import { useState, useEffect } from 'react'
import { getSession, onAuthChange, getPhone, signOut } from './lib/auth'
import { getOrCreateUsuario } from './lib/api'
import Login from './components/Login'
import Recorder from './components/Recorder'
import Status from './components/Status'

export default function App() {
  const [session, setSession] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState('recorder') // recorder | status
  const [consulta, setConsulta] = useState(null)

  useEffect(() => {
    getSession().then(s => {
      setSession(s)
      setLoading(false)
    })
    const { data: { subscription } } = onAuthChange(s => {
      setSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setUsuario(null)
      return
    }
    const phone = getPhone(session)
    if (phone) {
      getOrCreateUsuario(phone).then(u => setUsuario(u))
    }
  }, [session])

  async function handleLogin(newSession) {
    setSession(newSession)
  }

  async function handleLogout() {
    await signOut()
    setSession(null)
    setUsuario(null)
    setScreen('recorder')
    setConsulta(null)
  }

  function handleConsultaCriada(c) {
    setConsulta(c)
    setScreen('status')
  }

  function handleNova() {
    setConsulta(null)
    setScreen('recorder')
    const phone = getPhone(session)
    if (phone) getOrCreateUsuario(phone).then(u => setUsuario(u))
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#060c14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b85a4', fontFamily: "'Outfit',system-ui,sans-serif" }}>
        Carregando...
      </div>
    )
  }

  if (!session) {
    return <Login onLogin={handleLogin} />
  }

  if (!usuario) {
    return (
      <div style={{ minHeight: '100vh', background: '#060c14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b85a4', fontFamily: "'Outfit',system-ui,sans-serif" }}>
        Carregando perfil...
      </div>
    )
  }

  const telefone = getPhone(session)

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
