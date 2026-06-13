"use client";

import { BarChart3, Download, FileText, Hourglass, Users } from "lucide-react";
import { useState } from "react";
import { Button, Card, DashboardFormModal, DataTable, MetricCard, notifyDashboard, PageHeader, StatusBadge } from "../ui";

export function ReportsPage() {
  const [filingOpen, setFilingOpen] = useState(false);
  const reportCards = [
    ["Sales Report", "Revenue, invoice totals, product performance, and regional sales distribution.", BarChart3],
    ["Tax/VAT Report", "Output VAT, input VAT, net VAT payable, and filing readiness checks.", FileText],
    ["Customer Balance Report", "Outstanding customer balances, credit notes, and payment status.", Users],
    ["Invoice Aging Report", "Overdue buckets, high-risk receivables, and collection priorities.", Hourglass],
  ] as const;
  const categories = [
    ["Software Licenses", "₦840,000", "34%", "w-[34%]"],
    ["Consulting Services", "₦620,000", "25%", "w-[25%]"],
    ["Managed Hardware", "₦490,000", "20%", "w-[20%]"],
    ["Support Retainers", "₦320,000", "13%", "w-[13%]"],
  ];

  return (
    <>
      <PageHeader
        title="VAT Summary Report"
        subtitle="Review your monthly tax obligations and compliance status."
        action={<><Button variant="secondary" onClick={() => notifyDashboard("Month selector opened")}>November 2026</Button><Button variant="secondary" onClick={() => notifyDashboard("VAT Summary PDF downloaded")}><Download className="h-4 w-4" /> Download PDF</Button><Button variant="secondary" onClick={() => notifyDashboard("VAT Summary CSV exported")}>Export CSV</Button></>}
      />
      <DashboardFormModal open={filingOpen} onClose={() => setFilingOpen(false)} title="Complete Monthly Filing" description="Review and confirm your monthly VAT filing package before submission." submitLabel="Complete Filing" fields={["Filing month", "Output VAT", "Input VAT", "Net VAT payable", "Approver note"]} />
      <div className="mb-6 grid gap-5 md:grid-cols-3"><MetricCard label="Output VAT (Sales)" value="₦2,450,000.00" meta="+12.5%" /><MetricCard label="Input VAT (Purchases)" value="₦1,120,500.00" meta="+4.2%" /><MetricCard label="Net VAT Payable" value="₦1,329,500.00" tone="primary" meta="Due by Dec 21, 2026" /></div>
      <div className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {reportCards.map(([title, description, Icon]) => (
          <Card key={title} className="p-5">
            <span className="inline-flex rounded-xl bg-[#DADEFD] p-3 text-[#0001B1]"><Icon className="h-5 w-5" /></span>
            <h2 className="mt-4 text-lg font-bold">{title}</h2>
            <p className="mt-2 min-h-16 text-sm leading-6 text-[#454557]">{description}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button className="min-h-10 px-3" onClick={() => notifyDashboard(`${title} opened`)}>View</Button>
              <Button variant="secondary" className="min-h-10 px-3" onClick={() => notifyDashboard(`${title} CSV exported`)}><Download className="h-4 w-4" /> Export</Button>
            </div>
          </Card>
        ))}
      </div>
      <div className="mb-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-6"><h2 className="text-xl font-bold">VAT by Product Category</h2><div className="mt-6 space-y-5">{categories.map(([label, value, pct, width]) => <div key={label}><div className="flex flex-col gap-1 font-semibold sm:flex-row sm:justify-between"><span>{label}</span><span>{value} ({pct})</span></div><div className="mt-2 h-3 rounded-full bg-[#E5E7EB]"><div className={`h-full rounded-full bg-[#1117E8] ${width}`} /></div></div>)}</div></Card>
        <Card className="p-6"><h2 className="text-xl font-bold">Compliance Status</h2><div className="mt-5 h-2 rounded-full bg-[#E5E7EB]"><div className="h-full w-3/4 rounded-full bg-green-600" /></div><p className="mt-3 font-bold text-green-700">75% Ready</p><div className="mt-6 space-y-4">{["Sales Invoices Synced", "Purchases Categorized", "Customer TIN Verification", "Final Filing Review"].map((item, index) => <div key={item} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><span>{item}</span><StatusBadge tone={index === 3 ? "warning" : "success"}>{index === 3 ? "Pending" : "Ready"}</StatusBadge></div>)}</div><Button className="mt-6 w-full" onClick={() => setFilingOpen(true)}>Complete Filing</Button></Card>
      </div>
      <DataTable title="Recent Tax Activities" columns={["Date", "Activity", "Entity", "Amount", "Status"]} rows={[
        { Date: "Nov 22, 2026", Activity: <b>WHT Certificate Generated</b>, Entity: "Sterling Systems Ltd", Amount: "₦12,400.00", Status: <StatusBadge>Success</StatusBadge> },
        { Date: "Nov 18, 2026", Activity: <b>VAT Claim Reconciliation</b>, Entity: "Amazon Web Services", Amount: "₦45,210.00", Status: <StatusBadge>Pending</StatusBadge> },
        { Date: "Nov 15, 2026", Activity: <b>Quarterly Tax Estimate</b>, Entity: "Internal Revenue Service", Amount: "₦8,200,000.00", Status: <StatusBadge>Filed</StatusBadge> },
      ]} />
    </>
  );
}
