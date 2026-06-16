"use client";

import { useCallback, useEffect, useState } from "react";
import * as customersApi from "@/lib/api/customers";
import { getApiErrorMessage } from "@/lib/api/client";
import { Customer, CustomerRequest, Pagination } from "@/types/api";
import { usePagination } from "./usePagination";

export function useCustomers() {
  const pager = usePagination();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await customersApi.listCustomers(pager.query);
      setCustomers(response.data);
      setPagination(response.pagination);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load customers"));
    } finally {
      setLoading(false);
    }
  }, [pager.query]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CustomerRequest) {
    const response = await customersApi.createCustomer(data);
    await refresh();
    return response;
  }

  async function update(id: string, data: Partial<CustomerRequest>) {
    const response = await customersApi.updateCustomer(id, data);
    await refresh();
    return response;
  }

  async function remove(id: string) {
    const response = await customersApi.deleteCustomer(id);
    await refresh();
    return response;
  }

  return { customers, pagination, pager, loading, error, refresh, create, update, remove, exportCustomers: customersApi.exportCustomers, importCustomers: customersApi.importCustomers };
}
