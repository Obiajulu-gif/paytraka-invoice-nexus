import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  ChartColumn,
  CheckCircle2,
  Clock3,
  FileText,
  Package,
  Plus,
  Receipt,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EmptyState,
  InvoiceStatusBadge,
  LoadingCards,
  MetricCard,
  PageHeader,
} from "@/components/AppPrimitives";
import { getCustomers, type Customer } from "@/services/customersService";
import { getInvoices, type Invoice } from "@/services/invoicesService";
import { getReceipts, type Receipt as ReceiptRecord } from "@/services/receiptsService";
import {
  getRevenueSummary,
  getInvoiceStatusSummary,
  getTopCustomers,
  type RevenueSummary,
  type InvoiceStatusSummary,
  type TopCustomer,
} from "@/services/reportsService";
import { formatCurrency } from "@/utils/currency";

const statusColors = ["#10b981", "#2563eb", "#f59e0b", "#ef4444"];

export default function Dashboard() {
  const router = useRouter();
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatusSummary | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenue, status, top, invoiceData, receiptData, customerData] =
          await Promise.all([
            getRevenueSummary(),
            getInvoiceStatusSummary(),
            getTopCustomers(),
            getInvoices(),
            getReceipts(),
            getCustomers(),
          ]);
        setRevenueSummary(revenue);
        setInvoiceStatus(status);
        setTopCustomers(top);
        setInvoices(invoiceData);
        setReceipts(receiptData);
        setCustomers(customerData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusData = useMemo(
    () => [
      { name: "Paid", value: invoiceStatus?.paid || 0 },
      { name: "Sent", value: invoiceStatus?.sent || 0 },
    ],
    [invoiceStatus],
  );

  const recentInvoices = invoices.slice(-5).reverse();
  const recentReceipts = receipts.slice(-4).reverse();
  const pendingInvoices = invoices.filter((invoice) => invoice.status !== "paid").length;

  if (loading) {
    return (
      <div className="app-section">
        <PageHeader
          eyebrow="Business overview"
          title="Welcome to Paytraka Invoice Nexus"
          description="Loading your revenue, invoice, receipt, and customer activity."
        />
        <LoadingCards count={6} />
      </div>
    );
  }

  return (
    <div className="app-section">
      <PageHeader
        eyebrow="Business overview"
        title="Welcome to Paytraka Invoice Nexus"
        description="Track revenue with clarity and manage customers, invoices, and receipts from one professional workspace."
        action={
          <>
            <Button onClick={() => router.push("/invoices")} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
            <Button variant="outline" onClick={() => router.push("/customers")}>
              Add Customer
            </Button>
            <Button variant="outline" onClick={() => router.push("/products")}>
              Add Product
            </Button>
            <Button variant="outline" onClick={() => router.push("/receipts")}>
              Record Receipt
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(revenueSummary?.totalRevenue || 0)}
          icon={Banknote}
          hint="All invoices"
          tone="blue"
        />
        <MetricCard
          label="Paid Revenue"
          value={formatCurrency(revenueSummary?.paidRevenue || 0)}
          icon={CheckCircle2}
          hint="Collected"
          tone="emerald"
        />
        <MetricCard
          label="Unpaid Revenue"
          value={formatCurrency(revenueSummary?.unpaidRevenue || 0)}
          icon={Clock3}
          hint="Pending collection"
          tone="amber"
        />
        <MetricCard
          label="Total Invoices"
          value={invoices.length}
          icon={FileText}
          hint="Created this session"
          tone="slate"
        />
        <MetricCard
          label="Pending Invoices"
          value={pendingInvoices}
          icon={Receipt}
          hint="Awaiting payment"
          tone="amber"
        />
        <MetricCard
          label="Customers"
          value={customers.length}
          icon={Users}
          hint="Active records"
          tone="emerald"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-950">
              Monthly Revenue Trend
            </h3>
            <p className="text-sm text-slate-500">
              Revenue grouped by invoice month.
            </p>
          </div>
          {revenueSummary?.monthlyRevenue?.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <RechartsBarChart data={revenueSummary.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#0f766e" radius={[8, 8, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={ChartColumn}
              title="No revenue trend yet"
              description="Create invoices to populate monthly revenue charts."
              action={<Button onClick={() => router.push("/invoices")}>Create Invoice</Button>}
            />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-950">
              Invoice Status
            </h3>
            <p className="text-sm text-slate-500">Paid and pending distribution.</p>
          </div>
          {statusData.some((entry) => entry.value > 0) ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={95}>
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={statusColors[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={FileText}
              title="No invoice status data"
              description="Invoice status charts appear after invoices are created."
            />
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Recent Invoices
              </h3>
              <p className="text-sm text-slate-500">Latest invoice activity.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/invoices")}>
              View all
            </Button>
          </div>
          {recentInvoices.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No invoices yet"
              description="Create your first invoice to start tracking revenue."
              action={<Button onClick={() => router.push("/invoices")}>Create Invoice</Button>}
            />
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">
              Recent Receipts
            </h3>
            <p className="text-sm text-slate-500">Latest payments recorded.</p>
            <div className="mt-4 space-y-3">
              {recentReceipts.length ? (
                recentReceipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-slate-950">{receipt.receiptNumber}</p>
                      <p className="text-sm text-slate-500">{receipt.customerName}</p>
                    </div>
                    <p className="font-semibold text-primary">
                      {formatCurrency(receipt.amount)}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Receipt}
                  title="No receipts yet"
                  description="Record a receipt after receiving payment."
                />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">
              Top Customers
            </h3>
            <p className="text-sm text-slate-500">Ranked by invoiced revenue.</p>
            <div className="mt-4 space-y-3">
              {topCustomers.length ? (
                topCustomers.slice(0, 4).map((customer, index) => (
                  <div key={customer.customerId} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-950">
                        {customer.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {customer.invoiceCount} invoice(s)
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-950">
                      {formatCurrency(customer.totalRevenue)}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Package}
                  title="No customer ranking yet"
                  description="Customer rankings appear once invoices are created."
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
