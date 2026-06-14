import { describe, expect, it } from "vitest";
import { buildSalesInvoiceRequest, validateSalesInvoiceDraft } from "./invoice-form";

const validDraft = {
  customerId: "customer-1",
  invoiceType: "standard_invoice",
  issueDate: "2026-06-14",
  dueDate: "2026-06-28",
  currency: "NGN",
  notes: " Thank you ",
  discountAmount: 0,
  lineItems: [
    {
      productId: "",
      description: " Consulting service ",
      quantity: 2,
      rate: 1500,
      vatRate: 7.5,
    },
  ],
};

describe("invoice form helpers", () => {
  it("builds the sales invoice API payload for custom line items", () => {
    expect(buildSalesInvoiceRequest(validDraft)).toEqual({
      customer_id: "customer-1",
      invoice_type: "standard_invoice",
      issue_date: "2026-06-14",
      due_date: "2026-06-28",
      currency: "NGN",
      notes: "Thank you",
      discount_amount: 0,
      line_items: [{
        product_id: undefined,
        description: "Consulting service",
        quantity: 2,
        unit_price: 1500,
        tax_rate: 7.5,
      }],
    });
  });

  it("rejects missing customer and empty line descriptions before the backend request", () => {
    const errors = validateSalesInvoiceDraft({
      ...validDraft,
      customerId: "",
      lineItems: [{ ...validDraft.lineItems[0], description: " " }],
    });

    expect(errors).toContain("Select a customer or quick-create one before creating the invoice.");
    expect(errors).toContain("Line 1: enter an item description.");
  });

  it("rejects invalid dates and quantities", () => {
    expect(validateSalesInvoiceDraft({
      ...validDraft,
      issueDate: "2026-06-28",
      dueDate: "2026-06-14",
      lineItems: [{ ...validDraft.lineItems[0], quantity: 0 }],
    })).toEqual([
      "Due date cannot be before issue date.",
      "Line 1: quantity must be greater than zero.",
    ]);
  });
});
