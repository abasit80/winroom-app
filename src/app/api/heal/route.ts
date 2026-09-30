import { NextResponse } from "next/server";
import { simulateSelfHeal } from "@/lib/agents/healer";

export async function POST(req: Request) {
  const { selector } = (await req.json()) as { selector?: string };
  return NextResponse.json(simulateSelfHeal(selector || ".product-card .price"));
}
