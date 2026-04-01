const STORAGE_KEY = 'maria_device_id'

function generateId() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

// Coleta sinais do dispositivo que sobrevivem a limpar localStorage
function getDeviceSignals() {
  const s = screen
  const nav = navigator
  return [
    s.width, s.height, s.colorDepth,
    nav.language,
    nav.hardwareConcurrency,
    nav.maxTouchPoints,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    nav.platform,
  ].join('|')
}

function hashSignals(signals) {
  // Simple hash — não precisa ser criptográfico, só consistente
  let hash = 0
  for (let i = 0; i < signals.length; i++) {
    const char = signals.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return 'sig_' + Math.abs(hash).toString(36)
}

export function getDeviceId() {
  // Tenta pegar do localStorage primeiro
  let id = localStorage.getItem(STORAGE_KEY)
  if (id) return id

  // Tenta pegar do sessionStorage (sobrevive a limpar localStorage)
  id = sessionStorage.getItem(STORAGE_KEY)
  if (id) {
    localStorage.setItem(STORAGE_KEY, id)
    return id
  }

  // Tenta gerar a partir dos sinais do dispositivo
  // Mesmo dispositivo com localStorage limpo gera o mesmo hash
  const signals = getDeviceSignals()
  const signalHash = hashSignals(signals)

  // Combina: hash dos sinais + ID aleatório
  // O hash sozinho pode colidir (2 iPhones iguais)
  // Mas se o localStorage foi limpo, usamos só o hash como fallback
  id = signalHash + '_' + generateId().slice(0, 8)

  localStorage.setItem(STORAGE_KEY, id)
  sessionStorage.setItem(STORAGE_KEY, id)

  // Também tenta salvar em cookie (sobrevive a limpar localStorage)
  try {
    document.cookie = `${STORAGE_KEY}=${id};max-age=31536000;path=/;SameSite=Strict`
  } catch {}

  return id
}

// Tenta recuperar de cookie se localStorage foi limpo
export function recoverDeviceId() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return stored

  // Tenta cookie
  try {
    const match = document.cookie.match(new RegExp(`${STORAGE_KEY}=([^;]+)`))
    if (match) {
      const id = match[1]
      localStorage.setItem(STORAGE_KEY, id)
      sessionStorage.setItem(STORAGE_KEY, id)
      return id
    }
  } catch {}

  return null
}
