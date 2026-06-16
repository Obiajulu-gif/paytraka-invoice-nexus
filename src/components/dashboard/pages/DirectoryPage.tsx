"use client";

import { AlertTriangle, Download, Edit3, Eye, Filter, Plus, ShieldCheck, Trash2, Truck, Users, X } from "lucide-react";
import { useState } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { useCustomers } from "@/hooks/useCustomers";
import { useSuppliers } from "@/hooks/useSuppliers";
import { getApiErrorMessage } from "@/lib/api/client";
import { Customer, CustomerRequest, Supplier, SupplierRequest } from "@/types/api";
import { Button, Card, ComplianceAlert, DashboardFormModal, DataTable, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

const customerFields = ["Customer type", "Customer name", "Email", "Primary phone", "Secondary phone", "Billing address", "City", "State", "Country", "Postal code", "Tax ID/TIN", "RC Number"];
const supplierFields = ["Supplier type", "Supplier name", "Contact person", "Email", "Phone", "Tax ID/TIN", "RC Number", "Address", "City", "State", "Country", "Payment terms"];

function customerToValues(customer: Customer): Record<string, string> {
  return {
    "Customer type": customer.customer_type,
    "Customer name": customer.name,
    Email: customer.email ?? "",
    "Primary phone": customer.phone1 ?? "",
    "Secondary phone": customer.phone2 ?? "",
    "Billing address": customer.billing_address ?? "",
    City: customer.city ?? "",
    State: customer.state ?? "",
    Country: customer.country ?? "",
    "Postal code": customer.postal_code ?? "",
    "Tax ID/TIN": customer.tax_identification_number ?? "",
    "RC Number": customer.rc_number ?? "",
  };
}

function supplierToValues(supplier: Supplier): Record<string, string> {
  return {
    "Supplier type": supplier.supplier_type,
    "Supplier name": supplier.supplier_name,
    "Contact person": supplier.contact_person ?? "",
    Email: supplier.email ?? "",
    Phone: supplier.phone ?? "",
    "Tax ID/TIN": supplier.tax_identification_number ?? "",
    "RC Number": supplier.rc_number ?? "",
    Address: supplier.address ?? "",
    City: supplier.city ?? "",
    State: supplier.state ?? "",
    Country: supplier.country ?? "",
    "Payment terms": supplier.payment_terms ?? "",
  };
}

function customerPayload(data: Record<string, string>): CustomerRequest {
  const name = data["Customer name"]?.trim();
  if (!name) throw new Error("Customer name is required.");
  return {
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
  };
}

function supplierPayload(data: Record<string, string>): SupplierRequest {
  const supplierName = data["Supplier name"]?.trim();
  if (!supplierName) throw new Error("Supplier name is required.");
  return {
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
  };
}

function DirectoryPage({ type }: { type: "customers" | "suppliers" }) {
  const isCustomers = type === "customers";
  const customersState = useCustomers();
  const suppliersState = useSuppliers();
  const state = isCustomers ? customersState : suppliersState;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingRecord, setViewingRecord] = useState<{ title: string; values: Record<string, string> } | null>(null);
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
        await customersState.create(customerPayload(data));
        return;
      }

      await suppliersState.create(supplierPayload(data));
    } catch (requestError) {
      throw new Error(getApiErrorMessage(requestError, `Unable to create ${isCustomers ? "customer" : "supplier"}.`));
    }
  }

  async function updateDirectoryRecord(values?: Record<string, string>) {
    const data = values ?? {};
    try {
      if (editingCustomer) {
        await customersState.update(editingCustomer.id, customerPayload(data));
        setEditingCustomer(null);
        return;
      }
      if (editingSupplier) {
        await suppliersState.update(editingSupplier.id, supplierPayload(data));
        setEditingSupplier(null);
      }
    } catch (requestError) {
      throw new Error(getApiErrorMessage(requestError, `Unable to update ${isCustomers ? "customer" : "supplier"}.`));
    }
  }

  async function deleteCustomer(customer: Customer) {
    if (!window.confirm(`Delete ${customer.name}? This action cannot be undone.`)) return;
    try {
      await customersState.remove(customer.id);
      notifyDashboard(`${customer.name} deleted`);
    } catch (requestError) {
      notifyDashboard(getApiErrorMessage(requestError, "Unable to delete customer."));
    }
  }

  async function deleteSupplier(supplier: Supplier) {
    if (!window.confirm(`Delete ${supplier.supplier_name}? This action cannot be undone.`)) return;
    try {
      await suppliersState.remove(supplier.id);
      notifyDashboard(`${supplier.supplier_name} deleted`);
    } catch (requestError) {
      notifyDashboard(getApiErrorMessage(requestError, "Unable to delete supplier."));
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
        fields={isCustomers ? customerFields : supplierFields}
        onSubmit={createDirectoryRecord}
      />
      <DashboardFormModal
        open={Boolean(editingCustomer || editingSupplier)}
        onClose={() => { setEditingCustomer(null); setEditingSupplier(null); }}
        title={editingCustomer ? "Edit Customer" : "Edit Supplier"}
        description={editingCustomer ? "Update customer billing and tax details." : "Update supplier compliance and procurement details."}
        submitLabel={editingCustomer ? "Update Customer" : "Update Supplier"}
        fields={editingCustomer ? customerFields : supplierFields}
        initialValues={editingCustomer ? customerToValues(editingCustomer) : editingSupplier ? supplierToValues(editingSupplier) : {}}
        onSubmit={updateDirectoryRecord}
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
          Actions: rowActions(undefined, customer.name, [
            { label: "View customer", icon: Eye, onSelect: () => setViewingRecord({ title: customer.name, values: customerToValues(customer) }) },
            { label: "Edit customer", icon: Edit3, onSelect: () => setEditingCustomer(customer) },
            { label: "Delete customer", icon: Trash2, tone: "danger", onSelect: () => void deleteCustomer(customer) },
          ]),
        })) : suppliersState.suppliers.map((supplier) => ({
          "Supplier Name": <b>{supplier.supplier_name}</b>,
          Type: <StatusBadge>{supplier.supplier_type}</StatusBadge>,
          "Contact Person": supplier.contact_person ?? "-",
          TIN: supplier.tax_identification_number ?? "Missing",
          "Payment Terms": supplier.payment_terms ?? "-",
          Location: [supplier.city, supplier.state, supplier.country].filter(Boolean).join(", ") || "-",
          Actions: rowActions(undefined, supplier.supplier_name, [
            { label: "View supplier", icon: Eye, onSelect: () => setViewingRecord({ title: supplier.supplier_name, values: supplierToValues(supplier) }) },
            { label: "Edit supplier", icon: Edit3, onSelect: () => setEditingSupplier(supplier) },
            { label: "Delete supplier", icon: Trash2, tone: "danger", onSelect: () => void deleteSupplier(supplier) },
          ]),
        }))}
        footer={state.loading ? "Loading API records..." : `Showing ${visibleCount} of ${total} ${isCustomers ? "customers" : "suppliers"}`}
        footerActions={<Pagination pagination={state.pagination} onPageChange={state.pager.setPage} />}
        loading={state.loading}
      />
      {viewingRecord ? <RecordDetailsModal record={viewingRecord} onClose={() => setViewingRecord(null)} /> : null}
    </>
  );
}

function RecordDetailsModal({ record, onClose }: { record: { title: string; values: Record<string, string> }; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[#191C1E]/45 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="record-details-title" onMouseDown={onClose}>
      <Card className="w-full max-w-2xl overflow-hidden shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-[#C5C4DA] bg-[#F7F9FB] p-6">
          <div>
            <h2 id="record-details-title" className="text-2xl font-bold">{record.title}</h2>
            <p className="mt-1 text-sm text-[#454557]">Directory record details</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close record details" className="rounded-lg p-2 text-[#454557] hover:bg-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {Object.entries(record.values).map(([label, value]) => (
            <div key={label} className="rounded-xl bg-[#F1F4F8] p-4">
              <p className="text-xs font-bold uppercase text-[#757588]">{label}</p>
              <p className="mt-1 break-words font-bold">{value || "-"}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function CustomersPage() {
  return <DirectoryPage type="customers" />;
}

export function SuppliersPage() {
  return <DirectoryPage type="suppliers" />;
}
