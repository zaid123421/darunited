import {
  snapshotSearchParams,
  visitorsSearchParams,
} from "@/modules/analytics/lib/analytics-filters";
import {
  normalizeSnapshot,
  normalizeVisitors,
} from "@/modules/analytics/lib/normalize-analytics";
import type {
  AnalyticsFilters,
  AnalyticsSnapshot,
  VisitorAnalytics,
} from "@/modules/analytics/types";
import { serverFetch } from "@/shared/lib/api/server";

export const analyticsApi = {
  getSnapshot: async (filters: AnalyticsFilters) => {
    const response = await serverFetch<AnalyticsSnapshot>(
      `/admin/analytics/snapshot?${snapshotSearchParams(filters)}`,
    );
    return normalizeSnapshot(response.data);
  },

  getVisitors: async (filters: AnalyticsFilters) => {
    const response = await serverFetch<VisitorAnalytics>(
      `/admin/analytics/visitors?${visitorsSearchParams(filters)}`,
    );
    return normalizeVisitors(response.data);
  },
};
