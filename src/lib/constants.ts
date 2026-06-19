/**
 * ThreatLens — Application Constants
 *
 * Centralised constants consumed across the entire platform.
 * Keep values here rather than scattering magic strings or numbers
 * throughout components. Organised by domain.
 */

import type { Severity, UiTone } from "./types";

// ─── Branding ─────────────────────────────────────────────────────────────────

export const APP_NAME = "ThreatLens" as const;
export const APP_TAGLINE = "Enterprise SOC Analytics Platform" as const;
export const APP_ORG = "Acme Federal" as const;

// ─── Severity ─────────────────────────────────────────────────────────────────

/**
 * Canonical ordering of severity levels — highest to lowest.
 * Use for sort keys or priority comparisons.
 */
export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0,
} as const;

/** CSS custom-property references for severity colours. */
export const SEVERITY_CSS_VAR: Record<Severity, string> = {
  critical: "var(--critical)",
  high: "var(--high)",
  medium: "var(--medium)",
  low: "var(--low)",
  info: "var(--info)",
} as const;

/** OKLCH literal values for severity colours (for inline SVG / recharts). */
export const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "oklch(0.62 0.24 18)",
  high: "oklch(0.70 0.20 40)",
  medium: "oklch(0.78 0.17 85)",
  low: "oklch(0.72 0.15 200)",
  info: "oklch(0.70 0.14 240)",
} as const;

/** Text colour classes by severity (Tailwind arbitrary values). */
export const SEVERITY_TEXT_CLASS: Record<Severity, string> = {
  critical: "text-[oklch(0.82_0.20_25)]",
  high: "text-[oklch(0.85_0.18_55)]",
  medium: "text-[oklch(0.88_0.16_90)]",
  low: "text-[oklch(0.85_0.13_205)]",
  info: "text-[oklch(0.85_0.10_245)]",
} as const;

/** Badge style classes by severity (bg + text + border). */
export const SEVERITY_BADGE_CLASS: Record<Severity, string> = {
  critical:
    "bg-[oklch(0.62_0.24_18_/_15%)] text-[oklch(0.82_0.20_25)] border-[oklch(0.62_0.24_18_/_40%)]",
  high: "bg-[oklch(0.70_0.20_40_/_15%)] text-[oklch(0.85_0.18_55)] border-[oklch(0.70_0.20_40_/_40%)]",
  medium:
    "bg-[oklch(0.78_0.17_85_/_15%)] text-[oklch(0.88_0.16_90)] border-[oklch(0.78_0.17_85_/_40%)]",
  low: "bg-[oklch(0.72_0.15_200_/_15%)] text-[oklch(0.85_0.13_205)] border-[oklch(0.72_0.15_200_/_40%)]",
  info: "bg-[oklch(0.70_0.14_240_/_15%)] text-[oklch(0.85_0.10_245)] border-[oklch(0.70_0.14_240_/_40%)]",
} as const;

// ─── Chart Palette ────────────────────────────────────────────────────────────

/**
 * Ordered chart colour palette derived from the SOC design system.
 * Index 0 = primary (cyan), then green, amber, orange-red, purple,
 * red (critical), yellow, blue.
 */
export const CHART_COLORS = [
  "oklch(0.72 0.16 200)", // cyan   — primary
  "oklch(0.70 0.18 150)", // green  — success
  "oklch(0.75 0.18 80)",  // amber
  "oklch(0.65 0.22 30)",  // orange-red
  "oklch(0.65 0.20 320)", // purple
  "oklch(0.62 0.24 18)",  // red    — critical
  "oklch(0.78 0.17 85)",  // yellow — medium
  "oklch(0.70 0.14 240)", // blue   — info
] as const;

/** Recharts tooltip style applied globally for visual consistency. */
export const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  background: "oklch(0.18 0.02 250)",
  border: "1px solid oklch(0.32 0.02 250)",
  borderRadius: 8,
  fontSize: 12,
};

export const CHART_GRID_STROKE = "oklch(0.30 0.02 250 / 30%)" as const;
export const CHART_AXIS_STROKE = "oklch(0.65 0.02 250)" as const;

// ─── KPI Card Tones ───────────────────────────────────────────────────────────

/** Text colour class per KPI card tone. */
export const KPI_TONE_TEXT: Record<UiTone, string> = {
  default: "text-primary",
  critical: "text-[oklch(0.82_0.20_25)]",
  high: "text-[oklch(0.85_0.18_55)]",
  medium: "text-[oklch(0.88_0.16_90)]",
  low: "text-[oklch(0.85_0.13_205)]",
  info: "text-[oklch(0.85_0.10_245)]",
  success: "text-[oklch(0.80_0.18_150)]",
} as const;

/** Spark line colour per KPI card tone. */
export const KPI_TONE_SPARK: Record<UiTone, string> = {
  default: "oklch(0.72 0.16 200)",
  critical: "oklch(0.62 0.24 18)",
  high: "oklch(0.70 0.20 40)",
  medium: "oklch(0.78 0.17 85)",
  low: "oklch(0.72 0.15 200)",
  info: "oklch(0.70 0.14 240)",
  success: "oklch(0.70 0.18 150)",
} as const;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 25 as const;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// ─── Date / Time ─────────────────────────────────────────────────────────────

/** Default rolling window shown on most dashboards (milliseconds). */
export const DEFAULT_TIME_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export const TIME_RANGE_OPTIONS = [
  { label: "Last 1 hour", value: "1h" },
  { label: "Last 6 hours", value: "6h" },
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Custom range", value: "custom" },
] as const;

// ─── API / Data ───────────────────────────────────────────────────────────────

/**
 * Base API path prefix for ThreatLens server functions.
 * When Splunk integration is wired, these endpoints will proxy to
 * the Splunk REST API via the backend service layer.
 */
export const API_BASE_PATH = "/api" as const;

/** Polling interval for live feed components (milliseconds). */
export const LIVE_FEED_POLL_INTERVAL_MS = 3_500 as const;

/** Maximum age of a cached query before it's considered stale. */
export const QUERY_STALE_TIME_MS = 30_000 as const; // 30 seconds

// ─── MITRE ATT&CK ─────────────────────────────────────────────────────────────

/** Ordered list of MITRE ATT&CK Enterprise tactic names. */
export const MITRE_TACTIC_ORDER = [
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Defense Evasion",
  "Credential Access",
  "Discovery",
  "Lateral Movement",
  "Collection",
  "Command & Control",
  "Exfiltration",
  "Impact",
] as const;

export type MitreTacticName = (typeof MITRE_TACTIC_ORDER)[number];

// ─── Navigation ───────────────────────────────────────────────────────────────

/** Route paths for programmatic navigation (avoids magic strings in code). */
export const ROUTES = {
  dashboard: "/",
  incidents: "/incidents",
  alerts: "/alerts",
  liveLogs: "/live-logs",
  analytics: "/analytics",
  aiAnalysis: "/ai-analysis",
  mitre: "/mitre",
  ioc: "/ioc",
  threatIntel: "/threat-intel",
  uba: "/uba",
  authentication: "/authentication",
  endpoint: "/endpoint",
  network: "/network",
  fim: "/fim",
  rules: "/rules",
  cases: "/cases",
  reports: "/reports",
  search: "/search",
  integrations: "/integrations",
  settings: "/settings",
  profile: "/profile",
  help: "/help",
} as const;
