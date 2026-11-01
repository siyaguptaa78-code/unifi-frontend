"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Coins,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { formatPoints, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminPointsLedgerPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Adjustment modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [pointsDelta, setPointsDelta] = useState(500);
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [lRes, cRes] = await Promise.all([
        fetch("/api/reports?report=points&limit=100"),
        fetch("/api/admin/customers?limit=100"),
      ]);

      if (lRes.ok) {
        const lJson = await lRes.json();
        setEntries(lJson.data?.rows || lJson.data || []);
      }
      if (cRes.ok) {
        const cJson = await cRes.json();
        const list = cJson.data || [];
        setCustomers(list);
        if (list.length > 0) setSelectedCustomerId(list[0]._id);
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

  const handleManualAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/points-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          pointsDelta: Number(pointsDelta),
          reason,
          reference: reference || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Adjustment failed");

      toast.success(json.message || "Points adjusted successfully");
      setAdjustModalOpen(false);
      setReason("");
      setReference("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Manual adjustment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEntries = entries.filter((e) => {
    if (typeFilter !== "ALL" && e.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.reference?.toLowerCase().includes(q) ||
        e.customer?.name?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.cafe?.name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCredits = entries.filter((e) => e.type === "CREDIT").reduce((s, e) => s + (e.points || 0), 0);
  const totalDebits = entries.filter((e) => e.type === "DEBIT").reduce((s, e) => s + Math.abs(e.points || 0), 0);
  const totalRefunds = entries.filter((e) => e.type === "REFUND").reduce((s, e) => s + (e.points || 0), 0);

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Universal Immutable Points Ledger"
        description="Every financial point credit, cafe order debit, and cancellation refund is recorded as an immutable double-entry ledger event."
        badge="Financial Audit"
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setAdjustModalOpen(true)} className="text-xs h-9">
              <Plus className="h-4 w-4 mr-1.5" />
              Manual Points Adjustment
            </Button>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Total Points Credited</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">{formatPoints(totalCredits)}</div>
          <div className="text-[11px] text-stone-400">Purchases, recharges and admin grants</div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Total Points Spent</span>
            <ArrowDownLeft className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-400">{formatPoints(totalDebits)}</div>
          <div className="text-[11px] text-stone-400">In-cafe food orders & pre-orders</div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Points Refunded</span>
            <RotateCcw className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-stone-200">{formatPoints(totalRefunds)}</div>
          <div className="text-[11px] text-stone-400">Order cancellations & reversals</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {["ALL", "CREDIT", "DEBIT", "REFUND"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                typeFilter === t ? "bg-amber-600 text-stone-950" : "bg-stone-900 text-stone-400 hover:text-white"
              }`}
            >
              {t === "ALL" ? "All Entries" : t}
            </button>
          ))}
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
          <Input
            placeholder="Search reference, member, note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <Card className="border-stone-800 bg-stone-900/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <EmptyState title="No ledger records found" description="No points transactions match your search filter." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference / ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead className="text-right">Points Impact</TableHead>
                  <TableHead className="text-right">Balance After</TableHead>
                  <TableHead>Channel / Cafe</TableHead>
                  <TableHead>Audit Reason</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((e) => (
                  <TableRow key={e._id}>
                    <TableCell className="font-mono text-xs font-bold text-amber-400">
                      {e.reference}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={e.type === "CREDIT" ? "success" : e.type === "REFUND" ? "secondary" : "destructive"}
                        className="text-[10px]"
                      >
                        {e.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-white">
                      {e.customer?.name || "Customer"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs">
                      <span className={e.type === "CREDIT" || e.type === "REFUND" ? "text-emerald-400" : "text-red-400"}>
                        {e.points > 0 ? `+${e.points}` : e.points}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-stone-300">
                      {e.balanceAfter} pts
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">
                      {e.cafe?.name || e.source || "System"}
                    </TableCell>
                    <TableCell className="text-xs text-stone-300 max-w-xs truncate">
                      {e.description}
                    </TableCell>
                    <TableCell className="text-[11px] text-stone-400">
                      {formatDateTime(e.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal: Manual Points Adjustment */}
      <Dialog open={adjustModalOpen} onOpenChange={setAdjustModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Administrative Points Adjustment</DialogTitle>
            <DialogDescription>
              Execute an audited manual credit or debit to a member's points ledger.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleManualAdjustment} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-stone-300">Select Member</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                required
              >
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.profile?.customerCode || c.email}) — Balance: {c.membership?.pointsBalance ?? 0} pts
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300">Points Delta (Positive to Credit, Negative to Debit)</label>
              <Input
                type="number"
                value={pointsDelta}
                onChange={(e) => setPointsDelta(Number(e.target.value))}
                placeholder="e.g. +500 or -250"
                required
                className="mt-1 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300">Mandatory Justification / Reason</label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Compensation for kitchen wait / Customer loyalty bonus"
                required
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300">Optional Reference Code</label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. TICKET-9941"
                className="mt-1 font-mono text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={submitting}>
                Execute Ledger Adjustment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
