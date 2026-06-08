import type { LucideIcon } from "lucide-react";
import type React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  eyebrow?: string;
}

export function PageHeader({ title, description, action, eyebrow }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-sm font-medium text-primary">{eyebrow}</p>
        )}
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: "blue" | "emerald" | "amber" | "red" | "slate";
}

const toneClasses = {
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-primary/5 text-primary",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-slate-100 text-slate-700",
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "blue",
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={cn("rounded-xl p-2", toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

interface SearchToolbarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  children?: React.ReactNode;
}

export function SearchToolbar({
  value,
  onChange,
  placeholder,
  children,
}: SearchToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 border-slate-200 bg-slate-50 pl-9"
        />
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-32 rounded-2xl bg-slate-200" />
      ))}
    </div>
  );
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "border-slate-200 bg-slate-100 text-slate-700",
    sent: "border-blue-200 bg-blue-50 text-blue-700",
    paid: "border-primary/20 bg-primary/5 text-primary",
    overdue: "border-red-200 bg-red-50 text-red-700",
    cancelled: "border-slate-200 bg-slate-50 text-slate-500",
    issued: "border-primary/20 bg-primary/5 text-primary",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        styles[status] || "border-slate-200 bg-slate-50 text-slate-700",
      )}
    >
      {status}
    </Badge>
  );
}

export function SegmentedButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      className={cn(
        active
          ? "bg-primary text-white hover:bg-slate-800"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
