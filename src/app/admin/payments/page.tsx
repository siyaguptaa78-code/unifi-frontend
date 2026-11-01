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
import { CreditCard, RotateCcw, AlertTriangle } from "lucide-react";
import { formatINR, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [refundReason, setRefundReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadPayments = async () => {
    try {
      const res = await fetch("/api/payments");
      if (res.ok) {
        const json = await res.json();
        setPayments(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleRefund = async () => {
    if (!selectedPayment) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: selectedPayment._id,
          reason: refundReason || "Customer requested refund",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Refund failed");

      toast.success("Payment marked as REFUNDED and credited points safely reversed.");
      setRefundModalOpen(false);
      loadPayments();
    } catch (err: any) {
      toast.error(err.message || "Failed to process refund");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Payment Transactions & Refunds"
        description="All Razorpay and simulated DEMO payments. Process audited reversals and refunds."
        badge="Gateway Transactions"
      />

      <Card className="border-stone-800 bg-stone-900/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-mono text-xs font-semibold text-white">
                      {p.receipt}
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">
                      {formatDateTime(p.createdAt)}
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">
                      <div>{p.customer?.name}</div>
                      <div className="text-[10px] text-stone-500">{p.customer?.email}</div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">
                      <span className="inline-flex items-center gap-1">
                        {p.provider} {p.isDemo && <Badge variant="secondary" className="text-[9px]">DEMO</Badge>}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs text-white">
                      {formatINR(p.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === "SUCCESS"
                            ? "success"
                            : p.status === "FAILED"
                            ? "destructive"
                            : p.status === "REFUNDED"
                            ? "info"
                            : "warning"
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status === "SUCCESS" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedPayment(p);
                            setRefundReason("Customer requested cancellation");
                            setRefundModalOpen(true);
                          }}
                          className="h-7 text-[11px]"
                        >
                          Refund
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Refund Modal */}
      <Dialog open={refundModalOpen} onOpenChange={setRefundModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Refund Payment {selectedPayment?.receipt}?</span>
            </DialogTitle>
            <DialogDescription>
              Amount: ₹{selectedPayment?.amount}. The 5,000 points credited by this recharge will be debited from the customer.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Input
              label="Refund Justification"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g. Accidental double charge, client requested cancellation"
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setRefundModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefund}
              isLoading={submitting}
              className="font-bold"
            >
              Confirm Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}

