import type { HealingEvent } from "@/lib/types";

const STRATEGIES = [
  {
    reason: "DOM fingerprint drift — class hash changed after a frontend deploy.",
    suggested: (broken: string) => broken.replace(/\.[a-z0-9_-]{6,}/i, "[data-sku]"),
    strategy: "Prefer stable data-* attributes over hashed CSS modules.",
  },
  {
    reason: "List container moved from <ul> to CSS grid of <article> nodes.",
    suggested: () => "main [data-testid='product-grid'] article",
    strategy: "Re-anchor on semantic landmarks, then re-learn child cards.",
  },
  {
    reason: "Price node wrapped in a new span.sale-price after A/B test.",
    suggested: () => "[itemprop='price'], .price, [data-price]",
    strategy: "Union selector with schema.org microdata fallback.",
  },
];

export function simulateSelfHeal(brokenSelector: string): HealingEvent {
  const pick = STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)];
  return {
    brokenSelector,
    reason: pick.reason,
    suggestedSelector: pick.suggested(brokenSelector),
    strategy: pick.strategy,
    confidence: 0.91 + Math.random() * 0.07,
  };
}

export function healIfBroken<T extends { selector: string; confidence: number }>(
  items: T[],
  failRate = 0.22,
) {
  const healed = items.map((item) => {
    const broken = Math.random() < failRate;
    if (!broken) return { item, event: null as HealingEvent | null };
    const event = simulateSelfHeal(item.selector);
    return {
      item: { ...item, selector: event.suggestedSelector, confidence: event.confidence },
      event,
    };
  });
  return healed;
}
