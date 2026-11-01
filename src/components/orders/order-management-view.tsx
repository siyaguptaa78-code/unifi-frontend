"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Utensils,
  ChevronRight,
  Filter,
  Car,
  Store,
  UserCheck,
  UserX,
  Eye,
  Check,
  ChefHat,
  BellRing,
} from "lucide-react";
import { formatPoints, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

interface OrderManagementViewProps {
  cafeId?: string;
  allowRefund?: boolean;
}

export function OrderManagementView({ cafeId, allowRefund = false }: OrderManagementViewProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ACTIVE");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Cancel / Refund modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      const url = cafeId ? `/api/orders?cafeId=${cafeId}` : `/api/orders`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // 10s live kitchen polling
    return () => clearInterval(interval);
  }, [cafeId]);

  const updateStatus = async (orderId: string, status: string, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to update status");
      toast.success(`Order updated to ${status}`);
      await fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder._id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason || "Staff administrative cancellation" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Refund failed");
      toast.success(`Order cancelled. ${selectedOrder.totalPoints} points refunded to customer wallet.`);
      setCancelModalOpen(false);
      setDetailModalOpen(false);
      await fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Refund failed");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "ACTIVE") return ["PENDING", "ACCEPTED", "PREPARING", "READY"].includes(o.status);
    if (activeTab === "PRE_ORDER") return o.orderType === "PRE_ORDER" && ["PENDING", "ACCEPTED", "PREPARING", "READY"].includes(o.status);
    if (activeTab === "DINE_IN") return ["DINE_IN", "IN_CAFE"].includes(o.orderType) && ["PENDING", "ACCEPTED", "PREPARING", "READY"].includes(o.status);
    if (activeTab === "READY") return o.status === "READY";
    if (activeTab === "COMPLETED") return o.status === "COMPLETED";
    if (activeTab === "CANCELLED") return ["CANCELLED", "REFUNDED"].includes(o.status);
    return o.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-950/20">Pending</Badge>;
      case "ACCEPTED":
        return <Badge variant="default" className="bg-sky-600/30 text-sky-300 border-sky-500/30">Accepted</Badge>;
      case "PREPARING":
        return <Badge variant="default" className="bg-amber-600/40 text-amber-300 border-amber-500/40 animate-pulse">Brewing / Cooking</Badge>;
      case "READY":
        return <Badge variant="success" className="bg-emerald-600/30 text-emerald-300 border-emerald-500/40">Ready for Handover</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="text-stone-400 border-stone-800">Completed</Badge>;
      case "CANCELLED":
      case "REFUNDED":
        return <Badge variant="destructive">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Live Operational Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-stone-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "ACTIVE", label: "🔥 Live Kitchen Queue", count: orders.filter((o) => ["PENDING", "ACCEPTED", "PREPARING", "READY"].includes(o.status)).length },
            { id: "PRE_ORDER", label: "🚗 Pre-Orders (Arriving)", count: orders.filter((o) => o.orderType === "PRE_ORDER" && ["PENDING", "ACCEPTED", "PREPARING", "READY"].includes(o.status)).length },
            { id: "DINE_IN", label: "☕ Dine-In Orders", count: orders.filter((o) => ["DINE_IN", "IN_CAFE"].includes(o.orderType) && ["PENDING", "ACCEPTED", "PREPARING", "READY"].includes(o.status)).length },
            { id: "READY", label: "✅ Ready for Handover", count: orders.filter((o) => o.status === "READY").length },
            { id: "ALL", label: "All Historical", count: orders.length },
            { id: "COMPLETED", label: "Completed", count: orders.filter((o) => o.status === "COMPLETED").length },
            { id: "CANCELLED", label: "Cancelled / Refunded", count: orders.filter((o) => ["CANCELLED", "REFUNDED"].includes(o.status)).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-amber-600 text-stone-950 font-bold shadow-md shadow-amber-600/20"
                  : "bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.id ? "bg-stone-950 text-amber-400 font-extrabold" : "bg-stone-800 text-stone-400"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <Button size="sm" variant="outline" onClick={fetchOrders} className="text-xs gap-1.5 cursor-pointer">
          <Clock className="h-3.5 w-3.5" />
          <span>Refresh Live</span>
        </Button>
      </div>

      {/* Orders Table */}
      <Card className="border-stone-800 bg-stone-900/60 overflow-hidden">
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <EmptyState
              title="No active kitchen orders"
              description="No customer orders currently match the selected view."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-stone-800 hover:bg-transparent">
                  <TableHead>Order # & Type</TableHead>
                  <TableHead>Customer & Presence</TableHead>
                  <TableHead>Branch & Slot</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead>Kitchen Status</TableHead>
                  <TableHead className="text-right">Quick Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((ord) => {
                  const isPreOrder = ord.orderType === "PRE_ORDER";
                  const isPresent = ord.customerPresent;
                  return (
                    <TableRow key={ord._id} className="border-stone-800/60 hover:bg-stone-800/30">
                      {/* Order Number & Type */}
                      <TableCell className="font-mono text-xs">
                        <div className="font-bold text-stone-200">{ord.orderNumber}</div>
                        <div className="mt-1 flex items-center gap-1.5">
                          {isPreOrder ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-950/40 border border-purple-500/30 text-purple-300">
                              <Car className="h-3 w-3" />
                              <span>Pre-Order</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/40 border border-amber-500/30 text-amber-300">
                              <Store className="h-3 w-3" />
                              <span>Dine-In</span>
                            </span>
                          )}
                        </div>
                        {ord.notes && (
                          <div className="text-[10px] text-amber-400 font-sans mt-1 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-500/20">
                            Note: {ord.notes}
                          </div>
                        )}
                      </TableCell>

                      {/* Customer & Presence */}
                      <TableCell className="text-xs text-stone-300">
                        <div className="font-semibold text-white">{ord.customer?.name || "Customer"}</div>
                        <div className="text-[11px] text-stone-400">{ord.customer?.mobile}</div>
                        <div className="mt-1">
                          {isPresent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                              <UserCheck className="h-3 w-3 text-emerald-400" />
                              <span>Inside Cafe Now</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-800 border border-stone-700 text-stone-400">
                              <UserX className="h-3 w-3" />
                              <span>Yet to Arrive</span>
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Branch & Slot */}
                      <TableCell className="text-xs text-stone-300">
                        <div className="font-medium text-stone-200">{ord.cafe?.name}</div>
                        <div className="text-[11px] text-stone-400 mt-0.5">
                          {isPreOrder ? (
                            <span className="text-purple-300 font-medium">Slot: {ord.pickupSlot || "Arrive ASAP"}</span>
                          ) : (
                            <span className="text-stone-400">Pl: {formatDateTime(ord.createdAt)}</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Items */}
                      <TableCell className="text-xs text-stone-300 max-w-xs">
                        <div className="font-medium">
                          {ord.items?.map((it: any) => `${it.name} (${it.quantity})`).join(", ") || `${ord.itemCount} items`}
                        </div>
                      </TableCell>

                      {/* Points */}
                      <TableCell className="text-right font-extrabold text-xs text-amber-400">
                        {formatPoints(ord.totalPoints)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {getStatusBadge(ord.status)}
                      </TableCell>

                      {/* Quick Action Button */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {ord.status === "PENDING" && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(ord._id, "ACCEPTED")}
                              disabled={actionLoading}
                              className="h-7 px-2.5 text-[11px] font-bold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              <span>Accept</span>
                            </Button>
                          )}

                          {ord.status === "ACCEPTED" && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(ord._id, "PREPARING")}
                              disabled={actionLoading}
                              className="h-7 px-2.5 text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer"
                            >
                              <ChefHat className="h-3 w-3 mr-1" />
                              <span>Start Prep</span>
                            </Button>
                          )}

                          {ord.status === "PREPARING" && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(ord._id, "READY")}
                              disabled={actionLoading}
                              className="h-7 px-2.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                            >
                              <BellRing className="h-3 w-3 mr-1" />
                              <span>Mark Ready</span>
                            </Button>
                          )}

                          {ord.status === "READY" && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(ord._id, "COMPLETED")}
                              disabled={actionLoading}
                              className="h-7 px-2.5 text-[11px] font-bold bg-stone-100 hover:bg-white text-stone-950 cursor-pointer"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                              <span>Handover</span>
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedOrder(ord);
                              setDetailModalOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-stone-400 hover:text-white cursor-pointer"
                            title="View Full Order Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details & Refund Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-lg bg-stone-900 border-stone-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-base font-bold">
              <span>Order Details: {selectedOrder?.orderNumber}</span>
              {selectedOrder && getStatusBadge(selectedOrder.status)}
            </DialogTitle>
            <DialogDescription className="text-stone-400 text-xs">
              Placed at {selectedOrder?.cafe?.name} on {formatDateTime(selectedOrder?.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-2 text-xs">
              {/* Type and Customer */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-950 rounded-xl border border-stone-800">
                <div>
                  <div className="text-[10px] text-stone-500 uppercase font-bold">Customer</div>
                  <div className="font-semibold text-white mt-0.5">{selectedOrder.customer?.name}</div>
                  <div className="text-stone-400">{selectedOrder.customer?.mobile}</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-500 uppercase font-bold">Order Mode</div>
                  <div className="font-semibold text-amber-400 mt-0.5">
                    {selectedOrder.orderType === "PRE_ORDER" ? "🚗 Pre-Order (Self-Pickup)" : "☕ Dine-In"}
                  </div>
                  {selectedOrder.pickupSlot && (
                    <div className="text-stone-300">Expected: {selectedOrder.pickupSlot}</div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="font-bold text-stone-300 uppercase tracking-wider text-[10px]">
                  Items Ordered
                </div>
                <div className="divide-y divide-stone-800 max-h-48 overflow-y-auto pr-1">
                  {selectedOrder.items?.map((it: any) => (
                    <div key={it._id} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-white">{it.name}</span>
                        <span className="text-stone-400 ml-2">× {it.quantity}</span>
                      </div>
                      <span className="font-bold text-amber-400">{formatPoints(it.lineTotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-stone-800 flex justify-between items-center font-bold text-sm">
                  <span>Total Deducted Points:</span>
                  <span className="text-amber-400">{formatPoints(selectedOrder.totalPoints)}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-amber-300 text-xs">
                  <strong>Dietary / Kitchen Note:</strong> {selectedOrder.notes}
                </div>
              )}

              {/* Status Stepper / Audit */}
              {selectedOrder.statusHistory?.length > 0 && (
                <div className="space-y-1">
                  <div className="font-bold text-stone-400 uppercase tracking-wider text-[10px]">
                    Status Audit Trail
                  </div>
                  <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 space-y-1.5 text-[11px]">
                    {selectedOrder.statusHistory.map((h: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-stone-400">
                        <span>• Moved to <strong>{h.status}</strong>: {h.note || ""}</span>
                        <span>{formatDateTime(h.at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellation & Refund Trigger */}
              {["PENDING", "ACCEPTED", "PREPARING"].includes(selectedOrder.status) && (
                <div className="pt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setCancelReason("");
                      setCancelModalOpen(true);
                    }}
                    className="w-full text-xs font-semibold gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Cancel Order & Refund {formatPoints(selectedOrder.totalPoints)}</span>
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModalOpen(false)} className="text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel & Refund Confirmation Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md bg-stone-900 border-stone-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <span>Confirm Order Cancellation & Refund</span>
            </DialogTitle>
            <DialogDescription className="text-stone-400 text-xs">
              Cancelling order <strong>{selectedOrder?.orderNumber}</strong> will immediately credit{" "}
              <strong>{formatPoints(selectedOrder?.totalPoints || 0)}</strong> back to the customer's wallet ledger.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label className="text-[11px] font-bold text-stone-400 block mb-1">
              Cancellation Reason (Required for audit log)
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation / ingredient out of stock"
              className="w-full h-9 rounded-lg bg-stone-950 border border-stone-800 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} className="text-xs">
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefund}
              disabled={actionLoading}
              className="text-xs font-bold gap-1.5"
            >
              {actionLoading ? <Spinner size="sm" /> : <RotateCcw className="h-3.5 w-3.5" />}
              <span>Process Refund Now</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
