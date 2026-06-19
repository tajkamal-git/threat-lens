import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { KeyRound, ShieldX, Globe, UserX, Activity, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard, PageHeader, SeverityBadge, formatDateTime } from "@/components/shared";
import { KPI_SPARK } from "@/lib/mock";

export const Route = createFileRoute("/authentication")({
  component: AuthPage,
});

const tip = { background: "oklch(0.18 0.02 250)", border: "1px solid oklch(0.32 0.02 250)", borderRadius: 8, fontSize: 12 };

function AuthPage() {
  const trend = Array.from({ length: 24 }, (_, i) => ({ h: `${i}:00`, success: 800 + Math.round(400 * Math.sin(i/4)), failed: 40 + Math.round(80 * Math.sin(i/3) + (i===8?180:0)) }));
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader eyebrow="Identity" title="Authentication Monitoring" description="Logins, lockouts, password spraying and impossible-travel detection" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Successful logons · 24h" value={21487} delta={2} icon={KeyRound} tone="success" spark={KPI_SPARK(1)} />
        <KpiCard label="Failed logons · 24h" value={1842} delta={28} icon={ShieldX} tone="critical" spark={KPI_SPARK(2)} />
        <KpiCard label="Account lockouts" value={37} delta={12} icon={Lock} tone="high" spark={KPI_SPARK(3)} />
        <KpiCard label="Impossible travel" value={4} delta={100} icon={Globe} tone="critical" spark={KPI_SPARK(4)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-panel p-4">
          <div className="mb-2 text-sm font-semibold">Logon activity · 24h</div>
          <div className="h-[260px]"><ResponsiveContainer><LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250 / 30%)" />
            <XAxis dataKey="h" stroke="oklch(0.65 0.02 250)" fontSize={10} /><YAxis stroke="oklch(0.65 0.02 250)" fontSize={10} />
            <Tooltip contentStyle={tip} />
            <Line type="monotone" dataKey="success" stroke="oklch(0.70 0.18 150)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="failed" stroke="oklch(0.62 0.24 18)" strokeWidth={2} dot={false} />
          </LineChart></ResponsiveContainer></div>
        </Card>
        <Card className="glass-panel p-4">
          <div className="mb-2 text-sm font-semibold">Top failed-auth source IPs</div>
          <div className="h-[260px]"><ResponsiveContainer><BarChart layout="vertical" data={[
            { ip: "185.220.101.5", n: 412 }, { ip: "45.83.193.150", n: 287 }, { ip: "94.140.14.14", n: 184 },
            { ip: "203.0.113.42", n: 121 }, { ip: "198.51.100.16", n: 94 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250 / 30%)" />
            <XAxis type="number" stroke="oklch(0.65 0.02 250)" fontSize={10} />
            <YAxis type="category" dataKey="ip" stroke="oklch(0.65 0.02 250)" fontSize={10} width={110} tick={{ fontFamily: "var(--font-mono)" }} />
            <Tooltip contentStyle={tip} cursor={{fill:"oklch(0.30 0.02 250 / 30%)"}} />
            <Bar dataKey="n" fill="oklch(0.62 0.24 18)" radius={[0,4,4,0]} />
          </BarChart></ResponsiveContainer></div>
        </Card>
      </div>

      <Card className="glass-panel p-4">
        <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold">Suspicious authentication events</span><Badge variant="outline" className="font-mono text-[10px]">12 active</Badge></div>
        <div className="space-y-2">
          {[
            { type: "Impossible travel", user: "j.morales", desc: "London (08:42) → Bucharest (09:11)", sev: "critical" as const, t: new Date().toISOString() },
            { type: "Password spraying", user: "—", desc: "12 accounts probed from 185.220.101.5", sev: "high" as const, t: new Date(Date.now()-3600e3).toISOString() },
            { type: "Brute force", user: "svc_backup", desc: "147 failed → 1 success on WIN-DC01", sev: "critical" as const, t: new Date(Date.now()-5400e3).toISOString() },
            { type: "Disabled account use", user: "j.former", desc: "Attempted SSO from 45.83.193.150", sev: "high" as const, t: new Date(Date.now()-9200e3).toISOString() },
            { type: "After-hours admin", user: "admin_temp", desc: "Domain admin logon at 03:42 UTC", sev: "medium" as const, t: new Date(Date.now()-12000e3).toISOString() },
          ].map((e) => (
            <div key={e.desc} className="flex flex-wrap items-center gap-3 rounded-md border border-border/60 bg-card/40 p-2.5 text-sm">
              <SeverityBadge severity={e.sev} />
              <Badge variant="outline" className="text-[10px]">{e.type}</Badge>
              <span className="font-mono text-xs text-primary">{e.user}</span>
              <span className="flex-1 text-xs">{e.desc}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{formatDateTime(e.t)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
