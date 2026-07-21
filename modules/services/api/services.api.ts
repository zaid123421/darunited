import { serverFetch } from "@/shared/lib/api/server";
import type {
  Service,
  ServiceListData,
  ServiceListParams,
  ServiceProjectsListData,
  ServiceProjectsListParams,
  ServiceShowData,
  ServiceShowParams,
} from "@/modules/services/types";

function buildQuery(
  params:
    | ServiceListParams
    | ServiceShowParams
    | ServiceProjectsListParams
    | undefined = {},
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

export const servicesApi = {
  list: (params?: ServiceListParams) =>
    serverFetch<ServiceListData>(`/admin/services/all${buildQuery(params)}`),

  getById: (id: number | string, params?: ServiceShowParams) =>
    serverFetch<ServiceShowData>(`/admin/services/show/${id}${buildQuery(params)}`),

  getProjects: (id: number | string, params?: ServiceProjectsListParams) =>
    serverFetch<ServiceProjectsListData>(
      `/admin/services/${id}/projects${buildQuery(params)}`,
    ),

  create: (formData: FormData) =>
    serverFetch<Service>("/admin/services/add-service", {
      method: "POST",
      body: formData,
      isFormData: true,
    }),

  update: (id: number | string, body: Record<string, unknown>) =>
    serverFetch<null>(`/admin/services/edit/${id}`, {
      method: "PUT",
      body,
    }),

  delete: (id: number | string) =>
    serverFetch<null>(`/admin/services/${id}`, {
      method: "DELETE",
    }),
};
