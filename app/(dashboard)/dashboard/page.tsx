import { Suspense } from "react";
import {
  AnalyticsOverview,
  AnalyticsOverviewFallback,
} from "@/modules/analytics/components/analytics-overview";

export default function DashboardPage() {
  return (
    <Suspense fallback={<AnalyticsOverviewFallback />}>
      <AnalyticsOverview />
    </Suspense>
  );
}
