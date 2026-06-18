import { describe, expect, it } from "vitest";
import { getSalesInvoiceActionLabels } from "./invoice-actions";

describe("sales invoice actions", () => {
  it("excludes duplicate, send invoice, and CSV download actions", () => {
    expect(getSalesInvoiceActionLabels(false)).toEqual(["View invoice", "Edit invoice", "Download invoice", "Delete invoice"]);
    expect(getSalesInvoiceActionLabels(true)).toEqual(["View invoice", "Edit invoice", "Mark as paid", "Download invoice", "Delete invoice"]);
  });
});
