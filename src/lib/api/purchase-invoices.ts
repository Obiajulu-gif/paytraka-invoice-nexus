import apiClient from "./client";
import { ApiResponse, PaginatedQuery, PurchaseInvoice, PurchaseInvoiceRequest } from "@/types/api";

export async function createPurchaseInvoice(data: PurchaseInvoiceRequest) {
  const response = await apiClient.post<ApiResponse<PurchaseInvoice>>("/purchase-invoices", data);
  return response.data;
}

export async function listPurchaseInvoices(params: PaginatedQuery) {
  const response = await apiClient.get<ApiResponse<PurchaseInvoice[]>>("/purchase-invoices", { params });
  return response.data;
}

export async function getPurchaseInvoice(id: string) {
  const response = await apiClient.get<ApiResponse<PurchaseInvoice>>(`/purchase-invoices/${id}`);
  return response.data;
}

export async function updatePurchaseInvoice(id: string, data: Partial<PurchaseInvoiceRequest>) {
  const response = await apiClient.patch<ApiResponse<PurchaseInvoice>>(`/purchase-invoices/${id}`, data);
  return response.data;
}

export async function deletePurchaseInvoice(id: string) {
  const response = await apiClient.delete<ApiResponse<null>>(`/purchase-invoices/${id}`);
  return response.data;
}
