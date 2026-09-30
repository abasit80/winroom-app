"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/dashboard/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/components/workspace/workspace-provider";

export default function IntelPage() {
  const router = useRouter();
  const { act } = useWorkspace();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [agency, setAgency] = useState("");
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [schema, setSchema] = useState<string>("");

  async function fromUrl() {
    setPending(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setSchema(JSON.stringify(data, null, 2));
      const guessedTitle = data?.title || data?.pageTitle || title || "Imported solicitation";
      setTitle(guessedTitle);
      setAgency(data?.agency || agency || "Unknown agency");
      if (typeof data === "object") {
        setText((current) => current || JSON.stringify(data, null, 2));
      }
    } finally {
      setPending(false);
    }
  }

  async function ingest() {
    setPending(true);
    const result = await act({
      type: "createBid",
      payload: { title: title || "Imported solicitation", agency: agency || "Unknown agency", text: text || schema },
    });
    setPending(false);
    const created = result?.bids[0];
    if (created) router.push(`/dashboard/analyzer/${created.id}`);
  }

  return (
    <>
      <AppHeader title="Intel ingest" subtitle="Paste a SAM.gov / agency URL or raw solicitation text. Vision mapping + capture ingest in one step." />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-navy">From URL</h2>
          <p className="mt-1 text-xs text-slate-500">Uses the vision mapper. Works on public pages you are authorized to collect.</p>
          <Input className="mt-3" placeholder="https://sam.gov/..." value={url} onChange={(e) => setUrl(e.target.value)} />
          <Button className="mt-3 rounded-xl" disabled={!url || pending} onClick={() => void fromUrl()}>
            {pending ? "Mapping…" : "Map page"}
          </Button>
          {schema ? (
            <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600">{schema}</pre>
          ) : null}
        </section>
        <section className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-navy">Create capture record</h2>
          <div className="mt-3 space-y-3">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Agency" value={agency} onChange={(e) => setAgency(e.target.value)} />
            <Textarea placeholder="Paste solicitation text" value={text} onChange={(e) => setText(e.target.value)} className="min-h-[180px]" />
            <Button className="rounded-xl" disabled={pending || (!title && !text)} onClick={() => void ingest()}>
              Ingest into analyzer
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
