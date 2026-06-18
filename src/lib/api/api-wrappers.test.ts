import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authApi from "./auth";
import * as companiesApi from "./companies";
import * as customersApi from "./customers";
import * as firsApi from "./firs";
import * as invoicesApi from "./invoices";
import * as productsApi from "./products";
import * as purchaseInvoicesApi from "./purchase-invoices";
import * as receiptsApi from "./receipts";
import * as suppliersApi from "./suppliers";

const clientMocks = vi.hoisted(() => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  publicApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("./client", () => ({
  default: clientMocks.apiClient,
  publicApiClient: clientMocks.publicApiClient,
  API_BASE_URL: "https://paytraka-api.domain-plusltd.com/api",
}));

const user = {
  id: "user-1",
  first_name: "Ada",
  email: "ada@example.com",
  role: "admin",
  company_id: "company-1",
  company_status: "active",
  firs_enabled: 0,
};

function apiResponse<T>(data: T) {
  return { success: true, data };
}

function axiosResponse<T>(data: T) {
  return { data };
}

describe("auth API wrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ success: true }))));
  });

  it("registers users against /auth/register", async () => {
    const payload = {
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
      password: "Test@1234",
      phone: "08012345678",
      company_name: "Ada Ltd",
      trading_name: "Ada Ventures",
    };
    clientMocks.publicApiClient.post.mockResolvedValue(axiosResponse(apiResponse({ user_id: "user-1" })));

    await expect(authApi.register(payload)).resolves.toEqual(apiResponse({ user_id: "user-1" }));

    expect(clientMocks.publicApiClient.post).toHaveBeenCalledWith("/auth/register", payload);
  });

  it("normalizes registered user ids from backend response variants", () => {
    expect(authApi.getRegisteredUserId({ userId: "camel-id" })).toBe("camel-id");
    expect(authApi.getRegisteredUserId({ user_id: "snake-id" })).toBe("snake-id");
    expect(authApi.getRegisteredUserId({ user: { ...user, id: "nested-id" } })).toBe("nested-id");
    expect(authApi.getRegisteredUserId({})).toBe("");
  });

  it("propagates duplicate-account signup failures without creating a session", async () => {
    clientMocks.publicApiClient.post.mockRejectedValue(new Error("Account already exists"));

    await expect(authApi.register({
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
      password: "Test@1234",
      phone: "08012345678",
      company_name: "Ada Ltd",
    })).rejects.toThrow("Account already exists");

    expect(fetch).not.toHaveBeenCalled();
  });

  it("successfully signs up by registering without creating a token session before OTP", async () => {
    const registerResponse = apiResponse({ userId: "user-1" });
    clientMocks.publicApiClient.post.mockResolvedValue(axiosResponse(registerResponse));

    await expect(authApi.register({
      first_name: "Grace",
      last_name: "Hopper",
      email: "grace@example.com",
      password: "Test@1234",
      phone: "08012345678",
      company_name: "Grace Ltd",
    })).resolves.toEqual(registerResponse);

    expect(fetch).not.toHaveBeenCalled();
  });

  it("resends signup OTPs with the registered user id", async () => {
    clientMocks.publicApiClient.post.mockResolvedValue(axiosResponse(apiResponse(null)));

    await expect(authApi.resendOtp("user-1")).resolves.toEqual(apiResponse(null));

    expect(clientMocks.publicApiClient.post).toHaveBeenCalledWith("/auth/resend-otp", { user_id: "user-1" });
  });

  it("verifies OTP and stores returned tokens in the session route", async () => {
    const tokens = { accessToken: "access-token", refreshToken: "refresh-token", user };
    clientMocks.publicApiClient.post.mockResolvedValue(axiosResponse(apiResponse(tokens)));

    await expect(authApi.verifyOtp("user-1", "123456")).resolves.toEqual(apiResponse(tokens));

    expect(clientMocks.publicApiClient.post).toHaveBeenCalledWith("/auth/verify-otp", { user_id: "user-1", otp: "123456" });
    expect(fetch).toHaveBeenCalledWith("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tokens),
    });
  });

  it("logs in and stores camelCase tokens in the session route", async () => {
    const tokens = { accessToken: "access-token", refreshToken: "refresh-token", user };
    clientMocks.publicApiClient.post.mockResolvedValue(axiosResponse(apiResponse(tokens)));

    await expect(authApi.login("ada@example.com", "Test@1234")).resolves.toEqual(apiResponse(tokens));

    expect(clientMocks.publicApiClient.post).toHaveBeenCalledWith("/auth/login", { email: "ada@example.com", password: "Test@1234" });
    expect(fetch).toHaveBeenCalledWith("/api/auth/session", expect.objectContaining({
      method: "POST",
      body: JSON.stringify(tokens),
    }));
  });

  it("does not create a local session when login fails", async () => {
    clientMocks.publicApiClient.post.mockRejectedValue(new Error("Invalid credentials"));

    await expect(authApi.login("ada@example.com", "bad-password")).rejects.toThrow("Invalid credentials");

    expect(fetch).not.toHaveBeenCalled();
  });

  it("loads the current user through the authenticated client", async () => {
    clientMocks.apiClient.get.mockResolvedValue(axiosResponse(apiResponse(user)));

    await expect(authApi.getMe()).resolves.toEqual(apiResponse(user));

    expect(clientMocks.apiClient.get).toHaveBeenCalledWith("/auth/me");
  });

  it("logs out remotely and always clears local session cookies", async () => {
    clientMocks.apiClient.post.mockResolvedValue(axiosResponse(apiResponse(null)));

    await authApi.logout();

    expect(clientMocks.apiClient.post).toHaveBeenCalledWith("/auth/logout");
    expect(fetch).toHaveBeenCalledWith("/api/auth/session", { method: "DELETE" });
  });

  it("still clears local session cookies when remote logout fails", async () => {
    clientMocks.apiClient.post.mockRejectedValue(new Error("Expired token"));

    await authApi.logout();

    expect(fetch).toHaveBeenCalledWith("/api/auth/session", { method: "DELETE" });
  });
});

