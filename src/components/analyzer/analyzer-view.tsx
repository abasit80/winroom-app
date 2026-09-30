"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Pin, Target, Upload } from "lucide-react";
import { PdfViewer } from "@/components/analyzer/pdf-viewer";
import { AiChat } from "@/components/analyzer/ai-chat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { initials } from "@/lib/workspace/selectors";
import type { BidStatus, MatrixStatus } from "@/lib/workspace/types";
import { cn } from "@/lib/utils";

const TABS = ["Document", "Matrix", "Decision", "Proposal"] as const;
const STATUSES: BidStatus[] = ["hot", "analyzing", "qualified", "watching", "submitted", "no-go"];

export function AnalyzerView({ id }: { id: string }) {
  const { workspace, act, loading } = useWorkspace();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Document");
  const [paste, setPaste] = useState("");
  const [volume, setVolume] = useState("Volume I");

  const bid = workspace?.bids.find((item) => item.id === id);
  const document = workspace?.documents.find((item) => item.bidId === id);
  const matrix = useMemo(() => workspace?.matrix.filter((item) => item.bidId === id) ?? [], [workspace, id]);
  const score = workspace?.scores.find((item) => item.bidId === id);
  const proposals = workspace?.proposals.filter((item) => item.bidId === id) ?? [];
  const connectors = workspace?.connectors ?? [];

  if (loading && !workspace) return <p className="text-sm text-slate-400">Opening analyzer…</p>;
  if (!bid) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-navy">This RFP is not on the desk.</p>
        <Link href="/dashboard" className="mt-3 inline-block text-sm text-electric">
          Back to discovery
        </Link>
      </div>
    );
  }

  async function onFile(file: File) {
    const text = await file.text();
    await act({ type: "ingestDocument", payload: { bidId: id, text, fileName: file.name } });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="masthead masthead-folio mb-4 overflow-hidden rounded-3xl border border-electric/15 p-5 shadow-glass">
        <div className="relative z-[1] flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/dashboard" className="mb-2 inline-flex items-center gap-1 text-xs text-white/70 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            RFP Discovery
          </Link>
          <h1 className="text-xl font-extrabold text-white">{bid.title}</h1>
          <p className="text-xs text-white/70">
            {bid.rfpId} · {bid.agency}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={bid.status}
            onChange={(e) => void act({ type: "setBidStatus", payload: { id: bid.id, status: e.target.value as BidStatus } })}
            className="h-9 rounded-xl border border-white/10 bg-surface px-2 text-xs"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => void act({ type: "pinBid", payload: { id: bid.id, pinned: !bid.pinned } })}>
            <Pin className="h-3.5 w-3.5" />
            {bid.pinned ? "Unpin" : "Pin to vault"}
          </Button>
          {connectors.filter((c) => c.connected).map((connector) => (
            <Button
              key={connector.id}
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => void act({ type: "syncConnector", payload: { id: connector.id, bidId: bid.id } })}
            >
              Push {connector.name}
            </Button>
          ))}
        </div>
        </div>
      </div>

      <div className="mb-4 flex gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn("flex-1 rounded-lg px-3 py-2 text-xs font-semibold", tab === item ? "bg-electric text-canvas shadow-sm" : "text-slate-500")}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="min-h-0">
          {tab === "Document" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-surface px-3 py-2 text-xs text-slate-400">
                  <Upload className="h-3.5 w-3.5" />
                  Upload .txt / .md / PDF text
                  <input
                    type="file"
                    accept=".txt,.md,.pdf,.html"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void onFile(file);
                    }}
                  />
                </label>
              </div>
              {document ? <PdfViewer document={document} /> : <p className="text-sm text-slate-400">No document yet — paste below.</p>}
              <Textarea placeholder="Or paste solicitation text and ingest…" value={paste} onChange={(e) => setPaste(e.target.value)} />
              <Button
                className="rounded-xl"
                disabled={!paste.trim()}
                onClick={() => {
                  void act({ type: "ingestDocument", payload: { bidId: bid.id, text: paste } });
                  setPaste("");
                }}
              >
                Ingest text
              </Button>
            </div>
          ) : null}

          {tab === "Matrix" ? (
            <div className="glass glass-static rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-navy">Compliance matrix</h2>
                <span className="text-[11px] text-slate-400">{matrix.length} shall-statements</span>
              </div>
              <ul className="space-y-2">
                {matrix.map((row) => (
                  <li key={row.id} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-sm text-navy">{row.requirement}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{row.citation}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(["open", "in-progress", "met", "gap"] as MatrixStatus[]).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => void act({ type: "setMatrixItem", payload: { id: row.id, status } })}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                            row.status === status ? "bg-electric text-canvas" : "bg-surface text-slate-500",
                          )}
                        >
                          {status}
                        </button>
                      ))}
                      <select
                        value={row.ownerId ?? ""}
                        onChange={(e) => void act({ type: "setMatrixItem", payload: { id: row.id, ownerId: e.target.value || null } })}
                        className="ml-auto rounded-lg border border-white/10 bg-surface px-2 py-1 text-[11px]"
                      >
                        <option value="">Unassigned</option>
                        {workspace?.team.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {tab === "Decision" ? (
            <div className="glass glass-static rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-navy">Go / No-Go</h2>
                <Button size="sm" className="rounded-xl" onClick={() => void act({ type: "runGoNoGo", payload: { bidId: bid.id } })}>
                  Recalculate
                </Button>
              </div>
              {score ? (
                <>
                  <p className="mt-4 text-4xl font-semibold text-navy">{score.score}</p>
                  <Badge tone={score.decision === "go" ? "emerald" : score.decision === "no-go" ? "rose" : "amber"} className="mt-2">
                    {score.decision}
                  </Badge>
                  <ul className="mt-4 space-y-3">
                    {score.reasons.map((reason) => (
                      <li key={reason.label}>
                        <div className="flex justify-between text-xs">
                          <span className="text-navy">{reason.label}</span>
                          <span className="text-slate-400">{reason.score}</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full bg-electric" style={{ width: `${reason.score}%` }} />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">{reason.note}</p>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No score yet. Recalculate to run the agent.</p>
              )}
            </div>
          ) : null}

          {tab === "Proposal" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {["Volume I", "Volume II", "Volume III"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setVolume(item)}
                    className={cn("rounded-full border px-3 py-1 text-xs", volume === item ? "border-electric text-electric" : "border-white/10 text-slate-500")}
                  >
                    {item}
                  </button>
                ))}
                <Button size="sm" className="rounded-xl" onClick={() => void act({ type: "generateProposal", payload: { bidId: bid.id, volume } })}>
                  Draft {volume}
                </Button>
              </div>
              {proposals.map((proposal) => (
                <article key={proposal.id} className="glass rounded-2xl p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy">{proposal.title}</p>
                    <div className="flex gap-1">
                      {(["draft", "review", "final"] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => void act({ type: "setProposalStatus", payload: { id: proposal.id, status } })}
                          className={cn("rounded-full px-2 py-0.5 text-[10px] uppercase", proposal.status === status ? "bg-electric text-canvas" : "bg-white/10 text-slate-500")}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap text-[12px] leading-relaxed text-slate-600">{proposal.body}</pre>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <div className="glass glass-static rounded-2xl p-4">
            <p className="mb-3 text-sm font-medium text-navy">Key Insights</p>
            <div className="grid grid-cols-2 gap-2">
              <Insight label="Win probability" value={`${bid.winProbability}%`} />
              <Insight label="Value" value={bid.value} />
              <Insight label="Bidders" value={String(bid.bidders)} />
              <Insight label="Due" value={bid.due} />
            </div>
            <ul className="mt-4 space-y-2.5">
              <li className="flex gap-2 text-xs text-slate-500">
                <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-electric" />
                Technical approach is 40% of the tradeoff — lead with architecture and transition risk.
              </li>
              <li className="flex gap-2 text-xs text-slate-500">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                {bid.highlight}
              </li>
              <li className="flex gap-2 text-xs text-slate-500">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                {matrix.filter((row) => row.status === "gap").length} matrix gaps · NAICS {bid.naics} · {bid.setAside}
              </li>
            </ul>
            <p className="mt-3 text-[11px] text-slate-400">
              Capture cell:{" "}
              {workspace?.team
                .filter((member) => member.assignedBidIds.includes(bid.id))
                .map((member) => initials(member.name))
                .join(" · ") || "unassigned"}
            </p>
          </div>
          <AiChat bid={bid} />
        </div>
      </div>
    </div>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-sky-50/80 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-navy">{value}</p>
    </div>
  );
}
