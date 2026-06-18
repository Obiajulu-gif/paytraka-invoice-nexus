import { describe, expect, it } from "vitest";
import { invoiceCsvTemplate, parseInvoiceCsv } from "./invoice-csv";

describe("invoice CSV parser", () => {
  it("groups line items and safely parses quoted fields", () => {
    const csv = `${invoiceCsvTemplate()}batch-1,customer-1,standard_invoice,2026-06-01,2026-06-15,NGN,"Thank you, valued customer",0,,Consulting,2,1000,5,7.5
batch-1,customer-1,standard_invoice,2026-06-01,2026-06-15,NGN,"Thank you, valued customer",0,,Support,1,500,0,7.5`;
    const result = parseInvoiceCsv(csv);
    expect(result.errors).toEqual([]);
    expect(result.invoices).toHaveLength(1);
    expect(result.invoices[0].payload.line_items).toHaveLength(2);
    expect(result.invoices[0].payload.notes).toBe("Thank you, valued customer");
  });

  it("reports row-level date and numeric validation errors without discarding them silently", () => {
    const csv = `${invoiceCsvTemplate()}batch-1,,standard_invoice,2026-99-01,2026-01-01,NGN,,0,,Service,0,-1,101,-2`;
    const result = parseInvoiceCsv(csv);
    expect(result.invoices).toEqual([]);
    expect(result.errors[0].row).toBe(2);
    expect(result.errors[0].messages).toEqual(expect.arrayContaining([
      "customer_id is required",
      "issue_date must use YYYY-MM-DD",
      "quantity must be greater than zero",
      "unit_price must be zero or greater",
    ]));
  });

  it("rejects files with missing schema headers", () => {
    expect(parseInvoiceCsv("customer_id,description\n1,Service").errors[0].messages[0]).toContain("Missing headers");
  });
});
