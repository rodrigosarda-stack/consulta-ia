const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xzknmihhtgwggpndpivb.supabase.co'
const API_URL = `${SUPABASE_URL}/functions/v1/api`

// Pega o SESSION token (não o auth token da URL)
function getSessionToken() {
  const raw = localStorage.getItem('maria_session')
  if (!raw) return null
  try {
    return JSON.parse(raw).session_token
  } catch {
    return null
  }
}

async function apiFetch(action, params = {}, options = {}) {
  const token = getSessionToken()
  const qs = new URLSearchParams({ action, ...params })
  const res = await fetch(`${API_URL}?${qs}`, {
    ...options,
    headers: {
      'X-Session-Token': token || '',
      ...(options.headers || {}),
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`)
  return data
}

export async function getUsuario() {
  const data = await apiFetch('usuario')
  return data.usuario
}

export async function uploadAndCreateConsulta(telefone, pacienteNome, blob, duracao) {
  const token = getSessionToken()
  const formData = new FormData()
  formData.append('audio', blob, 'audio.webm')
  formData.append('paciente_nome', pacienteNome)
  formData.append('duracao', String(duracao))

  const res = await fetch(`${API_URL}?action=upload`, {
    method: 'POST',
    headers: { 'X-Session-Token': token || '' },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Upload error ${res.status}`)
  return data.consulta
}

export async function getConsulta(id) {
  const data = await apiFetch('consulta', { id })
  return data.consulta
}

export async function getProntuario(consultaId) {
  const data = await apiFetch('prontuario', { consulta_id: consultaId })
  return data.prontuario
}

export function canRecord() {
  return true
}

export function isInTrial() {
  return false
}
