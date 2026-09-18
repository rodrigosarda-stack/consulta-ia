// Push notifications (PWA) — Frente 11 Parte A.
// Chave pública do VAPID: é pública por design (vai pro navegador de todo
// mundo), por isso pode ficar hardcoded como as outras chaves públicas deste
// arquivo (SUPABASE_ANON_KEY em lib/supabase.js segue o mesmo padrão).
const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  'BFEmiCaSEYn29ef-cUndr5YPnsIovbRMhj5VX4LxktlXRm1bZuArcU1SW7XlZa0SlrLgKM8IK06XlQ9M0DCFst4'

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.register('/sw.js')
  } catch (err) {
    console.error('SW registration failed', err)
    return null
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export async function getExistingSubscription() {
  if (!isPushSupported()) return null
  const reg = await navigator.serviceWorker.ready
  return reg.pushManager.getSubscription()
}

// Pede permissão (precisa de gesto do usuário) e assina. Devolve o objeto
// PushSubscription pronto pra mandar pro servidor (pushSubscribe em lib/api.js).
export async function subscribeToPush() {
  if (!isPushSupported()) throw new Error('Navegador sem suporte a notificações push')
  const reg = await navigator.serviceWorker.ready
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Permissão negada')
  const existing = await reg.pushManager.getSubscription()
  if (existing) return existing
  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })
}

export async function unsubscribeFromPush() {
  const sub = await getExistingSubscription()
  if (!sub) return null
  const endpoint = sub.endpoint
  await sub.unsubscribe()
  return endpoint
}
