import { Suspense } from "react";
import { VaultBoard } from "@/components/dashboard/vault-board";

export default function VaultPage() {
  return (
    <Suspense>
      <VaultBoard />
    </Suspense>
  );
}
