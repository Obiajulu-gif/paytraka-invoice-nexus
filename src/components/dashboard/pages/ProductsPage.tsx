"use client";

import { Boxes, CircleDollarSign, Edit3, Eye, FileText, PackageCheck, Plus, Tag, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { Pagination } from "@/components/ui/Pagination";
import { useProducts } from "@/hooks/useProducts";
import { getApiErrorMessage } from "@/lib/api/client";
import { Product, ProductCategory, ProductRequest } from "@/types/api";
import { BottomInsight, Button, Card, ComplianceAlert, DashboardFormModal, DataTable, FilterBar, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

const productFields = ["Name", "SKU", "Description", "Product type", "Unit price", "Cost price", "Tax/VAT rate", "Currency", "Stock quantity", "Track inventory", "Status", "Category"];

function productToValues(product: Product, categories: ProductCategory[]): Record<string, string> {
  const category = product.category_id ? categories.find((item) => item.id === product.category_id) : undefined;
  return {
    Name: product.name,
    SKU: product.sku ?? "",
    Description: product.description ?? "",
    "Product type": product.product_type,
    "Unit price": String(product.unit_price ?? 0),
    "Cost price": product.cost_price == null ? "" : String(product.cost_price),
    "Tax/VAT rate": product.tax_rate == null ? "" : String(product.tax_rate),
    Currency: product.currency ?? "NGN",
    "Stock quantity": product.stock_quantity == null ? "" : String(product.stock_quantity),
    "Track inventory": product.track_inventory ? "yes" : "no",
    Status: product.status,
    Category: category?.name ?? product.category_id ?? "",
  };
}

function productPayload(data: Record<string, string>, categories: ProductCategory[]): ProductRequest {
  const name = data.Name?.trim();
  if (!name) throw new Error("Item name is required.");
  const unitPrice = Number(data["Unit price"] || 0);
  if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error("Unit price must be a valid amount.");
  const categoryInput = data.Category?.trim();
  const category = categoryInput ? categories.find((item) => item.id === categoryInput || item.name.toLowerCase() === categoryInput.toLowerCase()) : undefined;
  const costPrice = data["Cost price"] ? Number(data["Cost price"]) : undefined;
  const taxRate = data["Tax/VAT rate"] ? Number(data["Tax/VAT rate"]) : undefined;
  const stockQuantity = data["Stock quantity"] ? Number(data["Stock quantity"]) : undefined;

  return {
    name,
    sku: data.SKU?.trim() || undefined,
    description: data.Description?.trim() || undefined,
    product_type: data["Product type"]?.toLowerCase().includes("service") ? "service" : "product",
    unit_price: unitPrice,
    cost_price: Number.isFinite(costPrice) ? costPrice : undefined,
    tax_rate: Number.isFinite(taxRate) ? taxRate : undefined,
    currency: data.Currency?.trim() || "NGN",
    stock_quantity: Number.isFinite(stockQuantity) ? stockQuantity : undefined,
    track_inventory: data["Track inventory"]?.toLowerCase() === "true" || data["Track inventory"]?.toLowerCase() === "yes",
    status: data.Status?.toLowerCase().includes("inactive") ? "inactive" : "active",
    category_id: category?.id,
  };
}

export function ProductsPage() {
  const { products, categories, pagination, pager, loading, error, create, update, remove } = useProducts();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const filteredProducts = products.filter((product) => {
    if (typeFilter && product.product_type !== typeFilter) return false;
    if (statusFilter && product.status !== statusFilter) return false;
    if (categoryFilter && product.category_id !== categoryFilter) return false;
    return true;
  });
  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);
  const inactiveCount = products.filter((product) => product.status === "inactive").length;

  async function createCatalogItem(values?: Record<string, string>) {
    const data = values ?? {};
    try {
      await create(productPayload(data, categories));
    } catch (requestError) {
      throw new Error(getApiErrorMessage(requestError, "Unable to create catalog item."));
    }
  }

  async function updateCatalogItem(values?: Record<string, string>) {
    if (!editingProduct) return;
    try {
      await update(editingProduct.id, productPayload(values ?? {}, categories));
      setEditingProduct(null);
    } catch (requestError) {
      throw new Error(getApiErrorMessage(requestError, "Unable to update catalog item."));
    }
  }

  async function deleteCatalogItem(product: Product) {
    if (!window.confirm(`Delete ${product.name}? This action cannot be undone.`)) return;
    try {
      await remove(product.id);
      notifyDashboard(`${product.name} deleted`);
    } catch (requestError) {
      notifyDashboard(getApiErrorMessage(requestError, "Unable to delete catalog item."));
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
        fields={productFields}
        onSubmit={createCatalogItem}
      />
      <DashboardFormModal
        open={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        title="Edit Item"
        description="Update product or service details used on invoices."
        submitLabel="Update Item"
        fields={productFields}
        initialValues={editingProduct ? productToValues(editingProduct, categories) : {}}
        onSubmit={updateCatalogItem}
      />
      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <MetricCard label="Total Items" value={String(pagination?.total ?? products.length)} meta="API catalog records" />
        <MetricCard label="Active Services" value={String(products.filter((product) => product.product_type === "service" && product.status === "active").length)} meta="Loaded service records" />
        <MetricCard label="Compliance Alerts" value={String(inactiveCount)} meta="Inactive catalog items" tone="danger" />
      </div>
      <FilterBar
        className="mb-6"
        search={pager.search}
        onSearchChange={pager.setSearch}
        searchPlaceholder="Search products, services, or SKU"
        selects={[
          { key: "type", label: "Item type", value: typeFilter, onChange: setTypeFilter, options: [{ label: "Products", value: "product" }, { label: "Services", value: "service" }] },
          { key: "status", label: "Status", value: statusFilter, onChange: setStatusFilter, options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] },
          { key: "category", label: "Category", value: categoryFilter, onChange: setCategoryFilter, options: categories.map((category) => ({ label: category.name, value: category.id })) },
        ]}
        onClear={() => { pager.setSearch(""); setTypeFilter(""); setStatusFilter(""); setCategoryFilter(""); }}
      />
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
          Actions: rowActions(undefined, product.name, [
            { label: "View item", icon: Eye, onSelect: () => setViewingProduct(product) },
            { label: "Edit item", icon: Edit3, onSelect: () => setEditingProduct(product) },
            { label: "Delete item", icon: Trash2, tone: "danger", onSelect: () => void deleteCatalogItem(product) },
          ]),
        }))}
        footer={loading ? "Loading API records..." : `Showing ${filteredProducts.length} filtered items from ${pagination?.total ?? products.length} catalog records`}
        footerActions={<Pagination pagination={pagination} onPageChange={pager.setPage} />}
        loading={loading}
      />
      {viewingProduct ? <ProductDetailsModal product={viewingProduct} categories={categories} onClose={() => setViewingProduct(null)} /> : null}
      <BottomInsight title="Streamline your FIRS Compliance" asideTitle="Need Assistance?" />
    </>
  );
}

