"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/dashboard/app-header";
import { BidGrid } from "@/components/dashboard/bid-grid";
import { OrbitCommand } from "@/components/dashboard/orbit-command";
import { useWorkspace } from "@/components/workspace/workspace-provider";

export default function DashboardPage() {
  return (
    <Suspense>
      <Discovery />
    </Suspense>
  );
}

function Discovery() {
  const searchParams = useSearchParams();
  const { workspace } = useWorkspace();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  return (
    <>
      <AppHeader
        title="RFP Discovery"
        subtitle={`${workspace?.bids.length ?? 0} opportunities scored by fit, value, and competitive pressure.`}
        query={query}
        onQueryChange={setQuery}
      />
      <OrbitCommand />
      <BidGrid query={query} />
    </>
  );
}
