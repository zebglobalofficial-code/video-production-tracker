"use client";
import{useState}from"react";
import{Modal,Avatar,iS,lS,bP,bG}from"@/components/ui/index";
import{useFirestore}from"@/components/providers/FirestoreProvider";
import{addMember,updateMember,deleteMember}from"@/lib/firestore/members";
import{MEMBER_COLORS,MEMBER_TEXT_COLORS}from"@/lib/constants";
import type{Role}from"@/lib/firestore/types";

const ALL_ROLES:Role[]=["writer","editor","manager","director"];

export function TeamManagerModal({onClose}:{onClose:()=>void}){
  const{members}=useFirestore();
  const[f,setF]=useState({name:"",email:"",roles:["writer"] as Role[]});
  const[saving,setSaving]=useState(false);

  const toggleRole=(role:Role,current:Role[])=>
    current.includes(role)?current.filter(r=>r!==role):[...current,role];

  const save=async()=>{
    if(!f.name||f.roles.length===0)return;
    setSaving(true);
    const i=members.length%MEMBER_COLORS.length;
    await addMember({name:f.name,email:f.email,roles:f.roles,
      avatar:f.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),
      color:MEMBER_COLORS[i],textColor:MEMBER_TEXT_COLORS[i]});
    setF({name:"",email:"",roles:["writer"]});
    setSaving(false);
  };

  return(
    <Modal onClose={onClose} wide>
      <h2 style={{fontWeight:700,fontSize:16,color:"#111",margin:"0 0 18px"}}>Manage team members</h2>
      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
        {members.map(m=>(
          <div key={m.id} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"11px 14px",background:"#F9FAFB",borderRadius:10,border:"1px solid #F0F0F0"}}>
            <Avatar member={m} size={38}/>
            <div style={{flex:1}}>
              <p style={{fontWeight:600,fontSize:14,color:"#111",margin:"0 0 2px"}}>{m.name}</p>
              <p style={{fontSize:12,color:"#9CA3AF",margin:"0 0 6px"}}>{m.email}</p>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {ALL_ROLES.map(r=>(
                  <label key={r} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12,color:"#374151",background:(m.roles??[]).includes(r)?"#EEF2FF":"#F3F4F6",padding:"3px 8px",borderRadius:20,border:(m.roles??[]).includes(r)?"1px solid #C7D2FE":"1px solid transparent"}}>
                    <input type="checkbox" style={{accentColor:"#4F46E5",width:12,height:12}}
                      checked={(m.roles??[]).includes(r)}
                      onChange={()=>updateMember(m.id,{roles:toggleRole(r,m.roles??[])})}/>
                    {r}
                  </label>
                ))}
              </div>
            </div>
            <button onClick={()=>deleteMember(m.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#E5E7EB",fontSize:22,lineHeight:1}}>×</button>
          </div>
        ))}
        {members.length===0&&<p style={{fontSize:13,color:"#D1D5DB",textAlign:"center",padding:"16px 0"}}>No team members yet.</p>}
      </div>

      <div style={{borderTop:"1px solid #F3F4F6",paddingTop:18}}>
        <p style={{fontWeight:600,fontSize:13,color:"#374151",marginBottom:12}}>Add member</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={lS}>Name</label><input style={iS} placeholder="Full name" value={f.name} onChange={e=>setF(x=>({...x,name:e.target.value}))}/></div>
          <div><label style={lS}>Email</label><input style={iS} placeholder="email@company.com" value={f.email} onChange={e=>setF(x=>({...x,email:e.target.value}))}/></div>
        </div>
        <label style={lS}>Roles (select all that apply)</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6,marginBottom:14}}>
          {ALL_ROLES.map(r=>(
            <label key={r} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:13,color:"#374151",background:f.roles.includes(r)?"#EEF2FF":"#F9FAFB",padding:"5px 12px",borderRadius:20,border:f.roles.includes(r)?"1px solid #C7D2FE":"1px solid #E5E7EB"}}>
              <input type="checkbox" style={{accentColor:"#4F46E5"}}
                checked={f.roles.includes(r)}
                onChange={()=>setF(x=>({...x,roles:toggleRole(r,x.roles)}))}/>
              {r}
            </label>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
          <button onClick={onClose} style={bG}>Close</button>
          <button onClick={save} disabled={!f.name||f.roles.length===0||saving}
            style={{...bP,opacity:!f.name||f.roles.length===0||saving?0.4:1}}>
            {saving?"Adding...":"Add member"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
