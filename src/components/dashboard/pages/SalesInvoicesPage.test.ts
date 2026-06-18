import { describe, expect, it } from "vitest";
import { buildInvoiceUpdatePayload } from "./SalesInvoicesPage";
import { SalesInvoice } from "@/types/api";

const existing: SalesInvoice = {
  id: "invoice-42",
  public_id: "PUB-42",
  invoice_number: "INV-42",
  customer_id: "customer-old",
  invoice_type: "standard_invoice",
  issue_date: "2026-06-01",
  due_date: "2026-06-14",
  currency: "NGN",
  line_items: [{ description: "Old service", quantity: 1, unit_price: 100 }],
};

describe("invoice edit payload", () => {
  it("keeps the existing invoice id outside the update payload and maps edited line data", () => {
    const result = buildInvoiceUpdatePayload(existing, {
      customerId: "customer-new",
      invoiceType: "standard_invoice",
      issueDate: "2026-06-02",
      dueDate: "2026-06-20",
      currency: "USD",
      discountAmount: "25",
      notes: "Updated",
      lineItems: [{ description: "Updated service", quantity: "2", unit_price: "150", discount_percentage: "10", tax_rate: "5" }],
    });
    expect(result.errors).toEqual([]);
    expect(result.payload).toEqual({
      customer_id: "customer-new",
      invoice_type: "standard_invoice",
      issue_date: "2026-06-02",
      due_date: "2026-06-20",
      currency: "USD",
      discount_amount: 25,
      notes: "Updated",
      line_items: [{ product_id: undefined, description: "Updated service", quantity: 2, unit_price: 150, tax_rate: 5, discount_percentage: 10 }],
    });
  });

  it("blocks invalid edited dates and line amounts", () => {
    const result = buildInvoiceUpdatePayload(existing, {
      customerId: "",
      invoiceType: "",
      issueDate: "2026-06-20",
      dueDate: "2026-06-01",
      currency: "NGN",
      discountAmount: "0",
      notes: "",
      lineItems: [{ description: "", quantity: 0, unit_price: -1, discount_percentage: 0, tax_rate: 0 }],
    });
    expect(result.payload).toBeUndefined();
    expect(result.errors).toEqual(expect.arrayContaining(["Customer is required.", "Due date cannot be before issue date.", "Line 1: description is required."]));
  });
});
