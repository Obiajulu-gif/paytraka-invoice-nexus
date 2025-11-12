import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createInvoice, updateInvoice, type Invoice, type InvoiceItem } from "@/services/invoicesService";
import { getCustomers, type Customer } from "@/services/customersService";
import { getProducts, type Product } from "@/services/productsService";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  onSuccess: () => void;
}

export function InvoiceDialog({ open, onOpenChange, invoice, onSuccess }: InvoiceDialogProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: invoice?.customerId || "",
    date: invoice?.date || new Date().toISOString().split("T")[0],
    dueDate: invoice?.dueDate || "",
    status: invoice?.status || "draft",
    discount: invoice?.discount?.toString() || "0",
    deliveryFee: invoice?.deliveryFee?.toString() || "0",
    notes: invoice?.notes || "",
  });

  const [lineItems, setLineItems] = useState<InvoiceItem[]>(
    invoice?.items || []
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [customersData, productsData] = await Promise.all([
      getCustomers(),
      getProducts(),
    ]);
    setCustomers(customersData);
    setProducts(productsData);
  };

  const addLineItem = () => {
    if (products.length === 0) {
      toast.error("Please add products first");
      return;
    }
    const product = products[0];
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        taxRate: product.taxRate,
        total: product.price,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        updated[index].productName = product.name;
        updated[index].unitPrice = product.price;
        updated[index].taxRate = product.taxRate;
      }
    }
    
    if (field === "quantity" || field === "unitPrice") {
      updated[index].total = updated[index].quantity * updated[index].unitPrice;
    }
    
    setLineItems(updated);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax = lineItems.reduce((sum, item) => sum + (item.total * item.taxRate / 100), 0);
    const discount = parseFloat(formData.discount) || 0;
    const deliveryFee = parseFloat(formData.deliveryFee) || 0;
    const total = subtotal + tax - discount + deliveryFee;
    
    return { subtotal, tax, discount, deliveryFee, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lineItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    setLoading(true);

    try {
      const customer = customers.find((c) => c.id === formData.customerId);
      if (!customer) {
        toast.error("Please select a customer");
        setLoading(false);
        return;
      }

      const totals = calculateTotals();

      const data = {
        customerId: formData.customerId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerAddress: customer.address,
        date: formData.date,
        dueDate: formData.dueDate,
        status: formData.status as "draft" | "sent" | "paid" | "overdue" | "cancelled",
        items: lineItems,
        subtotal: totals.subtotal,
        taxAmount: totals.tax,
        discount: totals.discount,
        deliveryFee: totals.deliveryFee,
        total: totals.total,
        notes: formData.notes,
      };

      if (invoice) {
        await updateInvoice(invoice.id, data);
        toast.success("Invoice updated successfully");
      } else {
        await createInvoice(data);
        toast.success("Invoice created successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
          <DialogDescription>
            {invoice ? "Update invoice details" : "Create a new invoice for your customer"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select value={formData.customerId} onValueChange={(value) => setFormData({ ...formData, customerId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: "draft" | "sent" | "paid" | "overdue" | "cancelled") => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Invoice Date *</Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Line Items *</Label>
              <Button type="button" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Product/Service</TableHead>
                    <TableHead className="w-[100px]">Qty</TableHead>
                    <TableHead className="w-[120px]">Price</TableHead>
                    <TableHead className="w-[100px]">Tax %</TableHead>
                    <TableHead className="w-[120px]">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select
                          value={item.productId}
                          onValueChange={(value) => updateLineItem(index, "productId", value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          className="h-8"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, "quantity", parseInt(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, "unitPrice", parseFloat(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8"
                          value={item.taxRate}
                          onChange={(e) => updateLineItem(index, "taxRate", parseFloat(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>₦{item.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (₦)</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Delivery Fee (₦)</Label>
              <Input
                id="deliveryFee"
                type="number"
                step="0.01"
                value={formData.deliveryFee}
                onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2 text-right">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">₦{totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium">₦{totals.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-medium">-₦{totals.discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee:</span>
                <span className="font-medium">₦{totals.deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>₦{totals.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : invoice ? "Update Invoice" : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
