"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { OrbitVisual } from "@/components/visuals/orbit-visual";
import { useWorkspace } from "@/components/workspace/workspace-provider";

const INNER = [
  { id: "sam", label: "SAM.gov", mark: "SAM", accent: "#3b82f6" },
  { id: "fpds", label: "FPDS", mark: "FP", accent: "#60a5fa" },
  { id: "crm", label: "CRM sync", mark: "CRM", accent: "#34d399" },
  { id: "vault", label: "Vault", mark: "V", accent: "#c4b5fd" },
];

export function OrbitCommand() {
  const { workspace } = useWorkspace();
  const bids = workspace?.bids ?? [];
  const [selectedId, setSelectedId] = useState(bids[0]?.id ?? "");
  const selected = bids.find((bid) => bid.id === selectedId) ?? bids[0];

  if (!selected) return null;

  const outer = bids.slice(0, 8).map((bid) => ({
    id: bid.id,
    label: bid.title,
    mark: bid.agency
      .split(" ")
      .filter((word) => word[0] === word[0]?.toUpperCase())
      .slice(0, 3)
      .map((word) => word[0])
      .join(""),
    accent:
      bid.status === "hot" ? "#fb923c" : bid.status === "due" ? "#fbbf24" : bid.status === "qualified" ? "#34d399" : "#60a5fa",
  }));

  return (
    <section className="glass glass-static card-sheen mb-6 overflow-hidden rounded-2xl border-sky-200/80 p-4 md:p-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Live orbit</p>
          <h2 className="mt-1 text-lg font-semibold text-navy">Opportunities circling the capture core</h2>
        </div>
        <p className="text-xs text-slate-400">{bids.length} bids in motion</p>
      </div>
      <div className="grid items-center gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
        <div className="w-full max-w-[440px] justify-self-center">
          <OrbitVisual
            inner={INNER}
            outer={outer}
            size={440}
            caption="Capture core"
            selectedId={selected.id}
            onSelect={setSelectedId}
          />
        </div>
        <article className="rounded-2xl border border-electric/20 bg-surface/80 p-5 shadow-glass">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Selected node</p>
          <h3 className="mt-2 text-xl font-semibold text-navy">{selected.title}</h3>
          <p className="mt-1 font-mono text-xs text-slate-400">{selected.rfpId}</p>
          <p className="mt-3 text-sm text-slate-500">
            {selected.agency} · {selected.jurisdiction}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Meta label="Value" value={selected.value} />
            <Meta label="Win prob." value={`${selected.winProbability}%`} />
            <Meta label="Due" value={selected.due} />
            <Meta label="Bidders" value={String(selected.bidders)} />
          </div>
          <p className="mt-4 rounded-lg bg-electric/15 px-3 py-2 text-xs text-electric">{selected.highlight}</p>
          <Link
            href={`/dashboard/analyzer/${selected.id}`}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-navy hover:text-electric"
          >
            Open in RFP Analyzer
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </article>
      </div>
    </section>
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
