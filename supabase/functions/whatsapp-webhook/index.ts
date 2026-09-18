// RESGATADO do Supabase em 05/09/2026 (versão 1, deployada em abril/2026).
// Este código NUNCA esteve no git — vivia só no servidor.
//
// ⚠️ ÚNICA ALTERAÇÃO em relação ao deployado: a EVO_API_KEY estava ESCRITA
// DIRETO NO CÓDIGO. Trocada por variável de ambiente. A chave original segue
// ativa em produção — precisa ser rotacionada e cadastrada como secret.
//
// 14/09/2026 — Frente 8 (auditoria 2026-09-11, achado 1): endpoint não
// verificava nada, qualquer um podia forjar messages.upsert. Autenticação
// adicionada abaixo (token compartilhado, ver checkWebhookAuth).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const EVO_URL = "https://evo.metodo3amedico.com.br";
const EVO_API_KEY = Deno.env.get("EVO_API_KEY")!; // era hardcoded — ver nota no topo
const INSTANCE = "MarIA-Bot";
const APP_URL = "https://consulta-ia.vercel.app";

// ── Autenticação do webhook (token compartilhado) ──
// A Evolution API não assina os callbacks (sem HMAC), então usamos o mesmo
// padrão de token compartilhado que validar-conselho usa com X-Session-Token
// (ver docs/decisoes/2026-09-11-auditoria-codigo-vs-spec.md, achado 1).
// O segredo fica em config.whatsapp_webhook_secret (não dá pra cadastrar
// Function Secret por aqui — ver nota da rotação da EVO_API_KEY). A Evolution
// precisa ser configurada (painel, instância MarIA-Bot → Webhook → Headers)
// para mandar `X-Webhook-Token: <esse segredo>` em toda chamada.
let cachedWebhookSecret: string | null = null;
let cachedWebhookSecretAt = 0;
const WEBHOOK_SECRET_TTL_MS = 5 * 60 * 1000;

async function getWebhookSecret(): Promise<string | null> {
  const now = Date.now();
  if (cachedWebhookSecret && now - cachedWebhookSecretAt < WEBHOOK_SECRET_TTL_MS) {
    return cachedWebhookSecret;
  }
  const { data } = await supabase.from("config").select("valor").eq("chave", "whatsapp_webhook_secret").single();
  const secret = typeof data?.valor === "string" ? data.valor : null;
  if (secret) {
    cachedWebhookSecret = secret;
    cachedWebhookSecretAt = now;
  }
  return secret;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function checkWebhookAuth(req: Request): Promise<boolean> {
  const provided = req.headers.get("X-Webhook-Token") || "";
  const expected = await getWebhookSecret();
  if (!expected || !provided) return false;
  return timingSafeEqual(provided, expected);
}

// ── Enviar mensagem via Evolution API ──
async function sendMessage(to: string, text: string) {
  await fetch(`${EVO_URL}/message/sendText/${INSTANCE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: EVO_API_KEY,
    },
    body: JSON.stringify({
      number: to,
      text,
    }),
  });
}

// ── Gerar token e link do recorder ──
async function generateRecorderLink(telefone: string): Promise<string> {
  const { data } = await supabase.rpc("generate_auth_token", { tel: telefone });
  if (!data) return APP_URL;
  return `${APP_URL}/?token=${data}`;
}

// ── Normalizar telefone ──
function normalizePhone(jid: string): string {
  // Remove @s.whatsapp.net e formata
  const digits = jid.replace(/@.*/, "").replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) {
    return `+${digits}`;
  }
  return `+55${digits}`;
}

// ── Buscar ou criar usuário ──
async function getOrCreateUser(telefone: string) {
  const { data: existing } = await supabase
    .from("usuarios")
    .select("*")
    .eq("telefone", telefone)
    .single();

  if (existing) return { user: existing, isNew: false };

  const { data: created } = await supabase
    .from("usuarios")
    .insert({ telefone })
    .select()
    .single();

  return { user: created, isNew: true };
}

// ── Handler de mensagens ──
async function handleMessage(phone: string, text: string, pushName: string) {
  const telefone = normalizePhone(phone);
  const msg = text.toLowerCase().trim();
  const { user, isNew } = await getOrCreateUser(telefone);

  // Atualizar nome se não tem
  if (user && !user.nome && pushName) {
    await supabase.from("usuarios").update({ nome: pushName }).eq("telefone", telefone);
  }

  // ── ONBOARDING (1ª mensagem) ──
  if (isNew) {
    const link = await generateRecorderLink(telefone);
    await sendMessage(phone,
      `Olá, ${pushName || "doutor(a)"}! 🙋‍♀️\n\n` +
      `Eu sou a *MarIA*, sua assistente de documentação clínica.\n\n` +
      `Grava a consulta, prontuário sai pronto. Simples assim.\n\n` +
      `🎯 *Como funciona:*\n` +
      `1️⃣ Clique no link abaixo\n` +
      `2️⃣ Coloque o celular na mesa e grave\n` +
      `3️⃣ O prontuário chega aqui no WhatsApp\n\n` +
      `👉 *Grave sua primeira consulta:*\n${link}\n\n` +
      `É grátis e ilimitado pra consultas de saúde. 🩺`
    );
    return;
  }

  // ── COMANDOS ──

  // Gravar / Nova consulta
  if (msg === "gravar" || msg === "nova" || msg === "consulta" || msg === "link" || msg === "1") {
    const link = await generateRecorderLink(telefone);
    await sendMessage(phone,
      `🎤 *Link pronto!*\n\n` +
      `Clique, grave a consulta e o prontuário chega aqui:\n${link}`
    );
    return;
  }

  // Indicar colega
  if (msg === "indicar" || msg === "convite" || msg === "convida" || msg === "invite" || msg === "2") {
    await sendMessage(phone,
      `👥 *Indique a MarIA pra um colega!*\n\n` +
      `Encaminhe esta mensagem:\n\n` +
      `---\n` +
      `Oi! Conheci a *MarIA* — uma IA que grava sua consulta e gera o prontuário automaticamente. ` +
      `É grátis e funciona pelo WhatsApp.\n\n` +
      `Manda um "oi" pra ela experimentar:\n` +
      `https://wa.me/NUMERO_MARIA?text=Oi\n` +
      `---\n\n` +
      `_(O número será atualizado quando o bot estiver conectado)_`
    );
    return;
  }

  // Ajuda
  if (msg === "ajuda" || msg === "help" || msg === "menu" || msg === "?" || msg === "3") {
    await sendMessage(phone,
      `🩺 *MarIA — Menu*\n\n` +
      `Digite o número ou o comando:\n\n` +
      `*1* — 🎤 Gravar nova consulta\n` +
      `*2* — 👥 Indicar um colega\n` +
      `*3* — ❓ Ajuda\n\n` +
      `Ou simplesmente diga *"gravar"* que eu mando o link!`
    );
    return;
  }

  // Mensagem não reconhecida — resposta amigável
  const link = await generateRecorderLink(telefone);
  await sendMessage(phone,
    `Oi, ${user?.nome || pushName || "doutor(a)"}! 🙋‍♀️\n\n` +
    `Pra gravar uma consulta, clique aqui:\n${link}\n\n` +
    `Ou digite *ajuda* pra ver o menu completo.`
  );
}

