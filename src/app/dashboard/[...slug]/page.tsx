import { CompanyDashboard } from "@/components/dashboard/CompanyDashboard";
import { redirect } from "next/navigation";

export default async function DashboardRoute({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  if (slug?.join("/") === "kyc") redirect("/dashboard/my-company");
  return <CompanyDashboard slug={slug} />;
}
