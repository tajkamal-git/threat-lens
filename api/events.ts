/**
 * GET /api/events
 *
 * Returns the most recent log events for the live feed and live-logs page.
 * Designed to be polled every 3-5 seconds by the frontend.
 *
 * Query params:
 *   limit   - max events to return (default: 50, max: 200)
 *   severity - filter: all | critical | high | medium | low | info
 *   host    - filter by hostname (partial match)
 *   source  - filter by sourcetype (partial match)
 *   range   - lookback: 5m | 15m | 1h | 6h (default: 15m)
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSplunkConfig, splunkSearch } from "./_lib/splunk-client";
import { rowToLogEvent, eventCodeToSeverity } from "./_lib/normalizers";
import { getDemoEvents } from "./_lib/demo-data";
import type { LogEvent } from "../src/lib/types";

const RANGE_MAP: Record<string, string> = {
  "5m": "-5m", "15m": "-15m", "1h": "-1h", "6h": "-6h",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Short cache for polling — 3s freshness to avoid hammering Splunk
  res.setHeader("Cache-Control", "no-store");

  const limit    = Math.min(200, Math.max(1, Number(req.query.limit ?? 50)));
  const severity = String(req.query.severity ?? "all");
  const host     = String(req.query.host  ?? "");
  const source   = String(req.query.source ?? "");
  const range    = RANGE_MAP[String(req.query.range)] ?? "-15m";

  const config = getSplunkConfig();

  // ── Demo mode ──────────────────────────────────────────────────────────────
  if (!config) {
    let events = getDemoEvents(limit * 2);
    if (severity !== "all") events = events.filter((e) => e.severity === severity);
    if (host)   events = events.filter((e) => e.host.toLowerCase().includes(host.toLowerCase()));
    if (source) events = events.filter((e) => e.source.toLowerCase().includes(source.toLowerCase()));
    // Simulate live data — shift timestamps to now so the feed feels real
    const now = Date.now();
    events = events.slice(0, limit).map((e, i) => ({
      ...e,
      timestamp: new Date(now - i * 7_000).toISOString(),
    }));
    return res.status(200).json({ source: "demo", data: events });
  }

  // ── Splunk mode ────────────────────────────────────────────────────────────
  try {
    // Build SPL — host/source filters pushed to Splunk for efficiency.
    // Default sourcetype filter targets the confirmed WinEventLog:Security data;
    // an explicit `source` query param overrides it to search other sourcetypes.
    const hostFilter   = host   ? `host=*${host}*` : "";
    const sourceFilter = source ? `sourcetype=*${source}*` : `sourcetype="${config.sourcetype}"`;
    const filters       = [hostFilter, sourceFilter].filter(Boolean).join(" ");

    const spl  = `index=${config.index} ${filters} | sort -_time | head ${limit}`;
    const rows = await splunkSearch(spl, config, range, "now", limit);

    let events: LogEvent[] = rows.map(rowToLogEvent);

    // Apply severity filter client-side (derived from EventCode)
    if (severity !== "all") {
      events = events.filter((e) => e.severity === severity);
    }

    return res.status(200).json({ source: "splunk", data: events });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ThreatLens/events] Splunk error:", message);

    return res.status(200).json({
      source: "demo",
      error: message,
      data: getDemoEvents(limit),
    });
  }
}
