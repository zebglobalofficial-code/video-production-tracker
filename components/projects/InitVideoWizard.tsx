"use client";
import{useState,useRef}from"react";
import{Modal,StagePill,iS,bP,bG,bS}from"@/components/ui/index";
import{useFirestore}from"@/components/providers/FirestoreProvider";
import{updateProject}from"@/lib/firestore/projects";
import{getGraphToken,openOneDrivePicker}from"@/lib/onedrive";
import type{Attachment,OneDriveItem}from"@/lib/firestore/types";
const STEPS=["Select project","Upload files","OneDrive","Review & start"];
export function InitVideoWizard({onClose,onDone}:{onClose:()=>void;onDone:(id:string)=>void}){
  const{projects}=useFirestore();
  const[step,setStep]=useState(0);
  const[pid,setPid]=useState("");
  const[files,setFiles]=useState<Attachment[]>([]);
  const[odItems,setOdItems]=useState<OneDriveItem[]>([]);
  const[gen,setGen]=useState(false);
  const ref=useRef<HTMLInputElement>(null);
  const proj=projects.find(p=>p.id===pid);
  const loadFiles=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const loaded=await Promise.all(Array.from(e.target.files??[]).map(f=>new Promise<Attachment>(res=>{const r=new FileReader();r.onload=()=>res({name:f.name,size:f.size,type:f.type,content:r.result as string});if(f.type==="application/pdf")r.readAsDataURL(f);else r.readAsText(f);})));
    setFiles(p=>[...p,...loaded]);
  };
  const pick=async()=>{try{const t=await getGraphToken();const p=await openOneDrivePicker(t);setOdItems(prev=>{const ex=new Set(prev.map(i=>i.id));return[...prev,...p.filter(x=>!ex.has(x.id))];});}catch(e){console.error(e);}};
  const start=async()=>{
    if(!pid||!proj)return;setGen(true);
    let odT:string[]=[];
    if(odItems.length>0){try{const t=await getGraphToken();const r=await fetch("/api/onedrive-read",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({accessToken:t,items:odItems})});odT=(await r.json()).texts??[];}catch{}}
    await updateProject(pid,{attachments:files,oneDriveItems:odItems,stage:"Script Writing"});
    const at=files.filter(f=>!f.type.includes("pdf")).map(f=>`[${f.name}]
${f.content}`);
    const r=await fetch("/api/generate-script",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:proj.title,narratorStyle:proj.narratorStyle,attachmentTexts:at,oneDriveTexts:odT})});
    await updateProject(pid,{scriptDraft:(await r.json()).script});
    setGen(false);onDone(pid);
  };
  return(
    <Modal onClose={onClose} wide>
      <h2 style={{fontWeight:700,fontSize:16,color:"#111",margin:"0 0 20px"}}>Initiate video creation</h2>
      <div style={{display:"flex",alignItems:"center",marginBottom:28}}>
        {STEPS.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",flex:i<STEPS.length-1?1:"none"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,background:step>=i?"#4F46E5":"#F3F4F6",color:step>=i?"#fff":"#9CA3AF"}}>{i+1}</div>
            <span style={{fontSize:10,whiteSpace:"nowrap",fontWeight:step===i?700:400,color:step===i?"#111":"#9CA3AF"}}>{s}</span>
          </div>
          {i<STEPS.length-1&&<div style={{flex:1,height:2,margin:"0 6px",marginBottom:16,background:step>i?"#4F46E5":"#E5E7EB"}}/>}
        </div>))}
      </div>
      {step===0&&<div><label style={{fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase" as const}}>Select project</label><select style={iS} value={pid} onChange={e=>setPid(e.target.value)}><option value="">choose</option>{projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select>{proj&&<div style={{marginTop:12,padding:"10px 14px",background:"#F9FAFB",borderRadius:9,border:"1px solid #F0F0F0",display:"flex",gap:10,alignItems:"center"}}><StagePill stage={proj.stage}/><span style={{fontSize:13,color:"#374151"}}>{proj.narratorStyle||"No tone set"}</span></div>}<div style={{display:"flex",justifyContent:"flex-end",marginTop:20}}><button disabled={!pid} onClick={()=>setStep(1)} style={{...bP,opacity:!pid?0.4:1}}>Next</button></div></div>}
      {step===1&&<div><p style={{fontSize:13,color:"#374151",marginBottom:14}}>Upload case study docs. All files feed the AI script.</p><div style={{border:"2px dashed #E5E7EB",borderRadius:12,padding:20,textAlign:"center",marginBottom:12}}><button onClick={()=>ref.current?.click()} style={bP}>Choose files</button><input ref={ref} type="file" multiple accept=".txt,.md,.pdf,.docx,text/*" style={{display:"none"}} onChange={loadFiles}/></div>{files.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:"#F9FAFB",borderRadius:9,marginBottom:7}}><span style={{fontSize:13}}>{f.name}</span><button onClick={()=>setFiles(a=>a.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",fontSize:20}}>x</button></div>)}<div style={{display:"flex",justifyContent:"space-between",marginTop:18}}><button onClick={()=>setStep(0)} style={bG}>Back</button><button onClick={()=>setStep(2)} style={bP}>Next</button></div></div>}
      {step===2&&<div><p style={{fontSize:13,color:"#374151",marginBottom:14}}>Pick files from OneDrive or SharePoint.</p><button onClick={pick} style={{width:"100%",padding:16,border:"2px dashed #BFDBFE",borderRadius:12,background:"#EFF6FF",color:"#1D4ED8",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:12}}>Browse OneDrive</button>{odItems.map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:"#EFF6FF",borderRadius:9,marginBottom:7}}><span style={{fontSize:13,color:"#1D4ED8"}}>{item.name}</span><button onClick={()=>setOdItems(a=>a.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",fontSize:20}}>x</button></div>)}<div style={{display:"flex",justifyContent:"space-between",marginTop:18}}><button onClick={()=>setStep(1)} style={bG}>Back</button><button onClick={()=>setStep(3)} style={bP}>Next</button></div></div>}
      {step===3&&proj&&<div><div style={{background:"#F9FAFB",borderRadius:12,padding:16,border:"1px solid #F0F0F0",marginBottom:16}}><p style={{fontWeight:700,fontSize:14,color:"#111",margin:"0 0 8px"}}>{proj.title}</p><div style={{display:"flex",gap:14,fontSize:13,color:"#6B7280"}}><span>Files: {files.length}</span><span>OneDrive: {odItems.length}</span></div></div><p style={{fontSize:13,color:"#374151",marginBottom:20}}>Clicking Start will generate an AI script from your documents.</p><div style={{display:"flex",justifyContent:"space-between"}}><button onClick={()=>setStep(2)} style={bG}>Back</button><button onClick={start} disabled={gen} style={{...bS,opacity:gen?0.55:1}}>{gen?"Generating...":"Start video process"}</button></div></div>}
    </Modal>
  );
}