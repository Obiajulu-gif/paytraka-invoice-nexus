"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { Pagination } from "@/components/ui/Pagination";
import { useProducts } from "@/hooks/useProducts";
import { getApiErrorMessage } from "@/lib/api/client";
import { BottomInsight, Button, Card, ComplianceAlert, DashboardFormModal, DataTable, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

export function ProductsPage() {
  const { products, categories, pagination, pager, loading, error, create } = useProducts();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const filteredProducts = products.filter((product) => {
    if (activeTab === "Products") return product.product_type === "product";
    if (activeTab === "Services") return product.product_type === "service";
    return true;
  });
  const categoryById = new Map(categories.map((category) => [category.id, category.name]));
  const inactiveCount = products.filter((product) => product.status === "inactive").length;

  async function createCatalogItem(values?: Record<string, string>) {
    const data = values ?? {};
    try {
      const name = data.Name?.trim();
      if (!name) throw new Error("Item name is required.");
      const unitPrice = Number(data["Unit price"] || 0);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error("Unit price must be a valid amount.");
      const categoryInput = data.Category?.trim();
      const category = categoryInput ? categories.find((item) => item.id === categoryInput || item.name.toLowerCase() === categoryInput.toLowerCase()) : undefined;

      await create({
        name,
        sku: data.SKU?.trim() || undefined,
        description: data.Description?.trim() || undefined,
        product_type: data["Product type"]?.toLowerCase().includes("service") ? "service" : "product",
        unit_price: unitPrice,
        cost_price: data["Cost price"] ? Number(data["Cost price"]) : undefined,
        tax_rate: data["Tax/VAT rate"] ? Number(data["Tax/VAT rate"]) : undefined,
        currency: data.Currency?.trim() || "NGN",
        stock_quantity: data["Stock quantity"] ? Number(data["Stock quantity"]) : undefined,
        track_inventory: data["Track inventory"]?.toLowerCase() === "true" || data["Track inventory"]?.toLowerCase() === "yes",
        status: data.Status?.toLowerCase().includes("inactive") ? "inactive" : "active",
        category_id: category?.id,
      });
    } catch (requestError) {
      throw new Error(getApiErrorMessage(requestError, "Unable to create catalog item."));
    }
  }

  return (
    <>
      <PageHeader title="Products & Services" subtitle="Inventory > Catalog Management" action={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Add New Item</Button>} />
      <DashboardFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Item"
        description="Add a product or service with unit price and VAT details."
        submitLabel="Save Item"
        fields={["Name", "SKU", "Description", "Product type", "Unit price", "Cost price", "Tax/VAT rate", "Currency", "Stock quantity", "Track inventory", "Status", "Category"]}
        onSubmit={createCatalogItem}
      />
      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <MetricCard label="Total Items" value={String(pagination?.total ?? products.length)} meta="API catalog records" />
        <MetricCard label="Active Services" value={String(products.filter((product) => product.product_type === "service" && product.status === "active").length)} meta="Loaded service records" />
        <MetricCard label="Compliance Alerts" value={String(inactiveCount)} meta="Inactive catalog items" tone="danger" />
      </div>
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap gap-3">
          {["All", "Products", "Services"].map((tab) => <button key={tab} type="button" onClick={() => { setActiveTab(tab); notifyDashboard(`${tab} catalog filter applied`); }} className={`rounded-full px-4 py-2 text-sm font-bold ${activeTab === tab ? "bg-[#DADEFD] text-[#0001B1]" : "text-[#454557]"}`}>{tab}</button>)}
          <input aria-label="Search products" value={pager.search} onChange={(event) => pager.setSearch(event.target.value)} placeholder="Search products" className="min-h-10 rounded-lg border border-[#C5C4DA] px-3 text-sm outline-none focus:border-[#1117E8]" />
        </div>
      </Card>
      {error ? <ComplianceAlert title="Unable to load products" text={error} /> : null}
      <DataTable
        title="Inventory List"
        columns={["Item Name", "SKU", "Type", "Category", "Unit Price", "Cost Price", "VAT Rate", "Stock", "Status", "Actions"]}
        rows={filteredProducts.map((product) => ({
          "Item Name": <b>{product.name}</b>,
          SKU: product.sku ?? "-",
          Type: <StatusBadge tone="primary">{product.product_type}</StatusBadge>,
          Category: product.category_id ? categoryById.get(product.category_id) ?? product.category_id : "-",
          "Unit Price": <b><CurrencyAmount amount={product.unit_price} currency={product.currency} /></b>,
          "Cost Price": <CurrencyAmount amount={product.cost_price ?? 0} currency={product.currency} />,
          "VAT Rate": product.tax_rate == null ? "-" : `${product.tax_rate}%`,
          Stock: product.track_inventory ? String(product.stock_quantity ?? 0) : "Not tracked",
          Status: <StatusBadge>{product.status}</StatusBadge>,
          Actions: rowActions(undefined, product.name),
        }))}
        footer={loading ? "Loading API records..." : `Showing ${filteredProducts.length} of ${pagination?.total ?? products.length} items`}
        footerActions={<Pagination pagination={pagination} onPageChange={pager.setPage} />}
      />
      <BottomInsight title="Streamline your FIRS Compliance" asideTitle="Need Assistance?" />
    </>
  );
}
