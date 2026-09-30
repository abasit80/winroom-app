"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, Bell, ChevronDown } from "lucide-react";
import { HEADER_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function HeaderBar() {
  const pathname = usePathname();
  const [gpt4, setGpt4] = useState(true);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 bg-ink px-4 text-white md:px-6">
      <div className="flex min-w-0 items-center gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Activity className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">ScrapeMaster</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {HEADER_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-[13px] transition",
                  active ? "text-white" : "text-white/65 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <label className="hidden items-center gap-2 text-xs text-white/80 sm:flex">
          <span>Smarter AI</span>
          <button
            type="button"
            onClick={() => setGpt4((v) => !v)}
            className={cn(
              "relative h-5 w-9 rounded-full transition",
              gpt4 ? "bg-violet-500" : "bg-white/20",
            )}
            aria-pressed={gpt4}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white transition",
                gpt4 ? "left-4" : "left-0.5",
              )}
            />
          </button>
        </label>
        <button className="hidden items-center gap-1 rounded-md px-2 py-1 text-xs text-white/80 hover:bg-white/10 md:flex">
          EN
          <ChevronDown className="h-3 w-3" />
        </button>
        <button className="rounded-md p-1.5 text-white/80 hover:bg-white/10">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[11px] font-bold">
          SM
        </div>
      </div>
    </header>
  );
}
