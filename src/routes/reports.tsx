import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared";
import { FileText, FileSpreadsheet, FileJson, FileCode2, Eye, Download, Calendar, Plus } from "lucide-react";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

const REPORTS = [
  { title: "Weekly Executive Brief", desc: "Posture summary, key incidents, KPI deltas", type: "PDF", icon: FileText, period: "Weekly" },
  { title: "MITRE Coverage Report", desc: "Detection coverage across enterprise matrix", type: "PDF", icon: FileText, period: "Monthly" },
  { title: "Incident Roll-up", desc: "Complete incident dataset with timelines", type: "CSV", icon: FileSpreadsheet, period: "Daily" },
  { title: "IOC Match Feed", desc: "All IOC hits with source and confidence", type: "JSON", icon: FileJson, period: "Realtime" },
  { title: "Compliance: SOC 2", desc: "Authentication and access audit", type: "HTML", icon: FileCode2, period: "Quarterly" },
  { title: "Compliance: PCI-DSS", desc: "Cardholder data environment monitoring", type: "PDF", icon: FileText, period: "Quarterly" },
  { title: "Threat Hunt Findings", desc: "Hypothesis-driven hunt results", type: "PDF", icon: FileText, period: "Bi-weekly" },
  { title: "Endpoint Health", desc: "Agent coverage and drift report", type: "CSV", icon: FileSpreadsheet, period: "Weekly" },
];

function ReportsPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader eyebrow="Output" title="Reports" description="Pre-built and scheduled reports for analysts, leadership and compliance"
        actions={<Button size="sm" className="bg-gradient-to-r from-primary to-chart-2"><Plus className="mr-1.5 h-3.5 w-3.5" />New report</Button>} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {REPORTS.map((r) => (
          <Card key={r.title} className="glass-panel p-4 transition-all hover:border-primary/50">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary/20 to-chart-2/20 border border-primary/30"><r.icon className="h-5 w-5 text-primary" /></div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{r.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{r.desc}</div>
                <div className="mt-2 flex items-center gap-2"><Badge variant="outline" className="text-[10px]">{r.type}</Badge><Badge variant="outline" className="text-[10px]"><Calendar className="mr-1 h-2.5 w-2.5" />{r.period}</Badge></div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1"><Eye className="mr-1.5 h-3.5 w-3.5" />Preview</Button>
              <Button variant="outline" size="sm" className="flex-1"><Download className="mr-1.5 h-3.5 w-3.5" />Download</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
