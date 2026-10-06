"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ANALYTICS_PERIODS, type AnalyticsFilters, type AnalyticsPeriod } from "@/modules/analytics/types";
import {
  buildDashboardHref,
  todayIsoDate,
} from "@/modules/analytics/lib/analytics-filters";
import { periodLabel } from "@/modules/analytics/lib/format-analytics";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

interface AnalyticsRangeFiltersProps {
  filters: AnalyticsFilters;
}

export function AnalyticsRangeFilters({ filters }: AnalyticsRangeFiltersProps) {
  const router = useRouter();
  const [draftStart, setDraftStart] = useState(filters.startDate);
  const [draftEnd, setDraftEnd] = useState(filters.endDate);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(filters.mode === "custom");

  useEffect(() => {
    setDraftStart(filters.startDate);
    setDraftEnd(filters.endDate);
    setDraftError(filters.requestError);
    if (filters.mode === "custom") setCustomOpen(true);
  }, [filters.mode, filters.startDate, filters.endDate, filters.requestError]);

  function applyPreset(period: AnalyticsPeriod) {
    setCustomOpen(false);
    setDraftError(null);
    router.replace(
      buildDashboardHref({
        mode: "preset",
        period,
        perPage: filters.perPage,
      }),
    );
  }

  function applyCustomRange() {
    if (!draftStart || !draftEnd) {
      setDraftError("Choose both a start date and an end date.");
      return;
    }

    router.replace(
      buildDashboardHref({
        mode: "custom",
        period: filters.period,
        startDate: draftStart,
        endDate: draftEnd,
        perPage: filters.perPage,
      }),
    );
  }

  function applyPerPage(perPage: number) {
    router.replace(
      buildDashboardHref({
        mode: filters.mode,
        period: filters.period,
        startDate: filters.startDate,
        endDate: filters.endDate,
        perPage,
      }),
    );
  }

  const today = todayIsoDate();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex w-full gap-1 rounded-lg border border-border bg-muted p-1 sm:w-auto"
          role="group"
          aria-label="Analytics period"
        >
          {ANALYTICS_PERIODS.map((period) => {
            const isActive = filters.mode === "preset" && filters.period === period;
            return (
              <button
                key={period}
                type="button"
                onClick={() => applyPreset(period)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "btn-brand"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {periodLabel(period)}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setDraftError(null);
              setCustomOpen(true);
            }}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              customOpen
                ? "btn-brand"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Custom
          </button>
        </div>

        <div className="w-36 shrink-0">
          <Select
            id="visitors-per-page"
            ariaLabel="Visitors per page"
            value={String(filters.perPage)}
            onValueChange={(value) => applyPerPage(Number(value))}
            options={PER_PAGE_OPTIONS.map((option) => ({
              value: String(option),
              label: `${option} rows`,
            }))}
            className="h-9 rounded-lg bg-muted px-3 text-xs font-medium"
          />
        </div>
      </div>

      {customOpen ? (
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            applyCustomRange();
          }}
        >
          <Input
            label="Start date"
            type="date"
            name="start_date"
            value={draftStart}
            max={draftEnd || today}
            onChange={(event) => {
              setDraftStart(event.target.value);
              setDraftError(null);
            }}
          />
          <Input
            label="End date"
            type="date"
            name="end_date"
            value={draftEnd}
            min={draftStart || undefined}
            max={today}
            onChange={(event) => {
              setDraftEnd(event.target.value);
              setDraftError(null);
            }}
          />
          <button
            type="submit"
            className="btn-brand-outline inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm"
          >
            Apply
          </button>
        </form>
      ) : null}

      {draftError ? <p className="text-sm text-red-400">{draftError}</p> : null}
    </div>
  );
}
