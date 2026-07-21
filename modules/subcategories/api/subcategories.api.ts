import { serverFetch } from "@/shared/lib/api/server";
import type {
  Subcategory,
  SubcategoryListData,
  SubcategoryListParams,
  SubcategoryShowData,
  SubcategoryShowParams,
} from "@/modules/subcategories/types";

function buildQuery(
  params: SubcategoryListParams | SubcategoryShowParams | undefined = {},
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

export const subcategoriesApi = {
  list: (params?: SubcategoryListParams) =>
    serverFetch<SubcategoryListData>(`/admin/subcategories/all${buildQuery(params)}`),

  getById: (id: number | string, params?: SubcategoryShowParams) =>
    serverFetch<SubcategoryShowData>(`/admin/subcategories/show/${id}${buildQuery(params)}`),

  create: (formData: FormData) =>
    serverFetch<Subcategory>("/admin/subcategories/add-subcategory", {
      method: "POST",
      body: formData,
      isFormData: true,
    }),

  update: (id: number | string, body: Record<string, unknown>) =>
    serverFetch<null>(`/admin/subcategories/edit/${id}`, {
      method: "PUT",
      body,
    }),

  delete: (id: number | string) =>
    serverFetch<null>(`/admin/subcategories/${id}`, {
      method: "DELETE",
    }),
};
