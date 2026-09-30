"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronDown, Mail, Sparkles } from "lucide-react";
import { BrandWord, WinroomLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { LeadDialog } from "@/components/landing/lead-dialog";
import { cn } from "@/lib/utils";

const SOLUTIONS = [
  {
    href: "/dashboard/analyzer/it-infra",
    title: "RFP Analyzer",
    body: "Read every page, extract requirements, and draft a win strategy.",
  },
  {
    href: "/dashboard",
    title: "Contract Intelligence",
    body: "Trace incumbents, vehicles, and award history across agencies.",
  },
  {
    href: "/dashboard",
    title: "Bid Desk",
    body: "Score opportunities, assign capture teams, and track deadlines.",
  },
  {
    href: "/dashboard/vault",
    title: "Vault & analytics",
    body: "Pinned RFPs, proposal artifacts, and win-rate trends.",
  },
];

export function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lead, setLead] = useState<"contact" | "demo" | null>(null);

  return (
    <>
      <header className="sticky top-3 z-30 mx-4 relative flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3 shadow-glass backdrop-blur-xl md:mx-8 md:px-6">
        <Link href="/" className="relative z-10">
          <WinroomLogo size="lg" />
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-slate-400 transition hover:text-navy">
            Features
          </a>
          <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
          <button className="flex items-center gap-1 text-sm text-slate-400 transition hover:text-navy">
            Solutions
            <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
          </button>
          <AnimatePresence>
            {open ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="glass glass-static absolute left-1/2 top-full z-40 mt-3 w-[340px] -translate-x-1/2 rounded-2xl p-2 shadow-glass"
              >
                {SOLUTIONS.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => router.push(item.href)}
                    className="w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-white/5"
                  >
                    <p className="text-sm font-medium text-navy">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.body}</p>
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
          </div>
          <a href="#platform" className="text-sm text-slate-400 transition hover:text-navy">
            Platform
          </a>
          <Link href="/pricing" className="text-sm text-slate-400 transition hover:text-navy">
            Pricing
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-400 transition hover:text-navy">
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-slate-400 transition hover:text-navy">
            Log in
          </Link>
          <Button variant="early" size="sm" className="h-9 rounded-xl px-4" onClick={() => router.push("/signup")}>
            Sign up
          </Button>
        </div>
      </header>

      <div className="relative z-20 mx-auto flex max-w-6xl flex-col gap-6 px-6 pt-10 md:flex-row md:items-start md:justify-between md:px-10 lg:pt-12">
        <div className="max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-electric/25 bg-electric/10 px-3 py-1 font-brand text-[11px] font-bold uppercase tracking-[0.2em] text-electric shadow-glow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI capture intelligence
          </motion.span>
          <BrandWord className="block text-[42px] sm:text-6xl lg:text-[72px]" />
          <h1 className="mt-3 font-display text-[22px] font-extrabold leading-[1.15] tracking-tight text-navy sm:text-3xl lg:text-[34px]">
            Supercharge your government contract bidding with AI-powered insights
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-500">
            Deploy AI assistants that analyze RFPs, contracts, and bids — surfacing win probability,
            incumbents, and hidden requirements before you write a single page.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 pt-1 md:pt-2">
          <Button variant="outline" size="lg" className="h-11 px-5" onClick={() => setLead("contact")}>
            <Mail className="h-4 w-4" />
            Contact Us
          </Button>
          <Button size="lg" className="h-11 px-5" onClick={() => setLead("demo")}>
            <Calendar className="h-4 w-4" />
            Book Demo
          </Button>
        </div>
      </div>

      <LeadDialog kind={lead} onClose={() => setLead(null)} />
    </>
  );
}
