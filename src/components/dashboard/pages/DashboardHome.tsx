import { AlertTriangle, CheckCircle2, ClipboardCheck, Plus, Truck, Users } from "lucide-react";
import Link from "next/link";
import { dashboardMetrics, recentSalesRows } from "../data";
import { Button, Card, ComplianceAlert, DataTable, MetricCard, StatusBadge, SupportCard, rowActions } from "../ui";
import { StatusTone } from "../types";

export function DashboardHome() {
  return (
    <>
      <div className="mb-6 flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0"><h1 className="text-3xl font-extrabold text-[#191C1E]">Company Dashboard</h1><p className="mt-1 text-sm text-[#454557]">Monitor invoices, compliance readiness, payments, and records health.</p></div>
        <Button href="/dashboard/invoices/create"><Plus className="h-4 w-4" /> Create Invoice</Button>
      </div>
      <ComplianceAlert title="Ready for Validation" text="Workspace configured for automated FIRS/NRS compliance reporting." badge="SYSTEM LIVE" tone="primary" action={<Button href="/dashboard/settings" variant="secondary">View Settings</Button>} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map(([label, value, meta, tone]) => <MetricCard key={label} label={label} value={value} meta={meta} tone={tone as StatusTone} />)}
      </div>
      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="flex items-center gap-3 text-lg font-bold"><ClipboardCheck className="h-5 w-5 text-[#1117E8]" /> Missing Field Checker</h2>
            <div className="mt-5 space-y-3">
              {[
                ["Customer TIN Missing (4)", "Required for B2B tax compliance", "danger", "/dashboard/customers"],
                ["VAT Configurations", "7.5% standard rate applied", "success", "/dashboard/settings"],
                ["Product HSN/Tax Codes (12)", "Missing codes for some catalog items", "danger", "/dashboard/products"],
              ].map(([title, text, tone, href]) => (
                <div key={title} className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${tone === "danger" ? "border-red-100 bg-red-50" : "border-transparent bg-[#F1F4F8]"}`}>
                  <div className="flex gap-3">{tone === "danger" ? <AlertTriangle className="h-5 w-5 text-red-600" /> : <CheckCircle2 className="h-5 w-5 text-green-700" />}<div><p className="font-bold">{title}</p><p className="text-sm text-[#454557]">{text}</p></div></div>
                  {tone === "danger" ? <Button variant="ghost" href={href}>Fix now</Button> : null}
                </div>
              ))}
            </div>
          </Card>
          <DataTable
            title="Recent Sales Invoices"
            columns={["Invoice ID", "Customer", "Amount", "Customer Status", "FIRS Status", "Date", "Actions"]}
            rows={recentSalesRows.map((item) => ({ "Invoice ID": <Link href="/dashboard/invoices/sales" className="font-bold text-[#0001B1]">{item.invoice}</Link>, Customer: item.customer, Amount: item.amount, "Customer Status": <StatusBadge>{item.customerStatus}</StatusBadge>, "FIRS Status": <StatusBadge>{item.firs}</StatusBadge>, Date: item.date, Actions: rowActions(undefined, item.invoice) }))}
            actions={<Link href="/dashboard/invoices/sales" className="text-sm font-bold text-[#0001B1]">All Invoices</Link>}
          />
          <Card className="p-6">
            <h2 className="text-lg font-bold">Business Records Health</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[["142 Customers", "128 active this month", "/dashboard/customers", Users], ["28 Suppliers", "4 pending verification", "/dashboard/suppliers", Truck]].map(([title, text, href, Icon]) => (
                <Link key={String(title)} href={String(href)} className="flex flex-col gap-3 rounded-xl border border-[#C5C4DA] bg-[#F7F9FB] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3"><span className="rounded-lg bg-[#DADEFD] p-3 text-[#0001B1]">{typeof Icon !== "string" ? <Icon className="h-5 w-5" /> : null}</span><div><p className="font-bold">{title as string}</p><p className="text-sm text-[#454557]">{text as string}</p></div></div>
                  <span className="font-bold text-[#0001B1]">Manage</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
        <SupportCard />
      </div>
    </>
  );
}
