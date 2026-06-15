"use client";

import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  Eye,
  FileCheck2,
  Filter,
  HelpCircle,
  MoreVertical,
  Plus,
  Printer,
  ShieldCheck,
  ShoppingCart,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { StatusTone, TableRow } from "./types";

const DASHBOARD_TOAST_EVENT = "paytraka-dashboard-toast";

export function notifyDashboard(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DASHBOARD_TOAST_EVENT, { detail: message }));
}

export function useDashboardToasts() {
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const handler = (event: Event) => {
      const message = event instanceof CustomEvent && typeof event.detail === "string" ? event.detail : "Action completed";
      setToastMessage(message);
      window.setTimeout(() => setToastMessage(""), 2600);
    };
    window.addEventListener(DASHBOARD_TOAST_EVENT, handler);
    return () => window.removeEventListener(DASHBOARD_TOAST_EVENT, handler);
  }, []);

  return toastMessage;
}

function toneClasses(tone: StatusTone) {
  return {
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    neutral: "bg-slate-100 text-slate-700",
    primary: "bg-[#DADEFD] text-[#0001B1]",
  }[tone];
}

function statusTone(value: React.ReactNode): StatusTone {
  const text = String(value).toLowerCase();
  if (["accepted", "ready", "paid", "verified", "compliant", "active", "live", "copied"].some((item) => text.includes(item))) return "success";
  if (["failed", "missing", "undefined", "required", "risk"].some((item) => text.includes(item))) return "danger";
  if (["pending", "review", "queue", "draft"].some((item) => text.includes(item))) return "warning";
  if (["sent", "submitted", "viewed"].some((item) => text.includes(item))) return "primary";
  return "neutral";
}

export function StatusBadge({ children, tone }: { children: React.ReactNode; tone?: StatusTone }) {
  return <span className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-xs font-bold ${toneClasses(tone ?? statusTone(children))}`}>{children}</span>;
}

export function Card({ children, className = "", ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={`min-w-0 rounded-2xl border border-[#C5C4DA] bg-white ${className}`} {...props}>{children}</section>;
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`skeleton-shimmer block rounded-lg bg-[#E6EAF2] ${className}`} />;
}

export function DashboardPageSkeleton({ title = "Loading dashboard" }: { title?: string }) {
  return (
    <div className="space-y-6" role="status" aria-label={title}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="w-full max-w-xl space-y-3">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-9 w-3/4 max-w-md" />
          <SkeletonBlock className="h-4 w-full" />
        </div>
        <SkeletonBlock className="h-11 w-44" />
      </div>
      <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Card key={item} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="w-full space-y-4">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-8 w-32" />
                <SkeletonBlock className="h-4 w-28" />
              </div>
              <SkeletonBlock className="h-11 w-11 rounded-xl" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="flex min-h-16 items-center justify-between border-b border-[#C5C4DA] px-5">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="h-9 w-24" />
        </div>
        <div className="space-y-0">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="grid grid-cols-3 gap-5 border-b border-[#DCE0E8] px-5 py-5 md:grid-cols-6">
              {[0, 1, 2, 3, 4, 5].map((cell) => <SkeletonBlock key={cell} className="h-4 w-full" />)}
            </div>
          ))}
        </div>
      </Card>
      <span className="sr-only">{title}</span>
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", href, type = "button", onClick, disabled = false }: { children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; className?: string; href?: string; type?: "button" | "submit"; onClick?: () => void; disabled?: boolean }) {
  const classes = {
    primary: "bg-[#1117E8] text-white shadow-[0_12px_28px_rgba(17,23,232,0.2)] hover:bg-[#0001B1]",
    secondary: "border border-[#C5C4DA] bg-white text-[#0001B1] hover:border-[#1117E8]",
    ghost: "bg-[#F1F4F8] text-[#191C1E] hover:bg-[#DADEFD]",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }[variant];
  const content = `inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-xl px-4 text-center text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1117E8] disabled:cursor-not-allowed disabled:opacity-60 ${classes} ${className}`;
  return href ? <Link href={href} className={content} aria-disabled={disabled}>{children}</Link> : <button type={type} onClick={onClick} disabled={disabled} className={content}>{children}</button>;
}

