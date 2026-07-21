import { serverFetch } from "@/shared/lib/api/server";
import type {
  ProjectListData,
  ProjectListParams,
  ProjectSearchParams,
  ProjectShowData,
  ProjectShowParams,
} from "@/modules/projects/types";

function buildQuery(
  params: ProjectListParams | ProjectSearchParams | ProjectShowParams = {},
) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const projectsApi = {
  list: (params?: ProjectListParams) =>
    serverFetch<ProjectListData>(`/admin/projects/show-all${buildQuery(params ?? {})}`),

  search: (params?: ProjectSearchParams) =>
    serverFetch<ProjectListData>(`/admin/projects/search${buildQuery(params ?? {})}`),

  getById: (id: number | string, params?: ProjectShowParams) =>
    serverFetch<ProjectShowData>(`/admin/projects/show/${id}${buildQuery(params ?? {})}`),

  delete: (id: number | string) =>
    serverFetch<null>(`/admin/projects/${id}`, {
      method: "DELETE",
    }),
};
