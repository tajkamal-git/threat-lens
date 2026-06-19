import { createFileRoute } from "@tanstack/react-router";
import { FileEdit, FilePlus2, FileX2, FileSearch, Hash } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard, PageHeader, SeverityBadge, formatDateTime } from "@/components/shared";
import { KPI_SPARK } from "@/lib/mock";

export const Route = createFileRoute("/fim")({
  component: FimPage,
});

const events = [
  { path: "C:\\Windows\\System32\\drivers\\etc\\hosts", type: "Modified", host: "FIN-WS-0421", sev: "high" as const, hash: "9f2c4b6a…2a4c", t: new Date().toISOString() },
  { path: "/etc/passwd", type: "Modified", host: "SRV-APP-03", sev: "critical" as const, hash: "8a1b3c5e…7d9f", t: new Date(Date.now()-1800e3).toISOString() },
  { path: "C:\\Program Files\\Common\\backdoor.exe", type: "Created", host: "ENG-WS-1132", sev: "critical" as const, hash: "1d3f5e7b…4c2a", t: new Date(Date.now()-3600e3).toISOString() },
  { path: "/var/log/auth.log", type: "Deleted", host: "K8S-NODE-07", sev: "high" as const, hash: "—", t: new Date(Date.now()-5400e3).toISOString() },
  { path: "C:\\Windows\\System32\\config\\SAM", type: "Accessed", host: "WIN-DC01", sev: "medium" as const, hash: "4c2a8e1d…9b0e", t: new Date(Date.now()-7200e3).toISOString() },
  { path: "/etc/cron.d/backup", type: "Created", host: "SRV-DB-PROD-02", sev: "high" as const, hash: "6f8a1b3c…5e7d", t: new Date(Date.now()-9000e3).toISOString() },
];

function FimPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader eyebrow="Integrity" title="File Integrity Monitoring" description="2,418 monitored paths across 18,472 endpoints" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Modifications · 24h" value={142} delta={8} icon={FileEdit} tone="medium" spark={KPI_SPARK(1)} />
        <KpiCard label="Creations · 24h" value={67} delta={22} icon={FilePlus2} tone="high" spark={KPI_SPARK(2)} />
        <KpiCard label="Deletions · 24h" value={14} delta={40} icon={FileX2} tone="critical" spark={KPI_SPARK(3)} />
        <KpiCard label="Access events" value={9842} delta={3} icon={FileSearch} tone="default" spark={KPI_SPARK(4)} />
      </div>
      <Card className="glass-panel p-4">
        <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold">Suspicious file activity timeline</span><Badge variant="outline" className="font-mono text-[10px]">live</Badge></div>
        <div className="space-y-2">
          {events.map((e, i) => (
            <div key={i} className="flex flex-wrap items-center gap-3 rounded-md border border-border/60 bg-card/40 p-2.5">
              <SeverityBadge severity={e.sev} />
              <Badge variant="outline" className="text-[10px]">{e.type}</Badge>
              <span className="font-mono text-xs break-all">{e.path}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{e.host}</span>
              <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-muted-foreground"><Hash className="h-3 w-3" />{e.hash}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{formatDateTime(e.t)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
