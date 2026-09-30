import { NextResponse } from "next/server";
import { applyAction } from "@/lib/workspace/store";
import type { WorkspaceAction } from "@/lib/workspace/types";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as WorkspaceAction | null;
  if (!body?.type) {
    return NextResponse.json({ error: "type is required" }, { status: 400 });
  }
  const result = await applyAction(body);
  return NextResponse.json(result);
}
