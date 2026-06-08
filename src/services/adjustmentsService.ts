// Mock Credit Notes and Debit Notes Service
// Replace these mock functions with real API calls when backend is ready

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  reason: string;
  date: string;
  status: "draft" | "issued";
  createdAt: string;
}

export interface DebitNote {
  id: string;
  debitNoteNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  reason: string;
  date: string;
  status: "draft" | "issued";
  createdAt: string;
}

// Mock data storage
const mockCreditNotes: CreditNote[] = [
  {
    id: "1",
    creditNoteNumber: "CN-2024-001",
    invoiceId: "2",
    invoiceNumber: "INV-2024-002",
    customerId: "2",
    customerName: "Global Traders Ltd",
    amount: 50000,
    reason: "Product return - defective items",
    date: "2024-03-05",
    status: "issued",
    createdAt: "2024-03-05",
  },
];

const mockDebitNotes: DebitNote[] = [
  {
    id: "1",
    debitNoteNumber: "DN-2024-001",
    invoiceId: "2",
    invoiceNumber: "INV-2024-002",
    customerId: "2",
    customerName: "Global Traders Ltd",
    amount: 15000,
    reason: "Additional delivery charges",
    date: "2024-03-01",
    status: "issued",
    createdAt: "2024-03-01",
  },
];

/**
 * Get all credit notes
 * TODO: Replace with real API call
 * Example: return fetch('/api/credit-notes').then(res => res.json())
 */
export const getCreditNotes = async (): Promise<CreditNote[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...mockCreditNotes];
};

/**
 * Create a new credit note
 * TODO: Replace with real API call
 * Example: return fetch('/api/credit-notes', { method: 'POST', body: JSON.stringify(creditNote) })
 */
export const createCreditNote = async (
  creditNote: Omit<CreditNote, "id" | "creditNoteNumber" | "createdAt">
): Promise<CreditNote> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const newCreditNote: CreditNote = {
    ...creditNote,
    id: Date.now().toString(),
    creditNoteNumber: `CN-2024-${String(mockCreditNotes.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  mockCreditNotes.push(newCreditNote);
  return newCreditNote;
};

/**
 * Get all debit notes
 * TODO: Replace with real API call
 * Example: return fetch('/api/debit-notes').then(res => res.json())
 */
export const getDebitNotes = async (): Promise<DebitNote[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...mockDebitNotes];
};

/**
 * Create a new debit note
 * TODO: Replace with real API call
 * Example: return fetch('/api/debit-notes', { method: 'POST', body: JSON.stringify(debitNote) })
 */
export const createDebitNote = async (
  debitNote: Omit<DebitNote, "id" | "debitNoteNumber" | "createdAt">
): Promise<DebitNote> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const newDebitNote: DebitNote = {
    ...debitNote,
    id: Date.now().toString(),
    debitNoteNumber: `DN-2024-${String(mockDebitNotes.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  mockDebitNotes.push(newDebitNote);
  return newDebitNote;
};
