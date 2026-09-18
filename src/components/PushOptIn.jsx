import { useEffect, useState } from 'react'
import { isPushSupported, registerServiceWorker, getExistingSubscription, subscribeToPush } from '../lib/push'
import { pushSubscribe } from '../lib/api'

const DISMISS_KEY = 'push_optin_dismissed_at'
const DISMISS_DAYS = 7

function foiDispensadoRecentemente() {
  const raw = localStorage.getItem(DISMISS_KEY)
  if (!raw) return false
  return Date.now() - Number(raw) < DISMISS_DAYS * 24 * 60 * 60 * 1000
}

// Banner discreto oferecendo notificação do app em vez de depender do WhatsApp
// (a janela grátis da Meta acaba 01/10/2026). Só aparece se: o navegador
// suporta push, ainda não há inscrição ativa, e o médico não dispensou há pouco.
export default function PushOptIn() {
  const [visivel, setVisivel] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!isPushSupported() || foiDispensadoRecentemente()) return
    registerServiceWorker().then(async () => {
      const existente = await getExistingSubscription()
      if (!existente && Notification.permission !== 'denied') setVisivel(true)
    })
  }, [])

  async function ativar() {
    setCarregando(true)
    setErro('')
    try {
      const sub = await subscribeToPush()
      await pushSubscribe(sub.toJSON())
      setVisivel(false)
    } catch (err) {
      setErro(err.message || 'Não deu pra ativar agora')
    } finally {
      setCarregando(false)
    }
  }

  function dispensar() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisivel(false)
  }

  if (!visivel) return null

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#0c1622', borderBottom: '1px solid rgba(45,212,191,0.25)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontFamily: "'Outfit',system-ui,sans-serif" }}>
      <span style={{ fontSize: 18 }}>🔔</span>
      <div style={{ flex: 1, minWidth: 200, fontSize: 13, color: '#e2eaf6' }}>
        Ative notificações do app — o prontuário chega mais rápido e sem depender do WhatsApp.
        {erro && <div style={{ color: '#f87171', fontSize: 12, marginTop: 2 }}>{erro}</div>}
      </div>
      <button onClick={ativar} disabled={carregando} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #2dd4bf, #60a5fa)', color: '#04121a', fontWeight: 600, fontSize: 13, cursor: carregando ? 'default' : 'pointer', fontFamily: 'inherit', opacity: carregando ? 0.7 : 1 }}>
        {carregando ? 'Ativando...' : 'Ativar'}
      </button>
      <button onClick={dispensar} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(99,179,237,0.15)', background: 'transparent', color: '#6b85a4', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
        Agora não
      </button>
    </div>
  )
}
