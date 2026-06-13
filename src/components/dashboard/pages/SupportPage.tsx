"use client";

import { Code2, Eye, LifeBuoy, MessageSquare, Phone, Search, Send } from "lucide-react";
import { useState } from "react";
import { Button, Card, DashboardFormModal, DataTable, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

type Ticket = {
  id: string;
  category: string;
  subject: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Resolved" | "Pending";
};

const initialTickets: Ticket[] = [
  { id: "#TKT-9021", category: "Invoice", subject: "Failed to sync INV-102", priority: "High", status: "In Progress" },
  { id: "#TKT-8843", category: "Technical", subject: "Dashboard slow loading", priority: "Medium", status: "Pending" },
  { id: "#TKT-8711", category: "Billing", subject: "Receipt for April 2026", priority: "Low", status: "Resolved" },
];

export function SupportPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [tickets, setTickets] = useState(initialTickets);

  function createTicket() {
    setTickets((current) => [
      { id: `#TKT-${9100 + current.length}`, category: "Compliance", subject: "New support request", priority: "Medium", status: "Open" },
      ...current,
    ]);
  }

  return (
    <>
      <PageHeader
        title="Support Center"
        subtitle="Get help with invoices, FIRS/NRS submission, payment links, and account setup."
        action={<Button onClick={() => setModalOpen(true)}><MessageSquare className="h-4 w-4" /> Create Ticket</Button>}
      />
      <DashboardFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Support Ticket"
        description="Tell the PayTraka support team what you need help with."
        fields={["Subject", "Category", "Priority", "Message", "Related Invoice ID", "Upload attachment"]}
        submitLabel="Submit Ticket"
        onSubmit={createTicket}
        successMessage="Support ticket created"
      />
      <div className="mb-6 grid gap-5 md:grid-cols-4">
        <MetricCard label="Live Chat" value="Online" icon={MessageSquare} tone="success" />
        <MetricCard label="Knowledge Base" value="142" meta="Articles" icon={Search} />
        <MetricCard label="Compliance Expert" value="Book" icon={Phone} />
        <MetricCard label="API Support" value="24/7" icon={Code2} />
      </div>
      <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold">Fast Support Actions</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {["Live Chat", "Knowledge Base", "Contact Compliance Expert", "API/Integration Support"].map((action) => (
                <Button key={action} variant="secondary" onClick={() => notifyDashboard(`${action} opened`)}>{action}</Button>
              ))}
            </div>
          </Card>
          <DataTable
            title="My Support Tickets"
            columns={["Ticket ID", "Category", "Subject", "Priority", "Status", "Actions"]}
            rows={tickets.map((ticket) => ({
              "Ticket ID": ticket.id,
              Category: ticket.category,
              Subject: <b>{ticket.subject}</b>,
              Priority: <StatusBadge>{ticket.priority}</StatusBadge>,
              Status: <StatusBadge>{ticket.status}</StatusBadge>,
              Actions: rowActions(
                <>
                  <button type="button" onClick={() => notifyDashboard(`${ticket.id} opened`)} aria-label={`View ${ticket.id}`} className="rounded p-1 text-[#454557]"><Eye className="h-4 w-4" /></button>
                  <button type="button" onClick={() => notifyDashboard(`Reply opened for ${ticket.id}`)} aria-label={`Reply to ${ticket.id}`} className="rounded p-1 text-[#454557]"><Send className="h-4 w-4" /></button>
                </>,
                ticket.id,
              ),
            }))}
            footer={`Showing ${tickets.length} support tickets`}
          />
        </div>
        <aside className="space-y-6">
          <Card className="p-6"><h2 className="text-lg font-bold">Common Help Topics</h2><div className="mt-4 space-y-2 text-sm font-semibold text-[#454557]">{["Exporting tax reports", "Linking to ERP software", "Updating payment method", "Compliance regulation FAQ"].map((item) => <button key={item} type="button" onClick={() => notifyDashboard(`${item} article opened`)} className="block w-full rounded-lg px-2 py-2 text-left hover:bg-[#F1F4F8]">{item}</button>)}</div></Card>
          <Card className="bg-[#1117E8] p-6 text-white"><LifeBuoy className="h-6 w-6" /><h2 className="mt-3 text-xl font-bold">Direct Compliance Help</h2><p className="mt-3 text-sm leading-6 text-white/75">Need a one-on-one session with a tax expert? Compliance Pro members get priority scheduling for audits and filings.</p><Button variant="secondary" className="mt-5 w-full" onClick={() => notifyDashboard("Compliance help booking request sent")}>Book Compliance Help</Button></Card>
        </aside>
      </div>
    </>
  );
}
