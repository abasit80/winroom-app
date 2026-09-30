export type HistoryEvent = {
  id: string;
  org: string;
  text: string;
  accent: string;
  mark: string;
};

export const defaultHistory: HistoryEvent[] = [
  {
    id: "h1",
    org: "Department of Defense",
    text: "Department of Defense issued an RFP for IT infrastructure upgrade",
    accent: "#c45c4a",
    mark: "DoD",
  },
  {
    id: "h2",
    org: "Acme Corp",
    text: "Acme Corp won a $5M contract for cybersecurity services last year",
    accent: "#3b6fd4",
    mark: "AC",
  },
  {
    id: "h3",
    org: "State of Arizona",
    text: "State of Arizona is planning to release an RFP for renewable energy projects",
    accent: "#2f6bdb",
    mark: "AZ",
  },
  {
    id: "h4",
    org: "City of Phoenix",
    text: "City of Phoenix awarded 3 contracts for road maintenance in the past 2 years",
    accent: "#d8dde6",
    mark: "PHX",
  },
];

export const alternateHistory: HistoryEvent[] = [
  {
    id: "h5",
    org: "Department of Homeland Security",
    text: "DHS posted a sources-sought notice for a 24/7 security operations center",
    accent: "#4b7bec",
    mark: "DHS",
  },
  {
    id: "h6",
    org: "General Services Administration",
    text: "GSA extended the cloud migration vehicle; three task orders expected in Q4",
    accent: "#6c8cff",
    mark: "GSA",
  },
  {
    id: "h7",
    org: "Department of Veterans Affairs",
    text: "VA awarded a $12M EHR interoperability task to a mid-tier integrator",
    accent: "#1f6feb",
    mark: "VA",
  },
  {
    id: "h8",
    org: "City of Tucson",
    text: "City of Tucson released a draft RFP for smart-city network upgrades",
    accent: "#e8c36a",
    mark: "TUS",
  },
];

export async function fetchContractHistory(round = 0): Promise<HistoryEvent[]> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return round % 2 === 0 ? defaultHistory : alternateHistory;
}
