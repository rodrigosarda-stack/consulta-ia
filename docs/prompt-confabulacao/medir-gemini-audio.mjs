import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
const API = "https://xzknmihhtgwggpndpivb.supabase.co/functions/v1/api?action=lab-audio";
const TOK = process.env.MARIA_SESSION_TOKEN;
const PRECO = { "gemini-3.7-flash": [0.75, 3.75], "gemini-3.5-flash-lite": [0.30, 2.50] };
const PROMPT = `Transcreva este áudio em português do Brasil, palavra por palavra, exatamente como foi dito — não corrija, não resuma, não omita hesitações. É uma consulta de saúde gravada pelo celular.
Identifique quem fala. Escreva cada fala numa linha começando com MÉDICO: ou PACIENTE: (ou OUTRO: para terceiros, como uma criança ou alguém ao fundo). Não escreva mais nada além das falas.`;
const GRAV = [["teste1 (73 s)", "audio-real/ee6e7eb2-6066-4f64-a321-19d1e9161f42.webm", "../fixture-transcricao-2vozes-2026-09-07.txt"], ["teste2 (144 s)", "audio-real/444e3de9-5e80-42ab-9ef9-d99f1dadec1e.webm", "../fixture-transcricao-2vozes-teste2-2026-09-07.txt"]];
const DOCS = "/Users/greenvalreflorestamento/Documents/Sistemas/consulta-ia/docs/prompt-confabulacao";
const TERMOS = ["losartana", "dipirona", "travamento", "palpação", "ergométrica", "sem carga", "condropatia", "menisco"];
for (const model of ["gemini-3.7-flash", "gemini-3.5-flash-lite"]) for (const [nome, arq, fixWhisper] of GRAV) {
  const fd = new FormData(); fd.append("audio", new Blob([readFileSync(arq)], { type: "audio/webm" }), "a.webm"); fd.append("model", model); fd.append("thinking", "off"); fd.append("prompt", PROMPT);
  const r = await fetch(API, { method: "POST", headers: { "X-Session-Token": TOK }, body: fd }); const d = await r.json();
  const u = d.usage || {}; const [pi, po] = PRECO[model]; const custo = ((u.promptTokenCount || 0) * pi + ((u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0)) * po) / 1e6;
  const t = d.texto || ""; const out = `gemini-${model.replace("gemini-", "")}-${nome.split(" ")[0]}.txt`; writeFileSync(out, t);
  const semRotulo = t.replace(/^\s*(MÉDICO|MEDICO|PACIENTE|OUTRO)\s*:\s*/gim, "").replace(/\s+/g, " ").trim(); writeFileSync(out.replace(".txt", ".plain.txt"), semRotulo);
  const low = semRotulo.toLowerCase();
  const wl = readFileSync(`${DOCS}/${fixWhisper.replace("../", "")}`, "utf8").toLowerCase();
  const falas = { MÉDICO: (t.match(/^\s*M[ÉE]DICO:/gim) || []).length, PACIENTE: (t.match(/^\s*PACIENTE:/gim) || []).length, OUTRO: (t.match(/^\s*OUTRO:/gim) || []).length };
  let cmp = ""; try { cmp = execSync(`python3 ${DOCS}/comparar.py ${DOCS}/fixture-roteiro-original.txt ${out.replace(".txt", ".plain.txt")}`).toString(); } catch (e) { cmp = String(e.stdout || e); }
  const bateu = (cmp.match(/bateram: (\d+\/\d+ = [\d.]+%)/) || [])[1] || "?"; const crit = (cmp.match(/(\d+) das (\d+) divergências/) || []).slice(1).join("/") || "?";
  console.log(`\n═══ ${model} · ${nome} · ${d.ms} ms · in ${u.promptTokenCount} out ${u.candidatesTokenCount} pens ${u.thoughtsTokenCount || 0} · $${custo.toFixed(4)}${d.erro ? " · ERRO " + d.erro : ""}`);
  console.log(`  bateu com o roteiro: ${bateu}   (divergências críticas/total: ${crit})   falas: MÉDICO ${falas.MÉDICO} · PACIENTE ${falas.PACIENTE} · OUTRO ${falas.OUTRO}`);
  console.log("  termos:  " + TERMOS.map(x => `${x} ${low.includes(x) ? "✓" : "✗"}${wl.includes(x) ? "" : " (whisper ✗)"}`).join(" · "));
  const lin = t.split("\n").filter(Boolean);
  const losa = lin.find(l => /losartana|lasartana/i.test(l)) || "—"; const presc = lin.find(l => /prescrev|dipirona|de pirona/i.test(l)) || "—";
  console.log(`  quem disse losartana: ${losa.slice(0, 90)}\n  quem prescreveu:      ${presc.slice(0, 90)}`);
}
