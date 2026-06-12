import { Plus } from "lucide-react";
import { salesInvoiceRows } from "../data";
import { Button, ComplianceAlert, DataTable, FilterBar, MetricCard, PageHeader, StatusBadge, rowActions } from "../ui";

export function SalesInvoicesPage() {
  return (
    <>
      <PageHeader title="Sales Invoices" subtitle="Manage your SME billing and FIRS compliance status in real-time." action={<Button href="/dashboard/invoices/create"><Plus className="h-4 w-4" /> Create Sales Invoice</Button>} />
      <ComplianceAlert title="Validation Required" text="3 invoices are missing TIN data for FIRS submission. Fix Now" badge="3 Issues" />
      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_280px]"><FilterBar /><MetricCard label="Total Outstanding" value="₦12,450,000.00" meta="↗ 12% from last month" tone="primary" /></div>
      <DataTable title="Recent Invoices" columns={["Invoice #", "Customer", "Issue Date", "Due Date", "Total Amount", "Status", "FIRS/NRS", "Actions"]} rows={salesInvoiceRows.map(([invoice, customer, issue, due, total, status, firs]) => ({ "Invoice #": <b className="text-[#0001B1]">{invoice}</b>, Customer: <span className="whitespace-pre-line font-semibold">{customer}</span>, "Issue Date": issue, "Due Date": due, "Total Amount": <b>{total}</b>, Status: <StatusBadge>{status}</StatusBadge>, "FIRS/NRS": <StatusBadge>{firs}</StatusBadge>, Actions: rowActions(firs === "Failed" ? <Button className="min-h-9 px-3">Submit FIRS</Button> : null) }))} footer="Showing 1-10 of 248 invoices" />
    </>
  );
}
