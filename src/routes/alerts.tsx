import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Filter, Bookmark, UserPlus, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, SeverityBadge, formatDateTime } from "@/components/shared";
import { useAlerts } from "@/hooks/use-alerts";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
});

function AlertsPage() {
  const [sev, setSev] = React.useState<string>("all");
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isFetching } = useAlerts({ severity: sev, search: q, page, pageSize: 25 });
  const filtered = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        eyebrow="Triage"
        title="Alerts"
        description={`${total} alerts matching filters · ${filtered.filter(a => a.status === "new").length} new · ${data?.source === "splunk" ? "Splunk live" : "demo data"}`}
        actions={
          <>
            <Button variant="outline" size="sm"><Bookmark className="mr-1.5 h-3.5 w-3.5" />Saved views</Button>
            <Button variant="outline" size="sm"><Download className="mr-1.5 h-3.5 w-3.5" />Export</Button>
          </>
        }
      />

      <Card className="glass-panel p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search alerts…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 pl-9 bg-muted/30 border-border/60" />
          </div>
          <Select value={sev} onValueChange={setSev}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="triaged">Triaged</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Filter className="mr-1.5 h-3.5 w-3.5" />Advanced</Button>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" disabled><UserPlus className="mr-1.5 h-3.5 w-3.5" />Assign</Button>
          </div>
        </div>
      </Card>

      <Card className="glass-panel overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="w-10"><Checkbox /></TableHead>
              <TableHead>Alert</TableHead>
              <TableHead className="w-24">Severity</TableHead>
              <TableHead className="w-32">Host</TableHead>
              <TableHead className="w-32">User</TableHead>
              <TableHead className="w-28">Technique</TableHead>
              <TableHead className="w-20">Conf.</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-28">Assignee</TableHead>
              <TableHead className="w-36">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => (
              <TableRow key={a.id} className="border-border/40 cursor-pointer hover:bg-muted/30">
                <TableCell><Checkbox /></TableCell>
                <TableCell>
                  <div className="font-medium">{a.title}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{a.id} · {a.sourceIp}</div>
                </TableCell>
                <TableCell><SeverityBadge severity={a.severity} /></TableCell>
                <TableCell className="font-mono text-xs">{a.host}</TableCell>
                <TableCell className="font-mono text-xs">{a.user}</TableCell>
                <TableCell><Badge variant="outline" className="font-mono text-[10px]">{a.technique.id}</Badge></TableCell>
                <TableCell><span className="font-mono text-xs">{a.confidence}%</span></TableCell>
                <TableCell><Badge variant="outline" className="text-[10px] uppercase">{a.status.replace("_", " ")}</Badge></TableCell>
                <TableCell className="font-mono text-xs">{a.assignee}</TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">{formatDateTime(a.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
