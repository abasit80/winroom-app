"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Command,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Radar,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { WinroomLogo } from "@/components/brand/logo";
import { Input } from "@/components/ui/input";
import { useSuggestions, useWorkspace } from "@/components/workspace/workspace-provider";
import { useShell } from "@/components/dashboard/shell-context";
import { sceneForPath } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

export function DeskTopbar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebar, cycleSidebar } = useShell();
  const { workspace, act } = useWorkspace();
  const suggestions = useSuggestions();
  const scene = sceneForPath(pathname);
  const [query, setQuery] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [openAlerts, setOpenAlerts] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!barRef.current?.contains(event.target as Node)) {
        setOpenSearch(false);
        setOpenAlerts(false);
        setOpenUser(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        cycleSidebar();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpenSearch(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cycleSidebar]);

  const unread = workspace?.alerts.filter((item) => !item.read).length ?? 0;
  const hits = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = needle
      ? suggestions.filter((item) => item.label.toLowerCase().includes(needle))
      : suggestions;
    return list.slice(0, 10);
  }, [query, suggestions]);

  const ToggleIcon = sidebar === "open" ? PanelLeftClose : sidebar === "collapsed" ? PanelLeft : PanelLeftOpen;

  return (
    <header
      ref={barRef}
      className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-white/10 bg-black/50 px-3 shadow-glass backdrop-blur-xl md:px-5"
    >
      <button
        type="button"
        onClick={cycleSidebar}
        className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-surface text-slate-400 hover:text-navy md:inline-flex"
        aria-label={`Sidebar ${sidebar}. Click to change.`}
        title="Toggle sidebar (Ctrl+B)"
      >
        <ToggleIcon className="h-4 w-4" />
      </button>

      <Link href="/dashboard" className="shrink-0">
        <WinroomLogo size="sm" markSize={32} />
      </Link>

      <div className="hidden min-w-0 items-center gap-2 md:flex">
        <span className="rounded-full bg-electric/10 px-2.5 py-1 font-brand text-[10px] font-bold uppercase tracking-[0.16em] text-electric">
          {scene.kicker}
        </span>
        <span className="truncate text-sm text-slate-500">{scene.label}</span>
      </div>

      <form
        className="relative ml-auto hidden min-w-[220px] max-w-md flex-1 lg:block"
        onSubmit={(event) => {
          event.preventDefault();
          const hit = hits[0];
          if (hit?.href) router.push(hit.href);
          else router.push(`/dashboard?q=${encodeURIComponent(query)}`);
          setOpenSearch(false);
        }}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpenSearch(true);
          }}
          onFocus={() => setOpenSearch(true)}
          placeholder="Jump to RFP, agency, teammate…"
          className="h-10 pl-9 pr-14"
        />
        <span className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">
          <Command className="h-3 w-3" />K
        </span>
        {openSearch ? (
          <div className="glass glass-static absolute z-50 mt-2 w-full overflow-hidden rounded-2xl p-2 shadow-glass">
            {hits.length ? (
              hits.map((item) => (
                <button
                  key={`${item.group}-${item.value}-${item.href ?? ""}`}
                  type="button"
                  onClick={() => {
                    setQuery(item.value);
                    setOpenSearch(false);
                    if (item.href) router.push(item.href);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-white/5"
                >
                  <span className="text-navy">{item.label}</span>
                  <span className="text-[10px] uppercase text-slate-400">{item.group}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-3 text-xs text-slate-400">No matches</p>
            )}
          </div>
        ) : null}
      </form>

      <div className="ml-auto flex items-center gap-2 lg:ml-0">
        <button
          type="button"
          onClick={() => void act({ type: "runDiscovery" })}
          className="hidden h-10 items-center gap-1.5 rounded-xl bg-electric px-3 text-xs font-semibold text-white shadow-glow-sm md:inline-flex"
        >
          <Radar className="h-3.5 w-3.5" />
          Discover
        </button>
        <Link
          href="/dashboard/intel"
          className="hidden h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-surface px-3 text-xs font-semibold text-navy hover:border-electric/40 md:inline-flex"
        >
          <Plus className="h-3.5 w-3.5" />
          RFP
        </Link>

        <span className="hidden items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[11px] text-emerald-700 sm:inline-flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          {workspace?.bids.length ?? 0} live
        </span>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setOpenAlerts((v) => !v);
              setOpenUser(false);
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-surface text-slate-500 hover:text-navy"
            aria-label="Alerts"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 ? <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-electric" /> : null}
          </button>
          {openAlerts ? (
            <div className="glass glass-static absolute right-0 z-50 mt-2 w-80 rounded-2xl p-2 shadow-glass">
              <div className="flex items-center justify-between px-2 py-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Alerts</p>
                <button type="button" className="text-[11px] text-electric" onClick={() => void act({ type: "markAllAlertsRead" })}>
                  Mark all read
                </button>
              </div>
              {(workspace?.alerts ?? []).slice(0, 7).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    void act({ type: "markAlertRead", payload: { id: item.id } }, true);
                    setOpenAlerts(false);
                    router.push(item.href);
                  }}
                  className={cn("w-full rounded-xl px-3 py-2 text-left hover:bg-white/5", item.read && "opacity-50")}
                >
                  <p className="text-sm font-medium text-navy">{item.title}</p>
                  <p className="text-[11px] text-slate-500">{item.body}</p>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setOpenUser((v) => !v);
              setOpenAlerts(false);
            }}
            className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-surface px-2.5 text-slate-400"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-electric/15 text-[10px] font-semibold text-electric">
              {user.name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)}
            </span>
            <span className="hidden max-w-[110px] truncate text-xs font-medium text-navy sm:block">{user.name}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {openUser ? (
            <div className="glass glass-static absolute right-0 z-50 mt-2 w-56 rounded-2xl p-2 shadow-glass">
              <p className="px-3 py-2 text-[11px] text-slate-400">{user.email}</p>
              <p className="px-3 pb-2 text-[11px] uppercase tracking-wider text-electric">{workspace?.billing.plan} plan</p>
              <Link href="/dashboard/settings" onClick={() => setOpenUser(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/5">
                <Settings className="h-3.5 w-3.5 text-electric" />
                Settings
              </Link>
              <Link href="/dashboard/team" onClick={() => setOpenUser(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/5">
                <UserRound className="h-3.5 w-3.5 text-electric" />
                Team
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-white/5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
