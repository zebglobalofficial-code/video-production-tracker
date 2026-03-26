"use client";
import{useState}from"react";
import{FirestoreProvider,useFirestore}from"@/components/providers/FirestoreProvider";
import{Header}from"@/components/layout/Header";
import{PipelineView}from"@/components/views/PipelineView";
import{BoardView}from"@/components/views/BoardView";
import{CaseStudiesView}from"@/components/views/CaseStudiesView";
import{TeamView}from"@/components/views/TeamView";
import{ProjectDetailPanel}from"@/components/projects/ProjectDetailPanel";
import{AddProjectModal}from"@/components/projects/AddProjectModal";
import{InitVideoWizard}from"@/components/projects/InitVideoWizard";
import{TeamManagerModal}from"@/components/team/TeamManagerModal";
import{SplashScreen,WelcomeDashboard}from"@/components/gamification/index";
export type ViewType="My Dashboard"|"My Projects"|"Pipeline"|"Board"|"Team";

function Inner(){
  const{projects,members}=useFirestore();
  const[currentUser,setCurrentUser]=useState<string|null>(null);
  const[view,setView]=useState<ViewType>("My Dashboard");
  const[selectedId,setSelectedId]=useState<string|null>(null);
  const[modal,setModal]=useState<"addProject"|"initVideo"|"team"|null>(null);
  const[filterMember,setFilterMember]=useState("All");
  const[localMembers,setLocalMembers]=useState<typeof members>([]);
  const allMembers=localMembers.length>0?localMembers:members;
  const member=currentUser?allMembers.find(m=>m.id===currentUser):null;

  if(!currentUser)return<SplashScreen members={allMembers.length>0?allMembers:members} onSelect={id=>{setCurrentUser(id);setView("My Dashboard");}}/>;

  const VIEWS:ViewType[]=["My Dashboard","My Projects","Pipeline","Board","Team"];
  const filtered=filterMember==="All"?projects:projects.filter(p=>p.assigneeId===filterMember||p.managerId===filterMember);

  return(
    <div style={{minHeight:"100vh",background:"#F8F9FA"}}>
      <div style={{background:"#1a1a2e",padding:"0 28px"}}>
        <div style={{maxWidth:1080,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",gap:10,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>🎬</span>
              <h1 style={{fontWeight:800,fontSize:17,color:"#fff",margin:0}}>Video Tracker</h1>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={()=>setModal("initVideo")} style={{padding:"6px 14px",borderRadius:8,background:"#059669",color:"#fff",border:"none",cursor:"pointer",fontSize:12,fontWeight:600}}>Initiate video</button>
              <button onClick={()=>setModal("addProject")} style={{padding:"6px 14px",borderRadius:8,background:"#7c3aed",color:"#fff",border:"none",cursor:"pointer",fontSize:12,fontWeight:600}}>+ New project</button>
              <button onClick={()=>setModal("team")} style={{padding:"6px 14px",borderRadius:8,background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",cursor:"pointer",fontSize:12}}>Team</button>
              <div onClick={()=>setCurrentUser(null)} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",padding:"4px 10px",borderRadius:20,background:"rgba(255,255,255,0.1)"}}>
                {member&&<div style={{width:24,height:24,borderRadius:"50%",background:member.color,color:member.textColor,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{member.avatar}</div>}
                <span style={{color:"#e2e8f0",fontSize:12,fontWeight:600}}>{member?.name?.split(" ")[0]}</span>
                <span style={{color:"#94a3b8",fontSize:11}}>↩</span>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:0,alignItems:"center",flexWrap:"wrap"}}>
            {VIEWS.map(v=>(
              <button key={v} onClick={()=>setView(v)} style={{padding:"8px 14px",border:"none",borderBottom:view===v?"2px solid #a78bfa":"2px solid transparent",cursor:"pointer",fontSize:12,fontWeight:view===v?700:400,color:view===v?"#a78bfa":"#94a3b8",background:"transparent",whiteSpace:"nowrap"}}>{v}</button>
            ))}
            {view!=="My Dashboard"&&<select value={filterMember} onChange={e=>setFilterMember(e.target.value)} style={{marginLeft:"auto",padding:"4px 8px",borderRadius:8,border:"1px solid rgba(255,255,255,0.2)",fontSize:11,background:"rgba(255,255,255,0.1)",color:"#e2e8f0",marginBottom:6}}>
              <option value="All">All members</option>
              {allMembers.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>}
          </div>
        </div>
      </div>
      <main style={{maxWidth:1080,margin:"0 auto",padding:view==="My Dashboard"?0:"24px 28px"}}>
        {view==="My Dashboard"&&member&&<WelcomeDashboard member={member} projects={projects} members={allMembers} onShoutout={(id,text)=>setLocalMembers(ms=>(ms.length>0?ms:members).map(m=>m.id===id?{...m,shoutout:text}:m))}/>}
        {view==="My Projects"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>{projects.filter(p=>p.assigneeId===currentUser||p.managerId===currentUser).map(p=><div key={p.id} onClick={()=>setSelectedId(p.id)} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,padding:16,cursor:"pointer"}}><p style={{fontWeight:700,fontSize:14,margin:"0 0 8px"}}>{p.title}</p><span style={{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:20,background:"#E5E4DC",color:"#444441"}}>{p.stage}</span></div>)}</div>}
        {view==="Pipeline"&&<PipelineView onSelect={setSelectedId} filterMember={filterMember}/>}
        {view==="Board"&&<BoardView onSelect={setSelectedId} filterMember={filterMember}/>}
        {view==="Team"&&<TeamView onSelect={setSelectedId}/>}
      </main>
      {selectedId&&<ProjectDetailPanel projectId={selectedId} onClose={()=>setSelectedId(null)}/>}
      {modal==="addProject"&&<AddProjectModal onClose={()=>setModal(null)}/>}
      {modal==="initVideo"&&<InitVideoWizard onClose={()=>setModal(null)} onDone={id=>{setModal(null);setSelectedId(id);}}/>}
      {modal==="team"&&<TeamManagerModal onClose={()=>setModal(null)}/>}
    </div>
  );
}

export default function DashboardPage(){
  return<FirestoreProvider><Inner/></FirestoreProvider>;
}
