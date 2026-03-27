import type{Stage}from"./firestore/types";
export const STAGES:Stage[]=["initiated","scripting","storyboard","recording","editing","review","done"];
export const STAGE_BG:Record<Stage,string>={"initiated":"#E5E4DC","scripting":"#FAC775","storyboard":"#CECBF6","recording":"#F5C4B3","editing":"#B5D4F4","review":"#9FE1CB","done":"#C0DD97"};
export const STAGE_TEXT:Record<Stage,string>={"initiated":"#444441","scripting":"#633806","storyboard":"#3C3489","recording":"#712B13","editing":"#0C447C","review":"#085041","done":"#27500A"};
export const MEMBER_COLORS=["#CECBF6","#9FE1CB","#FAC775","#F5C4B3","#B5D4F4","#C0DD97","#F4C0D1","#D3D1C7"];
export const MEMBER_TEXT_COLORS=["#3C3489","#085041","#633806","#712B13","#0C447C","#27500A","#72243E","#444441"];
export const ROLES=["writer","editor","manager","director"] as const;
