"use client";
import{useFirestore}from"@/components/providers/FirestoreProvider";
import{stagePct}from"@/lib/constants";
import type{ViewType}from"@/app/dashboard/page";
const VS:ViewType[]=["Pipeline","Board","Case Studies","Team"];
interface P{view:ViewType;setView:(v:ViewType)=>void;filterMember:string;setFilterMember:(id:string)=>void;onInitVideo:()=>void;onAddProject:()=>void;onManageTeam:()=>void;}
export function Header({view,setView,filterMember,setFilterMember,onInitVideo,onAddProject,onManageTeam}:P){
  const{projects,members}=useFirestore();
  const total=projects.length,done=projects.filter(p=>p.stage==="Done").length;
  const pct=total===0?0:Math.round(projects.reduce((a,p)=>a+stagePct(p.stage),0)/total);
  return(
    <header style={{background:"#fff",borderBottom:"1px solid #E5E7EB",padding:"0 28px"}}>
      <div style={{maxWidth:1080,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0 12px",flexWrap:"wrap",gap:10}}>
          <div><h1 style={{fontWeight:800,fontSize:20,color:"#111",margin:0}}>Video Production Tracker</h1><p style={{fontSize:12,color:"#9CA3AF",margin:"3px 0 0"}}>{total} videos · {done} done · {pct}% overall</p></div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onInitVideo} style={{padding:"8px 18px",borderRadius:8,background:"#059669",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>Initiate video</button>
            <button onClick={onAddProject} style={{padding:"8px 18px",borderRadius:8,background:"#4F46E5",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>+ New project</button>
            <button onClick={onManageTeam} style={{padding:"8px 14px",borderRadius:8,background:"none",color:"#374151",border:"1px solid #E5E7EB",cursor:"pointer",fontSize:13}}>Team</button>
          </div>
        </div>
        <div style={{height:3,background:"#F3F4F6",borderRadius:2,marginBottom:14,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:"#10b981"}}/></div>
        <div style={{display:"flex",gap:8,alignItems:"center",paddingBottom:14}}>
          <div style={{display:"flex",border:"1px solid #E5E7EB",borderRadius:9,overflow:"hidden"}}>
            {VS.map(v=><button key={v} onClick={()=>setView(v)} style={{padding:"7px 16px",border:"none",cursor:"pointer",fontSize:13,background:view===v?"#F3F4F6":"transparent",fontWeight:view===v?700:400,color:view===v?"#111":"#6B7280"}}>{v}</button>)}
          </div>
          <select value={filterMember} onChange={e=>setFilterMember(e.target.value)} style={{padding:"7px 10px",borderRadius:8,border:"1px solid #E5E7EB",fontSize:13,background:"#fff"}}>
            <option value="All">All members</option>
            {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>
    </header>
  );
}