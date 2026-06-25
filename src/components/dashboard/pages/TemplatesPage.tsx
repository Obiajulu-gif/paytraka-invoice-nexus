"use client";

import { Eye, Globe2, Mail, Palette, Phone, Printer, Save } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { Button, Card, PageHeader, notifyDashboard } from "../ui";

const sampleItems = [
  {
    name: "Professional Consulting Service",
    description: "Implementation support and monthly advisory retainer",
    quantity: 1,
    price: 150000,
    discount: 0,
    vat: 7.5,
  },
];

function money(value: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function TemplatesPage() {
  const { user } = useAuth();
  const { company } = useCompany(user?.company_id);
  const [brandColor, setBrandColor] = useState("#075CBD");
  const [footerNote, setFooterNote] = useState("Thank you for your business.");
  const [showTin, setShowTin] = useState(true);
  const [showVat, setShowVat] = useState(true);
  const [showPaymentDetails, setShowPaymentDetails] = useState(true);

  const companyName =
    company?.company_name ||
    user?.company_name ||
    user?.trading_name ||
    "Your Company Limited";
  const subtotal = sampleItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );
  const discount = sampleItems.reduce(
    (sum, item) => sum + item.quantity * item.price * (item.discount / 100),
    0,
  );
  const exclusive = subtotal - discount;
  const vat = showVat
    ? sampleItems.reduce(
        (sum, item) =>
          sum +
          item.quantity *
            item.price *
            (1 - item.discount / 100) *
            (item.vat / 100),
        0,
      )
    : 0;
  const total = exclusive + vat;
  const irn = "IRN-2026-0004"; // Sample IRN for demonstration

  return (
    <>
      <PageHeader
        title="Invoice Template"
        subtitle="Configure the professional invoice layout used for customer documents."
        action={
          <>
            <Button
              variant="secondary"
              onClick={() => window.print()}
              className="print:hidden"
            >
              <Printer className="h-4 w-4" /> Print Preview
            </Button>
            <Button
              onClick={() =>
                notifyDashboard("Professional Letterhead template saved")
              }
            >
              <Save className="h-4 w-4" /> Save Template
            </Button>
          </>
        }
      />

      <div className="grid min-w-0 gap-6 2xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-5 print:hidden">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[#DADEFD] p-3 text-[#0001B1]">
                <Eye className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold">Professional Letterhead</p>
                <p className="text-xs text-[#757588]">Default invoice layout</p>
              </div>
            </div>
            <div className="mt-5 overflow-hidden rounded-xl border border-[#C5C4DA] bg-white p-3">
              <div className="h-3 w-20 bg-[#071B37]" />
              <div
                className="mt-5 h-5 w-full"
                style={{ backgroundColor: brandColor }}
              />
              <div className="mt-3 space-y-1">
                <div className="h-1.5 w-full bg-[#E5E7EB]" />
                <div className="h-1.5 w-full bg-[#E5E7EB]" />
                <div className="h-1.5 w-2/3 bg-[#E5E7EB]" />
              </div>
              <div className="mt-6 h-8 bg-[#EEEAE2]" />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-bold">
              <Palette className="h-5 w-5 text-[#1117E8]" /> Branding
            </h2>
            <label className="mt-5 block text-sm font-bold text-[#454557]">
              Table and accent color
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#C5C4DA] bg-white p-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(event) => setBrandColor(event.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent"
                />
                <input
                  value={brandColor}
                  onChange={(event) => setBrandColor(event.target.value)}
                  className="h-9 min-w-0 flex-1 rounded-lg px-2 text-sm uppercase outline-none"
                />
              </div>
            </label>
            <label className="mt-4 block text-sm font-bold text-[#454557]">
              Footer note
              <textarea
                value={footerNote}
                onChange={(event) => setFooterNote(event.target.value)}
                rows={3}
                className="mt-2 w-full resize-y rounded-xl border border-[#C5C4DA] bg-white px-3 py-3 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]"
              />
            </label>
            <div className="mt-5 space-y-3">
              <TemplateToggle
                label="Display company TIN"
                checked={showTin}
                onChange={setShowTin}
              />
              <TemplateToggle
                label="Show VAT breakdown"
                checked={showVat}
                onChange={setShowVat}
              />
              <TemplateToggle
                label="Show payment details"
                checked={showPaymentDetails}
                onChange={setShowPaymentDetails}
              />
            </div>
          </Card>
        </aside>

        <Card className="overflow-hidden bg-[#E9EDF2] p-2 sm:p-5 lg:p-8 print:border-0 print:bg-white print:p-0">
          <InvoiceDocument
            companyName={companyName}
            logoUrl={user?.logo_url}
            tin={company?.tax_identification_number}
            brandColor={brandColor}
            footerNote={footerNote}
            showTin={showTin}
            showVat={showVat}
            showPaymentDetails={showPaymentDetails}
            subtotal={subtotal}
            discount={discount}
            exclusive={exclusive}
            vat={vat}
            total={total}
            irn={irn}
          />
        </Card>
      </div>
    </>
  );
}

function TemplateToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-[#F7F9FB] px-3 py-3 text-sm font-semibold">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-[#1117E8]"
      />
    </label>
  );
}

