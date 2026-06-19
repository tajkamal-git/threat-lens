/**
 * ThreatLens — Shared UI Components
 *
 * Reusable components consumed across multiple routes.
 * Data-source agnostic — works with both mock (Phase 0) and live data (Phase 1+).
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { Severity, UiTone } from "@/lib/types";
import { SEVERITY_BADGE_CLASS, KPI_TONE_TEXT, KPI_TONE_SPARK } from "@/lib/constants";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

// ─── Severity Badge ───────────────────────────────────────────────────────────

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-[10px] uppercase tracking-wider",
        SEVERITY_BADGE_CLASS[severity],
        className,
      )}
    >
      {severity}
    </Badge>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CLASS: Record<string, string> = {
  open:          "bg-[oklch(0.62_0.24_18_/_15%)] text-[oklch(0.82_0.20_25)] border-[oklch(0.62_0.24_18_/_40%)]",
  investigating: "bg-[oklch(0.78_0.17_85_/_15%)] text-[oklch(0.88_0.16_90)] border-[oklch(0.78_0.17_85_/_40%)]",
  containment:   "bg-[oklch(0.70_0.20_40_/_15%)] text-[oklch(0.85_0.18_55)] border-[oklch(0.70_0.20_40_/_40%)]",
  resolved:      "bg-[oklch(0.70_0.18_150_/_15%)] text-[oklch(0.80_0.18_150)] border-[oklch(0.70_0.18_150_/_40%)]",
  new:           "bg-[oklch(0.62_0.24_18_/_15%)] text-[oklch(0.82_0.20_25)] border-[oklch(0.62_0.24_18_/_40%)]",
  triaged:       "bg-[oklch(0.78_0.17_85_/_15%)] text-[oklch(0.88_0.16_90)] border-[oklch(0.78_0.17_85_/_40%)]",
  in_progress:   "bg-[oklch(0.70_0.20_40_/_15%)] text-[oklch(0.85_0.18_55)] border-[oklch(0.70_0.20_40_/_40%)]",
  closed:        "bg-[oklch(0.30_0.02_250_/_40%)] text-muted-foreground border-[oklch(0.35_0.02_250_/_40%)]",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-mono text-[10px] uppercase", STATUS_CLASS[status] ?? "", className)}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </div>
        )}
        <h1 className="truncate text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

// ─── Animated Number ──────────────────────────────────────────────────────────

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [n, setN] = React.useState(0);

  React.useEffect(() => {
    const dur = 900;
    const start = performance.now();
    let raf: number;

    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <>
      {n.toLocaleString()}
      {suffix}
    </>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number;
  suffix?: string;
  delta?: number;
  icon: React.ComponentType<{ className?: string }>;
  spark?: Array<{ x: number; y: number }>;
  tone?: UiTone;
}

export function KpiCard({
  label,
  value,
  suffix,
  delta,
  icon: Icon,
  spark,
  tone = "default",
}: KpiCardProps) {
  const gradId = React.useId();

  return (
    <Card className="glass-panel relative overflow-hidden p-4 transition-all hover:border-primary/40">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className={cn("mt-1.5 font-mono text-2xl font-bold tracking-tight", KPI_TONE_TEXT[tone])}>
            <AnimatedNumber value={value} suffix={suffix} />
          </div>
          {delta !== undefined && (
            <div
              className={cn(
                "mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium",
                delta >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {delta >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(delta)}%{" "}
              <span className="ml-1 font-normal text-muted-foreground">vs 24h</span>
            </div>
          )}
        </div>
        <div className={cn("grid h-9 w-9 place-items-center rounded-lg border border-border/60 bg-muted/40", KPI_TONE_TEXT[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {spark && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 opacity-70">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%"   stopColor={KPI_TONE_SPARK[tone]} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={KPI_TONE_SPARK[tone]} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="y"
                stroke={KPI_TONE_SPARK[tone]}
                strokeWidth={1.5}
                fill={`url(#${gradId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

export function StatPill({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-mono font-semibold", tone)}>{value}</span>
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-muted/10 p-10 text-center">
      {Icon && (
        <div className="grid h-12 w-12 place-items-center rounded-full bg-muted/40 text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div>
        <div className="font-semibold">{title}</div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1_048_576)  return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
}
