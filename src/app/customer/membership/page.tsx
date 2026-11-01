"use client";

import React, { useState, useEffect } from "react";
import { CustomerNavbar } from "@/components/layout/customer-navbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  Coins,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { formatPoints, formatMinutes, formatINR } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";

export default function CustomerMembershipPage() {
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [orderPayload, setOrderPayload] = useState<any>(null);

  const loadData = async () => {
    try {
      const res = await fetch("/api/customer/membership");
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
    loadData();
  }, []);

  const handleStartRecharge = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payments/create-order", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to create payment order");
      setOrderPayload(json.data);
      setPaymentModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate recharge");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePayment = async (outcome: "SUCCESS" | "FAILED") => {
    if (!orderPayload) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payments/demo-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: orderPayload.paymentId, outcome }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Payment processing failed");

      if (outcome === "SUCCESS") {
        toast.success("Payment Successful! ₹5,000 received. 5,000 points added & hours reset to 150h.");
        setPaymentModalOpen(false);
        await refreshUser();
        await loadData();
      } else {
        toast.error("Payment failed: Simulated bank decline.");
        setPaymentModalOpen(false);
        await loadData();
      }
    } catch (err: any) {
      toast.error(err.message || "Payment simulation error");
    } finally {
      setIsProcessing(false);
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

  const membership = data?.membership;
  const cfg = data?.config;
  const points = membership?.pointsBalance ?? 0;
  const minutes = membership?.remainingMinutes ?? 0;

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <CustomerNavbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Membership & Recharge</span>
              <Badge variant="default">Universal Access Pass</Badge>
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Recharge your membership to credit points and refresh your 150 workspace hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status overview */}
            <Card className="border-stone-800 bg-stone-900/60 p-6 md:col-span-1 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Your Current Status
              </span>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-400">Status</span>
                  <Badge variant={membership?.status === "ACTIVE" ? "success" : "secondary"}>
                    {membership?.status || "INACTIVE"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-400">Available Points</span>
                  <span className="font-bold text-amber-400">{formatPoints(points)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-400">Remaining Hours</span>
                  <span className="font-bold text-white">{formatMinutes(minutes)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-400">Lifetime Recharges</span>
                  <span className="font-semibold text-stone-300">{membership?.rechargeCount || 0}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-400 leading-relaxed">
                💡 <strong>Carry Forward Rule:</strong> When you recharge, all your existing points carry forward and your hours reset to a full 150 hours.
              </div>
            </Card>

            {/* Recharge Purchase Box */}
            <div className="md:col-span-2 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-stone-900 via-stone-900/90 to-amber-950/30 p-8 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
                      Standard Recharge Package
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-1">₹5,000 Access Recharge</h2>
                  </div>
                  <Badge variant="default" className="text-xs">1 Point = ₹1</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                  <div className="rounded-xl border border-stone-800 bg-stone-950/60 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                      <Coins className="h-4 w-4" />
                      <span>+5,000 Points Added</span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      Spendable on any espresso, cold brew, bakery or meal item across all 5 cafes.
                    </p>
                  </div>

                  <div className="rounded-xl border border-stone-800 bg-stone-950/60 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                      <Clock className="h-4 w-4" />
                      <span>150 Hours Refresh</span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      Your hours counter resets to 150 hours on every successful recharge.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-stone-300">
                  Total Payable: <strong className="text-lg font-bold text-white ml-1">₹5,000</strong>
                </div>
                <Button
                  size="lg"
                  onClick={handleStartRecharge}
                  isLoading={isProcessing}
                  className="w-full sm:w-auto font-semibold gap-2 shadow-lg shadow-amber-600/30"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Proceed to Payment</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Gateway Modal / Demo Simulator */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              <span>UniCafe Checkout</span>
            </DialogTitle>
            <DialogDescription>
              Amount to pay: <strong>₹5,000</strong> for 5,000 points & 150 hours.
            </DialogDescription>
          </DialogHeader>

          {orderPayload?.provider === "DEMO" ? (
            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>DEMO PAYMENT MODE ACTIVE</span>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Real Razorpay credentials are not yet configured in <code>.env.local</code>.
                  This sandbox simulated mode tests the exact backend ledger, hours reset and atomic transaction crediting without charging a credit card.
                </p>
              </div>

              <div className="text-xs text-stone-400 space-y-1 bg-stone-950 p-3 rounded-lg border border-stone-800">
                <div>Receipt: <span className="font-mono text-stone-200">{orderPayload.receipt}</span></div>
                <div>Customer: <span className="text-stone-200">{orderPayload.prefill?.name}</span></div>
                <div>Points to Credit: <span className="text-amber-400 font-bold">5,000 pts</span></div>
                <div>Hours to Set: <span className="text-white font-bold">150 Hours</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => handleSimulatePayment("SUCCESS")}
                  variant="success"
                  isLoading={isProcessing}
                  className="w-full font-semibold"
                >
                  Simulate Success
                </Button>
                <Button
                  onClick={() => handleSimulatePayment("FAILED")}
                  variant="destructive"
                  isLoading={isProcessing}
                  className="w-full"
                >
                  Simulate Failure
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-stone-300">
              Opening Razorpay Checkout Modal...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

