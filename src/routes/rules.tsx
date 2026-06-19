import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader, SeverityBadge } from "@/components/shared";
import { RULES } from "@/lib/mock";
import { Plus, Code2, Layers, Filter } from "lucide-react";

export const Route = createFileRoute("/rules")({
  component: RulesPage,
});

function RulesPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader eyebrow="Detection" title="Detection Rules" description={`${RULES.length} rules · ${RULES.filter(r=>r.enabled).length} enabled`}
        actions={<><Button variant="outline" size="sm"><Filter className="mr-1.5 h-3.5 w-3.5" />Filters</Button><Button size="sm" className="bg-gradient-to-r from-primary to-chart-2"><Plus className="mr-1.5 h-3.5 w-3.5" />New rule</Button></>} />
      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog"><Layers className="mr-1.5 h-3.5 w-3.5" />Catalog</TabsTrigger>
          <TabsTrigger value="builder"><Code2 className="mr-1.5 h-3.5 w-3.5" />Rule builder</TabsTrigger>
        </TabsList>
        <TabsContent value="catalog" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {RULES.map((r) => (
              <Card key={r.id} className="glass-panel p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground">{r.id}</div>
                    <div className="mt-0.5 font-semibold">{r.name}</div>
                  </div>
                  <Switch defaultChecked={r.enabled} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <SeverityBadge severity={r.severity} />
                  <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                  <Badge variant="outline" className="font-mono text-[10px]">{r.technique}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[10px]">
                  <div className="rounded-md border border-border/60 bg-muted/30 p-2"><div className="font-mono text-base font-bold">{r.fires}</div><div className="text-muted-foreground">fires / 30d</div></div>
                  <div className="rounded-md border border-border/60 bg-muted/30 p-2"><div className="font-mono text-base font-bold text-[oklch(0.78_0.17_85)]">{r.fp}</div><div className="text-muted-foreground">false +</div></div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="builder" className="mt-4">
          <Card className="glass-panel p-4">
            <div className="text-sm font-semibold">Graphical rule builder</div>
            <p className="text-xs text-muted-foreground">Drag condition blocks · combine with logical operators · preview matches before deploy</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_280px]">
              <div className="space-y-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 p-4">
                {[
                  { op: "WHEN", cond: "event_source = 'WinEventLog:Security'" },
                  { op: "AND", cond: "event_id IN (4625, 4771)" },
                  { op: "AND", cond: "COUNT(*) > 20 WITHIN 5m BY source_ip" },
                  { op: "AND", cond: "destination_user IN privileged_accounts" },
                  { op: "THEN", cond: "TRIGGER alert severity=high mitre=T1110.003" },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border border-border/60 bg-card/80 p-2.5">
                    <Badge className="bg-primary/15 text-primary border border-primary/40 font-mono text-[10px]">{b.op}</Badge>
                    <code className="font-mono text-xs">{b.cond}</code>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full border-dashed"><Plus className="mr-1.5 h-3.5 w-3.5" />Add condition</Button>
              </div>
              <Card className="border-border/60 bg-muted/20 p-3">
                <div className="text-xs font-semibold">Simulation preview</div>
                <div className="mt-2 space-y-1 text-[11px]">
                  <div className="flex justify-between"><span className="text-muted-foreground">Matches (7d)</span><span className="font-mono">142</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Unique hosts</span><span className="font-mono">28</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Est. false +</span><span className="font-mono text-[oklch(0.78_0.17_85)]">3%</span></div>
                </div>
                <Button size="sm" className="mt-3 w-full bg-gradient-to-r from-primary to-chart-2">Deploy rule</Button>
              </Card>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
