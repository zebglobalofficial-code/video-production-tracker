"use client";
import{useState,useEffect}from"react";

const COLORS=["#CECBF6","#9FE1CB","#FAC775","#F5C4B3","#B5D4F4","#C0DD97","#F4C0D1","#D3D1C7"];
const CTEXTS=["#3C3489","#085041","#633806","#712B13","#0C447C","#27500A","#72243E","#444441"];
const BADGES=[
  {id:"first_done",label:"First video done",icon:"★",color:"#FAC775",text:"#633806"},
  {id:"script_master",label:"Script master",icon:"✍",color:"#CECBF6",text:"#3C3489"},
  {id:"three_done",label:"Hat trick",icon:"◆",color:"#9FE1CB",text:"#085041"},
  {id:"fast_mover",label:"Speed demon",icon:"→",color:"#F5C4B3",text:"#712B13"},
];

export function SplashScreen({members,onSelect}:{members:any[];onSelect:(id:string)=>void}){
  const[selected,setSelected]=useState<string>("");
  const[animIn,setAnimIn]=useState(false);
  useEffect(()=>{setTimeout(()=>setAnimIn(true),100);},[]);
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif"}}>
      <div style={{textAlign:"center",marginBottom:40,opacity:animIn?1:0,transform:animIn?"translateY(0)":"translateY(-20px)",transition:"all .6s ease"}}>
        <div style={{fontSize:40,marginBottom:8}}>🎬</div>
        <h1 style={{color:"#fff",fontSize:28,fontWeight:800,margin:"0 0 8px"}}>Video Production Tracker</h1>
        <p style={{color:"#94a3b8",fontSize:15,margin:0}}>Who is working today?</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12,width:"100%",maxWidth:600,opacity:animIn?1:0,transition:"all .7s ease .2s"}}>
        {members.map((m:any)=>(
          <div key={m.id} onClick={()=>setSelected(m.id)}
            style={{background:selected===m.id?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.07)",borderRadius:14,padding:"16px 12px",cursor:"pointer",textAlign:"center",border:selected===m.id?"2px solid #a78bfa":"2px solid rgba(255,255,255,0.1)",transition:"all .2s"}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:m.color,color:m.textColor,fontSize:16,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>{m.avatar}</div>
            <div style={{color:"#fff",fontSize:13,fontWeight:600}}>{m.name.split(" ")[0]}</div>
            <div style={{color:"#94a3b8",fontSize:11,marginTop:3}}>{(m.roles||[]).slice(0,2).join(" & ")}</div>
            {(m.streak||0)>0&&<div style={{marginTop:6,fontSize:11,color:"#fbbf24"}}>🔥 {m.streak} day streak</div>}
          </div>
        ))}
      </div>
      {selected&&(
        <button onClick={()=>onSelect(selected)} style={{marginTop:28,padding:"12px 36px",borderRadius:30,background:"#7c3aed",color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700}}>
          Enter dashboard →
        </button>
      )}
    </div>
  );
}

