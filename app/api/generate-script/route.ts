/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import{NextRequest,NextResponse}from"next/server";

export async function POST(req:NextRequest){
  try{
    const{title,narratorStyle="",attachmentTexts=[],oneDriveTexts=[],systemOverride}=await req.json();
    if(!title)return NextResponse.json({error:"title required"},{status:400});

    const region=process.env.AWS_REGION||"us-east-1";
    const modelId=process.env.AWS_BEDROCK_MODEL_ID;
    const accessKey=process.env.AWS_ACCESS_KEY_ID;
    const secretKey=process.env.AWS_SECRET_ACCESS_KEY;

    if(!modelId||!accessKey||!secretKey){
      return NextResponse.json({error:"AWS Bedrock credentials not configured"},{status:500});
    }

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

    const userContent=context
      ?`Video: ${title}\n\nSource:\n\n${context}`
      :`Video: ${title}\n\nNo docs — write a structured template.`;

    const body=JSON.stringify({
      anthropic_version:"bedrock-2023-05-31",
      max_tokens:1200,
      system,
      messages:[{role:"user",content:userContent}]
    });

    const enc=new TextEncoder();
    const now=new Date();
    const dateStr=now.toISOString().replace(/[:\-]|\.\d{3}/g,"").slice(0,15)+"Z";
    const dateOnly=dateStr.slice(0,8);
    const host=`bedrock-runtime.${region}.amazonaws.com`;
    const path=`/model/${encodeURIComponent(modelId)}/invoke`;

    async function sha256(msg){
      const buf=await crypto.subtle.digest("SHA-256",enc.encode(msg));
      return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
    }

    async function hmac(keyData,msg){
      const key=await crypto.subtle.importKey("raw",keyData,{name:"HMAC",hash:"SHA-256"},false,["sign"]);
      return crypto.subtle.sign("HMAC",key,enc.encode(msg));
    }

    async function hex(buf){
      return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
    }

    const payloadHash=await sha256(body);
    const canonicalHeaders=`content-type:application/json\nhost:${host}\nx-amz-date:${dateStr}\n`;
    const signedHeaders="content-type;host;x-amz-date";
    const canonicalRequest=["POST",path,"",canonicalHeaders,signedHeaders,payloadHash].join("\n");
    const credScope=`${dateOnly}/${region}/bedrock/aws4_request`;
    const strToSign=["AWS4-HMAC-SHA256",dateStr,credScope,await sha256(canonicalRequest)].join("\n");

    const k0=enc.encode("AWS4"+secretKey);
    const k1=await hmac(k0,dateOnly);
    const k2=await hmac(k1,region);
    const k3=await hmac(k2,"bedrock");
    const k4=await hmac(k3,"aws4_request");
    const sig=await hmac(k4,strToSign);
    const signature=await hex(sig);
    const authHeader=`AWS4-HMAC-SHA256 Credential=${accessKey}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const res=await fetch(`https://${host}${path}`,{
      method:"POST",
      headers:{"Content-Type":"application/json","x-amz-date":dateStr,"Authorization":authHeader},
      body
    });

    if(!res.ok){const err=await res.text();return NextResponse.json({error:`Bedrock error ${res.status}: ${err}`},{status:500});}
    const data=await res.json();
    const script=data.content?.map((b)=>b.text??"").join("")??"";
    return NextResponse.json({script});
  }catch(err){
    console.error("[generate-script]",err);
    return NextResponse.json({error:String(err)},{status:500});
  }
}
