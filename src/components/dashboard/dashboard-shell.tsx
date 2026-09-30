"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DeskTopbar } from "@/components/dashboard/desk-topbar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { PageScene } from "@/components/dashboard/page-scene";
import { ShellProvider } from "@/components/dashboard/shell-context";

export function DashboardShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: ReactNode;
}) {
  return (
    <ShellProvider>
      <div className="relative min-h-screen bg-canvas">
        <PageScene />
        <div className="relative z-10 flex min-h-screen flex-col">
          <DeskTopbar user={user} />
          <div className="flex min-h-0 flex-1">
            <AppSidebar user={user} />
            <main className="min-w-0 flex-1 px-4 py-5 pb-20 md:px-8 md:pb-8">{children}</main>
          </div>
        </div>
        <MobileNav />
      </div>
    </ShellProvider>
  );
}
