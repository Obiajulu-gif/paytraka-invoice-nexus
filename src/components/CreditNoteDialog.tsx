import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createCreditNote,
  type CreditNote,
} from "@/services/adjustmentsService";
	import { getInvoices, type Invoice } from "@/services/invoicesService";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CreditNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditNote?: CreditNote;
  onSuccess: () => void;
}

export function CreditNoteDialog({
  open,
  onOpenChange,
  creditNote,
  onSuccess,
}: CreditNoteDialogProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [formData, setFormData] = useState({
    invoiceId: "",
    invoiceNumber: "",
    customerId: "",
    customerName: "",
    amount: "",
    reason: "",
    date: new Date().toISOString().split("T")[0],
    status: "issued" as CreditNote["status"],
    // status: "draft" as CreditNote["status"],
  });

  useEffect(() => {
    if (open) {
      loadInvoices();
      if (creditNote) {
        setFormData({
          invoiceId: creditNote.invoiceId,
          invoiceNumber: creditNote.invoiceNumber,
          customerId: creditNote.customerId,
          customerName: creditNote.customerName,
          amount: creditNote.amount.toString(),
          reason: creditNote.reason,
          date: creditNote.date,
          status: creditNote.status,
        });
      } else {
        setFormData({
          invoiceId: "",
          invoiceNumber: "",
          customerId: "",
          customerName: "",
          amount: "",
          reason: "",
          date: new Date().toISOString().split("T")[0],
          status: "issued",
          // status: "draft",
        });
      }
    }
  }, [open, creditNote]);

  const loadInvoices = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Error loading invoices:", error);
    }
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const selectedInvoice = invoices.find((inv) => inv.id === invoiceId);
    if (selectedInvoice) {
      setFormData((prev) => ({
        ...prev,
        invoiceId: selectedInvoice.id,
        invoiceNumber: selectedInvoice.invoiceNumber,
        customerId: selectedInvoice.customerId,
        customerName: selectedInvoice.customerName,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCreditNote({
        invoiceId: formData.invoiceId,
        invoiceNumber: formData.invoiceNumber,
        customerId: formData.customerId,
        customerName: formData.customerName,
        amount: parseFloat(formData.amount),
        reason: formData.reason,
        date: formData.date,
        status: formData.status,
      });

      toast.success(
        creditNote
          ? "Credit note updated successfully"
          : "Credit note created successfully",
      );
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving credit note:", error);
      toast.error("Failed to save credit note");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {creditNote ? "Edit Credit Note" : "Create Credit Note"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice *</Label>
            <Select
              value={formData.invoiceId}
              onValueChange={handleInvoiceSelect}
              disabled={!!creditNote}
            >
              <SelectTrigger id="invoice">
                <SelectValue placeholder="Select an invoice" />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} - {invoice.customerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              rows={3}
              required
            />
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value: CreditNote["status"]) => setFormData({ ...formData, status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {creditNote ? "Update" : "Create"} Credit Note
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
