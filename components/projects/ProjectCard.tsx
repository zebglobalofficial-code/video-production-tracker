"use client";
import{useFirestore}from"@/components/providers/FirestoreProvider";
import{Avatar,StagePill,ProgressBar}from"@/components/ui/index";
import{stagePct}from"@/lib/constants";
import type{Project}from"@/lib/firestore/types";
export function ProjectCard({project:p,onSelect}:{project:Project;onSelect:()=>void}){
  const{members}=useFirestore();
  const a=members.find(m=>m.id===p.assigneeId),mg=members.find(m=>m.id===p.managerId);
  return(
    <div onClick={onSelect} onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.10)")} onMouseLeave={e=>(e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.06)")}
      style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,padding:16,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",transition:"box-shadow .2s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
        <p style={{fontWeight:600,fontSize:14,color:"#111",lineHeight:1.4,flex:1,margin:0}}>{p.title}</p>
        <StagePill stage={p.stage}/>
      </div>
      <div style={{marginTop:12}}><ProgressBar pct={stagePct(p.stage)}/></div>
      <div style={{marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          {a&&<><Avatar member={a} size={22}/><span style={{fontSize:12,color:"#374151"}}>{a.name.split(" ")[0]}</span></>}
          {mg&&<><span style={{fontSize:11,color:"#D1D5DB"}}>to</span><Avatar member={mg} size={20}/><span style={{fontSize:11,color:"#9CA3AF"}}>{mg.name.split(" ")[0]}</span></>}
        </div>
        <div style={{display:"flex",gap:6}}>
          {(p.attachments?.length??0)>0&&<span style={{fontSize:11,color:"#9CA3AF"}}>Files:{p.attachments.length}</span>}
          {p.due&&<span style={{fontSize:11,color:"#9CA3AF"}}>{p.due}</span>}
        </div>
      </div>
    </div>
  );
}