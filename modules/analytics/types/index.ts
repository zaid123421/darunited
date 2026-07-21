export type AnalyticsPeriod = "daily" | "weekly" | "monthly";

export interface AnalyticsCountry {
  country: string;
  visitors: number;
}

export interface AnalyticsTrafficSource {
  source: string;
  sessions: number;
}

export interface AnalyticsTopProject {
  id: number;
  title: string;
  mainPic: string | null;
  views: number;
}

export interface AnalyticsSnapshot {
  period: AnalyticsPeriod;
  visitorsCount: number;
  countries: AnalyticsCountry[];
  trafficSources: AnalyticsTrafficSource[];
  topProjects: AnalyticsTopProject[];
}
