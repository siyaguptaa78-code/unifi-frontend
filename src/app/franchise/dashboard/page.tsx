"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Store, Coins, ShoppingBag, History, FileBarChart, ArrowRight } from "lucide-react";
import { formatPoints, formatMinutes } from "@/lib/utils";
import { useAuth } from "@/components/providers";

export default function FranchiseDashboardPage() {
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

  return (
    <PortalLayout allowedRoles={["FRANCHISE_OWNER", "SUPER_ADMIN"]}>
      <PageHeader
        title={`Franchise Partner Console — ${user?.name}`}
        description="Monitor multi-unit franchise locations, food sales volume, and customer footfall."
        badge="Franchise Owner"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Owned Cafes"
          value={kpis?.cafes ?? 0}
          subtitle="Operating locations"
          icon={Store}
          highlight={true}
        />
        <StatCard
          title="Total Store Sales"
          value={formatPoints(kpis?.salesPoints)}
          subtitle="Redeemed points value"
          icon={Coins}
        />
        <StatCard
          title="Total Orders"
          value={kpis?.orders ?? 0}
          subtitle="Food & coffee tickets"
          icon={ShoppingBag}
        />
        <StatCard
          title="Customer Visits"
          value={kpis?.visits ?? 0}
          subtitle={`${kpis?.hoursUsed ?? 0} hrs total usage`}
          icon={History}
        />
      </div>

      {/* Franchise Outlets Table */}
      <Card className="border-stone-800 bg-stone-900/60">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Store className="h-4 w-4 text-amber-500" />
            <span>Franchise Store Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Outlet Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Store Manager</TableHead>
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
                    <div className="font-mono text-[10px] text-amber-500">{c.code}</div>
                  </TableCell>
                  <TableCell className="text-xs text-stone-300">{c.city}</TableCell>
                  <TableCell className="text-xs text-stone-400">{c.manager || "Unassigned"}</TableCell>
                  <TableCell className="text-right font-bold text-xs text-stone-200">{c.orders}</TableCell>
                  <TableCell className="text-right font-bold text-xs text-amber-400">{formatPoints(c.salesPoints)}</TableCell>
                  <TableCell className="text-right font-bold text-xs text-emerald-400">{c.activeVisits}</TableCell>
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

