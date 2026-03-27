"use client";
import{useState,useRef,useEffect}from"react";
import{FirestoreProvider,useFirestore}from"@/components/providers/FirestoreProvider";
import{addProject,updateProject,deleteProject}from"@/lib/firestore/projects";
import{addMember,updateMember,deleteMember}from"@/lib/firestore/members";

const COLORS=["#CECBF6","#9FE1CB","#FAC775","#F5C4B3","#B5D4F4","#C0DD97","#F4C0D1","#D3D1C7"];
const CTEXTS=["#3C3489","#085041","#633806","#712B13","#0C447C","#27500A","#72243E","#444441"];
const STAGES=[{id:"initiated",label:"Initiated",color:"#E5E4DC",tc:"#444441"},{id:"scripting",label:"Script Writing",color:"#FAC775",tc:"#633806"},{id:"storyboard",label:"Storyboarding",color:"#CECBF6",tc:"#3C3489"},{id:"recording",label:"Recording",color:"#F5C4B3",tc:"#712B13"},{id:"editing",label:"Editing",color:"#B5D4F4",tc:"#0C447C"},{id:"review",label:"Review",color:"#9FE1CB",tc:"#085041"},{id:"done",label:"Done",color:"#C0DD97",tc:"#27500A"}];
const SCRIPT_GUIDELINES=`You are a professional B2B video scriptwriter.
Follow this EXACT script flow — this is mandatory:
## Problem
What specific problem did the customer face? Make it real and relatable.
## Solution
What solution did we provide? Clear and benefit-focused.
## How We Implemented
Step by step how the solution was put in place. Be specific.
## Benefits
What measurable results and value did the client achieve?

Rules: under 300 words total, use the narrator tone specified, make every word count, end with a strong CTA.`;
const STORYBOARD_SEGMENTS=[{id:"title_card",label:"Title card",dur:"4s",type:"animation",desc:"Animated logo + video title",icon:"🎬"},{id:"intro_hook",label:"Intro hook",dur:"10s",type:"animation",desc:"Attention-grabbing opening",icon:"✨"},{id:"problem",label:"Problem visual",dur:"20s",type:"illustration",desc:"Illustration of client challenge",icon:"🎨"},{id:"solution",label:"Solution reveal",dur:"15s",type:"animation",desc:"Animation showing solution",icon:"💡"},{id:"implementation",label:"Demo clip",dur:"25s",type:"demo",desc:"Product or process in action",icon:"🖥"},{id:"benefits",label:"Benefits & results",dur:"20s",type:"illustration",desc:"Data visualisation of outcomes",icon:"📊"},{id:"talking_head",label:"People segment",dur:"15s",type:"people",desc:"Team or client on camera",icon:"🎤"},{id:"end_card",label:"End card",dur:"11s",type:"animation",desc:"Logo, CTA, contact animation",icon:"🏁"}];
const TYPE_COLORS={animation:{bg:"#f5f3ff",tc:"#7c3aed"},illustration:{bg:"#eff6ff",tc:"#3b82f6"},demo:{bg:"#fef3c7",tc:"#d97706"},people:{bg:"#ecfdf5",tc:"#10b981"}};

const stagePct=(s:string)=>Math.round((STAGES.findIndex(x=>x.id===s)/Math.max(STAGES.length-1,1))*100);
const getStage=(id:string)=>STAGES.find(s=>s.id===id)||STAGES[0];
const isOverdue=(p:any)=>p.due&&new Date(p.due)<new Date()&&p.stage!=="done";

function Av({m,size=26}:{m:any;size?:number}){
  if(!m)return null;
  return<div style={{width:size,height:size,borderRadius:"50%",background:m.color,color:m.textColor||m.tc,fontSize:size*0.38,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"2px solid rgba(255,255,255,0.5)"}}>{m.avatar}</div>;
}
function SPill({sid}:{sid:string}){
  const s=getStage(sid);
  return<span style={{fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:20,whiteSpace:"nowrap",background:s.color,color:s.tc}}>{s.label}</span>;
}
function Bar({pct,color="#7c3aed",h=4}:{pct:number;color?:string;h?:number}){
  return<div style={{height:h,borderRadius:h,background:"#E5E7EB",overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:color,transition:"width .4s"}}/></div>;
}

function Splash({members,onSelect}:{members:any[];onSelect:(id:string)=>void}){
  const[sel,setSel]=useState("");
  const[anim,setAnim]=useState(false);
  useEffect(()=>{setTimeout(()=>setAnim(true),80);},[]);
  if(members.length===0)return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a1a2e,#0f3460)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"-apple-system,sans-serif"}}>
      <div style={{textAlign:"center",color:"#fff",padding:24}}>
        <div style={{fontSize:48,marginBottom:16}}>🎬</div>
        <h1 style={{fontSize:26,fontWeight:800,margin:"0 0 8px"}}>Video Production Tracker</h1>
        <p style={{color:"#94a3b8",marginBottom:24}}>AI-powered script and storyboard generation</p>
        <button onClick={()=>onSelect("setup")} style={{padding:"12px 32px",borderRadius:30,background:"#7c3aed",color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700}}>Set up your team →</button>
      </div>
    </div>
  );
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"-apple-system,sans-serif"}}>
      <div style={{textAlign:"center",marginBottom:40,opacity:anim?1:0,transform:anim?"translateY(0)":"translateY(-20px)",transition:"all .6s"}}>
        <div style={{fontSize:48,marginBottom:10}}>🎬</div>
        <h1 style={{color:"#fff",fontSize:28,fontWeight:800,margin:"0 0 6px"}}>Video Production Tracker</h1>
        <p style={{color:"#94a3b8",fontSize:14,margin:0}}>AI script · Storyboard · Team workflow</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:12,width:"100%",maxWidth:640,opacity:anim?1:0,transition:"all .7s .15s"}}>
        {members.map((m:any)=>(
          <div key={m.id} onClick={()=>setSel(m.id)} style={{background:sel===m.id?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.07)",borderRadius:14,padding:"18px 12px",cursor:"pointer",textAlign:"center",border:sel===m.id?"2px solid #a78bfa":"2px solid rgba(255,255,255,0.1)",transition:"all .2s"}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:m.color,color:m.textColor||m.tc,fontSize:18,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>{m.avatar}</div>
            <div style={{color:"#fff",fontSize:14,fontWeight:700}}>{m.name.split(" ")[0]}</div>
            <div style={{color:"#94a3b8",fontSize:11,marginTop:3}}>{(m.roles||[]).slice(0,2).join(" & ")}</div>
          </div>
        ))}
      </div>
      {sel&&<button onClick={()=>onSelect(sel)} style={{marginTop:28,padding:"12px 40px",borderRadius:30,background:"#7c3aed",color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700}}>Enter dashboard →</button>}
    </div>
  );
}

