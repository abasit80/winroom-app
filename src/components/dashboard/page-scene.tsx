"use client";

import { usePathname } from "next/navigation";
import { sceneForPath, type DeskScene } from "@/lib/dashboard-nav";

export function PageScene() {
  const pathname = usePathname();
  const scene = sceneForPath(pathname).scene;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" data-scene={scene}>
      <div className={`scene-wash scene-${scene}`} />
      <SceneArt scene={scene} />
    </div>
  );
}

function SceneArt({ scene }: { scene: DeskScene }) {
  if (scene === "radar") {
    return (
      <div className="absolute right-[-80px] top-[-40px] h-[420px] w-[420px] opacity-70">
        <div className="radar-dish" />
        <div className="radar-sweep" />
      </div>
    );
  }
  if (scene === "scan") {
    return (
      <>
        <div className="scanlines" />
        <div className="absolute right-10 top-24 h-40 w-px bg-electric/50 shadow-[0_0_18px_#c6f247]" />
      </>
    );
  }
  if (scene === "vault") {
    return (
      <div className="absolute -right-16 top-8 h-80 w-80 rounded-full border-[14px] border-electric/10 shadow-[inset_0_0_80px_rgba(198,242,71,0.08)]">
        <div className="absolute inset-8 rounded-full border border-dashed border-electric/20" />
        <div className="absolute inset-[72px] rounded-full bg-gradient-to-br from-electric/20 to-surface" />
      </div>
    );
  }
  if (scene === "paper") {
    return <div className="manuscript-lines" />;
  }
  if (scene === "circuit") {
    return (
      <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 800 600" fill="none">
        <path className="flow-line" d="M40 80H220V200H380V80H760" stroke="#22d3ee" strokeWidth="1.4" />
        <path className="flow-line" d="M80 520H300V340H520V480H740" stroke="#34d399" strokeWidth="1.4" />
        <circle cx="220" cy="80" r="5" fill="#22d3ee" />
        <circle cx="380" cy="200" r="5" fill="#34d399" />
        <circle cx="520" cy="340" r="5" fill="#22d3ee" />
      </svg>
    );
  }
  if (scene === "flow") {
    return (
      <svg className="absolute inset-x-0 top-8 h-40 w-full opacity-50" viewBox="0 0 900 160" fill="none">
        <path className="flow-line" d="M40 80 C 160 20, 260 140, 400 80 S 640 20, 860 90" stroke="#c6f247" strokeWidth="2" />
        <circle cx="40" cy="80" r="7" fill="#c6f247" />
        <circle cx="400" cy="80" r="7" fill="#86efac" />
        <circle cx="860" cy="90" r="7" fill="#14532d" />
      </svg>
    );
  }
  if (scene === "hex") {
    return <div className="hex-mesh" />;
  }
  if (scene === "chart") {
    return (
      <svg className="absolute bottom-0 right-0 h-56 w-[420px] opacity-50" viewBox="0 0 420 180" fill="none">
        <path d="M10 150 L70 110 L130 124 L190 72 L250 90 L310 36 L370 54 L410 20" stroke="#c6f247" strokeWidth="3" />
        <path d="M10 150 L70 110 L130 124 L190 72 L250 90 L310 36 L370 54 L410 20 V180 H10 Z" fill="url(#chartFill)" />
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#c6f247" stopOpacity="0.25" />
            <stop offset="1" stopColor="#c6f247" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  }
  if (scene === "stars") {
    return (
      <div className="constellation">
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} className="star-dot" style={{ left: `${(index * 17) % 90}%`, top: `${(index * 23) % 70}%`, animationDelay: `${index * 0.2}s` }} />
        ))}
      </div>
    );
  }
  if (scene === "dial") {
    return (
      <div className="absolute right-8 top-10 h-52 w-52 rounded-full border-[10px] border-slate-200/80">
        <div className="absolute inset-4 rounded-full border border-dashed border-electric/30 animate-[orbit-spin_18s_linear_infinite]" />
        <div className="absolute left-1/2 top-3 h-10 w-0.5 origin-bottom bg-electric" />
      </div>
    );
  }
  if (scene === "folio") {
    return (
      <div className="absolute right-8 top-16 rotate-6 space-y-2 opacity-60">
        <div className="h-36 w-28 rounded-md bg-surface shadow-glass" />
        <div className="absolute left-4 top-3 h-36 w-28 -rotate-6 rounded-md bg-electric/15 shadow-glass" />
      </div>
    );
  }
  return (
    <div className="absolute right-6 top-10 grid grid-cols-3 gap-2 opacity-50">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="h-10 w-10 rounded-lg bg-electric/10 shadow-glass" />
      ))}
    </div>
  );
}
