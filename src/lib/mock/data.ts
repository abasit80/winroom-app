import type { CompanyRecord, ExtractedItem, ScrapedRow } from "@/lib/types";
import { randomId } from "@/lib/utils";

const PRODUCT_POOL = [
  ["Aurora Neural Headset", "$1,249", "Wearables", "Neural interface with 128-channel EEG capture."],
  ["Obsidian GPU Cluster", "$18,400", "Compute", "8x rack-ready inference nodes for private LLMs."],
  ["Helix Data Vault", "$420", "Storage", "Encrypted edge cache with 4TB NVMe."],
  ["Pulse Sensor Array", "$89", "IoT", "Industrial telemetry kit with LoRaWAN."],
  ["Nimbus Edge Router", "$310", "Networking", "Zero-trust SD-WAN appliance."],
  ["Lumen Capture Lens", "$1,790", "Optics", "Global shutter camera for high-speed SKU ID."],
  ["Quark Label Printer", "$245", "Fulfillment", "Thermal printer with GS1 barcode firmware."],
  ["Atlas Crawler Node", "$2,050", "Infra", "Headless browser farm blade, 32GB RAM."],
  ["Cipher Proxy Mesh", "$99/mo", "Security", "Residential + DC rotation pool."],
  ["Vanta Extract SDK", "$0", "Software", "Open schema mapper for product grids."],
  ["Ion Battery Pack", "$640", "Energy", "48V field pack for mobile scrape bots."],
  ["Spectra Monitor 34", "$780", "Displays", "Ultrawide ops console with 144Hz."],
];

export function mockItemsForUrl(url: string): ExtractedItem[] {
  const host = safeHost(url);
  return PRODUCT_POOL.map(([title, price, category, desc], index) => ({
    id: randomId("item"),
    title,
    price,
    currency: "USD",
    category,
    selector: `.product-grid > article:nth-child(${index + 1}) .card`,
    confidence: Number((0.78 + ((index * 7) % 21) / 100).toFixed(2)),
    image: `https://picsum.photos/seed/${encodeURIComponent(title)}/480/320`,
    fields: {
      sku: `SM-${1000 + index}`,
      vendor: host.replace("www.", "") || "catalog.local",
      description: desc,
      availability: index % 5 === 0 ? "backorder" : "in_stock",
    },
    confirmed: false,
  }));
}

const COMPANIES: Array<Omit<CompanyRecord, "id" | "enriched" | "hallucinationRisk">> = [
  {
    name: "Northwind Robotics",
    website: "https://northwind.example",
    industry: "Industrial Automation",
    location: "Austin, TX",
    employees: "220–500",
    confidence: 0.94,
  },
  {
    name: "Helios Analytics",
    website: "https://helios.example",
    industry: "Business Intelligence",
    location: "London, UK",
    employees: "50–200",
    confidence: 0.91,
  },
  {
    name: "Kite & Copper",
    website: "https://kiteandcopper.example",
    industry: "Consumer Goods",
    location: "Portland, OR",
    employees: "11–50",
    confidence: 0.88,
  },
  {
    name: "Aether Cloud",
    website: "https://aethercloud.example",
    industry: "Infrastructure",
    location: "Singapore",
    employees: "500–1,000",
    confidence: 0.96,
  },
  {
    name: "Lumen Path Labs",
    website: "https://lumenpath.example",
    industry: "HealthTech",
    location: "Berlin, DE",
    employees: "50–200",
    confidence: 0.83,
  },
  {
    name: "Forge & Signal",
    website: "https://forgesignal.example",
    industry: "Cybersecurity",
    location: "Tel Aviv, IL",
    employees: "200–500",
    confidence: 0.9,
  },
  {
    name: "Maple Street Capital",
    website: "https://maplestreet.example",
    industry: "Fintech",
    location: "Toronto, CA",
    employees: "11–50",
    confidence: 0.79,
  },
  {
    name: "Indigo Harvest",
    website: "https://indigoharvest.example",
    industry: "AgTech",
    location: "Nairobi, KE",
    employees: "50–200",
    confidence: 0.86,
  },
];

export function mockCompanies(): CompanyRecord[] {
  return COMPANIES.map((company) => ({
    ...company,
    id: randomId("co"),
    enriched: false,
    hallucinationRisk: company.confidence > 0.9 ? "low" : company.confidence > 0.82 ? "medium" : "high",
  }));
}

