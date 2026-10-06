import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { analyticsClientApi } from "@/modules/analytics/api/analytics.client.api";
import { visitorsSearchParams } from "@/modules/analytics/lib/analytics-filters";
import type { AnalyticsFilters } from "@/modules/analytics/types";

export function useAnalyticsVisitors(filters: AnalyticsFilters) {
  const canRequest = filters.requestError === null && !filters.visitorsBlocked;

  return useQuery({
    queryKey: ["analytics-visitors", visitorsSearchParams(filters)],
    queryFn: () => analyticsClientApi.getVisitors(filters),
    enabled: canRequest,
    placeholderData: keepPreviousData,
  });
}
