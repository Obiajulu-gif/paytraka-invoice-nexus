export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AuthUser {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  role: string;
  company_id: string;
  company_status: string;
  company_name?: string | null;
  trading_name?: string | null;
  firs_enabled: number;
  kyc_complete?: boolean;
  tax_identification_number?: string | null;
  country?: string;
  logo_url?: string | null;
  status?: string;
  phone?: string;
  business_email?: string;
  business_phone?: string;
  reg_company_name?: string;
  reg_trading_name?: string;
  business_type?: string;
  business_description?: string | null;
  rc_number?: string | null;
  city?: string;
  state?: string;
  lga?: string;
  postal_code?: string | null;
  mode?: "demo" | "live";
  nrs_businessid_test?: string | null;
  nrs_businessid_live?: string | null;
  nrs_apikey?: string | null;
  nrs_apisecret?: string | null;
  nrs_entityid?: string | null;
  nrs_publickey?: string | null;
  nrs_certificate?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  company_name: string;
  trading_name?: string;
}

export interface RegisterResponse {
  user_id?: string;
  userId?: string;
  user?: AuthUser;
}

export interface VerifyOtpRequest {
  user_id: string;
  otp: string;
}

export interface ResendOtpRequest {
  user_id: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Company {
  id: string;
  public_id: string;
  company_name: string;
  trading_name?: string;
  business_email?: string;
  tax_identification_number?: string;
  rc_number?: string;
  status: string;
  mode: "demo" | "live";
  firs_enabled: number;
  address?: string;
  street_name?: string;
  city?: string;
  state?: string;
  lga?: string;
  postal_code?: string;
  country?: string;
  business_phone?: string;
  description?: string;
}

export interface CompanyKycRequest {
  company_name: string;
  trading_name?: string;
  business_description?: string;
  company_size?: string;
  annual_turnover?: string;
  business_email: string;
  business_phone: string;
  tax_identification_number: string;
  rc_number?: string;
  business_type: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  lga?: string;
  postal_code?: string;
  nrs_businessid_test?: string;
  nrs_businessid_live?: string;
  nrs_apikey?: string;
  nrs_apisecret?: string;
  nrs_entityid?: string;
  nrs_publickey?: string;
  nrs_certificate?: string;
}

export interface CompanyMode {
  mode: "demo" | "live";
  firs_enabled: number;
}

export type CompanyUpdateRequest = Partial<
  Omit<
    CompanyKycRequest,
    | "company_name"
    | "business_email"
    | "business_type"
    | "address"
  >
>;

export type FirsSettingsRequest = { firs_enabled: 0 | 1 };
export type CompanyModeRequest = { mode: "demo" | "live" };

export interface Customer {
  id: string;
  public_id: string;
  customer_type: "individual" | "business" | "government" | "nonprofit";
  name: string;
  email?: string;
  phone1?: string;
  phone2?: string;
  billing_address?: string;
  street_name?: string;
  city?: string;
  state?: string;
  lga?: string;
  country?: string;
  postal_code?: string;
  business_description?: string;
  preferred_currency?: string;
  tax_identification_number?: string;
  rc_number?: string;
}

export type CustomerRequest = Omit<Customer, "id" | "public_id">;

export interface Supplier {
  id: string;
  supplier_type: "individual" | "business" | "government" | "nonprofit";
  supplier_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  tax_identification_number?: string;
  rc_number?: string;
  address?: string;
  street_name?: string;
  city?: string;
  state?: string;
  lga?: string;
  postal_code?: string;
  country?: string;
  description?: string;
  payment_terms?: string;
}

export type SupplierRequest = Omit<Supplier, "id">;

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  product_type: "product" | "service";
  unit_price: number;
  cost_price?: number;
  tax_rate?: number;
  currency: string;
  stock_quantity?: number;
  track_inventory?: boolean;
  status: "active" | "inactive";
  category_id?: string;
  hsn_code?: string;
}

export type ProductRequest = Omit<Product, "id">;
export type ProductCategoryRequest = Omit<ProductCategory, "id">;

export interface InvoiceLineItem {
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  hsn_code?: string;
  product_category?: string;
}

export interface SalesInvoice {
  id: string;
  public_id: string;
  invoice_number: string;
  customer_id: string;
  invoice_type: string;
  issue_date: string;
  due_date: string;
  currency: string;
  notes?: string;
  subtotal?: number | string;
  discount_amount?: number | string;
  tax_amount?: number | string;
  total_amount?: number | string;
  amount_paid?: number | string;
  balance_due?: number | string;
  payment_status?: string;
  customer_name?: string;
  company_name?: string;
  line_items?: InvoiceLineItem[];
  status?: string;
  irn?: string;
  reference_invoice_id?: string;
  firs_status?: string;
  firs_response?: string | Record<string, unknown>;
}

export interface SalesInvoiceRequest {
  customer_id: string;
  invoice_type: string;
  issue_date: string;
  due_date: string;
  currency?: string;
  notes?: string;
  discount_amount?: number;
  line_items: InvoiceLineItem[];
  reference_invoice_id?: string;
}

export interface PurchaseInvoice {
  id: string;
  public_id?: string;
  invoice_number?: string;
  supplier_id?: string;
  supplier_name?: string;
  invoice_date?: string;
  issue_date?: string;
  due_date?: string;
  currency?: string;
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
  amount?: number;
  status?: string;
  line_items?: InvoiceLineItem[];
}

export interface FirsSubmitRequest {
  invoice_id: string;
}

export interface FirsPaymentStatusRequest {
  invoice_id: string;
  status: "PAID" | "UNPAID";
}

export interface FirsQrCode {
  invoice_id: string;
  qr_code_url?: string;
  qr_code?: string;
}

export interface FirsHealth {
  status: string;
  message?: string;
  checked_at?: string;
}

export interface Receipt {
  id: string;
  sales_invoice_id: string;
  amount_paid: number;
  payment_method: string;
  payment_date: string;
  currency: string;
  note?: string;
}

export type ReceiptRequest = Omit<Receipt, "id">;
