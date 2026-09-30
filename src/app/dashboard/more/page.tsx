"use client";

import Link from "next/link";
import { AppHeader } from "@/components/dashboard/app-header";
import { ArrowUpRight } from "lucide-react";

const LINKS = [
  { href: "/dashboard/intel", title: "Intel ingest", body: "URL + text → new RFP" },
  { href: "/dashboard/proposals", title: "Proposals", body: "AI volume drafts" },
  { href: "/dashboard/workflows", title: "Workflows", body: "Capture sprints" },
  { href: "/dashboard/connectors", title: "Connectors", body: "CRM & Slack" },
  { href: "/dashboard/analytics", title: "Analytics", body: "Pipeline charts" },
  { href: "/dashboard/settings", title: "Settings", body: "Profile & billing" },
];

export default function MorePage() {
  return (
    <>
      <AppHeader title="More" subtitle="Everything else on the capture desk." />
      <div className="grid gap-3 sm:grid-cols-2">
        {LINKS.map((item) => (
          <Link key={item.href} href={item.href} className="glass glass-lift flex items-start justify-between rounded-2xl p-4">
            <div>
              <h2 className="text-sm font-semibold text-navy">{item.title}</h2>
              <p className="mt-1 text-xs text-slate-500">{item.body}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-400" />
          </Link>
        ))}
      </div>
    </>
  );
}
