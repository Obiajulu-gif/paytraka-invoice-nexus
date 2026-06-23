"use client";

import {
  Building2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getMe, login } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  getCompanyMode,
  updateCompanyInformation,
  updateCompanyMode,
  updateFirsSettings,
} from "@/lib/api/companies";
import { AuthUser } from "@/types/api";
import nigeriaStates from "nigeria-states-lgas/src/statesAndLocalGov.json";
import {
  Button,
  Card,
  LoadingSpinner,
  PageHeader,
  notifyDashboard,
} from "../ui";

const inputClass =
  "h-11 w-full rounded-xl border border-[#C5C4DA] bg-white px-3 text-sm text-[#191C1E] outline-none transition focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD] disabled:cursor-not-allowed disabled:bg-[#F1F4F8] disabled:text-[#757588]";

type CompanyForm = {
  companyName: string;
  tradingName: string;
  businessEmail: string;
  businessPhone: string;
  businessType: string;
  taxId: string;
  rcNumber: string;
  city: string;
  state: string;
  country: string;
  lga: string;
  firsEnabled: 0 | 1;
  mode: "demo" | "live";
  nrsBusinessIdTest: string;
  nrsBusinessIdLive: string;
  nrsApiKey: string;
  nrsApiSecret: string;
  nrsEntityId: string;
  nrsPublicKey: string;
  nrsCertificate: string;
};

const emptyForm: CompanyForm = {
  companyName: "",
  tradingName: "",
  businessEmail: "",
  businessPhone: "",
  businessType: "",
  taxId: "",
  rcNumber: "",
  city: "",
  state: "",
  country: "Nigeria",
  lga: "",
  firsEnabled: 0,
  mode: "demo",
  nrsBusinessIdTest: "",
  nrsBusinessIdLive: "",
  nrsApiKey: "",
  nrsApiSecret: "",
  nrsEntityId: "",
  nrsPublicKey: "",
  nrsCertificate: "",
};

