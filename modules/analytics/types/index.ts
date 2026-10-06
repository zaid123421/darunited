export const ANALYTICS_PERIODS = ["daily", "weekly", "monthly"] as const;

export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

export type AnalyticsRangeType = "preset" | "custom";

export type VisitorAvailabilityStatus =
  | "available"
  | "pending_export"
  | "outside_export_range";

export interface AnalyticsDateRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsCountry {
  country: string;
  visitors: number;
}

export interface AnalyticsTrafficSource {
  source: string;
  sessions: number;
}

export interface AnalyticsSnapshot {
  rangeType: AnalyticsRangeType;
  period: AnalyticsPeriod | null;
  dateRange: AnalyticsDateRange;
  visitorsCount: number;
  countries: AnalyticsCountry[];
  trafficSources: AnalyticsTrafficSource[];
}

export interface VisitorSection {
  section: string;
  durationSeconds: number;
}

export interface AnalyticsVisitor {
  visitorId: string;
  country: string;
  sections: VisitorSection[];
}

export interface AnalyticsPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_more: boolean;
}

export interface VisitorAvailability {
  available: boolean;
  status: VisitorAvailabilityStatus | string;
  dataFrom: string | null;
  dataThrough: string | null;
}

export interface VisitorAnalytics {
  rangeType: AnalyticsRangeType;
  period: AnalyticsPeriod | null;
  dateRange: AnalyticsDateRange;
  availability: VisitorAvailability;
  visitors: AnalyticsVisitor[];
  pagination: AnalyticsPagination;
}

export interface AnalyticsFilters {
  mode: "preset" | "custom";
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  page: number;
  perPage: number;
  /** Blocks both requests. Incomplete or impossible custom ranges. */
  requestError: string | null;
  /** Visitor export cannot include today, so this request is skipped. */
  visitorsBlocked: boolean;
  /** Explains when the visitor range is narrower than the summary range. */
  visitorsNotice: string | null;
  /** End date actually sent to the visitors endpoint. */
  visitorsEndDate: string;
}
