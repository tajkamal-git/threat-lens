import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Send, Sparkles, Brain, User, Zap, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/shared";

export const Route = createFileRoute("/ai-analysis")({
  component: AiPage,
});

const SUGGESTIONS = [
  "Summarize the top 3 incidents in the last 24h",
  "What is the lateral movement path from WIN-DC01?",
  "Explain detection rule RULE-507 in plain language",
  "Show me unusual authentication patterns for j.morales",
];

function AiPage() {
  const messages = [
    { role: "user" as const, content: "Investigate the spike in failed logons on WIN-DC01." },
    { role: "assistant" as const, content: "I correlated 147 failed authentication events between 08:14 and 08:31 UTC against WIN-DC01. The source IP 185.220.101.5 (Tor exit node, RU) attempted 12 distinct privileged accounts followed by a single success on svc_backup. This pattern is consistent with **T1110.003 — Password Spraying** transitioning into **T1078 — Valid Accounts**. Confidence: 92%.", techniques: ["T1110.003", "T1078"], confidence: 92 },
    { role: "user" as const, content: "What should I do next?" },
    { role: "assistant" as const, content: "Recommended response sequence: (1) disable svc_backup immediately, (2) rotate krbtgt twice with 24h delay, (3) block 185.220.101.5/32 at the perimeter and EDR, (4) review all Kerberos tickets issued after 08:31 from WIN-DC01, (5) open priority-1 incident and escalate to Tier 3.", techniques: [], confidence: 96 },
  ];
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        eyebrow="Copilot"
        title="AI Investigation Assistant"
        description="GPT-Sec v4.2 · fine-tuned on 2.4M SOC investigations"
        actions={<Badge variant="outline" className="border-success/40 bg-success/10 text-success"><span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success animate-pulse" />Online</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="glass-panel flex h-[640px] flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-chart-2"><Brain className="h-4 w-4 text-primary-foreground" /></div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "border border-border/60 bg-card/60"}`}>
                    <div className="whitespace-pre-wrap leading-relaxed">{m.content.split("**").map((s, j) => j % 2 === 1 ? <strong key={j}>{s}</strong> : s)}</div>
                    {m.role === "assistant" && m.techniques && m.techniques.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.techniques.map((t) => <Badge key={t} variant="outline" className="font-mono text-[10px]">{t}</Badge>)}
                        <Badge className="bg-success/15 text-success border-success/40 border text-[10px]">{m.confidence}% confidence</Badge>
                      </div>
                    )}
                  </div>
                  {m.role === "user" && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted"><User className="h-4 w-4" /></div>}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t border-border/60 p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => <button key={s} className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] hover:bg-muted">{s}</button>)}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Ask anything — investigate, summarize, or recommend an action…" className="h-10 bg-muted/30 border-border/60" />
              <Button className="bg-gradient-to-r from-primary to-chart-2"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="glass-panel p-4">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Investigation context</span></div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="rounded-md border border-border/60 bg-muted/30 p-2"><div className="text-[10px] uppercase text-muted-foreground">Active incident</div><div className="font-mono">INC-2056</div></div>
              <div className="rounded-md border border-border/60 bg-muted/30 p-2"><div className="text-[10px] uppercase text-muted-foreground">Assets in scope</div><div className="font-mono">WIN-DC01, SRV-DB-PROD-02</div></div>
              <div className="rounded-md border border-border/60 bg-muted/30 p-2"><div className="text-[10px] uppercase text-muted-foreground">Time window</div><div className="font-mono">08:00 — 10:00 UTC</div></div>
            </div>
          </Card>
          <Card className="glass-panel p-4">
            <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Quick actions</span></div>
            <div className="mt-3 space-y-1.5">
              {["Generate executive summary", "Draft remediation playbook", "Map to MITRE", "Find similar incidents"].map((a) =>
                <Button key={a} variant="outline" size="sm" className="w-full justify-start text-xs">{a}</Button>)}
            </div>
          </Card>
          <Card className="glass-panel p-4">
            <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Recent investigations</span></div>
            <div className="mt-3 space-y-2 text-xs">
              {["DCSync attempt — Dec 12", "Phishing → token theft — Dec 11", "Ransomware staging — Dec 10"].map((t) =>
                <div key={t} className="rounded-md border border-border/40 bg-card/40 p-2 hover:bg-card cursor-pointer">{t}</div>)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
