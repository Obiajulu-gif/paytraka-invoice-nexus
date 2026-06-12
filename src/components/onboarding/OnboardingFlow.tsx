"use client";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  FileCheck2,
  Landmark,
  Lock,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  BankDetailsData,
  BusinessDetailsData,
  OnboardingState,
  OnboardingStateUpdate,
  PreferencesData,
  SignupData,
  TaxProfileData,
  defaultOnboardingState,
  getOnboardingState,
  maskAccountNumber,
  saveOnboardingState,
} from "@/lib/onboarding-store";

type PageKind = "signup" | "verify" | "business" | "tax" | "bank" | "preferences" | "review" | "dashboard";

type SidebarFeature = {
  icon: React.ElementType;
  title: string;
  text: string;
};

type SidebarConfig = {
  headline: string;
  eyebrow?: string;
  body: string;
  features: SidebarFeature[];
  quote?: string;
  compactTrust?: string;
};

type SignupField = {
  name: "firstName" | "lastName" | "workEmail" | "phoneNumber" | "companyName";
  label: string;
  placeholder: string;
  icon: React.ElementType;
};

const sidebarConfigs: Record<PageKind, SidebarConfig> = {
  signup: {
    eyebrow: "Fintech solutions for SMEs",
    headline: "Institutional Trust & Digital Precision",
    body: "Streamline your Nigerian enterprise operations with invoicing, payments, and tax compliance infrastructure built for speed and secured for scale.",
    features: [
      { icon: ReceiptText, title: "Invoice Ready", text: "Structured records for compliant sales workflows." },
      { icon: BarChart3, title: "Revenue Growth", text: "Track collections and settlement status." },
      { icon: BadgeCheck, title: "ISO 27001", text: "Security-first operating practices." },
    ],
    quote: "\"The most robust financial operating system for growing Nigerian enterprises.\"",
  },
  verify: {
    headline: "Institutional Trust for Nigerian Business Growth.",
    body: "Secure, automated, and compliant. We ensure your financial data is protected with enterprise-grade encryption and technological precision.",
    features: [
      { icon: ShieldCheck, title: "Secure", text: "256-bit Encryption" },
      { icon: Zap, title: "Fast", text: "Instant Verification" },
    ],
  },
  business: {
    headline: "Run your business with compliance in mind",
    body: "Guided onboarding captures the business data required for invoice readiness, customer trust, and audit-friendly operations.",
    features: [
      { icon: BadgeCheck, title: "Compliance-ready invoicing", text: "Automatically formatted for Nigerian tax authorities with FIRS-ready structures." },
      { icon: MapPin, title: "Nigerian business focus", text: "Localized workflows built specifically for SMEs operating within the Nigerian ecosystem." },
      { icon: Sparkles, title: "Guided workflows", text: "No tax expertise required. Our intelligent system guides you through every single step." },
    ],
    compactTrust: "TRUSTED BY 5,000+ BUSINESSES",
  },
  tax: {
    headline: "Prepare your invoices for Nigerian tax compliance",
    body: "Capture tax profile decisions once, then reuse them across validation, reporting, and submission workflows.",
    features: [
      { icon: ReceiptText, title: "VAT-ready invoice records", text: "Apply default VAT logic and exemption notes consistently." },
      { icon: Landmark, title: "FIRS/NRS preparation", text: "Prepare data for approved APP/SI integration pathways." },
      { icon: FileCheck2, title: "Audit-friendly data", text: "Keep compliance decisions traceable across your workspace." },
    ],
  },
  bank: {
    headline: "Institutional Trust & Precision",
    body: "Configure where payments are received and how settlement details appear on invoices.",
    features: [
      { icon: ShieldCheck, title: "Encrypted & Secure", text: "Your financial data and bank details are protected with bank-grade AES-256 encryption." },
      { icon: Landmark, title: "Verified Settlements", text: "Direct integration with major Nigerian banks for real-time settlement tracking." },
    ],
    quote: "Need assistance? Chat with our compliance team.",
  },
  preferences: {
    headline: "Institutional Trust & Precision",
    body: "Create a workspace experience that looks professional and remains consistent across every invoice you send.",
    features: [
      { icon: ShieldCheck, title: "FIRS Compliance", text: "Automated submission pipelines configured through compliant integration pathways." },
      { icon: ShieldCheck, title: "Secure Storage", text: "Military-grade encryption for all financial records and tax documentation." },
    ],
    quote: "\"PayTraka has transformed our treasury operations with its seamless e-invoicing workflow.\"",
  },
  review: {
    headline: "You’re almost ready to run compliant invoicing",
    body: "Review your business setup before entering your PayTraka dashboard.",
    features: [
      { icon: ShieldCheck, title: "Compliance-ready invoicing", text: "Automated readiness workflows enabled." },
      { icon: BarChart3, title: "Real-time Tax Analytics", text: "Monitor liabilities as your business grows." },
    ],
  },
  dashboard: {
    headline: "Your workspace is ready.",
    body: "Welcome to the future of Nigerian enterprise finance. Everything is set up for institutional-grade compliance and efficiency.",
    features: [
      { icon: ShieldCheck, title: "Compliance-ready invoicing", text: "Automated FIRS reporting preparation enabled." },
      { icon: BarChart3, title: "Real-time Tax Analytics", text: "Monitor liabilities as you grow." },
    ],
  },
};

