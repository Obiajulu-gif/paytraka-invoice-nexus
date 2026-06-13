"use client";

import { CheckCircle2, Landmark, Send, ShieldCheck, UploadCloud } from "lucide-react";
import { useState } from "react";
import { Button, Card, DashboardFormModal, DataTable, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

type SubmissionInvoice = {
  id: string;
  customer: string;
  amount: string;
  channel: string;
  status: "Ready" | "Queued" | "Submitted";
};

const initialInvoices: SubmissionInvoice[] = [
  { id: "INV-2026-0042", customer: "Julius Construction", amount: "₦1,290,000.00", channel: "APP/SI", status: "Ready" },
  { id: "INV-2026-0044", customer: "Lagos Marine Services", amount: "₦620,000.00", channel: "APP/SI", status: "Ready" },
  { id: "INV-2026-0045", customer: "Akin & Sons Ltd", amount: "₦450,000.00", channel: "APP/SI", status: "Queued" },
];

export function SubmitCompliancePage() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [confirmInvoice, setConfirmInvoice] = useState<SubmissionInvoice | null>(null);

  function submitInvoice(id: string) {
    setInvoices((current) => current.map((invoice) => invoice.id === id ? { ...invoice, status: "Submitted" } : invoice));
    notifyDashboard(`${id} submitted to FIRS/NRS queue`);
  }

  function submitAllReady() {
    setInvoices((current) => current.map((invoice) => invoice.status === "Ready" ? { ...invoice, status: "Submitted" } : invoice));
    notifyDashboard("Ready invoices submitted to FIRS/NRS queue");
  }

  return (
    <>
      <PageHeader
        title="Submit to FIRS/NRS"
        subtitle="Submit validated invoices through approved APP/SI pathways and track immediate queue status."
        action={<Button onClick={submitAllReady}><UploadCloud className="h-4 w-4" /> Submit Ready Invoices</Button>}
      />
      <div className="mb-6 grid gap-5 md:grid-cols-4">
        <MetricCard label="Validated Invoices" value="74" meta="Ready for submission" tone="success" icon={ShieldCheck} />
        <MetricCard label="Ready Now" value="28" meta="Passed all checks" icon={CheckCircle2} />
        <MetricCard label="Queued Today" value="11" meta="Awaiting gateway" icon={Send} />
        <MetricCard label="Submission Channel" value="APP/SI" meta="Operational" tone="success" icon={Landmark} />
      </div>
      <Card className="mb-6 p-5">
        <h2 className="font-bold">Submission Confirmation Rules</h2>
        <p className="mt-2 text-sm leading-6 text-[#454557]">Live mode submissions are recorded in the compliance audit trail. Review totals, TINs, VAT fields, and customer records before confirming.</p>
      </Card>
      <DataTable
        title="Validated Invoices Ready for Submission"
        columns={["Invoice ID", "Customer", "Amount", "Validation", "Channel", "Submission Status", "Actions"]}
        rows={invoices.map((invoice) => ({
          "Invoice ID": <b className="text-[#0001B1]">{invoice.id}</b>,
          Customer: invoice.customer,
          Amount: invoice.amount,
          Validation: <StatusBadge tone="success">Ready</StatusBadge>,
          Channel: invoice.channel,
          "Submission Status": <StatusBadge>{invoice.status}</StatusBadge>,
          Actions: rowActions(
            <Button className="min-h-9 px-3" onClick={() => setConfirmInvoice(invoice)}>Submit</Button>,
            invoice.id,
          ),
        }))}
        footer={`Showing ${invoices.length} invoices ready for submission`}
      />
      <DashboardFormModal
        open={Boolean(confirmInvoice)}
        onClose={() => setConfirmInvoice(null)}
        title="Confirm FIRS/NRS Submission"
        description={confirmInvoice ? `Review ${confirmInvoice.id} before final submission through ${confirmInvoice.channel}.` : "Review invoice details before final submission."}
        fields={["Invoice number", "Submission channel", "Authorizer", "Security note"]}
        submitLabel="Confirm and Submit"
        onSubmit={() => confirmInvoice ? submitInvoice(confirmInvoice.id) : undefined}
      />
    </>
  );
}
