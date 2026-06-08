"use client";

import dynamic from "next/dynamic";
import { LoadingCards, PageHeader } from "@/components/AppPrimitives";

const Products = dynamic(() => import("@/screens/Products"), {
  ssr: false,
  loading: () => (
    <div className="app-section">
      <PageHeader
        eyebrow="Billable catalog"
        title="Products & Services"
        description="Loading products and services."
      />
      <LoadingCards count={3} />
    </div>
  ),
});

export default function ProductsPage() {
  return <Products />;
}
