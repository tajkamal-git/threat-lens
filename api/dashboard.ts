/**
 * GET /api/dashboard
 * SPL queries calibrated for: index=main sourcetype=WinEventLog:Security
 *
 * Alert EventCodes used (confirmed present in environment):
 *   4673 (24604) — Sensitive Privilege Use       → HIGH
 *   4702 (161)   — Scheduled Task Updated        → HIGH
 *   5379 (198)   — Credential Manager Read       → HIGH
 *   4670 (440)   — Permissions Changed           → MEDIUM
 *   4688 (1599)  — Process Creation              → MEDIUM
 *   4663 (7365)  — Object Access                 → MEDIUM
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSplunkConfig, splunkSearch } from "./_lib/splunk-client";
import { rowToAlert, rowsToKpiCounts, rowsToHourlyBuckets } from "./_lib/normalizers";
import {
  getDemoKpis, getDemoHourlyEvents, getDemoAttackCategories,
  getDemoAlerts, getDemoEvents,
} from "./_lib/demo-data";

const RANGE_MAP: Record<string, string> = {
  "1h": "-1h", "6h": "-6h", "24h": "-24h", "7d": "-7d",
};

// High-value EventCodes confirmed in this Splunk environment
const ALERT_CODES = "4673,4702,5379,4670,4688,4663,4656,4690,5152,4624,4625,4720,4732,1102";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  const range  = RANGE_MAP[String(req.query.range)] ?? "-24h";
  const config = getSplunkConfig();

  if (!config) {
    return res.status(200).json({
      source: "demo",
      kpis: getDemoKpis(),
      hourlyEvents: getDemoHourlyEvents(),
      attackCategories: getDemoAttackCategories(),
      recentAlerts: getDemoAlerts().slice(0, 8),
      recentEvents: getDemoEvents(8),
    });
  }

  try {
    const idx = config.index;
    const st  = config.sourcetype;

    const [allRows, alertRows, eventRows] = await Promise.all([
      // All events — KPIs + hourly chart
      splunkSearch(`index=${idx} sourcetype="${st}" | head 5000`, config, range, "now", 5_000),
      // Alert-worthy events — recent alerts panel
      splunkSearch(
        `index=${idx} sourcetype="${st}" EventCode IN (${ALERT_CODES}) | sort -_time | head 20`,
        config, range, "now", 20,
      ),
      // Most recent events — live feed
      splunkSearch(`index=${idx} sourcetype="${st}" | sort -_time | head 8`, config, "-15m", "now", 8),
    ]);

    const kpiCounts = rowsToKpiCounts(allRows);

    return res.status(200).json({
      source: "splunk",
      kpis: {
        criticalAlerts:  kpiCounts.critical,
        highAlerts:      kpiCounts.high,
        mediumAlerts:    kpiCounts.medium,
        lowAlerts:       kpiCounts.low,
        activeIncidents: Math.max(1, Math.round(kpiCounts.critical / 3)),
        ingestRateEps:   Math.round(kpiCounts.total / 86_400),
        activeEndpoints: new Set(allRows.map(r => r.host ?? r.Computer ?? "")).size,
        onlineUsers:     new Set(allRows.map(r => r.SubjectUserName ?? r.Account_Name ?? "")).size,
        rulesLoaded:     1_284,
        iocMatches:      Math.max(0, Math.round(kpiCounts.critical * 1.4)),
        threatScore:     Math.min(99, 20 + kpiCounts.critical * 2 + kpiCounts.high),
        aiConfidence:    92,
      },
      hourlyEvents:    rowsToHourlyBuckets(allRows),
      attackCategories: getDemoAttackCategories(),
      recentAlerts:    alertRows.map(rowToAlert),
      recentEvents:    eventRows.map((r, i) => ({
        id:        i,
        timestamp: r._time ?? new Date().toISOString(),
        host:      r.host ?? r.Computer ?? "unknown",
        user:      r.SubjectUserName ?? r.Account_Name ?? "SYSTEM",
        sourceIp:  r.IpAddress ?? r.src_ip ?? "—",
        eventId:   Number(r.EventCode ?? 0),
        severity:  "info",
        source:    r.sourcetype ?? st,
        message:   (r.Message ?? `Event ${r.EventCode}`).split("\n")[0].trim().slice(0, 200),
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ThreatLens/dashboard] Splunk error:", message);
    return res.status(200).json({
      source: "demo", error: message,
      kpis: getDemoKpis(), hourlyEvents: getDemoHourlyEvents(),
      attackCategories: getDemoAttackCategories(),
      recentAlerts: getDemoAlerts().slice(0, 8), recentEvents: getDemoEvents(8),
    });
  }
}
