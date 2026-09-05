// RESGATADO do Supabase em 05/09/2026 (versão 1, deployada em abril/2026).
// Este código NUNCA esteve no git — vivia só no servidor.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const ALLOWED_ORIGINS = [
  "https://consulta-ia.vercel.app",
  "https://consulta-ia-git-staging-rodrigosarda-9265s-projects.vercel.app",
  "http://localhost:5173",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return { "Access-Control-Allow-Origin": allowed, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Session-Token", "Vary": "Origin" };
}

// Rate limit
const rateMap = new Map<string, { count: number; resetAt: number }>();
function checkRate(ip: string): boolean {
  const now = Date.now();
  const e = rateMap.get(ip);
  if (!e || now > e.resetAt) { rateMap.set(ip, { count: 1, resetAt: now + 60000 }); return true; }
  e.count++;
  return e.count <= 5; // 5 validacoes por minuto
}

// Validar session token
async function validateSession(token: string): Promise<string | null> {
  if (!token) return null;
  const { data } = await supabase.from("session_tokens").select("telefone, expires_at").eq("token", token).single();
  if (!data || new Date(data.expires_at) < new Date()) return null;
  return data.telefone;
}

// Scraping CFM
async function validarCRM(numero: string, uf: string): Promise<{ valido: boolean; nome?: string; especialidade?: string; situacao?: string }> {
  try {
    const formData = new URLSearchParams();
    formData.append("crm", numero);
    formData.append("uf", uf.toUpperCase());
    formData.append("tipo_inscricao", "P"); // Principal

    const response = await fetch("https://portal.cfm.org.br/busca-medicos/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (compatible; MarIA-Bot/1.0)",
      },
      body: formData.toString(),
    });

    if (!response.ok) return { valido: false };
    const html = await response.text();

    // Verificar se encontrou resultado
    if (html.includes("Nenhum registro encontrado") || !html.includes("card-body")) {
      return { valido: false };
    }

    // Extrair nome
    const nomeMatch = html.match(/class="card-title[^"]*">([^<]+)</i);
    const nome = nomeMatch ? nomeMatch[1].trim() : undefined;

    // Extrair situacao
    const sitMatch = html.match(/Situação[^:]*:\s*<[^>]*>([^<]+)</i);
    const situacao = sitMatch ? sitMatch[1].trim() : undefined;

    // Extrair especialidade
    const espMatch = html.match(/Especialidade[^:]*:\s*<[^>]*>([^<]+)</i);
    const especialidade = espMatch ? espMatch[1].trim() : undefined;

    return { valido: !!nome, nome, especialidade, situacao };
  } catch (e) {
    console.error("CFM scraping error");
    return { valido: false };
  }
}

// Scraping CFO
async function validarCRO(numero: string, uf: string): Promise<{ valido: boolean; nome?: string; especialidade?: string; situacao?: string }> {
  try {
    const response = await fetch(`https://website.cfo.org.br/consulta-ao-cro/?cro=${numero}&uf=${uf.toUpperCase()}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MarIA-Bot/1.0)",
      },
    });

    if (!response.ok) return { valido: false };
    const html = await response.text();

    if (html.includes("Nenhum resultado") || html.includes("nenhum registro")) {
      return { valido: false };
    }

    // Extrair nome
    const nomeMatch = html.match(/Nome[^:]*:[^<]*<[^>]*>([^<]+)</i);
    const nome = nomeMatch ? nomeMatch[1].trim() : undefined;

    // Extrair situacao
    const sitMatch = html.match(/Situação[^:]*:[^<]*<[^>]*>([^<]+)</i);
    const situacao = sitMatch ? sitMatch[1].trim() : undefined;

    return { valido: !!nome, nome, situacao };
  } catch (e) {
    console.error("CFO scraping error");
    return { valido: false };
  }
}

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRate(ip)) {
    return new Response(JSON.stringify({ error: "Muitas tentativas" }), { status: 429, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const token = req.headers.get("X-Session-Token") || "";
  const telefone = await validateSession(token);
  if (!telefone) {
    return new Response(JSON.stringify({ error: "Sessao invalida" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  }

  try {
    const body = await req.json();
    const conselho = String(body.conselho || "").toUpperCase(); // CRM, CRO
    const numero = String(body.numero || "").replace(/\D/g, "");
    const uf = String(body.uf || "").toUpperCase();

    if (!conselho || !numero || !uf || uf.length !== 2) {
      return new Response(JSON.stringify({ error: "Campos obrigatorios: conselho, numero, uf" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (!["CRM", "CRO"].includes(conselho)) {
      return new Response(JSON.stringify({ error: "Conselho deve ser CRM ou CRO" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Verificar cache
    const { data: cached } = await supabase
      .from("validacoes_profissionais")
      .select("*")
      .eq("conselho", conselho)
      .eq("numero", numero)
      .eq("uf", uf)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Cache valido por 30 dias
    if (cached && cached.validado_em && (Date.now() - new Date(cached.validado_em).getTime()) < 30 * 24 * 60 * 60 * 1000) {
      // Atualizar usuario
      await supabase.from("usuarios").update({ conselho, conselho_numero: numero, conselho_uf: uf, validado: cached.validado }).eq("telefone", telefone);
      return new Response(JSON.stringify({ success: true, validado: cached.validado, nome: cached.nome_registrado, especialidade: cached.especialidade, situacao: cached.situacao, fonte: "cache" }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Buscar no conselho
    let resultado;
    if (conselho === "CRM") {
      resultado = await validarCRM(numero, uf);
    } else {
      resultado = await validarCRO(numero, uf);
    }

    // Salvar no cache
    await supabase.from("validacoes_profissionais").insert({
      telefone,
      conselho,
      numero,
      uf,
      nome_registrado: resultado.nome,
      especialidade: resultado.especialidade,
      situacao: resultado.situacao,
      validado: resultado.valido,
      validado_em: new Date().toISOString(),
      metodo: conselho === "CRM" ? "cfm_scraping" : "cfo_scraping",
    });

    // Atualizar usuario
    await supabase.from("usuarios").update({
      conselho,
      conselho_numero: numero,
      conselho_uf: uf,
      validado: resultado.valido,
      especialidade: resultado.especialidade || undefined,
    }).eq("telefone", telefone);

    return new Response(JSON.stringify({
      success: true,
      validado: resultado.valido,
      nome: resultado.nome,
      especialidade: resultado.especialidade,
      situacao: resultado.situacao,
      fonte: "consulta",
    }), { headers: { ...cors, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("Validacao error");
    return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