const industries = ["Hospitality", "Retail", "Logistics", "Professional Services", "Manufacturing", "Technology", "Agriculture", "Financial Services"];
const states = ["Lagos", "Abuja FCT", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Edo", "Enugu", "Kano", "Kaduna", "Ogun", "Oyo", "Rivers"];
const banks = ["Access Bank", "Zenith Bank", "GTBank", "First Bank", "UBA", "Stanbic IBTC", "Fidelity Bank", "Sterling Bank", "Wema Bank", "Opay"];
const colorOptions = [
  ["Blue", "#1117E8"],
  ["Purple", "#5B4BEA"],
  ["Green", "#10B981"],
  ["Orange", "#F59E0B"],
  ["Slate", "#64748B"],
];
const templates = ["Classic", "Modern", "Minimal", "Bold Cards"];
const signupFields: SignupField[] = [
  { name: "firstName", label: "First Name", placeholder: "Jane", icon: User },
  { name: "lastName", label: "Last Name", placeholder: "Doe", icon: User },
  { name: "workEmail", label: "Work Email", placeholder: "jane@company.com", icon: Mail },
  { name: "phoneNumber", label: "Phone Number", placeholder: "+234 800 000 0000", icon: Phone },
  { name: "companyName", label: "Company Name", placeholder: "Enterprise Ltd.", icon: Building2 },
];

function AuthOnboardingLayout({ kind, children }: { kind: PageKind; children: React.ReactNode }) {
  const config = sidebarConfigs[kind];

  return (
    <div className="min-h-screen bg-[#F5F6FA] lg:grid lg:h-screen lg:grid-cols-[42%_58%] lg:overflow-hidden">
      <aside className="relative hidden overflow-hidden bg-[#0001B1] px-10 py-9 text-white lg:flex lg:h-screen lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(17,23,232,0.9),transparent_35%)]" />
        <div className="relative z-10 my-auto max-w-xl">
          {config.eyebrow ? <p className="mb-6 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white/90">{config.eyebrow}</p> : null}
          <h1 className="text-3xl font-extrabold leading-tight xl:text-4xl">{config.headline}</h1>
          <p className="mt-4 text-sm leading-6 text-white/75 xl:text-base">{config.body}</p>
          <div className="mt-6 grid gap-3">
            {config.features.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="animate-[floatCard_7s_ease-in-out_infinite] rounded-xl border border-white/20 bg-white/10 p-3.5 shadow-2xl backdrop-blur" style={{ animationDelay: `${index * 0.8}s` }}>
                <Icon className="h-5 w-5" aria-hidden="true" />
                <h2 className="mt-2 text-base font-bold xl:text-lg">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-white/68 xl:text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          {config.compactTrust ? (
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm font-bold tracking-widest text-white/70">{config.compactTrust}</p>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((item) => <span key={item} className="h-6 rounded bg-white/25" />)}
              </div>
            </div>
          ) : null}
          {config.quote ? (
            <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-sm leading-6 text-white/86">
              {config.quote}
            </div>
          ) : null}
        </div>
      </aside>
      <main className="min-h-screen px-5 py-8 md:px-10 lg:h-screen lg:min-h-0 lg:overflow-y-auto lg:px-10">
        <div className="mx-auto mb-4 flex max-w-6xl items-center justify-between">
          <Link href="/" aria-label="Go to PayTraka landing page" className="inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1117E8]">
            <Image src="/paytraka_logo/paytraka-logo-transparent.png" alt="PayTraka" width={168} height={48} className="h-9 w-auto object-contain" priority />
          </Link>
          <Link href="/" className="text-sm font-bold text-[#0001B1] lg:hidden">Home</Link>
        </div>
        {children}
      </main>
    </div>
  );
}

function ProgressHeader({ step, title, percent }: { step: string; title: string; percent: number }) {
  return (
    <div className="mb-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold tracking-widest text-[#0001B1]">{step}</p>
      <h1 className="mt-2 text-3xl font-extrabold text-[#191C1E] md:text-4xl">{title}</h1>
        </div>
        <p className="hidden text-lg font-bold text-[#454557] sm:block">{percent}% Complete</p>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#DFE3E8]">
        <div className="h-full rounded-full bg-[#1117E8] transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-base font-bold text-[#191C1E]">
      {label}
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-2 text-sm font-semibold text-red-600">{error}</p> : null}
    </label>
  );
}

const inputClass = "h-12 w-full rounded-xl border border-[#C5C4DA] bg-white px-4 text-base text-[#191C1E] outline-none transition placeholder:text-[#9CA0AA] focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]";
const selectClass = `${inputClass} appearance-none pr-10`;

function StepActions({ backHref, nextLabel = "Continue", disabled = false }: { backHref: string; nextLabel?: string; disabled?: boolean }) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Link href={backHref} className="inline-flex h-12 items-center justify-center rounded-xl border border-[#C5C4DA] px-8 text-base font-bold text-[#191C1E] transition hover:border-[#1117E8] hover:text-[#0001B1]">
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Back
      </Link>
      <button type="submit" disabled={disabled} className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-[#1117E8] px-8 text-base font-bold text-white shadow-[0_16px_32px_rgba(17,23,232,0.2)] transition hover:bg-[#0001B1] disabled:cursor-not-allowed disabled:opacity-60">
        {disabled ? "Saving..." : nextLabel}
      </button>
    </div>
  );
}

function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(defaultOnboardingState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(getOnboardingState());
    setReady(true);
  }, []);

  const save = (update: OnboardingStateUpdate) => {
    const next = saveOnboardingState(update);
    setState(next);
    return next;
  };

  return { state, setState, save, ready };
}

