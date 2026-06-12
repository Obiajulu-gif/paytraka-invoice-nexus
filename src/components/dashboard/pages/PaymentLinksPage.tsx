"use client";

import { CreditCard, Link2, Send, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Button, Card, DashboardFormModal, DataTable, Input, MetricCard, PageHeader, StatusBadge, Toast, rowActions } from "../ui";

export function PaymentLinksPage() {
  const [toast, setToast] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  function generateLink() {
    setToast(true);
    window.setTimeout(() => setToast(false), 2600);
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
        fields={["Select Invoice", "Outstanding Balance", "Link Title", "Amount to Pay", "Expiry Date", "Customer Message"]}
      />
      <div className="mb-6 grid gap-5 md:grid-cols-4">
        <MetricCard label="Total Payment Links" value="82" icon={Link2} />
        <MetricCard label="Active Links" value="35" tone="success" icon={CreditCard} />
        <MetricCard label="Paid Links" value="41" tone="primary" icon={ShoppingCart} />
        <MetricCard label="Expired Links" value="6" tone="danger" icon={Link2} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
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
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end"><Button variant="secondary">Discard</Button><Button type="button" onClick={generateLink}><Send className="h-4 w-4" /> Generate Link</Button></div>
          </Card>
          <DataTable
            title="Recent Payment Links"
            columns={["Link ID", "Invoice #", "Customer", "Amount", "Status", "Actions"]}
            rows={[
              { "Link ID": "#PL-8921", "Invoice #": "INV-2026-089", Customer: <b>Chioma Bakery</b>, Amount: "₦450,000", Status: <StatusBadge>Paid</StatusBadge>, Actions: rowActions() },
              { "Link ID": "#PL-8922", "Invoice #": "INV-2026-090", Customer: <b>Jireh Logistics</b>, Amount: "₦1,200,000", Status: <StatusBadge>Active</StatusBadge>, Actions: rowActions() },
            ]}
          />
        </div>
        <aside className="space-y-6">
          <Card className="bg-[#1117E8] p-6 text-white"><h2 className="text-xl font-bold">Live Summary</h2><div className="mt-5 space-y-4 text-sm"><p className="flex justify-between">Total Outstanding <b>₦2,450,000.00</b></p><p className="flex justify-between">Links Generated Today <b>12</b></p><p className="flex justify-between">Expected Inflow <b>₦8,940,000.00</b></p></div></Card>
          <Card className="p-6 text-center"><ShoppingCart className="mx-auto h-10 w-10 text-[#1117E8]" /><h3 className="mt-5 text-xl font-bold">PayTraka SME Store</h3><p className="text-sm text-[#454557]">Invoice #INV-2026-089</p><div className="my-5 rounded-xl border border-[#C5C4DA] p-5"><p className="text-xs uppercase text-[#454557]">Amount Due</p><p className="text-3xl font-extrabold text-[#0001B1]">₦450,000</p></div><Button className="w-full">Pay Now</Button></Card>
          <Card className="bg-[#EAEDFF] p-5"><h3 className="font-bold text-[#0001B1]">Pro Tip</h3><p className="mt-2 text-sm leading-6 text-[#454557]">Setting an expiry date on payment links increases conversion by 24% for Nigerian B2B customers.</p></Card>
        </aside>
      </div>
      <Toast show={toast}>Payment Link Copied to Clipboard</Toast>
    </>
  );
}
