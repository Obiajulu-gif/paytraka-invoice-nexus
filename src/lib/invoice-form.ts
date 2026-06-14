import { SalesInvoiceRequest } from "@/types/api";

export type SalesInvoiceDraftLineItem = {
  productId: string;
  description: string;
  quantity: number;
  rate: number;
  vatRate: number;
};

export type SalesInvoiceDraft = {
  customerId: string;
  invoiceType: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  notes?: string;
  discountAmount: number;
  lineItems: SalesInvoiceDraftLineItem[];
};

export function validateSalesInvoiceDraft(draft: SalesInvoiceDraft) {
  const errors: string[] = [];

  if (!draft.customerId) errors.push("Select a customer or quick-create one before creating the invoice.");
  if (!draft.issueDate) errors.push("Enter an issue date.");
  if (!draft.dueDate) errors.push("Enter a due date.");
  if (draft.issueDate && draft.dueDate && draft.dueDate < draft.issueDate) errors.push("Due date cannot be before issue date.");
  if (!draft.lineItems.length) errors.push("Add at least one invoice line item.");

  draft.lineItems.forEach((item, index) => {
    const label = `Line ${index + 1}`;
    if (!item.description.trim()) errors.push(`${label}: enter an item description.`);
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) errors.push(`${label}: quantity must be greater than zero.`);
    if (!Number.isFinite(item.rate) || item.rate < 0) errors.push(`${label}: unit price cannot be negative.`);
    if (!Number.isFinite(item.vatRate) || item.vatRate < 0) errors.push(`${label}: VAT rate cannot be negative.`);
  });

  return errors;
}

export function buildSalesInvoiceRequest(draft: SalesInvoiceDraft): SalesInvoiceRequest {
  return {
    customer_id: draft.customerId,
    invoice_type: draft.invoiceType,
    issue_date: draft.issueDate,
    due_date: draft.dueDate,
    currency: draft.currency,
    notes: draft.notes?.trim() || undefined,
    discount_amount: Math.max(Number(draft.discountAmount) || 0, 0),
    line_items: draft.lineItems.map((item) => ({
      product_id: item.productId || undefined,
      description: item.description.trim(),
      quantity: Number(item.quantity),
      unit_price: Number(item.rate),
      tax_rate: Number(item.vatRate) || 0,
    })),
  };
}
