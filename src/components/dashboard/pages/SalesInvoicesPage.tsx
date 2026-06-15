"use client";

import { Copy, Download, Edit3, Eye, Plus, Send, Trash2, X } from "lucide-react";
import { useState } from "react";
import { SalesInvoice } from "@/types/api";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { FirsGate } from "@/components/ui/FirsGate";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/hooks/useAuth";
import { useFirs } from "@/hooks/useFirs";
import { useInvoices } from "@/hooks/useInvoices";
import { Button, Card, ComplianceAlert, DashboardFormModal, DataTable, FilterBar, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

function invoiceTotal(invoice: { line_items?: { quantity: number; unit_price: number; tax_rate?: number }[]; discount_amount?: number }) {
  const subtotal = invoice.line_items?.reduce((sum, item) => {
    const lineBase = Number(item.quantity ?? 0) * Number(item.unit_price ?? 0);
    return sum + lineBase + (lineBase * Number(item.tax_rate ?? 0)) / 100;
  }, 0) ?? 0;
  return Math.max(subtotal - Number(invoice.discount_amount ?? 0), 0);
}

export function SalesInvoicesPage() {
  const { user } = useAuth();
  const { submit } = useFirs();
  const { invoices, pagination, pager, loading, error, create, post, update, remove, getInvoice } = useInvoices();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);
  const draftCount = invoices.filter((invoice) => invoice.status === "draft").length;
  const totalOutstanding = invoices.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0);

  async function handlePost(id: string) {
    if (!window.confirm("Post this invoice? Posted invoices can be submitted to FIRS.")) return;
    await post(id);
    notifyDashboard("Invoice posted");
  }

  async function handleFirsSubmit(invoiceId: string) {
    await submit({ invoice_id: invoiceId });
    notifyDashboard("Invoice submitted to FIRS/NRS queue");
  }

  async function handleView(invoice: SalesInvoice) {
    try {
      const response = await getInvoice(invoice.id);
      setSelectedInvoice(response.data);
    } catch {
      setSelectedInvoice(invoice);
    }
  }

  async function handleEdit(invoice: SalesInvoice) {
    const notes = window.prompt("Update invoice notes", invoice.notes ?? "");
    if (notes === null) return;
    await update(invoice.id, { notes });
    notifyDashboard(`${invoice.invoice_number} updated`);
  }

  async function handleDuplicate(invoice: SalesInvoice) {
    await create({
      customer_id: invoice.customer_id,
      invoice_type: invoice.invoice_type,
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: invoice.due_date,
      currency: invoice.currency,
      notes: invoice.notes ? `${invoice.notes} (copy)` : "Duplicated invoice",
      discount_amount: invoice.discount_amount,
      line_items: invoice.line_items,
    });
    notifyDashboard(`${invoice.invoice_number} duplicated`);
  }

  function handleDownload(invoice: SalesInvoice) {
    const csv = [
      ["Invoice Number", "Customer", "Issue Date", "Due Date", "Currency", "Status", "Total"],
      [invoice.invoice_number, invoice.customer_id, invoice.issue_date, invoice.due_date, invoice.currency, invoice.status ?? "draft", String(invoiceTotal(invoice))],
    ].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${invoice.invoice_number}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    notifyDashboard(`${invoice.invoice_number} downloaded`);
  }

  async function handleDelete(invoice: SalesInvoice) {
    if (!window.confirm(`Delete ${invoice.invoice_number}? This action cannot be undone.`)) return;
    await remove(invoice.id);
    notifyDashboard(`${invoice.invoice_number} deleted`);
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
        fields={["Customer", "Invoice type", "Issue date", "Due date", "Currency", "Discount amount", "Line item product", "Line item description", "Line item quantity", "Line item unit price", "Line item tax rate", "Notes"]}
        onSubmit={() => notifyDashboard("Use the full invoice form to create this invoice")}
      />
      {draftCount > 0 ? <ComplianceAlert title="Validation Required" text={`${draftCount} draft invoices need review before posting or FIRS submission.`} badge={`${draftCount} Draft`} /> : null}
      {error ? <ComplianceAlert title="Unable to load invoices" text={error} /> : null}
      <div className="mb-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]"><FilterBar /><MetricCard label="Total Outstanding" value={<CurrencyAmount amount={totalOutstanding} />} meta="From loaded API invoices" tone="primary" /></div>
      <DataTable
        title="Recent Invoices"
        columns={["Invoice", "Customer", "Dates", "Amount", "Status", "FIRS/NRS", "Actions"]}
        rows={invoices.map((invoice) => {
          const isPosted = invoice.status === "posted" || invoice.status === "sent" || invoice.status === "paid";
          const actions = (
            <div className="flex flex-wrap gap-2">
              {!isPosted ? <Button className="min-h-9 px-3" onClick={() => handlePost(invoice.id)}>Post</Button> : null}
              <FirsGate firsEnabled={user?.firs_enabled ?? 0}>
                <Button variant="secondary" className="min-h-9 px-3" onClick={() => handleFirsSubmit(invoice.id)}>Submit FIRS</Button>
              </FirsGate>
            </div>
          );
          return {
            Invoice: <div><b className="text-[#0001B1]">{invoice.invoice_number}</b><p className="mt-1 text-xs text-[#757588]">{invoice.public_id}</p></div>,
            Customer: <span className="break-words font-semibold">{invoice.customer_id}</span>,
            Dates: <div className="text-sm"><p>Issued {invoice.issue_date}</p><p className="text-[#757588]">Due {invoice.due_date}</p></div>,
            Amount: <b><CurrencyAmount amount={invoiceTotal(invoice)} currency={invoice.currency} /></b>,
            Status: <StatusBadge>{invoice.status ?? "draft"}</StatusBadge>,
            "FIRS/NRS": <StatusBadge>{user?.firs_enabled === 1 ? "ready" : "disabled"}</StatusBadge>,
            Actions: rowActions(actions, invoice.invoice_number, [
              { label: "View invoice", icon: Eye, onSelect: () => void handleView(invoice) },
              { label: "Edit invoice", icon: Edit3, onSelect: () => void handleEdit(invoice) },
              { label: "Duplicate", icon: Copy, onSelect: () => void handleDuplicate(invoice) },
              { label: isPosted ? "Mark as paid" : "Send invoice", icon: Send, onSelect: () => void (isPosted ? update(invoice.id, { status: "paid" } as Partial<SalesInvoice> & { status: string }).then(() => notifyDashboard(`${invoice.invoice_number} marked as paid`)) : handlePost(invoice.id)) },
              { label: "Download CSV", icon: Download, onSelect: () => handleDownload(invoice) },
              { label: "Delete invoice", icon: Trash2, tone: "danger", onSelect: () => void handleDelete(invoice) },
            ]),
          };
        })}
        footer={loading ? "Loading API records..." : `Showing ${invoices.length} of ${pagination?.total ?? invoices.length} invoices`}
        footerActions={<Pagination pagination={pagination} onPageChange={pager.setPage} />}
        loading={loading}
      />
      {selectedInvoice ? <InvoiceDetailsModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} /> : null}
    </>
  );
}

