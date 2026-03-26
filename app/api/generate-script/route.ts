import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, narratorStyle = "", attachmentTexts = [], oneDriveTexts = [] } = await req.json();

    if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not set in environment" }, { status: 500 });
    }

    const context = [...attachmentTexts, ...oneDriveTexts].filter(Boolean).join("\n\n---\n\n");

    const system = `You are a professional B2B video scriptwriter. Write a complete 2-minute explainer video script under 300 words.
Video structure: Title Card → Intro Hook → Problem Statement → Solution Narrative → Demo Walkthrough → People Segment → Results & Impact → Outro & CTA.
Narrator tone: ${narratorStyle || "professional and concise"}.
Format each section clearly with ## Section Name as a header.
Make it specific, compelling and ready to record.`;

    const userContent = context
      ? `Video title: ${title}\n\nSource documents:\n\n${context}`
      : `Video title: ${title}\n\nNo source documents provided — write a structured placeholder script based on the title.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        system,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[generate-script] Anthropic error:", errorText);
      return NextResponse.json({ 
        error: `Anthropic API returned ${res.status}: ${errorText}` 
      }, { status: 500 });
    }

    const data = await res.json();
    const script = data.content?.map((b: { text?: string }) => b.text ?? "").join("") ?? "";

    if (!script) {
      return NextResponse.json({ error: "Empty response from Anthropic" }, { status: 500 });
    }

    return NextResponse.json({ script });

  } catch (err) {
    console.error("[generate-script] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
