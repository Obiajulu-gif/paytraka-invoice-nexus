import { useEffect, useMemo, useState } from "react";
import { Download, Printer, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InvoiceStatusBadge } from "@/components/AppPrimitives";
import type { Invoice } from "@/services/invoicesService";
import { getSettings, type BusinessSettings } from "@/services/settingsService";
import { formatCurrency } from "@/utils/currency";
import { generateInvoicePDF } from "@/utils/pdfGenerator";

interface InvoiceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export function InvoiceViewDialog({
  open,
  onOpenChange,
  invoice,
}: InvoiceViewDialogProps) {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await getSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  const irn = useMemo(() => {
    if (!invoice) return "";
    const hash = `${invoice.id}${invoice.invoiceNumber}`.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    return `${invoice.invoiceNumber.replace(/[^A-Z0-9]/g, "")}-${hash.slice(0, 8)}-${invoice.date.replace(/-/g, "")}`;
  }, [invoice]);

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto bg-slate-50 p-0">
        <DialogHeader className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <DialogTitle className="text-xl text-slate-950">
                Invoice Preview
              </DialogTitle>
              <p className="text-sm text-slate-500">{invoice.invoiceNumber}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => generateInvoicePDF(invoice)}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-6">
          <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                {settings?.logo ? (
                  <img src={settings.logo} alt="Business logo" className="mb-4 h-16 w-16 object-contain" />
                ) : (
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                )}
                <h2 className="text-2xl font-semibold text-slate-950">
                  {settings?.businessName || "Business Name"}
                </h2>
                <div className="mt-2 space-y-1 text-sm text-slate-500">
                  <p>{settings?.email || "business@example.com"}</p>
                  <p>{settings?.phone || "+234 800 000 0000"}</p>
                  <p>{settings?.address || "Lagos, Nigeria"}</p>
                  {settings?.taxId && <p>TIN: {settings.taxId}</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-right">
                <p className="text-sm font-medium uppercase tracking-wide text-primary">
                  Invoice
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {invoice.invoiceNumber}
                </p>
                <div className="mt-3 flex justify-end">
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                <div className="mt-4 space-y-1 text-sm text-slate-500">
                  <p>Issue date: {invoice.date}</p>
                  <p>Due date: {invoice.dueDate}</p>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="grid gap-5 md:grid-cols-[1fr_220px]">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Bill to
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">
                  {invoice.customerName}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{invoice.customerEmail}</p>
                <p className="mt-1 text-sm text-slate-500">{invoice.customerAddress}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 text-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(irn)}`}
                  alt="Invoice QR Code"
                  className="mx-auto h-28 w-28 rounded-lg"
                />
                <p className="mt-3 break-all font-mono text-[10px] text-slate-500">
                  IRN: {irn}
                </p>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3 text-left font-medium">Item</th>
                    <th className="p-3 text-right font-medium">Qty</th>
                    <th className="p-3 text-right font-medium">Unit Price</th>
                    <th className="p-3 text-right font-medium">Tax</th>
                    <th className="p-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200">
                      <td className="p-3 font-medium text-slate-950">{item.productName}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-3 text-right">{item.taxRate}%</td>
                      <td className="p-3 text-right font-semibold">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end">
              <div className="w-full max-w-sm rounded-2xl bg-slate-50 p-5">
                <TotalRow label="Subtotal" value={formatCurrency(invoice.subtotal)} />
                <TotalRow label="Tax" value={formatCurrency(invoice.taxAmount)} />
                {invoice.discount > 0 && (
                  <TotalRow label="Discount" value={`-${formatCurrency(invoice.discount)}`} tone="success" />
                )}
                {invoice.deliveryFee > 0 && (
                  <TotalRow label="Delivery fee" value={formatCurrency(invoice.deliveryFee)} />
                )}
                <Separator className="my-3" />
                <div className="flex items-center justify-between text-lg font-semibold text-slate-950">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            {(invoice.notes || settings?.invoiceNotes) && (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notes
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {invoice.notes || settings?.invoiceNotes}
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm font-medium text-primary">
              <ShieldCheck className="h-4 w-4" />
              FIRS-ready document footer and QR-code reference
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TotalRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div className="mb-2 flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={tone === "success" ? "font-medium text-primary" : "font-medium text-slate-900"}>
        {value}
      </span>
    </div>
  );
}
