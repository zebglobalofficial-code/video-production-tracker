"use client";
import{useState}from"react";
import{Modal,Avatar,iS,lS,bP,bG}from"@/components/ui/index";
import{useFirestore}from"@/components/providers/FirestoreProvider";
import{addMember,updateMember,deleteMember}from"@/lib/firestore/members";
import{ROLES,MEMBER_COLORS,MEMBER_TEXT_COLORS}from"@/lib/constants";
import type{Role}from"@/lib/firestore/types";
export function TeamManagerModal({onClose}:{onClose:()=>void}){
  const{members}=useFirestore();
  const[f,setF]=useState({name:"",email:"",role:"writer" as Role});
  const[saving,setSaving]=useState(false);
  const save=async()=>{if(!f.name)return;setSaving(true);const i=members.length%MEMBER_COLORS.length;await addMember({name:f.name,email:f.email,role:f.role,avatar:f.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),color:MEMBER_COLORS[i],textColor:MEMBER_TEXT_COLORS[i]});setF({name:"",email:"",role:"writer"});setSaving(false);};
  return(
    <Modal onClose={onClose} wide>
      <h2 style={{fontWeight:700,fontSize:16,color:"#111",margin:"0 0 18px"}}>Manage team members</h2>
      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
        {members.map(m=><div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"#F9FAFB",borderRadius:10,border:"1px solid #F0F0F0"}}><Avatar member={m} size={38}/><div style={{flex:1}}><p style={{fontWeight:600,fontSize:14,color:"#111",margin:0}}>{m.name}</p><p style={{fontSize:12,color:"#9CA3AF",margin:0}}>{m.email}</p></div><select value={m.role} onChange={e=>updateMember(m.id,{role:e.target.value as Role})} style={{...iS,width:120,marginTop:0}}>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select><button onClick={()=>deleteMember(m.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#E5E7EB",fontSize:22}}>x</button></div>)}
        {members.length===0&&<p style={{fontSize:13,color:"#D1D5DB",textAlign:"center",padding:"16px 0"}}>No team members yet.</p>}
      </div>
      <div style={{borderTop:"1px solid #F3F4F6",paddingTop:18}}>
        <p style={{fontWeight:600,fontSize:13,color:"#374151",marginBottom:12}}>Add member</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 140px",gap:10}}>
          <div><label style={lS}>Name</label><input style={iS} placeholder="Full name" value={f.name} onChange={e=>setF(x=>({...x,name:e.target.value}))}/></div>
          <div><label style={lS}>Email</label><input style={iS} placeholder="email@co.com" value={f.email} onChange={e=>setF(x=>({...x,email:e.target.value}))}/></div>
          <div><label style={lS}>Role</label><select style={iS} value={f.role} onChange={e=>setF(x=>({...x,role:e.target.value as Role}))}>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:14}}>
          <button onClick={onClose} style={bG}>Close</button>
          <button onClick={save} disabled={!f.name||saving} style={{...bP,opacity:!f.name||saving?0.4:1}}>{saving?"Adding...":"Add member"}</button>
        </div>
      </div>
    </Modal>
  );
}