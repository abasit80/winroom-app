import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getWorkspace } from "@/lib/workspace/store";
import type { Bid } from "@/lib/workspace/types";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const { bid, messages } = (await req.json()) as { bid?: Bid; messages?: ChatMessage[] };
  if (!bid || !messages?.length) {
    return NextResponse.json({ error: "bid and messages are required" }, { status: 400 });
  }

  const last = messages[messages.length - 1]?.content ?? "";
  const workspace = await getWorkspace();
  const document = workspace.documents.find((item) => item.bidId === bid.id);
  const score = workspace.scores.find((item) => item.bidId === bid.id);
  const matrix = workspace.matrix.filter((item) => item.bidId === bid.id);
  const fallback = fallbackReply(bid, last, document?.rawText, score?.decision, matrix.length);

  const excerpt = document?.rawText.slice(0, 4000) ?? "";

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ reply: fallback });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are Winroom, an RFP capture copilot. Cite solicitation sections when you can. Be concise.
Opportunity: ${bid.title} (${bid.rfpId}) for ${bid.agency}. Value ${bid.value}, duration ${bid.duration}, ${bid.bidders} bidders, due ${bid.due}, win probability ${bid.winProbability}%. NAICS ${bid.naics}, set-aside ${bid.setAside}.
Go/No-Go: ${score?.decision ?? "not scored"} (${score?.score ?? "n/a"}).
Matrix rows: ${matrix.length}.
Solicitation excerpt:\n${excerpt}`,
        },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });
    const reply = completion.choices[0]?.message?.content?.trim() || fallback;
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: fallback });
  }
}

function fallbackReply(bid: Bid, prompt: string, raw?: string, decision?: string, matrixCount = 0) {
  const q = prompt.toLowerCase();
  if (q.includes("value") || q.includes("budget") || q.includes("price")) {
    return `Estimated value is ${bid.value}. Price is only 15% of the tradeoff — lead with staffing, not a low-ball. See Volume III.`;
  }
  if (q.includes("due") || q.includes("deadline") || q.includes("date")) {
    return `Proposals are due ${bid.due} at 3:00 PM ET. ${bid.highlight}`;
  }
  if (q.includes("go") || q.includes("win") || q.includes("probability")) {
    return `Current win probability is ${bid.winProbability}%. Capture decision: ${decision ?? "run Go/No-Go in the Decision tab"}. ${matrixCount} shall-statements are mapped.`;
  }
  if (q.includes("shall") || q.includes("matrix") || q.includes("compli")) {
    return `The compliance matrix has ${matrixCount} requirements pulled from the solicitation. Open the Matrix tab to assign owners and close gaps.`;
  }
  if (q.includes("section") && raw) {
    return raw.split("\n").slice(0, 8).join(" ").slice(0, 420);
  }
  return `For ${bid.title} (${bid.rfpId}), evaluation is technical 40 / past performance 30 / staffing 15 / price 15. ${bid.bidders} bidders are tracking. ${bid.highlight}`;
}
