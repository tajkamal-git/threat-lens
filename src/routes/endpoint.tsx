import { createFileRoute } from "@tanstack/react-router";
import { Cpu, ShieldCheck, ShieldAlert, Bug, Terminal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { KpiCard, PageHeader, SeverityBadge, formatDateTime } from "@/components/shared";
import { ENDPOINTS, KPI_SPARK } from "@/lib/mock";

export const Route = createFileRoute("/endpoint")({
  component: EndpointPage,
});

function EndpointPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader eyebrow="EDR" title="Endpoint Security" description="18,472 endpoints monitored · CrowdStrike + Sysmon" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Healthy" value={17984} delta={0} icon={ShieldCheck} tone="success" spark={KPI_SPARK(1)} />
        <KpiCard label="Degraded agents" value={312} delta={-4} icon={Cpu} tone="medium" spark={KPI_SPARK(2)} />
        <KpiCard label="Offline > 24h" value={176} delta={7} icon={ShieldAlert} tone="high" spark={KPI_SPARK(3)} />
        <KpiCard label="Malware quarantined" value={42} delta={18} icon={Bug} tone="critical" spark={KPI_SPARK(4)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-panel p-4">
          <div className="mb-3 text-sm font-semibold">Suspicious processes · live</div>
          <div className="space-y-2">
            {[
              { proc: "powershell.exe -enc JABw…", host: "FIN-WS-0421", parent: "winword.exe", sev: "critical" as const },
              { proc: "rundll32.exe shell32.dll,#61", host: "HR-LT-0188", parent: "explorer.exe", sev: "high" as const },
              { proc: "mimikatz.exe", host: "ENG-WS-1132", parent: "cmd.exe", sev: "critical" as const },
              { proc: "wmic process call create", host: "WIN-DC02", parent: "svchost.exe", sev: "high" as const },
              { proc: "psexec.exe \\\\SRV-DB-PROD-02", host: "SRV-APP-03", parent: "cmd.exe", sev: "medium" as const },
            ].map((p) => (
              <div key={p.proc} className="rounded-md border border-border/60 bg-card/40 p-2.5">
                <div className="flex items-center gap-2"><Terminal className="h-3.5 w-3.5 text-primary" /><SeverityBadge severity={p.sev} /><span className="ml-auto font-mono text-[10px] text-muted-foreground">{p.host}</span></div>
                <div className="mt-1.5 font-mono text-xs break-all">{p.proc}</div>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground">parent: {p.parent}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="glass-panel p-4">
          <div className="mb-3 text-sm font-semibold">Endpoint inventory</div>
          <div className="space-y-2">
            {ENDPOINTS.slice(0, 8).map((e) => (
              <div key={e.hostname} className="flex items-center gap-3 rounded-md border border-border/60 bg-card/40 p-2.5">
                <div className={`h-2 w-2 shrink-0 rounded-full ${e.agent === "healthy" ? "bg-success" : e.agent === "degraded" ? "bg-[oklch(0.78_0.17_85)]" : "bg-destructive"}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-xs font-semibold">{e.hostname}</div>
                  <div className="text-[10px] text-muted-foreground">{e.os} · {e.threats} threats · last seen {formatDateTime(e.lastSeen)}</div>
                </div>
                <div className="w-24"><Progress value={e.risk} className="h-1.5" /><div className="mt-0.5 text-right font-mono text-[10px] text-muted-foreground">risk {e.risk}</div></div>
                <Button variant="outline" size="sm" className="h-7 text-[11px]">Isolate</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="glass-panel p-4">
        <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold">Ransomware & malware indicators</span><Badge variant="outline" className="font-mono text-[10px]">last 7d</Badge></div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {["LockBit 3.0 staging", "Cobalt Strike beacon", "QakBot loader", "BlackCat ransomware", "Emotet dropper", "AsyncRAT C2"].map((m, i) => (
            <div key={m} className="rounded-md border border-border/60 bg-card/40 p-3">
              <div className="flex items-center gap-2"><Bug className="h-4 w-4 text-[oklch(0.82_0.20_25)]" /><span className="text-sm font-semibold">{m}</span></div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div><div className="font-mono text-base font-bold">{3 + i}</div><div className="text-muted-foreground">hosts</div></div>
                <div><div className="font-mono text-base font-bold text-success">{12 + i*2}</div><div className="text-muted-foreground">contained</div></div>
                <div><div className="font-mono text-base font-bold text-[oklch(0.82_0.20_25)]">{i}</div><div className="text-muted-foreground">active</div></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
