"use client";

import { DashboardLayout } from "./DashboardLayout";
import { CompliancePage } from "./pages/CompliancePage";
import { CreateCustomerPage } from "./pages/CreateCustomerPage";
import { CreateInvoicePage } from "./pages/CreateInvoicePage";
import { CustomersPage, SuppliersPage } from "./pages/DirectoryPage";
import { DashboardHome } from "./pages/DashboardHome";
import { PaymentLinksPage } from "./pages/PaymentLinksPage";
import { ProductsPage } from "./pages/ProductsPage";
import { PurchaseInvoicesPage } from "./pages/PurchaseInvoicesPage";
import { ReceiptsPage } from "./pages/ReceiptsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SalesInvoicesPage } from "./pages/SalesInvoicesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { SupportPage } from "./pages/SupportPage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { DashboardKind } from "./types";

const routeMap: Record<string, DashboardKind> = {
  "": "home",
  invoices: "sales",
  "invoices/sales": "sales",
  "invoices/purchase": "purchase",
  "invoices/create": "create-invoice",
  "invoices/purchase/create": "create-purchase",
  customers: "customers",
  "customers/create": "create-customer",
  suppliers: "suppliers",
  "suppliers/create": "create-supplier",
  receipts: "receipts",
  products: "products",
  "payment-links": "payment-links",
  reports: "reports",
  compliance: "compliance",
  "compliance/validate": "compliance",
  "compliance/submit": "compliance",
  "compliance/status": "compliance",
  templates: "templates",
  subscription: "subscription",
  support: "support",
  settings: "settings",
};

function dashboardKindFromSlug(slug?: string[]) {
  return routeMap[(slug ?? []).join("/")] ?? "home";
}

function DashboardPage({ kind }: { kind: DashboardKind }) {
  switch (kind) {
    case "sales":
      return <SalesInvoicesPage />;
    case "purchase":
      return <PurchaseInvoicesPage />;
    case "create-invoice":
      return <CreateInvoicePage />;
    case "create-purchase":
      return <CreateInvoicePage purchase />;
    case "customers":
      return <CustomersPage />;
    case "create-customer":
      return <CreateCustomerPage />;
    case "suppliers":
      return <SuppliersPage />;
    case "create-supplier":
      return <CreateCustomerPage supplier />;
    case "receipts":
      return <ReceiptsPage />;
    case "products":
      return <ProductsPage />;
    case "payment-links":
      return <PaymentLinksPage />;
    case "reports":
      return <ReportsPage />;
    case "compliance":
      return <CompliancePage />;
    case "templates":
      return <TemplatesPage />;
    case "subscription":
      return <SubscriptionPage />;
    case "support":
      return <SupportPage />;
    case "settings":
      return <SettingsPage />;
    case "home":
    default:
      return <DashboardHome />;
  }
}

export function CompanyDashboard({ slug }: { slug?: string[] }) {
  const kind = dashboardKindFromSlug(slug);

  return (
    <DashboardLayout>
      <DashboardPage kind={kind} />
    </DashboardLayout>
  );
}
