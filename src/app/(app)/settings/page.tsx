"use client";

import dynamic from "next/dynamic";
import { LoadingCards, PageHeader } from "@/components/AppPrimitives";

const Settings = dynamic(() => import("@/screens/Settings"), {
  ssr: false,
  loading: () => (
    <div className="app-section">
      <PageHeader
        eyebrow="Workspace settings"
        title="Settings"
        description="Loading business settings."
      />
      <LoadingCards count={3} />
    </div>
  ),
});

export default function SettingsPage() {
  return <Settings />;
}
