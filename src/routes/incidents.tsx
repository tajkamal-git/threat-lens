import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus, Filter, Download, Search, ShieldAlert, Clock, User,
  Server, AlertTriangle, FileText, Eye, MessageSquare,
  RefreshCw, WifiOff,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, SeverityBadge, formatDateTime } from "@/components/shared";
import { useIncidents } from "@/hooks/use-incidents";
import type { Incident } from "@/lib/types";

export const Route = createFileRoute("/incidents")({ component: IncidentsPage });

const statusStyles: Record<string, string> = {
  open:          "bg-[oklch(0.62_0.24_18_/_15%)] text-[oklch(0.82_0.20_25)] border-[oklch(0.62_0.24_18_/_40%)]",
  investigating: "bg-[oklch(0.78_0.17_85_/_15%)] text-[oklch(0.88_0.16_90)] border-[oklch(0.78_0.17_85_/_40%)]",
  containment:   "bg-[oklch(0.70_0.20_40_/_15%)] text-[oklch(0.85_0.18_55)] border-[oklch(0.70_0.20_40_/_40%)]",
  resolved:      "bg-[oklch(0.70_0.18_150_/_15%)] text-[oklch(0.80_0.18_150)] border-[oklch(0.70_0.18_150_/_40%)]",
};

function IncidentDetail({ inc }: { inc: Incident }) {
  return (
    <Card className="glass-panel sticky top-20 h-fit p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground">{inc.id}</div>
          <h2 className="mt-1 text-lg font-bold leading-tight">{inc.title}</h2>
          <div className="mt-1.5 flex items-center gap-2">
            <SeverityBadge severity={inc.severity} />
            <Badge variant="outline" className={`text-[10px] uppercase ${statusStyles[inc.status] ?? ""}`}>
              {inc.status}
            </Badge>
          </div>
        </div>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-xs font-semibold text-primary-foreground">
            {inc.assignee !== "—" ? inc.assignee.slice(0, 2).toUpperCase() : "??"}
          </AvatarFallback>
        </Avatar>
      </div>
      <Separator className="my-3" />
      <Tabs defaultValue="timeline">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline"   className="text-xs">Timeline</TabsTrigger>
          <TabsTrigger value="evidence"   className="text-xs">Evidence</TabsTrigger>
          <TabsTrigger value="indicators" className="text-xs">IOCs</TabsTrigger>
          <TabsTrigger value="notes"      className="text-xs">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-3">
          <ScrollArea className="h-[360px] pr-2">
            <div className="space-y-3">
              {[
                { t: "09:18:02", a: "Ransomware indicator triggered on affected endpoint",        sev: "critical" as const },
                { t: "09:11:30", a: "Defense evasion: scheduled task with encoded command",        sev: "high"     as const },
                { t: "09:02:48", a: "Lateral movement via SMB to secondary server",               sev: "high"     as const },
                { t: "08:46:11", a: "Privilege escalation: token impersonation observed",          sev: "high"     as const },
                { t: "08:31:05", a: "Credential dump attempt against lsass.exe",                  sev: "medium"   as const },
                { t: "08:14:22", a: "Successful logon following 147 failures — brute force",       sev: "low"      as const },
              ].map((e) => (
                <div key={e.t} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`h-2 w-2 rounded-full ${e.sev === "critical" ? "bg-[oklch(0.62_0.24_18)]" : e.sev === "high" ? "bg-[oklch(0.70_0.20_40)]" : "bg-[oklch(0.78_0.17_85)]"}`} />
                    <div className="mt-1 w-px flex-1 bg-border/60" />
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="font-mono text-[10px] text-muted-foreground">{e.t}</div>
                    <div className="text-xs">{e.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="evidence" className="mt-3 space-y-2">
          {[
            "lsass_dump.dmp", "powershell_history.txt",
            "scheduled_tasks.xml", "network_capture.pcap",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 p-2 text-xs">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="flex-1 font-mono">{f}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2"><Eye className="h-3 w-3" /></Button>
            </div>
          ))}
          <div className="text-[11px] text-muted-foreground text-center py-1">
            {inc.evidence} evidence items associated with this incident
          </div>
        </TabsContent>
        <TabsContent value="indicators" className="mt-3 space-y-2">
          {inc.techniques.map((t) => (
            <div key={t} className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 p-2 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-[oklch(0.85_0.18_55)]" />
              <span className="flex-1 font-mono">{t}</span>
              <Badge variant="outline" className="text-[10px]">MITRE</Badge>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="notes" className="mt-3 space-y-2">
          <div className="rounded-md border border-border/60 bg-muted/30 p-2 text-xs">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3 w-3 text-primary" />
              <span className="font-semibold">{inc.assignee !== "—" ? inc.assignee : "system"}</span>
              <span className="text-[10px] text-muted-foreground">· auto-generated</span>
            </div>
            <div className="mt-1">Incident created from correlated events. Awaiting analyst triage.</div>
          </div>
          <Input placeholder="Add analyst note…" className="h-8 bg-muted/30 text-xs" />
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function IncidentsPage() {
  const [search,   setSearch]   = React.useState("");
  const [severity, setSeverity] = React.useState("all");
  const [selected, setSelected] = React.useState<Incident | null>(null);

  const { data, isLoading, isFetching, refetch } = useIncidents({ search, severity });

  const incidents = data?.data ?? [];
  const activeInc = selected ?? incidents[0] ?? null;

  // Auto-select first incident when data loads
  React.useEffect(() => {
    if (!selected && incidents.length > 0) setSelected(incidents[0]);
  }, [incidents, selected]);

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        eyebrow="Response"
        title="Incident Management"
        description={`${incidents.filter(i => i.status !== "resolved").length} active · ${data?.total ?? 0} total · ${data?.source === "splunk" ? "Splunk live" : "demo data"}`}
        actions={
          <>
            {data?.source === "splunk" ? (
              <Badge variant="outline" className="border-[oklch(0.70_0.18_150_/_40%)] bg-[oklch(0.70_0.18_150_/_10%)] text-[oklch(0.80_0.18_150)] text-[10px]">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[oklch(0.70_0.18_150)] inline-block animate-pulse" />Splunk Live
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                <WifiOff className="mr-1.5 h-3 w-3" />Demo data
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />Refresh
            </Button>
            <Button variant="outline" size="sm"><Filter   className="mr-1.5 h-3.5 w-3.5" />Filters</Button>
            <Button variant="outline" size="sm"><Download className="mr-1.5 h-3.5 w-3.5" />Export</Button>
            <Button size="sm" className="bg-gradient-to-r from-primary to-chart-2">
              <Plus className="mr-1.5 h-3.5 w-3.5" />New incident
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        {/* List panel */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ID, asset, technique, or analyst…"
              className="h-9 pl-9 bg-muted/30 border-border/60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2.5">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
              : incidents.map((inc) => {
                  const isSel = activeInc?.id === inc.id;
                  return (
                    <Card
                      key={inc.id}
                      onClick={() => setSelected(inc)}
                      className={`cursor-pointer p-4 transition-all hover:border-primary/50 ${isSel ? "border-primary/70 bg-card/80 shadow-lg shadow-primary/10" : "glass-panel"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted/40 border border-border/60">
                          <ShieldAlert className={`h-5 w-5 ${inc.severity === "critical" ? "text-[oklch(0.82_0.20_25)]" : inc.severity === "high" ? "text-[oklch(0.85_0.18_55)]" : "text-[oklch(0.88_0.16_90)]"}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] text-muted-foreground">{inc.id}</span>
                            <SeverityBadge severity={inc.severity} />
                            <Badge variant="outline" className={`font-mono text-[10px] uppercase ${statusStyles[inc.status] ?? ""}`}>{inc.status}</Badge>
                            <Badge variant="outline" className="text-[10px]">P{inc.priority}</Badge>
                          </div>
                          <div className="mt-1.5 font-semibold">{inc.title}</div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><User   className="h-3 w-3" />{inc.assignee}</span>
                            <span className="flex items-center gap-1"><Server className="h-3 w-3" />{inc.assets.join(", ")}</span>
                            <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{inc.evidence} evidence</span>
                            <span className="flex items-center gap-1"><Clock  className="h-3 w-3" />{formatDateTime(inc.createdAt)}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {inc.techniques.map(t => <Badge key={t} variant="outline" className="font-mono text-[10px]">{t}</Badge>)}
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>Investigation</span><span>{inc.progress}%</span>
                              </div>
                              <Progress value={inc.progress} className="mt-1 h-1.5" />
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] uppercase text-muted-foreground">Risk</div>
                              <div className="font-mono text-base font-bold text-[oklch(0.82_0.20_25)]">{inc.risk}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
          </div>
        </div>

        {/* Detail panel */}
        {activeInc ? (
          <IncidentDetail inc={activeInc} />
        ) : (
          <Card className="glass-panel flex items-center justify-center p-10 text-center text-muted-foreground">
            <div>
              <ShieldAlert className="mx-auto mb-2 h-8 w-8 opacity-30" />
              <div className="text-sm">Select an incident to view details</div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