function InvoiceDetailsModal({ invoice, onClose }: { invoice: SalesInvoice; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[#191C1E]/45 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="invoice-details-title" onMouseDown={onClose}>
      <Card className="w-full max-w-2xl overflow-hidden shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-[#C5C4DA] bg-[#F7F9FB] p-6">
          <div>
            <h2 id="invoice-details-title" className="text-2xl font-bold">{invoice.invoice_number}</h2>
            <p className="mt-1 text-sm text-[#454557]">Customer {invoice.customer_id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close invoice details" className="rounded-lg p-2 text-[#454557] hover:bg-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-[#F1F4F8] p-4"><p className="text-xs font-bold uppercase text-[#757588]">Issue Date</p><p className="mt-1 font-bold">{invoice.issue_date}</p></div>
            <div className="rounded-xl bg-[#F1F4F8] p-4"><p className="text-xs font-bold uppercase text-[#757588]">Due Date</p><p className="mt-1 font-bold">{invoice.due_date}</p></div>
            <div className="rounded-xl bg-[#F1F4F8] p-4"><p className="text-xs font-bold uppercase text-[#757588]">Status</p><p className="mt-1"><StatusBadge>{invoice.status ?? "draft"}</StatusBadge></p></div>
            <div className="rounded-xl bg-[#F1F4F8] p-4"><p className="text-xs font-bold uppercase text-[#757588]">Total</p><p className="mt-1 text-xl font-extrabold text-[#0001B1]"><CurrencyAmount amount={invoiceTotal(invoice)} currency={invoice.currency} /></p></div>
          </div>
          <div className="mt-5 overflow-x-auto rounded-xl border border-[#C5C4DA]">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-[#F1F4F8] text-xs uppercase text-[#454557]"><tr><th className="px-4 py-3">Description</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Unit Price</th><th className="px-4 py-3">VAT</th></tr></thead>
              <tbody className="divide-y divide-[#DCE0E8]">
                {invoice.line_items.map((item, index) => <tr key={`${item.description}-${index}`}><td className="px-4 py-3">{item.description}</td><td className="px-4 py-3">{item.quantity}</td><td className="px-4 py-3"><CurrencyAmount amount={item.unit_price} currency={invoice.currency} /></td><td className="px-4 py-3">{item.tax_rate ?? 0}%</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
