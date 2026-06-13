"use client";

import { Copy, CreditCard, Eye, Link2, Send, ShoppingCart, XCircle } from "lucide-react";
import { useState } from "react";
import { Button, Card, DashboardFormModal, DataTable, Input, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

export function PaymentLinksPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [links, setLinks] = useState([
    ["#PL-8921", "INV-2026-089", "Chioma Bakery", "₦450,000", "Paid"],
    ["#PL-8922", "INV-2026-090", "Jireh Logistics", "₦1,200,000", "Active"],
  ]);

  function createPaymentLink() {
    setLinks((current) => [["#PL-8923", "INV-2026-091", "New Lagos Customer", "₦450,000", "Active"], ...current]);
  }

  function generateLink() {
    createPaymentLink();
    notifyDashboard("Payment Link Copied to Clipboard");
  }

  function disableLink(id: string) {
    setLinks((current) => current.map((link) => link[0] === id ? [link[0], link[1], link[2], link[3], "Disabled"] : link));
    notifyDashboard(`${id} disabled`);
  }

  return (
    <>
      <PageHeader title="Payment Links" subtitle="Generate secure payment links for invoices and track customer payments." action={<Button onClick={() => setModalOpen(true)}><Link2 className="h-4 w-4" /> Create Payment Link</Button>} />
      <DashboardFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Payment Link"
        description="Generate a secure payment link for a selected invoice."
        submitLabel="Generate Link"
        fields={["Customer", "Amount", "Description", "Expiry Date", "Linked Invoice", "Payment provider", "Customer Message"]}
        onSubmit={createPaymentLink}
        successMessage="Payment Link Copied to Clipboard"
      />
      <div className="mb-6 grid gap-5 md:grid-cols-4">
        <MetricCard label="Total Payment Links" value="82" icon={Link2} />
        <MetricCard label="Active Links" value="35" tone="success" icon={CreditCard} />
        <MetricCard label="Paid Links" value="41" tone="primary" icon={ShoppingCart} />
        <MetricCard label="Expired Links" value="6" tone="danger" icon={Link2} />
      </div>
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold">Create New Payment Link</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input label="Select Invoice" value="INV-2026-089 - Chioma Bakery Ltd" />
              <Input label="Outstanding Balance" value="₦450,000.00" />
              <Input label="Link Title" />
              <Input label="Amount to Pay" value="450000" />
              <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" className="h-4 w-4 accent-[#1117E8]" /> Allow Partial Payment</label>
              <Input label="Expiry Date" />
              <Input label="Provider and methods" wide value="Paystack, Flutterwave, Card, Transfer, USSD" />
              <Input label="Customer Message" wide />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end"><Button variant="secondary" onClick={() => notifyDashboard("Payment link draft discarded")}>Discard</Button><Button type="button" onClick={generateLink}><Send className="h-4 w-4" /> Generate Link</Button></div>
          </Card>
          <DataTable
            title="Recent Payment Links"
            columns={["Link ID", "Invoice #", "Customer", "Amount", "Status", "Actions"]}
            rows={links.map(([id, invoice, customer, amount, status]) => ({
              "Link ID": id,
              "Invoice #": invoice,
              Customer: <b>{customer}</b>,
              Amount: amount,
              Status: <StatusBadge>{status}</StatusBadge>,
              Actions: rowActions(
                <>
                  <button type="button" onClick={() => notifyDashboard(`${id} details opened`)} aria-label={`View ${id}`} className="rounded p-1 text-[#454557]"><Eye className="h-4 w-4" /></button>
                  <button type="button" onClick={() => notifyDashboard(`${id} copied to clipboard`)} aria-label={`Copy ${id}`} className="rounded p-1 text-[#454557]"><Copy className="h-4 w-4" /></button>
                  {status !== "Disabled" ? <button type="button" onClick={() => disableLink(id)} aria-label={`Disable ${id}`} className="rounded p-1 text-red-600"><XCircle className="h-4 w-4" /></button> : null}
                </>,
                id,
              ),
            }))}
          />
        </div>
        <aside className="space-y-6">
          <Card className="bg-[#1117E8] p-6 text-white"><h2 className="text-xl font-bold">Live Summary</h2><div className="mt-5 space-y-4 text-sm"><p className="flex flex-col gap-1 sm:flex-row sm:justify-between">Total Outstanding <b>₦2,450,000.00</b></p><p className="flex flex-col gap-1 sm:flex-row sm:justify-between">Links Generated Today <b>12</b></p><p className="flex flex-col gap-1 sm:flex-row sm:justify-between">Expected Inflow <b>₦8,940,000.00</b></p></div></Card>
          <Card className="p-6 text-center"><ShoppingCart className="mx-auto h-10 w-10 text-[#1117E8]" /><h3 className="mt-5 text-xl font-bold">PayTraka SME Store</h3><p className="text-sm text-[#454557]">Invoice #INV-2026-089</p><div className="my-5 rounded-xl border border-[#C5C4DA] p-5"><p className="text-xs uppercase text-[#454557]">Amount Due</p><p className="text-3xl font-extrabold text-[#0001B1]">₦450,000</p></div><Button className="w-full" onClick={() => notifyDashboard("Customer payment checkout opened")}>Pay Now</Button></Card>
          <Card className="bg-[#EAEDFF] p-5"><h3 className="font-bold text-[#0001B1]">Pro Tip</h3><p className="mt-2 text-sm leading-6 text-[#454557]">Setting an expiry date on payment links increases conversion by 24% for Nigerian B2B customers.</p></Card>
        </aside>
      </div>
    </>
  );
}
