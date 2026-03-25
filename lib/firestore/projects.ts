import{collection,doc,addDoc,updateDoc,deleteDoc,onSnapshot,query,orderBy}from"firebase/firestore";
import{db}from"@/lib/firebase";
import type{Project}from"./types";
const C="projects";
export const subscribeProjects=(cb:(p:Project[])=>void)=>onSnapshot(query(collection(db,C),orderBy("createdAt","desc")),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}as Project))));
export const addProject=(data:Omit<Project,"id">)=>{const n=new Date().toISOString();return addDoc(collection(db,C),{...data,createdAt:n,updatedAt:n});};
export const updateProject=(id:string,patch:Partial<Project>)=>updateDoc(doc(db,C,id),{...patch,updatedAt:new Date().toISOString()});
export const deleteProject=(id:string)=>deleteDoc(doc(db,C,id));