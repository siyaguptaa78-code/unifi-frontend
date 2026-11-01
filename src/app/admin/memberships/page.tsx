"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CreditCard,
  Coins,
  Clock,
  Save,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { formatINR, formatPoints, formatMinutes, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminMembershipsPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Adjustment modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [pointsDelta, setPointsDelta] = useState(0);
  const [hoursDelta, setHoursDelta] = useState(0);
  const [memStatus, setMemStatus] = useState<"ACTIVE" | "INACTIVE" | "SUSPENDED">("ACTIVE");
  const [adjustReason, setAdjustReason] = useState("");
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  // Runtime settings edit states
  const [price, setPrice] = useState(5000);
  const [points, setPoints] = useState(5000);
  const [hours, setHours] = useState(150);

  const loadData = async () => {
    try {
      const [cRes, pRes, sRes] = await Promise.all([
        fetch("/api/admin/customers?limit=100"),
        fetch("/api/payments?limit=20"),
        fetch("/api/settings"),
      ]);

      if (cRes.ok) {
        const cJson = await cRes.json();
        setCustomers(cJson.data || []);
      }
      if (pRes.ok) {
        const pJson = await pRes.json();
        setPayments(pJson.data || []);
      }
      if (sRes.ok) {
        const sJson = await sRes.json();
        const map: Record<string, any> = {};
        for (const item of sJson.data || []) {
          map[item.key] = item.value;
        }
        setSettings(map);
        if (map["membership.price"]) setPrice(Number(map["membership.price"]));
        if (map["membership.points"]) setPoints(Number(map["membership.points"]));
        if (map["membership.hours"]) setHours(Number(map["membership.hours"]));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveMembershipConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await Promise.all([
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "membership.price", value: Number(price) }),
        }),
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "membership.points", value: Number(points) }),
        }),
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "membership.hours", value: Number(hours) }),
        }),
      ]);

      toast.success("Membership recharge rules updated. New recharges will adopt these parameters.");
      loadData();
    } catch {
      toast.error("Failed to update membership parameters");
    } finally {
      setSavingSettings(false);
    }
  };

  const openAdjust = (c: any) => {
    setSelectedCustomer(c);
    setPointsDelta(0);
    setHoursDelta(0);
    setMemStatus(c.membership?.status || "ACTIVE");
    setAdjustReason("");
    setAdjustModalOpen(true);
  };

  const handleAdjustMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSubmittingAdjust(true);
    try {
      const res = await fetch(`/api/admin/customers/${selectedCustomer._id}/membership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pointsDelta: Number(pointsDelta),
          hoursDelta: Number(hoursDelta),
          status: memStatus,
          reason: adjustReason || "Audited membership adjustment",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Adjustment failed");

      toast.success("Membership adjusted successfully");
      setAdjustModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to adjust membership");
    } finally {
      setSubmittingAdjust(false);
    }
  };

  const activeCount = customers.filter((c) => c.membership?.status === "ACTIVE").length;
  const inactiveCount = customers.filter((c) => c.membership?.status !== "ACTIVE").length;
  const totalPointsInCirculation = customers.reduce((sum, c) => sum + (c.membership?.pointsBalance || 0), 0);
  const totalMinutesRemaining = customers.reduce((sum, c) => sum + (c.membership?.remainingMinutes || 0), 0);

  const filteredMembers = customers.filter((c) => {
    const mem = c.membership;
    if (statusFilter === "ACTIVE" && mem?.status !== "ACTIVE") return false;
    if (statusFilter === "INACTIVE" && mem?.status === "ACTIVE") return false;
    if (statusFilter === "LOW_POINTS" && (mem?.pointsBalance ?? 0) >= 500) return false;
    if (statusFilter === "LOW_HOURS" && (mem?.remainingMinutes ?? 0) >= 600) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.profile?.customerCode?.toLowerCase().includes(q) ||
        c.mobile?.includes(q)
      );
    }
    return true;
  });

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Membership Governance & Financial Rules"
        description="Configure tier economics, oversee subscriber balances, monitor recharge transaction flows and adjust member quotas."
        badge="Membership Operations"
      />

      {/* Top Economic Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Active Subscriptions</span>
            <CreditCard className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{activeCount}</div>
          <div className="text-[11px] text-stone-400">{inactiveCount} un-activated / expired</div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Points in Circulation</span>
            <Coins className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{formatPoints(totalPointsInCirculation)}</div>
          <div className="text-[11px] text-stone-400">Backing cafe purchasing power</div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Access Hours Pool</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-stone-200">{formatMinutes(totalMinutesRemaining)}</div>
          <div className="text-[11px] text-stone-400">Total unspent cafe access</div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Recharge Pricing Rule</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{formatINR(price)}</div>
          <div className="text-[11px] text-amber-400 font-medium">Yields {points} pts + {hours}h</div>
        </div>
      </div>

      {/* Runtime Membership Business Parameters Editor */}
      <Card className="border-stone-800 bg-stone-900/60">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-500" />
            Runtime Membership Tier Configuration
          </CardTitle>
          <p className="text-xs text-stone-400">
            Changes made here directly govern new membership purchases and recurring recharges across the entire platform.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveMembershipConfig} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs font-semibold text-stone-300">Recharge Price (₹ INR)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                className="mt-1 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-300">Points Credited (pts)</label>
              <Input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                required
                className="mt-1 text-xs font-bold text-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-300">Access Hours Refresh (hrs)</label>
              <Input
                type="number"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                required
                className="mt-1 text-xs font-bold"
              />
            </div>
            <div>
              <Button type="submit" size="sm" isLoading={savingSettings} className="w-full text-xs h-9">
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Update Tier Parameters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Member Accounts Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === "ALL" ? "bg-amber-600 text-stone-950" : "bg-stone-900 text-stone-400 hover:text-white"
              }`}
            >
              All Subscribers ({customers.length})
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === "ACTIVE" ? "bg-emerald-600 text-white" : "bg-stone-900 text-stone-400 hover:text-white"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter("INACTIVE")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === "INACTIVE" ? "bg-stone-800 text-white" : "bg-stone-900 text-stone-400 hover:text-white"
              }`}
            >
              Inactive / Pending ({inactiveCount})
            </button>
            <button
              onClick={() => setStatusFilter("LOW_POINTS")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === "LOW_POINTS" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-stone-900 text-stone-400 hover:text-white"
              }`}
            >
              Low Points (&lt; 500)
            </button>
            <button
              onClick={() => setStatusFilter("LOW_HOURS")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === "LOW_HOURS" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-stone-900 text-stone-400 hover:text-white"
              }`}
            >
              Low Hours (&lt; 10h)
            </button>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
            <Input
              placeholder="Filter by name, email, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        <Card className="border-stone-800 bg-stone-900/60">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-16 flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <EmptyState title="No members match filter" description="Try clearing your search query or selecting a different status filter." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Member Code</TableHead>
                    <TableHead className="text-right">Points Wallet</TableHead>
                    <TableHead className="text-right">Hours Remaining</TableHead>
                    <TableHead className="text-center">Recharges</TableHead>
                    <TableHead>Membership State</TableHead>
                    <TableHead>Last Activated</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell className="font-semibold text-xs text-white">
                        <div>{c.name}</div>
                        <div className="text-[10px] text-stone-400">{c.email}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-amber-500 font-bold">
                        {c.profile?.customerCode || "—"}
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs text-amber-400">
                        {formatPoints(c.membership?.pointsBalance ?? 0)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-stone-300">
                        {formatMinutes(c.membership?.remainingMinutes ?? 0)}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-stone-400">
                        {c.membership?.rechargeCount ?? 0}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={c.membership?.status === "ACTIVE" ? "success" : "secondary"}
                          className="text-[10px]"
                        >
                          {c.membership?.status || "INACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[11px] text-stone-400">
                        {c.membership?.activatedAt ? formatDateTime(c.membership.activatedAt) : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAdjust(c)}
                          className="text-xs text-amber-400 hover:text-amber-300 h-8"
                        >
                          Adjust Balance
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Membership Recharge Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-white">Recent Payment & Recharge Receipts</div>
          <span className="text-[11px] text-stone-400">Live Razorpay and DEMO captures</span>
        </div>
        <Card className="border-stone-800 bg-stone-900/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt Reference</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length > 0 ? (
                  payments.slice(0, 10).map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="font-mono text-xs font-bold text-amber-400">{p.receipt}</TableCell>
                      <TableCell className="text-xs text-stone-200">{p.customer?.name || "Member"}</TableCell>
                      <TableCell className="text-xs text-stone-400">{p.provider}</TableCell>
                      <TableCell className="text-right font-bold text-xs text-white">{formatINR(p.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === "SUCCESS" ? "success" : p.status === "REFUNDED" ? "destructive" : "outline"} className="text-[10px]">
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[11px] text-stone-400">{formatDateTime(p.processedAt || p.createdAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-xs text-stone-400">
                      No recent payment records.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Adjust Modal */}
      <Dialog open={adjustModalOpen} onOpenChange={setAdjustModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Membership Quotas</DialogTitle>
            <DialogDescription>
              Directly credit or debit points and access hours for {selectedCustomer?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustMembership} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Points Delta (+ / -)</label>
                <Input
                  type="number"
                  value={pointsDelta}
                  onChange={(e) => setPointsDelta(Number(e.target.value))}
                  placeholder="e.g. +500 or -200"
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Hours Delta (+ / -)</label>
                <Input
                  type="number"
                  value={hoursDelta}
                  onChange={(e) => setHoursDelta(Number(e.target.value))}
                  placeholder="e.g. +10 or -5"
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300">Membership Tier State</label>
              <select
                value={memStatus}
                onChange={(e) => setMemStatus(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300">Mandatory Reason for Audit</label>
              <Input
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Compensation for maintenance / Promotional grant"
                required
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={submittingAdjust}>
                Execute Adjustment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
