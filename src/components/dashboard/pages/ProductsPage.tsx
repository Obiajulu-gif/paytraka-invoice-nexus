"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { productRows } from "../data";
import { BottomInsight, Button, Card, DashboardFormModal, DataTable, MetricCard, notifyDashboard, PageHeader, StatusBadge, rowActions } from "../ui";

export function ProductsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [rows, setRows] = useState(productRows);
  const [activeTab, setActiveTab] = useState("All");

  return (
    <>
      <PageHeader title="Products & Services" subtitle="Inventory › Catalog Management" action={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Add New Item</Button>} />
      <DashboardFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Item"
        description="Add a product or service with unit price and VAT details."
        submitLabel="Save Item"
        fields={["Item/Product name", "SKU or code", "Description", "Unit price", "Tax/VAT rate", "Stock quantity"]}
        onSubmit={() => setRows((current) => [["New Compliance Service", "SRV-NEW-001", "Service", "₦0.00", "7.5% Standard", "Pending"], ...current])}
      />
      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <MetricCard label="Total Items" value="1,284" meta="+12% this month" />
        <MetricCard label="Active Services" value="432" meta="Live in marketplace" />
        <MetricCard label="Compliance Alerts" value="28 Items" meta="Missing Tax/HS Codes" tone="danger" />
      </div>
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap gap-3">
          {["All", "Products", "Services"].map((tab) => <button key={tab} type="button" onClick={() => { setActiveTab(tab); notifyDashboard(`${tab} catalog filter applied`); }} className={`rounded-full px-4 py-2 text-sm font-bold ${activeTab === tab ? "bg-[#DADEFD] text-[#0001B1]" : "text-[#454557]"}`}>{tab}</button>)}
        </div>
      </Card>
      <DataTable
        title="Inventory List"
        columns={["Item Name", "SKU/ID", "Category", "Unit Price", "VAT Rate", "HS Code", "Actions"]}
        rows={rows.map(([item, sku, category, price, vat, code]) => ({
          "Item Name": <b>{item}</b>,
          "SKU/ID": sku,
          Category: <StatusBadge tone="primary">{category}</StatusBadge>,
          "Unit Price": <b>{price}</b>,
          "VAT Rate": <StatusBadge>{vat}</StatusBadge>,
          "HS Code": code,
          Actions: rowActions(undefined, item),
        }))}
        footer={`Showing ${Math.min(rows.length, 5)} of 1,284 items`}
      />
      <BottomInsight title="Streamline your FIRS Compliance" asideTitle="Need Assistance?" />
    </>
  );
}
