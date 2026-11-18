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
  UserCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { formatINR, formatPoints, formatDateTime } from "@/lib/utils";
import dynamic from "next/dynamic";

const chartFallback = () => <div className="h-full w-full animate-pulse rounded-lg bg-stone-800/40" />;
// Charts are code-split so the KPI cards render without waiting for the charting library.
const MonthlyRevenueChart = dynamic(
  () => import("@/components/admin/dashboard-charts").then((m) => m.MonthlyRevenueChart),
  { ssr: false, loading: chartFallback }
);
const OrderTrendChart = dynamic(
  () => import("@/components/admin/dashboard-charts").then((m) => m.OrderTrendChart),
  { ssr: false, loading: chartFallback }
);

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-stone-400">Loading Enterprise Operations Dashboard...</p>
        </div>
      </PortalLayout>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const tables = data?.tables || {};

  const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444"];

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Unifi Cafe Platform Command Center"
        description="Unified real-time oversight of customer subscriptions, cafe branches, kitchen queues, financial flows and personnel."
        badge="Super Admin Authority"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              isLoading={refreshing}
              className="text-xs h-9"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Sync Metrics
            </Button>
            <Link href="/admin/settings">
              <Button size="sm" className="text-xs h-9">
                Platform Rules
              </Button>
            </Link>
          </div>
        }
      />

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Memberships"
          value={kpis.activeMemberships ?? 0}
          subtitle={`${kpis.inactiveMemberships ?? 0} inactive/pending`}
          icon={CreditCard}
        />
        <StatCard
          title="Total Customers"
          value={kpis.totalCustomers ?? 0}
          subtitle="Registered member accounts"
          icon={Users}
        />
        <StatCard
          title="Points in Circulation"
          value={formatPoints(kpis.pointsInCirculation ?? 0)}
          subtitle={`Issued: ${formatPoints(kpis.pointsIssued ?? 0)}`}
          icon={Coins}
        />
        <StatCard
          title="Today's Revenue"
          value={formatINR(kpis.todayRevenue ?? 0)}
          subtitle={`Total: ${formatINR(kpis.totalRevenue ?? 0)}`}
          icon={TrendingUp}
        />
      </div>

      {/* Secondary Operational KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px] font-medium">
            <span>Cafe Branches</span>
            <Store className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-white">{kpis.totalCafes ?? 0}</div>
          <div className="text-[10px] text-stone-400">{kpis.franchiseLocations ?? 0} franchise units</div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px] font-medium">
            <span>Today's Orders</span>
            <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-white">{kpis.todayOrders ?? 0}</div>
          <div className="text-[10px] text-stone-400">Total: {kpis.totalOrders ?? 0} orders</div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px] font-medium">
            <span>Active Sessions</span>
            <History className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">{kpis.activeSessions ?? 0}</div>
          <div className="text-[10px] text-stone-400">Inside cafes right now</div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px] font-medium">
            <span>Pending Orders</span>
            <Clock className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400">{kpis.pendingOrders ?? 0}</div>
          <div className="text-[10px] text-stone-400">In kitchen queue</div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px] font-medium">
            <span>Staff Roster</span>
            <UserCheck className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white">{kpis.staffCount ?? 0}</div>
          <div className="text-[10px] text-stone-400">{kpis.managersCount ?? 0} managers, {kpis.supervisorsCount ?? 0} sup.</div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px] font-medium">
            <span>Active Franchises</span>
            <Building2 className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white">{kpis.activeFranchises ?? 0}</div>
          <div className="text-[10px] text-stone-400">{kpis.franchiseOwnersCount ?? 0} verified owners</div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Trend */}
        <Card className="border-stone-800 bg-stone-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-white">Monthly Revenue Trajectory</CardTitle>
              <p className="text-xs text-stone-400">12-Month membership recharge & purchase revenue</p>
            </div>
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px]">
              INR Gateway
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              {charts.monthlyRevenue && charts.monthlyRevenue.length > 0 ? (
                <MonthlyRevenueChart data={charts.monthlyRevenue} />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-stone-400">
                  Insufficient historical revenue records.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 30-Day Order Volume Trend */}
        <Card className="border-stone-800 bg-stone-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-white">Daily Order Flow (30 Days)</CardTitle>
              <p className="text-xs text-stone-400">Dine-in and online pre-order volume across branches</p>
            </div>
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px]">
              Orders
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              {charts.orderTrend && charts.orderTrend.length > 0 ? (
                <OrderTrendChart data={charts.orderTrend} />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-stone-400">
                  No orders recorded in the past 30 days.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Performance & Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Branches */}
        <Card className="lg:col-span-2 border-stone-800 bg-stone-900/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-white">Branch-Wise Order & Points Ranking</CardTitle>
              <p className="text-xs text-stone-400">Top revenue generating Unifi Cafe locations</p>
            </div>
            <Link href="/admin/cafes">
              <Button variant="ghost" size="sm" className="text-xs text-amber-400 hover:text-amber-300">
                View All Cafes <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Orders Handled</TableHead>
                  <TableHead className="text-right">Points Consumed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charts.cafePerformance && charts.cafePerformance.length > 0 ? (
                  charts.cafePerformance.map((c: any) => (
                    <TableRow key={c._id}>
                      <TableCell className="font-semibold text-xs text-white">{c.name}</TableCell>
                      <TableCell className="font-mono text-xs text-amber-500">{c.code}</TableCell>
                      <TableCell className="text-right font-medium text-xs text-stone-300">{c.orders}</TableCell>
                      <TableCell className="text-right font-bold text-xs text-amber-400">{formatPoints(c.points)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-xs text-stone-400">
                      No branch orders logged yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order Status Breakdown */}
        <Card className="border-stone-800 bg-stone-900/60">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white">Order Pipeline Status</CardTitle>
            <p className="text-xs text-stone-400">Current state distribution</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {charts.orderStatusBreakdown && charts.orderStatusBreakdown.length > 0 ? (
              charts.orderStatusBreakdown.map((s: any, idx: number) => (
                <div key={s.status} className="flex items-center justify-between p-2.5 rounded-lg bg-stone-950/60 border border-stone-800/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-xs font-semibold text-stone-200">{s.status}</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {s.count}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-stone-400">No order status breakdown available.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Operational Feeds: Recent Activity & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Platform Orders */}
        <Card className="border-stone-800 bg-stone-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-white">Live Platform Orders</CardTitle>
              <p className="text-xs text-stone-400">Recent customer food orders across all cafes</p>
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs text-amber-400">
                All Orders <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.recentOrders && tables.recentOrders.length > 0 ? (
                  tables.recentOrders.map((o: any) => (
                    <TableRow key={o._id}>
                      <TableCell className="font-mono text-[11px] font-bold text-amber-400">{o.orderNumber}</TableCell>
                      <TableCell className="text-xs text-stone-200">{o.customer?.name || "Customer"}</TableCell>
                      <TableCell className="text-xs text-stone-300">{o.cafe?.name || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={o.status === "COMPLETED" ? "success" : o.status === "CANCELLED" ? "destructive" : "warning"}
                          className="text-[10px]"
                        >
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs text-white">{o.totalPoints} pts</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-xs text-stone-400">
                      No recent orders.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Real-time System Audit Feed */}
        <Card className="border-stone-800 bg-stone-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-white">Security & Audit Activity Stream</CardTitle>
              <p className="text-xs text-stone-400">Immutable administrative logs and security events</p>
            </div>
            <Link href="/admin/audit-logs">
              <Button variant="ghost" size="sm" className="text-xs text-amber-400">
                Full Audit Trail <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-stone-800/80">
              {tables.recentActivity && tables.recentActivity.length > 0 ? (
                tables.recentActivity.map((a: any) => (
                  <div key={a._id} className="p-3 hover:bg-stone-900/40 transition-colors flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-amber-400">{a.action}</span>
                        <Badge variant="outline" className="text-[9px] py-0">
                          {a.entityType}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-stone-400">
                        Performed by <span className="text-stone-300 font-medium">{a.performedBy?.name || "System"}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-stone-400 whitespace-nowrap">{formatDateTime(a.createdAt)}</div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-stone-400">No audit activity logged yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
