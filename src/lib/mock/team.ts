export type TeamAvailability = "available" | "in-orals" | "on-deadline";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  focus: string;
  email: string;
  phone: string;
  availability: TeamAvailability;
  assignedBidIds: string[];
  bio: string;
};

export const TEAM: TeamMember[] = [
  {
    id: "jane",
    name: "Jane Collier",
    role: "Capture Lead",
    focus: "DoD · VA",
    email: "jane.collier@winroom.ai",
    phone: "+1 (202) 555-0144",
    availability: "available",
    assignedBidIds: ["it-infra", "va-ehr"],
    bio: "Owns go/no-go, customer intimacy, and the color review for federal IT captures.",
  },
  {
    id: "marcus",
    name: "Marcus Hale",
    role: "Proposal Manager",
    focus: "Volume I / Technical",
    email: "marcus.hale@winroom.ai",
    phone: "+1 (202) 555-0188",
    availability: "on-deadline",
    assignedBidIds: ["it-infra", "cloud-mig"],
    bio: "Runs the schedule, compliance matrix, and Volume I production cell.",
  },
  {
    id: "priya",
    name: "Priya Shah",
    role: "Pricing",
    focus: "Cost volumes · BOEs",
    email: "priya.shah@winroom.ai",
    phone: "+1 (202) 555-0162",
    availability: "available",
    assignedBidIds: ["cloud-mig", "az-energy"],
    bio: "Builds BOEs, CLIN structure, and most-probable-cost narratives.",
  },
  {
    id: "chris",
    name: "Chris Nguyen",
    role: "Solution Architect",
    focus: "IL5 · FedRAMP",
    email: "chris.nguyen@winroom.ai",
    phone: "+1 (703) 555-0119",
    availability: "in-orals",
    assignedBidIds: ["it-infra", "cyber-soc"],
    bio: "Leads target-state architecture, ATO strategy, and oral-presentation decks.",
  },
  {
    id: "elena",
    name: "Elena Voss",
    role: "Past Performance",
    focus: "CPARS · orals",
    email: "elena.voss@winroom.ai",
    phone: "+1 (571) 555-0194",
    availability: "available",
    assignedBidIds: ["va-ehr", "cyber-soc"],
    bio: "Sources CPARS, writes relevancy write-ups, and coaches oral presenters.",
  },
  {
    id: "omar",
    name: "Omar Diaz",
    role: "Contracts",
    focus: "FAR · supplements",
    email: "omar.diaz@winroom.ai",
    phone: "+1 (202) 555-0177",
    availability: "on-deadline",
    assignedBidIds: ["phx-roads", "az-energy"],
    bio: "Reviews representations, DFARS clauses, and exception language before submission.",
  },
  {
    id: "aisha",
    name: "Aisha Rahman",
    role: "Capture Specialist",
    focus: "DHS · CISA",
    email: "aisha.rahman@winroom.ai",
    phone: "+1 (202) 555-0133",
    availability: "available",
    assignedBidIds: ["cyber-soc"],
    bio: "Runs civilian capture for homeland security and cyber operations vehicles.",
  },
  {
    id: "benito",
    name: "Benito Cruz",
    role: "Production Lead",
    focus: "Graphics · 508",
    email: "benito.cruz@winroom.ai",
    phone: "+1 (480) 555-0108",
    availability: "on-deadline",
    assignedBidIds: ["phx-roads", "it-infra"],
    bio: "Owns layout, 508 compliance, and final print/PDF production for volumes.",
  },
  {
    id: "leah",
    name: "Leah Park",
    role: "Orals Coach",
    focus: "GSA · civilian",
    email: "leah.park@winroom.ai",
    phone: "+1 (415) 555-0190",
    availability: "in-orals",
    assignedBidIds: ["cloud-mig", "va-ehr"],
    bio: "Designs oral storyboards and runs dry-runs for technical presenters.",
  },
  {
    id: "devon",
    name: "Devon Blake",
    role: "Small Business Liaison",
    focus: "GSA · SBA",
    email: "devon.blake@winroom.ai",
    phone: "+1 (202) 555-0126",
    availability: "available",
    assignedBidIds: ["cloud-mig", "phx-roads"],
    bio: "Tracks set-asides, joint-venture rules, and workshare for small-business bids.",
  },
];

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export type SearchSuggestion = {
  group: "Teammates" | "Roles" | "Agencies";
  label: string;
  value: string;
};

export function teamSearchSuggestions(): SearchSuggestion[] {
  const teammates = TEAM.map((member) => ({
    group: "Teammates" as const,
    label: member.name,
    value: member.name,
  }));
  const roles = Array.from(new Set(TEAM.map((member) => member.role))).map((role) => ({
    group: "Roles" as const,
    label: role,
    value: role,
  }));
  const fromFocus = TEAM.flatMap((member) =>
    member.focus
      .split("·")
      .map((part) => part.trim())
      .filter(Boolean),
  );
  const fromBids = ["Department of Defense", "VA", "DHS", "GSA", "State of Arizona", "City of Phoenix"];
  const agencies = Array.from(new Set([...fromFocus, ...fromBids])).map((agency) => ({
    group: "Agencies" as const,
    label: agency,
    value: agency,
  }));
  return [...teammates, ...roles, ...agencies];
}
