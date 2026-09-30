"use client";

import { useState } from "react";
import { Wrench } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { simulateSelfHeal } from "@/lib/agents/healer";
import type { HealingEvent } from "@/lib/types";

export function HealingLab() {
  const [broken, setBroken] = useState(".product-grid .card-price-x8f2");
  const [event, setEvent] = useState<HealingEvent | null>(null);
  const [phase, setPhase] = useState<"idle" | "detect" | "rescan" | "fixed">("idle");

  async function run() {
    setPhase("detect");
    await wait(700);
    setPhase("rescan");
    await wait(900);
    const next = simulateSelfHeal(broken);
    setEvent(next);
    setBroken(next.suggestedSelector);
    setPhase("fixed");
  }

  return (
    <div>
      <Topbar
        title="Auto-fix"
        subtitle="If a website changes, this shows how the app finds the broken piece and suggests a new one."
      />
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>What went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 font-mono text-sm text-rose-800">
            BROKEN · {phase === "fixed" && event ? event.brokenSelector : broken}
          </div>
          <div className="flex flex-wrap gap-2">
            <Phase label="1. Found a problem" active={phase === "detect" || phase !== "idle"} />
            <Phase label="2. Looked again" active={phase === "rescan" || phase === "fixed"} />
            <Phase label="3. Fixed it" active={phase === "fixed"} />
          </div>
          {event ? (
            <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p>
                <span className="text-emerald-600">Why</span> · {event.reason}
              </p>
              <p>
                <span className="text-emerald-600">Fix</span> · {event.strategy}
              </p>
              <p className="font-mono">
                <span className="text-emerald-600">New target</span> · {event.suggestedSelector}
              </p>
              <Badge tone="emerald">sure {(event.confidence * 100).toFixed(0)}%</Badge>
            </div>
          ) : null}
          <Button onClick={() => void run()}>
            <Wrench className="mr-2 h-4 w-4" /> Show a broken scrape, then fix it
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Phase({ label, active }: { label: string; active: boolean }) {
  return <Badge tone={active ? "indigo" : "slate"}>{label}</Badge>;
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
