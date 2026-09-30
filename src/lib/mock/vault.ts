import { BIDS, type Bid } from "./bids";

export type VaultFileType = "PDF" | "DOCX" | "XLSX";

export type VaultArtifact = {
  id: string;
  name: string;
  type: VaultFileType;
  size: string;
  bidId?: string;
  updated: string;
  classification: "CUI" | "Internal";
  body: string;
};

export const DEFAULT_PINNED_IDS = ["it-infra", "cyber-soc", "cloud-mig", "az-energy"] as const;

export const VAULT_ARTIFACTS: VaultArtifact[] = [
  {
    id: "pp-dod-it",
    name: "Past Performance Volume — DoD IT",
    type: "PDF",
    size: "2.4 MB",
    bidId: "it-infra",
    updated: "Aug 12, 2026",
    classification: "CUI",
    body: `PAST PERFORMANCE VOLUME
Solicitation: RFP-2023-IT-001
Offeror: Acme Federal

1. Contract: DoD IT infrastructure sustainment (2022–2025)
   Value: $5.1M  |  Rating: Exceptional CPARS

2. Relevance
   Identity, endpoint, and campus network modernization for a comparable IL5 environment.

3. Points of contact
   KO: available upon request
   Quality: zero Level III CARs; 98% SLA attainment.`,
  },
  {
    id: "resumes",
    name: "Key personnel resumes (redacted)",
    type: "DOCX",
    size: "840 KB",
    bidId: "it-infra",
    updated: "Aug 9, 2026",
    classification: "Internal",
    body: `KEY PERSONNEL (REDACTED)

Program Manager — 18 years DoD IT, PMP, CISSP
Chief Engineer — IL5 / FedRAMP Moderate architect
Cyber Lead — NIST 800-53 Rev. 5 control inheritance
Transition Manager — 12 cutovers, average 29 days to IOC

Resumes redacted for PII. Full package released in Volume I, Appendix B.`,
  },
  {
    id: "price-fy26",
    name: "Price workbook FY26",
    type: "XLSX",
    size: "1.1 MB",
    bidId: "cloud-mig",
    updated: "Aug 18, 2026",
    classification: "CUI",
    body: `PRICE WORKBOOK FY26
CLIN 0001  Labor            $1,240,000
CLIN 0002  Cloud (IL5)      $860,000
CLIN 0003  Cyber / ATO      $410,000
CLIN 0004  ODC / travel     $95,000
Total (base year)           $2,605,000
Option years 1–3 escalate 2.4% annually.

Formulas locked. Do not distribute outside the capture cell.`,
  },
  {
    id: "nist-matrix",
    name: "NIST 800-53 control matrix",
    type: "XLSX",
    size: "620 KB",
    bidId: "cyber-soc",
    updated: "Jul 30, 2026",
    classification: "Internal",
    body: `NIST 800-53 REV. 5 CONTROL MATRIX
AC-2  Account management          Inherited / hybrid
AU-2  Audit events                Customer
CM-6  Configuration settings      Shared
IA-2  Identification / auth       Inherited (IdP)
SC-7  Boundary protection         Customer (IL5)
SI-4  Information system monitoring  Customer (SOC)

Mapped to FedRAMP Moderate + agency overlay. Ready for Volume I, Factor 1.`,
  },
];

export const VAULT_ALERTS = [
  {
    id: "n1",
    title: "Pre-bid conference",
    body: "IT Infrastructure Upgrade — July 15. Join from the analyzer.",
    href: "/dashboard/analyzer/it-infra",
  },
  {
    id: "n2",
    title: "Questions due Friday",
    body: "Federal Cloud Migration Vehicle. IL5 boundary language is still open.",
    href: "/dashboard/analyzer/cloud-mig",
  },
  {
    id: "n3",
    title: "New artifact in Vault",
    body: "Price workbook FY26 was checked in by Pricing.",
    href: "/dashboard/vault",
  },
];

export function getPinnedBids(ids: string[]): Bid[] {
  return ids.map((id) => BIDS.find((bid) => bid.id === id)).filter((bid): bid is Bid => Boolean(bid));
}
