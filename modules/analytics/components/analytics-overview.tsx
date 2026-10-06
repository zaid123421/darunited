"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Globe2, Share2, Users } from "lucide-react";
import { AnalyticsRangeFilters } from "@/modules/analytics/components/analytics-range-filters";
import { useAnalyticsSnapshot } from "@/modules/analytics/hooks/use-analytics-snapshot";
import { useAnalyticsVisitors } from "@/modules/analytics/hooks/use-analytics-visitors";
import {
  analyticsPaginationBasePath,
  buildDashboardHref,
  parseAnalyticsFilters,
} from "@/modules/analytics/lib/analytics-filters";
import {
  formatDateRange,
  formatDuration,
  formatNumber,
  sectionLabel,
  visitorAvailabilityMessage,
} from "@/modules/analytics/lib/format-analytics";
import type {
  AnalyticsCountry,
  AnalyticsTrafficSource,
  AnalyticsVisitor,
  VisitorAnalytics,
} from "@/modules/analytics/types";
import { Pagination } from "@/shared/components/ui/pagination";
import { ApiError } from "@/shared/types/global-response";

function errorText(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    const details = error.errors
      ? Object.values(error.errors).flat().filter(Boolean)
      : [];
    return details.length > 0 ? details.join(" ") : error.message;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function RelativeBars({
  items,
  emptyLabel,
}: {
  items: { label: string; value: number }[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>
    );
  }

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-foreground">{item.label}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {formatNumber(item.value)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function toTrafficItems(sources: AnalyticsTrafficSource[]) {
  return sources.map((source) => ({
    label: source.source,
    value: source.sessions,
  }));
}

function toCountryItems(countries: AnalyticsCountry[]) {
  return countries.map((country) => ({
    label: country.country,
    value: country.visitors,
  }));
}

function PanelMessage({
  tone = "muted",
  children,
}: {
  tone?: "muted" | "error";
  children: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className={tone === "error" ? "text-sm text-red-400" : "text-sm text-muted-foreground"}>
        {children}
      </p>
    </div>
  );
}

function SnapshotSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-28 rounded-2xl border border-border bg-muted/40" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-56 rounded-2xl border border-border bg-muted/40" />
        <div className="h-56 rounded-2xl border border-border bg-muted/40" />
      </div>
    </div>
  );
}

function VisitorsSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-24 rounded-2xl border border-border bg-muted/40" />
      <div className="h-24 rounded-2xl border border-border bg-muted/40" />
    </div>
  );
}

