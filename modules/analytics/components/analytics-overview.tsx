"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderKanban, Users } from "lucide-react";
import { useDashboardSnapshot } from "@/modules/analytics/hooks/use-dashboard-snapshot";
import type {
  AnalyticsCountry,
  AnalyticsPeriod,
  AnalyticsTopProject,
  AnalyticsTrafficSource,
} from "@/modules/analytics/types";

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
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
      {items.map((item) => (
        <li key={item.label}>
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

function TopProjectsList({ projects }: { projects: AnalyticsTopProject[] }) {
  if (projects.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No project views in this period
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {projects.map((project) => (
        <li key={project.id}>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
          >
            {project.mainPic ? (
              <div
                className="h-12 w-12 shrink-0 rounded-lg bg-cover bg-center"
                style={{ backgroundImage: `url(${project.mainPic})` }}
                role="img"
                aria-label={project.title}
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/15">
                <FolderKanban className="h-5 w-5 text-accent" aria-hidden />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {project.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(project.views)} views
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SnapshotSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-28 rounded-2xl border border-border bg-muted/40" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-56 rounded-2xl border border-border bg-muted/40" />
        <div className="h-56 rounded-2xl border border-border bg-muted/40" />
      </div>
      <div className="h-64 rounded-2xl border border-border bg-muted/40" />
    </div>
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

export function AnalyticsOverview() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("weekly");
  const { data, isLoading, isError, error, isFetching } =
    useDashboardSnapshot(period);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle mt-1">
            Overview of your website performance
          </p>
        </div>
        <div className="flex w-full gap-1 rounded-lg border border-border bg-muted p-1 sm:w-auto">
          {PERIODS.map(({ value, label }) => {
            const isActive = period === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "btn-brand"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? <SnapshotSkeleton /> : null}

      {isError ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-red-400">
            {error instanceof Error
              ? error.message
              : "Failed to load dashboard snapshot."}
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && data ? (
        <div
          className={`flex flex-col gap-6 ${isFetching ? "opacity-70 transition-opacity" : ""}`}
        >
          <div className="rounded-2xl border border-border bg-card p-5 sm:max-w-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Visitors</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
                <Users className="h-4 w-4 text-accent" aria-hidden />
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatNumber(data.visitorsCount)}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold text-foreground">
                Traffic Sources
              </h2>
              <RelativeBars
                items={toTrafficItems(data.trafficSources)}
                emptyLabel="No traffic sources in this period"
              />
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold text-foreground">
                Visitors by Country
              </h2>
              <RelativeBars
                items={toCountryItems(data.countries)}
                emptyLabel="No country data in this period"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold text-foreground">Top Projects</h2>
            <TopProjectsList projects={data.topProjects} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
