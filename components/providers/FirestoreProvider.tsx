"use client";
import{createContext,useContext,useEffect,useState,ReactNode}from"react";
import{subscribeProjects}from"@/lib/firestore/projects";
import{subscribeMembers}from"@/lib/firestore/members";
import type{Project,Member}from"@/lib/firestore/types";
interface Ctx{projects:Project[];members:Member[];}
const Ctx=createContext<Ctx>({projects:[],members:[]});
export function FirestoreProvider({children}:{children:ReactNode}){
  const[projects,setProjects]=useState<Project[]>([]);
  const[members,setMembers]=useState<Member[]>([]);
  useEffect(()=>{const u1=subscribeProjects(setProjects),u2=subscribeMembers(setMembers);return()=>{u1();u2();};},[]);
  return<Ctx.Provider value={{projects,members}}>{children}</Ctx.Provider>;
}
export const useFirestore=()=>useContext(Ctx);