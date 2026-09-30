import { NextResponse } from "next/server";
import { enrichCompanies } from "@/lib/agents/enricher";
import type { CompanyRecord } from "@/lib/types";

export async function POST(req: Request) {
  const { companies } = (await req.json()) as { companies?: CompanyRecord[] };
  if (!companies?.length) {
    return NextResponse.json({ error: "companies required" }, { status: 400 });
  }
  const next = await enrichCompanies(companies);
  return NextResponse.json({ companies: next });
}
