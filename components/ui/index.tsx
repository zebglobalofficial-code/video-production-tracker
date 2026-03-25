"use client";
import{ReactNode}from"react";
import{STAGE_BG,STAGE_TEXT}from"@/lib/constants";
import type{Stage,Member}from"@/lib/firestore/types";
export function Avatar({member:m,size=26}:{member:Member;size?:number}){
  return<div style={{width:size,height:size,borderRadius:"50%",background:m.color,color:m.textColor,fontSize:size*0.38,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{m.avatar}</div>;
}
export function StagePill({stage}:{stage:Stage}){
  return<span style={{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:20,whiteSpace:"nowrap",background:STAGE_BG[stage]??"#eee",color:STAGE_TEXT[stage]??"#333"}}>{stage}</span>;
}
export function ProgressBar({pct,color="#10b981",height=4}:{pct:number;color?:string;height?:number}){
  return<div style={{height,borderRadius:height,background:"#E5E7EB",overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:color,transition:"width .35s"}}/></div>;
}
export function Modal({children,onClose,wide=false}:{children:ReactNode;onClose:()=>void;wide?:boolean}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#fff",borderRadius:14,padding:28,width:wide?"min(700px,96vw)":"min(520px,96vw)",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.18)"}}>{children}</div>
    </div>
  );
}
export const iS:React.CSSProperties={display:"block",width:"100%",marginTop:4,padding:"8px 10px",borderRadius:8,border:"1px solid #E5E7EB",fontSize:13,background:"#fff",color:"#111",boxSizing:"border-box",outline:"none"};
export const lS:React.CSSProperties={fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.05em"};
export const bP:React.CSSProperties={padding:"8px 18px",borderRadius:8,background:"#4F46E5",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:600};
export const bG:React.CSSProperties={padding:"8px 14px",borderRadius:8,background:"none",color:"#374151",border:"1px solid #E5E7EB",cursor:"pointer",fontSize:13};
export const bS:React.CSSProperties={...bP,background:"#059669"};