const credentialFields = [
  ["nrsBusinessIdTest", "NRS Business ID — Test"],
  ["nrsBusinessIdLive", "NRS Business ID — Live"],
  ["nrsApiKey", "NRS API Key"],
  ["nrsApiSecret", "NRS API Secret"],
  ["nrsEntityId", "NRS Entity ID"],
  ["nrsPublicKey", "NRS Public Key"],
  ["nrsCertificate", "NRS Certificate"],
] as const;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-bold text-[#191C1E]">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Toggle({
  checked,
  disabled,
  onChange,
  onLabel,
  offLabel,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
        checked
          ? "border-[#1117E8] bg-[#EEF1FF]"
          : "border-[#C5C4DA] bg-white"
      } disabled:cursor-not-allowed disabled:opacity-70`}
    >
      <span>
        <span className="block font-bold text-[#191C1E]">
          {checked ? onLabel : offLabel}
        </span>
        <span className="mt-1 block text-xs text-[#757588]">
          {checked ? "Enabled (1)" : "Disabled (0)"}
        </span>
      </span>
      <span
        className={`h-7 w-12 rounded-full p-1 transition ${
          checked ? "bg-[#1117E8]" : "bg-[#C5C4DA]"
        }`}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white transition ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </span>
    </button>
  );
}

function profileToForm(user: AuthUser, mode: "demo" | "live"): CompanyForm {
  return {
    companyName: user.reg_company_name || user.company_name || "",
    tradingName: user.reg_trading_name || user.trading_name || "",
    businessEmail: user.business_email || user.email,
    businessPhone: user.business_phone || user.phone || "",
    businessType: user.business_type || "",
    taxId: user.tax_identification_number || "",
    rcNumber: user.rc_number || "",
    city: user.city || "",
    state: user.state || "",
    country: user.country || "Nigeria",
    lga: user.lga || "",
    firsEnabled: user.firs_enabled ? 1 : 0,
    mode,
    nrsBusinessIdTest: user.nrs_businessid_test || "",
    nrsBusinessIdLive: user.nrs_businessid_live || "",
    nrsApiKey: user.nrs_apikey || "",
    nrsApiSecret: user.nrs_apisecret || "",
    nrsEntityId: user.nrs_entityid || "",
    nrsPublicKey: user.nrs_publickey || "",
    nrsCertificate: user.nrs_certificate || "",
  };
}

export function MyCompanyPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [original, setOriginal] = useState<CompanyForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editUnlocked, setEditUnlocked] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>(
    {},
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const me = await getMe();
        const modeResponse = await getCompanyMode(me.data.company_id).catch(
          () => null,
        );
        if (cancelled) return;
        const next = profileToForm(
          me.data,
          modeResponse?.data.mode || me.data.mode || "demo",
        );
        setUser(me.data);
        setForm(next);
        setOriginal(next);
      } catch (requestError) {
        if (!cancelled)
          setError(
            getApiErrorMessage(
              requestError,
              "Unable to load company information.",
            ),
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasMissingCredentials = useMemo(
    () => credentialFields.some(([key]) => !original[key]),
    [original],
  );
  const stateOptions = nigeriaStates.map((item) =>
    item.state === "Federal Capital Territory"
      ? "FCT Abuja"
      : item.state === "Nassarawa"
        ? "Nasarawa"
        : item.state,
  );
  const selectedStateName =
    form.state === "FCT Abuja"
      ? "Federal Capital Territory"
      : form.state === "Nasarawa"
        ? "Nassarawa"
        : form.state;
  const lgaOptions =
    nigeriaStates.find((item) => item.state === selectedStateName)?.lgas ?? [];

  async function unlock(event: FormEvent) {
    event.preventDefault();
    if (!user || !password) return;
    setVerifying(true);
    setPasswordError("");
    try {
      await login(user.email, password);
      setEditUnlocked(true);
      setShowPasswordPrompt(false);
      setPassword("");
      notifyDashboard("Company information unlocked");
    } catch (requestError) {
      setPasswordError(
        getApiErrorMessage(requestError, "The password is incorrect."),
      );
    } finally {
      setVerifying(false);
    }
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      await Promise.all([
        updateCompanyInformation(user.company_id, {
          trading_name: form.tradingName || undefined,
          business_phone: form.businessPhone,
          city: form.city,
          state: form.state,
          country: form.country,
          lga: form.lga,
          nrs_businessid_test: form.nrsBusinessIdTest || undefined,
          nrs_businessid_live: form.nrsBusinessIdLive || undefined,
          nrs_apikey: form.nrsApiKey || undefined,
          nrs_apisecret: form.nrsApiSecret || undefined,
          nrs_entityid: form.nrsEntityId || undefined,
          nrs_publickey: form.nrsPublicKey || undefined,
          nrs_certificate: form.nrsCertificate || undefined,
        }),
        updateFirsSettings(user.company_id, {
          firs_enabled: form.firsEnabled,
        }),
        updateCompanyMode(user.company_id, { mode: form.mode }),
      ]);
      setOriginal(form);
      setEditUnlocked(false);
      notifyDashboard("Company information updated successfully");
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to update company information.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="flex min-h-72 items-center justify-center">
        <LoadingSpinner label="Loading company information" />
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="My Company"
        subtitle="Review your registered company profile, FIRS configuration, and NRS integration credentials."
      />

      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-6">
        <Card className="p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-[#DCE0E8] pb-4">
            <Building2 className="h-5 w-5 text-[#0001B1]" />
            <h2 className="text-lg font-extrabold">Company information</h2>
            {!editUnlocked ? (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#F1F4F8] px-3 py-1 text-xs font-bold text-[#757588]">
                <LockKeyhole className="h-3.5 w-3.5" /> Read only
              </span>
            ) : null}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Company Name">
              <input
                className={inputClass}
                value={form.companyName}
                disabled
              />
            </Field>
            <Field label="Business Email">
              <input
                className={inputClass}
                value={form.businessEmail}
                disabled
              />
            </Field>
            <Field label="Business Type">
              <input
                className={inputClass}
                value={form.businessType}
                disabled
              />
            </Field>
            <Field label="Trading Name">
              <input
                className={inputClass}
                value={form.tradingName}
                disabled={!editUnlocked}
                onChange={(event) =>
                  setForm({ ...form, tradingName: event.target.value })
                }
              />
            </Field>
            <Field label="Business Phone">
              <input
                className={inputClass}
                value={form.businessPhone}
                disabled={!editUnlocked}
                onChange={(event) =>
                  setForm({
                    ...form,
                    businessPhone: event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 13),
                  })
                }
              />
            </Field>
            <Field label="Tax Identification Number">
              <input
                className={inputClass}
                value={form.taxId}
                disabled
              />
            </Field>
            <Field label="CAC / RC Number">
              <input
                className={inputClass}
                value={form.rcNumber}
                disabled
              />
            </Field>
            <Field label="City">
              <input
                className={inputClass}
                value={form.city}
                disabled={!editUnlocked}
                onChange={(event) =>
                  setForm({ ...form, city: event.target.value })
                }
              />
            </Field>
            <Field label="State">
              <select
                className={inputClass}
                value={form.state}
                disabled={!editUnlocked}
                onChange={(event) =>
                  setForm({
                    ...form,
                    state: event.target.value,
                    lga: "",
                  })
                }
              >
                <option value="">Select state</option>
                {stateOptions.map((state) => (
                  <option key={state}>{state}</option>
                ))}
              </select>
            </Field>
            <Field label="Local Government Area">
              <select
                className={inputClass}
                value={form.lga}
                disabled={!editUnlocked || !form.state}
                onChange={(event) =>
                  setForm({ ...form, lga: event.target.value })
                }
              >
                <option value="">Select local government area</option>
                {lgaOptions.map((lga) => (
                  <option key={lga}>{lga}</option>
                ))}
              </select>
            </Field>
            {(["country"] as const).map((key) => (
              <Field
                key={key}
                label={key[0].toUpperCase() + key.slice(1)}
              >
                <input
                  className={inputClass}
                  value={form[key]}
                  disabled={!editUnlocked}
                  onChange={(event) =>
                    setForm({ ...form, [key]: event.target.value })
                  }
                />
              </Field>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-[#DCE0E8] pb-4">
            <ShieldCheck className="h-5 w-5 text-[#0001B1]" />
            <h2 className="text-lg font-extrabold">FIRS settings</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Toggle
              checked={form.firsEnabled === 1}
              disabled={!editUnlocked}
              onChange={(checked) =>
                setForm({
                  ...form,
                  firsEnabled: checked ? 1 : 0,
                  mode: checked ? form.mode : "demo",
                })
              }
              onLabel="FIRS enabled"
              offLabel="FIRS disabled"
            />
            <Toggle
              checked={form.mode === "live"}
              disabled={!editUnlocked || form.firsEnabled === 0}
              onChange={(checked) =>
                setForm({
                  ...form,
                  firsEnabled: checked ? 1 : form.firsEnabled,
                  mode: checked ? "live" : "demo",
                })
              }
              onLabel="FIRS mode: Live"
              offLabel="FIRS mode: Demo"
            />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <button
            type="button"
            onClick={() => setShowCredentials(!showCredentials)}
            className="flex w-full items-center gap-3 p-5 text-left sm:p-6"
          >
            <KeyRound className="h-5 w-5 text-[#0001B1]" />
            <span>
              <span className="block text-lg font-extrabold">
                FIRS/NRS credentials
              </span>
              <span className="mt-1 block text-sm text-[#757588]">
                Existing values are protected. Missing credentials can be
                supplied after password verification.
              </span>
            </span>
            {hasMissingCredentials ? (
              <span className="ml-auto mr-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                Details missing
              </span>
            ) : null}
            {showCredentials ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {showCredentials ? (
            <div className="grid gap-5 border-t border-[#DCE0E8] p-5 md:grid-cols-2 sm:p-6">
              {credentialFields.map(([key, label]) => {
                const alreadyProvided = Boolean(original[key]);
                const visible = Boolean(visibleSecrets[key]);
                return (
                  <Field key={key} label={label}>
                    <div className="relative">
                      {key === "nrsCertificate" ? (
                        <textarea
                          className={`${inputClass} h-28 py-3 pr-12`}
                          value={
                            alreadyProvided && !visible ? "••••••••••••" : form[key]
                          }
                          disabled={alreadyProvided || !editUnlocked}
                          onChange={(event) =>
                            setForm({ ...form, [key]: event.target.value })
                          }
                        />
                      ) : (
                        <input
                          className={`${inputClass} pr-12`}
                          type={visible ? "text" : "password"}
                          value={form[key]}
                          disabled={alreadyProvided || !editUnlocked}
                          onChange={(event) =>
                            setForm({ ...form, [key]: event.target.value })
                          }
                        />
                      )}
                      {alreadyProvided ? (
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleSecrets({
                              ...visibleSecrets,
                              [key]: !visible,
                            })
                          }
                          className="absolute right-3 top-3 text-[#757588]"
                          aria-label={visible ? `Hide ${label}` : `View ${label}`}
                        >
                          {visible ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      ) : null}
                    </div>
                    <span className="mt-2 block text-xs font-semibold text-[#757588]">
                      {alreadyProvided
                        ? "Already provided — cannot be edited."
                        : editUnlocked
                          ? "Missing — enter a value to add it."
                          : "Missing — unlock company information to add it."}
                    </span>
                  </Field>
                );
              })}
            </div>
          ) : null}
        </Card>

        <div className="flex justify-end pb-8">
          {editUnlocked ? (
            <Button onClick={save} disabled={saving}>
              {saving ? "Updating..." : "Save company information"}
            </Button>
          ) : (
            <Button onClick={() => setShowPasswordPrompt(true)}>
              Update company information
            </Button>
          )}
        </div>
      </div>

      {showPasswordPrompt ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#101322]/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={unlock}
            className="w-full max-w-md rounded-2xl border border-[#C5C4DA] bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DADEFD] text-[#0001B1]">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold">
              Confirm your password
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#454557]">
              Enter your account password to unlock company updates for this
              session.
            </p>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${inputClass} mt-5`}
              placeholder="Account password"
            />
            {passwordError ? (
              <p className="mt-3 text-sm font-semibold text-red-600">
                {passwordError}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setPassword("");
                  setPasswordError("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!password || verifying}>
                {verifying ? "Verifying..." : "Unlock updates"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export const KycPage = MyCompanyPage;