function useOnboardingGuard(kind: "auth" | "verify" | "onboarding" | "dashboard") {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const state = getOnboardingState();
    const stepRoutes = {
      "business-details": "/onboarding/business-details",
      "tax-profile": "/onboarding/tax-profile",
      "bank-details": "/onboarding/bank-details",
      preferences: "/onboarding/preferences",
      review: "/onboarding/review",
    } as const;
    const stepOrder = ["business-details", "tax-profile", "bank-details", "preferences", "review"] as const;
    if (kind === "auth" && state.completed) {
      router.replace("/dashboard");
      return;
    }
    if (kind === "verify" && !state.signup.workEmail) {
      router.replace("/signup");
      return;
    }
    if (kind === "onboarding") {
      if (!state.signup.workEmail) {
        router.replace("/signup");
        return;
      }
      if (!state.signup.emailVerified) {
        router.replace("/verify-email");
        return;
      }
      if (state.completed) {
        router.replace("/dashboard");
        return;
      }
      if (state.currentStep in stepRoutes) {
        const currentIndex = stepOrder.indexOf(state.currentStep as keyof typeof stepRoutes);
        const requestedStep = stepOrder.find((step) => stepRoutes[step] === pathname);
        const requestedIndex = requestedStep ? stepOrder.indexOf(requestedStep) : -1;
        if (requestedIndex > currentIndex) {
          router.replace(stepRoutes[state.currentStep as keyof typeof stepRoutes]);
        }
      }
    }
    if (kind === "dashboard" && !state.completed) {
      router.replace(state.signup.emailVerified ? "/onboarding/business-details" : "/signup");
    }
  }, [kind, pathname, router]);
}

function requireFields<T extends Record<string, unknown>>(data: T, fields: Array<keyof T>) {
  const errors: Record<string, string> = {};
  fields.forEach((field) => {
    if (!String(data[field] ?? "").trim()) errors[field as string] = "This field is required.";
  });
  return errors;
}

