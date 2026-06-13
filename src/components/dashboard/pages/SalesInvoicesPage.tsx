"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { salesInvoiceRows } from "../data";
import { Button, ComplianceAlert, DashboardFormModal, DataTable, FilterBar, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

export function SalesInvoicesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [rows, setRows] = useState(salesInvoiceRows);

  function updateInvoice(invoiceId: string, status: string, firs?: string) {
    setRows((current) => current.map((row) => row[0] === invoiceId ? [row[0], row[1], row[2], row[3], row[4], status, firs ?? row[6]] : row));
  }

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
      <DataTable title="Recent Invoices" columns={["Invoice #", "Customer", "Issue Date", "Due Date", "Total Amount", "Status", "FIRS/NRS", "Actions"]} rows={rows.map(([invoice, customer, issue, due, total, status, firs]) => {
        const actions = (
          <div className="flex flex-wrap gap-2">
            {status !== "Sent" && status !== "Paid" ? <Button className="min-h-9 px-3" onClick={() => { updateInvoice(invoice, "Sent", firs === "Draft" ? "Ready" : firs); notifyDashboard(`${invoice} sent to ${customer}`); }}>Send</Button> : null}
            {status !== "Paid" ? <Button variant="secondary" className="min-h-9 px-3" onClick={() => { updateInvoice(invoice, "Paid", firs); notifyDashboard(`${invoice} marked as paid`); }}>Mark Paid</Button> : null}
            {firs === "Failed" ? <Button className="min-h-9 px-3" onClick={() => { updateInvoice(invoice, status, "Submitted"); notifyDashboard(`${invoice} submitted to FIRS/NRS queue`); }}>Submit FIRS</Button> : null}
          </div>
        );
        return { "Invoice #": <b className="text-[#0001B1]">{invoice}</b>, Customer: <span className="whitespace-pre-line font-semibold">{customer}</span>, "Issue Date": issue, "Due Date": due, "Total Amount": <b>{total}</b>, Status: <StatusBadge>{status}</StatusBadge>, "FIRS/NRS": <StatusBadge>{firs}</StatusBadge>, Actions: rowActions(actions, invoice) };
      })} footer="Showing 1-10 of 248 invoices" />
    </>
  );
}
