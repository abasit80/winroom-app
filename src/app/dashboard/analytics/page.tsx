"use client";

import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppHeader } from "@/components/dashboard/app-header";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { agencyBreakdown, pipelineWeighted } from "@/lib/workspace/selectors";

export default function AnalyticsPage() {
  const { workspace } = useWorkspace();
  const bids = workspace?.bids ?? [];
  const weighted = pipelineWeighted(bids);
  const qualified = bids.filter((bid) => bid.status === "qualified" || bid.status === "submitted").length;
  const chart = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((month, index) => ({
    month,
    pipeline: Math.round(weighted * (0.45 + index * 0.1)),
    awards: Math.max(1, qualified + index - 3),
  }));
  const agencies = agencyBreakdown(bids);

  return (
    <>
      <AppHeader title="Analytics" subtitle="Pipeline velocity, award rate, and concentration by agency — live from this desk." />
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard" className="glass glass-lift card-sheen rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400">Weighted pipeline</p>
          <p className="mt-2 text-3xl font-semibold text-navy">${weighted.toFixed(1)}M</p>
          <p className="mt-1 text-xs text-slate-400">{bids.length} live opportunities · open discovery</p>
        </Link>
        <Link href="/dashboard?q=qualified" className="glass glass-lift card-sheen rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400">Qualified / submitted</p>
          <p className="mt-2 text-3xl font-semibold text-navy">{qualified}</p>
          <p className="mt-1 text-xs text-electric">{bids.filter((b) => b.status === "no-go").length} no-go calls</p>
        </Link>
        <Link href="/dashboard/team" className="glass glass-lift card-sheen rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400">Capture cell</p>
          <p className="mt-2 text-3xl font-semibold text-navy">{workspace?.team.length ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">Open roster</p>
        </Link>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <div className="glass glass-static card-sheen rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-semibold text-navy">Pipeline vs awards</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="pipe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c6f247" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#c6f247" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(198,242,71,0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="#8b9588" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8b9588" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#101510", border: "1px solid rgba(198,242,71,0.2)", borderRadius: 12, color: "#f3f6ef" }} />
                <Area type="monotone" dataKey="pipeline" stroke="#c6f247" fill="url(#pipe)" strokeWidth={2} />
                <Area type="monotone" dataKey="awards" stroke="#86efac" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 text-sm font-semibold text-navy">Agency concentration</h2>
          <ul className="space-y-2">
            {agencies.map((row) => (
              <li key={row.agency}>
                <Link href={`/dashboard?q=${encodeURIComponent(row.agency)}`} className="block rounded-xl bg-white/5 px-3 py-2.5 hover:bg-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy">{row.agency}</span>
                    <span className="text-slate-400">${row.value.toFixed(1)}M</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{row.count} bids</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
