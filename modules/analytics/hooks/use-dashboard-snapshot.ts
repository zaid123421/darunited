import { useQuery } from "@tanstack/react-query";
import { analyticsClientApi } from "@/modules/analytics/api/analytics.client.api";
import type { AnalyticsPeriod } from "@/modules/analytics/types";

export const dashboardSnapshotQueryKeys = {
  all: ["dashboard-snapshot"] as const,
  byPeriod: (period: AnalyticsPeriod) =>
    [...dashboardSnapshotQueryKeys.all, period] as const,
};

export function useDashboardSnapshot(period: AnalyticsPeriod) {
  return useQuery({
    queryKey: dashboardSnapshotQueryKeys.byPeriod(period),
    queryFn: async () => {
      const response = await analyticsClientApi.getSnapshot(period);
      return response.data;
    },
  });
}
