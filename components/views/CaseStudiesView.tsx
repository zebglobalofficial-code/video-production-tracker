"use client";
import{useFirestore}from"@/components/providers/FirestoreProvider";
import{StagePill,Avatar}from"@/components/ui/index";
export function CaseStudiesView({onSelect,filterMember}:{onSelect:(id:string)=>void;filterMember:string}){
  const{projects,members}=useFirestore();
  const list=filterMember==="All"?projects:projects.filter(p=>p.assigneeId===filterMember||p.managerId===filterMember);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {list.map(p=>{const a=members.find(m=>m.id===p.assigneeId),mg=members.find(m=>m.id===p.managerId);return(
        <div key={p.id} onClick={()=>onSelect(p.id)} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,padding:"14px 18px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <div style={{flex:1}}><p style={{fontWeight:600,fontSize:14,color:"#111",margin:0}}>{p.title}</p><div style={{marginTop:6,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}><StagePill stage={p.stage}/>{p.narratorStyle&&<span style={{fontSize:12,color:"#9CA3AF"}}>Tone: {p.narratorStyle}</span>}{(p.attachments?.length??0)>0&&<span style={{fontSize:12,color:"#9CA3AF"}}>Files: {p.attachments.length}</span>}</div></div>
          <div style={{textAlign:"right",flexShrink:0}}>{a&&<div style={{display:"flex",alignItems:"center",gap:5,justifyContent:"flex-end",marginBottom:3}}><Avatar member={a} size={20}/><span style={{fontSize:12,color:"#374151"}}>{a.name}</span></div>}{mg&&<div style={{display:"flex",alignItems:"center",gap:5,justifyContent:"flex-end"}}><Avatar member={mg} size={18}/><span style={{fontSize:11,color:"#9CA3AF"}}>{mg.name} (mgr)</span></div>}</div>
        </div>
      );})}
    </div>
  );
}