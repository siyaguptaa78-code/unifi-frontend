import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
  highlight?: boolean;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className, highlight }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-stone-800/80 bg-gradient-to-b from-stone-900/90 to-stone-900/50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-700 hover:shadow-lg hover:shadow-black/30",
        highlight && "border-amber-500/40 from-amber-950/40 to-stone-900/60 hover:border-amber-500/60",
        className
      )}
    >
      {/* soft accent glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity",
          highlight ? "bg-amber-500/20" : "bg-amber-500/5 group-hover:bg-amber-500/10"
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">{title}</span>
        {Icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
              highlight ? "bg-amber-500/20 text-amber-300 ring-amber-500/40" : "bg-stone-800/80 text-amber-500 ring-stone-700/60"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="relative mt-3 text-[1.7rem] font-bold leading-none tracking-tight text-white tabular-nums">{value}</div>
      {subtitle && <p className="relative mt-2 text-xs text-stone-400">{subtitle}</p>}
      {trend && (
        <div className="relative mt-2 flex items-center text-xs font-medium">
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5",
              trend.value >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            )}
          >
            {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}%
          </span>
          <span className="ml-1.5 text-stone-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
