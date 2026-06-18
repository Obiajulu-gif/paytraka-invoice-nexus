export const SALES_INVOICE_ACTION_LABELS = [
  "View invoice",
  "Edit invoice",
  "Mark as paid",
  "Download invoice",
  "Delete invoice",
] as const;

export function getSalesInvoiceActionLabels(isPosted: boolean): string[] {
  return SALES_INVOICE_ACTION_LABELS.filter((label) => label !== "Mark as paid" || isPosted);
}
