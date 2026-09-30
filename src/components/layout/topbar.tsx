"use client";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-[28px]">{title}</h1>
      {subtitle ? <p className="mt-1.5 max-w-2xl text-sm text-gray-500">{subtitle}</p> : null}
    </header>
  );
}
