import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader, SeverityBadge } from "@/components/shared";

export const Route = createFileRoute("/network")({
  component: NetworkPage,
});

const tip = { background: "oklch(0.18 0.02 250)", border: "1px solid oklch(0.32 0.02 250)", borderRadius: 8, fontSize: 12 };

function Topology() {
  const nodes = [
    { id: "internet", x: 50, y: 15, label: "Internet", type: "ext" },
    { id: "fw", x: 50, y: 35, label: "PA-Firewall", type: "fw" },
    { id: "dmz", x: 20, y: 55, label: "DMZ", type: "zone" },
    { id: "corp", x: 50, y: 55, label: "Corporate", type: "zone" },
    { id: "prod", x: 80, y: 55, label: "Production", type: "zone" },
    { id: "dc", x: 50, y: 80, label: "WIN-DC01", type: "host" },
    { id: "db", x: 80, y: 80, label: "SRV-DB-PROD", type: "host" },
    { id: "fin", x: 20, y: 80, label: "FIN-WS-0421", type: "host", alert: true },
  ];
  const edges = [["internet","fw"],["fw","dmz"],["fw","corp"],["fw","prod"],["corp","dc"],["prod","db"],["dmz","fin"],["fin","db"]];
  const get = (id: string) => nodes.find(n => n.id === id)!;
  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-lg border border-border/60 bg-[oklch(0.14_0.02_250)] grid-bg">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {edges.map(([a, b], i) => {
          const A = get(a), B = get(b);
          const alert = a === "fin" || b === "fin";
          return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={alert ? "oklch(0.62 0.24 18)" : "oklch(0.40 0.05 220)"} strokeWidth={alert ? 0.4 : 0.2} strokeDasharray={alert ? "1 1" : ""} />;
        })}
      </svg>
      {nodes.map((n) => (
        <div key={n.id} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
          <div className={`mx-auto grid h-10 w-10 place-items-center rounded-lg border ${n.alert ? "border-[oklch(0.62_0.24_18)] bg-[oklch(0.62_0.24_18_/_20%)] animate-pulse-ring" : "border-border/60 bg-card/80"}`}>
            <span className="font-mono text-[10px] font-bold">{n.type === "host" ? "🖥" : n.type === "fw" ? "🛡" : n.type === "ext" ? "🌐" : "▦"}</span>
          </div>
          <div className="mt-1 whitespace-nowrap font-mono text-[10px]">{n.label}</div>
        </div>
      ))}
    </div>
  );
}

function NetworkPage() {
  const traffic = Array.from({ length: 24 }, (_, i) => ({ h: `${i}:00`, inbound: 200 + Math.round(120 * Math.sin(i/4)), outbound: 180 + Math.round(140 * Math.sin(i/3 + 1) + (i===14?280:0)) }));
  const protocols = [{ name: "HTTPS", value: 4820 }, { name: "DNS", value: 1280 }, { name: "SMB", value: 640 }, { name: "RDP", value: 320 }, { name: "Other", value: 412 }];
  const COLORS = ["oklch(0.72 0.16 200)", "oklch(0.70 0.18 150)", "oklch(0.78 0.17 85)", "oklch(0.65 0.22 30)", "oklch(0.65 0.20 320)"];
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader eyebrow="Network" title="Network Monitoring" description="Flows, topology and anomalous connection detection" />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="glass-panel p-4"><div className="mb-2 text-sm font-semibold">Topology</div><Topology /></Card>
        <Card className="glass-panel p-4">
          <div className="mb-2 text-sm font-semibold">Suspicious connections</div>
          <div className="space-y-2">
            {[
              { src: "FIN-WS-0421", dst: "185.220.101.5:443", sev: "critical" as const, why: "C2 beacon · 60s interval" },
              { src: "ENG-WS-1132", dst: "94.140.14.14:53", sev: "high" as const, why: "DNS tunnel suspected" },
              { src: "SRV-DB-PROD-02", dst: "45.83.193.150:22", sev: "high" as const, why: "Outbound SSH to rare ASN" },
              { src: "HR-LT-0188", dst: "auth-update-secure.com", sev: "medium" as const, why: "Newly registered domain" },
            ].map((c) => (
              <div key={c.dst} className="rounded-md border border-border/60 bg-card/40 p-2.5">
                <div className="flex items-center gap-2"><SeverityBadge severity={c.sev} /><span className="font-mono text-xs">{c.src}</span><span className="text-muted-foreground">→</span><span className="font-mono text-xs text-[oklch(0.85_0.18_55)]">{c.dst}</span></div>
                <div className="mt-1 text-[11px] text-muted-foreground">{c.why}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="glass-panel p-4 lg:col-span-2">
          <div className="mb-2 text-sm font-semibold">Bandwidth · last 24h (Mbps)</div>
          <div className="h-[240px]"><ResponsiveContainer><AreaChart data={traffic}>
            <defs><linearGradient id="ni" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.72 0.16 200)" stopOpacity={0.6} /><stop offset="100%" stopColor="oklch(0.72 0.16 200)" stopOpacity={0} /></linearGradient>
              <linearGradient id="no" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.70 0.18 150)" stopOpacity={0.6} /><stop offset="100%" stopColor="oklch(0.70 0.18 150)" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250 / 30%)" />
            <XAxis dataKey="h" stroke="oklch(0.65 0.02 250)" fontSize={10} /><YAxis stroke="oklch(0.65 0.02 250)" fontSize={10} />
            <Tooltip contentStyle={tip} />
            <Area type="monotone" dataKey="inbound" stroke="oklch(0.72 0.16 200)" fill="url(#ni)" strokeWidth={2} />
            <Area type="monotone" dataKey="outbound" stroke="oklch(0.70 0.18 150)" fill="url(#no)" strokeWidth={2} />
          </AreaChart></ResponsiveContainer></div>
        </Card>
        <Card className="glass-panel p-4">
          <div className="mb-2 text-sm font-semibold">Protocol distribution</div>
          <div className="h-[240px]"><ResponsiveContainer><PieChart>
            <Pie data={protocols} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>{protocols.map((_,i)=><Cell key={i} fill={COLORS[i]} />)}</Pie>
            <Tooltip contentStyle={tip} />
          </PieChart></ResponsiveContainer></div>
        </Card>
      </div>
    </div>
  );
}
