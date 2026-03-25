import{collection,doc,addDoc,updateDoc,deleteDoc,onSnapshot}from"firebase/firestore";
import{db}from"@/lib/firebase";
import type{Member}from"./types";
const C="members";
export const subscribeMembers=(cb:(m:Member[])=>void)=>onSnapshot(collection(db,C),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}as Member))));
export const addMember=(data:Omit<Member,"id">)=>addDoc(collection(db,C),data);
export const updateMember=(id:string,patch:Partial<Member>)=>updateDoc(doc(db,C,id),patch);
export const deleteMember=(id:string)=>deleteDoc(doc(db,C,id));