// // Mock Reports Service
// // Replace these mock functions with real API calls when backend is ready

// export interface RevenueSummary {
//   totalRevenue: number;
//   paidRevenue: number;
//   unpaidRevenue: number;
//   overdueRevenue: number;
//   monthlyRevenue: { month: string; revenue: number }[];
// }

// export interface InvoiceStatusSummary {
//   total: number;
//   paid: number;
//   sent: number;
//   overdue: number;
//   draft: number;
//   cancelled: number;
// }

// export interface TopCustomer {
//   customerId: string;
//   customerName: string;
//   totalRevenue: number;
//   invoiceCount: number;
// }

// /**
//  * Get revenue summary
//  * TODO: Replace with real API call
//  * Example: return fetch('/api/reports/revenue').then(res => res.json())
//  */
// export const getRevenueSummary = async (): Promise<RevenueSummary> => {
//   await new Promise((resolve) => setTimeout(resolve, 300));
//   return {
//     totalRevenue: 2631750,
//     paidRevenue: 537500,
//     unpaidRevenue: 2094250,
//     overdueRevenue: 1075000,
//     monthlyRevenue: [
//       { month: "Jan", revenue: 537500 },
//       { month: "Feb", revenue: 1019250 },
//       { month: "Mar", revenue: 1075000 },
//       { month: "Apr", revenue: 0 },
//       { month: "May", revenue: 0 },
//       { month: "Jun", revenue: 0 },
//     ],
//   };
// };

// /**
//  * Get invoice status summary
//  * TODO: Replace with real API call
//  * Example: return fetch('/api/reports/invoice-status').then(res => res.json())
//  */
// export const getInvoiceStatusSummary =
//   async (): Promise<InvoiceStatusSummary> => {
//     await new Promise((resolve) => setTimeout(resolve, 300));
//     return {
//       total: 3,
//       paid: 1,
//       sent: 1,
//       overdue: 1,
//       draft: 0,
//       cancelled: 0,
//     };
//   };

// /**
//  * Get top customers
//  * TODO: Replace with real API call
//  * Example: return fetch('/api/reports/top-customers').then(res => res.json())
//  */
// export const getTopCustomers = async (): Promise<TopCustomer[]> => {
//   await new Promise((resolve) => setTimeout(resolve, 300));
//   return [
//     {
//       customerId: "3",
//       customerName: "Tech Solutions Inc",
//       totalRevenue: 1075000,
//       invoiceCount: 1,
//     },
//     {
//       customerId: "2",
//       customerName: "Global Traders Ltd",
//       totalRevenue: 1019250,
//       invoiceCount: 1,
//     },
//     {
//       customerId: "1",
//       customerName: "Acme Corporation",
//       totalRevenue: 537500,
//       invoiceCount: 1,
//     },
//   ];
// };

import { mockInvoices } from "./invoicesService";

export interface RevenueSummary {
  totalRevenue: number | null;
  paidRevenue: number | null;
  unpaidRevenue: number | null;
  // overdueRevenue: number | null;
  monthlyRevenue: { month: string; revenue: number }[] | null;
}

export interface InvoiceStatusSummary {
  total: number | null;
  paid: number | null;
  sent: number | null;
  // overdue: number | null;
  // draft: number | null;
  // cancelled: number | null;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  totalRevenue: number;
  invoiceCount: number;
}

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Calculate revenue summary dynamically from mockInvoices
 */
export const getRevenueSummary = async (): Promise<RevenueSummary> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (!mockInvoices || mockInvoices.length === 0) {
    return {
      totalRevenue: null,
      paidRevenue: null,
      unpaidRevenue: null,
      // overdueRevenue: null,
      monthlyRevenue: null,
    };
  }

  const totalRevenue = mockInvoices.reduce(
    (sum, inv) => sum + (inv.total || 0),
    0
  );
  const paidRevenue = mockInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);
  const unpaidRevenue = mockInvoices
    .filter((inv) => inv.status === "sent")
    // .filter((inv) => inv.status === "sent" || inv.status === "draft")
    .reduce((sum, inv) => sum + inv.total, 0);
  // const overdueRevenue = mockInvoices;
  // .filter((inv) => inv.status === "overdue")
  // .reduce((sum, inv) => sum + inv.total, 0);

  // Monthly breakdown by invoice date
  const monthlyRevenueMap: Record<string, number> = {};
  mockInvoices.forEach((inv) => {
    const date = new Date(inv.date);
    const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    monthlyRevenueMap[key] = (monthlyRevenueMap[key] || 0) + inv.total;
  });

  const monthlyRevenue = Object.entries(monthlyRevenueMap)
    .map(([month, revenue]) => ({ month, revenue }))
    .sort(
      (a, b) =>
        monthNames.indexOf(a.month.split(" ")[0]) -
        monthNames.indexOf(b.month.split(" ")[0])
    );

  return {
    totalRevenue,
    paidRevenue,
    unpaidRevenue,
    // overdueRevenue,
    monthlyRevenue,
  };
};

export const reportCache = {
  revenueSummary: null,
  statusSummary: null,
  topCustomers: null,
};

/**
 * Dynamically recompute reports (mocked)
 */
export const recalculateReports = async () => {
  // Later this will compute from invoices + receipts
  reportCache.revenueSummary = null;
  reportCache.statusSummary = null;
  reportCache.topCustomers = null;

  console.log("📊 Reports recalculated (currently null placeholders)");
};

/**
 * Calculate invoice status summary dynamically
 */
export const getInvoiceStatusSummary =
  async (): Promise<InvoiceStatusSummary> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!mockInvoices || mockInvoices.length === 0) {
      return {
        total: null,
        paid: null,
        sent: null,
        // overdue: null,
        // draft: null,
        // cancelled: null,
      };
    }

    const summary: InvoiceStatusSummary = {
      total: mockInvoices.length,
      paid: mockInvoices.filter((inv) => inv.status === "paid").length,
      sent: mockInvoices.filter((inv) => inv.status === "sent").length,
      // overdue: mockInvoices.filter((inv) => inv.status === "overdue").length,
      // draft: mockInvoices.filter((inv) => inv.status === "draft").length,
      // cancelled: mockInvoices.filter((inv) => inv.status === "cancelled")
      // .length,
    };

    return summary;
  };

/**
 * Identify top customers by total invoiced amount
 */
export const getTopCustomers = async (): Promise<TopCustomer[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (!mockInvoices || mockInvoices.length === 0) return [];

  const customerMap: Record<string, TopCustomer> = {};

  mockInvoices.forEach((inv) => {
    const id = inv.customerId;
    if (!id) return;
    if (!customerMap[id]) {
      customerMap[id] = {
        customerId: id,
        customerName: inv.customerName,
        totalRevenue: 0,
        invoiceCount: 0,
      };
    }
    customerMap[id].totalRevenue += inv.total;
    customerMap[id].invoiceCount += 1;
  });

  return Object.values(customerMap).sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );
};
