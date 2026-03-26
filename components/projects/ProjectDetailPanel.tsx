"use client";
import{useState,useRef}from"react";
import{useFirestore}from"@/components/providers/FirestoreProvider";
import{updateProject}from"@/lib/firestore/projects";
import{Avatar,StagePill,ProgressBar,iS,lS,bP,bG}from"@/components/ui/index";
import{getGraphToken,openOneDrivePicker}from"@/lib/onedrive";
import{STAGES,SCRIPT_SECTIONS,STORYBOARD_SECTIONS,sectionPct}from"@/lib/constants";
import type{Stage,Attachment,OneDriveItem}from"@/lib/firestore/types";
type Tab="overview"|"files"|"script"|"storyboard"|"notes";
const TABS:Tab[]=["overview","files","script","storyboard","notes"];
export function ProjectDetailPanel({projectId,onClose}:{projectId:string;onClose:()=>void}){
  const{projects,members}=useFirestore();
  const proj=projects.find(p=>p.id===projectId);
  const[tab,setTab]=useState<Tab>("overview");
  const[ai,setAi]=useState(false);
  const ref=useRef<HTMLInputElement>(null);
  if(!proj)return null;
  const a=members.find(m=>m.id===proj.assigneeId),mg=members.find(m=>m.id===proj.managerId);
  const ws=members.filter(m=>(m.roles??[]).includes("writer")||(m.roles??[]).includes("editor"));
  const ms=members.filter(m=>(m.roles??[]).includes("manager")||(m.roles??[]).includes("director"));
  const upd=(patch:Parameters<typeof updateProject>[1])=>updateProject(projectId,patch);
  const loadFiles=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const loaded:Attachment[]=await Promise.all(Array.from(e.target.files??[]).map(f=>new Promise<Attachment>(res=>{const r=new FileReader();r.onload=()=>res({name:f.name,size:f.size,type:f.type,content:r.result as string});if(f.type==="application/pdf")r.readAsDataURL(f);else r.readAsText(f);})));
    await upd({attachments:[...(proj.attachments??[]),...loaded]});
  };
  const pick=async()=>{try{const t=await getGraphToken();const p=await openOneDrivePicker(t);const ex=new Set((proj.oneDriveItems??[]).map(i=>i.id));await upd({oneDriveItems:[...(proj.oneDriveItems??[]),...p.filter(x=>!ex.has(x.id))]});}catch(e){console.error(e);}};
  const gen=async()=>{
    setAi(true);
    try{
      let odT:string[]=[];
      if((proj.oneDriveItems??[]).length>0){const t=await getGraphToken();const r=await fetch("/api/onedrive-read",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({accessToken:t,items:proj.oneDriveItems})});odT=(await r.json()).texts??[];}
      const at=(proj.attachments??[]).filter(a=>!a.type.includes("pdf")).map(a=>`[${a.name}]
${a.content}`);
      const r=await fetch("/api/generate-script",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:proj.title,narratorStyle:proj.narratorStyle,attachmentTexts:at,oneDriveTexts:odT})});
      await upd({scriptDraft:(await r.json()).script});
    }finally{setAi(false);}
  };
  const chk=(sec:Record<string,boolean>,list:string[],cb:(v:Record<string,boolean>)=>void)=>(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px 20px",marginTop:10}}>
      {list.map(s=><label key={s} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:13,color:"#374151"}}><input type="checkbox" style={{accentColor:"#4F46E5",width:14,height:14}} checked={!!sec[s]} onChange={e=>cb({...sec,[s]:e.target.checked})}/>{s}</label>)}
    </div>
  );
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:50,display:"flex",justifyContent:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{width:"min(660px,100%)",height:"100%",background:"#fff",overflowY:"auto",borderLeft:"1px solid #E5E7EB",boxShadow:"-8px 0 32px rgba(0,0,0,0.10)",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"24px 28px 0",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div><h2 style={{fontWeight:700,fontSize:18,color:"#111",margin:0}}>{proj.title}</h2><div style={{marginTop:6}}><StagePill stage={proj.stage}/></div></div>
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#9CA3AF"}}>x</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:14,padding:"10px 14px",background:"#F9FAFB",borderRadius:10,border:"1px solid #F0F0F0",flexWrap:"wrap"}}>
            <span style={{fontSize:11,color:"#9CA3AF",fontWeight:600}}>ASSIGNEE</span>
            {a?<div style={{display:"flex",alignItems:"center",gap:6}}><Avatar member={a} size={22}/><span style={{fontSize:13,fontWeight:600}}>{a.name}</span></div>:<span style={{fontSize:12,color:"#D1D5DB"}}>-</span>}
            <span style={{fontSize:14,color:"#D1D5DB"}}>to</span>
            <span style={{fontSize:11,color:"#9CA3AF",fontWeight:600}}>MANAGER</span>
            {mg?<div style={{display:"flex",alignItems:"center",gap:6}}><Avatar member={mg} size={22}/><span style={{fontSize:13,fontWeight:600}}>{mg.name}</span></div>:<span style={{fontSize:12,color:"#D1D5DB"}}>-</span>}
          </div>
          <div style={{display:"flex",marginTop:16,borderBottom:"2px solid #F3F4F6"}}>
            {TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={{background:"none",border:"none",borderBottom:tab===t?"2px solid #111":"2px solid transparent",cursor:"pointer",padding:"8px 14px",marginBottom:-2,fontSize:13,fontWeight:tab===t?700:400,color:tab===t?"#111":"#6B7280",textTransform:"capitalize"}}>{t}</button>)}
          </div>
        </div>
        <div style={{padding:"20px 28px",flex:1}}>
          {tab==="overview"&&<div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><label style={lS}>Stage</label><select style={iS} value={proj.stage} onChange={e=>upd({stage:e.target.value as Stage})}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label style={lS}>Due date</label><input type="date" style={iS} value={proj.due} onChange={e=>upd({due:e.target.value})}/></div>
              <div><label style={lS}>Assignee</label><select style={iS} value={proj.assigneeId??""} onChange={e=>upd({assigneeId:e.target.value||null})}><option value="">select</option>{ws.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              <div><label style={lS}>Manager</label><select style={iS} value={proj.managerId??""} onChange={e=>upd({managerId:e.target.value||null})}><option value="">select</option>{ms.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              <div style={{gridColumn:"1/-1"}}><label style={lS}>Narrator tone</label><input style={iS} placeholder="Professional & concise" value={proj.narratorStyle} onChange={e=>upd({narratorStyle:e.target.value})}/></div>
            </div>
            <div style={{marginTop:20}}><p style={{fontWeight:600,fontSize:13,color:"#374151",marginBottom:10}}>Pipeline</p>
              {STAGES.map((s,i)=><div key={s} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}><div style={{width:16,height:16,borderRadius:"50%",flexShrink:0,background:STAGES.indexOf(proj.stage)>=i?"#10b981":"#E5E7EB"}}/><span style={{fontSize:13,color:STAGES.indexOf(proj.stage)>=i?"#111":"#9CA3AF"}}>{s}</span>{proj.stage===s&&<span style={{fontSize:11,background:"#EEF2FF",color:"#4F46E5",padding:"1px 7px",borderRadius:20,fontWeight:600}}>current</span>}</div>)}
            </div>
          </div>}
          {tab==="files"&&<div>
            <div style={{border:"2px dashed #E5E7EB",borderRadius:12,padding:20,textAlign:"center",marginBottom:14}}><p style={{fontSize:12,color:"#9CA3AF",marginBottom:12}}>.txt .md .pdf .docx</p><button onClick={()=>ref.current?.click()} style={bP}>Upload files</button><input ref={ref} type="file" multiple accept=".txt,.md,.pdf,.docx,text/*" style={{display:"none"}} onChange={loadFiles}/></div>
            {(proj.attachments??[]).map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:"#F9FAFB",borderRadius:9,marginBottom:7}}><span style={{fontSize:13}}>{f.name} ({(f.size/1024).toFixed(1)}KB)</span><button onClick={()=>upd({attachments:proj.attachments.filter((_,j)=>j!==i)})} style={{background:"none",border:"none",cursor:"pointer",fontSize:20}}>x</button></div>)}
            <p style={{fontWeight:600,fontSize:14,color:"#111",marginTop:20,marginBottom:10}}>OneDrive</p>
            <button onClick={pick} style={{width:"100%",padding:14,border:"2px dashed #BFDBFE",borderRadius:12,background:"#EFF6FF",color:"#1D4ED8",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10}}>Browse OneDrive</button>
            {(proj.oneDriveItems??[]).map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:"#EFF6FF",borderRadius:9,marginBottom:7}}><span style={{fontSize:13,color:"#1D4ED8"}}>{item.isFolder?"Folder:":"File:"} {item.name}</span><button onClick={()=>upd({oneDriveItems:proj.oneDriveItems.filter((_,j)=>j!==i)})} style={{background:"none",border:"none",cursor:"pointer",fontSize:20}}>x</button></div>)}
          </div>}
          {tab==="script"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><p style={{fontWeight:600,fontSize:14,color:"#111",margin:0}}>Script - {sectionPct(proj.scriptSections,SCRIPT_SECTIONS)}%</p></div>
            <div style={{marginTop:6,marginBottom:14}}><ProgressBar pct={sectionPct(proj.scriptSections,SCRIPT_SECTIONS)}/></div>
            {chk(proj.scriptSections,SCRIPT_SECTIONS,v=>upd({scriptSections:v}))}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:20,marginBottom:8}}>
              <p style={{fontWeight:600,fontSize:14,color:"#111",margin:0}}>Script draft</p>
              <button onClick={gen} disabled={ai} style={{...bP,opacity:ai?0.55:1}}>{ai?"Generating...":"Generate with AI"}</button>
            </div>
            <textarea rows={16} value={proj.scriptDraft} onChange={e=>upd({scriptDraft:e.target.value})} placeholder="Click Generate with AI or write here..." style={{width:"100%",padding:12,borderRadius:9,border:"1px solid #E5E7EB",fontSize:13,lineHeight:1.75,resize:"vertical",background:"#F9FAFB",color:"#111",boxSizing:"border-box",fontFamily:"monospace",outline:"none"}}/>
          </div>}
          {tab==="storyboard"&&<div>
            <div style={{marginBottom:14}}><ProgressBar pct={sectionPct(proj.storyboardSections,STORYBOARD_SECTIONS)}/></div>
            {chk(proj.storyboardSections,STORYBOARD_SECTIONS,v=>upd({storyboardSections:v}))}
          </div>}
          {tab==="notes"&&<textarea rows={20} value={proj.notes} onChange={e=>upd({notes:e.target.value})} placeholder="Notes, feedback, blockers..." style={{width:"100%",padding:12,borderRadius:9,border:"1px solid #E5E7EB",fontSize:13,lineHeight:1.75,resize:"vertical",background:"#F9FAFB",color:"#111",boxSizing:"border-box",outline:"none"}}/>}
        </div>
      </div>
    </div>
  );
}