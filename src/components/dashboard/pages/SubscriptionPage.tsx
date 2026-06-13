"use client";

import { CheckCircle2, CreditCard } from "lucide-react";
import { useState } from "react";
import { Button, Card, DashboardFormModal, DataTable, notifyDashboard, PageHeader, StatusBadge } from "../ui";

export function SubscriptionPage() {
  const [modal, setModal] = useState<"cancel" | "upgrade" | "sales" | "billing" | null>(null);
  const plans = [
    ["Starter", "Perfect for freelancers starting their tax journey.", "₦0/mo", ["Up to 5 invoices/mo", "Basic VAT calculation", "Email support"]],
    ["Compliance Pro", "The standard for growing Nigerian SMEs.", "₦29/mo", ["Unlimited invoices", "Advanced VAT reports", "Multi-user access", "Priority chat support"]],
    ["Enterprise", "Custom solutions for institutional requirements.", "Custom", ["API access", "Dedicated accountant", "Custom integrations"]],
  ] as const;

  return (
    <>
      <PageHeader title="Manage Subscription" subtitle="Control your billing, change plans, and view history." />
      <DashboardFormModal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal === "cancel" ? "Cancel Subscription" : modal === "sales" ? "Contact Sales" : modal === "billing" ? "Manage Billing" : "Upgrade Subscription"}
        description={modal === "cancel" ? "Tell us why you are cancelling so support can assist." : modal === "billing" ? "Update billing contact, payment method, and invoice delivery settings." : "Confirm your billing contact and preferred plan."}
        submitLabel={modal === "cancel" ? "Submit Cancellation" : modal === "sales" ? "Request Sales Call" : modal === "billing" ? "Save Billing Details" : "Upgrade Plan"}
        fields={modal === "cancel" ? ["Cancellation reason", "Feedback"] : modal === "billing" ? ["Billing contact", "Company email", "Payment method", "Billing address"] : ["Billing contact", "Company email", "Preferred plan", "Notes"]}
      />
      <Card className="mb-6 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4"><span className="rounded-2xl bg-[#DADEFD] p-4 text-[#0001B1]"><CreditCard className="h-6 w-6" /></span><div><p className="text-lg font-bold">Current Plan: Compliance Pro <StatusBadge tone="success">Active</StatusBadge></p><p className="text-sm text-[#454557]">Your plan renews on January 12, 2027.</p></div></div>
        <div className="flex flex-col gap-3 sm:flex-row"><Button variant="secondary" onClick={() => setModal("billing")}>Manage Billing</Button><Button variant="secondary" onClick={() => setModal("cancel")}>Cancel Subscription</Button><Button onClick={() => setModal("upgrade")}>Upgrade Now</Button></div>
      </Card>
      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <Card className="p-5"><p className="text-sm font-bold uppercase text-[#454557]">Invoice Usage</p><p className="mt-3 text-3xl font-extrabold">642 / 1,000</p><div className="mt-4 h-2 rounded-full bg-[#EEF1F5]"><div className="h-full w-[64%] rounded-full bg-[#1117E8]" /></div></Card>
        <Card className="p-5"><p className="text-sm font-bold uppercase text-[#454557]">Billing Period</p><p className="mt-3 text-3xl font-extrabold">Monthly</p><p className="mt-2 text-sm text-[#454557]">Next invoice: Jan 12, 2027</p></Card>
        <Card className="p-5"><p className="text-sm font-bold uppercase text-[#454557]">Seats</p><p className="mt-3 text-3xl font-extrabold">4 / 5</p><Button variant="secondary" className="mt-4 min-h-10 px-3" onClick={() => notifyDashboard("Seat management opened")}>Manage Seats</Button></Card>
      </div>
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        {plans.map(([name, description, price, features], index) => (
          <Card key={name} className={`relative p-6 ${index === 1 ? "border-[#1117E8] shadow-xl" : ""}`}>
            {index === 1 ? <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#0001B1] px-6 py-2 text-xs font-bold text-white">RECOMMENDED</span> : null}
            <h2 className="text-xl font-bold">{name}</h2><p className="mt-3 text-[#454557]">{description}</p><p className="mt-6 text-2xl font-extrabold text-[#0001B1]">{price}</p>
            <div className="mt-6 space-y-3">{features.map((feature) => <p key={feature} className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-[#0001B1]" /> {feature}</p>)}</div>
            <Button className="mt-8 w-full" variant={index === 0 ? "secondary" : "primary"} onClick={() => index === 0 ? notifyDashboard("Starter is your current plan comparison") : setModal(index === 1 ? "upgrade" : "sales")}>{index === 0 ? "Current Plan" : index === 1 ? "Upgrade Now" : "Contact Sales"}</Button>
          </Card>
        ))}
      </div>
      <DataTable title="Billing History" columns={["Invoice ID", "Date", "Amount", "Status", "Action"]} rows={[
        { "Invoice ID": "#INV-2026-012", Date: "Dec 12, 2026", Amount: "₦29,000.00", Status: <StatusBadge>Paid</StatusBadge>, Action: <button type="button" onClick={() => notifyDashboard("Billing PDF downloaded")} className="font-bold text-[#0001B1]">PDF</button> },
        { "Invoice ID": "#INV-2026-011", Date: "Nov 12, 2026", Amount: "₦29,000.00", Status: <StatusBadge>Paid</StatusBadge>, Action: <button type="button" onClick={() => notifyDashboard("Billing PDF downloaded")} className="font-bold text-[#0001B1]">PDF</button> },
        { "Invoice ID": "#INV-2026-010", Date: "Oct 12, 2026", Amount: "₦29,000.00", Status: <StatusBadge>Failed</StatusBadge>, Action: "N/A" },
      ]} />
    </>
  );
}