describe("company API wrapper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads company profile, submits KYC, and loads company mode", async () => {
    const company = { id: "company-1", public_id: "PT-1", company_name: "Ada Ltd", status: "active", mode: "demo" as const, firs_enabled: 0 };
    const kyc = {
      company_name: "Ada Ltd",
      business_email: "billing@ada.test",
      business_phone: "08012345678",
      tax_identification_number: "12345678-0001",
      rc_number: "RC123",
      business_type: "Limited Liability Company",
      address: "1 Lagos Road",
      city: "Lagos",
      state: "Lagos",
    };
    clientMocks.apiClient.get
      .mockResolvedValueOnce(axiosResponse(apiResponse(company)))
      .mockResolvedValueOnce(axiosResponse(apiResponse({ mode: "demo", firs_enabled: 0 })));
    clientMocks.apiClient.patch.mockResolvedValue(axiosResponse(apiResponse(company)));

    await expect(companiesApi.getCompany("company-1")).resolves.toEqual(apiResponse(company));
    await expect(companiesApi.submitKyc("company-1", kyc)).resolves.toEqual(apiResponse(company));
    await expect(companiesApi.getCompanyMode("company-1")).resolves.toEqual(apiResponse({ mode: "demo", firs_enabled: 0 }));

    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(1, "/companies/company-1");
    expect(clientMocks.apiClient.patch).toHaveBeenCalledWith("/companies/company-1/kyc", kyc);
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(2, "/companies/company-1/mode");
  });
});

