"use client";

import dynamic from "next/dynamic";
import { LoadingCards, PageHeader } from "@/components/AppPrimitives";

const Receipts = dynamic(() => import("@/screens/Receipts"), {
  ssr: false,
  loading: () => (
    <div className="app-section">
      <PageHeader
        eyebrow="Payment records"
        title="Receipts"
        description="Loading receipt records."
      />
      <LoadingCards count={4} />
    </div>
  ),
});

export default function ReceiptsPage() {
  return <Receipts />;
}
