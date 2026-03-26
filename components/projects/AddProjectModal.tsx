"use client";
import{useState}from"react";
import{Modal,iS,lS,bP,bG}from"@/components/ui/index";
import{useFirestore}from"@/components/providers/FirestoreProvider";
import{addProject}from"@/lib/firestore/projects";
export function AddProjectModal({onClose}:{onClose:()=>void}){
  const{members}=useFirestore();
  const ws=members.filter(m=>(m.roles??[]).includes("writer")||(m.roles??[]).includes("editor"));
  const ms=members.filter(m=>(m.roles??[]).includes("manager")||(m.roles??[]).includes("director"));
  const[f,setF]=useState({title:"",assigneeId:"",managerId:"",due:"",narratorStyle:""});
  const[saving,setSaving]=useState(false);
  const save=async()=>{if(!f.title)return;setSaving(true);await addProject({title:f.title,stage:"Initiated",assigneeId:f.assigneeId||null,managerId:f.managerId||null,due:f.due,narratorStyle:f.narratorStyle,scriptDraft:"",scriptSections:{},storyboardSections:{},notes:"",attachments:[],oneDriveItems:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});setSaving(false);onClose();};
  return(
    <Modal onClose={onClose}>
      <h2 style={{fontWeight:700,fontSize:16,color:"#111",margin:"0 0 20px"}}>New video project</h2>
      <div style={{display:"flex",flexDirection:"column",gap:13}}>
        <div><label style={lS}>Title</label><input style={iS} placeholder="e.g. Healthcare Migration" value={f.title} onChange={e=>setF(x=>({...x,title:e.target.value}))}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={lS}>Assignee</label><select style={iS} value={f.assigneeId} onChange={e=>setF(x=>({...x,assigneeId:e.target.value}))}><option value="">select</option>{ws.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
          <div><label style={lS}>Manager</label><select style={iS} value={f.managerId} onChange={e=>setF(x=>({...x,managerId:e.target.value}))}><option value="">select</option>{ms.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
          <div><label style={lS}>Due date</label><input type="date" style={iS} value={f.due} onChange={e=>setF(x=>({...x,due:e.target.value}))}/></div>
          <div><label style={lS}>Narrator tone</label><input style={iS} placeholder="Professional" value={f.narratorStyle} onChange={e=>setF(x=>({...x,narratorStyle:e.target.value}))}/></div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:22}}>
        <button onClick={onClose} style={bG}>Cancel</button>
        <button onClick={save} disabled={!f.title||saving} style={{...bP,opacity:!f.title||saving?0.4:1}}>{saving?"Creating...":"Create project"}</button>
      </div>
    </Modal>
  );
}