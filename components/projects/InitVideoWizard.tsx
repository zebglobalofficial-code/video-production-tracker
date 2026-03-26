"use client";
import{useState,useRef}from"react";
import{Modal,StagePill,iS,bP,bG,bS}from"@/components/ui/index";
import{useFirestore}from"@/components/providers/FirestoreProvider";
import{updateProject}from"@/lib/firestore/projects";
import type{Attachment}from"@/lib/firestore/types";

const STEPS=["Select project","Upload files","Review & start"];

export function InitVideoWizard({onClose,onDone}:{onClose:()=>void;onDone:(id:string)=>void}){
  const{projects}=useFirestore();
  const[step,setStep]=useState(0);
  const[pid,setPid]=useState("");
  const[files,setFiles]=useState<Attachment[]>([]);
  const[gen,setGen]=useState(false);
  const ref=useRef<HTMLInputElement>(null);
  const proj=projects.find(p=>p.id===pid);

  const loadFiles=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const loaded=await Promise.all(Array.from(e.target.files??[]).map(f=>new Promise<Attachment>(res=>{
      const r=new FileReader();
      r.onload=()=>res({name:f.name,size:f.size,type:f.type,content:r.result as string});
      if(f.type==="application/pdf")r.readAsDataURL(f);else r.readAsText(f);
    })));
    setFiles(p=>[...p,...loaded]);
  };

  const start=async()=>{
    if(!pid||!proj)return;
    setGen(true);
    await updateProject(pid,{attachments:files,stage:"Script Writing"});
    const at=files.filter(f=>!f.type.includes("pdf")).map(f=>`[${f.name}]
${f.content}`);
    const r=await fetch("/api/generate-script",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({title:proj.title,narratorStyle:proj.narratorStyle,attachmentTexts:at,oneDriveTexts:[]})
    });
    await updateProject(pid,{scriptDraft:(await r.json()).script});
    setGen(false);
    onDone(pid);
  };

  return(
    <Modal onClose={onClose} wide>
      <h2 style={{fontWeight:700,fontSize:16,color:"#111",margin:"0 0 20px"}}>Initiate video creation</h2>

      <div style={{display:"flex",alignItems:"center",marginBottom:28}}>
        {STEPS.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",flex:i<STEPS.length-1?1:"none"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,background:step>=i?"#7c3aed":"#F3F4F6",color:step>=i?"#fff":"#9CA3AF"}}>{i+1}</div>
              <span style={{fontSize:10,whiteSpace:"nowrap",fontWeight:step===i?700:400,color:step===i?"#111":"#9CA3AF"}}>{s}</span>
            </div>
            {i<STEPS.length-1&&<div style={{flex:1,height:2,margin:"0 6px",marginBottom:16,background:step>i?"#7c3aed":"#E5E7EB"}}/>}
          </div>
        ))}
      </div>

      {step===0&&(
        <div>
          <label style={{fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>Select project</label>
          <select style={iS} value={pid} onChange={e=>setPid(e.target.value)}>
            <option value="">— choose a project —</option>
            {projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          {proj&&(
            <div style={{marginTop:12,padding:"10px 14px",background:"#F9FAFB",borderRadius:9,border:"1px solid #F0F0F0",display:"flex",gap:10,alignItems:"center"}}>
              <StagePill stage={proj.stage}/>
              <span style={{fontSize:13,color:"#374151"}}>{proj.narratorStyle||"No tone set"}</span>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:20}}>
            <button disabled={!pid} onClick={()=>setStep(1)} style={{...bP,opacity:!pid?0.4:1}}>Next →</button>
          </div>
        </div>
      )}

      {step===1&&(
        <div>
          <p style={{fontSize:13,color:"#374151",marginBottom:14}}>Upload your case study, brief, or any source document. Multiple files welcome — all will be used to generate the script.</p>
          <div style={{border:"2px dashed #E5E7EB",borderRadius:12,padding:24,textAlign:"center",marginBottom:12,background:"#FAFAFA"}}>
            <div style={{fontSize:32,marginBottom:8}}>📂</div>
            <p style={{fontSize:13,color:"#6B7280",marginBottom:4}}>Drag and drop or click to upload</p>
            <p style={{fontSize:11,color:"#9CA3AF",marginBottom:14}}>Supports .txt · .md · .pdf · .docx</p>
            <button onClick={()=>ref.current?.click()} style={bP}>+ Choose files</button>
            <input ref={ref} type="file" multiple accept=".txt,.md,.pdf,.docx,text/*" style={{display:"none"}} onChange={loadFiles}/>
          </div>
          {files.map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:"#F9FAFB",borderRadius:9,border:"1px solid #F0F0F0",marginBottom:7}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>{f.type.includes("pdf")?"📄":"📝"}</span>
                <div>
                  <p style={{fontSize:13,fontWeight:600,color:"#111",margin:0}}>{f.name}</p>
                  <p style={{fontSize:11,color:"#9CA3AF",margin:0}}>{(f.size/1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={()=>setFiles(a=>a.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:"#D1D5DB",fontSize:20}}>×</button>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:18}}>
            <button onClick={()=>setStep(0)} style={bG}>← Back</button>
            <button onClick={()=>setStep(2)} style={bP}>Next →</button>
          </div>
        </div>
      )}

      {step===2&&proj&&(
        <div>
          <div style={{background:"#F9FAFB",borderRadius:12,padding:16,border:"1px solid #F0F0F0",marginBottom:16}}>
            <p style={{fontWeight:700,fontSize:14,color:"#111",margin:"0 0 8px"}}>{proj.title}</p>
            <div style={{display:"flex",gap:14,fontSize:13,color:"#6B7280"}}>
              <span>📎 {files.length} file(s) uploaded</span>
              {proj.narratorStyle&&<span>🎙 {proj.narratorStyle}</span>}
            </div>
            {files.length===0&&<p style={{fontSize:12,color:"#D97706",marginTop:8}}>💡 No files uploaded — AI will write a placeholder script. You can upload files later in the Files tab.</p>}
          </div>
          <p style={{fontSize:13,color:"#374151",marginBottom:20,lineHeight:1.6}}>
            Clicking <strong>Start</strong> will attach your files, move the project to <em>Script Writing</em>, and generate a complete 2-minute AI script from your documents.
          </p>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <button onClick={()=>setStep(1)} style={bG}>← Back</button>
            <button onClick={start} disabled={gen} style={{...bS,opacity:gen?0.55:1,display:"flex",alignItems:"center",gap:6}}>
              {gen?"Generating script…":"✦ Start video process"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
