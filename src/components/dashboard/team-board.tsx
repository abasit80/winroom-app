"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, X } from "lucide-react";
import { AppHeader } from "@/components/dashboard/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { initials, memberSearchHaystack } from "@/lib/workspace/selectors";
import type { TeamAvailability, TeamMember } from "@/lib/workspace/types";
import { cn } from "@/lib/utils";

const AVAIL_LABEL: Record<TeamAvailability, string> = {
  available: "Available",
  "in-orals": "In orals",
  "on-deadline": "On deadline",
};

export function TeamBoard() {
  const { workspace, act } = useWorkspace();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [compose, setCompose] = useState(false);

  const members = workspace?.team ?? [];
  const bids = workspace?.bids ?? [];
  const needle = query.trim().toLowerCase();
  const visible = members.filter((member) => !needle || memberSearchHaystack(member, bids).includes(needle));
  const active = members.find((member) => member.id === activeId) ?? null;

  function cycleAvailability(memberId: string, current: TeamAvailability) {
    const order: TeamAvailability[] = ["available", "in-orals", "on-deadline"];
    const next = order[(order.indexOf(current) + 1) % order.length];
    void act({ type: "setAvailability", payload: { memberId, availability: next } });
  }

  return (
    <>
      <AppHeader title="Team" subtitle="The capture desk assigned to live opportunities." query={query} onQueryChange={setQuery} />
      <div className="mb-4 flex justify-end">
        <Button size="sm" className="rounded-xl" onClick={() => setCompose(true)}>
          Add teammate
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((member) => (
          <button key={member.id} type="button" onClick={() => setActiveId(member.id)} className="glass glass-lift rounded-2xl p-5 text-left">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-electric/20 text-sm font-semibold text-electric">
                {initials(member.name)}
              </div>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  member.availability === "available" && "border-electric/30 text-electric",
                  member.availability === "in-orals" && "border-electric/40 text-electric",
                  member.availability === "on-deadline" && "border-amber-400/40 text-amber-600",
                )}
              >
                {AVAIL_LABEL[member.availability]}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-navy">{member.name}</h3>
            <p className="text-xs text-slate-500">{member.role}</p>
            <p className="mt-2 text-[11px] text-slate-400">{member.focus}</p>
          </button>
        ))}
      </div>

      {active ? (
        <MemberDrawer
          member={active}
          onClose={() => setActiveId(null)}
          onToggleBid={(bidId) => void act({ type: "assignMember", payload: { memberId: active.id, bidId } })}
          onCycleAvailability={() => cycleAvailability(active.id, active.availability)}
        />
      ) : null}
      {compose ? <AddMember onClose={() => setCompose(false)} /> : null}
    </>
  );
}

function MemberDrawer({
  member,
  onClose,
  onToggleBid,
  onCycleAvailability,
}: {
  member: TeamMember;
  onClose: () => void;
  onToggleBid: (bidId: string) => void;
  onCycleAvailability: () => void;
}) {
  const { workspace } = useWorkspace();
  const bids = workspace?.bids ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div className="glass glass-static max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 shadow-glass" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-electric/20 text-sm font-semibold text-electric">{initials(member.name)}</div>
            <div>
              <h2 className="text-lg font-semibold text-navy">{member.name}</h2>
              <p className="text-sm text-slate-500">{member.role}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:text-navy">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm leading-relaxed text-slate-500">{member.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600">
            <Mail className="h-3.5 w-3.5 text-electric" />
            {member.email}
          </a>
          <a href={`tel:${member.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600">
            <Phone className="h-3.5 w-3.5 text-electric" />
            {member.phone}
          </a>
          <button type="button" onClick={onCycleAvailability} className="rounded-xl bg-electric px-3 py-2 text-xs font-semibold text-white">
            Change status · {AVAIL_LABEL[member.availability]}
          </button>
        </div>
        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned opportunities</h3>
        <ul className="mt-2 space-y-2">
          {bids.map((bid) => {
            const assigned = member.assignedBidIds.includes(bid.id);
            return (
              <li key={bid.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                <Link href={`/dashboard/analyzer/${bid.id}`} className="min-w-0 flex-1" onClick={onClose}>
                  <p className="truncate text-sm text-navy">{bid.title}</p>
                  <p className="text-[11px] text-slate-400">{bid.rfpId}</p>
                </Link>
                <button
                  type="button"
                  onClick={() => onToggleBid(bid.id)}
                  className={cn("ml-3 rounded-full px-2.5 py-1 text-[11px] font-medium", assigned ? "bg-electric/20 text-electric" : "border border-slate-200 text-slate-500")}
                >
                  {assigned ? "Assigned" : "Assign"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function AddMember({ onClose }: { onClose: () => void }) {
  const { act } = useWorkspace();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Capture Specialist");
  const [email, setEmail] = useState("");
  const [focus, setFocus] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div className="glass glass-static w-full max-w-md rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-navy">Add teammate</h2>
        <div className="mt-4 space-y-3">
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Focus (DoD · VA)" value={focus} onChange={(e) => setFocus(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={!name || !email}
              onClick={async () => {
                const result = await act({ type: "addMember", payload: { name, role, email, focus } });
                if (result) onClose();
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
