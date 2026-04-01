import { supabase } from './supabase'
import { getDeviceId, recoverDeviceId } from './fingerprint'

// ── Usuário ──

// ── Anti-abuso: 3 camadas ──

async function getAntiAbusoConfig() {
  const { data } = await supabase
    .from('config')
    .select('valor')
    .eq('chave', 'anti_abuso')
    .single()
  return data?.valor || { max_contas_por_device: 2, max_contas_por_ip_semana: 3, max_trials_por_device: 1 }
}

// Camada 1: Device já usou trial?
async function checkDeviceTrial(deviceId) {
  const { data } = await supabase
    .from('devices')
    .select('*')
    .eq('device_id', deviceId)
    .single()
  return data // null = device novo
}

// Camada 2: Device criou contas demais?
async function checkDeviceLimit(deviceId, maxContas) {
  const { data } = await supabase
    .from('devices')
    .select('contas_criadas')
    .eq('device_id', deviceId)
    .single()
  if (!data) return { blocked: false, count: 0 }
  return { blocked: data.contas_criadas >= maxContas, count: data.contas_criadas }
}

// Camada 3: IP criou contas demais esta semana?
async function checkIPLimit(maxPorSemana) {
  try {
    // Pega IP público via serviço externo
    const res = await fetch('https://api.ipify.org?format=json')
    const { ip } = await res.json()

    const umaSemanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('signup_ips')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', umaSemanaAtras)

    return { blocked: count >= maxPorSemana, ip, count }
  } catch {
    // Se falhar pegar IP, não bloqueia (fail open)
    return { blocked: false, ip: null, count: 0 }
  }
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
        trial_usado: existing.trial_usado || isNewTrial,
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

async function registerIP(ip, telefone) {
  if (!ip) return
  await supabase
    .from('signup_ips')
    .insert({ ip, telefone })
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

  // Novo usuário — verificar 3 camadas anti-abuso
  const deviceId = getDeviceId()
  const config = await getAntiAbusoConfig()

  // Camada 1: Device já usou trial?
  const deviceHistory = await checkDeviceTrial(deviceId)
  const trialJaUsado = deviceHistory?.trial_usado === true

  // Camada 2: Device criou contas demais?
  const deviceLimit = await checkDeviceLimit(deviceId, config.max_contas_por_device)

  // Camada 3: IP criou contas demais esta semana?
  const ipLimit = await checkIPLimit(config.max_contas_por_ip_semana)

  // Decisão: dá trial?
  const bloqueado = trialJaUsado || deviceLimit.blocked || ipLimit.blocked
  const daTrial = !bloqueado
  const motivo = trialJaUsado ? 'device_trial_usado'
    : deviceLimit.blocked ? 'device_limite_contas'
    : ipLimit.blocked ? 'ip_limite_semanal'
    : null

  const now = new Date()
  const trialFim = daTrial
    ? new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    : null

  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      telefone,
      device_id: deviceId,
      trial_inicio: daTrial ? now.toISOString() : null,
      trial_fim: trialFim ? trialFim.toISOString() : null,
      trial_bloqueado: bloqueado,
      creditos_hoje: daTrial ? 999 : 3,
    })
    .select()
    .single()

  if (error) throw error

  // Registrar device e IP
  await registerDevice(deviceId, daTrial)
  await registerIP(ipLimit.ip, telefone)

  // Log de bloqueio (pra auditoria)
  if (bloqueado) {
    await supabase.from('creditos_log').insert({
      usuario_tel: telefone,
      tipo: 'trial',
      delta: 0,
      saldo_apos: 3,
      detalhes: `Trial bloqueado: ${motivo} | device: ${deviceId} | ip: ${ipLimit.ip} | device_contas: ${deviceLimit.count}`,
    })
  }

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
