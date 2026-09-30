"use client";

import { AppHeader } from "@/components/dashboard/app-header";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { cn } from "@/lib/utils";

export default function WorkflowsPage() {
  const { workspace, act } = useWorkspace();

  return (
    <>
      <AppHeader title="Workflows" subtitle="One-click capture sprints. Each run actually discovers, scores, assigns, drafts, and syncs." />
      <div className="grid gap-4 lg:grid-cols-2">
        {workspace?.workflows.map((flow) => (
          <article key={flow.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-navy">{flow.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{flow.description}</p>
              </div>
              <span className="text-[11px] uppercase text-slate-400">{flow.status}</span>
            </div>
            <ol className="mt-4 flex flex-wrap gap-2">
              {flow.nodes.map((node, index) => (
                <li key={node.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-medium",
                      node.status === "done" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {index + 1}. {node.label}
                  </span>
                </li>
              ))}
            </ol>
            <Button className="mt-4 rounded-xl" size="sm" onClick={() => void act({ type: "runWorkflow", payload: { id: flow.id } })}>
              Run workflow
            </Button>
          </article>
        ))}
      </div>
    </>
  );
}
