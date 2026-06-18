"use client";

import { Company, Customer, SalesInvoice } from "@/types/api";
import {
  formatCurrency,
  formatInvoiceDate,
  getCompanyParty,
  getCustomerParty,
  getInvoiceLineTotals,
  getInvoiceTotals,
  InvoiceParty,
} from "@/lib/invoice-utils";

type FallbackCompany = {
  companyName?: string | null;
  email?: string | null;
  tin?: string | null;
  country?: string | null;
  logoUrl?: string | null;
};

export function InvoiceDocument({
  invoice,
  company,
  customer,
  recipient,
  fallbackCompany,
  id,
}: {
  invoice: SalesInvoice;
  company: Company | null;
  customer?: Customer | null;
  recipient?: InvoiceParty;
  fallbackCompany?: FallbackCompany;
  id?: string;
}) {
  const issuer = getCompanyParty(company, fallbackCompany);
  const billedParty = recipient ?? getCustomerParty(invoice, customer);
  const totals = getInvoiceTotals(invoice);

  return (
    <article id={id} className="invoice-document relative mx-auto min-h-[1060px] w-full max-w-[826px] overflow-hidden bg-white px-5 py-7 text-[13px] leading-[1.45] text-[#081936] sm:px-[72px] sm:py-7 lg:px-[102px]">
      <header className="grid gap-8 sm:grid-cols-[1fr_220px]">
        <div>
          <h1 className="text-[40px] font-black leading-none tracking-[0.02em] sm:text-[44px]">INVOICE</h1>
          <dl className="mt-4 space-y-0 text-[12px]">
            <div><dt className="inline font-bold">Invoice No: </dt><dd className="inline">{invoice.invoice_number}</dd></div>
            <div><dt className="inline font-bold">Date: </dt><dd className="inline">{formatInvoiceDate(invoice.issue_date)}</dd></div>
            <div><dt className="inline font-bold">Due Date: </dt><dd className="inline">{formatInvoiceDate(invoice.due_date)}</dd></div>
          </dl>
        </div>
        <div className="flex min-h-20 items-start justify-start sm:justify-end">
          {issuer.logoUrl ? <img src={issuer.logoUrl} alt={`${issuer.name} letterhead`} className="max-h-20 max-w-full object-contain object-right-top" /> : <div className="max-w-[210px] border-b-2 border-[#075CB6] pb-2 text-right text-base font-black">{issuer.name}</div>}
        </div>
      </header>

      <section className="mt-[58px] grid gap-8 sm:grid-cols-2 sm:gap-14">
        <PartyBlock label="FROM:" party={issuer} />
        <PartyBlock label="ISSUED TO:" party={billedParty} />
      </section>

      <div className="mt-10 overflow-x-auto sm:mt-[40px]">
        <table className="w-full min-w-[680px] border-collapse text-left sm:min-w-0">
          <thead className="bg-[#075CB6] text-[10px] uppercase leading-tight text-white">
            <tr>
              <th className="w-[34%] px-3 py-[13px]">Description</th>
              <th className="px-2 py-[13px] text-center">Quantity</th>
              <th className="px-2 py-[13px] text-right">Excl.<br />Price</th>
              <th className="px-2 py-[13px] text-right">Disc %</th>
              <th className="px-2 py-[13px] text-right">VAT %</th>
              <th className="px-2 py-[13px] text-right">Excl.<br />Total</th>
              <th className="px-2 py-[13px] text-right">Incl.<br />Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D6D9DF] text-[11px]">
            {(invoice.line_items ?? []).map((item, index) => {
              const line = getInvoiceLineTotals(item);
              return (
                <tr key={item.id ?? `${item.description}-${index}`}>
                  <td className="px-3 py-[11px] font-semibold">{item.description}</td>
                  <td className="px-2 py-[11px] text-center">{item.quantity}</td>
                  <td className="px-2 py-[11px] text-right">{formatCurrency(item.unit_price, invoice.currency)}</td>
                  <td className="px-2 py-[11px] text-right">{line.discountPercentage.toFixed(2)}%</td>
                  <td className="px-2 py-[11px] text-right">{Number(item.tax_rate ?? 0).toFixed(2)}%</td>
                  <td className="px-2 py-[11px] text-right">{formatCurrency(line.exclusive, invoice.currency)}</td>
                  <td className="px-2 py-[11px] text-right">{formatCurrency(line.inclusive, invoice.currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="ml-auto mt-[38px] w-full max-w-[205px] space-y-5 text-[12px]">
        <TotalRow label="Total Discount:" value={formatCurrency(totals.discount, invoice.currency)} />
        <TotalRow label="Total Exclusive:" value={formatCurrency(totals.exclusive, invoice.currency)} />
        <TotalRow label="Total VAT:" value={formatCurrency(totals.vat, invoice.currency)} />
      </section>

      <section className="mt-[52px] flex items-center justify-between gap-4 bg-[#E9E5DF] px-5 py-[14px] text-[15px] font-black">
        <span>SUBTOTAL</span>
        <span>TOTAL: {formatCurrency(totals.inclusive, invoice.currency)}</span>
      </section>

      {invoice.notes ? <section className="mt-8"><h2 className="font-black">NOTES</h2><p className="mt-2 whitespace-pre-wrap text-[#454557]">{invoice.notes}</p></section> : null}
      <footer className="invoice-document-footer absolute inset-x-0 bottom-0 h-[82px]" aria-hidden="true">
        <span className="absolute bottom-[36px] left-5 h-[3px] w-[45%] bg-[#075CB6] sm:left-[72px] lg:left-[102px]" />
        <span className="absolute bottom-0 right-5 h-[40px] w-[160px] bg-[#075CB6] sm:right-[70px]" />
        <span className="absolute bottom-[40px] right-[150px] h-0 w-0 border-l-[28px] border-r-[28px] border-t-[28px] border-l-transparent border-r-transparent border-t-[#E2B62E] sm:right-[200px]" />
        <span className="absolute bottom-0 right-[150px] h-0 w-0 border-b-[40px] border-l-[40px] border-b-[#075CB6] border-l-transparent sm:right-[200px]" />
      </footer>
    </article>
  );
}

function PartyBlock({ label, party }: { label: string; party: ReturnType<typeof getCustomerParty> }) {
  return (
    <div>
      <h2 className="font-black">{label}</h2>
      <p className="mt-2 font-bold uppercase leading-5">{party.name}</p>
      {party.tin ? <p>TIN: {party.tin}</p> : null}
      {party.email ? <p>{party.email}</p> : null}
      {party.phone ? <p>{party.phone}</p> : null}
      {party.addressLines.length ? <><p className="mt-1 font-semibold">Postage Address:</p>{party.addressLines.map((line) => <p key={line}>{line}</p>)}</> : <p className="mt-1 text-[#757588]">Address not provided</p>}
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-5"><span>{label}</span><span className="font-semibold">{value}</span></div>;
}
