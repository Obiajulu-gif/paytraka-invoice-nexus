"use client";

import { Banknote, CheckCircle2, Download, Eye, ReceiptText } from "lucide-react";
import { useState } from "react";
import { BottomInsight, Button, DashboardFormModal, DataTable, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

type ReceiptRecord = {
  number: string;
  customer: string;
  invoice: string;
  amount: string;
  method: string;
  date: string;
  status: "Matched" | "Unlinked" | "Reconciled" | "Draft";
};

const initialReceipts: ReceiptRecord[] = [
  { number: "RCP-2026-089", customer: "Aliko & Associates", invoice: "INV-10442", amount: "₦450,000.00", method: "Bank Transfer", date: "Oct 24, 2026", status: "Matched" },
  { number: "RCP-2026-090", customer: "Olu Clean Energy", invoice: "-", amount: "₦1,200,000.00", method: "POS", date: "Oct 23, 2026", status: "Unlinked" },
  { number: "RCP-2026-091", customer: "Kuda Digital Hub", invoice: "INV-10446", amount: "₦75,500.00", method: "Bank Transfer", date: "Oct 22, 2026", status: "Matched" },
  { number: "RCP-2026-092", customer: "Small Biz Ltd", invoice: "-", amount: "₦12,000.00", method: "Cash", date: "Oct 21, 2026", status: "Unlinked" },
];

export function ReceiptsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [rows, setRows] = useState(initialReceipts);

  function addReceipt() {
    setRows((current) => [
      { number: `RCP-2026-${String(93 + current.length - initialReceipts.length).padStart(3, "0")}`, customer: "New Lagos Customer", invoice: "INV-2026-0105", amount: "₦0.00", method: "Bank Transfer", date: "Today", status: "Draft" },
      ...current,
    ]);
  }

  function markReconciled(number: string) {
    setRows((current) => current.map((row) => row.number === number ? { ...row, status: "Reconciled" } : row));
    notifyDashboard(`${number} marked as reconciled`);
  }

  return (
    <>
      <PageHeader title="Receipts" subtitle="Track incoming payments and reconcile audit trails." action={<Button onClick={() => setModalOpen(true)}><ReceiptText className="h-4 w-4" /> Add Receipt</Button>} />
      <DashboardFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Payment"
        description="Record a customer payment and link it to an invoice."
        submitLabel="Save Receipt"
        fields={["Customer", "Invoice reference", "Amount received", "Payment method", "Payment date", "Transaction reference", "Notes"]}
        onSubmit={addReceipt}
        successMessage="Receipt saved"
      />
      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <MetricCard label="Total Received This Month" value="₦28.4M" meta="+12.4% vs last month" tone="success" icon={Banknote} />
        <MetricCard label="Outstanding Balance" value="₦14.4M" meta="Across 14 pending invoices" tone="warning" icon={ReceiptText} />
        <MetricCard label="Receipts Issued" value="96" meta="98% compliance score" icon={CheckCircle2} />
      </div>
      <DataTable
        title="Recent Transactions"
        columns={["Receipt #", "Customer", "Linked Invoice", "Amount", "Payment Method", "Date", "Status", "Actions"]}
        rows={rows.map((row) => ({
          "Receipt #": <b className="text-[#0001B1]">{row.number}</b>,
          Customer: row.customer,
          "Linked Invoice": row.invoice,
          Amount: <b>{row.amount}</b>,
          "Payment Method": row.method,
          Date: row.date,
          Status: <StatusBadge>{row.status}</StatusBadge>,
          Actions: rowActions(
            <>
              <button type="button" onClick={() => notifyDashboard(`${row.number} preview opened`)} aria-label={`View ${row.number}`} className="rounded p-1 text-[#454557]"><Eye className="h-4 w-4" /></button>
              <button type="button" onClick={() => notifyDashboard(`${row.number} PDF downloaded`)} aria-label={`Download ${row.number}`} className="rounded p-1 text-[#454557]"><Download className="h-4 w-4" /></button>
              {row.status !== "Reconciled" ? <Button variant="secondary" className="min-h-9 px-3" onClick={() => markReconciled(row.number)}>Reconcile</Button> : null}
            </>,
            row.number,
          ),
        }))}
        footer={`Showing ${rows.length} receipt entries`}
      />
      <BottomInsight title="Payment Reconciliation Health" asideTitle="Tax Compliance Tip" />
    </>
  );
}
