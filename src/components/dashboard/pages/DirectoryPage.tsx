"use client";

import { AlertTriangle, Building2, Download, Edit3, Eye, Mail, MapPin, Phone, Plus, ShieldCheck, Trash2, Truck, UserRound, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { useCustomers } from "@/hooks/useCustomers";
import { useSuppliers } from "@/hooks/useSuppliers";
import { getApiErrorMessage } from "@/lib/api/client";
import { Customer, CustomerRequest, Supplier, SupplierRequest } from "@/types/api";
import { Button, Card, ComplianceAlert, DashboardFormModal, DataTable, FilterBar, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

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
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [recordType, setRecordType] = useState("");
  const [tinStatus, setTinStatus] = useState("");
  const [country, setCountry] = useState("");

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
  const countries = useMemo(() => {
    const records = isCustomers ? customersState.customers : suppliersState.suppliers;
    return [...new Set(records.map((record) => record.country).filter((value): value is string => Boolean(value)))].sort();
  }, [customersState.customers, isCustomers, suppliersState.suppliers]);
  const filteredCustomers = customersState.customers.filter((customer) => {
    if (recordType && customer.customer_type !== recordType) return false;
    if (tinStatus === "verified" && !customer.tax_identification_number) return false;
    if (tinStatus === "missing" && customer.tax_identification_number) return false;
    if (country && customer.country !== country) return false;
    return true;
  });
  const filteredSuppliers = suppliersState.suppliers.filter((supplier) => {
    if (recordType && supplier.supplier_type !== recordType) return false;
    if (tinStatus === "verified" && !supplier.tax_identification_number) return false;
    if (tinStatus === "missing" && supplier.tax_identification_number) return false;
    if (country && supplier.country !== country) return false;
    return true;
  });

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
      <div className="mb-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
        <FilterBar
          search={state.pager.search}
          onSearchChange={state.pager.setSearch}
          searchPlaceholder={`Search ${isCustomers ? "customers" : "suppliers"}`}
          selects={[
            { key: "type", label: "Record type", value: recordType, onChange: setRecordType, options: [{ label: "Business", value: "business" }, { label: "Individual", value: "individual" }] },
            { key: "tin", label: "TIN status", value: tinStatus, onChange: setTinStatus, options: [{ label: "Verified", value: "verified" }, { label: "Missing", value: "missing" }] },
            { key: "country", label: "Country", value: country, onChange: setCountry, options: countries.map((value) => ({ label: value, value })) },
          ]}
          onClear={() => { state.pager.setSearch(""); setRecordType(""); setTinStatus(""); setCountry(""); }}
        />
        {isCustomers ? <Button variant="secondary" className="h-fit xl:mt-[26px]" onClick={exportCustomers}><Download className="h-4 w-4" /> Export CSV</Button> : null}
      </div>
      {state.error ? <ComplianceAlert title="Unable to load records" text={state.error} /> : null}
      <DataTable
        title={isCustomers ? "Customer Records" : "Supplier Records"}
        columns={isCustomers ? ["Customer Name", "Type", "TIN", "RC Number", "Contact", "Location", "Actions"] : ["Supplier Name", "Type", "Contact Person", "TIN", "Payment Terms", "Location", "Actions"]}
        rows={isCustomers ? filteredCustomers.map((customer) => ({
          "Customer Name": <b>{customer.name}</b>,
          Type: <StatusBadge>{customer.customer_type}</StatusBadge>,
          TIN: customer.tax_identification_number ?? "Missing",
          "RC Number": customer.rc_number ?? "-",
          Contact: <span className="whitespace-pre-line">{[customer.email, customer.phone1, customer.phone2].filter(Boolean).join("\n") || "-"}</span>,
          Location: [customer.city, customer.state, customer.country].filter(Boolean).join(", ") || "-",
          Actions: rowActions(undefined, customer.name, [
            { label: "View customer", icon: Eye, onSelect: () => setViewingCustomer(customer) },
            { label: "Edit customer", icon: Edit3, onSelect: () => setEditingCustomer(customer) },
            { label: "Delete customer", icon: Trash2, tone: "danger", onSelect: () => void deleteCustomer(customer) },
          ]),
        })) : filteredSuppliers.map((supplier) => ({
          "Supplier Name": <b>{supplier.supplier_name}</b>,
          Type: <StatusBadge>{supplier.supplier_type}</StatusBadge>,
          "Contact Person": supplier.contact_person ?? "-",
          TIN: supplier.tax_identification_number ?? "Missing",
          "Payment Terms": supplier.payment_terms ?? "-",
          Location: [supplier.city, supplier.state, supplier.country].filter(Boolean).join(", ") || "-",
          Actions: rowActions(undefined, supplier.supplier_name, [
            { label: "View supplier", icon: Eye, onSelect: () => setViewingSupplier(supplier) },
            { label: "Edit supplier", icon: Edit3, onSelect: () => setEditingSupplier(supplier) },
            { label: "Delete supplier", icon: Trash2, tone: "danger", onSelect: () => void deleteSupplier(supplier) },
          ]),
        }))}
        footer={state.loading ? "Loading API records..." : `Showing ${isCustomers ? filteredCustomers.length : filteredSuppliers.length} filtered records from ${total} ${isCustomers ? "customers" : "suppliers"}`}
        footerActions={<Pagination pagination={state.pagination} onPageChange={state.pager.setPage} />}
        loading={state.loading}
      />
      {viewingCustomer ? <DirectoryDetailsModal customer={viewingCustomer} onClose={() => setViewingCustomer(null)} /> : null}
      {viewingSupplier ? <DirectoryDetailsModal supplier={viewingSupplier} onClose={() => setViewingSupplier(null)} /> : null}
    </>
  );
}

