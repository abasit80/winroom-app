"use client";

import Link from "next/link";
import { ArrowRight, Clock3, Database, Gauge } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    n: "1",
    title: "Paste a website link",
    body: "Open Copy from a website and drop in any public page — a shop, a company list, anything.",
  },
  {
    n: "2",
    title: "Click what to keep",
    body: "AI finds products or companies. Click the cards you want.",
  },
  {
    n: "3",
    title: "Use the data",
    body: "See it in Results, add extra details, or send it to Notion / HubSpot.",
  },
];

const ACTIONS = [
  {
    href: "/visual-scraper",
    title: "Copy from a website",
    body: "Best place to start. Paste a link and let AI pick out the items.",
    cta: "Start copying",
  },
  {
    href: "/live",
    title: "Watch a scrape",
    body: "See the robot click and type, with a simple live log.",
    cta: "Watch demo",
  },
  {
    href: "/data",
    title: "See your results",
    body: "A big table of everything collected so far.",
    cta: "Open table",
  },
];

export function CommandCenter() {
  return (
    <div className="space-y-8">
      <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-white">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">What this app does</p>
          <CardTitle className="text-xl">It copies useful info from websites into a table.</CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-relaxed">
            You do not need to know coding. Paste a link, check the cards AI finds, then save or export.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/visual-scraper">
              Try it now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="rounded-2xl bg-gray-50 p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white">
                {step.n}
              </span>
              <p className="mt-3 font-semibold text-gray-900">{step.title}</p>
              <p className="mt-1 text-sm text-gray-500">{step.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {ACTIONS.map((tile) => (
          <Link key={tile.href} href={tile.href} className="block">
            <Card className="h-full transition hover:shadow-glow">
              <CardHeader>
                <CardTitle className="text-base">{tile.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{tile.body}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm font-semibold text-violet-600">{tile.cta} →</CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Time saved this month", value: "1,284 hrs", icon: Clock3 },
          { label: "Jobs that worked", value: "98%", icon: Gauge },
          { label: "Rows collected", value: "4.2M", icon: Database },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-gray-50 p-5">
            <stat.icon className="h-5 w-5 text-violet-500" />
            <p className="mt-3 text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
