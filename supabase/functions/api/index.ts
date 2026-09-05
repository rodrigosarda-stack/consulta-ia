// RESGATADO do Supabase em 05/09/2026 (versão 10, deployada em abril/2026).
// Este código NUNCA esteve no git — vivia só no servidor.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY"); // null ate configurar
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const ALLOWED_ORIGINS = ["https://consulta-ia.vercel.app","https://consulta-ia-git-staging-rodrigosarda-9265s-projects.vercel.app","http://localhost:5173","http://localhost:3000"];
function getCorsHeaders(req: Request) { const o = req.headers.get("Origin")||""; return { "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(o)?o:ALLOWED_ORIGINS[0], "Access-Control-Allow-Methods":"GET,POST,OPTIONS", "Access-Control-Allow-Headers":"Content-Type,X-Session-Token", "Access-Control-Max-Age":"86400", "Vary":"Origin" }; }
const rlIP = new Map<string,{c:number;r:number}>(); const rlSess = new Map<string,{c:number;r:number}>();
function rl(k:string,m:Map<string,{c:number;r:number}>,l:number){const n=Date.now();const e=m.get(k);if(!e||n>e.r){m.set(k,{c:1,r:n+60000});return true}e.c++;return e.c<=l}
async function valSess(t:string){if(!t)return null;const{data}=await supabase.from("session_tokens").select("telefone,expires_at").eq("token",t).single();if(!data||new Date(data.expires_at)<new Date())return null;const{data:u}=await supabase.from("usuarios").select("uid").eq("telefone",data.telefone).single();return{telefone:data.telefone,uid:u?.uid||"x"}}
function san(i:string){return i.replace(/<[^>]*>/g,"").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,"").trim().slice(0,200)}
function sanPh(i:string){return i.replace(/[^0-9()\s+-]/g,"").trim().slice(0,20)}
function json(d:unknown,s=200,r?:Request){return new Response(JSON.stringify(d),{status:s,headers:{"Content-Type":"application/json",...getCorsHeaders(r||new Request("https://x"))}})}

const PLANO_PRECOS: Record<string, number> = { maria: 4700, cerebro: 9700 }; // centavos

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method==="OPTIONS") return new Response(null,{headers:cors});
  const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
  if(!rl(ip,rlIP,30))return json({error:"Rate limit"},429,req);
  const url=new URL(req.url);const action=url.searchParams.get("action");
  const token=req.headers.get("X-Session-Token")||"";
  const sess=await valSess(token);if(!sess)return json({error:"Sessao invalida"},401,req);
  if(!rl(token,rlSess,60))return json({error:"Rate limit"},429,req);
  const{telefone,uid}=sess;
  try{
    if(action==="usuario"){const{data}=await supabase.from("usuarios").select("*").eq("telefone",telefone).single();return json({success:true,telefone,usuario:data},200,req)}
    if(action==="upload"&&req.method==="POST"){const fd=await req.formData();const af=fd.get("audio")as File;const pnr=fd.get("paciente_nome")as string;const ptr=fd.get("paciente_tel")as string||"";const dur=parseInt(fd.get("duracao")as string)||0;if(!af||!pnr)return json({error:"Faltam campos"},400,req);const pn=san(pnr);const pt=ptr?sanPh(ptr):null;if(!pn)return json({error:"Nome invalido"},400,req);if(af.size>52428800)return json({error:"Max 50MB"},400,req);const ext=af.type.includes("webm")?"webm":af.type.includes("mp4")?"m4a":af.type.includes("ogg")?"ogg":"wav";const fn=`${uid}/${crypto.randomUUID()}.${ext}`;const{error:ue}=await supabase.storage.from("audios").upload(fn,af,{contentType:af.type});if(ue)return json({error:"Upload falhou"},500,req);const{data:c,error:ie}=await supabase.from("consultas").insert({usuario_tel:telefone,paciente_nome:pn,paciente_tel:pt,audio_path:fn,audio_size_bytes:af.size,duracao_seg:dur,status:"uploaded"}).select().single();if(ie)return json({error:"Insert falhou"},500,req);return json({success:true,consulta:c},200,req)}
    if(action==="consulta"){const id=url.searchParams.get("id");if(!id||!/^[0-9a-f-]{36}$/i.test(id))return json({error:"ID invalido"},400,req);const{data}=await supabase.from("consultas").select("*").eq("id",id).eq("usuario_tel",telefone).single();return json({success:true,consulta:data},200,req)}
    if(action==="prontuario"){const ci=url.searchParams.get("consulta_id");if(!ci||!/^[0-9a-f-]{36}$/i.test(ci))return json({error:"ID invalido"},400,req);const{data}=await supabase.from("prontuarios").select("*").eq("consulta_id",ci).eq("usuario_tel",telefone).single();return json({success:true,prontuario:data},200,req)}
    if(action==="logout"&&req.method==="POST"){await supabase.from("session_tokens").delete().eq("token",token);return json({success:true},200,req)}

    // PAINEL
    if(action==="historico"){const pg=parseInt(url.searchParams.get("page")||"1");const lm=Math.min(parseInt(url.searchParams.get("limit")||"20"),50);const of2=(pg-1)*lm;const q=url.searchParams.get("q")||"";const{data:u}=await supabase.from("usuarios").select("plano").eq("telefone",telefone).single();if(u?.plano==="free")return json({success:false,paywall:true},200,req);let qr=supabase.from("prontuarios").select("id,consulta_id,paciente_nome,prontuario,prontuario_texto,created_at",{count:"exact"}).eq("usuario_tel",telefone).order("created_at",{ascending:false}).range(of2,of2+lm-1);if(q)qr=qr.textSearch("fts",q,{type:"websearch",config:"portuguese"});const{data,count}=await qr;return json({success:true,prontuarios:data,total:count,page:pg,limit:lm},200,req)}
    if(action==="pacientes"){const{data:u}=await supabase.from("usuarios").select("plano").eq("telefone",telefone).single();if(u?.plano==="free")return json({success:false,paywall:true},200,req);const{data}=await supabase.from("prontuarios").select("paciente_nome,created_at").eq("usuario_tel",telefone).order("created_at",{ascending:false});const p:Record<string,{nome:string;consultas:number;ultima:string}>={};for(const r of data||[]){const n=r.paciente_nome||"Sem nome";if(!p[n])p[n]={nome:n,consultas:0,ultima:r.created_at};p[n].consultas++}return json({success:true,pacientes:Object.values(p).sort((a,b)=>b.consultas-a.consultas)},200,req)}
    if(action==="timeline"){const nm=url.searchParams.get("paciente");if(!nm)return json({error:"Falta paciente"},400,req);const{data:u}=await supabase.from("usuarios").select("plano").eq("telefone",telefone).single();if(u?.plano==="free")return json({success:false,paywall:true},200,req);const{data}=await supabase.from("prontuarios").select("id,consulta_id,paciente_nome,prontuario,prontuario_texto,created_at").eq("usuario_tel",telefone).eq("paciente_nome",nm).order("created_at",{ascending:false});return json({success:true,timeline:data},200,req)}

    // CHECKOUT
    if(action==="checkout"&&req.method==="POST"){
      const plano=url.searchParams.get("plano");
      if(!plano||!PLANO_PRECOS[plano])return json({error:"Plano invalido"},400,req);

      if(!ASAAS_API_KEY){
        return json({success:false,message:"Pagamentos em breve! Estamos finalizando a integração."},200,req);
      }

      // Buscar ou criar customer no Asaas
      const{data:usuario}=await supabase.from("usuarios").select("*").eq("telefone",telefone).single();
      let customerId="";
      const{data:assinExist}=await supabase.from("assinaturas").select("provider_customer_id").eq("usuario_tel",telefone).limit(1).single();
      if(assinExist?.provider_customer_id){customerId=assinExist.provider_customer_id}
      else{
        const cRes=await fetch("https://api.asaas.com/v3/customers",{method:"POST",headers:{"Content-Type":"application/json",access_token:ASAAS_API_KEY},body:JSON.stringify({name:usuario?.nome||"Profissional de Saude",phone:telefone.replace("+55",""),externalReference:telefone})});
        const cData=await cRes.json();
        customerId=cData.id;
      }

      // Criar assinatura
      const sRes=await fetch("https://api.asaas.com/v3/subscriptions",{method:"POST",headers:{"Content-Type":"application/json",access_token:ASAAS_API_KEY},body:JSON.stringify({customer:customerId,billingType:"UNDEFINED",value:PLANO_PRECOS[plano]/100,cycle:"MONTHLY",description:`MarIA - Plano ${plano}`,externalReference:telefone})});
      const sData=await sRes.json();

      if(sData.id){
        await supabase.from("assinaturas").insert({usuario_tel:telefone,plano,provider:"asaas",provider_subscription_id:sData.id,provider_customer_id:customerId,valor_cents:PLANO_PRECOS[plano],status:"pending"});
        // Gerar link de pagamento
        const pRes=await fetch(`https://api.asaas.com/v3/paymentLinks`,{method:"POST",headers:{"Content-Type":"application/json",access_token:ASAAS_API_KEY},body:JSON.stringify({name:`MarIA ${plano}`,value:PLANO_PRECOS[plano]/100,billingType:"UNDEFINED",subscriptionCycle:"MONTHLY",chargeType:"RECURRENT",dueDateLimitDays:3,externalReference:telefone})});
        const pData=await pRes.json();
        return json({success:true,checkout_url:pData.url||"https://asaas.com"},200,req);
      }
      return json({error:"Falha ao criar assinatura"},500,req);
    }

    return json({error:"action invalida"},400,req);
  }catch(e){console.error("API:",uid,action);return json({error:"Erro interno"},500,req)}
});