// ── Entregar prontuário no WhatsApp ──
// Chamada pelo process-consultation quando termina
export async function deliverProntuario(consultaId: string) {
  const { data: prontuario } = await supabase
    .from("prontuarios")
    .select("*")
    .eq("consulta_id", consultaId)
    .single();

  if (!prontuario) return;

  const { data: consulta } = await supabase
    .from("consultas")
    .select("*")
    .eq("id", consultaId)
    .single();

  if (!consulta) return;

  // Formatar telefone pra Evolution API (sem + )
  const phone = consulta.usuario_tel.replace("+", "");

  // Enviar prontuário
  const resumo = prontuario.prontuario?.resumo_curto || "Consulta processada";
  await sendMessage(phone,
    `📋 *Prontuário — ${prontuario.paciente_nome || "Paciente"}*\n` +
    `🕒 ${new Date(prontuario.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}\n\n` +
    `${prontuario.prontuario_texto}\n\n` +
    `_Gerado por MarIA • consulta-ia.vercel.app_`
  );

  // Marcar como enviado
  await supabase
    .from("prontuarios")
    .update({ enviado_wa: true })
    .eq("id", prontuario.id);
}

// ── Webhook principal ──
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200 });

  if (!(await checkWebhookAuth(req))) {
    console.error("Webhook rejeitado: X-Webhook-Token ausente ou invalido");
    return new Response("unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const event = body.event;

    // Log sem PII
    console.log(`Webhook event: ${event}`);

    // Mensagem recebida
    if (event === "messages.upsert" || event === "MESSAGES_UPSERT") {
      const msg = body.data;
      if (!msg) return new Response("ok");

      // Ignorar mensagens do próprio bot
      if (msg.key?.fromMe) return new Response("ok");

      // Ignorar grupos
      if (msg.key?.remoteJid?.includes("@g.us")) return new Response("ok");

      // Ignorar status/broadcast
      if (msg.key?.remoteJid === "status@broadcast") return new Response("ok");

      // Extrair texto
      const text = msg.message?.conversation ||
                   msg.message?.extendedTextMessage?.text ||
                   msg.message?.buttonsResponseMessage?.selectedDisplayText ||
                   "";

      if (!text) return new Response("ok");

      const phone = msg.key.remoteJid.replace("@s.whatsapp.net", "");
      const pushName = msg.pushName || "";

      await handleMessage(phone, text, pushName);
    }

    return new Response("ok");
  } catch (e) {
    console.error("Webhook error");
    return new Response("error", { status: 200 }); // sempre 200 pro Evolution
  }
});
