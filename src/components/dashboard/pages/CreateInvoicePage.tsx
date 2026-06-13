"use client";

import { AlertTriangle, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { customerRows, productRows } from "../data";
import { Button, Card, ComplianceAlert, FormShell, notifyDashboard, PageHeader } from "../ui";

type InvoiceItem = {
  id: number;
  product: string;
  quantity: number;
  rate: number;
  vatRate: number;
  discount: number;
};

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

function amountFromText(value: string) {
  return Number(value.replace(/[^\d.]/g, "")) || 0;
}

function productRate(productName: string) {
  const product = productRows.find(([name]) => name === productName);
  return product ? amountFromText(product[3]) : 0;
}

function productVat(productName: string) {
  const product = productRows.find(([name]) => name === productName);
  return product?.[4].includes("7.5") ? 7.5 : 0;
}

function lineSubtotal(item: InvoiceItem) {
  return item.quantity * item.rate;
}

function lineDiscount(item: InvoiceItem) {
  return lineSubtotal(item) * (item.discount / 100);
}

function lineTaxable(item: InvoiceItem) {
  return Math.max(lineSubtotal(item) - lineDiscount(item), 0);
}

function lineVat(item: InvoiceItem) {
  return lineTaxable(item) * (item.vatRate / 100);
}

function lineTotal(item: InvoiceItem) {
  return lineTaxable(item) + lineVat(item);
}

function SalesInvoiceBuilder() {
  const [customer, setCustomer] = useState(customerRows[0][0]);
  const [invoiceNumber, setInvoiceNumber] = useState("INV-2026-0105");
  const [issueDate, setIssueDate] = useState("2026-10-25");
  const [dueDate, setDueDate] = useState("2026-11-08");
  const [notes, setNotes] = useState("Thank you for your business.");
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    { id: 1, product: "Enterprise Software Suite", quantity: 1, rate: productRate("Enterprise Software Suite"), vatRate: productVat("Enterprise Software Suite"), discount: 0 },
    { id: 2, product: "Consultancy - Tier 1", quantity: 2, rate: productRate("Consultancy - Tier 1"), vatRate: productVat("Consultancy - Tier 1"), discount: 5 },
  ]);
  const subtotal = lineItems.reduce((sum, item) => sum + lineSubtotal(item), 0);
  const discount = lineItems.reduce((sum, item) => sum + lineDiscount(item), 0);
  const vat = lineItems.reduce((sum, item) => sum + lineVat(item), 0);
  const total = lineItems.reduce((sum, item) => sum + lineTotal(item), 0);

  function updateItem(id: number, updates: Partial<InvoiceItem>) {
    setLineItems((current) => current.map((item) => item.id === id ? { ...item, ...updates } : item));
  }

  function chooseProduct(id: number, product: string) {
    updateItem(id, { product, rate: productRate(product), vatRate: productVat(product) });
  }

  function addItem() {
    const product = productRows[0][0];
    setLineItems((current) => [...current, { id: Date.now(), product, quantity: 1, rate: productRate(product), vatRate: productVat(product), discount: 0 }]);
    notifyDashboard("New invoice line item added");
  }

  return (
    <>
      <PageHeader
        title="Create Sales Invoice"
        subtitle="Select a customer, add products or services, calculate VAT, and prepare the invoice for sending."
        breadcrumb="Dashboard / Invoices / Create Invoice"
        action={<><Button variant="secondary" onClick={() => notifyDashboard(`${invoiceNumber} saved as draft`)}>Save Draft</Button><Button onClick={() => notifyDashboard(`${invoiceNumber} created for ${customer}`)}>Create Invoice</Button></>}
      />

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold">Customer & Invoice Details</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-bold text-[#454557]">Customer
                <select value={customer} onChange={(event) => setCustomer(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]">
                  {customerRows.map(([name, tin]) => <option key={name} value={name}>{name} {tin === "TIN Missing" ? "(TIN missing)" : ""}</option>)}
                </select>
              </label>
              <label className="block text-sm font-bold text-[#454557]">Invoice Number
                <input value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]" />
              </label>
              <label className="block text-sm font-bold text-[#454557]">Issue Date
                <input type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]" />
              </label>
              <label className="block text-sm font-bold text-[#454557]">Due Date
                <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]" />
              </label>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-[#C5C4DA] bg-[#F7F9FB] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">Invoice Items</h2>
                <p className="mt-1 text-sm text-[#454557]">Choose products/services from your catalog, then adjust quantity, VAT, and discounts.</p>
              </div>
              <Button variant="secondary" onClick={addItem}><Plus className="h-4 w-4" /> Add Item</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead className="bg-[#F1F4F8] text-xs uppercase text-[#454557]">
                  <tr>{["Product / Service", "Qty", "Rate", "VAT %", "Discount %", "Line Total", ""].map((column) => <th key={column} className="px-4 py-4">{column}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#DCE0E8]">
                  {lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4">
                        <label className="sr-only" htmlFor={`product-${item.id}`}>Product or service</label>
                        <select id={`product-${item.id}`} value={item.product} onChange={(event) => chooseProduct(item.id, event.target.value)} className="h-10 w-full rounded-lg border border-[#C5C4DA] bg-white px-3 text-sm font-semibold outline-none focus:border-[#1117E8]">
                          {productRows.map(([name]) => <option key={name} value={name}>{name}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-4"><input aria-label={`Quantity for ${item.product}`} type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: Number(event.target.value) || 1 })} className="h-10 w-20 rounded-lg border border-[#C5C4DA] px-3 text-sm outline-none focus:border-[#1117E8]" /></td>
                      <td className="px-4 py-4"><input aria-label={`Rate for ${item.product}`} type="number" min="0" value={item.rate} onChange={(event) => updateItem(item.id, { rate: Number(event.target.value) || 0 })} className="h-10 w-28 rounded-lg border border-[#C5C4DA] px-3 text-sm outline-none focus:border-[#1117E8]" /></td>
                      <td className="px-4 py-4"><input aria-label={`VAT for ${item.product}`} type="number" min="0" value={item.vatRate} onChange={(event) => updateItem(item.id, { vatRate: Number(event.target.value) || 0 })} className="h-10 w-20 rounded-lg border border-[#C5C4DA] px-3 text-sm outline-none focus:border-[#1117E8]" /></td>
                      <td className="px-4 py-4"><input aria-label={`Discount for ${item.product}`} type="number" min="0" value={item.discount} onChange={(event) => updateItem(item.id, { discount: Number(event.target.value) || 0 })} className="h-10 w-24 rounded-lg border border-[#C5C4DA] px-3 text-sm outline-none focus:border-[#1117E8]" /></td>
                      <td className="px-4 py-4 font-bold">{money.format(lineTotal(item))}</td>
                      <td className="px-4 py-4 text-red-600"><button type="button" onClick={() => { setLineItems((current) => current.filter(({ id }) => id !== item.id)); notifyDashboard(`${item.product} removed`); }} aria-label={`Remove ${item.product}`} className="rounded-lg p-2 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6">
            <label className="block text-sm font-bold text-[#454557]">Invoice Notes
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-lg border border-[#C5C4DA] bg-white px-3 py-3 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]" />
            </label>
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card className="p-6">
            <h2 className="text-xl font-bold">Invoice Summary</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><span className="text-[#454557]">Customer</span><b className="text-right">{customer}</b></div>
              <div className="flex justify-between gap-3"><span className="text-[#454557]">Subtotal</span><b>{money.format(subtotal)}</b></div>
              <div className="flex justify-between gap-3"><span className="text-[#454557]">Discount</span><b>-{money.format(discount)}</b></div>
              <div className="flex justify-between gap-3"><span className="text-[#454557]">VAT</span><b>{money.format(vat)}</b></div>
              <div className="flex justify-between gap-3 border-t border-[#C5C4DA] pt-4 text-2xl font-extrabold text-[#0001B1]"><span>Total</span><span>{money.format(total)}</span></div>
            </div>
            <div className="mt-6 grid gap-3">
              <Button variant="secondary" onClick={() => notifyDashboard(`${invoiceNumber} saved as draft`)}>Save Draft</Button>
              <Button onClick={() => notifyDashboard(`${invoiceNumber} created for ${customer}`)}>Create Invoice</Button>
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
