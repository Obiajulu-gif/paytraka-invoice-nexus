"use client";

import { useCallback, useEffect, useState } from "react";
import * as purchaseApi from "@/lib/api/purchase-invoices";
import { getApiErrorMessage } from "@/lib/api/client";
import { Pagination, PurchaseInvoice, PurchaseInvoiceRequest } from "@/types/api";
import { usePagination } from "./usePagination";

export function usePurchaseInvoices() {
  const pager = usePagination();
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [pagination, setPagination] = useState<Pagination>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await purchaseApi.listPurchaseInvoices(pager.query);
      setInvoices(response.data);
      setPagination(response.pagination);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load purchase invoices."));
    } finally {
      setLoading(false);
    }
  }, [pager.query]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function create(data: PurchaseInvoiceRequest) {
    const response = await purchaseApi.createPurchaseInvoice(data);
    await refresh();
    return response;
  }
  async function update(id: string, data: Partial<PurchaseInvoiceRequest>) {
    const response = await purchaseApi.updatePurchaseInvoice(id, data);
    await refresh();
    return response;
  }
  async function remove(id: string) {
    const response = await purchaseApi.deletePurchaseInvoice(id);
    await refresh();
    return response;
  }

  return { invoices, pagination, pager, loading, error, refresh, create, update, remove, getInvoice: purchaseApi.getPurchaseInvoice };
}
