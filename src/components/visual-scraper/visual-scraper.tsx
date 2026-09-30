"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, ScanSearch } from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockItemsForUrl, normalizeUrl } from "@/lib/mock/data";
import type { ExtractedItem, PageSchema } from "@/lib/types";
import { cn } from "@/lib/utils";

const DEMO_URL = "https://demo.scrapemaster.ai/catalog";

function demoSchema(link: string): PageSchema {
  const url = normalizeUrl(link);
  const items = mockItemsForUrl(url);
  return {
    url,
    pageType: "product_listing",
    title: "Demo catalog",
    summary: "Sample products from this page.",
    screenshotHint: "Demo preview",
    items,
  };
}

export function VisualScraper() {
  const seeded = useMemo(() => demoSchema(DEMO_URL), []);
  const [url, setUrl] = useState(DEMO_URL);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<PageSchema>(seeded);
  const [items, setItems] = useState<ExtractedItem[]>(seeded.items);

  const confirmed = useMemo(() => items.filter((i) => i.confirmed), [items]);

  async function analyze() {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as PageSchema;
      const nextItems = data.items?.length ? data.items : mockItemsForUrl(url);
      setSchema({ ...data, items: nextItems, url: data.url || normalizeUrl(url) });
      setItems(nextItems);
      toast.success(`${nextItems.length} items mil gaye`);
    } catch {
      const fallback = demoSchema(url);
      setSchema(fallback);
      setItems(fallback.items);
      toast.success(`${fallback.items.length} sample items mil gaye`);
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, confirmed: !item.confirmed } : item)));
  }

  return (
    <div>
      <Topbar
        title="Copy from a website"
        subtitle="Neeche pehle se sample products hain. Naya link paste karke Analyze page dabao."
      />

      <form
        className="mb-6 flex flex-col gap-3 md:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void analyze();
        }}
      >
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://store.example.com/collections/new"
          className="h-12 border-violet-200 focus:border-violet-400"
        />
        <Button type="submit" disabled={loading} className="h-12 md:w-52">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanSearch className="mr-2 h-4 w-4" />}
          Analyze page
        </Button>
      </form>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 truncate font-mono">{schema.url}</span>
          </div>
          <div className="relative min-h-[540px] bg-white">
            {loading ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm font-medium text-violet-700">
                Page padh raha hai…
              </div>
            ) : null}
            <PagePreview url={schema.url} items={items} />
          </div>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Items found</p>
              <p className="text-xs text-gray-500">{items.length} products — click to keep</p>
            </div>
            <Badge>{confirmed.length} kept</Badge>
          </div>
          <div className="grid max-h-[540px] gap-3 overflow-auto pr-1">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
              >
                <button className="w-full text-left" onClick={() => toggle(item.id)}>
                  <Card
                    className={cn(
                      "transition hover:border-violet-300",
                      item.confirmed && "border-emerald-400 shadow-glow-sm",
                    )}
                  >
                    <CardContent className="flex gap-4 p-4">
                      <ProductThumb item={item} className="h-16 w-20" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate font-medium text-gray-900">{item.title}</p>
                          {item.confirmed ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Badge tone="zinc">keep this</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-violet-600">
                          {item.price} · {item.category}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-gray-400">Click to keep</p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                            style={{ width: `${item.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PagePreview({ url, items }: { url: string; items: ExtractedItem[] }) {
  const host = (() => {
    try {
      return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    } catch {
      return "preview";
    }
  })();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-500">{host}</p>
          <h2 className="text-2xl font-semibold text-gray-900">Page preview</h2>
        </div>
        <Badge tone="teal">{items.length} items</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "rounded-xl border border-gray-100 bg-gray-50 p-3",
              item.confirmed && "ring-1 ring-emerald-400/50",
            )}
          >
            <ProductThumb item={item} className="mb-2 h-24 w-full" />
            <p className="truncate text-xs font-medium text-gray-800">{item.title}</p>
            <p className="text-[11px] text-violet-600">{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductThumb({ item, className }: { item: ExtractedItem; className?: string }) {
  const [broken, setBroken] = useState(false);

  return (
    <div className={cn("shrink-0 overflow-hidden rounded-lg bg-violet-100", className)}>
      {!broken && item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-200 to-fuchsia-100 px-2 text-center text-[10px] font-semibold text-violet-800">
          {item.title}
        </div>
      )}
    </div>
  );
}
