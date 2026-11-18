"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/providers";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  action?: React.ReactNode;
}

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Hero header for dashboards: time-of-day greeting, today's date, title and primary actions. */
export function DashboardHeader({ title, description, badge, action }: DashboardHeaderProps) {
  const { user } = useAuth();
  // Computed after mount so server and client markup always match.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const firstName = (user?.name ?? "").replace(/\s*\(.*\)\s*$/, "").split(" ")[0];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-stone-800/80 bg-gradient-to-br from-stone-900 via-stone-900/80 to-amber-950/30 p-6 sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }}
      />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
            {badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-semibold text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                {badge}
              </span>
            )}
            {now && <span>{now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>}
          </div>
          <p className="mt-3 text-sm font-medium text-amber-300/90">
            {now ? greetingFor(now.getHours()) : "Welcome"}
            {firstName ? `, ${firstName}` : ""} 👋
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm text-stone-400">{description}</p>}
        </div>
        {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
      </div>
    </section>
  );
}
