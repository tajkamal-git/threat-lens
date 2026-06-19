import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader, SeverityBadge } from "@/components/shared";

export const Route = createFileRoute("/uba")({
  component: UbaPage,
});

const USERS_RISK = [
  { name: "j.morales", role: "DBA", risk: 87, anomalies: 12, dept: "Engineering" },
  { name: "admin_temp", role: "Contractor", risk: 78, anomalies: 9, dept: "External" },
  { name: "svc_backup", role: "Service Account", risk: 72, anomalies: 7, dept: "Infrastructure" },
  { name: "k.nguyen", role: "Security Engineer", risk: 41, anomalies: 3, dept: "Security" },
  { name: "a.patel", role: "SOC Analyst", risk: 32, anomalies: 2, dept: "Security" },
  { name: "s.okafor", role: "Finance", risk: 28, anomalies: 1, dept: "Finance" },
];
const baseline = Array.from({ length: 24 }, (_, i) => ({ h: `${i}:00`, baseline: 20 + Math.round(15 * Math.sin(i / 3)), actual: 20 + Math.round(15 * Math.sin(i / 3)) + (i === 9 ? 75 : i === 14 ? 40 : 0) }));
const tip = { background: "oklch(0.18 0.02 250)", border: "1px solid oklch(0.32 0.02 250)", borderRadius: 8, fontSize: 12 };

function UbaPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader eyebrow="Identity" title="User Behavior Analytics" description="Behavioral baselines, peer-group comparison, anomaly scoring" />
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Card className="glass-panel p-4">
          <div className="mb-3 text-sm font-semibold">High-risk users</div>
          <div className="space-y-2">
            {USERS_RISK.map((u) => (
              <div key={u.name} className="flex items-center gap-3 rounded-md border border-border/60 bg-card/40 p-2.5">
                <Avatar className="h-9 w-9"><AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-[10px] font-semibold text-primary-foreground">{u.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><span className="truncate font-mono text-xs font-semibold">{u.name}</span><Badge variant="outline" className="text-[10px]">{u.dept}</Badge></div>
                  <div className="text-[10px] text-muted-foreground">{u.role} · {u.anomalies} anomalies</div>
                  <Progress value={u.risk} className="mt-1.5 h-1" />
                </div>
                <div className="text-right"><div className="font-mono text-lg font-bold text-[oklch(0.85_0.18_55)]">{u.risk}</div><div className="text-[9px] uppercase text-muted-foreground">Risk</div></div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="glass-panel p-4">
            <div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold">j.morales — activity vs baseline (24h)</span><SeverityBadge severity="high" /></div>
            <div className="h-[220px]"><ResponsiveContainer><AreaChart data={baseline}>
              <defs><linearGradient id="ba" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.72 0.16 200)" stopOpacity={0.4} /><stop offset="100%" stopColor="oklch(0.72 0.16 200)" stopOpacity={0} /></linearGradient>
                <linearGradient id="ac" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.62 0.24 18)" stopOpacity={0.6} /><stop offset="100%" stopColor="oklch(0.62 0.24 18)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250 / 30%)" />
              <XAxis dataKey="h" stroke="oklch(0.65 0.02 250)" fontSize={10} /><YAxis stroke="oklch(0.65 0.02 250)" fontSize={10} />
              <Tooltip contentStyle={tip} />
              <Area type="monotone" dataKey="baseline" stroke="oklch(0.72 0.16 200)" fill="url(#ba)" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="actual" stroke="oklch(0.62 0.24 18)" fill="url(#ac)" strokeWidth={2} />
            </AreaChart></ResponsiveContainer></div>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="glass-panel p-4">
              <div className="mb-2 text-sm font-semibold">Detected anomalies</div>
              <div className="space-y-2 text-xs">
                {[
                  { l: "Unusual logon hour (03:42 UTC)", sev: "high" as const },
                  { l: "New geo-location: Bucharest, RO", sev: "high" as const },
                  { l: "First-time access to FIN share", sev: "medium" as const },
                  { l: "Privilege change: added to DnsAdmins", sev: "critical" as const },
                  { l: "Volume of file reads 4.2× baseline", sev: "medium" as const },
                ].map((a) => (
                  <div key={a.l} className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 p-2">
                    <SeverityBadge severity={a.sev} /><span className="flex-1">{a.l}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="glass-panel p-4">
              <div className="mb-2 text-sm font-semibold">Privilege changes · 7d</div>
              <div className="h-[200px]"><ResponsiveContainer><BarChart data={Array.from({length:7},(_,i)=>({d:`D-${7-i}`,added:1+(i%3),removed:i%2}))}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250 / 30%)" />
                <XAxis dataKey="d" stroke="oklch(0.65 0.02 250)" fontSize={10} /><YAxis stroke="oklch(0.65 0.02 250)" fontSize={10} />
                <Tooltip contentStyle={tip} cursor={{fill:"oklch(0.30 0.02 250 / 30%)"}} />
                <Bar dataKey="added" fill="oklch(0.62 0.24 18)" radius={[4,4,0,0]} />
                <Bar dataKey="removed" fill="oklch(0.70 0.18 150)" radius={[4,4,0,0]} />
              </BarChart></ResponsiveContainer></div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
