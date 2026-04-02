const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xzknmihhtgwggpndpivb.supabase.co'

export async function validateToken(token) {
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/auth-token?token=${encodeURIComponent(token)}`
  )
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Token inválido')
  }
  // Retorna session_token (diferente do auth token da URL)
  return data
}

export function getTokenFromURL() {
  const params = new URLSearchParams(window.location.search)
  return params.get('token')
}

export function getSessionFromStorage() {
  const raw = localStorage.getItem('maria_session')
  if (!raw) return null
  try {
    const session = JSON.parse(raw)
    if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('maria_session')
      return null
    }
    return session
  } catch {
    return null
  }
}

export function saveSession(data) {
  localStorage.setItem('maria_session', JSON.stringify({
    ...data,
    timestamp: Date.now(),
  }))
}

export function clearSession() {
  localStorage.removeItem('maria_session')
}
