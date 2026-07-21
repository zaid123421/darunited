import { serverFetch } from "@/shared/lib/api/server";
import type {
  Category,
  CategoryListData,
  CategoryListParams,
  CategoryShowData,
  CategoryShowParams,
} from "@/modules/categories/types";

function buildQuery(
  params: CategoryListParams | CategoryShowParams | undefined = {},
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

export const categoriesApi = {
  list: (params?: CategoryListParams) =>
    serverFetch<CategoryListData>(`/admin/categories/all${buildQuery(params)}`),

  getById: (id: number | string, params?: CategoryShowParams) =>
    serverFetch<CategoryShowData>(`/admin/categories/show/${id}${buildQuery(params)}`),

  create: (formData: FormData) =>
    serverFetch<Category>("/admin/categories/add-category", {
      method: "POST",
      body: formData,
      isFormData: true,
    }),

  update: (id: number | string, body: Record<string, unknown>) =>
    serverFetch<null>(`/admin/categories/edit/${id}`, {
      method: "PUT",
      body,
    }),

  delete: (id: number | string) =>
    serverFetch<null>(`/admin/categories/${id}`, {
      method: "DELETE",
    }),
};
