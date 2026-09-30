import { useId } from "react";
import { cn } from "@/lib/utils";

export function BrandWord({ className }: { className?: string }) {
  return (
    <span className={cn("wordmark inline-block", className)}>
      <span>Win</span>
      <span className="wordmark-accent">room</span>
    </span>
  );
}

export function LogoMark({ className, size = 36 }: { className?: string; size?: number }) {
  const rawId = useId().replace(/:/g, "");
  const gradientId = `wr-room-${rawId}`;

  return (
    <span
      className={cn("logo-mark relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="logo-glow" />
      <svg viewBox="0 0 48 48" className="relative z-[1] h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="6" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d9ff6a" />
            <stop offset="0.42" stopColor="#c6f247" />
            <stop offset="1" stopColor="#14532d" />
          </linearGradient>
        </defs>
        <g className="logo-orbit" style={{ transformOrigin: "24px 24px" }}>
          <ellipse cx="24" cy="24" rx="21" ry="11" fill="none" stroke="#c6f247" strokeOpacity="0.7" strokeWidth="1.15" />
          <circle cx="44.2" cy="24" r="2" fill="#c6f247" />
        </g>
        <g className="logo-orbit-rev" style={{ transformOrigin: "24px 24px" }}>
          <ellipse cx="24" cy="24" rx="11.5" ry="20" fill="none" stroke="#86efac" strokeOpacity="0.45" strokeWidth="1" />
          <circle cx="24" cy="4.4" r="1.55" fill="#d9ff6a" />
        </g>
        <rect x="10" y="10" width="28" height="28" rx="7" fill={`url(#${gradientId})`} />
        <path d="M24 12.4v23.2M12.4 24h23.2" stroke="rgba(5,7,5,0.28)" strokeWidth="1.1" />
        <path
          d="M15.2 17.2h3.35l2.55 11.4 2.35-8.6h2.2l2.35 8.6 2.55-11.4H34l-4.35 15.1h-3.25L24.1 22.6l-2.3 9.7h-3.25L15.2 17.2Z"
          fill="#050705"
        />
      </svg>
    </span>
  );
}

const MARK: Record<"sm" | "md" | "lg", number> = { sm: 28, md: 36, lg: 44 };
const WORD: Record<"sm" | "md" | "lg", string> = {
  sm: "text-[17px]",
  md: "text-[22px]",
  lg: "text-[28px]",
};

export function WinroomLogo({
  className,
  markSize,
  wordmark = true,
  size = "md",
}: {
  className?: string;
  markSize?: number;
  wordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const mark = markSize ?? MARK[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5 text-navy", className)}>
      <LogoMark size={mark} />
      {wordmark ? (
        <span className="leading-none">
          <BrandWord className={cn("block", WORD[size])} />
          <span className="mt-1 block font-brand text-[9px] font-bold uppercase tracking-[0.28em] text-electric">
            Capture desk
          </span>
        </span>
      ) : null}
    </span>
  );
}
