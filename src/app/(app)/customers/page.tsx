"use client";

import dynamic from "next/dynamic";
import { LoadingCards, PageHeader } from "@/components/AppPrimitives";

const Customers = dynamic(() => import("@/screens/Customers"), {
  ssr: false,
  loading: () => (
    <div className="app-section">
      <PageHeader
        eyebrow="Customer records"
        title="Customers"
        description="Loading customer records."
      />
      <LoadingCards count={3} />
    </div>
  ),
});

export default function CustomersPage() {
  return <Customers />;
}
