"use client";

import { useCallback, useEffect, useState } from "react";
import * as suppliersApi from "@/lib/api/suppliers";
import { getApiErrorMessage } from "@/lib/api/client";
import { Pagination, Supplier, SupplierRequest } from "@/types/api";
import { usePagination } from "./usePagination";

export function useSuppliers() {
  const pager = usePagination();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pagination, setPagination] = useState<Pagination | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await suppliersApi.listSuppliers({ page: pager.page, limit: pager.limit, search: pager.search });
      setSuppliers(response.data);
      setPagination(response.pagination);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load suppliers"));
    } finally {
      setLoading(false);
    }
  }, [pager.limit, pager.page, pager.search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: SupplierRequest) {
    const response = await suppliersApi.createSupplier(data);
    await refresh();
    return response;
  }

  async function update(id: string, data: Partial<SupplierRequest>) {
    const response = await suppliersApi.updateSupplier(id, data);
    await refresh();
    return response;
  }

  async function remove(id: string) {
    const response = await suppliersApi.deleteSupplier(id);
    await refresh();
    return response;
  }

  return { suppliers, pagination, pager, loading, error, refresh, create, update, remove };
}
