"use client";

import { AlertTriangle, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { useCustomers } from "@/hooks/useCustomers";
import { useInvoices } from "@/hooks/useInvoices";
import { useProducts } from "@/hooks/useProducts";
import { getApiErrorMessage } from "@/lib/api/client";
import { buildSalesInvoiceRequest, validateSalesInvoiceDraft } from "@/lib/invoice-form";
import { Button, Card, ComplianceAlert, FormShell, notifyDashboard, PageHeader } from "../ui";

type InvoiceItem = {
  id: number;
  productId: string;
  description: string;
  quantity: number;
  rate: number;
  vatRate: number;
};

function lineSubtotal(item: InvoiceItem) {
  return item.quantity * item.rate;
}

function lineVat(item: InvoiceItem) {
  return lineSubtotal(item) * (item.vatRate / 100);
}

function lineTotal(item: InvoiceItem) {
  return lineSubtotal(item) + lineVat(item);
}

function SalesInvoiceBuilder() {
  const customersState = useCustomers();
  const { customers, loading: customersLoading, error: customersError } = customersState;
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { create } = useInvoices();
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [invoiceType, setInvoiceType] = useState("standard_invoice");
  const [currency, setCurrency] = useState("NGN");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState("Thank you for your business.");
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const filteredCustomers = useMemo(() => {
    const search = customerSearch.trim().toLowerCase();
    if (!search) return customers;
    return customers.filter((customer) => [customer.name, customer.email, customer.phone1, customer.tax_identification_number].some((value) => value?.toLowerCase().includes(search)));
  }, [customerSearch, customers]);
  const selectedCustomer = customers.find((customer) => customer.id === customerId);
  const subtotal = lineItems.reduce((sum, item) => sum + lineSubtotal(item), 0);
  const vat = lineItems.reduce((sum, item) => sum + lineVat(item), 0);
  const total = Math.max(lineItems.reduce((sum, item) => sum + lineTotal(item), 0) - discountAmount, 0);

  useEffect(() => {
    if (!customerId && customers[0]) setCustomerId(customers[0].id);
  }, [customerId, customers]);

  useEffect(() => {
    if (lineItems.length || !products[0]) return;
    const product = products[0];
    setLineItems([{ id: Date.now(), productId: product.id, description: product.description ?? product.name, quantity: 1, rate: Number(product.unit_price ?? 0), vatRate: Number(product.tax_rate ?? 0) }]);
  }, [lineItems.length, products]);

  function updateItem(id: number, updates: Partial<InvoiceItem>) {
    setLineItems((current) => current.map((item) => item.id === id ? { ...item, ...updates } : item));
  }

  function chooseProduct(id: number, productId: string) {
    const product = productById.get(productId);
    updateItem(id, {
      productId,
      description: product?.description ?? product?.name ?? "",
      rate: Number(product?.unit_price ?? 0),
      vatRate: Number(product?.tax_rate ?? 0),
    });
  }

  function addItem() {
    const product = products[0];
    setLineItems((current) => [...current, {
      id: Date.now(),
      productId: product?.id ?? "",
      description: product?.description ?? product?.name ?? "",
      quantity: 1,
      rate: Number(product?.unit_price ?? 0),
      vatRate: Number(product?.tax_rate ?? 0),
    }]);
    notifyDashboard("New invoice line item added");
  }

  async function quickCreateCustomer() {
    const name = customerSearch.trim();
    if (!name) {
      setFormError("Enter a customer name to quick-create a customer.");
      return;
    }
    setCreatingCustomer(true);
    setFormError("");
    try {
      const response = await customersState.create({ customer_type: "business", name });
      setCustomerId(response.data.id);
      setCustomerSearch(response.data.name);
      notifyDashboard(`${response.data.name} created`);
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, "Unable to create customer from invoice form."));
    } finally {
      setCreatingCustomer(false);
    }
  }

  async function saveInvoice() {
    const draft = {
      customerId,
      invoiceType,
      issueDate,
      dueDate,
      currency,
      notes,
      discountAmount,
      lineItems,
    };
    const validationErrors = validateSalesInvoiceDraft(draft);
    if (validationErrors.length) {
      setFormError(validationErrors[0]);
      notifyDashboard(validationErrors[0]);
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const response = await create(buildSalesInvoiceRequest(draft));
      notifyDashboard(`${response.data.invoice_number} created`);
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to create invoice. Review the customer and line items, then try again.");
      setFormError(message);
      notifyDashboard(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Create Sales Invoice"
        subtitle="Select a customer, add products or services, calculate VAT, and prepare the invoice for sending."
        breadcrumb="Dashboard / Invoices / Create Invoice"
        action={<><Button variant="secondary" href="/dashboard/invoices/sales">Cancel</Button><Button onClick={saveInvoice}>{saving ? "Creating..." : "Create Invoice"}</Button></>}
      />
      {customersError || productsError ? <ComplianceAlert title="Unable to load API data" text={customersError || productsError} /> : null}
      {formError ? <ComplianceAlert title="Invoice cannot be created yet" text={formError} tone="warning" /> : null}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold">Customer & Invoice Details</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-bold text-[#454557] md:col-span-2">Customer
                <div className="mt-2 grid gap-2 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
                  <input
                    value={customerSearch}
                    onChange={(event) => setCustomerSearch(event.target.value)}
                    placeholder="Search customer or type a new customer name"
                    className="h-11 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]"
                  />
                  <select value={customerId} onChange={(event) => {
                    setCustomerId(event.target.value);
                    setCustomerSearch(customers.find((customer) => customer.id === event.target.value)?.name ?? customerSearch);
                  }} disabled={customersLoading} className="h-11 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]">
                    <option value="">{customersLoading ? "Loading customers..." : "Select customer"}</option>
                    {filteredCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} {!customer.tax_identification_number ? "(TIN missing)" : ""}</option>)}
                  </select>
                  <Button variant="secondary" onClick={quickCreateCustomer} className="min-h-11 whitespace-nowrap px-3" disabled={creatingCustomer}>
                    {creatingCustomer ? "Creating..." : "Quick Create"}
                  </Button>
                </div>
              </label>
              <label className="block text-sm font-bold text-[#454557]">Invoice Type
                <select value={invoiceType} onChange={(event) => setInvoiceType(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]">
                  <option value="standard_invoice">Standard invoice</option>
                  <option value="credit_note">Credit note</option>
                  <option value="debit_note">Debit note</option>
                </select>
              </label>
              <label className="block text-sm font-bold text-[#454557]">Issue Date
                <input type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]" />
              </label>
              <label className="block text-sm font-bold text-[#454557]">Due Date
                <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]" />
              </label>
              <label className="block text-sm font-bold text-[#454557]">Currency
                <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]">
                  {["NGN", "USD", "GBP", "EUR"].map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-[#C5C4DA] bg-[#F7F9FB] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">Invoice Items</h2>
                <p className="mt-1 text-sm text-[#454557]">Choose products/services from your API catalog, then adjust quantity and VAT.</p>
              </div>
              <Button variant="secondary" onClick={addItem}><Plus className="h-4 w-4" /> Add Item</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead className="bg-[#F1F4F8] text-xs uppercase text-[#454557]">
                  <tr>{["Product / Service", "Description", "Qty", "Rate", "VAT %", "Line Total", ""].map((column) => <th key={column} className="px-4 py-4">{column}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#DCE0E8]">
                  {lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4">
                        <select value={item.productId} onChange={(event) => chooseProduct(item.id, event.target.value)} disabled={productsLoading} className="h-10 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 text-sm font-semibold outline-none focus:border-[#1117E8]">
                          <option value="">Custom item</option>
                          {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-4"><input value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value })} className="h-10 w-full rounded-lg border border-[#C5C4DA] px-3 text-sm outline-none focus:border-[#1117E8]" /></td>
                      <td className="px-4 py-4"><input aria-label={`Quantity for ${item.description}`} type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: Number(event.target.value) || 1 })} className="h-10 w-20 rounded-lg border border-[#C5C4DA] px-3 text-sm outline-none focus:border-[#1117E8]" /></td>
                      <td className="px-4 py-4"><input aria-label={`Rate for ${item.description}`} type="number" min="0" value={item.rate} onChange={(event) => updateItem(item.id, { rate: Number(event.target.value) || 0 })} className="h-10 w-28 rounded-lg border border-[#C5C4DA] px-3 text-sm outline-none focus:border-[#1117E8]" /></td>
                      <td className="px-4 py-4"><input aria-label={`VAT for ${item.description}`} type="number" min="0" value={item.vatRate} onChange={(event) => updateItem(item.id, { vatRate: Number(event.target.value) || 0 })} className="h-10 w-20 rounded-lg border border-[#C5C4DA] px-3 text-sm outline-none focus:border-[#1117E8]" /></td>
                      <td className="px-4 py-4 font-bold"><CurrencyAmount amount={lineTotal(item)} /></td>
                      <td className="px-4 py-4 text-red-600"><button type="button" onClick={() => setLineItems((current) => current.filter(({ id }) => id !== item.id))} aria-label={`Remove ${item.description}`} className="rounded-lg p-2 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-bold text-[#454557]">Discount Amount
                <input type="number" min="0" value={discountAmount} onChange={(event) => setDiscountAmount(Number(event.target.value) || 0)} className="mt-2 h-11 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]" />
              </label>
              <label className="block text-sm font-bold text-[#454557] md:col-span-2">Invoice Notes
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-lg border border-[#C5C4DA] bg-white px-3 py-3 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]" />
              </label>
            </div>
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card className="p-6">
            <h2 className="text-xl font-bold">Invoice Summary</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><span className="text-[#454557]">Customer</span><b className="text-right">{selectedCustomer?.name ?? "Select customer"}</b></div>
              <div className="flex justify-between gap-3"><span className="text-[#454557]">Currency</span><b>{currency}</b></div>
              <div className="flex justify-between gap-3"><span className="text-[#454557]">Subtotal</span><b><CurrencyAmount amount={subtotal} /></b></div>
              <div className="flex justify-between gap-3"><span className="text-[#454557]">Discount</span><b>-<CurrencyAmount amount={discountAmount} /></b></div>
              <div className="flex justify-between gap-3"><span className="text-[#454557]">VAT</span><b><CurrencyAmount amount={vat} /></b></div>
              <div className="flex justify-between gap-3 border-t border-[#C5C4DA] pt-4 text-2xl font-extrabold text-[#0001B1]"><span>Total</span><span><CurrencyAmount amount={total} /></span></div>
            </div>
            <div className="mt-6 grid gap-3">
              <Button variant="secondary" href="/dashboard/invoices/sales">Cancel</Button>
              <Button onClick={saveInvoice}>{saving ? "Creating..." : "Create Invoice"}</Button>
            </div>
          </Card>
          <Card className="bg-[#EAEDFF] p-5">
            <h3 className="flex items-center gap-2 font-bold text-[#0001B1]"><ChevronDown className="h-4 w-4" /> Workflow</h3>
            <p className="mt-3 text-sm leading-6 text-[#454557]">Create invoices from verified customers and catalog items, then send from the Sales Invoices queue.</p>
          </Card>
        </aside>
      </div>
    </>
  );
}

export function CreateInvoicePage({ purchase = false }: { purchase?: boolean }) {
  if (!purchase) return <SalesInvoiceBuilder />;

  const sections: [string, string[]][] = [
    ["Supplier Information", ["Select Supplier", "Supplier Email", "Phone Number", "TIN (Tax Identification Number)"]],
    ["Invoice Details", ["Supplier Invoice #", "PayTraka Ref #", "Category", "Invoice Date", "Due Date", "Currency"]],
    ["Purchase Items", ["Product/Service", "Quantity", "Unit Cost", "VAT Rate"]],
    ["Tax & Deductions", ["Apply 7.5% VAT", "Withholding Tax", "Shipping/Delivery Fee"]],
    ["Payment Info", ["Amount Paid", "Payment Method", "Bank Account"]],
    ["Documentation", ["Upload purchase invoice"]],
    ["Internal Notes", ["Private Notes"]],
  ];

  return (
    <>
      <PageHeader
        title="Create Purchase Invoice"
        subtitle="Record supplier invoices, expenses, VAT, payment terms, and purchase documentation."
        breadcrumb="Dashboard / Invoices / Create Purchase Invoice"
        action={<><Button variant="secondary" href="/dashboard/invoices/purchase">Cancel</Button><Button variant="secondary" onClick={() => notifyDashboard("Purchase invoice draft saved")}>Save as Draft</Button><Button onClick={() => notifyDashboard("Purchase invoice saved")}>Save Purchase Invoice</Button></>}
      />
      <ComplianceAlert
        title="Supplier TIN is missing"
        text="You can save this invoice, but VAT and audit reports may need manual review to ensure FIRS compliance."
        action={<AlertTriangle className="h-5 w-5" />}
      />
      <FormShell title="Create Purchase Invoice" sideTitle="Purchase Summary" sections={sections} buttons={["Cancel", "Save as Draft", "Save and Record Payment", "Save Purchase Invoice"]} />
    </>
  );
}
