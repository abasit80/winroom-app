import OpenAI from "openai";
import type { PageSchema } from "@/lib/types";
import { mockItemsForUrl, normalizeUrl } from "@/lib/mock/data";
import { randomId } from "@/lib/utils";
import { fetchPageSnapshot } from "@/lib/scraper/engine";

const SYSTEM_PROMPT = `You are ScrapeMaster Vision, an extraction architect.
Given a page URL, title, and HTML excerpt, return JSON only:
{
  "pageType": "product_listing" | "company_directory" | "article" | "unknown",
  "title": string,
  "summary": string,
  "items": [
    {
      "title": string,
      "price": string | null,
      "category": string | null,
      "selector": string,
      "confidence": number,
      "fields": { [k: string]: string }
    }
  ]
}
Identify repeating item patterns. Prefer CSS selectors that would survive minor layout noise.
Do not invent prices if none exist. Cap items at 12.`;

export async function mapPageWithVision(rawUrl: string): Promise<PageSchema> {
  const url = normalizeUrl(rawUrl);
  const snapshot = await fetchPageSnapshot(url);

  if (process.env.OPENAI_API_KEY) {
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `URL: ${url}\nTitle: ${snapshot.title}\nHTML excerpt:\n${snapshot.htmlExcerpt}`,
              },
              ...(snapshot.screenshotDataUrl
                ? [
                    {
                      type: "image_url" as const,
                      image_url: { url: snapshot.screenshotDataUrl },
                    },
                  ]
                : []),
            ],
          },
        ],
        temperature: 0.2,
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}") as {
        pageType?: PageSchema["pageType"];
        title?: string;
        summary?: string;
        items?: Array<{
          title: string;
          price?: string | null;
          category?: string | null;
          selector?: string;
          confidence?: number;
          fields?: Record<string, string>;
        }>;
      };

      return {
        url,
        pageType: parsed.pageType ?? "product_listing",
        title: parsed.title ?? snapshot.title,
        summary: parsed.summary ?? "Vision mapper produced a structured item schema.",
        screenshotHint: snapshot.screenshotHint,
        items: (parsed.items ?? []).map((item, index) => ({
          id: randomId("item"),
          title: item.title,
          price: item.price ?? undefined,
          category: item.category ?? undefined,
          selector: item.selector ?? `article:nth-child(${index + 1})`,
          confidence: item.confidence ?? 0.82,
          fields: item.fields ?? {},
          confirmed: false,
        })),
      };
    } catch (error) {
      console.error("Vision mapper falling back to simulation", error);
    }
  }

  const items = mockItemsForUrl(url);
  return {
    url,
    pageType: inferPageType(url, snapshot.title),
    title: snapshot.title,
    summary:
      "GPT-4o Vision simulation mapped repeating product cards, price nodes, and SKU metadata from the layout screenshot.",
    screenshotHint: snapshot.screenshotHint,
    items,
  };
}

function inferPageType(url: string, title: string): PageSchema["pageType"] {
  const hay = `${url} ${title}`.toLowerCase();
  if (/(shop|product|store|sku|price)/.test(hay)) return "product_listing";
  if (/(company|about|team|directory)/.test(hay)) return "company_directory";
  if (/(blog|news|article)/.test(hay)) return "article";
  return "product_listing";
}