export function SignupPage() {
  const router = useRouter();
  const { state, save } = useOnboarding();
  const [form, setForm] = useState({ ...state.signup, password: "", confirmPassword: "", terms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useOnboardingGuard("auth");

  useEffect(() => {
    setForm((current) => ({ ...current, ...getOnboardingState().signup }));
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = requireFields(form, ["firstName", "lastName", "workEmail", "phoneNumber", "companyName", "password", "confirmPassword"]);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.workEmail)) nextErrors.workEmail = "Enter a valid work email.";
    if (!/^(\+?234|0)?[789][01]\d{8}$/.test(form.phoneNumber.replace(/\s/g, ""))) nextErrors.phoneNumber = "Enter a valid Nigerian phone number.";
    if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords must match.";
    if (!form.terms) nextErrors.terms = "You must accept the terms.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    const signup: SignupData = {
      firstName: form.firstName,
      lastName: form.lastName,
      workEmail: form.workEmail,
      phoneNumber: form.phoneNumber,
      companyName: form.companyName,
      emailVerified: false,
    };
    save({ signup, currentStep: "verify-email", verificationCode: "246810" });
    router.push("/verify-email");
  }

  return (
    <AuthOnboardingLayout kind="signup">
      <form onSubmit={submit} className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col justify-center py-5">
        <h1 className="text-3xl font-extrabold text-[#191C1E] md:text-4xl">Create your PayTraka workspace</h1>
        <p className="mt-3 text-base leading-7 text-[#454557]">Start managing invoices, payments, customers, reports, and compliance from one secure business dashboard.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {signupFields.map(({ name, label, placeholder, icon: Icon }) => (
            <Field key={name} label={label} error={errors[name]}>
              <div className="relative">
                <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#757588]" aria-hidden="true" />
                <input aria-invalid={Boolean(errors[name])} value={String(form[name])} onChange={(event) => setForm({ ...form, [name]: event.target.value })} className={`${inputClass} pl-12`} placeholder={placeholder} />
              </div>
            </Field>
          ))}
          <Field label="Password" error={errors.password}>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#757588]" aria-hidden="true" />
              <input aria-invalid={Boolean(errors.password)} type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className={`${inputClass} pl-12 pr-12`} placeholder="Minimum 8 characters" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#757588]" aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </Field>
          <Field label="Confirm Password" error={errors.confirmPassword}>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#757588]" aria-hidden="true" />
              <input aria-invalid={Boolean(errors.confirmPassword)} type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} className={`${inputClass} pl-12`} placeholder="Repeat password" />
            </div>
          </Field>
        </div>
        <label className="mt-4 flex gap-3 text-sm font-semibold text-[#454557]">
          <input type="checkbox" checked={form.terms} onChange={(event) => setForm({ ...form, terms: event.target.checked })} className="mt-1 h-5 w-5 rounded border-[#C5C4DA]" />
          I agree to the Terms of Service, Privacy Policy, and responsible use of PayTraka readiness tools.
        </label>
        {errors.terms ? <p className="mt-2 text-sm font-semibold text-red-600">{errors.terms}</p> : null}
        <button disabled={submitting} className="mt-6 h-12 rounded-xl bg-[#1117E8] text-base font-bold text-white shadow-[0_16px_32px_rgba(17,23,232,0.2)] transition hover:bg-[#0001B1] disabled:opacity-60">
          {submitting ? "Creating..." : "Create Workspace"}
        </button>
        <p className="mt-5 text-center text-base text-[#454557]">Already have a workspace? <Link href="/login" className="font-bold text-[#0001B1]">Sign in</Link></p>
      </form>
    </AuthOnboardingLayout>
  );
}

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useOnboardingGuard("auth");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    saveOnboardingState({ currentStep: getOnboardingState().completed ? "complete" : getOnboardingState().currentStep });
    router.push(getOnboardingState().completed ? "/dashboard" : "/onboarding/business-details");
  }

  return (
    <AuthOnboardingLayout kind="signup">
      <form onSubmit={submit} className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col justify-center py-5">
        <h1 className="text-4xl font-extrabold text-[#191C1E]">Welcome back</h1>
        <p className="mt-3 text-lg text-[#454557]">Please enter your credentials to access your dashboard.</p>
        <div className="mt-8 space-y-5">
          <Field label="Work Email">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#757588]" aria-hidden="true" />
              <input value={email} onChange={(event) => setEmail(event.target.value)} className={`${inputClass} pl-12`} placeholder="name@company.com" />
            </div>
          </Field>
          <Field label="Password">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#757588]" aria-hidden="true" />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className={`${inputClass} pl-12 pr-12`} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#757588]" aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </Field>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4 text-base">
          <label className="flex items-center gap-3 text-[#454557]"><input type="checkbox" className="h-5 w-5 rounded border-[#C5C4DA]" /> Remember me</label>
          <a href="#" className="font-bold text-[#0001B1]">Forgot Password?</a>
        </div>
        {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
        <button className="mt-7 h-12 rounded-xl bg-[#1117E8] text-base font-bold text-white transition hover:bg-[#0001B1]">Sign In</button>
        <p className="mt-8 text-center text-base text-[#454557]">Don&apos;t have an account? <Link href="/signup" className="font-bold text-[#0001B1]">Sign up</Link></p>
      </form>
    </AuthOnboardingLayout>
  );
}