export function WelcomeDashboard({member,projects,members,onShoutout}:{member:any;projects:any[];members:any[];onShoutout:(id:string,text:string)=>void}){
  const myAssigned=projects.filter((p:any)=>p.assigneeId===member.id);
  const completed=myAssigned.filter((p:any)=>p.stage==="Done").length;
  const inProgress=myAssigned.filter((p:any)=>p.stage!=="Done"&&p.stage!=="Initiated").length;
  const overdue=myAssigned.filter((p:any)=>p.due&&new Date(p.due)<new Date()&&p.stage!=="Done").length;
  const pending=myAssigned.filter((p:any)=>p.stage==="Initiated").length;
  const isManager=(member.roles||[]).some((r:string)=>r==="manager"||r==="director");
  const leaderboard=[...members].map((m:any)=>({...m,done:projects.filter((p:any)=>p.assigneeId===m.id&&p.stage==="Done").length,inProg:projects.filter((p:any)=>p.assigneeId===m.id&&p.stage!=="Done"&&p.stage!=="Initiated").length})).sort((a:any,b:any)=>b.done-a.done||b.inProg-a.inProg);
  const myBadges=BADGES.filter(b=>{
    if(b.id==="first_done") return completed>=1;
    if(b.id==="script_master") return projects.filter((p:any)=>p.assigneeId===member.id&&Object.values(p.scriptSections||{}).every(Boolean)).length>=1;
    if(b.id==="three_done") return completed>=3;
    if(b.id==="fast_mover") return myAssigned.length>=2;
    return false;
  });
  const[shoutoutText,setShoutoutText]=useState("");
  const[shoutoutTarget,setShoutoutTarget]=useState("");
  const h=new Date().getHours();
  const greeting=h<12?"Good morning":h<17?"Good afternoon":"Good evening";
  const iS:React.CSSProperties={display:"block",width:"100%",marginTop:4,padding:"8px 10px",borderRadius:8,border:"1px solid #E5E7EB",fontSize:13,background:"#fff",color:"#111",boxSizing:"border-box",outline:"none"};
  const lS:React.CSSProperties={fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.05em"};
  return(
    <div style={{paddingBottom:32}}>
      <div style={{background:"linear-gradient(135deg,#1a1a2e,#16213e)",padding:"28px 28px 24px",marginBottom:24,borderRadius:"0 0 20px 20px"}}>
        <div style={{maxWidth:1080,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:member.color,color:member.textColor,fontSize:18,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:"3px solid rgba(255,255,255,0.2)"}}>{member.avatar}</div>
            <div>
              <p style={{color:"#94a3b8",fontSize:13,margin:"0 0 4px"}}>{greeting}</p>
              <h2 style={{color:"#fff",fontSize:22,fontWeight:800,margin:"0 0 6px"}}>{member.name} 👋</h2>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {(member.roles||[]).map((r:string)=><span key={r} style={{fontSize:11,background:"rgba(255,255,255,0.12)",color:"#e2e8f0",padding:"2px 8px",borderRadius:20,textTransform:"capitalize"}}>{r}</span>)}
                {(member.streak||0)>0&&<span style={{fontSize:11,background:"rgba(251,191,36,0.2)",color:"#fbbf24",padding:"2px 8px",borderRadius:20}}>🔥 {member.streak} day streak</span>}
              </div>
            </div>
          </div>
          {member.shoutout&&(
            <div style={{marginTop:16,padding:"10px 14px",background:"rgba(167,139,250,0.15)",borderRadius:10,border:"1px solid rgba(167,139,250,0.3)",display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:18}}>💬</span>
              <div><p style={{color:"#c4b5fd",fontSize:11,margin:"0 0 2px",fontWeight:600}}>MANAGER SHOUTOUT</p><p style={{color:"#e2e8f0",fontSize:13,margin:0}}>"{member.shoutout}"</p></div>
            </div>
          )}
        </div>
      </div>
      <div style={{maxWidth:1080,margin:"0 auto",padding:"0 24px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
          {[{label:"Completed",value:completed,color:"#10b981",bg:"#ecfdf5",icon:"✓"},{label:"In progress",value:inProgress,color:"#3b82f6",bg:"#eff6ff",icon:"→"},{label:"Not started",value:pending,color:"#f59e0b",bg:"#fffbeb",icon:"○"},{label:"Overdue",value:overdue,color:"#ef4444",bg:"#fef2f2",icon:"!"}].map(s=>(
            <div key={s.label} style={{background:s.bg,borderRadius:12,padding:"14px 16px",border:`1px solid ${s.color}33`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><p style={{fontSize:11,color:s.color,fontWeight:700,margin:"0 0 4px",textTransform:"uppercase"}}>{s.label}</p><p style={{fontSize:28,fontWeight:800,color:s.color,margin:0,lineHeight:1}}>{s.value}</p></div>
                <div style={{width:32,height:32,borderRadius:"50%",background:s.color,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700}}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
          <div style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #E5E7EB"}}>
            <p style={{fontWeight:700,fontSize:14,color:"#111",margin:"0 0 14px"}}>My active projects</p>
            {myAssigned.filter((p:any)=>p.stage!=="Done").length===0&&<p style={{fontSize:13,color:"#9CA3AF"}}>All caught up!</p>}
            {myAssigned.filter((p:any)=>p.stage!=="Done").map((p:any)=>{
              const over=p.due&&new Date(p.due)<new Date();
              return(
                <div key={p.id} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid #F3F4F6"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6}}>
                    <p style={{fontSize:13,fontWeight:600,color:over?"#ef4444":"#111",margin:0}}>{p.title}{over?" ⚠":""}</p>
                    <span style={{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:20,whiteSpace:"nowrap",background:"#E5E4DC",color:"#444441"}}>{p.stage}</span>
                  </div>
                  <div style={{height:4,borderRadius:4,background:"#E5E7EB",overflow:"hidden"}}><div style={{width:Math.round((["Initiated","Script Writing","Storyboarding","Recording","Editing","Review","Done"].indexOf(p.stage)/6)*100)+"%",height:"100%",background:over?"#ef4444":"#7c3aed",transition:"width .4s"}}/></div>
                  {p.due&&<p style={{fontSize:11,color:over?"#ef4444":"#9CA3AF",margin:"4px 0 0"}}>Due {p.due}</p>}
                </div>
              );
            })}
          </div>
          <div style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #E5E7EB"}}>
            <p style={{fontWeight:700,fontSize:14,color:"#111",margin:"0 0 14px"}}>Achievements</p>
            {myBadges.length===0&&<p style={{fontSize:13,color:"#9CA3AF",marginBottom:10}}>Complete videos to earn badges!</p>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {myBadges.map(b=><div key={b.id} style={{background:b.color,borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>{b.icon}</span><span style={{fontSize:12,fontWeight:700,color:b.text}}>{b.label}</span></div>)}
              {BADGES.filter(b=>!myBadges.find(x=>x.id===b.id)).map(b=><div key={b.id} style={{background:"#F9FAFB",borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",gap:8,opacity:0.5}}><span style={{fontSize:20,filter:"grayscale(1)"}}>{b.icon}</span><span style={{fontSize:12,color:"#9CA3AF"}}>{b.label}</span></div>)}
            </div>
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #E5E7EB",marginBottom:20}}>
          <p style={{fontWeight:700,fontSize:14,color:"#111",margin:"0 0 14px"}}>Team leaderboard</p>
          {leaderboard.map((m:any,i:number)=>(
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<leaderboard.length-1?"1px solid #F3F4F6":"none"}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:i===0?"#FAC775":i===1?"#D3D1C7":"#F5C4B3",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:i===0?"#633806":"#444441",flexShrink:0}}>{i===0?"★":i+1}</div>
              <div style={{width:32,height:32,borderRadius:"50%",background:m.color,color:m.textColor,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{m.avatar}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:600,color:m.id===member.id?"#7c3aed":"#111"}}>{m.name}{m.id===member.id?" (you)":""}</span>
                  <span style={{fontSize:12,color:"#9CA3AF"}}>{m.done} done · {m.inProg} active</span>
                </div>
                <div style={{marginTop:4,height:4,borderRadius:4,background:"#E5E7EB",overflow:"hidden"}}><div style={{width:Math.min(100,m.done*25+m.inProg*10)+"%",height:"100%",background:i===0?"#f59e0b":"#7c3aed",transition:"width .4s"}}/></div>
              </div>
              {(m.streak||0)>0&&<span style={{fontSize:11,color:"#fbbf24",whiteSpace:"nowrap"}}>🔥{m.streak}</span>}
            </div>
          ))}
        </div>
        {isManager&&(
          <div style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #E5E7EB"}}>
            <p style={{fontWeight:700,fontSize:14,color:"#111",margin:"0 0 14px"}}>Send appreciation 💬</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><label style={lS}>Team member</label><select value={shoutoutTarget} onChange={e=>setShoutoutTarget(e.target.value)} style={iS}><option value="">— select —</option>{members.filter((m:any)=>m.id!==member.id).map((m:any)=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              <div><label style={lS}>Message</label><input value={shoutoutText} onChange={e=>setShoutoutText(e.target.value)} placeholder="Great work on..." style={iS}/></div>
            </div>
            <button disabled={!shoutoutTarget||!shoutoutText} onClick={()=>{onShoutout(shoutoutTarget,shoutoutText);setShoutoutText("");setShoutoutTarget("");}} style={{padding:"8px 18px",borderRadius:8,background:!shoutoutTarget||!shoutoutText?"#E5E7EB":"#7c3aed",color:!shoutoutTarget||!shoutoutText?"#9CA3AF":"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>
              Send shoutout
            </button>
            {members.filter((m:any)=>m.shoutout).map((m:any)=>(
              <div key={m.id} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 12px",background:"#F9FAFB",borderRadius:8,marginTop:8}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:m.color,color:m.textColor,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{m.avatar}</div>
                <div style={{flex:1}}><p style={{fontSize:12,fontWeight:600,color:"#374151",margin:0}}>{m.name}</p><p style={{fontSize:12,color:"#6B7280",margin:0}}>"{m.shoutout}"</p></div>
                <button onClick={()=>onShoutout(m.id,"")} style={{background:"none",border:"none",cursor:"pointer",color:"#D1D5DB",fontSize:18}}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
