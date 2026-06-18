"use client";

import { Download, Edit3, Eye, FileUp, Plus, Send, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { useCustomers } from "@/hooks/useCustomers";
import { useFirs } from "@/hooks/useFirs";
import { useInvoices } from "@/hooks/useInvoices";
import { getSalesInvoiceActionLabels } from "@/lib/invoice-actions";
import { getApiErrorMessage } from "@/lib/api/client";
import { getCustomer } from "@/lib/api/customers";
import { invoiceCsvTemplate, InvoiceCsvError, parseInvoiceCsv } from "@/lib/invoice-csv";
import { formatInvoiceDate, getInvoiceAmount, toDateInputValue } from "@/lib/invoice-utils";
import { Customer, InvoiceLineItem, SalesInvoice, SalesInvoiceRequest } from "@/types/api";
import { Button, Card, ComplianceAlert, DataTable, FilterBar, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

export function SalesInvoicesPage() {
  const { user } = useAuth();
  const { company } = useCompany(user?.company_id);
  const { customers } = useCustomers();
  const { submit } = useFirs();
  const {
    invoices,
    pagination,
    pager,
    loading,
    outstandingLoading,
    totalOutstanding,
    error,
    create,
    post,
    update,
    remove,
    getInvoice,
    refresh,
  } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<SalesInvoice | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [fetchedCustomers, setFetchedCustomers] = useState<Customer[]>([]);
  const customerById = useMemo(() => new Map([...customers, ...fetchedCustomers].map((customer) => [customer.id, customer])), [customers, fetchedCustomers]);
  const filteredInvoices = useMemo(() => invoices.filter((invoice) => {
    if (statusFilter && invoice.status !== statusFilter) return false;
    if (paymentFilter && invoice.payment_status !== paymentFilter) return false;
    return true;
  }), [invoices, paymentFilter, statusFilter]);

  useEffect(() => {
    const known = new Set([...customers, ...fetchedCustomers].map((customer) => customer.id));
    const missingIds = [...new Set(invoices.filter((invoice) => !invoice.customer && !invoice.customer_name && !known.has(invoice.customer_id)).map((invoice) => invoice.customer_id))];
    if (!missingIds.length) return;
    let cancelled = false;
    void Promise.allSettled(missingIds.map((id) => getCustomer(id))).then((results) => {
      if (cancelled) return;
      const loaded = results.flatMap((result) => result.status === "fulfilled" ? [result.value.data] : []);
      if (loaded.length) setFetchedCustomers((current) => [...current, ...loaded.filter((customer) => !current.some((item) => item.id === customer.id))]);
    });
    return () => { cancelled = true; };
  }, [customers, fetchedCustomers, invoices]);

  async function loadInvoice(invoice: SalesInvoice) {
    const response = await getInvoice(invoice.id);
    return response.data;
  }

  async function handlePost(id: string) {
    if (!window.confirm("Post this invoice? Posted invoices can be submitted to FIRS.")) return;
    try {
      await post(id);
      notifyDashboard("Invoice posted");
    } catch (requestError) {
      notifyDashboard(getApiErrorMessage(requestError, "Unable to post invoice."));
    }
  }

  async function handleFirsSubmit(invoiceId: string) {
    try {
      await submit({ invoice_id: invoiceId });
      notifyDashboard("Invoice submitted to FIRS/NRS queue");
    } catch (requestError) {
      notifyDashboard(getApiErrorMessage(requestError, "Unable to submit invoice."));
    }
  }

  async function handleView(invoice: SalesInvoice) {
    setDetailsLoading(true);
    try {
      setSelectedInvoice(await loadInvoice(invoice));
    } catch (requestError) {
      notifyDashboard(getApiErrorMessage(requestError, "Unable to load invoice details."));
    } finally {
      setDetailsLoading(false);
    }
  }

  async function handleEdit(invoice: SalesInvoice) {
    setEditLoading(true);
    try {
      setEditingInvoice(await loadInvoice(invoice));
    } catch (requestError) {
      notifyDashboard(getApiErrorMessage(requestError, "Unable to load invoice for editing."));
    } finally {
      setEditLoading(false);
    }
  }

  async function handleUpdateInvoice(invoiceId: string, payload: SalesInvoiceRequest) {
    const response = await update(invoiceId, payload);
    setEditingInvoice(null);
    setSelectedInvoice(response.data);
    notifyDashboard(`${response.data.invoice_number} updated`);
  }

  async function handleDownload(invoice: SalesInvoice) {
    setDetailsLoading(true);
    try {
      const fullInvoice = await loadInvoice(invoice);
      setSelectedInvoice(fullInvoice);
      window.setTimeout(() => window.print(), 100);
    } catch (requestError) {
      notifyDashboard(getApiErrorMessage(requestError, "Unable to prepare invoice document."));
    } finally {
      setDetailsLoading(false);
    }
  }

  async function handleDelete(invoice: SalesInvoice) {
    if (!window.confirm(`Delete ${invoice.invoice_number}? This action cannot be undone.`)) return;
    try {
      await remove(invoice.id);
      notifyDashboard(`${invoice.invoice_number} deleted`);
    } catch (requestError) {
      notifyDashboard(getApiErrorMessage(requestError, "Unable to delete invoice."));
    }
  }

  return (
    <>
      <PageHeader
        title="Sales Invoices"
        subtitle="Manage customer invoices, payments, and document downloads."
        action={<div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setImportOpen(true)}><FileUp className="h-4 w-4" /> Import CSV</Button><Button href="/dashboard/invoices/create"><Plus className="h-4 w-4" /> Create Sales Invoice</Button></div>}
      />
      {error ? <ComplianceAlert title="Unable to load invoices" text={error} /> : null}
      {detailsLoading || editLoading ? <p className="mb-4 text-sm font-semibold text-[#454557]" role="status">{editLoading ? "Loading invoice editor..." : "Loading invoice document..."}</p> : null}
      <div className="mb-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <FilterBar
          search={pager.search}
          onSearchChange={pager.setSearch}
          searchPlaceholder="Search invoice number or customer"
          selects={[
            { key: "status", label: "Invoice status", value: statusFilter, onChange: setStatusFilter, options: [{ label: "Draft", value: "draft" }, { label: "Posted", value: "posted" }, { label: "Paid", value: "paid" }] },
            { key: "payment", label: "Payment status", value: paymentFilter, onChange: setPaymentFilter, options: [{ label: "Unpaid", value: "unpaid" }, { label: "Paid", value: "paid" }, { label: "Partial", value: "partial" }] },
          ]}
          onClear={() => { pager.setSearch(""); setStatusFilter(""); setPaymentFilter(""); }}
        />
        <MetricCard label="Total Outstanding" value={<CurrencyAmount amount={totalOutstanding} />} meta={outstandingLoading ? "Calculating all posted unpaid invoices..." : "Posted and unpaid balance due"} tone="primary" />
      </div>
      <DataTable
        title="Recent Invoices"
        columns={["Invoice", "Customer", "Dates", "Amount", "Status", "Actions"]}
        actions={<button type="button" onClick={() => setImportOpen(true)} aria-label="Import invoice CSV" className="rounded-lg p-2 hover:bg-[#F1F4F8]"><FileUp className="h-4 w-4" /></button>}
        rows={filteredInvoices.map((invoice) => {
          const isPosted = invoice.status === "posted";
          const customer = invoice.customer ?? customerById.get(invoice.customer_id);
          const actions = (
            <div className="flex flex-wrap gap-2">
              {!isPosted ? <Button className="min-h-9 px-3" onClick={() => void handlePost(invoice.id)}>Post</Button> : null}
              {user?.firs_enabled === 1 ? (
                <Button variant="secondary" className="min-h-9 px-3" onClick={() => void handleFirsSubmit(invoice.id)}>Submit FIRS</Button>
              ) : null}
            </div>
          );
          const actionLabels = getSalesInvoiceActionLabels(isPosted);
          return {
            Invoice: <div><b className="text-[#0001B1]">{invoice.invoice_number}</b><p className="mt-1 text-xs text-[#757588]">{invoice.public_id}</p></div>,
            Customer: <div className="max-w-52 break-words"><p className="font-semibold">{customer?.name ?? invoice.customer_name ?? "Customer details unavailable"}</p>{customer?.email || invoice.customer_email ? <p className="mt-1 text-xs text-[#757588]">{customer?.email ?? invoice.customer_email}</p> : null}</div>,
            Dates: <div className="space-y-1 text-sm"><p><span className="font-bold text-[#191C1E]">Issued</span> {formatInvoiceDate(invoice.issue_date)}</p><p className="text-[#757588]"><span className="font-bold">Due</span> {formatInvoiceDate(invoice.due_date)}</p></div>,
            Amount: <b><CurrencyAmount amount={getInvoiceAmount(invoice)} currency={invoice.currency} /></b>,
            Status: <div className="space-y-1"><StatusBadge>{invoice.status ?? "draft"}</StatusBadge>{invoice.payment_status ? <p className="text-xs capitalize text-[#757588]">{invoice.payment_status}</p> : null}</div>,
            Actions: rowActions(actions, invoice.invoice_number, [
              { label: actionLabels[0], icon: Eye, onSelect: () => void handleView(invoice) },
              { label: actionLabels[1], icon: Edit3, onSelect: () => void handleEdit(invoice) },
              ...(isPosted ? [{ label: "Mark as paid", icon: Send, onSelect: () => void update(invoice.id, { status: "paid" } as Partial<SalesInvoiceRequest>).then(() => notifyDashboard(`${invoice.invoice_number} marked as paid`)).catch((requestError) => notifyDashboard(getApiErrorMessage(requestError, "Unable to mark invoice as paid."))) }] : []),
              { label: "Download invoice", icon: Download, onSelect: () => void handleDownload(invoice) },
              { label: "Delete invoice", icon: Trash2, tone: "danger" as const, onSelect: () => void handleDelete(invoice) },
            ]),
          };
        })}
        footer={loading ? "Loading API records..." : `Showing ${filteredInvoices.length} filtered invoices from ${pagination?.total ?? invoices.length} records`}
        footerActions={<Pagination pagination={pagination} onPageChange={pager.setPage} />}
        loading={loading}
      />
      {selectedInvoice ? (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          company={company}
          customer={selectedInvoice.customer ?? customerById.get(selectedInvoice.customer_id)}
          fallbackCompany={{ companyName: user?.company_name ?? user?.trading_name, email: user?.email, tin: user?.tax_identification_number, country: user?.country, logoUrl: user?.logo_url }}
          onClose={() => setSelectedInvoice(null)}
        />
      ) : null}
      {editingInvoice ? <InvoiceEditModal invoice={editingInvoice} customers={customers} onClose={() => setEditingInvoice(null)} onSave={handleUpdateInvoice} /> : null}
      {importOpen ? <InvoiceCsvImportModal onClose={() => setImportOpen(false)} create={create} onImported={refresh} /> : null}
    </>
  );
}

function cleanLineItem(item: InvoiceLineItem): InvoiceLineItem {
  return {
    product_id: item.product_id?.trim() || undefined,
    description: item.description.trim(),
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
    tax_rate: Number(item.tax_rate ?? 0),
    discount_percentage: Number(item.discount_percentage ?? item.discount_percent ?? item.discount_rate ?? 0),
  };
}

export function buildInvoiceUpdatePayload(invoice: SalesInvoice, fields: {
  customerId: string;
  invoiceType: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  discountAmount: string;
  notes: string;
  lineItems: InvoiceLineItem[];
}): { payload?: SalesInvoiceRequest; errors: string[] } {
  const errors: string[] = [];
  const cleanedItems = fields.lineItems.map(cleanLineItem);
  if (!fields.customerId.trim()) errors.push("Customer is required.");
  if (!fields.issueDate || !fields.dueDate) errors.push("Issue date and due date are required.");
  if (fields.issueDate && fields.dueDate && fields.dueDate < fields.issueDate) errors.push("Due date cannot be before issue date.");
  cleanedItems.forEach((item, index) => {
    if (!item.description) errors.push(`Line ${index + 1}: description is required.`);
    if (!Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0) errors.push(`Line ${index + 1}: quantity must be greater than zero.`);
    if (!Number.isFinite(Number(item.unit_price)) || Number(item.unit_price) < 0) errors.push(`Line ${index + 1}: unit price cannot be negative.`);
    const discount = Number(item.discount_percentage ?? 0);
    const tax = Number(item.tax_rate ?? 0);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) errors.push(`Line ${index + 1}: discount must be between 0 and 100.`);
    if (!Number.isFinite(tax) || tax < 0 || tax > 100) errors.push(`Line ${index + 1}: VAT must be between 0 and 100.`);
  });
  if (errors.length) return { errors };
  return {
    errors,
    payload: {
      customer_id: fields.customerId.trim(),
      invoice_type: fields.invoiceType.trim() || invoice.invoice_type || "standard_invoice",
      issue_date: fields.issueDate,
      due_date: fields.dueDate,
      currency: fields.currency.trim() || "NGN",
      discount_amount: Math.max(Number(fields.discountAmount) || 0, 0),
      notes: fields.notes.trim() || undefined,
      line_items: cleanedItems,
    },
  };
}

