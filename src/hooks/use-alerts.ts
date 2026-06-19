/**
 * ThreatLens — useAlerts hook
 *
 * Fetches paginated, filtered alerts from GET /api/alerts.
 * Query key includes all filter params so React Query caches
 * each unique filter combination independently.
 */
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Alert, PaginatedResponse } from "@/lib/types";

export interface AlertQueryParams {
  severity?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  range?: string;
}

export type AlertsResponse = PaginatedResponse<Alert> & {
  source: "splunk" | "demo";
  error?: string;
};

export function useAlerts(params: AlertQueryParams = {}) {
  const {
    severity = "all",
    status = "all",
    search = "",
    page = 1,
    pageSize = 25,
    range = "24h",
  } = params;

  return useQuery<AlertsResponse>({
    queryKey: ["alerts", { severity, status, search, page, pageSize, range }],
    queryFn: ({ signal }) =>
      apiFetch<AlertsResponse>(
        "/api/alerts",
        { severity, status, search, page, pageSize, range },
        signal,
      ),
    staleTime: 30_000,
    refetchInterval: 60_000,
    placeholderData: (prev) => prev, // Keep previous data while fetching next page
  });
}
