import { serverFetch } from "@/shared/lib/api/server";
import type { AnalyticsPeriod, AnalyticsSnapshot } from "@/modules/analytics/types";

export const analyticsApi = {
  getSnapshot: (period: AnalyticsPeriod = "daily") =>
    serverFetch<AnalyticsSnapshot>(`/admin/dashboard/snapshot?period=${period}`),
};
