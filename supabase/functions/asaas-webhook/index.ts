// asaas-webhook — recebe confirmação de pagamento do Asaas e ativa o plano do
// usuário. Fecha o ciclo que já existia pela metade: api/index.ts (action
// "checkout") já cria cliente + assinatura no Asaas, mas a assinatura ficava
// "pending" pra sempre porque não existia esse webhook (Frente 8, item 3 da
// missão original — "criar webhook Asaas").
//
// Autenticação: o Asaas manda de volta, em todo webhook, o mesmo authToken
// configurado na hora de registrar o webhook (POST /v3/webhooks), no header
// "asaas-access-token" (confirmado em docs.asaas.com/docs/webhooks-3). Token
// gerado nesta sessão, guardado em config.asaas_webhook_token e no Chaveiro
// (asaas-webhook-token).
//
// Correlação pagamento → usuário: por padrão via payment.subscription (id da
// assinatura no Asaas, igual ao que fica salvo em assinaturas.provider_subscription_id).
// Se faltar (cobrança avulsa fora de assinatura), cai pro externalReference, que
// o checkout já seta como o telefone do usuário desde sempre.
//
// DUNNING (17/09/2026, padrão de mercado — Baremetrics/Chargebee/Zuora 2026):
// avisa rápido, não corta na hora, pausa (não cancela) só depois do prazo de
// tolerância. O Asaas já tenta de novo sozinho antes de declarar PAYMENT_OVERDUE
// (equivalente ao "smart retry" do mercado); aqui só falta o aviso e a pausa.
// A pausa de verdade (derrubar usuarios.plano depois de 7 dias) roda no
// asaas-reconciliacao (cron diário) — aqui só manda o aviso na 1ª falha e marca
// status='overdue', sem mexer no acesso ainda (período de tolerância).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const HELENA_API_URL = "https://api.helena.run/chat/v1/send/text";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

let cachedCfg: { token: string | null; canal: string | null; helenaToken: string | null; at: number } = {
  token: null,
  canal: null,
  helenaToken: null,
  at: 0,
};
async function getConfig() {
  const now = Date.now();
  if (cachedCfg.at && now - cachedCfg.at < 5 * 60 * 1000) return cachedCfg;
  const { data } = await supabase
    .from("config")
    .select("chave, valor")
    .in("chave", ["asaas_webhook_token", "helenacrm_canal_numero", "helenacrm_api_token"]);
  const get = (k: string) => (data?.find((r) => r.chave === k)?.valor as string) ?? null;
  cachedCfg = {
    token: get("asaas_webhook_token"),
    canal: get("helenacrm_canal_numero"),
    helenaToken: get("helenacrm_api_token"),
    at: now,
  };
  return cachedCfg;
}

