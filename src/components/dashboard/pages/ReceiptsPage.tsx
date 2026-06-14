"use client";

import { Banknote, CheckCircle2, ReceiptText } from "lucide-react";
import { useState } from "react";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { Pagination } from "@/components/ui/Pagination";
import { useInvoices } from "@/hooks/useInvoices";
import { useReceipts } from "@/hooks/useReceipts";
import { getApiErrorMessage } from "@/lib/api/client";
import { BottomInsight, Button, ComplianceAlert, DashboardFormModal, DataTable, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

export function ReceiptsPage() {
  const { receipts, pagination, pager, loading, error, create } = useReceipts();
  const { invoices } = useInvoices();
  const [modalOpen, setModalOpen] = useState(false);
  const totalReceived = receipts.reduce((sum, receipt) => sum + Number(receipt.amount_paid ?? 0), 0);

  async function createReceipt(values?: Record<string, string>) {
    const data = values ?? {};
    try {
      const invoiceInput = data["Sales invoice"]?.trim();
      const invoice = invoices.find((item) => item.id === invoiceInput || item.invoice_number === invoiceInput);
      const salesInvoiceId = invoice?.id ?? invoiceInput;
      if (!salesInvoiceId) throw new Error("Sales invoice is required.");
      const amountPaid = Number(data["Amount paid"] || 0);
      if (!Number.isFinite(amountPaid) || amountPaid <= 0) throw new Error("Amount paid must be greater than zero.");

      await create({
        sales_invoice_id: salesInvoiceId,
        amount_paid: amountPaid,
        payment_method: data["Payment method"]?.trim() || "bank_transfer",
        payment_date: data["Payment date"]?.trim() || new Date().toISOString().slice(0, 10),
        currency: data.Currency?.trim() || "NGN",
        note: data.Note?.trim() || undefined,
      });
    } catch (requestError) {
      throw new Error(getApiErrorMessage(requestError, "Unable to save receipt."));
    }
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
        fields={["Sales invoice", "Amount paid", "Payment method", "Payment date", "Currency", "Note"]}
        onSubmit={createReceipt}
        successMessage="Receipt saved"
      />
      {error ? <ComplianceAlert title="Unable to load receipts" text={error} /> : null}
      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <MetricCard label="Total Received This Page" value={<CurrencyAmount amount={totalReceived} />} meta="From loaded API receipts" tone="success" icon={Banknote} />
        <MetricCard label="Receipt Records" value={String(pagination?.total ?? receipts.length)} meta="Total API records" tone="warning" icon={ReceiptText} />
        <MetricCard label="Receipts Issued" value={String(receipts.length)} meta="Loaded on this page" icon={CheckCircle2} />
      </div>
      <DataTable
        title="Recent Transactions"
        columns={["Receipt ID", "Linked Invoice", "Amount", "Payment Method", "Date", "Currency", "Note", "Actions"]}
        rows={receipts.map((receipt) => ({
          "Receipt ID": <b className="text-[#0001B1]">{receipt.id}</b>,
          "Linked Invoice": receipt.sales_invoice_id,
          Amount: <b><CurrencyAmount amount={receipt.amount_paid} currency={receipt.currency} /></b>,
          "Payment Method": <StatusBadge>{receipt.payment_method}</StatusBadge>,
          Date: receipt.payment_date,
          Currency: receipt.currency,
          Note: receipt.note ?? "-",
          Actions: rowActions(undefined, receipt.id),
        }))}
        footer={loading ? "Loading API records..." : `Showing ${receipts.length} of ${pagination?.total ?? receipts.length} receipts`}
        footerActions={<Pagination pagination={pagination} onPageChange={pager.setPage} />}
      />
      <BottomInsight title="Payment Reconciliation Health" asideTitle="Tax Compliance Tip" />
    </>
  );
}
