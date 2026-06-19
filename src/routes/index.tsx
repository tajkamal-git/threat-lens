import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity, ShieldAlert, ShieldCheck, BellRing, Users, Server, Brain,
  Database, Cpu, Wifi, Bug, FileWarning, Radar, Filter, Download,
  ArrowRight, Zap, RefreshCw, WifiOff,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard, PageHeader, SeverityBadge, formatTime } from "@/components/shared";
import { useDashboard } from "@/hooks/use-dashboard";
import { useLiveFeed } from "@/hooks/use-events";
import { COUNTRIES, MITRE_TACTICS, KPI_SPARK } from "@/lib/mock";

export const Route = createFileRoute("/")({ component: Dashboard });

const CHART_COLORS = [
  "oklch(0.72 0.16 200)", "oklch(0.70 0.18 150)", "oklch(0.75 0.18 80)",
  "oklch(0.65 0.22 30)",  "oklch(0.65 0.20 320)", "oklch(0.62 0.24 18)",
  "oklch(0.78 0.17 85)",  "oklch(0.70 0.14 240)",
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function ThreatScoreGauge({ score }: { score: number }) {
  const data = [{ name: "score", value: score, fill: "url(#scoreGrad)" }];
  return (
    <div className="relative h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={220} endAngle={-40}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="oklch(0.62 0.24 18)" />
              <stop offset="60%"  stopColor="oklch(0.78 0.17 85)" />
              <stop offset="100%" stopColor="oklch(0.70 0.18 150)" />
            </linearGradient>
          </defs>
          <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "oklch(0.26 0.02 250)" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Threat Score</div>
        <div className="mt-1 font-mono text-5xl font-bold text-gradient-brand">{score}</div>
        <div className="mt-1 text-xs text-muted-foreground">Elevated · trending ↑</div>
      </div>
    </div>
  );
}

function WorldMap({ onSelect, selected }: { onSelect: (c: string | null) => void; selected: string | null }) {
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-lg border border-border/60 bg-gradient-to-br from-[oklch(0.18_0.03_250)] to-[oklch(0.14_0.04_250)] grid-bg">
      <svg viewBox="0 0 1000 500" className="absolute inset-0 h-full w-full opacity-30">
        <path d="M150 180 Q220 140 290 165 T420 175 L430 230 Q360 260 280 240 T160 250 Z" fill="oklch(0.30 0.03 250)" />
        <path d="M450 130 Q540 110 620 140 T780 150 L790 220 Q700 245 600 235 T460 215 Z" fill="oklch(0.30 0.03 250)" />
        <path d="M460 270 Q520 285 560 320 L540 380 Q500 395 470 370 Z" fill="oklch(0.30 0.03 250)" />
        <path d="M210 290 Q260 305 290 350 L270 400 Q230 410 205 380 Z" fill="oklch(0.30 0.03 250)" />
        <path d="M780 320 Q830 330 860 360 L840 400 Q810 405 785 380 Z" fill="oklch(0.30 0.03 250)" />
      </svg>
      {COUNTRIES.map((c) => {
        const x = ((c.lng + 180) / 360) * 100;
        const y = ((90 - c.lat) / 180) * 100;
        const size = Math.max(8, Math.min(28, c.attacks / 60));
        const isSel = selected === c.code;
        return (
          <button key={c.code} onClick={() => onSelect(isSel ? null : c.code)}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}>
            <span className="absolute inset-0 -m-1 rounded-full bg-[oklch(0.62_0.24_18)] animate-ping-soft" style={{ width: size, height: size }} />
            <span className="relative block rounded-full border border-[oklch(0.82_0.20_25)] bg-[oklch(0.62_0.24_18_/_60%)] shadow-[0_0_14px_oklch(0.62_0.24_18_/_60%)]" style={{ width: size, height: size }} />
            <span className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded border border-border/60 bg-background/90 px-1.5 py-0.5 text-[10px] font-mono backdrop-blur transition-opacity ${isSel ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              {c.name} · {c.attacks}
            </span>
          </button>
        );
      })}
      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md border border-border/60 bg-background/70 px-2 py-1 text-[11px] backdrop-blur">
        <Radar className="h-3.5 w-3.5 text-primary" /><span className="font-medium">Live attack origins</span><span className="text-muted-foreground">· last 1h</span>
      </div>
    </div>
  );
}

