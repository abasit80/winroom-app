import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[120px] w-full rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm text-navy outline-none ring-electric/40 placeholder:text-slate-500 focus:border-electric/50 focus:ring-2",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
