"use client";

import {
  BarChart3,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FilePlus2,
  FileText,
  Home,
  Landmark,
  Link as LinkIcon,
  LogOut,
  MessageSquare,
  Package,
  ReceiptText,
  Send,
  Settings,
  Truck,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { resetOnboardingState } from "@/lib/onboarding-store";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home, matches: ["/dashboard"] },
  { label: "Create Invoice", href: "/dashboard/invoices/create", icon: FilePlus2, matches: ["/dashboard/invoices/create"] },
  { label: "Validate Invoice Data", href: "/dashboard/compliance/validate", icon: ClipboardCheck, matches: ["/dashboard/compliance", "/dashboard/compliance/validate"] },
  { label: "Send Invoices", href: "/dashboard/invoices/sales", icon: Send, matches: ["/dashboard/invoices", "/dashboard/invoices/sales"] },
  { label: "Submit to FIRS/NRS", href: "/dashboard/compliance/submit", icon: Landmark, matches: ["/dashboard/compliance/submit"] },
  { label: "Submission Status", href: "/dashboard/compliance/status", icon: FileCheck2, matches: ["/dashboard/compliance/status"] },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Suppliers", href: "/dashboard/suppliers", icon: Truck },
  { label: "Receipts", href: "/dashboard/receipts", icon: ReceiptText },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Payment Links", href: "/dashboard/payment-links", icon: LinkIcon },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { label: "Invoice Templates", href: "/dashboard/templates", icon: FileText },
  { label: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
  { label: "Support", href: "/dashboard/support", icon: MessageSquare },
];

function isActiveRoute(pathname: string, href: string, matches?: string[]) {
  if (matches) return matches.some((match) => pathname === match);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = () => {
    resetOnboardingState();
    window.localStorage.removeItem("paytraka_user");
    router.push("/login");
  };

  const sidebar = (
    <aside className="flex h-full min-h-screen w-[272px] flex-col border-r border-[#C5C4DA] bg-white px-5 py-7">
      <div className="flex items-start justify-between gap-3">
        <Link href="/dashboard" className="inline-flex">
          <Image src="/paytraka_logo/paytraka-logo-transparent.png" alt="PayTraka" width={132} height={38} className="h-8 w-auto object-contain" priority />
        </Link>
        <button type="button" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button>
      </div>
      <p className="mt-1 text-sm font-semibold text-[#454557]">Business Account</p>

      <nav className="mt-7 flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map(({ label, href, icon: Icon, matches }) => {
          const active = isActiveRoute(pathname, href, matches);
          return (
            <Link key={label} href={href} onClick={() => setOpen(false)} className={`relative flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${active ? "bg-[#DADEFD] text-[#0001B1]" : "text-[#454557] hover:bg-[#F1F4F8]"}`}>
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span>{label}</span>
              {active ? <span className="absolute right-0 top-2 h-6 w-1 rounded-l-full bg-[#1117E8]" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 border-t border-[#C5C4DA] pt-5">
        <Link href="/dashboard/reports" className="mb-3 flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#1117E8] px-3 text-xs font-bold text-white shadow-[0_8px_20px_rgba(17,23,232,0.16)]">
          <FileCheck2 className="h-3.5 w-3.5" /> File Monthly Return
        </Link>
        <Link href="/dashboard/settings" className="flex min-h-8 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-[#454557] hover:bg-[#F1F4F8]">
          <Settings className="h-3.5 w-3.5" /> Settings
        </Link>
        <button type="button" onClick={logout} className="flex min-h-8 w-full items-center gap-2 rounded-lg px-3 text-xs font-semibold text-[#454557] hover:bg-[#F1F4F8]">
          <LogOut className="h-3.5 w-3.5" /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">{sidebar}</div>
      {open ? <div className="fixed inset-0 z-50 bg-black/30 lg:hidden" onClick={() => setOpen(false)}><div className="h-full" onClick={(e) => e.stopPropagation()}>{sidebar}</div></div> : null}
    </>
  );
}
