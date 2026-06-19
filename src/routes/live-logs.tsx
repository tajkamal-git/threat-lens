import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Play, Pause, Search, Filter, Download, RefreshCw, WifiOff, Terminal,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, SeverityBadge, formatTime } from "@/components/shared";
import { useEvents } from "@/hooks/use-events";

export const Route = createFileRoute("/live-logs")({ component: LiveLogsPage });

function LiveLogsPage() {
  const [paused,   setPaused]   = React.useState(false);
  const [expanded, setExpanded] = React.useState<number | null>(null);
  const [severity, setSeverity] = React.useState("all");
  const [host,     setHost]     = React.useState("");
  const [source,   setSource]   = React.useState("all");

  const { data, isLoading, isFetching, refetch } = useEvents({
    limit:    100,
    severity: severity === "all" ? "all" : severity,
    host:     host,
    source:   source === "all" ? "" : source,
    range:    "15m",
    paused,
  });

  const events = data?.data ?? [];

  const SEV_COLORS: Record<string, string> = {
    critical: "oklch(0.62 0.24 18)",
    high:     "oklch(0.70 0.20 40)",
    medium:   "oklch(0.78 0.17 85)",
    low:      "oklch(0.72 0.15 200)",
    info:     "oklch(0.70 0.14 240)",
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        eyebrow="Monitoring"
        title="Live Log Stream"
        description="Real-time security events ingested from all configured data sources"
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
            <Button variant="outline" size="sm"><Download className="mr-1.5 h-3.5 w-3.5" />Export</Button>
            <Button
              size="sm"
              onClick={() => setPaused((p) => !p)}
              className={paused ? "bg-primary/20 text-primary border border-primary/40" : ""}
              variant={paused ? "outline" : "default"}
            >
              {paused
                ? <><Play  className="mr-1.5 h-3.5 w-3.5" />Resume</>
                : <><Pause className="mr-1.5 h-3.5 w-3.5" />Pause</>
              }
            </Button>
          </>
        }
      />

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total events",  value: events.length.toLocaleString(), color: "text-primary" },
          { label: "Critical",      value: events.filter(e => e.severity === "critical").length, color: "text-[oklch(0.82_0.20_25)]" },
          { label: "High",          value: events.filter(e => e.severity === "high").length,     color: "text-[oklch(0.85_0.18_55)]" },
          { label: "Medium",        value: events.filter(e => e.severity === "medium").length,   color: "text-[oklch(0.88_0.16_90)]" },
          { label: "Unique hosts",  value: new Set(events.map(e => e.host)).size,                color: "text-foreground" },
          { label: "Poll interval", value: paused ? "paused" : "3.5s",                           color: paused ? "text-muted-foreground" : "text-[oklch(0.80_0.18_150)]" },
        ].map(stat => (
          <div key={stat.label} className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs">
            <span className="text-muted-foreground">{stat.label}</span>
            <span className={`font-mono font-semibold ${stat.color}`}>{String(stat.value)}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card className="glass-panel p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by host…"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["all","critical","high","medium","low","info"].map(s => (
                <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["all","WinEventLog:Security","Sysmon","Linux:auth","Firewall:PaloAlto","EDR:CrowdStrike"].map(s => (
                <SelectItem key={s} value={s} className="text-xs">{s === "all" ? "All sources" : s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setSeverity("all"); setHost(""); setSource("all"); }}>
            Clear
          </Button>
          <span className="ml-auto text-[11px] text-muted-foreground font-mono">{events.length} events</span>
        </div>
      </Card>

      {/* Event stream */}
      <Card className="glass-panel overflow-hidden">
        {/* Header */}
        <div className="border-b border-border/60 bg-muted/20 px-3 py-2 flex items-center gap-3">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-xs font-mono font-semibold">SECURITY EVENT STREAM</span>
          {isFetching && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
          <span className={`ml-auto h-2 w-2 rounded-full ${paused ? "bg-muted-foreground" : "bg-[oklch(0.70_0.18_150)] animate-pulse"}`} />
        </div>

        <ScrollArea className="h-[calc(100vh-22rem)]">
          <div className="font-mono text-[11px] divide-y divide-border/30">
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-10 mx-3 my-1.5 rounded" />)
              : events.length === 0
                ? (
                  <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                    <Terminal className="h-8 w-8 opacity-30" />
                    <div className="text-sm">No events match current filters</div>
                  </div>
                )
                : events.map((e, idx) => {
                  const isExp = expanded === idx;
                  return (
                    <div
                      key={`${e.id}-${e.timestamp}`}
                      className={`cursor-pointer px-3 py-2 transition-colors hover:bg-muted/30 animate-in fade-in ${isExp ? "bg-muted/20" : ""}`}
                      onClick={() => setExpanded(isExp ? null : idx)}
                    >
                      {/* Compact row */}
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: SEV_COLORS[e.severity] ?? "#888" }} />
                        <span className="text-muted-foreground w-20 shrink-0">{formatTime(e.timestamp)}</span>
                        <SeverityBadge severity={e.severity} />
                        <span className="text-primary w-10 shrink-0">E{e.eventId}</span>
                        <span className="text-foreground/80 w-24 shrink-0 truncate">{e.host}</span>
                        <span className="text-muted-foreground w-20 shrink-0 truncate">{e.user}</span>
                        <span className="flex-1 truncate text-foreground/90">{e.message}</span>
                        <span className="text-muted-foreground/60 shrink-0 hidden md:block">{e.source}</span>
                      </div>

                      {/* Expanded detail */}
                      {isExp && (
                        <div className="mt-2 ml-4 grid grid-cols-2 gap-x-6 gap-y-1 rounded border border-border/40 bg-background/60 p-3 text-[11px] md:grid-cols-3">
                          {[
                            ["Event ID",   e.eventId],
                            ["Timestamp",  e.timestamp],
                            ["Host",       e.host],
                            ["User",       e.user],
                            ["Source IP",  e.sourceIp],
                            ["Source",     e.source],
                            ["Severity",   e.severity],
                          ].map(([k, v]) => (
                            <div key={String(k)}>
                              <div className="text-muted-foreground">{k}</div>
                              <div className="text-foreground">{String(v)}</div>
                            </div>
                          ))}
                          <div className="col-span-full">
                            <div className="text-muted-foreground">Message</div>
                            <div className="text-foreground break-all">{e.message}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
            }
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
