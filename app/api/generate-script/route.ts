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
      return NextResponse.json({error:"AWS Bedrock credentials not configured in Vercel environment variables"},{status:500});
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

    const now=new Date();
    const dateStr=now.toISOString().replace(/[:\-]|\.\d{3}/g,"").slice(0,15)+"Z";
    const dateOnly=dateStr.slice(0,8);
    const host=`bedrock-runtime.${region}.amazonaws.com`;
    const path=`/model/${encodeURIComponent(modelId)}/invoke`;
    const payloadHash=await sha256Hex(body);

    const canonicalHeaders=`content-type:application/json\nhost:${host}\nx-amz-date:${dateStr}\n`;
    const signedHeaders="content-type;host;x-amz-date";
    const canonicalRequest=["POST",path,"",canonicalHeaders,signedHeaders,payloadHash].join("\n");
    const credScope=`${dateOnly}/${region}/bedrock/aws4_request`;
    const strToSign=["AWS4-HMAC-SHA256",dateStr,credScope,await sha256Hex(canonicalRequest)].join("\n");
    const sigKey=await getSignatureKey(secretKey,dateOnly,region);
    const signature=await hmacHex(sigKey,strToSign);
    const authHeader=`AWS4-HMAC-SHA256 Credential=${accessKey}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const res=await fetch(`https://${host}${path}`,{
      method:"POST",
      headers:{"Content-Type":"application/json","x-amz-date":dateStr,"Authorization":authHeader},
      body
    });

    if(!res.ok){const err=await res.text();return NextResponse.json({error:`Bedrock error ${res.status}: ${err}`},{status:500});}
    const data=await res.json();
    const script=data.content?.map((b:{text?:string})=>b.text??"").join("")??"";
    return NextResponse.json({script});
  }catch(err){
    console.error("[generate-script]",err);
    return NextResponse.json({error:String(err)},{status:500});
  }
}

async function sha256Hex(data:string):Promise<string>{
  const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function hmac(key:Uint8Array|ArrayBuffer,data:string):Promise<ArrayBuffer>{
  const k=await crypto.subtle.importKey("raw",key instanceof Uint8Array?key.buffer:key,{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return crypto.subtle.sign("HMAC",k,new TextEncoder().encode(data));
}

async function hmacHex(key:ArrayBuffer,data:string):Promise<string>{
  const buf=await hmac(key,data);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function getSignatureKey(secret:string,date:string,region:string):Promise<ArrayBuffer>{
  const kDate=await hmac(new TextEncoder().encode("AWS4"+secret),date);
  const kRegion=await hmac(kDate,region);
  const kService=await hmac(kRegion,"bedrock");
  return hmac(kService,"aws4_request");
}
