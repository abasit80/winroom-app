import { getBid } from "./bids";

export type RfpSection = {
  heading: string;
  body: string[];
};

export function getRfpDocument(bidId: string) {
  const bid = getBid(bidId);
  return {
    title: bid.title,
    rfpId: bid.rfpId,
    agency: bid.agency,
    pages: 24,
    sections: [
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
          "Work includes discovery of as-is systems, target-state design, phased cutover, knowledge transfer, and 12 months of hypercare.",
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
    ] satisfies RfpSection[],
  };
}
