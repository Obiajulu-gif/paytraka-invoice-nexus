export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

export type TableRow = Record<string, React.ReactNode>;

export type DashboardKind =
  | "home"
  | "sales"
  | "purchase"
  | "create-invoice"
  | "create-purchase"
  | "customers"
  | "create-customer"
  | "suppliers"
  | "create-supplier"
  | "receipts"
  | "products"
  | "payment-links"
  | "reports"
  | "compliance"
  | "templates"
  | "subscription"
  | "support"
  | "settings";

export const PAYTRAKA_COLORS = {
  primary: "#0001B1",
  cta: "#1117E8",
  background: "#F7F9FB",
  surface: "#FFFFFF",
  mutedSurface: "#F1F4F8",
  border: "#C5C4DA",
  text: "#191C1E",
  mutedText: "#454557",
  softText: "#757588",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  lavender: "#DADEFD",
} as const;
