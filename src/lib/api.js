const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xzknmihhtgwggpndpivb.supabase.co'
const API_URL = `${SUPABASE_URL}/functions/v1/api`

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

export async function uploadAndCreateConsulta(telefone, pacienteNome, pacienteTel, blob, duracao) {
  const token = getSessionToken()
  const formData = new FormData()
  formData.append('audio', blob, 'audio.webm')
  formData.append('paciente_nome', pacienteNome)
  formData.append('paciente_tel', pacienteTel || '')
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

// FIX 4: Logout server-side
export async function logoutServer() {
  try {
    await apiFetch('logout', {}, { method: 'POST' })
  } catch {}
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

// ── Gravação em pedaços (07/09/2026) ──
// Cada pedaço sobe assim que sai do microfone; 'finalize' junta no servidor.
// Abre a sessão no servidor antes do primeiro pedaço (nome, nota → dica pro Whisper)
export async function sessionStart({ sessionId, pacienteNome, pacienteTel, nota, mime }) {
  const token = getSessionToken()
  const fd = new FormData()
  fd.append('session_id', sessionId)
  fd.append('paciente_nome', pacienteNome)
  fd.append('paciente_tel', pacienteTel || '')
  fd.append('nota', nota || '')
  fd.append('mime', mime || '')
  const res = await fetch(`${API_URL}?action=session-start`, { method: 'POST', headers: { 'X-Session-Token': token || '' }, body: fd })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `session-start ${res.status}`)
  return data
}

// Resposta traz { transcrito, terminou: true|false|null, motivo } — null = IA não avaliou neste pedaço
export async function uploadChunk(sessionId, seq, blob, duracao) {
  const token = getSessionToken()
  const fd = new FormData()
  fd.append('session_id', sessionId)
  fd.append('seq', String(seq))
  if (duracao) fd.append('duracao', String(duracao))
  fd.append('audio', blob, 'pedaco.bin')
  const res = await fetch(`${API_URL}?action=chunk`, { method: 'POST', headers: { 'X-Session-Token': token || '' }, body: fd })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `chunk ${res.status}`)
  return data
}

// totalChunks null = "usa o que chegou" (retomada de gravação interrompida)
export async function finalizeRecording({ sessionId, pacienteNome, pacienteTel, duracao, totalChunks, mime }) {
  const token = getSessionToken()
  const fd = new FormData()
  fd.append('session_id', sessionId)
  fd.append('paciente_nome', pacienteNome)
  fd.append('paciente_tel', pacienteTel || '')
  fd.append('duracao', String(duracao || 0))
  if (totalChunks != null) fd.append('total_chunks', String(totalChunks))
  fd.append('mime', mime || '')
  const res = await fetch(`${API_URL}?action=finalize`, { method: 'POST', headers: { 'X-Session-Token': token || '' }, body: fd })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `finalize ${res.status}`)
  return data.consulta
}

// Consulta que falhou 5x fica 'failed' pra sempre — isto volta ela pra fila.
export async function retryConsulta(id) {
  const data = await apiFetch('retry', { id }, { method: 'POST' })
  return data.consulta
}
