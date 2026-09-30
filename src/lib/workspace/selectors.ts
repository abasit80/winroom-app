import type { Bid, SearchSuggestion, TeamMember, Workspace } from "./types";

export function pipelineWeighted(bids: Bid[]) {
  return bids.reduce((sum, bid) => sum + bid.valueMid * (bid.winProbability / 100), 0);
}

export function awardRate(bids: Bid[]) {
  const submitted = bids.filter((bid) => bid.status === "submitted" || bid.status === "qualified").length;
  const lost = bids.filter((bid) => bid.status === "no-go").length;
  const denom = Math.max(1, submitted + lost);
  return Math.round((submitted / denom) * 100);
}

export function agencyBreakdown(bids: Bid[]) {
  const map = new Map<string, { agency: string; count: number; value: number }>();
  for (const bid of bids) {
    const current = map.get(bid.agency) ?? { agency: bid.agency, count: 0, value: 0 };
    current.count += 1;
    current.value += bid.valueMid;
    map.set(bid.agency, current);
  }
  return Array.from(map.values()).sort((a, b) => b.value - a.value);
}

export function searchSuggestions(workspace: Workspace): SearchSuggestion[] {
  const rfps = workspace.bids.map((bid) => ({
    group: "RFPs" as const,
    label: `${bid.title} (${bid.rfpId})`,
    value: bid.title,
    href: `/dashboard/analyzer/${bid.id}`,
  }));
  const teammates = workspace.team.map((member) => ({
    group: "Teammates" as const,
    label: member.name,
    value: member.name,
    href: "/dashboard/team",
  }));
  const roles = Array.from(new Set(workspace.team.map((member) => member.role))).map((role) => ({
    group: "Roles" as const,
    label: role,
    value: role,
    href: "/dashboard/team",
  }));
  const agencies = Array.from(new Set(workspace.bids.map((bid) => bid.agency))).map((agency) => ({
    group: "Agencies" as const,
    label: agency,
    value: agency,
    href: "/dashboard",
  }));
  return [...rfps, ...teammates, ...roles, ...agencies];
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function memberSearchHaystack(member: TeamMember, bids: Bid[]) {
  const bidText = member.assignedBidIds
    .map((id) => bids.find((bid) => bid.id === id))
    .filter(Boolean)
    .map((bid) => `${bid!.title} ${bid!.rfpId} ${bid!.agency}`)
    .join(" ");
  return `${member.name} ${member.role} ${member.focus} ${member.email} ${bidText}`.toLowerCase();
}

export const PLAN_META = {
  pilot: { label: "Pilot", price: "$490/mo", seats: 3, quota: 10 },
  desk: { label: "Capture Desk", price: "$2,400/mo", seats: 12, quota: 80 },
  enterprise: { label: "Enterprise", price: "Custom", seats: 50, quota: 400 },
} as const;
