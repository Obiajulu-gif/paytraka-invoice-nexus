import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { BarChart3, CalendarDays, Download, FileText, TrendingUp, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  getInvoiceStatusSummary,
  getRevenueSummary,
  getTopCustomers,
  type InvoiceStatusSummary,
  type RevenueSummary,
  type TopCustomer,
} from "@/services/reportsService";
import { getInvoices, type Invoice } from "@/services/invoicesService";
import { formatCurrency } from "@/utils/currency";
import { EmptyState, LoadingCards, MetricCard, PageHeader } from "@/components/AppPrimitives";

export default function Reports() {
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatusSummary | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenue, status, customers, invoiceData] = await Promise.all([
          getRevenueSummary(),
          getInvoiceStatusSummary(),
          getTopCustomers(),
          getInvoices(),
        ]);
        setRevenueSummary(revenue);
        setInvoiceStatus(status);
        setTopCustomers(customers);
        setInvoices(invoiceData);
      } catch (error) {
        console.error("Error fetching reports data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const averageInvoiceValue = useMemo(() => {
    if (!invoices.length) return 0;
    return invoices.reduce((sum, invoice) => sum + invoice.total, 0) / invoices.length;
  }, [invoices]);

  const paidVsUnpaid = [
    { name: "Paid", value: revenueSummary?.paidRevenue || 0 },
    { name: "Unpaid", value: revenueSummary?.unpaidRevenue || 0 },
  ];

  const statusData = [
    { name: "Paid", value: invoiceStatus?.paid || 0 },
    { name: "Sent", value: invoiceStatus?.sent || 0 },
  ];

  if (loading) {
    return (
      <div className="app-section">
        <PageHeader title="Reports" description="Loading revenue and invoice analytics." />
        <LoadingCards count={5} />
      </div>
    );
  }

  return (
    <div className="app-section">
      <PageHeader
        eyebrow="Business intelligence"
        title="Reports"
        description="Understand revenue, payment collection, invoice performance, and customer concentration at a glance."
        action={
          <>
            <Button variant="outline">
              <CalendarDays className="mr-2 h-4 w-4" />
              Last 30 days
            </Button>
            <Button className="bg-primary text-white hover:bg-slate-800">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Revenue" value={formatCurrency(revenueSummary?.totalRevenue || 0)} icon={TrendingUp} hint="Total invoiced" />
        <MetricCard label="Paid" value={formatCurrency(revenueSummary?.paidRevenue || 0)} icon={Wallet} hint="Collected" tone="emerald" />
        <MetricCard label="Unpaid" value={formatCurrency(revenueSummary?.unpaidRevenue || 0)} icon={Wallet} hint="Outstanding" tone="amber" />
        <MetricCard label="Invoice Count" value={invoices.length} icon={FileText} hint="Total invoices" tone="slate" />
        <MetricCard label="Avg Invoice" value={formatCurrency(averageInvoiceValue)} icon={BarChart3} hint="Average value" tone="blue" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartCard title="Revenue Trend" description="Monthly revenue over time.">
          {revenueSummary?.monthlyRevenue?.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={revenueSummary.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0f766e"
                  strokeWidth={3}
                  dot={{ fill: "#0f766e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={TrendingUp} title="No trend data yet" description="Create invoices to build a revenue trend." />
          )}
        </ChartCard>

        <ChartCard title="Paid vs Unpaid" description="Revenue collection split.">
          {paidVsUnpaid.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={paidVsUnpaid} dataKey="value" nameKey="name" outerRadius={95}>
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={Wallet} title="No payment split yet" description="Paid and unpaid charts appear after invoices are created." />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Invoice Status Summary" description="Count by invoice status.">
          {statusData.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={FileText} title="No status data yet" description="Invoice status counts appear after invoice creation." />
          )}
        </ChartCard>

        <ChartCard title="Top Customers" description="Highest revenue customers.">
          {topCustomers.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topCustomers.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" tickFormatter={(value) => `₦${Number(value) / 1000}k`} />
                <YAxis dataKey="customerName" type="category" stroke="#64748b" width={120} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="totalRevenue" fill="#0f766e" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={BarChart3} title="No customer data yet" description="Create invoices to rank customers by revenue." />
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}
