/**
 * ThreatLens — Splunk Enterprise REST API Client
 * SERVER-SIDE ONLY — never imported by any frontend file.
 *
 * Configured for:
 *   index=main  sourcetype=WinEventLog:Security
 *   Authentication: Bearer token OR Basic (username + password)
 *   SSL: configurable via SPLUNK_VERIFY_SSL (default: true)
 */

import axios, { type AxiosInstance } from "axios";
import https from "node:https";

// ─── Config ───────────────────────────────────────────────────────────────────

export interface SplunkConfig {
  baseUrl:    string;
  token?:     string;
  username?:  string;
  password?:  string;
  index:      string;
  sourcetype: string;
  verifySSL:  boolean;
}

export function getSplunkConfig(): SplunkConfig | null {
  const baseUrl = process.env.SPLUNK_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return null;

  const hasToken = Boolean(process.env.SPLUNK_TOKEN);
  const hasBasic = Boolean(process.env.SPLUNK_USERNAME) && Boolean(process.env.SPLUNK_PASSWORD);
  if (!hasToken && !hasBasic) return null;

  return {
    baseUrl,
    token:      process.env.SPLUNK_TOKEN,
    username:   process.env.SPLUNK_USERNAME,
    password:   process.env.SPLUNK_PASSWORD,
    index:      process.env.SPLUNK_INDEX      ?? "main",
    sourcetype: process.env.SPLUNK_SOURCETYPE ?? "WinEventLog:Security",
    verifySSL:  process.env.SPLUNK_VERIFY_SSL !== "false",
  };
}

// ─── HTTP client ──────────────────────────────────────────────────────────────

function buildAuthHeader(config: SplunkConfig): string {
  if (config.token) return `Bearer ${config.token}`;
  const b64 = Buffer.from(`${config.username}:${config.password}`).toString("base64");
  return `Basic ${b64}`;
}

function createHttpClient(config: SplunkConfig): AxiosInstance {
  return axios.create({
    baseURL:    config.baseUrl,
    timeout:    25_000,
    httpsAgent: new https.Agent({ rejectUnauthorized: config.verifySSL }),
    headers: {
      Authorization:  buildAuthHeader(config),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    params: { output_mode: "json" },
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type SplunkRow = Record<string, string>;

interface SplunkOneshotResponse {
  results:   SplunkRow[];
  messages?: Array<{ type: string; text: string }>;
}

interface SplunkServerInfoResponse {
  entry?: Array<{ content?: { serverName?: string; version?: string } }>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Run a SPL search in oneshot mode — blocks until results are ready.
 * Do NOT include "search " at the start of spl; it is added automatically.
 */
export async function splunkSearch(
  spl:       string,
  config:    SplunkConfig,
  earliest = "-24h",
  latest   = "now",
  maxRows  = 1_000,
): Promise<SplunkRow[]> {
  const client = createHttpClient(config);
  const body   = new URLSearchParams({
    search:         `search ${spl}`,
    output_mode:    "json",
    exec_mode:      "oneshot",
    earliest_time:  earliest,
    latest_time:    latest,
    count:          String(maxRows),
  });

  try {
    const { data } = await client.post<SplunkOneshotResponse>(
      "/services/search/jobs",
      body.toString(),
    );
    return data.results ?? [];
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 0;
      const detail = JSON.stringify(err.response?.data ?? {}).slice(0, 300);
      throw new Error(`Splunk search failed (HTTP ${status}): ${detail}`);
    }
    throw err;
  }
}

export async function splunkPing(config: SplunkConfig): Promise<{
  reachable: boolean; version: string; serverName: string; error?: string;
}> {
  try {
    const { data } = await createHttpClient(config).get<SplunkServerInfoResponse>(
      "/services/server/info",
    );
    const c = data.entry?.[0]?.content ?? {};
    return { reachable: true, version: c.version ?? "unknown", serverName: c.serverName ?? "unknown" };
  } catch (err) {
    return { reachable: false, version: "", serverName: "", error: String(err) };
  }
}
