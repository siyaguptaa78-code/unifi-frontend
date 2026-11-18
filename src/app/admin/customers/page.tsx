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
  Users,
  Search,
  QrCode,
  Plus,
  Edit,
  ShieldAlert,
  Coins,
  Clock,
  KeyRound,
  CheckCircle2,
  XCircle,
  Eye,
  CreditCard,
  History,
  ShoppingBag,
} from "lucide-react";
import { formatPoints, formatMinutes, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [resetPwModalOpen, setResetPwModalOpen] = useState(false);
  const [viewDetailModalOpen, setViewDetailModalOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [initialPoints, setInitialPoints] = useState(5000);
  const [initialHours, setInitialHours] = useState(150);
  const [customerStatus, setCustomerStatus] = useState<"ACTIVE" | "SUSPENDED">("ACTIVE");

  // Adjustment form states
  const [pointsDelta, setPointsDelta] = useState(0);
  const [hoursDelta, setHoursDelta] = useState(0);
  const [memStatus, setMemStatus] = useState<"ACTIVE" | "INACTIVE" | "SUSPENDED">("ACTIVE");
  const [adjustReason, setAdjustReason] = useState("");

  // Password reset form state
  const [newPassword, setNewPassword] = useState("");

  const loadCustomers = async () => {
    try {
      const res = await fetch(`/api/admin/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      if (res.ok) {
        const json = await res.json();
        setCustomers(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [q]);

  const openCreate = () => {
    setName("");
    setEmail("");
    setMobile("");
    setPassword("Customer@12345");
    setInitialPoints(5000);
    setInitialHours(150);
    setCustomerStatus("ACTIVE");
    setCreateModalOpen(true);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          mobile,
          password,
          initialPoints: Number(initialPoints),
          initialHours: Number(initialHours),
          status: customerStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to create customer");

      toast.success(`Customer created successfully with code ${json.data.customerCode}`);
      setCreateModalOpen(false);
      loadCustomers();
    } catch (err: any) {
      toast.error(err.message || "Failed to create customer");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (c: any) => {
    setSelectedCustomer(c);
    setName(c.name);
    setEmail(c.email);
    setMobile(c.mobile);
    setCustomerStatus(c.status || "ACTIVE");
    setEditModalOpen(true);
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/customers/${selectedCustomer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          mobile,
          status: customerStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to update customer");

      toast.success("Customer profile updated successfully");
      setEditModalOpen(false);
      loadCustomers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update customer");
    } finally {
      setSubmitting(false);
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
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/customers/${selectedCustomer._id}/membership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pointsDelta: Number(pointsDelta),
          hoursDelta: Number(hoursDelta),
          status: memStatus,
          reason: adjustReason || "Administrative balance adjustment",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to adjust membership");

      toast.success("Membership balance adjusted and audited successfully");
      setAdjustModalOpen(false);
      loadCustomers();
    } catch (err: any) {
      toast.error(err.message || "Failed to adjust membership");
    } finally {
      setSubmitting(false);
    }
  };

  const openResetPw = (c: any) => {
    setSelectedCustomer(c);
    setNewPassword("");
    setResetPwModalOpen(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/customers/${selectedCustomer._id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to reset password");

      toast.success(`Password updated for ${selectedCustomer.name}`);
      setResetPwModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  const openViewDetail = async (c: any) => {
    setSelectedCustomer(c);
    setViewDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${c._id}`);
      if (res.ok) {
        const json = await res.json();
        setDetailData(json.data);
      }
    } catch {
      toast.error("Failed to load customer complete profile");
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (statusFilter === "ALL") return true;
    return c.status === statusFilter;
  });

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Customer CRM & Membership Directory"
        description="Full lifecycle management of registered members: profile editing, manual points/hours audit adjustments, RFID card status and password resets."
        badge="Customer CRM"
        action={
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
              <Input
                placeholder="Search name, email, mobile..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Button size="sm" onClick={openCreate} className="text-xs h-9">
              <Plus className="h-4 w-4 mr-1.5" />
              New Customer
            </Button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            statusFilter === "ALL" ? "bg-amber-600 text-stone-950" : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          All Members ({customers.length})
        </button>
        <button
          onClick={() => setStatusFilter("ACTIVE")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            statusFilter === "ACTIVE" ? "bg-emerald-600 text-white" : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          Active Accounts ({customers.filter((c) => c.status === "ACTIVE").length})
        </button>
        <button
          onClick={() => setStatusFilter("SUSPENDED")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            statusFilter === "SUSPENDED" ? "bg-red-600 text-white" : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          Suspended ({customers.filter((c) => c.status === "SUSPENDED").length})
        </button>
      </div>

      <Card className="border-stone-800 bg-stone-900/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <EmptyState title="No customers found" description="No accounts match your query or active filter." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Card UID</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Remaining Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-semibold text-xs text-white">
                      <div>{c.name}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-amber-500 font-bold">
                      {c.profile?.customerCode || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">
                      <div>{c.email}</div>
                      <div>{c.mobile}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-stone-300">
                      {c.card?.uid ? (
                        <span className="flex items-center gap-1.5">
                          <QrCode className="h-3 w-3 text-amber-500" />
                          <span>{c.card.uid}</span>
                        </span>
                      ) : (
                        <span className="text-stone-400">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs text-amber-400">
                      {formatPoints(c.membership?.pointsBalance ?? 0)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-stone-300">
                      {formatMinutes(c.membership?.remainingMinutes ?? 0)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={c.status === "ACTIVE" ? "success" : "destructive"}
                        className="text-[10px]"
                      >
                        {c.status || "ACTIVE"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[11px] text-stone-400">
                      {formatDateTime(c.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openViewDetail(c)}
                          title="View 360° Profile"
                          className="h-8 w-8 text-stone-400 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openAdjust(c)}
                          title="Adjust Points & Hours"
                          className="h-8 w-8 text-amber-400 hover:text-amber-300"
                        >
                          <Coins className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(c)}
                          title="Edit Customer"
                          className="h-8 w-8 text-stone-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openResetPw(c)}
                          title="Reset Password"
                          className="h-8 w-8 text-stone-400 hover:text-white"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal 1: Create New Customer */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register Customer via Admin</DialogTitle>
            <DialogDescription>
              Directly enroll a new member into the Unifi Cafe platform with optional initial points and cafe hours.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCustomer} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-stone-300">Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Sharma"
                required
                className="mt-1 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rohan@example.com"
                  required
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Mobile (10 Digits)</label>
                <Input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  required
                  className="mt-1 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-300">Initial Password</label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Customer@12345"
                required
                className="mt-1 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Initial Points Balance</label>
                <Input
                  type="number"
                  value={initialPoints}
                  onChange={(e) => setInitialPoints(Number(e.target.value))}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Initial Access Hours</label>
                <Input
                  type="number"
                  value={initialHours}
                  onChange={(e) => setInitialHours(Number(e.target.value))}
                  className="mt-1 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-300">Account Status</label>
              <select
                value={customerStatus}
                onChange={(e) => setCustomerStatus(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
              >
                <option value="ACTIVE">ACTIVE (Authorized for Entry & Ordering)</option>
                <option value="SUSPENDED">SUSPENDED (Blocked)</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={submitting}>
                Create Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Edit Customer Profile */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Member Profile</DialogTitle>
            <DialogDescription>
              Update basic customer identity and account status.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCustomer} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-stone-300">Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-300">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-300">Mobile Number</label>
              <Input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-300">Account Status</label>
              <select
                value={customerStatus}
                onChange={(e) => setCustomerStatus(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED (Revoke Gate Access)</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={submitting}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Adjust Membership Points & Hours */}
      <Dialog open={adjustModalOpen} onOpenChange={setAdjustModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Audited Membership Balance Adjustment</DialogTitle>
            <DialogDescription>
              Directly credit or debit points and access hours for {selectedCustomer?.name}. Every adjustment creates an immutable PointsLedger and AuditLog record.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustMembership} className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-400">Current Points:</span>
                <span className="font-bold text-amber-400">{formatPoints(selectedCustomer?.membership?.pointsBalance ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Current Access Time:</span>
                <span className="font-mono text-stone-300">{formatMinutes(selectedCustomer?.membership?.remainingMinutes ?? 0)}</span>
              </div>
            </div>

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
              <label className="text-xs font-semibold text-stone-300">Membership Tier Status</label>
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
                placeholder="e.g. Promotional loyalty gift / Customer support resolution"
                required
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={submitting}>
                Execute Adjustment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 4: Reset Password */}
      <Dialog open={resetPwModalOpen} onOpenChange={setResetPwModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Member Password</DialogTitle>
            <DialogDescription>
              Set a new secure password for {selectedCustomer?.name}. This immediately revokes any previous login sessions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-stone-300">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                required
                className="mt-1 text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setResetPwModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={submitting}>
                Reset Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 5: 360-Degree Customer Detail View */}
      <Dialog open={viewDetailModalOpen} onOpenChange={setViewDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Member 360° Profile & Audit</DialogTitle>
            <DialogDescription>
              Full operational view of {selectedCustomer?.name} ({selectedCustomer?.email})
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : detailData ? (
            <div className="space-y-6 pt-2">
              {/* Top Overview Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Customer Code</div>
                  <div className="font-mono text-sm font-bold text-amber-500">{detailData.profile?.customerCode || "—"}</div>
                  <div className="text-[11px] text-stone-400">Mobile: {detailData.user?.mobile}</div>
                </div>
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Points Balance</div>
                  <div className="text-base font-bold text-amber-400">{formatPoints(detailData.membership?.pointsBalance ?? 0)}</div>
                  <div className="text-[11px] text-stone-400">Earned: {formatPoints(detailData.membership?.totalPointsEarned ?? 0)}</div>
                </div>
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Active Card UID</div>
                  <div className="font-mono text-sm font-bold text-stone-200">{detailData.card?.uid || "No Active Card"}</div>
                  <div className="text-[11px] text-stone-400">Remaining: {formatMinutes(detailData.membership?.remainingMinutes ?? 0)}</div>
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
                  Recent Cafe Orders ({detailData.orders?.length || 0})
                </div>
                <div className="border border-stone-800 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailData.orders && detailData.orders.length > 0 ? (
                        detailData.orders.map((o: any) => (
                          <TableRow key={o._id}>
                            <TableCell className="font-mono text-xs text-amber-400 font-bold">{o.orderNumber}</TableCell>
                            <TableCell className="text-xs text-stone-300">{o.cafe?.name || "—"}</TableCell>
                            <TableCell className="text-xs text-stone-400">{o.orderType || "DINE_IN"}</TableCell>
                            <TableCell className="text-xs font-bold text-white">{o.totalPoints} pts</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px]">{o.status}</Badge>
                            </TableCell>
                            <TableCell className="text-[11px] text-stone-400">{formatDateTime(o.createdAt)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-xs text-stone-400">No orders placed yet.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Recent Cafe Visits */}
              <div>
                <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-amber-500" />
                  Recent Check-In Visits ({detailData.visits?.length || 0})
                </div>
                <div className="border border-stone-800 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cafe Branch</TableHead>
                        <TableHead>Entry Time</TableHead>
                        <TableHead>Exit Time</TableHead>
                        <TableHead>Time Used</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailData.visits && detailData.visits.length > 0 ? (
                        detailData.visits.map((v: any) => (
                          <TableRow key={v._id}>
                            <TableCell className="text-xs font-semibold text-white">{v.cafe?.name || "Branch"}</TableCell>
                            <TableCell className="text-xs text-stone-400">{formatDateTime(v.entryAt)}</TableCell>
                            <TableCell className="text-xs text-stone-400">{v.exitAt ? formatDateTime(v.exitAt) : "Active Now"}</TableCell>
                            <TableCell className="text-xs font-mono text-stone-300">{formatMinutes(v.minutesConsumed || 0)}</TableCell>
                            <TableCell>
                              <Badge variant={v.status === "ACTIVE" ? "success" : "outline"} className="text-[10px]">{v.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-xs text-stone-400">No visits logged yet.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Points Ledger Entries */}
              <div>
                <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  Points Ledger Audit ({detailData.ledger?.length || 0})
                </div>
                <div className="border border-stone-800 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                        <TableHead className="text-right">Balance After</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailData.ledger && detailData.ledger.length > 0 ? (
                        detailData.ledger.map((l: any) => (
                          <TableRow key={l._id}>
                            <TableCell className="font-mono text-[11px] text-amber-400">{l.reference}</TableCell>
                            <TableCell>
                              <Badge variant={l.type === "CREDIT" ? "success" : "destructive"} className="text-[9px]">{l.type}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold text-xs text-white">
                              {l.points > 0 ? `+${l.points}` : l.points}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-stone-300">{l.balanceAfter} pts</TableCell>
                            <TableCell className="text-xs text-stone-400">{l.description}</TableCell>
                            <TableCell className="text-[10px] text-stone-400">{formatDateTime(l.createdAt)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-xs text-stone-400">No ledger entries.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="pt-4">
            <Button size="sm" onClick={() => setViewDetailModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
