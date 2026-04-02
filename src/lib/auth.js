const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xzknmihhtgwggpndpivb.supabase.co'

// Auth por token no link (gerado pelo WhatsApp bot)
// Fluxo: Bot manda link com token → Frontend valida → Sessão criada

export async function validateToken(token) {
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/auth-token?token=${encodeURIComponent(token)}`
  )
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Token inválido')
  }
  return data // { success, telefone, plano, usuario }
}

export function getTokenFromURL() {
  const params = new URLSearchParams(window.location.search)
  return params.get('token')
}

export function getSessionFromStorage() {
  const raw = sessionStorage.getItem('maria_session')
  if (!raw) return null
  try {
    const session = JSON.parse(raw)
    // Expira em 24h
    if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
      sessionStorage.removeItem('maria_session')
      return null
    }
    return session
  } catch {
    return null
  }
}

export function saveSession(data) {
  sessionStorage.setItem('maria_session', JSON.stringify({
    ...data,
    timestamp: Date.now(),
  }))
}

export function clearSession() {
  sessionStorage.removeItem('maria_session')
}
