"use client";
import{useFirestore}from"@/components/providers/FirestoreProvider";
import{StagePill,Avatar}from"@/components/ui/index";
import{STAGES}from"@/lib/constants";
import type{Stage}from"@/lib/firestore/types";
export function BoardView({onSelect,filterMember}:{onSelect:(id:string)=>void;filterMember:string}){
  const{projects,members}=useFirestore();
  const list=filterMember==="All"?projects:projects.filter(p=>p.assigneeId===filterMember||p.managerId===filterMember);
  return(
    <div style={{overflowX:"auto"}}>
      <div style={{display:"flex",gap:12,minWidth:STAGES.length*172+"px"}}>
        {STAGES.map((stage:Stage)=>{
          const cols=list.filter(p=>p.stage===stage);
          return(<div key={stage} style={{flex:"0 0 160px"}}>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:10}}><StagePill stage={stage}/><span style={{fontSize:11,color:"#9CA3AF"}}>{cols.length}</span></div>
            {cols.map(p=>{const a=members.find(m=>m.id===p.assigneeId);return(<div key={p.id} onClick={()=>onSelect(p.id)} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,padding:"10px 12px",cursor:"pointer",marginBottom:8}}><p style={{fontSize:13,fontWeight:600,color:"#111",margin:0}}>{p.title}</p><div style={{marginTop:7,display:"flex",justifyContent:"space-between"}}>{a?<Avatar member={a} size={18}/>:<div/>}{p.due&&<span style={{fontSize:10,color:"#9CA3AF"}}>{p.due.slice(5)}</span>}</div></div>);})}
          </div>);
        })}
      </div>
    </div>
  );
}