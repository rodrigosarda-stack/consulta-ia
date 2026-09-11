import fs from "node:fs";
const KEY = fs.readFileSync(".env.openrouter","utf8").trim().split("=").slice(1).join("=");
const TR = fs.readFileSync("/Users/greenvalreflorestamento/Documents/Sistemas/consulta-ia/docs/prompt-confabulacao/fixture-gemini-audio-3.7-teste1.txt","utf8")
  .split("\n").filter(l=>l.trim());

const SISTEMA = `Você é a Helena, assistente do médico DURANTE a consulta.
Você observa a conversa em tempo real e só fala quando vale muito a pena.

VOCÊ SÓ FALA SOBRE A CONVERSA E SOBRE O REGISTRO. NUNCA SOBRE MEDICINA.
Nunca comente dose, diagnóstico, conduta, contraindicação ou interação.

Pode avisar sobre: o paciente afirmar algo que o médico não disse; o paciente não repetir
de volta a orientação (sinal de que não entendeu); uma pergunta do paciente que ficou sem
resposta; um dado pessoal relevante que o paciente mencionou; a consulta caminhar para o fim
sem o retorno ter sido combinado; o médico falar muito mais que o paciente.

Responda APENAS com JSON: {"falar": false} ou {"falar": true, "aviso": "<até 12 palavras>"}.
No máximo 3 avisos na consulta inteira. Na dúvida, não fale.`;

const MODELOS = [
  "google/gemma-4-31b-it",
  "google/gemini-3.7-flash",
  "openai/gpt-4.1-mini",
];

async function chamar(modelo, mensagens){
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions",{
    method:"POST",
    headers:{Authorization:`Bearer ${KEY}`,"Content-Type":"application/json"},
    body: JSON.stringify({model:modelo, messages:mensagens, temperature:0.2,
      max_tokens:80, usage:{include:true}})
  });
  if(!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0,160)}`);
  return r.json();
}

// janela: o coach reavalia a cada N falas, vendo as ultimas 4 falas + resumo do que ja avisou
async function simular(modelo, passo){
  let custo=0, tin=0, tout=0, chamadas=0, avisos=[], ms=[];
  for(let i=passo; i<=TR.length; i+=passo){
    const janela = TR.slice(Math.max(0,i-4), i).join("\n");
    const jaAvisou = avisos.length ? `Você já avisou: ${avisos.join(" | ")}` : "Você ainda não avisou nada.";
    const t0=Date.now();
    const j = await chamar(modelo,[
      {role:"system",content:SISTEMA},
      {role:"user",content:`${jaAvisou}\n\nÚltimas falas da consulta em curso:\n${janela}`}
    ]);
    ms.push(Date.now()-t0);
    chamadas++;
    const u=j.usage||{};
    custo += u.cost ?? 0; tin += u.prompt_tokens||0; tout += u.completion_tokens||0;
    const txt=(j.choices?.[0]?.message?.content||"").replace(/```json|```/g,"").trim();
    try{ const o=JSON.parse(txt); if(o.falar && o.aviso) avisos.push(o.aviso); }catch{}
  }
  return {modelo,passo,chamadas,custo,tin,tout,avisos,
    msMedio: Math.round(ms.reduce((a,b)=>a+b,0)/ms.length), msMax: Math.max(...ms)};
}

const saida=[];
for(const m of MODELOS){
  for(const passo of [1,2]){
    try{ const r=await simular(m,passo); saida.push(r);
      console.log(`${m} passo=${passo}: ${r.chamadas} chamadas · US$${r.custo.toFixed(6)} · ${r.tin}+${r.tout} tok · ${r.msMedio}ms médio (máx ${r.msMax}) · ${r.avisos.length} avisos`);
      r.avisos.forEach(a=>console.log(`      → ${a}`));
    }catch(e){ console.log(`${m} passo=${passo}: ERRO ${e.message}`); }
  }
}
fs.writeFileSync("custo-coach.json", JSON.stringify(saida,null,2));
