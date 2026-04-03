import { useState } from 'react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xzknmihhtgwggpndpivb.supabase.co'
const API_URL = `${SUPABASE_URL}/functions/v1/api`

function getSessionToken() {
  const raw = localStorage.getItem('maria_session')
  if (!raw) return null
  try { return JSON.parse(raw).session_token } catch { return null }
}

const PLANOS = [
  {
    id: 'free',
    nome: 'Gratuito',
    preco: 'R$ 0',
    periodo: '',
    destaque: false,
    features: [
      'Consultas de saúde ilimitadas',
      'Prontuário no WhatsApp',
      '1 GB de áudio',
    ],
    naoInclui: [
      'Histórico de prontuários',
      'Busca por paciente',
      'Gravar qualquer conteúdo',
    ],
  },
  {
    id: 'maria',
    nome: 'MarIA',
    preco: 'Em breve',
    periodo: '/mês',
    destaque: true,
    features: [
      'Tudo do Gratuito',
      'Histórico completo no painel',
      'Busca por paciente e diagnóstico',
      'Timeline de cada paciente',
      'Exportação de prontuários',
      'Gravar qualquer conteúdo',
      '50 GB de áudio (~2 anos)',
    ],
    naoInclui: [
      'Busca semântica por IA',
      'Perguntas ao histórico via IA',
    ],
  },
  {
    id: 'cerebro',
    nome: 'Cérebro',
    preco: 'Em breve',
    periodo: '/mês',
    destaque: false,
    features: [
      'Tudo do MarIA',
      'Prontuário com IA avançada (Haiku)',
      'Busca semântica por IA (RAG)',
      'Perguntas ao histórico via IA',
      '175 GB de áudio (~5 anos)',
    ],
    naoInclui: [],
  },
]

export default function Planos({ planoAtual, onBack }) {
  const [loading, setLoading] = useState(null)
  const accent = '#2dd4bf'
  const muted = { color: '#6b85a4' }

  async function handleAssinar(planoId) {
    if (planoId === 'free' || planoId === planoAtual) return
    setLoading(planoId)

    try {
      const token = getSessionToken()
      const res = await fetch(`${API_URL}?action=checkout&plano=${planoId}`, {
        method: 'POST',
        headers: { 'X-Session-Token': token || '' },
      })
      const data = await res.json()

      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        alert(data.message || 'Em breve! Pagamentos ainda não estão disponíveis.')
      }
    } catch {
      alert('Erro ao processar. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060c14', color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif", padding: '44px 20px 40px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>

        <button onClick={onBack} style={{ background: 'none', border: 'none', color: accent, fontFamily: 'inherit', fontSize: 14, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
          ← Voltar
        </button>

        <div style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 600, marginBottom: 6 }}>
          Escolha seu plano
        </div>
        <div style={{ fontSize: 14, ...muted, marginBottom: 24, lineHeight: 1.5 }}>
          Consultas de saúde são sempre gratuitas e ilimitadas.
          <br />Os planos pagos desbloqueiam o painel de histórico e IA avançada.
        </div>

        {PLANOS.map(plano => {
          const isAtual = plano.id === planoAtual
          const isDestaque = plano.destaque

          return (
            <div key={plano.id} style={{
              background: isDestaque ? 'rgba(45,212,191,0.05)' : '#0c1622',
              border: isDestaque ? `2px solid ${accent}44` : '1px solid rgba(99,179,237,0.1)',
              borderRadius: 16,
              padding: '20px 18px',
              marginBottom: 12,
              position: 'relative',
            }}>
              {isDestaque && (
                <div style={{ position: 'absolute', top: -10, right: 16, background: accent, color: '#060c14', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, letterSpacing: 0.5 }}>
                  RECOMENDADO
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{plano.nome}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: isDestaque ? accent : '#e2eaf6', marginTop: 4 }}>
                    {plano.preco}<span style={{ fontSize: 14, fontWeight: 400, ...muted }}>{plano.periodo}</span>
                  </div>
                </div>
                {isAtual && (
                  <div style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'rgba(74,222,128,0.12)', color: '#4ade80', fontWeight: 600 }}>
                    Seu plano
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {plano.features.map(f => (
                  <div key={f} style={{ fontSize: 13, color: '#a8c0d8', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
                {plano.naoInclui.map(f => (
                  <div key={f} style={{ fontSize: 13, color: '#4a5568', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0 }}>✕</span> {f}
                  </div>
                ))}
              </div>

              {!isAtual && plano.id !== 'free' && (
                <button
                  onClick={() => handleAssinar(plano.id)}
                  disabled={loading === plano.id}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: isDestaque ? `linear-gradient(145deg, ${accent}, #60a5fa)` : '#101e30',
                    border: isDestaque ? 'none' : '1px solid rgba(99,179,237,0.15)',
                    borderRadius: 10,
                    color: isDestaque ? 'white' : '#6b85a4',
                    fontFamily: 'inherit',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {loading === plano.id ? 'Processando...' : `Assinar ${plano.nome}`}
                </button>
              )}
            </div>
          )
        })}

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, ...muted, lineHeight: 1.5 }}>
          Cancele quando quiser. Sem multa, sem compromisso.
          <br />Pagamento via PIX, cartão ou boleto.
        </div>
      </div>
    </div>
  )
}
