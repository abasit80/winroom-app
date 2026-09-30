"use client";

import Link from "next/link";
import { ArrowUpRight, Bot, FileSearch, Gauge, Library, Shield } from "lucide-react";
import { TiltCard } from "@/components/ui/tilt-card";
import { BIDS } from "@/lib/mock/bids";
import { VAULT_ARTIFACTS } from "@/lib/mock/vault";

const agencies = Array.from(new Set(BIDS.map((bid) => bid.agency)));
const weighted = BIDS.reduce((sum, bid) => sum + bid.winProbability, 0) / BIDS.length;

export const FEATURES = [
  {
    href: "/dashboard/analyzer/it-infra",
    icon: FileSearch,
    title: "RFP Analyzer",
    body: "Open a solicitation beside a copilot that extracts requirements, dates, and evaluation weights.",
    stat: `${BIDS.length} live RFPs · ${BIDS[0].rfpId} ready`,
  },
  {
    href: "/dashboard",
    icon: Shield,
    title: "Contract intelligence",
    body: "Trace incumbents, vehicles, and award history across DoD, civilian, state, and municipal buyers.",
    stat: `${agencies.length} agencies in orbit · ${BIDS.reduce((n, bid) => n + bid.bidders, 0)} known bidders`,
  },
  {
    href: "/dashboard",
    icon: Gauge,
    title: "Bid desk scoring",
    body: "Rank live opportunities by fit, value, and competitive pressure before you staff a capture team.",
    stat: `${Math.round(weighted)}% avg win prob · $46M weighted pipeline`,
  },
  {
    href: "/dashboard/vault",
    extraHref: "/dashboard/analytics",
    extraLabel: "Open analytics",
    icon: Library,
    title: "Vault & analytics",
    body: "Keep past volumes, control matrices, and win-rate trends in one bright glass workspace.",
    stat: `${VAULT_ARTIFACTS.length} artifacts pinned · win-rate on Analytics`,
  },
  {
    href: "/dashboard/automation",
    extraHref: "/pricing",
    extraLabel: "See pricing",
    icon: Bot,
    title: "AI automation",
    body: "Nightly SAM discovery, deadline watcher, auto-analyze, and CRM push — run from the desk.",
    stat: "4 agents · workflows that actually mutate the pipeline",
  },
];

export function Features() {
  return (
    <section id="features" className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Platform</p>
      <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight text-navy md:text-3xl">
        More than a landing page — the full capture desk
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
        Discovery, analyzer, vault, analytics, and team — one theme from first visit to a live RFP.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((item) => {
          const Icon = item.icon;
          return (
            <TiltCard key={item.title} intensity={6}>
              <div className="glass glass-lift card-sheen group rounded-2xl p-5">
                <Link href={item.href} className="block">
                  <Icon className="mb-3 h-5 w-5 text-electric" />
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-navy">{item.title}</h3>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-electric" />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
                  <p className="mt-3 text-[11px] text-electric/80">{item.stat}</p>
                </Link>
                {"extraHref" in item && item.extraHref ? (
                  <Link
                    href={item.extraHref}
                    className="mt-3 inline-flex text-[11px] text-slate-500 hover:text-electric"
                  >
                    {item.extraLabel} →
                  </Link>
                ) : null}
              </div>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}
