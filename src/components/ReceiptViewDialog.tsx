import { useEffect, useMemo, useState } from "react";
import { Download, Printer, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Receipt } from "@/services/receiptsService";
import { getSettings, type BusinessSettings } from "@/services/settingsService";
import { formatCurrency } from "@/utils/currency";
import { generateReceiptPDF } from "@/utils/pdfGenerator";

interface ReceiptViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: Receipt | null;
}

const methodLabels: Record<Receipt["paymentMethod"], string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  card: "Card",
  mobile_money: "Mobile Money",
};

export function ReceiptViewDialog({
  open,
  onOpenChange,
  receipt,
}: ReceiptViewDialogProps) {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await getSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  const irn = useMemo(() => {
    if (!receipt) return "";
    const hash = `${receipt.id}${receipt.receiptNumber}`.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    return `${receipt.receiptNumber.replace(/[^A-Z0-9]/g, "")}-${hash.slice(0, 8)}-${receipt.paymentDate.replace(/-/g, "")}`;
  }, [receipt]);

  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto bg-slate-50 p-0">
        <DialogHeader className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <DialogTitle className="text-xl text-slate-950">
                Receipt Preview
              </DialogTitle>
              <p className="text-sm text-slate-500">{receipt.receiptNumber}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => generateReceiptPDF(receipt)}>
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
          <div className="mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
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
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-right">
                <p className="text-sm font-medium uppercase tracking-wide text-primary">
                  Receipt
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {receipt.receiptNumber}
                </p>
                <p className="mt-3 text-sm text-primary">Payment recorded</p>
                <p className="mt-1 text-sm text-slate-500">{receipt.paymentDate}</p>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="grid gap-5 md:grid-cols-[1fr_190px]">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payment from
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">
                  {receipt.customerName}
                </h3>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <Info label="Linked invoice" value={receipt.invoiceNumber} />
                  <Info label="Payment method" value={methodLabels[receipt.paymentMethod]} />
                  <Info label="Payment date" value={receipt.paymentDate} />
                  <Info label="Receipt number" value={receipt.receiptNumber} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 text-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(irn)}`}
                  alt="Receipt QR Code"
                  className="mx-auto h-28 w-28 rounded-lg"
                />
                <p className="mt-3 break-all font-mono text-[10px] text-slate-500">
                  IRN: {irn}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-primary p-6 text-center text-white">
              <p className="text-sm text-slate-300">Amount Paid</p>
              <p className="mt-2 text-4xl font-semibold">
                {formatCurrency(receipt.amount)}
              </p>
            </div>

            {receipt.notes && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notes
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {receipt.notes}
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm font-medium text-primary">
              <ShieldCheck className="h-4 w-4" />
              FIRS-ready receipt footer and QR-code reference
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-950">{value}</p>
    </div>
  );
}
