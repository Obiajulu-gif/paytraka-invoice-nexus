"use client";

import { Code2, LifeBuoy, MessageSquare, Phone, Search } from "lucide-react";
import { Button, Card, FormShell, MetricCard, notifyDashboard, PageHeader } from "../ui";

export function SupportPage() {
  const sections: [string, string[]][] = [
    ["Ticket Details", ["Subject", "Category", "Message", "Related Invoice ID (Optional)", "Submission ID (Optional)", "Upload attachment"]],
  ];

  return (
    <>
      <PageHeader title="Support Center" subtitle="Get help with invoices, FIRS/NRS submission, payment links, and account setup." />
      <div className="mb-6 grid gap-5 md:grid-cols-4">
        <MetricCard label="Live Chat" value="Online" icon={MessageSquare} tone="success" />
        <MetricCard label="Knowledge Base" value="142" meta="Articles" icon={Search} />
        <MetricCard label="Compliance Expert" value="Book" icon={Phone} />
        <MetricCard label="API Support" value="24/7" icon={Code2} />
      </div>
      <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <FormShell title="Add Support Ticket" sideTitle="Account Status" sections={sections} buttons={["Discard", "Submit Ticket"]} />
        <aside className="space-y-6">
          <Card className="p-6"><h2 className="text-lg font-bold">Common Help Topics</h2><div className="mt-4 space-y-2 text-sm font-semibold text-[#454557]">{["Exporting tax reports", "Linking to ERP software", "Updating payment method", "Compliance regulation FAQ"].map((item) => <button key={item} type="button" onClick={() => notifyDashboard(`${item} article opened`)} className="block w-full rounded-lg px-2 py-2 text-left hover:bg-[#F1F4F8]">{item}</button>)}</div></Card>
          <Card className="bg-[#1117E8] p-6 text-white"><LifeBuoy className="h-6 w-6" /><h2 className="mt-3 text-xl font-bold">Direct Compliance Help</h2><p className="mt-3 text-sm leading-6 text-white/75">Need a one-on-one session with a tax expert? Compliance Pro members get priority scheduling for audits and filings.</p><Button variant="secondary" className="mt-5 w-full" onClick={() => notifyDashboard("Compliance help booking request sent")}>Book Compliance Help</Button></Card>
        </aside>
      </div>
    </>
  );
}
