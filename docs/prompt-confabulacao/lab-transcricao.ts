// TEMPORÁRIA — laboratório de transcrição. NÃO faz parte do produto.
//
// Mede se enxertar vocabulário médico no parâmetro `prompt` do Whisper melhora
// o reconhecimento de nome de remédio. A MarIA hoje NÃO usa esse parâmetro
// (ver process-consultation/index.ts, função transcribeAudio).
//
// Também aceita verbose=true, que devolve a confiança por trecho — o dado que
// hoje é jogado fora por pedir response_format=text, e que é o que permitiria
// perguntar ao médico só onde o Whisper de fato ficou inseguro.
//
// COMO SUBIR (roda no terminal, usa o token que já está no teu config):
//   cd ~/Documents/Sistemas/consulta-ia/docs/prompt-confabulacao
//   TOK=$(grep -oE 'sbp_[a-f0-9]{40}' ~/Documents/Sistemas/.claude/settings.local.json | head -1)
//   python3 -c "
//   import json,urllib.request,os
//   b=open('lab-transcricao.ts').read()
//   r=urllib.request.Request(
//     'https://api.supabase.com/v1/projects/xzknmihhtgwggpndpivb/functions/lab-prompt',
//     data=json.dumps({'body':b,'verify_jwt':False}).encode(),
//     headers={'Authorization':'Bearer '+os.environ['TOK'],'Content-Type':'application/json'},
//     method='PATCH')
//   print(urllib.request.urlopen(r,timeout=60).read().decode()[:200])"
//
// APAGAR DEPOIS: Dashboard > Edge Functions > lab-prompt > Delete.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ = Deno.env.get("GROQ_API_KEY");
const sb = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get("s") !== "lab-6f2a9c4e-2026") {
    return new Response(JSON.stringify({ error: "nope" }), { status: 401 });
  }
  try {
    const b = await req.json();
    const { data: audio, error } = await sb.storage.from("audios").download(b.path);
    if (error || !audio) {
      return new Response(JSON.stringify({ error: "download falhou" }), { status: 500 });
    }

    const fd = new FormData();
    fd.append("file", audio, "audio.wav");
    fd.append("model", "whisper-large-v3");
    fd.append("language", "pt");
    fd.append("response_format", b.verbose ? "verbose_json" : "text");
    if (b.vocab) fd.append("prompt", b.vocab); // ← o que a MarIA não usa hoje

    const r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: "Bearer " + GROQ },
      body: fd,
    });
    if (!r.ok) {
      return new Response(
        JSON.stringify({ error: "groq " + r.status, detalhe: (await r.text()).slice(0, 300) }),
        { status: 500 },
      );
    }

    if (b.verbose) {
      const j = await r.json();
      const segmentos = (j.segments || []).map((s) => ({
        ini: s.start,
        fim: s.end,
        confianca: s.avg_logprob,
        silencio: s.no_speech_prob,
      }));
      return new Response(JSON.stringify({ texto: j.text, segmentos }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ texto: await r.text() }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
