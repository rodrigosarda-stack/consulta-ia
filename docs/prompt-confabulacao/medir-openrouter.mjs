// medir-openrouter.mjs — mesma régua do prontuário, modelos hospedados via OpenRouter (OpenAI-compatível).
// Uso: node medir-openrouter.mjs modelo1 modelo2 ...   (RODADAS=2 por padrão). Chave em .env.openrouter.
import { readFileSync, writeFileSync } from "node:fs";
const KEY = readFileSync(new URL("./.env.openrouter", import.meta.url), "utf8").match(/OPENROUTER_API_KEY=(\S+)/)[1];
const src = readFileSync("/Users/greenvalreflorestamento/Documents/Sistemas/consulta-ia/supabase/functions/process-consultation/index.ts", "utf8");
const PRONT = eval(src.match(/const PRONTUARIO_PROMPT = (`[\s\S]*?`);/)[1]);
const JSONI = eval(src.match(/const JSON_INSTRUCTION = (`[\s\S]*?`);/)[1]);
const T2 = readFileSync("/Users/greenvalreflorestamento/Documents/Sistemas/consulta-ia/docs/prompt-confabulacao/fixture-transcricao-2vozes-teste2-2026-09-07.txt", "utf8");
const prompt = `${PRONT}${JSONI}\n\n===== INICIO DO CONTEUDO =====\nPaciente: Ana\n\nTranscricao:\n${T2}\n===== FIM DO CONTEUDO =====`;
const modelos = process.argv.slice(2); const RODADAS = +(process.env.RODADAS || 2);
console.log("referência: gemini-3.7-flash sem pensar → $0,0060 · 3,5 s · termos 5/5 · confessa 2/2 · idade não · md ok");
console.log("modelo                          ms     in   out  $/chamada  losart dipir travam bicicl condrop | INTERPRETEI  psiculécia de-pirona | idade | md | JSON");
for (const model of modelos) for (let r = 1; r <= RODADAS; r++) {
  const t0 = Date.now();
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}`, "X-Title": "MarIA medir" },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature: 0.2, max_tokens: 4000,
      reasoning: (process.env.RACIOCINIO ? { effort: process.env.RACIOCINIO } : { enabled: false }), usage: { include: true } }) });
  const d = await res.json(); const ms = Date.now() - t0;
  if (!d.choices) { console.log(`${model.padEnd(30)} ERRO ${JSON.stringify(d).slice(0, 160)}`); continue; }
  const u = d.usage || {}; const custo = u.cost ?? 0;
  const full = d.choices[0].message.content || ""; const t = full.split("---JSON---")[0]; const low = t.toLowerCase();
  const chk = w => low.includes(w) ? "✓" : "✗";
  const interp = /O QUE EU INTERPRETEI/i.test(t) ? "✓" : "✗";
  const decl = [/psicul/i.test(t) ? "✓" : "✗", (/dipirona/i.test(t) && /INTERPRETEI[\s\S]*ouvi[^\n]*pirona/i.test(t)) ? "✓" : "✗"].join("        ");
  const idade = /\d{2}\s*anos/.test(t) ? "SIM" : "não"; const md = /\*\*|^#/m.test(t) ? "**" : "ok";
  let jsonOk = "✗"; try { JSON.parse(full.split("---JSON---")[1].trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()); jsonOk = "✓"; } catch {}
  const prov = d.provider ? ` [${d.provider}]` : "";
  console.log(`${model.padEnd(30)} ${String(ms).padStart(5)} ${String(u.prompt_tokens||0).padStart(5)} ${String(u.completion_tokens||0).padStart(5)}  ${(+custo).toFixed(5)}    ${chk("losartana").padEnd(6)} ${chk("dipirona").padEnd(5)} ${chk("travamento").padEnd(6)} ${chk("bicicleta").padEnd(6)} ${chk("condropatia").padEnd(7)} | ${interp}            ${decl}      | ${idade}   | ${md} | ${jsonOk}${prov}`);
  writeFileSync(`${new URL(".", import.meta.url).pathname}or-${model.replace(/[\/:]/g, "_")}-r${r}.txt`, full);
}
