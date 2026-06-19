import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PageHeader, SeverityBadge, formatDateTime } from "@/components/shared";
import { Award, Briefcase, Clock, MapPin } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader eyebrow="You" title="Analyst Profile" description="Workload, history and skills" />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="glass-panel p-5 text-center">
          <Avatar className="mx-auto h-24 w-24"><AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-2xl font-bold text-primary-foreground">JM</AvatarFallback></Avatar>
          <div className="mt-3 text-lg font-bold">Jordan Morales</div>
          <div className="text-sm text-muted-foreground">j.morales@acme.gov</div>
          <Badge variant="outline" className="mt-2 border-primary/40 bg-primary/10 text-primary">Tier 2 Incident Responder</Badge>
          <Separator className="my-4" />
          <div className="space-y-2 text-left text-xs">
            <div className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-muted-foreground" />Security Operations · Acme Federal</div>
            <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />Washington, DC</div>
            <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-muted-foreground" />Shift · 06:00 – 14:00 EST</div>
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full">Edit profile</Button>
        </Card>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[{l:"Open investigations",v:"7"},{l:"Resolved · 30d",v:"42"},{l:"Avg MTTR",v:"38m"}].map(s=>(
              <Card key={s.l} className="glass-panel p-4"><div className="text-[11px] uppercase text-muted-foreground">{s.l}</div><div className="mt-1 font-mono text-2xl font-bold text-primary">{s.v}</div></Card>
            ))}
          </div>
          <Card className="glass-panel p-4">
            <div className="mb-3 text-sm font-semibold">Assigned investigations</div>
            <div className="space-y-2">
              {[
                { id: "INC-2056", title: "Credential theft chain across 3 workstations", sev: "critical" as const, p: 64 },
                { id: "INC-2053", title: "Suspicious privilege escalation on DC", sev: "high" as const, p: 32 },
                { id: "INC-2049", title: "Beaconing to suspicious infrastructure", sev: "high" as const, p: 78 },
              ].map(i=>(
                <div key={i.id} className="rounded-md border border-border/60 bg-card/40 p-2.5">
                  <div className="flex items-center gap-2"><span className="font-mono text-[10px] text-muted-foreground">{i.id}</span><SeverityBadge severity={i.sev} /><span className="ml-auto font-mono text-[10px] text-muted-foreground">{i.p}%</span></div>
                  <div className="mt-1 text-sm">{i.title}</div>
                  <Progress value={i.p} className="mt-2 h-1" />
                </div>
              ))}
            </div>
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="glass-panel p-4">
              <div className="mb-3 flex items-center gap-2"><Award className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Certifications</span></div>
              <div className="space-y-2 text-xs">
                {["GCIH — GIAC Certified Incident Handler","GCFA — GIAC Certified Forensic Analyst","CISSP","CompTIA Security+","AWS Security Specialty"].map(c=>
                  <div key={c} className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 p-2"><Award className="h-3 w-3 text-[oklch(0.85_0.18_55)]" />{c}</div>)}
              </div>
            </Card>
            <Card className="glass-panel p-4">
              <div className="mb-3 text-sm font-semibold">Activity timeline</div>
              <div className="space-y-2 text-xs">
                {[
                  { a: "Closed INC-2044 — phishing campaign", t: new Date(Date.now()-3600e3).toISOString() },
                  { a: "Added note to INC-2056", t: new Date(Date.now()-7200e3).toISOString() },
                  { a: "Triaged 14 alerts in queue", t: new Date(Date.now()-9000e3).toISOString() },
                  { a: "Updated detection rule RULE-507", t: new Date(Date.now()-12000e3).toISOString() },
                ].map((e,i)=>(
                  <div key={i} className="flex justify-between gap-2 border-b border-border/40 pb-1.5"><span>{e.a}</span><span className="font-mono text-[10px] text-muted-foreground">{formatDateTime(e.t)}</span></div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
