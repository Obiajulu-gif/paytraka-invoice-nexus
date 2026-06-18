"use client";

import { useCallback, useEffect, useState } from "react";
import * as invoicesApi from "@/lib/api/invoices";
import { getApiErrorMessage } from "@/lib/api/client";
import { sumOutstandingInvoices } from "@/lib/invoice-utils";
import { Pagination, SalesInvoice, SalesInvoiceRequest } from "@/types/api";
import { usePagination } from "./usePagination";

export function useInvoices() {
  const pager = usePagination();
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [pagination, setPagination] = useState<Pagination | undefined>();
  const [loading, setLoading] = useState(true);
  const [outstandingLoading, setOutstandingLoading] = useState(true);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
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

  const refreshOutstanding = useCallback(async () => {
    setOutstandingLoading(true);
    try {
      setTotalOutstanding(sumOutstandingInvoices(await invoicesApi.listAllInvoices()));
    } catch {
      setTotalOutstanding(0);
    } finally {
      setOutstandingLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshOutstanding();
  }, [refreshOutstanding]);

  async function refreshAll() {
    await Promise.all([refresh(), refreshOutstanding()]);
  }

  async function create(data: SalesInvoiceRequest) {
    const response = await invoicesApi.createInvoice(data);
    await refreshAll();
    return response;
  }

  async function post(id: string) {
    const response = await invoicesApi.postInvoice(id);
    await refreshAll();
    return response;
  }

  async function update(id: string, data: Partial<SalesInvoiceRequest>) {
    const response = await invoicesApi.updateInvoice(id, data);
    await refreshAll();
    return response;
  }

  async function remove(id: string) {
    const response = await invoicesApi.deleteInvoice(id);
    await refreshAll();
    return response;
  }

  return {
    invoices,
    pagination,
    pager,
    loading,
    outstandingLoading,
    totalOutstanding,
    error,
    refresh: refreshAll,
    create,
    post,
    update,
    remove,
    getInvoice: invoicesApi.getInvoice,
  };
}
