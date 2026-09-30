"use client";

import { OrbitVisual } from "@/components/visuals/orbit-visual";
import {
  DynamicsIcon,
  HubSpotIcon,
  PipedriveIcon,
  SalesforceIcon,
} from "@/components/landing/crm-icons";

const INNER = [
  { id: "hubspot", label: "HubSpot", icon: <HubSpotIcon size={18} /> },
  { id: "salesforce", label: "Salesforce", icon: <SalesforceIcon size={18} /> },
  { id: "pipedrive", label: "Pipedrive", icon: <PipedriveIcon size={18} /> },
  { id: "dynamics", label: "Dynamics", icon: <DynamicsIcon size={18} /> },
];

const OUTER = [
  { id: "dod", label: "Department of Defense", mark: "DoD", accent: "#c45c4a" },
  { id: "dhs", label: "Homeland Security", mark: "DHS", accent: "#4b7bec" },
  { id: "gsa", label: "GSA Cloud Vehicle", mark: "GSA", accent: "#6c8cff" },
  { id: "va", label: "Veterans Affairs", mark: "VA", accent: "#1f6feb" },
  { id: "az", label: "State of Arizona", mark: "AZ", accent: "#2f6bdb" },
  { id: "phx", label: "City of Phoenix", mark: "PHX", accent: "#64748b" },
];

export function LandingOrbit() {
  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-6 md:px-8">
      <p className="mb-2 text-center font-brand text-xs font-bold uppercase tracking-[0.22em] text-electric">
        Live intelligence orbit
      </p>
      <h2 className="mb-6 max-w-lg text-center font-display text-lg font-bold text-slate-600 md:text-xl">
        CRMs, agencies, and awards rotating around one Winroom graph
      </h2>
      <div className="w-full max-w-[560px]">
        <OrbitVisual inner={INNER} outer={OUTER} size={560} caption="Winroom core" />
      </div>
    </section>
  );
}
