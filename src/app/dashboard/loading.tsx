import { DashboardPageLoader } from "@/components/dashboard/ui";

export default function DashboardLoading() {
  return (
    <div className="dashboard-theme min-h-screen bg-[#F7F9FB] px-3 py-5 text-[#191C1E] sm:px-6 sm:py-6 lg:px-8">
      <DashboardPageLoader title="Loading dashboard page" />
    </div>
  );
}
