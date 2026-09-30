import { loadWorkspace, saveWorkspace } from "@/lib/db/workspace";
import type { Bid, CreateBidInput, Workspace, WorkspaceAction } from "./types";
import { buildSeedWorkspace, SAM_FEED } from "./seed";
import { alert, audit, documentFromBid, documentFromText, matrixFromDocument, nid, nowIso, prettyDate, valueMidFromRange } from "./helpers";
import { draftProposal, polishWithLlm, scoreGoNoGo } from "./engine";
import { PLAN_META } from "./selectors";

async function save(workspace: Workspace) {
  await saveWorkspace(workspace);
}

export async function getWorkspace(): Promise<Workspace> {
  const existing = await loadWorkspace();
  if (existing?.bids?.length) return existing;
  const seed = buildSeedWorkspace();
  await save(seed);
  return seed;
}

export async function resetWorkspace() {
  const seed = buildSeedWorkspace();
  await save(seed);
  return seed;
}

function pushAudit(workspace: Workspace, action: string) {
  workspace.audit = [audit(action), ...workspace.audit].slice(0, 80);
}

function findBid(workspace: Workspace, id: string) {
  return workspace.bids.find((bid) => bid.id === id);
}

function makeBid(input: CreateBidInput): Bid {
  const value = input.value || "$1M – $3M";
  return {
    id: nid("bid"),
    title: input.title.trim(),
    rfpId: input.rfpId?.trim() || `RFP-${new Date().getFullYear()}-${nid("X").slice(-4).toUpperCase()}`,
    agency: input.agency.trim(),
    jurisdiction: input.jurisdiction || "Federal Government",
    value,
    valueMid: valueMidFromRange(value),
    duration: input.duration || "3 years",
    bidders: 6,
    due: input.due || prettyDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString()),
    winProbability: 52,
    status: "analyzing",
    highlight: input.highlight || "Ingested by the capture desk. Run go/no-go next.",
    naics: input.naics || "541512",
    setAside: input.setAside || "Unrestricted",
    source: "upload",
    pinned: true,
    crmSynced: null,
    createdAt: nowIso(),
  };
}

function ingestOntoBid(workspace: Workspace, bid: Bid, text?: string, fileName?: string) {
  const document = text?.trim() ? documentFromText(bid, text, fileName) : documentFromBid(bid, text);
  workspace.documents = workspace.documents.filter((item) => item.bidId !== bid.id).concat(document);
  const matrix = matrixFromDocument(bid, document);
  workspace.matrix = workspace.matrix.filter((item) => item.bidId !== bid.id).concat(matrix);
  workspace.scores = workspace.scores.filter((item) => item.bidId !== bid.id).concat(scoreGoNoGo(bid, workspace.profile, matrix));
  return document;
}

