import Link from "next/link";
import { WinroomLogo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 px-6 py-8 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <WinroomLogo size="lg" />
        <nav className="flex flex-wrap gap-5 text-xs text-slate-400">
          <Link href="#features" className="hover:text-navy">
            Features
          </Link>
          <Link href="#platform" className="hover:text-navy">
            Platform
          </Link>
          <Link href="/pricing" className="hover:text-navy">
            Pricing
          </Link>
          <Link href="/dashboard" className="hover:text-navy">
            Dashboard
          </Link>
          <Link href="/signup" className="hover:text-navy">
            Sign up
          </Link>
          <Link href="/login" className="hover:text-navy">
            Log in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
