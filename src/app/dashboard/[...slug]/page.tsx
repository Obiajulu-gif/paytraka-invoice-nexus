import { CompanyDashboard } from "@/components/dashboard/CompanyDashboard";

export default async function DashboardRoute({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  return <CompanyDashboard slug={slug} />;
}
