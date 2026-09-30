"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { WinroomLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageFx } from "@/components/visuals/page-fx";
import { safeNextPath } from "@/lib/auth";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const gated = Boolean(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not sign in.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Could not reach the sign-in wall.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4">
      <PageFx />
      <div className="pointer-events-none absolute left-[12%] top-[18%] hidden h-24 w-40 rounded-2xl border border-electric/15 bg-electric/5 shadow-glass blur-[0.3px] md:block" />
      <div className="pointer-events-none absolute bottom-[16%] right-[10%] hidden h-28 w-36 rounded-2xl border border-electric/15 bg-black/30 shadow-glass md:block" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass glass-static card-sheen relative z-10 w-full max-w-md rounded-2xl p-8 shadow-glass"
      >
        <WinroomLogo size="lg" />
        <div className="mt-6 flex items-center gap-2 text-electric">
          <Lock className="h-4 w-4" />
          <span className="font-brand text-xs font-bold uppercase tracking-[0.18em]">Protected system</span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-navy">
          {gated ? "Sign in to Winroom" : "Log in to Winroom"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Only registered accounts can enter the capture desk. Don&apos;t have one yet? Sign up first.
        </p>
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <Input
            type="email"
            placeholder="Work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="current-password"
          />
          {error ? <p className="text-xs text-rose-400">{error}</p> : null}
          <Button type="submit" className="mt-2 w-full rounded-xl" disabled={pending}>
            {pending ? "Checking account…" : "Log in"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{" "}
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-navy hover:text-electric">
            Sign up
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-slate-400">
          <Link href="/" className="hover:text-navy">
            Back to the public site
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
