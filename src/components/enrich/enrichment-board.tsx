"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockCompanies } from "@/lib/mock/data";
import type { CompanyRecord } from "@/lib/types";

export function EnrichmentBoard() {
  const [companies, setCompanies] = useState<CompanyRecord[]>(() => mockCompanies());
  const [loading, setLoading] = useState(false);

  async function enrich() {
    setLoading(true);
    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companies }),
      });
      const data = (await res.json()) as { companies: CompanyRecord[] };
      setCompanies(data.companies);
      toast.success("Enrichment agent filled LinkedIn, industry, and news");
    } catch {
      toast.error("Enrichment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Topbar
        title="Add extra info"
        subtitle="We already have company names. Click the button to add LinkedIn, industry, and latest news."
      />
      <div className="mb-5">
        <Button onClick={() => void enrich()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Add extra info
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {companies.map((company) => (
          <Card key={company.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">{company.name}</CardTitle>
                <p className="text-xs text-gray-500">
                  {company.location} · {company.employees} employees
                </p>
              </div>
              <Badge tone={company.enriched ? "emerald" : "zinc"}>
                {company.enriched ? "updated" : "basic"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <Row label="Industry" value={company.industry} />
              <Row label="Website" value={company.website} />
              <Row label="LinkedIn" value={company.linkedin || "— pending —"} />
              <Row label="Tech stack" value={company.techStack?.join(" · ") || "—"} />
              <Row label="Latest news" value={company.latestNews || "—"} />
              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-gray-500">Confidence {company.confidence}</span>
                <Badge
                  tone={
                    company.hallucinationRisk === "low"
                      ? "emerald"
                      : company.hallucinationRisk === "medium"
                        ? "amber"
                        : "rose"
                  }
                >
                  extra check {company.hallucinationRisk}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <p>
      <span className="text-gray-500">{label}: </span>
      {value}
    </p>
  );
}
