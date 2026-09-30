export type BidStatus = "hot" | "due" | "analyzing" | "qualified" | "watching";

export type Bid = {
  id: string;
  title: string;
  rfpId: string;
  agency: string;
  jurisdiction: string;
  value: string;
  duration: string;
  bidders: number;
  due: string;
  winProbability: number;
  status: BidStatus;
  highlight: string;
  naics: string;
  setAside: string;
};

export const BIDS: Bid[] = [
  {
    id: "it-infra",
    title: "IT Infrastructure Upgrade",
    rfpId: "RFP-2023-IT-001",
    agency: "Department of Defense",
    jurisdiction: "Federal Government",
    value: "$10M – $15M",
    duration: "3 years",
    bidders: 12,
    due: "Aug 22, 2026",
    winProbability: 68,
    status: "hot",
    highlight: "Pre-bid conference scheduled for July 15.",
    naics: "541512",
    setAside: "Unrestricted",
  },
  {
    id: "cyber-soc",
    title: "Enterprise Security Operations Center",
    rfpId: "RFP-2024-DHS-088",
    agency: "Department of Homeland Security",
    jurisdiction: "Federal Government",
    value: "$4M – $8M",
    duration: "5 years",
    bidders: 9,
    due: "Sep 18, 2026",
    winProbability: 54,
    status: "analyzing",
    highlight: "Incumbent protest window closes in 11 days.",
    naics: "541513",
    setAside: "Unrestricted",
  },
  {
    id: "cloud-mig",
    title: "Federal Cloud Migration Vehicle",
    rfpId: "RFP-2024-GSA-221",
    agency: "General Services Administration",
    jurisdiction: "Federal Government",
    value: "$2M – $5M",
    duration: "4 years",
    bidders: 18,
    due: "Oct 4, 2026",
    winProbability: 41,
    status: "due",
    highlight: "Questions due Friday. IL5 boundary required.",
    naics: "541511",
    setAside: "Small Business",
  },
  {
    id: "az-energy",
    title: "Statewide Renewable Energy Portfolio",
    rfpId: "RFP-2024-AZ-017",
    agency: "State of Arizona",
    jurisdiction: "State Government",
    value: "$8M – $12M",
    duration: "6 years",
    bidders: 7,
    due: "Nov 12, 2026",
    winProbability: 61,
    status: "qualified",
    highlight: "Draft RFP comments close next week.",
    naics: "221118",
    setAside: "Unrestricted",
  },
  {
    id: "phx-roads",
    title: "Arterial Road Maintenance Program",
    rfpId: "RFP-2024-PHX-044",
    agency: "City of Phoenix",
    jurisdiction: "Municipal",
    value: "$1M – $3M",
    duration: "2 years",
    bidders: 14,
    due: "Sep 30, 2026",
    winProbability: 33,
    status: "watching",
    highlight: "Three task orders awarded in the last 24 months.",
    naics: "237310",
    setAside: "Local Preference",
  },
  {
    id: "va-ehr",
    title: "EHR Interoperability & Data Lake",
    rfpId: "RFP-2024-VA-109",
    agency: "Department of Veterans Affairs",
    jurisdiction: "Federal Government",
    value: "$15M – $25M",
    duration: "5 years",
    bidders: 6,
    due: "Dec 1, 2026",
    winProbability: 72,
    status: "hot",
    highlight: "Past performance on FHIR and Cerner is heavily weighted.",
    naics: "541511",
    setAside: "Unrestricted",
  },
];

export function getBid(id: string) {
  return BIDS.find((bid) => bid.id === id) ?? BIDS[0];
}
