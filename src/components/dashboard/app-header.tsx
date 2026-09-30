"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, Building2, FileSearch, Search, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSuggestions } from "@/components/workspace/workspace-provider";
import type { SearchSuggestion } from "@/lib/workspace/types";
import { sceneForPath } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

export function AppHeader({
  title,
  subtitle,
  query,
  onQueryChange,
  searchPlaceholder = "Filter this board…",
  suggestions,
}: {
  title: string;
  subtitle: string;
  query?: string;
  onQueryChange?: (value: string) => void;
  searchPlaceholder?: string;
  suggestions?: SearchSuggestion[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const scene = sceneForPath(pathname);
  const Icon = scene.icon;
  const globalSuggestions = useSuggestions();
  const list = suggestions ?? globalSuggestions;
  const [localQuery, setLocalQuery] = useState(query ?? "");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (query !== undefined) setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) setSuggestOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const value = query !== undefined ? query : localQuery;

  const filteredSuggestions = useMemo(() => {
    const needle = value.trim().toLowerCase();
    const next = needle
      ? list.filter((item) => item.label.toLowerCase().includes(needle) || item.group.toLowerCase().includes(needle))
      : list;
    return next.slice(0, 12);
  }, [list, value]);

  const grouped = useMemo(() => {
    const map = new Map<SearchSuggestion["group"], SearchSuggestion[]>();
    for (const item of filteredSuggestions) {
      const bucket = map.get(item.group) ?? [];
      bucket.push(item);
      map.set(item.group, bucket);
    }
    return map;
  }, [filteredSuggestions]);

  const groupIcon = {
    Teammates: UserRound,
    Roles: Briefcase,
    Agencies: Building2,
    RFPs: FileSearch,
  };

  return (
    <div className={cn("masthead mb-6 overflow-hidden rounded-3xl border border-electric/15 p-5 shadow-glass md:p-6", `masthead-${scene.scene}`)}>
      <div className="relative z-[1] flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="masthead-icon flex h-12 w-12 items-center justify-center rounded-2xl">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-brand text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">{scene.kicker}</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white md:text-3xl">{title}</h1>
            <p className="mt-1 max-w-xl text-sm text-white/75">{subtitle}</p>
          </div>
        </div>
        <form
          ref={searchRef}
          className="relative w-full lg:w-80"
          onSubmit={(event) => {
            event.preventDefault();
            if (onQueryChange) {
              onQueryChange(value);
              return;
            }
            const hit = list.find((item) => item.label.toLowerCase() === value.trim().toLowerCase() && item.href);
            if (hit?.href) router.push(hit.href);
          }}
        >
          <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-white/70" />
          <Input
            value={value}
            onChange={(event) => {
              setLocalQuery(event.target.value);
              onQueryChange?.(event.target.value);
              setSuggestOpen(true);
            }}
            onFocus={() => setSuggestOpen(true)}
            placeholder={searchPlaceholder}
            className="h-11 border-white/20 bg-white/15 pl-9 text-white placeholder:text-white/55 focus:border-white/40"
            autoComplete="off"
          />
          {suggestOpen && filteredSuggestions.length > 0 ? (
            <div className="absolute right-0 z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-white/10 bg-surface p-2 shadow-glass">
              {Array.from(grouped.entries()).map(([group, items]) => {
                const GroupIcon = groupIcon[group];
                return (
                  <div key={group}>
                    <p className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      <GroupIcon className="h-3 w-3" />
                      {group}
                    </p>
                    {items.map((item) => (
                      <button
                        key={`${item.group}-${item.value}-${item.href ?? ""}`}
                        type="button"
                        onClick={() => {
                          setLocalQuery(item.value);
                          onQueryChange?.(item.value);
                          setSuggestOpen(false);
                          if (item.href) router.push(item.href);
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/5"
                      >
                        <span>{item.label}</span>
                        <span className="text-[10px] uppercase text-slate-400">{item.group}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
