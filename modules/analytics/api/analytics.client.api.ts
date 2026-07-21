import { clientFetch } from "@/shared/lib/api/client";
import type { AnalyticsPeriod, AnalyticsSnapshot } from "@/modules/analytics/types";

export const analyticsClientApi = {
  getSnapshot: (period: AnalyticsPeriod = "daily") =>
    clientFetch<AnalyticsSnapshot>(
      `/api/admin/dashboard/snapshot?period=${period}`,
    ),
};
