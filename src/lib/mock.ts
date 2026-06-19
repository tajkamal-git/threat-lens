/**
 * ThreatLens — Synthetic Mock Data
 *
 * All data defined here is entirely fabricated for UI development and
 * portfolio demonstration purposes. No real organisations, individuals,
 * IP addresses, or security events are referenced.
 *
 * Architecture note:
 *   This module is the Phase 1 data source. Each export will be replaced
 *   by the corresponding server function in `lib/api/server.functions.ts`
 *   once the Splunk backend integration is complete. The exported shapes
 *   intentionally match the TypeScript interfaces in `lib/types.ts`.
 */

import type {
  Severity,
  Alert,
  Incident,
  LogEvent,
  Endpoint,
  Ioc,
  DetectionRule,
  Integration,
  AttackOrigin,
  MitreTechnique,
  SparkPoint,
  HourlyEventBucket,
  AttackCategoryBucket,
} from "./types";

// ─── Reference Data ───────────────────────────────────────────────────────────

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

const WINDOWS_EVENT_IDS = [4625, 4624, 4720, 4732, 4688, 4673, 1102, 5145, 4769, 4776];

/** Round-robin helper. */
function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

// ─── Attack Origins ───────────────────────────────────────────────────────────

export const COUNTRIES: AttackOrigin[] = [
  { code: "RU", name: "Russia",        attacks: 1284, lat: 60,  lng: 100  },
  { code: "CN", name: "China",         attacks: 982,  lat: 35,  lng: 105  },
  { code: "KP", name: "North Korea",   attacks: 612,  lat: 40,  lng: 127  },
  { code: "IR", name: "Iran",          attacks: 487,  lat: 32,  lng: 53   },
  { code: "BR", name: "Brazil",        attacks: 341,  lat: -14, lng: -51  },
  { code: "US", name: "United States", attacks: 295,  lat: 39,  lng: -97  },
  { code: "NG", name: "Nigeria",       attacks: 217,  lat: 9,   lng: 8    },
  { code: "IN", name: "India",         attacks: 188,  lat: 22,  lng: 79   },
  { code: "VN", name: "Vietnam",       attacks: 142,  lat: 16,  lng: 108  },
  { code: "RO", name: "Romania",       attacks: 119,  lat: 46,  lng: 25   },
];

// ─── MITRE ATT&CK ─────────────────────────────────────────────────────────────

/** Ordered tactic names matching the ATT&CK Enterprise matrix (v14). */
export const MITRE_TACTICS: string[] = [
  "Initial Access", "Execution", "Persistence", "Privilege Escalation",
  "Defense Evasion", "Credential Access", "Discovery", "Lateral Movement",
  "Collection", "Command & Control", "Exfiltration", "Impact",
];

