import * as React from "react";
import { Outlet, createRootRouteWithContext, Link } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/topbar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// ─── Router context type ──────────────────────────────────────────────────────

interface RouterContext {
  queryClient: QueryClient;
}

// ─── 404 ─────────────────────────────────────────────────────────────────────

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold" style={{ color: "oklch(0.72 0.16 200)" }}>
          404
        </h1>
        <h2 className="mt-4 text-xl font-semibold">Signal not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This route isn't part of the workspace.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

// ─── Error boundary ───────────────────────────────────────────────────────────

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  React.useEffect(() => {
    console.error("[ThreatLens] Render error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border border-destructive/40 bg-destructive/10">
          <span className="font-mono text-2xl font-bold text-destructive">!</span>
        </div>
        <h1 className="text-xl font-semibold">Something disrupted this view</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred. Try reloading or return to the dashboard.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => reset()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <Link
            to="/"
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Root route ───────────────────────────────────────────────────────────────

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// ─── Shell layout ─────────────────────────────────────────────────────────────

function RootComponent() {
  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3.25rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <TopBar />
          <main className="min-h-[calc(100vh-3.5rem)]">
            <Outlet />
          </main>
        </SidebarInset>
        <Toaster theme="dark" />
      </SidebarProvider>
    </TooltipProvider>
  );
}
