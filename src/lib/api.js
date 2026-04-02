import { supabase } from './supabase'
import { getDeviceId, recoverDeviceId } from './fingerprint'

// ── Normalização de telefone ──
export function normalizePhone(phone) {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55') && digits.length >= 12) digits = digits.slice(2)
  if (digits.length === 10) digits = digits.slice(0, 2) + '9' + digits.slice(2)
  return `+55${digits}`
}

// ── Upload de áudio (usa service role via edge function) ──

export async function uploadAudio(telefone, blob, duracao) {
  const ext = blob.type.includes('webm') ? 'webm'
    : blob.type.includes('mp4') ? 'm4a'
    : blob.type.includes('ogg') ? 'ogg'
    : 'wav'
  const filename = `${telefone}/${Date.now()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('audios')
    .upload(filename, blob, { contentType: blob.type })

  if (uploadErr) throw uploadErr

  return { path: filename, size: blob.size, duracao }
}

// ── Consultas ──

export async function criarConsulta(telefone, pacienteNome, audioPath, audioSize, duracao) {
  const { data, error } = await supabase
    .from('consultas')
    .insert({
      usuario_tel: telefone,
      paciente_nome: pacienteNome,
      audio_path: audioPath,
      audio_size_bytes: audioSize,
      duracao_seg: duracao,
      status: 'uploaded',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getConsulta(id) {
  const { data } = await supabase
    .from('consultas')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

// ── Prontuários ──

export async function getProntuario(consultaId) {
  const { data } = await supabase
    .from('prontuarios')
    .select('*')
    .eq('consulta_id', consultaId)
    .single()
  return data
}

// ── Créditos ──

export function isInTrial(usuario) {
  if (!usuario?.trial_fim) return false
  return new Date(usuario.trial_fim) > new Date()
}

export function canRecord(usuario) {
  // V4: grátis ilimitado pra consultas de saúde
  return true
}
