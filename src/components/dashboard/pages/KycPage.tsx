"use client";

import { FormEvent, useEffect, useState } from "react";
import { Building2, CheckCircle2, Landmark, Save, ShieldCheck } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api/client";
import { getMe } from "@/lib/api/auth";
import { submitKyc } from "@/lib/api/companies";
import {
  BankDetailsData,
  BusinessDetailsData,
  getOnboardingState,
  saveOnboardingState,
} from "@/lib/onboarding-store";
import { Button, Card, ComplianceAlert, PageHeader, StatusBadge, notifyDashboard } from "../ui";

const inputClass = "h-11 w-full rounded-xl border border-[#C5C4DA] bg-white px-3 text-sm text-[#191C1E] outline-none transition placeholder:text-[#8D90A0] focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]";
const selectClass = `${inputClass} appearance-none`;
const textAreaClass = "min-h-24 w-full rounded-xl border border-[#C5C4DA] bg-white px-3 py-3 text-sm text-[#191C1E] outline-none transition placeholder:text-[#8D90A0] focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0 text-sm font-bold text-[#191C1E]">
      {label}
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-xs font-semibold text-red-600">{error}</p> : null}
    </label>
  );
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (checked: boolean) => void; label: string; description: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 rounded-xl bg-[#F1F4F8] p-4 text-left">
      <span>
        <span className="block text-sm font-bold text-[#191C1E]">{label}</span>
        <span className="mt-1 block text-xs text-[#454557]">{description}</span>
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[#1117E8]" : "bg-[#D7DAE2]"}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}

const businessTypes = ["Limited Liability Company", "Business Name", "Enterprise", "Partnership", "Non-profit", "Government"];
const industries = ["Technology", "Professional Services", "Retail", "Logistics", "Manufacturing", "Agriculture", "Financial Services", "Hospitality"];
const states = ["Lagos", "Abuja FCT", "Ogun", "Oyo", "Rivers", "Kano", "Kaduna", "Enugu", "Anambra", "Delta"];
const banks = ["Access Bank", "Zenith Bank", "GTBank", "First Bank", "UBA", "Stanbic IBTC", "Fidelity Bank", "Sterling Bank", "Wema Bank", "Opay"];
function validateBusiness(data: BusinessDetailsData) {
  const errors: Record<string, string> = {};
  (["businessName", "businessType", "industry", "taxId", "contactPerson", "businessEmail", "phoneNumber", "businessAddress", "city", "state", "country"] as Array<keyof BusinessDetailsData>).forEach((key) => {
    if (!String(data[key] ?? "").trim()) errors[key] = "Required";
  });
  if (data.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.businessEmail)) errors.businessEmail = "Enter a valid email";
  return errors;
}

function validateBank(data: BankDetailsData) {
  const errors: Record<string, string> = {};
  if (!data.bankName) errors.bankName = "Required";
  if (!/^\d{10}$/.test(data.accountNumber)) errors.accountNumber = "Use a 10 digit account number";
  if (!data.accountName.trim()) errors.accountName = "Required";
  if (!data.paymentMethod.trim()) errors.paymentMethod = "Required";
  return errors;
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center gap-3 border-b border-[#DCE0E8] pb-4">
        <span className="rounded-lg bg-[#DADEFD] p-2 text-[#0001B1]"><Icon className="h-5 w-5" /></span>
        <h2 className="text-base font-bold text-[#191C1E]">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

export function KycPage() {
  const [business, setBusiness] = useState<BusinessDetailsData>(getOnboardingState().businessDetails);
  const [bank, setBank] = useState<BankDetailsData>(getOnboardingState().bankDetails);
  const [businessErrors, setBusinessErrors] = useState<Record<string, string>>({});
  const [bankErrors, setBankErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const state = getOnboardingState();
    setBusiness({
      ...state.businessDetails,
      businessName: state.businessDetails.businessName || state.signup.companyName,
      tradingName: state.businessDetails.tradingName || state.signup.tradingName,
      businessEmail: state.businessDetails.businessEmail || state.signup.workEmail,
      phoneNumber: state.businessDetails.phoneNumber || state.signup.phoneNumber,
      contactPerson: state.businessDetails.contactPerson || `${state.signup.firstName} ${state.signup.lastName}`.trim(),
    });
    setBank(state.bankDetails);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextBusinessErrors = validateBusiness(business);
    const nextBankErrors = validateBank(bank);
    setBusinessErrors(nextBusinessErrors);
    setBankErrors(nextBankErrors);
    setApiError("");
    if (Object.keys(nextBusinessErrors).length || Object.keys(nextBankErrors).length) {
      notifyDashboard("Complete the required KYC fields before saving");
      return;
    }

    setSubmitting(true);
    saveOnboardingState({ businessDetails: business, bankDetails: bank });
    try {
      const me = await getMe();
      await submitKyc(me.data.company_id, {
        company_name: business.businessName,
        trading_name: business.tradingName || undefined,
        business_email: business.businessEmail,
        business_phone: business.phoneNumber,
        tax_identification_number: business.taxId,
        rc_number: business.taxId,
        business_type: business.businessType,
        address: business.businessAddress,
        city: business.city,
        state: business.state,
        country: business.country || "Nigeria",
        lga: business.lga || undefined,
        postal_code: business.postalCode || undefined,
      });
      notifyDashboard("KYC details saved successfully");
    } catch (error) {
      setApiError(getApiErrorMessage(error, "KYC details were saved locally, but could not sync to the API."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-7xl">
      <PageHeader
        title="KYC"
        subtitle="Complete business and bank details inside your dashboard. These details support invoice validation and FIRS/NRS submission preparation."
        action={<Button type="submit" disabled={submitting}><Save className="h-4 w-4" />{submitting ? "Saving..." : "Save KYC"}</Button>}
      />

      <ComplianceAlert title="KYC now lives in the dashboard" text="Signup no longer blocks users with onboarding. Complete or update your readiness profile here when your workspace details are available." tone="primary" badge="Dashboard KYC" />
      {apiError ? <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">{apiError}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <SectionCard icon={Building2} title="Business Details">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Business Name" error={businessErrors.businessName}><input className={inputClass} value={business.businessName} onChange={(event) => setBusiness({ ...business, businessName: event.target.value })} /></Field>
              <Field label="Trading Name"><input className={inputClass} value={business.tradingName} onChange={(event) => setBusiness({ ...business, tradingName: event.target.value })} /></Field>
              <Field label="Business Type" error={businessErrors.businessType}><select className={selectClass} value={business.businessType} onChange={(event) => setBusiness({ ...business, businessType: event.target.value })}>{businessTypes.map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="Industry" error={businessErrors.industry}><select className={selectClass} value={business.industry} onChange={(event) => setBusiness({ ...business, industry: event.target.value })}><option value="">Select industry</option>{industries.map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="TIN / RC Number" error={businessErrors.taxId}><input className={inputClass} value={business.taxId} onChange={(event) => setBusiness({ ...business, taxId: event.target.value })} placeholder="12345678-0001" /></Field>
              <Field label="Contact Person" error={businessErrors.contactPerson}><input className={inputClass} value={business.contactPerson} onChange={(event) => setBusiness({ ...business, contactPerson: event.target.value })} /></Field>
              <Field label="Business Email" error={businessErrors.businessEmail}><input className={inputClass} value={business.businessEmail} onChange={(event) => setBusiness({ ...business, businessEmail: event.target.value })} /></Field>
              <Field label="Phone Number" error={businessErrors.phoneNumber}><input className={inputClass} value={business.phoneNumber} onChange={(event) => setBusiness({ ...business, phoneNumber: event.target.value })} /></Field>
              <Field label="State" error={businessErrors.state}><select className={selectClass} value={business.state} onChange={(event) => setBusiness({ ...business, state: event.target.value })}>{states.map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="City" error={businessErrors.city}><input className={inputClass} value={business.city} onChange={(event) => setBusiness({ ...business, city: event.target.value })} /></Field>
              <Field label="LGA"><input className={inputClass} value={business.lga} onChange={(event) => setBusiness({ ...business, lga: event.target.value })} /></Field>
              <Field label="Postal Code"><input className={inputClass} value={business.postalCode} onChange={(event) => setBusiness({ ...business, postalCode: event.target.value })} /></Field>
              <Field label="Country" error={businessErrors.country}><input className={inputClass} value={business.country} onChange={(event) => setBusiness({ ...business, country: event.target.value })} /></Field>
              <div className="md:col-span-2"><Field label="Business Address" error={businessErrors.businessAddress}><textarea className={textAreaClass} value={business.businessAddress} onChange={(event) => setBusiness({ ...business, businessAddress: event.target.value })} /></Field></div>
            </div>
          </SectionCard>

          <SectionCard icon={Landmark} title="Bank Details">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Bank Name" error={bankErrors.bankName}><select className={selectClass} value={bank.bankName} onChange={(event) => setBank({ ...bank, bankName: event.target.value })}><option value="">Select bank</option>{banks.map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="Account Number" error={bankErrors.accountNumber}><input className={inputClass} value={bank.accountNumber} onChange={(event) => setBank({ ...bank, accountNumber: event.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="0123456789" /></Field>
              <Field label="Account Name" error={bankErrors.accountName}><input className={inputClass} value={bank.accountName} onChange={(event) => setBank({ ...bank, accountName: event.target.value })} /></Field>
              <Field label="Payment Method" error={bankErrors.paymentMethod}><input className={inputClass} value={bank.paymentMethod} onChange={(event) => setBank({ ...bank, paymentMethod: event.target.value })} /></Field>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Toggle checked={bank.generatePaymentLink} onChange={(checked) => setBank({ ...bank, generatePaymentLink: checked })} label="Generate payment links" description="Attach secure links to new invoices by default." />
              <Toggle checked={bank.displayBankDetails} onChange={(checked) => setBank({ ...bank, displayBankDetails: checked })} label="Display bank details" description="Show settlement details on invoice templates." />
            </div>
          </SectionCard>

        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[#DADEFD] p-3 text-[#0001B1]"><ShieldCheck className="h-5 w-5" /></span>
              <div>
                <h2 className="text-base font-bold">Readiness Summary</h2>
                <p className="text-xs text-[#454557]">Dashboard KYC profile</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              {[
                ["Workspace", business.businessName || "Not provided"],
                ["TIN / RC", business.taxId || "Not provided"],
                ["Bank", bank.bankName || "Not provided"],
                ["Payment", bank.paymentMethod || "Not provided"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-[#DCE0E8] pb-3">
                  <span className="text-[#757588]">{label}</span>
                  <span className="max-w-40 truncate text-right font-bold">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-green-50 p-3 text-sm font-bold text-green-700">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Saved locally</span>
              <StatusBadge tone="primary">Editable</StatusBadge>
            </div>
          </Card>
          <Button type="submit" className="w-full" disabled={submitting}><Save className="h-4 w-4" />{submitting ? "Saving..." : "Save KYC"}</Button>
        </aside>
      </div>
    </form>
  );
}
