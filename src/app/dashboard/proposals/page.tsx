"use client";

import Link from "next/link";
import { AppHeader } from "@/components/dashboard/app-header";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { cn } from "@/lib/utils";

export default function ProposalsPage() {
  const { workspace, act } = useWorkspace();
  const proposals = workspace?.proposals ?? [];
  const top = workspace?.bids[0];

  return (
    <>
      <AppHeader title="Proposals" subtitle="AI-drafted volumes, color-review ready. Promote a draft to review or final." />
      <div className="mb-4 flex flex-wrap gap-2">
        {top ? (
          <>
            <Button size="sm" className="rounded-xl" onClick={() => void act({ type: "generateProposal", payload: { bidId: top.id, volume: "Volume I" } })}>
              Draft Volume I for {top.rfpId}
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => void act({ type: "generateProposal", payload: { bidId: top.id, volume: "Volume II" } })}>
              Volume II
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => void act({ type: "generateProposal", payload: { bidId: top.id, volume: "Volume III" } })}>
              Volume III
            </Button>
          </>
        ) : null}
      </div>
      <div className="grid gap-4">
        {proposals.length ? (
          proposals.map((proposal) => (
            <article key={proposal.id} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-navy">{proposal.title}</h2>
                  <p className="text-[11px] text-slate-400">
                    {proposal.volume} · {new Date(proposal.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  {(["draft", "review", "final"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => void act({ type: "setProposalStatus", payload: { id: proposal.id, status } })}
                      className={cn("rounded-full px-2 py-0.5 text-[10px] uppercase", proposal.status === status ? "bg-electric text-white" : "bg-slate-100 text-slate-500")}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap text-[12px] text-slate-600">{proposal.body}</pre>
              <Link href={`/dashboard/analyzer/${proposal.bidId}`} className="mt-3 inline-block text-xs text-electric">
                Open analyzer →
              </Link>
            </article>
          ))
        ) : (
          <p className="glass rounded-2xl p-8 text-center text-sm text-slate-400">No drafts yet. Generate a volume from an RFP.</p>
        )}
      </div>
    </>
  );
}
