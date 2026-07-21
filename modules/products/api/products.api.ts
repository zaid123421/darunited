import { serverFetch } from "@/shared/lib/api/server";
import type {
  Product,
  ProductListData,
  ProductListParams,
  ProductShowData,
  ProductShowParams,
} from "@/modules/products/types";

function buildQuery(
  params: ProductListParams | ProductShowParams | undefined = {},
) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const productsApi = {
  list: (params?: ProductListParams) =>
    serverFetch<ProductListData>(`/admin/products/all${buildQuery(params)}`),

  getById: (id: number | string, params?: ProductShowParams) =>
    serverFetch<ProductShowData>(`/admin/products/show/${id}${buildQuery(params)}`),

  create: (formData: FormData) =>
    serverFetch<Product>("/admin/products/add-product", {
      method: "POST",
      body: formData,
      isFormData: true,
    }),

  update: (id: number | string, body: Record<string, unknown>) =>
    serverFetch<null>(`/admin/products/edit/${id}`, {
      method: "PUT",
      body,
    }),

  delete: (id: number | string) =>
    serverFetch<null>(`/admin/products/${id}`, {
      method: "DELETE",
    }),
};
