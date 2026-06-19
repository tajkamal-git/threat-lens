/**
 * GET /api/health
 *
 * Returns ThreatLens platform status and Splunk connectivity.
 * Used by the topbar status indicator and the integrations page.
 *
 * Response shape:
 *   { status, mode, splunk, timestamp }
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSplunkConfig, splunkPing } from "./_lib/splunk-client";

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader("Cache-Control", "no-store");

  const config = getSplunkConfig();

  if (!config) {
    return res.status(200).json({
      status: "demo",
      mode: "demo",
      message:
        "Splunk not configured — SPLUNK_BASE_URL missing. " +
        "Running in demo mode with synthetic data.",
      splunk: { reachable: false, version: "", serverName: "" },
      timestamp: new Date().toISOString(),
    });
  }

  const ping = await splunkPing(config);

  return res.status(200).json({
    status: ping.reachable ? "connected" : "error",
    mode: "splunk",
    splunk: ping,
    timestamp: new Date().toISOString(),
  });
}
