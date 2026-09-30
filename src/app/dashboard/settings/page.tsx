"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/dashboard/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { PLAN_META } from "@/lib/workspace/selectors";
import type { PlanId } from "@/lib/workspace/types";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { workspace, act } = useWorkspace();
  const profile = workspace?.profile;
  const [name, setName] = useState(profile?.name ?? "");
  const [naics, setNaics] = useState(profile?.naics.join(", ") ?? "");
  const [vehicles, setVehicles] = useState(profile?.vehicles.join(", ") ?? "");
  const [geos, setGeos] = useState(profile?.geos.join(", ") ?? "");
  const [clearance, setClearance] = useState(profile?.clearance ?? "");
  const [keywords, setKeywords] = useState(profile?.keywords.join(", ") ?? "");
  const [past, setPast] = useState(profile?.pastPerformance ?? "");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setNaics(profile.naics.join(", "));
    setVehicles(profile.vehicles.join(", "));
    setGeos(profile.geos.join(", "));
    setClearance(profile.clearance);
    setKeywords(profile.keywords.join(", "));
    setPast(profile.pastPerformance);
  }, [profile]);

  const split = (value: string) =>
    value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

  return (
    <>
      <AppHeader title="Settings" subtitle="Capability profile, plan, and audit log — this is what discovery and go/no-go use." />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <section className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-navy">Company capability profile</h2>
          <div className="mt-4 space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company name" />
            <Input value={naics} onChange={(e) => setNaics(e.target.value)} placeholder="NAICS codes" />
            <Input value={vehicles} onChange={(e) => setVehicles(e.target.value)} placeholder="Vehicles" />
            <Input value={geos} onChange={(e) => setGeos(e.target.value)} placeholder="Geos" />
            <Input value={clearance} onChange={(e) => setClearance(e.target.value)} placeholder="Clearance" />
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Keywords" />
            <Textarea value={past} onChange={(e) => setPast(e.target.value)} placeholder="Past performance" />
            <Button
              className="rounded-xl"
              onClick={() =>
                void act({
                  type: "updateProfile",
                  payload: { name, naics: split(naics), vehicles: split(vehicles), geos: split(geos), clearance, keywords: split(keywords), pastPerformance: past },
                })
              }
            >
              Save profile
            </Button>
          </div>
        </section>
        <div className="space-y-4">
          <section className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-navy">Plan</h2>
            <p className="mt-1 text-xs text-slate-400">
              {workspace?.billing.rfpsUsed}/{workspace?.billing.rfpQuota} RFPs used · {workspace?.billing.seats} seats
            </p>
            <div className="mt-3 space-y-2">
              {(Object.keys(PLAN_META) as PlanId[]).map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => void act({ type: "changePlan", payload: { plan } })}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm",
                    workspace?.billing.plan === plan ? "border-electric bg-electric/10 text-navy" : "border-white/10 text-slate-400",
                  )}
                >
                  <span>{PLAN_META[plan].label}</span>
                  <span className="text-xs text-slate-400">{PLAN_META[plan].price}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-navy">Audit log</h2>
            <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
              {workspace?.audit.map((item) => (
                <li key={item.id} className="text-[11px] text-slate-500">
                  <span className="text-slate-400">{new Date(item.at).toLocaleString()} · </span>
                  {item.action}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
