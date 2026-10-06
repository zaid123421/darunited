import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { analyticsClientApi } from "@/modules/analytics/api/analytics.client.api";
import { snapshotSearchParams } from "@/modules/analytics/lib/analytics-filters";
import type { AnalyticsFilters } from "@/modules/analytics/types";

export function useAnalyticsSnapshot(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics-snapshot", snapshotSearchParams(filters)],
    queryFn: () => analyticsClientApi.getSnapshot(filters),
    enabled: filters.requestError === null,
    placeholderData: keepPreviousData,
  });
}
