"use client";

import dynamic from "next/dynamic";
import { LoadingCards, PageHeader } from "@/components/AppPrimitives";

const Reports = dynamic(() => import("@/screens/Reports"), {
  ssr: false,
  loading: () => (
    <div className="app-section">
      <PageHeader
        eyebrow="Business reports"
        title="Reports"
        description="Loading revenue, invoice, and customer reports."
      />
      <LoadingCards count={5} />
    </div>
  ),
});

export default function ReportsPage() {
  return <Reports />;
}
