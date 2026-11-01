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
        "rounded-xl border border-stone-800/80 bg-stone-900/70 p-5 shadow-sm transition-all hover:border-stone-700/80",
        highlight && "border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-stone-900/60 to-stone-900/60",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="rounded-lg bg-stone-800/80 p-2 text-amber-500">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-bold tracking-tight text-stone-100">{value}</div>
      </div>
      {subtitle && <p className="mt-1 text-xs text-stone-400">{subtitle}</p>}
      {trend && (
        <div className="mt-2 flex items-center text-xs font-medium">
          <span className={trend.value >= 0 ? "text-emerald-400" : "text-red-400"}>
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="ml-1.5 text-stone-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

