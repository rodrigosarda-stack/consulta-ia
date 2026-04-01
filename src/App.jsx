import { useState, useRef } from "react";

const STEPS = ["upload","transcribe","analyze","dispatch"];
const STEP_CONFIG = {
  upload:    { icon:"☁️", name:"Enviando gravação",       detail:"Transferência segura (TLS)" },
  transcribe:{ icon:"🎙️", name:"Transcrição com Whisper", detail:"Português médico (PT-BR)" },
  analyze:   { icon:"🧠", name:"Análise clínica com IA",  detail:"Resumo, hipóteses, conduta" },
  dispatch:  { icon:"📲", name:"Preparando envio",        detail:"WhatsApp + Telegram" },
};

function fmt(s) {
  return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
}

export default function App() {
  const [mode, setMode]       = useState("presencial");
  const [screen, setScreen]   = useState("record");
  const [isRec, setIsRec]     = useState(false);
  const [secs, setSecs]       = useState(0);
  const [patient, setPatient] = useState("");
  const [stepState, setStepState] = useState(() => Object.fromEntries(STEPS.map(s=>[s,"wait"])));
  const [sent, setSent]       = useState({});
  const [toast, setToast]     = useState(null);
  const [permErr, setPermErr] = useState("");
  const [finalSecs, setFinalSecs] = useState(0);

  const recorderRef = useRef(null);
  const chunksRef   = useRef([]);
  const timerRef    = useRef(null);
  const secsRef     = useRef(0);

  const isTele  = mode === "tele";
  const accent  = isTele ? "#a78bfa" : (isRec ? "#f87171" : "#2dd4bf");
  const btnGrad = isRec
    ? "linear-gradient(145deg,#ef4444,#f97316)"
    : isTele
      ? "linear-gradient(145deg,#a78bfa,#60a5fa)"
      : "linear-gradient(145deg,#2dd4bf,#60a5fa)";

  function startTimer() {
    secsRef.current = 0; setSecs(0);
    timerRef.current = setInterval(() => { secsRef.current++; setSecs(secsRef.current); }, 1000);
  }
  function stopTimer() { clearInterval(timerRef.current); }

  async function toggleRecord() { if (!isRec) await startRec(); else stopRec(); }

  async function startRec() {
    setPermErr("");
    try {
      let stream;
      if (isTele) {
        const scr = await navigator.mediaDevices.getDisplayMedia({ video:true, audio:true });
        try {
          const mic = await navigator.mediaDevices.getUserMedia({ audio:true });
          stream = new MediaStream([...scr.getTracks(), ...mic.getAudioTracks()]);
        } catch { stream = scr; }
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      }
      const mime = ["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/mp4"]
        .find(t => MediaRecorder.isTypeSupported(t)) || "";
      const recorder = new MediaRecorder(stream, mime ? {mimeType:mime} : {});
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => { stream.getTracks().forEach(t=>t.stop()); runProcessing(); };
      recorder.start(1000);
      recorderRef.current = recorder;
      setIsRec(true); startTimer();
    } catch(e) {
      setPermErr(e.name === "NotAllowedError"
        ? "Permissão negada. Clique no ícone 🔒 na barra de endereço → Permissões → Microfone → Permitir."
        : "Erro: " + e.message);
    }
  }

  function stopRec() {
    stopTimer(); setFinalSecs(secsRef.current); setIsRec(false);
    if (recorderRef.current?.state !== "inactive") recorderRef.current.stop();
  }

  function runProcessing() {
    setScreen("processing");
    const delays = [0,1500,3200,5600], durs = [1300,1900,2600,1200];
    STEPS.forEach((s,i) => {
      setTimeout(() => {
        setStepState(p => ({...p,[s]:"run"}));
        setTimeout(() => {
          setStepState(p => ({...p,[s]:"done"}));
          if (i === STEPS.length-1) setTimeout(() => setScreen("result"), 400);
        }, durs[i]);
      }, delays[i]);
    });
  }

  function sendChannel(ch) {
    setSent(p => ({...p,[ch]:true}));
    showToast(ch==="wa" ? "💬 Resumo enviado no WhatsApp!" : "✈️ Resumo enviado no Telegram!");
  }

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(null), 3200); }

  function resetApp() {
    stopTimer(); setScreen("record"); setIsRec(false); setSecs(0); secsRef.current=0;
    setSent({}); setPermErr(""); setMode("presencial");
    setStepState(Object.fromEntries(STEPS.map(s=>[s,"wait"])));
    recorderRef.current=null; chunksRef.current=[];
  }

  const card = { background:"#0c1622", border:"1px solid rgba(99,179,237,0.1)", borderRadius:14, padding:15, marginBottom:10 };
  const muted = { color:"#6b85a4" };

  return (
    <div style={{background:"#060c14",color:"#e2eaf6",fontFamily:"'Outfit',system-ui,sans-serif",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:"0 0 40px",position:"relative",overflow:"hidden"}}>

      {/* Ambient glow */}
      <div style={{position:"fixed",borderRadius:"50%",filter:"blur(80px)",pointerEvents:"none",zIndex:0,width:500,height:400,top:-120,left:"50%",transform:"translateX(-50%)",background:`radial-gradient(circle,${isTele?"rgba(167,139,250,0.07)":isRec?"rgba(248,113,113,0.09)":"rgba(45,212,191,0.07)"} 0%,transparent 70%)`,transition:"background 0.8s"}}/>

      <div style={{width:"100%",maxWidth:480,display:"flex",flexDirection:"column",position:"relative",zIndex:1,padding:"0 20px"}}>

        {/* HEADER */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"44px 0 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:32,height:32,borderRadius:9,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",background:isTele?"linear-gradient(135deg,#a78bfa,#60a5fa)":"linear-gradient(135deg,#2dd4bf,#60a5fa)",transition:"background 0.5s"}}>🩺</div>
            <span style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:600,letterSpacing:-0.3}}>
              Consulta<span style={{color:accent,transition:"color 0.5s"}}>IA</span>
            </span>
          </div>
          <div style={{fontSize:11,...muted,background:"#101e30",border:"1px solid rgba(99,179,237,0.1)",padding:"5px 10px",borderRadius:20,display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#4ade80"}}/>Dr. Sardá
          </div>
        </div>

        {/* ── TELA: RECORD ── */}
        {screen === "record" && (
          <div style={{display:"flex",flexDirection:"column",flex:1}}>

            {/* Mode selector */}
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {[{id:"presencial",icon:"🎙️",label:"Presencial",sub:"Só microfone"},{id:"tele",icon:"🖥️",label:"Teleconsulta",sub:"Tela + mic"}].map(m => {
                const active = mode===m.id;
                const col = m.id==="tele"?"#a78bfa":"#2dd4bf";
                const dim = m.id==="tele"?"rgba(167,139,250,0.15)":"rgba(45,212,191,0.15)";
                return (
                  <button key={m.id} onClick={()=>!isRec&&setMode(m.id)} style={{flex:1,padding:"13px 10px",borderRadius:14,cursor:isRec?"not-allowed":"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,fontFamily:"inherit",border:active?`1px solid ${col}44`:"1px solid rgba(99,179,237,0.1)",background:active?dim:"#0c1622",transition:"all 0.3s"}}>
                    <span style={{fontSize:22}}>{m.icon}</span>
                    <span style={{fontSize:13,fontWeight:500,color:active?col:"#6b85a4"}}>{m.label}</span>
                    <span style={{fontSize:11,color:"#6b85a4",opacity:0.7}}>{m.sub}</span>
                  </button>
                );
              })}
            </div>

            {isTele && (
              <div style={{display:"flex",gap:8,alignItems:"flex-start",background:"rgba(167,139,250,0.07)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:12,padding:"12px 14px",fontSize:13,color:"rgba(167,139,250,0.9)",marginBottom:12,lineHeight:1.5}}>
                💡 O browser pedirá pra você escolher qual janela compartilhar.
              </div>
            )}

            {/* Patient */}
            <div style={{...card,display:"flex",alignItems:"center",gap:11,marginBottom:8}}>
              <div style={{width:36,height:36,borderRadius:10,fontSize:17,display:"flex",alignItems:"center",justifyContent:"center",background:isTele?"rgba(167,139,250,0.15)":"rgba(45,212,191,0.15)",flexShrink:0,transition:"background 0.5s"}}>👤</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500}}>{patient||"Sem paciente selecionado"}</div>
                <div style={{fontSize:11,...muted,marginTop:2}}>{patient?(isTele?"Teleconsulta":"Consulta presencial"):"Toque para identificar"}</div>
              </div>
              <button onClick={()=>{const n=prompt("Nome do paciente:");if(n!==null)setPatient(n.trim());}} style={{fontSize:12,color:accent,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:"4px 8px",borderRadius:6}}>
                Editar
              </button>
            </div>

            {/* Big record button */}
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:22,padding:"12px 0"}}>
              <div style={{position:"relative",width:196,height:196,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {[{s:0,op:1},{s:-16,op:0.5},{s:-32,op:0.2}].map((r,i)=>(
                  <div key={i} style={{position:"absolute",borderRadius:"50%",top:r.s,left:r.s,right:r.s,bottom:r.s,border:isRec?`1px solid rgba(248,113,113,${0.35-i*0.12})`:"1px solid rgba(99,179,237,0.1)",opacity:r.op,transition:"border 0.5s"}}/>
                ))}
                <button onClick={toggleRecord} style={{width:152,height:152,borderRadius:"50%",border:"none",background:btnGrad,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:7,position:"relative",zIndex:1,boxShadow:isRec?"0 20px 60px rgba(239,68,68,0.25)":isTele?"0 20px 60px rgba(167,139,250,0.2)":"0 20px 60px rgba(45,212,191,0.18)",transition:"all 0.35s"}}>
                  <span style={{fontSize:38,lineHeight:1}}>{isRec?"⏹":isTele?"🖥️":"🎙️"}</span>
                  <span style={{fontSize:12,fontWeight:600,color:"white",letterSpacing:0.8,textTransform:"uppercase"}}>{isRec?"Parar":"Gravar"}</span>
                </button>
              </div>

              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"Georgia,serif",fontSize:50,fontWeight:300,letterSpacing:3,color:isRec?"#f87171":"#e2eaf6",transition:"color 0.3s",fontVariantNumeric:"tabular-nums"}}>{fmt(secs)}</div>
                <div style={{fontSize:12,color:isRec?"rgba(248,113,113,0.65)":"#6b85a4",marginTop:4,letterSpacing:0.8,textTransform:"uppercase"}}>
                  {isRec?(isTele?"Gravando teleconsulta...":"Gravando consulta..."):"Pronto para gravar"}
                </div>
              </div>

              {isRec && (
                <div style={{display:"flex",alignItems:"center",gap:3,height:36}}>
                  {Array.from({length:12}).map((_,i)=>(
                    <div key={i} style={{width:3,background:"#f87171",borderRadius:3,animation:`wv ${0.6+i*0.05}s ease-in-out ${i*0.04}s infinite alternate`}}/>
                  ))}
                  <style>{`@keyframes wv{from{height:4px}to{height:28px}}`}</style>
                </div>
              )}
            </div>

            {/* Quick note */}
            <div style={{...card,marginBottom:0}}>
              <div style={{fontSize:11,...muted,textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>Nota rápida (opcional)</div>
              <textarea rows={2} placeholder="Ex: Paciente com HAS, retorno..." style={{width:"100%",background:"transparent",border:"none",outline:"none",color:"#e2eaf6",fontFamily:"inherit",fontSize:14,resize:"none",lineHeight:1.5}}/>
            </div>

            {permErr && (
              <div style={{display:"flex",gap:9,alignItems:"flex-start",marginTop:12,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:12,padding:"13px 14px",fontSize:13,color:"#f87171",lineHeight:1.5}}>
                ⚠️ <span>{permErr}</span>
              </div>
            )}
          </div>
        )}

        {/* ── TELA: PROCESSING ── */}
        {screen === "processing" && (
          <div style={{display:"flex",flexDirection:"column",gap:11,paddingTop:4}}>
            <p style={{fontFamily:"Georgia,serif",fontSize:24,marginBottom:4}}>Analisando consulta...</p>
            <p style={{fontSize:13,...muted,marginBottom:12}}>Não feche o app. Cerca de 30 segundos.</p>
            {STEPS.map(sk => {
              const st = stepState[sk];
              const cfg = STEP_CONFIG[sk];
              return (
                <div key={sk} style={{background:"#0c1622",borderRadius:14,padding:15,display:"flex",alignItems:"center",gap:13,opacity:st==="wait"?0.35:1,border:st==="run"?"1px solid rgba(45,212,191,0.25)":st==="done"?"1px solid rgba(74,222,128,0.2)":"1px solid rgba(99,179,237,0.1)",transition:"all 0.4s"}}>
                  <div style={{width:38,height:38,borderRadius:10,fontSize:19,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:st==="run"?"rgba(45,212,191,0.15)":st==="done"?"rgba(74,222,128,0.12)":"#101e30",transition:"background 0.3s"}}>{cfg.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:500}}>{cfg.name}</div>
                    <div style={{fontSize:12,...muted,marginTop:2}}>{cfg.detail}</div>
                  </div>
                  <span style={{fontSize:11,fontWeight:500,padding:"3px 10px",borderRadius:20,flexShrink:0,background:st==="run"?"rgba(45,212,191,0.15)":st==="done"?"rgba(74,222,128,0.12)":"rgba(107,133,164,0.15)",color:st==="run"?"#2dd4bf":st==="done"?"#4ade80":"#6b85a4"}}>
                    {st==="wait"?"Aguardando":st==="run"?"Processando...":"✓ Pronto"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TELA: RESULT ── */}
        {screen === "result" && (
          <div style={{display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:26,fontWeight:600,lineHeight:1.2}}>📋 Resumo<br/>da Consulta</div>
              <div style={{fontSize:11,background:"rgba(74,222,128,0.12)",color:"#4ade80",border:"1px solid rgba(74,222,128,0.2)",padding:"5px 11px",borderRadius:20,fontWeight:500,marginTop:4}}>✓ IA Concluída</div>
            </div>

            <div style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:500,padding:"4px 12px",borderRadius:20,marginBottom:14,background:isTele?"rgba(167,139,250,0.15)":"rgba(45,212,191,0.15)",color:isTele?"#a78bfa":"#2dd4bf",border:isTele?"1px solid rgba(167,139,250,0.2)":"1px solid rgba(45,212,191,0.2)",alignSelf:"flex-start"}}>
              {isTele?"🖥️ Teleconsulta":"🎙️ Consulta Presencial"}
            </div>

            {[
              {label:"Queixa Principal", content:<p style={{fontSize:14,color:"#a8c0d8",lineHeight:1.65}}>Paciente, 54 anos, relata dor epigástrica recorrente há 3 semanas, com náuseas pós-prandiais. Nega vômitos ou perda de peso. Piora com estresse e jejum prolongado.</p>},
              {label:"Hipóteses Diagnósticas", content:<ul style={{paddingLeft:16}}>{["DRGE — Doença do refluxo gastroesofágico","Gastrite aguda / crônica","Úlcera péptica (diferencial)"].map(t=><li key={t} style={{fontSize:14,color:"#a8c0d8",lineHeight:1.65,marginBottom:4}}>{t}</li>)}</ul>},
              {label:"Conduta", content:<ul style={{paddingLeft:16}}>{["Omeprazol 20mg 1×/dia por 30 dias","Endoscopia digestiva alta solicitada","Orientação alimentar: fracionamento de refeições","Retorno em 30 dias ou antes se piora"].map(t=><li key={t} style={{fontSize:14,color:"#a8c0d8",lineHeight:1.65,marginBottom:4}}>{t}</li>)}</ul>},
              {label:"Metadados", content:<div style={{display:"flex",flexWrap:"wrap",gap:7}}>{[`⏱ ${fmt(finalSecs)}`,"📝 1.534 palavras","🩺 Dr. Sardá","📅 Hoje"].map(c=><div key={c} style={{fontSize:12,background:"#101e30",border:"1px solid rgba(99,179,237,0.1)",borderRadius:8,padding:"5px 10px",color:"#6b85a4"}}>{c}</div>)}</div>},
            ].map(b=>(
              <div key={b.label} style={{...card}}>
                <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1.5,color:"#2dd4bf",fontWeight:600,marginBottom:9}}>{b.label}</div>
                {b.content}
              </div>
            ))}

            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:1,...muted,marginBottom:10}}>Enviar resumo para</div>
              {[
                {id:"wa",icon:"💬",label:"WhatsApp",sub:"+55 48 9 9999-0000",color:"#25d366",dim:"rgba(37,211,102,"},
                {id:"tg",icon:"✈️",label:"Telegram",sub:"@drsarda",color:"#2aabee",dim:"rgba(42,171,238,"},
              ].map(ch=>(
                <button key={ch.id} onClick={()=>sendChannel(ch.id)} disabled={sent[ch.id]} style={{width:"100%",padding:15,border:`1px solid ${ch.dim}0.2)`,borderRadius:14,fontFamily:"inherit",fontSize:15,fontWeight:500,cursor:sent[ch.id]?"default":"pointer",display:"flex",alignItems:"center",gap:12,background:`${ch.dim}0.1)`,color:ch.color,opacity:sent[ch.id]?0.5:1,marginBottom:10,transition:"all 0.25s"}}>
                  <div style={{width:36,height:36,borderRadius:10,background:`${ch.dim}0.15)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>{ch.icon}</div>
                  <div style={{flex:1,textAlign:"left"}}>
                    <span style={{display:"block"}}>{ch.label}</span>
                    <span style={{display:"block",fontSize:12,opacity:0.65,marginTop:1}}>{ch.sub}</span>
                  </div>
                  <span style={{fontSize:18,opacity:0.4}}>{sent[ch.id]?"✓":"›"}</span>
                </button>
              ))}
            </div>

            <button onClick={resetApp} style={{width:"100%",padding:15,background:"transparent",border:"1px solid rgba(99,179,237,0.1)",borderRadius:14,color:"#6b85a4",fontFamily:"inherit",fontSize:15,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              🎙️ Nova consulta
            </button>
          </div>
        )}
      </div>

      {toast && (
        <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#101e30",border:"1px solid rgba(99,179,237,0.1)",borderRadius:14,padding:"13px 20px",display:"flex",alignItems:"center",gap:10,fontSize:14,zIndex:999,whiteSpace:"nowrap"}}>
          {toast}
        </div>
      )}
    </div>
  );
}
