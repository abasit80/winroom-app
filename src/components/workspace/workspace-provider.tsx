"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Workspace, WorkspaceAction } from "@/lib/workspace/types";
import { searchSuggestions } from "@/lib/workspace/selectors";

type Ctx = {
  workspace: Workspace | null;
  loading: boolean;
  act: (action: WorkspaceAction, silent?: boolean) => Promise<Workspace | null>;
  reload: () => Promise<void>;
};

const WorkspaceContext = createContext<Ctx | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const res = await fetch("/api/workspace");
    if (!res.ok) return;
    setWorkspace((await res.json()) as Workspace);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const act = useCallback(async (action: WorkspaceAction, silent = false) => {
    const res = await fetch("/api/workspace/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action),
    });
    const data = (await res.json()) as { workspace?: Workspace; message?: string; error?: string };
    if (!res.ok || !data.workspace) {
      if (!silent) toast.error(data.error || "Could not update the workspace.");
      return null;
    }
    setWorkspace(data.workspace);
    if (!silent && data.message) toast.success(data.message);
    return data.workspace;
  }, []);

  const value = useMemo(() => ({ workspace, loading, act, reload }), [workspace, loading, act, reload]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}

export function useSuggestions() {
  const { workspace } = useWorkspace();
  return workspace ? searchSuggestions(workspace) : [];
}
