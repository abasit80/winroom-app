"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type SidebarMode = "open" | "collapsed" | "hidden";

const KEY = "winroom-sidebar-mode";

type ShellCtx = {
  sidebar: SidebarMode;
  cycleSidebar: () => void;
  setSidebar: (mode: SidebarMode) => void;
};

const Ctx = createContext<ShellCtx | null>(null);

const ORDER: SidebarMode[] = ["open", "collapsed", "hidden"];

export function ShellProvider({ children }: { children: ReactNode }) {
  const [sidebar, setSidebarState] = useState<SidebarMode>("open");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) as SidebarMode | null;
      if (stored && ORDER.includes(stored)) setSidebarState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const setSidebar = useCallback((mode: SidebarMode) => {
    setSidebarState(mode);
    localStorage.setItem(KEY, mode);
  }, []);

  const cycleSidebar = useCallback(() => {
    setSidebarState((current) => {
      const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
      localStorage.setItem(KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ sidebar, cycleSidebar, setSidebar }), [sidebar, cycleSidebar, setSidebar]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShell() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShell must be used inside ShellProvider");
  return ctx;
}
