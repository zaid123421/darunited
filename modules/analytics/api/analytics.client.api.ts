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
import { clientFetch } from "@/shared/lib/api/client";

export const analyticsClientApi = {
  getSnapshot: async (filters: AnalyticsFilters) => {
    const response = await clientFetch<AnalyticsSnapshot>(
      `/api/admin/analytics/snapshot?${snapshotSearchParams(filters)}`,
    );
    return normalizeSnapshot(response.data);
  },

  getVisitors: async (filters: AnalyticsFilters) => {
    const response = await clientFetch<VisitorAnalytics>(
      `/api/admin/analytics/visitors?${visitorsSearchParams(filters)}`,
    );
    return normalizeVisitors(response.data);
  },
};
