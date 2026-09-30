"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, FileText, Lock, Pin, Unlock, X } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/dashboard/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import type { VaultArtifact, VaultFileType } from "@/lib/workspace/types";
import { cn } from "@/lib/utils";

export function VaultBoard() {
  const router = useRouter();
  const { workspace, act } = useWorkspace();
  const [query, setQuery] = useState("");
  const [activeFile, setActiveFile] = useState<VaultArtifact | null>(null);
  const [compose, setCompose] = useState(false);

  const bids = workspace?.bids ?? [];
  const files = workspace?.artifacts ?? [];
  const needle = query.trim().toLowerCase();
  const pinned = bids.filter((bid) => bid.pinned && (!needle || `${bid.title} ${bid.rfpId} ${bid.agency}`.toLowerCase().includes(needle)));
  const unpinned = bids.filter((bid) => !bid.pinned);
  const visibleFiles = files.filter((file) => !needle || `${file.name} ${file.type} ${file.classification}`.toLowerCase().includes(needle));

  return (
    <>
      <AppHeader title="Vault" subtitle="Controlled artifacts, prior submissions, and pinned RFPs." query={query} onQueryChange={setQuery} />
      <div className="mb-4 flex justify-end">
        <Button size="sm" className="rounded-xl" onClick={() => setCompose(true)}>
          Add artifact
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="glass glass-lift card-sheen rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-navy">Pinned RFPs</h2>
            <span className="text-[11px] text-slate-400">{pinned.length} locked</span>
          </div>
          <ul className="space-y-2">
            {pinned.length ? (
              pinned.map((bid) => (
                <li key={bid.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                  <Link href={`/dashboard/analyzer/${bid.id}`} className="min-w-0 flex-1">
                    <p className="text-sm text-navy">{bid.title}</p>
                    <p className="text-[11px] text-slate-400">{bid.rfpId}</p>
                  </Link>
                  <button type="button" onClick={() => void act({ type: "pinBid", payload: { id: bid.id, pinned: false } })} className="ml-3 rounded-lg p-1 text-slate-400 hover:text-navy">
                    <Lock className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))
            ) : (
              <li className="rounded-xl bg-slate-50 px-3 py-6 text-center text-xs text-slate-400">No pinned RFPs match this search.</li>
            )}
          </ul>
          {unpinned.length ? (
            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="mb-2 text-[11px] uppercase tracking-wider text-slate-400">Pin more</p>
              <div className="flex flex-wrap gap-2">
                {unpinned.map((bid) => (
                  <button
                    key={bid.id}
                    type="button"
                    onClick={() => void act({ type: "pinBid", payload: { id: bid.id, pinned: true } })}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-500 hover:text-navy"
                  >
                    <Pin className="h-3 w-3" />
                    {bid.rfpId}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="glass glass-lift card-sheen rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-navy">Proposal library</h2>
            <span className="text-[11px] text-slate-400">{visibleFiles.length} files</span>
          </div>
          <ul className="space-y-2">
            {visibleFiles.map((file) => (
              <li key={file.id}>
                <button type="button" onClick={() => setActiveFile(file)} className="flex w-full items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-left">
                  <FileText className="h-4 w-4 shrink-0 text-electric" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-navy">{file.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {file.type} · {file.size}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {activeFile ? (
        <FileViewer file={activeFile} onClose={() => setActiveFile(null)} onOpenBid={(bidId) => router.push(`/dashboard/analyzer/${bidId}`)} />
      ) : null}
      {compose ? <ArtifactForm onClose={() => setCompose(false)} /> : null}
    </>
  );
}

function FileViewer({ file, onClose, onOpenBid }: { file: VaultArtifact; onClose: () => void; onOpenBid: (id: string) => void }) {
  function download() {
    const blob = new Blob([file.body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file.name}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${file.name}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div className="glass glass-static max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl shadow-glass" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-navy">{file.name}</p>
            <p className="mt-1 text-[11px] text-slate-400">
              {file.type} · {file.size} · {file.classification} · Updated {file.updated}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:text-navy">
            <X className="h-4 w-4" />
          </button>
        </div>
        <pre className="max-h-[48vh] overflow-y-auto whitespace-pre-wrap bg-slate-100 px-5 py-4 text-[13px] leading-relaxed text-slate-600">{file.body}</pre>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-5 py-3">
          <p className={cn("inline-flex items-center gap-1 text-[11px] text-slate-400")}>
            <Unlock className="h-3.5 w-3.5" />
            Controlled artifact — capture cell only
          </p>
          <div className="flex gap-2">
            {file.bidId ? (
              <button type="button" onClick={() => onOpenBid(file.bidId!)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600">
                Open related RFP
              </button>
            ) : null}
            <button type="button" onClick={download} className="inline-flex items-center gap-1.5 rounded-xl bg-electric px-3 py-2 text-xs font-semibold text-white">
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArtifactForm({ onClose }: { onClose: () => void }) {
  const { workspace, act } = useWorkspace();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<VaultFileType>("TXT");
  const [bidId, setBidId] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div className="glass glass-static w-full max-w-lg rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-navy">Add vault artifact</h2>
        <div className="mt-4 space-y-3">
          <Input placeholder="File name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <select value={type} onChange={(e) => setType(e.target.value as VaultFileType)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm">
              {["TXT", "PDF", "DOCX", "XLSX"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select value={bidId} onChange={(e) => setBidId(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm">
              <option value="">No related RFP</option>
              {workspace?.bids.map((bid) => (
                <option key={bid.id} value={bid.id}>
                  {bid.rfpId}
                </option>
              ))}
            </select>
          </div>
          <Textarea placeholder="File contents" value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={!name || !body}
              onClick={async () => {
                const result = await act({ type: "addArtifact", payload: { name, type, body, bidId: bidId || undefined } });
                if (result) onClose();
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
