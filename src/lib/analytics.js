// PostHog analytics — lightweight integration
// Requires VITE_POSTHOG_KEY env var to activate (inactive without it)

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || ''
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'

let posthog = null

export function initAnalytics() {
  if (!POSTHOG_KEY || posthog) return

  // Load PostHog snippet async — zero impact on load time
  const script = document.createElement('script')
  script.async = true
  script.src = `${POSTHOG_HOST}/static/array.js`
  script.onload = () => {
    if (!window.posthog) return
    window.posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      autocapture: false,       // Manual events only — LGPD compliance
      capture_pageview: false,   // We track screens manually
      capture_pageleave: false,
      disable_session_recording: true,  // No session recording — health data
      persistence: 'localStorage',
      loaded: (ph) => { posthog = ph },
    })
    posthog = window.posthog
  }
  document.head.appendChild(script)
}

export function identify(telefone, props = {}) {
  if (!posthog) return
  // Hash phone for privacy — never send raw PII
  const id = btoa(telefone).replace(/=/g, '')
  posthog.identify(id, {
    plano: props.plano || 'free',
    ...(props.especialidade ? { especialidade: props.especialidade } : {}),
  })
}

export function track(event, props = {}) {
  if (!posthog) return
  posthog.capture(event, props)
}

export function resetAnalytics() {
  if (!posthog) return
  posthog.reset()
}

// Pre-defined events for consistency
export const Events = {
  // Onboarding
  LOGIN: 'login',
  LOGOUT: 'logout',

  // Recording
  RECORDING_START: 'recording_start',
  RECORDING_STOP: 'recording_stop',
  UPLOAD_START: 'upload_start',
  UPLOAD_SUCCESS: 'upload_success',
  UPLOAD_ERROR: 'upload_error',

  // Processing
  PRONTUARIO_DONE: 'prontuario_done',
  PRONTUARIO_FAILED: 'prontuario_failed',

  // Panel
  PANEL_OPEN: 'panel_open',
  PATIENT_VIEW: 'patient_view',
  PRONTUARIO_VIEW: 'prontuario_view',
  PRONTUARIO_EXPORT_PDF: 'prontuario_export_pdf',
  SEARCH: 'search',

  // Plans
  PLANS_VIEW: 'plans_view',
  CHECKOUT_START: 'checkout_start',

  // Screens
  SCREEN_VIEW: 'screen_view',
}
