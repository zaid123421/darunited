import { serverFetch } from "@/shared/lib/api/server";
import type {
  Category,
  CategoryListData,
  CategoryListParams,
  CategoryShowData,
} from "@/modules/categories/types";
import type {
  CategorySubcategoriesData,
  SubcategoryListParams,
} from "@/modules/subcategories/types";

function buildQuery(
  params: CategoryListParams | SubcategoryListParams | undefined = {},
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
    serverFetch<CategoryListData>(
      `/admin/categories/show-all${buildQuery(params)}`,
    ),

  getById: (id: number | string) =>
    serverFetch<CategoryShowData>(`/admin/categories/show/${id}`),

  getSubcategories: (id: number | string, params?: SubcategoryListParams) =>
    serverFetch<CategorySubcategoriesData>(
      `/admin/categories/${id}/subcategories${buildQuery(params)}`,
    ),

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
