import { CreditCard, Plus, ReceiptText, ShieldCheck } from "lucide-react";
import { purchaseInvoiceRows } from "../data";
import { BottomInsight, Button, ComplianceAlert, DataTable, FilterBar, MetricCard, PageHeader, StatusBadge, rowActions } from "../ui";

export function PurchaseInvoicesPage() {
  return (
    <>
      <PageHeader title="Purchase Invoices" subtitle="Track procurement records and manage tax-deductible expenses." action={<Button href="/dashboard/invoices/purchase/create"><Plus className="h-4 w-4" /> Add Purchase Invoice</Button>} />
      <ComplianceAlert title="Action Required" text="3 recent invoices are from suppliers with missing or invalid Tax Identification Numbers (TIN). These may be ineligible for VAT claims." />
      <div className="mb-6 grid gap-5 md:grid-cols-3"><MetricCard label="Total Purchases (MTD)" value="₦4,280,500.00" meta="+12.5%" icon={CreditCard} /><MetricCard label="Pending Tax Claims" value="₦342,440.00" meta="Est. Return" icon={ReceiptText} /><MetricCard label="Supplier Compliance Rate" value="94.2%" meta="Target: 98%" icon={ShieldCheck} /></div>
      <FilterBar labels={["Date Range: Last 30 Days", "All Suppliers", "Compliance: All"]} />
      <DataTable title="Invoice History" columns={["Invoice #", "Supplier", "Amount", "VAT Claimable", "Status", "Date", "Actions"]} rows={purchaseInvoiceRows.map(([invoice, supplier, amount, vat, status, date]) => ({ "Invoice #": <b className="text-[#0001B1]">{invoice}</b>, Supplier: <b>{supplier}</b>, Amount: amount, "VAT Claimable": <b className={String(vat).startsWith("₦") ? "text-green-700" : ""}>{vat}</b>, Status: <StatusBadge>{status}</StatusBadge>, Date: date, Actions: rowActions() }))} footer="Showing 1 to 4 of 124 invoices" />
      <BottomInsight title="Procurement Insights" asideTitle="Tax Filing Readiness" />
    </>
  );
}
