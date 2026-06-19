import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared";
import { INTEGRATIONS } from "@/lib/mock";
import { CheckCircle2, XCircle, Plus, Plug } from "lucide-react";

export const Route = createFileRoute("/integrations")({
  component: IntegrationsPage,
});

function statusBadge(s: string) {
  if (s === "connected") return <Badge variant="outline" className="border-success/40 bg-success/10 text-success text-[10px]"><CheckCircle2 className="mr-1 h-2.5 w-2.5" />Connected</Badge>;
  if (s === "disconnected") return <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive text-[10px]"><XCircle className="mr-1 h-2.5 w-2.5" />Disconnected</Badge>;
  return <Badge variant="outline" className="text-[10px]">Available</Badge>;
}

function IntegrationsPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader eyebrow="Data" title="Integrations" description={`${INTEGRATIONS.filter(i=>i.status==="connected").length} of ${INTEGRATIONS.length} sources connected`}
        actions={<Button size="sm" className="bg-gradient-to-r from-primary to-chart-2"><Plus className="mr-1.5 h-3.5 w-3.5" />Add integration</Button>} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {INTEGRATIONS.map((i) => (
          <Card key={i.name} className="glass-panel p-4 transition-all hover:border-primary/50">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary/20 to-chart-2/20 border border-primary/30"><Plug className="h-5 w-5 text-primary" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2"><div className="font-semibold truncate">{i.name}</div>{statusBadge(i.status)}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{i.category}</div>
                <div className="mt-2 font-mono text-[10px] text-muted-foreground">Ingest: {i.events}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs">Configure</Button>
              {i.status === "connected" ? <Button variant="ghost" size="sm" className="flex-1 text-xs text-destructive">Disconnect</Button>
                : <Button size="sm" className="flex-1 text-xs bg-gradient-to-r from-primary to-chart-2">Connect</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
