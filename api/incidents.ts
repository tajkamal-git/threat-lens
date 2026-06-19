/**
 * GET /api/incidents
 * Calibrated for: index=main sourcetype=WinEventLog:Security
 *
 * Phase 1: Incidents are synthesised from correlated high-severity Splunk
 * events (multiple high-severity events from the same host within a window).
 * Phase 4 (correlation engine) will replace this with proper attack narratives.
 * Phase 9 (case management) will add a persistent incident store.
 *
 * EventCodes used for incident synthesis (confirmed in environment):
 *   4673 — Sensitive Privilege Use
 *   4702 — Scheduled Task Updated
 *   5379 — Credential Manager Credentials Read
 *   4670 — Permissions on Object Changed
 *   4688 — Process Creation
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSplunkConfig, splunkSearch } from "./_lib/splunk-client";
import { rowToAlert } from "./_lib/normalizers";
import { getDemoIncidents } from "./_lib/demo-data";
import type { Incident, Severity } from "../src/lib/types";

const RANGE_MAP: Record<string, string> = {
  "24h": "-24h", "7d": "-7d", "30d": "-30d",
};

const INCIDENT_CODES = "4673,4702,5379,4670,4688,4663,4690";

/** Group alerts by host and synthesise an incident when ≥2 alerts share a host. */
function synthesiseIncidents(rows: ReturnType<typeof rowToAlert>[]): Incident[] {
  const byHost: Record<string, typeof rows> = {};
  for (const a of rows) {
    (byHost[a.host] = byHost[a.host] ?? []).push(a);
  }

  const statuses = ["open", "investigating", "containment"] as const;
  let idx = 0;

  return Object.entries(byHost)
    .filter(([, alerts]) => alerts.length >= 2)
    .slice(0, 20)
    .map(([host, alerts]) => {
      const order: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
      const worstSev = alerts.reduce<Severity>(
        (acc, a) => (order[a.severity] > order[acc] ? a.severity : acc),
        "low",
      );
      const techniques = [...new Set(alerts.map(a => a.technique.id))].slice(0, 3);
      const risk = Math.min(99, alerts.length * 7 + (worstSev === "high" ? 25 : 8));

      return {
        id: `INC-${2048 + idx++}`,
        title: `Correlated privilege/persistence activity on ${host}`,
        severity: worstSev,
        status: statuses[idx % statuses.length],
        priority: (worstSev === "high" ? 1 : worstSev === "medium" ? 2 : 3) as 1 | 2 | 3 | 4,
        risk,
        assignee: "—",
        assets: [host],
        techniques,
        evidence: alerts.length,
        progress: Math.min(90, alerts.length * 5),
        createdAt: alerts[0].createdAt,
      } satisfies Incident;
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  const severity = String(req.query.severity ?? "all");
  const status   = String(req.query.status   ?? "all");
  const search   = String(req.query.search   ?? "");
  const page     = Math.max(1, Number(req.query.page     ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 25)));
  const range    = RANGE_MAP[String(req.query.range)] ?? "-7d";

  const config = getSplunkConfig();

  if (!config) {
    let all = getDemoIncidents();
    if (severity !== "all") all = all.filter(i => i.severity === severity);
    if (status   !== "all") all = all.filter(i => i.status   === status);
    if (search) {
      const q = search.toLowerCase();
      all = all.filter(i => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    }
    const total = all.length;
    const slice = all.slice((page - 1) * pageSize, page * pageSize);
    return res.status(200).json({ source: "demo", data: slice, total, page, pageSize, hasMore: page * pageSize < total });
  }

  try {
    const rows = await splunkSearch(
      `index=${config.index} sourcetype="${config.sourcetype}" EventCode IN (${INCIDENT_CODES}) | sort -_time`,
      config, range, "now", 500,
    );

    const alerts  = rows.map(rowToAlert);
    let incidents = synthesiseIncidents(alerts);

    if (severity !== "all") incidents = incidents.filter(i => i.severity === severity);
    if (status   !== "all") incidents = incidents.filter(i => i.status   === status);
    if (search) {
      const q = search.toLowerCase();
      incidents = incidents.filter(i => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    }

    const total = incidents.length;
    const slice = incidents.slice((page - 1) * pageSize, page * pageSize);
    return res.status(200).json({ source: "splunk", data: slice, total, page, pageSize, hasMore: page * pageSize < total });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ThreatLens/incidents] Splunk error:", message);
    const all   = getDemoIncidents();
    const total = all.length;
    const slice = all.slice((page - 1) * pageSize, page * pageSize);
    return res.status(200).json({ source: "demo", error: message, data: slice, total, page, pageSize, hasMore: page * pageSize < total });
  }
}
