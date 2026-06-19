"use client";

import { Copy, Download, Edit3, Eye, Plus, Send, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { InvoiceLineItem, SalesInvoice, SalesInvoiceRequest } from "@/types/api";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { FirsGate } from "@/components/ui/FirsGate";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/hooks/useAuth";
import { useFirs } from "@/hooks/useFirs";
import { useInvoices } from "@/hooks/useInvoices";
import { getApiErrorMessage } from "@/lib/api/client";
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
  const [editingInvoice, setEditingInvoice] = useState<SalesInvoice | null>(null);
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
    try {
      const response = await getInvoice(invoice.id);
      setEditingInvoice(response.data);
    } catch {
      setEditingInvoice(invoice);
    }
  }

  async function handleUpdateInvoice(invoice: SalesInvoice, payload: SalesInvoiceRequest) {
    try {
      await update(invoice.id, payload);
      setEditingInvoice(null);
      notifyDashboard(`${invoice.invoice_number} updated`);
    } catch (requestError) {
      notifyDashboard(getApiErrorMessage(requestError, "Unable to update invoice."));
    }
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
      {editingInvoice ? <InvoiceEditModal invoice={editingInvoice} onClose={() => setEditingInvoice(null)} onSave={handleUpdateInvoice} /> : null}
    </>
  );
}

function cleanLineItem(item: InvoiceLineItem): InvoiceLineItem {
  return {
    product_id: item.product_id?.trim() || undefined,
    description: item.description.trim(),
    quantity: Number(item.quantity || 0),
    unit_price: Number(item.unit_price || 0),
    tax_rate: item.tax_rate == null || Number.isNaN(Number(item.tax_rate)) ? undefined : Number(item.tax_rate),
  };
}

function InvoiceEditModal({ invoice, onClose, onSave }: { invoice: SalesInvoice; onClose: () => void; onSave: (invoice: SalesInvoice, payload: SalesInvoiceRequest) => Promise<void> }) {
  const [customerId, setCustomerId] = useState(invoice.customer_id);
  const [invoiceType, setInvoiceType] = useState(invoice.invoice_type);
  const [issueDate, setIssueDate] = useState(invoice.issue_date);
  const [dueDate, setDueDate] = useState(invoice.due_date);
  const [currency, setCurrency] = useState(invoice.currency ?? "NGN");
  const [discountAmount, setDiscountAmount] = useState(String(invoice.discount_amount ?? 0));
  const [notes, setNotes] = useState(invoice.notes ?? "");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(invoice.line_items.length ? invoice.line_items.map((item) => ({ ...item })) : [{ description: "", quantity: 1, unit_price: 0, tax_rate: 0 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function updateLineItem(index: number, patch: Partial<InvoiceLineItem>) {
    setLineItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanedItems = lineItems.map(cleanLineItem).filter((item) => item.description && item.quantity > 0 && item.unit_price >= 0);
    if (!customerId.trim()) {
      notifyDashboard("Customer is required.");
      return;
    }
    if (!issueDate || !dueDate) {
      notifyDashboard("Issue date and due date are required.");
      return;
    }
    if (!cleanedItems.length) {
      notifyDashboard("Add at least one valid line item.");
      return;
    }
    setSaving(true);
    await onSave(invoice, {
      customer_id: customerId.trim(),
      invoice_type: invoiceType.trim() || "standard",
      issue_date: issueDate,
      due_date: dueDate,
      currency: currency.trim() || "NGN",
      discount_amount: Number(discountAmount || 0),
      notes: notes.trim() || undefined,
      line_items: cleanedItems,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[#191C1E]/45 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="invoice-edit-title" onMouseDown={onClose}>
      <Card className="max-h-[92vh] w-full max-w-4xl overflow-hidden shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex items-start justify-between gap-4 border-b border-[#C5C4DA] bg-[#F7F9FB] p-6">
            <div>
              <h2 id="invoice-edit-title" className="text-2xl font-bold">Edit {invoice.invoice_number}</h2>
              <p className="mt-1 text-sm text-[#454557]">Update invoice details and line items.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close invoice editor" className="rounded-lg p-2 text-[#454557] hover:bg-white"><X className="h-5 w-5" /></button>
          </div>
          <div className="max-h-[62vh] space-y-5 overflow-y-auto p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <InvoiceInput label="Customer ID" value={customerId} onChange={setCustomerId} />
              <InvoiceInput label="Invoice Type" value={invoiceType} onChange={setInvoiceType} />
              <InvoiceInput label="Issue Date" type="date" value={issueDate} onChange={setIssueDate} />
              <InvoiceInput label="Due Date" type="date" value={dueDate} onChange={setDueDate} />
              <InvoiceInput label="Currency" value={currency} onChange={setCurrency} />
              <InvoiceInput label="Discount Amount" type="number" value={discountAmount} onChange={setDiscountAmount} />
              <label className="block text-sm font-bold text-[#454557] md:col-span-2">Notes
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-lg border border-[#C5C4DA] bg-white px-3 py-3 text-[#191C1E] outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]" />
              </label>
            </div>
            <div className="rounded-xl border border-[#C5C4DA]">
              <div className="flex flex-col gap-3 border-b border-[#C5C4DA] bg-[#F7F9FB] p-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-bold">Line Items</h3>
                <Button variant="secondary" onClick={() => setLineItems((current) => [...current, { description: "", quantity: 1, unit_price: 0, tax_rate: 0 }])}>Add Line Item</Button>
              </div>
              <div className="space-y-4 p-4">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid gap-3 rounded-xl bg-[#F1F4F8] p-4 md:grid-cols-[minmax(0,1.5fr)_0.5fr_0.75fr_0.5fr_auto]">
                    <InvoiceInput label="Description" value={item.description} onChange={(value) => updateLineItem(index, { description: value })} />
                    <InvoiceInput label="Qty" type="number" value={String(item.quantity)} onChange={(value) => updateLineItem(index, { quantity: Number(value) })} />
                    <InvoiceInput label="Unit Price" type="number" value={String(item.unit_price)} onChange={(value) => updateLineItem(index, { unit_price: Number(value) })} />
                    <InvoiceInput label="VAT %" type="number" value={String(item.tax_rate ?? 0)} onChange={(value) => updateLineItem(index, { tax_rate: Number(value) })} />
                    <Button variant="ghost" className="self-end" onClick={() => setLineItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} disabled={lineItems.length === 1}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-[#C5C4DA] bg-white p-6 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Update Invoice"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function InvoiceInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block text-sm font-bold text-[#454557]">{label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 text-[#191C1E] outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]" />
    </label>
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
