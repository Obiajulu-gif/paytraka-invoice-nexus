"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  Menu,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getCurrentUser, isAuthenticated, logout } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/services/authService";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Track revenue, invoices, customers, and payments.",
  },
  "/customers": {
    title: "Customers",
    description: "Manage customer records and billing details.",
  },
  "/products": {
    title: "Products & Services",
    description: "Keep your billable catalog organized.",
  },
  "/invoices": {
    title: "Invoices",
    description: "Create compliant invoices faster.",
  },
  "/receipts": {
    title: "Receipts",
    description: "Record payments and keep invoice status current.",
  },
  "/adjustments": {
    title: "Credit/Debit Notes",
    description: "Track reductions and additions to invoice amounts.",
  },
  "/reports": {
    title: "Reports",
    description: "Understand business performance with clarity.",
  },
  "/settings": {
    title: "Settings",
    description: "Configure business profile, tax, and document defaults.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const authed = isAuthenticated();
    setAuthenticated(authed);
    setUser(authed ? getCurrentUser() : null);
    setCheckingAuth(false);

    if (!authed && pathname !== "/login") {
      router.replace("/login");
    }
  }, [pathname, router]);

  const page = useMemo(
    () =>
      pageTitles[pathname] || {
        title: "Paytraka Invoice Nexus",
        description: "Manage your invoicing workspace.",
      },
    [pathname],
  );

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    router.replace("/login");
  };

  if (checkingAuth || !authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">
        <AppSidebar onLogout={handleLogout} />
      </div>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-0 p-0">
                <AppSidebar
                  onLogout={handleLogout}
                  onNavigate={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                {page.title}
              </h1>
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                {page.description}
              </p>
            </div>

            <div className="hidden w-full max-w-sm items-center md:flex">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search invoices, customers..."
                  className="h-10 rounded-full border-slate-200 bg-slate-50 pl-9"
                />
              </div>
            </div>

            <Button
              className="hidden bg-primary text-white hover:bg-primary/90 sm:inline-flex"
              onClick={() => router.push("/invoices")}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>

            <Button variant="outline" size="icon" className="rounded-full">
              <Bell className="h-4 w-4" />
            </Button>

            <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-sm sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <p className="max-w-32 truncate text-sm font-medium text-slate-900">
                  {user?.businessName || user?.name || "Paytraka Admin"}
                </p>
                <div className="flex items-center gap-1 text-xs text-primary">
                  <ShieldCheck className="h-3 w-3" />
                  Verified workspace
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
