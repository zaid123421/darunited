import { serverFetch } from "@/shared/lib/api/server";
import type {
  ProjectListData,
  ProjectListParams,
  ProjectSearchParams,
  ProjectShowData,
} from "@/modules/projects/types";

type QueryValue = string | number | boolean | null | undefined;

function buildQuery(params: Record<string, QueryValue> = {}) {
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
    serverFetch<ProjectListData>(
      `/admin/projects/show-all${buildQuery((params ?? {}) as Record<string, QueryValue>)}`,
    ),

  search: (params?: ProjectSearchParams) =>
    serverFetch<ProjectListData>(
      `/admin/projects/search${buildQuery((params ?? {}) as Record<string, QueryValue>)}`,
    ),

  getById: (id: number | string) =>
    serverFetch<ProjectShowData>(`/admin/projects/show/${id}`),

  delete: (id: number | string) =>
    serverFetch<null>(`/admin/projects/${id}`, {
      method: "DELETE",
    }),
};
