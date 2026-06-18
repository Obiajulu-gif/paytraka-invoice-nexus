import { describe, expect, it } from "vitest";
import { formatInvoiceDate, getInvoiceTotals, sumOutstandingInvoices } from "./invoice-utils";
import { SalesInvoice } from "@/types/api";

const invoice = (overrides: Partial<SalesInvoice> = {}): SalesInvoice => ({
  id: "invoice-1",
  public_id: "PUB-1",
  invoice_number: "INV-1",
  customer_id: "customer-1",
  invoice_type: "standard_invoice",
  issue_date: "2026-05-16",
  due_date: "2026-05-30",
  currency: "NGN",
  line_items: [],
  ...overrides,
});

describe("invoice utilities", () => {
  it("formats API dates and handles missing or invalid values", () => {
    expect(formatInvoiceDate("2026-05-16")).toBe("2026-May-16");
    expect(formatInvoiceDate(null)).toBe("Not provided");
    expect(formatInvoiceDate("not-a-date")).toBe("Invalid date");
  });

  it("uses posted unpaid balance_due values only and sums in currency cents", () => {
    expect(sumOutstandingInvoices([
      invoice({ status: "posted", payment_status: "unpaid", balance_due: "10.10" }),
      invoice({ id: "2", status: "posted", payment_status: "unpaid", balance_due: 20.2 }),
      invoice({ id: "3", status: "draft", payment_status: "unpaid", balance_due: 999 }),
      invoice({ id: "4", status: "posted", payment_status: "paid", balance_due: 999 }),
      invoice({ id: "5", status: "posted", payment_status: "unpaid", balance_due: "invalid" }),
    ])).toBe(30.3);
  });

  it("calculates discounts, exclusive value, VAT, and inclusive total", () => {
    expect(getInvoiceTotals(invoice({
      discount_amount: "5",
      line_items: [{ description: "Service", quantity: "2", unit_price: "100", discount_percentage: "10", tax_rate: "7.5" }],
    }))).toEqual({ exclusive: 200, discount: 25, vat: 13.5, inclusive: 188.5 });
  });
});
