"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, UserPlus } from "lucide-react";
import { WinroomLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageFx } from "@/components/visuals/page-fx";
import { safeNextPath } from "@/lib/auth";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not create the account.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Could not reach the sign-up wall.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4">
      <PageFx />
      <div className="pointer-events-none absolute left-[10%] top-[14%] hidden h-24 w-40 rounded-2xl border border-electric/15 bg-electric/5 shadow-glass md:block" />
      <div className="pointer-events-none absolute bottom-[14%] right-[12%] hidden h-28 w-36 rounded-2xl border border-electric/15 bg-black/30 shadow-glass md:block" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass glass-static card-sheen relative z-10 w-full max-w-md rounded-2xl p-8 shadow-glass"
      >
        <WinroomLogo size="lg" />
        <div className="mt-6 flex items-center gap-2 text-electric">
          <UserPlus className="h-4 w-4" />
          <span className="font-brand text-xs font-bold uppercase tracking-[0.18em]">Create access</span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-navy">Join Winroom</h1>
        <p className="mt-2 text-sm text-slate-500">
          Create an account first. After that you can log in — the workspace stays locked to everyone else.
        </p>
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <Input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            autoComplete="name"
          />
          <Input
            type="email"
            placeholder="Work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password (8+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          {error ? <p className="text-xs text-rose-400">{error}</p> : null}
          <Button type="submit" className="mt-2 w-full rounded-xl" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-navy hover:text-electric">
            Log in
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
