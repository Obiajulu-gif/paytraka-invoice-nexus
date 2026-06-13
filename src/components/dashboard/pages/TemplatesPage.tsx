"use client";

import { Copy, Edit3, Eye, Palette, Plus, Save, Star } from "lucide-react";
import { useState } from "react";
import { Button, Card, CheckLine, DashboardFormModal, Input, notifyDashboard, PageHeader, StatusBadge } from "../ui";

type Template = {
  name: string;
  default: boolean;
};

export function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("Classic");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [templates, setTemplates] = useState<Template[]>([
    { name: "Classic", default: true },
    { name: "Modern", default: false },
    { name: "Minimal", default: false },
    { name: "Bold Cards", default: false },
  ]);

  function createTemplate() {
    setTemplates((current) => [...current, { name: `Custom ${current.length + 1}`, default: false }]);
  }

  function duplicateTemplate(name: string) {
    const duplicateName = `${name} Copy`;
    setTemplates((current) => [...current, { name: duplicateName, default: false }]);
    setSelectedTemplate(duplicateName);
    notifyDashboard(`${name} duplicated`);
  }

  function setDefaultTemplate(name: string) {
    setTemplates((current) => current.map((template) => ({ ...template, default: template.name === name })));
    notifyDashboard(`${name} set as default template`);
  }

  return (
    <>
      <PageHeader title="Invoice Templates" subtitle="Manage invoice layouts, branding, notes, and compliance fields." action={<><Button variant="secondary" onClick={() => notifyDashboard("Template changes discarded")}>Discard Changes</Button><Button variant="secondary" onClick={() => setModal("create")}><Plus className="h-4 w-4" /> Create Template</Button><Button onClick={() => notifyDashboard(`${selectedTemplate} template saved`)}><Save className="h-4 w-4" /> Save Template</Button></>} />
      <DashboardFormModal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal === "edit" ? `Edit ${selectedTemplate}` : "Create Invoice Template"}
        description="Configure the invoice template name, branding, footer note, and compliance fields."
        submitLabel={modal === "edit" ? "Save Template" : "Create Template"}
        fields={["Template Name", "Brand Color", "Footer Note", "Payment Details", "FIRS/NRS compliance fields"]}
        onSubmit={modal === "create" ? createTemplate : () => notifyDashboard(`${selectedTemplate} updated`)}
      />
      <div className="grid min-w-0 gap-6 xl:grid-cols-[220px_minmax(0,1fr)] 2xl:grid-cols-[240px_minmax(0,1fr)_320px]">
        <Card className="p-5">
          <h2 className="font-bold uppercase text-[#454557]">Template Gallery</h2>
          <div className="mt-4 space-y-4">
            {templates.map((template) => (
              <div key={template.name} className={`rounded-xl border p-4 ${selectedTemplate === template.name ? "border-[#1117E8] text-[#0001B1]" : "border-[#C5C4DA]"}`}>
                <button type="button" onClick={() => { setSelectedTemplate(template.name); notifyDashboard(`${template.name} template selected`); }} className="w-full text-left font-bold">
                  <div className="mb-3 h-24 rounded-lg bg-[#F1F4F8]" />
                  <span className="flex flex-wrap items-center gap-2">{template.name}{template.default ? <StatusBadge tone="success">Default</StatusBadge> : null}</span>
                </button>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => notifyDashboard(`${template.name} preview opened`)} aria-label={`Preview ${template.name}`} className="rounded-lg p-2 hover:bg-[#F1F4F8]"><Eye className="h-4 w-4" /></button>
                  <button type="button" onClick={() => { setSelectedTemplate(template.name); setModal("edit"); }} aria-label={`Edit ${template.name}`} className="rounded-lg p-2 hover:bg-[#F1F4F8]"><Edit3 className="h-4 w-4" /></button>
                  <button type="button" onClick={() => duplicateTemplate(template.name)} aria-label={`Duplicate ${template.name}`} className="rounded-lg p-2 hover:bg-[#F1F4F8]"><Copy className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setDefaultTemplate(template.name)} aria-label={`Set ${template.name} as default`} className="rounded-lg p-2 hover:bg-[#F1F4F8]"><Star className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6"><h2 className="flex items-center gap-2 text-xl font-bold"><Palette className="h-5 w-5 text-[#1117E8]" /> Branding</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><Input label="Business Logo" wide /><Input label="Brand color" value="#1117E8" /><Input label="Footer note" value="Please pay within 7 days of receiving this invoice." /></div><div className="mt-6 space-y-2"><CheckLine label="Display Tax ID (TIN)" /><CheckLine label="Show VAT breakdown" /><CheckLine label="Show payment details" /><CheckLine label="Show FIRS/NRS compliance fields" /></div></Card>
        <Card className="p-6"><h2 className="flex items-center justify-between text-xl font-bold">Selected Preview <Eye className="h-5 w-5" /></h2><div className="mt-5 rounded-xl border border-[#C5C4DA] bg-white p-5 shadow-xl"><p className="text-right text-2xl font-extrabold text-[#0001B1]">INVOICE</p><h3 className="mt-8 text-xl font-bold">PayTraka Nigeria Ltd</h3><p className="mt-2 text-sm font-semibold text-[#454557]">{selectedTemplate} template</p><div className="mt-8 h-8 bg-[#1117E8]" /><div className="mt-4 space-y-2 text-sm text-[#454557]"><p>Cloud Infrastructure</p><p>Total: ₦450,000.00</p><p>VAT: 7.5%</p></div></div></Card>
      </div>
    </>
  );
}
