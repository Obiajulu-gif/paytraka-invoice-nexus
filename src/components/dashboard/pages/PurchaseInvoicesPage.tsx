"use client";

import { Download, Edit3, Eye, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { usePurchaseInvoices } from "@/hooks/usePurchaseInvoices";
import { useSuppliers } from "@/hooks/useSuppliers";
import { getApiErrorMessage } from "@/lib/api/client";
import { getSupplier } from "@/lib/api/suppliers";
import { formatInvoiceDate, getInvoiceAmount, getSupplierParty, toDateInputValue } from "@/lib/invoice-utils";
import { InvoiceLineItem, PurchaseInvoice, PurchaseInvoiceRequest, SalesInvoice, Supplier } from "@/types/api";
import { Button, Card, ComplianceAlert, DataTable, FilterBar, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

function documentInvoice(invoice: PurchaseInvoice): SalesInvoice {
  return {
    ...invoice,
    customer_id: invoice.supplier_id,
    customer_name: invoice.supplier?.supplier_name ?? invoice.supplier_name,
    customer_email: invoice.supplier?.email ?? invoice.supplier_email,
    customer_address: invoice.supplier?.address ?? invoice.supplier_address,
  };
}

export function PurchaseInvoicesPage() {
  const { user } = useAuth();
  const { company } = useCompany(user?.company_id);
  const { suppliers } = useSuppliers();
  const { invoices, pagination, pager, loading, error, getInvoice, update, remove } = usePurchaseInvoices();
  const [selected, setSelected] = useState<PurchaseInvoice | null>(null);
  const [editing, setEditing] = useState<PurchaseInvoice | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [fetchedSuppliers, setFetchedSuppliers] = useState<Supplier[]>([]);
  const supplierById = useMemo(() => new Map([...suppliers, ...fetchedSuppliers].map((supplier) => [supplier.id, supplier])), [suppliers, fetchedSuppliers]);
  const filteredInvoices = useMemo(() => invoices.filter((invoice) => {
    if (statusFilter && invoice.status !== statusFilter) return false;
    if (supplierFilter && invoice.supplier_id !== supplierFilter) return false;
    return true;
  }), [invoices, statusFilter, supplierFilter]);

  useEffect(() => {
    const known = new Set([...suppliers, ...fetchedSuppliers].map((supplier) => supplier.id));
    const missingIds = [...new Set(invoices.filter((invoice) => !invoice.supplier && !invoice.supplier_name && !known.has(invoice.supplier_id)).map((invoice) => invoice.supplier_id))];
    if (!missingIds.length) return;
    let cancelled = false;
    void Promise.allSettled(missingIds.map((id) => getSupplier(id))).then((results) => {
      if (cancelled) return;
      const loaded = results.flatMap((result) => result.status === "fulfilled" ? [result.value.data] : []);
      if (loaded.length) setFetchedSuppliers((current) => [...current, ...loaded.filter((supplier) => !current.some((item) => item.id === supplier.id))]);
    });
    return () => { cancelled = true; };
  }, [fetchedSuppliers, invoices, suppliers]);

  async function load(invoice: PurchaseInvoice, mode: "view" | "edit") {
    setBusy(true);
    try {
      const response = await getInvoice(invoice.id);
      if (mode === "view") setSelected(response.data);
      else setEditing(response.data);
    } catch (requestError) {
      notifyDashboard(getApiErrorMessage(requestError, "Unable to load purchase invoice."));
    } finally {
      setBusy(false);
    }
  }

  async function download(invoice: PurchaseInvoice) {
    await load(invoice, "view");
    window.setTimeout(() => window.print(), 100);
  }

  async function deleteInvoice(invoice: PurchaseInvoice) {
    if (!window.confirm(`Delete ${invoice.invoice_number}? This action cannot be undone.`)) return;
    try {
      await remove(invoice.id);
      notifyDashboard(`${invoice.invoice_number} deleted`);
    } catch (requestError) {
      notifyDashboard(getApiErrorMessage(requestError, "Unable to delete purchase invoice."));
    }
  }

  return (
    <>
      <PageHeader title="Purchase Invoices" subtitle="Track supplier invoices using backend purchase records." action={<Button href="/dashboard/invoices/purchase/create"><Plus className="h-4 w-4" /> Add Purchase Invoice</Button>} />
      {error ? <ComplianceAlert title="Unable to load purchase invoices" text={error} /> : null}
      {busy ? <p className="mb-4 text-sm font-semibold text-[#454557]" role="status">Loading purchase invoice...</p> : null}
      <FilterBar
        className="mb-6"
        search={pager.search}
        onSearchChange={pager.setSearch}
        searchPlaceholder="Search purchase invoices or suppliers"
        selects={[
          { key: "status", label: "Invoice status", value: statusFilter, onChange: setStatusFilter, options: [{ label: "Draft", value: "draft" }, { label: "Posted", value: "posted" }, { label: "Paid", value: "paid" }] },
          { key: "supplier", label: "Supplier", value: supplierFilter, onChange: setSupplierFilter, options: suppliers.map((supplier) => ({ label: supplier.supplier_name, value: supplier.id })) },
        ]}
        onClear={() => { pager.setSearch(""); setStatusFilter(""); setSupplierFilter(""); }}
      />
      <DataTable
        title="Invoice History"
        columns={["Invoice", "Supplier", "Dates", "Amount", "Status", "Actions"]}
        actions={<span />}
        rows={filteredInvoices.map((invoice) => {
          const supplier = invoice.supplier ?? supplierById.get(invoice.supplier_id);
          return {
            Invoice: <div><b className="text-[#0001B1]">{invoice.invoice_number}</b><p className="mt-1 text-xs text-[#757588]">{invoice.public_id}</p></div>,
            Supplier: <div><b>{supplier?.supplier_name ?? invoice.supplier_name ?? "Supplier details unavailable"}</b>{supplier?.email || invoice.supplier_email ? <p className="mt-1 text-xs text-[#757588]">{supplier?.email ?? invoice.supplier_email}</p> : null}</div>,
            Dates: <div className="space-y-1"><p><b>Issued</b> {formatInvoiceDate(invoice.issue_date)}</p><p className="text-[#757588]"><b>Due</b> {formatInvoiceDate(invoice.due_date)}</p></div>,
            Amount: <b><CurrencyAmount amount={getInvoiceAmount(documentInvoice(invoice))} currency={invoice.currency} /></b>,
            Status: <StatusBadge>{invoice.status ?? "draft"}</StatusBadge>,
            Actions: rowActions(undefined, invoice.invoice_number, [
              { label: "View invoice", icon: Eye, onSelect: () => void load(invoice, "view") },
              { label: "Edit invoice", icon: Edit3, onSelect: () => void load(invoice, "edit") },
              { label: "Download invoice", icon: Download, onSelect: () => void download(invoice) },
              { label: "Delete invoice", icon: Trash2, tone: "danger", onSelect: () => void deleteInvoice(invoice) },
            ]),
          };
        })}
        footer={loading ? "Loading API records..." : `Showing ${filteredInvoices.length} filtered invoices from ${pagination?.total ?? invoices.length} records`}
        footerActions={<Pagination pagination={pagination} onPageChange={pager.setPage} />}
        loading={loading}
      />
      {selected ? (
        <div className="invoice-print-modal fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[#191C1E]/45 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="purchase-invoice-title" onMouseDown={() => setSelected(null)}>
          <Card className="w-full max-w-5xl overflow-hidden shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="invoice-modal-controls flex items-center justify-between border-b border-[#C5C4DA] bg-[#F7F9FB] p-4">
              <div><h2 id="purchase-invoice-title" className="font-bold">{selected.invoice_number}</h2><p className="text-sm text-[#454557]">Purchase invoice document preview</p></div>
              <div className="flex gap-2"><Button variant="secondary" onClick={() => window.print()}><Download className="h-4 w-4" /> Print / Save PDF</Button><button type="button" onClick={() => setSelected(null)} aria-label="Close purchase invoice" className="rounded-lg p-2 hover:bg-white"><X className="h-5 w-5" /></button></div>
            </div>
            <div className="max-h-[82vh] overflow-y-auto bg-[#E5E7EB] p-2 sm:p-5">
              <InvoiceDocument
                id="invoice-print-document"
                invoice={documentInvoice(selected)}
                company={company}
                recipient={getSupplierParty(selected, supplierById.get(selected.supplier_id))}
                fallbackCompany={{ companyName: user?.company_name ?? user?.trading_name, email: user?.email, tin: user?.tax_identification_number, country: user?.country, logoUrl: user?.logo_url }}
              />
            </div>
          </Card>
        </div>
      ) : null}
      {editing ? <PurchaseInvoiceEditModal invoice={editing} suppliers={suppliers} onClose={() => setEditing(null)} onSave={async (payload) => {
        try {
          const response = await update(editing.id, payload);
          setEditing(null);
          setSelected(response.data);
          notifyDashboard(`${response.data.invoice_number} updated`);
        } catch (requestError) {
          throw new Error(getApiErrorMessage(requestError, "Unable to update purchase invoice."));
        }
      }} /> : null}
    </>
  );
}

function PurchaseInvoiceEditModal({ invoice, suppliers, onClose, onSave }: {
  invoice: PurchaseInvoice;
  suppliers: ReturnType<typeof useSuppliers>["suppliers"];
  onClose: () => void;
  onSave: (payload: PurchaseInvoiceRequest) => Promise<void>;
}) {
  const [supplierId, setSupplierId] = useState(invoice.supplier_id);
  const [issueDate, setIssueDate] = useState(toDateInputValue(invoice.issue_date));
  const [dueDate, setDueDate] = useState(toDateInputValue(invoice.due_date));
  const [currency, setCurrency] = useState(invoice.currency);
  const [notes, setNotes] = useState(invoice.notes ?? "");
  const [discount, setDiscount] = useState(String(invoice.discount_amount ?? 0));
  const [items, setItems] = useState<InvoiceLineItem[]>(invoice.line_items?.map((item) => ({ ...item })) ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function patchItem(index: number, patch: Partial<InvoiceLineItem>) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    if (!supplierId || !issueDate || !dueDate || dueDate < issueDate || !items.length || items.some((item) => !item.description.trim() || Number(item.quantity) <= 0 || Number(item.unit_price) < 0)) {
      setError("Select a supplier, enter valid dates, and provide at least one valid line item.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        supplier_id: supplierId,
        invoice_type: invoice.invoice_type,
        issue_date: issueDate,
        due_date: dueDate,
        currency,
        notes: notes.trim() || undefined,
        discount_amount: Math.max(Number(discount) || 0, 0),
        line_items: items.map((item) => ({ ...item, description: item.description.trim(), quantity: Number(item.quantity), unit_price: Number(item.unit_price), tax_rate: Number(item.tax_rate ?? 0), discount_percentage: Number(item.discount_percentage ?? 0) })),
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update purchase invoice.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[#191C1E]/45 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="purchase-edit-title" onMouseDown={onClose}>
      <Card className="w-full max-w-5xl overflow-hidden shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <form onSubmit={submit}>
          <div className="flex justify-between border-b border-[#C5C4DA] bg-[#F7F9FB] p-6"><div><h2 id="purchase-edit-title" className="text-2xl font-bold">Edit {invoice.invoice_number}</h2><p className="text-sm text-[#454557]">Update the existing purchase invoice.</p></div><button type="button" onClick={onClose} aria-label="Close purchase editor"><X /></button></div>
          <div className="max-h-[65vh] space-y-5 overflow-y-auto p-6">
            {error ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</div> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold">Supplier<select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className={inputClass}><option value="">Select supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.supplier_name}</option>)}</select></label>
              <Field label="Currency" value={currency} onChange={setCurrency} />
              <Field label="Issue Date" type="date" value={issueDate} onChange={setIssueDate} />
              <Field label="Due Date" type="date" value={dueDate} onChange={setDueDate} />
              <Field label="Discount Amount" type="number" value={discount} onChange={setDiscount} />
              <label className="text-sm font-bold md:col-span-2">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} className={`${inputClass} min-h-24 py-3`} /></label>
            </div>
            <div className="space-y-3">{items.map((item, index) => <div key={item.id ?? index} className="grid gap-3 rounded-xl bg-[#F1F4F8] p-4 lg:grid-cols-[1fr_90px_130px_100px_100px]"><Field label="Description" value={item.description} onChange={(value) => patchItem(index, { description: value })} /><Field label="Qty" type="number" value={String(item.quantity)} onChange={(value) => patchItem(index, { quantity: value })} /><Field label="Unit Price" type="number" value={String(item.unit_price)} onChange={(value) => patchItem(index, { unit_price: value })} /><Field label="Discount %" type="number" value={String(item.discount_percentage ?? 0)} onChange={(value) => patchItem(index, { discount_percentage: value })} /><Field label="VAT %" type="number" value={String(item.tax_rate ?? 0)} onChange={(value) => patchItem(index, { tax_rate: value })} /></div>)}</div>
            <Button variant="secondary" onClick={() => setItems((current) => [...current, { description: "", quantity: 1, unit_price: 0, discount_percentage: 0, tax_rate: 0 }])}>Add Line Item</Button>
          </div>
          <div className="flex justify-end gap-3 border-t border-[#C5C4DA] p-6"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Update Invoice"}</Button></div>
        </form>
      </Card>
    </div>
  );
}

const inputClass = "mt-2 h-11 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]";
function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="text-sm font-bold">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} /></label>;
}
