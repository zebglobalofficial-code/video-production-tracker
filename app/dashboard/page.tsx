"use client";
import{useState}from"react";
import{FirestoreProvider}from"@/components/providers/FirestoreProvider";
import{Header}from"@/components/layout/Header";
import{PipelineView}from"@/components/views/PipelineView";
import{BoardView}from"@/components/views/BoardView";
import{CaseStudiesView}from"@/components/views/CaseStudiesView";
import{TeamView}from"@/components/views/TeamView";
import{ProjectDetailPanel}from"@/components/projects/ProjectDetailPanel";
import{AddProjectModal}from"@/components/projects/AddProjectModal";
import{InitVideoWizard}from"@/components/projects/InitVideoWizard";
import{TeamManagerModal}from"@/components/team/TeamManagerModal";
export type ViewType="Pipeline"|"Board"|"Case Studies"|"Team";
export default function DashboardPage(){
  const[view,setView]=useState<ViewType>("Pipeline");
  const[selectedId,setSelectedId]=useState<string|null>(null);
  const[modal,setModal]=useState<"addProject"|"initVideo"|"team"|null>(null);
  const[filterMember,setFilterMember]=useState<string>("All");
  return(
    <FirestoreProvider>
      <div style={{minHeight:"100vh",background:"#F8F9FA"}}>
        <Header view={view} setView={setView} filterMember={filterMember} setFilterMember={setFilterMember} onInitVideo={()=>setModal("initVideo")} onAddProject={()=>setModal("addProject")} onManageTeam={()=>setModal("team")}/>
        <main style={{maxWidth:1080,margin:"0 auto",padding:"24px 28px"}}>
          {view==="Pipeline"&&<PipelineView onSelect={setSelectedId} filterMember={filterMember}/>}
          {view==="Board"&&<BoardView onSelect={setSelectedId} filterMember={filterMember}/>}
          {view==="Case Studies"&&<CaseStudiesView onSelect={setSelectedId} filterMember={filterMember}/>}
          {view==="Team"&&<TeamView onSelect={setSelectedId}/>}
        </main>
        {selectedId&&<ProjectDetailPanel projectId={selectedId} onClose={()=>setSelectedId(null)}/>}
        {modal==="addProject"&&<AddProjectModal onClose={()=>setModal(null)}/>}
        {modal==="initVideo"&&<InitVideoWizard onClose={()=>setModal(null)} onDone={id=>{setModal(null);setSelectedId(id);}}/>}
        {modal==="team"&&<TeamManagerModal onClose={()=>setModal(null)}/>}
      </div>
    </FirestoreProvider>
  );
}