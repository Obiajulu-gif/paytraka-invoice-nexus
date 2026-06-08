"use client";

import dynamic from "next/dynamic";
import { LoadingCards, PageHeader } from "@/components/AppPrimitives";

const Invoices = dynamic(() => import("@/screens/Invoices"), {
  ssr: false,
  loading: () => (
    <div className="app-section">
      <PageHeader
        eyebrow="Invoice management"
        title="Invoices"
        description="Loading invoice records."
      />
      <LoadingCards count={4} />
    </div>
  ),
});

export default function InvoicesPage() {
  return <Invoices />;
}
