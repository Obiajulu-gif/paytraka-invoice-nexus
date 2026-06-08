import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Edit,
  Eye,
  FileText,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
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
  SearchToolbar,
  SegmentedButton,
} from "@/components/AppPrimitives";
import { InvoiceDialog } from "@/components/InvoiceDialog";
import { InvoiceViewDialog } from "@/components/InvoiceViewDialog";
import {
  deleteInvoice,
  getInvoices,
  updateInvoice,
  type Invoice,
} from "@/services/invoicesService";
import { formatCurrency } from "@/utils/currency";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import { toast } from "sonner";

const filters = ["all", "draft", "sent", "paid", "overdue", "cancelled"] as const;
type InvoiceFilter = (typeof filters)[number];

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<InvoiceFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>();
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | undefined>();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const total = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const paid = invoices
      .filter((invoice) => invoice.status === "paid")
      .reduce((sum, invoice) => sum + invoice.total, 0);
    return {
      total,
      paid,
      unpaid: total - paid,
      pending: invoices.filter((invoice) => invoice.status !== "paid").length,
    };
  }, [invoices]);

  const filteredInvoices = invoices.filter((invoice) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(query) ||
      invoice.customerName.toLowerCase().includes(query);
    const matchesFilter = filter === "all" || invoice.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (invoice: Invoice) => {
    if (!confirm(`Delete ${invoice.invoiceNumber}? This action cannot be undone.`)) return;

    try {
      await deleteInvoice(invoice.id);
      toast.success("Invoice deleted successfully");
      loadInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      await generateInvoicePDF(invoice);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleMarkAsSent = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, { status: "sent" });
      toast.success(`${invoice.invoiceNumber} marked as sent`);
      loadInvoices();
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
    }
  };

  const handleAddNew = () => {
    setEditingInvoice(undefined);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="app-section">
        <PageHeader title="Invoices" description="Loading invoice workspace." />
        <LoadingCards count={4} />
      </div>
    );
  }

  return (
    <div className="app-section">
      <PageHeader
        eyebrow="Invoice management"
        title="Invoices"
        description="Create compliant invoices faster, monitor payment status, and keep customer billing records clear."
        action={
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Invoice Value" value={formatCurrency(summary.total)} icon={FileText} hint="Total invoiced" />
        <MetricCard label="Paid" value={formatCurrency(summary.paid)} icon={FileText} hint="Collected" tone="emerald" />
        <MetricCard label="Unpaid" value={formatCurrency(summary.unpaid)} icon={FileText} hint="Pending" tone="amber" />
        <MetricCard label="Pending Invoices" value={summary.pending} icon={FileText} hint="Awaiting payment" tone="slate" />
      </div>

      <SearchToolbar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search by invoice number or customer..."
      >
        {filters.map((item) => (
          <SegmentedButton
            key={item}
            active={filter === item}
            onClick={() => setFilter(item)}
          >
            {item === "all" ? "All" : item}
          </SegmentedButton>
        ))}
      </SearchToolbar>

      {filteredInvoices.length ? (
        <div className="table-shell">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Issue Date</TableHead>
                <TableHead className="hidden md:table-cell">Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div className="font-semibold text-slate-950">{invoice.invoiceNumber}</div>
                    <div className="text-xs text-slate-500">{invoice.items.length} line item(s)</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-800">{invoice.customerName}</div>
                    <div className="text-xs text-slate-500">{invoice.customerEmail}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{invoice.date}</TableCell>
                  <TableCell className="hidden md:table-cell">{invoice.dueDate}</TableCell>
                  <TableCell className="font-semibold text-slate-950">
                    {formatCurrency(invoice.total)}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View"
                        onClick={() => {
                          setViewingInvoice(invoice);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit"
                        onClick={() => {
                          setEditingInvoice(invoice);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Download PDF"
                        onClick={() => handleDownloadPDF(invoice)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Mark as sent"
                        onClick={() => handleMarkAsSent(invoice)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        onClick={() => handleDelete(invoice)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No invoices found"
          description="Create your first invoice or adjust the current search and status filters."
          action={<Button onClick={handleAddNew}>Create Invoice</Button>}
        />
      )}

      <InvoiceDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingInvoice(undefined);
        }}
        invoice={editingInvoice}
        onSuccess={loadInvoices}
      />
      <InvoiceViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        invoice={viewingInvoice || null}
      />
    </div>
  );
}
