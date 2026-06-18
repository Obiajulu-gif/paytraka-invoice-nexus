import apiClient from "./client";
import { ApiResponse, PaginatedQuery, SalesInvoice, SalesInvoiceRequest } from "@/types/api";

export async function createInvoice(data: SalesInvoiceRequest) {
  const response = await apiClient.post<ApiResponse<SalesInvoice>>("/sales-invoices", data);
  return response.data;
}

export async function listInvoices(params: PaginatedQuery) {
  const response = await apiClient.get<ApiResponse<SalesInvoice[]>>("/sales-invoices", { params });
  return response.data;
}

export async function listAllInvoices() {
  const limit = 100;
  const first = await listInvoices({ page: 1, limit });
  const invoices = [...first.data];
  const totalPages = first.pagination?.totalPages ?? 1;
  for (let page = 2; page <= totalPages; page += 1) {
    const response = await listInvoices({ page, limit });
    invoices.push(...response.data);
  }
  return invoices;
}

export async function getInvoice(id: string) {
  const response = await apiClient.get<ApiResponse<SalesInvoice>>(`/sales-invoices/${id}`);
  return response.data;
}

export async function postInvoice(id: string) {
  const response = await apiClient.post<ApiResponse<SalesInvoice>>(`/sales-invoices/${id}/post`);
  return response.data;
}

export async function updateInvoice(id: string, data: Partial<SalesInvoiceRequest>) {
  const response = await apiClient.patch<ApiResponse<SalesInvoice>>(`/sales-invoices/${id}`, data);
  return response.data;
}

export async function deleteInvoice(id: string) {
  const response = await apiClient.delete<ApiResponse<null>>(`/sales-invoices/${id}`);
  return response.data;
}
