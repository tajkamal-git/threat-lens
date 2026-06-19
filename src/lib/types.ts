/**
 * ThreatLens — Platform-wide Type Definitions
 *
 * All shared types are defined here and imported elsewhere.
 * Domain-specific types that are tightly coupled to a single module may
 * live alongside that module, but anything shared across two or more
 * files belongs here.
 *
 * Naming conventions:
 *   - Interfaces: PascalCase (e.g. `Alert`, `Incident`)
 *   - Union types: PascalCase (e.g. `Severity`, `AlertStatus`)
 *   - Type aliases that represent DB/API shapes are prefixed with nothing
 *   - Type aliases for UI-only concerns are prefixed with `Ui` (e.g. `UiTone`)
 */

// ─── Severity & Tones ────────────────────────────────────────────────────────

/** Raw severity levels used across alerts, incidents, and events. */
export type Severity = "critical" | "high" | "medium" | "low" | "info";

/** UI colour tone variants — superset of Severity for card/badge colouring. */
export type UiTone =
  | "default"
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "info"
  | "success";

// ─── Alert ───────────────────────────────────────────────────────────────────

export type AlertStatus = "new" | "triaged" | "in_progress" | "closed";

export interface MitreRef {
  id: string;   // e.g. "T1110"
  name: string; // e.g. "Brute Force"
  tactic: string;
}

export interface Alert {
  id: string;
  title: string;
  severity: Severity;
  status: AlertStatus;
  host: string;
  user: string;
  sourceIp: string;
  technique: MitreRef;
  confidence: number;    // 0-100
  createdAt: string;     // ISO-8601
  assignee: string;      // username or "—"
}

// ─── Incident ────────────────────────────────────────────────────────────────

export type IncidentStatus = "open" | "investigating" | "containment" | "resolved";

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  priority: 1 | 2 | 3 | 4;
  risk: number;           // 0-100 composite risk score
  assignee: string;
  assets: string[];       // hostnames
  techniques: string[];   // MITRE technique IDs
  evidence: number;       // evidence item count
  progress: number;       // 0-100 investigation progress
  createdAt: string;      // ISO-8601
}

// ─── Live Event Log ──────────────────────────────────────────────────────────

export interface LogEvent {
  id: number;
  timestamp: string;   // ISO-8601
  host: string;
  user: string;
  sourceIp: string;
  eventId: number;     // Windows Event ID or equivalent
  severity: Severity;
  source: string;      // e.g. "WinEventLog:Security", "Sysmon"
  message: string;
}

// ─── MITRE ATT&CK ────────────────────────────────────────────────────────────

export interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  detections: number;  // hits in the current detection window
}

// ─── IOC ─────────────────────────────────────────────────────────────────────

export type IocType = "ip" | "domain" | "url" | "sha256" | "email";

export interface Ioc {
  id: string;
  type: IocType;
  value: string;
  confidence: number;   // 0-100
  hits: number;         // matched events count
  source: string;       // threat intel source name
  firstSeen: string;    // ISO-8601
}

// ─── Endpoint ────────────────────────────────────────────────────────────────

export type AgentStatus = "healthy" | "degraded" | "offline";

export interface Endpoint {
  hostname: string;
  os: string;
  agent: AgentStatus;
  risk: number;         // 0-100
  lastSeen: string;     // ISO-8601
  threats: number;
}

// ─── Detection Rule ──────────────────────────────────────────────────────────

export interface DetectionRule {
  id: string;
  name: string;
  enabled: boolean;
  severity: Severity;
  category: string;
  technique: string;    // MITRE technique ID
  fires: number;        // total fires (all time)
  fp: number;           // confirmed false-positive count
}

// ─── Integration ─────────────────────────────────────────────────────────────

export type IntegrationStatus = "connected" | "disconnected" | "available" | "error";

export interface Integration {
  name: string;
  category: string;
  status: IntegrationStatus;
  events: string;       // human-readable throughput e.g. "1.2B/day"
}

// ─── Country / Attack Origin ─────────────────────────────────────────────────

export interface AttackOrigin {
  code: string;    // ISO 3166-1 alpha-2
  name: string;
  attacks: number;
  lat: number;
  lng: number;
}

// ─── Chart / Spark Data ──────────────────────────────────────────────────────

export interface SparkPoint {
  x: number;
  y: number;
}

export interface HourlyEventBucket {
  hour: string;     // "HH:00"
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface AttackCategoryBucket {
  name: string;
  value: number;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

export interface KpiCardProps {
  label: string;
  value: number;
  suffix?: string;
  delta?: number;
  icon: React.ComponentType<{ className?: string }>;
  spark?: SparkPoint[];
  tone?: UiTone;
}

// ─── API / Data-layer Abstractions ───────────────────────────────────────────

/**
 * Generic paginated API response wrapper.
 * Used for future REST/server-function pagination support.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Generic filter state passed to data-fetching hooks/functions.
 * Extend per domain (AlertFilters, IncidentFilters, etc.).
 */
export interface BaseFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  search?: string;
}

export interface AlertFilters extends BaseFilters {
  severity?: Severity | "all";
  status?: AlertStatus | "all";
  assignee?: string;
  host?: string;
  technique?: string;
}

export interface IncidentFilters extends BaseFilters {
  severity?: Severity | "all";
  status?: IncidentStatus | "all";
  assignee?: string;
}
