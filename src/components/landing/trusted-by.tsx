export function TrustedBy() {
  return (
    <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-6 pb-10 pt-4 md:flex-row md:items-center md:px-10">
      <p className="max-w-xs text-sm leading-relaxed text-slate-500">
        Powering data workflows for innovative companies such as
      </p>
      <div className="flex flex-wrap items-center gap-10">
        <RogerLogo />
        <BloomfilterLogo />
        <EmpowerlyLogo />
      </div>
    </section>
  );
}

function RogerLogo() {
  return (
    <span className="text-[22px] font-semibold tracking-tight text-slate-500 transition hover:text-navy">
      Roger<span className="text-slate-500">.</span>
    </span>
  );
}

function BloomfilterLogo() {
  return (
    <span className="flex items-center gap-2 text-[18px] font-medium tracking-tight text-slate-500 transition hover:text-navy">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <circle cx="9" cy="12" r="5" fill="currentColor" opacity="0.85" />
        <circle cx="15" cy="12" r="5" fill="currentColor" opacity="0.45" />
      </svg>
      Bloomfilter
    </span>
  );
}

function EmpowerlyLogo() {
  return (
    <span className="flex items-center gap-2 text-[15px] font-bold tracking-[0.14em] text-slate-500 transition hover:text-navy">
      <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden>
        <path d="M3 10 L17 4 L17 16 Z" fill="currentColor" />
      </svg>
      EMPOWERLY
    </span>
  );
}