function DirectoryDetailsModal({ customer, supplier, onClose }: { customer?: Customer; supplier?: Supplier; onClose: () => void }) {
  const isCustomer = Boolean(customer);
  const title = customer?.name ?? supplier?.supplier_name ?? "Directory record";
  const type = customer?.customer_type ?? supplier?.supplier_type ?? "record";
  const tin = customer?.tax_identification_number ?? supplier?.tax_identification_number;
  const rcNumber = customer?.rc_number ?? supplier?.rc_number;
  const email = customer?.email ?? supplier?.email;
  const phone = customer?.phone1 ?? supplier?.phone;
  const secondaryPhone = customer?.phone2;
  const contactPerson = supplier?.contact_person;
  const address = customer?.billing_address ?? supplier?.address;
  const city = customer?.city ?? supplier?.city;
  const state = customer?.state ?? supplier?.state;
  const country = customer?.country ?? supplier?.country;
  const postalCode = customer?.postal_code;
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[#191C1E]/45 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="record-details-title" onMouseDown={onClose}>
      <Card className="relative w-full max-w-4xl overflow-hidden shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="bg-[#075CB6] px-6 py-7 text-white sm:px-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">{isCustomer ? "Customer profile" : "Supplier profile"}</p>
              <h2 id="record-details-title" className="mt-2 text-3xl font-black">{title}</h2>
              <div className="mt-3 flex flex-wrap gap-2"><StatusBadge tone="primary">{type}</StatusBadge><StatusBadge tone={tin ? "success" : "danger"}>{tin ? "TIN verified" : "TIN missing"}</StatusBadge></div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close record details" className="rounded-lg p-2 text-white hover:bg-white/10"><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-2">
          <DetailSection title="Identity & compliance" icon={isCustomer ? UserRound : Building2}>
            <DetailLine label="Registered name" value={title} />
            {contactPerson ? <DetailLine label="Contact person" value={contactPerson} /> : null}
            <DetailLine label="Tax ID / TIN" value={tin} warning={!tin} />
            <DetailLine label="RC number" value={rcNumber} />
            {supplier?.payment_terms ? <DetailLine label="Payment terms" value={supplier.payment_terms} /> : null}
          </DetailSection>
          <DetailSection title="Contact information" icon={Mail}>
            <DetailLine label="Email" value={email} />
            <DetailLine label="Phone" value={phone} />
            {secondaryPhone ? <DetailLine label="Secondary phone" value={secondaryPhone} /> : null}
          </DetailSection>
          <div className="lg:col-span-2">
            <DetailSection title="Address" icon={MapPin}>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailLine label="Street address" value={address} />
                <DetailLine label="Location" value={[city, state, postalCode, country].filter(Boolean).join(", ")} />
              </div>
            </DetailSection>
          </div>
        </div>
        <div className="h-3 bg-[#E9E5DF]">
          <div className="h-full w-2/3 bg-[#075CB6]" />
        </div>
      </Card>
    </div>
  );
}

function DetailSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="flex items-center gap-2 border-b-2 border-[#075CB6] pb-3 text-sm font-black uppercase tracking-wide text-[#081936]"><Icon className="h-4 w-4 text-[#075CB6]" />{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function DetailLine({ label, value, warning = false }: { label: string; value?: string; warning?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#757588]">{label}</p>
      <p className={`mt-1 break-words font-semibold ${warning ? "text-red-700" : "text-[#191C1E]"}`}>{value || "Not provided"}</p>
    </div>
  );
}

export function CustomersPage() {
  return <DirectoryPage type="customers" />;
}

export function SuppliersPage() {
  return <DirectoryPage type="suppliers" />;
}