describe("customers API wrapper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("covers customer CRUD, pagination, export, and CSV import", async () => {
    const customer = { id: "customer-1", public_id: "CUS-1", customer_type: "business" as const, name: "Ada Ventures" };
    const createPayload = { customer_type: "business" as const, name: "Ada Ventures" };
    const blob = new Blob(["name,email"]);
    const file = new File(["name,email"], "customers.csv", { type: "text/csv" });
    clientMocks.apiClient.post
      .mockResolvedValueOnce(axiosResponse(apiResponse(customer)))
      .mockResolvedValueOnce(axiosResponse(apiResponse([customer])));
    clientMocks.apiClient.get
      .mockResolvedValueOnce(axiosResponse({ ...apiResponse([customer]), pagination: { total: 1, page: 1, limit: 20, totalPages: 1 } }))
      .mockResolvedValueOnce(axiosResponse(apiResponse(customer)))
      .mockResolvedValueOnce(axiosResponse(blob));
    clientMocks.apiClient.patch.mockResolvedValue(axiosResponse(apiResponse(customer)));
    clientMocks.apiClient.delete.mockResolvedValue(axiosResponse(apiResponse(null)));

    await expect(customersApi.createCustomer(createPayload)).resolves.toEqual(apiResponse(customer));
    await expect(customersApi.listCustomers({ page: 1, limit: 20, search: "ada" })).resolves.toEqual({ ...apiResponse([customer]), pagination: { total: 1, page: 1, limit: 20, totalPages: 1 } });
    await expect(customersApi.getCustomer("customer-1")).resolves.toEqual(apiResponse(customer));
    await expect(customersApi.updateCustomer("customer-1", { phone1: "08012345678" })).resolves.toEqual(apiResponse(customer));
    await expect(customersApi.deleteCustomer("customer-1")).resolves.toEqual(apiResponse(null));
    await expect(customersApi.exportCustomers()).resolves.toBe(blob);
    await expect(customersApi.importCustomers(file)).resolves.toEqual(apiResponse([customer]));

    expect(clientMocks.apiClient.post).toHaveBeenNthCalledWith(1, "/customers", createPayload);
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(1, "/customers", { params: { page: 1, limit: 20, search: "ada" } });
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(2, "/customers/customer-1");
    expect(clientMocks.apiClient.patch).toHaveBeenCalledWith("/customers/customer-1", { phone1: "08012345678" });
    expect(clientMocks.apiClient.delete).toHaveBeenCalledWith("/customers/customer-1");
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(3, "/customers/export", { responseType: "blob" });
    expect(clientMocks.apiClient.post).toHaveBeenNthCalledWith(2, "/customers/import", expect.any(FormData), {
      headers: { "Content-Type": "multipart/form-data" },
    });
  });

  it("propagates validation errors from the API", async () => {
    clientMocks.apiClient.post.mockRejectedValue(new Error("Validation failed"));

    await expect(customersApi.createCustomer({ customer_type: "business", name: "" })).rejects.toThrow("Validation failed");
  });
});

describe("suppliers API wrapper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("covers supplier CRUD and pagination", async () => {
    const supplier = { id: "supplier-1", supplier_type: "business" as const, supplier_name: "Lagos Supplies" };
    const payload = { supplier_type: "business" as const, supplier_name: "Lagos Supplies" };
    clientMocks.apiClient.post.mockResolvedValue(axiosResponse(apiResponse(supplier)));
    clientMocks.apiClient.get
      .mockResolvedValueOnce(axiosResponse({ ...apiResponse([supplier]), pagination: { total: 1, page: 1, limit: 20, totalPages: 1 } }))
      .mockResolvedValueOnce(axiosResponse(apiResponse(supplier)));
    clientMocks.apiClient.patch.mockResolvedValue(axiosResponse(apiResponse(supplier)));
    clientMocks.apiClient.delete.mockResolvedValue(axiosResponse(apiResponse(null)));

    await suppliersApi.createSupplier(payload);
    await suppliersApi.listSuppliers({ page: 1, limit: 20 });
    await suppliersApi.getSupplier("supplier-1");
    await suppliersApi.updateSupplier("supplier-1", { payment_terms: "Net 30" });
    await suppliersApi.deleteSupplier("supplier-1");

    expect(clientMocks.apiClient.post).toHaveBeenCalledWith("/suppliers", payload);
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(1, "/suppliers", { params: { page: 1, limit: 20 } });
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(2, "/suppliers/supplier-1");
    expect(clientMocks.apiClient.patch).toHaveBeenCalledWith("/suppliers/supplier-1", { payment_terms: "Net 30" });
    expect(clientMocks.apiClient.delete).toHaveBeenCalledWith("/suppliers/supplier-1");
  });
});

