/**
 * ThreatLens — Data Access Layer (Phase 0: Mock)
 *
 * This module provides the data-fetching functions used by React Query hooks
 * throughout the application. In Phase 0 (current), all functions return
 * in-memory mock data synchronously wrapped in promises to simulate async
 * API calls.
 *
 * Architecture contract:
 *   - All functions return Promises to be used with React Query's useQuery/
 *     useInfiniteQuery hooks.
 *   - Input types match the Zod schemas that will validate real API calls in
 *     Phase 1 — the function signatures won't change, only the implementations.
 *   - Phase 1 upgrade: Replace mock return statements with fetch() calls to
 *     the ThreatLens backend API (which will call Splunk REST internally).
 *   - Phase 1 upgrade: Re-introduce createServerFn wrappers if SSR is
 *     re-enabled — the mock → real switch is just an implementation swap.
 *
 * Usage (with React Query):
 *   const { data } = useQuery({
 *     queryKey: ["alerts", filters],
 *     queryFn: () => getAlerts(filters),
 *   });
 */

import {
  ALERTS,
  INCIDENTS,
  LIVE_LOGS,
  ENDPOINTS,
  IOCS,
  RULES,
} from "../mock";
import type {
  Alert,
  Incident,
  LogEvent,
  Endpoint,
  Ioc,
  DetectionRule,
  PaginatedResponse,
  AlertFilters,
  IncidentFilters,
} from "../types";
import { DEFAULT_PAGE_SIZE } from "../constants";

// ─── Simulated network delay ──────────────────────────────────────────────────

/** Simulate a realistic async API round-trip in development. */
const delay = (ms = 120) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Alerts ───────────────────────────────────────────────────────────────────

export async function getAlerts(
  filters: AlertFilters = {},
): Promise<PaginatedResponse<Alert>> {
  await delay();

  const {
    severity = "all",
    status = "all",
    search = "",
    assignee,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = filters;

  let filtered = [...ALERTS];

  if (severity !== "all") {
    filtered = filtered.filter((a) => a.severity === severity);
  }
  if (status !== "all") {
    filtered = filtered.filter((a) => a.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.host.toLowerCase().includes(q) ||
        a.user.toLowerCase().includes(q) ||
        a.sourceIp.includes(q),
    );
  }
  if (assignee) {
    filtered = filtered.filter((a) => a.assignee === assignee);
  }

  const total = filtered.length;
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { data: slice, total, page, pageSize, hasMore: page * pageSize < total };
}

// ─── Incidents ────────────────────────────────────────────────────────────────

export async function getIncidents(
  filters: IncidentFilters = {},
): Promise<PaginatedResponse<Incident>> {
  await delay();

  const {
    severity = "all",
    status = "all",
    search = "",
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = filters;

  let filtered = [...INCIDENTS];

  if (severity !== "all") {
    filtered = filtered.filter((i) => i.severity === severity);
  }
  if (status !== "all") {
    filtered = filtered.filter((i) => i.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.assignee.toLowerCase().includes(q),
    );
  }

  const total = filtered.length;
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { data: slice, total, page, pageSize, hasMore: page * pageSize < total };
}

// ─── Live Logs ────────────────────────────────────────────────────────────────

export interface LogFilters {
  limit?: number;
  severity?: string;
  host?: string;
  source?: string;
}

export async function getLiveLogs(filters: LogFilters = {}): Promise<LogEvent[]> {
  await delay(80);

  const { limit = 50, severity = "all", host, source } = filters;

  let filtered = [...LIVE_LOGS];

  if (severity !== "all") {
    filtered = filtered.filter((e) => e.severity === severity);
  }
  if (host) {
    filtered = filtered.filter((e) =>
      e.host.toLowerCase().includes(host.toLowerCase()),
    );
  }
  if (source) {
    filtered = filtered.filter((e) =>
      e.source.toLowerCase().includes(source.toLowerCase()),
    );
  }

  return filtered.slice(0, limit);
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export async function getEndpoints(filters: {
  page?: number;
  pageSize?: number;
  search?: string;
} = {}): Promise<PaginatedResponse<Endpoint>> {
  await delay();

  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, search = "" } = filters;

  let filtered = [...ENDPOINTS];

  if (search) {
    filtered = filtered.filter((e) =>
      e.hostname.toLowerCase().includes(search.toLowerCase()),
    );
  }

  const total = filtered.length;
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { data: slice, total, page, pageSize, hasMore: page * pageSize < total };
}

// ─── IOCs ─────────────────────────────────────────────────────────────────────

export interface IocFilters {
  type?: string;
  search?: string;
  minConfidence?: number;
  page?: number;
  pageSize?: number;
}

export async function getIocs(filters: IocFilters = {}): Promise<PaginatedResponse<Ioc>> {
  await delay();

  const {
    type = "all",
    search = "",
    minConfidence = 0,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = filters;

  let filtered = [...IOCS];

  if (type !== "all") {
    filtered = filtered.filter((i) => i.type === type);
  }
  if (search) {
    filtered = filtered.filter((i) =>
      i.value.toLowerCase().includes(search.toLowerCase()),
    );
  }
  if (minConfidence > 0) {
    filtered = filtered.filter((i) => i.confidence >= minConfidence);
  }

  const total = filtered.length;
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { data: slice, total, page, pageSize, hasMore: page * pageSize < total };
}

// ─── Detection Rules ──────────────────────────────────────────────────────────

export async function getDetectionRules(filters: {
  enabled?: boolean;
  severity?: string;
  search?: string;
} = {}): Promise<DetectionRule[]> {
  await delay();

  const { enabled, severity = "all", search = "" } = filters;

  let filtered = [...RULES];

  if (enabled !== undefined) {
    filtered = filtered.filter((r) => r.enabled === enabled);
  }
  if (severity !== "all") {
    filtered = filtered.filter((r) => r.severity === severity);
  }
  if (search) {
    filtered = filtered.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase()),
    );
  }

  return filtered;
}

// ─── Platform Health ──────────────────────────────────────────────────────────

export interface PlatformHealth {
  status: "operational" | "degraded" | "incident";
  ingestRate: { eps: number; trend: string };
  detectionEngine: { status: string; rulesLoaded: number };
  splunk: { status: string; indexerCount: number };
  aiService: { status: string; confidence: number };
  lastChecked: string;
}

export async function getPlatformHealth(): Promise<PlatformHealth> {
  await delay(50);

  return {
    status: "operational",
    ingestRate: { eps: 142_340, trend: "+3%" },
    detectionEngine: { status: "running", rulesLoaded: 1_284 },
    splunk: { status: "connected", indexerCount: 4 },
    aiService: { status: "available", confidence: 92 },
    lastChecked: new Date().toISOString(),
  };
}