/** Techniques detected in the current environment (representative sample). */
export const MITRE_TECHNIQUES: MitreTechnique[] = [
  { id: "T1078", name: "Valid Accounts",                     tactic: "Initial Access",       detections: 142 },
  { id: "T1110", name: "Brute Force",                        tactic: "Credential Access",    detections: 318 },
  { id: "T1059", name: "Command and Scripting Interpreter",  tactic: "Execution",            detections: 274 },
  { id: "T1053", name: "Scheduled Task/Job",                 tactic: "Persistence",          detections: 88  },
  { id: "T1547", name: "Boot or Logon Autostart Execution",  tactic: "Persistence",          detections: 47  },
  { id: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation", detections: 31 },
  { id: "T1003", name: "OS Credential Dumping",              tactic: "Credential Access",    detections: 22  },
  { id: "T1021", name: "Remote Services",                    tactic: "Lateral Movement",     detections: 64  },
  { id: "T1486", name: "Data Encrypted for Impact",          tactic: "Impact",               detections: 9   },
  { id: "T1071", name: "Application Layer Protocol",         tactic: "Command & Control",    detections: 156 },
  { id: "T1567", name: "Exfiltration Over Web Service",      tactic: "Exfiltration",         detections: 41  },
  { id: "T1027", name: "Obfuscated Files or Information",    tactic: "Defense Evasion",      detections: 73  },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────

const ALERT_TITLES = [
  "Possible Kerberoasting attempt detected",
  "Multiple failed logons followed by successful authentication",
  "PowerShell encoded command execution via Office macro",
  "Suspicious lsass.exe memory access by non-system process",
  "New scheduled task created by non-administrative account",
  "Outbound network traffic to known C2 domain",
  "Anomalous file write operation detected in System32",
  "Impossible travel alert for privileged user account",
  "Unsigned binary executed from temporary directory",
  "Cleartext credentials identified in command-line arguments",
];

export const ALERTS: Alert[] = Array.from({ length: 48 }, (_, i) => {
  const sev: Severity = (
    ["critical", "high", "high", "medium", "medium", "low", "info"] as Severity[]
  )[i % 7];
  const technique = MITRE_TECHNIQUES[i % MITRE_TECHNIQUES.length];

  return {
    id: `ALR-${(10240 + i).toString()}`,
    title: ALERT_TITLES[i % ALERT_TITLES.length],
    severity: sev,
    status: (["new", "triaged", "in_progress", "closed"] as const)[i % 4],
    host: pick(HOSTS, i),
    user: pick(USERS, i + 3),
    sourceIp: pick(IPS, i),
    technique: {
      id: technique.id,
      name: technique.name,
      tactic: technique.tactic,
    },
    confidence: 60 + ((i * 7) % 40),
    createdAt: new Date(Date.now() - i * 9 * 60 * 1000).toISOString(),
    assignee: pick(["j.morales", "a.patel", "k.nguyen", "—"], i),
  };
});

// ─── Incidents ────────────────────────────────────────────────────────────────

const INCIDENT_TITLES = [
  "Ransomware staging detected on finance endpoint",
  "Credential theft chain across 3 workstations",
  "Suspicious privilege escalation on domain controller",
  "Data exfiltration via cloud synchronisation application",
  "Phishing-driven session token hijack",
  "Insider exfiltration of HR records",
  "Beaconing to suspicious external infrastructure",
  "Misconfigured cloud storage bucket exposed customer data",
];

export const INCIDENTS: Incident[] = Array.from({ length: 14 }, (_, i) => {
  const sev: Severity = (
    ["critical", "high", "high", "medium", "low"] as Severity[]
  )[i % 5];

  return {
    id: `INC-${(2048 + i).toString()}`,
    title: INCIDENT_TITLES[i % INCIDENT_TITLES.length],
    severity: sev,
    status: (["open", "investigating", "containment", "resolved"] as const)[i % 4],
    priority: ((i % 4) + 1) as 1 | 2 | 3 | 4,
    risk: 30 + ((i * 13) % 70),
    assignee: pick(["j.morales", "a.patel", "k.nguyen", "s.okafor"], i),
    assets: [pick(HOSTS, i), pick(HOSTS, i + 2)],
    techniques: [
      MITRE_TECHNIQUES[i % MITRE_TECHNIQUES.length].id,
      MITRE_TECHNIQUES[(i + 3) % MITRE_TECHNIQUES.length].id,
    ],
    evidence: 4 + (i % 9),
    progress: 10 + ((i * 17) % 85),
    createdAt: new Date(Date.now() - i * 3_600_000 * 5).toISOString(),
  };
});

// ─── Live Event Logs ──────────────────────────────────────────────────────────

const LOG_MESSAGES = [
  "An account failed to log on. Logon Type: 3 (Network)",
  "Process created: powershell.exe -EncodedCommand <base64>",
  "Network connection initiated from suspicious process",
  "Successful logon to privileged account detected",
  "Outbound TLS connection to rare external destination",
  "File integrity hash changed in C:\\Windows\\System32",
  "User account added to local Administrators group",
  "Service binary installed by non-service account",
];

const LOG_SOURCES = [
  "WinEventLog:Security",
  "Sysmon",
  "Linux:auth",
  "Firewall:PaloAlto",
  "EDR:CrowdStrike",
];

export const LIVE_LOGS: LogEvent[] = Array.from({ length: 80 }, (_, i) => {
  const sev: Severity = (
    ["critical", "high", "medium", "low", "info", "info"] as Severity[]
  )[i % 6];

  return {
    id: i,
    timestamp: new Date(Date.now() - i * 7_000).toISOString(),
    host: pick(HOSTS, i),
    user: pick(USERS, i + 1),
    sourceIp: pick(IPS, i + 2),
    eventId: pick(WINDOWS_EVENT_IDS, i),
    severity: sev,
    source: pick(LOG_SOURCES, i),
    message: LOG_MESSAGES[i % LOG_MESSAGES.length],
  };
});

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const ENDPOINTS: Endpoint[] = Array.from({ length: 20 }, (_, i) => ({
  hostname: pick(HOSTS, i) + (i > 9 ? `-${i}` : ""),
  os: pick(["Windows 11 22H2", "Windows Server 2022", "Ubuntu 22.04 LTS", "macOS 14 Sonoma"], i),
  agent: pick(["healthy", "healthy", "healthy", "degraded", "offline"] as const, i),
  risk: (i * 17) % 100,
  lastSeen: new Date(Date.now() - i * 600_000).toISOString(),
  threats: i % 6,
}));

// ─── IOCs ─────────────────────────────────────────────────────────────────────

const IOC_VALUES = [
  "185.220.101.5",
  "auth-update-secure.com",
  "https://cdn.malware-host.ru/payload.bin",
  "9f2c4b6a8e1d3f5c7a9b0e2d4f6a8c1b3d5e7f9a0c2e4d6f8a1b3c5e7d9f2a4c6",
  "admin@phish-corp-it.com",
];

const IOC_SOURCES = [
  "AlienVault OTX", "Mandiant", "MISP", "Internal Hunt", "Recorded Future",
];

export const IOCS: Ioc[] = Array.from({ length: 18 }, (_, i) => ({
  id: `IOC-${9000 + i}`,
  type: (["ip", "domain", "url", "sha256", "email"] as const)[i % 5],
  value: IOC_VALUES[i % 5],
  confidence: 55 + ((i * 11) % 45),
  hits: (i * 7) % 60,
  source: pick(IOC_SOURCES, i),
  firstSeen: new Date(Date.now() - i * 86_400_000).toISOString(),
}));

// ─── Detection Rules ──────────────────────────────────────────────────────────

const RULE_NAMES = [
  "Mimikatz Command Line Pattern",
  "Suspicious WMI Subscription Created",
  "DCSync Privileged Replication Detected",
  "Encoded PowerShell Launched from Office",
  "Brute Force Authentication — Multiple Failures",
  "Cloud Storage Key Exfiltration Attempt",
  "Anomalous Service Binary Installation",
  "C2 Beacon Periodicity Pattern Detected",
];

const RULE_CATEGORIES = [
  "Credential Access", "Execution", "Command & Control",
  "Persistence", "Lateral Movement",
];

export const RULES: DetectionRule[] = Array.from({ length: 16 }, (_, i) => ({
  id: `RULE-${500 + i}`,
  name: RULE_NAMES[i % RULE_NAMES.length],
  enabled: i % 5 !== 0,
  severity: (["critical", "high", "medium", "low"] as Severity[])[i % 4],
  category: pick(RULE_CATEGORIES, i),
  technique: MITRE_TECHNIQUES[i % MITRE_TECHNIQUES.length].id,
  fires: (i * 23) % 400,
  fp: i % 7,
}));

// ─── Integrations ─────────────────────────────────────────────────────────────

export const INTEGRATIONS: Integration[] = [
  { name: "Splunk Enterprise",   category: "SIEM",               status: "connected",    events: "1.2B/day"  },
  { name: "Microsoft Sysmon",    category: "Endpoint Telemetry", status: "connected",    events: "320M/day"  },
  { name: "Windows Event Logs",  category: "Operating System",   status: "connected",    events: "780M/day"  },
  { name: "Linux auditd",        category: "Operating System",   status: "connected",    events: "110M/day"  },
  { name: "Palo Alto Firewall",  category: "Network",            status: "connected",    events: "92M/day"   },
  { name: "CrowdStrike Falcon",  category: "EDR",                status: "connected",    events: "44M/day"   },
  { name: "AWS CloudTrail",      category: "Cloud",              status: "connected",    events: "18M/day"   },
  { name: "Azure Active Directory", category: "Identity",        status: "connected",    events: "9M/day"    },
  { name: "MISP",                category: "Threat Intel",       status: "connected",    events: "—"         },
  { name: "Okta",                category: "Identity",           status: "disconnected", events: "—"         },
  { name: "GitHub Audit Logs",   category: "DevOps",             status: "available",    events: "—"         },
  { name: "Zscaler Internet Access", category: "Network",        status: "available",    events: "—"         },
];

// ─── Chart / Dashboard Data ───────────────────────────────────────────────────

/**
 * Generate a spark-line dataset for a KPI card.
 * Seeds determinism from the card index so every card gets a unique shape.
 */
export function KPI_SPARK(seed: number): SparkPoint[] {
  return Array.from({ length: 24 }, (_, i) => ({
    x: i,
    y: Math.round(40 + 30 * Math.sin(i / 2 + seed) + ((i * (seed + 3)) % 17)),
  }));
}

/** 24-hour event volume bucketed by severity. */
export const HOURLY_EVENTS: HourlyEventBucket[] = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  critical: Math.round(2 + 6 * Math.sin(i / 3)       + (i % 4)),
  high:     Math.round(8 + 12 * Math.sin(i / 2 + 1)  + (i % 5)),
  medium:   Math.round(20 + 18 * Math.sin(i / 4 + 2) + (i % 7)),
  low:      Math.round(40 + 25 * Math.sin(i / 5 + 3) + (i % 11)),
}));

/** Distribution of attacks by MITRE tactic category. */
export const ATTACK_CATEGORIES: AttackCategoryBucket[] = [
  { name: "Credential Access", value: 318 },
  { name: "Execution",         value: 274 },
  { name: "C2",                value: 156 },
  { name: "Persistence",       value: 135 },
  { name: "Defense Evasion",   value: 73  },
  { name: "Lateral Movement",  value: 64  },
  { name: "Exfiltration",      value: 41  },
  { name: "Impact",            value: 9   },
];

// Re-export Severity type for backward compatibility
export type { Severity };