function InvoiceEditModal({ invoice, customers, onClose, onSave }: {
  invoice: SalesInvoice;
  customers: Customer[];
  onClose: () => void;
  onSave: (invoiceId: string, payload: SalesInvoiceRequest) => Promise<void>;
}) {
  const [customerId, setCustomerId] = useState(invoice.customer_id);
  const [invoiceType, setInvoiceType] = useState(invoice.invoice_type);
  const [issueDate, setIssueDate] = useState(toDateInputValue(invoice.issue_date));
  const [dueDate, setDueDate] = useState(toDateInputValue(invoice.due_date));
  const [currency, setCurrency] = useState(invoice.currency ?? "NGN");
  const [discountAmount, setDiscountAmount] = useState(String(invoice.discount_amount ?? 0));
  const [notes, setNotes] = useState(invoice.notes ?? "");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(invoice.line_items?.length ? invoice.line_items.map((item) => ({ ...item })) : [{ description: "", quantity: 1, unit_price: 0, tax_rate: 0, discount_percentage: 0 }]);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  function updateLineItem(index: number, patch: Partial<InvoiceLineItem>) {
    setLineItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const result = buildInvoiceUpdatePayload(invoice, { customerId, invoiceType, issueDate, dueDate, currency, discountAmount, notes, lineItems });
    setFormErrors(result.errors);
    if (!result.payload) return;
    setSaving(true);
    try {
      await onSave(invoice.id, result.payload);
    } catch (requestError) {
      setFormErrors([getApiErrorMessage(requestError, "Unable to update invoice.")]);
    } finally {
      setSaving(false);
    }
  }

  const currentCustomerExists = customers.some((customer) => customer.id === customerId);
  return (
    <ModalShell labelledBy="invoice-edit-title" onClose={onClose} maxWidth="max-w-5xl">
      <form onSubmit={handleSubmit}>
        <ModalHeader title={`Edit ${invoice.invoice_number}`} description="Update the existing invoice. Saving uses the invoice update endpoint and does not create another record." onClose={onClose} id="invoice-edit-title" />
        <div className="max-h-[65vh] space-y-5 overflow-y-auto p-6">
          {formErrors.length ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><ul className="list-disc space-y-1 pl-5">{formErrors.map((message) => <li key={message}>{message}</li>)}</ul></div> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-bold text-[#454557]">Customer
              <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className={inputClass}>
                {!currentCustomerExists ? <option value={customerId}>{invoice.customer?.name ?? invoice.customer_name ?? customerId}</option> : null}
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
            </label>
            <InvoiceInput label="Invoice Type" value={invoiceType} onChange={setInvoiceType} />
            <InvoiceInput label="Issue Date" type="date" value={issueDate} onChange={setIssueDate} />
            <InvoiceInput label="Due Date" type="date" value={dueDate} onChange={setDueDate} />
            <InvoiceInput label="Currency" value={currency} onChange={setCurrency} />
            <InvoiceInput label="Invoice Discount Amount" type="number" value={discountAmount} onChange={setDiscountAmount} />
            <label className="block text-sm font-bold text-[#454557] md:col-span-2">Notes
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className={`${inputClass} min-h-24 py-3`} />
            </label>
          </div>
          <div className="rounded-xl border border-[#C5C4DA]">
            <div className="flex items-center justify-between gap-3 border-b border-[#C5C4DA] bg-[#F7F9FB] p-4">
              <h3 className="font-bold">Line Items</h3>
              <Button variant="secondary" onClick={() => setLineItems((current) => [...current, { description: "", quantity: 1, unit_price: 0, tax_rate: 0, discount_percentage: 0 }])}>Add Line Item</Button>
            </div>
            <div className="space-y-4 p-4">
              {lineItems.map((item, index) => (
                <div key={item.id ?? index} className="grid gap-3 rounded-xl bg-[#F1F4F8] p-4 lg:grid-cols-[minmax(0,1.5fr)_90px_130px_100px_100px_auto]">
                  <InvoiceInput label="Description" value={item.description} onChange={(value) => updateLineItem(index, { description: value })} />
                  <InvoiceInput label="Qty" type="number" value={String(item.quantity)} onChange={(value) => updateLineItem(index, { quantity: value })} />
                  <InvoiceInput label="Unit Price" type="number" value={String(item.unit_price)} onChange={(value) => updateLineItem(index, { unit_price: value })} />
                  <InvoiceInput label="Discount %" type="number" value={String(item.discount_percentage ?? item.discount_percent ?? item.discount_rate ?? 0)} onChange={(value) => updateLineItem(index, { discount_percentage: value })} />
                  <InvoiceInput label="VAT %" type="number" value={String(item.tax_rate ?? 0)} onChange={(value) => updateLineItem(index, { tax_rate: value })} />
                  <Button variant="ghost" className="self-end" onClick={() => setLineItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} disabled={lineItems.length === 1}>Remove</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#C5C4DA] p-6"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Update Invoice"}</Button></div>
      </form>
    </ModalShell>
  );
}

function InvoiceDetailsModal({ invoice, company, customer, fallbackCompany, onClose }: {
  invoice: SalesInvoice;
  company: ReturnType<typeof useCompany>["company"];
  customer?: Customer | null;
  fallbackCompany: { companyName?: string | null; email?: string | null; tin?: string | null; country?: string | null; logoUrl?: string | null };
  onClose: () => void;
}) {
  const companyName = company?.company_name ?? company?.trading_name ?? fallbackCompany.companyName ?? "Company";
  return (
    <ModalShell labelledBy="invoice-details-title" onClose={onClose} maxWidth="max-w-5xl" printClassName="invoice-print-modal">
      <div className="invoice-modal-controls flex items-center justify-between gap-4 border-b border-[#C5C4DA] bg-[#F7F9FB] p-4">
        <div><h2 id="invoice-details-title" className="text-lg font-bold">{companyName}</h2><p className="text-sm text-[#454557]">Invoice document preview · {invoice.invoice_number}</p></div>
        <div className="flex gap-2"><Button variant="secondary" onClick={() => window.print()}><Download className="h-4 w-4" /> Print / Save PDF</Button><button type="button" onClick={onClose} aria-label="Close invoice details" className="rounded-lg p-2 hover:bg-white"><X className="h-5 w-5" /></button></div>
      </div>
      <div className="max-h-[82vh] overflow-y-auto bg-[#E5E7EB] p-2 sm:p-5"><InvoiceDocument invoice={invoice} company={company} customer={customer} fallbackCompany={fallbackCompany} id="invoice-print-document" /></div>
    </ModalShell>
  );
}

function InvoiceCsvImportModal({ onClose, create, onImported }: {
  onClose: () => void;
  create: (data: SalesInvoiceRequest) => Promise<{ data: SalesInvoice }>;
  onImported: () => Promise<void>;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [pending, setPending] = useState<ReturnType<typeof parseInvoiceCsv> | null>(null);
  const [errors, setErrors] = useState<InvoiceCsvError[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failure: 0 });

  async function handleFile(file?: File) {
    if (!file) return;
    setFileName(file.name);
    const parsed = parseInvoiceCsv(await file.text());
    setPending(parsed);
    setErrors(parsed.errors);
    setProgress({ current: 0, total: parsed.invoices.length, success: 0, failure: parsed.errors.length });
  }

  async function handleImport() {
    if (!pending || pending.errors.length || !pending.invoices.length || importing) return;
    setImporting(true);
    let success = 0;
    const apiErrors: InvoiceCsvError[] = [];
    for (let index = 0; index < pending.invoices.length; index += 1) {
      const item = pending.invoices[index];
      setProgress({ current: index + 1, total: pending.invoices.length, success, failure: apiErrors.length });
      try {
        await create(item.payload);
        success += 1;
      } catch (requestError) {
        apiErrors.push({ row: index + 2, messages: [`${item.key}: ${getApiErrorMessage(requestError, "Import failed")}`] });
      }
      setProgress({ current: index + 1, total: pending.invoices.length, success, failure: apiErrors.length });
    }
    setErrors(apiErrors);
    await onImported();
    setImporting(false);
    notifyDashboard(`Invoice import completed: ${success} succeeded, ${apiErrors.length} failed.`);
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([invoiceCsvTemplate()], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "invoice-import-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ModalShell labelledBy="invoice-import-title" onClose={importing ? () => undefined : onClose} maxWidth="max-w-3xl">
      <ModalHeader title="Import invoices from CSV" description="Each invoice_key groups one or more line-item rows into a single invoice." onClose={onClose} id="invoice-import-title" disabled={importing} />
      <div className="space-y-5 p-6">
        <div className="flex flex-wrap gap-3"><Button variant="secondary" onClick={downloadTemplate}><Download className="h-4 w-4" /> Download sample template</Button><Button onClick={() => fileInput.current?.click()} disabled={importing}><FileUp className="h-4 w-4" /> Choose CSV file</Button></div>
        <input ref={fileInput} type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => void handleFile(event.target.files?.[0])} />
        <p className="text-sm text-[#454557]">{fileName || "No CSV file selected."}</p>
        {pending ? <div className="rounded-xl bg-[#F1F4F8] p-4 text-sm"><p>{pending.rowCount} data rows parsed into {pending.invoices.length} invoices.</p><p className="mt-1">Validation errors: {pending.errors.length}</p></div> : null}
        {progress.total ? <div role="status" className="rounded-xl border border-[#C5C4DA] p-4 text-sm"><p>Progress: {progress.current}/{progress.total}</p><p className="mt-1 text-green-700">Succeeded: {progress.success}</p><p className="text-red-700">Failed: {progress.failure}</p></div> : null}
        {errors.length ? <div role="alert" className="max-h-56 overflow-y-auto rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><h3 className="font-bold">Rows requiring correction</h3><ul className="mt-2 space-y-2">{errors.map((error, index) => <li key={`${error.row}-${index}`}><b>Row {error.row}:</b> {error.messages.join("; ")}</li>)}</ul></div> : null}
      </div>
      <div className="flex justify-end gap-3 border-t border-[#C5C4DA] p-6"><Button variant="secondary" onClick={onClose} disabled={importing}>Close</Button><Button onClick={() => void handleImport()} disabled={importing || !pending?.invoices.length || Boolean(pending?.errors.length)}>{importing ? `Importing ${progress.current}/${progress.total}...` : "Import invoices"}</Button></div>
    </ModalShell>
  );
}

const inputClass = "mt-2 h-11 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 text-[#191C1E] outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]";

function InvoiceInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block text-sm font-bold text-[#454557]">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} /></label>;
}

function ModalShell({ children, labelledBy, onClose, maxWidth, printClassName = "" }: { children: React.ReactNode; labelledBy: string; onClose: () => void; maxWidth: string; printClassName?: string }) {
  return <div className={`fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[#191C1E]/45 p-3 backdrop-blur-sm ${printClassName}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy} onMouseDown={onClose}><Card className={`w-full overflow-hidden shadow-2xl ${maxWidth}`} onMouseDown={(event) => event.stopPropagation()}>{children}</Card></div>;
}

function ModalHeader({ title, description, onClose, id, disabled = false }: { title: string; description: string; onClose: () => void; id: string; disabled?: boolean }) {
  return <div className="flex items-start justify-between gap-4 border-b border-[#C5C4DA] bg-[#F7F9FB] p-6"><div><h2 id={id} className="text-2xl font-bold">{title}</h2><p className="mt-1 text-sm text-[#454557]">{description}</p></div><button type="button" onClick={onClose} disabled={disabled} aria-label={`Close ${title}`} className="rounded-lg p-2 text-[#454557] hover:bg-white"><X className="h-5 w-5" /></button></div>;
}
