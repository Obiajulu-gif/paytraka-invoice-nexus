import { useEffect, useMemo, useState } from "react";
import { Download, Eye, Plus, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  LoadingCards,
  MetricCard,
  PageHeader,
  SearchToolbar,
} from "@/components/AppPrimitives";
import { ReceiptDialog } from "@/components/ReceiptDialog";
import { ReceiptViewDialog } from "@/components/ReceiptViewDialog";
import { deleteReceipt, getReceipts, type Receipt as ReceiptRecord } from "@/services/receiptsService";
import { formatCurrency } from "@/utils/currency";
import { generateReceiptPDF } from "@/utils/pdfGenerator";
import { toast } from "sonner";

const methodLabels: Record<ReceiptRecord["paymentMethod"], string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  card: "Card",
  mobile_money: "Mobile Money",
};

export default function Receipts() {
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<ReceiptRecord | undefined>();

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch (error) {
      console.error("Error loading receipts:", error);
      toast.error("Failed to load receipts");
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = useMemo(
    () => receipts.reduce((sum, receipt) => sum + receipt.amount, 0),
    [receipts],
  );

  const filteredReceipts = receipts.filter((receipt) => {
    const query = searchTerm.toLowerCase();
    return (
      receipt.receiptNumber.toLowerCase().includes(query) ||
      receipt.invoiceNumber.toLowerCase().includes(query) ||
      receipt.customerName.toLowerCase().includes(query) ||
      methodLabels[receipt.paymentMethod].toLowerCase().includes(query)
    );
  });

  const handleDownloadPDF = async (receipt: ReceiptRecord) => {
    try {
      await generateReceiptPDF(receipt);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleDeleteReceipt = async (receipt: ReceiptRecord) => {
    if (!confirm(`Delete ${receipt.receiptNumber}? This action cannot be undone.`)) return;

    try {
      await deleteReceipt(receipt.id);
      toast.success("Receipt deleted successfully");
      loadReceipts();
    } catch (error) {
      console.error("Error deleting receipt:", error);
      toast.error("Failed to delete receipt");
    }
  };

  if (loading) {
    return (
      <div className="app-section">
        <PageHeader title="Receipts" description="Loading payment records." />
        <LoadingCards count={3} />
      </div>
    );
  }

  return (
    <div className="app-section">
      <PageHeader
        eyebrow="Payment records"
        title="Receipts"
        description="Record customer payments, connect them to invoices, and keep collection records printable."
        action={
          <Button onClick={() => setDialogOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Record Receipt
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Receipts" value={receipts.length} icon={Receipt} hint="Payment records" />
        <MetricCard label="Amount Paid" value={formatCurrency(totalPaid)} icon={Receipt} hint="Collected payments" tone="emerald" />
        <MetricCard label="Payment Methods" value={new Set(receipts.map((receipt) => receipt.paymentMethod)).size} icon={Receipt} hint="Used this session" tone="slate" />
      </div>

      <SearchToolbar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search receipts by receipt number, invoice, customer, or payment method..."
      />

      {filteredReceipts.length ? (
        <div className="table-shell">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Receipt</TableHead>
                <TableHead>Linked Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead className="hidden md:table-cell">Payment Date</TableHead>
                <TableHead className="hidden md:table-cell">Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-semibold text-slate-950">
                    {receipt.receiptNumber}
                  </TableCell>
                  <TableCell>{receipt.invoiceNumber}</TableCell>
                  <TableCell>{receipt.customerName}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    {formatCurrency(receipt.amount)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{receipt.paymentDate}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                      {methodLabels[receipt.paymentMethod]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                      Recorded
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setViewingReceipt(receipt);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadPDF(receipt)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteReceipt(receipt)}>
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
          icon={Receipt}
          title="No receipts found"
          description="Record a receipt when a customer pays an invoice."
          action={<Button onClick={() => setDialogOpen(true)}>Record Receipt</Button>}
        />
      )}

      <ReceiptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadReceipts}
      />
      <ReceiptViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        receipt={viewingReceipt || null}
      />
    </div>
  );
}