function ProductDetailsModal({ product, categories, onClose }: { product: Product; categories: ProductCategory[]; onClose: () => void }) {
  const category = product.category_id ? categories.find((item) => item.id === product.category_id)?.name ?? product.category_id : "Uncategorized";
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[#191C1E]/45 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="product-details-title" onMouseDown={onClose}>
      <Card className="w-full max-w-4xl overflow-hidden shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="bg-[#075CB6] px-6 py-7 text-white sm:px-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Catalog profile</p>
              <h2 id="product-details-title" className="mt-2 text-3xl font-black">{product.name}</h2>
              <div className="mt-3 flex flex-wrap gap-2"><StatusBadge tone="primary">{product.product_type}</StatusBadge><StatusBadge tone={product.status === "active" ? "success" : "danger"}>{product.status}</StatusBadge></div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close product details" className="rounded-lg p-2 text-white hover:bg-white/10"><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="p-6 sm:p-10">
          <div className="grid gap-5 sm:grid-cols-3">
            <ProductMetric icon={CircleDollarSign} label="Unit price" value={<CurrencyAmount amount={product.unit_price} currency={product.currency} />} />
            <ProductMetric icon={Tag} label="VAT rate" value={product.tax_rate == null ? "Not configured" : `${product.tax_rate}%`} />
            <ProductMetric icon={PackageCheck} label="Stock" value={product.track_inventory ? String(product.stock_quantity ?? 0) : "Not tracked"} />
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <ProductSection icon={Boxes} title="Item information">
              <ProductLine label="SKU" value={product.sku} />
              <ProductLine label="Category" value={category} />
              <ProductLine label="Currency" value={product.currency} />
              <ProductLine label="Cost price" value={<CurrencyAmount amount={product.cost_price ?? 0} currency={product.currency} />} />
            </ProductSection>
            <ProductSection icon={FileText} title="Description">
              <p className="whitespace-pre-wrap leading-7 text-[#454557]">{product.description || "No description provided."}</p>
            </ProductSection>
          </div>
        </div>
        <div className="h-3 bg-[#E9E5DF]">
          <div className="h-full w-2/3 bg-[#075CB6]" />
        </div>
      </Card>
    </div>
  );
}

function ProductMetric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[#F1F4F8] p-5">
      <Icon className="h-5 w-5 text-[#075CB6]" />
      <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-[#757588]">{label}</p>
      <p className="mt-1 text-lg font-black text-[#081936]">{value}</p>
    </div>
  );
}

function ProductSection({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="flex items-center gap-2 border-b-2 border-[#075CB6] pb-3 text-sm font-black uppercase tracking-wide"><Icon className="h-4 w-4 text-[#075CB6]" />{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function ProductLine({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#757588]">{label}</p>
      <div className="mt-1 break-words font-semibold text-[#191C1E]">{value || "Not provided"}</div>
    </div>
  );
}
