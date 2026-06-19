/**
 * ThreatLens — Demo / Fallback Data
 *
 * Returned by all API endpoints when SPLUNK_BASE_URL is not configured.
 * Allows the platform to run as a fully-functional portfolio demo without
 * a live Splunk instance.
 *
 * Data shape is identical to what the Splunk-backed endpoints return,
 * so the frontend hooks and components need no conditional logic.
 *
 * NOTE: All values are synthetic. No real organisations, individuals,
 * IP addresses, or security events are referenced.
 */

import type {
  Alert,
  Incident,
  LogEvent,
  Endpoint,
  HourlyEventBucket,
  AttackCategoryBucket,
} from "../../src/lib/types";

// ─── Reference pools ──────────────────────────────────────────────────────────

const HOSTS = [
  "WIN-DC01", "WIN-DC02", "FIN-WS-0421", "HR-LT-0188", "ENG-WS-1132",
  "SRV-APP-03", "SRV-DB-PROD-02", "MAC-DEV-0091", "K8S-NODE-07", "VPN-GW-01",
];

const USERS = [
  "j.morales", "a.patel", "svc_backup", "k.nguyen", "admin_temp",
  "s.okafor", "r.thompson", "d.fischer", "svc_jenkins", "guest_audit",
];

const IPS = [
  "10.14.3.42", "172.16.88.21", "192.168.4.190", "10.0.7.55", "10.14.1.7",
  "203.0.113.42", "198.51.100.16", "185.220.101.5", "94.140.14.14", "45.83.193.150",
];

const SOURCES = [
  "WinEventLog:Security", "Sysmon", "Linux:auth",
  "Firewall:PaloAlto", "EDR:CrowdStrike",
];

const ALERT_TITLES = [
  "Possible Kerberoasting attempt detected on domain controller",
  "Multiple failed logons followed by successful authentication",
  "PowerShell encoded command execution via Office macro",
  "Suspicious lsass.exe memory access by non-system process",
  "New scheduled task created by non-administrative account",
  "Outbound network traffic to known C2 infrastructure",
  "Anomalous file write in System32 by user-space process",
  "Impossible travel alert for privileged user account",
  "Unsigned binary executed from user temporary directory",
  "Cleartext credentials in command-line arguments detected",
];

const INCIDENT_TITLES = [
  "Ransomware staging detected on finance endpoint cluster",
  "Credential theft chain across three workstations",
  "Suspicious privilege escalation on domain controller",
  "Data exfiltration via cloud synchronisation application",
  "Phishing-driven session token hijack — HR systems",
];

const EVENT_MESSAGES = [
  "An account failed to log on. Logon Type: 3 (Network).",
  "Process created: powershell.exe -EncodedCommand <base64>",
  "Network connection initiated from lsass.exe — unusual destination",
  "Successful logon to privileged account detected from new source IP",
  "Outbound TLS to rare external destination from svchost.exe",
  "File integrity hash changed in C:\\Windows\\System32\\",
  "User account added to local Administrators group",
  "Service binary installed outside standard software management",
];

function pick<T>(arr: T[], i: number): T {
  return arr[Math.abs(i) % arr.length];
}

// ─── Demo alerts ──────────────────────────────────────────────────────────────

export function getDemoAlerts(): Alert[] {
  const severities = ["critical", "high", "high", "medium", "medium", "low"] as const;
  const statuses = ["new", "triaged", "in_progress", "closed"] as const;
  const mitre = [
    { id: "T1110",     name: "Brute Force",                       tactic: "Credential Access"    },
    { id: "T1059",     name: "Command and Scripting Interpreter",  tactic: "Execution"            },
    { id: "T1053.005", name: "Scheduled Task",                     tactic: "Persistence"          },
    { id: "T1098",     name: "Account Manipulation",               tactic: "Privilege Escalation" },
    { id: "T1543.003", name: "Windows Service",                    tactic: "Persistence"          },
    { id: "T1078",     name: "Valid Accounts",                     tactic: "Initial Access"       },
    { id: "T1003",     name: "OS Credential Dumping",              tactic: "Credential Access"    },
    { id: "T1021.002", name: "SMB / Admin Shares",                 tactic: "Lateral Movement"     },
  ];

  return Array.from({ length: 48 }, (_, i) => ({
    id: `ALR-${10240 + i}`,
    title: pick(ALERT_TITLES, i),
    severity: pick(severities, i),
    status: pick(statuses, i),
    host: pick(HOSTS, i),
    user: pick(USERS, i + 3),
    sourceIp: pick(IPS, i),
    technique: pick(mitre, i),
    confidence: 60 + ((i * 7) % 40),
    createdAt: new Date(Date.now() - i * 9 * 60_000).toISOString(),
    assignee: pick(["j.morales", "a.patel", "k.nguyen", "—"], i),
  }));
}

