"use client";

import type { BidDocument } from "@/lib/workspace/types";

export function PdfViewer({ document }: { document: BidDocument }) {
  return (
    <div className="glass glass-static flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-navy">{document.uploadedName || `${document.rfpId}.pdf`}</p>
          <p className="text-[11px] text-slate-400">
            {document.agency} · {document.pages} pages
          </p>
        </div>
        <span className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400">
          Official solicitation
        </span>
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
        <article className="mx-auto min-h-full max-w-[640px] bg-[#f7f4ec] px-10 py-12 text-[#1b1b1b] shadow-2xl">
          <header className="border-b border-black/20 pb-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/50">United States Government</p>
            <h2 className="mt-2 text-lg font-bold">{document.agency}</h2>
            <p className="mt-1 text-sm">{document.title}</p>
            <p className="mt-2 font-mono text-xs">{document.rfpId}</p>
          </header>
          {document.sections.map((section) => (
            <section key={section.heading} className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wide">{section.heading}</h3>
              {section.body.map((para) => (
                <p key={para} className="mt-2 text-[13px] leading-relaxed text-black/80">
                  {para}
                </p>
              ))}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
