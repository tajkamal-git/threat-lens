/**
 * ThreatLens — Splunk Result Normalizers
 *
 * SERVER-SIDE ONLY. Converts raw Splunk result rows into typed ThreatLens objects.
 *
 * Calibrated for environment:
 *   index=main  sourcetype=WinEventLog:Security
 *
 * Confirmed EventCodes present:
 *   4673 (24604) · 4658 (21762) · 4656 (11317) · 4690 (10476)
 *   4663 (7365)  · 5158 (5869)  · 5447 (5596)  · 5156 (5299)
 *   4688 (1599)  · 4689 (1321)  · 5152 (535)   · 4670 (440)
 *   4702 (161)   · 4624 (135)   · 4627 (135)   · 5379 (198)
 */

import type { Alert, LogEvent, Severity } from "../../src/lib/types";
import type { SplunkRow } from "./splunk-client";

// ─── Field helpers ────────────────────────────────────────────────────────────

function pick(row: SplunkRow, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v && v.trim() !== "" && v !== "N/A" && v !== "-") return v.trim();
  }
  return "";
}

function parseTime(raw: string): string {
  if (!raw) return new Date().toISOString();
  if (/^\d{10}(\.\d+)?$/.test(raw)) {
    return new Date(parseFloat(raw) * 1000).toISOString();
  }
  return new Date(raw).toISOString();
}

// ─── Severity mapping ─────────────────────────────────────────────────────────
// Based on confirmed EventCodes in index=main sourcetype=WinEventLog:Security

export function eventCodeToSeverity(eventCode: string | number): Severity {
  const code = Number(eventCode);

  // High — direct threat indicators confirmed in this environment
  if ([
    4673,   // Sensitive Privilege Use — priv escalation / abuse
    4702,   // Scheduled Task Updated — persistence mechanism
    5379,   // Credential Manager Credentials Read — credential theft
    4670,   // Permissions on Object Changed — ACL manipulation
    // Not yet seen but critical if they appear:
    4625, 4720, 4732, 4728, 1102, 4771, 4697, 7045,
  ].includes(code)) return "high";

  // Medium — execution and access monitoring
  if ([
    4688,   // Process Created — execution telemetry
    4663,   // Attempt to Access Object — file/registry access
    5152,   // Network Packet Blocked — firewall block
    4656,   // Handle to Object Requested — object auditing
    4690,   // Attempt to Duplicate Handle — potential handle theft
    // Not yet seen:
    4769, 5145,
  ].includes(code)) return "medium";

  // Low — high-volume operational events
  return "low";
}

// ─── MITRE mapping ────────────────────────────────────────────────────────────
// Mapped to actual EventCodes confirmed in environment

export function eventCodeToMitre(code: string | number): {
  id: string; name: string; tactic: string;
} {
  const n = Number(code);
  const map: Record<number, { id: string; name: string; tactic: string }> = {
    4673: { id: "T1134",     name: "Access Token Manipulation",            tactic: "Privilege Escalation" },
    4702: { id: "T1053.005", name: "Scheduled Task",                       tactic: "Persistence"          },
    5379: { id: "T1555.004", name: "Windows Credential Manager",           tactic: "Credential Access"    },
    4670: { id: "T1222.001", name: "Windows File and Directory Permissions",tactic: "Defense Evasion"      },
    4688: { id: "T1059",     name: "Command and Scripting Interpreter",    tactic: "Execution"            },
    4663: { id: "T1083",     name: "File and Directory Discovery",         tactic: "Discovery"            },
    4656: { id: "T1083",     name: "File and Directory Discovery",         tactic: "Discovery"            },
    4690: { id: "T1134",     name: "Access Token Manipulation",            tactic: "Privilege Escalation" },
    5152: { id: "T1562.004", name: "Disable or Modify System Firewall",    tactic: "Defense Evasion"      },
    4624: { id: "T1078",     name: "Valid Accounts",                       tactic: "Initial Access"       },
    4627: { id: "T1078",     name: "Valid Accounts",                       tactic: "Initial Access"       },
    // Reserve mappings for when these events appear:
    4625: { id: "T1110",     name: "Brute Force",                          tactic: "Credential Access"    },
    4720: { id: "T1136",     name: "Create Account",                       tactic: "Persistence"          },
    4732: { id: "T1098",     name: "Account Manipulation",                 tactic: "Privilege Escalation" },
    4697: { id: "T1543.003", name: "Windows Service",                      tactic: "Persistence"          },
    1102: { id: "T1070.001", name: "Clear Windows Event Logs",             tactic: "Defense Evasion"      },
  };
  return map[n] ?? { id: "T1078", name: "Valid Accounts", tactic: "Initial Access" };
}

// ─── Alert title derivation ───────────────────────────────────────────────────

