import { supabase } from './supabase'
import { getDeviceId, recoverDeviceId } from './fingerprint'

// ── Usuário ──

async function checkDeviceTrial(deviceId) {
  // Verifica se esse device já usou trial antes
  const { data } = await supabase
    .from('devices')
    .select('*')
    .eq('device_id', deviceId)
    .single()

  return data // null = device novo, nunca usou trial
}

async function registerDevice(deviceId, isNewTrial) {
  const { data: existing } = await supabase
    .from('devices')
    .select('*')
    .eq('device_id', deviceId)
    .single()

  if (existing) {
    await supabase
      .from('devices')
      .update({
        contas_criadas: existing.contas_criadas + 1,
        ultimo_uso: new Date().toISOString(),
      })
      .eq('device_id', deviceId)
  } else {
    await supabase
      .from('devices')
      .insert({
        device_id: deviceId,
        contas_criadas: 1,
        trial_usado: isNewTrial,
      })
  }
}

export async function getOrCreateUsuario(telefone) {
  const { data: existing } = await supabase
    .from('usuarios')
    .select('*')
    .eq('telefone', telefone)
    .single()

  if (existing) {
    // Atualiza device_id se ainda não tem
    const deviceId = recoverDeviceId() || getDeviceId()
    if (!existing.device_id) {
      await supabase
        .from('usuarios')
        .update({ device_id: deviceId })
        .eq('telefone', telefone)
    }
    return existing
  }

  // Novo usuário — verificar se o device já teve trial
  const deviceId = getDeviceId()
  const deviceHistory = await checkDeviceTrial(deviceId)
  const trialJaUsado = deviceHistory?.trial_usado === true

  const now = new Date()
  const daTrial = !trialJaUsado
  const trialFim = daTrial
    ? new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // +3 dias
    : null // sem trial — começa direto no 3/dia

  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      telefone,
      device_id: deviceId,
      trial_inicio: daTrial ? now.toISOString() : null,
      trial_fim: trialFim ? trialFim.toISOString() : null,
      trial_bloqueado: trialJaUsado,
      creditos_hoje: daTrial ? 999 : 3, // ilimitado no trial, 3/dia se bloqueado
    })
    .select()
    .single()

  if (error) throw error

  // Registrar device
  await registerDevice(deviceId, daTrial)

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
