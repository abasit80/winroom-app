"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DESK_NAV } from "@/lib/dashboard-nav";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useShell } from "@/components/dashboard/shell-context";
import { cn } from "@/lib/utils";

export function AppSidebar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const { workspace } = useWorkspace();
  const { sidebar } = useShell();
  const unread = workspace?.alerts.filter((item) => !item.read).length ?? 0;
  const collapsed = sidebar === "collapsed";

  if (sidebar === "hidden") return null;

  return (
    <aside
      className={cn(
        "sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col border-r border-white/10 bg-black/40 px-2 py-4 backdrop-blur-xl transition-[width] duration-300 md:flex",
        collapsed ? "w-[72px]" : "w-64 px-3",
      )}
    >
      <p className={cn("mb-3 px-2 font-brand text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400", collapsed && "text-center")}>
        {collapsed ? "WR" : "Winroom rail"}
      </p>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {DESK_NAV.map((item) => {
          const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "rounded-xl px-2.5 py-2.5 transition",
                active ? "bg-electric/15 text-navy shadow-glass ring-1 ring-electric/30" : "text-slate-500 hover:bg-white/5 hover:text-navy",
                collapsed && "flex justify-center px-0",
              )}
            >
              <span className={cn("flex items-center gap-3 text-sm font-medium", collapsed && "justify-center")}>
                <span className={cn("relative", active && "text-electric")}>
                  <Icon className="h-4 w-4" />
                  {item.href === "/dashboard/automation" && unread > 0 ? (
                    <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-electric" />
                  ) : null}
                </span>
                {collapsed ? null : item.label}
              </span>
              {collapsed ? null : <span className="mt-0.5 block pl-7 text-[11px] font-normal text-slate-400">{item.hint}</span>}
            </Link>
          );
        })}
      </nav>
      {collapsed ? (
        <p className="px-1 text-center font-mono text-[9px] uppercase tracking-wider text-electric">{workspace?.billing.plan}</p>
      ) : (
        <div className="glass glass-static mt-3 rounded-2xl p-3">
          <p className="truncate text-sm font-medium text-navy">{user.name}</p>
          <p className="truncate text-[11px] text-slate-400">{user.email}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-electric">{workspace?.billing.plan} plan</p>
        </div>
      )}
    </aside>
  );
}
