import type {
  AnalyticsDateRange,
  AnalyticsPeriod,
  VisitorAvailability,
} from "@/modules/analytics/types";

const SECTION_LABELS: Record<string, string> = {
  coming_soon: "Coming soon",
  home: "Home",
  about_us: "About",
  production: "Production",
  products: "Products",
  projects: "Projects",
  contact_us: "Contact",
};

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export function periodLabel(period: AnalyticsPeriod): string {
  return PERIOD_LABELS[period];
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatIsoDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateRange(range: AnalyticsDateRange): string {
  if (!range.startDate && !range.endDate) return "Unknown range";
  if (range.startDate === range.endDate) return formatIsoDate(range.startDate);
  return `${formatIsoDate(range.startDate)} – ${formatIsoDate(range.endDate)}`;
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0 && remainder > 0) return `${minutes}m ${remainder}s`;
  if (minutes > 0) return `${minutes}m`;
  return `${remainder}s`;
}

export function sectionLabel(section: string): string {
  if (!section) return "Unknown section";
  return (
    SECTION_LABELS[section] ??
    section
      .split("_")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function visitorAvailabilityMessage(
  availability: VisitorAvailability,
  range: AnalyticsDateRange,
): string {
  const exportedSpan =
    availability.dataFrom && availability.dataThrough
      ? `${formatIsoDate(availability.dataFrom)} – ${formatIsoDate(availability.dataThrough)}`
      : null;

  if (availability.status === "outside_export_range") {
    return exportedSpan
      ? `Visitor details are exported from ${exportedSpan}. This range starts before that.`
      : "This range starts before visitor details were exported.";
  }

  if (availability.status === "pending_export") {
    return exportedSpan
      ? `Exported visitor details cover ${exportedSpan}. ${formatDateRange(range)} is not in that export yet.`
      : "Visitor details for this range are still being exported. They usually appear the day after the visits.";
  }

  if (!availability.available) {
    return "Visitor details are not available for this range.";
  }

  return "";
}
