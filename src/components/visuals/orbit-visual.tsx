"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export type OrbitNode = {
  id: string;
  label: string;
  mark?: string;
  accent?: string;
  icon?: ReactNode;
};

type Ring = {
  radius: number;
  duration: number;
  reverse?: boolean;
  nodes: OrbitNode[];
};

export function OrbitVisual({
  inner,
  outer,
  size = 560,
  caption,
  selectedId,
  onSelect,
  className,
}: {
  inner: OrbitNode[];
  outer: OrbitNode[];
  size?: number;
  caption?: string;
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [px, setPx] = useState(size);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setPx(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const innerRadius = Math.round(px * 0.22);
  const outerRadius = Math.round(px * 0.4);
  const rings: Ring[] = [
    { radius: innerRadius, duration: 26, nodes: inner },
    { radius: outerRadius, duration: 42, reverse: true, nodes: outer },
  ];

  return (
    <div
      ref={ref}
      className={cn("orbit-stage relative mx-auto w-full", className)}
      style={{ maxWidth: size, aspectRatio: "1" }}
    >
      <div className="absolute inset-[8%] rounded-full border border-electric/20 shadow-[0_0_80px_-20px_rgba(37,99,235,0.35)]" />
      <div
        className="absolute rounded-full border border-dashed border-electric/25"
        style={{ inset: `${50 - 22}%` }}
      />
      <div
        className="absolute rounded-full border border-sky-300/50"
        style={{ inset: `${50 - 40}%` }}
      />
      <div className="absolute inset-[18%] rounded-full bg-electric/15 blur-3xl animate-pulse-glow" />

      {rings.map((ring) => (
        <OrbitRing key={ring.duration} ring={ring} selectedId={selectedId} onSelect={onSelect} />
      ))}

      <DustRing radius={Math.round(px * 0.31)} duration={54} />

      <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-electric/25 bg-surface shadow-node sm:h-16 sm:w-16 md:h-[72px] md:w-[72px]">
          <div className="absolute -inset-3 rounded-full bg-electric/25 blur-xl" />
          <LogoMark size={px < 380 ? 24 : 32} className="relative" />
        </div>
        {caption ? (
          <p className="mt-3 font-brand text-[11px] font-extrabold uppercase tracking-[0.22em] text-electric">{caption}</p>
        ) : null}
      </div>
    </div>
  );
}

function OrbitRing({
  ring,
  selectedId,
  onSelect,
}: {
  ring: Ring;
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const dir = ring.reverse ? "orbit-spin-reverse" : "orbit-spin";
  const counter = ring.reverse ? "orbit-spin" : "orbit-spin-reverse";

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: ring.radius * 2, height: ring.radius * 2 }}
    >
      <div className="orbit-rotator h-full w-full" style={{ animation: `${dir} ${ring.duration}s linear infinite` }}>
        {ring.nodes.map((node, index) => {
          const angle = (360 / ring.nodes.length) * index;
          const selected = selectedId === node.id;
          return (
            <div
              key={node.id}
              className="absolute left-1/2 top-1/2"
              style={{ transform: `rotate(${angle}deg) translateX(${ring.radius}px)` }}
            >
              <div className="-translate-x-1/2 -translate-y-1/2">
                <div className="orbit-counter" style={{ animation: `${counter} ${ring.duration}s linear infinite` }}>
                  <button
                    type="button"
                    onClick={() => onSelect?.(node.id)}
                    className={cn(
                        "glass flex max-w-[148px] items-center gap-2 rounded-full px-2.5 py-1.5 text-left shadow-glass transition",
                        selected
                          ? "border-electric/60 bg-electric/15 shadow-glow-sm"
                          : "hover:border-electric/30 hover:bg-white/5",
                    )}
                  >
                    {node.icon ? (
                      <span className="shrink-0">{node.icon}</span>
                    ) : (
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[8px] font-bold text-white"
                        style={{ background: node.accent || "#3b82f6" }}
                      >
                        {node.mark || node.label.slice(0, 2)}
                      </span>
                    )}
                    <span className="truncate text-[10px] font-medium text-slate-600">{node.label}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DustRing({ radius, duration }: { radius: number; duration: number }) {
  const dots = 10;
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: radius * 2, height: radius * 2 }}
    >
      <div className="orbit-rotator h-full w-full" style={{ animation: `orbit-spin ${duration}s linear infinite` }}>
        {Array.from({ length: dots }).map((_, index) => {
          const angle = (360 / dots) * index + 8;
          return (
            <div
              key={index}
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-electric/70 shadow-[0_0_10px_rgba(37,99,235,0.7)]"
              style={{ transform: `rotate(${angle}deg) translateX(${radius}px)` }}
            />
          );
        })}
      </div>
    </div>
  );
}
