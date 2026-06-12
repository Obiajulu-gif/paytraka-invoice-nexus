import { Activity, CheckCircle2, Clock, RotateCcw, ShieldCheck, UploadCloud, XCircle } from "lucide-react";
import { Button, Card, DataTable, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

export function CompliancePage() {
  return (
    <>
      <PageHeader title="Compliance Tracker" subtitle="Track validation, submission, acceptance, failures, and retries across all invoices." action={<Button onClick={() => notifyDashboard("Eligible invoices submitted to FIRS/NRS queue")}><UploadCloud className="h-4 w-4" /> Submit to FIRS/NRS</Button>} />
      <div className="mb-6 grid gap-5 md:grid-cols-4"><MetricCard label="Readiness Score" value="92%" meta="Live mode active" tone="success" icon={ShieldCheck} /><MetricCard label="Pending Submissions" value="18" meta="In queue" icon={Clock} /><MetricCard label="Failed Validations" value="6" meta="Action required" tone="danger" icon={XCircle} /><MetricCard label="Accepted Invoices" value="74" meta="This month" tone="success" icon={CheckCircle2} /></div>
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5"><h2 className="font-bold">Submission Timeline</h2><div className="mt-4 space-y-3 text-sm">{["Validated invoice data", "Submitted through approved APP/SI pathway", "Awaiting NRS acceptance"].map((item, index) => <p key={item} className="flex items-center gap-3"><StatusBadge tone={index < 2 ? "success" : "warning"}>{index + 1}</StatusBadge>{item}</p>)}</div></Card>
        <Card className="p-5"><h2 className="font-bold">APP/SI Channel Status</h2><p className="mt-4 flex items-center gap-2 text-green-700"><Activity className="h-5 w-5" /> Operational</p><p className="mt-2 text-sm text-[#454557]">Prepare and submit through approved APP/SI pathways.</p></Card>
        <Card className="p-5"><h2 className="font-bold">Retry Queue</h2><p className="mt-4 text-3xl font-extrabold text-[#DC2626]">6</p><Button variant="secondary" className="mt-4" onClick={() => notifyDashboard("Failed validation retries queued")}><RotateCcw className="h-4 w-4" /> Retry Failed</Button></Card>
      </div>
      <DataTable title="Compliance Work Queue" columns={["Invoice ID", "Customer/Supplier", "Type", "Validation Status", "FIRS/NRS Status", "Channel", "Last Attempt", "Actions"]} rows={[
        { "Invoice ID": "INV-2026-0042", "Customer/Supplier": "Julius Construction", Type: "Sales", "Validation Status": <StatusBadge>Ready</StatusBadge>, "FIRS/NRS Status": <StatusBadge>Pending</StatusBadge>, Channel: "APP/SI", "Last Attempt": "Oct 24, 2026", Actions: rowActions(<Button className="min-h-9 px-3" onClick={() => notifyDashboard("INV-2026-0042 submitted")}>Submit</Button>, "INV-2026-0042") },
        { "Invoice ID": "INV-2026-0041", "Customer/Supplier": "Akin & Sons Ltd", Type: "Sales", "Validation Status": <StatusBadge>Accepted</StatusBadge>, "FIRS/NRS Status": <StatusBadge>Accepted</StatusBadge>, Channel: "APP/SI", "Last Attempt": "Oct 22, 2026", Actions: rowActions(undefined, "INV-2026-0041") },
        { "Invoice ID": "PUR-2026-0019", "Customer/Supplier": "MainOne Tech", Type: "Purchase", "Validation Status": <StatusBadge>Failed</StatusBadge>, "FIRS/NRS Status": <StatusBadge>Review</StatusBadge>, Channel: "APP/SI", "Last Attempt": "Oct 21, 2026", Actions: rowActions(<Button variant="secondary" className="min-h-9 px-3" onClick={() => notifyDashboard("PUR-2026-0019 retry queued")}>Retry</Button>, "PUR-2026-0019") },
      ]} />
    </>
  );
}
