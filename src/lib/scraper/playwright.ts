/**
 * Playwright / Browserless adapter for JavaScript-heavy sites.
 * Connects to Browserless.io when BROWSERLESS_API_KEY is set.
 *
 * This module launches a remote browser session for authorized extraction
 * of pages you have the right to collect. It does not implement WAF evasions.
 */
export async function scrapeWithPlaywright(url: string) {
  const token = process.env.BROWSERLESS_API_KEY;
  if (!token) {
    return {
      ok: false as const,
      reason: "BROWSERLESS_API_KEY not configured — using simulation engine",
    };
  }

  const endpoint = `https://production-sfo.browserless.io/content?token=${token}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      gotoOptions: { waitUntil: "networkidle2", timeout: 25000 },
    }),
  });

  if (!res.ok) {
    return { ok: false as const, reason: `Browserless ${res.status}` };
  }

  const html = await res.text();
  return { ok: true as const, html };
}
