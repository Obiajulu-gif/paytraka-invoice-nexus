import { Eye, Palette, Save } from "lucide-react";
import { Button, Card, CheckLine, Input, PageHeader, StatusBadge } from "../ui";

export function TemplatesPage() {
  return (
    <>
      <PageHeader title="Invoice Templates" subtitle="Manage invoice layouts, branding, notes, and compliance fields." action={<><Button variant="secondary">Discard Changes</Button><Button><Save className="h-4 w-4" /> Save Template</Button></>} />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr_320px]">
        <Card className="p-5"><h2 className="font-bold uppercase text-[#454557]">Template Gallery</h2><div className="mt-4 space-y-4">{["Classic", "Modern", "Minimal", "Bold Cards"].map((template, index) => <button key={template} className={`w-full rounded-xl border p-4 text-left font-bold ${index === 0 ? "border-[#1117E8] text-[#0001B1]" : "border-[#C5C4DA]"}`}><div className="mb-3 h-24 rounded-lg bg-[#F1F4F8]" />{template}{index === 0 ? <StatusBadge tone="success">Default</StatusBadge> : null}</button>)}</div></Card>
        <Card className="p-6"><h2 className="flex items-center gap-2 text-xl font-bold"><Palette className="h-5 w-5 text-[#1117E8]" /> Branding</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><Input label="Business Logo" wide /><Input label="Brand color" value="#1117E8" /><Input label="Footer note" value="Please pay within 7 days of receiving this invoice." /></div><div className="mt-6 space-y-2"><CheckLine label="Display Tax ID (TIN)" /><CheckLine label="Show VAT breakdown" /><CheckLine label="Show payment details" /><CheckLine label="Show FIRS/NRS compliance fields" /></div></Card>
        <Card className="p-6"><h2 className="flex items-center justify-between text-xl font-bold">Selected Preview <Eye className="h-5 w-5" /></h2><div className="mt-5 rounded-xl border border-[#C5C4DA] bg-white p-5 shadow-xl"><p className="text-right text-2xl font-extrabold text-[#0001B1]">INVOICE</p><h3 className="mt-8 text-xl font-bold">PayTraka Nigeria Ltd</h3><div className="mt-8 h-8 bg-[#1117E8]" /><div className="mt-4 space-y-2 text-sm text-[#454557]"><p>Cloud Infrastructure</p><p>Total: ₦450,000.00</p><p>VAT: 7.5%</p></div></div></Card>
      </div>
    </>
  );
}
