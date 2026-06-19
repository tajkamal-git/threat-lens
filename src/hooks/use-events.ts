/**
 * ThreatLens — useEvents hook
 *
 * Fetches live log events from GET /api/events with a 3.5-second
 * polling interval (matching the original mock-data rotation interval).
 * Polling pauses when `paused` is true or the tab is hidden.
 */
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { LogEvent } from "@/lib/types";

export interface EventQueryParams {
  limit?: number;
  severity?: string;
  host?: string;
  source?: string;
  range?: string;
  paused?: boolean;
}

interface EventsResponse {
  source: "splunk" | "demo";
  data: LogEvent[];
  error?: string;
}

export function useEvents(params: EventQueryParams = {}) {
  const {
    limit = 50,
    severity = "all",
    host = "",
    source = "",
    range = "15m",
    paused = false,
  } = params;

  return useQuery<EventsResponse>({
    queryKey: ["events", { severity, host, source, range, limit }],
    queryFn: ({ signal }) =>
      apiFetch<EventsResponse>(
        "/api/events",
        { limit, severity, host, source, range },
        signal,
      ),
    staleTime: 3_000,
    refetchInterval: paused ? false : 3_500,
    refetchIntervalInBackground: false, // Pause when tab is hidden
  });
}

/** Shorthand for the dashboard live-feed panel (smaller limit, fast poll). */
export function useLiveFeed(paused = false) {
  return useEvents({ limit: 10, range: "15m", paused });
}
