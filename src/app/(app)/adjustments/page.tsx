"use client";

import dynamic from "next/dynamic";
import { LoadingCards, PageHeader } from "@/components/AppPrimitives";

const Adjustments = dynamic(() => import("@/screens/Adjustments"), {
  ssr: false,
  loading: () => (
    <div className="app-section">
      <PageHeader
        eyebrow="Credit & Debit Notes"
        title="Credit & Debit Notes"
        description="Loading adjustment documents."
      />
      <LoadingCards count={4} />
    </div>
  ),
});

export default function AdjustmentsPage() {
  return <Adjustments />;
}
