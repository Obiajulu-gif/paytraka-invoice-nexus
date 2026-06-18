"use client";

import { Plus, Truck, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { useCustomers } from "@/hooks/useCustomers";
import { useInvoices } from "@/hooks/useInvoices";
import { useSuppliers } from "@/hooks/useSuppliers";
import { formatInvoiceDate, getInvoiceAmount } from "@/lib/invoice-utils";
import { Button, Card, ComplianceAlert, DataTable, FilterBar, MetricCard, StatusBadge, rowActions } from "../ui";

export function DashboardHome() {
  const { customers, pagination: customerPagination, error: customerError } = useCustomers();
  const { suppliers, pagination: supplierPagination } = useSuppliers();
  const { invoices, pagination: invoicePagination, error: invoiceError, totalOutstanding, outstandingLoading } = useInvoices();
  const customerById = useMemo(() => new Map(customers.map((customer) => [customer.id, customer])), [customers]);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const filteredInvoices = useMemo(() => {
    const search = invoiceSearch.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const customer = invoice.customer?.name ?? customerById.get(invoice.customer_id)?.name ?? invoice.customer_name ?? "";
      if (search && ![invoice.invoice_number, invoice.public_id, customer].some((value) => value?.toLowerCase().includes(search))) return false;
      if (invoiceStatus && invoice.status !== invoiceStatus) return false;
      if (paymentStatus && invoice.payment_status !== paymentStatus) return false;
      return true;
    });
  }, [customerById, invoiceSearch, invoiceStatus, invoices, paymentStatus]);

  return (
    <>
      <div className="mb-6 flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0"><h1 className="text-3xl font-extrabold text-[#191C1E]">Company Dashboard</h1><p className="mt-1 text-sm text-[#454557]">Monitor invoices, compliance readiness, payments, and records health.</p></div>
        <Button href="/dashboard/invoices/create"><Plus className="h-4 w-4" /> Create Invoice</Button>
      </div>
      {customerError || invoiceError ? <ComplianceAlert title="Some dashboard data could not load" text={customerError || invoiceError} /> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Customers" value={String(customerPagination?.total ?? customers.length)} meta="API customer records" />
        <MetricCard label="Invoices" value={String(invoicePagination?.total ?? invoices.length)} meta="API sales invoices" />
        <MetricCard label="Outstanding" value={<CurrencyAmount amount={totalOutstanding} />} meta={outstandingLoading ? "Calculating..." : "Posted and unpaid balance due"} tone="primary" />
        <MetricCard label="Suppliers" value={String(supplierPagination?.total ?? suppliers.length)} meta="API supplier records" />
      </div>
      <div className="mt-6 min-w-0 space-y-6">
          <FilterBar
            search={invoiceSearch}
            onSearchChange={setInvoiceSearch}
            searchPlaceholder="Search recent invoices or customers"
            selects={[
              { key: "status", label: "Invoice status", value: invoiceStatus, onChange: setInvoiceStatus, options: [{ label: "Draft", value: "draft" }, { label: "Posted", value: "posted" }, { label: "Paid", value: "paid" }] },
              { key: "payment", label: "Payment status", value: paymentStatus, onChange: setPaymentStatus, options: [{ label: "Unpaid", value: "unpaid" }, { label: "Paid", value: "paid" }, { label: "Partial", value: "partial" }] },
            ]}
            onClear={() => { setInvoiceSearch(""); setInvoiceStatus(""); setPaymentStatus(""); }}
          />
          <DataTable
            title="Recent Sales Invoices"
            columns={["Invoice ID", "Customer", "Amount", "Customer Status", "FIRS Status", "Date", "Actions"]}
            rows={filteredInvoices.slice(0, 5).map((invoice) => {
              const customer = customerById.get(invoice.customer_id);
              return {
                "Invoice ID": <Link href="/dashboard/invoices/sales" className="font-bold text-[#0001B1]">{invoice.invoice_number}</Link>,
                Customer: invoice.customer?.name ?? customer?.name ?? invoice.customer_name ?? "Customer details unavailable",
                Amount: <CurrencyAmount amount={getInvoiceAmount(invoice)} currency={invoice.currency} />,
                "Customer Status": <StatusBadge>{customer ? "recorded" : "unmatched"}</StatusBadge>,
                "FIRS Status": <StatusBadge>{invoice.status ?? "draft"}</StatusBadge>,
                Date: formatInvoiceDate(invoice.issue_date),
                Actions: rowActions(undefined, invoice.invoice_number, [{ label: "View invoice", onSelect: () => { window.location.href = "/dashboard/invoices/sales"; } }]),
              };
            })}
            actions={<Link href="/dashboard/invoices/sales" className="text-sm font-bold text-[#0001B1]">All Invoices</Link>}
            footer={`Showing ${Math.min(filteredInvoices.length, 5)} filtered invoices from ${invoicePagination?.total ?? invoices.length} records`}
          />
          <Card className="p-6">
            <h2 className="text-lg font-bold">Business Records Health</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                [`${customerPagination?.total ?? customers.length} Customers`, `${customers.length} loaded on this page`, "/dashboard/customers", Users],
                [`${supplierPagination?.total ?? suppliers.length} Suppliers`, `${suppliers.filter((supplier) => !supplier.tax_identification_number).length} missing TIN`, "/dashboard/suppliers", Truck],
              ].map(([title, text, href, Icon]) => (
                <Link key={String(title)} href={String(href)} className="flex flex-col gap-3 rounded-xl border border-[#C5C4DA] bg-[#F7F9FB] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3"><span className="rounded-lg bg-[#DADEFD] p-3 text-[#0001B1]">{typeof Icon !== "string" ? <Icon className="h-5 w-5" /> : null}</span><div><p className="font-bold">{title as string}</p><p className="text-sm text-[#454557]">{text as string}</p></div></div>
                  <span className="font-bold text-[#0001B1]">Manage</span>
                </Link>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">Recent Customers</h2>
              <Link href="/dashboard/customers" className="text-sm font-bold text-[#0001B1]">Manage Customers</Link>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {customers.slice(0, 4).map((customer) => (
                <Link key={customer.id} href="/dashboard/customers" className="rounded-xl border border-[#C5C4DA] bg-[#F7F9FB] p-4">
                  <p className="font-bold">{customer.name}</p>
                  <p className="mt-1 text-sm text-[#454557]">{customer.customer_type}</p>
                  <p className="mt-2 whitespace-pre-line text-xs text-[#757588]">{[customer.email, customer.phone1].filter(Boolean).join("\n") || "No contact provided"}</p>
                </Link>
              ))}
            </div>
          </Card>
      </div>
    </>
  );
}