function VisitorCard({ visitor }: { visitor: AnalyticsVisitor }) {
  return (
    <article className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm font-medium text-foreground">{visitor.country}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">{visitor.visitorId}</p>
      </div>
      {visitor.sections.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No section activity recorded</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {visitor.sections.map((section, index) => (
            <li
              key={`${section.section}-${index}`}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="truncate text-foreground">{sectionLabel(section.section)}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatDuration(section.durationSeconds)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function VisitorsPanel({
  data,
  isFetching,
  basePath,
}: {
  data: VisitorAnalytics;
  isFetching: boolean;
  basePath: string;
}) {
  const availabilityMessage = visitorAvailabilityMessage(data.availability, data.dateRange);
  const { pagination, visitors } = data;

  return (
    <div className={`flex flex-col gap-4 ${isFetching ? "opacity-70 transition-opacity" : ""}`}>
      <p className="text-sm text-muted-foreground">{formatDateRange(data.dateRange)}</p>

      {availabilityMessage ? <PanelMessage>{availabilityMessage}</PanelMessage> : null}

      {data.availability.available && visitors.length === 0 ? (
        <PanelMessage>No visitors in this range.</PanelMessage>
      ) : null}

      {data.availability.available && visitors.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {visitors.map((visitor, index) => (
            <li key={`${visitor.visitorId}-${index}`}>
              <VisitorCard visitor={visitor} />
            </li>
          ))}
        </ul>
      ) : null}

      {data.availability.available && pagination.total > 0 ? (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          hasMore={pagination.has_more}
          basePath={basePath}
          itemLabel="visitors"
        />
      ) : null}
    </div>
  );
}

export function AnalyticsOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseAnalyticsFilters(searchParams);
  const snapshotQuery = useAnalyticsSnapshot(filters);
  const visitorsQuery = useAnalyticsVisitors(filters);
  const paginationBasePath = analyticsPaginationBasePath(filters);

  useEffect(() => {
    const pagination = visitorsQuery.data?.pagination;
    if (!pagination || visitorsQuery.isPlaceholderData) return;
    if (filters.requestError || filters.visitorsBlocked) return;
    if (pagination.current_page <= pagination.last_page) return;

    router.replace(
      buildDashboardHref({
        mode: filters.mode,
        period: filters.period,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: pagination.last_page,
        perPage: filters.perPage,
      }),
    );
  }, [
    filters.endDate,
    filters.mode,
    filters.perPage,
    filters.period,
    filters.requestError,
    filters.startDate,
    filters.visitorsBlocked,
    router,
    visitorsQuery.data?.pagination,
    visitorsQuery.isPlaceholderData,
  ]);

  const showSnapshot =
    filters.requestError === null &&
    !snapshotQuery.isError &&
    Boolean(snapshotQuery.data) &&
    !snapshotQuery.isLoading;
  const showVisitors =
    filters.requestError === null &&
    !filters.visitorsBlocked &&
    !visitorsQuery.isError &&
    Boolean(visitorsQuery.data) &&
    !visitorsQuery.isLoading;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle mt-1">Overview of your website performance</p>
      </div>

      <AnalyticsRangeFilters filters={filters} />

      {filters.requestError ? null : (
        <>
          <section className="flex flex-col gap-4" aria-labelledby="analytics-summary-heading">
            <h2 id="analytics-summary-heading" className="font-semibold text-foreground">
              Summary
            </h2>

            {snapshotQuery.isLoading ? <SnapshotSkeleton /> : null}

            {snapshotQuery.isError ? (
              <PanelMessage tone="error">
                {errorText(snapshotQuery.error, "Failed to load the analytics summary.")}
              </PanelMessage>
            ) : null}

            {showSnapshot && snapshotQuery.data ? (
              <div
                className={`flex flex-col gap-4 ${
                  snapshotQuery.isFetching ? "opacity-70 transition-opacity" : ""
                }`}
              >
                <p className="text-sm text-muted-foreground">
                  {formatDateRange(snapshotQuery.data.dateRange)}
                </p>
                <div className="rounded-2xl border border-border bg-card p-5 sm:max-w-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Total visitors</p>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
                      <Users className="h-4 w-4 text-accent" aria-hidden />
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatNumber(snapshotQuery.data.visitorsCount)}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                      <Share2 className="h-4 w-4 text-accent" aria-hidden />
                      Traffic sources
                    </h3>
                    <RelativeBars
                      items={toTrafficItems(snapshotQuery.data.trafficSources)}
                      emptyLabel="No traffic sources in this range"
                    />
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                      <Globe2 className="h-4 w-4 text-accent" aria-hidden />
                      Visitors by country
                    </h3>
                    <RelativeBars
                      items={toCountryItems(snapshotQuery.data.countries)}
                      emptyLabel="No country data in this range"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className="flex flex-col gap-4" aria-labelledby="analytics-visitors-heading">
            <h2 id="analytics-visitors-heading" className="font-semibold text-foreground">
              Visitors
            </h2>

            {filters.visitorsNotice ? <PanelMessage>{filters.visitorsNotice}</PanelMessage> : null}

            {!filters.visitorsBlocked && visitorsQuery.isLoading ? <VisitorsSkeleton /> : null}

            {!filters.visitorsBlocked && visitorsQuery.isError ? (
              <PanelMessage tone="error">
                {errorText(visitorsQuery.error, "Failed to load visitor details.")}
              </PanelMessage>
            ) : null}

            {showVisitors && visitorsQuery.data ? (
              <VisitorsPanel
                data={visitorsQuery.data}
                isFetching={visitorsQuery.isFetching}
                basePath={paginationBasePath}
              />
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}

export function AnalyticsOverviewFallback() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-10 w-48 rounded-lg bg-muted/40" />
      <div className="h-10 w-full max-w-md rounded-lg bg-muted/40" />
      <SnapshotSkeleton />
      <VisitorsSkeleton />
    </div>
  );
}
