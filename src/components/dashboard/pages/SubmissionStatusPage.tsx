"use client";

import { CheckCircle2, Clock, Download, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import { Button, Card, DataTable, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

type SubmissionStatus = "Pending" | "Submitted" | "Accepted" | "Rejected" | "Failed";

type SubmissionRecord = {
  id: string;
  party: string;
  type: string;
  status: SubmissionStatus;
  channel: string;
  lastAttempt: string;
};

const initialRecords: SubmissionRecord[] = [
  { id: "INV-2026-0042", party: "Julius Construction", type: "Sales", status: "Pending", channel: "APP/SI", lastAttempt: "Oct 24, 2026 10:24" },
  { id: "INV-2026-0041", party: "Akin & Sons Ltd", type: "Sales", status: "Accepted", channel: "APP/SI", lastAttempt: "Oct 22, 2026 14:02" },
  { id: "INV-2026-0040", party: "TechNova Hub", type: "Sales", status: "Failed", channel: "APP/SI", lastAttempt: "Oct 21, 2026 09:41" },
  { id: "PUR-2026-0019", party: "MainOne Tech", type: "Purchase", status: "Rejected", channel: "APP/SI", lastAttempt: "Oct 20, 2026 16:12" },
];

export function SubmissionStatusPage() {
  const [records, setRecords] = useState(initialRecords);

  function retrySubmission(id: string) {
    setRecords((current) => current.map((record) => record.id === id ? { ...record, status: "Pending", lastAttempt: "Retry queued now" } : record));
    notifyDashboard(`${id} retry queued`);
  }

  return (
    <>
      <PageHeader
        title="Submission Status"
        subtitle="Monitor submitted invoices, acknowledgements, failed attempts, and retry queues."
        action={<Button variant="secondary" onClick={() => notifyDashboard("Submission status CSV downloaded")}><Download className="h-4 w-4" /> Export Status</Button>}
      />
      <div className="mb-6 grid gap-5 md:grid-cols-4">
        <MetricCard label="Pending" value="18" meta="In queue" icon={Clock} />
        <MetricCard label="Submitted" value="31" meta="Awaiting response" icon={Clock} />
        <MetricCard label="Accepted" value="74" meta="This month" tone="success" icon={CheckCircle2} />
        <MetricCard label="Failed/Rejected" value="6" meta="Retry required" tone="danger" icon={XCircle} />
      </div>
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5"><h2 className="font-bold">Acknowledgements</h2><p className="mt-3 text-sm leading-6 text-[#454557]">Accepted submissions can download acknowledgement receipts for audit records.</p></Card>
        <Card className="p-5"><h2 className="font-bold">Retry Queue</h2><p className="mt-3 text-3xl font-extrabold text-[#DC2626]">6</p><p className="mt-1 text-sm text-[#454557]">Failed or rejected submissions awaiting retry.</p></Card>
        <Card className="p-5"><h2 className="font-bold">Channel Health</h2><p className="mt-3 text-sm font-bold text-green-700">APP/SI channel operational</p><p className="mt-2 text-sm text-[#454557]">Last sync completed 4 minutes ago.</p></Card>
      </div>
      <DataTable
        title="Submission History"
        columns={["Invoice ID", "Customer/Supplier", "Type", "FIRS/NRS Status", "Channel", "Last Attempt", "Actions"]}
        rows={records.map((record) => ({
          "Invoice ID": <b className="text-[#0001B1]">{record.id}</b>,
          "Customer/Supplier": record.party,
          Type: record.type,
          "FIRS/NRS Status": <StatusBadge>{record.status}</StatusBadge>,
          Channel: record.channel,
          "Last Attempt": record.lastAttempt,
          Actions: rowActions(
            <>
              {(record.status === "Failed" || record.status === "Rejected") ? <Button variant="secondary" className="min-h-9 px-3" onClick={() => retrySubmission(record.id)}><RotateCcw className="h-4 w-4" /> Retry</Button> : null}
              {record.status === "Accepted" ? <Button variant="secondary" className="min-h-9 px-3" onClick={() => notifyDashboard(`${record.id} acknowledgement downloaded`)}><Download className="h-4 w-4" /> Receipt</Button> : null}
            </>,
            record.id,
          ),
        }))}
        footer={`Showing ${records.length} submission records`}
      />
    </>
  );
}
