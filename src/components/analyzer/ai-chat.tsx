"use client";

import { FormEvent, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { Bid } from "@/lib/workspace/types";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

function seed(bid: Bid): Message[] {
  return [
    {
      role: "assistant",
      content: `I've analyzed ${bid.rfpId}. ${bid.value} ${bid.agency} acquisition for ${bid.title}, ${bid.duration}, ${bid.bidders} bidders, win probability ${bid.winProbability}%. Ask about requirements, incumbents, evaluation factors, or a go/no-go call.`,
    },
  ];
}

export function AiChat({ bid }: { bid: Bid }) {
  const [messages, setMessages] = useState<Message[]>(() => seed(bid));
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || pending) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/rfp-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bid, messages: next }),
      });
      const data = (await res.json()) as { reply?: string };
      setMessages([...next, { role: "assistant", content: data.reply || "I could not reach the copilot." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Network error — try again." }]);
    } finally {
      setPending(false);
      window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="glass glass-static flex min-h-[280px] flex-1 flex-col overflow-hidden rounded-2xl">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-sm font-medium text-navy">RFP Copilot</p>
        <p className="text-[11px] text-slate-400">Grounded on the solicitation + award history</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
              message.role === "assistant" ? "bg-white/5 text-slate-300" : "ml-auto bg-electric text-canvas",
            )}
          >
            {message.content}
          </div>
        ))}
        {pending ? <p className="text-xs text-slate-400">Thinking…</p> : null}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={onSubmit} className="flex gap-2 border-t border-white/10 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about shall-statements, dates, go/no-go…"
          className="h-10 flex-1 rounded-xl border border-white/10 bg-surface px-3 text-sm outline-none focus:border-electric/50"
        />
        <button type="submit" disabled={pending} className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric text-canvas">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
