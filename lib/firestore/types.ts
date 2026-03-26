export type Role = "writer" | "editor" | "manager" | "director";
export type Stage = "Initiated"|"Script Writing"|"Storyboarding"|"Recording"|"Editing"|"Review"|"Done";
export interface Member {
  id: string; name: string; email: string;
  roles: Role[];
  avatar: string; color: string; textColor: string;
}
export interface Attachment { name:string; size:number; type:string; content:string; }
export interface OneDriveItem { id:string; name:string; webUrl:string; driveId:string; itemId:string; isFolder:boolean; }
export interface Project {
  id:string; title:string; stage:Stage;
  assigneeId:string|null; managerId:string|null;
  due:string; narratorStyle:string; scriptDraft:string;
  scriptSections:Record<string,boolean>; storyboardSections:Record<string,boolean>;
  notes:string; attachments:Attachment[]; oneDriveItems:OneDriveItem[];
  createdAt:string; updatedAt:string;
}
