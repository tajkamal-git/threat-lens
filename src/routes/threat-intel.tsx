import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Globe2, Skull, Users } from "lucide-react";
import { PageHeader, SeverityBadge } from "@/components/shared";

export const Route = createFileRoute("/threat-intel")({
  component: TiPage,
});

const ACTORS = [
  { name: "APT29 (Cozy Bear)", country: "RU", sev: "critical" as const, motive: "Espionage", campaigns: 8, conf: 92 },
  { name: "Lazarus Group", country: "KP", sev: "critical" as const, motive: "Financial / Espionage", campaigns: 6, conf: 88 },
  { name: "APT41", country: "CN", sev: "high" as const, motive: "Espionage / Crime", campaigns: 12, conf: 84 },
  { name: "FIN7", country: "—", sev: "high" as const, motive: "Financial", campaigns: 5, conf: 79 },
  { name: "Scattered Spider", country: "US/UK", sev: "high" as const, motive: "Extortion", campaigns: 4, conf: 76 },
];
const FAMILIES = [
  { name: "LockBit 3.0", type: "Ransomware", first: "2022", sev: "critical" as const },
  { name: "Cobalt Strike", type: "Post-exploitation", first: "2012", sev: "high" as const },
  { name: "QakBot", type: "Banking Trojan", first: "2008", sev: "high" as const },
  { name: "Emotet", type: "Loader", first: "2014", sev: "high" as const },
  { name: "AsyncRAT", type: "RAT", first: "2019", sev: "medium" as const },
  { name: "BlackCat (ALPHV)", type: "Ransomware", first: "2021", sev: "critical" as const },
];

function TiPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader eyebrow="Intelligence" title="Threat Intelligence" description="Campaigns · actors · malware families · TTP timelines" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-panel p-4">
          <div className="mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Threat actors</span></div>
          <div className="space-y-2">
            {ACTORS.map((a) => (
              <div key={a.name} className="rounded-md border border-border/60 bg-card/40 p-3">
                <div className="flex items-center gap-2"><span className="font-semibold">{a.name}</span><Badge variant="outline" className="font-mono text-[10px]">{a.country}</Badge><SeverityBadge severity={a.sev} className="ml-auto" /></div>
                <div className="mt-1 text-[11px] text-muted-foreground">{a.motive} · {a.campaigns} tracked campaigns</div>
                <div className="mt-2"><div className="flex justify-between text-[10px] text-muted-foreground"><span>Targeting confidence</span><span>{a.conf}%</span></div><Progress value={a.conf} className="mt-1 h-1" /></div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="glass-panel p-4">
          <div className="mb-3 flex items-center gap-2"><Skull className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Malware families</span></div>
          <div className="space-y-2">
            {FAMILIES.map((f) => (
              <div key={f.name} className="flex items-center gap-3 rounded-md border border-border/60 bg-card/40 p-2.5">
                <Skull className="h-4 w-4 text-[oklch(0.82_0.20_25)]" />
                <div className="min-w-0 flex-1"><div className="font-semibold">{f.name}</div><div className="text-[11px] text-muted-foreground">{f.type} · since {f.first}</div></div>
                <SeverityBadge severity={f.sev} />
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="glass-panel p-4">
        <div className="mb-3 flex items-center gap-2"><Globe2 className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Active campaigns affecting your sector</span></div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Operation MidnightEclipse", actor: "APT29", target: "Government", sev: "critical" as const },
            { name: "ContiPhish 2025", actor: "Conti remnants", target: "Financial", sev: "high" as const },
            { name: "GoldStorm SAP exploit", actor: "Unknown", target: "Enterprise", sev: "high" as const },
            { name: "VelvetTempest", actor: "Lazarus Group", target: "Defense", sev: "critical" as const },
            { name: "DragonBridge", actor: "APT41", target: "Telecom", sev: "high" as const },
            { name: "RansomCloud Q4", actor: "BlackCat", target: "Healthcare", sev: "critical" as const },
          ].map((c) => (
            <div key={c.name} className="rounded-md border border-border/60 bg-card/40 p-3">
              <div className="flex items-center gap-2"><SeverityBadge severity={c.sev} /><span className="font-mono text-[10px] text-muted-foreground">Active</span></div>
              <div className="mt-1 font-semibold">{c.name}</div>
              <div className="text-[11px] text-muted-foreground">Attributed to {c.actor} · targeting {c.target}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
