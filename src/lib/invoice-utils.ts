import { Company, Customer, InvoiceLineItem, PurchaseInvoice, SalesInvoice, Supplier } from "@/types/api";

export type InvoiceParty = {
  name: string;
  email?: string;
  phone?: string;
  tin?: string;
  addressLines: string[];
  logoUrl?: string | null;
};

export type InvoiceLineTotals = {
  exclusive: number;
  discount: number;
  vat: number;
  inclusive: number;
  discountPercentage: number;
};

export type InvoiceTotals = {
  exclusive: number;
  discount: number;
  vat: number;
  inclusive: number;
};

export function safeNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string" || !value.trim()) return 0;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatInvoiceDate(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "Not provided";
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const date = dateOnly
    ? new Date(Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(date);
  const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

export function toDateInputValue(value: unknown): string {
  if (typeof value !== "string") return "";
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  if (!match) return "";
  return Number.isNaN(new Date(`${match[1]}T00:00:00Z`).getTime()) ? "" : match[1];
}

export function formatCurrency(value: unknown, currency = "NGN"): string {
  const safeCurrency = /^[A-Z]{3}$/.test(currency) ? currency : "NGN";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: safeCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeNumber(value));
}

function lineDiscountPercentage(item: InvoiceLineItem): number {
  return Math.max(0, safeNumber(item.discount_percentage ?? item.discount_percent ?? item.discount_rate));
}

export function getInvoiceLineTotals(item: InvoiceLineItem): InvoiceLineTotals {
  const exclusive = Math.max(0, safeNumber(item.quantity) * safeNumber(item.unit_price));
  const discountPercentage = lineDiscountPercentage(item);
  const discount = Math.min(exclusive, exclusive * discountPercentage / 100);
  const taxable = exclusive - discount;
  const vat = taxable * Math.max(0, safeNumber(item.tax_rate)) / 100;
  return { exclusive, discount, vat, inclusive: taxable + vat, discountPercentage };
}

export function getInvoiceTotals(invoice: SalesInvoice): InvoiceTotals {
  const calculated = (invoice.line_items ?? []).reduce<InvoiceTotals>((totals, item) => {
    const line = getInvoiceLineTotals(item);
    totals.exclusive += line.exclusive;
    totals.discount += line.discount;
    totals.vat += line.vat;
    totals.inclusive += line.inclusive;
    return totals;
  }, { exclusive: 0, discount: 0, vat: 0, inclusive: 0 });

  const invoiceDiscount = Math.max(0, safeNumber(invoice.total_discount ?? invoice.discount_amount));
  const discount = invoice.total_discount != null ? safeNumber(invoice.total_discount) : calculated.discount + invoiceDiscount;
  const exclusive = invoice.total_exclusive != null ? safeNumber(invoice.total_exclusive) : calculated.exclusive;
  const vat = invoice.total_vat != null ? safeNumber(invoice.total_vat) : calculated.vat;
  const apiTotal = invoice.grand_total ?? invoice.total_amount ?? invoice.amount ?? invoice.subtotal;
  const inclusive = apiTotal != null ? safeNumber(apiTotal) : Math.max(0, calculated.inclusive - invoiceDiscount);
  return { exclusive, discount, vat, inclusive };
}

export function getInvoiceAmount(invoice: SalesInvoice): number {
  return getInvoiceTotals(invoice).inclusive;
}

export function sumOutstandingInvoices(invoices: SalesInvoice[]): number {
  const cents = invoices.reduce((total, invoice) => {
    if (invoice.status !== "posted" || invoice.payment_status !== "unpaid") return total;
    return total + Math.round(safeNumber(invoice.balance_due) * 100);
  }, 0);
  return cents / 100;
}

function compactAddress(parts: Array<string | null | undefined>) {
  return parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part));
}

export function getCustomerParty(invoice: SalesInvoice, customer?: Customer | null): InvoiceParty {
  const record = invoice.customer ?? customer;
  return {
    name: record?.name ?? invoice.customer_name ?? "Customer details unavailable",
    email: record?.email ?? invoice.customer_email ?? undefined,
    phone: record?.phone1,
    tin: record?.tax_identification_number,
    addressLines: compactAddress([
      record?.billing_address ?? invoice.customer_address,
      compactAddress([record?.city, record?.state, record?.postal_code]).join(", "),
      record?.country,
    ]),
  };
}

export function getSupplierParty(invoice: PurchaseInvoice, supplier?: Supplier | null): InvoiceParty {
  const record = invoice.supplier ?? supplier;
  return {
    name: record?.supplier_name ?? invoice.supplier_name ?? "Supplier details unavailable",
    email: record?.email ?? invoice.supplier_email ?? undefined,
    phone: record?.phone,
    tin: record?.tax_identification_number,
    addressLines: compactAddress([
      record?.address ?? invoice.supplier_address,
      compactAddress([record?.city, record?.state]).join(", "),
      record?.country,
    ]),
  };
}

export function getCompanyParty(company: Company | null, fallback?: {
  companyName?: string | null;
  email?: string | null;
  tin?: string | null;
  country?: string | null;
  logoUrl?: string | null;
}): InvoiceParty {
  const companyName = company?.company_name?.trim() || company?.trading_name?.trim() || fallback?.companyName?.trim();
  return {
    name: companyName || "Company details unavailable",
    email: company?.business_email ?? fallback?.email ?? undefined,
    phone: company?.business_phone,
    tin: company?.tax_identification_number ?? fallback?.tin ?? undefined,
    addressLines: compactAddress([
      company?.address,
      compactAddress([company?.city, company?.state, company?.postal_code]).join(", "),
      company?.country ?? fallback?.country,
    ]),
    logoUrl: company?.logo_url ?? fallback?.logoUrl,
  };
}