export async function applyAction(action: WorkspaceAction): Promise<{ workspace: Workspace; message: string }> {
  const workspace = await getWorkspace();
  let message = "Updated.";

  switch (action.type) {
    case "markAlertRead": {
      const item = workspace.alerts.find((alertItem) => alertItem.id === action.payload.id);
      if (item) item.read = true;
      message = "Alert marked read.";
      break;
    }
    case "markAllAlertsRead": {
      workspace.alerts.forEach((item) => {
        item.read = true;
      });
      message = "All alerts cleared.";
      break;
    }
    case "pinBid": {
      const bid = findBid(workspace, action.payload.id);
      if (bid) bid.pinned = action.payload.pinned;
      message = action.payload.pinned ? "Pinned in Vault." : "Unpinned from Vault.";
      break;
    }
    case "setBidStatus": {
      const bid = findBid(workspace, action.payload.id);
      if (bid) {
        bid.status = action.payload.status;
        if (action.payload.status === "no-go") bid.winProbability = Math.min(bid.winProbability, 28);
        if (action.payload.status === "qualified") bid.winProbability = Math.max(bid.winProbability, 62);
        if (action.payload.status === "submitted") bid.winProbability = Math.max(bid.winProbability, 70);
        pushAudit(workspace, `${bid.rfpId} moved to ${action.payload.status}.`);
        message = `${bid.rfpId} is now ${action.payload.status}.`;
      }
      break;
    }
    case "createBid": {
      const bid = makeBid(action.payload);
      workspace.bids.unshift(bid);
      ingestOntoBid(workspace, bid, action.payload.text);
      workspace.billing.rfpsUsed += 1;
      workspace.alerts.unshift(
        alert({
          title: "RFP ingested",
          body: `${bid.title} is in the analyzer with a compliance matrix.`,
          href: `/dashboard/analyzer/${bid.id}`,
          kind: "discovery",
        }),
      );
      pushAudit(workspace, `Created ${bid.rfpId}.`);
      message = `${bid.rfpId} added to the desk.`;
      break;
    }
    case "ingestDocument": {
      const bid = findBid(workspace, action.payload.bidId);
      if (bid) {
        ingestOntoBid(workspace, bid, action.payload.text, action.payload.fileName);
        bid.status = "analyzing";
        bid.highlight = `Document refreshed${action.payload.fileName ? ` from ${action.payload.fileName}` : ""}.`;
        pushAudit(workspace, `Ingested document for ${bid.rfpId}.`);
        message = "Solicitation parsed. Matrix rebuilt.";
      }
      break;
    }
    case "setMatrixItem": {
      const item = workspace.matrix.find((row) => row.id === action.payload.id);
      if (item) {
        if (action.payload.status) item.status = action.payload.status;
        if (action.payload.ownerId !== undefined) item.ownerId = action.payload.ownerId;
        message = "Matrix updated.";
      }
      break;
    }
    case "runGoNoGo": {
      const bid = findBid(workspace, action.payload.bidId);
      if (bid) {
        const next = scoreGoNoGo(bid, workspace.profile, workspace.matrix);
        const polished = await polishWithLlm(
          "You are a federal capture lead. Return 4 short reason notes, one per line, no bullets.",
          `${bid.title} ${bid.agency} NAICS ${bid.naics} ${bid.setAside} ${bid.bidders} bidders. Company: ${workspace.profile.name} codes ${workspace.profile.naics.join(",")}.`,
        );
        if (polished) {
          const lines = polished.split("\n").map((line) => line.replace(/^[-*•\d.]+\s*/, "").trim()).filter(Boolean);
          next.reasons = next.reasons.map((reason, index) => ({ ...reason, note: lines[index] || reason.note }));
        }
        workspace.scores = workspace.scores.filter((item) => item.bidId !== bid.id).concat(next);
        bid.winProbability = next.score;
        if (next.decision === "go") bid.status = "qualified";
        if (next.decision === "no-go") bid.status = "no-go";
        pushAudit(workspace, `Go/No-Go for ${bid.rfpId}: ${next.decision} (${next.score}).`);
        message = `Decision: ${next.decision.toUpperCase()} · ${next.score}`;
      }
      break;
    }
    case "generateProposal": {
      const bid = findBid(workspace, action.payload.bidId);
      if (bid) {
        const volume = action.payload.volume || "Volume I";
        const draft = draftProposal(bid, workspace, volume);
        const polished = await polishWithLlm(
          `You are Winroom. Write a concise ${volume} draft for a federal proposal. Keep headings. No fluff.`,
          draft.body,
        );
        if (polished) draft.body = polished;
        workspace.proposals.unshift(draft);
        workspace.artifacts.unshift({
          id: nid("file"),
          name: draft.title,
          type: "TXT",
          size: `${Math.max(1, Math.round(draft.body.length / 900))} KB`,
          bidId: bid.id,
          updated: prettyDate(),
          classification: "Internal",
          body: draft.body,
        });
        pushAudit(workspace, `Drafted ${draft.volume} for ${bid.rfpId}.`);
        message = `${draft.volume} drafted and saved to Vault.`;
      }
      break;
    }
    case "setProposalStatus": {
      const proposal = workspace.proposals.find((item) => item.id === action.payload.id);
      if (proposal) {
        proposal.status = action.payload.status;
        proposal.updatedAt = nowIso();
        message = `Proposal marked ${action.payload.status}.`;
      }
      break;
    }
    case "assignMember": {
      const member = workspace.team.find((item) => item.id === action.payload.memberId);
      if (member) {
        const has = member.assignedBidIds.includes(action.payload.bidId);
        member.assignedBidIds = has
          ? member.assignedBidIds.filter((id) => id !== action.payload.bidId)
          : [...member.assignedBidIds, action.payload.bidId];
        message = has ? "Removed from capture cell." : "Assigned to capture cell.";
      }
      break;
    }
    case "addMember": {
      workspace.team.push({
        id: nid("tm"),
        name: action.payload.name.trim(),
        role: action.payload.role.trim() || "Capture Specialist",
        focus: action.payload.focus?.trim() || "General",
        email: action.payload.email.trim(),
        phone: "+1 (202) 555-0100",
        availability: "available",
        assignedBidIds: [],
        bio: "Added from the capture desk roster.",
      });
      pushAudit(workspace, `Added teammate ${action.payload.name}.`);
      message = `${action.payload.name} joined the desk.`;
      break;
    }
    case "setAvailability": {
      const member = workspace.team.find((item) => item.id === action.payload.memberId);
      if (member) member.availability = action.payload.availability;
      message = "Availability updated.";
      break;
    }
    case "runDiscovery": {
      const existing = new Set(workspace.bids.map((bid) => bid.id));
      const profile = workspace.profile;
      const incoming = SAM_FEED.filter((item) => {
        if (existing.has(item.id)) return false;
        const hay = `${item.title} ${item.highlight} ${item.agency}`.toLowerCase();
        return (
          profile.naics.includes(item.naics) ||
          profile.keywords.some((word) => hay.includes(word.toLowerCase()))
        );
      }).map((item) => ({ ...item, createdAt: nowIso(), id: item.id }));

      if (!incoming.length) {
        const variant = {
          ...SAM_FEED[Math.floor(Math.random() * SAM_FEED.length)],
          id: nid("sam"),
          rfpId: `RFP-${new Date().getFullYear()}-${nid("S").slice(-4).toUpperCase()}`,
          createdAt: nowIso(),
          highlight: "Refreshed from SAM.gov match against your capability profile.",
        };
        incoming.push(variant);
      }

      for (const bid of incoming) {
        workspace.bids.unshift(bid);
        ingestOntoBid(workspace, bid);
        workspace.billing.rfpsUsed += 1;
      }
      workspace.alerts.unshift(
        alert({
          title: `${incoming.length} new SAM.gov matches`,
          body: incoming.map((bid) => bid.rfpId).join(", "),
          href: "/dashboard",
          kind: "discovery",
        }),
      );
      const job = workspace.automations.find((item) => item.id === "discovery");
      if (job) {
        job.lastRun = nowIso();
        job.lastResult = `${incoming.length} notices scored`;
      }
      pushAudit(workspace, `Discovery pulled ${incoming.length} opportunities.`);
      message = `${incoming.length} opportunities added from SAM.gov.`;
      break;
    }
    case "toggleAutomation": {
      const job = workspace.automations.find((item) => item.id === action.payload.id);
      if (job) {
        job.enabled = !job.enabled;
        message = `${job.name} ${job.enabled ? "enabled" : "paused"}.`;
      }
      break;
    }
    case "runAutomation": {
      const job = workspace.automations.find((item) => item.id === action.payload.id);
      if (!job) break;
      job.lastRun = nowIso();
      if (action.payload.id === "discovery") {
        return applyAction({ type: "runDiscovery" });
      }
      if (action.payload.id === "deadlines") {
        const soon = workspace.bids.filter((bid) => bid.status !== "no-go" && bid.status !== "submitted");
        soon.slice(0, 3).forEach((bid) => {
          workspace.alerts.unshift(
            alert({
              title: `Deadline · ${bid.rfpId}`,
              body: `${bid.title} is due ${bid.due}.`,
              href: `/dashboard/analyzer/${bid.id}`,
              kind: "deadline",
            }),
          );
        });
        job.lastResult = `${soon.length} live bids watched`;
        message = "Deadline watcher ran.";
      } else if (action.payload.id === "analyze") {
        const target = workspace.bids.find((bid) => !workspace.scores.some((score) => score.bidId === bid.id));
        if (target) {
          ingestOntoBid(workspace, target);
          job.lastResult = `Analyzed ${target.rfpId}`;
          message = `Auto-analyzed ${target.rfpId}.`;
        } else {
          job.lastResult = "All bids already analyzed";
          message = "Every bid already has a matrix and score.";
        }
      } else if (action.payload.id === "crm") {
        const connected = workspace.connectors.find((item) => item.connected);
        const qualified = workspace.bids.filter((bid) => bid.status === "qualified" || bid.status === "hot");
        if (connected) {
          qualified.forEach((bid) => {
            bid.crmSynced = connected.id;
          });
          connected.lastSync = nowIso();
          connected.lastCount = qualified.length;
          job.lastResult = `Pushed ${qualified.length} to ${connected.name}`;
          message = `Pushed ${qualified.length} bids to ${connected.name}.`;
        } else {
          job.lastResult = "No CRM connected";
          message = "Connect a CRM first.";
        }
      }
      break;
    }
    case "connectConnector": {
      const connector = workspace.connectors.find((item) => item.id === action.payload.id);
      if (connector) {
        connector.connected = true;
        if (action.payload.webhook) connector.webhook = action.payload.webhook;
        message = `${connector.name} connected.`;
        pushAudit(workspace, `Connected ${connector.name}.`);
      }
      break;
    }
    case "disconnectConnector": {
      const connector = workspace.connectors.find((item) => item.id === action.payload.id);
      if (connector) {
        connector.connected = false;
        message = `${connector.name} disconnected.`;
      }
      break;
    }
    case "syncConnector": {
      const connector = workspace.connectors.find((item) => item.id === action.payload.id);
      if (connector) {
        if (!connector.connected) {
          connector.connected = true;
        }
        const bids = action.payload.bidId
          ? workspace.bids.filter((bid) => bid.id === action.payload.bidId)
          : workspace.bids.filter((bid) => bid.status === "hot" || bid.status === "qualified");
        bids.forEach((bid) => {
          bid.crmSynced = connector.id;
        });
        connector.lastSync = nowIso();
        connector.lastCount = bids.length;
        workspace.alerts.unshift(
          alert({
            title: `${connector.name} sync`,
            body: `${bids.length} opportunities pushed to ${connector.name}.`,
            href: "/dashboard/connectors",
            kind: "sync",
          }),
        );
        pushAudit(workspace, `Synced ${bids.length} rows to ${connector.name}.`);
        message = `${bids.length} records sent to ${connector.name}.`;
      }
      break;
    }
    case "updateProfile": {
      workspace.profile = {
        ...workspace.profile,
        ...action.payload,
        naics: action.payload.naics ?? workspace.profile.naics,
        vehicles: action.payload.vehicles ?? workspace.profile.vehicles,
        geos: action.payload.geos ?? workspace.profile.geos,
        keywords: action.payload.keywords ?? workspace.profile.keywords,
      };
      pushAudit(workspace, "Capability profile updated.");
      message = "Capability profile saved.";
      break;
    }
    case "changePlan": {
      const meta = PLAN_META[action.payload.plan];
      workspace.billing = {
        plan: action.payload.plan,
        seats: meta.seats,
        rfpQuota: meta.quota,
        rfpsUsed: workspace.billing.rfpsUsed,
      };
      pushAudit(workspace, `Plan set to ${meta.label}.`);
      message = `You are on ${meta.label}.`;
      break;
    }
    case "addArtifact": {
      workspace.artifacts.unshift({
        id: nid("file"),
        name: action.payload.name.trim(),
        type: action.payload.type,
        size: `${Math.max(1, Math.round(action.payload.body.length / 900))} KB`,
        bidId: action.payload.bidId,
        updated: prettyDate(),
        classification: "Internal",
        body: action.payload.body,
      });
      message = "Artifact stored in Vault.";
      break;
    }
    case "runWorkflow": {
      const flow = workspace.workflows.find((item) => item.id === action.payload.id);
      if (flow) {
        flow.status = "done";
        flow.nodes = flow.nodes.map((node) => ({ ...node, status: "done" }));
        if (flow.id === "sprint") {
          await applyInner(workspace, { type: "runDiscovery" });
          const top = workspace.bids[0];
          if (top) {
            workspace.scores = workspace.scores.filter((item) => item.bidId !== top.id).concat(scoreGoNoGo(top, workspace.profile, workspace.matrix));
            const lead = workspace.team.find((member) => member.role.toLowerCase().includes("capture")) ?? workspace.team[0];
            if (lead && !lead.assignedBidIds.includes(top.id)) lead.assignedBidIds.push(top.id);
            const draft = draftProposal(top, workspace, "Volume I");
            workspace.proposals.unshift(draft);
            const crm = workspace.connectors.find((item) => item.connected);
            if (crm) top.crmSynced = crm.id;
          }
        }
        if (flow.id === "color") {
          const bid = workspace.bids[0];
          if (bid) {
            ingestOntoBid(workspace, bid);
            const draft = draftProposal(bid, workspace, "Volume I");
            workspace.proposals.unshift(draft);
            workspace.artifacts.unshift({
              id: nid("file"),
              name: `Color review — ${bid.rfpId}`,
              type: "TXT",
              size: "4 KB",
              bidId: bid.id,
              updated: prettyDate(),
              classification: "Internal",
              body: draft.body,
            });
          }
        }
        pushAudit(workspace, `Workflow “${flow.name}” completed.`);
        message = `${flow.name} finished. Open proposals and vault for outputs.`;
      }
      break;
    }
    case "saveLead": {
      workspace.leads.unshift({
        id: nid("lead"),
        name: action.payload.name.trim(),
        email: action.payload.email.trim(),
        kind: action.payload.kind,
        createdAt: nowIso(),
      });
      pushAudit(workspace, `Lead ${action.payload.email} (${action.payload.kind}).`);
      message = "Request received. We’ll route it to the capture desk.";
      break;
    }
    default:
      message = "Nothing changed.";
  }

  await save(workspace);
  return { workspace, message };
}

async function applyInner(workspace: Workspace, action: WorkspaceAction) {
  await save(workspace);
  const result = await applyAction(action);
  Object.assign(workspace, result.workspace);
}

export async function documentForBid(bidId: string) {
  const workspace = await getWorkspace();
  return workspace.documents.find((item) => item.bidId === bidId) ?? null;
}
