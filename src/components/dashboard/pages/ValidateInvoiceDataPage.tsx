"use client";

import { AlertTriangle, CheckCircle2, ClipboardCheck, FileSearch, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button, Card, DashboardFormModal, DataTable, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

type ValidationInvoice = {
  id: string;
  party: string;
  type: string;
  amount: string;
  status: "Ready" | "Failed" | "Review";
  issues: string;
};

const initialInvoices: ValidationInvoice[] = [
  { id: "INV-2026-0102", party: "MainOne Cable Co.", type: "Sales", amount: "₦1,120,500.00", status: "Failed", issues: "Customer TIN missing; product HS code required" },
  { id: "INV-2026-0103", party: "Zinox Technologies", type: "Sales", amount: "₦850,000.00", status: "Review", issues: "VAT category requires finance review" },
  { id: "PUR-2026-0021", party: "Dangote Group", type: "Purchase", amount: "₦1,240,000.00", status: "Ready", issues: "No validation issues" },
  { id: "INV-2026-0104", party: "Flutterwave Inc.", type: "Sales", amount: "₦2,300,000.00", status: "Ready", issues: "No validation issues" },
];

export function ValidateInvoiceDataPage() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<ValidationInvoice | null>(null);

  function validateInvoice(id: string) {
    setInvoices((current) => current.map((invoice) => invoice.id === id ? { ...invoice, status: "Ready", issues: "No validation issues" } : invoice));
    notifyDashboard(`${id} validation completed`);
  }

  return (
    <>
      <PageHeader
        title="Validate Invoice Data"
        subtitle="Review invoice fields, tax identities, VAT settings, and HS codes before submission."
        action={<Button onClick={() => notifyDashboard("Bulk validation started for pending invoices")}><ClipboardCheck className="h-4 w-4" /> Validate All Ready Items</Button>}
      />
      <div className="mb-6 grid gap-5 md:grid-cols-4">
        <MetricCard label="Readiness Score" value="92%" meta="Live mode active" tone="success" icon={ShieldCheck} />
        <MetricCard label="Pending Review" value="12" meta="Needs finance check" icon={FileSearch} />
        <MetricCard label="Failed Validation" value="6" meta="Action required" tone="danger" icon={AlertTriangle} />
        <MetricCard label="Ready to Submit" value="74" meta="Passed validation" tone="success" icon={CheckCircle2} />
      </div>
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="font-bold">Validation Rules</h2>
          <div className="mt-4 space-y-3 text-sm text-[#454557]">
            {["Customer and supplier TIN present", "VAT and WHT classifications complete", "Product HS/tax codes mapped", "Invoice totals reconcile with line items"].map((item) => (
              <p key={item} className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-green-600" /> {item}</p>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">APP/SI Preparation</h2>
          <p className="mt-4 text-sm leading-6 text-[#454557]">Invoices marked ready can be prepared and submitted through approved APP/SI pathways.</p>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Validation Queue</h2>
          <p className="mt-4 text-3xl font-extrabold text-[#0001B1]">92</p>
          <p className="mt-2 text-sm text-[#454557]">Invoices checked in the last 24 hours.</p>
        </Card>
      </div>
      <DataTable
        title="Invoices Pending Validation"
        columns={["Invoice ID", "Customer/Supplier", "Type", "Amount", "Validation Status", "Issues", "Actions"]}
        rows={invoices.map((invoice) => ({
          "Invoice ID": <b className="text-[#0001B1]">{invoice.id}</b>,
          "Customer/Supplier": invoice.party,
          Type: invoice.type,
          Amount: invoice.amount,
          "Validation Status": <StatusBadge>{invoice.status}</StatusBadge>,
          Issues: invoice.issues,
          Actions: rowActions(
            <>
              <Button className="min-h-9 px-3" onClick={() => validateInvoice(invoice.id)}>Validate</Button>
              <Button variant="secondary" className="min-h-9 px-3" onClick={() => setSelectedInvoice(invoice)}>Issues</Button>
            </>,
            invoice.id,
          ),
        }))}
        footer={`Showing ${invoices.length} validation records`}
      />
      <DashboardFormModal
        open={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice ? `Validation Issues: ${selectedInvoice.id}` : "Validation Issues"}
        description={selectedInvoice?.issues ?? "Review validation issues and add remediation notes."}
        fields={["Customer/Supplier TIN", "HS or Tax Code", "VAT Category", "Reviewer Notes"]}
        submitLabel="Mark as Validated"
        onSubmit={() => selectedInvoice ? validateInvoice(selectedInvoice.id) : undefined}
      />
    </>
  );
}
