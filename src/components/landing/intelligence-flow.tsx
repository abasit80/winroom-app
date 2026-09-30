"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Flame, Loader2, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { CrmIcons } from "@/components/landing/crm-icons";
import { TiltCard } from "@/components/ui/tilt-card";
import { defaultHistory, fetchContractHistory, type HistoryEvent } from "@/lib/mock/contracts";

type Line = { id: string; d: string };

export function IntelligenceFlow() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const crmRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const historyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [history, setHistory] = useState<HistoryEvent[]>(defaultHistory);
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(0);

  const recalc = useCallback(() => {
    const wrap = wrapRef.current?.getBoundingClientRect();
    const center = centerRef.current?.getBoundingClientRect();
    if (!wrap || !center) return;

    const origin = {
      x: center.left - wrap.left + center.width / 2,
      y: center.top - wrap.top + center.height / 2,
    };

    const next: Line[] = [];

    const pushCurve = (id: string, el: HTMLElement | null, side: "left" | "right") => {
      if (!el) return;
      const box = el.getBoundingClientRect();
      const target = {
        x: side === "left" ? box.right - wrap.left : box.left - wrap.left,
        y: box.top - wrap.top + box.height / 2,
      };
      const bend = side === "left" ? -56 : 56;
      next.push({
        id,
        d: `M ${origin.x} ${origin.y} C ${origin.x + bend} ${origin.y}, ${target.x - bend} ${target.y}, ${target.x} ${target.y}`,
      });
    };

    pushCurve("crm", crmRef.current, "left");
    pushCurve("rfp", cardRef.current, "left");
    historyRefs.current.forEach((el, index) => pushCurve(`h-${index}`, el, "right"));
    setLines(next);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(recalc, 40);
    const late = window.setTimeout(recalc, 700);
    window.addEventListener("resize", recalc);
    const observer = new ResizeObserver(() => recalc());
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(late);
      window.removeEventListener("resize", recalc);
      observer.disconnect();
    };
  }, [history, recalc]);

  async function onFetch() {
    setLoading(true);
    const nextRound = round + 1;
    const data = await fetchContractHistory(nextRound);
    setHistory(data);
    setRound(nextRound);
    setLoading(false);
  }

  return (
    <div ref={wrapRef} className="relative mx-auto mt-8 w-full max-w-6xl px-4 pb-6 md:mt-10 md:px-8 lg:mt-12">
      <div className="relative z-10 grid items-start gap-x-6 gap-y-3 lg:grid-cols-[minmax(0,1.05fr)_88px_minmax(0,0.95fr)]">
        <div className="flex justify-center lg:justify-end">
          <motion.div
            ref={crmRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass glass-lift flex items-center gap-3 rounded-xl px-3 py-2"
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">CRMs</span>
            <CrmIcons />
          </motion.div>
        </div>

        <div className="hidden lg:block" />

        <div className="flex justify-center lg:justify-start">
          <button
            onClick={onFetch}
            disabled={loading}
            className="glass inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-navy btn-glow-blue"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-electric" />}
            {loading ? "Fetching history…" : "+ Fetch contract history"}
          </button>
        </div>

        <div className="flex justify-center lg:justify-end">
          <motion.div
            className="w-full max-w-[420px]"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <TiltCard className="w-full">
            <motion.div
              ref={cardRef}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            className="glass glass-lift card-sheen relative overflow-hidden rounded-2xl p-5 shadow-[0_20px_50px_-24px_rgba(37,99,235,0.35)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-electric/10 to-transparent" />
              <div className="relative">
                <span className="mb-4 inline-flex items-center gap-1 rounded-md bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  <Flame className="h-3 w-3" />
                  Hot
                </span>

                <div className="flex items-start gap-3">
                  <DoDSeal />
                  <div>
                    <h3 className="text-[17px] font-semibold leading-tight text-navy">IT Infrastructure Upgrade</h3>
                    <p className="mt-1 font-mono text-[11px] text-slate-400">RFP-2023-IT-001</p>
                    <p className="mt-2 text-xs text-slate-500">Department of Defense</p>
                    <p className="text-xs text-slate-400">Federal Government</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                  <Stat label="Estimated Value" value="$10M – $15M" />
                  <Stat label="Duration" value="3 years" />
                  <Stat label="Bidders" value="12" />
                </div>

                <div className="mt-4 rounded-lg bg-electric/15 px-3 py-2.5 text-xs font-medium text-electric">
                  Pre-bid conference scheduled for July 15.
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-electric">
                  <Check className="h-3.5 w-3.5" />
                  RFP details verified and up-to-date.
                </p>
              </div>
            </motion.div>
            </TiltCard>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center justify-center self-center">
          <motion.div
            ref={centerRef}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-full bg-electric/20 blur-2xl animate-pulse-glow" />
            <div className="relative flex h-[58px] w-[58px] items-center justify-center rounded-xl border border-electric/25 bg-surface shadow-node">
              <LogoMark size={28} />
            </div>
          </motion.div>
        </div>

        <div className="flex w-full flex-col items-center lg:items-start">
          <div className="flex w-full max-w-[380px] flex-col gap-2.5">
            <AnimatePresence mode="popLayout">
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  ref={(node) => {
                    historyRefs.current[index] = node;
                  }}
                  layout
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: 0.08 * index, duration: 0.35 }}
                >
                  <TiltCard intensity={5}>
                    <div className="glass glass-lift flex items-center gap-3 rounded-xl px-3 py-2.5">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white"
                        style={{ background: item.accent }}
                      >
                        {item.mark}
                      </span>
                      <p className="text-[11px] leading-snug text-slate-500">{item.text}</p>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <svg className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full lg:block" aria-hidden>
        {lines.map((line, index) => (
          <motion.path
            key={`${line.id}-${history[0]?.id ?? "init"}`}
            className="flow-line"
            d={line.d}
            fill="none"
            stroke="rgba(198,242,71,0.42)"
            strokeWidth="1.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.2 + index * 0.08 }}
          />
        ))}
      </svg>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-navy">{value}</p>
      <p className="mt-0.5 text-[10px] text-slate-400">{label}</p>
    </div>
  );
}

function DoDSeal() {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" className="shrink-0" aria-label="Department of Defense">
      <circle cx="24" cy="24" r="23" fill="#1b2a4a" stroke="#c5a35a" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="18" fill="none" stroke="#c5a35a" strokeWidth="0.8" />
      <path d="M24 10l2.4 7.2H34l-6 4.4 2.3 7.2L24 24.6l-6.3 4.2 2.3-7.2-6-4.4h7.6L24 10z" fill="#c5a35a" />
      <path d="M16 33c2.4 2.2 5.1 3.2 8 3.2s5.6-1 8-3.2" fill="none" stroke="#c5a35a" strokeWidth="1.2" />
    </svg>
  );
}

