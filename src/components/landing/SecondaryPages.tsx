import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  CloudUpload,
  FileCheck2,
  FileSearch,
  FileText,
  Gauge,
  KeyRound,
  Landmark,
  Mail,
  MapPin,
  Moon,
  Phone,
  Search,
  Send,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type PageKey = "home" | "product" | "pricing" | "solutions" | "resources" | "company";

const navLinks: Array<{ label: string; href: string; key: PageKey }> = [
  { label: "Home", href: "/", key: "home" },
  { label: "Product", href: "/product", key: "product" },
  { label: "Pricing", href: "/pricing", key: "pricing" },
  { label: "Solutions", href: "/solutions", key: "solutions" },
  { label: "Resources", href: "/resources", key: "resources" },
  { label: "Company", href: "/company", key: "company" },
];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function SiteNavbar({ active }: { active: PageKey }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#C5C4DA]/50 bg-white/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 md:px-8" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold text-[#0001B1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1117E8]">
          <Landmark className="hidden h-5 w-5 sm:block" aria-hidden="true" />
          PayTraka
        </Link>
        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              className={cx(
                "border-b-2 px-1 py-6 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1117E8]",
                active === link.key ? "border-[#1117E8] text-[#0001B1]" : "border-transparent text-[#454557] hover:text-[#0001B1]",
              )}
              aria-current={active === link.key ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden h-10 w-10 items-center justify-center rounded-lg text-[#454557] transition hover:bg-[#F7F9FB] hover:text-[#0001B1] sm:inline-flex" type="button" aria-label="Toggle theme">
            <Moon size={20} aria-hidden="true" />
          </button>
          <a href="#contact" className="hidden min-h-10 items-center rounded-lg border border-[#C5C4DA] bg-white px-5 text-sm font-bold text-[#0001B1] transition hover:border-[#1117E8] sm:inline-flex">
            Sign in
          </a>
          <a href="#contact" className="inline-flex min-h-10 items-center rounded-lg bg-[#1117E8] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(17,23,232,0.2)] transition hover:bg-[#0001B1]">
            Get started
          </a>
        </div>
      </nav>
    </header>
  );
}

export function SimpleFooter() {
  const links = [
    ["Product", "/product"],
    ["Solutions", "/solutions"],
    ["Company", "/company"],
    ["Contact", "/company#contact"],
    ["Privacy Policy", "#"],
    ["Terms of Service", "#"],
  ];

  return (
    <footer className="border-t border-[#C5C4DA]/60 bg-[#EEF2F6]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4 md:px-8">
        <div>
          <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold text-[#0001B1]">
            <Landmark className="h-5 w-5" aria-hidden="true" />
            PayTraka
          </Link>
          <p className="mt-6 text-sm leading-6 text-[#66728A]">
            © 2026 PayTraka. Professional Tax Compliance Disclaimer: PayTraka is an e-invoicing readiness platform aligned with FIRS/NRS workflows.
          </p>
        </div>
        {links.slice(0, 2).map(([label, href]) => (
          <a key={label} href={href} className="text-base font-medium text-[#66728A] transition hover:text-[#0001B1]">
            {label}
          </a>
        ))}
        <div className="grid gap-5">
          {links.slice(2).map(([label, href]) => (
            <a key={label} href={href} className="text-base font-medium text-[#66728A] transition hover:text-[#0001B1]">
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function ActionLink({ children, href = "#", variant = "primary" }: { children: React.ReactNode; href?: string; variant?: "primary" | "secondary" }) {
  return (
    <a
      href={href}
      className={cx(
        "inline-flex min-h-12 items-center justify-center rounded-lg px-6 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1117E8]",
        variant === "primary" ? "bg-[#1117E8] text-white shadow-[0_12px_28px_rgba(17,23,232,0.18)] hover:bg-[#0001B1]" : "border border-[#D7DEE8] bg-white text-[#0001B1] hover:border-[#1117E8]",
      )}
    >
      {children}
    </a>
  );
}

function IconBadge({ icon: Icon, dark = false }: { icon: LucideIcon; dark?: boolean }) {
  return (
    <span className={cx("inline-flex h-12 w-12 items-center justify-center rounded-xl", dark ? "bg-white/10 text-white" : "bg-[#EEF1FF] text-[#1117E8]")}>
      <Icon size={22} aria-hidden="true" />
    </span>
  );
}

export function ProductPage() {
  const cards = [
    {
      icon: Building2,
      title: "Business Onboarding",
      body: "Seamlessly register multiple business entities. Input key details, configure tax profiles, and map organizational structures with our guided, multi-step onboarding flow designed for minimal friction.",
      meta: "Multi-entity Support Ready",
    },
    {
      icon: UsersRound,
      title: "Customer & Supplier Management",
      body: "Maintain a centralized directory of all your trading partners. Validate TINs instantly, manage contact details, and organize accounts to ensure every invoice generated is routed and reported accurately.",
      meta: "Instant TIN Verification",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <SiteNavbar active="product" />
      <main>
        <section className="px-5 py-24 text-center md:px-8">
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-tight text-[#191C1E] md:text-6xl">
            Comprehensive Tax Compliance Features
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-[#454557]">
            PayTraka streamlines your entire invoicing and compliance workflow. From business onboarding to FIRS/NRS validation, everything is designed for accuracy, speed, and institutional trust.
          </p>
        </section>
        <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-24 md:grid-cols-3 md:px-8">
          {cards.map(({ icon, title, body, meta }) => (
            <article key={title} className="rounded-xl border border-[#D7DEE8] bg-white p-7 shadow-sm">
              <IconBadge icon={icon} />
              <h2 className="mt-8 text-2xl font-bold text-[#191C1E]">{title}</h2>
              <p className="mt-4 text-base leading-7 text-[#454557]">{body}</p>
              <p className="mt-7 border-t border-[#D7DEE8] pt-4 text-sm font-semibold text-[#66728A]">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#12A65A]" />
                {meta}
              </p>
            </article>
          ))}
          <article className="rounded-xl border border-[#D7DEE8] bg-white p-7 shadow-sm md:col-span-2">
            <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
              <div>
                <IconBadge icon={FileText} />
                <h2 className="mt-8 text-2xl font-bold text-[#191C1E]">Sales & Purchase Invoices</h2>
                <p className="mt-4 text-base leading-7 text-[#454557]">
                  Create professional, compliant sales and purchase invoices with ease. Our intelligent form layouts automatically calculate taxes, handle line items with precision, and support various currency formats.
                </p>
                <a href="/solutions" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#0001B1]">
                  Explore Invoice Templates <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
              <div className="rounded-xl border border-[#D7DEE8] bg-[#F7F9FB] p-5">
                <div className="h-2 w-24 rounded-full bg-[#D8DEE3]" />
                <div className="mt-5 h-9 rounded bg-[#E1E5E8]" />
                <div className="mt-3 h-9 w-4/5 rounded bg-[#E1E5E8]" />
                <div className="mt-8 flex justify-end gap-3">
                  <div className="h-8 w-20 rounded bg-[#D8DEE3]" />
                  <div className="h-8 w-20 rounded bg-[#1117E8]" />
                </div>
              </div>
            </div>
          </article>
          <article className="rounded-xl bg-[#0001B1] p-7 text-white shadow-[0_18px_45px_rgba(17,23,232,0.24)]">
            <IconBadge icon={FileCheck2} dark />
            <h2 className="mt-8 text-2xl font-bold">Invoice Validation</h2>
            <p className="mt-5 text-base leading-8 text-white/90">
              Ensure every document meets strict regulatory standards before submission. Our pre-validation engine checks for required fields, accurate tax computations, and formatting errors.
            </p>
            <p className="mt-8 inline-flex rounded bg-white/15 px-3 py-1 text-sm font-semibold">Pre-check Active</p>
          </article>
          <article className="rounded-xl border border-[#D7DEE8] bg-white p-7 shadow-sm md:col-span-2">
            <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
              <div className="rounded-xl border border-[#D7DEE8] bg-[#F7F9FB] p-5">
                {["Invoice Generated", "Submitting to FIRS", "NRS Validated"].map((step, index) => (
                  <div key={step} className="flex gap-4 pb-5 last:pb-0">
                    <span className={cx("mt-1 h-6 w-6 rounded-full border-2", index < 2 ? "border-[#1117E8] bg-[#1117E8]" : "border-[#D7DEE8]")} />
                    <p className={cx("font-bold", index === 2 ? "text-[#66728A]" : "text-[#191C1E]")}>{step}</p>
                  </div>
                ))}
              </div>
              <div>
                <IconBadge icon={CheckCircle2} />
                <h2 className="mt-8 text-2xl font-bold text-[#191C1E]">FIRS/NRS Submission Tracking</h2>
                <p className="mt-4 text-base leading-7 text-[#454557]">
                  Track the lifecycle of every invoice submitted to the Federal Inland Revenue Service and the National Record System in real-time. View clear status updates from Draft to Validated or Failed.
                </p>
              </div>
            </div>
          </article>
          <article className="rounded-xl border border-[#D7DEE8] bg-white p-7 shadow-sm">
            <IconBadge icon={BarChart3} />
            <h2 className="mt-8 text-2xl font-bold text-[#191C1E]">Reports & Audit Trail</h2>
            <p className="mt-4 text-base leading-7 text-[#454557]">
              Generate comprehensive compliance reports and maintain an immutable audit trail of all actions. Crucial for internal reviews and official tax audits.
            </p>
            <p className="mt-7 border-t border-[#D7DEE8] pt-4 text-sm font-semibold text-[#66728A]">Immutable Log</p>
          </article>
        </section>
      </main>
      <SimpleFooter />
    </div>
  );
}

export function SolutionsPage() {
  const pipeline = [
    ["Draft", "Standardize invoice data structure prior to schema validation.", FileText, true],
    ["Validated", "Algorithmic check against FIRS schema parameters.", FileCheck2, true],
    ["Sent", "Dispatch to client via secure cryptographic link.", Send, false],
    ["Submitted", "Official transmission to FIRS/NRS portal.", Landmark, false],
  ] as const;

  return (
    <div className="min-h-screen bg-white">
      <SiteNavbar active="solutions" />
      <main>
        <section className="px-5 py-20 text-center md:px-8">
          <span className="inline-flex rounded-full border border-[#C5C4DA] bg-[#EEF1FF] px-4 py-2 text-sm font-bold text-[#0001B1]">
            FIRS Compliant Infrastructure
          </span>
          <h1 className="mx-auto mt-8 max-w-5xl text-5xl font-extrabold leading-tight text-[#121B3A] md:text-6xl">
            Institutional Precision for <span className="text-[#0001B1]">E-Invoicing Readiness</span>
          </h1>
          <p className="mx-auto mt-8 max-w-4xl text-xl leading-9 text-[#66728A]">
            Navigate the complexities of FIRS/NRS mandates with a structured, transparent workflow. From initial draft to official submission, PayTraka ensures every byte of financial data is compliant.
          </p>
        </section>
        <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold text-[#121B3A]">Document Lifecycle Pipeline</h2>
            <p className="hidden font-bold text-[#66728A] sm:block">Standard Operating Procedure</p>
          </div>
          <div className="mt-8 rounded-xl border border-[#D7DEE8] bg-white p-8">
            <div className="grid gap-8 md:grid-cols-4">
              {pipeline.map(([title, body, Icon, active]) => (
                <article key={title} className="relative text-center">
                  <IconBadge icon={Icon} />
                  <h3 className="mt-5 text-lg font-bold text-[#121B3A]">{title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-[#66728A]">{body}</p>
                  {active && title === "Validated" ? <span className="mt-3 inline-flex rounded bg-green-100 px-3 py-1 text-sm font-bold text-green-700">Pre-cleared</span> : null}
                </article>
              ))}
            </div>
          </div>
          <div className="mt-20 grid gap-8 lg:grid-cols-2">
            <article className="rounded-xl border border-[#D7DEE8] bg-white p-8">
              <IconBadge icon={FileSearch} />
              <h2 className="mt-8 text-3xl font-bold text-[#121B3A]">Invoice Validation Pathway</h2>
              <p className="mt-5 text-lg leading-8 text-[#66728A]">
                Mitigate compliance risk before submission. Our rigorous validation engine pre-flights every document against the latest FIRS technical specifications, ensuring zero formatting rejections.
              </p>
              <div className="mt-14 space-y-6">
                {["Real-time Schema Auditing", "Tax Calculation Verification"].map((item) => (
                  <p key={item} className="flex gap-4 font-bold text-[#121B3A]">
                    <CheckCircle2 className="h-6 w-6 text-[#1117E8]" aria-hidden="true" />
                    {item}
                  </p>
                ))}
              </div>
            </article>
            <article className="rounded-xl bg-[#12172F] p-8 text-white">
              <IconBadge icon={CloudUpload} dark />
              <h2 className="mt-8 text-3xl font-bold">FIRS/NRS Submission Pathway</h2>
              <p className="mt-5 text-lg leading-8 text-white/78">
                Execute seamless, direct transmission of validated invoices to the National Record System. Receive official digital receipts and cryptographic stamps instantly.
              </p>
              <div className="mt-9 space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-white/15 bg-white/5 p-4">
                  <span className="flex items-center gap-3 font-bold"><KeyRound className="text-green-400" aria-hidden="true" /> Direct API Integration</span>
                  <span className="rounded bg-green-500/20 px-3 py-1 text-sm font-bold text-green-400">Active</span>
                </div>
                <div className="rounded-lg border border-white/15 bg-white/5 p-4 font-bold">Automated Receipt Retrieval</div>
              </div>
            </article>
          </div>
        </section>
      </main>
      <SimpleFooter />
    </div>
  );
}

export function PricingPage() {
  const plans = [
    ["Starter", "Essential invoicing tools for emerging SMEs.", "₦0", "/month", ["Up to 50 invoices/month", "Basic customer directory", "Standard PDF exports"], false],
    ["Compliance Pro", "Automated validation & tracking for growing businesses.", "₦15,000", "/month", ["Direct FIRS API Integration", "Unlimited invoices", "Real-time status badges", "Automated tax calculations"], true],
    ["Enterprise", "Multi-client management for financial consultants.", "Custom", "", ["Everything in Pro", "Multi-entity dashboard", "Dedicated account manager", "Custom API limits"], false],
  ] as const;

  return (
    <div className="min-h-screen bg-white">
      <SiteNavbar active="pricing" />
      <main className="px-5 py-24 md:px-8">
        <section className="mx-auto max-w-7xl text-center">
          <h1 className="mx-auto max-w-5xl text-5xl font-extrabold leading-tight text-[#121B3A] md:text-6xl">
            Transparent pricing for <span className="text-[#0001B1]">seamless compliance.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-3xl text-xl leading-8 text-[#66728A]">
            Choose the right plan to align your invoicing with FIRS regulations. Simple, predictable, and built for businesses scaling in Nigeria.
          </p>
          <div className="mt-20 grid gap-8 text-left lg:grid-cols-3">
            {plans.map(([name, body, price, suffix, features, popular]) => (
              <article key={name} className={cx("relative rounded-xl border bg-white p-8", popular ? "border-[#1117E8] shadow-[0_18px_45px_rgba(17,23,232,0.15)]" : "border-[#D7DEE8]")}>
                {popular ? <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1117E8] px-5 py-1 text-xs font-bold tracking-wide text-white">MOST POPULAR</span> : null}
                <h2 className="text-3xl font-bold text-[#121B3A]">{name}</h2>
                <p className="mt-4 text-lg leading-7 text-[#66728A]">{body}</p>
                <p className="mt-8 text-[#121B3A]"><span className="text-4xl font-extrabold">{price}</span><span className="ml-2 text-base text-[#66728A]">{suffix}</span></p>
                <ul className="mt-8 space-y-4">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-base text-[#454557]">
                      <CheckCircle2 className="h-5 w-5 text-[#1117E8]" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <ActionLink href="#contact" variant={popular ? "primary" : "secondary"}>{popular ? "Get started" : name === "Enterprise" ? "Contact Sales" : "Get started"}</ActionLink>
              </article>
            ))}
          </div>
        </section>
        <section className="mx-auto mt-24 max-w-4xl border-t border-[#D7DEE8] pt-20">
          <h2 className="text-center text-4xl font-bold text-[#121B3A]">Frequently Asked Questions</h2>
          <div className="mt-10 space-y-5">
            {[
              ["How does FIRS validation work?", "On the Compliance Pro plan, PayTraka automatically routes your generated invoices through approved integration pathways to receive validation before sending to your client."],
              ["Can I upgrade from Starter to Pro later?", "Yes, you can seamlessly upgrade at any point. Your existing invoicing data will remain available for compliance tracking."],
              ["Is my financial data secure?", "Absolutely. We use strong encryption patterns and maintain strict adherence to Nigerian data protection expectations."],
            ].map(([q, a]) => (
              <article key={q} className="rounded-lg border border-[#D7DEE8] bg-white p-6">
                <h3 className="font-bold text-[#121B3A]">{q}</h3>
                <p className="mt-4 text-lg leading-8 text-[#66728A]">{a}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SimpleFooter />
    </div>
  );
}

export function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <SiteNavbar active="resources" />
      <main>
        <section className="border-b border-[#D7DEE8] bg-[#F4F6FF] px-5 py-24 text-center md:px-8">
          <h1 className="text-5xl font-extrabold text-[#0001B1] md:text-6xl">Resources & Support</h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-[#454557]">
            Everything you need to master PayTraka and ensure complete FIRS/NRS compliance for your business.
          </p>
          <label className="mx-auto mt-10 flex max-w-2xl items-center gap-4 rounded-lg border border-[#D7DEE8] bg-white px-5 py-4 text-left">
            <Search className="text-[#66728A]" aria-hidden="true" />
            <span className="sr-only">Search resources</span>
            <input className="w-full bg-transparent text-base outline-none placeholder:text-[#757588]" placeholder="Search guides, FAQs, and documentation..." />
          </label>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <h2 className="flex items-center gap-4 text-3xl font-bold text-[#191C1E]">
            <ShieldCheck className="text-[#1294D8]" aria-hidden="true" /> FIRS/NRS Readiness Guide
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <article className="rounded-xl border border-[#D7DEE8] bg-white p-7">
              <span className="rounded-full bg-[#EEF1FF] px-4 py-2 text-sm font-bold text-[#0001B1]">Complete Guide</span>
              <h3 className="mt-7 text-3xl font-bold">Transitioning to e-Invoicing</h3>
              <p className="mt-4 text-lg leading-8 text-[#454557]">
                A step-by-step roadmap for SMEs to migrate from manual invoicing to full FIRS compliance using PayTraka. Learn about required documentation and technical prerequisites.
              </p>
              <a href="#" className="mt-7 inline-flex items-center gap-2 font-bold text-[#0001B1]">Read Full Guide <ArrowRight size={16} aria-hidden="true" /></a>
            </article>
            <article className="rounded-xl border border-[#D7DEE8] bg-white p-7">
              <IconBadge icon={ShieldCheck} />
              <h3 className="mt-6 text-xl font-bold">Compliance Checklist</h3>
              <p className="mt-4 text-base leading-7 text-[#454557]">Ensure your business meets all mandatory FIRS requirements.</p>
              <a href="#" className="mt-6 inline-block font-bold text-[#0001B1]">Download PDF</a>
            </article>
            <article className="rounded-xl border border-[#D7DEE8] bg-white p-7">
              <IconBadge icon={Gauge} />
              <h3 className="mt-6 text-xl font-bold">Integration Specs</h3>
              <p className="mt-4 text-base leading-7 text-[#454557]">Technical documentation for connecting your existing ERP.</p>
              <a href="/solutions" className="mt-6 inline-block font-bold text-[#0001B1]">View Docs</a>
            </article>
            <article className="flex flex-col justify-between gap-6 rounded-xl border border-[#D7DEE8] bg-white p-7 md:flex-row md:items-center">
              <div>
                <h3 className="text-xl font-bold">Upcoming Webinar: Navigating NRS Updates</h3>
                <p className="mt-3 text-base text-[#454557]">Join our tax experts on Oct 15th for a live Q&A.</p>
              </div>
              <ActionLink href="/company#contact" variant="secondary">Register</ActionLink>
            </article>
          </div>
        </section>
        <section className="bg-[#EEF2F6] px-5 py-20 md:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold">Help Center</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [UsersRound, "Account Setup", "Manage profile, security, and team access."],
                [FileText, "Creating Invoices", "Templates, line items, and tax calculations."],
                [Send, "Submission & Validation", "Understanding status codes and FIRS responses."],
                [BarChart3, "Reports & Analytics", "Exporting data and reading compliance summaries."],
              ].map(([Icon, title, body]) => (
                <article key={title as string} className="rounded-xl border border-[#D7DEE8] bg-white p-7">
                  <IconBadge icon={Icon as LucideIcon} />
                  <h3 className="mt-6 font-bold">{title as string}</h3>
                  <p className="mt-4 text-base leading-7 text-[#454557]">{body as string}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SimpleFooter />
    </div>
  );
}

export function CompanyPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <SiteNavbar active="company" />
      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <h1 className="text-5xl font-extrabold leading-tight text-[#191C1E] md:text-6xl">
              Simplifying Tax Compliance for Nigerian Businesses.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#66728A]">
              PayTraka is built to bring institutional trust and technical precision to everyday operations. We empower SMEs to transition seamlessly from manual records to digital, FIRS-aligned compliance.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <ActionLink href="#contact">Book a Demo</ActionLink>
              <ActionLink href="/resources" variant="secondary">Learn More</ActionLink>
            </div>
          </div>
          <div className="min-h-[320px] overflow-hidden rounded-xl bg-[linear-gradient(135deg,rgba(0,1,177,0.22),rgba(18,148,216,0.16)),url('https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center shadow-sm" role="img" aria-label="Business team reviewing compliance data around a laptop" />
        </section>
        <section className="border-y border-[#D7DEE8] bg-[#EEF2F6] px-5 py-20 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Our Mission</h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#66728A]">
                To build the infrastructural bridge that allows Nigerian enterprises to operate with full regulatory transparency without operational friction.
              </p>
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {[
                [ShieldCheck, "Institutional Trust", "Aligned directly with FIRS/NRS regulations, our platform helps every invoice generated stay compliance-ready from day one."],
                [Gauge, "Technical Precision", "Fast, reliable API pathways and robust cloud architecture."],
                [Building2, "Operational Clarity", "Complex data presented simply."],
              ].map(([Icon, title, body]) => (
                <article key={title as string} className="rounded-xl border border-[#D7DEE8] bg-white p-8 shadow-sm">
                  <IconBadge icon={Icon as LucideIcon} />
                  <h3 className="mt-6 text-2xl font-bold">{title as string}</h3>
                  <p className="mt-4 text-base leading-7 text-[#66728A]">{body as string}</p>
                </article>
              ))}
              <article className="rounded-xl bg-[#0001B1] p-8 text-white shadow-xl lg:col-span-2">
                <h3 className="text-2xl font-bold">Ready to modernize?</h3>
                <p className="mt-4 max-w-xl text-base leading-7 text-white/85">Join hundreds of businesses utilizing PayTraka for seamless e-invoicing.</p>
                <div className="mt-7"><ActionLink href="#contact" variant="secondary">Contact Sales</ActionLink></div>
              </article>
            </div>
          </div>
        </section>
        <section id="contact" className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-bold">Get in Touch</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#66728A]">
              Whether you need a full platform demo or have specific questions about FIRS integration, our team is ready to assist.
            </p>
            <div className="mt-8 space-y-7">
              {[
                [MapPin, "Lagos Office", "12 Compliance Avenue, Victoria Island\nLagos, Nigeria"],
                [Mail, "Email Support", "enterprise@paytraka.com\nsupport@paytraka.com"],
                [Phone, "Phone", "+234 (0) 800 000 0000"],
              ].map(([Icon, title, body]) => (
                <div key={title as string} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D7DEE8] bg-white text-[#1117E8]">
                    {Icon ? <Icon size={18} aria-hidden="true" /> : null}
                  </span>
                  <div>
                    <p className="font-bold">{title as string}</p>
                    <p className="whitespace-pre-line text-base leading-7 text-[#66728A]">{body as string}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <form className="rounded-xl border border-[#D7DEE8] bg-white p-8 shadow-[0_18px_45px_rgba(25,28,30,0.08)]">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="First Name" placeholder="Jane" />
              <Input label="Last Name" placeholder="Doe" />
            </div>
            <Input label="Work Email" placeholder="jane@company.com" type="email" />
            <Input label="Company Name" placeholder="Enterprise Ltd." />
            <label className="mt-5 block text-sm font-medium text-[#454557]">
              Message
              <textarea className="mt-2 min-h-32 w-full rounded-lg border border-[#D7DEE8] bg-[#F7F9FB] px-4 py-3 text-base outline-none focus:border-[#1117E8]" placeholder="How can we help you achieve compliance?" />
            </label>
            <button type="submit" className="mt-5 w-full rounded-lg bg-[#1117E8] px-5 py-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(17,23,232,0.18)] transition hover:bg-[#0001B1]">
              Send Message
            </button>
          </form>
        </section>
      </main>
      <SimpleFooter />
    </div>
  );
}

function Input({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="mt-5 block text-sm font-medium text-[#454557] first:mt-0">
      {label}
      <input type={type} placeholder={placeholder} className="mt-2 h-12 w-full rounded-lg border border-[#D7DEE8] bg-[#F7F9FB] px-4 text-base outline-none focus:border-[#1117E8]" />
    </label>
  );
}
