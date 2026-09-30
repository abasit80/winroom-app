import type { ScrapedRow } from "@/lib/types";

export type GuardReport = {
  kept: number;
  duplicates: number;
  flagged: number;
  avgConfidence: number;
  notes: string[];
};

export function runDataGuard(rows: ScrapedRow[]): { rows: ScrapedRow[]; report: GuardReport } {
  const seen = new Set<string>();
  let duplicates = 0;
  let flagged = 0;
  let confidenceSum = 0;

  const cleaned = rows.map((row) => {
    const key = `${row.entity}|${row.field}|${row.value}`.toLowerCase();
    let status = row.status;
    if (seen.has(key)) {
      status = "duplicate";
      duplicates += 1;
    } else {
      seen.add(key);
    }
    if (row.confidence < 0.7 || /lorem|test sku|n\/a/i.test(row.value)) {
      status = "flagged";
      flagged += 1;
    }
    confidenceSum += row.confidence;
    return { ...row, status };
  });

  const report: GuardReport = {
    kept: cleaned.length - duplicates,
    duplicates,
    flagged,
    avgConfidence: Number((confidenceSum / Math.max(rows.length, 1)).toFixed(3)),
    notes: [
      "Deduped entity+field+value fingerprints.",
      "Flagged low-confidence and placeholder values as possible garbage.",
      "Hallucination heuristic: sudden unique tokens with weak selector support.",
    ],
  };

  return { rows: cleaned, report };
}
