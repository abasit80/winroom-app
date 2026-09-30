"use client";

import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ShieldAlert } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateScrapedRows } from "@/lib/mock/data";
import { runDataGuard } from "@/lib/agents/data-guard";
import type { ScrapedRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL_ROWS = generateScrapedRows(12000);

export function DataStream() {
  const parentRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [guarded, setGuarded] = useState<{ rows: ScrapedRow[]; notes: string[] } | null>(null);

  const source = guarded?.rows ?? ALL_ROWS;
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (row) =>
        row.entity.toLowerCase().includes(q) ||
        row.field.toLowerCase().includes(q) ||
        row.source.toLowerCase().includes(q),
    );
  }, [query, source]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 18,
  });

  function applyGuard() {
    const { rows: next, report } = runDataGuard(ALL_ROWS);
    setGuarded({ rows: next, notes: report.notes });
  }

  return (
    <div>
      <Topbar
        title="Your results"
        subtitle="Everything copied so far. Search the table. Click Clean data to hide duplicates."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or website…"
          className="max-w-md"
        />
        <Button variant="secondary" onClick={applyGuard}>
          <ShieldAlert className="mr-2 h-4 w-4" /> Clean data
        </Button>
        <Badge>{rows.length.toLocaleString()} rows</Badge>
      </div>

      {guarded ? (
        <p className="mb-3 text-xs text-amber-700">{guarded.notes.join(" · ")}</p>
      ) : null}

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[80px_1.2fr_1fr_0.8fr_1.2fr_90px_110px] border-b border-gray-100 bg-gray-50 px-4 py-2 text-[11px] uppercase tracking-wider text-gray-500">
          <span>ID</span>
          <span>Name</span>
          <span>Website</span>
          <span>Column</span>
          <span>Value</span>
          <span>Conf.</span>
          <span>Status</span>
        </div>
        <div ref={parentRef} className="h-[640px] overflow-auto">
          <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
            {virtualizer.getVirtualItems().map((vRow) => {
              const row = rows[vRow.index];
              return (
                <div
                  key={row.id}
                  className="absolute left-0 top-0 grid w-full grid-cols-[80px_1.2fr_1fr_0.8fr_1.2fr_90px_110px] items-center border-b border-gray-100 px-4 text-sm text-gray-800"
                  style={{ height: vRow.size, transform: `translateY(${vRow.start}px)` }}
                >
                  <span className="font-mono text-xs text-gray-400">{row.id}</span>
                  <span className="truncate">{row.entity}</span>
                  <span className="truncate font-mono text-xs text-gray-500">{row.source}</span>
                  <span>{row.field}</span>
                  <span className="truncate text-gray-600">{row.value}</span>
                  <span className="text-violet-600">{row.confidence}</span>
                  <StatusBadge status={row.status} />
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: ScrapedRow["status"] }) {
  const tone =
    status === "clean" ? "emerald" : status === "enriched" ? "teal" : status === "duplicate" ? "amber" : "rose";
  return (
    <Badge tone={tone} className={cn("w-fit")}>
      {status}
    </Badge>
  );
}
