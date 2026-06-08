// // Mock Receipts Service
// // Replace these mock functions with real API calls when backend is ready

// export interface Receipt {
//   id: string;
//   receiptNumber: string;
//   invoiceId: string;
//   invoiceNumber: string;
//   customerId: string;
//   customerName: string;
//   amount: number;
//   paymentMethod: "cash" | "bank_transfer" | "card" | "mobile_money";
//   paymentDate: string;
//   notes?: string;
//   createdAt: string;
// }

// // Mock data storage
// let mockReceipts: Receipt[] = [
//   {
//     id: "1",
//     receiptNumber: "RCP-2024-001",
//     invoiceId: "1",
//     invoiceNumber: "INV-2024-001",
//     customerId: "1",
//     customerName: "Acme Corporation",
//     amount: 537500,
//     paymentMethod: "bank_transfer",
//     paymentDate: "2024-01-20",
//     notes: "Payment received in full",
//     createdAt: "2024-01-20",
//   },
//   {
//     id: "2",
//     receiptNumber: "RCP-2024-002",
//     invoiceId: "2",
//     invoiceNumber: "INV-2024-002",
//     customerId: "2",
//     customerName: "Global Traders Ltd",
//     amount: 500000,
//     paymentMethod: "card",
//     paymentDate: "2024-02-25",
//     notes: "Partial payment",
//     createdAt: "2024-02-25",
//   },
// ];

// /**
//  * Get all receipts
//  * TODO: Replace with real API call
//  * Example: return fetch('/api/receipts').then(res => res.json())
//  */
// export const getReceipts = async (): Promise<Receipt[]> => {
//   await new Promise((resolve) => setTimeout(resolve, 300));
//   return [...mockReceipts];
// };

// /**
//  * Create a new receipt
//  * TODO: Replace with real API call
//  * Example: return fetch('/api/receipts', { method: 'POST', body: JSON.stringify(receipt) })
//  */
// export const createReceipt = async (receipt: Omit<Receipt, "id" | "receiptNumber" | "createdAt">): Promise<Receipt> => {
//   await new Promise((resolve) => setTimeout(resolve, 300));
//   const newReceipt: Receipt = {
//     ...receipt,
//     id: Date.now().toString(),
//     receiptNumber: `RCP-2024-${String(mockReceipts.length + 1).padStart(3, "0")}`,
//     createdAt: new Date().toISOString().split("T")[0],
//   };
//   mockReceipts.push(newReceipt);
//   return newReceipt;
// };

import { Invoice, updateInvoice, getInvoices } from "./invoicesService";
import { recalculateReports } from "./reportsService";

export interface Receipt {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: "cash" | "bank_transfer" | "card" | "mobile_money";
  paymentDate: string;
  notes?: string;
  createdAt: string;
}

// Mock data
let mockReceipts: Receipt[] = [];

/**
 * Get all receipts
 */
export const getReceipts = async (): Promise<Receipt[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...mockReceipts];
};

/**
 * Create a new receipt and automatically update invoice + reports
 */
export const createReceipt = async (
  receipt: Omit<Receipt, "id" | "receiptNumber" | "createdAt">
): Promise<Receipt> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newReceipt: Receipt = {
    ...receipt,
    id: Date.now().toString(),
    receiptNumber: `RCP-${new Date().getFullYear()}-${String(
      mockReceipts.length + 1
    ).padStart(3, "0")}`,
    createdAt: new Date().toISOString().split("T")[0],
  };

  mockReceipts.push(newReceipt);

  await updateLinkedInvoice(receipt.invoiceId);
  await recalculateReports();

  return newReceipt;
};

/**
 * Update a receipt (e.g. amount or method) and refresh invoice + reports
 */
export const updateReceipt = async (
  id: string,
  updates: Partial<Receipt>
): Promise<Receipt> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockReceipts.findIndex((r) => r.id === id);
  if (index === -1) throw new Error("Receipt not found");

  mockReceipts[index] = { ...mockReceipts[index], ...updates };

  await updateLinkedInvoice(mockReceipts[index].invoiceId);
  await recalculateReports();

  return mockReceipts[index];
};

/**
 * Delete a receipt and adjust related invoice + reports
 */
export const deleteReceipt = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const receipt = mockReceipts.find((r) => r.id === id);
  if (!receipt) throw new Error("Receipt not found");

  mockReceipts = mockReceipts.filter((r) => r.id !== id);

  await updateLinkedInvoice(receipt.invoiceId);
  await recalculateReports();
};

/**
 * Internal helper — updates invoice status based on total receipts
 */
const updateLinkedInvoice = async (invoiceId: string) => {
  const invoices = await getInvoices();
  const invoice = invoices.find((inv) => inv.id === invoiceId);
  if (!invoice) return;

  const totalPaid = mockReceipts
    .filter((r) => r.invoiceId === invoiceId)
    .reduce((sum, r) => sum + r.amount, 0);

  let newStatus: Invoice["status"] = invoice.status;
  if (totalPaid >= invoice.total) {
    newStatus = "paid";
  } else if (totalPaid > 0) {
    newStatus = "sent"; // partial
  }

  await updateInvoice(invoiceId, { status: newStatus });
};
