/**
 * ThreatLens — useIncidents hook
 *
 * Fetches paginated, filtered incidents from GET /api/incidents.
 */
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Incident, PaginatedResponse } from "@/lib/types";

export interface IncidentQueryParams {
  severity?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  range?: string;
}

export type IncidentsResponse = PaginatedResponse<Incident> & {
  source: "splunk" | "demo";
  error?: string;
};

export function useIncidents(params: IncidentQueryParams = {}) {
  const {
    severity = "all",
    status = "all",
    search = "",
    page = 1,
    pageSize = 25,
    range = "7d",
  } = params;

  return useQuery<IncidentsResponse>({
    queryKey: ["incidents", { severity, status, search, page, pageSize, range }],
    queryFn: ({ signal }) =>
      apiFetch<IncidentsResponse>(
        "/api/incidents",
        { severity, status, search, page, pageSize, range },
        signal,
      ),
    staleTime: 30_000,
    refetchInterval: 120_000,
    placeholderData: (prev) => prev,
  });
}