export function PageHeader({ title, subtitle, action, breadcrumb }: { title: string; subtitle: string; action?: React.ReactNode; breadcrumb?: string }) {
  return (
    <div className="mb-6 flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        {breadcrumb ? <p className="mb-3 text-sm font-semibold text-[#757588]">{breadcrumb}</p> : null}
        <h1 className="text-3xl font-extrabold tracking-normal text-[#191C1E]">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#454557]">{subtitle}</p>
      </div>
      {action ? <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">{action}</div> : null}
    </div>
  );
}

export function MetricCard({ label, value, meta, tone = "neutral", icon: Icon }: { label: string; value: React.ReactNode; meta?: string; tone?: StatusTone; icon?: React.ElementType }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-[#454557]">{label}</p>
          <p className={`mt-3 text-3xl font-extrabold ${tone === "danger" ? "text-red-600" : tone === "success" ? "text-green-700" : "text-[#191C1E]"}`}>{value}</p>
          {meta ? <p className="mt-2 text-sm font-semibold text-[#454557]">{meta}</p> : null}
        </div>
        {Icon ? <span className="rounded-lg bg-[#DADEFD] p-3 text-[#0001B1]"><Icon className="h-5 w-5" /></span> : null}
      </div>
    </Card>
  );
}

export function ComplianceAlert({ title, text, badge, tone = "danger", action }: { title: string; text: string; badge?: string; tone?: StatusTone; action?: React.ReactNode }) {
  const isDanger = tone === "danger";
  return (
    <div className={`mb-6 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between ${isDanger ? "border-red-200 bg-red-50 text-red-700" : "border-[#C5C4DA] bg-[#EAEDFF] text-[#0001B1]"}`}>
      <div className="flex gap-4">
        {isDanger ? <AlertTriangle className="mt-1 h-6 w-6 shrink-0" /> : <ShieldCheck className="mt-1 h-6 w-6 shrink-0" />}
        <div><p className="font-bold">{title}</p><p className="mt-1 text-sm">{text}</p></div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {badge ? <StatusBadge tone={isDanger ? "danger" : "success"}>{badge}</StatusBadge> : null}
        {action}
      </div>
    </div>
  );
}

export function DataTable({ title, columns, rows, footer = "Showing 1 to 4 records", actions, footerActions, loading = false }: { title: string; columns: string[]; rows: TableRow[]; footer?: string; actions?: React.ReactNode; footerActions?: React.ReactNode; loading?: boolean }) {
  const skeletonRows = Array.from({ length: 5 }, (_, rowIndex) => rowIndex);

  return (
    <Card className="overflow-hidden">
      <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[#C5C4DA] px-5">
        <h2 className="text-lg font-bold">{title}</h2>
        <div className="flex gap-2">{actions ?? <><button type="button" onClick={() => notifyDashboard(`${title} CSV downloaded`)} aria-label={`Download ${title}`} className="rounded-lg p-2 hover:bg-[#F1F4F8]"><Download className="h-4 w-4" /></button><button type="button" onClick={() => notifyDashboard(`${title} print view opened`)} aria-label={`Print ${title}`} className="rounded-lg p-2 hover:bg-[#F1F4F8]"><Printer className="h-4 w-4" /></button></>}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left sm:min-w-[760px]">
          <thead className="bg-[#F1F4F8] text-xs uppercase text-[#454557]">
            <tr>{columns.map((column) => <th key={column} scope="col" className="px-5 py-4 font-bold">{column}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[#DCE0E8]">
            {loading ? skeletonRows.map((row) => (
              <tr key={row} className="bg-white">
                {columns.map((column, index) => (
                  <td key={column} className="px-5 py-5 align-middle text-sm">
                    <SkeletonBlock className={`h-4 ${index === columns.length - 1 ? "w-24" : index % 3 === 0 ? "w-32" : "w-full"}`} />
                  </td>
                ))}
              </tr>
            )) : rows.map((row, index) => <tr key={index} className="bg-white">{columns.map((column) => <td key={column} className="px-5 py-5 align-middle text-sm">{row[column]}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 bg-[#F7F9FB] px-5 py-4 text-sm text-[#454557] sm:flex-row sm:items-center sm:justify-between">
        <span>{footer}</span>{footerActions ?? <div className="flex gap-2"><StatusBadge tone="primary">1</StatusBadge><span className="rounded-lg border border-[#C5C4DA] bg-white px-3 py-1">2</span><span className="rounded-lg border border-[#C5C4DA] bg-white px-3 py-1">3</span></div>}
      </div>
    </Card>
  );
}

const defaultActionItems = [
  ["View", Eye],
  ["Edit", Edit3],
  ["Duplicate", Copy],
  ["Send", Send],
  ["Download", Download],
  ["Delete", Trash2],
] as const;

export type RowActionItem = {
  label: string;
  icon?: React.ElementType;
  tone?: "default" | "danger";
  onSelect: () => void;
};

function RowActions({ extra, label, actions = [] }: { extra?: React.ReactNode; label: string; actions?: RowActionItem[] }) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuItems: RowActionItem[] = actions.length ? actions : defaultActionItems.map(([action, Icon]) => ({
    label: action,
    icon: Icon,
    tone: action === "Delete" ? "danger" : "default",
    onSelect: () => notifyDashboard(`${action} selected for ${label}`),
  }));

  const positionMenu = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = 192;
    const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
    const top = Math.min(rect.bottom + 8, window.innerHeight - 260);
    setMenuPosition({ top: Math.max(12, top), left });
  }, []);

  useEffect(() => {
    if (!open) return;
    positionMenu();
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const handleReposition = () => positionMenu();
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, positionMenu]);

  return (
    <div className="flex items-center gap-2">
      {extra}
      <button type="button" onClick={() => notifyDashboard(`Opened ${label} details`)} aria-label={`View ${label}`} className="rounded-lg p-2 text-[#454557] transition hover:bg-[#F1F4F8] hover:text-[#0001B1]">
        <Eye className="h-4 w-4" />
      </button>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${label}`}
        className="rounded-lg p-2 text-[#454557] transition hover:bg-[#F1F4F8] hover:text-[#0001B1]"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && typeof document !== "undefined" ? createPortal(
        <div ref={menuRef} role="menu" style={{ top: menuPosition.top, left: menuPosition.left }} className="fixed z-[120] w-48 overflow-hidden rounded-xl border border-[#C5C4DA] bg-white py-2 shadow-2xl">
          {menuItems.map(({ label: action, icon: Icon, tone = "default", onSelect }) => (
            <button
              key={action}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSelect();
              }}
              className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-semibold transition hover:bg-[#F1F4F8] ${tone === "danger" ? "text-red-600" : "text-[#454557]"}`}
            >
              {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
              {action}
            </button>
          ))}
        </div>,
        document.body
      ) : null}
    </div>
  );
}

export function rowActions(extra?: React.ReactNode, label = "record", actions?: RowActionItem[]) {
  return <RowActions extra={extra} label={label} actions={actions} />;
}

export function FilterBar({ labels = ["Date range", "Payment status", "FIRS status", "More filters"] }: { labels?: string[] }) {
  return <Card className="mb-6 flex min-w-0 flex-wrap items-center gap-3 p-4"><Filter className="h-5 w-5 shrink-0" /><span className="font-bold">Filters:</span>{labels.map((label) => <button key={label} type="button" onClick={() => notifyDashboard(`${label} filter selected`)} className="min-w-0 rounded-lg border border-[#C5C4DA] bg-white px-4 py-2 text-sm font-semibold text-[#454557]">{label}</button>)}<button type="button" onClick={() => notifyDashboard("Filters cleared")} className="w-full text-left font-bold text-[#0001B1] sm:ml-auto sm:w-auto">Clear all</button></Card>;
}

export function BottomInsight({ title, asideTitle }: { title: string; asideTitle: string }) {
  return (
    <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="p-6"><h2 className="text-lg font-bold">{title}</h2><div className="mt-5 grid min-h-40 place-items-center rounded-xl bg-[#EEF1F5] p-8 text-center text-[#454557]">Detailed visualization and category breakdown is being computed from verified records.</div></Card>
      <Card className="bg-[#1117E8] p-6 text-white"><h2 className="text-2xl font-bold">{asideTitle}</h2><p className="mt-4 leading-7 text-white/75">Your records cover 92% of estimated monthly VAT liability. Complete pending TIN verifications to maximize deductions.</p><Button variant="secondary" className="mt-6" onClick={() => notifyDashboard("Compliance report generated")}>Generate Compliance Report</Button></Card>
    </div>
  );
}

export function SupportCard() {
  return (
    <Card className="h-fit bg-[#1117E8] p-6 text-white shadow-[0_18px_36px_rgba(17,23,232,0.25)]">
      <h2 className="flex items-center gap-2 text-lg font-bold"><HelpCircle className="h-5 w-5" /> Support Hub</h2>
      <p className="mt-4 text-sm leading-6 text-white/75">Need assistance with FIRS integration or tax filings?</p>
      <div className="mt-6 grid gap-3"><Button variant="secondary" href="/dashboard/support">Live Chat Support</Button><Button variant="primary" href="/dashboard/support" className="border border-white/20">Knowledge Base</Button></div>
    </Card>
  );
}

export function Input({ label, value = "", wide = false, name }: { label: string; value?: string; wide?: boolean; name?: string }) {
  const isMessage = label.toLowerCase().includes("message") || label.toLowerCase().includes("note") || label.toLowerCase().includes("notes");
  return <label className={`block text-sm font-bold text-[#454557] ${wide ? "md:col-span-2" : ""}`}>{label}<textarea name={name ?? label} rows={isMessage ? 4 : 1} defaultValue={value} placeholder={label} className="mt-2 w-full resize-none rounded-lg border border-[#C5C4DA] bg-white px-3 py-3 text-[#191C1E] outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]" /></label>;
}

export function CheckLine({ label }: { label: string }) {
  return <label className="mt-4 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" defaultChecked className="h-4 w-4 accent-[#1117E8]" /> {label}</label>;
}

export function DashboardFormModal({ open, title, description, fields, onClose, submitLabel = "Save", onSubmit, successMessage }: { open: boolean; title: string; description: string; fields: string[]; onClose: () => void; submitLabel?: string; onSubmit?: (values?: Record<string, string>) => void | Promise<void>; successMessage?: string }) {
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    setSubmitting(true);
    try {
      await onSubmit?.(values);
      onClose();
      notifyDashboard(successMessage ?? `${submitLabel} successful`);
    } catch (error) {
      notifyDashboard(error instanceof Error ? error.message : `${submitLabel} failed`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-[#191C1E]/45 p-3 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-labelledby="dashboard-modal-title" onMouseDown={onClose}>
      <Card className="max-h-[92vh] w-full max-w-2xl overflow-hidden shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <form onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-4 border-b border-[#C5C4DA] bg-[#F7F9FB] p-6">
          <div>
            <h2 id="dashboard-modal-title" className="text-2xl font-bold text-[#191C1E]">{title}</h2>
            <p className="mt-1 text-sm text-[#454557]">{description}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={`Close ${title} modal`} className="rounded-lg p-2 text-[#454557] hover:bg-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[62vh] overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => <FieldControl key={field} field={field} />)}
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-[#C5C4DA] bg-white p-6 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : submitLabel}</Button>
        </div>
        </form>
      </Card>
    </div>
  );
}

function FieldControl({ field }: { field: string }) {
  if (field.toLowerCase().includes("upload")) {
    return <div className="md:col-span-2 rounded-xl border border-dashed border-[#C5C4DA] bg-[#F7F9FB] p-8 text-center"><Upload className="mx-auto h-8 w-8 text-[#757588]" /><p className="mt-3 font-bold">Click to upload or drag and drop</p><p className="mt-1 text-sm text-[#757588]">TIN certificate, contract, or KYC documents (PDF, JPG up to 10MB)</p></div>;
  }
  if (field.startsWith("Automatically") || field.startsWith("Attach")) return <CheckLine label={field} />;
  if (field === "VAT Registered") return <label className="flex items-center justify-between gap-3 rounded-xl bg-[#F1F4F8] p-4 text-sm font-bold text-[#454557] md:col-span-2">VAT Registered <input name={field} type="checkbox" defaultChecked className="h-5 w-5 shrink-0 accent-[#1117E8]" /></label>;
  return <Input name={field} label={field} wide={field.includes("Address") || field.includes("Message") || field.includes("Notes")} />;
}

export function FormShell({ title, sideTitle, sections, buttons }: { title: string; sideTitle: string; sections: [string, string[]][]; buttons: string[] }) {
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <h2 className="sr-only">{title}</h2>
        {sections.map(([section, fields]) => (
          <Card key={section} className="p-5">
            <h3 className="border-b border-[#DCE0E8] pb-3 font-bold">{section}</h3>
            {section.includes("Type") ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{fields.map((field, index) => <button key={field} type="button" onClick={() => notifyDashboard(`${field} selected`)} className={`rounded-xl border p-4 text-sm font-bold ${index === 0 ? "border-[#1117E8] bg-[#EAEDFF] text-[#0001B1]" : "border-[#C5C4DA] bg-white text-[#454557]"}`}>{field}</button>)}</div> : <div className="mt-5 grid gap-4 md:grid-cols-2">{fields.map((field) => <FieldControl key={field} field={field} />)}</div>}
          </Card>
        ))}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">{buttons.map((button, index) => <Button key={button} variant={index === buttons.length - 1 ? "primary" : "secondary"} onClick={() => notifyDashboard(button.toLowerCase().includes("cancel") || button.toLowerCase().includes("discard") ? "Changes discarded" : `${button} successful`)}>{button}</Button>)}</div>
      </div>
      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <Card className="p-5"><h3 className="font-bold">{sideTitle}</h3><div className="mt-4 h-2 rounded-full bg-[#EEF1F5]"><div className="h-full w-3/4 rounded-full bg-[#1117E8]" /></div><div className="mt-5 space-y-3">{["Customer Name", "Email & Phone", "Billing Address", "Tax Identification (TIN)", "VAT Status"].map((item, i) => <div key={item} className="flex justify-between gap-3 text-sm"><span className="font-semibold">{item}</span><StatusBadge tone={i === 3 ? "warning" : "success"}>{i === 3 ? "Add Now" : "Verified"}</StatusBadge></div>)}</div></Card>
        <Card className="overflow-hidden"><div className="bg-[#1117E8] p-5 text-white"><p className="font-bold">Preview</p><p className="mt-2 text-sm text-white/75">PayTraka Demo Company Ltd</p></div><div className="p-5 text-sm text-[#454557]">Records marked ready for e-invoicing can be reused across invoices, receipts, payment tracking, and submission preparation.</div></Card>
      </aside>
    </div>
  );
}

export function AddCustomerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const fields = ["Business Name", "RC Number", "Contact Person", "Email Address", "Phone Number", "Tax Identification Number (TIN)"];
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-[#191C1E]/45 p-3 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-labelledby="add-customer-title">
      <Card className="w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#C5C4DA] bg-[#F7F9FB] p-6"><div><h2 id="add-customer-title" className="text-2xl font-bold">Add New Customer</h2><p className="mt-1 text-sm text-[#454557]">Onboard a new business partner to your dashboard.</p></div><button type="button" onClick={onClose} aria-label="Close add customer modal" className="rounded-lg p-2 text-[#454557] hover:bg-white"><X className="h-5 w-5" /></button></div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">{fields.map((field, index) => <label key={field} className={`block text-sm font-bold text-[#191C1E] ${index === 0 || index === 5 ? "sm:col-span-2" : ""}`}><span className="flex items-center justify-between">{field}{field === "RC Number" ? <span className="text-xs font-semibold text-[#757588]">Optional</span> : null}</span><input placeholder={field === "Business Name" ? "e.g. Acme Corporation Ltd" : field === "Tax Identification Number (TIN)" ? "12345678-0001" : field} className="mt-2 h-11 w-full rounded-lg border border-[#C5C4DA] bg-white px-4 text-sm outline-none focus:border-[#1117E8] focus:ring-4 focus:ring-[#DADEFD]" /></label>)}<div className="sm:col-span-2 rounded-lg bg-[#DADEFD] p-3 text-sm font-semibold text-[#0001B1]">A valid TIN is required for e-invoicing and VAT compliance. Confirm this number before submission to avoid filing errors.</div></div>
        <div className="flex flex-col gap-3 border-t border-[#C5C4DA] p-6 sm:flex-row"><button type="button" onClick={onClose} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#C5C4DA] bg-white px-4 text-sm font-bold text-[#0001B1] hover:border-[#1117E8]">Cancel</button><button type="button" onClick={() => { onClose(); notifyDashboard("Customer saved"); }} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1117E8] px-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(17,23,232,0.2)] hover:bg-[#0001B1]"><FileCheck2 className="h-4 w-4" /> Save Customer</button></div>
      </Card>
    </div>
  );
}

export function Toast({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return <div className="fixed bottom-4 left-3 right-3 z-[80] rounded-xl bg-[#191C1E] px-5 py-4 text-sm font-semibold text-white shadow-2xl sm:left-auto sm:right-6"><span className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" /> {children}</span></div>;
}

export function GenericTablePage({ title, subtitle, button, metrics, tableTitle, columns, data, bottom = false, onPrimaryAction }: { title: string; subtitle: string; button: string; metrics: string[][]; tableTitle: string; columns: string[]; data: string[][]; bottom?: boolean; onPrimaryAction?: () => void }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} action={<Button onClick={onPrimaryAction}><Plus className="h-4 w-4" /> {button.replace(/^\+ /, "")}</Button>} />
      <div className="mb-6 grid gap-5 md:grid-cols-3 xl:grid-cols-4">{metrics.map(([label, value]) => <MetricCard key={label} label={label} value={value} icon={BarChart3} />)}</div>
      <DataTable title={tableTitle} columns={columns} rows={data.map((row) => Object.fromEntries(columns.map((column, index) => [column, column === "Status" || column.includes("Status") ? <StatusBadge>{row[index]}</StatusBadge> : column === "Actions" ? rowActions(undefined, row[0] ?? tableTitle) : row[index] ?? rowActions(undefined, row[0] ?? tableTitle)])) as TableRow)} />
      {bottom ? <BottomInsight title={`${title} Health`} asideTitle="Tax Compliance Tip" /> : null}
    </>
  );
}

export { Copy, Download, FileCheck2, Plus, ShieldCheck, ShoppingCart };
