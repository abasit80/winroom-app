"use client";

import { AppHeader } from "@/components/dashboard/app-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { cn } from "@/lib/utils";

export default function AutomationPage() {
  const { workspace, act } = useWorkspace();
  const jobs = workspace?.automations ?? [];
  const alerts = workspace?.alerts ?? [];

  return (
    <>
      <AppHeader title="Automation" subtitle="Agents that discover, score, watch deadlines, and push CRM without a click." />
      <div className="mb-4 flex justify-end">
        <Button size="sm" className="rounded-xl" onClick={() => void act({ type: "runDiscovery" })}>
          Run all discovery
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {jobs.map((job) => (
          <article key={job.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-navy">{job.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{job.description}</p>
              </div>
              <Badge tone={job.enabled ? "emerald" : "slate"}>{job.enabled ? "on" : "paused"}</Badge>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              {job.cadence}
              {job.lastRun ? ` · last ${new Date(job.lastRun).toLocaleString()}` : ""}
            </p>
            <p className="mt-1 text-xs text-slate-500">{job.lastResult}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" className="rounded-xl" onClick={() => void act({ type: "runAutomation", payload: { id: job.id } })}>
                Run now
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => void act({ type: "toggleAutomation", payload: { id: job.id } })}>
                {job.enabled ? "Pause" : "Enable"}
              </Button>
            </div>
          </article>
        ))}
      </div>
      <section className="glass mt-4 rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy">Alert stream</h2>
          <button type="button" className="text-xs text-electric" onClick={() => void act({ type: "markAllAlertsRead" })}>
            Mark all read
          </button>
        </div>
        <ul className="space-y-2">
          {alerts.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                onClick={() => void act({ type: "markAlertRead", payload: { id: item.id } }, true)}
                className={cn("block rounded-xl bg-slate-50 px-3 py-2.5", item.read && "opacity-50")}
              >
                <p className="text-sm text-navy">{item.title}</p>
                <p className="text-[11px] text-slate-400">{item.body}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
