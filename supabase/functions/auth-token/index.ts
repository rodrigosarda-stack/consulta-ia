// RESGATADO do Supabase em 05/09/2026 (versão 5, deployada em abril/2026).
// Este código NUNCA esteve no git — vivia só no servidor. Recuperado depois
// que o banco do projeto voltou VAZIO de uma pausa, provando que "está no
// Supabase" não é o mesmo que "está guardado".
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const ALLOWED_ORIGINS = [
  "https://consulta-ia.vercel.app",
  "https://consulta-ia-git-staging-rodrigosarda-9265s-projects.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

// FIX 8: Rate limit no auth-token
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  entry.count++;
  return entry.count <= 10; // 10 tentativas por minuto por IP
}

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
             req.headers.get("cf-connecting-ip") || "unknown";

  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Muitas tentativas. Aguarde 1 minuto." }), {
      status: 429,
      headers: { "Content-Type": "application/json", ...cors },
    });
  }

  try {
    const url = new URL(req.url);
    const authToken = url.searchParams.get("token");

    if (!authToken) {
      return new Response(JSON.stringify({ error: "Token ausente" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const { data: tokenData } = await supabase
      .from("auth_tokens")
      .select("telefone, expires_at")
      .eq("token", authToken)
      .single();

    if (!tokenData || new Date(tokenData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Token invalido ou expirado" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    await supabase.from("auth_tokens").update({ used: true }).eq("token", authToken);

    const { data: sessionData, error: sessionErr } = await supabase
      .from("session_tokens")
      .insert({ telefone: tokenData.telefone })
      .select()
      .single();

    if (sessionErr) throw sessionErr;

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("*")
      .eq("telefone", tokenData.telefone)
      .single();

    return new Response(JSON.stringify({
      success: true,
      telefone: tokenData.telefone,
      plano: usuario?.plano || "free",
      usuario,
      session_token: sessionData.token,
    }), {
      headers: { "Content-Type": "application/json", ...cors },
    });

  } catch {
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...getCorsHeaders(req) },
    });
  }
});