// Mesmo mecanismo de envio do helena-webhook (WhatsApp via HelenaCRM).
async function avisarWhatsApp(telefone: string, texto: string) {
  const { helenaToken, canal } = await getConfig();
  if (!helenaToken) {
    console.error("asaas-webhook: sem helenacrm_api_token configurado, aviso de cobranca nao enviado");
    return;
  }
  await fetch(HELENA_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${helenaToken}` },
    body: JSON.stringify({ to: telefone, from: canal ? `+${canal}` : undefined, text: texto }),
  });
}

// RECEIVED = dinheiro já caiu (boleto/pix/dinheiro); CONFIRMED = cartão aprovado
// (ainda vai liquidar, mas já é confirmação de pagamento pro nosso propósito).
const EVENTOS_PAGO = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);
// Derruba o plano de volta pra free — cancelamento de verdade, sem tolerância.
const EVENTOS_CANCELA = new Set(["PAYMENT_REFUNDED", "PAYMENT_DELETED", "SUBSCRIPTION_DELETED", "SUBSCRIPTION_INACTIVATED"]);
// Cobrança falhou — não cancela na hora (padrão de mercado: avisa e dá prazo).
const EVENTOS_ATRASO = new Set(["PAYMENT_OVERDUE"]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200 });

  const provided = req.headers.get("asaas-access-token") || "";
  const { token: expected } = await getConfig();
  if (!expected || !provided || !timingSafeEqual(provided, expected)) {
    console.error("asaas-webhook: token ausente ou invalido");
    return new Response("unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const event = body?.event as string | undefined;
    if (!event) return new Response("ok", { status: 200 });

    // 19/09/2026: achado testando pagamento real — PAYMENT_CONFIRMED/RECEIVED
    // dependem do pipeline de liquidação do Asaas, que não é instantâneo mesmo
    // com vencimento hoje (medido: ficou horas em PENDING). CHECKOUT_PAID é
    // outro evento, dispara na hora que o cliente conclui o checkout (cartão
    // autorizado) — é assim que SaaS de verdade libera acesso na hora. Payload
    // vem em `checkout`, não em `payment`. PAYMENT_CONFIRMED continua chegando
    // depois só pra registrar o pagamento oficial (idempotente, já ativo).
    if (event === "CHECKOUT_PAID") {
      const checkoutId = (body?.checkout?.id as string | undefined) || undefined;
      if (!checkoutId) return new Response("ok", { status: 200 });
      const { data: assinaturaCo } = await supabase.from("assinaturas").select("*").eq("checkout_session_id", checkoutId).order("created_at", { ascending: false }).limit(1).single();
      if (!assinaturaCo) {
        console.error("asaas-webhook: CHECKOUT_PAID sem assinatura correspondente", checkoutId);
        return new Response("ok", { status: 200 });
      }
      if (assinaturaCo.status !== "active") {
        await supabase.from("assinaturas").update({ status: "active" }).eq("id", assinaturaCo.id);
        await supabase.from("usuarios").update({ plano: assinaturaCo.plano }).eq("telefone", assinaturaCo.usuario_tel);
        console.log(`asaas-webhook: CHECKOUT_PAID ativou ${assinaturaCo.plano} pra ${assinaturaCo.usuario_tel} na hora`);
      }
      return new Response("ok", { status: 200 });
    }

    const payment = body?.payment;
    if (!payment) return new Response("ok", { status: 200 });

    const subscriptionId = (payment.subscription as string | null) || null;
    const externalRef = (payment.externalReference as string | null) || null; // telefone
    const checkoutSessionId = (payment.checkoutSession as string | null) || null;

    // 19/09/2026, achado testando pagamento real: o externalReference do Checkout
    // NAO se propaga pro payment/subscription criado a partir dele — veio null num
    // pagamento real, mesmo tendo sido enviado na criação do checkout. checkoutSession
    // é a chave que sobrevive; é o que api/index.ts grava em checkout_session_id.
    let assinatura: Record<string, unknown> | null = null;
    if (subscriptionId) {
      const { data } = await supabase.from("assinaturas").select("*").eq("provider_subscription_id", subscriptionId).order("created_at", { ascending: false }).limit(1).single();
      assinatura = data;
    }
    if (!assinatura && checkoutSessionId) {
      const { data } = await supabase.from("assinaturas").select("*").eq("checkout_session_id", checkoutSessionId).order("created_at", { ascending: false }).limit(1).single();
      assinatura = data;
    }
    if (!assinatura && externalRef) {
      const { data } = await supabase.from("assinaturas").select("*").eq("usuario_tel", externalRef).order("created_at", { ascending: false }).limit(1).single();
      assinatura = data;
    }
    if (!assinatura) {
      console.error("asaas-webhook: assinatura nao encontrada", event, subscriptionId, checkoutSessionId, externalRef);
      return new Response("ok", { status: 200 }); // sem correspondencia — confirma recebimento, sem acao
    }
    // achou por checkoutSession/externalRef mas ainda não tinha o id da assinatura
    // Asaas guardado — grava agora, pra reconciliação conseguir consultar depois.
    if (subscriptionId && !assinatura.provider_subscription_id) {
      await supabase.from("assinaturas").update({ provider_subscription_id: subscriptionId }).eq("id", assinatura.id);
    }

    const usuarioTel = assinatura.usuario_tel as string;

    if (EVENTOS_PAGO.has(event)) {
      // Evita duplicar linha de pagamento se o Asaas reentregar o mesmo evento.
      const { data: jaExiste } = await supabase.from("pagamentos").select("id").eq("provider", "asaas").eq("provider_id", payment.id).limit(1).single();
      if (!jaExiste) {
        const inicio = (payment.paymentDate as string | null) || (payment.clientPaymentDate as string | null) || new Date().toISOString().slice(0, 10);
        const fim = new Date(`${inicio}T00:00:00Z`); fim.setMonth(fim.getMonth() + 1);
        await supabase.from("pagamentos").insert({
          usuario_tel: usuarioTel, provider: "asaas", provider_id: payment.id,
          plano: assinatura.plano, valor_cents: Math.round((payment.value || 0) * 100),
          status: "paid", periodo_inicio: inicio, periodo_fim: fim.toISOString().slice(0, 10),
        });
      }
      // Recuperou de um atraso (voltou a pagar) — avisa que normalizou, se estava em 'overdue'.
      if (assinatura.status === "overdue") {
        await avisarWhatsApp(usuarioTel, `✅ *Pagamento confirmado!*\n\nSeu acesso à Helena está normalizado. Obrigado por atualizar.`);
      }
      await supabase.from("assinaturas").update({ status: "active" }).eq("id", assinatura.id);
      await supabase.from("usuarios").update({ plano: assinatura.plano }).eq("telefone", usuarioTel);
      console.log(`asaas-webhook: plano ${assinatura.plano} ativado para ${usuarioTel} (${event})`);
    } else if (EVENTOS_CANCELA.has(event)) {
      await supabase.from("assinaturas").update({ status: "cancelled", cancelado_em: new Date().toISOString() }).eq("id", assinatura.id);
      await supabase.from("usuarios").update({ plano: "free" }).eq("telefone", usuarioTel);
      console.log(`asaas-webhook: assinatura cancelada para ${usuarioTel} (${event})`);
    } else if (EVENTOS_ATRASO.has(event)) {
      // 1ª falha (estava 'active'): avisa na hora, NÃO corta acesso — período de
      // tolerância. O Asaas já tenta cobrar de novo sozinho; se em 7 dias não
      // resolver, o asaas-reconciliacao pausa o plano (ver cron diário).
      if (assinatura.status !== "overdue") {
        await supabase.from("assinaturas").update({ status: "overdue" }).eq("id", assinatura.id);
        await avisarWhatsApp(
          usuarioTel,
          `⚠️ *Não conseguimos processar seu pagamento.*\n\nSeu acesso continua normal por enquanto — vamos tentar cobrar de novo automaticamente nos próximos dias.\n\nSe o problema persistir (cartão vencido, sem limite), atualize seu método de pagamento pra não perder o acesso.`,
        );
        console.log(`asaas-webhook: pagamento atrasado, aviso enviado para ${usuarioTel}`);
      }
      // Reentregas do mesmo atraso (retentativa do Asaas falhando de novo) não
      // reenviam aviso — evita spam. A pausa de verdade é decidida pelo cron.
    }
    // Outros eventos (PAYMENT_CREATED, etc.): só confirma recebimento, sem ação por ora.

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("asaas-webhook: erro processando", String(e));
    return new Response("ok", { status: 200 }); // sempre 200 pro Asaas nao ficar reenviando
  }
});
