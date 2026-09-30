import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { connector, webhook } = (await req.json()) as {
    connector?: string;
    webhook?: string;
  };

  if (!connector || !webhook) {
    return NextResponse.json({ error: "connector and webhook required" }, { status: 400 });
  }

  let delivered = false;
  try {
    const host = new URL(webhook).hostname;
    if (host !== "hooks.scrapemaster.ai") {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-ScrapeMaster-Connector": connector },
        body: JSON.stringify({
          connector,
          event: "sync.sample",
          rows: 12,
          at: new Date().toISOString(),
        }),
      });
    }
    delivered = true;
  } catch {
    delivered = false;
  }

  return NextResponse.json({ ok: true, connector, delivered, sampleRows: 12 });
}
