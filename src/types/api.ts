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
  business_phone?: string;
  tax_identification_number?: string;
  rc_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  logo_url?: string | null;
  status: string;
  mode: "demo" | "live";
  firs_enabled: number;
}

export interface CompanyKycRequest {
  company_name: string;
  trading_name?: string;
  business_email: string;
  business_phone: string;
  tax_identification_number: string;
  rc_number: string;
  business_type: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  lga?: string;
  postal_code?: string;
  nrs_businessid?: string;
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

export interface Customer {
  id: string;
  public_id: string;
  customer_type: "individual" | "business";
  name: string;
  email?: string;
  phone1?: string;
  phone2?: string;
  billing_address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_identification_number?: string;
  rc_number?: string;
}

export type CustomerRequest = Omit<Customer, "id" | "public_id">;

export interface Supplier {
  id: string;
  supplier_type: "individual" | "business";
  supplier_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  tax_identification_number?: string;
  rc_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
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
}

export type ProductRequest = Omit<Product, "id">;
export type ProductCategoryRequest = Omit<ProductCategory, "id">;

export interface InvoiceLineItem {
  id?: string;
  product_id?: string;
  description: string;
  quantity: number | string;
  unit_price: number | string;
  tax_rate?: number | string;
  discount_percentage?: number | string;
  discount_percent?: number | string;
  discount_rate?: number | string;
  exclusive_total?: number | string;
  inclusive_total?: number | string;
}

export interface SalesInvoice {
  id: string;
  public_id: string;
  invoice_number: string;
  customer_id: string;
  customer?: Customer | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_address?: string | null;
  invoice_type: string;
  issue_date: string | null;
  due_date: string | null;
  currency: string;
  notes?: string;
  discount_amount?: number | string | null;
  line_items: InvoiceLineItem[];
  status?: string;
  payment_status?: string | null;
  subtotal?: number | string | null;
  total_exclusive?: number | string | null;
  total_vat?: number | string | null;
  total_discount?: number | string | null;
  total_amount?: number | string | null;
  grand_total?: number | string | null;
  amount?: number | string | null;
  balance_due?: number | string | null;
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
}

export interface PurchaseInvoice extends Omit<SalesInvoice, "customer_id" | "customer" | "customer_name" | "customer_email" | "customer_address"> {
  supplier_id: string;
  supplier?: Supplier | null;
  supplier_name?: string | null;
  supplier_email?: string | null;
  supplier_address?: string | null;
}

export interface PurchaseInvoiceRequest extends Omit<SalesInvoiceRequest, "customer_id"> {
  supplier_id: string;
  supplier_invoice_number?: string;
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
