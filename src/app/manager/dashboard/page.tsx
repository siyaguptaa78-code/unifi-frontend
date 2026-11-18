"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PortalLayout } from "@/components/layout/portal-layout";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Coins,
  Clock,
  Users,
  AlertTriangle,
  Utensils,
  History,
  FileBarChart,
  ArrowRight,
} from "lucide-react";
import { formatPoints, formatMinutes } from "@/lib/utils";
import { useAuth } from "@/components/providers";

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/operations/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  const kpis = data?.kpis;
  const alerts = data?.alerts || [];

  return (
    <PortalLayout allowedRoles={["MANAGER", "SUPER_ADMIN"]}>
      <DashboardHeader
        title="Store Operations"
        description="Assigned cafe operational performance, live kitchen queue, menu availability and card access."
        badge="Manager Console"
      />

      {/* Operational Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((al: any, idx: number) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
                al.level === "danger"
                  ? "border-red-500/40 bg-red-950/20 text-red-300"
                  : al.level === "warning"
                  ? "border-amber-500/40 bg-amber-950/20 text-amber-300"
                  : "border-blue-500/40 bg-blue-950/20 text-blue-300"
              }`}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{al.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Sales (Points)"
          value={formatPoints(kpis?.salesPoints)}
          subtitle="Redeemed on cafe menu"
          icon={Coins}
          highlight={true}
        />
        <StatCard
          title="Active Check-Ins"
          value={kpis?.activeVisits ?? 0}
          subtitle="Currently inside the cafe"
          icon={Clock}
        />
        <StatCard
          title="Orders Today"
          value={kpis?.orders ?? 0}
          subtitle={`${kpis?.pendingOrders ?? 0} pending acceptance`}
          icon={ShoppingBag}
        />
        <StatCard
          title="Hours Consumed"
          value={`${kpis?.hoursUsed ?? 0} hrs`}
          subtitle="Total member cafe usage"
          icon={History}
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Card className="border-stone-800 bg-stone-900/60 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Live Order Queue</span>
            </div>
            <p className="text-xs text-stone-400">
              Manage incoming tickets, mark food preparing and ready for counter pickup.
            </p>
          </div>
          <Link href="/manager/orders" className="pt-4">
            <Button size="sm" variant="secondary" className="w-full text-xs">
              Manage Orders &rarr;
            </Button>
          </Link>
        </Card>

        <Card className="border-stone-800 bg-stone-900/60 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
              <Utensils className="h-4 w-4" />
              <span>Menu Availability</span>
            </div>
            <p className="text-xs text-stone-400">
              Toggle 86&apos;d (out-of-stock) items instantly or submit local price requests.
            </p>
          </div>
          <Link href="/manager/menu" className="pt-4">
            <Button size="sm" variant="secondary" className="w-full text-xs">
              Configure Menu &rarr;
            </Button>
          </Link>
        </Card>

        <Card className="border-stone-800 bg-stone-900/60 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
              <FileBarChart className="h-4 w-4" />
              <span>Daily Sales Reports</span>
            </div>
            <p className="text-xs text-stone-400">
              Generate daily cafe sales reports, points redeemed, and export CSV files.
            </p>
          </div>
          <Link href="/manager/reports" className="pt-4">
            <Button size="sm" variant="secondary" className="w-full text-xs">
              View Reports &rarr;
            </Button>
          </Link>
        </Card>
      </div>
    </PortalLayout>
  );
}