describe("products API wrapper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("covers category and product endpoints", async () => {
    const category = { id: "category-1", name: "Services", description: "Work" };
    const product = { id: "product-1", name: "Consulting", product_type: "service" as const, unit_price: 1000, currency: "NGN", status: "active" as const };
    clientMocks.apiClient.post
      .mockResolvedValueOnce(axiosResponse(apiResponse(category)))
      .mockResolvedValueOnce(axiosResponse(apiResponse(product)));
    clientMocks.apiClient.get
      .mockResolvedValueOnce(axiosResponse(apiResponse([category])))
      .mockResolvedValueOnce(axiosResponse({ ...apiResponse([product]), pagination: { total: 1, page: 1, limit: 20, totalPages: 1 } }))
      .mockResolvedValueOnce(axiosResponse(apiResponse(product)));
    clientMocks.apiClient.patch
      .mockResolvedValueOnce(axiosResponse(apiResponse(category)))
      .mockResolvedValueOnce(axiosResponse(apiResponse(product)));
    clientMocks.apiClient.delete
      .mockResolvedValueOnce(axiosResponse(apiResponse(null)))
      .mockResolvedValueOnce(axiosResponse(apiResponse(null)));

    await productsApi.createCategory({ name: "Services", description: "Work" });
    await productsApi.listCategories();
    await productsApi.updateCategory("category-1", { description: "Updated" });
    await productsApi.deleteCategory("category-1");
    await productsApi.createProduct({ name: "Consulting", product_type: "service", unit_price: 1000, currency: "NGN", status: "active" });
    await productsApi.listProducts({ page: 1, limit: 20, search: "consult" });
    await productsApi.getProduct("product-1");
    await productsApi.updateProduct("product-1", { tax_rate: 7.5 });
    await productsApi.deleteProduct("product-1");

    expect(clientMocks.apiClient.post).toHaveBeenNthCalledWith(1, "/products/categories", { name: "Services", description: "Work" });
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(1, "/products/categories");
    expect(clientMocks.apiClient.patch).toHaveBeenNthCalledWith(1, "/products/categories/category-1", { description: "Updated" });
    expect(clientMocks.apiClient.delete).toHaveBeenNthCalledWith(1, "/products/categories/category-1");
    expect(clientMocks.apiClient.post).toHaveBeenNthCalledWith(2, "/products", { name: "Consulting", product_type: "service", unit_price: 1000, currency: "NGN", status: "active" });
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(2, "/products", { params: { page: 1, limit: 20, search: "consult" } });
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(3, "/products/product-1");
    expect(clientMocks.apiClient.patch).toHaveBeenNthCalledWith(2, "/products/product-1", { tax_rate: 7.5 });
    expect(clientMocks.apiClient.delete).toHaveBeenNthCalledWith(2, "/products/product-1");
  });
});

describe("invoices API wrapper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("covers sales invoice create, list, read, post, and update", async () => {
    const invoice = { id: "invoice-1", public_id: "SI-1", invoice_number: "INV-1", customer_id: "customer-1", invoice_type: "standard_invoice", issue_date: "2026-06-14", due_date: "2026-06-30", currency: "NGN", line_items: [] };
    const payload = { customer_id: "customer-1", invoice_type: "standard_invoice", issue_date: "2026-06-14", due_date: "2026-06-30", line_items: [] };
    clientMocks.apiClient.post
      .mockResolvedValueOnce(axiosResponse(apiResponse(invoice)))
      .mockResolvedValueOnce(axiosResponse(apiResponse({ ...invoice, status: "posted" })));
    clientMocks.apiClient.get
      .mockResolvedValueOnce(axiosResponse({ ...apiResponse([invoice]), pagination: { total: 1, page: 1, limit: 20, totalPages: 1 } }))
      .mockResolvedValueOnce(axiosResponse(apiResponse(invoice)));
    clientMocks.apiClient.patch.mockResolvedValue(axiosResponse(apiResponse(invoice)));

    await invoicesApi.createInvoice(payload);
    await invoicesApi.listInvoices({ page: 1, limit: 20, search: "INV" });
    await invoicesApi.getInvoice("invoice-1");
    await invoicesApi.postInvoice("invoice-1");
    await invoicesApi.updateInvoice("invoice-1", { notes: "Updated" });

    expect(clientMocks.apiClient.post).toHaveBeenNthCalledWith(1, "/sales-invoices", payload);
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(1, "/sales-invoices", { params: { page: 1, limit: 20, search: "INV" } });
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(2, "/sales-invoices/invoice-1");
    expect(clientMocks.apiClient.post).toHaveBeenNthCalledWith(2, "/sales-invoices/invoice-1/post");
    expect(clientMocks.apiClient.patch).toHaveBeenCalledWith("/sales-invoices/invoice-1", { notes: "Updated" });
  });
});

