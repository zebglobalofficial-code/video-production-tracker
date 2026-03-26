import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, narratorStyle = "", attachmentTexts = [], oneDriveTexts = [] } = await req.json();
    if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

    const context = [...attachmentTexts, ...oneDriveTexts].filter(Boolean).join("\n\n---\n\n");
    const system = `You are a professional B2B video scriptwriter. Write a 2-minute script under 300 words.
Structure: Title Card → Intro Hook → Problem Statement → Solution Narrative → Demo Walkthrough → People Segment → Results & Impact → Outro & CTA.
Tone: ${narratorStyle || "professional"}. Format each section with ## Section Name.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        system,
        messages: [{ role: "user", content: context ? `Video: ${title}\n\n${context}` : `Video: ${title}\n\nNo docs — write placeholder.` }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const data = await res.json();
    const script = data.content?.map((b: { text?: string }) => b.text ?? "").join("") ?? "";
    return NextResponse.json({ script });
  } catch (err) {
    console.error("[generate-script]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
