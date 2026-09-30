"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { WinroomLogo } from "@/components/brand/logo";
import { SiteFooter } from "@/components/landing/site-footer";
import { PageFx } from "@/components/visuals/page-fx";
import { Button } from "@/components/ui/button";
import { PLAN_META } from "@/lib/workspace/selectors";
import type { PlanId } from "@/lib/workspace/types";

const DETAILS: Record<PlanId, string[]> = {
  pilot: ["1 workspace", "10 RFPs / month", "Copilot + matrix", "Email alerts"],
  desk: ["Team seats", "Live SAM discovery", "Go/No-Go agent", "CRM + Slack sync", "Proposal drafts"],
  enterprise: ["SSO-ready roles", "Custom agents", "SharePoint vault", "Dedicated capture graph", "Priority desk"],
};

export default function PricingPage() {
  const router = useRouter();
  const plans = Object.entries(PLAN_META) as [PlanId, (typeof PLAN_META)[PlanId]][];

  return (
    <div className="relative min-h-screen bg-canvas">
      <PageFx />
      <div className="relative z-10">
        <header className="sticky top-3 z-30 mx-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3 shadow-glass backdrop-blur-xl md:mx-8 md:px-6">
          <Link href="/">
            <WinroomLogo size="lg" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-400 hover:text-navy">
              Home
            </Link>
            <Link href="/login" className="text-sm text-slate-400 hover:text-navy">
              Log in
            </Link>
            <Button variant="early" size="sm" className="h-9 rounded-xl px-4" onClick={() => router.push("/signup")}>
              Sign up
            </Button>
          </div>
        </header>
        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
          <p className="font-brand text-xs font-bold uppercase tracking-[0.22em] text-electric">Winroom pricing</p>
          <h1 className="mt-2 max-w-xl font-display text-3xl font-extrabold text-navy">Pick a desk. Start capturing this week.</h1>
          <p className="mt-3 max-w-xl text-sm text-slate-500">Every plan includes the analyzer. Upgrade when the cell needs discovery automation and CRM push.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {plans.map(([id, meta]) => (
              <article key={id} className="glass rounded-2xl p-6">
                <p className="text-xs uppercase tracking-wider text-electric">{meta.label}</p>
                <p className="mt-2 text-3xl font-semibold text-navy">{meta.price}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {meta.seats} seats · {meta.quota} RFPs
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-500">
                  {DETAILS[id].map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
                <Button className="mt-6 w-full rounded-xl" onClick={() => router.push("/signup?next=/dashboard/settings")}>
                  Start {meta.label}
                </Button>
              </article>
            ))}
          </div>
        </section>
        <SiteFooter />
      </div>
    </div>
  );
}
