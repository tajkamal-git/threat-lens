import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Siren, BellRing, ScrollText, BarChart3, Sparkles,
  Grid3x3, UserCog, KeyRound, MonitorSmartphone, Network, FileSearch,
  ShieldAlert, Globe2, FileCog, FolderKanban, FileBarChart, Search,
  Plug, Settings, UserRound, LifeBuoy, ShieldCheck,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";

const groups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Incidents", url: "/incidents", icon: Siren },
      { title: "Alerts", url: "/alerts", icon: BellRing },
      { title: "Live Logs", url: "/live-logs", icon: ScrollText },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "AI Analysis", url: "/ai-analysis", icon: Sparkles },
      { title: "MITRE ATT&CK", url: "/mitre", icon: Grid3x3 },
      { title: "IOC Intelligence", url: "/ioc", icon: ShieldAlert },
      { title: "Threat Intelligence", url: "/threat-intel", icon: Globe2 },
    ],
  },
  {
    label: "Telemetry",
    items: [
      { title: "User Behavior", url: "/uba", icon: UserCog },
      { title: "Authentication", url: "/authentication", icon: KeyRound },
      { title: "Endpoint Security", url: "/endpoint", icon: MonitorSmartphone },
      { title: "Network Monitoring", url: "/network", icon: Network },
      { title: "File Integrity", url: "/fim", icon: FileSearch },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Detection Rules", url: "/rules", icon: FileCog },
      { title: "Case Management", url: "/cases", icon: FolderKanban },
      { title: "Reports", url: "/reports", icon: FileBarChart },
      { title: "Search", url: "/search", icon: Search },
      { title: "Integrations", url: "/integrations", icon: Plug },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Profile", url: "/profile", icon: UserRound },
      { title: "Help", url: "/help", icon: LifeBuoy },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-chart-2 shadow-lg shadow-primary/20">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="text-sm font-bold tracking-tight text-gradient-brand">ThreatLens</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">SOC Platform</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
              {g.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted-foreground">All systems operational</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
