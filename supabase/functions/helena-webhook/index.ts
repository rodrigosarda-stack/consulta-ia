// helena-webhook — recebe mensagens do WhatsApp via HelenaCRM (Meta Cloud API
// oficial), substituindo o whatsapp-webhook baseado em Evolution API
// self-hosted (auditoria 2026-09-11 mostrou zero uso real do bot por médico
// de verdade — só dados de teste — então a troca de motor não afeta ninguém).
// F8, 15/09/2026. Canal piloto (48) 98821-3944, validado ponta a ponta com
// mensagem real (texto "Foi", 15/09 18:59 — payload real capturado no log).
//
// Autenticação: a HelenaCRM não assina o webhook (sem HMAC) — o segredo vai
// embutido na URL da inscrição (?secret=...).
//
// Filtro por canal: a inscrição de webhook é DA CONTA INTEIRA — não existe
// filtro por canal na API pública deles. Por isso o filtro é feito AQUI, logo
// na entrada, comparando content.details.to com o número configurado, ANTES
// de logar ou processar qualquer coisa. Aprendido com dor: a 1ª versão sem
// esse filtro pegou mensagens reais de paciente de outro canal — corrigido
// no mesmo dia (ver docs/decisoes ou histórico da sessão Helena Segurança).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const HELENA_API_URL = "https://api.helena.run/chat/v1/send/text";
const APP_URL = "https://consulta-ia.vercel.app";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function soDigitos(s: string): string {
  return (s || "").replace(/\D/g, "");
}

// ── Config (cache 5min): segredo do webhook, número do canal, token da API ──
// Function Secrets não dá pra cadastrar por aqui (sem acesso à CLI/API de
// secrets) — mesmo padrão de config-table-como-secret já usado no
// whatsapp-webhook antigo (ver whatsapp_webhook_secret).
let cache: { secret: string | null; numero: string | null; token: string | null; at: number } = {
  secret: null,
  numero: null,
  token: null,
  at: 0,
};
async function getConfig() {
  const now = Date.now();
  if (cache.at && now - cache.at < 5 * 60 * 1000) return cache;
  const { data } = await supabase
    .from("config")
    .select("chave, valor")
    .in("chave", ["helenacrm_webhook_secret", "helenacrm_canal_numero", "helenacrm_api_token"]);
  const get = (k: string) => (data?.find((r) => r.chave === k)?.valor as string) ?? null;
  cache = {
    secret: get("helenacrm_webhook_secret"),
    numero: get("helenacrm_canal_numero"),
    token: get("helenacrm_api_token"),
    at: now,
  };
  return cache;
}

// ── Enviar mensagem via HelenaCRM ──
async function sendMessage(to: string, text: string) {
  const { token, numero } = await getConfig();
  if (!token) {
    console.error("helena-webhook: sem helenacrm_api_token configurado");
    return;
  }
  await fetch(HELENA_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to, from: numero ? `+${numero}` : undefined, text }),
  });
}

// ── Gerar token e link do recorder ──
async function generateRecorderLink(telefone: string): Promise<string> {
  const { data } = await supabase.rpc("generate_auth_token", { tel: telefone });
  if (!data) return APP_URL;
  return `${APP_URL}/?token=${data}`;
}

// ── Buscar ou criar usuário ──
async function getOrCreateUser(telefone: string) {
  const { data: existing } = await supabase.from("usuarios").select("*").eq("telefone", telefone).single();
  if (existing) return { user: existing, isNew: false };
  const { data: created } = await supabase.from("usuarios").insert({ telefone }).select().single();
  return { user: created, isNew: true };
}

