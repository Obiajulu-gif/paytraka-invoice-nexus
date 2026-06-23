import apiClient from "./client";
import {
  ApiResponse,
  Company,
  CompanyKycRequest,
  CompanyMode,
  CompanyModeRequest,
  CompanyUpdateRequest,
  FirsSettingsRequest,
} from "@/types/api";

export async function getCompany(companyId: string) {
  const response = await apiClient.get<ApiResponse<Company>>(`/companies/${companyId}`);
  return response.data;
}

export async function submitKyc(companyId: string, data: CompanyKycRequest) {
  const response = await apiClient.patch<ApiResponse<Company>>(`/companies/${companyId}/kyc`, data);
  return response.data;
}

export async function getCompanyMode(companyId: string) {
  const response = await apiClient.get<ApiResponse<CompanyMode>>(`/companies/${companyId}/mode`);
  return response.data;
}

export async function updateCompanyInformation(
  companyId: string,
  data: CompanyUpdateRequest,
) {
  const response = await apiClient.patch<ApiResponse<Company>>(
    `/companies/${companyId}`,
    data,
  );
  return response.data;
}

export async function updateFirsSettings(
  companyId: string,
  data: FirsSettingsRequest,
) {
  const response = await apiClient.patch<ApiResponse<CompanyMode>>(
    `/companies/${companyId}/firs-settings`,
    data,
  );
  return response.data;
}

export async function updateCompanyMode(
  companyId: string,
  data: CompanyModeRequest,
) {
  const response = await apiClient.patch<ApiResponse<CompanyMode>>(
    `/companies/${companyId}/mode`,
    data,
  );
  return response.data;
}
