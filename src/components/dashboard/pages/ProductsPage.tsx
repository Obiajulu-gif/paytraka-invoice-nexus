import { Plus } from "lucide-react";
import { productRows } from "../data";
import { BottomInsight, Button, Card, DataTable, MetricCard, PageHeader, StatusBadge, rowActions } from "../ui";

export function ProductsPage() {
  return (
    <>
      <PageHeader title="Products & Services" subtitle="Inventory › Catalog Management" action={<Button><Plus className="h-4 w-4" /> Add New Item</Button>} />
      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <MetricCard label="Total Items" value="1,284" meta="+12% this month" />
        <MetricCard label="Active Services" value="432" meta="Live in marketplace" />
        <MetricCard label="Compliance Alerts" value="28 Items" meta="Missing Tax/HS Codes" tone="danger" />
      </div>
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap gap-3">
          {["All", "Products", "Services"].map((tab, index) => <button key={tab} className={`rounded-full px-4 py-2 text-sm font-bold ${index === 0 ? "bg-[#DADEFD] text-[#0001B1]" : "text-[#454557]"}`}>{tab}</button>)}
        </div>
      </Card>
      <DataTable
        title="Inventory List"
        columns={["Item Name", "SKU/ID", "Category", "Unit Price", "VAT Rate", "HS Code", "Actions"]}
        rows={productRows.map(([item, sku, category, price, vat, code]) => ({
          "Item Name": <b>{item}</b>,
          "SKU/ID": sku,
          Category: <StatusBadge tone="primary">{category}</StatusBadge>,
          "Unit Price": <b>{price}</b>,
          "VAT Rate": <StatusBadge>{vat}</StatusBadge>,
          "HS Code": code,
          Actions: rowActions(),
        }))}
        footer="Showing 4 of 1,284 items"
      />
      <BottomInsight title="Streamline your FIRS Compliance" asideTitle="Need Assistance?" />
    </>
  );
}