const ENRICHMENT: Record<
  string,
  { linkedin: string; techStack: string[]; latestNews: string; industry: string }
> = {
  "Northwind Robotics": {
    linkedin: "https://www.linkedin.com/company/northwind-robotics",
    techStack: ["ROS2", "NVIDIA Isaac", "PostgreSQL", "Kafka"],
    latestNews: "Closed $42M Series B to expand warehouse cobots in Q3.",
    industry: "Industrial Automation",
  },
  "Helios Analytics": {
    linkedin: "https://www.linkedin.com/company/helios-analytics",
    techStack: ["dbt", "Snowflake", "React", "Looker"],
    latestNews: "Launched AI copilot for revenue operations dashboards.",
    industry: "Business Intelligence",
  },
  "Kite & Copper": {
    linkedin: "https://www.linkedin.com/company/kite-copper",
    techStack: ["Shopify", "Klaviyo", "GA4"],
    latestNews: "Opened a Portland flagship and expanded EU fulfillment.",
    industry: "Consumer Goods",
  },
  "Aether Cloud": {
    linkedin: "https://www.linkedin.com/company/aether-cloud",
    techStack: ["Kubernetes", "Cilium", "Go", "eBPF"],
    latestNews: "Announced a Tokyo region and SOC 2 Type II renewal.",
    industry: "Infrastructure",
  },
  "Lumen Path Labs": {
    linkedin: "https://www.linkedin.com/company/lumen-path-labs",
    techStack: ["FHIR", "Python", "FastAPI", "BigQuery"],
    latestNews: "Partnered with three EU hospital networks for trials.",
    industry: "HealthTech",
  },
  "Forge & Signal": {
    linkedin: "https://www.linkedin.com/company/forge-signal",
    techStack: ["Rust", "eBPF", "Okta", "ClickHouse"],
    latestNews: "Released an identity graph product for MSSPs.",
    industry: "Cybersecurity",
  },
  "Maple Street Capital": {
    linkedin: "https://www.linkedin.com/company/maple-street-capital",
    techStack: ["Plaid", "Next.js", "Stripe Treasury"],
    latestNews: "Received OSC sandbox approval for AI underwriting.",
    industry: "Fintech",
  },
  "Indigo Harvest": {
    linkedin: "https://www.linkedin.com/company/indigo-harvest",
    techStack: ["IoT Core", "TensorFlow", "PostGIS"],
    latestNews: "Deployed soil-sensing pilots across 12,000 hectares.",
    industry: "AgTech",
  },
};

export function enrichmentFor(name: string) {
  return (
    ENRICHMENT[name] ?? {
      linkedin: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(name)}`,
      techStack: ["Unknown"],
      latestNews: "No recent public filings detected in the last 30 days.",
      industry: "Unclassified",
    }
  );
}

const SOURCES = ["shop.northwind.io", "helios.dev/pricing", "aether.cloud/customers", "forge.signal/blog"];
const STATUSES: ScrapedRow["status"][] = ["clean", "clean", "clean", "enriched", "duplicate", "flagged"];

export function generateScrapedRows(count = 10000): ScrapedRow[] {
  const rows: ScrapedRow[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const company = COMPANIES[i % COMPANIES.length];
    const field = ["name", "price", "sku", "industry", "linkedin", "employees"][i % 6];
    rows.push({
      id: i + 1,
      source: SOURCES[i % SOURCES.length],
      entity: company.name,
      field,
      value: field === "price" ? `$${(19 + (i % 87)) * 10}` : `${company.name} · ${field}`,
      confidence: Number((0.62 + ((i * 13) % 38) / 100).toFixed(2)),
      status: STATUSES[i % STATUSES.length],
      extractedAt: new Date(now - i * 17000).toISOString(),
    });
  }
  return rows;
}

export const DASHBOARD_SERIES = [
  { day: "Mon", hours: 42, success: 96 },
  { day: "Tue", hours: 58, success: 94 },
  { day: "Wed", hours: 71, success: 97 },
  { day: "Thu", hours: 64, success: 93 },
  { day: "Fri", hours: 88, success: 98 },
  { day: "Sat", hours: 36, success: 95 },
  { day: "Sun", hours: 29, success: 99 },
];

function safeHost(url: string) {
  try {
    return new URL(normalizeUrl(url)).hostname;
  } catch {
    return "target.site";
  }
}

export function normalizeUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "https://example.com";
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}
