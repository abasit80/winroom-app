"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Flame, ArrowUpRight, Plus, Radar } from "lucide-react";
import { TiltCard } from "@/components/ui/tilt-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Bid, BidStatus } from "@/lib/workspace/types";
import { pipelineWeighted } from "@/lib/workspace/selectors";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { cn } from "@/lib/utils";

const toneMap: Record<BidStatus, "hot" | "amber" | "indigo" | "emerald" | "slate" | "rose"> = {
  hot: "hot",
  due: "amber",
  analyzing: "indigo",
  qualified: "emerald",
  watching: "slate",
  "no-go": "rose",
  submitted: "emerald",
};

const FILTERS: { id: "all" | BidStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "hot", label: "Hot" },
  { id: "analyzing", label: "Analyzing" },
  { id: "qualified", label: "Go" },
  { id: "due", label: "Due soon" },
  { id: "watching", label: "Watching" },
  { id: "no-go", label: "No-go" },
];

export function BidGrid({ query = "" }: { query?: string }) {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const { workspace, act, loading } = useWorkspace();
  const [filter, setFilter] = useState<"all" | BidStatus>("all");
  const [open, setOpen] = useState(false);

  const bids = workspace?.bids ?? [];
  const needle = (query || urlQuery).trim().toLowerCase();

  const visible = useMemo(() => {
    return bids.filter((bid) => {
      if (filter !== "all" && bid.status !== filter) return false;
      if (!needle) return true;
      return [bid.title, bid.rfpId, bid.agency, bid.naics, bid.setAside, bid.jurisdiction].join(" ").toLowerCase().includes(needle);
    });
  }, [bids, filter, needle]);

  const featured = visible[0] ?? bids[0];
  const rest = featured ? visible.filter((bid) => bid.id !== featured.id) : visible;
  const weighted = pipelineWeighted(bids);

  if (loading && !workspace) {
    return <p className="text-sm text-slate-400">Loading the capture desk…</p>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-medium",
              filter === item.id ? "border-electric bg-electric/10 text-electric" : "border-white/10 text-slate-500 hover:text-navy",
            )}
          >
            {item.label}
          </button>
        ))}
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => void act({ type: "runDiscovery" })}>
            <Radar className="h-3.5 w-3.5" />
            Run SAM discovery
          </Button>
          <Button size="sm" className="rounded-xl" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add RFP
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {featured ? <FeaturedCard bid={featured} /> : null}
        <div className="grid gap-4 md:col-span-4">
          <div className="glass glass-lift card-sheen rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Pipeline</p>
            <p className="mt-2 text-3xl font-semibold text-navy">${weighted.toFixed(1)}M</p>
            <p className="mt-1 text-xs text-slate-400">Weighted value across {bids.length} active bids</p>
          </div>
          <div className="glass glass-lift card-sheen rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">This desk</p>
            <p className="mt-2 text-3xl font-semibold text-navy">
              {bids.length ? Math.round(bids.reduce((sum, bid) => sum + bid.winProbability, 0) / bids.length) : 0}%
            </p>
            <p className="mt-1 text-xs text-electric">Avg win probability · {visible.length} shown</p>
          </div>
        </div>
        {rest.map((bid, index) => (
          <motion.div
            key={bid.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * index }}
            className={cn(index < 2 ? "md:col-span-6" : "md:col-span-4")}
          >
            <BidCard bid={bid} />
          </motion.div>
        ))}
      </div>

      {open ? <AddRfpDialog onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

function FeaturedCard({ bid }: { bid: Bid }) {
  return (
    <TiltCard className="md:col-span-8">
      <Link href={`/dashboard/analyzer/${bid.id}`} className="block">
        <article className="glass glass-lift card-sheen relative overflow-hidden rounded-2xl p-6 shadow-glow">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-electric/20 blur-3xl" />
          <div className="mb-4 flex items-center justify-between">
            <Badge tone="hot" className="gap-1">
              <Flame className="h-3 w-3" />
              {bid.status}
            </Badge>
            <span className="text-xs text-slate-400">Due {bid.due}</span>
          </div>
          <h2 className="text-2xl font-semibold text-navy">{bid.title}</h2>
          <p className="mt-1 font-mono text-xs text-slate-400">{bid.rfpId}</p>
          <p className="mt-3 text-sm text-slate-500">
            {bid.agency} · {bid.jurisdiction}
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
            <Meta label="Estimated Value" value={bid.value} />
            <Meta label="Duration" value={bid.duration} />
            <Meta label="Win probability" value={`${bid.winProbability}%`} />
          </div>
          <div className="mt-4 rounded-lg bg-electric/15 px-3 py-2.5 text-xs text-electric">{bid.highlight}</div>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            Open in RFP Analyzer
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </article>
      </Link>
    </TiltCard>
  );
}

function BidCard({ bid }: { bid: Bid }) {
  return (
    <TiltCard intensity={6}>
      <Link href={`/dashboard/analyzer/${bid.id}`} className="block h-full">
        <article className="glass glass-lift card-sheen flex h-full flex-col rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <Badge tone={toneMap[bid.status]}>{bid.status}</Badge>
            <span className="text-[11px] text-slate-400">{bid.bidders} bidders</span>
          </div>
          <h3 className="text-base font-semibold text-navy">{bid.title}</h3>
          <p className="mt-1 text-xs text-slate-500">{bid.agency}</p>
          <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
            <Meta label="Value" value={bid.value} />
            <Meta label="Due" value={bid.due} />
          </div>
        </article>
      </Link>
    </TiltCard>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-navy">{value}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  );
}

function AddRfpDialog({ onClose }: { onClose: () => void }) {
  const { act } = useWorkspace();
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [agency, setAgency] = useState("");
  const [rfpId, setRfpId] = useState("");
  const [value, setValue] = useState("");
  const [due, setDue] = useState("");
  const [naics, setNaics] = useState("541512");
  const [text, setText] = useState("");

  async function submit() {
    setPending(true);
    const result = await act({
      type: "createBid",
      payload: { title, agency, rfpId, value, due, naics, text },
    });
    setPending(false);
    if (result) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div className="glass glass-static max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 shadow-glass" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-navy">Add an RFP</h2>
        <p className="mt-1 text-sm text-slate-500">Paste the solicitation or just the cover facts — Winroom will build the matrix.</p>
        <div className="mt-4 space-y-3">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Agency" value={agency} onChange={(e) => setAgency(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="RFP ID" value={rfpId} onChange={(e) => setRfpId(e.target.value)} />
            <Input placeholder="Value e.g. $4M – $8M" value={value} onChange={(e) => setValue(e.target.value)} />
            <Input placeholder="Due date" value={due} onChange={(e) => setDue(e.target.value)} />
            <Input placeholder="NAICS" value={naics} onChange={(e) => setNaics(e.target.value)} />
          </div>
          <Textarea placeholder="Paste solicitation text (optional)" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" disabled={pending || !title || !agency} onClick={() => void submit()}>
              {pending ? "Ingesting…" : "Add to desk"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
