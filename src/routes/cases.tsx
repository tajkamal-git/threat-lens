import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { PageHeader, SeverityBadge, formatDateTime } from "@/components/shared";
import { INCIDENTS } from "@/lib/mock";
import { FileText, MessageSquare, Paperclip, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cases")({
  component: CasesPage,
});

const COLUMNS = [
  { id: "open", label: "Open", filter: (s: string) => s === "open" },
  { id: "investigating", label: "Investigating", filter: (s: string) => s === "investigating" },
  { id: "containment", label: "Containment", filter: (s: string) => s === "containment" },
  { id: "resolved", label: "Resolved", filter: (s: string) => s === "resolved" },
];

function CasesPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader eyebrow="Workflow" title="Case Management" description="Kanban-style investigation board with full audit trail"
        actions={<Button size="sm" className="bg-gradient-to-r from-primary to-chart-2"><Plus className="mr-1.5 h-3.5 w-3.5" />New case</Button>} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const cases = INCIDENTS.filter(i => col.filter(i.status));
          return (
            <div key={col.id} className="rounded-lg border border-border/60 bg-muted/20 p-2">
              <div className="mb-2 flex items-center justify-between px-1.5"><span className="text-sm font-semibold">{col.label}</span><Badge variant="outline" className="font-mono text-[10px]">{cases.length}</Badge></div>
              <div className="space-y-2">
                {cases.map((c) => (
                  <Card key={c.id} className="glass-panel p-3 cursor-grab hover:border-primary/50">
                    <div className="flex items-center gap-2"><span className="font-mono text-[10px] text-muted-foreground">{c.id}</span><SeverityBadge severity={c.severity} className="ml-auto" /></div>
                    <div className="mt-1.5 text-sm font-semibold leading-tight">{c.title}</div>
                    <div className="mt-2 flex flex-wrap gap-1">{c.techniques.map(t => <Badge key={t} variant="outline" className="font-mono text-[9px]">{t}</Badge>)}</div>
                    <Progress value={c.progress} className="mt-3 h-1" />
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Avatar className="h-5 w-5"><AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-[9px] text-primary-foreground">{c.assignee.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                      <span className="font-mono">{c.assignee}</span>
                      <span className="ml-auto flex items-center gap-2"><FileText className="h-3 w-3" />{c.evidence}<MessageSquare className="h-3 w-3" />{2 + (c.priority * 3)}<Paperclip className="h-3 w-3" />{1 + c.priority}</span>
                    </div>
                    <div className="mt-1.5 font-mono text-[9px] text-muted-foreground">{formatDateTime(c.createdAt)}</div>
                  </Card>
                ))}
                {cases.length === 0 && <div className="rounded-md border border-dashed border-border/60 p-4 text-center text-[10px] text-muted-foreground">No cases</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
