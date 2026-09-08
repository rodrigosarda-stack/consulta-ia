import { readFileSync } from "node:fs";
const API = "https://xzknmihhtgwggpndpivb.supabase.co/functions/v1/api?action=lab-anthropic-gen";
const TOK = process.env.MARIA_SESSION_TOKEN;
const PRECO = { "claude-haiku-4-5-20251001": [1, 5], "claude-sonnet-5": [2, 10] };
const src = readFileSync("/Users/greenvalreflorestamento/Documents/Sistemas/consulta-ia/supabase/functions/process-consultation/index.ts", "utf8");
const PRONT = eval(src.match(/const PRONTUARIO_PROMPT = (`[\s\S]*?`);/)[1]);
const JSONI = eval(src.match(/const JSON_INSTRUCTION = (`[\s\S]*?`);/)[1]);
const T2 = readFileSync("/Users/greenvalreflorestamento/Documents/Sistemas/consulta-ia/docs/prompt-confabulacao/fixture-transcricao-2vozes-teste2-2026-09-07.txt", "utf8");
const prompt = `${PRONT}${JSONI}\n\n===== INICIO DO CONTEUDO =====\nPaciente: Ana\n\nTranscricao:\n${T2}\n===== FIM DO CONTEUDO =====`;
console.log("modelo                      ms     in   out  $/chamada  losart dipir travam bicicl condrop | INTERPRETEI  psiculécia de-pirona | idade | md | JSON");
for (const model of Object.keys(PRECO)) for (let r = 0; r < 2; r++) {
  const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json", "X-Session-Token": TOK }, body: JSON.stringify({ model, prompt }) });
  const d = await res.json(); const u = d.usage || {}; const [pi, po] = PRECO[model];
  const custo = ((u.input_tokens || 0) * pi + (u.output_tokens || 0) * po) / 1e6;
  const full = d.texto || ""; const t = full.split("---JSON---")[0]; const low = t.toLowerCase();
  const chk = w => low.includes(w) ? "✓" : "✗";
  const interp = /O QUE EU INTERPRETEI/i.test(t) ? "✓" : "✗";
  const decl = [/psicul/i.test(t) ? "✓" : "✗", /de pirona/i.test(t) ? "✓" : "✗"].join("        ");
  const idade = /\d{2}\s*anos/.test(t) ? "SIM" : "não"; const md = /\*\*|^#/m.test(t) ? "**" : "ok";
  let jsonOk = "✗"; try { const j = full.split("---JSON---")[1]; JSON.parse(j.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()); jsonOk = "✓"; } catch {}
  console.log(`${model.padEnd(27)} ${String(d.ms).padStart(5)} ${String(u.input_tokens||0).padStart(5)} ${String(u.output_tokens||0).padStart(5)}  ${custo.toFixed(5)}    ${chk("losartana").padEnd(6)} ${chk("dipirona").padEnd(5)} ${chk("travamento").padEnd(6)} ${chk("bicicleta").padEnd(6)} ${chk("condropatia").padEnd(7)} | ${interp}            ${decl}      | ${idade}   | ${md} | ${jsonOk}${d.erro ? "  ERRO " + d.erro : ""}`);
}
