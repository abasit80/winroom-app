import { randomId } from "@/lib/utils";
import type { Bid, BidDocument, DocSection, MatrixItem } from "./types";

export function nowIso() {
  return new Date().toISOString();
}

export function prettyDate(iso = nowIso()) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function valueMidFromRange(value: string) {
  const nums = Array.from(value.matchAll(/([\d.]+)/g)).map((match) => parseFloat(match[1]));
  if (nums.length >= 2) return (nums[0] + nums[1]) / 2;
  return nums[0] || 1;
}

export function parseMoney(value: string) {
  return `$${valueMidFromRange(value).toFixed(1)}M`;
}

export function nid(prefix: string) {
  return randomId(prefix);
}

export function documentFromBid(bid: Bid, extra?: string): BidDocument {
  const sections: DocSection[] = [
    {
      heading: "1. Solicitation Overview",
      body: [
        `The ${bid.agency} seeks qualified contractors to deliver ${bid.title.toLowerCase()} under solicitation ${bid.rfpId}.`,
        `Estimated value is ${bid.value} across a period of performance of ${bid.duration}. Award is anticipated as a single best-value tradeoff.`,
        `This acquisition is ${bid.setAside.toLowerCase()} and classified under NAICS ${bid.naics}.`,
      ],
    },
    {
      heading: "2. Scope of Work",
      body: [
        "The contractor shall provide architecture, engineering, integration, cybersecurity, and operations support for the modernization of existing environments.",
        "The contractor shall complete discovery of as-is systems, target-state design, phased cutover, knowledge transfer, and 12 months of hypercare.",
        "All deliverables must comply with NIST 800-53 Rev. 5, FedRAMP Moderate (or IL5 where indicated), and agency-specific security overlays.",
      ],
    },
    {
      heading: "3. Key Dates",
      body: [
        bid.highlight,
        `Proposal due date: ${bid.due} at 3:00 PM ET.`,
        "Oral presentations may be requested of the top three offerors within 21 days of the due date.",
      ],
    },
    {
      heading: "4. Evaluation Factors",
      body: [
        "Factor 1 — Technical Approach (40%). Factor 2 — Past Performance (30%). Factor 3 — Staffing & Key Personnel (15%). Factor 4 — Price (15%).",
        "The Government will evaluate risk of unsuccessful performance and may use a confidence rating for past performance.",
        `${bid.bidders} firms are currently tracking this solicitation. Incumbent transition support is required within 30 days of award.`,
      ],
    },
    {
      heading: "5. Submission Instructions",
      body: [
        "Volume I: Technical (50-page limit). Volume II: Past Performance (15 pages). Volume III: Price (unlimited).",
        "Proposals shall be submitted via the agency portal in searchable PDF. Proprietary markings must follow FAR 3.104.",
        "Questions must be submitted in writing no later than ten calendar days before the due date.",
      ],
    },
  ];

  if (extra?.trim()) {
    sections.push({
      heading: "6. Uploaded addendum",
      body: extra
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean)
        .slice(0, 8),
    });
  }

  const rawText = sections.map((section) => `${section.heading}\n${section.body.join("\n")}`).join("\n\n");
  return {
    bidId: bid.id,
    title: bid.title,
    rfpId: bid.rfpId,
    agency: bid.agency,
    pages: 18 + Math.min(12, Math.ceil(rawText.length / 900)),
    sections,
    rawText,
  };
}

export function documentFromText(bid: Bid, text: string, fileName?: string): BidDocument {
  const cleaned = text.replace(/\r/g, "").trim();
  if (cleaned.length < 40) return { ...documentFromBid(bid, cleaned), uploadedName: fileName };

  const chunks = cleaned.split(/\n(?=\d+\.\s|[A-Z][A-Z0-9 /&-]{8,}\n)/).filter((chunk) => chunk.trim());
  const sections: DocSection[] =
    chunks.length > 1
      ? chunks.slice(0, 10).map((chunk, index) => {
          const lines = chunk.trim().split("\n");
          return {
            heading: lines[0]?.slice(0, 80) || `Section ${index + 1}`,
            body: lines.slice(1).join("\n").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).slice(0, 6),
          };
        })
      : cleaned.split(/\n{2,}/).reduce<DocSection[]>((acc, para, index) => {
          const i = Math.floor(index / 3);
          if (!acc[i]) acc[i] = { heading: `${i + 1}. Extracted section`, body: [] };
          acc[i].body.push(para.trim());
          return acc;
        }, []);

  return {
    bidId: bid.id,
    title: bid.title,
    rfpId: bid.rfpId,
    agency: bid.agency,
    pages: Math.max(8, Math.min(80, Math.ceil(cleaned.length / 700))),
    sections: sections.filter((section) => section.body.length),
    rawText: cleaned,
    uploadedName: fileName,
  };
}

export function matrixFromDocument(bid: Bid, document: BidDocument): MatrixItem[] {
  const sentences = document.rawText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 28 && /\b(shall|must|will|required|comply)\b/i.test(s))
    .slice(0, 10);

  const fallback = [
    `The contractor shall comply with NIST 800-53 Rev. 5 for ${bid.title}.`,
    `Offerors must submit Volume I technical, Volume II past performance, and Volume III price by ${bid.due}.`,
    "Key personnel shall hold relevant certifications and be available at notice to proceed.",
    `This acquisition is ${bid.setAside} under NAICS ${bid.naics}.`,
    "The contractor shall complete transition within 30 days of award.",
    "All deliverables must be 508-compliant searchable PDF.",
  ];

  const items = (sentences.length ? sentences : fallback).map((requirement, index) => {
    const section = document.sections[Math.min(index, document.sections.length - 1)]?.heading || "Requirements";
    return {
      id: nid("mx"),
      bidId: bid.id,
      requirement: requirement.slice(0, 280),
      section,
      ownerId: null,
      status: (index % 4 === 0 ? "met" : index % 4 === 1 ? "in-progress" : index % 4 === 2 ? "gap" : "open") as MatrixItem["status"],
      citation: `${section} · p.${index + 4}`,
    };
  });
  return items;
}

export function audit(action: string) {
  return { id: nid("aud"), at: nowIso(), action };
}

export function alert(partial: Omit<import("./types").AlertItem, "id" | "createdAt" | "read">) {
  return { id: nid("al"), createdAt: nowIso(), read: false, ...partial };
}
