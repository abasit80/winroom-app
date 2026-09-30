import { NextResponse } from "next/server";
import { mapPageWithVision } from "@/lib/agents/vision-mapper";

export async function POST(req: Request) {
  const { url } = (await req.json()) as { url?: string };
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }
  const schema = await mapPageWithVision(url);
  return NextResponse.json(schema);
}