function AttackTimeline() {
  const stages = [
    { label: "Initial Access",          count: 142, sev: "low"      as const, time: "08:14:22" },
    { label: "Credential Access",       count: 87,  sev: "medium"   as const, time: "08:31:05" },
    { label: "Privilege Escalation",    count: 34,  sev: "high"     as const, time: "08:46:11" },
    { label: "Lateral Movement",        count: 18,  sev: "high"     as const, time: "09:02:48" },
    { label: "Defense Evasion",         count: 12,  sev: "high"     as const, time: "09:11:30" },
    { label: "Impact (Ransomware)",     count: 3,   sev: "critical" as const, time: "09:18:02" },
  ];
  return (
    <div className="relative">
      <div className="absolute left-0 right-0 top-5 h-px bg-gradient-to-r from-[oklch(0.72_0.15_200_/_30%)] via-[oklch(0.78_0.17_85_/_50%)] to-[oklch(0.62_0.24_18_/_70%)]" />
      <div className="relative grid grid-cols-6 gap-2">
        {stages.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center text-center">
            <div className={`grid h-10 w-10 place-items-center rounded-full border-2 bg-background ${s.sev === "critical" ? "border-[oklch(0.62_0.24_18)] animate-pulse-ring" : s.sev === "high" ? "border-[oklch(0.70_0.20_40)]" : s.sev === "medium" ? "border-[oklch(0.78_0.17_85)]" : "border-[oklch(0.72_0.15_200)]"}`}>
              <span className="font-mono text-xs font-bold">{i + 1}</span>
            </div>
            <div className="mt-2 text-[11px] font-medium leading-tight">{s.label}</div>
            <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{s.time}</div>
            <Badge variant="outline" className="mt-1 font-mono text-[10px]">{s.count}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Live Feed (uses real API) ────────────────────────────────────────────────

function LiveFeed() {
  const [paused, setPaused] = React.useState(false);
  const { data, isFetching } = useLiveFeed(paused);
  const events = data?.data ?? [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {data?.source === "splunk" ? (
            <Badge variant="outline" className="border-[oklch(0.70_0.18_150_/_40%)] bg-[oklch(0.70_0.18_150_/_10%)] text-[oklch(0.80_0.18_150)] text-[10px]">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-[oklch(0.70_0.18_150)] inline-block animate-pulse" />Splunk Live
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">Demo data</Badge>
          )}
          {isFetching && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
        </div>
        <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setPaused((p) => !p)}>
          {paused ? "Resume" : "Pause"}
        </Button>
      </div>
      <ScrollArea className="h-[380px]">
        <div className="space-y-2 pr-2">
          {events.length === 0
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))
            : events.map((e) => (
              <div key={`${e.id}-${e.timestamp}`} className="group rounded-md border border-border/50 bg-card/60 p-2.5 transition-all hover:border-primary/40 hover:bg-card animate-in fade-in slide-in-from-top-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <SeverityBadge severity={e.severity} />
                    <span className="font-mono text-[10px] text-muted-foreground">{formatTime(e.timestamp)}</span>
                    <span className="font-mono text-[10px] text-primary">EID {e.eventId}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100">
                    Investigate <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <div className="mt-1.5 text-xs font-medium">{e.message}</div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-mono text-muted-foreground">
                  <span><Server className="mr-1 inline h-2.5 w-2.5" />{e.host}</span>
                  <span><Users className="mr-1 inline h-2.5 w-2.5" />{e.user}</span>
                  <span><Wifi className="mr-1 inline h-2.5 w-2.5" />{e.sourceIp}</span>
                  <span className="text-primary/70">{e.source}</span>
                </div>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function AiSummaryPanel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-primary to-chart-2 text-primary-foreground">
          <Brain className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">AI Investigation Summary</div>
          <div className="text-[11px] text-muted-foreground">Generated · 2 min ago · GPT-Sec v4.2</div>
        </div>
        <Badge className="ml-auto bg-[oklch(0.70_0.18_150_/_15%)] text-[oklch(0.80_0.18_150)] border border-[oklch(0.70_0.18_150_/_40%)]">92% confidence</Badge>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">
        A coordinated <span className="font-semibold text-[oklch(0.85_0.18_55)]">credential access campaign</span> originating from{" "}
        <span className="font-mono text-primary">185.220.101.5 (RU)</span> targeted 14 privileged accounts.
        Three accounts on <span className="font-mono">WIN-DC01</span> show successful authentication followed by
        Kerberos ticket extraction, consistent with <span className="font-semibold">T1003.006 — DCSync</span>.
        Recommend isolating the affected DC and rotating krbtgt twice.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {["T1110 Brute Force", "T1078 Valid Accounts", "T1003 OS Credential Dumping", "T1021 Remote Services"].map((t) => (
          <div key={t} className="rounded-md border border-border/60 bg-muted/30 px-2 py-1.5 text-[11px] font-mono">{t}</div>
        ))}
      </div>
      <Separator />
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recommended actions</div>
        {[
          "Isolate WIN-DC01 from production network",
          "Force password reset on 14 privileged accounts",
          "Block 185.220.101.5/32 at perimeter and EDR",
          "Open incident INC-2056 and assign Tier 3",
        ].map((a, i) => (
          <div key={a} className="flex items-center gap-2 rounded-md border border-border/40 bg-card/40 px-2 py-1.5 text-xs">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 font-mono text-[10px] font-bold text-primary">{i + 1}</span>
            {a}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── KPI Skeleton ─────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return <Skeleton className="h-28 w-full rounded-xl" />;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  const [selectedCountry, setSelectedCountry] = React.useState<string | null>(null);
  const [range, setRange] = React.useState<"24h" | "7d">("24h");
  const { data, isLoading, isError, refetch, isFetching } = useDashboard(range);

  const kpis = data?.kpis;

  const kpiCards = [
    { label: "Threat Score",     value: kpis?.threatScore      ?? 0, suffix: "/100",  delta: 6,  icon: ShieldAlert,  tone: "critical" as const, spark: KPI_SPARK(1)  },
    { label: "Critical Alerts",  value: kpis?.criticalAlerts   ?? 0,                  delta: 33, icon: ShieldAlert,  tone: "critical" as const, spark: KPI_SPARK(2)  },
    { label: "High Alerts",      value: kpis?.highAlerts        ?? 0,                 delta: 12, icon: BellRing,     tone: "high"     as const, spark: KPI_SPARK(3)  },
    { label: "Medium Alerts",    value: kpis?.mediumAlerts      ?? 0,                 delta: -4, icon: BellRing,     tone: "medium"   as const, spark: KPI_SPARK(4)  },
    { label: "Low Alerts",       value: kpis?.lowAlerts         ?? 0,                 delta: -8, icon: BellRing,     tone: "low"      as const, spark: KPI_SPARK(5)  },
    { label: "Active Incidents", value: kpis?.activeIncidents   ?? 0,                 delta: 2,  icon: Activity,     tone: "high"     as const, spark: KPI_SPARK(6)  },
    { label: "Ingest Rate (EPS)",value: kpis?.ingestRateEps     ?? 0,                 delta: 3,  icon: Database,     tone: "default"  as const, spark: KPI_SPARK(7)  },
    { label: "Active Endpoints", value: kpis?.activeEndpoints   ?? 0,                 delta: 0,  icon: Cpu,          tone: "default"  as const, spark: KPI_SPARK(8)  },
    { label: "Online Users",     value: kpis?.onlineUsers       ?? 0,                 delta: 1,  icon: Users,        tone: "success"  as const, spark: KPI_SPARK(9)  },
    { label: "Rules Loaded",     value: kpis?.rulesLoaded       ?? 0,                 delta: 4,  icon: FileWarning,  tone: "default"  as const, spark: KPI_SPARK(10) },
    { label: "IOC Matches",      value: kpis?.iocMatches        ?? 0,                 delta: 18, icon: Bug,          tone: "high"     as const, spark: KPI_SPARK(11) },
    { label: "AI Confidence",    value: kpis?.aiConfidence      ?? 0, suffix: "%",    delta: 2,  icon: Brain,        tone: "success"  as const, spark: KPI_SPARK(12) },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        eyebrow="Security Operations"
        title="Mission Control"
        description="Live posture across endpoints, identity, and network telemetry · Acme Federal SOC"
        actions={
          <>
            {data?.source === "splunk" && (
              <Badge variant="outline" className="border-[oklch(0.70_0.18_150_/_40%)] bg-[oklch(0.70_0.18_150_/_10%)] text-[oklch(0.80_0.18_150)] text-[10px]">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[oklch(0.70_0.18_150)] inline-block animate-pulse" />Splunk Live
              </Badge>
            )}
            {data?.source === "demo" && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/60">
                <WifiOff className="mr-1.5 h-3 w-3" />Demo data
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => setRange(range === "24h" ? "7d" : "24h")}>
              <Filter className="mr-1.5 h-3.5 w-3.5" />Last {range}
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />Refresh
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-primary to-chart-2 text-primary-foreground hover:opacity-90">
              <Zap className="mr-1.5 h-3.5 w-3.5" />New investigation
            </Button>
          </>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpiCards.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          Failed to load dashboard data. Showing cached or demo data.
        </div>
      )}

      {/* Attack timeline */}
      <Card className="glass-panel p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Live attack chain — last 70 minutes</div>
            <div className="text-xs text-muted-foreground">Correlated kill-chain progression across affected assets</div>
          </div>
          <Badge variant="outline" className="border-[oklch(0.62_0.24_18_/_40%)] bg-[oklch(0.62_0.24_18_/_10%)] text-[oklch(0.82_0.20_25)]">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[oklch(0.62_0.24_18)] animate-pulse" />Active · 1 campaign
          </Badge>
        </div>
        <AttackTimeline />
      </Card>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* World map */}
          <Card className="glass-panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Global attack origin</div>
                <div className="text-xs text-muted-foreground">Click a node for country detail</div>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                {COUNTRIES.reduce((a, c) => a + c.attacks, 0).toLocaleString()} events
              </Badge>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
              <WorldMap onSelect={setSelectedCountry} selected={selectedCountry} />
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Top origins</div>
                {COUNTRIES.slice(0, 6).map((c) => {
                  const sel = selectedCountry === c.code;
                  return (
                    <button key={c.code} onClick={() => setSelectedCountry(sel ? null : c.code)}
                      className={`flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition-all ${sel ? "border-primary/60 bg-primary/10" : "border-border/60 bg-card/40 hover:bg-card"}`}>
                      <span className="font-mono text-[10px] text-muted-foreground w-6">{c.code}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="font-mono font-semibold">{c.attacks}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="glass-panel p-4">
              <div className="mb-2 text-sm font-semibold">Events by severity · {range}</div>
              <div className="h-[220px]">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.hourlyEvents ?? []}>
                      <defs>
                        {(["critical","high","medium","low"] as const).map((k, i) => (
                          <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor={["oklch(0.62 0.24 18)","oklch(0.70 0.20 40)","oklch(0.78 0.17 85)","oklch(0.72 0.15 200)"][i]} stopOpacity={0.7} />
                            <stop offset="100%" stopColor={["oklch(0.62 0.24 18)","oklch(0.70 0.20 40)","oklch(0.78 0.17 85)","oklch(0.72 0.15 200)"][i]} stopOpacity={0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250 / 30%)" />
                      <XAxis dataKey="hour" stroke="oklch(0.65 0.02 250)" fontSize={10} tick={{ fontFamily: "var(--font-mono)" }} />
                      <YAxis stroke="oklch(0.65 0.02 250)" fontSize={10} />
                      <Tooltip contentStyle={{ background:"oklch(0.18 0.02 250)",border:"1px solid oklch(0.32 0.02 250)",borderRadius:8,fontSize:12 }} />
                      <Area type="monotone" stackId="1" dataKey="low"      stroke="oklch(0.72 0.15 200)" fill="url(#g-low)"      />
                      <Area type="monotone" stackId="1" dataKey="medium"   stroke="oklch(0.78 0.17 85)"  fill="url(#g-medium)"   />
                      <Area type="monotone" stackId="1" dataKey="high"     stroke="oklch(0.70 0.20 40)"  fill="url(#g-high)"     />
                      <Area type="monotone" stackId="1" dataKey="critical" stroke="oklch(0.62 0.24 18)"  fill="url(#g-critical)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
            <Card className="glass-panel p-4">
              <div className="mb-2 text-sm font-semibold">Attacks by category</div>
              <div className="h-[220px]">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data?.attackCategories ?? []} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                        {(data?.attackCategories ?? []).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background:"oklch(0.18 0.02 250)",border:"1px solid oklch(0.32 0.02 250)",borderRadius:8,fontSize:12 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>

          {/* MITRE bar chart */}
          <Card className="glass-panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold">MITRE ATT&CK tactic distribution</div>
              <Link to="/mitre" className="text-xs text-primary hover:underline">Open matrix →</Link>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MITRE_TACTICS.map((t, i) => ({ tactic: t.split(" ")[0], count: 30 + ((i * 23) % 180) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250 / 30%)" />
                  <XAxis dataKey="tactic" stroke="oklch(0.65 0.02 250)" fontSize={9} angle={-20} textAnchor="end" height={50} />
                  <YAxis stroke="oklch(0.65 0.02 250)" fontSize={10} />
                  <Tooltip cursor={{ fill:"oklch(0.30 0.02 250 / 30%)" }} contentStyle={{ background:"oklch(0.18 0.02 250)",border:"1px solid oklch(0.32 0.02 250)",borderRadius:8,fontSize:12 }} />
                  <Bar dataKey="count" fill="url(#barGrad)" radius={[4,4,0,0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="oklch(0.72 0.16 200)" />
                      <stop offset="100%" stopColor="oklch(0.40 0.12 220)" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Card className="glass-panel p-4">
            <ThreatScoreGauge score={kpis?.threatScore ?? 78} />
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              {[{ l:"Identity",v:72 },{ l:"Endpoint",v:81 },{ l:"Network",v:64 }].map((s) => (
                <div key={s.l} className="rounded-md border border-border/60 bg-muted/30 p-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                  <div className="font-mono text-lg font-bold">{s.v}</div>
                  <Progress value={s.v} className="mt-1 h-1" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass-panel p-4">
            <Tabs defaultValue="feed">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="feed">Live Feed</TabsTrigger>
                <TabsTrigger value="ai">AI Summary</TabsTrigger>
              </TabsList>
              <TabsContent value="feed" className="mt-3"><LiveFeed /></TabsContent>
              <TabsContent value="ai"   className="mt-3"><AiSummaryPanel /></TabsContent>
            </Tabs>
          </Card>

          <Card className="glass-panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold">Top open alerts</div>
              <Link to="/alerts" className="text-xs text-primary hover:underline">View all →</Link>
            </div>
            <div className="space-y-2">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                : (data?.recentAlerts ?? []).slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center gap-2 rounded-md border border-border/50 bg-card/40 p-2 hover:bg-card">
                    <SeverityBadge severity={a.severity} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium">{a.title}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{a.host} · {a.technique.id}</div>
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">{a.confidence}%</div>
                  </div>
                ))
              }
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
