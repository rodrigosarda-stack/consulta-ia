import { useState } from 'react'
import { sendOTP, verifyOTP } from '../lib/auth'

const accent = '#2dd4bf'

export default function Login({ onLogin }) {
  const [step, setStep] = useState('phone') // phone | otp
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function formatPhone(raw) {
    const digits = raw.replace(/\D/g, '')
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  function normalizePhone(raw) {
    let digits = raw.replace(/\D/g, '')
    // Remove +55 se digitou
    if (digits.startsWith('55') && digits.length >= 12) digits = digits.slice(2)
    // Se tem 10 dígitos (sem 9º), adiciona o 9 após o DDD
    // Ex: 48 9999-0000 → 48 9 9999-0000
    if (digits.length === 10) {
      digits = digits.slice(0, 2) + '9' + digits.slice(2)
    }
    return digits
  }

  function toE164(raw) {
    return `+55${normalizePhone(raw)}`
  }

  async function handleSendOTP(e) {
    e.preventDefault()
    setError('')
    const digits = normalizePhone(phone)
    if (digits.length !== 11) {
      setError('Número inválido. Use DDD + 9 dígitos.')
      return
    }
    if (digits[2] !== '9') {
      setError('Número de celular deve começar com 9 após o DDD.')
      return
    }
    setLoading(true)
    try {
      await sendOTP(toE164(phone))
      setStep('otp')
    } catch (err) {
      setError(err.message || 'Erro ao enviar código')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) {
      setError('Código deve ter 6 dígitos')
      return
    }
    setLoading(true)
    try {
      const data = await verifyOTP(toE164(phone), otp)
      onLogin(data.session)
    } catch (err) {
      setError(err.message || 'Código inválido')
    } finally {
      setLoading(false)
    }
  }

  const card = { background: '#0c1622', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 14, padding: 24 }
  const input = { width: '100%', padding: '14px 16px', background: '#101e30', border: '1px solid rgba(99,179,237,0.15)', borderRadius: 10, color: '#e2eaf6', fontFamily: 'inherit', fontSize: 18, outline: 'none', textAlign: 'center', letterSpacing: 2 }
  const btn = { width: '100%', padding: 16, background: `linear-gradient(145deg, ${accent}, #60a5fa)`, border: 'none', borderRadius: 12, color: 'white', fontFamily: 'inherit', fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 12 }

  return (
    <div style={{ minHeight: '100vh', background: '#060c14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, fontSize: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${accent}, #60a5fa)`, marginBottom: 12 }}>🩺</div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 28, fontWeight: 600, color: '#e2eaf6', letterSpacing: -0.3 }}>
            Consulta<span style={{ color: accent }}>IA</span>
          </div>
          <div style={{ fontSize: 14, color: '#6b85a4', marginTop: 6 }}>Grava a consulta, prontuário sai pronto.</div>
        </div>

        <div style={card}>
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP}>
              <div style={{ fontSize: 14, color: '#6b85a4', marginBottom: 6, textAlign: 'center' }}>Seu celular com WhatsApp</div>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                placeholder="(48) 99999-0000"
                style={input}
                autoFocus
                maxLength={16}
              />
              <button type="submit" disabled={loading} style={{ ...btn, opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Enviando...' : 'Receber código SMS'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div style={{ fontSize: 14, color: '#6b85a4', marginBottom: 6, textAlign: 'center' }}>
                Código enviado para {phone}
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                style={{ ...input, fontSize: 28, letterSpacing: 8 }}
                autoFocus
                maxLength={6}
              />
              <button type="submit" disabled={loading} style={{ ...btn, opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Verificando...' : 'Entrar'}
              </button>
              <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                style={{ width: '100%', padding: 12, background: 'none', border: 'none', color: '#6b85a4', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
                Alterar número
              </button>
            </form>
          )}

          {error && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, fontSize: 13, color: '#f87171', textAlign: 'center' }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#6b85a4' }}>
          Ao entrar, você aceita os <span style={{ color: accent, cursor: 'pointer' }}>Termos de Uso</span> e a <span style={{ color: accent, cursor: 'pointer' }}>Política de Privacidade</span>.
        </div>
      </div>
    </div>
  )
}
