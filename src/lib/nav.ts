import { FileSearch, Workflow, Database, Sparkles, Activity, Plug, HeartPulse } from "lucide-react";

export const NAV = [
  { href: "/", label: "Home", hint: "Command center", icon: Activity },
  { href: "/visual-scraper", label: "Visual scraper", hint: "Map a page", icon: FileSearch },
  { href: "/live", label: "Live", hint: "Shadow browser", icon: Sparkles },
  { href: "/data", label: "Data", hint: "Row stream", icon: Database },
  { href: "/enrich", label: "Enrich", hint: "Company intel", icon: Sparkles },
  { href: "/workflows", label: "Workflows", hint: "Node canvas", icon: Workflow },
  { href: "/healing", label: "Healing", hint: "Selector repair", icon: HeartPulse },
  { href: "/connectors", label: "Connectors", hint: "CRM sync", icon: Plug },
];

export const HEADER_LINKS = NAV.map(({ href, label }) => ({ href, label }));