function deriveAlertTitle(code: string | number, row: SplunkRow): string {
  const n = Number(code);
  const subjectUser  = pick(row, "SubjectUserName", "Account_Name", "user") || "unknown";
  const targetUser   = pick(row, "TargetUserName", "user") || subjectUser;
  const host         = pick(row, "host", "Computer", "ComputerName") || "unknown-host";
  const privilege    = pick(row, "PrivilegeList", "Privileges").split("\n")[0]?.trim() || "elevated privilege";
  const process      = pick(row, "NewProcessName", "ProcessName", "Application").split("\\").pop() || "unknown.exe";
  const taskName     = pick(row, "TaskName", "SubjectUserName") || "unknown task";
  const objectName   = pick(row, "ObjectName", "FileName").split("\\").pop() || "object";

  const titles: Record<number, string> = {
    4673: `Sensitive privilege use by ${subjectUser} on ${host} — ${privilege}`,
    4702: `Scheduled task modified: ${taskName} on ${host} by ${subjectUser}`,
    5379: `Credential Manager credentials read by ${targetUser} on ${host}`,
    4670: `ACL permissions changed on ${objectName} by ${subjectUser} on ${host}`,
    4688: `Process created: ${process} on ${host} by ${subjectUser}`,
    4663: `Object access attempt on ${objectName} by ${subjectUser} on ${host}`,
    4656: `Handle requested to ${objectName} by ${subjectUser} on ${host}`,
    4690: `Handle duplication attempt by ${subjectUser} on ${host}`,
    5152: `Network packet blocked on ${host}`,
    4624: `Successful logon by ${targetUser} on ${host}`,
    4625: `Failed logon attempt for ${targetUser} on ${host}`,
    4720: `New user account created: ${targetUser} on ${host}`,
    4732: `User added to privileged group on ${host} by ${subjectUser}`,
    1102: `Security audit log cleared on ${host} by ${subjectUser}`,
  };
  return (
    titles[n] ?? `Windows security event ${n} on ${host} by ${subjectUser}`
  );
}

function deriveConfidence(code: string | number): number {
  const sev = eventCodeToSeverity(code);
  return sev === "high" ? 82 : sev === "medium" ? 60 : 40;
}

// ─── Public normalizers ───────────────────────────────────────────────────────

let alertCounter = 10_000;

export function rowToAlert(row: SplunkRow): Alert {
  const eventCode = pick(row, "EventCode", "event_id", "EventID");
  return {
    id: `ALR-${alertCounter++}`,
    title: deriveAlertTitle(eventCode, row),
    severity: eventCodeToSeverity(eventCode),
    status: "new",
    host:     pick(row, "host", "Computer", "ComputerName")                             || "unknown-host",
    user:     pick(row, "SubjectUserName", "Account_Name", "TargetUserName", "user")    || "SYSTEM",
    sourceIp: pick(row, "IpAddress", "src_ip", "Source_Network_Address", "SubjectLogonId") || "—",
    technique: eventCodeToMitre(eventCode),
    confidence: deriveConfidence(eventCode),
    createdAt: parseTime(pick(row, "_time")),
    assignee: "—",
  };
}

export function rowToLogEvent(row: SplunkRow, index: number): LogEvent {
  const eventCode = pick(row, "EventCode", "event_id", "EventID");
  const rawMsg    = pick(row, "Message", "message");
  return {
    id:        index,
    timestamp: parseTime(pick(row, "_time")),
    host:      pick(row, "host", "Computer", "ComputerName")                          || "unknown-host",
    user:      pick(row, "SubjectUserName", "Account_Name", "TargetUserName", "user") || "SYSTEM",
    sourceIp:  pick(row, "IpAddress", "src_ip", "Source_Network_Address")             || "—",
    eventId:   Number(eventCode) || 0,
    severity:  eventCodeToSeverity(eventCode),
    source:    pick(row, "sourcetype", "source")                                      || "WinEventLog:Security",
    message:   rawMsg ? rawMsg.split("\n")[0].trim().slice(0, 200) : `Event ${eventCode}`,
  };
}

// ─── KPI aggregation ──────────────────────────────────────────────────────────

export interface SplunkKpiCounts {
  total: number; critical: number; high: number; medium: number; low: number;
}

export function rowsToKpiCounts(rows: SplunkRow[]): SplunkKpiCounts {
  const out: SplunkKpiCounts = { total: rows.length, critical: 0, high: 0, medium: 0, low: 0 };
  for (const row of rows) {
    const sev = eventCodeToSeverity(pick(row, "EventCode", "event_id"));
    // Treat "high" as our top severity since no critical codes present yet
    if (sev === "high") out.critical++;
    else out[sev]++;
  }
  return out;
}

export function rowsToHourlyBuckets(rows: SplunkRow[]) {
  const buckets: Record<string, { critical: number; high: number; medium: number; low: number }> = {};
  for (let h = 0; h < 24; h++) {
    buckets[`${String(h).padStart(2, "0")}:00`] = { critical: 0, high: 0, medium: 0, low: 0 };
  }
  for (const row of rows) {
    const t    = parseTime(pick(row, "_time"));
    const hour = `${String(new Date(t).getHours()).padStart(2, "0")}:00`;
    const sev  = eventCodeToSeverity(pick(row, "EventCode", "event_id"));
    if (!buckets[hour]) buckets[hour] = { critical: 0, high: 0, medium: 0, low: 0 };
    if (sev === "high") buckets[hour].critical++;
    else buckets[hour][sev]++;
  }
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, counts]) => ({ hour, ...counts }));
}
