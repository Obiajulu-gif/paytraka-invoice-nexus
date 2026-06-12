import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BellRing,
  BookOpen,
  Boxes,
  Building2,
  Check,
  CircleAlert,
  ClipboardCheck,
  DatabaseZap,
  FileCheck2,
  FileText,
  FileWarning,
  Gauge,
  Headphones,
  Landmark,
  LayoutDashboard,
  Menu,
  ReceiptText,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TestTube2,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/product" },
  { label: "Pricing", href: "/pricing" },
  { label: "Solutions", href: "/solutions" },
  { label: "Resources", href: "/resources" },
  { label: "Company", href: "/company" },
];

const painPoints = [
  {
    icon: FileWarning,
    title: "Poor Record Keeping",
    description:
      "Inconsistent tracking makes it impossible to generate the structured data required for FIRS submission.",
  },
  {
    icon: ShieldAlert,
    title: "Compliance Pressure",
    description:
      "Ongoing regulatory shifts demand real-time validation which manual systems cannot handle.",
  },
  {
    icon: BookOpen,
    title: "No Accounting System",
    description:
      "Many SMEs rely on paper or Excel, lacking the digital infrastructure for automated e-invoicing.",
  },
  {
    icon: Boxes,
    title: "Scattered Tools",
    description:
      "Switching between multiple apps creates errors and leads to failed validation attempts.",
  },
];

const workflow = [
  ["Register", "Create your secure business profile."],
  ["Add Customers", "Import or create tax-verified clients."],
  ["Create Invoice", "Input sales details via smart forms."],
  ["Validate", "Run pre-checks against NRS rules."],
  ["Send/Submit", "Execute final delivery and reporting."],
  ["Track", "Monitor status in real-time."],
];

const features: Array<{ icon: LucideIcon; title: string; description: string }> = [
  { icon: Sparkles, title: "Easy Onboarding", description: "Step-by-step setup for your VAT and TIN credentials." },
  { icon: UsersRound, title: "Customer CRM", description: "Store client tax details for recurring invoice accuracy." },
  { icon: Banknote, title: "Sales Management", description: "Track every revenue stream with compliant categorization." },
  { icon: ReceiptText, title: "Purchase Ledger", description: "Record incoming invoices to claim input tax credits." },
  { icon: Boxes, title: "Product Catalog", description: "Standardize goods/services with correct HS codes." },
  { icon: ShieldCheck, title: "Auto-Validation", description: "Real-time flagging of syntax or calculation errors." },
  { icon: Gauge, title: "Live Tracking", description: "Visual confirmation of FIRS/NRS portal acceptance." },
  { icon: TestTube2, title: "Test/Live Modes", description: "Safe sandbox for training before actual submission." },
  { icon: FileCheck2, title: "Digital Receipts", description: "Generate professional, FIRS-format digital receipts." },
  { icon: LayoutDashboard, title: "VAT Reports", description: "Instant generation of summary sheets for audit." },
  { icon: FileText, title: "Smart Templates", description: "Industry-specific layouts for hotels, retail, etc." },
  { icon: Headphones, title: "Expert Support", description: "Access to Nigerian tax consultants via live chat." },
];

const pricing = [
  {
    name: "Starter",
    price: "₦5k",
    suffix: "/mo",
    features: ["Up to 50 Invoices/mo", "Basic Validation", "1 User Access"],
    cta: "Choose Starter",
    highlighted: false,
  },
  {
    name: "Compliance Pro",
    price: "₦15k",
    suffix: "/mo",
    features: ["Unlimited Invoices", "Priority FIRS Submission", "5 Team Members", "Advance Reports"],
    cta: "Choose Pro",
    highlighted: true,
  },
  {
    name: "Consultant",
    price: "Custom",
    suffix: "",
    features: ["Manage Multi-clients", "White-label Reports", "API Integration Access"],
    cta: "Talk to Sales",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "Is PayTraka approved by the FIRS?",
    answer:
      "PayTraka is positioned as an e-invoicing readiness and compliance workflow platform. It can be configured to integrate with approved APP/SI providers or prepared for future accreditation workflows. It should not be presented as already approved unless that status has been officially confirmed.",
  },
  {
    question: "Can I integrate this with my existing ERP?",
    answer:
      "Yes. PayTraka should support integration pathways for accounting tools, ERPs, POS systems, and custom APIs, depending on the business setup.",
  },
  {
    question: "Do I need a tax consultant to use PayTraka?",
    answer:
      "No. Businesses can use PayTraka directly, while tax consultants can use the consultant dashboard to manage multiple taxpayer clients.",
  },
];

