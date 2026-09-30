"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const CONNECTORS = [
  { id: "salesforce", name: "Salesforce", desc: "Push accounts & leads into CRM objects." },
  { id: "hubspot", name: "HubSpot", desc: "Sync companies and contacts via private app." },
  { id: "notion", name: "Notion", desc: "Write rows into a database with mapped properties." },
  { id: "airtable", name: "Airtable", desc: "Append records to a base table." },
];

export function ConnectorGrid() {
  const [webhook, setWebhook] = useState("https://hooks.scrapemaster.ai/v1/ingest");
  const [connected, setConnected] = useState<Record<string, boolean>>({});

  async function sync(id: string) {
    await fetch("/api/connectors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connector: id, webhook }),
    });
    setConnected((c) => ({ ...c, [id]: true }));
    toast.success(`${id} webhook accepted 12 sample rows`);
  }

  return (
    <div>
      <Topbar
        title="Send to other apps"
        subtitle="Push your table into Salesforce, HubSpot, Notion, or Airtable with one click."
      />
      <div className="mb-6 max-w-xl">
        <label className="mb-2 block text-xs font-medium text-gray-500">Where to send data</label>
        <Input value={webhook} onChange={(e) => setWebhook(e.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {CONNECTORS.map((c) => (
          <Card key={c.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <CardTitle>{c.name}</CardTitle>
              <Badge tone={connected[c.id] ? "emerald" : "zinc"}>
                {connected[c.id] ? "synced" : "idle"}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-500">
                {c.id === "salesforce"
                  ? "Send companies into Salesforce."
                  : c.id === "hubspot"
                    ? "Send companies into HubSpot."
                    : c.id === "notion"
                      ? "Add rows to a Notion database."
                      : "Add rows to an Airtable base."}
              </p>
              <Button variant="secondary" onClick={() => void sync(c.id)}>
                One-click send
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
