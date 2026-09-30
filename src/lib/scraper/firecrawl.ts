/**
 * Firecrawl adapter — fast markdown extraction for static / mostly-static pages.
 * Requires FIRECRAWL_API_KEY. The hybrid engine falls back automatically.
 */
export async function scrapeWithFirecrawl(url: string) {
  if (!process.env.FIRECRAWL_API_KEY) {
    return { ok: false as const, reason: "FIRECRAWL_API_KEY not configured" };
  }

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, formats: ["markdown", "html"] }),
  });

  if (!res.ok) {
    return { ok: false as const, reason: `Firecrawl ${res.status}` };
  }

  const json = await res.json();
  return { ok: true as const, data: json };
}