function ButtonLink({
  children,
  href = "#",
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "light";
  className?: string;
}) {
  const variants = {
    primary: "bg-[#1117E8] text-white shadow-[0_14px_32px_rgba(17,23,232,0.22)] hover:bg-[#0001B1]",
    secondary: "border border-[#C5C4DA] bg-white text-[#191C1E] hover:border-[#1117E8] hover:text-[#0001B1]",
    light: "bg-white text-[#0001B1] hover:bg-[#DADEFD]",
  };

  return (
    <a
      className={`inline-flex min-h-12 items-center justify-center rounded-lg px-6 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1117E8] ${variants[variant]} ${className}`}
      href={href}
    >
      {children}
    </a>
  );
}

function SectionHeader({
  title,
  description,
  align = "center",
}: {
  title: string;
  description: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <h2 className="text-3xl font-bold tracking-normal text-[#191C1E] md:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-[#454557]">{description}</p>
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#C5C4DA]/60 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8" aria-label="Main navigation">
        <Link href="/" className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1117E8]">
          <Image src="/paytraka_logo/paytraka-logo-navbar.png" alt="PayTraka" width={130} height={36} className="h-8 w-auto" priority />
        </Link>
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-[#191C1E] transition hover:text-[#0001B1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1117E8]">
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a href="/company#contact" className="hidden text-sm font-semibold text-[#191C1E] transition hover:text-[#0001B1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1117E8] sm:inline-flex">
            Sign in
          </a>
          <ButtonLink className="min-h-10 px-5 text-xs" href="/company#contact">
            Get started
          </ButtonLink>
          <details className="group relative lg:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-[#C5C4DA] bg-white text-[#0001B1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1117E8]" aria-label="Open navigation menu">
              <Menu aria-hidden="true" size={18} />
            </summary>
            <div className="absolute right-0 mt-3 w-56 rounded-xl border border-[#C5C4DA] bg-white p-3 shadow-xl">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="block rounded-lg px-3 py-3 text-sm font-medium text-[#191C1E] hover:bg-[#F7F9FB] hover:text-[#0001B1]">
                  {link.label}
                </a>
              ))}
              <a href="/company#contact" className="block rounded-lg px-3 py-3 text-sm font-medium text-[#191C1E] hover:bg-[#F7F9FB] hover:text-[#0001B1]">
                Sign in
              </a>
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}

