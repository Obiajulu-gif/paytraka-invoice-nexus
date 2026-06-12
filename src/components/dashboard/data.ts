export const dashboardMetrics = [
  ["Total Invoices", "128", "+12%", "primary"],
  ["Submitted to FIRS", "74", "Compliant", "success"],
  ["Pending Submission", "18", "In queue", "neutral"],
  ["Failed Validation", "6", "Action Req.", "danger"],
  ["Amount Invoiced", "₦42.8M", "", "neutral"],
  ["Payments Received", "₦28.4M", "66%", "success"],
  ["VAT Summary (YTD)", "₦3.2M", "", "neutral"],
];

export const recentSalesRows = [
  { invoice: "INV-2026-0042", customer: "Julius Construction", amount: "₦1,290,000", customerStatus: "Sent", firs: "Ready", date: "Oct 24, 2026" },
  { invoice: "INV-2026-0041", customer: "Akin & Sons Ltd", amount: "₦450,000", customerStatus: "Sent", firs: "Accepted", date: "Oct 22, 2026" },
  { invoice: "INV-2026-0040", customer: "TechNova Hub", amount: "₦85,000", customerStatus: "Draft", firs: "Failed", date: "Oct 21, 2026" },
];

export const salesInvoiceRows = [
  ["INV-2026-0101", "Dangote Refinery Ltd", "Oct 12, 2026", "Oct 26, 2026", "₦4,250,000.00", "Paid", "Accepted"],
  ["INV-2026-0102", "MainOne Cable Co.", "Oct 14, 2026", "Oct 28, 2026", "₦1,120,500.00", "Sent", "Failed"],
  ["INV-2026-0103", "Zinox Technologies", "Oct 15, 2026", "Oct 29, 2026", "₦850,000.00", "Draft", "Draft"],
  ["INV-2026-0104", "Flutterwave Inc.", "Oct 16, 2026", "Oct 30, 2026", "₦2,300,000.00", "Viewed", "Submitted"],
];

export const purchaseInvoiceRows = [
  ["#INV-90231", "Dangote Group", "₦1,240,000.00", "₦93,000.00", "Verified", "Oct 24, 2026"],
  ["#INV-89552", "MainOne Tech", "₦450,000.00", "₦0.00", "Failed", "Oct 22, 2026"],
  ["#INV-88120", "Julius Berger", "₦2,100,000.00", "Pending...", "Pending", "Oct 19, 2026"],
  ["#INV-87994", "Axa Mansard", "₦150,000.00", "₦11,250.00", "Verified", "Oct 15, 2026"],
];

export const customerRows = [
  ["Dangote Allied", "29485762-0001", "finance@dangote.com\n+234 803 123 4567", "142", "Ready"],
  ["Konga Africa", "TIN Missing", "ops@konga.com.ng\n+234 701 555 9999", "56", "TIN Missing"],
  ["MTN Solutions", "88374621-0012", "admin@mtn.ng\n+234 803 000 0000", "12", "Ready"],
  ["Zola Electric", "11223344-0005", "accounts@zola.ng\n+234 902 444 8888", "241", "Ready"],
];

export const supplierRows = [
  ["Zenith Logistics Ltd", "93837261-0001", "Logistics", "₦24,200,000", "Verified"],
  ["Alpha Medical Supplies", "TIN Missing", "Healthcare", "₦8,450,000", "Missing TIN"],
  ["Northstar Energy", "83827164-0011", "Utilities", "₦19,500,000", "Verified"],
  ["Oakbridge Packaging", "Pending", "Packaging", "₦5,920,000", "Review"],
];

export const productRows = [
  ["Luxury Chronograph", "LXC-901-NG", "Physical Good", "₦125,000.00", "7.5% Standard", "9101.11.00"],
  ["Consultancy - Tier 1", "SRV-CON-001", "Service", "₦450,000.00", "Undefined", "Required"],
  ["Training Modules (L&D)", "EDU-TR-442", "Service", "₦12,500.00", "Exempt", "N/A (Srv)"],
  ["Enterprise Software Suite", "SaaS-ENT-PREM", "Digital Service", "₦85,000.00", "7.5% Standard", "8523.49.00"],
];
