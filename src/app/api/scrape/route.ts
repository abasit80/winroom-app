import { NextResponse } from "next/server";
import { fetchPageSnapshot } from "@/lib/scraper/engine";
import { scrapeWithFirecrawl } from "@/lib/scraper/firecrawl";
import { scrapeWithPlaywright } from "@/lib/scraper/playwright";
import { createSession } from "@/lib/scraper/session";

export async function POST(req: Request) {
  const { url, engine } = (await req.json()) as {
    url?: string;
    engine?: "auto" | "firecrawl" | "playwright";
  };
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  const session = createSession("residential");

  if (engine === "firecrawl") {
    const result = await scrapeWithFirecrawl(url);
    return NextResponse.json({ engine: "firecrawl", session, result });
  }
  if (engine === "playwright") {
    const result = await scrapeWithPlaywright(url);
    return NextResponse.json({ engine: "playwright", session, result });
  }

  const snapshot = await fetchPageSnapshot(url);
  return NextResponse.json({ engine: snapshot.engine, session, snapshot });
}
