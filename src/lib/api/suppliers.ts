import apiClient from "./client";
import { ApiResponse, PaginatedQuery, Supplier, SupplierRequest } from "@/types/api";

export async function createSupplier(data: SupplierRequest) {
  const response = await apiClient.post<ApiResponse<Supplier>>("/suppliers", data);
  return response.data;
}

export async function listSuppliers(params: PaginatedQuery) {
  const response = await apiClient.get<ApiResponse<Supplier[]>>("/suppliers", { params });
  return response.data;
}

export async function getSupplier(id: string) {
  const response = await apiClient.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
  return response.data;
}

export async function updateSupplier(id: string, data: Partial<SupplierRequest>) {
  const response = await apiClient.patch<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
  return response.data;
}

export async function deleteSupplier(id: string) {
  const response = await apiClient.delete<ApiResponse<null>>(`/suppliers/${id}`);
  return response.data;
}
