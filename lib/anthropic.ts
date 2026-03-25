export async function generateScript({title,narratorStyle,attachmentTexts,oneDriveTexts}:{title:string;narratorStyle:string;attachmentTexts:string[];oneDriveTexts:string[]}):Promise<string>{
  const ctx=[...attachmentTexts,...oneDriveTexts].filter(Boolean).join("\n\n---\n\n");
  const sys=`You are a professional B2B video scriptwriter. Write a 2-min script under 300 words. Structure: Title Card to Outro CTA. Tone: ${narratorStyle||"professional"}. Format each section with ## Section Name.`;
  const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY!,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system:sys,messages:[{role:"user",content:ctx?`Video: ${title}\n\n${ctx}`:`Video: ${title}\n\nNo docs.`}]})});
  const d=await r.json();
  return d.content?.map((b:{text?:string})=>b.text??"").join("")??"";
}