function Inner(){
  const{projects,members}=useFirestore();
  const[currentUser,setCurrentUser]=useState<string|null>(null);
  const[view,setView]=useState("dashboard");
  const[sel,setSel]=useState<string|null>(null);
  const[dtab,setDtab]=useState("script");
  const[modal,setModal]=useState<string|null>(null);
  const[aiLoading,setAiLoading]=useState(false);
  const[aiStep,setAiStep]=useState("");
  const[newP,setNewP]=useState({title:"",assigneeId:"",managerId:"",due:"",narratorStyle:"Professional & concise",guidelines:""});
  const[newM,setNewM]=useState<{name:string;email:string;roles:any[]}>({name:"",email:"",roles:["writer"]});
  const[shoutoutTarget,setShoutoutTarget]=useState("");
  const[shoutoutText,setShoutoutText]=useState("");
  const fileRef=useRef<HTMLInputElement>(null);

  const member=currentUser&&currentUser!=="_setup"?members.find(m=>m.id===currentUser):null;
  const proj=sel?projects.find(p=>p.id===sel):null;
  const isManager=member&&(member.roles||[]).some((r:string)=>r==="manager"||r==="director");
  const mb=(id:string|null)=>members.find((m:any)=>m.id===id)||null;

  const updP=(id:string,patch:any)=>updateProject(id,patch);
  const advanceStage=(projId:string)=>{
    const p=projects.find((x:any)=>x.id===projId);
    if(!p)return;
    const idx=STAGES.findIndex(s=>s.id===p.stage);
    if(idx<STAGES.length-1)updP(projId,{stage:STAGES[idx+1].id});
  };

  const handleUpload=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    if(!proj)return;
    const files=Array.from(e.target.files??[]);
    const loaded=await Promise.all(files.map(f=>new Promise<any>(res=>{const r=new FileReader();r.onload=()=>res({name:f.name,size:f.size,type:f.type,content:r.result});if(f.type==="application/pdf")r.readAsDataURL(f);else r.readAsText(f);})));
    await updP(proj.id,{attachments:[...(proj.attachments||[]),...loaded]});
  };

  const generateScript=async(p:any)=>{
    setAiLoading(true);setAiStep("Reading your documents...");
    const attachTexts=(p.attachments||[]).filter((a:any)=>!a.type.includes("pdf")).map((a:any)=>(`[` + a.name + `]\n` + a.content)).join("\n\n");
    setAiStep("Writing script — Problem → Solution → Implementation → Benefits...");
    const extra=p.guidelines?("\nAdditional guidelines: " + p.guidelines):"";
    try{
      const res=await fetch("/api/generate-script",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:p.title,narratorStyle:p.narratorStyle||"professional",attachmentTexts:attachTexts?[attachTexts]:[],oneDriveTexts:[],systemOverride:SCRIPT_GUIDELINES+extra})});
      const data=await res.json();
      const script=data.script||"Error generating script. Check your API key in Vercel settings.";
      setAiStep("Saving...");
      await updP(p.id,{scriptDraft:script,stage:p.stage==="initiated"?"scripting":p.stage});
    }catch(e:any){await updP(p.id,{scriptDraft:"Error: "+e.message});}
    setAiLoading(false);setAiStep("");
  };

  const generateStoryboard=async(p:any)=>{
    setAiLoading(true);setAiStep("Planning storyboard segments...");
    try{
      const res=await fetch("/api/generate-script",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:p.title,narratorStyle:"storyboard",attachmentTexts:p.scriptDraft?[`Script:
${p.scriptDraft}`]:[],oneDriveTexts:[],systemOverride:`You are a professional video storyboard director. Generate a storyboard plan as a JSON array.
For each of these 8 segments provide visual direction and voiceover cue:
title_card(4s), intro_hook(10s), problem(20s), solution(15s), implementation(25s), benefits(20s), talking_head(15s), end_card(11s)
Return ONLY a valid JSON array with objects: {id, visual, voiceover_cue, asset_type}
asset_type must be one of: animation, illustration, demo_clip, talking_head`})});
      const data=await res.json();
      const raw=data.script||"[]";
      let storyboard=[];
      try{const m=raw.match(/\[[\s\S]*\]/);if(m)storyboard=JSON.parse(m[0]);}catch{}
      await updP(p.id,{storyboard,stage:p.stage==="scripting"?"storyboard":p.stage});
    }catch(e){console.error(e);}
    setAiLoading(false);setAiStep("");
  };

  const S:any={
    I:{display:"block",width:"100%",marginTop:4,padding:"8px 10px",borderRadius:8,border:"1px solid #E5E7EB",fontSize:13,background:"#fff",color:"#111",boxSizing:"border-box",outline:"none"},
    L:{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.05em"},
    bP:{padding:"8px 18px",borderRadius:8,background:"#7c3aed",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700},
    bG:{padding:"8px 14px",borderRadius:8,background:"none",color:"#374151",border:"1px solid #E5E7EB",cursor:"pointer",fontSize:13},
  };

  if(!currentUser||currentUser==="_setup") return(
    <>
      <Splash members={members} onSelect={id=>{if(id==="setup"){setModal("team");setCurrentUser("_setup");}else{setCurrentUser(id);setView("dashboard");}}}/>
      {modal==="team"&&<TeamModal/>}
    </>
  );

  function Card({p}:{p:any}){
    const a=mb(p.assigneeId),mg=mb(p.managerId),over=isOverdue(p);
    return(
      <div onClick={()=>{setSel(p.id);setDtab("script");}} onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.10)")} onMouseLeave={e=>(e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.06)")}
        style={{background:"#fff",border:`1px solid ${over?"#fca5a5":"#E5E7EB"}`,borderRadius:12,padding:16,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",transition:"box-shadow .2s",position:"relative"}}>
        {over&&<div style={{position:"absolute",top:10,right:10,background:"#fef2f2",color:"#ef4444",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20}}>OVERDUE</div>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,paddingRight:over?56:0}}>
          <p style={{fontWeight:700,fontSize:14,color:"#111",lineHeight:1.4,flex:1,margin:0}}>{p.title}</p>
          <SPill sid={p.stage}/>
        </div>
        <div style={{marginTop:10}}><Bar pct={stagePct(p.stage)} color={over?"#ef4444":p.stage==="done"?"#10b981":"#7c3aed"}/></div>
        <div style={{marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            {a&&<><Av m={a} size={22}/><span style={{fontSize:12,color:"#374151"}}>{a.name.split(" ")[0]}</span></>}
            {mg&&<><span style={{fontSize:11,color:"#D1D5DB",margin:"0 2px"}}>→</span><Av m={mg} size={20}/><span style={{fontSize:11,color:"#9CA3AF"}}>{mg.name.split(" ")[0]}</span></>}
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {p.scriptDraft&&<span style={{fontSize:11,color:"#7c3aed",background:"#f5f3ff",padding:"1px 6px",borderRadius:20}}>✍</span>}
            {(p.storyboard||[]).length>0&&<span style={{fontSize:11,color:"#3b82f6",background:"#eff6ff",padding:"1px 6px",borderRadius:20}}>🎨</span>}
            {p.due&&<span style={{fontSize:11,color:over?"#ef4444":"#9CA3AF"}}>{p.due}</span>}
          </div>
        </div>
      </div>
    );
  }

  function Detail(){
    if(!proj)return null;
    const a=mb(proj.assigneeId),mg=mb(proj.managerId);
    const curIdx=STAGES.findIndex(s=>s.id===proj.stage);
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",zIndex:50,display:"flex",justifyContent:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget)setSel(null);}}>
        <div style={{width:"min(720px,100%)",height:"100%",background:"#fff",overflowY:"auto",borderLeft:"1px solid #E5E7EB",boxShadow:"-8px 0 32px rgba(0,0,0,0.12)",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"22px 26px 0",flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div><h2 style={{fontWeight:800,fontSize:18,color:"#111",margin:0}}>{proj.title}</h2><div style={{marginTop:5,display:"flex",gap:6,alignItems:"center"}}><SPill sid={proj.stage}/>{isOverdue(proj)&&<span style={{fontSize:11,background:"#fef2f2",color:"#ef4444",padding:"2px 8px",borderRadius:20,fontWeight:700}}>OVERDUE</span>}</div></div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{if(window.confirm("Delete this project?")){{deleteProject(proj.id);setSel(null);}}}} style={{padding:"5px 12px",borderRadius:8,background:"#fef2f2",color:"#ef4444",border:"1px solid #fca5a5",cursor:"pointer",fontSize:12,fontWeight:700}}>Delete</button>
                <button onClick={()=>setSel(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#9CA3AF"}}>✕</button>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:12,padding:"8px 14px",background:"#F9FAFB",borderRadius:10,border:"1px solid #F0F0F0",flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:"#9CA3AF",fontWeight:700}}>ASSIGNEE</span>
              {a?<div style={{display:"flex",alignItems:"center",gap:5}}><Av m={a} size={20}/><span style={{fontSize:13,fontWeight:700}}>{a.name}</span></div>:<span style={{color:"#D1D5DB",fontSize:12}}>—</span>}
              <span style={{color:"#D1D5DB",fontSize:16}}>→</span>
              <span style={{fontSize:11,color:"#9CA3AF",fontWeight:700}}>MANAGER</span>
              {mg?<div style={{display:"flex",alignItems:"center",gap:5}}><Av m={mg} size={20}/><span style={{fontSize:13,fontWeight:700}}>{mg.name}</span></div>:<span style={{color:"#D1D5DB",fontSize:12}}>—</span>}
            </div>
            <div style={{display:"flex",marginTop:12,borderBottom:"2px solid #F3F4F6"}}>
              {["script","storyboard","files","pipeline","notes"].map(t=><button key={t} onClick={()=>setDtab(t)} style={{background:"none",border:"none",borderBottom:dtab===t?"2px solid #7c3aed":"2px solid transparent",cursor:"pointer",padding:"7px 12px",marginBottom:-2,fontSize:12,fontWeight:dtab===t?700:400,color:dtab===t?"#7c3aed":"#6B7280",textTransform:"capitalize",whiteSpace:"nowrap"}}>{t}</button>)}
            </div>
          </div>
          <div style={{padding:"18px 26px",flex:1}}>
            {dtab==="script"&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
                  {[{id:"problem",l:"Problem",i:"❗",c:"#fef2f2",t:"#ef4444"},{id:"solution",l:"Solution",i:"💡",c:"#eff6ff",t:"#3b82f6"},{id:"implementation",l:"How We Did It",i:"⚙",c:"#f5f3ff",t:"#7c3aed"},{id:"benefits",l:"Benefits",i:"★",c:"#ecfdf5",t:"#10b981"}].map((f,i)=>(
                    <div key={f.id} style={{background:f.c,borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1px solid ${f.t}22`}}>
                      <div style={{fontSize:16,marginBottom:3}}>{f.i}</div>
                      <div style={{fontSize:11,fontWeight:700,color:f.t}}>{i+1}. {f.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  <div><label style={S.L}>Narrator tone</label><input style={S.I} value={proj.narratorStyle||""} onChange={e=>updP(proj.id,{narratorStyle:e.target.value})} placeholder="Professional & concise"/></div>
                  <div><label style={S.L}>Extra guidelines</label><input style={S.I} value={proj.guidelines||""} onChange={e=>updP(proj.id,{guidelines:e.target.value})} placeholder="e.g. Mention ROI, keep under 2 min"/></div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <p style={{fontWeight:700,fontSize:14,color:"#111",margin:0}}>Script draft</p>
                  <button onClick={()=>generateScript(proj)} disabled={aiLoading} style={{...S.bP,fontSize:12,padding:"7px 16px",opacity:aiLoading?0.6:1}}>
                    {aiLoading?"Generating...":"✦ Generate with AI"}
                  </button>
                </div>
                {aiLoading&&(
                  <div style={{padding:"16px",background:"#f5f3ff",borderRadius:10,border:"1px solid #ddd6fe",marginBottom:10,textAlign:"center"}}>
                    <div style={{width:28,height:28,border:"3px solid #ddd6fe",borderTop:"3px solid #7c3aed",borderRadius:"50%",margin:"0 auto 8px",animation:"spin 0.8s linear infinite"}}/>
                    <p style={{color:"#7c3aed",fontWeight:700,margin:"0 0 3px",fontSize:13}}>{aiStep}</p>
                    <p style={{color:"#a78bfa",fontSize:11,margin:0}}>Problem → Solution → Implementation → Benefits</p>
                    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                  </div>
                )}
                {!(proj.attachments||[]).length&&<p style={{fontSize:12,color:"#d97706",marginBottom:8,background:"#fffbeb",padding:"6px 10px",borderRadius:6}}>💡 Upload case study docs in Files tab for a better script</p>}
                <textarea rows={18} value={proj.scriptDraft||""} onChange={e=>updP(proj.id,{scriptDraft:e.target.value})}
                  placeholder="Click Generate with AI — script will follow:

1. Problem
2. Solution
3. How We Implemented
4. Benefits

Or write manually here."
                  style={{width:"100%",padding:12,borderRadius:9,border:"1px solid #E5E7EB",fontSize:13,lineHeight:1.8,resize:"vertical",background:"#FAFAFA",color:"#111",boxSizing:"border-box",fontFamily:"monospace",outline:"none"}}/>
              </div>
            )}
            {dtab==="storyboard"&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div><p style={{fontWeight:700,fontSize:14,color:"#111",margin:0}}>Storyboard — 2 min video</p><p style={{fontSize:12,color:"#9CA3AF",margin:"3px 0 0"}}>Illustrations · Animations · Demo clips · Talking head</p></div>
                  <button onClick={()=>generateStoryboard(proj)} disabled={aiLoading} style={{...S.bP,background:"#3b82f6",fontSize:12,padding:"7px 16px",opacity:aiLoading?0.6:1}}>
                    {aiLoading?"Generating...":"🎨 Generate storyboard"}
                  </button>
                </div>
                {aiLoading&&<div style={{padding:"14px",background:"#eff6ff",borderRadius:10,border:"1px solid #bfdbfe",marginBottom:12,textAlign:"center"}}><div style={{width:24,height:24,border:"3px solid #bfdbfe",borderTop:"3px solid #3b82f6",borderRadius:"50%",margin:"0 auto 8px",animation:"spin 0.8s linear infinite"}}/><p style={{color:"#3b82f6",fontWeight:700,margin:0,fontSize:13}}>{aiStep||"Planning visual segments..."}</p></div>}
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {STORYBOARD_SEGMENTS.map(seg=>{
                    const ai=(proj.storyboard||[]).find((s:any)=>s.id===seg.id);
                    const tc=TYPE_COLORS[seg.type as keyof typeof TYPE_COLORS]||{bg:"#F9FAFB",tc:"#6B7280"};
                    return(
                      <div key={seg.id} style={{borderRadius:10,border:"1px solid #E5E7EB",overflow:"hidden"}}>
                        <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:tc.bg}}>
                          <span style={{fontSize:20}}>{seg.icon}</span>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                              <span style={{fontWeight:700,fontSize:13,color:"#111"}}>{seg.label}</span>
                              <span style={{fontSize:11,background:"#fff",color:tc.tc,padding:"1px 7px",borderRadius:20,fontWeight:700}}>{seg.dur}</span>
                              <span style={{fontSize:11,color:tc.tc,fontWeight:600,textTransform:"capitalize"}}>{seg.type.replace("_"," ")}</span>
                            </div>
                            <p style={{fontSize:12,color:"#6B7280",margin:"2px 0 0"}}>{seg.desc}</p>
                          </div>
                        </div>
                        {ai&&<div style={{padding:"10px 14px",background:"#fff",borderTop:"1px solid #E5E7EB"}}>
                          <p style={{fontSize:12,fontWeight:700,color:"#374151",margin:"0 0 4px"}}>Visual direction:</p>
                          <p style={{fontSize:12,color:"#374151",margin:"0 0 4px",lineHeight:1.6}}>{ai.visual}</p>
                          {ai.voiceover_cue&&<p style={{fontSize:11,color:"#9CA3AF",margin:0,fontStyle:"italic"}}>🎙 "{ai.voiceover_cue}"</p>}
                        </div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {dtab==="files"&&(
              <div>
                <p style={{fontWeight:700,fontSize:14,color:"#111",margin:"0 0 12px"}}>Source documents</p>
                <div style={{border:"2px dashed #E5E7EB",borderRadius:12,padding:20,textAlign:"center",marginBottom:14,background:"#FAFAFA"}}>
                  <div style={{fontSize:28,marginBottom:6}}>📂</div>
                  <p style={{fontSize:13,color:"#6B7280",margin:"0 0 4px"}}>Upload case study, brief, or source material</p>
                  <p style={{fontSize:11,color:"#9CA3AF",margin:"0 0 12px"}}>.txt · .md · .pdf · .docx</p>
                  <button onClick={()=>fileRef.current?.click()} style={S.bP}>+ Upload files</button>
                  <input ref={fileRef} type="file" multiple accept=".txt,.md,.pdf,.docx,text/*" style={{display:"none"}} onChange={handleUpload}/>
                </div>
                {(proj.attachments||[]).map((f:any,i:number)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:"#F9FAFB",borderRadius:9,border:"1px solid #F0F0F0",marginBottom:7}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}><span style={{fontSize:20}}>{f.type.includes("pdf")?"📄":"📝"}</span><div><p style={{fontSize:13,fontWeight:700,color:"#111",margin:0}}>{f.name}</p><p style={{fontSize:11,color:"#9CA3AF",margin:0}}>{(f.size/1024).toFixed(1)} KB</p></div></div>
                    <button onClick={()=>updP(proj.id,{attachments:(proj.attachments||[]).filter((_:any,j:number)=>j!==i)})} style={{background:"none",border:"none",cursor:"pointer",color:"#D1D5DB",fontSize:20}}>×</button>
                  </div>
                ))}
                {!(proj.attachments||[]).length&&<p style={{fontSize:13,color:"#9CA3AF",textAlign:"center"}}>No files yet. Upload your case study to get a better AI script.</p>}
              </div>
            )}
            {dtab==="pipeline"&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><p style={{fontWeight:700,fontSize:14,color:"#111",margin:0}}>Production pipeline</p><span style={{fontSize:12,color:"#9CA3AF"}}>{stagePct(proj.stage)}% complete</span></div>
                <Bar pct={stagePct(proj.stage)} h={6}/>
                <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:8}}>
                  {STAGES.map((s,i)=>{
                    const done=i<=curIdx,current=i===curIdx;
                    return(<div key={s.id} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 14px",borderRadius:10,background:current?"#f5f3ff":done?"#F9FAFB":"#fff",border:current?"1px solid #ddd6fe":done?"1px solid #F0F0F0":"1px solid #F3F4F6"}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:current?"#7c3aed":done?"#10b981":"#E5E7EB",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{done&&!current?"✓":i+1}</div>
                      <span style={{fontSize:13,fontWeight:current?700:done?600:400,color:current?"#7c3aed":done?"#111":"#9CA3AF",flex:1}}>{s.label}</span>
                      {current&&<span style={{fontSize:10,background:"#7c3aed",color:"#fff",padding:"2px 8px",borderRadius:20,fontWeight:700}}>CURRENT</span>}
                    </div>);
                  })}
                </div>
                {proj.stage!=="done"&&<div style={{marginTop:14,padding:14,background:"#f5f3ff",borderRadius:10,border:"1px solid #ddd6fe"}}><button onClick={()=>advanceStage(proj.id)} style={S.bP}>✓ Mark {getStage(proj.stage).label} complete →</button></div>}
                <div style={{marginTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={S.L}>Assignee</label><select style={S.I} value={proj.assigneeId||""} onChange={e=>updP(proj.id,{assigneeId:e.target.value||null})}><option value="">—</option>{members.map((m:any)=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                  <div><label style={S.L}>Manager</label><select style={S.I} value={proj.managerId||""} onChange={e=>updP(proj.id,{managerId:e.target.value||null})}><option value="">—</option>{members.map((m:any)=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                  <div><label style={S.L}>Due date</label><input type="date" style={S.I} value={proj.due||""} onChange={e=>updP(proj.id,{due:e.target.value})}/></div>
                  <div><label style={S.L}>Narrator tone</label><input style={S.I} value={proj.narratorStyle||""} onChange={e=>updP(proj.id,{narratorStyle:e.target.value})} placeholder="Professional & concise"/></div>
                </div>
              </div>
            )}
            {dtab==="notes"&&<textarea rows={20} value={proj.notes||""} onChange={e=>updP(proj.id,{notes:e.target.value})} placeholder="Notes, feedback, review comments…" style={{width:"100%",padding:12,borderRadius:9,border:"1px solid #E5E7EB",fontSize:13,lineHeight:1.75,resize:"vertical",background:"#FAFAFA",color:"#111",boxSizing:"border-box",outline:"none"}}/>}
          </div>
        </div>
      </div>
    );
  }

  function TeamModal(){
    const ALL_ROLES=["writer","editor","manager","director"];
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget){setModal(null);if(currentUser==="_setup")setCurrentUser(null);}}}>
        <div style={{background:"#fff",borderRadius:14,padding:28,width:"min(640px,96vw)",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
          <h2 style={{fontWeight:800,fontSize:16,color:"#111",margin:"0 0 18px"}}>Manage team</h2>
          <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
            {members.map((m:any)=>(
              <div key={m.id} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",background:"#F9FAFB",borderRadius:10,border:"1px solid #F0F0F0"}}>
                <Av m={m} size={38}/>
                <div style={{flex:1}}><p style={{fontWeight:700,fontSize:14,color:"#111",margin:"0 0 2px"}}>{m.name}</p><p style={{fontSize:12,color:"#9CA3AF",margin:"0 0 8px"}}>{m.email}</p>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {ALL_ROLES.map(r=>(
                      <label key={r} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12,background:(m.roles||[]).includes(r)?"#f5f3ff":"#F3F4F6",color:(m.roles||[]).includes(r)?"#7c3aed":"#6B7280",padding:"3px 10px",borderRadius:20,border:(m.roles||[]).includes(r)?"1px solid #ddd6fe":"1px solid transparent"}}>
                        <input type="checkbox" style={{accentColor:"#7c3aed",width:12,height:12}} checked={(m.roles||[]).includes(r)} onChange={()=>updateMember(m.id,{roles:(m.roles||[]).includes(r)?(m.roles||[]).filter((rx:string)=>rx!==r):[...(m.roles||[]),r]})}/>
                        {r}
                      </label>
                    ))}
                  </div>
                </div>
                <button onClick={()=>deleteMember(m.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#E5E7EB",fontSize:22}}>×</button>
              </div>
            ))}
            {members.length===0&&<p style={{fontSize:13,color:"#9CA3AF",textAlign:"center",padding:16}}>No team members yet.</p>}
          </div>
          <div style={{borderTop:"1px solid #F3F4F6",paddingTop:18}}>
            <p style={{fontWeight:700,fontSize:13,marginBottom:12}}>Add member</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><label style={S.L}>Name</label><input style={S.I} placeholder="Full name" value={newM.name} onChange={e=>setNewM(m=>({...m,name:e.target.value}))}/></div>
              <div><label style={S.L}>Email</label><input style={S.I} placeholder="email@company.com" value={newM.email} onChange={e=>setNewM(m=>({...m,email:e.target.value}))}/></div>
            </div>
            <label style={S.L}>Roles</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6,marginBottom:14}}>
              {ALL_ROLES.map(r=>(
                <label key={r} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:13,background:newM.roles.includes(r)?"#f5f3ff":"#F9FAFB",color:newM.roles.includes(r)?"#7c3aed":"#374151",padding:"5px 12px",borderRadius:20,border:newM.roles.includes(r)?"1px solid #ddd6fe":"1px solid #E5E7EB"}}>
                  <input type="checkbox" style={{accentColor:"#7c3aed"}} checked={newM.roles.includes(r)} onChange={()=>setNewM(m=>({...m,roles:m.roles.includes(r)?m.roles.filter((x:string)=>x!==r):[...m.roles,r]}))}/>
                  {r}
                </label>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
              <button onClick={()=>{setModal(null);if(currentUser==="_setup")setCurrentUser(null);}} style={S.bG}>Done</button>
              <button disabled={!newM.name||newM.roles.length===0} onClick={async()=>{
                const i=members.length%COLORS.length;
                await addMember({name:newM.name,email:newM.email,roles:newM.roles as any,avatar:newM.name.split(" ").map((w:string)=>w[0]).join("").slice(0,2).toUpperCase(),color:COLORS[i],textColor:CTEXTS[i],streak:0,shoutout:""});
                setNewM({name:"",email:"",roles:["writer"]});
              }} style={{...S.bP,opacity:!newM.name||newM.roles.length===0?0.4:1}}>Add member</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function AddModal(){
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)setModal(null);}}>
        <div style={{background:"#fff",borderRadius:14,padding:28,width:"min(520px,96vw)",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
          <h2 style={{fontWeight:800,fontSize:16,color:"#111",margin:"0 0 6px"}}>New video project</h2>
          <p style={{fontSize:12,color:"#9CA3AF",margin:"0 0 20px"}}>AI script follows: Problem → Solution → Implementation → Benefits</p>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            <div><label style={S.L}>Video title</label><input style={S.I} placeholder="e.g. Retail Cost Reduction 2026" value={newP.title} onChange={e=>setNewP(p=>({...p,title:e.target.value}))}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={S.L}>Assignee</label><select style={S.I} value={newP.assigneeId} onChange={e=>setNewP(p=>({...p,assigneeId:e.target.value}))}><option value="">— select —</option>{members.map((m:any)=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              <div><label style={S.L}>Manager</label><select style={S.I} value={newP.managerId} onChange={e=>setNewP(p=>({...p,managerId:e.target.value}))}><option value="">— select —</option>{members.map((m:any)=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              <div><label style={S.L}>Due date</label><input type="date" style={S.I} value={newP.due} onChange={e=>setNewP(p=>({...p,due:e.target.value}))}/></div>
              <div><label style={S.L}>Narrator tone</label><input style={S.I} placeholder="Professional & concise" value={newP.narratorStyle} onChange={e=>setNewP(p=>({...p,narratorStyle:e.target.value}))}/></div>
            </div>
            <div><label style={S.L}>Extra guidelines (optional)</label><input style={S.I} placeholder="e.g. Highlight ROI, mention specific metrics" value={newP.guidelines} onChange={e=>setNewP(p=>({...p,guidelines:e.target.value}))}/></div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:22}}>
            <button onClick={()=>setModal(null)} style={S.bG}>Cancel</button>
            <button disabled={!newP.title} onClick={async()=>{
              await addProject({title:newP.title,stage:"initiated",assigneeId:newP.assigneeId||null,managerId:newP.managerId||null,due:newP.due,narratorStyle:newP.narratorStyle,guidelines:newP.guidelines,scriptDraft:"",storyboard:[],notes:"",attachments:[],oneDriveItems:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
              setNewP({title:"",assigneeId:"",managerId:"",due:"",narratorStyle:"Professional & concise",guidelines:""});
              setModal(null);
            }} style={{...S.bP,opacity:!newP.title?0.4:1}}>Create project</button>
          </div>
        </div>
      </div>
    );
  }

  const myP=projects.filter((p:any)=>p.assigneeId===currentUser||p.managerId===currentUser);
  const leaderboard=[...members].map((m:any)=>({...m,done:projects.filter((p:any)=>p.assigneeId===m.id&&p.stage==="done").length})).sort((a:any,b:any)=>b.done-a.done);
  const myAssigned=projects.filter((p:any)=>p.assigneeId===currentUser);

  return(
    <div style={{minHeight:"100vh",background:"#F8F9FA",fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif"}}>
      <div style={{background:"#1a1a2e",padding:"0 28px"}}>
        <div style={{maxWidth:1080,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",gap:10,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>🎬</span><h1 style={{fontWeight:800,fontSize:17,color:"#fff",margin:0}}>Video Tracker</h1></div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={()=>setModal("add")} style={{padding:"6px 14px",borderRadius:8,background:"#7c3aed",color:"#fff",border:"none",cursor:"pointer",fontSize:12,fontWeight:700}}>+ New project</button>
              <button onClick={()=>setModal("team")} style={{padding:"6px 14px",borderRadius:8,background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",cursor:"pointer",fontSize:12}}>👥 Team</button>
              <div onClick={()=>setCurrentUser(null)} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",padding:"4px 10px",borderRadius:20,background:"rgba(255,255,255,0.1)"}}>
                <Av m={member} size={24}/><span style={{color:"#e2e8f0",fontSize:12,fontWeight:700}}>{member?.name.split(" ")[0]}</span><span style={{color:"#94a3b8",fontSize:11}}>↩</span>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:0,flexWrap:"wrap"}}>
            {[{id:"dashboard",l:"My Dashboard"},{id:"mine",l:"My Projects"},{id:"all",l:"All Projects"},{id:"board",l:"Board"},{id:"team",l:"Team"}].map(v=>(
              <button key={v.id} onClick={()=>setView(v.id)} style={{padding:"8px 14px",border:"none",borderBottom:view===v.id?"2px solid #a78bfa":"2px solid transparent",cursor:"pointer",fontSize:12,fontWeight:view===v.id?700:400,color:view===v.id?"#a78bfa":"#94a3b8",background:"transparent",whiteSpace:"nowrap"}}>{v.l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1080,margin:"0 auto",padding:view==="dashboard"?0:"24px 28px"}}>
        {view==="dashboard"&&member&&(
          <div style={{paddingBottom:32}}>
            <div style={{background:"linear-gradient(135deg,#1a1a2e,#16213e)",padding:"24px 28px 20px",marginBottom:24,borderRadius:"0 0 20px 20px"}}>
              <div style={{maxWidth:1080,margin:"0 auto",display:"flex",alignItems:"center",gap:14}}>
                <Av m={member} size={52}/>
                <div>
                  <p style={{color:"#94a3b8",fontSize:13,margin:"0 0 3px"}}>{new Date().getHours()<12?"Good morning":new Date().getHours()<17?"Good afternoon":"Good evening"}</p>
                  <h2 style={{color:"#fff",fontSize:22,fontWeight:800,margin:"0 0 6px"}}>{member.name} 👋</h2>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{(member.roles||[]).map((r:string)=><span key={r} style={{fontSize:11,background:"rgba(255,255,255,0.12)",color:"#e2e8f0",padding:"2px 8px",borderRadius:20,textTransform:"capitalize"}}>{r}</span>)}</div>
                </div>
              </div>
              {member.shoutout&&<div style={{maxWidth:1080,margin:"14px auto 0",padding:"10px 14px",background:"rgba(167,139,250,0.15)",borderRadius:10,border:"1px solid rgba(167,139,250,0.3)",display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:18}}>💬</span><div><p style={{color:"#c4b5fd",fontSize:11,margin:"0 0 1px",fontWeight:700}}>MANAGER SHOUTOUT</p><p style={{color:"#e2e8f0",fontSize:13,margin:0}}>"{member.shoutout}"</p></div></div>}
            </div>
            <div style={{maxWidth:1080,margin:"0 auto",padding:"0 24px"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
                {[{l:"Completed",v:myAssigned.filter((p:any)=>p.stage==="done").length,c:"#10b981",bg:"#ecfdf5",i:"✓"},{l:"In progress",v:myAssigned.filter((p:any)=>p.stage!=="done"&&p.stage!=="initiated").length,c:"#7c3aed",bg:"#f5f3ff",i:"→"},{l:"Waiting",v:myAssigned.filter((p:any)=>p.stage==="initiated").length,c:"#f59e0b",bg:"#fffbeb",i:"○"},{l:"Overdue",v:myAssigned.filter((p:any)=>isOverdue(p)).length,c:"#ef4444",bg:"#fef2f2",i:"!"}].map(s=>(
                  <div key={s.l} style={{background:s.bg,borderRadius:12,padding:"14px 16px",border:`1px solid ${s.c}22`}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <div><p style={{fontSize:11,color:s.c,fontWeight:700,margin:"0 0 4px",textTransform:"uppercase"}}>{s.l}</p><p style={{fontSize:26,fontWeight:800,color:s.c,margin:0,lineHeight:1}}>{s.v}</p></div>
                      <div style={{width:30,height:30,borderRadius:"50%",background:s.c,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700}}>{s.i}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
                <div style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #E5E7EB"}}>
                  <p style={{fontWeight:700,fontSize:14,color:"#111",margin:"0 0 12px"}}>My active projects</p>
                  {myAssigned.filter((p:any)=>p.stage!=="done").length===0&&<p style={{fontSize:13,color:"#9CA3AF"}}>All caught up! 🎉</p>}
                  {myAssigned.filter((p:any)=>p.stage!=="done").map((p:any)=>{const over=isOverdue(p);return(
                    <div key={p.id} onClick={()=>{setSel(p.id);setDtab("script");}} style={{marginBottom:10,paddingBottom:10,borderBottom:"1px solid #F3F4F6",cursor:"pointer"}}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:5}}><p style={{fontSize:13,fontWeight:700,color:over?"#ef4444":"#111",margin:0}}>{p.title}</p><SPill sid={p.stage}/></div>
                      <Bar pct={stagePct(p.stage)} color={over?"#ef4444":"#7c3aed"}/>
                      {p.due&&<p style={{fontSize:11,color:over?"#ef4444":"#9CA3AF",margin:"3px 0 0"}}>Due {p.due}</p>}
                    </div>
                  );})}
                </div>
                <div style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #E5E7EB"}}>
                  <p style={{fontWeight:700,fontSize:14,color:"#111",margin:"0 0 12px"}}>Team leaderboard</p>
                  {leaderboard.map((m:any,i:number)=>(
                    <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:i<leaderboard.length-1?"1px solid #F3F4F6":"none"}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:i===0?"#FAC775":i===1?"#D3D1C7":"#F3F4F6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{i===0?"★":i+1}</div>
                      <Av m={m} size={28}/>
                      <div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:700,color:m.id===currentUser?"#7c3aed":"#111"}}>{m.name.split(" ")[0]}{m.id===currentUser?" (you)":""}</span><span style={{fontSize:11,color:"#9CA3AF"}}>{m.done} done</span></div><Bar pct={Math.min(100,m.done*25)} color={i===0?"#f59e0b":"#7c3aed"} h={3}/></div>
                    </div>
                  ))}
                  {members.length===0&&<p style={{fontSize:13,color:"#9CA3AF"}}>Add team members to see leaderboard</p>}
                </div>
              </div>
              {isManager&&(
                <div style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #E5E7EB"}}>
                  <p style={{fontWeight:700,fontSize:14,color:"#111",margin:"0 0 14px"}}>Send appreciation 💬</p>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                    <div><label style={S.L}>Team member</label><select value={shoutoutTarget} onChange={e=>setShoutoutTarget(e.target.value)} style={S.I}><option value="">— select —</option>{members.filter((m:any)=>m.id!==currentUser).map((m:any)=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                    <div><label style={S.L}>Message</label><input value={shoutoutText} onChange={e=>setShoutoutText(e.target.value)} placeholder="Great work on..." style={S.I}/></div>
                  </div>
                  <button disabled={!shoutoutTarget||!shoutoutText} onClick={()=>{updateMember(shoutoutTarget,{shoutout:shoutoutText});setShoutoutText("");setShoutoutTarget("");}} style={{...S.bP,opacity:!shoutoutTarget||!shoutoutText?0.4:1}}>Send shoutout</button>
                  {members.filter((m:any)=>m.shoutout).map((m:any)=>(
                    <div key={m.id} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 12px",background:"#f5f3ff",borderRadius:8,marginTop:8}}>
                      <Av m={m} size={28}/>
                      <div style={{flex:1}}><p style={{fontSize:12,fontWeight:700,color:"#374151",margin:0}}>{m.name}</p><p style={{fontSize:12,color:"#6d28d9",margin:0}}>"{m.shoutout}"</p></div>
                      <button onClick={()=>updateMember(m.id,{shoutout:""})} style={{background:"none",border:"none",cursor:"pointer",color:"#D1D5DB",fontSize:18}}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {(view==="mine"||view==="all")&&(
          <div>
            {(view==="mine"?myP:projects).length===0&&<div style={{textAlign:"center",padding:64,color:"#9CA3AF"}}><div style={{fontSize:40,marginBottom:12}}>🎬</div><p style={{fontWeight:700,fontSize:16,color:"#374151",margin:"0 0 8px"}}>No projects yet</p><button onClick={()=>setModal("add")} style={S.bP}>+ Create first project</button></div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
              {(view==="mine"?myP:projects).map((p:any)=><Card key={p.id} p={p}/>)}
            </div>
          </div>
        )}
        {view==="board"&&(
          <div style={{overflowX:"auto"}}>
            <div style={{display:"flex",gap:10,minWidth:STAGES.length*165+"px"}}>
              {STAGES.map(s=>{const cols=projects.filter((p:any)=>p.stage===s.id);return(
                <div key={s.id} style={{flex:"0 0 155px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:10}}><span style={{fontSize:11,fontWeight:700,color:s.tc,background:s.color,padding:"2px 9px",borderRadius:20}}>{s.label}</span><span style={{fontSize:11,color:"#9CA3AF"}}>{cols.length}</span></div>
                  {cols.map((p:any)=>{const a=mb(p.assigneeId);return(
                    <div key={p.id} onClick={()=>{setSel(p.id);setDtab("script");}} style={{background:"#fff",border:`1px solid ${isOverdue(p)?"#fca5a5":"#E5E7EB"}`,borderRadius:10,padding:"10px 12px",cursor:"pointer",marginBottom:8}}>
                      <p style={{fontSize:12,fontWeight:700,color:"#111",margin:"0 0 6px"}}>{p.title}</p>
                      <div style={{display:"flex",justifyContent:"space-between"}}>{a?<Av m={a} size={18}/>:<div/>}{p.due&&<span style={{fontSize:10,color:isOverdue(p)?"#ef4444":"#9CA3AF"}}>{p.due.slice(5)}</span>}</div>
                    </div>
                  );})}
                </div>
              );})}
            </div>
          </div>
        )}
        {view==="team"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:14}}>
            {members.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:48}}><button onClick={()=>setModal("team")} style={S.bP}>+ Add team members</button></div>}
            {members.map((m:any)=>{const mine=projects.filter((p:any)=>p.assigneeId===m.id||p.managerId===m.id);const done=mine.filter((p:any)=>p.stage==="done").length;return(
              <div key={m.id} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,padding:16}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><Av m={m} size={42}/><div style={{flex:1}}><p style={{fontWeight:700,fontSize:14,color:"#111",margin:0}}>{m.name}</p><p style={{fontSize:11,color:"#9CA3AF",margin:"2px 0"}}>{(m.roles||[]).join(" & ")}</p></div><div style={{textAlign:"right"}}><div style={{fontSize:22,fontWeight:800,color:"#7c3aed",lineHeight:1}}>{done}</div><div style={{fontSize:10,color:"#9CA3AF"}}>done</div></div></div>
                {m.shoutout&&<div style={{background:"#f5f3ff",borderRadius:8,padding:"6px 10px",marginBottom:8,fontSize:12,color:"#6d28d9"}}>💬 "{m.shoutout}"</div>}
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {mine.filter((p:any)=>p.stage!=="done").slice(0,3).map((p:any)=>(
                    <div key={p.id} onClick={()=>{setSel(p.id);setDtab("script");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid #F3F4F6",cursor:"pointer"}}>
                      <span style={{fontSize:12,color:"#374151",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</span><SPill sid={p.stage}/>
                    </div>
                  ))}
                  {mine.length===0&&<p style={{fontSize:12,color:"#D1D5DB"}}>No videos assigned</p>}
                </div>
              </div>
            );})}
          </div>
        )}
      </div>

      {sel&&<Detail/>}
      {modal==="add"&&<AddModal/>}
      {modal==="team"&&<TeamModal/>}
    </div>
  );
}

export default function DashboardPage(){
  return<FirestoreProvider><Inner/></FirestoreProvider>;
}
