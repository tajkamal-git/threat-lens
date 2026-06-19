/**
 * ThreatLens — useDashboard hook
 *
 * Fetches aggregated SOC dashboard data (KPIs, charts, recent events)
 * from GET /api/dashboard with a 60-second background-refetch interval.
 */
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Alert, LogEvent, HourlyEventBucket, AttackCategoryBucket } from "@/lib/types";

export interface DashboardData {
  source: "splunk" | "demo";
  error?: string;
  kpis: {
    criticalAlerts:  number;
    highAlerts:      number;
    mediumAlerts:    number;
    lowAlerts:       number;
    activeIncidents: number;
    ingestRateEps:   number;
    activeEndpoints: number;
    onlineUsers:     number;
    rulesLoaded:     number;
    iocMatches:      number;
    threatScore:     number;
    aiConfidence:    number;
  };
  hourlyEvents:      HourlyEventBucket[];
  attackCategories:  AttackCategoryBucket[];
  recentAlerts:      Alert[];
  recentEvents:      LogEvent[];
}

export type DashboardRange = "1h" | "6h" | "24h" | "7d";

export function useDashboard(range: DashboardRange = "24h") {
  return useQuery<DashboardData>({
    queryKey: ["dashboard", range],
    queryFn: ({ signal }) =>
      apiFetch<DashboardData>("/api/dashboard", { range }, signal),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
  });
}
