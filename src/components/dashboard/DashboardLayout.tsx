"use client";

import { Bell, HelpCircle, Menu, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getOnboardingState } from "@/lib/onboarding-store";
import { PAYTRAKA_COLORS } from "./types";
import { Sidebar } from "./Sidebar";
import { StatusBadge } from "./ui";

const stepRoutes: Record<string, string> = {
  "business-details": "/onboarding/business-details",
  "tax-profile": "/onboarding/tax-profile",
  "bank-details": "/onboarding/bank-details",
  preferences: "/onboarding/preferences",
  review: "/onboarding/review",
};

function useDashboardGuard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const state = getOnboardingState();
    const storedUser = window.localStorage.getItem("paytraka_user");
    if (!storedUser && !state.signup.workEmail) {
      router.replace("/login");
      return;
    }
    if (!state.completed) {
      router.replace(stepRoutes[state.currentStep] ?? (state.signup.emailVerified ? "/onboarding/business-details" : "/login"));
      return;
    }
    setReady(true);
  }, [router]);

  return ready;
}

function EnvironmentToggle({ mode, setMode }: { mode: "test" | "live"; setMode: (mode: "test" | "live") => void }) {
  return (
    <div className="inline-grid grid-cols-2 rounded-full border border-[#C5C4DA] bg-[#E8ECF3] p-1 text-sm font-bold">
      {(["test", "live"] as const).map((item) => (
        <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-full px-5 py-2 transition ${mode === item ? "bg-white text-[#1117E8] shadow-sm" : "text-[#454557]"}`}>
          {item === "test" ? "Test Mode" : "Live Mode"}
        </button>
      ))}
    </div>
  );
}

function Topbar({ mode, setMode, setSidebarOpen }: { mode: "test" | "live"; setMode: (mode: "test" | "live") => void; setSidebarOpen: (open: boolean) => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#C5C4DA] bg-white/95 backdrop-blur">
      <div className="flex min-h-[72px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button type="button" className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu className="h-6 w-6" /></button>
        <div className="relative hidden max-w-md flex-1 md:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#757588]" />
          <input aria-label="Search dashboard" placeholder="Search invoices, customers, or status..." className="h-11 w-full rounded-full border border-[#C5C4DA] bg-[#F7F9FB] pl-12 pr-4 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]" />
        </div>
        <div className="ml-auto hidden sm:block"><EnvironmentToggle mode={mode} setMode={setMode} /></div>
        <StatusBadge tone={mode === "live" ? "success" : "primary"}>{mode === "live" ? "Live Mode" : "Sandbox"}</StatusBadge>
        {[Bell, HelpCircle, Settings].map((Icon, index) => <button key={index} aria-label={["Notifications", "Help", "Settings"][index]} className="rounded-lg p-2 text-[#454557] hover:bg-[#F1F4F8]"><Icon className="h-5 w-5" /></button>)}
        <div className="hidden items-center gap-3 border-l border-[#C5C4DA] pl-4 sm:flex">
          <div className="text-right"><p className="text-sm font-bold">Admin User</p><p className="text-xs text-[#757588]">Manage Profile</p></div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#DADEFD] font-bold text-[#0001B1]">AU</div>
        </div>
      </div>
    </header>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ready = useDashboardGuard();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState<"test" | "live">("test");
  if (!ready) return null;

  return (
    <div className="min-h-screen bg-[#F7F9FB] text-[#191C1E]" style={{ backgroundColor: PAYTRAKA_COLORS.background, color: PAYTRAKA_COLORS.text }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:pl-[272px]">
        <Topbar mode={mode} setMode={setMode} setSidebarOpen={setSidebarOpen} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
