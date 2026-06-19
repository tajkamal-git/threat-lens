import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared";
import { HOURLY_EVENTS, ATTACK_CATEGORIES, MITRE_TACTICS, COUNTRIES } from "@/lib/mock";
import { Download } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

const COLORS = ["oklch(0.72 0.16 200)", "oklch(0.70 0.18 150)", "oklch(0.75 0.18 80)", "oklch(0.65 0.22 30)", "oklch(0.65 0.20 320)"];
const tip = { background: "oklch(0.18 0.02 250)", border: "1px solid oklch(0.32 0.02 250)", borderRadius: 8, fontSize: 12 };

function Heatmap() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="space-y-1.5">
      {days.map((d, di) => (
        <div key={d} className="flex items-center gap-1">
          <div className="w-8 text-[10px] font-mono text-muted-foreground">{d}</div>
          <div className="grid flex-1 gap-0.5" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
            {Array.from({ length: 24 }).map((_, hi) => {
              const intensity = Math.max(0, Math.min(1, (Math.sin(di + hi / 3) + 1) / 2 + ((hi * (di + 1)) % 5) / 20));
              return <div key={hi} title={`${d} ${hi}:00`} className="aspect-square rounded-sm" style={{ background: `oklch(0.62 0.24 18 / ${intensity})` }} />;
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-end gap-1 pt-1 text-[10px] text-muted-foreground">
        Less <span className="h-2 w-3 rounded-sm" style={{ background: "oklch(0.62 0.24 18 / 0.15)" }} />
        <span className="h-2 w-3 rounded-sm" style={{ background: "oklch(0.62 0.24 18 / 0.4)" }} />
        <span className="h-2 w-3 rounded-sm" style={{ background: "oklch(0.62 0.24 18 / 0.7)" }} />
        <span className="h-2 w-3 rounded-sm" style={{ background: "oklch(0.62 0.24 18 / 1)" }} /> More
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const trend = Array.from({ length: 30 }, (_, i) => ({
    day: `D-${30 - i}`, alerts: 200 + Math.round(80 * Math.sin(i / 3) + (i * 11) % 50),
    incidents: 8 + Math.round(6 * Math.sin(i / 4) + (i * 3) % 5),
    mttr: 30 + Math.round(20 * Math.sin(i / 5) + (i * 7) % 10),
  }));
  const radar = MITRE_TACTICS.map((t, i) => ({ tactic: t.split(" ")[0], coverage: 40 + ((i * 13) % 55) }));

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        eyebrow="Insights"
        title="Security Analytics"
        description="Detection coverage, response performance, and attack pattern intelligence"
        actions={
          <>
            <Tabs defaultValue="30d"><TabsList><TabsTrigger value="7d">7d</TabsTrigger><TabsTrigger value="30d">30d</TabsTrigger><TabsTrigger value="90d">90d</TabsTrigger></TabsList></Tabs>
            <Button variant="outline" size="sm"><Download className="mr-1.5 h-3.5 w-3.5" />Report</Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-panel p-4">
          <div className="mb-2 text-sm font-semibold">Alert volume vs incidents · 30d</div>
          <div className="h-[260px]"><ResponsiveContainer><LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250 / 30%)" />
            <XAxis dataKey="day" stroke="oklch(0.65 0.02 250)" fontSize={10} />
            <YAxis stroke="oklch(0.65 0.02 250)" fontSize={10} />
            <Tooltip contentStyle={tip} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="alerts" stroke="oklch(0.72 0.16 200)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="incidents" stroke="oklch(0.62 0.24 18)" strokeWidth={2} dot={false} />
          </LineChart></ResponsiveContainer></div>
        </Card>

        <Card className="glass-panel p-4">
          <div className="mb-2 text-sm font-semibold">Mean time to respond · minutes</div>
          <div className="h-[260px]"><ResponsiveContainer><AreaChart data={trend}>
            <defs><linearGradient id="mttrGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.70 0.18 150)" stopOpacity={0.6} /><stop offset="100%" stopColor="oklch(0.70 0.18 150)" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250 / 30%)" />
            <XAxis dataKey="day" stroke="oklch(0.65 0.02 250)" fontSize={10} />
            <YAxis stroke="oklch(0.65 0.02 250)" fontSize={10} />
            <Tooltip contentStyle={tip} />
            <Area type="monotone" dataKey="mttr" stroke="oklch(0.70 0.18 150)" fill="url(#mttrGrad)" strokeWidth={2} />
          </AreaChart></ResponsiveContainer></div>
        </Card>

        <Card className="glass-panel p-4">
          <div className="mb-2 text-sm font-semibold">Severity stack · 24h</div>
          <div className="h-[260px]"><ResponsiveContainer><BarChart data={HOURLY_EVENTS}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250 / 30%)" />
            <XAxis dataKey="hour" stroke="oklch(0.65 0.02 250)" fontSize={10} />
            <YAxis stroke="oklch(0.65 0.02 250)" fontSize={10} />
            <Tooltip contentStyle={tip} cursor={{ fill: "oklch(0.30 0.02 250 / 30%)" }} />
            <Bar stackId="a" dataKey="low" fill="oklch(0.72 0.15 200)" />
            <Bar stackId="a" dataKey="medium" fill="oklch(0.78 0.17 85)" />
            <Bar stackId="a" dataKey="high" fill="oklch(0.70 0.20 40)" />
            <Bar stackId="a" dataKey="critical" fill="oklch(0.62 0.24 18)" />
          </BarChart></ResponsiveContainer></div>
        </Card>

        <Card className="glass-panel p-4">
          <div className="mb-2 text-sm font-semibold">MITRE coverage radar</div>
          <div className="h-[260px]"><ResponsiveContainer><RadarChart data={radar}>
            <PolarGrid stroke="oklch(0.30 0.02 250 / 50%)" />
            <PolarAngleAxis dataKey="tactic" tick={{ fontSize: 9, fill: "oklch(0.75 0.02 250)" }} />
            <PolarRadiusAxis tick={{ fontSize: 9, fill: "oklch(0.65 0.02 250)" }} />
            <Radar dataKey="coverage" stroke="oklch(0.72 0.16 200)" fill="oklch(0.72 0.16 200)" fillOpacity={0.4} />
            <Tooltip contentStyle={tip} />
          </RadarChart></ResponsiveContainer></div>
        </Card>

        <Card className="glass-panel p-4">
          <div className="mb-2 text-sm font-semibold">Attack categories</div>
          <div className="h-[260px]"><ResponsiveContainer><PieChart>
            <Pie data={ATTACK_CATEGORIES} dataKey="value" nameKey="name" outerRadius={90} innerRadius={45} paddingAngle={2}>
              {ATTACK_CATEGORIES.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tip} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart></ResponsiveContainer></div>
        </Card>

        <Card className="glass-panel p-4">
          <div className="mb-2 text-sm font-semibold">Top origin countries</div>
          <div className="h-[260px]"><ResponsiveContainer><BarChart layout="vertical" data={COUNTRIES.slice(0, 8)}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250 / 30%)" />
            <XAxis type="number" stroke="oklch(0.65 0.02 250)" fontSize={10} />
            <YAxis type="category" dataKey="name" stroke="oklch(0.65 0.02 250)" fontSize={10} width={90} />
            <Tooltip contentStyle={tip} cursor={{ fill: "oklch(0.30 0.02 250 / 30%)" }} />
            <Bar dataKey="attacks" fill="oklch(0.62 0.24 18)" radius={[0, 4, 4, 0]} />
          </BarChart></ResponsiveContainer></div>
        </Card>
      </div>

      <Card className="glass-panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Activity heatmap · day of week × hour</div>
          <span className="font-mono text-[10px] text-muted-foreground">UTC</span>
        </div>
        <Heatmap />
      </Card>
    </div>
  );
}
