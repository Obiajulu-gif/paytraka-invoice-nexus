"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Radio,
  Plus,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { useCustomers } from "@/hooks/useCustomers";
import { useInvoices } from "@/hooks/useInvoices";
import { useProducts } from "@/hooks/useProducts";
import { useSuppliers } from "@/hooks/useSuppliers";
import { salesInvoiceBalance } from "@/lib/invoice-amounts";
import { getMe } from "@/lib/api/auth";
import { getCompanyMode } from "@/lib/api/companies";
import {
  Button,
  Card,
  ComplianceAlert,
  DataTable,
  MetricCard,
  StatusBadge,
  SupportCard,
  rowActions,
} from "../ui";

export function DashboardHome() {
  const [firsConnection, setFirsConnection] = useState<{
    enabled: boolean;
    mode: "demo" | "live";
  } | null>(null);
  const {
    customers,
    pagination: customerPagination,
    error: customerError,
  } = useCustomers();
  const { suppliers, pagination: supplierPagination } = useSuppliers();
  const { products } = useProducts();
  const {
    invoices,
    pagination: invoicePagination,
    error: invoiceError,
  } = useInvoices();
  const customerById = new Map(
    customers.map((customer) => [customer.id, customer]),
  );
  const missingCustomerTin = customers.filter(
    (customer) => !customer.tax_identification_number,
  ).length;
  const missingProductTax = products.filter(
    (product) => product.tax_rate == null,
  ).length;
  const totalOutstanding = invoices.reduce(
    (sum, invoice) => sum + salesInvoiceBalance(invoice),
    0,
  );

  useEffect(() => {
    let cancelled = false;
    async function loadFirsConnection() {
      try {
        const me = await getMe();
        const mode = await getCompanyMode(me.data.company_id).catch(() => null);
        if (!cancelled) {
          setFirsConnection({
            enabled: Boolean(me.data.firs_enabled),
            mode: mode?.data.mode || me.data.mode || "demo",
          });
        }
      } catch {
        if (!cancelled) setFirsConnection(null);
      }
    }
    loadFirsConnection();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="mb-6 flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold text-[#191C1E]">
            Company Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#454557]">
            Monitor invoices, compliance readiness, payments, and records
            health.
          </p>
        </div>
        <Button href="/dashboard/invoices/create">
          <Plus className="h-4 w-4" /> Create Invoice
        </Button>
      </div>
      {customerError || invoiceError ? (
        <ComplianceAlert
          title="Some dashboard data could not load"
          text={customerError || invoiceError}
        />
      ) : null}
      {firsConnection ? (
        <Link
          href="/dashboard/my-company"
          className={`mb-6 flex items-center gap-4 rounded-2xl border p-4 transition hover:shadow-sm ${
            firsConnection.enabled
              ? "border-green-200 bg-green-50"
              : "border-[#C5C4DA] bg-white"
          }`}
        >
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
              firsConnection.enabled
                ? "bg-green-100 text-green-700"
                : "bg-[#F1F4F8] text-[#757588]"
            }`}
          >
            <Radio className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-extrabold text-[#191C1E]">
              FIRS connection
            </span>
            <span className="mt-0.5 block text-sm text-[#454557]">
              {firsConnection.enabled
                ? `Connected in ${firsConnection.mode === "live" ? "Live" : "Demo"} mode`
                : "FIRS connection is currently disabled"}
            </span>
          </span>
          <span
            className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${
              firsConnection.enabled
                ? "bg-green-100 text-green-800"
                : "bg-[#F1F4F8] text-[#757588]"
            }`}
          >
            {firsConnection.enabled ? "Connected" : "Not connected"}
          </span>
        </Link>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Customers"
          value={String(customerPagination?.total ?? customers.length)}
          meta="Customer records"
        />
        <MetricCard
          label="Invoices"
          value={String(invoicePagination?.total ?? invoices.length)}
          meta="Sales invoices"
        />
        <MetricCard
          label="Outstanding"
          value={<CurrencyAmount amount={totalOutstanding} />}
          meta="From loaded invoices"
          tone="primary"
        />
        <MetricCard
          label="Suppliers"
          value={String(supplierPagination?.total ?? suppliers.length)}
          meta="Supplier records"
        />
      </div>
      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="flex items-center gap-3 text-lg font-bold">
              <ClipboardCheck className="h-5 w-5 text-[#1117E8]" /> Missing
              Field Checker
            </h2>
            <div className="mt-5 space-y-3">
              {[
                [
                  "Customer TIN Missing",
                  `${missingCustomerTin} customers need TIN values`,
                  missingCustomerTin > 0 ? "danger" : "success",
                  "/dashboard/customers",
                ],
                [
                  "VAT Configurations",
                  "7.5% standard rate available for invoice items",
                  "success",
                  "/dashboard/settings",
                ],
                [
                  "Product Tax Rates Missing",
                  `${missingProductTax} products need tax rates`,
                  missingProductTax > 0 ? "danger" : "success",
                  "/dashboard/products",
                ],
              ].map(([title, text, tone, href]) => (
                <div
                  key={title}
                  className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${tone === "danger" ? "border-red-100 bg-red-50" : "border-transparent bg-[#F1F4F8]"}`}
                >
                  <div className="flex gap-3">
                    {tone === "danger" ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-700" />
                    )}
                    <div>
                      <p className="font-bold">{title}</p>
                      <p className="text-sm text-[#454557]">{text}</p>
                    </div>
                  </div>
                  {tone === "danger" ? (
                    <Button variant="ghost" href={href}>
                      Fix now
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
          {/* <DataTable
            title="Recent Sales Invoices"
            columns={[
              "Invoice ID",
              "Customer",
              "Amount",
              "Customer Status",
              "FIRS Status",
              "Date",
              "Actions",
            ]}
            rows={invoices.slice(0, 5).map((invoice) => {
              const customer = customerById.get(invoice.customer_id);
              return {
                "Invoice ID": (
                  <Link
                    href="/dashboard/invoices/sales"
                    className="font-bold text-[#0001B1]"
                  >
                    {invoice.invoice_number}
                  </Link>
                ),
                Customer: customer?.name ?? invoice.customer_id,
                Amount: (
                  <CurrencyAmount
                    amount={salesInvoiceBalance(invoice)}
                    currency={invoice.currency}
                  />
                ),
                "Customer Status": (
                  <StatusBadge>
                    {customer?.tax_identification_number
                      ? "verified"
                      : "TIN missing"}
                  </StatusBadge>
                ),
                "FIRS Status": (
                  <StatusBadge>{invoice.status ?? "draft"}</StatusBadge>
                ),
                Date: invoice.issue_date,
                Actions: rowActions(undefined, invoice.invoice_number),
              };
            })}
            actions={
              <Link
                href="/dashboard/invoices/sales"
                className="text-sm font-bold text-[#0001B1]"
              >
                All Invoices
              </Link>
            }
            footer={`Showing ${Math.min(invoices.length, 5)} of ${invoicePagination?.total ?? invoices.length} invoices`}
          /> */}
          {/* <Card className="p-6">
            <h2 className="text-lg font-bold">Business Records Health</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                [
                  `${customerPagination?.total ?? customers.length} Customers`,
                  `${customers.length} loaded on this page`,
                  "/dashboard/customers",
                  Users,
                ],
                [
                  `${supplierPagination?.total ?? suppliers.length} Suppliers`,
                  `${suppliers.filter((supplier) => !supplier.tax_identification_number).length} missing TIN`,
                  "/dashboard/suppliers",
                  Truck,
                ],
              ].map(([title, text, href, Icon]) => (
                <Link
                  key={String(title)}
                  href={String(href)}
                  className="flex flex-col gap-3 rounded-xl border border-[#C5C4DA] bg-[#F7F9FB] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-[#DADEFD] p-3 text-[#0001B1]">
                      {typeof Icon !== "string" ? (
                        <Icon className="h-5 w-5" />
                      ) : null}
                    </span>
                    <div>
                      <p className="font-bold">{title as string}</p>
                      <p className="text-sm text-[#454557]">{text as string}</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#0001B1]">Manage</span>
                </Link>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">Recent Customers</h2>
              <Link
                href="/dashboard/customers"
                className="text-sm font-bold text-[#0001B1]"
              >
                Manage Customers
              </Link>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {customers.slice(0, 4).map((customer) => (
                <Link
                  key={customer.id}
                  href="/dashboard/customers"
                  className="rounded-xl border border-[#C5C4DA] bg-[#F7F9FB] p-4"
                >
                  <p className="font-bold">{customer.name}</p>
                  <p className="mt-1 text-sm text-[#454557]">
                    {customer.tax_identification_number ?? "TIN missing"}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-xs text-[#757588]">
                    {[customer.email, customer.phone1]
                      .filter(Boolean)
                      .join("\n") || "No contact provided"}
                  </p>
                </Link>
              ))}
            </div>
          </Card> */}
        </div>
        {/* <SupportCard /> */}
      </div>
    </>
  );
}
