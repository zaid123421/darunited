import {
  ANALYTICS_PERIODS,
  type AnalyticsFilters,
  type AnalyticsPeriod,
} from "@/modules/analytics/types";

export const DEFAULT_ANALYTICS_PERIOD: AnalyticsPeriod = "daily";
export const DEFAULT_VISITORS_PER_PAGE = 20;
export const MAX_VISITORS_PER_PAGE = 100;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isAnalyticsPeriod(value: string | null): value is AnalyticsPeriod {
  return ANALYTICS_PERIODS.some((period) => period === value);
}

export function isIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayIsoDate(now = new Date()): string {
  return toIsoDate(now);
}

export function yesterdayIsoDate(now = new Date()): string {
  const date = new Date(now);
  date.setDate(date.getDate() - 1);
  return toIsoDate(date);
}

function clampInteger(
  value: string | null,
  min: number,
  max: number,
  fallback: number,
): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function parseAnalyticsFilters(
  params: Pick<URLSearchParams, "get">,
  now = new Date(),
): AnalyticsFilters {
  const periodParam = params.get("period");
  const period = isAnalyticsPeriod(periodParam)
    ? periodParam
    : DEFAULT_ANALYTICS_PERIOD;
  const startDate = params.get("start_date")?.trim() ?? "";
  const endDate = params.get("end_date")?.trim() ?? "";
  const page = clampInteger(params.get("page"), 1, 10_000, 1);
  const perPage = clampInteger(
    params.get("per_page"),
    1,
    MAX_VISITORS_PER_PAGE,
    DEFAULT_VISITORS_PER_PAGE,
  );

  const hasAnyCustomDate = startDate.length > 0 || endDate.length > 0;
  const base = {
    period,
    startDate,
    endDate,
    page,
    perPage,
  };

  if (!hasAnyCustomDate) {
    return {
      ...base,
      mode: "preset",
      requestError: null,
      visitorsBlocked: false,
      visitorsNotice: null,
      visitorsEndDate: "",
    };
  }

  if (!isIsoDate(startDate) || !isIsoDate(endDate)) {
    return {
      ...base,
      mode: "custom",
      requestError: "Choose both a start date and an end date.",
      visitorsBlocked: true,
      visitorsNotice: null,
      visitorsEndDate: endDate,
    };
  }

  if (startDate > endDate) {
    return {
      ...base,
      mode: "custom",
      requestError: "Start date must be on or before the end date.",
      visitorsBlocked: true,
      visitorsNotice: null,
      visitorsEndDate: endDate,
    };
  }

  const today = todayIsoDate(now);
  if (endDate > today || startDate > today) {
    return {
      ...base,
      mode: "custom",
      requestError: "Dates cannot be in the future.",
      visitorsBlocked: true,
      visitorsNotice: null,
      visitorsEndDate: endDate,
    };
  }

  const yesterday = yesterdayIsoDate(now);
  const includesToday = endDate > yesterday;
  const visitorsBlocked = includesToday && startDate > yesterday;

  return {
    ...base,
    mode: "custom",
    requestError: null,
    visitorsBlocked,
    visitorsNotice: includesToday
      ? visitorsBlocked
        ? "Visitor details are only available through yesterday. The summary above can include today."
        : "Visitor details stop at yesterday. The summary includes today."
      : null,
    visitorsEndDate: includesToday && !visitorsBlocked ? yesterday : endDate,
  };
}

export function snapshotSearchParams(filters: AnalyticsFilters): string {
  const params = new URLSearchParams();

  if (filters.mode === "custom") {
    params.set("start_date", filters.startDate);
    params.set("end_date", filters.endDate);
  } else {
    params.set("period", filters.period);
  }

  return params.toString();
}

export function visitorsSearchParams(filters: AnalyticsFilters): string {
  const params = new URLSearchParams();

  if (filters.mode === "custom") {
    params.set("start_date", filters.startDate);
    params.set("end_date", filters.visitorsEndDate);
  } else {
    params.set("period", filters.period);
  }

  params.set("page", String(filters.page));
  params.set("per_page", String(filters.perPage));
  return params.toString();
}

export function buildDashboardHref(input: {
  mode: "preset" | "custom";
  period: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}): string {
  const params = new URLSearchParams();

  if (input.mode === "custom" && input.startDate && input.endDate) {
    params.set("start_date", input.startDate);
    params.set("end_date", input.endDate);
  } else {
    params.set("period", input.period);
  }

  if (input.perPage && input.perPage !== DEFAULT_VISITORS_PER_PAGE) {
    params.set("per_page", String(input.perPage));
  }

  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }

  const query = params.toString();
  return query ? `/dashboard?${query}` : "/dashboard";
}

/** Pagination links keep the active range and page size, then add `page`. */
export function analyticsPaginationBasePath(filters: AnalyticsFilters): string {
  return buildDashboardHref({
    mode: filters.mode,
    period: filters.period,
    startDate: filters.startDate,
    endDate: filters.endDate,
    perPage: filters.perPage,
  });
}
