import { Bell, Search, Settings2, Sparkles, ChevronDown, Activity, Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-3 backdrop-blur-xl sm:px-4">
      <SidebarTrigger className="text-muted-foreground" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 hidden md:inline-flex">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm font-medium">Acme Federal</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Organization</DropdownMenuLabel>
          <DropdownMenuItem>Acme Federal</DropdownMenuItem>
          <DropdownMenuItem>Acme EMEA</DropdownMenuItem>
          <DropdownMenuItem>Acme APAC</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem><Plus className="mr-2 h-3.5 w-3.5" />Add workspace</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="relative ml-2 hidden flex-1 max-w-xl lg:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search hosts, users, IPs, hashes, MITRE techniques…"
          className="h-9 border-border/60 bg-muted/40 pl-9 pr-16 text-sm"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs md:flex">
          <Activity className="h-3.5 w-3.5 text-success" />
          <span className="font-mono text-muted-foreground">1.24B events/day</span>
          <span className="text-success">●</span>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Sparkles className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">12</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-1 gap-2 pl-1.5 pr-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-xs font-semibold text-primary-foreground">JM</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-semibold leading-tight">J. Morales</div>
                <div className="text-[10px] leading-tight text-muted-foreground">Tier 2 Analyst</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Signed in</DropdownMenuLabel>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Shift handoff</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
