import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Globe, Mail, Hash, Link2, Server } from "lucide-react";
import { PageHeader, formatDateTime } from "@/components/shared";
import { IOCS } from "@/lib/mock";

export const Route = createFileRoute("/ioc")({
  component: IocPage,
});

const TYPE_ICON: Record<string, any> = { ip: Server, domain: Globe, url: Link2, sha256: Hash, email: Mail };

function IocPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader eyebrow="Intelligence" title="IOC Intelligence" description="184,392 indicators · 73 active matches in environment" />
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search IP, domain, hash, email…" className="h-9 pl-9 bg-muted/30 border-border/60" />
      </div>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({IOCS.length})</TabsTrigger>
          <TabsTrigger value="ip">IP</TabsTrigger>
          <TabsTrigger value="domain">Domain</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="sha256">Hash</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {IOCS.map((i) => {
              const Icon = TYPE_ICON[i.type] || Hash;
              return (
                <Card key={i.id} className="glass-panel p-4 transition-all hover:border-primary/50">
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted/50 border border-border/60"><Icon className="h-4 w-4 text-primary" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2"><Badge variant="outline" className="font-mono text-[10px] uppercase">{i.type}</Badge><span className="font-mono text-[10px] text-muted-foreground">{i.id}</span></div>
                      <div className="mt-1 break-all font-mono text-xs font-semibold">{i.value}</div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
                        <div><div className="font-mono text-base font-bold text-[oklch(0.82_0.20_25)]">{i.confidence}%</div><div className="text-muted-foreground">confidence</div></div>
                        <div><div className="font-mono text-base font-bold">{i.hits}</div><div className="text-muted-foreground">hits</div></div>
                        <div><div className="text-[10px] font-medium">{i.source.split(" ")[0]}</div><div className="text-muted-foreground">source</div></div>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                        <span>First seen {formatDateTime(i.firstSeen)}</span>
                        <Button variant="outline" size="sm" className="h-6 text-[10px]">Block</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
