"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { salesInvoiceRows } from "../data";
import { Button, ComplianceAlert, DashboardFormModal, DataTable, FilterBar, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

export function SalesInvoicesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [rows, setRows] = useState(salesInvoiceRows);

  return (
    <>
      <PageHeader title="Sales Invoices" subtitle="Manage your SME billing and FIRS compliance status in real-time." action={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Create Sales Invoice</Button>} />
      <DashboardFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Sales Invoice"
        description="Create a quick sales invoice without leaving the invoice list."
        submitLabel="Create Invoice"
        fields={["Customer", "Invoice number", "Issue date", "Due date", "Items", "Notes"]}
        onSubmit={() => setRows((current) => [["INV-2026-0105", "New Lagos Customer", "Oct 25, 2026", "Nov 8, 2026", "₦0.00", "Draft", "Draft"], ...current])}
      />
      <ComplianceAlert title="Validation Required" text="3 invoices are missing TIN data for FIRS submission. Fix Now" badge="3 Issues" />
      <div className="mb-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]"><FilterBar /><MetricCard label="Total Outstanding" value="₦12,450,000.00" meta="↗ 12% from last month" tone="primary" /></div>
      <DataTable title="Recent Invoices" columns={["Invoice #", "Customer", "Issue Date", "Due Date", "Total Amount", "Status", "FIRS/NRS", "Actions"]} rows={rows.map(([invoice, customer, issue, due, total, status, firs]) => ({ "Invoice #": <b className="text-[#0001B1]">{invoice}</b>, Customer: <span className="whitespace-pre-line font-semibold">{customer}</span>, "Issue Date": issue, "Due Date": due, "Total Amount": <b>{total}</b>, Status: <StatusBadge>{status}</StatusBadge>, "FIRS/NRS": <StatusBadge>{firs}</StatusBadge>, Actions: rowActions(firs === "Failed" ? <Button className="min-h-9 px-3" onClick={() => notifyDashboard(`${invoice} submitted to FIRS/NRS queue`)}>Submit FIRS</Button> : null, invoice) }))} footer="Showing 1-10 of 248 invoices" />
    </>
  );
}
