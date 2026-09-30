import { existsSync, readFileSync } from "fs";
import path from "path";
import { query, withTransaction, type RowDataPacket } from "./mysql";
import type {
  AlertItem,
  AuditEvent,
  Bid,
  BidDocument,
  Billing,
  CaptureWorkflow,
  CompanyProfile,
  Connector,
  AutomationJob,
  GoNoGo,
  Lead,
  MatrixItem,
  Proposal,
  TeamMember,
  VaultArtifact,
  Workspace,
} from "@/lib/workspace/types";

type ProfileRow = RowDataPacket & { name: string; clearance: string; past_performance: string };
type TagRow = RowDataPacket & { kind: string; value: string };
type BillingRow = RowDataPacket & { plan: Billing["plan"]; seats: number; rfp_quota: number; rfps_used: number };
type ConnectorRow = RowDataPacket & {
  id: string;
  name: string;
  description: string;
  connected: number;
  webhook: string;
  last_sync: string | null;
  last_count: number | null;
};
type AutomationRow = RowDataPacket & {
  id: string;
  name: string;
  description: string;
  enabled: number;
  cadence: string;
  last_run: string | null;
  last_result: string | null;
};
type WorkflowRow = RowDataPacket & { id: string; name: string; description: string; status: CaptureWorkflow["status"] };
type NodeRow = RowDataPacket & { workflow_id: string; id: string; label: string; status: "pending" | "running" | "done"; sort_order: number };
type TeamRow = RowDataPacket & {
  id: string;
  name: string;
  role: string;
  focus: string;
  email: string;
  phone: string;
  availability: TeamMember["availability"];
  bio: string;
};
type AssignRow = RowDataPacket & { member_id: string; bid_id: string };
type BidRow = RowDataPacket & {
  id: string;
  title: string;
  rfp_id: string;
  agency: string;
  jurisdiction: string;
  value: string;
  value_mid: number;
  duration: string;
  bidders: number;
  due_label: string;
  win_probability: number;
  status: Bid["status"];
  highlight: string;
  naics: string;
  set_aside: string;
  source: Bid["source"];
  pinned: number;
  crm_synced: string | null;
  created_at: string;
};
type DocRow = RowDataPacket & {
  bid_id: string;
  title: string;
  rfp_id: string;
  agency: string;
  pages: number;
  raw_text: string;
  uploaded_name: string | null;
};
type SectionRow = RowDataPacket & { bid_id: string; sort_order: number; heading: string; body_json: string };
type MatrixRow = RowDataPacket & {
  id: string;
  bid_id: string;
  requirement: string;
  section: string;
  owner_id: string | null;
  status: MatrixItem["status"];
  citation: string;
};
type ScoreRow = RowDataPacket & { bid_id: string; decision: GoNoGo["decision"]; score: number; updated_at: string };
type ReasonRow = RowDataPacket & { bid_id: string; sort_order: number; label: string; score: number; note: string };
type ProposalRow = RowDataPacket & {
  id: string;
  bid_id: string;
  title: string;
  volume: string;
  body: string;
  status: Proposal["status"];
  updated_at: string;
};
type ArtifactRow = RowDataPacket & {
  id: string;
  name: string;
  type: VaultArtifact["type"];
  size_label: string;
  bid_id: string | null;
  updated_label: string;
  classification: VaultArtifact["classification"];
  body: string;
};
type AlertRow = RowDataPacket & {
  id: string;
  title: string;
  body: string;
  href: string;
  created_at: string;
  read: number;
  kind: AlertItem["kind"];
};
type LeadRow = RowDataPacket & { id: string; name: string; email: string; kind: Lead["kind"]; created_at: string };
type AuditRow = RowDataPacket & { id: string; at: string; action: string };

function jsonFallback(): Workspace | null {
  const file = path.join(process.cwd(), "data", "workspace.json");
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as Workspace;
  } catch {
    return null;
  }
}

