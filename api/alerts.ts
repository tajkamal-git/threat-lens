/**
 * GET /api/alerts
 * Calibrated for: index=main sourcetype=WinEventLog:Security
 *
 * Alert EventCodes (confirmed in environment):
 *   HIGH   → 4673, 4702, 5379, 4670
 *   MEDIUM → 4688, 4663, 4656, 4690, 5152
 *   LOW    → 4624, 4627, 4689, 4658, 5156, 5158
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSplunkConfig, splunkSearch } from "./_lib/splunk-client";
import { rowToAlert, eventCodeToSeverity } from "./_lib/normalizers";
import { getDemoAlerts } from "./_lib/demo-data";
import type { Alert } from "../src/lib/types";

const RANGE_MAP: Record<string, string> = {
  "1h": "-1h", "6h": "-6h", "24h": "-24h", "7d": "-7d",
};

// EventCodes grouped by severity for Splunk-side pre-filtering
const SEVERITY_CODES: Record<string, string> = {
  high:   "4673,4702,5379,4670,4625,4720,4732,4728,1102,4771",
  medium: "4688,4663,4656,4690,5152,4669,5145",
  low:    "4624,4627,4689,4658,5156,5158,5447,4703",
};

function applyFilters(alerts: Alert[], severity: string, status: string, search: string): Alert[] {
  let out = alerts;
  if (severity !== "all") out = out.filter(a => a.severity === severity);
  if (status   !== "all") out = out.filter(a => a.status   === status);
  if (search) {
    const q = search.toLowerCase();
    out = out.filter(a =>
      a.title.toLowerCase().includes(q) || a.host.toLowerCase().includes(q) ||
      a.user.toLowerCase().includes(q)  || a.technique.id.toLowerCase().includes(q),
    );
  }
  return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  const severity = String(req.query.severity ?? "all");
  const status   = String(req.query.status   ?? "all");
  const search   = String(req.query.search   ?? "");
  const page     = Math.max(1, Number(req.query.page     ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 25)));
  const range    = RANGE_MAP[String(req.query.range)] ?? "-24h";

  const config = getSplunkConfig();

  if (!config) {
    const all   = applyFilters(getDemoAlerts(), severity, status, search);
    const total = all.length;
    const slice = all.slice((page - 1) * pageSize, page * pageSize);
    return res.status(200).json({ source: "demo", data: slice, total, page, pageSize, hasMore: page * pageSize < total });
  }

  try {
    const idx = config.index;
    const st  = config.sourcetype;

    // Build EventCode filter based on requested severity
    let codeFilter: string;
    if (severity !== "all" && SEVERITY_CODES[severity]) {
      codeFilter = `EventCode IN (${SEVERITY_CODES[severity]})`;
    } else {
      // All alert-worthy codes
      const all = Object.values(SEVERITY_CODES).join(",");
      codeFilter = `EventCode IN (${all})`;
    }

    const spl  = `index=${idx} sourcetype="${st}" ${codeFilter} | sort -_time`;
    const rows = await splunkSearch(spl, config, range, "now", 500);
    const alerts  = rows.map(rowToAlert);
    const filtered = applyFilters(alerts, severity, status, search);
    const total   = filtered.length;
    const slice   = filtered.slice((page - 1) * pageSize, page * pageSize);

    return res.status(200).json({ source: "splunk", data: slice, total, page, pageSize, hasMore: page * pageSize < total });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ThreatLens/alerts] Splunk error:", message);
    const all   = applyFilters(getDemoAlerts(), severity, status, search);
    const total = all.length;
    const slice = all.slice((page - 1) * pageSize, page * pageSize);
    return res.status(200).json({ source: "demo", error: message, data: slice, total, page, pageSize, hasMore: page * pageSize < total });
  }
}
