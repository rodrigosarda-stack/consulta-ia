import { readFileSync } from "node:fs";
const API = "https://xzknmihhtgwggpndpivb.supabase.co/functions/v1/api?action=lab-groq-gen";
const TOK = process.env.MARIA_SESSION_TOKEN;
const PRECO = { "openai/gpt-oss-120b": [0.15, 0.60], "openai/gpt-oss-20b": [0.075, 0.30], "qwen/qwen3.6-27b": [0.60, 3.00], "qwen/qwen3.8-27b": [0.60, 3.00] };
const src = readFileSync("/Users/greenvalreflorestamento/Documents/Sistemas/consulta-ia/supabase/functions/process-consultation/index.ts", "utf8");
const PRONT = eval(src.match(/const PRONTUARIO_PROMPT = (`[\s\S]*?`);/)[1]);
const JSONI = eval(src.match(/const JSON_INSTRUCTION = (`[\s\S]*?`);/)[1]);
const T2 = readFileSync("/Users/greenvalreflorestamento/Documents/Sistemas/consulta-ia/docs/prompt-confabulacao/fixture-transcricao-2vozes-teste2-2026-09-07.txt", "utf8");
const prompt = `${PRONT}${JSONI}\n\n===== INICIO DO CONTEUDO =====\nPaciente: Ana\n\nTranscricao:\n${T2}\n===== FIM DO CONTEUDO =====`;
console.log("referência: gemini-3.7-flash sem pensar → $0,0060 · 3,5 s · termos 5/5 · confessa 2/2 · idade não · md ok");
console.log("modelo                 ms     in   out  $/chamada  losart dipir travam bicicl condrop | INTERPRETEI  psiculécia de-pirona | idade | md | JSON");
const ordem = ["openai/gpt-oss-120b","qwen/qwen3.8-27b"]; let n = 0;
for (const model of ordem) for (let r = 0; r < 2; r++) { if (n++ > 0) await new Promise(x => setTimeout(x, 65000));   // limite do Groq grátis: 1.000 tokens de saída/min
  const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json", "X-Session-Token": TOK }, body: JSON.stringify({ model, prompt, reasoning: model.includes("gpt-oss") ? "low" : undefined }) });
  const d = await res.json(); const u = d.usage || {}; const [pi, po] = PRECO[model];
  const custo = ((u.prompt_tokens || 0) * pi + (u.completion_tokens || 0) * po) / 1e6;
  const full = d.texto || ""; const t = full.split("---JSON---")[0]; const low = t.toLowerCase();
  const chk = w => low.includes(w) ? "✓" : "✗";
  const interp = /O QUE EU INTERPRETEI/i.test(t) ? "✓" : "✗";
  const decl = [/psicul/i.test(t) ? "✓" : "✗", /de pirona/i.test(t) ? "✓" : "✗"].join("        ");
  const idade = /\d{2}\s*anos/.test(t) ? "SIM" : "não"; const md = /\*\*|^#/m.test(t) ? "**" : "ok";
  let jsonOk = "✗"; try { const j = full.split("---JSON---")[1]; JSON.parse(j.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()); jsonOk = "✓"; } catch {}
  console.log(`${model.padEnd(22)} ${String(d.ms).padStart(5)} ${String(u.prompt_tokens||0).padStart(5)} ${String(u.completion_tokens||0).padStart(5)}  ${custo.toFixed(5)}    ${chk("losartana").padEnd(6)} ${chk("dipirona").padEnd(5)} ${chk("travamento").padEnd(6)} ${chk("bicicleta").padEnd(6)} ${chk("condropatia").padEnd(7)} | ${interp}            ${decl}      | ${idade}   | ${md} | ${jsonOk}${d.erro ? "  ERRO " + d.erro : ""}`);
}
