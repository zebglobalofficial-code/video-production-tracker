import{NextRequest,NextResponse}from"next/server";
export async function POST(req:NextRequest){
  try{
    const{title,narratorStyle="",attachmentTexts=[],oneDriveTexts=[],systemOverride}=await req.json();
    if(!title)return NextResponse.json({error:"title required"},{status:400});
    if(!process.env.ANTHROPIC_API_KEY)return NextResponse.json({error:"ANTHROPIC_API_KEY not set in Vercel environment variables"},{status:500});
    const context=[...attachmentTexts,...oneDriveTexts].filter(Boolean).join("\n\n---\n\n");
    const system=systemOverride||`You are a professional B2B video scriptwriter.
Follow this EXACT flow:
## Problem
What specific problem did the customer face?
## Solution
What solution did we provide?
## How We Implemented
Step by step how it was executed.
## Benefits
What measurable results did the client achieve?
Keep under 300 words. Tone: ${narratorStyle||"professional"}.`;
    const userContent=context?`Video: ${title}\n\nSource:\n\n${context}`:`Video: ${title}\n\nNo docs — write a structured template.`;
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system,messages:[{role:"user",content:userContent}]})});
    if(!res.ok){const err=await res.text();return NextResponse.json({error:`Anthropic ${res.status}: ${err}`},{status:500});}
    const data=await res.json();
    return NextResponse.json({script:data.content?.map((b:{text?:string})=>b.text??"").join("")??""});
  }catch(err){return NextResponse.json({error:String(err)},{status:500});}
}