describe("purchase invoices API wrapper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("covers purchase invoice CRUD against the registered purchase endpoint", async () => {
    const invoice = { id: "purchase-1", public_id: "PI-1", invoice_number: "PUR-1", supplier_id: "supplier-1", invoice_type: "purchase_invoice", issue_date: "2026-06-14", due_date: "2026-06-30", currency: "NGN", line_items: [] };
    const payload = { supplier_id: "supplier-1", invoice_type: "purchase_invoice", issue_date: "2026-06-14", due_date: "2026-06-30", line_items: [] };
    clientMocks.apiClient.post.mockResolvedValue(axiosResponse(apiResponse(invoice)));
    clientMocks.apiClient.get
      .mockResolvedValueOnce(axiosResponse({ ...apiResponse([invoice]), pagination: { total: 1, page: 1, limit: 20, totalPages: 1 } }))
      .mockResolvedValueOnce(axiosResponse(apiResponse(invoice)));
    clientMocks.apiClient.patch.mockResolvedValue(axiosResponse(apiResponse(invoice)));
    clientMocks.apiClient.delete.mockResolvedValue(axiosResponse(apiResponse(null)));

    await purchaseInvoicesApi.createPurchaseInvoice(payload);
    await purchaseInvoicesApi.listPurchaseInvoices({ page: 1, limit: 20 });
    await purchaseInvoicesApi.getPurchaseInvoice("purchase-1");
    await purchaseInvoicesApi.updatePurchaseInvoice("purchase-1", { notes: "Updated" });
    await purchaseInvoicesApi.deletePurchaseInvoice("purchase-1");

    expect(clientMocks.apiClient.post).toHaveBeenCalledWith("/purchase-invoices", payload);
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(1, "/purchase-invoices", { params: { page: 1, limit: 20 } });
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(2, "/purchase-invoices/purchase-1");
    expect(clientMocks.apiClient.patch).toHaveBeenCalledWith("/purchase-invoices/purchase-1", { notes: "Updated" });
    expect(clientMocks.apiClient.delete).toHaveBeenCalledWith("/purchase-invoices/purchase-1");
  });
});

describe("FIRS API wrapper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("covers submit, payment status, QR, and health endpoints", async () => {
    const invoice = { id: "invoice-1" };
    clientMocks.apiClient.post
      .mockResolvedValueOnce(axiosResponse(apiResponse(invoice)))
      .mockResolvedValueOnce(axiosResponse(apiResponse(invoice)));
    clientMocks.apiClient.get
      .mockResolvedValueOnce(axiosResponse(apiResponse({ invoice_id: "invoice-1", qr_code_url: "https://qr.test" })))
      .mockResolvedValueOnce(axiosResponse(apiResponse({ status: "ok" })));

    await firsApi.submitToFirs({ invoice_id: "invoice-1" });
    await firsApi.updateFirsPaymentStatus({ invoice_id: "invoice-1", status: "PAID" });
    await firsApi.getFirsQrCode("invoice-1");
    await firsApi.checkFirsHealth();

    expect(clientMocks.apiClient.post).toHaveBeenNthCalledWith(1, "/firs/submit", { invoice_id: "invoice-1" });
    expect(clientMocks.apiClient.post).toHaveBeenNthCalledWith(2, "/firs/payment-status", { invoice_id: "invoice-1", status: "PAID" });
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(1, "/firs/invoices/invoice-1/qr");
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(2, "/firs/health");
  });
});

describe("receipts API wrapper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("covers receipt create, list, read, and invoice lookup", async () => {
    const receipt = { id: "receipt-1", sales_invoice_id: "invoice-1", amount_paid: 500, payment_method: "cash", payment_date: "2026-06-14", currency: "NGN" };
    const payload = { sales_invoice_id: "invoice-1", amount_paid: 500, payment_method: "cash", payment_date: "2026-06-14", currency: "NGN" };
    clientMocks.apiClient.post.mockResolvedValue(axiosResponse(apiResponse(receipt)));
    clientMocks.apiClient.get
      .mockResolvedValueOnce(axiosResponse({ ...apiResponse([receipt]), pagination: { total: 1, page: 1, limit: 20, totalPages: 1 } }))
      .mockResolvedValueOnce(axiosResponse(apiResponse(receipt)))
      .mockResolvedValueOnce(axiosResponse(apiResponse([receipt])));

    await receiptsApi.createReceipt(payload);
    await receiptsApi.listReceipts({ page: 1, limit: 20 });
    await receiptsApi.getReceipt("receipt-1");
    await receiptsApi.getReceiptsByInvoice("invoice-1");

    expect(clientMocks.apiClient.post).toHaveBeenCalledWith("/receipts", payload);
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(1, "/receipts", { params: { page: 1, limit: 20 } });
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(2, "/receipts/receipt-1");
    expect(clientMocks.apiClient.get).toHaveBeenNthCalledWith(3, "/receipts/invoice/invoice-1");
  });
});
