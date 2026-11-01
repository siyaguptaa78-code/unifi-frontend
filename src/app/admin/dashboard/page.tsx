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
import { Spinner } from "@/components/ui/spinner";
import {
  Users,
  CreditCard,
  Store,
  Building2,
  ShoppingBag,
  Coins,
  History,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { formatINR, formatPoints, formatDateTime } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
        <div className="p-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      </PortalLayout>
    );
  }

  const kpis = data?.kpis;
  const charts = data?.charts;
  const tables = data?.tables;

  const COLORS = ["#d97706", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Super Admin Executive Overview"
        description="Consolidated platform metrics across memberships, multi-location sales, franchise expansion and audit health."
        badge="Platform Root"
        action={
          <Button size="sm" variant="outline" onClick={fetchDashboard} className="text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Metrics</span>
          </Button>
        }
      />

      {/* Primary KPI Grid (8 metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={kpis?.totalCustomers ?? 0}
          subtitle="Registered members"
          icon={Users}
        />
        <StatCard
          title="Active Memberships"
          value={kpis?.activeMemberships ?? 0}
          subtitle="Passes currently valid"
          icon={CreditCard}
          highlight={true}
        />
        <StatCard
          title="Total Cafes"
          value={kpis?.totalCafes ?? 0}
          subtitle={`${kpis?.franchiseLocations ?? 0} franchise locations`}
          icon={Store}
        />
        <StatCard
          title="Total Revenue"
          value={formatINR(kpis?.totalRevenue)}
          subtitle="Membership purchases"
          icon={Coins}
        />
        <StatCard
          title="Points Issued"
          value={formatPoints(kpis?.pointsIssued)}
          subtitle="Credited to customer wallets"
          icon={Coins}
        />
        <StatCard
          title="Points Redeemed"
          value={formatPoints(kpis?.pointsRedeemed)}
          subtitle="Spent on food & coffee"
          icon={ShoppingBag}
        />
        <StatCard
          title="Total Orders"
          value={kpis?.totalOrders ?? 0}
          subtitle="Kitchen orders executed"
          icon={ShoppingBag}
        />
        <StatCard
          title="Cafe Visits"
          value={kpis?.totalVisits ?? 0}
          subtitle="Card check-in sessions"
          icon={History}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Monthly Revenue Chart */}
        <Card className="border-stone-800 bg-stone-900/60 p-5">
          <CardTitle className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-500" />
            <span>Monthly Revenue (₹)</span>
          </CardTitle>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis dataKey="month" stroke="#78716c" fontSize={11} />
                <YAxis stroke="#78716c" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1c1917", borderColor: "#44403c", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: any) => [formatINR(Number(value)), "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 30-Day Order Trends */}
        <Card className="border-stone-800 bg-stone-900/60 p-5">
          <CardTitle className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-emerald-400" />
            <span>Daily Order Trend (Points Volume)</span>
          </CardTitle>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.orderTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis dataKey="date" stroke="#78716c" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                <YAxis stroke="#78716c" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1c1917", borderColor: "#44403c", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: any) => [`${value} pts`, "Points Sold"]}
                />
                <Area type="monotone" dataKey="points" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Performing Cafes */}
        <Card className="border-stone-800 bg-stone-900/60 p-5">
          <CardTitle className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Store className="h-4 w-4 text-amber-500" />
            <span>Store Performance (Points Redeemed)</span>
          </CardTitle>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.cafePerformance || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" horizontal={false} />
                <XAxis type="number" stroke="#78716c" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#78716c" fontSize={11} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1c1917", borderColor: "#44403c", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val: any) => [formatPoints(Number(val)), "Sales"]}
                />
                <Bar dataKey="points" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Points Flow (Credited vs Spent) */}
        <Card className="border-stone-800 bg-stone-900/60 p-5">
          <CardTitle className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-400" />
            <span>Points Ledger Flow (Credited vs Spent)</span>
          </CardTitle>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.pointsUsage || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis dataKey="month" stroke="#78716c" fontSize={11} />
                <YAxis stroke="#78716c" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1c1917", borderColor: "#44403c", borderRadius: "8px", fontSize: "12px" }}
                />
                <Line type="monotone" dataKey="credited" stroke="#10b981" strokeWidth={2} name="Credited" />
                <Line type="monotone" dataKey="spent" stroke="#ef4444" strokeWidth={2} name="Spent" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Orders & Payments Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Recent Orders */}
        <Card className="border-stone-800 bg-stone-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-amber-500" />
              <span>Recent Orders</span>
            </CardTitle>
            <Link href="/admin/orders" className="text-xs text-amber-500 hover:underline">
              All Orders &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Cafe</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables?.recentOrders?.map((ord: any) => (
                  <TableRow key={ord._id}>
                    <TableCell className="font-mono text-xs text-stone-200">{ord.orderNumber}</TableCell>
                    <TableCell className="text-xs text-stone-300">{ord.cafe?.name}</TableCell>
                    <TableCell className="text-right font-bold text-xs text-amber-400">
                      {formatPoints(ord.totalPoints)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ord.status === "COMPLETED" ? "success" : "default"} className="text-[10px]">
                        {ord.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="border-stone-800 bg-stone-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              <span>Recent Payment Transactions</span>
            </CardTitle>
            <Link href="/admin/payments" className="text-xs text-amber-500 hover:underline">
              All Payments &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables?.recentPayments?.map((p: any) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-mono text-xs text-stone-200">{p.receipt}</TableCell>
                    <TableCell className="text-xs text-stone-300">{p.customer?.name}</TableCell>
                    <TableCell className="text-right font-bold text-xs text-white">
                      {formatINR(p.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.status === "SUCCESS" ? "success" : "destructive"} className="text-[10px]">
                        {p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}

