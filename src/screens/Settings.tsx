import { useEffect, useState } from "react";
import type React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Receipt,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/AppPrimitives";
import {
  getSettings,
  updateSettings,
  uploadLogo,
  type BusinessSettings,
} from "@/services/settingsService";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currency";

const emptySettings: BusinessSettings = {
  businessName: "",
  email: "",
  phone: "",
  address: "",
  taxId: "",
  logo: "",
  defaultTaxRate: 7.5,
  paymentTerms: 30,
  invoicePrefix: "INV",
  receiptPrefix: "RCP",
  invoiceNotes: "",
  footerNote: "",
};

export default function Settings() {
  const [settings, setSettings] = useState<BusinessSettings>(emptySettings);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getSettings();
    setSettings({ ...emptySettings, ...data });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSettings(settings);
      toast({
        title: "Settings saved",
        description: "Your business settings have been updated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const logoUrl = await uploadLogo(file);
      setSettings({ ...settings, logo: logoUrl });
      toast({
        title: "Logo uploaded",
        description: "Preview updated. Save settings to persist it.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to upload logo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="app-section">
      <PageHeader
        eyebrow="Workspace settings"
        title="Settings"
        description="Configure your business profile, invoice defaults, tax details, and document footer messaging."
        action={
          <Button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary/90">
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <SettingsCard
            icon={Building2}
            title="Business Profile"
            description="These details appear on document previews and customer-facing records."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field icon={Building2} label="Business Name" id="businessName">
                <Input
                  id="businessName"
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  placeholder="Your Business Name"
                />
              </Field>
              <Field icon={Mail} label="Email" id="email">
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="business@example.com"
                />
              </Field>
              <Field icon={Phone} label="Phone" id="phone">
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                />
              </Field>
              <Field icon={ShieldCheck} label="TIN" id="taxId">
                <Input
                  id="taxId"
                  value={settings.taxId}
                  onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
                  placeholder="Enter your Tax Identification Number"
                />
              </Field>
            </div>
            <Field icon={MapPin} label="Address" id="address">
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Business address"
                rows={3}
              />
            </Field>
          </SettingsCard>

          <SettingsCard
            icon={Upload}
            title="Logo Upload"
            description="Upload a business logo for document headers."
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {settings.logo ? (
                <div className="relative h-24 w-24 rounded-2xl border border-slate-200 bg-white p-2">
                  <img src={settings.logo} alt="Logo" className="h-full w-full object-contain" />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute -right-2 -top-2 h-7 w-7 rounded-full"
                    onClick={() => setSettings({ ...settings, logo: "" })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                  <Upload className="h-6 w-6" />
                </div>
              )}
              <div>
                <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <Button variant="outline" onClick={() => document.getElementById("logo")?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </Button>
                <p className="mt-2 text-sm text-slate-500">
                  PNG, JPG, or SVG work best on invoice previews.
                </p>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            icon={FileText}
            title="Invoice Defaults"
            description="Set default document prefixes, payment terms, tax rate, and notes."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field icon={FileText} label="Invoice Prefix" id="invoicePrefix">
                <Input
                  id="invoicePrefix"
                  value={settings.invoicePrefix || ""}
                  onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                  placeholder="INV"
                />
              </Field>
              <Field icon={Receipt} label="Receipt Prefix" id="receiptPrefix">
                <Input
                  id="receiptPrefix"
                  value={settings.receiptPrefix || ""}
                  onChange={(e) => setSettings({ ...settings, receiptPrefix: e.target.value })}
                  placeholder="RCP"
                />
              </Field>
              <Field icon={ShieldCheck} label="Default Tax Rate (%)" id="taxRate">
                <Input
                  id="taxRate"
                  type="number"
                  step="0.1"
                  value={settings.defaultTaxRate}
                  onChange={(e) => setSettings({ ...settings, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                />
              </Field>
              <Field icon={Receipt} label="Payment Terms (Days)" id="paymentTerms">
                <Input
                  id="paymentTerms"
                  type="number"
                  value={settings.paymentTerms}
                  onChange={(e) => setSettings({ ...settings, paymentTerms: parseInt(e.target.value) || 0 })}
                />
              </Field>
            </div>
            <Field icon={FileText} label="Default Invoice Note" id="invoiceNotes">
              <Textarea
                id="invoiceNotes"
                value={settings.invoiceNotes}
                onChange={(e) => setSettings({ ...settings, invoiceNotes: e.target.value })}
                rows={3}
              />
            </Field>
          </SettingsCard>

          <SettingsCard
            icon={ShieldCheck}
            title="Compliance / Footer Message"
            description="Configure tax and footer messaging used in document previews."
          >
            <Textarea
              value={settings.footerNote || ""}
              onChange={(e) => setSettings({ ...settings, footerNote: e.target.value })}
              placeholder="This document was generated with Paytraka Invoice Nexus."
              rows={4}
            />
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
              Current UI includes FIRS-ready footer messaging and QR-code areas.
              Production compliance validation is still a backend/process concern.
            </div>
          </SettingsCard>
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-sm font-medium text-primary">Live mini preview</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950">
                Invoice Preview
              </h3>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {settings.logo ? (
                    <img src={settings.logo} alt="Business logo" className="mb-3 h-12 w-12 object-contain" />
                  ) : (
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                      <FileText className="h-5 w-5" />
                    </div>
                  )}
                  <p className="font-semibold text-slate-950">
                    {settings.businessName || "Your Business Name"}
                  </p>
                  <p className="text-xs text-slate-500">{settings.email || "business@example.com"}</p>
                  <p className="text-xs text-slate-500">{settings.phone || "+234 800 000 0000"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Invoice</p>
                  <p className="font-semibold text-slate-950">
                    {(settings.invoicePrefix || "INV")}-2026-001
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium">{formatCurrency(250000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">VAT ({settings.defaultTaxRate}%)</span>
                  <span className="font-medium">{formatCurrency((250000 * settings.defaultTaxRate) / 100)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(250000 + (250000 * settings.defaultTaxRate) / 100)}</span>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-white p-3 text-xs leading-5 text-slate-500">
                {settings.invoiceNotes || "Thank you for your business."}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-primary">
                <ShieldCheck className="h-4 w-4" />
                FIRS-ready footer and QR-code area
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-950">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  icon: Icon,
  label,
  id,
  children,
}: {
  icon: LucideIcon;
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Icon className="h-4 w-4 text-slate-400" />
        {label}
      </Label>
      {children}
    </div>
  );
}
