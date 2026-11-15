"use client";

import React, { useEffect, useState } from "react";
import { CustomerNavbar } from "@/components/layout/customer-navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ShoppingBag,
  MapPin,
  Clock,
  AlertCircle,
  X,
  RotateCcw,
  Car,
  Store,
  ChefHat,
  BellRing,
  CheckCircle2,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { formatPoints, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import Link from "next/link";

export default function CustomerOrdersPage() {
  const { refreshUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/customer/orders");
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
    loadOrders();
    const interval = setInterval(loadOrders, 12000); // Poll live status
    return () => clearInterval(interval);
  }, []);

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/customer/orders/${selectedOrder._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason || "Cancelled by customer" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to cancel order");

      toast.success(`Order cancelled. ${selectedOrder.totalPoints} points refunded to your wallet.`);
      setCancelModalOpen(false);
      setDetailModalOpen(false);
      await refreshUser();
      await loadOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-950/20">Pending Confirmation</Badge>;
      case "ACCEPTED":
        return <Badge variant="default" className="bg-sky-600/30 text-sky-300 border-sky-500/30">Order Accepted</Badge>;
      case "PREPARING":
        return <Badge variant="default" className="bg-amber-600/40 text-amber-300 border-amber-500/40 animate-pulse">Brewing / Cooking</Badge>;
      case "READY":
        return <Badge variant="success" className="bg-emerald-600/30 text-emerald-300 border-emerald-500/40 font-bold">Ready for Pickup!</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="text-stone-400 border-stone-800">Completed & Collected</Badge>;
      case "CANCELLED":
      case "REFUNDED":
        return <Badge variant="destructive">Cancelled & Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col">
        <CustomerNavbar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  const latestActiveOrder = orders.find((o) => ["PENDING", "ACCEPTED", "PREPARING", "READY"].includes(o.status));

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col pb-20">
      <CustomerNavbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <ShoppingBag className="h-7 w-7 text-amber-500" />
                <span>My Cafe Orders & Live Tracking</span>
              </h1>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">
                Track preparation status, pickup slots, and past transaction records.
              </p>
            </div>
            <a href="/customer/menu">
              <Button size="sm" className="font-bold gap-2 shadow-md shadow-amber-600/20">
                <ChefHat className="h-4 w-4" />
                <span>Order Food & Drinks</span>
              </Button>
            </a>
          </div>

          {/* Active Live Order Tracker Banner */}
          {latestActiveOrder && (
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-stone-900 via-amber-950/20 to-stone-900 p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-[10px] bg-amber-600 text-stone-950 font-bold">
                      LIVE ORDER IN PROGRESS
                    </Badge>
                    <span className="font-mono text-xs text-stone-400 font-semibold">
                      {latestActiveOrder.orderNumber}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {latestActiveOrder.orderType === "PRE_ORDER" ? "🚗 Pre-Order for Pickup" : "☕ Dine-In Table Order"}
                  </h2>
                  <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" />
                    <span>{latestActiveOrder.cafe?.name} ({latestActiveOrder.cafe?.address?.line1})</span>
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Status</div>
                  <div className="mt-1">{getStatusBadge(latestActiveOrder.status)}</div>
                  {latestActiveOrder.pickupSlot && (
                    <div className="text-xs font-semibold text-amber-400 mt-1">
                      Slot: {latestActiveOrder.pickupSlot}
                    </div>
                  )}
                </div>
              </div>

              {/* Visual 4-Step Pipeline */}
              <div className="mt-5 grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { step: "PENDING", label: "1. Placed" },
                  { step: "ACCEPTED", label: "2. Confirmed" },
                  { step: "PREPARING", label: "3. Brewing / Cooking" },
                  { step: "READY", label: "4. Ready for Handover" },
                ].map((s, idx) => {
                  const stepIndex = ["PENDING", "ACCEPTED", "PREPARING", "READY", "COMPLETED"].indexOf(latestActiveOrder.status);
                  const isDone = stepIndex >= idx;
                  const isCurrent = latestActiveOrder.status === s.step;
                  return (
                    <div key={s.step} className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                        isCurrent
                          ? "bg-amber-500 text-stone-950 ring-4 ring-amber-500/20 animate-bounce"
                          : isDone
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-800 text-stone-500 border border-stone-700"
                      }`}>
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                      </div>
                      <span className={`text-[11px] font-semibold ${isCurrent ? "text-amber-400" : isDone ? "text-white" : "text-stone-500"}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
                <div className="text-stone-400 text-center sm:text-left">
                  Items: <strong>{latestActiveOrder.items?.map((i: any) => `${i.name} (×${i.quantity})`).join(", ") || `${latestActiveOrder.itemCount} items`}</strong>
                </div>
                {latestActiveOrder.status === "PENDING" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedOrder(latestActiveOrder);
                      setCancelModalOpen(true);
                    }}
                    className="h-8 text-xs font-semibold"
                  >
                    Cancel & Refund Order
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Orders History Card */}
          <Card className="border-stone-800 bg-stone-900/60 overflow-hidden">
            <CardHeader className="border-b border-stone-800 py-4 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-white">All Orders</CardTitle>
              <Badge variant="outline" className="text-stone-400">{orders.length} total orders</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {orders.length === 0 ? (
                <EmptyState
                  title="No orders placed yet"
                  description="Browse our artisan coffee, snacks and gourmet bowls and order with your points wallet."
                  actionLabel="Browse Cafe Menu"
                  onAction={() => window.location.href = "/customer/menu"}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-stone-800 hover:bg-transparent">
                      <TableHead>Order #</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Cafe Branch</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((ord: any) => {
                      const canCancel = ord.status === "PENDING";
                      const isPre = ord.orderType === "PRE_ORDER";
                      return (
                        <TableRow key={ord._id} className="border-stone-800/60 hover:bg-stone-800/30">
                          <TableCell className="font-mono font-bold text-xs text-stone-200">
                            {ord.orderNumber}
                          </TableCell>
                          <TableCell>
                            {isPre ? (
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
                          </TableCell>
                          <TableCell className="text-xs text-stone-400">
                            {formatDateTime(ord.createdAt)}
                          </TableCell>
                          <TableCell className="text-xs text-stone-300">
                            <div className="font-medium text-white">{ord.cafe?.name}</div>
                            {ord.pickupSlot && isPre && (
                              <div className="text-[10px] text-purple-300 mt-0.5">Slot: {ord.pickupSlot}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-stone-300 max-w-xs truncate">
                            {ord.items?.map((it: any) => `${it.name} (${it.quantity})`).join(", ") || `${ord.itemCount} items`}
                          </TableCell>
                          <TableCell className="text-right font-extrabold text-xs text-amber-400">
                            {formatPoints(ord.totalPoints)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(ord.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {canCancel && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedOrder(ord);
                                    setCancelModalOpen(true);
                                  }}
                                  className="h-7 px-2.5 text-[11px] font-semibold"
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedOrder(ord);
                                  setDetailModalOpen(true);
                                }}
                                className="h-7 w-7 p-0 text-stone-400 hover:text-white"
                                title="View details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Link href={`/invoice/order/${ord._id}`}>
                                <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px]" title="View / download invoice">
                                  Invoice
                                </Button>
                              </Link>
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
        </div>
      </main>

      {/* Order Details Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-md bg-stone-900 border-stone-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-base font-bold">
              <span>Order #{selectedOrder?.orderNumber}</span>
              {selectedOrder && getStatusBadge(selectedOrder.status)}
            </DialogTitle>
            <DialogDescription className="text-stone-400 text-xs">
              {selectedOrder?.cafe?.name} • {formatDateTime(selectedOrder?.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Order Mode:</span>
                  <span className="text-amber-400">
                    {selectedOrder.orderType === "PRE_ORDER" ? "🚗 Pre-Order (Self-Pickup)" : "☕ In-Cafe Dine-In"}
                  </span>
                </div>
                {selectedOrder.pickupSlot && (
                  <div className="text-stone-400 flex items-center justify-between">
                    <span>Expected Slot:</span>
                    <span className="text-purple-300 font-semibold">{selectedOrder.pickupSlot}</span>
                  </div>
                )}
                <div className="text-[11px] text-stone-500 pt-1">
                  Collection Location: {selectedOrder.cafe?.address?.line1}, {selectedOrder.cafe?.address?.city}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Items</div>
                <div className="divide-y divide-stone-800">
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
                <div className="pt-2 border-t border-stone-800 flex justify-between font-bold text-sm">
                  <span>Total Paid Points:</span>
                  <span className="text-amber-400">{formatPoints(selectedOrder.totalPoints)}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-amber-300 text-xs">
                  <strong>Notes:</strong> {selectedOrder.notes}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedOrder && (
              <Link href={`/invoice/order/${selectedOrder._id}`}>
                <Button className="text-xs w-full">Download Invoice</Button>
              </Link>
            )}
            <Button variant="outline" onClick={() => setDetailModalOpen(false)} className="text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md bg-stone-900 border-stone-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>Cancel Order {selectedOrder?.orderNumber}?</span>
            </DialogTitle>
            <DialogDescription className="text-stone-400 text-xs">
              Pending orders can be cancelled immediately. All {formatPoints(selectedOrder?.totalPoints || 0)} will be credited back to your wallet.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Cancellation Reason (Optional)
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Changed my mind or selected wrong item"
              className="flex w-full rounded-lg border border-stone-800 bg-stone-950 px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} className="text-xs">
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="font-bold text-xs"
            >
              {isCancelling ? <Spinner size="sm" /> : <RotateCcw className="h-3.5 w-3.5 mr-1" />}
              <span>Confirm Cancellation & Refund</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
