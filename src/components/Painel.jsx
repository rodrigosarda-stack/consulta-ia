import { useState, useEffect } from 'react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xzknmihhtgwggpndpivb.supabase.co'
const API_URL = `${SUPABASE_URL}/functions/v1/api`

function getSessionToken() {
  const raw = localStorage.getItem('maria_session')
  if (!raw) return null
  try { return JSON.parse(raw).session_token } catch { return null }
}

async function apiFetch(action, params = {}) {
  const token = getSessionToken()
  const qs = new URLSearchParams({ action, ...params })
  const res = await fetch(`${API_URL}?${qs}`, { headers: { 'X-Session-Token': token || '' } })
  return await res.json()
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
}

export default function Painel({ onBack }) {
  const [view, setView] = useState('pacientes') // pacientes | historico | timeline | prontuario
  const [pacientes, setPacientes] = useState([])
  const [prontuarios, setProntuarios] = useState([])
  const [timeline, setTimeline] = useState([])
  const [selected, setSelected] = useState(null) // prontuario selecionado
  const [selectedPaciente, setSelectedPaciente] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [paywall, setPaywall] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const accent = '#2dd4bf'
  const muted = { color: '#6b85a4' }
  const card = { background: '#0c1622', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 14, padding: 15, marginBottom: 10, cursor: 'pointer' }

  useEffect(() => { loadPacientes() }, [])

  async function loadPacientes() {
    setLoading(true)
    const data = await apiFetch('pacientes')
    if (data.paywall) { setPaywall(true); setLoading(false); return }
    setPacientes(data.pacientes || [])
    setLoading(false)
  }

  async function loadHistorico(p = 1, q = '') {
    setLoading(true)
    setView('historico')
    const data = await apiFetch('historico', { page: String(p), q })
    if (data.paywall) { setPaywall(true); setLoading(false); return }
    setProntuarios(data.prontuarios || [])
    setTotal(data.total || 0)
    setPage(p)
    setLoading(false)
  }

  async function loadTimeline(nome) {
    setLoading(true)
    setSelectedPaciente(nome)
    setView('timeline')
    const data = await apiFetch('timeline', { paciente: nome })
    if (data.paywall) { setPaywall(true); setLoading(false); return }
    setTimeline(data.timeline || [])
    setLoading(false)
  }

  function openProntuario(p) {
    setSelected(p)
    setView('prontuario')
  }

  // --- PAYWALL ---
  if (paywall) {
    return (
      <div style={{ minHeight: '100vh', background: '#060c14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>Histórico de prontuários</div>
        <div style={{ fontSize: 15, ...muted, marginBottom: 24, textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
          Acesse todos os seus prontuários, busque por paciente e acompanhe a timeline de cada um.
        </div>
        <div style={{ padding: '14px 28px', background: `linear-gradient(145deg, ${accent}, #60a5fa)`, borderRadius: 12, color: 'white', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
          Em breve — Plano MarIA
        </div>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#6b85a4', fontFamily: 'inherit', fontSize: 14, cursor: 'pointer', padding: 10 }}>
          Voltar ao gravador
        </button>
      </div>
    )
  }

  // --- PRONTUARIO DETALHADO ---
  if (view === 'prontuario' && selected) {
    return (
      <div style={{ minHeight: '100vh', background: '#060c14', color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif", padding: '44px 20px 40px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <button onClick={() => setView(selectedPaciente ? 'timeline' : 'historico')} style={{ background: 'none', border: 'none', color: accent, fontFamily: 'inherit', fontSize: 14, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
            ← Voltar
          </button>

          <div style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
            {selected.paciente_nome || 'Paciente'}
          </div>
          <div style={{ fontSize: 13, ...muted, marginBottom: 20 }}>{formatDate(selected.created_at)}</div>

          <div style={{ ...card, cursor: 'default', whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7, color: '#a8c0d8' }}>
            {selected.prontuario_texto}
          </div>
        </div>
      </div>
    )
  }

  // --- TIMELINE DE UM PACIENTE ---
  if (view === 'timeline') {
    return (
      <div style={{ minHeight: '100vh', background: '#060c14', color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif", padding: '44px 20px 40px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <button onClick={() => { setView('pacientes'); setSelectedPaciente('') }} style={{ background: 'none', border: 'none', color: accent, fontFamily: 'inherit', fontSize: 14, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
            ← Pacientes
          </button>

          <div style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
            {selectedPaciente}
          </div>
          <div style={{ fontSize: 13, ...muted, marginBottom: 20 }}>{timeline.length} consulta{timeline.length !== 1 ? 's' : ''}</div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, ...muted }}>Carregando...</div>
          ) : timeline.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, ...muted }}>Nenhuma consulta encontrada</div>
          ) : timeline.map(p => (
            <div key={p.id} onClick={() => openProntuario(p)} style={card}>
              <div style={{ fontSize: 13, ...muted, marginBottom: 4 }}>{formatDate(p.created_at)}</div>
              <div style={{ fontSize: 14, color: '#e2eaf6', lineHeight: 1.5 }}>
                {p.prontuario?.resumo_curto || p.prontuario?.queixa_principal || 'Consulta registrada'}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- HISTORICO (busca) ---
  if (view === 'historico') {
    return (
      <div style={{ minHeight: '100vh', background: '#060c14', color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif", padding: '44px 20px 40px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <button onClick={() => setView('pacientes')} style={{ background: 'none', border: 'none', color: accent, fontFamily: 'inherit', fontSize: 14, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
            ← Pacientes
          </button>

          <div style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Buscar prontuários</div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadHistorico(1, search)}
              placeholder="Buscar por paciente, diagnóstico..."
              style={{ flex: 1, padding: '12px 14px', background: '#0c1622', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 10, color: '#e2eaf6', fontFamily: 'inherit', fontSize: 14, outline: 'none' }}
            />
            <button onClick={() => loadHistorico(1, search)} style={{ padding: '12px 16px', background: accent, border: 'none', borderRadius: 10, color: '#060c14', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Buscar
            </button>
          </div>

          <div style={{ fontSize: 13, ...muted, marginBottom: 12 }}>{total} resultado{total !== 1 ? 's' : ''}</div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, ...muted }}>Carregando...</div>
          ) : prontuarios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, ...muted }}>Nenhum prontuário encontrado</div>
          ) : (
            <>
              {prontuarios.map(p => (
                <div key={p.id} onClick={() => openProntuario(p)} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{p.paciente_nome || 'Paciente'}</span>
                    <span style={{ fontSize: 12, ...muted }}>{formatDate(p.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 13, ...muted, lineHeight: 1.4 }}>
                    {p.prontuario?.resumo_curto || p.prontuario?.queixa_principal || 'Consulta registrada'}
                  </div>
                </div>
              ))}
              {total > prontuarios.length && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                  {page > 1 && <button onClick={() => loadHistorico(page - 1, search)} style={{ padding: '8px 16px', background: '#0c1622', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 8, color: '#6b85a4', cursor: 'pointer', fontFamily: 'inherit' }}>Anterior</button>}
                  <button onClick={() => loadHistorico(page + 1, search)} style={{ padding: '8px 16px', background: '#0c1622', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 8, color: '#6b85a4', cursor: 'pointer', fontFamily: 'inherit' }}>Próxima</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // --- PACIENTES (tela principal do painel) ---
  return (
    <div style={{ minHeight: '100vh', background: '#060c14', color: '#e2eaf6', fontFamily: "'Outfit',system-ui,sans-serif", padding: '44px 20px 40px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 600 }}>Meus pacientes</div>
            <div style={{ fontSize: 13, ...muted }}>{pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => loadHistorico(1, '')} style={{ padding: '8px 14px', background: '#0c1622', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 10, color: '#6b85a4', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
              🔍 Buscar
            </button>
            <button onClick={onBack} style={{ padding: '8px 14px', background: '#0c1622', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 10, color: '#6b85a4', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
              🎙️ Gravar
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, ...muted }}>Carregando...</div>
        ) : pacientes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, ...muted, lineHeight: 1.6 }}>Nenhum prontuário ainda.<br />Grave sua primeira consulta!</div>
            <button onClick={onBack} style={{ marginTop: 16, padding: '12px 24px', background: `linear-gradient(145deg, ${accent}, #60a5fa)`, border: 'none', borderRadius: 12, color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              🎙️ Gravar consulta
            </button>
          </div>
        ) : pacientes.map(p => (
          <div key={p.nome} onClick={() => loadTimeline(p.nome)} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(45,212,191,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{p.nome}</div>
                <div style={{ fontSize: 12, ...muted }}>{p.consultas} consulta{p.consultas !== 1 ? 's' : ''} · última {formatDate(p.ultima)}</div>
              </div>
              <span style={{ fontSize: 16, ...muted }}>›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