function InvoiceMockup() {
  const timeline = ["Created", "Validated", "Sent", "Submitted"];

  return (
    <div className="relative mx-auto w-full max-w-xl rounded-2xl border border-white/80 bg-white/85 p-5 shadow-[0_24px_60px_rgba(25,28,30,0.18)] backdrop-blur md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-[#191C1E]">Invoice Detail</p>
          <p className="mt-1 text-sm text-[#454557]">INV-2026-0042</p>
        </div>
        <span className="rounded-full bg-[#DADEFD] px-4 py-2 text-xs font-bold text-[#0001B1]">Status: Ready</span>
      </div>
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase text-[#757588]">Client</p>
        <p className="mt-2 text-xl font-bold text-[#0001B1]">Abuja Prime Hotels Ltd</p>
        <p className="mt-1 text-sm text-[#454557]">VAT Reg: NG-0012938481</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-[#F1F3F6] p-5">
        <div>
          <p className="text-xs font-semibold text-[#757588]">Total Amount Due</p>
          <p className="mt-1 text-3xl font-extrabold text-[#191C1E]">₦850,000.00</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-[#757588]">Tax Amount</p>
          <p className="mt-1 text-lg font-bold text-[#191C1E]">₦63,750.00</p>
        </div>
      </div>
      <div className="mt-7">
        <p className="text-xs font-semibold uppercase text-[#757588]">Submission Timeline</p>
        <div className="relative mt-6 grid grid-cols-4 gap-2">
          <div className="absolute left-[12%] right-[12%] top-3 h-1 bg-[#DADEFD]" aria-hidden="true" />
          <div className="absolute left-[12%] right-[37%] top-3 h-1 bg-[#1117E8]" aria-hidden="true" />
          {timeline.map((item, index) => (
            <div key={item} className="relative text-center">
              <span className={`mx-auto block h-7 w-7 rounded-full border-4 border-white ${index < 3 ? "bg-[#1117E8]" : "bg-[#DADEFD]"}`} />
              <span className="mt-2 block text-xs font-semibold text-[#454557]">{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <ButtonLink variant="secondary" className="gap-2 bg-[#DADEFD]/55 text-[#454557]" href="#">
          <Send size={16} aria-hidden="true" /> Send to Customer
        </ButtonLink>
        <ButtonLink className="gap-2" href="#">
          <Landmark size={16} aria-hidden="true" /> Submit to FIRS/NRS
        </ButtonLink>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="overflow-hidden bg-[radial-gradient(circle_at_72%_20%,#DADEFD_0,#F7F9FB_34%,#F7F9FB_100%)]">
      <div className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl items-center gap-10 px-5 py-12 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-10">
        <div>
          <span className="inline-flex rounded-full border border-[#C5C4DA] bg-[#DADEFD]/70 px-4 py-2 text-sm font-semibold text-[#0001B1]">
            E-Invoicing Readiness Platform for Nigerian Businesses
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-normal text-[#0001B1] md:text-5xl xl:text-6xl">
            Create, Validate & Submit E-Invoices with Confidence
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#454557] lg:text-lg lg:leading-8">
            Streamline your transition to the new FIRS/NRS tax framework. PayTraka provides the tools to manage your sales, purchases, and compliance reporting in one unified readiness portal.
          </p>
          <div className="mt-7 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="#">Start Free Trial</ButtonLink>
            <ButtonLink href="#" variant="secondary">
              Book a Demo
            </ButtonLink>
          </div>
        </div>
        <InvoiceMockup />
      </div>
    </section>
  );
}

function PainPointsSection() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          title="Businesses are not ready for e-invoicing compliance"
          description="Manual processes and scattered tools are the biggest barriers to meeting new regulatory standards."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {painPoints.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-xl border border-[#C5C4DA] bg-[#F7F9FB] p-6">
              <Icon className="h-7 w-7 text-[#1117E8]" aria-hidden="true" />
              <h3 className="mt-6 text-lg font-bold text-[#191C1E]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#454557]">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section className="bg-[#F1F4F8] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          title="One portal for invoice creation, validation, and compliance"
          description="PayTraka handles the heavy lifting of tax readiness in six simple steps."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:grid-cols-6">
          {workflow.map(([title, description], index) => (
            <article key={title} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1117E8] text-xl font-extrabold text-white shadow-[0_14px_30px_rgba(17,23,232,0.2)]">
                {index + 1}
              </div>
              <h3 className="mt-5 text-base font-bold text-[#191C1E]">{title}</h3>
              <p className="mt-2 text-sm leading-5 text-[#454557]">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureGridSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <SectionHeader
            align="left"
            title="Comprehensive Features for Every Tax Detail"
            description="A purpose-built toolkit for Nigerian financial controllers and small business owners."
          />
          <a href="/product" className="inline-flex items-center gap-2 text-sm font-bold text-[#0001B1] transition hover:text-[#1117E8]">
            View Detailed Specs <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <article key={title}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#DADEFD] text-[#1117E8]">
                <Icon size={18} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-bold text-[#191C1E]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#454557]">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConsultantsSection() {
  const clients = [
    ["Lagos Logistics Ltd", "100% Compliant", "bg-teal-500"],
    ["Kano Retail Hub", "3 Pending Docs", "bg-amber-500"],
    ["Enugu Agro Ventures", "100% Compliant", "bg-teal-500"],
  ];

  return (
    <section className="bg-[#0001B1] py-16 text-white md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-2 lg:items-center">
        <div className="rounded-xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <BadgeCheck size={20} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold">Tax Consultant Admin View</h2>
          </div>
          <div className="mt-8 space-y-4">
            {clients.map(([name, status, color]) => (
              <div key={name} className="rounded-lg bg-white/10 p-4">
                <p className="text-xs text-white/70">Client</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="font-semibold">{name}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${color}`}>{status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              ["12", "Active Clients"],
              ["156", "Submissions"],
              ["0", "Errors"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-2xl font-extrabold">{value}</p>
                <p className="mt-1 text-xs text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">For Tax Consultants & Accountants</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/82">
            Scale your practice by managing all your clients&apos; e-invoicing workflows from a single, professional dashboard.
          </p>
          <div className="mt-7 space-y-5">
            {[
              "Monitor Submissions: Real-time oversight of every client's FIRS/NRS filing status.",
              "Export Compliance Reports: Generate audit-ready documentation for all linked entities in bulk.",
            ].map((item) => (
              <p key={item} className="flex gap-3 text-sm leading-7 text-white/90">
                <Check className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
                {item}
              </p>
            ))}
          </div>
          <div className="mt-9">
            <ButtonLink href="/company#contact" variant="light">
              Get Consultant Access
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="bg-[#F7F9FB] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          title="Ready for every stage of your journey"
          description="Simple, transparent pricing for Nigerian businesses of all sizes."
        />
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {pricing.map((plan) => (
            <article
              key={plan.name}
              className={`relative rounded-xl border bg-white p-8 ${plan.highlighted ? "border-[#1117E8] shadow-[0_20px_45px_rgba(17,23,232,0.18)]" : "border-[#C5C4DA]"}`}
            >
              {plan.highlighted ? (
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1117E8] px-4 py-1 text-xs font-extrabold text-white">
                  MOST POPULAR
                </span>
              ) : null}
              <h3 className="text-lg font-bold text-[#191C1E]">{plan.name}</h3>
              <p className="mt-6 text-[#191C1E]">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.suffix ? <span className="ml-1 text-sm text-[#757588]">{plan.suffix}</span> : null}
              </p>
              <ul className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-[#454557]">
                    <Check className="h-5 w-5 shrink-0 text-[#1117E8]" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <ButtonLink href="#" variant={plan.highlighted ? "primary" : "secondary"} className="mt-10 w-full">
                {plan.cta}
              </ButtonLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <SectionHeader title="Frequently Asked Questions" description="" />
        <div className="mt-10 space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-lg border border-[#C5C4DA] bg-[#F7F9FB]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-[#191C1E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1117E8]">
                {faq.question}
                <span className="text-[#0001B1] transition group-open:rotate-45">+</span>
              </summary>
              <p className="border-t border-[#C5C4DA] px-5 py-4 text-sm leading-7 text-[#454557]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComplianceNotice() {
  return (
    <section className="bg-[#E8EAED] py-10">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <div className="rounded-xl border border-[#C5C4DA] bg-white p-6">
          <h2 className="flex items-center gap-3 text-sm font-bold text-[#0001B1]">
            <CircleAlert size={18} aria-hidden="true" /> Compliance & Readiness Notice
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#454557]">
            PayTraka is an independent technology platform providing readiness tools for tax compliance. We facilitate the creation, validation, and submission of data based on current Nigerian tax regulations. Users are responsible for the accuracy of data provided. PayTraka does not provide legal or professional tax advice. All logos and trademarks belong to their respective owners.
          </p>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
        <h2 className="text-4xl font-extrabold leading-tight text-[#0001B1] md:text-5xl">
          Prepare your business for e-invoicing compliance
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#454557]">
          Join hundreds of Nigerian businesses already using PayTraka to streamline their tax workflows.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <ButtonLink href="/company#contact">Start Free Trial</ButtonLink>
          <ButtonLink href="/company#contact" variant="secondary">
            Talk to Sales
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#C5C4DA] bg-[#E9EEF4]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_0.8fr_0.8fr_1.1fr] md:px-8">
        <div>
          <Image src="/paytraka_logo/paytraka-logo-navbar.png" alt="PayTraka" width={130} height={36} className="h-8 w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#454557]">
            The trusted e-invoicing readiness platform for the Nigerian business ecosystem.
          </p>
        </div>
        <FooterLinks
          title="Product"
          links={[
            ["Features", "/product"],
            ["Pricing", "/pricing"],
            ["For Consultants", "/company#contact"],
          ]}
        />
        <FooterLinks
          title="Company"
          links={[
            ["About Us", "/company"],
            ["Contact", "/company#contact"],
            ["Privacy Policy", "#"],
          ]}
        />
        <div>
          <p className="text-sm font-bold text-[#0001B1]">Newsletter</p>
          <p className="mt-4 text-sm text-[#454557]">Stay updated on Nigerian tax compliance.</p>
          <form className="mt-4 flex max-w-sm rounded-lg border border-[#C5C4DA] bg-white p-1">
            <label htmlFor="newsletter-email" className="sr-only">
              Email
            </label>
            <input id="newsletter-email" type="email" placeholder="Email" className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[#757588]" />
            <button type="submit" className="rounded-md bg-[#1117E8] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0001B1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1117E8]">
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-[#C5C4DA] px-5 py-6 text-center text-xs text-[#454557]">
        © 2026 PayTraka Tax Compliance. All rights reserved. Registered in Nigeria.
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="text-sm font-bold text-[#0001B1]">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="text-sm text-[#454557] transition hover:text-[#0001B1]">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <Navbar />
      <main>
        <HeroSection />
        <PainPointsSection />
        <WorkflowSection />
        <FeatureGridSection />
        <ConsultantsSection />
        <PricingSection />
        <FAQSection />
        <ComplianceNotice />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
