"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Store, ShoppingBag, Coins, History, Users, AlertTriangle, ArrowRight } from "lucide-react";
import { formatPoints, formatMinutes } from "@/lib/utils";
import { useAuth } from "@/components/providers";

export default function SupervisorDashboardPage() {
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
  const cafes = data?.cafes || [];
  const alerts = data?.alerts || [];

  return (
    <PortalLayout allowedRoles={["SUPERVISOR", "SUPER_ADMIN"]}>
      <PageHeader
        title={`Supervisor Console — Welcome, ${user?.name}`}
        description="Regional operational performance, assigned store monitoring, order throughput and staff oversight."
        badge="Area Supervisor"
      />

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((al: any, idx: number) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-950/20 text-xs text-amber-300 flex items-center gap-3"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{al.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Cafes"
          value={kpis?.cafes ?? 0}
          subtitle="Regional managed stores"
          icon={Store}
          highlight={true}
        />
        <StatCard
          title="Regional Sales"
          value={formatPoints(kpis?.salesPoints)}
          subtitle="Total points redeemed"
          icon={Coins}
        />
        <StatCard
          title="Active Check-Ins"
          value={kpis?.activeVisits ?? 0}
          subtitle="Currently inside stores"
          icon={History}
        />
        <StatCard
          title="Active Store Staff"
          value={kpis?.staff ?? 0}
          subtitle="Baristas and managers"
          icon={Users}
        />
      </div>

      {/* Assigned Cafes Table */}
      <Card className="border-stone-800 bg-stone-900/60">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Store className="h-4 w-4 text-amber-500" />
            <span>Assigned Cafe Locations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cafe</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Sales (Points)</TableHead>
                <TableHead className="text-right">Active Visits</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cafes.map((c: any) => (
                <TableRow key={c._id}>
                  <TableCell className="font-semibold text-xs text-white">
                    <div>{c.name}</div>
                    <div className="font-mono text-[10px] text-stone-500">{c.code}</div>
                  </TableCell>
                  <TableCell className="text-xs text-stone-300">{c.city}</TableCell>
                  <TableCell className="text-xs text-stone-400">{c.manager || "Unassigned"}</TableCell>
                  <TableCell className="text-right font-bold text-xs text-stone-200">{c.orders}</TableCell>
                  <TableCell className="text-right font-bold text-xs text-amber-400">{formatPoints(c.salesPoints)}</TableCell>
                  <TableCell className="text-right font-bold text-xs text-stone-200">
                    {c.activeVisits > 0 ? (
                      <span className="text-emerald-400">{c.activeVisits} Active</span>
                    ) : (
                      "0"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.status === "ACTIVE" ? "success" : "secondary"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PortalLayout>
  );
}

