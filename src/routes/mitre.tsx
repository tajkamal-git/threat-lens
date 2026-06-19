import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader, SeverityBadge } from "@/components/shared";
import { MITRE_TACTICS, MITRE_TECHNIQUES } from "@/lib/mock";

export const Route = createFileRoute("/mitre")({
  component: MitrePage,
});

function MitrePage() {
  const [selected, setSelected] = React.useState(MITRE_TECHNIQUES[0]);
  const [q, setQ] = React.useState("");

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        eyebrow="Framework"
        title="MITRE ATT&CK Coverage"
        description="Enterprise matrix v14 · 12 tactics · 196 techniques monitored"
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search techniques…" className="h-9 pl-9 bg-muted/30 border-border/60" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="glass-panel overflow-x-auto p-3">
          <div className="grid auto-cols-[minmax(150px,1fr)] grid-flow-col gap-2">
            {MITRE_TACTICS.map((tactic) => {
              const techs = MITRE_TECHNIQUES.filter(t => t.tactic === tactic && (q === "" || t.name.toLowerCase().includes(q.toLowerCase()) || t.id.includes(q.toUpperCase())));
              return (
                <div key={tactic} className="space-y-1.5">
                  <div className="rounded-md bg-muted/50 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground/90">{tactic}</div>
                  {techs.map((t) => {
                    const cov = t.detections > 100 ? "high" : t.detections > 30 ? "med" : "low";
                    const isSel = selected.id === t.id;
                    return (
                      <button key={t.id} onClick={() => setSelected(t)}
                        className={`block w-full rounded-md border p-2 text-left text-[11px] transition-all hover:border-primary/60 ${isSel ? "border-primary bg-primary/10" : "border-border/60 bg-card/40"}`}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-muted-foreground">{t.id}</span>
                          <span className={`ml-auto h-1.5 w-1.5 rounded-full ${cov === "high" ? "bg-[oklch(0.70_0.18_150)]" : cov === "med" ? "bg-[oklch(0.78_0.17_85)]" : "bg-[oklch(0.62_0.24_18)]"}`} />
                        </div>
                        <div className="mt-0.5 font-medium leading-tight">{t.name}</div>
                        <div className="mt-1 font-mono text-[10px] text-muted-foreground">{t.detections} detections</div>
                      </button>
                    );
                  })}
                  {techs.length === 0 && <div className="rounded-md border border-dashed border-border/60 p-2 text-center text-[10px] text-muted-foreground">No match</div>}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="glass-panel sticky top-20 h-fit p-4">
          <div className="font-mono text-[10px] text-muted-foreground">{selected.id} · {selected.tactic}</div>
          <h2 className="mt-1 text-lg font-bold">{selected.name}</h2>
          <div className="mt-2 flex items-center gap-2">
            <SeverityBadge severity={selected.detections > 100 ? "high" : selected.detections > 30 ? "medium" : "critical"} />
            <Badge variant="outline" className="font-mono text-[10px]">{selected.detections} detections / 30d</Badge>
          </div>
          <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
            Adversaries use this technique to {selected.name.toLowerCase()} during the {selected.tactic.toLowerCase()} phase
            of an intrusion. ThreatLens correlates host, network, and identity telemetry to surface this behaviour.
          </p>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between border-b border-border/40 py-1.5"><span className="text-muted-foreground">Coverage</span><span className="font-mono">87%</span></div>
            <div className="flex justify-between border-b border-border/40 py-1.5"><span className="text-muted-foreground">Active rules</span><span className="font-mono">14</span></div>
            <div className="flex justify-between border-b border-border/40 py-1.5"><span className="text-muted-foreground">False positives (30d)</span><span className="font-mono">3</span></div>
            <div className="flex justify-between py-1.5"><span className="text-muted-foreground">Last detection</span><span className="font-mono">14 min ago</span></div>
          </div>
          <div className="mt-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Data sources</div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {["Process Creation", "Authentication Logs", "Network Traffic", "File Monitoring"].map((d) =>
                <Badge key={d} variant="outline" className="text-[10px]">{d}</Badge>)}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
