export type BidStatus =
  | "hot"
  | "due"
  | "analyzing"
  | "qualified"
  | "watching"
  | "no-go"
  | "submitted";

export type Bid = {
  id: string;
  title: string;
  rfpId: string;
  agency: string;
  jurisdiction: string;
  value: string;
  valueMid: number;
  duration: string;
  bidders: number;
  due: string;
  winProbability: number;
  status: BidStatus;
  highlight: string;
  naics: string;
  setAside: string;
  source: "seed" | "discovery" | "upload";
  pinned: boolean;
  crmSynced: string | null;
  createdAt: string;
};

export type DocSection = { heading: string; body: string[] };

export type BidDocument = {
  bidId: string;
  title: string;
  rfpId: string;
  agency: string;
  pages: number;
  sections: DocSection[];
  rawText: string;
  uploadedName?: string;
};

export type MatrixStatus = "open" | "in-progress" | "met" | "gap";

export type MatrixItem = {
  id: string;
  bidId: string;
  requirement: string;
  section: string;
  ownerId: string | null;
  status: MatrixStatus;
  citation: string;
};

export type GoNoGo = {
  bidId: string;
  decision: "go" | "conditional" | "no-go";
  score: number;
  reasons: { label: string; score: number; note: string }[];
  updatedAt: string;
};

export type Proposal = {
  id: string;
  bidId: string;
  title: string;
  volume: string;
  body: string;
  status: "draft" | "review" | "final";
  updatedAt: string;
};

export type VaultFileType = "PDF" | "DOCX" | "XLSX" | "TXT";

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

export type AlertItem = {
  id: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  read: boolean;
  kind: "deadline" | "discovery" | "sync" | "team" | "system";
};

export type Connector = {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  webhook: string;
  lastSync?: string;
  lastCount?: number;
};

export type AutomationJob = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  cadence: string;
  lastRun?: string;
  lastResult?: string;
};

export type WorkflowNode = {
  id: string;
  label: string;
  status: "pending" | "running" | "done";
};

export type CaptureWorkflow = {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "done";
  nodes: WorkflowNode[];
};

export type CompanyProfile = {
  name: string;
  naics: string[];
  vehicles: string[];
  geos: string[];
  clearance: string;
  keywords: string[];
  pastPerformance: string;
};

export type PlanId = "pilot" | "desk" | "enterprise";

export type Billing = {
  plan: PlanId;
  seats: number;
  rfpQuota: number;
  rfpsUsed: number;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  kind: "contact" | "demo";
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  at: string;
  action: string;
};

export type Workspace = {
  bids: Bid[];
  documents: BidDocument[];
  matrix: MatrixItem[];
  scores: GoNoGo[];
  proposals: Proposal[];
  artifacts: VaultArtifact[];
  team: TeamMember[];
  alerts: AlertItem[];
  connectors: Connector[];
  automations: AutomationJob[];
  workflows: CaptureWorkflow[];
  profile: CompanyProfile;
  billing: Billing;
  leads: Lead[];
  audit: AuditEvent[];
};

export type WorkspaceAction =
  | { type: "markAlertRead"; payload: { id: string } }
  | { type: "markAllAlertsRead"; payload?: undefined }
  | { type: "pinBid"; payload: { id: string; pinned: boolean } }
  | { type: "setBidStatus"; payload: { id: string; status: BidStatus } }
  | { type: "createBid"; payload: CreateBidInput }
  | { type: "ingestDocument"; payload: { bidId: string; text: string; fileName?: string } }
  | { type: "setMatrixItem"; payload: { id: string; status?: MatrixStatus; ownerId?: string | null } }
  | { type: "runGoNoGo"; payload: { bidId: string } }
  | { type: "generateProposal"; payload: { bidId: string; volume?: string } }
  | { type: "setProposalStatus"; payload: { id: string; status: Proposal["status"] } }
  | { type: "assignMember"; payload: { memberId: string; bidId: string } }
  | { type: "addMember"; payload: { name: string; role: string; email: string; focus?: string } }
  | { type: "setAvailability"; payload: { memberId: string; availability: TeamAvailability } }
  | { type: "runDiscovery"; payload?: undefined }
  | { type: "toggleAutomation"; payload: { id: string } }
  | { type: "runAutomation"; payload: { id: string } }
  | { type: "connectConnector"; payload: { id: string; webhook?: string } }
  | { type: "disconnectConnector"; payload: { id: string } }
  | { type: "syncConnector"; payload: { id: string; bidId?: string } }
  | { type: "updateProfile"; payload: Partial<CompanyProfile> }
  | { type: "changePlan"; payload: { plan: PlanId } }
  | { type: "addArtifact"; payload: { name: string; type: VaultFileType; body: string; bidId?: string } }
  | { type: "runWorkflow"; payload: { id: string } }
  | { type: "saveLead"; payload: { name: string; email: string; kind: "contact" | "demo" } };

export type CreateBidInput = {
  title: string;
  rfpId?: string;
  agency: string;
  jurisdiction?: string;
  value?: string;
  duration?: string;
  due?: string;
  naics?: string;
  setAside?: string;
  highlight?: string;
  text?: string;
};

export type SearchSuggestion = {
  group: "Teammates" | "Roles" | "Agencies" | "RFPs";
  label: string;
  value: string;
  href?: string;
};
