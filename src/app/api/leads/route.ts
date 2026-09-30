import { NextResponse } from "next/server";
import { applyAction } from "@/lib/workspace/store";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; email?: string; kind?: "contact" | "demo" };
  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "name and email are required" }, { status: 400 });
  }
  const result = await applyAction({
    type: "saveLead",
    payload: { name: body.name, email: body.email, kind: body.kind === "demo" ? "demo" : "contact" },
  });
  return NextResponse.json({ ok: true, message: result.message });
}
