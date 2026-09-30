"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket } from "lucide-react";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col border-r border-gray-200 bg-[#f9fafb] px-3 py-5 md:flex">
      <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        Menu
      </p>
      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-3 py-2.5 transition",
                active
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-100"
                  : "text-gray-600 hover:bg-white/80 hover:text-gray-900",
              )}
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <Icon className={cn("h-4 w-4", active ? "text-violet-500" : "text-gray-400")} />
                {item.label}
              </span>
              <span className="mt-0.5 block pl-7 text-[11px] font-normal text-gray-400">{item.hint}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-card">
        <div>
          <p className="text-xs font-medium text-gray-500">This month</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">1,284 hours saved</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full w-[26%] rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          </div>
        </div>
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2.5 text-sm font-semibold text-white shadow-glow-sm">
          <Rocket className="h-4 w-4" />
          Upgrade To Pro
        </button>
      </div>
    </aside>
  );
}
