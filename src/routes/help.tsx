import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared";
import { BookOpen, MessageCircle, Keyboard, LifeBuoy, Search, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/help")({
  component: HelpPage,
});

function HelpPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader eyebrow="Support" title="Help & Documentation" description="Find answers, learn the platform, or contact the ThreatLens team" />
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search documentation…" className="h-10 pl-9 bg-muted/30 border-border/60" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: BookOpen, t: "Getting started", d: "Onboard your team, connect sources, configure detections" },
          { icon: Keyboard, t: "Keyboard shortcuts", d: "Navigate faster with vim-style bindings" },
          { icon: MessageCircle, t: "Analyst playbooks", d: "Step-by-step response for common incident types" },
          { icon: LifeBuoy, t: "Contact support", d: "24/7 priority support for enterprise customers" },
          { icon: BookOpen, t: "API reference", d: "Programmatic access to alerts, incidents and search" },
          { icon: BookOpen, t: "Detection library", d: "1,284 prebuilt rules mapped to MITRE ATT&CK" },
        ].map((h) => (
          <Card key={h.t} className="glass-panel p-4 transition-all hover:border-primary/50 cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary/20 to-chart-2/20 border border-primary/30"><h.icon className="h-5 w-5 text-primary" /></div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{h.t}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{h.d}</div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="glass-panel p-5">
        <div className="flex items-center gap-2"><Keyboard className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Keyboard shortcuts</span></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["⌘ K","Open command palette"],["g d","Go to Dashboard"],["g i","Go to Incidents"],
            ["g a","Go to Alerts"],["g l","Go to Live Logs"],["/","Focus search"],
            ["j / k","Next / previous item"],["e","Escalate selected"],["a","Assign to me"],
          ].map(([k,d])=>(
            <div key={k} className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs">
              <span>{d}</span><kbd className="rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[10px]">{k}</kbd>
            </div>
          ))}
        </div>
      </Card>
      <Card className="glass-panel flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="text-sm font-semibold">Need to talk to a human?</div>
          <div className="text-xs text-muted-foreground">Enterprise support · response under 15 minutes for P1 incidents</div>
        </div>
        <Badge variant="outline" className="border-success/40 bg-success/10 text-success"><span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success animate-pulse" />On-call available</Badge>
        <Button className="bg-gradient-to-r from-primary to-chart-2"><LifeBuoy className="mr-1.5 h-3.5 w-3.5" />Open a ticket</Button>
      </Card>
    </div>
  );
}
