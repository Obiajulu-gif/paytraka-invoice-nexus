"use client";

import { Bell, Building2, CheckCircle2, Lock, Palette, Settings as SettingsIcon, UserCog } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { StatusBadge as ApiStatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { useFirs } from "@/hooks/useFirs";
import { PreferencesData, getOnboardingState, saveOnboardingState } from "@/lib/onboarding-store";
import { Button, Card, CheckLine, Input, PageHeader, StatusBadge, notifyDashboard } from "../ui";

const settingsItems = [
  { label: "Company Profile", slug: "", icon: Building2 },
  { label: "Preferences", slug: "preferences", icon: Palette },
  { label: "Compliance", slug: "compliance", icon: SettingsIcon },
  { label: "Users & Roles", slug: "users", icon: UserCog },
  { label: "Notifications", slug: "notifications", icon: Bell },
  { label: "Security", slug: "security", icon: Lock },
];

const inputClass = "h-11 w-full rounded-xl border border-[#C5C4DA] bg-white px-3 text-sm text-[#191C1E] outline-none transition focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]";
const templates = ["Classic", "Modern", "Minimal", "Bold Cards"];
const colors = ["Blue", "Purple", "Green", "Orange", "Slate"];

function currentSettingsSlug(pathname: string) {
  const slug = pathname.replace(/^\/dashboard\/settings\/?/, "");
  return slug === "/dashboard/settings" || slug === pathname ? "" : slug.split("/")[0] ?? "";
}

function SettingsNav({ activeSlug }: { activeSlug: string }) {
  return (
    <Card className="p-4">
      <nav className="space-y-2" aria-label="Settings sections">
        {settingsItems.map(({ label, slug, icon: Icon }) => {
          const active = activeSlug === slug || (!activeSlug && !slug);
          const href = slug ? `/dashboard/settings/${slug}` : "/dashboard/settings";
          return (
            <Link key={label} href={href} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold ${active ? "bg-[#DADEFD] text-[#0001B1]" : "text-[#454557] hover:bg-[#F1F4F8]"}`}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </Card>
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

function CompanyProfileSettings() {
  const { user } = useAuth();
  const { company } = useCompany(user?.company_id);

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold">Company Profile</h2>
        {company?.public_id ? <ApiStatusBadge status="live" label={`Company ID ${company.public_id}`} /> : null}
        {company?.status ? <ApiStatusBadge status={company.status} /> : user?.company_status ? <ApiStatusBadge status={user.company_status} /> : null}
        {company?.mode ? <ApiStatusBadge status={company.mode} /> : null}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Input label="Company Name" value={company?.company_name ?? ""} />
        <Input label="Trading Name" value={company?.trading_name ?? ""} />
        <Input label="Business Email" value={company?.business_email ?? user?.email ?? ""} />
        <Input label="Tax Identification Number" value={company?.tax_identification_number ?? user?.tax_identification_number ?? ""} />
        <Input label="RC Number / BN Number" value={company?.rc_number ?? ""} />
        <Input label="Country" value={user?.country ?? "Nigeria"} />
      </div>
    </Card>
  );
}

function PreferencesSettings() {
  const [preferences, setPreferences] = useState<PreferencesData>(getOnboardingState().preferences);
  const [generatePaymentLink, setGeneratePaymentLink] = useState(false);
  const [displayBankDetails, setDisplayBankDetails] = useState(true);

  useEffect(() => {
    const state = getOnboardingState();
    setPreferences(state.preferences);
    setGeneratePaymentLink(state.bankDetails.generatePaymentLink);
    setDisplayBankDetails(state.bankDetails.displayBankDetails);
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    saveOnboardingState({
      preferences,
      bankDetails: { generatePaymentLink, displayBankDetails },
    });
    notifyDashboard("Preferences saved");
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-[#DADEFD] p-2 text-[#0001B1]"><Palette className="h-5 w-5" /></span>
          <div>
            <h2 className="text-xl font-bold">Preferences</h2>
            <p className="mt-1 text-sm text-[#454557]">Control invoice defaults, branding, and payment display behavior.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-bold text-[#191C1E]">Brand Accent Color
            <select className={`${inputClass} mt-2`} value={preferences.accentColor} onChange={(event) => setPreferences({ ...preferences, accentColor: event.target.value })}>{colors.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
          <label className="block text-sm font-bold text-[#191C1E]">Default Invoice Template
            <select className={`${inputClass} mt-2`} value={preferences.invoiceTemplate} onChange={(event) => setPreferences({ ...preferences, invoiceTemplate: event.target.value })}>{templates.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Toggle checked={generatePaymentLink} onChange={setGeneratePaymentLink} label="Generate payment links" description="Attach secure links to new invoices by default." />
          <Toggle checked={displayBankDetails} onChange={setDisplayBankDetails} label="Display bank details" description="Show settlement details on invoice templates." />
        </div>
        <label className="mt-5 flex items-start gap-3 rounded-xl bg-[#F1F4F8] p-4 text-sm font-semibold text-[#454557]">
          <input type="checkbox" checked={preferences.confirmedAccuracy} onChange={(event) => setPreferences({ ...preferences, confirmedAccuracy: event.target.checked })} className="mt-1 h-4 w-4 rounded border-[#C5C4DA]" />
          I confirm these preference defaults are accurate for invoice creation and customer-facing documents.
        </label>
      </Card>
      <div className="flex justify-end">
        <Button type="submit">Save Preferences</Button>
      </div>
    </form>
  );
}

function ComplianceSettings() {
  const { user } = useAuth();
  const { company } = useCompany(user?.company_id);
  const { health } = useFirs();

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold">Compliance Preferences</h2>
        <ApiStatusBadge status={user?.firs_enabled === 1 || company?.firs_enabled === 1 ? "live" : "demo"} label={user?.firs_enabled === 1 || company?.firs_enabled === 1 ? "FIRS enabled" : "FIRS disabled"} />
        {health?.status ? <ApiStatusBadge status={health.status} label={`FIRS health: ${health.status}`} /> : null}
      </div>
      <CheckLine label="Require TIN before FIRS/NRS submission" />
      <CheckLine label="Enable APP/SI pathway readiness checks" />
      <CheckLine label="Send validation failure alerts" />
      <div className="mt-5 flex justify-end"><Button onClick={() => notifyDashboard("Compliance settings saved")}>Save Compliance</Button></div>
    </Card>
  );
}

function UsersSettings() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold">Users & Roles</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-[#F1F4F8] text-xs uppercase text-[#454557]"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead>
          <tbody className="divide-y divide-[#DCE0E8]">
            {["Finance Admin", "Compliance Officer", "Sales Operator"].map((name, index) => (
              <tr key={name}><td className="px-4 py-4 font-bold">{name}</td><td className="px-4 py-4">{index === 0 ? "Owner" : index === 1 ? "Compliance" : "Sales"}</td><td className="px-4 py-4"><StatusBadge>{index === 2 ? "Invited" : "Active"}</StatusBadge></td><td className="px-4 py-4"><Button variant="secondary" className="min-h-9 px-3" onClick={() => notifyDashboard(`${name} role editor opened`)}>Manage</Button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function NotificationsSettings() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold">Notifications</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <CheckLine label="Email me when an invoice is sent" />
        <CheckLine label="Alert me when validation fails" />
        <CheckLine label="Notify finance team on payment receipt" />
        <CheckLine label="Weekly compliance digest" />
      </div>
      <div className="mt-5 flex justify-end"><Button onClick={() => notifyDashboard("Notification settings saved")}>Save Notifications</Button></div>
    </Card>
  );
}

function SecuritySettings() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold">Security</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Input label="Current Password" />
        <Input label="New Password" />
        <Input label="Confirm New Password" />
        <label className="flex items-center gap-3 rounded-xl bg-[#F1F4F8] p-4 text-sm font-bold text-[#454557]"><input type="checkbox" defaultChecked className="h-4 w-4 accent-[#1117E8]" /> Require two-step approval for live submissions</label>
      </div>
      <div className="mt-5 flex justify-end"><Button onClick={() => notifyDashboard("Security settings saved")}>Update Security</Button></div>
    </Card>
  );
}

export function SettingsPage() {
  const pathname = usePathname();
  const activeSlug = currentSettingsSlug(pathname);

  const title = settingsItems.find((item) => item.slug === activeSlug)?.label ?? "Company Profile";
  const content = {
    "": <CompanyProfileSettings />,
    preferences: <PreferencesSettings />,
    compliance: <ComplianceSettings />,
    users: <UsersSettings />,
    notifications: <NotificationsSettings />,
    security: <SecuritySettings />,
  }[activeSlug] ?? <CompanyProfileSettings />;

  return (
    <>
      <PageHeader title="Settings" subtitle={`Manage ${title.toLowerCase()} for your PayTraka workspace.`} action={<Button onClick={() => notifyDashboard(`${title} settings saved`)}><CheckCircle2 className="h-4 w-4" /> Save Changes</Button>} />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <SettingsNav activeSlug={activeSlug} />
        <div className="min-w-0">{content}</div>
      </div>
    </>
  );
}
