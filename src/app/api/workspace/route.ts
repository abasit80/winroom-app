import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/workspace/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getWorkspace());
}
