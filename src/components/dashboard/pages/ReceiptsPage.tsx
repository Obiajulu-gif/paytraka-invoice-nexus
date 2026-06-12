"use client";

import { useState } from "react";
import { DashboardFormModal, GenericTablePage } from "../ui";

export function ReceiptsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <GenericTablePage
        title="Receipts"
        subtitle="Track incoming payments and reconcile audit trails."
        button="+ Record Payment"
        onPrimaryAction={() => setModalOpen(true)}
        metrics={[["Total Received This Month", "₦28.4M"], ["Outstanding Balance", "₦14.4M"], ["Receipts Issued", "96"]]}
        tableTitle="Recent Transactions"
        columns={["Receipt #", "Customer", "Linked Invoice", "Amount", "Payment Method", "Date", "Status", "Actions"]}
        data={[
          ["RCP-2026-089", "Aliko & Associates", "INV-10442", "₦450,000.00", "Bank Transfer", "Oct 24, 2026", "Matched"],
          ["RCP-2026-090", "Olu Clean Energy", "-", "₦1,200,000.00", "POS", "Oct 23, 2026", "Unlinked"],
          ["RCP-2026-091", "Kuda Digital Hub", "INV-10446", "₦75,500.00", "Bank Transfer", "Oct 22, 2026", "Matched"],
          ["RCP-2026-092", "Small Biz Ltd", "-", "₦12,000.00", "Cash", "Oct 21, 2026", "Unlinked"],
        ]}
        bottom
      />
      <DashboardFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Payment"
        description="Record a customer payment and link it to an invoice."
        submitLabel="Save Receipt"
        fields={["Customer", "Linked Invoice", "Amount received", "Payment method", "Payment date", "Notes"]}
      />
    </>
  );
}
