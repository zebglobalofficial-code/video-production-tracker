"use client";
import{useFirestore}from"@/components/providers/FirestoreProvider";
import{ProjectCard}from"@/components/projects/ProjectCard";
export function PipelineView({onSelect,filterMember}:{onSelect:(id:string)=>void;filterMember:string}){
  const{projects}=useFirestore();
  const list=filterMember==="All"?projects:projects.filter(p=>p.assigneeId===filterMember||p.managerId===filterMember);
  if(list.length===0)return<p style={{textAlign:"center",color:"#9CA3AF",fontSize:14,marginTop:64}}>No projects yet. Click New project to start.</p>;
  return<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>{list.map(p=><ProjectCard key={p.id} project={p} onSelect={()=>onSelect(p.id)}/>)}</div>;
}