import { SalesInvoiceRequest } from "@/types/api";

export const INVOICE_CSV_HEADERS = [
  "invoice_key",
  "customer_id",
  "invoice_type",
  "issue_date",
  "due_date",
  "currency",
  "notes",
  "invoice_discount_amount",
  "product_id",
  "description",
  "quantity",
  "unit_price",
  "discount_percentage",
  "vat_percentage",
] as const;

export type InvoiceCsvError = { row: number; messages: string[] };
export type ParsedInvoiceCsv = {
  invoices: Array<{ key: string; payload: SalesInvoiceRequest }>;
  errors: InvoiceCsvError[];
  rowCount: number;
};

function parseRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parseFinite(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseInvoiceCsv(text: string): ParsedInvoiceCsv {
  const rows = parseRows(text.replace(/^\uFEFF/, ""));
  if (!rows.length) return { invoices: [], errors: [{ row: 1, messages: ["The CSV file is empty."] }], rowCount: 0 };
  const headers = rows[0].map(normalizeHeader);
  const missingHeaders = INVOICE_CSV_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length) {
    return { invoices: [], errors: [{ row: 1, messages: [`Missing headers: ${missingHeaders.join(", ")}.`] }], rowCount: Math.max(rows.length - 1, 0) };
  }

  const groups = new Map<string, { row: number; fields: Record<string, string>; lineItems: SalesInvoiceRequest["line_items"] }>();
  const errors: InvoiceCsvError[] = [];

  rows.slice(1).forEach((values, index) => {
    const rowNumber = index + 2;
    const fields = Object.fromEntries(headers.map((header, column) => [header, (values[column] ?? "").trim()]));
    const messages: string[] = [];
    for (const field of ["invoice_key", "customer_id", "issue_date", "due_date", "description", "quantity", "unit_price"]) {
      if (!fields[field]) messages.push(`${field} is required`);
    }
    if (fields.issue_date && !validDate(fields.issue_date)) messages.push("issue_date must use YYYY-MM-DD");
    if (fields.due_date && !validDate(fields.due_date)) messages.push("due_date must use YYYY-MM-DD");
    if (validDate(fields.issue_date) && validDate(fields.due_date) && fields.due_date < fields.issue_date) messages.push("due_date cannot be before issue_date");
    const quantity = parseFinite(fields.quantity);
    const unitPrice = parseFinite(fields.unit_price);
    const vat = parseFinite(fields.vat_percentage || "0");
    const discount = parseFinite(fields.discount_percentage || "0");
    const invoiceDiscount = parseFinite(fields.invoice_discount_amount || "0");
    if (quantity == null || quantity <= 0) messages.push("quantity must be greater than zero");
    if (unitPrice == null || unitPrice < 0) messages.push("unit_price must be zero or greater");
    if (vat == null || vat < 0 || vat > 100) messages.push("vat_percentage must be between 0 and 100");
    if (discount == null || discount < 0 || discount > 100) messages.push("discount_percentage must be between 0 and 100");
    if (invoiceDiscount == null || invoiceDiscount < 0) messages.push("invoice_discount_amount must be zero or greater");
    if (messages.length) {
      errors.push({ row: rowNumber, messages });
      return;
    }

    const existing = groups.get(fields.invoice_key);
    if (existing) {
      for (const field of ["customer_id", "invoice_type", "issue_date", "due_date", "currency", "notes", "invoice_discount_amount"]) {
        if (existing.fields[field] !== fields[field]) messages.push(`${field} must match other rows for invoice_key "${fields.invoice_key}"`);
      }
      if (messages.length) {
        errors.push({ row: rowNumber, messages });
        return;
      }
    }
    const group = existing ?? { row: rowNumber, fields, lineItems: [] };
    group.lineItems.push({
      product_id: fields.product_id || undefined,
      description: fields.description,
      quantity: quantity!,
      unit_price: unitPrice!,
      discount_percentage: discount!,
      tax_rate: vat!,
    });
    groups.set(fields.invoice_key, group);
  });

  const invalidKeys = new Set(errors.map((error) => rows[error.row - 1]?.[headers.indexOf("invoice_key")]?.trim()).filter(Boolean));
  const invoices = [...groups.entries()]
    .filter(([key]) => !invalidKeys.has(key))
    .map(([key, group]) => ({
      key,
      payload: {
        customer_id: group.fields.customer_id,
        invoice_type: group.fields.invoice_type || "standard_invoice",
        issue_date: group.fields.issue_date,
        due_date: group.fields.due_date,
        currency: group.fields.currency || "NGN",
        notes: group.fields.notes || undefined,
        discount_amount: parseFinite(group.fields.invoice_discount_amount || "0") ?? 0,
        line_items: group.lineItems,
      },
    }));
  return { invoices, errors, rowCount: rows.length - 1 };
}

export function invoiceCsvTemplate(): string {
  return `${INVOICE_CSV_HEADERS.join(",")}\n`;
}
