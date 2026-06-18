"use client";

import { useCallback, useEffect, useState } from "react";
import * as companyApi from "@/lib/api/companies";
import { getApiErrorMessage } from "@/lib/api/client";
import { Company, CompanyKycRequest, CompanyMode } from "@/types/api";

export function useCompany(companyId?: string) {
  const [company, setCompany] = useState<Company | null>(null);
  const [mode, setMode] = useState<CompanyMode | null>(null);
  const [loading, setLoading] = useState(Boolean(companyId));
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError("");
    try {
      const companyResponse = await companyApi.getCompany(companyId);
      setCompany(companyResponse.data);
      try {
        const modeResponse = await companyApi.getCompanyMode(companyId);
        setMode(modeResponse.data);
      } catch {
        setMode({
          mode: companyResponse.data.mode,
          firs_enabled: companyResponse.data.firs_enabled,
        });
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load company"));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function submitKyc(data: CompanyKycRequest) {
    if (!companyId) throw new Error("Company ID is required");
    const response = await companyApi.submitKyc(companyId, data);
    setCompany(response.data);
    return response;
  }

  return { company, mode, loading, error, refresh, submitKyc };
}
