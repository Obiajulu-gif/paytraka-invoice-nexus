"use client";

import { useCallback, useEffect, useState } from "react";
import * as productsApi from "@/lib/api/products";
import { getApiErrorMessage } from "@/lib/api/client";
import { Pagination, Product, ProductCategory, ProductCategoryRequest, ProductRequest } from "@/types/api";
import { usePagination } from "./usePagination";

export function useProducts() {
  const pager = usePagination();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [pagination, setPagination] = useState<Pagination | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        productsApi.listProducts(pager.query),
        productsApi.listCategories(),
      ]);
      setProducts(productsResponse.data);
      setPagination(productsResponse.pagination);
      setCategories(categoriesResponse.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load products"));
    } finally {
      setLoading(false);
    }
  }, [pager.query]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: ProductRequest) {
    const response = await productsApi.createProduct(data);
    await refresh();
    return response;
  }

  async function update(id: string, data: Partial<ProductRequest>) {
    const response = await productsApi.updateProduct(id, data);
    await refresh();
    return response;
  }

  async function remove(id: string) {
    const response = await productsApi.deleteProduct(id);
    await refresh();
    return response;
  }

  async function createCategory(data: ProductCategoryRequest) {
    const response = await productsApi.createCategory(data);
    await refresh();
    return response;
  }

  return { products, categories, pagination, pager, loading, error, refresh, create, createCategory, update, remove };
}
