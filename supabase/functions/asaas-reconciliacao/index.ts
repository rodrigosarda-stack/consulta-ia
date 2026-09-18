// asaas-reconciliacao — corrige o gap achado em 17/09: quando uma assinatura
// JÁ PAGA é cancelada no Asaas (o caminho normal no modelo cartão + débito
// automático, sem boleto), nenhum webhook avisa a gente — testado com evento
// real no sandbox, zero chamada chegou (só quando sobra cobrança pendente pra
// apagar é que o Asaas manda PAYMENT_DELETED). O webhook cobre o caminho
// rápido; esta função é a rede de segurança pro resto: roda periodicamente
// (cron) e confere toda assinatura 'active' contra o status real no Asaas,
// corrigindo quando divergir.
//
// DUNNING (17/09/2026, padrão de mercado — Baremetrics/Chargebee/Zuora 2026):
// "pausa, nunca cancela direto" — falha de pagamento involuntária é 20-40% de
// todo churn de SaaS, e a maioria recupera sozinha em poucos dias. O
// asaas-webhook avisa na 1ª falha e marca status='overdue', SEM cortar acesso
// (período de tolerância — o Asaas mesmo já tenta cobrar de novo sozinho).
// Esta função é quem aplica a pausa de verdade: assinatura 'overdue' há mais
// de 7 dias sem voltar a pagar → derruba o plano, mas mantém 'overdue' (não
// 'cancelled') — se pagar depois, o webhook reativa sozinho, sem perder nada.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const HELENA_API_URL = "https://api.helena.run/chat/v1/send/text";
const DIAS_TOLERANCIA = 7; // padrão de mercado: 3-7 dias de graça antes de pausar

async function getConfig() {
  const { data } = await supabase
    .from("config")
    .select("chave, valor")
    .in("chave", ["asaas_reconciliacao_secret", "asaas_api_key", "asaas_api_base", "helenacrm_canal_numero", "helenacrm_api_token"]);
  const get = (k: string) => (data?.find((r) => r.chave === k)?.valor as string) ?? null;
  return {
    secret: get("asaas_reconciliacao_secret"),
    apiKey: get("asaas_api_key"),
    apiBase: get("asaas_api_base") || "https://api.asaas.com",
    canal: get("helenacrm_canal_numero"),
    helenaToken: get("helenacrm_api_token"),
  };
}

async function avisarWhatsApp(telefone: string, texto: string, helenaToken: string | null, canal: string | null) {
  if (!helenaToken) { console.error("asaas-reconciliacao: sem helenacrm_api_token, aviso nao enviado"); return; }
  await fetch(HELENA_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${helenaToken}` },
    body: JSON.stringify({ to: telefone, from: canal ? `+${canal}` : undefined, text: texto }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200 });

  const url = new URL(req.url);
  const provided = url.searchParams.get("secret") || (req.headers.get("Authorization") || "").replace("Bearer ", "");
  const { secret: expected, apiKey, apiBase, canal, helenaToken } = await getConfig();
  if (!expected || !provided || provided !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  let checadas = 0;
  let corrigidas = 0;
  let pausadas = 0;
  const detalhes: Array<{ usuario: string; motivo: string }> = [];

  // PARTE 1: assinatura 'active' cujo status real no Asaas já não é mais ACTIVE
  // (cancelamento sem cobrança pendente pra apagar — nenhum webhook avisa isso).
  if (!apiKey) {
    console.error("asaas-reconciliacao: sem asaas_api_key configurado — pulando parte 1 (checagem contra Asaas)");
  } else {
    const { data: ativas } = await supabase
      .from("assinaturas")
      .select("id, usuario_tel, provider_subscription_id")
      .eq("status", "active")
      .eq("provider", "asaas");

    for (const a of ativas || []) {
      if (!a.provider_subscription_id) continue;
      checadas++;
      try {
        const res = await fetch(`${apiBase}/v3/subscriptions/${a.provider_subscription_id}`, { headers: { access_token: apiKey } });

        if (res.status === 404) {
          await supabase.from("assinaturas").update({ status: "cancelled", cancelado_em: new Date().toISOString() }).eq("id", a.id);
          await supabase.from("usuarios").update({ plano: "free" }).eq("telefone", a.usuario_tel);
          corrigidas++;
          detalhes.push({ usuario: a.usuario_tel, motivo: "assinatura nao encontrada (404) no Asaas" });
          continue;
        }
        if (!res.ok) { console.error("asaas-reconciliacao: erro consultando", a.provider_subscription_id, res.status); continue; }

        const sub = await res.json();
        if (sub.status && sub.status !== "ACTIVE") {
          await supabase.from("assinaturas").update({ status: "cancelled", cancelado_em: new Date().toISOString() }).eq("id", a.id);
          await supabase.from("usuarios").update({ plano: "free" }).eq("telefone", a.usuario_tel);
          corrigidas++;
          detalhes.push({ usuario: a.usuario_tel, motivo: `status real no Asaas: ${sub.status}` });
        }
      } catch (e) { console.error("asaas-reconciliacao: erro checando", a.provider_subscription_id, String(e)); }
    }
  }

  // PARTE 2: dunning — assinatura 'overdue' (pagamento falhou, webhook já avisou)
  // há mais de DIAS_TOLERANCIA sem voltar a pagar → pausa o plano de verdade.
  // updated_at é atualizado automaticamente (trigger já existente) toda vez que
  // o status muda, então serve como "desde quando está overdue".
  const limite = new Date(Date.now() - DIAS_TOLERANCIA * 86400000).toISOString();
  const { data: atrasadas } = await supabase
    .from("assinaturas")
    .select("id, usuario_tel, updated_at")
    .eq("status", "overdue")
    .eq("provider", "asaas")
    .lt("updated_at", limite);

  for (const a of atrasadas || []) {
    const { data: usuario } = await supabase.from("usuarios").select("plano").eq("telefone", a.usuario_tel).single();
    if (usuario?.plano === "free") continue; // já pausado antes, nada a fazer
    await supabase.from("usuarios").update({ plano: "free" }).eq("telefone", a.usuario_tel);
    pausadas++;
    detalhes.push({ usuario: a.usuario_tel, motivo: `pausado apos ${DIAS_TOLERANCIA} dias em atraso` });
    await avisarWhatsApp(
      a.usuario_tel,
      `⏸️ *Seu plano foi pausado* por falta de pagamento.\n\nSeus dados continuam salvos — assim que o pagamento for atualizado, o acesso volta automaticamente, sem perder nada.`,
      helenaToken,
      canal,
    );
  }

  console.log(`asaas-reconciliacao: ${checadas} checadas, ${corrigidas} corrigidas, ${pausadas} pausadas por atraso`);
  return new Response(JSON.stringify({ success: true, checadas, corrigidas, pausadas, detalhes }), {
    headers: { "Content-Type": "application/json" },
  });
});
