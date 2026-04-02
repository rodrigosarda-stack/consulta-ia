const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xzknmihhtgwggpndpivb.supabase.co'
const API_BASE = `${SUPABASE_URL}/functions/v1/api`

// Token da sessão (salvo pelo auth.js)
function getToken() {
  const raw = sessionStorage.getItem('maria_session')
  if (!raw) return null
  try {
    return JSON.parse(raw).token
  } catch {
    return null
  }
}

async function apiFetch(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'X-Auth-Token': token || '',
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`)
  return data
}

// ── Usuário ──

export async function getUsuario() {
  const data = await apiFetch('/usuario')
  return data.usuario
}

// ── Upload de áudio (via Edge Function, não direto no storage) ──

export async function uploadAndCreateConsulta(telefone, pacienteNome, blob, duracao) {
  const formData = new FormData()
  formData.append('audio', blob, 'audio.webm')
  formData.append('paciente_nome', pacienteNome)
  formData.append('duracao', String(duracao))

  const data = await apiFetch('/upload', {
    method: 'POST',
    body: formData,
    // Não setar Content-Type — o browser seta com boundary pra FormData
    headers: {},
  })
  return data.consulta
}

// ── Consultas ──

export async function getConsulta(id) {
  const data = await apiFetch(`/consulta?id=${id}`)
  return data.consulta
}

// ── Prontuários ──

export async function getProntuario(consultaId) {
  const data = await apiFetch(`/prontuario?consulta_id=${consultaId}`)
  return data.prontuario
}

// ── Créditos (V4: ilimitado pra consultas de saúde) ──

export function isInTrial(usuario) {
  if (!usuario?.trial_fim) return false
  return new Date(usuario.trial_fim) > new Date()
}

export function canRecord() {
  return true // V4: grátis ilimitado
}
