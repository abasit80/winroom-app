export type ExtractedItem = {
  id: string;
  title: string;
  price?: string;
  currency?: string;
  image?: string;
  category?: string;
  selector: string;
  confidence: number;
  fields: Record<string, string>;
  confirmed: boolean;
};

export type PageSchema = {
  url: string;
  pageType: "product_listing" | "company_directory" | "article" | "unknown";
  title: string;
  summary: string;
  screenshotHint: string;
  items: ExtractedItem[];
  healing?: HealingEvent;
};

export type HealingEvent = {
  brokenSelector: string;
  reason: string;
  suggestedSelector: string;
  strategy: string;
  confidence: number;
};

export type LiveLog = {
  id: string;
  ts: string;
  level: "info" | "warn" | "success" | "error" | "ai";
  message: string;
};

export type CompanyRecord = {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  location?: string;
  employees?: string;
  linkedin?: string;
  techStack?: string[];
  latestNews?: string;
  confidence: number;
  enriched: boolean;
  hallucinationRisk: "low" | "medium" | "high";
};

export type ScrapedRow = {
  id: number;
  source: string;
  entity: string;
  field: string;
  value: string;
  confidence: number;
  status: "clean" | "duplicate" | "flagged" | "enriched";
  extractedAt: string;
};

export type WorkflowNodeData = {
  label: string;
  kind: "trigger" | "browser" | "extract" | "ai" | "output";
  status?: "idle" | "running" | "done";
};
