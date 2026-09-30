import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "slate",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "indigo" | "teal" | "emerald" | "amber" | "rose" | "slate" | "zinc" | "hot";
}) {
  const tones = {
    indigo: "bg-electric/15 text-electric border-electric/25",
    teal: "bg-electric/15 text-electric border-electric/25",
    emerald: "bg-electric/15 text-electric border-electric/25",
    amber: "bg-amber-500/15 text-amber-300 border-amber-400/20",
    rose: "bg-rose-500/15 text-rose-300 border-rose-400/20",
    slate: "bg-white/5 text-slate-300 border-white/10",
    zinc: "bg-white/5 text-slate-300 border-white/10",
    hot: "bg-orange-500/15 text-orange-300 border-orange-400/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
