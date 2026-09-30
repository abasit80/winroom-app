import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/10 bg-surface px-3 text-sm text-navy outline-none ring-electric/40 placeholder:text-slate-500 focus:border-electric/50 focus:ring-2",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
