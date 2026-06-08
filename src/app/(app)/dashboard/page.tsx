"use client";

import dynamic from "next/dynamic";
import { LoadingCards, PageHeader } from "@/components/AppPrimitives";

const Dashboard = dynamic(() => import("@/screens/Dashboard"), {
  ssr: false,
  loading: () => (
    <div className="app-section">
      <PageHeader
        eyebrow="Business overview"
        title="Welcome to Paytraka Invoice Nexus"
        description="Loading your revenue, invoice, receipt, and customer activity."
      />
      <LoadingCards count={6} />
    </div>
  ),
});

export default function DashboardPage() {
  return <Dashboard />;
}
