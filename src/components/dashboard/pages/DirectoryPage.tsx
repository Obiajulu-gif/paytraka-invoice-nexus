"use client";

import { AlertTriangle, Download, Filter, Plus, ShieldCheck, Truck, Users } from "lucide-react";
import { useState } from "react";
import { customerRows, supplierRows } from "../data";
import { AddCustomerModal, Button, Card, ComplianceAlert, DataTable, MetricCard, PageHeader, StatusBadge, rowActions } from "../ui";

function DirectoryPage({ type }: { type: "customers" | "suppliers" }) {
  const isCustomers = type === "customers";
  const rows = isCustomers ? customerRows : supplierRows;
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <PageHeader
        title={isCustomers ? "Customer Directory" : "Supplier Directory"}
        subtitle={isCustomers ? "Manage client tax identities and billing records." : "Manage vendor compliance records and procurement logs."}
        action={isCustomers ? (
          <button type="button" onClick={() => setModalOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1117E8] px-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(17,23,232,0.2)] hover:bg-[#0001B1]">
            <Plus className="h-4 w-4" /> Add Customer
          </button>
        ) : (
          <Button href="/dashboard/suppliers/create"><Plus className="h-4 w-4" /> Add Supplier</Button>
        )}
      />
      <AddCustomerModal open={modalOpen} onClose={() => setModalOpen(false)} />
      {!isCustomers ? <ComplianceAlert title="Compliance Gap Identified" text="8 suppliers are missing valid Tax Identification Numbers (TIN). Future invoices from these vendors will be flagged by FIRS." /> : null}
      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <MetricCard label={isCustomers ? "Total Active Clients" : "Total Active"} value={isCustomers ? "1,284" : "128"} meta={isCustomers ? "+12% from last month" : "Verified vendors"} icon={isCustomers ? Users : Truck} />
        <MetricCard label={isCustomers ? "Compliance Risk" : "Pending Verification"} value={isCustomers ? "24" : "14"} meta={isCustomers ? "Customers missing valid TIN" : "Supplier records"} tone="danger" icon={AlertTriangle} />
        <MetricCard label={isCustomers ? "Compliance Score" : "Spend Integrity"} value={isCustomers ? "98.2%" : "92%"} meta="Highly compliant" tone="primary" icon={ShieldCheck} />
      </div>
      <Card className="mb-6 p-4"><div className="flex flex-wrap gap-3">{(isCustomers ? ["All Customers", "Missing TIN", "Active", "Recent"] : ["All Suppliers", "Missing TIN", "Verified", "Recent"]).map((tab, index) => <button key={tab} className={`rounded-full px-4 py-2 text-sm font-bold ${index === 0 ? "bg-[#DADEFD] text-[#0001B1]" : "text-[#454557]"}`}>{tab}</button>)}<Button variant="secondary" className="ml-auto"><Filter className="h-4 w-4" /> Advanced Filter</Button><Button variant="secondary"><Download className="h-4 w-4" /> Export CSV</Button></div></Card>
      <DataTable title={isCustomers ? "Customer Records" : "Supplier Records"} columns={isCustomers ? ["Customer Name", "TIN", "Contact", "Invoices", "Compliance", "Actions"] : ["Supplier Name", "TIN", "Category", "Total Purchases", "Status", "Actions"]} rows={rows.map((row) => isCustomers ? ({ "Customer Name": <b>{row[0]}</b>, TIN: row[1], Contact: <span className="whitespace-pre-line">{row[2]}</span>, Invoices: row[3], Compliance: <StatusBadge>{row[4]}</StatusBadge>, Actions: rowActions() }) : ({ "Supplier Name": <b>{row[0]}</b>, TIN: row[1], Category: row[2], "Total Purchases": row[3], Status: <StatusBadge>{row[4]}</StatusBadge>, Actions: rowActions() }))} footer={`Showing 1 to 4 of ${isCustomers ? "1,284 customers" : "128 suppliers"}`} />
    </>
  );
}

export function CustomersPage() {
  return <DirectoryPage type="customers" />;
}

export function SuppliersPage() {
  return <DirectoryPage type="suppliers" />;
}