function InvoiceDocument({
  companyName,
  logoUrl,
  tin,
  brandColor,
  footerNote,
  showTin,
  showVat,
  showPaymentDetails,
  subtotal,
  discount,
  exclusive,
  vat,
  total,
  irn,
}: {
  companyName: string;
  logoUrl?: string | null;
  tin?: string;
  brandColor: string;
  footerNote: string;
  showTin: boolean;
  showVat: boolean;
  showPaymentDetails: boolean;
  subtotal: number;
  discount: number;
  exclusive: number;
  vat: number;
  total: number;
  irn?: string;
}) {
  return (
    <article
      id="invoice-template-preview"
      className="mx-auto min-h-[900px] w-full max-w-[900px] overflow-hidden bg-white px-5 py-8 text-[#081A33] shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-9 sm:py-10 lg:min-h-[1120px] lg:px-14 lg:py-12 print:min-h-0 print:max-w-none print:shadow-none"
    >
      <header className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-start">
        <div>
          <h1 className="text-4xl font-black tracking-[0.03em] sm:text-5xl">
            INVOICE
          </h1>
          <div className="mt-4 space-y-1 text-xs font-semibold sm:text-sm">
            <p>
              <b>Invoice No:</b> INV-2026-0004
            </p>
            <p>
              <b>Date:</b> 20-06-2026
            </p>
            <p>
              <b>IRN:</b> ${irn}
            </p>
            <p>
              <b>Due Date:</b> 04-07-2026
            </p>
          </div>
        </div>
        <div className="flex min-h-20 items-center justify-start sm:justify-end">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${companyName} letterhead`}
              width={190}
              height={72}
              className="max-h-20 w-auto object-contain"
            />
          ) : (
            <div className="text-left sm:text-right">
              <p className="text-xl font-black uppercase leading-tight">
                {companyName}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#66728A]">
                Company Letterhead
              </p>
            </div>
          )}
        </div>
      </header>

      <section className="mt-14 grid gap-8 text-sm sm:grid-cols-2 lg:mt-20">
        <div>
          <p className="text-xs font-black uppercase tracking-wide">From:</p>
          <h2 className="mt-2 font-black uppercase">{companyName}</h2>
          {showTin ? (
            <p className="mt-1">TIN: {tin || "31834758-0001"}</p>
          ) : null}
          <p className="mt-1 font-semibold">Postage Address:</p>
          <p className="mt-1 max-w-xs leading-6">
            18, Bolaji Akinloye Street, Road 4
            <br />
            Lekki County Homes, Ikota, Lekki
            <br />
            Lagos, Nigeria
          </p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wide">
            Issued To:
          </p>
          <h2 className="mt-2 font-black">Ade Okafor</h2>
          <p className="mt-1 font-semibold">Postage Address:</p>
          <p className="mt-1 leading-6">
            24 Admiralty Way
            <br />
            Lekki Phase 1, Lagos
          </p>
        </div>
      </section>

      <section className="mt-12 overflow-x-auto lg:mt-16">
        <table className="w-full min-w-[690px] border-collapse text-left text-[11px] sm:text-xs">
          <thead className="text-white" style={{ backgroundColor: brandColor }}>
            <tr>
              <th className="px-3 py-4 font-black">DESCRIPTION</th>
              <th className="px-3 py-4 text-center font-black">QUANTITY</th>
              <th className="px-3 py-4 text-right font-black">
                EXCL.
                <br />
                PRICE
              </th>
              <th className="px-3 py-4 text-right font-black">DISC %</th>
              <th className="px-3 py-4 text-right font-black">VAT %</th>
              <th className="px-3 py-4 text-right font-black">
                EXCL.
                <br />
                TOTAL
              </th>
              <th className="px-3 py-4 text-right font-black">
                INCL.
                <br />
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleItems.map((item) => {
              const base = item.quantity * item.price;
              const exclusiveTotal = base * (1 - item.discount / 100);
              const inclusiveTotal =
                exclusiveTotal * (1 + (showVat ? item.vat : 0) / 100);
              return (
                <tr
                  key={item.description}
                  className="border-b border-[#DCE0E8]"
                >
                  <td className="px-3 py-4">
                    <p className="font-bold">{item.name}</p>
                    {item.description && item.description !== item.name ? (
                      <p className="mt-1 text-[10px] leading-4 text-[#66728A] sm:text-[11px]">
                        {item.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-4 text-center">{item.quantity}</td>
                  <td className="px-3 py-4 text-right">{money(item.price)}</td>
                  <td className="px-3 py-4 text-right">
                    {item.discount.toFixed(2)}%
                  </td>
                  <td className="px-3 py-4 text-right">
                    {(showVat ? item.vat : 0).toFixed(2)}%
                  </td>
                  <td className="px-3 py-4 text-right">
                    {money(exclusiveTotal)}
                  </td>
                  <td className="px-3 py-4 text-right font-bold">
                    {money(inclusiveTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="mt-8 ml-auto w-full max-w-xs space-y-4 text-xs sm:text-sm">
        <div className="flex justify-between gap-4">
          <span>Total Discount:</span>
          <b>{money(discount)}</b>
        </div>
        <div className="flex justify-between gap-4">
          <span>Total Exclusive:</span>
          <b>{money(exclusive)}</b>
        </div>
        {showVat ? (
          <div className="flex justify-between gap-4">
            <span>Total VAT:</span>
            <b>{money(vat)}</b>
          </div>
        ) : null}
      </section>

      <section className="mt-10 flex items-center justify-between gap-5 bg-[#EEEAE2] px-5 py-5 text-sm font-black sm:text-base">
        <span>SUBTOTAL</span>
        <span>TOTAL: {money(total)}</span>
      </section>

      <div className="min-h-44 lg:min-h-56" />

      <footer>
        {showPaymentDetails ? (
          <div className="mb-8 rounded-xl border border-[#DCE0E8] bg-[#F8FAFC] p-4 text-xs">
            <p className="font-black">Payment Details</p>
            <p className="mt-2">
              Bank Transfer · Account details configured in company settings.
            </p>
            <p className="mt-1 text-[#66728A]">{footerNote}</p>
          </div>
        ) : null}
        <div
          className="relative overflow-hidden border-t-[3px] pt-5"
          style={{ borderColor: brandColor }}
        >
          <div className="flex flex-col gap-3 pr-0 text-[9px] text-[#66728A] sm:flex-row sm:items-center sm:gap-4 sm:pr-36">
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3 text-red-700" /> +234 705 203 4019
            </span>
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" /> info@company.com
            </span>
            <span className="inline-flex items-center gap-1">
              <Globe2 className="h-3 w-3 text-cyan-600" /> www.company.com
            </span>
          </div>
          <div
            className="mt-5 h-14 sm:absolute sm:-bottom-5 sm:right-0 sm:mt-0 sm:w-32"
            style={{ backgroundColor: brandColor }}
          >
            <div className="h-full w-14 -skew-x-[40deg] bg-amber-400" />
          </div>
        </div>
        <p className="mt-4 text-center text-[9px] text-[#A0A6B0]">
          This document was generated from PayTraka.
        </p>
      </footer>
    </article>
  );
}