// ── Handler de mensagens (mesmos comandos do bot antigo — ver
// whatsapp-webhook/index.ts, versão Evolution) ──
async function handleMessage(telefone: string, text: string) {
  const msg = text.toLowerCase().trim();
  const { user, isNew } = await getOrCreateUser(telefone);

  // ── ONBOARDING (1ª mensagem) ──
  if (isNew) {
    const link = await generateRecorderLink(telefone);
    await sendMessage(
      telefone,
      `Olá! 🙋‍♀️\n\n` +
        `Eu sou a *MarIA*, sua assistente de documentação clínica.\n\n` +
        `Grava a consulta, prontuário sai pronto. Simples assim.\n\n` +
        `🎯 *Como funciona:*\n` +
        `1️⃣ Clique no link abaixo\n` +
        `2️⃣ Coloque o celular na mesa e grave\n` +
        `3️⃣ O prontuário chega aqui no WhatsApp\n\n` +
        `👉 *Grave sua primeira consulta:*\n${link}\n\n` +
        `É grátis e ilimitado pra consultas de saúde. 🩺`,
    );
    return;
  }

  // ── COMANDOS ──

  // Gravar / Nova consulta
  if (msg === "gravar" || msg === "nova" || msg === "consulta" || msg === "link" || msg === "1") {
    const link = await generateRecorderLink(telefone);
    await sendMessage(telefone, `🎤 *Link pronto!*\n\nClique, grave a consulta e o prontuário chega aqui:\n${link}`);
    return;
  }

  // Indicar colega
  if (msg === "indicar" || msg === "convite" || msg === "convida" || msg === "invite" || msg === "2") {
    const { numero } = await getConfig();
    await sendMessage(
      telefone,
      `👥 *Indique a MarIA pra um colega!*\n\n` +
        `Encaminhe esta mensagem:\n\n` +
        `---\n` +
        `Oi! Conheci a *MarIA* — uma IA que grava sua consulta e gera o prontuário automaticamente. ` +
        `É grátis e funciona pelo WhatsApp.\n\n` +
        `Manda um "oi" pra ela experimentar:\n` +
        `https://wa.me/${numero || ""}?text=Oi\n` +
        `---`,
    );
    return;
  }

  // Ajuda
  if (msg === "ajuda" || msg === "help" || msg === "menu" || msg === "?" || msg === "3") {
    await sendMessage(
      telefone,
      `🩺 *MarIA — Menu*\n\n` +
        `Digite o número ou o comando:\n\n` +
        `*1* — 🎤 Gravar nova consulta\n` +
        `*2* — 👥 Indicar um colega\n` +
        `*3* — ❓ Ajuda\n\n` +
        `Ou simplesmente diga *"gravar"* que eu mando o link!`,
    );
    return;
  }

  // Mensagem não reconhecida — resposta amigável
  const link = await generateRecorderLink(telefone);
  await sendMessage(
    telefone,
    `Oi, ${user?.nome || "doutor(a)"}! 🙋‍♀️\n\n` +
      `Pra gravar uma consulta, clique aqui:\n${link}\n\n` +
      `Ou digite *ajuda* pra ver o menu completo.`,
  );
}

// ── Webhook principal ──
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200 });

  const url = new URL(req.url);
  const provided = url.searchParams.get("secret") || "";
  const { secret: expected, numero: canalEsperado } = await getConfig();
  if (!expected || !provided || !timingSafeEqual(provided, expected)) {
    console.error("helena-webhook: secret ausente ou invalido");
    return new Response("unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();

    if (body?.eventType !== "MESSAGE_RECEIVED") return new Response("ok", { status: 200 });
    const content = body?.content || {};

    // Filtro por canal — ANTES de processar qualquer coisa. "to" é quem
    // recebeu a mensagem (nosso canal); descarta silenciosamente o resto.
    const to = soDigitos(content?.details?.to || "");
    if (!canalEsperado || to !== canalEsperado) return new Response("ok", { status: 200 });

    // Nunca processar o eco da própria mensagem que o bot acabou de mandar
    // (nesse caso "from" seria o próprio canal, não um contato).
    const from = soDigitos(content?.details?.from || "");
    if (!from || from === canalEsperado) return new Response("ok", { status: 200 });

    // Só mensagem de texto — a gravação em si acontece pelo link do app, não
    // por áudio mandado direto no WhatsApp.
    if (content?.type !== "TEXT" || typeof content?.text !== "string" || !content.text.trim()) {
      return new Response("ok", { status: 200 });
    }

    await handleMessage(`+${from}`, content.text);
    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("helena-webhook: erro processando", String(e));
    return new Response("ok", { status: 200 }); // sempre 200 pra HelenaCRM não ficar reenviando
  }
});
