import type { Bid, CompanyProfile, GoNoGo, MatrixItem, Proposal, Workspace } from "./types";
import { nid, nowIso } from "./helpers";

export function scoreGoNoGo(bid: Bid, profile: CompanyProfile, matrix: MatrixItem[]): GoNoGo {
  const naicsHit = profile.naics.includes(bid.naics) ? 90 : 42;
  const keywordHit = profile.keywords.some((word) =>
    `${bid.title} ${bid.highlight}`.toLowerCase().includes(word.toLowerCase()),
  )
    ? 86
    : 55;
  const gaps = matrix.filter((item) => item.bidId === bid.id && item.status === "gap").length;
  const compliance = Math.max(38, 88 - gaps * 12);
  const competition = Math.max(28, 92 - bid.bidders * 3);
  const setAsideBoost = /small/i.test(bid.setAside) ? 48 : 70;
  const score = Math.round((naicsHit + keywordHit + compliance + competition + setAsideBoost + bid.winProbability) / 6);

  const decision: GoNoGo["decision"] = score >= 68 ? "go" : score >= 50 ? "conditional" : "no-go";

  return {
    bidId: bid.id,
    decision,
    score,
    reasons: [
      { label: "NAICS / vehicle fit", score: naicsHit, note: naicsHit > 70 ? `${bid.naics} is on the capability profile.` : `${bid.naics} is outside core codes ${profile.naics.join(", ")}.` },
      { label: "Keyword / mission fit", score: keywordHit, note: keywordHit > 70 ? "Title and highlight match capture keywords." : "Thin overlap with FedRAMP / IL5 / SOC themes." },
      { label: "Compliance posture", score: compliance, note: gaps ? `${gaps} open gaps in the matrix.` : "Shall-statements are mapped." },
      { label: "Competitive pressure", score: competition, note: `${bid.bidders} known bidders on ${bid.agency}.` },
      { label: "Set-aside / workshare", score: setAsideBoost, note: `${bid.setAside} — check teaming before a hard go.` },
    ],
    updatedAt: nowIso(),
  };
}

export function draftProposal(bid: Bid, workspace: Workspace, volume = "Volume I"): Proposal {
  const score = workspace.scores.find((item) => item.bidId === bid.id);
  const owners = workspace.team.filter((member) => member.assignedBidIds.includes(bid.id));
  const themes = score?.reasons.map((reason) => `• ${reason.label}: ${reason.note}`).join("\n") ?? "• Lead with architecture and transition risk.";

  const bodies: Record<string, string> = {
    "Volume I": `VOLUME I — TECHNICAL APPROACH
${bid.rfpId} · ${bid.agency} · ${bid.title}

1. Understanding
We understand ${bid.agency} needs ${bid.title.toLowerCase()} over ${bid.duration} at ${bid.value}. Evaluation is a best-value tradeoff (technical 40 / past performance 30 / staffing 15 / price 15).

2. Win themes
${themes}

3. Technical approach
• Discovery of as-is systems in 30 days
• Target-state architecture aligned to NIST 800-53 Rev. 5 / FedRAMP Moderate / IL5 where required
• Phased cutover with rollback and 12-month hypercare
• 508-compliant artifacts and searchable PDF delivery

4. Transition
Incumbent transition inside 30 days of award. Capture cell: ${owners.map((o) => o.name).join(", ") || "unassigned"}.

5. Risk
${bid.highlight}
`,
    "Volume II": `VOLUME II — PAST PERFORMANCE
${bid.rfpId}

Offeror: ${workspace.profile.name}
Relevant work: ${workspace.profile.pastPerformance}

Contract 1 — DoD IT sustainment (2022–2025)
Value $5.1M · Rating Exceptional CPARS · NAICS ${bid.naics}

Contract 2 — Agency cloud / data
Maps to ${bid.title} scope, vehicles ${workspace.profile.vehicles.join(", ")}.

Points of contact available upon request.
`,
    "Volume III": `VOLUME III — PRICE NARRATIVE
${bid.rfpId}

CLIN 0001 Labor            48% of most-probable cost
CLIN 0002 Cloud / hosting  28%
CLIN 0003 Cyber / ATO      16%
CLIN 0004 ODC / travel      8%

Price is 15% of the tradeoff. Do not lead with a low-ball. Staffing model is the discriminator.
Period of performance: ${bid.duration}. Estimated range: ${bid.value}.
`,
  };

  const key = volume in bodies ? volume : "Volume I";
  return {
    id: nid("pr"),
    bidId: bid.id,
    title: `${key} — ${bid.title}`,
    volume: key,
    body: bodies[key],
    status: "draft",
    updatedAt: nowIso(),
  };
}

export async function polishWithLlm(system: string, user: string) {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}
