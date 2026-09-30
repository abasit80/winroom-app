"use client";

import { useState } from "react";
import { AppHeader } from "@/components/dashboard/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/components/workspace/workspace-provider";

export default function ConnectorsPage() {
  const { workspace, act } = useWorkspace();
  const [webhooks, setWebhooks] = useState<Record<string, string>>({});

  return (
    <>
      <AppHeader title="Connectors" subtitle="Push qualified RFPs into CRM, Slack, and SharePoint. Every button writes a real sync event." />
      <div className="grid gap-4 md:grid-cols-2">
        {workspace?.connectors.map((connector) => (
          <article key={connector.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-navy">{connector.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{connector.description}</p>
              </div>
              <Badge tone={connector.connected ? "emerald" : "slate"}>{connector.connected ? "connected" : "idle"}</Badge>
            </div>
            <Input
              className="mt-3 h-9 text-xs"
              value={webhooks[connector.id] ?? connector.webhook}
              onChange={(e) => setWebhooks((current) => ({ ...current, [connector.id]: e.target.value }))}
            />
            <p className="mt-2 text-[11px] text-slate-400">
              {connector.lastSync ? `Last sync ${new Date(connector.lastSync).toLocaleString()} · ${connector.lastCount} rows` : "Never synced"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {connector.connected ? (
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => void act({ type: "disconnectConnector", payload: { id: connector.id } })}>
                  Disconnect
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="rounded-xl"
                  onClick={() => void act({ type: "connectConnector", payload: { id: connector.id, webhook: webhooks[connector.id] ?? connector.webhook } })}
                >
                  Connect
                </Button>
              )}
              <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => void act({ type: "syncConnector", payload: { id: connector.id } })}>
                Sync qualified bids
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