export function VerifyEmailPage() {
  const router = useRouter();
  const { state, save } = useOnboarding();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useOnboardingGuard("verify");

  function update(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 5) refs.current[index + 1]?.focus();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (code.join("") !== state.verificationCode) {
      setError("Use verification code 246810 for this mock workspace.");
      return;
    }
    save({ signup: { emailVerified: true }, currentStep: "business-details" });
    router.push("/onboarding/business-details");
  }

  return (
    <AuthOnboardingLayout kind="verify">
      <form onSubmit={submit} className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col justify-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#DADEFD] text-[#1117E8]"><Mail size={36} /></span>
        <h1 className="mt-8 text-4xl font-extrabold text-[#191C1E]">Verify your email</h1>
        <p className="mt-4 max-w-2xl text-lg leading-7 text-[#454557]">We&apos;ve sent a 6-digit verification code to {state.signup.workEmail || "your email"}. Enter it below to continue.</p>
        <div className="mt-10 grid grid-cols-6 gap-3 md:gap-5">
          {code.map((value, index) => (
            <input
              key={index}
              ref={(node) => { refs.current[index] = node; }}
              value={value}
              inputMode="numeric"
              maxLength={1}
              onChange={(event) => update(index, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && !code[index] && index > 0) refs.current[index - 1]?.focus();
              }}
              onPaste={(event) => {
                const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                if (pasted.length === 6) {
                  event.preventDefault();
                  setCode(pasted.split(""));
                }
              }}
              className="h-16 rounded-xl border border-[#C5C4DA] bg-white text-center text-2xl font-bold text-[#191C1E] outline-none transition focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD] md:h-20"
              aria-label={`Verification code digit ${index + 1}`}
            />
          ))}
        </div>
        {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
        <button className="mt-10 h-16 rounded-xl bg-[#1117E8] text-xl font-bold text-white transition hover:bg-[#0001B1]">Verify & Continue</button>
        <p className="mt-7 text-center text-lg text-[#454557]">Didn&apos;t receive a code? <button type="button" onClick={() => setError("New code sent. Use 246810 in this mock flow.")} className="font-bold text-[#0001B1]">Resend</button></p>
      </form>
    </AuthOnboardingLayout>
  );
}

function SelectField({ value, onChange, options, placeholder }: { value: string; onChange: (value: string) => void; options: string[]; placeholder: string }) {
  return (
    <div className="relative">
      <select value={value} onChange={(event) => onChange(event.target.value)} className={selectClass}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#757588]" aria-hidden="true" />
    </div>
  );
}

export function BusinessDetailsPage() {
  const router = useRouter();
  const { state, save } = useOnboarding();
  const [form, setForm] = useState<BusinessDetailsData>(state.businessDetails);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useOnboardingGuard("onboarding");

  useEffect(() => setForm(getOnboardingState().businessDetails), []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = requireFields(form, ["businessName", "industry", "taxId", "contactPerson", "businessEmail", "city", "state", "country", "phoneNumber", "businessAddress"]);
    if (form.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.businessEmail)) nextErrors.businessEmail = "Enter a valid business email.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    save({ businessDetails: form, currentStep: "tax-profile" });
    router.push("/onboarding/tax-profile");
  }

  return (
    <AuthOnboardingLayout kind="business">
      <form onSubmit={submit} className="mx-auto max-w-5xl py-8">
        <ProgressHeader step="STEP 1 OF 5" title="Business Details" percent={20} />
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Business Name" error={errors.businessName}><input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className={inputClass} placeholder="Legal registered name" /></Field>
          <Field label="Trading Name (Optional)"><input value={form.tradingName} onChange={(e) => setForm({ ...form, tradingName: e.target.value })} className={inputClass} placeholder="As seen by customers" /></Field>
          <div className="md:col-span-2"><Field label="Industry" error={errors.industry}><SelectField value={form.industry} onChange={(industry) => setForm({ ...form, industry })} options={industries} placeholder="Select industry" /></Field></div>
          <Field label="Tax Identification Number" error={errors.taxId}><input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} className={inputClass} placeholder="TIN or CAC Registration Number" /></Field>
          <Field label="Contact Person" error={errors.contactPerson}><input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className={inputClass} placeholder="Full legal name" /></Field>
          <Field label="Business Email" error={errors.businessEmail}><input value={form.businessEmail} onChange={(e) => setForm({ ...form, businessEmail: e.target.value })} className={inputClass} placeholder="email@company.com" /></Field>
          <Field label="City" error={errors.city}><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} placeholder="Somolu" /></Field>
          <Field label="State" error={errors.state}><SelectField value={form.state} onChange={(state) => setForm({ ...form, state })} options={states} placeholder="Select state" /></Field>
          <Field label="Country" error={errors.country}><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} placeholder="Nigeria" /></Field>
          <Field label="Phone Number" error={errors.phoneNumber}><div className="flex"><span className="inline-flex h-14 items-center rounded-l-xl border border-r-0 border-[#C5C4DA] bg-white px-5 text-[#454557]">+234</span><input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className={`${inputClass} rounded-l-none`} placeholder="800 000 0000" /></div></Field>
          <Field label="Business Address" error={errors.businessAddress}><textarea value={form.businessAddress} onChange={(e) => setForm({ ...form, businessAddress: e.target.value })} className={`${inputClass} h-28 py-4`} placeholder="Street name, building number, and city" /></Field>
        </div>
        <StepActions backHref="/verify-email" />
      </form>
    </AuthOnboardingLayout>
  );
}

