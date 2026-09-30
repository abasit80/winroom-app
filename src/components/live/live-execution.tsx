"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Square } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { randomIp } from "@/lib/utils";

type Log = { id: number; level: string; text: string };

const SCRIPT = [
  { level: "ai", text: "Starting a copy job…" },
  { level: "info", text: "Opening the website" },
  { level: "info", text: () => `Switching internet address… ${randomIp()}` },
  { level: "info", text: "Loading the page" },
  { level: "warn", text: "Page is slow — waiting a bit longer" },
  { level: "success", text: "Page is ready. Clicking the search box" },
  { level: "info", text: 'Typing: "industrial sensors"' },
  { level: "info", text: "Clicking filter: In stock" },
  { level: "success", text: "Copying 50 products" },
  { level: "ai", text: "Price field moved — auto-fix applied" },
  { level: "success", text: "Going to page 2 of 4" },
  { level: "info", text: () => `Switching internet address… ${randomIp()}` },
  { level: "success", text: "Copying 50 more products" },
  { level: "ai", text: "Removed 3 duplicates" },
  { level: "success", text: "Done. Saved 187 clean rows" },
];

export function LiveExecution() {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [cursor, setCursor] = useState({ x: 18, y: 28, click: false });
  const [typed, setTyped] = useState("");
  const [step, setStep] = useState(0);
  const terminal = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) return;
    if (step >= SCRIPT.length) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => {
      const line = SCRIPT[step];
      const text = typeof line.text === "function" ? line.text() : line.text;
      setLogs((prev) => [...prev, { id: Date.now() + step, level: line.level, text }]);
      setStep((s) => s + 1);
      setCursor({
        x: 12 + ((step * 17) % 70),
        y: 22 + ((step * 11) % 55),
        click: step % 3 === 0,
      });
      if (text.includes("Typing")) {
        void typeQuery();
      }
    }, 900);
    return () => clearTimeout(t);
  }, [running, step]);

  useEffect(() => {
    terminal.current?.scrollTo({ top: terminal.current.scrollHeight, behavior: "smooth" });
  }, [logs]);

  async function typeQuery() {
    const q = "industrial sensors";
    setTyped("");
    for (let i = 0; i < q.length; i++) {
      await new Promise((r) => setTimeout(r, 60));
      setTyped(q.slice(0, i + 1));
    }
  }

  function start() {
    setLogs([]);
    setStep(0);
    setTyped("");
    setRunning(true);
  }

  return (
    <div>
      <Topbar
        title="Watch it work"
        subtitle="Press start. Left side is the website. Right side is a simple log of what is happening."
      />
      <div className="mb-4 flex gap-2">
        <Button onClick={start} disabled={running}>
          <Play className="mr-2 h-4 w-4" /> Start demo
        </Button>
        <Button variant="secondary" onClick={() => setRunning(false)}>
          <Square className="mr-2 h-4 w-4" /> Stop
        </Button>
        <Badge tone={running ? "emerald" : "zinc"}>{running ? "live" : "idle"}</Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
            <span>Website view</span>
            <span className="font-mono text-violet-600">1440×900</span>
          </div>
          <div className="relative h-[560px] bg-gray-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.12),transparent_40%)]" />
            <div className="relative p-8">
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-4 flex gap-2">
                  <div className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-800">
                    {typed || "Search catalog…"}
                    <span className="animate-cursor-blink text-violet-500">▌</span>
                  </div>
                  <div className="rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-sm font-medium text-white">Search</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-lg border border-gray-100 bg-gray-50">
                      <div className="h-16 rounded-t-lg bg-gradient-to-br from-violet-100 to-fuchsia-100" />
                      <div className="px-2 py-1 text-[10px] text-gray-500">SKU-{1200 + i + step}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <motion.div
              className="pointer-events-none absolute z-10"
              animate={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
            >
              <div className="relative">
                <div
                  className={`h-4 w-4 rotate-12 rounded-tl-sm bg-gray-900 shadow-[0_0_16px_rgba(168,85,247,0.7)] ${cursor.click ? "scale-75" : ""}`}
                />
                {cursor.click ? (
                  <span className="absolute -left-2 -top-2 h-8 w-8 rounded-full border border-violet-400" />
                ) : null}
              </div>
            </motion.div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
            <span>What is happening</span>
            <Badge tone="teal">{logs.length} events</Badge>
          </div>
          <div ref={terminal} className="h-[560px] overflow-auto bg-gray-950 p-4 font-mono text-[12px] leading-7">
            {logs.length === 0 ? (
              <p className="text-gray-500">Idle. Click Start demo to watch a scrape.</p>
            ) : null}
            {logs.map((log) => (
              <p
                key={log.id}
                className={
                  log.level === "success"
                    ? "text-emerald-300"
                    : log.level === "warn"
                      ? "text-amber-300"
                      : log.level === "ai"
                        ? "text-fuchsia-300"
                        : "text-gray-300"
                }
              >
                <span className="text-gray-600">[{log.level}]</span> {log.text}
              </p>
            ))}
            {running ? <p className="text-violet-400">▍</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
