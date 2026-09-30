import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const MODULES = [
  { href: "/dashboard", title: "RFP Discovery", body: "SAM matches, filters, and add-RFP ingest." },
  { href: "/dashboard/analyzer/it-infra", title: "RFP Analyzer", body: "Document, matrix, go/no-go, copilot." },
  { href: "/dashboard/vault", title: "Vault", body: "Pinned RFPs and proposal artifacts." },
  { href: "/dashboard/automation", title: "Automation", body: "Discovery, deadline, and CRM agents." },
  { href: "/dashboard/proposals", title: "Proposals", body: "Volume I–III drafts with review states." },
  { href: "/dashboard/connectors", title: "Connectors", body: "Salesforce, HubSpot, Slack, SharePoint." },
];

export function PlatformPreview() {
  return (
    <section id="platform" className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 md:px-10">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Workspace</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy">The workspace sits behind a login wall</h2>
      <p className="mt-2 max-w-xl text-sm text-slate-500">
        These modules are live in the product. You&apos;ll be asked to sign in before any of them open.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="glass glass-lift card-sheen group flex items-start justify-between rounded-2xl p-4"
          >
            <div>
              <h3 className="text-sm font-semibold text-navy">{item.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{item.body}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-electric" />
          </Link>
        ))}
      </div>
    </section>
  );
}
