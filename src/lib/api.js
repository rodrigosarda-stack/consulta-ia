import { supabase } from './supabase'

// ── Usuário ──

export async function getOrCreateUsuario(telefone) {
  const { data: existing } = await supabase
    .from('usuarios')
    .select('*')
    .eq('telefone', telefone)
    .single()

  if (existing) return existing

  const now = new Date()
  const trialFim = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // +3 dias

  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      telefone,
      trial_inicio: now.toISOString(),
      trial_fim: trialFim.toISOString(),
      creditos_hoje: 999, // ilimitado durante trial
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUsuario(telefone) {
  const { data } = await supabase
    .from('usuarios')
    .select('*')
    .eq('telefone', telefone)
    .single()
  return data
}

// ── Créditos ──

export function isInTrial(usuario) {
  if (!usuario.trial_fim) return false
  return new Date(usuario.trial_fim) > new Date()
}

export function canRecord(usuario) {
  if (usuario.plano !== 'free') return true
  if (isInTrial(usuario)) return true
  return usuario.creditos_hoje > 0
}

export async function consumeCredito(telefone, usuario) {
  if (usuario.plano !== 'free') return
  if (isInTrial(usuario)) return

  const novoSaldo = usuario.creditos_hoje - 1
  await supabase
    .from('usuarios')
    .update({ creditos_hoje: novoSaldo })
    .eq('telefone', telefone)

  await supabase.from('creditos_log').insert({
    usuario_tel: telefone,
    tipo: 'uso',
    delta: -1,
    saldo_apos: novoSaldo,
    detalhes: 'Gravação de consulta',
  })
}

// ── Upload de áudio ──

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
