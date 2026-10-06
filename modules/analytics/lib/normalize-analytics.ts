import { isAnalyticsPeriod } from "@/modules/analytics/lib/analytics-filters";
import type {
  AnalyticsCountry,
  AnalyticsPagination,
  AnalyticsSnapshot,
  AnalyticsTrafficSource,
  AnalyticsVisitor,
  VisitorAnalytics,
  VisitorSection,
} from "@/modules/analytics/types";

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (
    value &&
    typeof value === "object" &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: T[] }).data;
  }
  return [];
}

function asDateRange(value: unknown): { startDate: string; endDate: string } {
  if (!value || typeof value !== "object") {
    return { startDate: "", endDate: "" };
  }

  const range = value as { startDate?: unknown; endDate?: unknown };
  return {
    startDate: typeof range.startDate === "string" ? range.startDate : "",
    endDate: typeof range.endDate === "string" ? range.endDate : "",
  };
}

function asRangeType(value: unknown): "preset" | "custom" {
  return value === "custom" ? "custom" : "preset";
}

function asPeriod(value: unknown) {
  return typeof value === "string" && isAnalyticsPeriod(value) ? value : null;
}

export function normalizeSnapshot(data: AnalyticsSnapshot): AnalyticsSnapshot {
  return {
    rangeType: asRangeType(data?.rangeType),
    period: asPeriod(data?.period),
    dateRange: asDateRange(data?.dateRange),
    visitorsCount: asNumber(data?.visitorsCount),
    countries: asArray<AnalyticsCountry>(data?.countries).map((country) => ({
      country: typeof country?.country === "string" && country.country ? country.country : "Unknown",
      visitors: asNumber(country?.visitors),
    })),
    trafficSources: asArray<AnalyticsTrafficSource>(data?.trafficSources).map(
      (source) => ({
        source: typeof source?.source === "string" && source.source ? source.source : "Unknown",
        sessions: asNumber(source?.sessions),
      }),
    ),
  };
}

function normalizeSection(section: VisitorSection): VisitorSection {
  return {
    section: typeof section?.section === "string" ? section.section : "",
    durationSeconds: asNumber(section?.durationSeconds),
  };
}

function normalizeVisitor(visitor: AnalyticsVisitor): AnalyticsVisitor {
  return {
    visitorId:
      typeof visitor?.visitorId === "string" && visitor.visitorId
        ? visitor.visitorId
        : "Unknown visitor",
    country:
      typeof visitor?.country === "string" && visitor.country
        ? visitor.country
        : "Unknown",
    sections: asArray<VisitorSection>(visitor?.sections).map(normalizeSection),
  };
}

function normalizePagination(pagination: AnalyticsPagination | undefined): AnalyticsPagination {
  const currentPage = Math.max(1, asNumber(pagination?.current_page) || 1);
  const lastPage = Math.max(1, asNumber(pagination?.last_page) || 1);

  return {
    current_page: currentPage,
    last_page: lastPage,
    per_page: Math.max(1, asNumber(pagination?.per_page) || 20),
    total: Math.max(0, asNumber(pagination?.total)),
    from: pagination?.from == null ? null : asNumber(pagination.from),
    to: pagination?.to == null ? null : asNumber(pagination.to),
    has_more: Boolean(pagination?.has_more) || currentPage < lastPage,
  };
}

export function normalizeVisitors(data: VisitorAnalytics): VisitorAnalytics {
  const availability = data?.availability;

  return {
    rangeType: asRangeType(data?.rangeType),
    period: asPeriod(data?.period),
    dateRange: asDateRange(data?.dateRange),
    availability: {
      available: Boolean(availability?.available),
      status:
        typeof availability?.status === "string" && availability.status
          ? availability.status
          : "pending_export",
      dataFrom:
        typeof availability?.dataFrom === "string" ? availability.dataFrom : null,
      dataThrough:
        typeof availability?.dataThrough === "string"
          ? availability.dataThrough
          : null,
    },
    visitors: asArray<AnalyticsVisitor>(data?.visitors).map(normalizeVisitor),
    pagination: normalizePagination(data?.pagination),
  };
}
