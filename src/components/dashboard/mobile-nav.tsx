"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, FolderLock, LayoutGrid, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Discover", icon: LayoutGrid },
  { href: "/dashboard/vault", label: "Vault", icon: FolderLock },
  { href: "/dashboard/automation", label: "Auto", icon: Bot },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/more", label: "More", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/10 bg-black/70 px-1 py-2 shadow-[0_-12px_30px_-20px_rgba(198,242,71,0.2)] backdrop-blur-xl md:hidden">
      {ITEMS.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : item.href === "/dashboard/more"
              ? ["/dashboard/more", "/dashboard/settings", "/dashboard/proposals", "/dashboard/workflows", "/dashboard/connectors", "/dashboard/analytics", "/dashboard/intel"].some(
                  (path) => pathname === path || pathname.startsWith(`${path}/`),
                )
              : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg py-1 text-[10px]",
              active ? "text-electric" : "text-slate-500",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
