import OpenAI from "openai";
import type { CompanyRecord } from "@/lib/types";
import { enrichmentFor } from "@/lib/mock/data";

export async function enrichCompanies(companies: CompanyRecord[]): Promise<CompanyRecord[]> {
  if (process.env.OPENAI_API_KEY) {
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Enrich companies with public-profile style fields. Return JSON { results: [{ name, linkedin, industry, techStack, latestNews }] }. Be conservative; mark unknown as unknown.",
          },
          {
            role: "user",
            content: JSON.stringify(companies.map((c) => ({ name: c.name, website: c.website }))),
          },
        ],
        temperature: 0.2,
      });
      const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}") as {
        results?: Array<{
          name: string;
          linkedin?: string;
          industry?: string;
          techStack?: string[];
          latestNews?: string;
        }>;
      };
      const byName = new Map((parsed.results ?? []).map((row) => [row.name, row]));
      return companies.map((company) => {
        const hit = byName.get(company.name);
        const fallback = enrichmentFor(company.name);
        return {
          ...company,
          linkedin: hit?.linkedin || fallback.linkedin,
          industry: hit?.industry || company.industry || fallback.industry,
          techStack: hit?.techStack?.length ? hit.techStack : fallback.techStack,
          latestNews: hit?.latestNews || fallback.latestNews,
          enriched: true,
          confidence: Number(Math.min(0.99, company.confidence + 0.04).toFixed(2)),
          hallucinationRisk: "low",
        };
      });
    } catch (error) {
      console.error("Enrichment agent falling back to simulation", error);
    }
  }

  await wait(900);
  return companies.map((company) => {
    const extra = enrichmentFor(company.name);
    return {
      ...company,
      ...extra,
      industry: extra.industry || company.industry,
      enriched: true,
      confidence: Number(Math.min(0.99, company.confidence + 0.05).toFixed(2)),
      hallucinationRisk: "low" as const,
    };
  });
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
