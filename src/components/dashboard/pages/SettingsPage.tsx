"use client";

import { Bell, Building2, Lock, Settings as SettingsIcon, UserCog } from "lucide-react";
import { useState } from "react";
import { Button, Card, CheckLine, Input, notifyDashboard, PageHeader } from "../ui";

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("Company Profile");

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage company profile, compliance preferences, users, and notification controls." action={<Button onClick={() => notifyDashboard("Settings saved")}>Save Changes</Button>} />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card className="p-4"><div className="space-y-2">{[
          ["Company Profile", Building2],
          ["Compliance", SettingsIcon],
          ["Users & Roles", UserCog],
          ["Notifications", Bell],
          ["Security", Lock],
        ].map(([label, Icon]) => <button key={String(label)} type="button" onClick={() => { setActiveSection(String(label)); notifyDashboard(`${String(label)} settings selected`); }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold ${activeSection === label ? "bg-[#DADEFD] text-[#0001B1]" : "text-[#454557]"}`}>{typeof Icon !== "string" ? <Icon className="h-4 w-4" /> : null}{String(label)}</button>)}</div></Card>
        <div className="space-y-6">
          <Card className="p-6"><h2 className="text-xl font-bold">Company Profile</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><Input label="Company Name" value="PayTraka Demo Company Ltd" /><Input label="Business Email" value="admin@paytraka.ng" /><Input label="Tax Identification Number" value="12345678-0001" /><Input label="RC Number / BN Number" value="RC9876543" /></div></Card>
          <Card className="p-6"><h2 className="text-xl font-bold">Compliance Preferences</h2><CheckLine label="Require TIN before FIRS/NRS submission" /><CheckLine label="Enable APP/SI pathway readiness checks" /><CheckLine label="Send validation failure alerts" /></Card>
        </div>
      </div>
    </>
  );
}
