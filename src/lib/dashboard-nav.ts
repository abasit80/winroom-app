import {
  BarChart3,
  Bot,
  FolderLock,
  LayoutGrid,
  Plug,
  Settings,
  Sparkles,
  Users,
  Workflow,
  FileText,
  type LucideIcon,
} from "lucide-react";

export type DeskScene =
  | "radar"
  | "scan"
  | "vault"
  | "folio"
  | "paper"
  | "circuit"
  | "flow"
  | "hex"
  | "chart"
  | "stars"
  | "dial"
  | "mosaic";

export type DeskNavItem = {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  scene: DeskScene;
  kicker: string;
};

export const DESK_NAV: DeskNavItem[] = [
  { href: "/dashboard", label: "RFP Discovery", hint: "Live SAM matches", icon: LayoutGrid, scene: "radar", kicker: "Orbit desk" },
  { href: "/dashboard/intel", label: "Intel ingest", hint: "Paste URL or text", icon: Sparkles, scene: "scan", kicker: "Signal intake" },
  { href: "/dashboard/vault", label: "Vault", hint: "Artifacts & pins", icon: FolderLock, scene: "vault", kicker: "Controlled hold" },
  { href: "/dashboard/proposals", label: "Proposals", hint: "AI drafts", icon: FileText, scene: "paper", kicker: "Volume studio" },
  { href: "/dashboard/automation", label: "Automation", hint: "Agents & alerts", icon: Bot, scene: "circuit", kicker: "Agent mesh" },
  { href: "/dashboard/workflows", label: "Workflows", hint: "Capture sprints", icon: Workflow, scene: "flow", kicker: "Sprint graph" },
  { href: "/dashboard/connectors", label: "Connectors", hint: "CRM & Slack", icon: Plug, scene: "hex", kicker: "Egress fabric" },
  { href: "/dashboard/analytics", label: "Analytics", hint: "Win rate & pipeline", icon: BarChart3, scene: "chart", kicker: "Pipeline lens" },
  { href: "/dashboard/team", label: "Team", hint: "Capture roster", icon: Users, scene: "stars", kicker: "Capture cell" },
  { href: "/dashboard/settings", label: "Settings", hint: "Profile & billing", icon: Settings, scene: "dial", kicker: "Desk controls" },
];

export function sceneForPath(pathname: string): DeskNavItem {
  if (pathname.startsWith("/dashboard/analyzer")) {
    return {
      href: pathname,
      label: "RFP Analyzer",
      hint: "Solicitation copilot",
      icon: FileText,
      scene: "folio",
      kicker: "Reading room",
    };
  }
  if (pathname.startsWith("/dashboard/more")) {
    return {
      href: "/dashboard/more",
      label: "More",
      hint: "The rest of the desk",
      icon: LayoutGrid,
      scene: "mosaic",
      kicker: "Module map",
    };
  }
  return (
    DESK_NAV.find((item) => (item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href))) ??
    DESK_NAV[0]
  );
}