export function TaxProfilePage() {
  const router = useRouter();
  const { save } = useOnboarding();
  const [form, setForm] = useState<TaxProfileData>(defaultOnboardingState.taxProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useOnboardingGuard("onboarding");

  useEffect(() => setForm(getOnboardingState().taxProfile), []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = requireFields(form, ["tin", "cacNumber", "vatStatus", "vatRate", "businessSector", "environmentPreference", "submissionPreference"]);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    save({ taxProfile: form, currentStep: "bank-details" });
    router.push("/onboarding/bank-details");
  }

  return (
    <AuthOnboardingLayout kind="tax">
      <form onSubmit={submit} className="mx-auto max-w-5xl py-8">
        <ProgressHeader step="STEP 2 OF 5" title="Tax & Compliance Profile" percent={40} />
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="TIN" error={errors.tin}><input value={form.tin} onChange={(e) => setForm({ ...form, tin: e.target.value })} className={inputClass} placeholder="Tax Identification Number" /></Field>
          <Field label="CAC/RC Number" error={errors.cacNumber}><input value={form.cacNumber} onChange={(e) => setForm({ ...form, cacNumber: e.target.value })} className={inputClass} placeholder="RC 0000000" /></Field>
          <Field label="VAT Registration Status" error={errors.vatStatus}><SelectField value={form.vatStatus} onChange={(vatStatus) => setForm({ ...form, vatStatus })} options={["Registered", "Not Registered", "Not Sure"]} placeholder="Select status" /></Field>
          <Field label="VAT Rate" error={errors.vatRate}><input value={form.vatRate} onChange={(e) => setForm({ ...form, vatRate: e.target.value })} className={inputClass} placeholder="7.5%" /></Field>
          <Field label="Business Sector" error={errors.businessSector}><SelectField value={form.businessSector} onChange={(businessSector) => setForm({ ...form, businessSector })} options={industries} placeholder="Select sector" /></Field>
          <Field label="Tax Office / FIRS Office Optional"><input value={form.taxOffice} onChange={(e) => setForm({ ...form, taxOffice: e.target.value })} className={inputClass} placeholder="Lagos Mainland tax office" /></Field>
          <Field label="E-invoicing Environment Preference" error={errors.environmentPreference}><SelectField value={form.environmentPreference} onChange={(environmentPreference) => setForm({ ...form, environmentPreference })} options={["Test/Sandbox first", "Live after approval", "Not sure"]} placeholder="Select environment" /></Field>
          <Field label="APP/SI Provider Preference Optional"><input value={form.providerPreference} onChange={(e) => setForm({ ...form, providerPreference: e.target.value })} className={inputClass} placeholder="Interswitch / Approved APP / Not selected" /></Field>
        </div>
        <fieldset className="mt-6 rounded-2xl border border-[#C5C4DA] bg-white p-6">
          <legend className="px-2 text-base font-bold">Submission Preference</legend>
          {["Submit manually after review", "Submit automatically after invoice approval"].map((option) => (
            <label key={option} className="mt-3 flex gap-3 text-base font-semibold text-[#454557]">
              <input type="radio" checked={form.submissionPreference === option} onChange={() => setForm({ ...form, submissionPreference: option })} />
              {option}
            </label>
          ))}
        </fieldset>
        <div className="mt-6 rounded-2xl border border-[#C5C4DA] bg-[#EEF1FF] p-5 text-sm leading-6 text-[#454557]">
          PayTraka can prepare invoice data for submission through approved APP/SI pathways. Do not present PayTraka as already approved unless this has been officially confirmed.
        </div>
        <StepActions backHref="/onboarding/business-details" />
      </form>
    </AuthOnboardingLayout>
  );
}

export function BankDetailsPage() {
  const router = useRouter();
  const { save } = useOnboarding();
  const [form, setForm] = useState<BankDetailsData>(defaultOnboardingState.bankDetails);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useOnboardingGuard("onboarding");

  useEffect(() => setForm(getOnboardingState().bankDetails), []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = requireFields(form, ["bankName", "accountNumber", "accountName", "paymentMethod"]);
    if (!/^\d{10}$/.test(form.accountNumber)) nextErrors.accountNumber = "Enter a valid 10-digit Nigerian NUBAN.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    save({ bankDetails: form, currentStep: "preferences" });
    router.push("/onboarding/preferences");
  }

  return (
    <AuthOnboardingLayout kind="bank">
      <form onSubmit={submit} className="mx-auto max-w-5xl py-10">
        <ProgressHeader step="STEP 3 OF 5" title="Bank details" percent={60} />
        <p className="-mt-6 mb-8 max-w-4xl text-lg leading-7 text-[#454557]">Configure where your payments will be received. This information will be used for automated invoicing and tax compliance.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Field label="Bank Name" error={errors.bankName}><SelectField value={form.bankName} onChange={(bankName) => setForm({ ...form, bankName })} options={banks} placeholder="Select Bank" /></Field>
          <Field label="Account Number" error={errors.accountNumber}><input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })} className={inputClass} placeholder="10-digit Number" /></Field>
          <div className="md:col-span-2"><Field label="Account Name" error={errors.accountName}><input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} className={inputClass} placeholder="Full legal business name" /></Field></div>
          <div className="md:col-span-2"><Field label="Preferred Payment Method" error={errors.paymentMethod}><SelectField value={form.paymentMethod} onChange={(paymentMethod) => setForm({ ...form, paymentMethod })} options={["Bank Transfer (Instant Settlement)", "Card Payment", "PayTraka Payment Link", "Manual Payment"]} placeholder="Select payment method" /></Field></div>
        </div>
        <div className="mt-7 rounded-2xl border border-[#C5C4DA] bg-[#EEF1FF] p-5">
          <h2 className="flex items-center gap-3 text-lg font-extrabold text-[#0001B1]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0001B1] text-white">i</span> Automatic VAT Configuration</h2>
          <p className="mt-3 text-base leading-7 text-[#454557]">As per Nigerian tax law, PayTraka will automatically apply the <span className="font-bold text-[#0001B1]">7.5% VAT rate</span> to all generated invoices unless specifically exempted in your tax profile.</p>
        </div>
        <div className="mt-8 space-y-5">
          <Toggle label="Generate payment link" text="Include a PayTraka checkout link for faster client payments." checked={form.generatePaymentLink} onChange={(generatePaymentLink) => setForm({ ...form, generatePaymentLink })} />
          <Toggle label="Display bank details on invoice" text="Your NUBAN and Bank Name will appear in the invoice footer." checked={form.displayBankDetails} onChange={(displayBankDetails) => setForm({ ...form, displayBankDetails })} />
        </div>
        <StepActions backHref="/onboarding/tax-profile" />
      </form>
    </AuthOnboardingLayout>
  );
}

