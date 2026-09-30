import { serverFetch } from "@/shared/lib/api/server";
import type {
  ProductionListData,
  ProductionListParams,
  ProductionSectionShowData,
} from "@/modules/production/types";

type QueryValue = string | number | boolean | null | undefined;

function buildQuery(params: Record<string, QueryValue> = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export const productionApi = {
  list: (params?: ProductionListParams) =>
    serverFetch<ProductionListData>(
      `/admin/production/show-all${buildQuery((params ?? {}) as Record<string, QueryValue>)}`,
    ),

  getById: (id: number | string) =>
    serverFetch<ProductionSectionShowData>(`/admin/production/show/${id}`),

  delete: (id: number | string) =>
    serverFetch<null>(`/admin/production/${id}`, {
      method: "DELETE",
    }),
};
