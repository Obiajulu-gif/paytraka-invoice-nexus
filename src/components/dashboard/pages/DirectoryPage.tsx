"use client";

import {
  AlertTriangle,
  Download,
  Upload,
  Edit3,
  Eye,
  Plus,
  ShieldCheck,
  Trash2,
  Truck,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { useCustomers } from "@/hooks/useCustomers";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { getApiErrorMessage } from "@/lib/api/client";
import { complianceScore } from "@/lib/compliance";
import { downloadCsv, parseCsv } from "@/lib/csv";
import {
  Customer,
  CustomerRequest,
  Supplier,
  SupplierRequest,
} from "@/types/api";
import {
  Button,
  Card,
  ComplianceAlert,
  DashboardFormModal,
  DataTable,
  MetricCard,
  notifyDashboard,
  PageHeader,
  StatusBadge,
  rowActions,
} from "../ui";

const customerFields = [
  "Customer type",
  "Customer name",
  "Email",
  "Primary telephone (+country code)",
  "Secondary telephone (+country code)",
  "Street name",
  "City",
  "State",
  "LGA",
  "Country",
  "Postal zone",
  "Description",
  "Preferred currency",
  "Tax ID/TIN",
  "RC Number",
];
const supplierFields = [
  "Supplier type",
  "Supplier name",
  "Contact person",
  "Email",
  "Phone",
  "Tax ID/TIN",
  "RC Number",
  "Street name",
  "City",
  "State",
  "LGA",
  "Postal zone",
  "Country",
  "Description",
  "Payment terms",
];

function customerToValues(customer: Customer): Record<string, string> {
  return {
    "Customer type": customer.customer_type,
    "Customer name": customer.name,
    Email: customer.email ?? "",
    "Primary telephone (+country code)": customer.phone1 ?? "",
    "Secondary telephone (+country code)": customer.phone2 ?? "",
    "Street name": customer.street_name ?? customer.billing_address ?? "",
    City: customer.city ?? "",
    State: customer.state ?? "",
    LGA: customer.lga ?? "",
    Country: customer.country ?? "",
    "Postal zone": customer.postal_code ?? "",
    Description: customer.business_description ?? "",
    "Preferred currency": customer.preferred_currency ?? "NGN",
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
    "Street name": supplier.street_name ?? supplier.address ?? "",
    City: supplier.city ?? "",
    State: supplier.state ?? "",
    LGA: supplier.lga ?? "",
    "Postal zone": supplier.postal_code ?? "",
    Country: supplier.country ?? "",
    Description: supplier.description ?? "",
    "Payment terms": supplier.payment_terms ?? "",
  };
}

function customerPayload(data: Record<string, string>): CustomerRequest {
  const name = data["Customer name"]?.trim();
  if (!name) throw new Error("Customer name is required.");
  return {
    customer_type: (data["Customer type"]?.toLowerCase() ||
      "business") as CustomerRequest["customer_type"],
    name,
    email: data.Email?.trim() || undefined,
    phone1: data["Primary telephone (+country code)"]?.trim() || undefined,
    phone2: data["Secondary telephone (+country code)"]?.trim() || undefined,
    billing_address: data["Street name"]?.trim() || undefined,
    street_name: data["Street name"]?.trim() || undefined,
    city: data.City?.trim() || undefined,
    state: data.State?.trim() || undefined,
    lga: data.LGA?.trim() || undefined,
    country: data.Country?.trim() || undefined,
    postal_code: data["Postal zone"]?.trim() || undefined,
    business_description: data["Description"]?.trim() || undefined,
    preferred_currency: data["Preferred currency"]?.trim() || "NGN",
    tax_identification_number: data["Tax ID/TIN"]?.trim() || undefined,
    rc_number: data["RC Number"]?.trim() || undefined,
  };
}

function supplierPayload(data: Record<string, string>): SupplierRequest {
  const supplierName = data["Supplier name"]?.trim();
  if (!supplierName) throw new Error("Supplier name is required.");
  return {
    supplier_type: (data["Supplier type"]?.toLowerCase() ||
      "business") as SupplierRequest["supplier_type"],
    supplier_name: supplierName,
    contact_person: data["Contact person"]?.trim() || undefined,
    email: data.Email?.trim() || undefined,
    phone: data.Phone?.trim() || undefined,
    tax_identification_number: data["Tax ID/TIN"]?.trim() || undefined,
    rc_number: data["RC Number"]?.trim() || undefined,
    address: data["Street name"]?.trim() || undefined,
    street_name: data["Street name"]?.trim() || undefined,
    city: data.City?.trim() || undefined,
    state: data.State?.trim() || undefined,
    lga: data.LGA?.trim() || undefined,
    postal_code: data["Postal zone"]?.trim() || undefined,
    country: data.Country?.trim() || undefined,
    description: data.Description?.trim() || undefined,
    payment_terms: data["Payment terms"]?.trim() || undefined,
  };
}

function DirectoryPage({ type }: { type: "customers" | "suppliers" }) {
  const isCustomers = type === "customers";
  const { user } = useAuth();
  const { company } = useCompany(user?.company_id);
  const companyName =
    company?.company_name ||
    user?.company_name ||
    user?.trading_name ||
    "Company";
  const customersState = useCustomers();
  const suppliersState = useSuppliers();
  const state = isCustomers ? customersState : suppliersState;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingRecord, setViewingRecord] = useState<{
    title: string;
    values: Record<string, string>;
  } | null>(null);
  const [activeTab, setActiveTab] = useState(
    isCustomers ? "All Customers" : "All Suppliers",
  );

  function exportDirectory() {
    if (isCustomers) {
      downloadCsv(
        "customers-full-export.csv",
        customersState.customers.map((customer) => ({
          company_name: companyName,
          name: customer.name,
          type: customer.customer_type,
          email: customer.email,
          primary_phone: customer.phone1,
          secondary_phone: customer.phone2,
          business_description: customer.business_description,
          street_name: customer.street_name ?? customer.billing_address,
          city: customer.city,
          state: customer.state,
          lga: customer.lga,
          postal_zone: customer.postal_code,
          country: customer.country,
          preferred_currency: customer.preferred_currency,
          tin: customer.tax_identification_number,
          rc_number: customer.rc_number,
          compliance_score: `${complianceScore(customer)}%`,
          generated_from: "PayTraka",
        })),
      );
      return;
    }
    downloadCsv(
      "suppliers-full-export.csv",
      suppliersState.suppliers.map((supplier) => ({
        company_name: companyName,
        supplier_name: supplier.supplier_name,
        type: supplier.supplier_type,
        contact_person: supplier.contact_person,
        email: supplier.email,
        phone: supplier.phone,
        description: supplier.description,
        street_name: supplier.street_name ?? supplier.address,
        city: supplier.city,
        state: supplier.state,
        lga: supplier.lga,
        postal_zone: supplier.postal_code,
        country: supplier.country,
        tin: supplier.tax_identification_number,
        rc_number: supplier.rc_number,
        payment_terms: supplier.payment_terms,
        generated_from: "PayTraka",
      })),
    );
  }

  async function importDirectory(file?: File) {
    if (!file) return;
    try {
      if (isCustomers) {
        if (file.name.toLowerCase().endsWith(".csv")) {
          const rows = parseCsv(await file.text());
          for (const row of rows) {
            await customersState.create({
              customer_type: (row.type ||
                row.customer_type ||
                "business") as CustomerRequest["customer_type"],
              name: row.name || row.customer_name,
              email: row.email || undefined,
              phone1: row.primary_phone || row.phone || undefined,
              phone2: row.secondary_phone || undefined,
              business_description:
                row.business_description || row.description || undefined,
              street_name: row.street_name || row.address || undefined,
              billing_address: row.street_name || row.address || undefined,
              city: row.city || undefined,
              state: row.state || undefined,
              lga: row.lga || undefined,
              postal_code: row.postal_zone || row.postal_code || undefined,
              country: row.country || undefined,
              preferred_currency: row.preferred_currency || "NGN",
              tax_identification_number: row.tin || row.tax_id || undefined,
              rc_number: row.rc_number || undefined,
            });
          }
          notifyDashboard("Customers imported successfully");
          return;
        }
        await customersState.importCustomers(file);
        await customersState.refresh();
        notifyDashboard("Customers imported successfully");
        return;
      }
      if (!file.name.toLowerCase().endsWith(".csv"))
        throw new Error("Supplier imports currently support CSV files.");
      const rows = parseCsv(await file.text());
      for (const row of rows) {
        await suppliersState.create({
          supplier_type: (row.type ||
            row.supplier_type ||
            "business") as SupplierRequest["supplier_type"],
          supplier_name: row.supplier_name || row.name,
          contact_person: row.contact_person || undefined,
          email: row.email || undefined,
          phone: row.phone || undefined,
          description: row.description || undefined,
          street_name: row.street_name || row.address || undefined,
          address: row.street_name || row.address || undefined,
          city: row.city || undefined,
          state: row.state || undefined,
          lga: row.lga || undefined,
          postal_code: row.postal_zone || row.postal_code || undefined,
          country: row.country || undefined,
          tax_identification_number: row.tin || row.tax_id || undefined,
          rc_number: row.rc_number || undefined,
          payment_terms: row.payment_terms || undefined,
        });
      }
      notifyDashboard("Suppliers imported successfully");
    } catch (requestError) {
      notifyDashboard(
        getApiErrorMessage(
          requestError,
          `Unable to import ${isCustomers ? "customers" : "suppliers"}.`,
        ),
      );
    }
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
      throw new Error(
        getApiErrorMessage(
          requestError,
          `Unable to create ${isCustomers ? "customer" : "supplier"}.`,
        ),
      );
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
      throw new Error(
        getApiErrorMessage(
          requestError,
          `Unable to update ${isCustomers ? "customer" : "supplier"}.`,
        ),
      );
    }
  }

  async function deleteCustomer(customer: Customer) {
    if (
      !window.confirm(`Delete ${customer.name}? This action cannot be undone.`)
    )
      return;
    try {
      await customersState.remove(customer.id);
      notifyDashboard(`${customer.name} deleted`);
    } catch (requestError) {
      notifyDashboard(
        getApiErrorMessage(requestError, "Unable to delete customer."),
      );
    }
  }

  async function deleteSupplier(supplier: Supplier) {
    if (
      !window.confirm(
        `Delete ${supplier.supplier_name}? This action cannot be undone.`,
      )
    )
      return;
    try {
      await suppliersState.remove(supplier.id);
      notifyDashboard(`${supplier.supplier_name} deleted`);
    } catch (requestError) {
      notifyDashboard(
        getApiErrorMessage(requestError, "Unable to delete supplier."),
      );
    }
  }

  const visibleCount = isCustomers
    ? customersState.customers.length
    : suppliersState.suppliers.length;
  const total = state.pagination?.total ?? visibleCount;
  const missingTin = isCustomers
    ? customersState.customers.filter(
        (customer) => !customer.tax_identification_number,
      ).length
    : suppliersState.suppliers.filter(
        (supplier) => !supplier.tax_identification_number,
      ).length;
  const filteredCustomers = useMemo(
    () =>
      customersState.customers.filter((customer) => {
        if (activeTab === "Missing TIN")
          return !customer.tax_identification_number;
        if (activeTab === "Compliant") return complianceScore(customer) === 100;
        if (activeTab === "Individuals")
          return customer.customer_type === "individual";
        if (activeTab === "Businesses")
          return customer.customer_type === "business";
        return true;
      }),
    [activeTab, customersState.customers],
  );
  const filteredSuppliers = useMemo(
    () =>
      suppliersState.suppliers.filter((supplier) => {
        if (activeTab === "Missing TIN")
          return !supplier.tax_identification_number;
        if (activeTab === "Verified")
          return Boolean(supplier.tax_identification_number);
        if (activeTab === "Individuals")
          return supplier.supplier_type === "individual";
        if (activeTab === "Businesses")
          return supplier.supplier_type === "business";
        return true;
      }),
    [activeTab, suppliersState.suppliers],
  );
  const filteredCount = isCustomers
    ? filteredCustomers.length
    : filteredSuppliers.length;

  return (
    <>
      <PageHeader
        title={isCustomers ? "Customer Directory" : "Supplier Directory"}
        subtitle={
          isCustomers
            ? "Manage client tax identities and billing records."
            : "Manage vendor compliance records and procurement logs."
        }
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />{" "}
            {isCustomers ? "Add Customer" : "Add Supplier"}
          </Button>
        }
      />
      <DashboardFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isCustomers ? "Add New Customer" : "Add New Supplier"}
        description={
          isCustomers
            ? "Create a customer record for invoicing, receipts, and TIN validation."
            : "Create a supplier record for procurement and VAT claim readiness."
        }
        submitLabel={isCustomers ? "Save Customer" : "Save Supplier"}
        fields={isCustomers ? customerFields : supplierFields}
        onSubmit={createDirectoryRecord}
      />
      <DashboardFormModal
        open={Boolean(editingCustomer || editingSupplier)}
        onClose={() => {
          setEditingCustomer(null);
          setEditingSupplier(null);
        }}
        title={editingCustomer ? "Edit Customer" : "Edit Supplier"}
        description={
          editingCustomer
            ? "Update customer billing and tax details."
            : "Update supplier compliance and procurement details."
        }
        submitLabel={editingCustomer ? "Update Customer" : "Update Supplier"}
        fields={editingCustomer ? customerFields : supplierFields}
        initialValues={
          editingCustomer
            ? customerToValues(editingCustomer)
            : editingSupplier
              ? supplierToValues(editingSupplier)
              : {}
        }
        onSubmit={updateDirectoryRecord}
      />
      {!isCustomers && missingTin > 0 ? (
        <ComplianceAlert
          title="Compliance Gap Identified"
          text={`${missingTin} suppliers are missing valid Tax Identification Numbers (TIN).`}
        />
      ) : null}
      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <MetricCard
          label={isCustomers ? "Total Active Clients" : "Total Active"}
          value={String(total)}
          meta={isCustomers ? "Customer records" : "Supplier records"}
          icon={isCustomers ? Users : Truck}
        />
        <MetricCard
          label={isCustomers ? "Compliance Risk" : "Pending Verification"}
          value={String(missingTin)}
          meta={
            isCustomers
              ? "Customers missing valid TIN"
              : "Suppliers missing valid TIN"
          }
          tone="danger"
          icon={AlertTriangle}
        />
        <MetricCard
          label={isCustomers ? "Compliance Score" : "Spend Integrity"}
          value={
            isCustomers && customersState.customers.length
              ? `${Math.round(customersState.customers.reduce((sum, customer) => sum + complianceScore(customer), 0) / customersState.customers.length)}%`
              : missingTin === 0
                ? "100%"
                : "Review"
          }
          meta="State, LGA, address, city, postal zone, description, +telephone and TIN"
          tone="primary"
          icon={ShieldCheck}
        />
      </div>
      <Card className="mb-6 p-3 sm:p-4">
        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(220px,1fr)_auto] lg:items-center">
          <input
            aria-label={`Search ${isCustomers ? "customers" : "suppliers"}`}
            value={state.pager.search}
            onChange={(event) => state.pager.setSearch(event.target.value)}
            placeholder={`Search by name, email, phone or TIN`}
            className="h-11 w-full rounded-xl border border-[#C5C4DA] px-4 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#C5C4DA] bg-white px-4 text-sm font-bold text-[#0001B1] hover:border-[#1117E8]">
              <Upload className="h-4 w-4" /> Import{" "}
              {isCustomers ? "Excel/CSV" : "CSV"}
              <input
                type="file"
                accept={isCustomers ? ".csv,.xlsx,.xls" : ".csv"}
                className="sr-only"
                onChange={(event) =>
                  void importDirectory(event.target.files?.[0])
                }
              />
            </label>
            <Button variant="secondary" onClick={exportDirectory}>
              <Download className="h-4 w-4" /> Export{" "}
              {isCustomers ? "Customers" : "Suppliers"}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {(isCustomers
            ? [
                "All Customers",
                "Missing TIN",
                "Compliant",
                "Individuals",
                "Businesses",
              ]
            : [
                "All Suppliers",
                "Missing TIN",
                "Verified",
                "Individuals",
                "Businesses",
              ]
          ).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${activeTab === tab ? "bg-[#1117E8] text-white" : "bg-[#F1F4F8] text-[#454557] hover:bg-[#DADEFD]"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </Card>
      {state.error ? (
        <ComplianceAlert title="Unable to load records" text={state.error} />
      ) : null}
      <DataTable
        title={isCustomers ? "Customer Records" : "Supplier Records"}
        columns={
          isCustomers
            ? [
                "Customer Name",
                "Type",
                "TIN",
                "RC Number",
                "Compliance",
                "Contact",
                "Location",
                "Actions",
              ]
            : [
                "Supplier Name",
                "Type",
                "Contact Person",
                "TIN",
                "Payment Terms",
                "Location",
                "Actions",
              ]
        }
        rows={
          isCustomers
            ? filteredCustomers.map((customer) => ({
                "Customer Name": <b>{customer.name}</b>,
                Type: <StatusBadge>{customer.customer_type}</StatusBadge>,
                TIN: customer.tax_identification_number ?? "Missing",
                "RC Number": customer.rc_number ?? "-",
                Compliance: (
                  <StatusBadge
                    tone={
                      complianceScore(customer) === 100 ? "success" : "warning"
                    }
                  >
                    {complianceScore(customer)}%
                  </StatusBadge>
                ),
                Contact: (
                  <span className="whitespace-pre-line">
                    {[customer.email, customer.phone1, customer.phone2]
                      .filter(Boolean)
                      .join("\n") || "-"}
                  </span>
                ),
                Location:
                  [customer.city, customer.state, customer.country]
                    .filter(Boolean)
                    .join(", ") || "-",
                Actions: rowActions(undefined, customer.name, [
                  {
                    label: "View customer",
                    icon: Eye,
                    onSelect: () =>
                      setViewingRecord({
                        title: customer.name,
                        values: customerToValues(customer),
                      }),
                  },
                  {
                    label: "Edit customer",
                    icon: Edit3,
                    onSelect: () => setEditingCustomer(customer),
                  },
                  {
                    label: "Delete customer",
                    icon: Trash2,
                    tone: "danger",
                    onSelect: () => void deleteCustomer(customer),
                  },
                ]),
              }))
            : filteredSuppliers.map((supplier) => ({
                "Supplier Name": <b>{supplier.supplier_name}</b>,
                Type: <StatusBadge>{supplier.supplier_type}</StatusBadge>,
                "Contact Person": supplier.contact_person ?? "-",
                TIN: supplier.tax_identification_number ?? "Missing",
                "Payment Terms": supplier.payment_terms ?? "-",
                Location:
                  [supplier.city, supplier.state, supplier.country]
                    .filter(Boolean)
                    .join(", ") || "-",
                Actions: rowActions(undefined, supplier.supplier_name, [
                  {
                    label: "View supplier",
                    icon: Eye,
                    onSelect: () =>
                      setViewingRecord({
                        title: supplier.supplier_name,
                        values: supplierToValues(supplier),
                      }),
                  },
                  {
                    label: "Edit supplier",
                    icon: Edit3,
                    onSelect: () => setEditingSupplier(supplier),
                  },
                  {
                    label: "Delete supplier",
                    icon: Trash2,
                    tone: "danger",
                    onSelect: () => void deleteSupplier(supplier),
                  },
                ]),
              }))
        }
        footer={
          state.loading
            ? "Loading records..."
            : `Showing ${filteredCount} filtered records (${total} total)`
        }
        footerActions={
          <Pagination
            pagination={state.pagination}
            onPageChange={state.pager.setPage}
          />
        }
        loading={state.loading}
        hideDefaultActions
      />
      {viewingRecord ? (
        <RecordDetailsModal
          record={viewingRecord}
          onClose={() => setViewingRecord(null)}
        />
      ) : null}
    </>
  );
}

function RecordDetailsModal({
  record,
  onClose,
}: {
  record: { title: string; values: Record<string, string> };
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center overflow-hidden bg-[#191C1E]/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-details-title"
      onMouseDown={onClose}
    >
      <Card
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-b-none shadow-2xl sm:rounded-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#C5C4DA] bg-[#F7F9FB] p-4 sm:p-6">
          <div>
            <h2 id="record-details-title" className="text-2xl font-bold">
              {record.title}
            </h2>
            <p className="mt-1 text-sm text-[#454557]">
              Directory record details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close record details"
            className="rounded-lg p-2 text-[#454557] hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-4 sm:grid-cols-2 sm:gap-4 sm:p-6">
          {Object.entries(record.values).map(([label, value]) => (
            <div
              key={label}
              className="min-w-0 rounded-xl bg-[#F1F4F8] p-3 sm:p-4"
            >
              <p className="text-xs font-bold uppercase text-[#757588]">
                {label}
              </p>
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