export async function loadWorkspace(): Promise<Workspace | null> {
  const profileRows = await query<ProfileRow[]>("SELECT * FROM company_profile WHERE id = 1");
  const profile = profileRows[0];
  if (!profile) {
    const fromJson = jsonFallback();
    if (fromJson?.bids?.length) {
      await saveWorkspace(fromJson);
      return fromJson;
    }
    return null;
  }

  const tags = await query<TagRow[]>("SELECT kind, value FROM profile_tags");
  const billingRows = await query<BillingRow[]>("SELECT * FROM billing WHERE id = 1");
  const billing = billingRows[0];
  const connectors = await query<ConnectorRow[]>("SELECT * FROM connectors");
  const automations = await query<AutomationRow[]>("SELECT * FROM automations");
  const workflows = await query<WorkflowRow[]>("SELECT * FROM workflows");
  const nodes = await query<NodeRow[]>("SELECT * FROM workflow_nodes ORDER BY sort_order");
  const team = await query<TeamRow[]>("SELECT * FROM team_members");
  const assignments = await query<AssignRow[]>("SELECT * FROM team_assignments");
  const bids = await query<BidRow[]>("SELECT * FROM bids ORDER BY created_at DESC");
  const documents = await query<DocRow[]>("SELECT * FROM bid_documents");
  const sections = await query<SectionRow[]>("SELECT * FROM document_sections ORDER BY sort_order");
  const matrix = await query<MatrixRow[]>("SELECT * FROM matrix_items");
  const scores = await query<ScoreRow[]>("SELECT * FROM go_no_go");
  const reasons = await query<ReasonRow[]>("SELECT * FROM go_no_go_reasons ORDER BY sort_order");
  const proposals = await query<ProposalRow[]>("SELECT * FROM proposals ORDER BY updated_at DESC");
  const artifacts = await query<ArtifactRow[]>("SELECT * FROM vault_artifacts");
  const alerts = await query<AlertRow[]>("SELECT * FROM alerts ORDER BY created_at DESC");
  const leads = await query<LeadRow[]>("SELECT * FROM leads ORDER BY created_at DESC");
  const audit = await query<AuditRow[]>("SELECT * FROM audit_events ORDER BY at DESC");

  const assignMap = new Map<string, string[]>();
  for (const row of assignments) {
    const list = assignMap.get(row.member_id) ?? [];
    list.push(row.bid_id);
    assignMap.set(row.member_id, list);
  }

  const sectionMap = new Map<string, BidDocument["sections"]>();
  for (const row of sections) {
    const list = sectionMap.get(row.bid_id) ?? [];
    list.push({ heading: row.heading, body: JSON.parse(row.body_json) as string[] });
    sectionMap.set(row.bid_id, list);
  }

  const reasonMap = new Map<string, GoNoGo["reasons"]>();
  for (const row of reasons) {
    const list = reasonMap.get(row.bid_id) ?? [];
    list.push({ label: row.label, score: row.score, note: row.note });
    reasonMap.set(row.bid_id, list);
  }

  const nodeMap = new Map<string, CaptureWorkflow["nodes"]>();
  for (const row of nodes) {
    const list = nodeMap.get(row.workflow_id) ?? [];
    list.push({ id: row.id, label: row.label, status: row.status });
    nodeMap.set(row.workflow_id, list);
  }

  const company: CompanyProfile = {
    name: profile.name,
    clearance: profile.clearance,
    pastPerformance: profile.past_performance,
    naics: tags.filter((tag) => tag.kind === "naics").map((tag) => tag.value),
    vehicles: tags.filter((tag) => tag.kind === "vehicle").map((tag) => tag.value),
    geos: tags.filter((tag) => tag.kind === "geo").map((tag) => tag.value),
    keywords: tags.filter((tag) => tag.kind === "keyword").map((tag) => tag.value),
  };

  return {
    profile: company,
    billing: billing
      ? { plan: billing.plan, seats: billing.seats, rfpQuota: billing.rfp_quota, rfpsUsed: billing.rfps_used }
      : { plan: "desk", seats: 12, rfpQuota: 80, rfpsUsed: 0 },
    connectors: connectors.map((row): Connector => ({
      id: row.id,
      name: row.name,
      description: row.description,
      connected: Boolean(row.connected),
      webhook: row.webhook,
      lastSync: row.last_sync ?? undefined,
      lastCount: row.last_count ?? undefined,
    })),
    automations: automations.map((row): AutomationJob => ({
      id: row.id,
      name: row.name,
      description: row.description,
      enabled: Boolean(row.enabled),
      cadence: row.cadence,
      lastRun: row.last_run ?? undefined,
      lastResult: row.last_result ?? undefined,
    })),
    workflows: workflows.map((row): CaptureWorkflow => ({
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      nodes: nodeMap.get(row.id) ?? [],
    })),
    team: team.map((row): TeamMember => ({
      id: row.id,
      name: row.name,
      role: row.role,
      focus: row.focus,
      email: row.email,
      phone: row.phone,
      availability: row.availability,
      bio: row.bio,
      assignedBidIds: assignMap.get(row.id) ?? [],
    })),
    bids: bids.map((row): Bid => ({
      id: row.id,
      title: row.title,
      rfpId: row.rfp_id,
      agency: row.agency,
      jurisdiction: row.jurisdiction,
      value: row.value,
      valueMid: row.value_mid,
      duration: row.duration,
      bidders: row.bidders,
      due: row.due_label,
      winProbability: row.win_probability,
      status: row.status,
      highlight: row.highlight,
      naics: row.naics,
      setAside: row.set_aside,
      source: row.source,
      pinned: Boolean(row.pinned),
      crmSynced: row.crm_synced,
      createdAt: row.created_at,
    })),
    documents: documents.map((row): BidDocument => ({
      bidId: row.bid_id,
      title: row.title,
      rfpId: row.rfp_id,
      agency: row.agency,
      pages: row.pages,
      rawText: row.raw_text,
      uploadedName: row.uploaded_name ?? undefined,
      sections: sectionMap.get(row.bid_id) ?? [],
    })),
    matrix: matrix.map((row): MatrixItem => ({
      id: row.id,
      bidId: row.bid_id,
      requirement: row.requirement,
      section: row.section,
      ownerId: row.owner_id,
      status: row.status,
      citation: row.citation,
    })),
    scores: scores.map((row): GoNoGo => ({
      bidId: row.bid_id,
      decision: row.decision,
      score: row.score,
      updatedAt: row.updated_at,
      reasons: reasonMap.get(row.bid_id) ?? [],
    })),
    proposals: proposals.map(
      (row): Proposal => ({
        id: row.id,
        bidId: row.bid_id,
        title: row.title,
        volume: row.volume,
        body: row.body,
        status: row.status,
        updatedAt: row.updated_at,
      }),
    ),
    artifacts: artifacts.map(
      (row): VaultArtifact => ({
        id: row.id,
        name: row.name,
        type: row.type,
        size: row.size_label,
        bidId: row.bid_id ?? undefined,
        updated: row.updated_label,
        classification: row.classification,
        body: row.body,
      }),
    ),
    alerts: alerts.map(
      (row): AlertItem => ({
        id: row.id,
        title: row.title,
        body: row.body,
        href: row.href,
        createdAt: row.created_at,
        read: Boolean(row.read),
        kind: row.kind,
      }),
    ),
    leads: leads.map((row): Lead => ({
      id: row.id,
      name: row.name,
      email: row.email,
      kind: row.kind,
      createdAt: row.created_at,
    })),
    audit: audit.map((row): AuditEvent => ({ id: row.id, at: row.at, action: row.action })),
  };
}

