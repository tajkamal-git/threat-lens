import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon, Server, User, Wifi, Hash, ShieldAlert, Grid3x3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageHeader, SeverityBadge } from "@/components/shared";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = React.useState("WIN-DC01");
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader eyebrow="Investigation" title="Universal Search" description="Search across every dimension of your SOC telemetry" />
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hosts, users, IPs, hashes, incidents, MITRE…" className="h-14 pl-12 text-base bg-muted/30 border-border/60 font-mono" />
        <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded border border-border/60 bg-background px-2 py-1 text-[10px] font-mono text-muted-foreground">↵ to search</kbd>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All (47)</TabsTrigger>
          <TabsTrigger value="hosts">Hosts (3)</TabsTrigger>
          <TabsTrigger value="users">Users (8)</TabsTrigger>
          <TabsTrigger value="ips">IPs (12)</TabsTrigger>
          <TabsTrigger value="hashes">Hashes (4)</TabsTrigger>
          <TabsTrigger value="incidents">Incidents (5)</TabsTrigger>
          <TabsTrigger value="mitre">MITRE (15)</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4 space-y-2">
          {[
            { icon: Server, type: "Host", title: "WIN-DC01", desc: "Domain controller · Windows Server 2022 · 14 active alerts", sev: "critical" as const },
            { icon: ShieldAlert, type: "Incident", title: "INC-2056 — Credential theft chain", desc: "Open · assigned to j.morales · 3 affected assets", sev: "critical" as const },
            { icon: User, type: "User", title: "j.morales", desc: "DBA · Engineering · risk score 87", sev: "high" as const },
            { icon: Wifi, type: "IP", title: "185.220.101.5", desc: "Tor exit node (RU) · 412 events · IOC match", sev: "critical" as const },
            { icon: Hash, type: "Hash", title: "9f2c4b6a…2a4c", desc: "SHA-256 · LockBit 3.0 staging binary · 3 endpoints", sev: "critical" as const },
            { icon: Grid3x3, type: "MITRE", title: "T1110.003 — Password Spraying", desc: "318 detections / 30d · Credential Access", sev: "high" as const },
            { icon: Server, type: "Host", title: "FIN-WS-0421", desc: "Windows 11 · Finance · ransomware indicator", sev: "critical" as const },
          ].map((r, i) => (
            <Card key={i} className="glass-panel flex items-center gap-3 p-3 hover:border-primary/50 cursor-pointer">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted/40 border border-border/60"><r.icon className="h-4 w-4 text-primary" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">{r.type}</Badge><span className="font-mono text-sm font-semibold truncate">{r.title}</span></div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{r.desc}</div>
              </div>
              <SeverityBadge severity={r.sev} />
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
