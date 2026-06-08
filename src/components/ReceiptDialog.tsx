import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createReceipt, type Receipt } from "@/services/receiptsService";
import { getInvoices, type Invoice } from "@/services/invoicesService";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt?: Receipt;
  onSuccess: () => void;
}

export function ReceiptDialog({ open, onOpenChange, receipt, onSuccess }: ReceiptDialogProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [formData, setFormData] = useState({
    invoiceId: "",
    invoiceNumber: "",
    customerId: "",
    customerName: "",
    amount: "",
    paymentMethod: "bank_transfer" as Receipt["paymentMethod"],
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    if (open) {
      loadInvoices();
      if (receipt) {
        setFormData({
          invoiceId: receipt.invoiceId,
          invoiceNumber: receipt.invoiceNumber,
          customerId: receipt.customerId,
          customerName: receipt.customerName,
          amount: receipt.amount.toString(),
          paymentMethod: receipt.paymentMethod,
          paymentDate: receipt.paymentDate,
          notes: receipt.notes || "",
        });
      } else {
        setFormData({
          invoiceId: "",
          invoiceNumber: "",
          customerId: "",
          customerName: "",
          amount: "",
          paymentMethod: "bank_transfer",
          paymentDate: new Date().toISOString().split("T")[0],
          notes: "",
        });
      }
    }
  }, [open, receipt]);

  const loadInvoices = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data.filter(inv => inv.status !== "paid"));
    } catch (error) {
      console.error("Error loading invoices:", error);
    }
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const selectedInvoice = invoices.find(inv => inv.id === invoiceId);
    if (selectedInvoice) {
      setFormData(prev => ({
        ...prev,
        invoiceId: selectedInvoice.id,
        invoiceNumber: selectedInvoice.invoiceNumber,
        customerId: selectedInvoice.customerId,
        customerName: selectedInvoice.customerName,
        amount: selectedInvoice.total.toString(),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createReceipt({
        invoiceId: formData.invoiceId,
        invoiceNumber: formData.invoiceNumber,
        customerId: formData.customerId,
        customerName: formData.customerName,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        notes: formData.notes,
      });
      
      toast.success(receipt ? "Receipt updated successfully" : "Receipt created successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving receipt:", error);
      toast.error("Failed to save receipt");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{receipt ? "Edit Receipt" : "Create Receipt"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice *</Label>
            <Select value={formData.invoiceId} onValueChange={handleInvoiceSelect} disabled={!!receipt}>
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
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select value={formData.paymentMethod} onValueChange={(value: Receipt["paymentMethod"]) => setFormData({ ...formData, paymentMethod: value })}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date *</Label>
            <Input
              id="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {receipt ? "Update" : "Create"} Receipt
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
