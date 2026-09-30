"use client";

import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
      className="mt-3 flex items-center gap-2 text-xs text-slate-500 transition hover:text-navy"
    >
      <LogOut className="h-3.5 w-3.5" />
      Sign out
    </button>
  );
}
