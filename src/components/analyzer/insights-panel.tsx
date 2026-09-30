import { AlertTriangle, CheckCircle2, Target } from "lucide-react";
import type { Bid } from "@/lib/mock/bids";

export function InsightsPanel({ bid }: { bid: Bid }) {
  return (
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
          Compliance flags: NIST 800-53 Rev. 5, NAICS {bid.naics}, {bid.setAside}.
        </li>
      </ul>
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
