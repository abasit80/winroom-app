import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WorkspaceProvider } from "@/components/workspace/workspace-provider";
import { SESSION_COOKIE } from "@/lib/auth";
import { verifySession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) {
    redirect("/login?next=/dashboard");
  }

  return (
    <WorkspaceProvider>
      <DashboardShell user={{ name: session.name, email: session.email }}>{children}</DashboardShell>
    </WorkspaceProvider>
  );
}
