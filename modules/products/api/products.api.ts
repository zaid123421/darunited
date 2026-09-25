import { serverFetch } from "@/shared/lib/api/server";
import type {
  CategoryProductsData,
  ProductListData,
  ProductListParams,
  ProductSearchParams,
  ProductShowData,
  SubCategoryProductsData,
} from "@/modules/products/types";

type QueryValue =
  | string
  | number
  | boolean
  | Array<string | number>
  | null
  | undefined;

function buildQuery(params: Record<string, QueryValue> = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        search.set(key, value.map(String).join(","));
      }
      return;
    }

    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export const productsApi = {
  list: (params?: ProductListParams) =>
    serverFetch<ProductListData>(
      `/admin/products/show-all${buildQuery((params ?? {}) as Record<string, QueryValue>)}`,
    ),

  search: (params?: ProductSearchParams) =>
    serverFetch<ProductListData>(
      `/admin/products/search${buildQuery((params ?? {}) as Record<string, QueryValue>)}`,
    ),

  getById: (id: number | string) =>
    serverFetch<ProductShowData>(`/admin/products/show/${id}`),

  getByCategory: (categoryId: number | string, params?: ProductListParams) =>
    serverFetch<CategoryProductsData>(
      `/admin/categories/${categoryId}/products${buildQuery((params ?? {}) as Record<string, QueryValue>)}`,
    ),

  getBySubCategory: (
    subCategoryId: number | string,
    params?: ProductListParams,
  ) =>
    serverFetch<SubCategoryProductsData>(
      `/admin/subcategories/${subCategoryId}/products${buildQuery((params ?? {}) as Record<string, QueryValue>)}`,
    ),

  delete: (id: number | string) =>
    serverFetch<null>(`/admin/products/${id}`, {
      method: "DELETE",
    }),
};
