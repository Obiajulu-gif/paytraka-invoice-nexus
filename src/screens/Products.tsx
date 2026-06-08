import { useEffect, useState } from "react";
import { Box, BriefcaseBusiness, Edit, Package, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EmptyState,
  LoadingCards,
  PageHeader,
  SearchToolbar,
  SegmentedButton,
} from "@/components/AppPrimitives";
import { ProductDialog } from "@/components/ProductDialog";
import { deleteProduct, getProducts, type Product } from "@/services/productsService";
import { formatCurrency } from "@/utils/currency";
import { toast } from "sonner";

type ProductFilter = "all" | "product" | "service";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products/services");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      (product.sku || "").toLowerCase().includes(query);
    const matchesFilter = filter === "all" || product.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete ${product.name}? This action cannot be undone.`)) return;

    try {
      await deleteProduct(product.id);
      toast.success("Product/service deleted successfully");
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product/service");
    }
  };

  const handleAddNew = () => {
    setEditingProduct(undefined);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="app-section">
        <PageHeader
          title="Products & Services"
          description="Loading billable catalog items."
        />
        <LoadingCards count={4} />
      </div>
    );
  }

  return (
    <div className="app-section">
      <PageHeader
        eyebrow="Billable catalog"
        title="Products & Services"
        description="Keep product and service pricing, tax rates, and SKUs ready for fast invoice creation."
        action={
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Product/Service
          </Button>
        }
      />

      <SearchToolbar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search catalog by name, description, or SKU..."
      >
        <SegmentedButton active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </SegmentedButton>
        <SegmentedButton active={filter === "product"} onClick={() => setFilter("product")}>
          Products
        </SegmentedButton>
        <SegmentedButton active={filter === "service"} onClick={() => setFilter("service")}>
          Services
        </SegmentedButton>
      </SearchToolbar>

      {filteredProducts.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const Icon = product.type === "product" ? Package : BriefcaseBusiness;
            return (
              <article
                key={product.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">{product.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                        {product.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      product.type === "product"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-primary/20 bg-primary/5 text-primary"
                    }
                  >
                    {product.type}
                  </Badge>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="text-xs text-slate-500">Unit price</p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tax</p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {product.taxRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <p className="mt-1 font-semibold text-primary">Active</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    SKU: <span className="font-medium text-slate-700">{product.sku || "N/A"}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingProduct(product);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(product)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Box}
          title="No catalog items yet"
          description="Add products or services so invoice line items can be created quickly."
          action={<Button onClick={handleAddNew}>Add Product/Service</Button>}
        />
      )}

      <ProductDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingProduct(undefined);
        }}
        product={editingProduct}
        onSuccess={loadProducts}
      />
    </div>
  );
}