export async function saveWorkspace(workspace: Workspace) {
  await withTransaction(async (conn) => {
    await conn.query(`
      DELETE FROM document_sections;
      DELETE FROM go_no_go_reasons;
      DELETE FROM team_assignments;
      DELETE FROM workflow_nodes;
      DELETE FROM matrix_items;
      DELETE FROM bid_documents;
      DELETE FROM go_no_go;
      DELETE FROM proposals;
      DELETE FROM vault_artifacts;
      DELETE FROM alerts;
      DELETE FROM audit_events;
      DELETE FROM leads;
      DELETE FROM profile_tags;
      DELETE FROM bids;
      DELETE FROM team_members;
      DELETE FROM workflows;
      DELETE FROM automations;
      DELETE FROM connectors;
      DELETE FROM company_profile;
      DELETE FROM billing;
    `);

    await conn.query("INSERT INTO company_profile (id, name, clearance, past_performance) VALUES (1, ?, ?, ?)", [
      workspace.profile.name,
      workspace.profile.clearance,
      workspace.profile.pastPerformance,
    ]);

    for (const value of workspace.profile.naics) {
      await conn.query("INSERT INTO profile_tags (kind, value) VALUES ('naics', ?)", [value]);
    }
    for (const value of workspace.profile.vehicles) {
      await conn.query("INSERT INTO profile_tags (kind, value) VALUES ('vehicle', ?)", [value]);
    }
    for (const value of workspace.profile.geos) {
      await conn.query("INSERT INTO profile_tags (kind, value) VALUES ('geo', ?)", [value]);
    }
    for (const value of workspace.profile.keywords) {
      await conn.query("INSERT INTO profile_tags (kind, value) VALUES ('keyword', ?)", [value]);
    }

    await conn.query("INSERT INTO billing (id, plan, seats, rfp_quota, rfps_used) VALUES (1, ?, ?, ?, ?)", [
      workspace.billing.plan,
      workspace.billing.seats,
      workspace.billing.rfpQuota,
      workspace.billing.rfpsUsed,
    ]);

    for (const item of workspace.connectors) {
      await conn.query(
        "INSERT INTO connectors (id, name, description, connected, webhook, last_sync, last_count) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [item.id, item.name, item.description, item.connected ? 1 : 0, item.webhook, item.lastSync ?? null, item.lastCount ?? null],
      );
    }

    for (const item of workspace.automations) {
      await conn.query(
        "INSERT INTO automations (id, name, description, enabled, cadence, last_run, last_result) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [item.id, item.name, item.description, item.enabled ? 1 : 0, item.cadence, item.lastRun ?? null, item.lastResult ?? null],
      );
    }

    for (const flow of workspace.workflows) {
      await conn.query("INSERT INTO workflows (id, name, description, status) VALUES (?, ?, ?, ?)", [
        flow.id,
        flow.name,
        flow.description,
        flow.status,
      ]);
      for (let index = 0; index < flow.nodes.length; index += 1) {
        const node = flow.nodes[index];
        await conn.query("INSERT INTO workflow_nodes (workflow_id, id, label, status, sort_order) VALUES (?, ?, ?, ?, ?)", [
          flow.id,
          node.id,
          node.label,
          node.status,
          index,
        ]);
      }
    }

    for (const member of workspace.team) {
      await conn.query(
        "INSERT INTO team_members (id, name, role, focus, email, phone, availability, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [member.id, member.name, member.role, member.focus, member.email, member.phone, member.availability, member.bio],
      );
    }

    for (const bid of workspace.bids) {
      await conn.query(
        `INSERT INTO bids (
          id, title, rfp_id, agency, jurisdiction, value, value_mid, duration, bidders, due_label,
          win_probability, status, highlight, naics, set_aside, source, pinned, crm_synced, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bid.id,
          bid.title,
          bid.rfpId,
          bid.agency,
          bid.jurisdiction,
          bid.value,
          bid.valueMid,
          bid.duration,
          bid.bidders,
          bid.due,
          bid.winProbability,
          bid.status,
          bid.highlight,
          bid.naics,
          bid.setAside,
          bid.source,
          bid.pinned ? 1 : 0,
          bid.crmSynced,
          bid.createdAt,
        ],
      );
    }

    for (const member of workspace.team) {
      for (const bidId of member.assignedBidIds) {
        await conn.query("INSERT INTO team_assignments (member_id, bid_id) VALUES (?, ?)", [member.id, bidId]);
      }
    }

    for (const doc of workspace.documents) {
      await conn.query(
        "INSERT INTO bid_documents (bid_id, title, rfp_id, agency, pages, raw_text, uploaded_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [doc.bidId, doc.title, doc.rfpId, doc.agency, doc.pages, doc.rawText, doc.uploadedName ?? null],
      );
      for (let index = 0; index < doc.sections.length; index += 1) {
        const section = doc.sections[index];
        await conn.query("INSERT INTO document_sections (bid_id, sort_order, heading, body_json) VALUES (?, ?, ?, ?)", [
          doc.bidId,
          index,
          section.heading,
          JSON.stringify(section.body),
        ]);
      }
    }

    for (const item of workspace.matrix) {
      await conn.query(
        "INSERT INTO matrix_items (id, bid_id, requirement, section, owner_id, status, citation) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [item.id, item.bidId, item.requirement, item.section, item.ownerId, item.status, item.citation],
      );
    }

    for (const score of workspace.scores) {
      await conn.query("INSERT INTO go_no_go (bid_id, decision, score, updated_at) VALUES (?, ?, ?, ?)", [
        score.bidId,
        score.decision,
        score.score,
        score.updatedAt,
      ]);
      for (let index = 0; index < score.reasons.length; index += 1) {
        const reason = score.reasons[index];
        await conn.query("INSERT INTO go_no_go_reasons (bid_id, sort_order, label, score, note) VALUES (?, ?, ?, ?, ?)", [
          score.bidId,
          index,
          reason.label,
          reason.score,
          reason.note,
        ]);
      }
    }

    for (const item of workspace.proposals) {
      await conn.query(
        "INSERT INTO proposals (id, bid_id, title, volume, body, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [item.id, item.bidId, item.title, item.volume, item.body, item.status, item.updatedAt],
      );
    }

    for (const item of workspace.artifacts) {
      await conn.query(
        "INSERT INTO vault_artifacts (id, name, type, size_label, bid_id, updated_label, classification, body) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [item.id, item.name, item.type, item.size, item.bidId ?? null, item.updated, item.classification, item.body],
      );
    }

    for (const item of workspace.alerts) {
      await conn.query(
        "INSERT INTO alerts (id, title, body, href, created_at, `read`, kind) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [item.id, item.title, item.body, item.href, item.createdAt, item.read ? 1 : 0, item.kind],
      );
    }

    for (const item of workspace.leads) {
      await conn.query("INSERT INTO leads (id, name, email, kind, created_at) VALUES (?, ?, ?, ?, ?)", [
        item.id,
        item.name,
        item.email,
        item.kind,
        item.createdAt,
      ]);
    }

    for (const item of workspace.audit) {
      await conn.query("INSERT INTO audit_events (id, at, action) VALUES (?, ?, ?)", [item.id, item.at, item.action]);
    }
  });
}
