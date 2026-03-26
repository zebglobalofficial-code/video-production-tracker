"use client";
import{useFirestore}from"@/components/providers/FirestoreProvider";
import{Avatar,StagePill}from"@/components/ui/index";
export function TeamView({onSelect}:{onSelect:(id:string)=>void}){
  const{members,projects}=useFirestore();
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:14}}>
      {members.map(m=>{const mine=projects.filter(p=>p.assigneeId===m.id||p.managerId===m.id);return(
        <div key={m.id} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,padding:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><Avatar member={m} size={40}/><div><p style={{fontWeight:600,fontSize:14,color:"#111",margin:0}}>{m.name}</p><p style={{fontSize:12,color:"#9CA3AF",margin:"2px 0 0",textTransform:"capitalize"}}>{(m.roles??[]).join(" & ")} - {mine.length} videos</p></div></div>
          <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:5}}>{mine.map(p=><div key={p.id} onClick={()=>onSelect(p.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #F3F4F6",cursor:"pointer"}}><span style={{fontSize:12,color:"#374151",maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</span><StagePill stage={p.stage}/></div>)}{mine.length===0&&<p style={{fontSize:12,color:"#D1D5DB"}}>No videos assigned</p>}</div>
        </div>
      );})}
    </div>
  );
}