// ─── Demo incidents ───────────────────────────────────────────────────────────

export function getDemoIncidents(): Incident[] {
  const severities = ["critical", "high", "high", "medium", "low"] as const;
  const statuses = ["open", "investigating", "containment", "resolved"] as const;

  return Array.from({ length: 14 }, (_, i) => ({
    id: `INC-${2048 + i}`,
    title: pick(INCIDENT_TITLES, i),
    severity: pick(severities, i),
    status: pick(statuses, i),
    priority: ((i % 4) + 1) as 1 | 2 | 3 | 4,
    risk: 30 + ((i * 13) % 70),
    assignee: pick(["j.morales", "a.patel", "k.nguyen", "s.okafor"], i),
    assets: [pick(HOSTS, i), pick(HOSTS, i + 2)],
    techniques: [`T${1110 + i}`, `T${1059 + i}`],
    evidence: 4 + (i % 9),
    progress: 10 + ((i * 17) % 85),
    createdAt: new Date(Date.now() - i * 3_600_000 * 5).toISOString(),
  }));
}

// ─── Demo live log events ─────────────────────────────────────────────────────

export function getDemoEvents(limit = 50): LogEvent[] {
  const severities = ["critical", "high", "medium", "low", "info", "info"] as const;
  const eventIds = [4625, 4624, 4720, 4732, 4688, 4673, 1102, 5145, 4769, 4776];

  return Array.from({ length: Math.min(limit, 80) }, (_, i) => ({
    id: i,
    timestamp: new Date(Date.now() - i * 7_000).toISOString(),
    host: pick(HOSTS, i),
    user: pick(USERS, i + 1),
    sourceIp: pick(IPS, i + 2),
    eventId: pick(eventIds, i),
    severity: pick(severities, i),
    source: pick(SOURCES, i),
    message: pick(EVENT_MESSAGES, i),
  }));
}

// ─── Demo endpoints ───────────────────────────────────────────────────────────

export function getDemoEndpoints(): Endpoint[] {
  const oses = [
    "Windows 11 22H2", "Windows Server 2022",
    "Ubuntu 22.04 LTS", "macOS 14 Sonoma",
  ];
  const agentStatuses = ["healthy", "healthy", "healthy", "degraded", "offline"] as const;

  return Array.from({ length: 20 }, (_, i) => ({
    hostname: HOSTS[i % HOSTS.length] + (i >= HOSTS.length ? `-${i}` : ""),
    os: pick(oses, i),
    agent: pick(agentStatuses, i),
    risk: (i * 17) % 100,
    lastSeen: new Date(Date.now() - i * 600_000).toISOString(),
    threats: i % 6,
  }));
}

// ─── Demo chart data ──────────────────────────────────────────────────────────

export function getDemoHourlyEvents(): HourlyEventBucket[] {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    critical: Math.round(2 + 6  * Math.sin(i / 3) + (i % 4)),
    high:     Math.round(8 + 12 * Math.sin(i / 2 + 1) + (i % 5)),
    medium:   Math.round(20 + 18 * Math.sin(i / 4 + 2) + (i % 7)),
    low:      Math.round(40 + 25 * Math.sin(i / 5 + 3) + (i % 11)),
  }));
}

export function getDemoAttackCategories(): AttackCategoryBucket[] {
  return [
    { name: "Credential Access", value: 318 },
    { name: "Execution",         value: 274 },
    { name: "C2",                value: 156 },
    { name: "Persistence",       value: 135 },
    { name: "Defense Evasion",   value:  73 },
    { name: "Lateral Movement",  value:  64 },
    { name: "Exfiltration",      value:  41 },
    { name: "Impact",            value:   9 },
  ];
}

// ─── Demo dashboard KPIs ──────────────────────────────────────────────────────

export function getDemoKpis() {
  return {
    criticalAlerts:  12,
    highAlerts:      47,
    mediumAlerts:   184,
    lowAlerts:      612,
    activeIncidents:  9,
    ingestRateEps: 142_340,
    activeEndpoints: 18_472,
    onlineUsers:    9_214,
    rulesLoaded:    1_284,
    iocMatches:       73,
    threatScore:      78,
    aiConfidence:     92,
  };
}
