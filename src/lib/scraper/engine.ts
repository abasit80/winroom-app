import { normalizeUrl } from "@/lib/mock/data";

export type PageSnapshot = {
  url: string;
  title: string;
  htmlExcerpt: string;
  screenshotHint: string;
  screenshotDataUrl?: string;
  engine: "firecrawl" | "http" | "simulation";
};

export async function fetchPageSnapshot(rawUrl: string): Promise<PageSnapshot> {
  const url = normalizeUrl(rawUrl);

  if (process.env.FIRECRAWL_API_KEY) {
    try {
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          formats: ["markdown", "html"],
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          data?: { markdown?: string; html?: string; metadata?: { title?: string } };
        };
        const html = json.data?.html || json.data?.markdown || "";
        return {
          url,
          title: json.data?.metadata?.title || hostnameTitle(url),
          htmlExcerpt: html.slice(0, 12000),
          screenshotHint: "Firecrawl markdown extraction complete.",
          engine: "firecrawl",
        };
      }
    } catch (error) {
      console.error("Firecrawl unavailable, trying HTTP snapshot", error);
    }
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "ScrapeMasterAI/1.0 (+https://scrapemaster.ai; research-bot; contact=ops@scrapemaster.ai)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || hostnameTitle(url);
    return {
      url,
      title,
      htmlExcerpt: html.replace(/\s+/g, " ").slice(0, 12000),
      screenshotHint: "HTTP snapshot captured. JS-heavy layouts may need the Playwright engine.",
      engine: "http",
    };
  } catch {
    return {
      url,
      title: hostnameTitle(url),
      htmlExcerpt: "<html><body><main class='product-grid'></main></body></html>",
      screenshotHint: "Live fetch blocked. Vision mapper is using a layout simulation.",
      engine: "simulation",
    };
  }
}

function hostnameTitle(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "Untitled page";
  }
}