function Toggle({ label, text, checked, onChange }: { label: string; text: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-5">
      <span>
        <span className="block text-xl font-bold text-[#191C1E]">{label}</span>
        <span className="mt-1 block text-lg text-[#454557]">{text}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span className={`h-9 w-16 rounded-full p-1 transition ${checked ? "bg-[#1117E8]" : "bg-[#C5C4DA]"}`}>
        <span className={`block h-7 w-7 rounded-full bg-white transition ${checked ? "translate-x-7" : ""}`} />
      </span>
    </label>
  );
}

export function PreferencesPage() {
  const router = useRouter();
  const { save } = useOnboarding();
  const [form, setForm] = useState<PreferencesData>(defaultOnboardingState.preferences);

  useOnboardingGuard("onboarding");

  useEffect(() => setForm(getOnboardingState().preferences), []);

  function submit(event: FormEvent) {
    event.preventDefault();
    save({ preferences: form, currentStep: "review" });
    router.push("/onboarding/review");
  }

  return (
    <AuthOnboardingLayout kind="preferences">
      <form onSubmit={submit} className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col py-6">
        <ProgressHeader step="STEP 4 OF 5" title="Preferences" percent={80} />
        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-2">
          <section>
            <h2 className="text-2xl font-bold text-[#191C1E]">Brand Accent Color</h2>
            <p className="mt-5 max-w-lg text-lg font-semibold leading-7 text-[#454557]">This color will be applied to your invoice templates and dashboard.</p>
            <div className="mt-8 flex gap-5">
              {colorOptions.map(([name, color]) => (
                <button key={name} type="button" onClick={() => setForm({ ...form, accentColor: name })} className={`h-14 w-14 rounded-full border-4 border-white shadow-md ring-offset-2 transition ${form.accentColor === name ? "ring-4 ring-[#1117E8]" : "ring-1 ring-[#C5C4DA]"}`} style={{ backgroundColor: color }} aria-label={`Select ${name}`} />
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-[#191C1E]">Invoice Template</h2>
            <div className="mt-8 grid max-w-sm grid-cols-2 gap-4">
              {templates.map((template) => (
                <button key={template} type="button" onClick={() => setForm({ ...form, invoiceTemplate: template })} className={`rounded-xl border p-3 text-left font-bold transition ${form.invoiceTemplate === template ? "border-[#1117E8] bg-[#EEF1FF] text-[#0001B1] ring-2 ring-[#1117E8]" : "border-[#C5C4DA] bg-white text-[#191C1E]"}`}>
                  <span className="mb-3 flex h-20 items-center justify-center rounded-lg border border-dashed border-[#C5C4DA] bg-[#F7F9FB]">
                    <Building2 className="text-current" aria-hidden="true" />
                  </span>
                  {template}
                </button>
              ))}
            </div>
          </section>
        </div>
        <StepActions backHref="/onboarding/bank-details" />
        <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-[#454557]">
          <a href="#">Terms of Service</a><a href="#">Privacy Policy</a><a href="#">Refund Policy</a>
        </div>
      </form>
    </AuthOnboardingLayout>
  );
}

export function ReviewPage() {
  const router = useRouter();
  const { state, save, ready } = useOnboarding();
  const [confirmed, setConfirmed] = useState(false);

  useOnboardingGuard("onboarding");

  const cards = useMemo(() => [
    ["Business Details", "/onboarding/business-details", [["Business name", state.businessDetails.businessName], ["Industry", state.businessDetails.industry], ["TIN/CAC", state.businessDetails.taxId], ["Contact", state.businessDetails.contactPerson]]],
    ["Tax & Compliance", "/onboarding/tax-profile", [["VAT status", state.taxProfile.vatStatus], ["VAT rate", state.taxProfile.vatRate], ["Submission", state.taxProfile.submissionPreference], ["Environment", state.taxProfile.environmentPreference]]],
    ["Bank Details", "/onboarding/bank-details", [["Bank", state.bankDetails.bankName], ["Account", maskAccountNumber(state.bankDetails.accountNumber)], ["Payment method", state.bankDetails.paymentMethod]]],
    ["Preferences", "/onboarding/preferences", [["Accent color", state.preferences.accentColor], ["Invoice template", state.preferences.invoiceTemplate], ["Payment link", state.bankDetails.generatePaymentLink ? "Enabled" : "Disabled"]]],
  ], [state]);

  if (!ready) return null;

  return (
    <AuthOnboardingLayout kind="review">
      <form onSubmit={(event) => { event.preventDefault(); save({ completed: true, currentStep: "complete", preferences: { confirmedAccuracy: confirmed } }); router.push("/dashboard"); }} className="mx-auto max-w-6xl py-8">
        <ProgressHeader step="STEP 5 OF 5" title="Review your setup" percent={100} />
        <div className="grid gap-5 md:grid-cols-2">
          {cards.map(([title, href, rows]) => (
            <article key={title as string} className="rounded-2xl border border-[#C5C4DA] bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-[#191C1E]">{title as string}</h2>
                <Link href={href as string} className="font-bold text-[#0001B1]">Edit</Link>
              </div>
              <dl className="mt-5 space-y-3">
                {(rows as string[][]).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 text-sm">
                    <dt className="text-[#757588]">{label}</dt>
                    <dd className="text-right font-semibold text-[#191C1E]">{value || "Not provided"}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
        <label className="mt-8 flex gap-3 text-base font-semibold text-[#454557]">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 h-5 w-5" />
          I confirm that the information provided is accurate to the best of my knowledge.
        </label>
        <StepActions backHref="/onboarding/preferences" nextLabel="Complete Setup" disabled={!confirmed} />
      </form>
    </AuthOnboardingLayout>
  );
}

export function DashboardPage() {
  const { state, ready } = useOnboarding();
  useOnboardingGuard("dashboard");
  if (!ready) return null;

  return (
    <AuthOnboardingLayout kind="dashboard">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl content-center gap-8 py-10 lg:grid-cols-[1fr_1fr]">
        <div className="lg:col-span-2">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DADEFD] text-[#0001B1]"><Check size={44} /></span>
          <h1 className="mt-8 text-4xl font-extrabold text-[#191C1E]">Setup complete!</h1>
          <p className="mt-4 text-xl text-[#454557]">Your enterprise profile has been successfully verified.</p>
        </div>
        <article className="rounded-2xl border border-[#C5C4DA] bg-white p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-[#757588]">Onboarding Summary</p>
          {["Business Profile|Validated via CAC Registry", "Tax Details (TIN)|Connected to FIRS database", "Workspace Policy|Default tax rules applied"].map((item) => {
            const [title, text] = item.split("|");
            return <div key={title} className="mt-8 flex gap-4"><CheckCircle2 className="h-7 w-7 text-[#1117E8]" /><div><h2 className="text-2xl font-bold">{title}</h2><p className="text-lg text-[#454557]">{text}</p></div></div>;
          })}
        </article>
        <article className="rounded-2xl border border-[#C5C4DA] bg-white p-8">
          <Building2 className="h-10 w-10 text-[#1117E8]" />
          <h2 className="mt-8 text-3xl font-bold">Go to dashboard</h2>
          <p className="mt-5 text-xl leading-8 text-[#454557]">Explore {state.signup.companyName || "your company"}&apos;s financial health.</p>
          <Link href="/" className="mt-10 flex h-16 items-center justify-between rounded-xl border border-[#C5C4DA] px-6 text-xl font-bold text-[#191C1E]">Go to Dashboard <ArrowRight /></Link>
        </article>
        <p className="flex items-center gap-3 text-lg font-bold text-[#757588]"><span className="h-7 w-5 rounded bg-gradient-to-r from-green-400 to-slate-300" /> Powered by PayTraka Enterprise Infrastructure</p>
      </section>
    </AuthOnboardingLayout>
  );
}
