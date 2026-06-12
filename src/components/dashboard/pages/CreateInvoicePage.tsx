"use client";

import { AlertTriangle, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, Card, ComplianceAlert, FormShell, notifyDashboard, PageHeader } from "../ui";

function SalesInvoiceBuilder() {
  const [lineItems, setLineItems] = useState([
    ["Enterprise Software License", "1", "450,000.00", "7.5% Standard", "₦450,000.00"],
    ["On-site Training Session", "2", "75,000.00", "7.5% Standard", "₦150,000.00"],
  ]);

  return (
    <>
      <PageHeader
        title="Create Sales Invoice"
        subtitle="Build a compliant invoice with customer details, line items, VAT, and submission readiness."
        breadcrumb="Dashboard / Invoices / Create Invoice"
        action={<><Button variant="secondary" onClick={() => notifyDashboard("Sales invoice draft saved")}>Save as Draft</Button><Button onClick={() => notifyDashboard("Invoice summary ready for review")}>Continue</Button></>}
      />
      <Card className="overflow-hidden">
        <div className="border-b border-[#C5C4DA] bg-[#F7F9FB] p-5">
          <div className="mx-auto grid max-w-3xl grid-cols-3 items-center text-center text-sm font-bold text-[#454557]">
            {["Customer Details", "Line Items", "Summary"].map((step, index) => (
              <div key={step} className="relative">
                <span className={`mx-auto grid h-9 w-9 place-items-center rounded-full ${index < 2 ? "bg-[#1117E8] text-white" : "border border-[#C5C4DA] bg-white"}`}>{index === 0 ? "✓" : index + 1}</span>
                <p className={index < 2 ? "mt-2 text-[#0001B1]" : "mt-2"}>{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold">Add Products & Services</h2>
          <p className="mt-1 text-sm text-[#454557]">Specify quantities and applicable VAT for each item in this invoice.</p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-[#C5C4DA]">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[#F1F4F8] text-xs uppercase text-[#454557]">
                <tr>{["Product / Service", "Qty", "Unit Price (₦)", "VAT Rate", "Amount", ""].map((column) => <th key={column} className="px-5 py-4">{column}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#DCE0E8]">
                {lineItems.map(([product, qty, price, vat, amount], index) => (
                  <tr key={product}>
                    <td className="px-5 py-5 font-semibold">{product}</td>
                    <td className="px-5 py-5">{qty}</td>
                    <td className="px-5 py-5">{price}</td>
                    <td className="px-5 py-5"><span className="inline-flex items-center gap-2">{vat}<ChevronDown className="h-4 w-4" /></span></td>
                    <td className="px-5 py-5 font-bold">{amount}</td>
                    <td className="px-5 py-5 text-red-600"><button type="button" onClick={() => { setLineItems((current) => current.filter((_, itemIndex) => itemIndex !== index)); notifyDashboard(`${product} removed`); }} aria-label={`Remove ${product}`}><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#F1F4F8]">
                <tr><td colSpan={6} className="px-5 py-4 text-center"><Button variant="ghost" onClick={() => { setLineItems((current) => [...current, ["New Consulting Service", "1", "0.00", "7.5% Standard", "₦0.00"]]); notifyDashboard("New invoice line item added"); }}><Plus className="h-4 w-4" /> Add New Item</Button></td></tr>
              </tfoot>
            </table>
          </div>
          <div className="ml-auto mt-6 max-w-sm space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[#454557]">Subtotal</span><span>₦600,000.00</span></div>
            <div className="flex justify-between"><span className="text-[#454557]">VAT (7.5%)</span><span>₦45,000.00</span></div>
            <div className="flex justify-between border-t border-[#C5C4DA] pt-3 text-3xl font-extrabold text-[#0001B1]"><span>Total</span><span>₦645,000.00</span></div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-[#C5C4DA] bg-[#F7F9FB] p-5 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="secondary" href="/dashboard/invoices/sales">Back</Button>
          <div className="flex flex-col gap-3 sm:flex-row"><Button variant="secondary" onClick={() => notifyDashboard("Sales invoice draft saved")}>Save as Draft</Button><Button onClick={() => notifyDashboard("Invoice summary ready for review")}>Continue</Button></div>
        </div>
      </Card>
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
