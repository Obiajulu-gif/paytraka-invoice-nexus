"use client";

import { useCallback, useEffect, useState } from "react";
import * as invoicesApi from "@/lib/api/invoices";
import { getApiErrorMessage } from "@/lib/api/client";
import { Pagination, SalesInvoice, SalesInvoiceRequest } from "@/types/api";
import { usePagination } from "./usePagination";

export function useInvoices() {
  const pager = usePagination();
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [pagination, setPagination] = useState<Pagination | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await invoicesApi.listInvoices(pager.query);
      setInvoices(response.data);
      setPagination(response.pagination);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load invoices"));
    } finally {
      setLoading(false);
    }
  }, [pager.query]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: SalesInvoiceRequest) {
    const response = await invoicesApi.createInvoice(data);
    await refresh();
    return response;
  }

  async function post(id: string) {
    const response = await invoicesApi.postInvoice(id);
    await refresh();
    return response;
  }

  async function update(id: string, data: Partial<SalesInvoiceRequest>) {
    const response = await invoicesApi.updateInvoice(id, data);
    await refresh();
    return response;
  }

  async function remove(id: string) {
    const response = await invoicesApi.deleteInvoice(id);
    await refresh();
    return response;
  }

  return { invoices, pagination, pager, loading, error, refresh, create, post, update, remove, getInvoice: invoicesApi.getInvoice };
}
