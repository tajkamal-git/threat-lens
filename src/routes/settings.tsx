import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function Row({ label, desc, control }: { label: string; desc: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0"><div className="text-sm font-medium">{label}</div><div className="text-xs text-muted-foreground">{desc}</div></div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader eyebrow="Workspace" title="Settings" description="Tailor ThreatLens to your team's workflow" />
      <Tabs defaultValue="org" orientation="vertical" className="grid gap-4 lg:grid-cols-[200px_1fr]">
        <TabsList className="flex h-auto flex-col items-stretch gap-1 bg-transparent">
          {[["org","Organization"],["appearance","Appearance"],["notifications","Notifications"],["security","Security"],["analyst","Analyst preferences"],["api","API & tokens"]].map(([v,l])=>(
            <TabsTrigger key={v} value={v} className="justify-start data-[state=active]:bg-muted">{l}</TabsTrigger>
          ))}
        </TabsList>
        <Card className="glass-panel p-5">
          <TabsContent value="org" className="m-0 space-y-1 divide-y divide-border/40">
            <Row label="Organization name" desc="Displayed across the workspace" control={<Input defaultValue="Acme Federal" className="w-64" />} />
            <Row label="Default time zone" desc="Used for timestamps & reports" control={<Select defaultValue="utc"><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="utc">UTC</SelectItem><SelectItem value="est">US/Eastern</SelectItem><SelectItem value="pst">US/Pacific</SelectItem></SelectContent></Select>} />
            <Row label="Data retention" desc="How long hot data stays searchable" control={<Select defaultValue="90"><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="30">30 days</SelectItem><SelectItem value="90">90 days</SelectItem><SelectItem value="365">1 year</SelectItem></SelectContent></Select>} />
          </TabsContent>
          <TabsContent value="appearance" className="m-0 space-y-1 divide-y divide-border/40">
            <Row label="Theme" desc="Optimized for dark SOC environments" control={<Select defaultValue="dark"><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dark">Dark</SelectItem><SelectItem value="midnight">Midnight</SelectItem></SelectContent></Select>} />
            <Row label="Density" desc="Compact for power users" control={<Select defaultValue="compact"><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="compact">Compact</SelectItem><SelectItem value="comfortable">Comfortable</SelectItem></SelectContent></Select>} />
            <Row label="Reduce motion" desc="Disable non-essential animations" control={<Switch />} />
          </TabsContent>
          <TabsContent value="notifications" className="m-0 space-y-1 divide-y divide-border/40">
            <Row label="Critical incidents" desc="Page on-call analyst immediately" control={<Switch defaultChecked />} />
            <Row label="High severity alerts" desc="Push to Slack #soc-alerts" control={<Switch defaultChecked />} />
            <Row label="Daily executive digest" desc="Email summary at 08:00 local" control={<Switch defaultChecked />} />
            <Row label="Rule false-positive spikes" desc="Notify rule owner" control={<Switch />} />
          </TabsContent>
          <TabsContent value="security" className="m-0 space-y-1 divide-y divide-border/40">
            <Row label="Enforce SSO" desc="Disable local password logins" control={<Switch defaultChecked />} />
            <Row label="Multi-factor authentication" desc="Required for all analysts" control={<Switch defaultChecked />} />
            <Row label="Session timeout" desc="Auto-lock inactive sessions" control={<Select defaultValue="30"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15 min</SelectItem><SelectItem value="30">30 min</SelectItem><SelectItem value="60">1 hour</SelectItem></SelectContent></Select>} />
            <Row label="IP allowlist" desc="Restrict console access by CIDR" control={<Switch />} />
          </TabsContent>
          <TabsContent value="analyst" className="m-0 space-y-1 divide-y divide-border/40">
            <Row label="Default landing page" desc="Where the console opens" control={<Select defaultValue="dash"><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dash">Dashboard</SelectItem><SelectItem value="alerts">Alerts queue</SelectItem><SelectItem value="incidents">Incidents</SelectItem></SelectContent></Select>} />
            <Row label="Auto-assign new alerts" desc="Based on rotation schedule" control={<Switch defaultChecked />} />
            <Row label="Keyboard shortcuts" desc="Vim-style navigation" control={<Switch />} />
          </TabsContent>
          <TabsContent value="api" className="m-0 space-y-3">
            <div><Label>API base URL</Label><Input readOnly value="https://api.threatlens.acme.local/v2" className="mt-1 font-mono text-xs" /></div>
            <Separator />
            <div><Label>Personal access token</Label><div className="mt-1 flex gap-2"><Input readOnly value="tl_pat_••••••••••••••••••••••••" className="font-mono text-xs" /><Button variant="outline" size="sm">Regenerate</Button></div></div>
            <div className="text-xs text-muted-foreground">Tokens grant the same access as your user account. Rotate after staff changes.</div>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
