"use client";

import { AlertTriangle, Download, Filter, Plus, ShieldCheck, Truck, Users } from "lucide-react";
import { useState } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { useCustomers } from "@/hooks/useCustomers";
import { useSuppliers } from "@/hooks/useSuppliers";
import { getApiErrorMessage } from "@/lib/api/client";
import { Button, Card, ComplianceAlert, DashboardFormModal, DataTable, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

function DirectoryPage({ type }: { type: "customers" | "suppliers" }) {
  const isCustomers = type === "customers";
  const customersState = useCustomers();
  const suppliersState = useSuppliers();
  const state = isCustomers ? customersState : suppliersState;
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(isCustomers ? "All Customers" : "All Suppliers");

  async function exportCustomers() {
    if (!isCustomers) return;
    const blob = await customersState.exportCustomers();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "customers.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function createDirectoryRecord(values?: Record<string, string>) {
    const data = values ?? {};
    try {
      if (isCustomers) {
        const name = data["Customer name"]?.trim();
        if (!name) throw new Error("Customer name is required.");
        await customersState.create({
          customer_type: data["Customer type"]?.toLowerCase().includes("individual") ? "individual" : "business",
          name,
          email: data.Email?.trim() || undefined,
          phone1: data["Primary phone"]?.trim() || undefined,
          phone2: data["Secondary phone"]?.trim() || undefined,
          billing_address: data["Billing address"]?.trim() || undefined,
          city: data.City?.trim() || undefined,
          state: data.State?.trim() || undefined,
          country: data.Country?.trim() || undefined,
          postal_code: data["Postal code"]?.trim() || undefined,
          tax_identification_number: data["Tax ID/TIN"]?.trim() || undefined,
          rc_number: data["RC Number"]?.trim() || undefined,
        });
        return;
      }

      const supplierName = data["Supplier name"]?.trim();
      if (!supplierName) throw new Error("Supplier name is required.");
      await suppliersState.create({
        supplier_type: data["Supplier type"]?.toLowerCase().includes("individual") ? "individual" : "business",
        supplier_name: supplierName,
        contact_person: data["Contact person"]?.trim() || undefined,
        email: data.Email?.trim() || undefined,
        phone: data.Phone?.trim() || undefined,
        tax_identification_number: data["Tax ID/TIN"]?.trim() || undefined,
        rc_number: data["RC Number"]?.trim() || undefined,
        address: data.Address?.trim() || undefined,
        city: data.City?.trim() || undefined,
        state: data.State?.trim() || undefined,
        country: data.Country?.trim() || undefined,
        payment_terms: data["Payment terms"]?.trim() || undefined,
      });
    } catch (requestError) {
      throw new Error(getApiErrorMessage(requestError, `Unable to create ${isCustomers ? "customer" : "supplier"}.`));
    }
  }

  const visibleCount = isCustomers ? customersState.customers.length : suppliersState.suppliers.length;
  const total = state.pagination?.total ?? visibleCount;
  const missingTin = isCustomers
    ? customersState.customers.filter((customer) => !customer.tax_identification_number).length
    : suppliersState.suppliers.filter((supplier) => !supplier.tax_identification_number).length;

  return (
    <>
      <PageHeader
        title={isCustomers ? "Customer Directory" : "Supplier Directory"}
        subtitle={isCustomers ? "Manage client tax identities and billing records." : "Manage vendor compliance records and procurement logs."}
        action={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> {isCustomers ? "Add Customer" : "Add Supplier"}</Button>}
      />
      <DashboardFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isCustomers ? "Add New Customer" : "Add New Supplier"}
        description={isCustomers ? "Create a customer record for invoicing, receipts, and TIN validation." : "Create a supplier record for procurement and VAT claim readiness."}
        submitLabel={isCustomers ? "Save Customer" : "Save Supplier"}
        fields={isCustomers ? ["Customer type", "Customer name", "Email", "Primary phone", "Secondary phone", "Billing address", "City", "State", "Country", "Postal code", "Tax ID/TIN", "RC Number"] : ["Supplier type", "Supplier name", "Contact person", "Email", "Phone", "Tax ID/TIN", "RC Number", "Address", "City", "State", "Country", "Payment terms"]}
        onSubmit={createDirectoryRecord}
      />
      {!isCustomers && missingTin > 0 ? <ComplianceAlert title="Compliance Gap Identified" text={`${missingTin} suppliers are missing valid Tax Identification Numbers (TIN).`} /> : null}
      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <MetricCard label={isCustomers ? "Total Active Clients" : "Total Active"} value={String(total)} meta={isCustomers ? "API customer records" : "API supplier records"} icon={isCustomers ? Users : Truck} />
        <MetricCard label={isCustomers ? "Compliance Risk" : "Pending Verification"} value={String(missingTin)} meta={isCustomers ? "Customers missing valid TIN" : "Suppliers missing valid TIN"} tone="danger" icon={AlertTriangle} />
        <MetricCard label={isCustomers ? "Compliance Score" : "Spend Integrity"} value={missingTin === 0 ? "100%" : "Review"} meta="Calculated from loaded records" tone="primary" icon={ShieldCheck} />
      </div>
      <Card className="mb-6 p-4">
        <div className="flex min-w-0 flex-wrap gap-3">
          {(isCustomers ? ["All Customers", "Missing TIN", "Active", "Recent"] : ["All Suppliers", "Missing TIN", "Verified", "Recent"]).map((tab) => (
            <button key={tab} type="button" onClick={() => { setActiveTab(tab); notifyDashboard(`${tab} filter applied`); }} className={`rounded-full px-4 py-2 text-sm font-bold ${activeTab === tab ? "bg-[#DADEFD] text-[#0001B1]" : "text-[#454557]"}`}>
              {tab}
            </button>
          ))}
          <input aria-label={`Search ${isCustomers ? "customers" : "suppliers"}`} value={state.pager.search} onChange={(event) => state.pager.setSearch(event.target.value)} placeholder="Search records" className="min-h-10 rounded-lg border border-[#C5C4DA] px-3 text-sm outline-none focus:border-[#1117E8]" />
          <Button variant="secondary" className="w-full sm:ml-auto sm:w-auto" onClick={() => notifyDashboard("Advanced filters opened")}><Filter className="h-4 w-4" /> Advanced Filter</Button>
          {isCustomers ? <Button variant="secondary" className="w-full sm:w-auto" onClick={exportCustomers}><Download className="h-4 w-4" /> Export CSV</Button> : null}
        </div>
      </Card>
      {state.error ? <ComplianceAlert title="Unable to load records" text={state.error} /> : null}
      <DataTable
        title={isCustomers ? "Customer Records" : "Supplier Records"}
        columns={isCustomers ? ["Customer Name", "Type", "TIN", "RC Number", "Contact", "Location", "Actions"] : ["Supplier Name", "Type", "Contact Person", "TIN", "Payment Terms", "Location", "Actions"]}
        rows={isCustomers ? customersState.customers.map((customer) => ({
          "Customer Name": <b>{customer.name}</b>,
          Type: <StatusBadge>{customer.customer_type}</StatusBadge>,
          TIN: customer.tax_identification_number ?? "Missing",
          "RC Number": customer.rc_number ?? "-",
          Contact: <span className="whitespace-pre-line">{[customer.email, customer.phone1, customer.phone2].filter(Boolean).join("\n") || "-"}</span>,
          Location: [customer.city, customer.state, customer.country].filter(Boolean).join(", ") || "-",
          Actions: rowActions(undefined, customer.name),
        })) : suppliersState.suppliers.map((supplier) => ({
          "Supplier Name": <b>{supplier.supplier_name}</b>,
          Type: <StatusBadge>{supplier.supplier_type}</StatusBadge>,
          "Contact Person": supplier.contact_person ?? "-",
          TIN: supplier.tax_identification_number ?? "Missing",
          "Payment Terms": supplier.payment_terms ?? "-",
          Location: [supplier.city, supplier.state, supplier.country].filter(Boolean).join(", ") || "-",
          Actions: rowActions(undefined, supplier.supplier_name),
        }))}
        footer={state.loading ? "Loading API records..." : `Showing ${visibleCount} of ${total} ${isCustomers ? "customers" : "suppliers"}`}
        footerActions={<Pagination pagination={state.pagination} onPageChange={state.pager.setPage} />}
      />
    </>
  );
}

export function CustomersPage() {
  return <DirectoryPage type="customers" />;
}

export function SuppliersPage() {
  return <DirectoryPage type="suppliers" />;
}
