"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function LeadDialog({
  kind,
  onClose,
}: {
  kind: "contact" | "demo" | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <AnimatePresence>
      {kind ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="glass glass-static w-full max-w-md rounded-2xl p-6 shadow-glass"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-navy">
                  {kind === "demo" ? "Book a demo" : "Contact the capture desk"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {kind === "demo"
                    ? "We’ll walk through a live RFP analysis in 25 minutes."
                    : "Tell us about your pipeline and we’ll route you to the right team."}
                </p>
              </div>
              <button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-white/5 hover:text-navy">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              className="space-y-3"
              onSubmit={async (event) => {
                event.preventDefault();
                await fetch("/api/leads", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, email, kind }),
                });
                toast.success("Request received. Create an account to enter the workspace.");
                onClose();
                router.push("/signup?next=/dashboard");
              }}
            >
              <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full rounded-xl">
                {kind === "demo" ? "Request demo" : "Send message"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
